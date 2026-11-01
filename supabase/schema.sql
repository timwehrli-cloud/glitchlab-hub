-- =====================================================================
--  Glitchlab-Hub · Datenbank für Supabase
--  Einmal komplett in Supabase → SQL Editor einfügen und «Run» drücken.
--
--  Tabellen
--    classes   Klassen einer Lehrperson (mit geheimem Klassencode)
--    students  Kinder: nur Vorname, Farbe und Bild-PIN
--    sessions  Anmeldungen der Kinder auf einem Gerät
--    progress  Sterne und Daten pro Kind, Modul und Aufgabe
--
--  Sicherheit
--    Lehrpersonen melden sich mit E-Mail an und sehen nur ihre Klassen.
--    Kinder haben kein Supabase-Konto. Sie kommen nur über die
--    Funktionen kid_* an Daten, und nur mit Klassencode + Bild-PIN.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tabellen ----------
create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  code        text not null unique check (code ~ '^[A-Z0-9-]{6,24}$'),
  created_at  timestamptz not null default now()
);
-- Einstellungen pro Klasse, z. B. welche Module offen, gesperrt oder als Kette freigeschaltet sind
alter table public.classes add column if not exists settings jsonb not null default '{}'::jsonb;
do $$ begin
  alter table public.classes add constraint classes_settings_size check (pg_column_size(settings) < 100000);
exception when duplicate_object then null; end $$;

create table if not exists public.students (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes on delete cascade,
  first_name    text not null check (char_length(first_name) between 1 and 30),
  color         text not null default '#8B5CFF' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  pin           text not null check (pin ~ '^[0-8]-[0-8]-[0-8]$'),
  fails         int  not null default 0,
  locked_until  timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists students_class_idx on public.students (class_id);
-- Jede Klasse hat genau ein festes Lehrpersonen-Konto (dort ist immer alles freigeschaltet)
alter table public.students add column if not exists is_teacher boolean not null default false;
create unique index if not exists students_one_teacher on public.students (class_id) where is_teacher;

create table if not exists public.sessions (
  token       uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students on delete cascade,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);
create index if not exists sessions_student_idx on public.sessions (student_id);

create table if not exists public.progress (
  student_id   uuid not null references public.students on delete cascade,
  module_id    text not null check (char_length(module_id) between 1 and 60),
  activity_id  text not null check (char_length(activity_id) between 1 and 60),
  stars        int  not null default 0 check (stars between 0 and 10000),
  data         jsonb not null default '{}'::jsonb,
  team         text[] not null default '{}',
  updated_at   timestamptz not null default now(),
  primary key (student_id, module_id, activity_id)
);
alter table public.progress drop constraint if exists progress_stars_check;
alter table public.progress add constraint progress_stars_check check (stars between 0 and 10000);

-- gLiTChs Extras pro Kind: Outfit, Zimmer, Emote (gilt in allen Fächern)
create table if not exists public.extras (
  student_id  uuid primary key references public.students on delete cascade,
  data        jsonb not null default '{}'::jsonb check (pg_column_size(data) < 20000),
  updated_at  timestamptz not null default now()
);
-- Gespeicherte Arbeit aus den Modulen (z. B. der Prompt einer Gruppe). Jedes Teammitglied bekommt eine Kopie.
create table if not exists public.work (
  student_id  uuid not null references public.students on delete cascade,
  module_id   text not null check (char_length(module_id) between 1 and 60),
  data        jsonb not null check (pg_column_size(data) < 2000000),
  updated_at  timestamptz not null default now(),
  primary key (student_id, module_id)
);

-- Eigene Module der Lehrperson (Modul-Editor). Kinder sehen veröffentlichte Module ihrer Lehrperson.
create table if not exists public.teacher_modules (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null default auth.uid() references auth.users on delete cascade,
  data        jsonb not null check (pg_column_size(data) < 3000000),
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Hochgeladene HTML-Module der Lehrperson (Datei + Steckbrief mit Extras)
create table if not exists public.teacher_uploads (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null default auth.uid() references auth.users on delete cascade,
  meta        jsonb not null check (pg_column_size(meta) < 500000),
  html        text not null check (length(html) < 9000000),
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Zugriffsregeln (Row Level Security) ----------
alter table public.classes  enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.progress enable row level security;
alter table public.teacher_modules enable row level security;
alter table public.teacher_uploads enable row level security;
drop policy if exists "LP: eigene Uploads" on public.teacher_uploads;
create policy "LP: eigene Uploads" on public.teacher_uploads
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "LP: eigene Module" on public.teacher_modules;
create policy "LP: eigene Module" on public.teacher_modules
  for all to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
alter table public.extras   enable row level security;
alter table public.work     enable row level security;

drop policy if exists "LP: Extras eigener Klassen" on public.extras;
create policy "LP: Extras eigener Klassen" on public.extras
  for all to authenticated
  using (exists (select 1 from public.students s join public.classes c on c.id = s.class_id
                 where s.id = student_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from public.students s join public.classes c on c.id = s.class_id
                 where s.id = student_id and c.teacher_id = auth.uid()));

drop policy if exists "LP: Arbeiten eigener Klassen" on public.work;
create policy "LP: Arbeiten eigener Klassen" on public.work
  for all to authenticated
  using (exists (select 1 from public.students s join public.classes c on c.id = s.class_id
                 where s.id = student_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from public.students s join public.classes c on c.id = s.class_id
                 where s.id = student_id and c.teacher_id = auth.uid()));

drop policy if exists "LP: eigene Klassen" on public.classes;
create policy "LP: eigene Klassen" on public.classes
  for all to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists "LP: Kinder eigener Klassen" on public.students;
create policy "LP: Kinder eigener Klassen" on public.students
  for all to authenticated
  using (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()));

drop policy if exists "LP: Fortschritt eigener Klassen" on public.progress;
create policy "LP: Fortschritt eigener Klassen" on public.progress
  for all to authenticated
  using (exists (select 1 from public.students s join public.classes c on c.id = s.class_id
                 where s.id = student_id and c.teacher_id = auth.uid()))
  with check (exists (select 1 from public.students s join public.classes c on c.id = s.class_id
                 where s.id = student_id and c.teacher_id = auth.uid()));
-- sessions: absichtlich keine Regel → nur über die Funktionen erreichbar.

-- ---------- Lehrpersonen-Konto pro Klasse (automatisch) ----------
create or replace function public._random_pin() returns text language sql volatile as $$
  select floor(random()*9)::int || '-' || floor(random()*9)::int || '-' || floor(random()*9)::int;
$$;
create or replace function public._class_teacher_account() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.students (class_id, first_name, color, pin, is_teacher)
  values (new.id, 'Lehrperson', '#FFC21A', public._random_pin(), true)
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists class_teacher_account on public.classes;
create trigger class_teacher_account after insert on public.classes
  for each row execute function public._class_teacher_account();
-- bestehende Klassen nachrüsten
insert into public.students (class_id, first_name, color, pin, is_teacher)
select c.id, 'Lehrperson', '#FFC21A', public._random_pin(), true from public.classes c
 where not exists (select 1 from public.students s where s.class_id = c.id and s.is_teacher);

-- ---------- Hilfsfunktion: Daten zusammenführen ----------
-- Normale Felder: neuer Wert gewinnt. «badges»: alle Abzeichen vereinigt. «fed», «deaths»: Maximum.
create or replace function public._merge_data(a jsonb, b jsonb)
returns jsonb language sql immutable as $$
  select coalesce(a, '{}'::jsonb) || coalesce(b, '{}'::jsonb)
    || case when jsonb_typeof(a->'badges') = 'array' or jsonb_typeof(b->'badges') = 'array' then
         jsonb_build_object('badges', (select coalesce(jsonb_agg(distinct x), '[]'::jsonb) from (
           select jsonb_array_elements(case when jsonb_typeof(a->'badges') = 'array' then a->'badges' else '[]'::jsonb end) x
           union select jsonb_array_elements(case when jsonb_typeof(b->'badges') = 'array' then b->'badges' else '[]'::jsonb end)) t))
       else '{}'::jsonb end
    || case when (a ? 'fed') or (b ? 'fed') then jsonb_build_object('fed', greatest(coalesce((a->>'fed')::numeric, 0), coalesce((b->>'fed')::numeric, 0))) else '{}'::jsonb end
    || case when (a ? 'deaths') or (b ? 'deaths') then jsonb_build_object('deaths', greatest(coalesce((a->>'deaths')::numeric, 0), coalesce((b->>'deaths')::numeric, 0))) else '{}'::jsonb end;
$$;

-- ---------- Hilfsfunktion: gültige Sitzung → Kind ----------
create or replace function public._kid_from_token(p_token uuid)
returns public.students
language plpgsql security definer set search_path = public as $$
declare s public.students;
begin
  select st.* into s
    from public.sessions se join public.students st on st.id = se.student_id
   where se.token = p_token and se.last_seen > now() - interval '180 days';
  if s.id is null then raise exception 'SITZUNG_UNGUELTIG'; end if;
  update public.sessions set last_seen = now() where token = p_token;
  return s;
end $$;

-- ---------- Kinder-Funktionen ----------
-- Klasse per Code finden: liefert nur Vornamen und Farben, keine PINs.
create or replace function public.kid_class(p_code text)
returns json language sql security definer set search_path = public stable as $$
  select json_build_object(
    'id', c.id, 'name', c.name, 'code', c.code,
    'students', coalesce((select json_agg(json_build_object('id', s.id, 'first_name', s.first_name, 'color', s.color, 'is_teacher', s.is_teacher,
                                                            'outfit', coalesce((select e.data->'outfit' from public.extras e where e.student_id = s.id), '{}'::jsonb))
                                          order by s.is_teacher desc, s.first_name)
                            from public.students s where s.class_id = c.id), '[]'::json))
  from public.classes c where c.code = upper(trim(p_code));
$$;

-- Anmelden mit Bild-PIN. Nach 5 Fehlversuchen 2 Minuten gesperrt.
create or replace function public.kid_login(p_code text, p_student uuid, p_pin text)
returns json language plpgsql security definer set search_path = public as $$
declare s public.students; t uuid;
begin
  select st.* into s from public.students st join public.classes c on c.id = st.class_id
   where st.id = p_student and c.code = upper(trim(p_code));
  if s.id is null then raise exception 'NICHT_GEFUNDEN'; end if;
  if s.locked_until is not null and s.locked_until > now() then return json_build_object('error', 'GESPERRT'); end if;
  if s.pin <> p_pin then
    update public.students
       set locked_until = case when fails + 1 >= 5 then now() + interval '2 minutes' else null end,
           fails = case when fails + 1 >= 5 then 0 else fails + 1 end
     where id = s.id;
    -- kein raise: sonst würde der Fehlversuch nicht gezählt (Rollback)
    return json_build_object('error', 'PIN_FALSCH');
  end if;
  update public.students set fails = 0, locked_until = null where id = s.id;
  delete from public.sessions where student_id = s.id and last_seen < now() - interval '180 days';
  insert into public.sessions (student_id) values (s.id) returning token into t;
  return json_build_object('token', t,
    'student', json_build_object('id', s.id, 'first_name', s.first_name, 'color', s.color, 'class_id', s.class_id, 'is_teacher', s.is_teacher));
end $$;

-- Eigene Daten und Fortschritt laden.
create or replace function public.kid_me(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s public.students;
begin
  s := public._kid_from_token(p_token);
  return json_build_object(
    'student', json_build_object('id', s.id, 'first_name', s.first_name, 'color', s.color, 'class_id', s.class_id, 'is_teacher', s.is_teacher),
    'class_name', (select name from public.classes where id = s.class_id),
    'class_settings', (select settings from public.classes where id = s.class_id),
    'extras', coalesce((select data from public.extras where student_id = s.id), '{}'::jsonb),
    'progress', coalesce((select json_agg(json_build_object('module_id', p.module_id, 'activity_id', p.activity_id,
                                  'stars', p.stars, 'data', p.data, 'team', p.team, 'updated_at', p.updated_at))
                            from public.progress p where p.student_id = s.id), '[]'::json));
end $$;

-- Sterne vergeben – an alle Kinder des Teams auf diesem Gerät.
-- Es zählt immer das beste Resultat (Sterne gehen nie verloren).
create or replace function public.kid_award(p_tokens uuid[], p_module text, p_activity text,
                                            p_stars int, p_data jsonb default '{}'::jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare tok uuid; s public.students; kids public.students[] := '{}'; cls uuid; names text[] := '{}'; out json[] := '{}'; st int;
begin
  if p_tokens is null or array_length(p_tokens, 1) is null or array_length(p_tokens, 1) > 6 then
    raise exception 'TEAM_UNGUELTIG'; end if;
  foreach tok in array p_tokens loop
    s := public._kid_from_token(tok);
    if cls is null then cls := s.class_id; elsif cls <> s.class_id then raise exception 'TEAM_UNGUELTIG'; end if;
    kids := kids || s; names := names || s.first_name;
  end loop;
  foreach s in array kids loop
    insert into public.progress as p (student_id, module_id, activity_id, stars, data, team)
    values (s.id, p_module, p_activity, greatest(0, least(10000, p_stars)), coalesce(p_data, '{}'::jsonb),
            array_remove(names, s.first_name))
    on conflict (student_id, module_id, activity_id) do update
      set stars = greatest(p.stars, excluded.stars),
          data = public._merge_data(p.data, excluded.data),
          team = (select array(select distinct unnest(p.team || excluded.team))),
          updated_at = now()
    returning p.stars into st;
    out := out || json_build_object('student_id', s.id, 'first_name', s.first_name, 'stars', st);
  end loop;
  return array_to_json(out);
end $$;

create or replace function public.kid_logout(p_token uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.sessions where token = p_token;
$$;

-- Extras speichern (nur für sich selbst).
create or replace function public.kid_extras_set(p_token uuid, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s public.students;
begin
  s := public._kid_from_token(p_token);
  insert into public.extras (student_id, data) values (s.id, coalesce(p_data, '{}'::jsonb))
  on conflict (student_id) do update set data = excluded.data, updated_at = now();
end $$;

-- Arbeit laden: der neueste Stand aller Teammitglieder.
create or replace function public.kid_work_get(p_tokens uuid[], p_module text)
returns json language plpgsql security definer set search_path = public as $$
declare tok uuid; s public.students; ids uuid[] := '{}'; r record;
begin
  foreach tok in array coalesce(p_tokens, '{}') loop s := public._kid_from_token(tok); ids := ids || s.id; end loop;
  select w.data, w.updated_at into r from public.work w
   where w.student_id = any(ids) and w.module_id = p_module order by w.updated_at desc limit 1;
  if r is null then return null; end if;
  return json_build_object('data', r.data, 'updated_at', r.updated_at);
end $$;

-- Arbeit speichern: Kopie für jedes Teammitglied.
create or replace function public.kid_work_put(p_tokens uuid[], p_module text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare tok uuid; s public.students; cls uuid;
begin
  if p_tokens is null or array_length(p_tokens, 1) is null or array_length(p_tokens, 1) > 6 then raise exception 'TEAM_UNGUELTIG'; end if;
  foreach tok in array p_tokens loop
    s := public._kid_from_token(tok);
    if cls is null then cls := s.class_id; elsif cls <> s.class_id then raise exception 'TEAM_UNGUELTIG'; end if;
    insert into public.work (student_id, module_id, data) values (s.id, p_module, p_data)
    on conflict (student_id, module_id) do update set data = excluded.data, updated_at = now();
  end loop;
end $$;

-- Veröffentlichte eigene Module der Lehrperson dieser Klasse.
create or replace function public.kid_modules(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s public.students;
begin
  s := public._kid_from_token(p_token);
  return coalesce((select json_agg(json_build_object('id', m.id, 'data', m.data) order by m.created_at)
    from public.teacher_modules m join public.classes c on c.teacher_id = m.teacher_id
    where c.id = s.class_id and m.published), '[]'::json);
end $$;

-- Hochgeladene Module: Liste (ohne Datei) und die Datei selbst
create or replace function public.kid_uploads(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s public.students;
begin
  s := public._kid_from_token(p_token);
  return coalesce((select json_agg(json_build_object('id', u.id, 'meta', u.meta) order by u.created_at)
    from public.teacher_uploads u join public.classes c on c.teacher_id = u.teacher_id
    where c.id = s.class_id and u.published), '[]'::json);
end $$;
create or replace function public.kid_upload_html(p_token uuid, p_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare s public.students; h text;
begin
  s := public._kid_from_token(p_token);
  select u.html into h from public.teacher_uploads u join public.classes c on c.teacher_id = u.teacher_id
    where c.id = s.class_id and u.id = p_id and u.published;
  if h is null then raise exception 'MODUL_FEHLT'; end if;
  return h;
end $$;

-- ---------- Rechte ----------
-- Tabellen: nur angemeldete Lehrpersonen (die Regeln oben zeigen ihnen nur ihre eigenen Klassen).
-- Kinder (anon) kommen nie direkt an Tabellen, nur über die kid_*-Funktionen.
grant select, insert, update, delete on public.classes, public.students, public.progress, public.extras, public.work,
  public.teacher_modules, public.teacher_uploads to authenticated;
revoke all on public.classes, public.students, public.sessions, public.progress, public.extras, public.work,
  public.teacher_modules, public.teacher_uploads from anon;
revoke all on function public._kid_from_token(uuid) from public, anon, authenticated;
grant execute on function public.kid_class(text)                         to anon, authenticated;
grant execute on function public.kid_login(text, uuid, text)             to anon, authenticated;
grant execute on function public.kid_me(uuid)                            to anon, authenticated;
grant execute on function public.kid_award(uuid[], text, text, int, jsonb) to anon, authenticated;
grant execute on function public.kid_logout(uuid)                        to anon, authenticated;
grant execute on function public.kid_extras_set(uuid, jsonb)            to anon, authenticated;
grant execute on function public.kid_work_get(uuid[], text)             to anon, authenticated;
grant execute on function public.kid_work_put(uuid[], text, jsonb)      to anon, authenticated;
grant execute on function public.kid_modules(uuid)                       to anon, authenticated;
grant execute on function public.kid_uploads(uuid)                       to anon, authenticated;
grant execute on function public.kid_upload_html(uuid, uuid)             to anon, authenticated;
