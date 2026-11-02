/* =====================================================================
   Glitchlab-Hub · App
   Ansichten: Klassencode → Name → Bild-PIN → Hub (Fächer) → Fach → Modul
              + Teampartner auf demselben Gerät + Lehrpersonen-Bereich
   ===================================================================== */
(async function () {
  const H = window.GLHub;
  const G = window.GLGlitch;
  const CFG = window.GL_CONFIG || {};
  const LP_NAME = CFG.TEACHER_NAME || "deine Lehrperson";
  const app = document.getElementById("app");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const gl = (mood, color, cls = "") => `<span class="glitch ${cls}">${G.svg(mood, color)}</span>`;
  const PICS = [["🍕", "Pizza"], ["🚀", "Rakete"], ["🐱", "Katze"], ["⚽", "Fussball"], ["🌈", "Regenbogen"], ["🎸", "Gitarre"], ["🍦", "Glace"], ["🐢", "Schildkröte"], ["⭐", "Stern"]];
  const pinPics = pin => String(pin).split("-").map(i => (PICS[+i] || ["?"])[0]).join("");
  const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

  /* ---------- Speicher auf dem Gerät ---------- */
  const store = {
    get(k, d, ss) { try { const v = (ss ? sessionStorage : localStorage).getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v, ss) { try { (ss ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); } catch (e) { /* ok */ } },
    del(k, ss) { try { (ss ? sessionStorage : localStorage).removeItem(k); } catch (e) { /* ok */ } }
  };

  /* ---------- Zustand ---------- */
  const S = {
    be: null,
    code: store.get("glhub.code", ""),
    cls: null,             // {id,name,code,students}
    token: store.get("glhub.token", ""),
    me: null,              // {student, class_name, progress}
    team: store.get("glhub.team", [], true), // [{token, student}]
    view: { name: "boot" },
    cleanup: null
  };
  const saveTeam = () => store.set("glhub.team", S.team, true);

  /* ---------- Toasts ---------- */
  const toastBox = document.createElement("div"); toastBox.className = "toasts"; toastBox.setAttribute("aria-live", "polite");
  document.body.appendChild(toastBox);
  function toast(text, kind = "", ms = 3200) {
    const t = document.createElement("div"); t.className = "toast " + kind; t.textContent = text;
    toastBox.appendChild(t); setTimeout(() => t.remove(), ms);
  }

  /* ---------- Sterne ---------- */
  const progOf = (modId, actId) => (S.me?.progress || []).find(p => p.module_id === modId && p.activity_id === actId) || null;
  /* Status, den die Lehrperson pro Kind setzt: "offen" | "arbeit" | "fertig" (fertig = alle Belohnungen des Moduls) */
  const LAB_FULL = 130;   // so viele Sterne zählt ein Lab-Modul, wenn die Lehrperson es abschliesst
  const STATUS = [["offen", "Offen"], ["arbeit", "In Bearbeitung"], ["fertig", "Abgeschlossen"]];
  const lpStatOf = (prog, kidId, m) => ((prog.find(p => (!kidId || p.student_id === kidId) && p.module_id === m.id && p.activity_id === "lp-status") || {}).data || {}).status || "";
  const lpStat = m => lpStatOf(S.me?.progress || [], null, m);
  const labBadges = m => m.kind === "lab" ? GD.BADGES.filter(b => (b.mod || "prompt") === m.lab).map(b => b.id) : [];
  const fullAct = (x, st) => x.maxStars == null ? Math.max(st, LAB_FULL) : x.maxStars;
  const actStars = (m, x) => { const st = progOf(m.id, x.id)?.stars || 0; if (lpStat(m) === "fertig") return fullAct(x, st); return x.maxStars == null ? st : Math.min(x.maxStars, st); };
  const modStars = m => m.activities.reduce((a, x) => a + actStars(m, x), 0);
  /* Nur für das Lehrpersonen-Konto (z. B. Jeopardy): für Kinder unsichtbar */
  const visMod = m => !m.lpOnly || isLP();
  const subjMods = id => H.modules.filter(m => m.subject === id && visMod(m));
  const subjStars = id => subjMods(id).reduce((a, m) => a + modStars(m), 0);
  const subjMax = id => subjMods(id).reduce((a, m) => a + H.maxStars(m), 0);
  const allStars = () => H.subjects.reduce((a, s) => a + subjStars(s.id), 0)
    + (S.me?.progress || []).filter(p => p.module_id === "test").reduce((a, p) => a + p.stars, 0);   // Test-Modus der Lehrperson
  const GD = window.GL_DATA || { LEVELS: [{ n: "Start", s: 0 }], BADGES: [], OUTFITS: [] };
  const levelOf = st => { let i = 0; GD.LEVELS.forEach((l, k) => { if (st >= l.s) i = k; }); return i; };
  const lpDoneMods = () => H.modules.filter(m => lpStat(m) === "fertig");
  const myBadges = () => new Set((S.me?.progress || []).flatMap(p => (p.data && Array.isArray(p.data.badges)) ? p.data.badges : []).concat(lpDoneMods().flatMap(labBadges)));
  const upBadges = mid => { const m = H.modules.find(x => x.id === mid), own = (S.me?.progress || []).filter(p => p.module_id === mid).flatMap(p => (p.data && Array.isArray(p.data.badges)) ? p.data.badges : []);
    return new Set(m && m.upload && lpStat(m) === "fertig" ? own.concat((m.meta.dips || []).map(d => d.id)) : own); };
  const myMax = k => Math.max(0, ...(S.me?.progress || []).map(p => +(p.data && p.data[k]) || 0));
  const outfitOf = () => (S.me?.extras && S.me.extras.outfit) || {};
  /* gLiTCh eines Kindes so, wie es ausgerüstet ist (eigenes Outfit live, andere aus der Klassenliste) */
  const outfitFor = id => (S.me && S.me.student.id === id) ? outfitOf() : ((S.cls && S.cls.students.find(x => x.id === id)) || {}).outfit || {};
  const kidG = (mood, k, cls = "") => `<span class="glitch kidg ${cls}" style="--kc:${k.color || "#8B5CFF"}">${G.svg(mood, "#8B5CFF", { outfit: outfitFor(k.id), calm: cls.includes("still") })}</span>`;
  /* Festes Lehrpersonen-Konto der Klasse: dort ist immer alles freigeschaltet */
  const isLP = () => !!(S.me && S.me.student && S.me.student.is_teacher);
  const lpName = k => k && k.is_teacher ? (CFG.TEACHER_NAME || "Lehrperson") : (k ? k.first_name : "");
  const nameFix = k => { if (k && k.is_teacher) k.first_name = CFG.TEACHER_NAME || "Lehrperson"; return k; };
  /* Freischaltung pro Klasse (Lehrpersonen-Bereich): offen, zu, kette (nach dem Modul davor) oder Standard */
  const modSet = m => ((S.me?.class_settings || {}).mods || {})[m.id] || "";
  const modPrev = m => { const list = H.modules.filter(x => x.theme === m.theme && !x.soon); const i = list.findIndex(x => x.id === m.id); return i > 0 ? list[i - 1] : null; };
  const modSolved = m => { const st = modStars(m), mx = H.maxStars(m); return H.openEnded(m) || !mx ? st > 0 : st >= Math.ceil(mx / 2); };
  const modOpen = m => {
    if (m.soon) return false; if (isLP()) return true; if (m.lpOnly) return false;
    if (lpStat(m) === "arbeit" || lpStat(m) === "fertig") return true;   // von der Lehrperson für dieses Kind gesetzt
    const set = modSet(m);
    if (set === "offen") return true; if (set === "zu") return false;
    if (set === "kette") { const p = modPrev(m); return !p || modSolved(p); }
    return !m.req || myBadges().has(m.req.badge);
  };
  const lockTxt = m => {
    if (m.soon) return "Kommt bald! " + (m.teaser || "");
    const set = modSet(m);
    if (set === "zu") return `Noch gesperrt. ${LP_NAME} schaltet das Modul frei.`;
    if (set === "kette") { const p = modPrev(m); return p ? `Zuerst «${p.title}» schaffen (mindestens die Hälfte der Sterne).` : ""; }
    return m.req ? m.req.txt : "";
  };
  const starRow = (n, max) => max > 8
    ? `<span class="stars" aria-label="${n} von ${max} Sternen">★ <b style="color:var(--ink)">${n}</b><span style="color:var(--muted);letter-spacing:0"> / ${max}</span></span>`
    : `<span class="stars" aria-label="${n} von ${max} Sternen">${"★".repeat(n)}<span>${"★".repeat(Math.max(0, max - n))}</span></span>`;

  /* ---------- Navigation ---------- */
  function go(view) {
    if (S.cleanup) { try { S.cleanup(); } catch (e) { /* egal */ } S.cleanup = null; }
    document.body.classList.remove("in-lab");
    S.view = view; render(); window.scrollTo(0, 0);
  }
  function render() {
    try { const r = renderView(); if (r && r.catch) r.catch(err => { console.error(err); toast("Fehler: " + (err && err.message || err), "err", 9000); }); return r; }
    catch (err) {
      console.error(err);
      toast("Ups, gLiTCh hat sich verhaspelt: " + (err && err.message ? err.message : err) + ". Schick Herrn Wehrli ein Foto davon.", "err", 9000);
    }
  }
  /* Fehler, die sonst still verschwinden, sichtbar machen (z. B. auf dem iPad) */
  window.addEventListener("error", e => { if (e && e.message && !/ResizeObserver|Script error/.test(e.message)) toast("Fehler: " + e.message, "err", 9000); });
  window.addEventListener("unhandledrejection", e => { const m = e && e.reason && (e.reason.message || String(e.reason)); if (m) toast("Fehler: " + m, "err", 9000); });
  function renderView() {
    const v = S.view.name;
    if (v === "code") return viewCode();
    if (v === "names") return viewNames();
    if (v === "home") return viewHome();
    if (v === "subject") return viewSubject(S.view.id);
    if (v === "theme") return viewTheme(S.view.id);
    if (v === "module") return viewModule(S.view.id);
    if (v === "room") return viewLab(null);
    if (v === "lp") return viewTeacher();
  }

  /* ---------- Kopfleiste ---------- */
  function topbar() {
    const st = S.me?.student;
    const team = S.team.map((t, i) => `<span class="chip">${kidG("happy", t.student, "still")}${esc(t.student.first_name)}<button type="button" data-unteam="${i}" aria-label="${esc(t.student.first_name)} aus dem Team nehmen">×</button></span>`).join("");
    return `<header class="top"><div class="wrap">
      <button type="button" class="brand" data-home aria-label="Zur Startseite">${gl("happy", "#8B5CFF")}<span><b>Glitchlab-Hub</b><small>${esc(S.me?.class_name || "")}</small></span></button>
      <div class="top-r">
        ${st ? `<span class="starcount" title="Deine Sterne"><i>★</i>${allStars()}</span>
        <div class="team"><span class="chip">${kidG("normal", st, "still")}${esc(st.first_name)}</span>${team}
        ${S.team.length < 3 ? `<button type="button" class="btn small" data-addteam>+ Teampartner</button>` : ""}</div>
        <button type="button" class="btn small" data-logout>Abmelden</button>` : ""}
      </div></div></header>`;
  }
  function bindTop() {
    $$("[data-home]").forEach(b => b.onclick = () => go({ name: S.me ? "home" : "names" }));
    $$("[data-logout]").forEach(b => b.onclick = logout);
    $$("[data-addteam]").forEach(b => b.onclick = addTeam);
    $$("[data-unteam]").forEach(b => b.onclick = () => {
      const t = S.team.splice(+b.dataset.unteam, 1)[0]; saveTeam(); S.be.logout(t.token);
      toast(`${t.student.first_name} ist nicht mehr im Team.`); render();
    });
  }
  const footer = () => `<footer class="foot wrap no-print">
    ${S.be.mode === "demo" ? `<span class="mode-pill">Demo · nur dieses Gerät</span> ` : ""}
    <button type="button" class="link" data-lp>Für Lehrpersonen</button></footer>`;
  const bindFoot = () => $$("[data-lp]").forEach(b => b.onclick = () => go({ name: "lp" }));

  /* =================================================================
     1) Klassencode
     ================================================================= */
  function viewCode() {
    app.innerHTML = `<main class="wrap gate"><form class="card" id="codeForm" autocomplete="off">
      <div class="gate-head">${gl("wink", "#8B5CFF")}<div><p class="eyebrow">Glitchlab-Hub</p><h1>Hoi! Ich bin gLiTCh.</h1><p>Gib den Klassencode ein. Du findest ihn auf deiner Login-Karte.</p></div></div>
      <label class="f" for="codeIn">Klassencode<input class="input code" id="codeIn" placeholder="z. B. PIXEL-4821" value="${esc(S.code)}" autocapitalize="characters" spellcheck="false"></label>
      <p class="err" id="codeErr" role="alert"></p>
      <button class="btn primary" type="submit">Weiter</button>
      ${S.be.mode === "demo" ? `<p class="demo-note">Zum Ausprobieren: Code <b>DEMO-6I</b>. Die Bild-Passwörter siehst du im Bereich «Für Lehrpersonen».</p>` : ""}
    </form></main>${footer()}`;
    bindFoot();
    $("#codeForm").onsubmit = async e => {
      e.preventDefault();
      const code = $("#codeIn").value.trim().toUpperCase(); if (!code) return;
      const btn = e.submitter || $("#codeForm button"); btn.disabled = true;
      try {
        S.cls = await S.be.classByCode(code); S.cls.students.forEach(nameFix); S.code = S.cls.code; store.set("glhub.code", S.code);
        go({ name: "names" });
      } catch (err) { $("#codeErr").textContent = err.message; btn.disabled = false; }
    };
  }

  /* =================================================================
     2) Namen antippen
     ================================================================= */
  async function viewNames() {
    if (!S.cls) {
      try { S.cls = await S.be.classByCode(S.code); S.cls.students.forEach(nameFix); } catch (e) { store.del("glhub.code"); S.code = ""; return go({ name: "code" }); }
    }
    app.innerHTML = `<main class="wrap gate"><section class="card wide">
      <div class="gate-head">${gl("happy", "#8B5CFF")}<div><p class="eyebrow">${esc(S.cls.name)}</p><h1>Wer bist du?</h1><p>Tipp auf deinen Namen.</p></div></div>
      ${S.cls.students.length ? `<div class="names">${S.cls.students.map(s => `<button type="button" class="name${s.is_teacher ? " lp" : ""}" data-kid="${s.id}" style="--kc:${s.color}">${kidG(s.is_teacher ? "cool" : "normal", s)}${esc(s.first_name)}${s.is_teacher ? `<small class="lp-tag">Lehrperson · alles frei</small>` : ""}</button>`).join("")}</div>`
        : `<p class="hint">In dieser Klasse gibt es noch keine Kinder. ${esc(LP_NAME)} muss sie zuerst eintragen.</p>`}
      <div class="row"><button type="button" class="link" data-other>Anderer Klassencode</button></div>
    </section></main>${footer()}`;
    bindFoot();
    $("[data-other]").onclick = () => { store.del("glhub.code"); S.code = ""; S.cls = null; go({ name: "code" }); };
    $$("[data-kid]").forEach(b => b.onclick = async () => {
      const kid = S.cls.students.find(s => s.id === b.dataset.kid);
      const res = await pinPad(kid, `Hoi ${kid.first_name}!`, "Tipp deine drei Bilder in der richtigen Reihenfolge.");
      if (!res) return;
      S.token = res.token; store.set("glhub.token", S.token);
      await loadMe(); go({ name: "home" });
      toast(`Willkommen, ${kid.first_name}!`);
    });
  }

  /* ---------- Bild-PIN ---------- */
  function pinPad(kid, title, sub) {
    return new Promise(resolve => {
      let pin = [];
      const ov = document.createElement("div"); ov.className = "overlay";
      ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="sheet-h">${kidG("wink", kid)}<div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div></div>
        <div class="slots">${[0, 1, 2].map(i => `<span class="slot" id="slot${i}"></span>`).join("")}</div>
        <p class="err" id="pinErr" role="alert"></p>
        <div class="pad">${PICS.map(([e, n], i) => `<button type="button" class="pic" data-pic="${i}" aria-label="${n}">${e}</button>`).join("")}</div>
        <div class="pad-row"><button type="button" class="btn" data-cancel>Abbrechen</button><button type="button" class="btn" data-del>⌫ Löschen</button></div>
      </div>`;
      document.body.appendChild(ov);
      const sheet = $(".sheet", ov);
      const paint = () => [0, 1, 2].forEach(i => { const s = $("#slot" + i, ov); s.textContent = pin[i] != null ? PICS[pin[i]][0] : ""; s.classList.toggle("full", pin[i] != null); });
      const close = v => { ov.remove(); document.removeEventListener("keydown", key); resolve(v); };
      const key = e => { if (e.key === "Escape") close(null); if (e.key === "Backspace") { pin.pop(); paint(); } if (/^[1-9]$/.test(e.key)) $(`[data-pic="${+e.key - 1}"]`, ov).click(); };
      document.addEventListener("keydown", key);
      $("[data-cancel]", ov).onclick = () => close(null);
      $("[data-del]", ov).onclick = () => { pin.pop(); paint(); };
      ov.addEventListener("click", e => { if (e.target === ov) close(null); });
      $$("[data-pic]", ov).forEach(b => b.onclick = async () => {
        if (pin.length >= 3) return;
        pin.push(+b.dataset.pic); paint();
        if (pin.length < 3) return;
        $$("button", ov).forEach(x => x.disabled = true);
        try {
          const res = await S.be.login(S.code, kid.id, pin.join("-"));
          close(res);
        } catch (err) {
          $("#pinErr", ov).textContent = err.message;
          sheet.classList.remove("shake"); void sheet.offsetWidth; sheet.classList.add("shake");
          pin = []; paint(); $$("button", ov).forEach(x => x.disabled = false);
        }
      });
      setTimeout(() => $(".pic", ov).focus(), 30);
    });
  }

  /* ---------- Teampartner ---------- */
  async function addTeam() {
    try { S.cls = await S.be.classByCode(S.code); S.cls.students.forEach(nameFix); } catch (e) { if (!S.cls) return toast(e.message, "err"); }
    const busy = new Set([S.me.student.id, ...S.team.map(t => t.student.id)]);
    const kids = S.cls.students.filter(s => !busy.has(s.id));
    const ov = document.createElement("div"); ov.className = "overlay";
    ov.innerHTML = `<div class="sheet wide" role="dialog" aria-modal="true" aria-label="Teampartner dazuholen">
      <div class="sheet-h">${gl("love", "#8B5CFF")}<div><h2>Wer arbeitet mit?</h2><p>Alle im Team bekommen die Sterne, auch wenn ihr nur dieses Gerät benutzt.</p></div></div>
      ${kids.length ? `<div class="names">${kids.map(s => `<button type="button" class="name${s.is_teacher ? " lp" : ""}" data-kid="${s.id}" style="--kc:${s.color}">${kidG(s.is_teacher ? "cool" : "normal", s)}${esc(s.first_name)}</button>`).join("")}</div>` : `<p class="hint">Alle Kinder der Klasse sind schon im Team.</p>`}
      <button type="button" class="btn" data-cancel>Schliessen</button></div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    $("[data-cancel]", ov).onclick = close;
    ov.addEventListener("click", e => { if (e.target === ov) close(); });
    $$("[data-kid]", ov).forEach(b => b.onclick = async () => {
      const kid = kids.find(s => s.id === b.dataset.kid);
      ov.hidden = true;
      const res = await pinPad(kid, `${kid.first_name}, bist du es?`, "Gib zur Bestätigung deine drei Bilder ein.");
      close();
      if (!res) return;
      S.team.push({ token: res.token, student: nameFix(res.student) }); saveTeam();
      toast(`${kid.first_name} ist jetzt im Team. Ihr sammelt zusammen Sterne!`, "star");
      render();
    });
  }

  /* ---------- Sitzung ---------- */
  async function loadMe() {
    S.me = await S.be.me(S.token); nameFix(S.me.student);
    try { H.registerCustom(await S.be.kidModules(S.token)); } catch (e) { /* ohne eigene Module weiter */ }
    try { H.registerUploads(await S.be.kidUploads(S.token)); } catch (e) { /* ohne hochgeladene Module weiter */ }
    if (!S.cls) { try { S.cls = await S.be.classByCode(S.code); S.cls.students.forEach(nameFix); } catch (e) { /* später */ } }
    // Teampartner prüfen
    const ok = [];
    for (const t of S.team) { try { await S.be.me(t.token); if (t.student.class_id === S.me.student.class_id && t.student.id !== S.me.student.id) ok.push(t); } catch (e) { /* abgelaufen */ } }
    S.team = ok; saveTeam();
  }
  async function logout() {
    for (const t of S.team) S.be.logout(t.token);
    S.be.logout(S.token);
    const n = S.me?.student?.first_name;
    S.team = []; saveTeam(); S.token = ""; S.me = null; store.del("glhub.token");
    go({ name: "names" }); if (n) toast(`Tschüss, ${n}!`);
  }

  /* =================================================================
     3) Hub-Startseite
     ================================================================= */
  function viewHome() {
    if (!S.me) return go({ name: "names" });
    const st = S.me.student;
    const names = [st, ...S.team.map(t => t.student)].map(k => esc(k.first_name));
    const hello = names.length > 1 ? `Hoi ${names.slice(0, -1).join(", ")} und ${names.slice(-1)}!` : `Hoi ${names[0]}!`;
    app.innerHTML = topbar() + `<main class="wrap">
      <section class="home-room" aria-label="gLiTChs Zimmer">
        <div class="stage" id="roomPh">
          <div class="stage-g"><span class="glitch">${G.svg("happy", "#8B5CFF", { outfit: outfitOf() })}</span><span class="floor"></span></div>
          <div class="bubble"><p class="eyebrow">${esc(S.me.class_name || "")}</p><h1>${hello}</h1><p>gLiTCh räumt kurz sein Zimmer auf …</p></div>
        </div>
        <iframe class="roomframe" id="roomFrame" title="gLiTChs Zimmer mit Garderobe" src="lab/index.html#home"></iframe>
      </section>
      <section aria-labelledby="fh">
        <div class="sec-h"><h2 id="fh">Fächer</h2><p>Du hast ${allStars()} Sterne gesammelt.</p></div>
        <div class="subjects" id="subjGrid" style="margin-top:12px">${H.subjects.map(s => {
          const mods = subjMods(s.id), got = subjStars(s.id), max = subjMax(s.id);
          return `<button type="button" class="subj${themesOf(s.id).length ? "" : " empty"}" style="--c:${s.color}" data-subj="${s.id}">
            <span class="subj-art">${(H.subjectArt && H.subjectArt[s.id]) || `<span class="ic"><svg viewBox="0 0 24 24">${s.icon}</svg></span>`}</span>
            <span><span class="short">${esc(s.short)}</span><h3>${esc(s.name)}</h3></span>
            <span class="meta">${themesOf(s.id).length ? `<span>${themesOf(s.id).length} ${themesOf(s.id).length === 1 ? "Thema" : "Themen"} · ${mods.length} ${mods.length === 1 ? "Modul" : "Module"} · ★ ${got}</span><span class="bar"><i style="width:${mods.length ? Math.min(100, Math.round(mods.filter(m => modStars(m) > 0).length / mods.length * 100)) : 0}%"></i></span>` : "<span>Bald gibt es hier Themen.</span>"}</span>
          </button>`;
        }).join("")}</div>
      </section></main>${footer()}`;
    bindTop(); bindFoot();
    $$("[data-subj]").forEach(b => b.onclick = () => go({ name: "subject", id: b.dataset.subj }));
    S.cleanup = () => { document.body.style.overflow = ""; };
  }

  /* =================================================================
     4) Fachseite
     ================================================================= */
  const art = (key, c, c2, cls = "") => `<span class="art-banner ${cls}" style="--mc:${c};--mc2:${c2}">${(H.themeArt && H.themeArt[key]) || ""}</span>`;
  const themesOf = id => H.themes.filter(t => t.subject === id && (!t.lpOnly || isLP()));
  const themeMods = id => H.modules.filter(m => m.theme === id && visMod(m));

  /* Grosser animierter Kopf-Banner: Szene über die ganze Breite, Pixel-Funken und ein gLiTCh, der durchläuft */
  function heroBanner(o) {
    const scene = o.scene || "";
    const sparks = Array.from({ length: 12 }, (_, k) => `<i style="--x:${(k * 37 + 7) % 100}%;--y:${(k * 53 + 11) % 90}%;--d:${(k * .41) % 3}s;--k:${["#FFE680", "#00E5FF", "#FF2BD6", "#FFFFFF"][k % 4]}"></i>`).join("");
    return `<header class="hero-banner" style="--mc:${o.c};--mc2:${o.c2}">
      <div class="hb-scene">${scene}</div><div class="hb-sparks" aria-hidden="true">${sparks}</div>
      <span class="hb-walker" aria-hidden="true"><span class="glitch">${G.svg("happy", "#8B5CFF", { outfit: outfitOf(), calm: true })}</span></span>
      <div class="hb-plate"><p class="eyebrow">${esc(o.eyebrow)}</p><h1>${esc(o.title)}</h1>${o.sub ? `<p>${esc(o.sub)}</p>` : ""}</div>
    </header>`;
  }

  function viewSubject(id) {
    const s = H.subjects.find(x => x.id === id); if (!s || !S.me) return go({ name: "home" });
    const themes = themesOf(id);
    app.innerHTML = topbar() + `<main class="wrap">
      <div class="crumbs"><button type="button" class="btn small" data-back>← Alle Fächer</button></div>
      ${heroBanner({ scene: (H.subjectArt || {})[id], c: s.color, c2: s.color, eyebrow: "Fach", title: s.name,
        sub: themes.length ? `Wähle ein Thema · ★ ${subjStars(id)} Sterne gesammelt` : "Noch keine Themen" })}
      ${themes.length ? `<div class="mods">${themes.map(t => {
        const mods = themeMods(t.id), got = mods.reduce((a, m) => a + modStars(m), 0);
        return `<button type="button" class="mod theme" style="--c:${t.c}" data-theme="${esc(t.id)}">
          ${art(t.art, t.c, t.c2, mods.length ? "" : "soon")}
          <h3>${esc(t.title)}</h3><p>${esc(t.teaser || "")}</p>
          <div class="row"><span>${mods.length ? `${mods.length} ${mods.length === 1 ? "Modul" : "Module"}` : `<span class="soon-pill">Bald</span>`}</span>${mods.length ? `<span class="stars">★ <b style="color:var(--ink)">${got}</b></span>` : ""}</div>
        </button>`;
      }).join("")}</div>`
        : `<div class="empty-box">${gl("sleep", "#8B5CFF")}<div><h2>Hier ist es noch ruhig.</h2><p>${esc(LP_NAME)} baut gerade die ersten Themen für ${esc(s.short)}. Schau bald wieder vorbei!</p></div></div>`}
    </main>${footer()}`;
    bindTop(); bindFoot();
    $("[data-back]").onclick = () => go({ name: "home" });
    $$("[data-theme]").forEach(b => b.onclick = () => go({ name: "theme", id: b.dataset.theme }));
  }

  /* ---------- Themenseite: Module eines Themas ---------- */
  function viewTheme(id) {
    const t = H.themes.find(x => x.id === id); if (!t || !S.me) return go({ name: "home" });
    const s = H.subjects.find(x => x.id === t.subject), mods = themeMods(id);
    app.innerHTML = topbar() + `<main class="wrap">
      <div class="crumbs"><button type="button" class="btn small" data-back>← ${esc(s.short)}</button></div>
      ${heroBanner({ scene: (H.themeArt || {})[t.art], c: t.c, c2: t.c2, eyebrow: s.name, title: t.title, sub: t.teaser || "" })}
      ${mods.length ? `<div class="mods">${mods.map(m => modCard(m, t)).join("")}</div>`
        : `<div class="empty-box">${gl("sleep", "#8B5CFF")}<div><h2>Bald geht's los!</h2><p>${esc(LP_NAME)} baut gerade die Module für «${esc(t.title)}». Schau bald wieder vorbei!</p></div></div>`}
    </main>${footer()}`;
    bindTop(); bindFoot();
    $("[data-back]").onclick = () => go({ name: "subject", id: t.subject });
    bindMods();
  }
  function bindMods() {
    $$("[data-mod]").forEach(b => b.onclick = () => {
      const m = H.modules.find(x => x.id === b.dataset.mod);
      if (!modOpen(m)) { toast(m.soon ? `✨ «${m.title}» kommt bald!` : "🔒 " + lockTxt(m)); return; }
      go({ name: "module", id: m.id });
    });
  }
  /* Modulkarte (Themenseite und Filter auf der Startseite) */
  function modCard(m, t, tag) {
    const got = modStars(m), max = H.maxStars(m), open = modOpen(m), lab = m.kind === "lab";
    const a = (H.modArt && H.modArt[m.id]) || { c: t.c, c2: t.c2, svg: (H.themeArt || {})[t.art] || "" };
    return `<button type="button" class="mod${open ? "" : " locked"}${lab ? " lab" : ""}" style="--c:${a.c}" data-mod="${esc(m.id)}" ${open ? "" : 'aria-disabled="true"'}>
      <span class="art-banner${open ? "" : " soon"}" style="--mc:${a.c};--mc2:${a.c2}">${a.svg}${open ? "" : `<span class="lock-pill">${m.soon ? "✨ Bald" : "🔒 Gesperrt"}</span>`}</span>
      ${tag ? `<span class="mod-where">${esc(tag)}</span>` : ""}${lab ? `<span class="mod-tag">gLiTCh-Lab · Teamarbeit</span>` : ""}${lpStat(m) === "fertig" ? `<span class="mod-stat done">✓ Abgeschlossen</span>` : lpStat(m) === "arbeit" ? `<span class="mod-stat">In Bearbeitung</span>` : ""}
      <h3>${esc(m.title)}</h3><p>${esc(open || m.soon ? (m.teaser || "") : lockTxt(m))}</p>
      ${lab || m.custom || m.kind === "frame" ? "" : `<div class="acts">${m.activities.map(x => { const p = progOf(m.id, x.id); return `<span class="act${p && p.stars > 0 ? " done" : ""}">${esc(x.title)}</span>`; }).join("")}</div>`}
      <div class="row"><span>${m.minutes ? `ca. ${m.minutes} Min.` : ""}</span>${H.openEnded(m) ? `<span class="stars">★ <b style="color:var(--ink)">${got}</b></span>` : starRow(got, max)}</div>
      ${H.openEnded(m) ? "" : `<span class="bar" style="--c:${a.c}"><i style="width:${max ? Math.round(got / max * 100) : 0}%"></i></span>`}
    </button>`;
  }

  /* =================================================================
     5) Modul
     ================================================================= */
  function viewModule(id) {
    const m = H.modules.find(x => x.id === id); if (!m || !S.me) return go({ name: "home" });
    if (m.kind === "lab" || m.kind === "frame" || m.kind === "upload") return viewLab(m);
    const s = H.subjects.find(x => x.id === m.subject);
    app.innerHTML = topbar() + `<main class="wrap">
      <div class="mod-head"><button type="button" class="btn small" data-back>← ${esc((H.themes.find(t => t.id === m.theme) || {}).title || s.short)}</button><h1>${esc(m.title)}</h1>
        <div class="buddy"><span class="glitch">${G.svg("normal", "#8B5CFF", { outfit: outfitOf() })}</span><p id="buddySay" aria-live="polite">Los geht's!</p></div></div>
      <section class="mod-body" id="modBody"></section></main>${footer()}`;
    bindTop(); bindFoot();
    $("[data-back]").onclick = () => go({ name: "theme", id: m.theme });
    const say = (text, mood = "normal") => {
      const b = $("#buddySay"), g = $(".buddy .glitch"); if (!b) return;
      b.textContent = text; g.innerHTML = G.svg(mood, "#8B5CFF");
      g.classList.remove("hop"); void g.offsetWidth; g.classList.add("hop");
    };
    const api = {
      student: { ...S.me.student },
      team: S.team.map(t => ({ ...t.student })),
      progress: actId => { const p = progOf(m.id, actId); return p ? { stars: p.stars, data: p.data } : null; },
      say,
      back: () => go({ name: "theme", id: m.theme }),
      async award(actId, stars, data) {
        const act = m.activities.find(a => a.id === actId);
        if (!act) { console.warn("Unbekannte Aufgabe", actId); return null; }
        stars = Math.max(0, act.maxStars == null ? Math.min(10000, stars | 0) : Math.min(act.maxStars, stars | 0));
        const before = progOf(m.id, actId)?.stars || 0;
        try {
          const res = await S.be.award([S.token, ...S.team.map(t => t.token)], m.id, actId, stars, data || {});
          const mine = res.find(r => r.student_id === S.me.student.id);
          const p = progOf(m.id, actId);
          if (p) { p.stars = mine.stars; p.data = Object.assign({}, p.data, data); }
          else S.me.progress.push({ module_id: m.id, activity_id: actId, stars: mine.stars, data: data || {}, team: [] });
          const who = res.map(r => r.first_name);
          const whoTxt = who.length > 1 ? who.slice(0, -1).join(", ") + " und " + who.slice(-1) : "dich";
          if (stars > before) toast(`★ ${stars} bei «${act.title}» für ${whoTxt}!`, "star");
          else if (stars > 0) toast(`Gespeichert. Dein bestes Resultat (★ ${mine.stars}) bleibt.`);
          const sc = $(".starcount"); if (sc) sc.innerHTML = `<i>★</i>${allStars()}`;
          return res;
        } catch (err) {
          toast(err.message, "err", 5000);
          if (err.code === "SITZUNG_UNGUELTIG") { await loadMe().catch(() => logout()); }
          return null;
        }
      }
    };
    try { S.cleanup = m.mount($("#modBody"), api) || null; }
    catch (e) { console.error(e); $("#modBody").innerHTML = `<p class="err">Dieses Modul hat einen Fehler. Sag es ${esc(LP_NAME)}.</p>`; }
  }

  /* =================================================================
     5b) gLiTCh-Lab: Module und gLiTChs Zimmer (lab/index.html)
     Die Lab-Seite läuft in einem Rahmen und spricht über window.GLHubBridge
     mit dem Hub: wer arbeitet, Sterne, Diplome, Outfit und gespeicherte Arbeit.
     ================================================================= */
  const tokensAll = () => [S.token, ...S.team.map(t => t.token)];
  const teamSig = () => [S.me.student.id, ...S.team.map(t => t.student.id)].sort().join("_");
  const workKey = lab => `glhub.w.${teamSig()}.${lab}`;
  const initials = () => [S.me.student, ...S.team.map(t => t.student)].map(k => k.first_name.charAt(0).toUpperCase()).join("+");

  /* Gespeicherte Arbeit vom Server holen, bevor das Modul startet */
  async function workPrepare(lab) {
    const key = workKey(lab);
    let localAt = 0; try { localAt = +localStorage.getItem(key + ".at") || 0; } catch (e) { /* ok */ }
    try {
      const w = await S.be.workGet(tokensAll(), lab);
      if (w && w.data && typeof w.data.v === "string" && (+w.data.at || 0) > localAt) {
        localStorage.setItem(key, w.data.v); localStorage.setItem(key + ".at", String(w.data.at));
      }
    } catch (e) { toast("Die gespeicherte Arbeit konnte nicht geladen werden. Ihr arbeitet mit dem Stand auf diesem Gerät weiter.", "err", 5000); }
    let last = null; try { last = localStorage.getItem(key); } catch (e) { /* ok */ }
    let busy = false;
    const push = async () => {
      let v = null; try { v = localStorage.getItem(key); } catch (e) { return; }
      if (v == null || v === last || busy) return;
      busy = true; const at = Date.now();
      try { await S.be.workPut(tokensAll(), lab, { at, v }); last = v; localStorage.setItem(key + ".at", String(at)); }
      catch (e) { /* nächster Versuch beim nächsten Takt */ }
      busy = false;
    };
    const timer = setInterval(push, 4000);
    const onHide = () => push();
    window.addEventListener("pagehide", onHide);
    return () => { clearInterval(timer); window.removeEventListener("pagehide", onHide); push(); };
  }

  /* Sterne und Diplome aus dem Lab sammeln und gebündelt speichern */
  const labPending = {};
  let labT = null;
  function labReport(lab, r) {
    labPending[lab] = r; clearTimeout(labT); labT = setTimeout(labFlush, 1200);
  }
  async function labFlush() {
    for (const lab of Object.keys(labPending)) {
      const r = labPending[lab]; delete labPending[lab];
      const mid = "lab-" + lab, p = progOf(mid, "lab"), d = (p && p.data) || {};
      const newBadge = (r.badges || []).some(b => !(d.badges || []).includes(b));
      if (!p ? !(r.stars || r.badges.length || r.fed || r.deaths) : !(r.stars > p.stars || newBadge || r.fed > (d.fed || 0) || r.deaths > (d.deaths || 0))) continue;
      try {
        const res = await S.be.award(tokensAll(), mid, "lab", r.stars, { badges: r.badges, fed: r.fed, deaths: r.deaths });
        const mine = res.find(x => x.student_id === S.me.student.id);
        const merged = { badges: [...new Set([...(d.badges || []), ...(r.badges || [])])], fed: Math.max(d.fed || 0, r.fed), deaths: Math.max(d.deaths || 0, r.deaths) };
        if (p) { p.stars = mine.stars; p.data = Object.assign({}, d, merged); }
        else S.me.progress.push({ module_id: mid, activity_id: "lab", stars: mine.stars, data: merged, team: [] });
        if (newBadge && S.team.length) toast(`Neues Diplom für ${res.map(x => x.first_name).join(" und ")}!`, "star");
        const sc = $(".labbar .starcount"); if (sc) sc.innerHTML = `<i>★</i>${allStars()}`;
      } catch (err) { toast(err.message, "err", 5000); }
    }
  }
  let extT = null;
  function saveExtras(x) {
    S.me.extras = Object.assign({}, S.me.extras || {}, x);
    clearTimeout(extT); extT = setTimeout(() => S.be.saveExtras(S.token, S.me.extras).catch(() => {}), 800);
  }
  let ovTimer = null;
  window.GLHubBridge = {
    context(lab) {
      const k = s => ({ id: s.id, n: s.first_name, c: s.color });
      const mods = {}; let labSum = 0;
      H.modules.filter(m => m.kind === "lab").forEach(m => {
        const l = m.lab, p = progOf(m.id, "lab"), done = lpStat(m) === "fertig"; if (!p && !done) return;
        const d = (p && p.data) || {}, stars = done ? fullAct({ maxStars: null }, p ? p.stars : 0) : p.stars;
        mods[l] = { stars, badges: [...new Set([...(d.badges || []), ...(done ? labBadges(m) : [])])], fed: d.fed || 0, deaths: d.deaths || 0 };
        labSum += stars;
      });
      /* Hub-Module (ohne Lab) zählen als «geschafft», sobald es Sterne gab: z. B. für Emotes */
      const hubDone = H.modules.filter(m => m.kind !== "lab" && modStars(m) > 0).map(m => "hub:" + m.id);
      mods.hub = { stars: Math.max(0, allStars() - labSum), badges: [...myBadges(), ...hubDone], fed: myMax("fed"), deaths: myMax("deaths") };
      /* Extras aus hochgeladenen Modulen: freigeschaltete kommen als «up:…»-Merker dazu */
      const up = H.uploadExtras(m => modStars(m), m => upBadges(m.id), isLP());
      mods.hub.badges = [...new Set([...mods.hub.badges, ...up.earned])];
      if (isLP()) {   // Lehrpersonen-Konto: höchstes Level, alle Diplome, alles freigeschaltet
        mods.hub.stars = GD.LEVELS[GD.LEVELS.length - 1].s + 1;
        mods.hub.badges = [...new Set([...mods.hub.badges, ...GD.BADGES.map(b => b.id), ...H.modules.map(m => "hub:" + m.id)])];
        mods.hub.fed = 99; mods.hub.deaths = 9;
      }
      return {
        me: k(S.me.student), team: S.team.map(t => k(t.student)), className: S.me.class_name || "",
        code: String(CFG.TEACHER_PIN || "4313"), teacher: CFG.TEACHER_NAME_DATIV || "Herrn Wehrli", quiz: [],
        group: initials(), mods, extras: S.me.extras || {}, workKey, custom: up.custom
      };
    },
    saveExtras,
    report: labReport,
    /* Sterne aus eingebetteten Spielen (z. B. Wüsten-Game): nur speichern, wenn besser */
    score(moduleId, actId, stars) {
      const m = H.modules.find(x => x.id === moduleId), act = m && m.activities.find(a => a.id === actId);
      if (!act) return;
      stars = Math.max(0, Math.min(act.maxStars == null ? 10000 : act.maxStars, stars | 0));
      if (!S.me || S.view.name === "lp") { toast(`Vorschau: ★ ${stars} bei «${act.title}»`, "star"); return; }
      const p = progOf(moduleId, actId); if (p && p.stars >= stars) return;
      S.be.award(tokensAll(), moduleId, actId, stars, {}).then(res => {
        const mine = res.find(x => x.student_id === S.me.student.id);
        const q = progOf(moduleId, actId);
        if (q) q.stars = mine.stars; else S.me.progress.push({ module_id: moduleId, activity_id: actId, stars: mine.stars, data: {}, team: [] });
        toast(`★ ${stars} bei «${act.title}» für ${res.map(x => x.first_name).join(" und ")}!`, "star");
        const sc = $(".labbar .starcount"); if (sc) sc.innerHTML = `<i>★</i>${allStars()}`;
      }).catch(err => toast(err.message, "err", 5000));
    },
    /* Hochgeladene Module: Spezial-Aufgabe (Badge) und «Fertig» */
    upBadge(moduleId, name) {
      const m = H.modules.find(x => x.id === moduleId); if (!m) return;
      name = String(name).slice(0, 60);
      if (!S.me || S.view.name === "lp") { toast(`Vorschau: Spezial-Aufgabe «${name}» geschafft.`, "star"); return; }
      if (upBadges(moduleId).has(name)) return;
      S.be.award(tokensAll(), moduleId, "badges", 0, { badges: [name] }).then(() => {
        const q = progOf(moduleId, "badges");
        if (q) q.data = Object.assign({}, q.data, { badges: [...new Set([...((q.data || {}).badges || []), name])] });
        else S.me.progress.push({ module_id: moduleId, activity_id: "badges", stars: 0, data: { badges: [name] }, team: [] });
        const newly = H.uploadExtras(x => modStars(x), x => upBadges(x.id), false);
        toast(`Spezial-Aufgabe geschafft!${newly.earned.length ? " Schaut in gLiTChs Zimmer nach Neuem." : ""}`, "star");
      }).catch(err => toast(err.message, "err", 5000));
    },
    glitchSvg(mood) { return G.svg(mood || "happy", "#8B5CFF", { outfit: outfitOf(), calm: true }); },
    checkCode(c) { return String(c) === String(CFG.TEACHER_PIN || "4313"); },
    upDone(moduleId) { window.GLHubBridge.score(moduleId, "fertig", 1); },
    exit() { labFlush(); const v = S.view, m = v.name === "module" && H.modules.find(x => x.id === v.id); go(m ? { name: "theme", id: m.theme } : { name: "home" }); },
    lib() { /* Daten liegen schon in js/glitch-data.js */ },
    resize(h) {
      const f = document.getElementById("roomFrame"); if (!f || !h) return;
      f.style.height = h + "px"; f.classList.add("ready");
      const ph = document.getElementById("roomPh"); if (ph) ph.remove();
    },
    overlay(on) {
      const f = document.getElementById("roomFrame"); if (!f) return;
      f.classList.toggle("full", on); document.body.style.overflow = on ? "hidden" : "";
      /* Sicherheitsnetz: Ist im Zimmer kein Fenster mehr offen, gibt der Hub die Seite wieder frei (sonst wären die Fächer blockiert) */
      clearInterval(ovTimer);
      if (on) ovTimer = setInterval(() => {
        const fr = document.getElementById("roomFrame"); if (!fr || !fr.classList.contains("full")) return clearInterval(ovTimer);
        try { const d = fr.contentDocument, w = fr.contentWindow;
          const open = [...d.querySelectorAll("body > .wd-ov, body > .pt-ov")].some(el => !el.hidden && w.getComputedStyle(el).display !== "none");
          if (!open) { fr.classList.remove("full"); document.body.style.overflow = ""; clearInterval(ovTimer); }
        } catch (e) { /* anderer Ursprung: nichts tun */ }
      }, 2000);
    }
  };

  async function viewLab(m) {
    if (!S.me) return go({ name: "names" });
    const lab = m ? (m.work || m.lab) : "lobby";
    const names = [S.me.student, ...S.team.map(t => t.student)];
    document.body.classList.add("in-lab");
    app.innerHTML = `<div class="labshell">
      <div class="labbar"><button type="button" class="btn small" data-labback>← ${m ? esc((H.themes.find(t => t.id === m.theme) || {}).title || "Zurück") : "Hub"}</button>
        <b class="labtitle">${esc(m ? m.title : "gLiTChs Zimmer")}</b>
        <span class="labwho">${names.map(k => `<span class="chip">${kidG("normal", k, "still")}${esc(k.first_name)}</span>`).join("")}</span>
        ${m && (m.upload || m.doneBtn) ? `<button type="button" class="btn small primary" data-updone title="Gibt 1 Stern">✓ Fertig</button>` : ""}
        <span class="starcount" title="Deine Sterne"><i>★</i>${allStars()}</span></div>
      <div class="labload" id="labLoad">${gl("happy", "#8B5CFF")}<p>gLiTCh holt eure Sachen …</p></div>
    </div>`;
    $("[data-labback]").onclick = () => window.GLHubBridge.exit();
    const ud = $("[data-updone]"); if (ud) ud.onclick = () => { window.GLHubBridge.upDone(m.id); ud.disabled = true; ud.textContent = "✓ Gemeldet"; };
    let stop = null, upHtml = null;
    if (m && m.upload) {
      try { upHtml = await S.be.kidUploadHtml(S.token, m.uploadId); }
      catch (err) { const l = $("#labLoad"); if (l) l.innerHTML = `${gl("sad", "#8B5CFF")}<p>${esc(err.message)}</p>`; return; }
    }
    if (m) stop = await workPrepare(lab);
    if (S.view.name !== (m ? "module" : "room")) { if (stop) stop(); return; }
    const fr = document.createElement("iframe");
    fr.className = "labframe"; fr.title = m ? m.title : "gLiTChs Zimmer";
    if (upHtml != null) fr.srcdoc = H.uploadDoc(upHtml, m, workKey(lab), S.me.student.first_name, S.team.map(t => t.student.first_name));
    else fr.src = m && m.src ? m.src : "lab/index.html#" + lab;
    if (m && m.frameBg) fr.style.background = m.frameBg;
    fr.onload = () => { const l = $("#labLoad"); if (l) l.remove(); };
    $(".labshell").appendChild(fr);
    /* gLiTCh sitzt in der Ecke, so wie er angezogen ist (nicht bei Lab-Modulen, die ihn schon zeigen, und nicht bei Spielen mit eigenem Maskottchen) */
    const ownGlitch = m && (m.kind === "lab" || m.noBuddy || (m.upload && m.meta && m.meta.maskottchen));
    if (m && !ownGlitch) {
      const LINES = ["Du schaffst das!", "Ich bin da, falls ihr Hilfe braucht.", "Wenn ihr fertig seid: oben auf «✓ Fertig» tippen!", "Pixel-Power! Weiter so!", "Kleine Pause? Kurz strecken, dann weiter!"];
      const cb = document.createElement("div"); cb.className = "corner-g";
      cb.innerHTML = `<p class="corner-say" hidden></p><button type="button" class="corner-btn" aria-label="gLiTCh"><span class="glitch">${G.svg("happy", "#8B5CFF", { outfit: outfitOf() })}</span></button>`;
      $(".labshell").appendChild(cb);
      let n = 0, tm = null;
      $(".corner-btn", cb).onclick = () => { const p = $(".corner-say", cb); p.textContent = LINES[n++ % LINES.length]; p.hidden = false; clearTimeout(tm); tm = setTimeout(() => { p.hidden = true; }, 4000); };
    }
    S.cleanup = () => { labFlush(); if (stop) stop(); };
  }

  /* =================================================================
     6) Lehrpersonen-Bereich
     ================================================================= */
  const LP = { classes: [], cur: null, kids: [], prog: [], cards: false, confirm: null, mods: [], ups: [], edit: null };
  async function viewTeacher() {
    const who = await S.be.teacher();
    const head = `<header class="top"><div class="wrap">
      <button type="button" class="brand" data-exit>${gl("cool", "#8B5CFF")}<span><b>Glitchlab-Hub</b><small>Lehrpersonen</small></span></button>
      <div class="top-r">${who ? `<span class="hint">${esc(who.email)}</span><button type="button" class="btn small" data-signout>Abmelden</button>` : ""}
      <button type="button" class="btn small" data-exit>Zur Kinder-Ansicht</button></div></div></header>`;
    if (!who) {
      app.innerHTML = head + `<main class="wrap gate"><form class="card" id="lpForm">
        <div class="gate-head">${gl("cool", "#8B5CFF")}<div><span class="lp-badge">Lehrperson</span><h1 style="margin-top:6px">Anmelden</h1><p>Hier verwaltest du Klassen, Kinder und Bild-Passwörter.</p></div></div>
        ${S.be.mode === "demo" ? `<p class="demo-note">Demo-Modus: Tipp einfach auf «Anmelden». Alles bleibt auf diesem Gerät.</p>` : ""}
        <label class="f" for="lpMail">E-Mail<input class="input" id="lpMail" type="email" autocomplete="username" ${S.be.mode === "demo" ? "" : "required"}></label>
        <label class="f" for="lpPw">Passwort<input class="input" id="lpPw" type="password" autocomplete="current-password" minlength="${S.be.mode === "demo" ? 0 : 8}" ${S.be.mode === "demo" ? "" : "required"}></label>
        <p class="err" id="lpErr" role="alert"></p>
        <div class="row"><button class="btn primary" type="submit">Anmelden</button>${S.be.mode === "demo" ? "" : `<button class="btn" type="button" data-signup>Konto erstellen</button>`}</div>
      </form></main>`;
      bindLpTop();
      $("#lpForm").onsubmit = async e => {
        e.preventDefault();
        try { await S.be.teacherSignIn($("#lpMail").value.trim(), $("#lpPw").value); LP.cur = null; render(); }
        catch (err) { $("#lpErr").textContent = err.message; }
      };
      const su = $("[data-signup]");
      if (su) su.onclick = async () => {
        const f = $("#lpForm"); if (!f.reportValidity()) return;
        try {
          const r = await S.be.teacherSignUp($("#lpMail").value.trim(), $("#lpPw").value);
          if (r === "bestaetigen") $("#lpErr").textContent = "Fast fertig: Bestätige den Link in deiner E-Mail und melde dich dann an.";
          else render();
        } catch (err) { $("#lpErr").textContent = err.message; }
      };
      return;
    }
    LP.classes = await S.be.listClasses();
    try { LP.mods = await S.be.listMyModules(); H.registerCustom(LP.mods.filter(m => m.published)); } catch (e) { LP.mods = []; }
    try { LP.ups = await S.be.listUploads(); H.registerUploads(LP.ups); } catch (e) { LP.ups = []; }
    if (LP.edit) return viewEditor(head);
    if (LP.cur && !LP.classes.some(c => c.id === LP.cur.id)) LP.cur = null;
    if (!LP.cur) {
      app.innerHTML = head + `<main class="wrap">
        <div class="sec-h"><h1 style="font-size:30px">Deine Klassen</h1><p>Jede Klasse hat einen eigenen Klassencode.</p></div>
        ${LP.classes.length ? `<div class="classes">${LP.classes.map(c => `<button type="button" class="cls" data-cls="${c.id}"><h3>${esc(c.name)}</h3><span class="code-pill">${esc(c.code)}</span></button>`).join("")}</div>`
          : `<div class="empty-box">${gl("wink", "#8B5CFF")}<div><h2>Noch keine Klasse</h2><p>Leg unten deine erste Klasse an.</p></div></div>`}
        <form class="panel" id="newCls"><h2>Neue Klasse</h2>
          <div class="row"><input class="input" id="clsName" placeholder="z. B. 6i Gartenhof" maxlength="40" required style="flex:1;min-width:200px"><button class="btn primary" type="submit">Klasse anlegen</button></div></form>
        ${uploadsPanelHTML()}
        ${modsPanelHTML()}
        ${S.be.mode === "demo" ? `<p class="hint">Demo-Modus aktiv. <button type="button" class="link" data-resetdemo>Demo-Daten zurücksetzen</button></p>` : ""}
      </main>`;
      bindLpTop(); bindModsPanel(); bindUploadsPanel();
      $$("[data-cls]").forEach(b => b.onclick = () => { LP.cur = LP.classes.find(c => c.id === b.dataset.cls); LP.cards = false; render(); });
      $("#newCls").onsubmit = async e => {
        e.preventDefault();
        try { LP.cur = await S.be.createClass($("#clsName").value); LP.cards = false; toast(`Klasse angelegt. Code: ${LP.cur.code}`); render(); }
        catch (err) { toast(err.message, "err"); }
      };
      const rd = $("[data-resetdemo]"); if (rd) rd.onclick = () => { S.be.resetDemo(); store.del("glhub.token"); S.token = ""; S.me = null; S.team = []; saveTeam(); toast("Demo zurückgesetzt."); render(); };
      return;
    }
    // Klassen-Detail
    const c = LP.cur;
    [LP.kids, LP.prog] = await Promise.all([S.be.listStudents(c.id), S.be.classProgress(c.id)]);
    const st = (kid, subj) => H.modules.filter(m => !subj || m.subject === subj).reduce((a, m) => a + kidModStars(LP.prog, kid, m), 0)
      + (subj ? 0 : LP.prog.filter(p => p.student_id === kid && p.module_id === "test").reduce((a, p) => a + p.stars, 0));
    const actSubjects = H.subjects.filter(s => subjMods(s.id).length);
    if (LP.cards) {
      app.innerHTML = head + `<main class="wrap">
        <div class="row no-print"><button type="button" class="btn small" data-cardsoff>← Zurück zur Klasse</button>
          <button type="button" class="btn small primary" data-pdf>📄 PDF herunterladen (8 Karten pro A4)</button>
          ${inFrame ? "" : `<button type="button" class="btn small" data-print>Drucken</button>`}</div>
        <h1 style="font-size:26px">Login-Karten · ${esc(c.name)}</h1>
        <p class="hint no-print">Das Lehrpersonen-Konto ist absichtlich nicht dabei: Sein Bild-Passwort steht nur in deiner Tabelle.</p>
        <div class="lp-kids">${LP.kids.filter(k => !k.is_teacher).map(k => `<div class="kcard"><div class="top-k">${gl("happy", k.color, "still")}<b>${esc(k.first_name)}</b></div>
          <small>Klassencode</small><span class="code-pill">${esc(c.code)}</span><small>Mein geheimes Bild-Passwort</small><span class="pinv">${pinPics(k.pin)}</span></div>`).join("")}</div></main>`;
      bindLpTop();
      $("[data-cardsoff]").onclick = () => { LP.cards = false; render(); };
      const pr = $("[data-print]"); if (pr) pr.onclick = () => window.print();
      $("[data-pdf]").onclick = async ev => { const b = ev.currentTarget, t = b.textContent; b.disabled = true; b.textContent = "PDF wird erstellt …";
        try { await cardsPdf(c, LP.kids.filter(k => !k.is_teacher)); } catch (err) { toast("Das PDF konnte nicht erstellt werden: " + (err.message || err), "err", 6000); }
        b.disabled = false; b.textContent = t; };
      return;
    }
    app.innerHTML = head + `<main class="wrap">
      <div class="crumbs"><button type="button" class="btn small" data-allcls>← Alle Klassen</button></div>
      <section class="panel"><div class="row" style="justify-content:space-between"><div><p class="eyebrow">Klasse</p><h1 style="font-size:30px">${esc(c.name)}</h1></div>
        <div style="text-align:right"><p class="hint">Klassencode</p><span class="code-big">${esc(c.code)}</span></div></div>
        <div class="row"><button type="button" class="btn small" data-cards ${LP.kids.length ? "" : "disabled"}>Login-Karten zeigen</button>
          <button type="button" class="btn small danger" data-delcls>${LP.confirm === "cls" ? "Wirklich ganze Klasse löschen?" : "Klasse löschen"}</button></div></section>
      <section class="panel"><h2>Kinder (${LP.kids.filter(k => !k.is_teacher).length}) + Lehrpersonen-Konto</h2>
        <p class="hint">Das Konto «${esc(CFG.TEACHER_NAME || "Lehrperson")}» steht in jeder Klasse zuoberst. Dort ist immer alles freigeschaltet: alle Module, Level, Diplome, Outfits, Emotes und das Chalet. Ideal zum Vorzeigen.</p>
        ${LP.kids.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kind</th><th>Bild-Passwort</th>${actSubjects.map(s => `<th class="num">${esc(s.short)}</th>`).join("")}<th class="num">Total ★</th><th>Level</th><th></th></tr></thead><tbody>
          ${LP.kids.map(k => `<tr class="${k.is_teacher ? "lp-row" : ""}"><td class="kid">${gl(k.is_teacher ? "cool" : "normal", k.color, "still")}${esc(lpName(k))}${k.is_teacher ? ` <small class="lp-tag">Lehrperson</small>` : ""}</td><td class="pinv">${pinPics(k.pin)}</td>
            ${actSubjects.map(s => `<td class="num">${st(k.id, s.id)}</td>`).join("")}<td class="num"><b>${st(k.id)}</b></td>
            <td style="white-space:nowrap">${levelOf(st(k.id)) + 1} · ${esc(GD.LEVELS[levelOf(st(k.id))].n)}</td>
            <td><div class="acts-cell"><button type="button" class="btn small" data-newpin="${k.id}">Neues Passwort</button>
              <button type="button" class="btn small" data-test="${k.id}" title="Gibt das höchste Level und alle Diplome, zum Ausprobieren von Garderobe und Zimmer">Test: alles frei</button>
              <button type="button" class="btn small" data-reset="${k.id}">${LP.confirm === "r" + k.id ? "Sicher? Alles weg" : "Zurücksetzen"}</button>
              ${k.is_teacher ? "" : `<button type="button" class="btn small danger" data-delkid="${k.id}">${LP.confirm === "d" + k.id ? "Sicher?" : "Entfernen"}</button>`}</div></td></tr>`).join("")}
          </tbody></table></div>` : `<p class="hint">Noch keine Kinder. Trag sie unten ein.</p>`}
      </section>
      <form class="panel" id="addKids"><h2>Kinder hinzufügen</h2>
        <p class="hint">Ein Vorname pro Zeile. Bei gleichen Vornamen den Anfangsbuchstaben des Nachnamens dazuschreiben (z. B. «Lea M.»). Jedes Kind bekommt automatisch ein Bild-Passwort.</p>
        <label class="f" for="kidNames">Vornamen<textarea class="input" id="kidNames" placeholder="Anna&#10;Max&#10;Lea M."></textarea></label>
        <div class="row"><button class="btn primary" type="submit">Hinzufügen</button></div></form>
      ${accessPanelHTML(c)}
      ${kidModsPanelHTML()}
      <section class="panel"><h2>Fortschritt pro Modul</h2>
        ${H.modules.length && LP.kids.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kind</th>${H.modules.map(m => `<th class="num" title="${esc(m.title)}">${esc(m.title)}</th>`).join("")}</tr></thead><tbody>
          ${LP.kids.map(k => `<tr><td class="kid">${esc(k.first_name)}</td>${H.modules.map(m => {
            const got = kidModStars(LP.prog, k.id, m);
            const team = [...new Set(LP.prog.filter(p => p.student_id === k.id && p.module_id === m.id).flatMap(p => p.team || []))];
            return `<td class="num" title="${team.length ? "Mit: " + esc(team.join(", ")) : ""}">${H.openEnded(m) ? "★ " + got : got + " / " + H.maxStars(m)}${team.length ? " 👥" : ""}</td>`;
          }).join("")}</tr>`).join("")}</tbody></table></div><p class="hint">👥 = im Team gelöst (Maus darüber zeigt mit wem).</p>` : `<p class="hint">Sobald Kinder Aufgaben lösen, siehst du hier ihre Sterne.</p>`}
      </section></main>`;
    bindLpTop();
    $("[data-allcls]").onclick = () => { LP.cur = null; LP.confirm = null; render(); };
    $("[data-cards]").onclick = () => { LP.cards = true; render(); };
    $("[data-delcls]").onclick = async () => {
      if (LP.confirm !== "cls") { LP.confirm = "cls"; return render(); }
      await S.be.deleteClass(c.id); LP.cur = null; LP.confirm = null; toast("Klasse gelöscht."); render();
    };
    $$("[data-newpin]").forEach(b => b.onclick = async () => { await S.be.newPin(b.dataset.newpin); toast("Neues Bild-Passwort erstellt."); render(); });
    $$("[data-test]").forEach(b => b.onclick = async () => {
      await S.be.testUnlock(b.dataset.test, GD.LEVELS[GD.LEVELS.length - 1].s, GD.BADGES.map(x => x.id));
      toast("Test-Modus: höchstes Level und alle Diplome. «Zurücksetzen» macht es rückgängig."); render();
    });
    $$("[data-reset]").forEach(b => b.onclick = async () => {
      const id = b.dataset.reset; if (LP.confirm !== "r" + id) { LP.confirm = "r" + id; return render(); }
      await S.be.resetProgress(id); LP.confirm = null; toast("Sterne, Arbeiten und Garderobe zurückgesetzt."); render();
    });
    $$("[data-delkid]").forEach(b => b.onclick = async () => {
      const id = b.dataset.delkid; if (LP.confirm !== "d" + id) { LP.confirm = "d" + id; return render(); }
      await S.be.deleteStudent(id); LP.confirm = null; toast("Kind entfernt."); render();
    });
    bindAccessPanel(c); bindKidModsPanel();
    $("#addKids").onsubmit = async e => {
      e.preventDefault();
      const names = $("#kidNames").value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
      if (!names.length) return;
      try { const r = await S.be.addStudents(c.id, names); toast(`${r.length} ${r.length === 1 ? "Kind" : "Kinder"} hinzugefügt.`); render(); }
      catch (err) { toast(err.message, "err"); }
    };
  }
  /* ---------- Login-Karten als PDF: 8 Karten pro A4 (2 × 4), zum Ausschneiden ---------- */
  function loadJs(src) { return new Promise((ok, no) => { const sc = document.createElement("script"); sc.src = src; sc.onload = ok; sc.onerror = () => no(new Error("Bibliothek nicht geladen")); document.head.appendChild(sc); }); }
  function svgImg(svg) { return new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')); }); }
  async function cardsPdf(c, kids) {
    if (!kids.length) { toast("In dieser Klasse gibt es noch keine Kinder."); return; }
    if (!window.jspdf) await loadJs("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    const W = 92, Hc = 66, GX = 6, GY = 5, X0 = 10, Y0 = 9, PX = 10;   // mm, 10 px pro mm auf der Zeichenfläche
    const link = location.origin + location.pathname.replace(/index\.html$/, "");
    const gimg = await svgImg(G.svg("happy", "#8B5CFF", { calm: true }));
    const card = k => {
      const cv = document.createElement("canvas"); cv.width = W * PX; cv.height = Hc * PX; const x = cv.getContext("2d");
      const rr = (X, Y, w, h, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
      x.fillStyle = "#FFFFFF"; rr(4, 4, cv.width - 8, cv.height - 8, 40); x.fill();
      x.lineWidth = 6; x.strokeStyle = "#7B4CEF"; x.stroke();
      x.save(); rr(4, 4, cv.width - 8, 130, 40); x.clip(); const gr = x.createLinearGradient(0, 0, cv.width, 0); gr.addColorStop(0, "#2A1466"); gr.addColorStop(1, "#7B4CEF"); x.fillStyle = gr; x.fillRect(4, 4, cv.width - 8, 130); x.restore();
      if (gimg) x.drawImage(gimg, 30, 18, 100, 100);
      x.fillStyle = "#FFFFFF"; x.font = "800 34px system-ui, -apple-system, Segoe UI, sans-serif"; x.fillText("Glitchlab-Hub", 145, 62);
      x.font = "600 24px system-ui, sans-serif"; x.fillStyle = "#D9CCFF"; x.fillText(c.name, 145, 100);
      x.fillStyle = k.color || "#7B4CEF"; x.beginPath(); x.arc(cv.width - 70, 68, 26, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#14062E"; x.font = "900 64px system-ui, sans-serif"; x.fillText(k.first_name, 40, 222);
      x.fillStyle = "#625A7E"; x.font = "700 22px system-ui, sans-serif"; x.fillText("KLASSENCODE", 40, 280); x.fillText("MEIN GEHEIMES BILD-PASSWORT", 40, 420);
      x.fillStyle = "#F3EEFF"; rr(36, 296, 420, 76, 16); x.fill(); x.fillStyle = "#14062E"; x.font = "800 48px ui-monospace, Menlo, monospace"; x.fillText(c.code, 56, 350);
      String(k.pin).split("-").forEach((p, i) => { const bx = 40 + i * 150; x.fillStyle = "#FFF8E7"; rr(bx, 440, 130, 130, 22); x.fill(); x.strokeStyle = "#E3A300"; x.lineWidth = 4; x.stroke();
        x.fillStyle = "#14062E"; x.font = "800 22px system-ui, sans-serif"; x.fillText(String(i + 1), bx + 10, 468);
        x.font = "84px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText((PICS[+p] || ["?"])[0], bx + 65, 510); x.textAlign = "left"; x.textBaseline = "alphabetic"; });
      x.fillStyle = "#625A7E"; x.font = "600 19px system-ui, sans-serif"; x.fillText("Geheim halten! Nicht weitergeben.", 520, 470);
      x.fillText("Anmelden auf:", 520, 520); x.font = "700 18px ui-monospace, monospace"; x.fillStyle = "#7B4CEF";
      const words = link.replace(/^https?:\/\//, "").match(/.{1,26}/g) || []; words.slice(0, 3).forEach((w, i) => x.fillText(w, 520, 550 + i * 24));
      return cv.toDataURL("image/png");
    };
    kids.forEach((k, i) => {
      const n = i % 8; if (i && !n) doc.addPage();
      const cx = X0 + (n % 2) * (W + GX), cy = Y0 + Math.floor(n / 2) * (Hc + GY);
      doc.addImage(card(k), "PNG", cx, cy, W, Hc);
      doc.setDrawColor(190); doc.setLineDashPattern([1.5, 1.5], 0); doc.rect(cx - 1.5, cy - 1.5, W + 3, Hc + 3);
    });
    const name = "Login-Karten-" + c.name.replace(/[^\wäöüÄÖÜ-]+/g, "-") + ".pdf";
    doc.save(name);
    toast(`PDF «${name}» mit ${kids.length} Karten erstellt.`, "star", 4500);
  }

  /* ---------- Module für diese Klasse freischalten ---------- */
  const ACCESS = [["", "Standard"], ["offen", "Offen"], ["kette", "Nach dem Modul davor"], ["zu", "Gesperrt"]];
  function stdTxt(m) { return m.soon ? "kommt bald" : m.req ? "Standard: " + m.req.txt : "Standard: offen"; }
  /* ---------- Module pro Kind: Status setzen (Abgeschlossen = alle Belohnungen) ---------- */
  function kidModStars(prog, kidId, m) {
    const done = lpStatOf(prog, kidId, m) === "fertig";
    return m.activities.reduce((a, x) => { const v = (prog.find(p => p.student_id === kidId && p.module_id === m.id && p.activity_id === x.id) || {}).stars || 0;
      return a + (done ? fullAct(x, v) : x.maxStars == null ? v : Math.min(x.maxStars, v)); }, 0);
  }
  function autoStat(prog, kidId, m) {
    const own = m.activities.reduce((a, x) => a + ((prog.find(p => p.student_id === kidId && p.module_id === m.id && p.activity_id === x.id) || {}).stars || 0), 0);
    if (!own) return "offen";
    if (m.kind === "lab") { const have = new Set(prog.filter(p => p.student_id === kidId && p.module_id === m.id).flatMap(p => (p.data && p.data.badges) || [])), all = labBadges(m);
      return all.length && all.every(b => have.has(b)) ? "fertig" : "arbeit"; }
    const mx = H.maxStars(m); return mx && own >= mx ? "fertig" : "arbeit";
  }
  function kidModsPanelHTML() {
    const kids = LP.kids.filter(k => !k.is_teacher);
    if (!kids.length) return "";
    if (!kids.some(k => k.id === LP.kidSel)) LP.kidSel = kids[0].id;
    const k = kids.find(x => x.id === LP.kidSel), subjects = H.subjects.filter(sj => H.modules.some(m => m.subject === sj.id && !m.soon && !m.lpOnly));
    const row = m => { const set = lpStatOf(LP.prog, k.id, m), auto = autoStat(LP.prog, k.id, m), cur = set || auto, got = kidModStars(LP.prog, k.id, m);
      return `<div class="km-r"><span class="acc-n"><b>${esc(m.title)}</b><small>${H.openEnded(m) ? "★ " + got : got + " / " + H.maxStars(m) + " ★"} · ${set ? "von dir gesetzt" : "automatisch"}</small></span>
        <span class="km-seg" role="group" aria-label="Status von ${esc(m.title)}">${STATUS.map(([v, n]) => `<button type="button" class="km-b ${v}${cur === v ? " on" : ""}${cur === v && !set ? " auto" : ""}" data-kstat="${esc(m.id)}" data-v="${v}" aria-pressed="${cur === v}">${n}</button>`).join("")}</span>
        ${set ? `<button type="button" class="link km-x" data-kstat="${esc(m.id)}" data-v="" title="Wieder automatisch (so, wie das Kind gearbeitet hat)">↺ automatisch</button>` : `<span class="km-x"></span>`}</div>`; };
    return `<section class="panel" id="kidMods"><h2>Module pro Kind verwalten</h2>
      <p class="hint"><b>Offen:</b> noch nicht begonnen. <b>In Bearbeitung:</b> das Modul ist für dieses Kind frei. <b>Abgeschlossen:</b> das Kind bekommt alle Belohnungen des Moduls, also alle Sterne (und damit die Level), alle Diplome und alles, was das Modul freischaltet (Outfits, Emotes, Zimmer). «↺ automatisch» nimmt deine Einstellung zurück. Die eigene Arbeit des Kindes bleibt immer erhalten.</p>
      <div class="km-kids" role="tablist" aria-label="Kind wählen">${kids.map(x => `<button type="button" class="km-kid${x.id === k.id ? " on" : ""}" data-ksel="${x.id}" role="tab" aria-selected="${x.id === k.id}">${gl("normal", x.color, "still")}<span>${esc(x.first_name)}</span></button>`).join("")}</div>
      <div class="km-all row"><span class="hint" style="margin:0">Alles auf einmal für ${esc(k.first_name)}:</span><button type="button" class="btn small" data-kall="fertig">Alle abschliessen</button><button type="button" class="btn small" data-kall="">Alle automatisch</button></div>
      <div class="acc">${subjects.map(sj => `<div class="acc-s"><h3 style="--c:${sj.color}"><span>${esc(sj.short)}</span>${esc(sj.name)}</h3>
        ${H.themes.filter(t => t.subject === sj.id && H.modules.some(m => m.theme === t.id && !m.soon && !m.lpOnly)).map(t => `<div class="acc-t"><small>${esc(t.title)}</small>
          ${H.modules.filter(m => m.theme === t.id && !m.soon && !m.lpOnly).map(row).join("")}</div>`).join("")}</div>`).join("")}</div></section>`;
  }
  function bindKidModsPanel() {
    const keep = async fn => { const y = window.scrollY; await fn(); await render(); window.scrollTo(0, y); };
    $$("[data-ksel]").forEach(b => b.onclick = () => keep(async () => { LP.kidSel = b.dataset.ksel; }));
    $$("[data-kstat]").forEach(b => b.onclick = () => keep(async () => {
      const m = H.modules.find(x => x.id === b.dataset.kstat), k = LP.kids.find(x => x.id === LP.kidSel), v = b.dataset.v;
      try { await S.be.setModStatus(k.id, m.id, v || null);
        toast(v === "fertig" ? `«${m.title}» abgeschlossen: ${k.first_name} bekommt alle Belohnungen.` : v ? `«${m.title}» für ${k.first_name}: ${STATUS.find(s => s[0] === v)[1]}.` : `«${m.title}» für ${k.first_name} wieder automatisch.`);
      } catch (err) { toast(err.message, "err"); }
    }));
    $$("[data-kall]").forEach(b => b.onclick = () => keep(async () => {
      const k = LP.kids.find(x => x.id === LP.kidSel), v = b.dataset.kall;
      try { for (const m of H.modules.filter(x => !x.soon && !x.lpOnly)) { if ((lpStatOf(LP.prog, k.id, m) || "") !== v) await S.be.setModStatus(k.id, m.id, v || null); }
        toast(v ? `Alle Module für ${k.first_name} abgeschlossen.` : `Alle Module für ${k.first_name} wieder automatisch.`);
      } catch (err) { toast(err.message, "err"); }
    }));
  }
  function accessPanelHTML(c) {
    const set = (c.settings && c.settings.mods) || {};
    const subjects = H.subjects.filter(sj => H.modules.some(m => m.subject === sj.id && !m.soon));
    return `<section class="panel"><div class="row" style="justify-content:space-between"><h2>Module für diese Klasse</h2>
        <span class="row"><button type="button" class="btn small" data-accall="offen">Alle offen</button><button type="button" class="btn small" data-accall="kette">Alle als Kette</button><button type="button" class="btn small" data-accall="">Alle Standard</button></span></div>
      <p class="hint"><b>Offen:</b> sofort frei. <b>Gesperrt:</b> die Kinder sehen das Modul, können es aber nicht öffnen. <b>Nach dem Modul davor:</b> frei, sobald das vorherige Modul im selben Thema geschafft ist (mindestens die Hälfte der Sterne). <b>Standard:</b> so, wie das Modul gebaut ist. Das Lehrpersonen-Konto sieht immer alles.</p>
      <div class="acc">${subjects.map(sj => `<div class="acc-s"><h3 style="--c:${sj.color}"><span>${esc(sj.short)}</span>${esc(sj.name)}</h3>
        ${H.themes.filter(t => t.subject === sj.id && H.modules.some(m => m.theme === t.id && !m.soon)).map(t => `<div class="acc-t"><small>${esc(t.title)}</small>
          ${H.modules.filter(m => m.theme === t.id && !m.soon).map((m, i) => `<div class="acc-r"><span class="acc-n"><b>${i + 1}. ${esc(m.title)}</b><small>${esc(stdTxt(m))}</small></span>
            <select class="input acc-sel" data-acc="${esc(m.id)}" aria-label="Freischaltung für ${esc(m.title)}">${ACCESS.map(([v, n]) => `<option value="${v}"${(set[m.id] || "") === v ? " selected" : ""}${v === "kette" && i === 0 ? " disabled" : ""}>${n}</option>`).join("")}</select></div>`).join("")}</div>`).join("")}</div>`).join("")}</div>
    </section>`;
  }
  function bindAccessPanel(c) {
    const store = async (mods, msg) => {
      const settings = Object.assign({}, c.settings || {}, { mods });
      try { await S.be.saveClassSettings(c.id, settings); c.settings = settings; toast(msg); } catch (err) { toast(err.message, "err"); }
    };
    $$("[data-acc]").forEach(sel => sel.onchange = () => {
      const mods = Object.assign({}, (c.settings && c.settings.mods) || {}); if (sel.value) mods[sel.dataset.acc] = sel.value; else delete mods[sel.dataset.acc];
      const m = H.modules.find(x => x.id === sel.dataset.acc);
      store(mods, `«${m ? m.title : "Modul"}»: ${(ACCESS.find(a => a[0] === sel.value) || ACCESS[0])[1]}`);
    });
    $$("[data-accall]").forEach(b => b.onclick = async () => {
      const v = b.dataset.accall, mods = {};
      if (v) H.modules.filter(m => !m.soon).forEach(m => { const first = H.modules.filter(x => x.theme === m.theme && !x.soon)[0] === m; mods[m.id] = v === "kette" && first ? "offen" : v; });
      await store(mods, v === "offen" ? "Alle Module sind offen." : v === "kette" ? "Alle Module als Kette: das erste je Thema ist offen." : "Alle Module auf Standard.");
      render();
    });
  }

  /* =================================================================
     6b) Modul-Editor: Lehrpersonen bauen eigene Module ohne Code
     ================================================================= */
  const ITEM_TYPES = {
    mc: { n: "Quizfrage", ic: "🔘", make: () => ({ type: "mc", q: "", options: ["", ""], correct: 0, explain: "" }) },
    tf: { n: "Richtig oder falsch", ic: "✅", make: () => ({ type: "tf", q: "", answer: true, explain: "" }) },
    text: { n: "Antwort eintippen", ic: "⌨️", make: () => ({ type: "text", q: "", answers: "", explain: "" }) },
    info: { n: "Info-Seite", ic: "📄", make: () => ({ type: "info", title: "", text: "" }) }
  };
  const newModuleData = () => ({ title: "", teaser: "", subject: "nmg", theme: "nmg-schweiz", newTheme: { title: "", art: "hallo" }, art: "schweiz", minutes: 15, items: [ITEM_TYPES.info.make(), ITEM_TYPES.mc.make()] });
  const getPath = (o, p) => p.split(".").reduce((a, k) => a == null ? a : a[k], o);
  const setPath = (o, p, v) => { const ks = p.split("."); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; };
  function moduleProblems(d) {
    const out = [];
    if (!d.title.trim()) out.push("Das Modul braucht einen Titel.");
    if (d.theme === "__neu" && !(d.newTheme && d.newTheme.title.trim())) out.push("Gib dem neuen Thema einen Namen.");
    if (!H.scorable(d).length) out.push("Füge mindestens eine Aufgabe hinzu (Quizfrage, Richtig/Falsch oder Antwort eintippen).");
    d.items.forEach((it, k) => {
      const nr = `Aufgabe ${k + 1}`;
      if (it.type !== "info" && !String(it.q || "").trim()) out.push(`${nr}: Die Frage fehlt.`);
      if (it.type === "mc") {
        const filled = it.options.filter(o => o.trim()).length;
        if (filled < 2) out.push(`${nr}: Es braucht mindestens zwei Antworten.`);
        if (!String(it.options[it.correct] || "").trim()) out.push(`${nr}: Die richtige Antwort ist leer.`);
      }
      if (it.type === "text" && !String(it.answers || "").trim()) out.push(`${nr}: Schreib mindestens eine richtige Antwort auf.`);
      if (it.type === "info" && !String(it.text || "").trim()) out.push(`${nr}: Die Info-Seite hat noch keinen Text.`);
    });
    return out;
  }
  /* ---------- Module hochladen (HTML-Dateien per Drag & Drop) ---------- */
  function uploadsPanelHTML() {
    const ups = LP.ups || [];
    const subjName = id => (H.subjects.find(s => s.id === id) || {}).short || "–";
    return `<section class="panel"><div class="row" style="justify-content:space-between"><h2>Module hochladen</h2>
        <span class="row">${CFG.EDITOR_URL ? `<a class="btn small primary" href="${esc(CFG.EDITOR_URL)}" target="_blank" rel="noopener">✨ Im gLiTCh-Editor erstellen</a>` : ""}<button type="button" class="btn small" data-uptpl>📄 Vorlage herunterladen</button></span></div>
      <p class="hint">Zieh fertige HTML-Module hierher, zum Beispiel aus dem gLiTCh-Editor. Outfits, Emotes, Zimmer-Gegenstände und Hintergründe aus dem Steckbrief der Datei werden im Hub verfügbar. Die Kinder schalten sie im Modul frei.</p>
      <label class="dropzone" id="upDrop" tabindex="0">
        <input type="file" id="upFile" accept=".html,.htm,text/html" multiple hidden>
        <span class="dz-ic" aria-hidden="true">⬇️</span><b>HTML-Datei hierher ziehen</b><span class="hint">oder tippen zum Auswählen · max. 8 MB pro Datei</span>
      </label>
      ${ups.length ? `<div class="uplist">${ups.map(u => { const d = u.meta || {}, e = d.extras || {}, m = H.modules.find(x => x.uploadId === u.id), t = m && H.themes.find(x => x.id === m.theme);
        return `<div class="upitem${u.published ? "" : " off"}">
          <span class="up-art">${(H.modArt && H.modArt["up-" + u.id] || {}).svg || ""}</span>
          <div class="up-txt"><b>${esc(d.title)}</b><small>${esc(subjName(d.subject))}${t ? " · " + esc(t.title) : ""} · ${H.maxStars(m || { activities: [] })} Sterne</small>
            <span class="up-ex">${[["outfits", "👕", "Outfits"], ["emotes", "✨", "Emotes"], ["room", "🛋️", "Zimmer"], ["bgs", "🖼️", "Hintergründe"]].map(([k, ic, n]) => (e[k] || []).length ? `<span title="${n}">${ic} ${(e[k] || []).length} ${n}</span>` : "").join("") || `<span>Keine Extras</span>`}</span></div>
          <div class="up-act">
            <button type="button" class="btn small" data-upprev="${u.id}">▶ Testen</button>
            <button type="button" class="btn small" data-uptog="${u.id}">${u.published ? "● Sichtbar" : "○ Versteckt"}</button>
            <label class="btn small">Ersetzen<input type="file" accept=".html,.htm,text/html" data-uprepl="${u.id}" hidden></label>
            <button type="button" class="btn small danger" data-updel="${u.id}">Löschen</button></div></div>`; }).join("")}</div>` : ""}
    </section>`;
  }
  function bindUploadsPanel() {
    const dz = $("#upDrop"); if (!dz) return;
    const take = files => { const f = [...files].filter(x => /\.html?$/i.test(x.name) || x.type === "text/html"); if (!f.length) return toast("Bitte eine HTML-Datei (.html) wählen.", "err"); uploadFlow(f, null); };
    ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("over"); }));
    ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("over"); }));
    dz.addEventListener("drop", e => take(e.dataTransfer.files));
    dz.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#upFile").click(); } });
    $("#upFile").onchange = e => { take(e.target.files); e.target.value = ""; };
    $("[data-uptpl]").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([H.uploadTemplate()], { type: "text/html" })); a.download = "glitchlab-modul-vorlage.html"; document.body.appendChild(a); a.click(); a.remove(); };
    $$("[data-uprepl]").forEach(i => i.onchange = e => { if (e.target.files[0]) uploadFlow([e.target.files[0]], i.dataset.uprepl); });
    $$("[data-uptog]").forEach(b => b.onclick = async () => { const u = LP.ups.find(x => x.id === b.dataset.uptog); try { await S.be.saveUpload(u.id, u.meta, null, !u.published); toast(u.published ? "Versteckt: Die Kinder sehen es nicht mehr." : "Sichtbar für alle deine Klassen."); render(); } catch (err) { toast(err.message, "err"); } });
    $$("[data-updel]").forEach(b => b.onclick = async () => {
      const u = LP.ups.find(x => x.id === b.dataset.updel);
      if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Wirklich löschen?"; return; }
      try { await S.be.deleteUpload(u.id); toast(`«${u.meta.title}» gelöscht.`); render(); } catch (err) { toast(err.message, "err"); }
    });
    $$("[data-upprev]").forEach(b => b.onclick = async () => {
      const u = LP.ups.find(x => x.id === b.dataset.upprev), m = H.modules.find(x => x.uploadId === u.id) || { id: "up-" + u.id, activities: [] };
      let html; try { html = await S.be.uploadHtml(u.id); } catch (err) { return toast(err.message, "err"); }
      const ov = document.createElement("div"); ov.className = "overlay";
      ov.innerHTML = `<div class="sheet wide up-prev" role="dialog" aria-modal="true" aria-label="Vorschau"><div class="row" style="justify-content:space-between"><b>Vorschau: ${esc(u.meta.title)}</b><span class="hint">Sterne werden nicht gespeichert.</span><button type="button" class="btn small" data-pvclose>Schliessen</button></div><iframe class="up-frame" title="Vorschau"></iframe></div>`;
      document.body.appendChild(ov);
      $(".up-frame", ov).srcdoc = H.uploadDoc(html || "", m, "glhub.preview." + u.id, "Vorschau", []);
      $("[data-pvclose]", ov).onclick = () => ov.remove();
    });
  }
  function readFile(f) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => no(new Error("Datei konnte nicht gelesen werden.")); r.readAsText(f, "utf-8"); }); }
  async function uploadFlow(files, replaceId) {
    for (const f of files) {
      if (f.size > H.UPLOAD_MAX) { toast(`«${f.name}» ist zu gross (max. 8 MB).`, "err", 5000); continue; }
      let html; try { html = await readFile(f); } catch (err) { toast(err.message, "err"); continue; }
      const { meta, warn } = H.readUpload(html, f.name);
      const old = replaceId && LP.ups.find(x => x.id === replaceId);
      if (old && !meta.subject) { meta.subject = old.meta.subject; meta.theme = meta.theme || old.meta.theme; }
      const res = await uploadSheet(meta, warn, f.name, !!old);
      if (!res) continue;
      try { await S.be.saveUpload(old ? old.id : null, res, html, old ? old.published : true); toast(`«${res.title}» ${old ? "ersetzt" : "hochgeladen"}. Alle deine Klassen sehen es jetzt.`, "star", 4500); }
      catch (err) { toast(err.message, "err", 6000); }
    }
    render();
  }
  /* Kontrolle vor dem Hochladen: Fach/Thema/Titel anpassen, Extras ansehen */
  function uploadSheet(meta, warn, fileName, isReplace) {
    return new Promise(done => {
      const e = meta.extras, ov = document.createElement("div"); ov.className = "overlay";
      const subjOpts = () => H.subjects.map(s => `<option value="${s.id}"${s.id === meta.subject ? " selected" : ""}>${esc(s.name)}</option>`).join("");
      const themeOpts = sid => { const ts = H.themes.filter(t => t.subject === sid && !t.up && !t.custom); const known = ts.some(t => t.title.toLowerCase() === (meta.theme || "").toLowerCase());
        return ts.map(t => `<option value="${esc(t.title)}"${t.title.toLowerCase() === (meta.theme || "").toLowerCase() ? " selected" : ""}>${esc(t.title)}</option>`).join("") + `<option value="__neu"${known ? "" : " selected"}>+ Neues Thema …</option>`; };
      const exList = (k, ic, n, f) => (e[k] || []).length ? `<div class="up-exg"><b>${ic} ${n}</b>${e[k].map(x => `<span class="chip">${esc(f(x))} · <small>${esc(H.unlockText(x.unlock, meta.title))}</small></span>`).join("")}</div>` : "";
      ov.innerHTML = `<div class="sheet wide" role="dialog" aria-modal="true" aria-labelledby="upT">
        <div class="sheet-h">${gl("happy", "#8B5CFF")}<div><h2 id="upT">${isReplace ? "Modul ersetzen" : "Modul hochladen"}</h2><p>${esc(fileName)}</p></div></div>
        ${warn.length ? `<div class="up-warn">${warn.map(w => `<p>⚠️ ${esc(w)}</p>`).join("")}</div>` : ""}
        <label class="f">Titel<input class="input" id="upTitle" value="${esc(meta.title)}" maxlength="60"></label>
        <label class="f">Kurzbeschreibung<input class="input" id="upTeaser" value="${esc(meta.teaser)}" maxlength="160"></label>
        <div class="ed-grid">
          <label class="f">Fach<select class="input" id="upSubj"><option value="">Bitte wählen …</option>${subjOpts()}</select></label>
          <label class="f">Thema<select class="input" id="upTheme"></select></label>
          <label class="f" id="upNewWrap">Neues Thema<input class="input" id="upNew" value="${esc(meta.theme)}" maxlength="50" placeholder="z. B. Naturgewalten"></label>
        </div>
        <p class="hint">Sterne: ${meta.activities.length ? meta.activities.map(a => `${esc(a.title)} (${a.maxStars})`).join(", ") + " + " : ""}1 für «Fertig».</p>
        ${H.extrasCount(meta) ? `<div class="up-extras">${exList("outfits", "👕", "Outfits", x => (x.emoji ? x.emoji + " " : "") + x.n)}${exList("emotes", "✨", "Emotes", x => x.ic + " " + x.n)}${exList("room", "🛋️", "Zimmer", x => (x.emoji ? x.emoji + " " : "") + x.n)}${exList("bgs", "🖼️", "Hintergründe", x => (x.ic ? x.ic + " " : "") + x.n)}</div>` : `<p class="hint">Keine Extras im Steckbrief.</p>`}
        <p class="err" id="upErr" role="alert"></p>
        <div class="row"><button type="button" class="btn primary" data-upok>${isReplace ? "Ersetzen" : "Hochladen & freigeben"}</button><button type="button" class="btn" data-upno>Abbrechen</button></div></div>`;
      document.body.appendChild(ov);
      const paint = () => { const sid = $("#upSubj", ov).value; $("#upTheme", ov).innerHTML = sid ? themeOpts(sid) : `<option value="__neu">+ Neues Thema …</option>`; $("#upNewWrap", ov).hidden = $("#upTheme", ov).value !== "__neu"; };
      paint();
      $("#upSubj", ov).onchange = paint; $("#upTheme", ov).onchange = () => { $("#upNewWrap", ov).hidden = $("#upTheme", ov).value !== "__neu"; };
      $("[data-upno]", ov).onclick = () => { ov.remove(); done(null); };
      $("[data-upok]", ov).onclick = () => {
        const sid = $("#upSubj", ov).value, th = $("#upTheme", ov).value === "__neu" ? $("#upNew", ov).value.trim() : $("#upTheme", ov).value;
        if (!sid) { $("#upErr", ov).textContent = "Bitte ein Fach wählen."; return; }
        if (!$("#upTitle", ov).value.trim()) { $("#upErr", ov).textContent = "Bitte einen Titel eingeben."; return; }
        ov.remove(); done(Object.assign({}, meta, { title: $("#upTitle", ov).value.trim(), teaser: $("#upTeaser", ov).value.trim(), subject: sid, theme: th }));
      };
    });
  }
  function modsPanelHTML() {
    return `<section class="panel"><div class="row" style="justify-content:space-between"><h2>Meine Module</h2><button type="button" class="btn primary small" data-newmod>+ Neues Modul</button></div>
      <p class="hint">Baue eigene Module mit Info-Seiten, Quizfragen, Richtig/Falsch und Antworten zum Eintippen. Veröffentlichte Module sehen alle deine Klassen im gewählten Fach und Thema.</p>
      ${LP.mods.length ? `<div class="mods">${LP.mods.map(m => { const d = m.data || {}, a = H.ART_CHOICES.find(x => x.key === d.art) || H.ART_CHOICES[0], sj = H.subjects.find(s => s.id === d.subject);
        return `<button type="button" class="mod" style="--c:${a.c}" data-editmod="${m.id}"><span class="art-banner" style="--mc:${a.c};--mc2:${a.c2}">${(H.themeArt || {})[a.key] || ""}<span class="lock-pill">${m.published ? "● Veröffentlicht" : "Entwurf"}</span></span>
          <h3>${esc(d.title || "Ohne Titel")}</h3><p>${esc(sj ? sj.short : "")} · ${H.scorable(d).length} Aufgaben · ${(d.items || []).length - H.scorable(d).length} Info-Seiten</p></button>`; }).join("")}</div>`
        : `<p class="hint"><i>Noch keine eigenen Module.</i></p>`}</section>`;
  }
  function bindModsPanel() {
    const nb = $("[data-newmod]"); if (nb) nb.onclick = () => { LP.edit = { id: null, data: newModuleData(), published: false }; LP.confirm = null; render(); };
    $$("[data-editmod]").forEach(b => b.onclick = () => { const m = LP.mods.find(x => x.id === b.dataset.editmod); LP.edit = { id: m.id, data: JSON.parse(JSON.stringify(m.data)), published: m.published }; LP.confirm = null; render(); });
  }
  function itemHTML(it, k, n) {
    const T = ITEM_TYPES[it.type], p = `items.${k}`;
    const ctl = `<div class="ed-ctl"><button type="button" class="btn small" data-mv="${k}" data-d="-1" ${k ? "" : "disabled"} aria-label="Nach oben">↑</button><button type="button" class="btn small" data-mv="${k}" data-d="1" ${k < n - 1 ? "" : "disabled"} aria-label="Nach unten">↓</button><button type="button" class="btn small danger" data-rm="${k}" aria-label="Aufgabe entfernen">✕</button></div>`;
    const explain = `<label class="f">Erklärung nach der Antwort <span class="hint">(freiwillig)</span><input class="input" data-f="${p}.explain" value="${esc(it.explain || "")}" placeholder="Warum ist das so?"></label>`;
    let body = "";
    if (it.type === "info") body = `<label class="f">Titel<input class="input" data-f="${p}.title" value="${esc(it.title)}" placeholder="z. B. Die vier Sprachregionen"></label>
      <label class="f">Text<textarea class="input" data-f="${p}.text" placeholder="Erkläre hier das Wichtigste. Leere Zeile = neuer Abschnitt.">${esc(it.text)}</textarea></label>`;
    if (it.type === "mc") body = `<label class="f">Frage<input class="input" data-f="${p}.q" value="${esc(it.q)}" placeholder="z. B. Wie viele Kantone hat die Schweiz?"></label>
      <div class="ed-opts">${it.options.map((o, j) => `<div class="ed-opt"><label class="ed-ok" title="Richtige Antwort"><input type="radio" name="ok${k}" data-ok="${k}" value="${j}" ${+it.correct === j ? "checked" : ""}> richtig</label>
        <input class="input" data-f="${p}.options.${j}" value="${esc(o)}" placeholder="Antwort ${j + 1}">${it.options.length > 2 ? `<button type="button" class="btn small" data-rmopt="${k}" data-j="${j}" aria-label="Antwort entfernen">✕</button>` : ""}</div>`).join("")}
        ${it.options.length < 4 ? `<button type="button" class="btn small" data-addopt="${k}">+ Antwort</button>` : ""}</div>` + explain;
    if (it.type === "tf") body = `<label class="f">Aussage<input class="input" data-f="${p}.q" value="${esc(it.q)}" placeholder="z. B. Bern ist die Hauptstadt der Schweiz."></label>
      <div class="row"><b>Diese Aussage ist</b><label class="ed-ok"><input type="radio" name="tf${k}" data-tf="${k}" value="1" ${it.answer ? "checked" : ""}> richtig</label><label class="ed-ok"><input type="radio" name="tf${k}" data-tf="${k}" value="0" ${it.answer ? "" : "checked"}> falsch</label></div>` + explain;
    if (it.type === "text") body = `<label class="f">Frage<input class="input" data-f="${p}.q" value="${esc(it.q)}" placeholder="z. B. Wie heisst der längste Fluss der Schweiz?"></label>
      <label class="f">Richtige Antworten <span class="hint">(mit Komma trennen; Gross-/Kleinschreibung egal)</span><input class="input" data-f="${p}.answers" value="${esc(it.answers)}" placeholder="z. B. Rhein, der Rhein"></label>` + explain;
    return `<div class="ed-item"><div class="ed-item-h"><span class="ed-badge">${T.ic} ${k + 1} · ${T.n}</span>${ctl}</div>${body}</div>`;
  }
  function viewEditor(head) {
    const E = LP.edit, d = E.data;
    const themes = H.themes.filter(t => t.subject === d.subject && !t.custom);
    if (d.theme !== "__neu" && !themes.some(t => t.id === d.theme)) d.theme = themes.length ? themes[0].id : "__neu";
    const probs = moduleProblems(d);
    app.innerHTML = head + `<main class="wrap editor">
      <div class="row"><button type="button" class="btn small" data-edback>← Meine Module</button><span class="hint">${E.published ? "● Veröffentlicht: Die Kinder sehen dieses Modul." : "Entwurf: Die Kinder sehen es noch nicht."}</span></div>
      <section class="panel"><h2>1 · Grunddaten</h2>
        <label class="f">Titel<input class="input" data-f="title" value="${esc(d.title)}" maxlength="60" placeholder="z. B. Kantone-Quiz"></label>
        <label class="f">Kurzbeschreibung für die Kinder<input class="input" data-f="teaser" value="${esc(d.teaser)}" maxlength="160" placeholder="Ein Satz, worum es geht."></label>
        <div class="ed-grid">
          <label class="f">Fach<select class="input" data-fs="subject">${H.subjects.map(s => `<option value="${s.id}" ${s.id === d.subject ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
          <label class="f">Thema<select class="input" data-fs="theme">${themes.map(t => `<option value="${t.id}" ${t.id === d.theme ? "selected" : ""}>${esc(t.title)}</option>`).join("")}<option value="__neu" ${d.theme === "__neu" ? "selected" : ""}>＋ Neues Thema …</option></select></label>
          <label class="f">Dauer (Minuten)<input class="input" type="number" min="1" max="240" data-f="minutes" value="${esc(d.minutes)}"></label>
        </div>
        ${d.theme === "__neu" ? `<label class="f">Name des neuen Themas<input class="input" data-f="newTheme.title" value="${esc(d.newTheme.title)}" maxlength="40" placeholder="z. B. Bruchrechnen"></label>` : ""}
      </section>
      <section class="panel"><h2>2 · Bild</h2><p class="hint">Dieses animierte Bild sehen die Kinder auf der Modul-Karte${d.theme === "__neu" ? " und beim neuen Thema" : ""}.</p>
        <div class="ed-arts">${H.ART_CHOICES.map(a => `<button type="button" class="ed-art${a.key === d.art ? " on" : ""}" data-art="${a.key}" aria-pressed="${a.key === d.art}"><span class="art-banner" style="--mc:${a.c};--mc2:${a.c2}">${(H.themeArt || {})[a.key] || ""}</span><small>${esc(a.n)}</small></button>`).join("")}</div>
      </section>
      <section class="panel"><h2>3 · Aufgaben <span class="hint">(${H.scorable(d).length} Aufgaben = ${H.scorable(d).length} Sterne)</span></h2>
        ${d.items.map((it, k) => itemHTML(it, k, d.items.length)).join("")}
        <div class="row">${Object.entries(ITEM_TYPES).map(([k, T]) => `<button type="button" class="btn small" data-add="${k}">+ ${T.ic} ${T.n}</button>`).join("")}</div>
      </section>
      <section class="panel ed-foot">
        ${probs.length ? `<div class="ed-probs"><b>Noch offen vor dem Veröffentlichen:</b><ul>${probs.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : `<p class="hint">✓ Alles bereit zum Veröffentlichen.</p>`}
        <div class="row"><button type="button" class="btn" data-preview>▶ Vorschau</button><button type="button" class="btn" data-save>Als Entwurf speichern</button>
          ${E.published ? `<button type="button" class="btn" data-unpub>Zurückziehen</button>` : `<button type="button" class="btn primary" data-pub ${probs.length ? "disabled" : ""}>Veröffentlichen</button>`}
          ${E.id ? `<button type="button" class="btn danger" data-delmod>${LP.confirm === "mod" ? "Wirklich löschen?" : "Löschen"}</button>` : ""}</div>
      </section></main>`;
    bindLpTop();
    const rerender = () => { const y = window.scrollY; render(); setTimeout(() => window.scrollTo(0, y), 0); };
    $$("[data-f]").forEach(inp => inp.oninput = () => {
      setPath(d, inp.dataset.f, inp.type === "number" ? +inp.value : inp.value);
      const fp = $(".ed-foot .ed-probs, .ed-foot > .hint"); if (fp) { const pr = moduleProblems(d); fp.outerHTML = pr.length ? `<div class="ed-probs"><b>Noch offen vor dem Veröffentlichen:</b><ul>${pr.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : `<p class="hint">✓ Alles bereit zum Veröffentlichen.</p>`; const pb = $("[data-pub]"); if (pb) pb.disabled = !!pr.length; }
    });
    $$("[data-fs]").forEach(sel => sel.onchange = () => { setPath(d, sel.dataset.fs, sel.value); rerender(); });
    $$("[data-ok]").forEach(r => r.onchange = () => { d.items[+r.dataset.ok].correct = +r.value; });
    $$("[data-tf]").forEach(r => r.onchange = () => { d.items[+r.dataset.tf].answer = r.value === "1"; });
    $$("[data-art]").forEach(b => b.onclick = () => { d.art = b.dataset.art; if (d.newTheme) d.newTheme.art = d.art; rerender(); });
    $$("[data-add]").forEach(b => b.onclick = () => { d.items.push(ITEM_TYPES[b.dataset.add].make()); rerender(); });
    $$("[data-rm]").forEach(b => b.onclick = () => { d.items.splice(+b.dataset.rm, 1); rerender(); });
    $$("[data-mv]").forEach(b => b.onclick = () => { const k = +b.dataset.mv, j = k + (+b.dataset.d); [d.items[k], d.items[j]] = [d.items[j], d.items[k]]; rerender(); });
    $$("[data-addopt]").forEach(b => b.onclick = () => { d.items[+b.dataset.addopt].options.push(""); rerender(); });
    $$("[data-rmopt]").forEach(b => b.onclick = () => { const it = d.items[+b.dataset.rmopt], j = +b.dataset.j; it.options.splice(j, 1); if (it.correct >= it.options.length || it.correct === j) it.correct = 0; else if (it.correct > j) it.correct--; rerender(); });
    $("[data-edback]").onclick = () => { LP.edit = null; LP.confirm = null; render(); };
    const persist = async (pub, msg) => {
      try { E.id = await S.be.saveModule(E.id, d, pub); E.published = pub; LP.confirm = null; toast(msg); rerender(); }
      catch (err) { toast(err.message, "err", 5000); }
    };
    $("[data-save]").onclick = () => persist(E.published && !moduleProblems(d).length, E.published ? "Gespeichert. Die Kinder sehen die neue Version." : "Entwurf gespeichert.");
    const pb = $("[data-pub]"); if (pb) pb.onclick = () => persist(true, "Veröffentlicht! Die Kinder finden es unter " + ((H.themes.find(t => t.id === d.theme) || {}).title || d.newTheme.title) + ".");
    const ub = $("[data-unpub]"); if (ub) ub.onclick = () => persist(false, "Zurückgezogen. Die Kinder sehen das Modul nicht mehr.");
    const db = $("[data-delmod]"); if (db) db.onclick = async () => {
      if (LP.confirm !== "mod") { LP.confirm = "mod"; return rerender(); }
      await S.be.deleteModule(E.id); LP.edit = null; LP.confirm = null; toast("Modul gelöscht. Gesammelte Sterne der Kinder bleiben in der Datenbank."); render();
    };
    $("[data-preview]").onclick = () => {
      const ov = document.createElement("div"); ov.className = "overlay";
      ov.innerHTML = `<div class="sheet wide" role="dialog" aria-modal="true" aria-label="Vorschau"><div class="sheet-h">${gl("happy", "#8B5CFF")}<div><h2>Vorschau: ${esc(d.title || "Ohne Titel")}</h2><p id="pvSay">So sehen es die Kinder. Es werden keine Sterne gespeichert.</p></div></div><div id="pvBody"></div><button type="button" class="btn" data-pvclose>Vorschau schliessen</button></div>`;
      document.body.appendChild(ov);
      const close = () => ov.remove();
      $("[data-pvclose]", ov).onclick = close;
      H.playCustom($("#pvBody", ov), { student: { first_name: "Testkind" }, team: [], say: t => { $("#pvSay", ov).textContent = t; }, back: close,
        award: (a, st) => toast(`Vorschau: ${st} Sterne (nicht gespeichert)`) }, d);
    };
  }

  function bindLpTop() {
    $$("[data-exit]").forEach(b => b.onclick = () => { S.cls = null; go({ name: S.me ? "home" : S.code ? "names" : "code" }); });
    $$("[data-signout]").forEach(b => b.onclick = async () => { await S.be.teacherSignOut(); LP.cur = null; render(); });
  }

  /* =================================================================
     Start
     ================================================================= */
  try { S.be = await window.GLBackend.create(); }
  catch (e) { app.innerHTML = `<main class="wrap gate"><div class="card"><h1>Keine Verbindung</h1><p>Der Hub kann die Datenbank gerade nicht laden. Prüf das Internet und lade die Seite neu.</p></div></main>`; return; }
  /* Rückkehr vom Bestätigungslink in der E-Mail (Supabase hängt Daten an die Adresse an) */
  const authHash = new URLSearchParams((location.hash || "").replace(/^#/, "") + "&" + (location.search || "").replace(/^\?/, ""));
  if (authHash.get("access_token") || authHash.get("type") === "signup" || authHash.get("code") || authHash.get("error")) {
    const err = authHash.get("error_description");
    await new Promise(r => setTimeout(r, 600));   // Supabase übernimmt die Anmeldung aus der Adresse
    history.replaceState(null, "", location.pathname);
    go({ name: "lp" });
    toast(err ? `Bestätigung hat nicht geklappt: ${err}. Melde dich einfach mit E-Mail und Passwort an.` : "E-Mail bestätigt! Melde dich mit E-Mail und Passwort an, falls du nicht schon drin bist.", err ? "err" : "star", 7000);
    return;
  }
  if (S.token) {
    try { await loadMe(); return go({ name: "home" }); }
    catch (e) { store.del("glhub.token"); S.token = ""; S.team = []; saveTeam(); }
  }
  go({ name: S.code ? "names" : "code" });
})();
