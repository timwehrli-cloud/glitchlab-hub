/* =====================================================================
   Glitchlab · App
   Ansichten: Klassencode → Name → Bild-PIN → Glitchlab (Fächer) → Fach → Modul
              + Teampartner auf demselben Gerät + Lehrpersonen-Bereich
   ===================================================================== */
(async function () {
  const H = window.GLHub;
  const G = window.GLGlitch;
  const CFG = window.GL_CONFIG || {};
  const LP_NAME = "Die Lehrperson";
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
  const actStars = (m, x) => { const st = progOf(m.id, x.id)?.stars || 0; return H.scaled(m, x, lpStat(m) === "fertig" ? fullAct(x, st) : st); };
  const modStars = m => m.activities.reduce((a, x) => a + actStars(m, x), 0);
  /* Nur für das Lehrpersonen-Konto (z. B. Jeopardy): für Kinder unsichtbar */
  const visMod = m => !m.lpOnly || isLP();
  const subjMods = id => H.modules.filter(m => m.subject === id && visMod(m));
  const subjStars = id => subjMods(id).reduce((a, m) => a + modStars(m), 0);
  const subjMax = id => subjMods(id).reduce((a, m) => a + H.maxStars(m), 0);
  const allStars = () => H.subjects.reduce((a, s) => a + subjStars(s.id), 0)
    + (S.me?.progress || []).filter(p => p.module_id === "test").reduce((a, p) => a + p.stars, 0);   // Test-Modus der Lehrperson
  const GD = window.GL_DATA || { LEVELS: [{ n: "Start", s: 0 }], BADGES: [], OUTFITS: [] };
  /* Level nach oben offen: ab Level 100 alle 30 Sterne ein weiteres Level */
  const lvEnsure = n => { const L = GD.LEVELS; while (L.length >= 100 && L.length < n) { const k = L.length - 99; L.push({ n: "gLiTCh-Legende +" + k, s: L[99].s + k * 30 }); } };
  const levelOf = st => { const L = GD.LEVELS; if (L.length >= 100 && st >= L[99].s) lvEnsure(100 + Math.floor((st - L[99].s) / 30) + 2); let i = 0; L.forEach((l, k) => { if (st >= l.s) i = k; }); return i; };
  const lpDoneMods = () => H.modules.filter(m => lpStat(m) === "fertig");
  const myBadges = () => new Set((S.me?.progress || []).flatMap(p => (p.data && Array.isArray(p.data.badges)) ? p.data.badges : []).concat(lpDoneMods().flatMap(labBadges)));
  const upBadges = mid => { const m = H.modules.find(x => x.id === mid), own = (S.me?.progress || []).filter(p => p.module_id === mid).flatMap(p => (p.data && Array.isArray(p.data.badges)) ? p.data.badges : []);
    return new Set(m && m.upload && lpStat(m) === "fertig" ? own.concat((m.meta.dips || []).map(d => d.id)) : own); };
  const myMax = k => Math.max(0, ...(S.me?.progress || []).map(p => +(p.data && p.data[k]) || 0));
  const outfitOf = () => (S.me?.extras && S.me.extras.outfit) || {};
  /* gLiTCh eines Kindes so, wie es ausgerüstet ist (eigenes Outfit live, andere aus der Klassenliste) */
  const outfitFor = id => (S.me && S.me.student.id === id) ? outfitOf() : ((S.cls && S.cls.students.find(x => x.id === id)) || {}).outfit || {};
  const kidG = (mood, k, cls = "") => `<span class="glitch kidg ${cls}" data-kg="${esc(k.id)}" style="--kc:${k.color || "#8B5CFF"}">${G.svg(mood, "#8B5CFF", { outfit: outfitFor(k.id), lp: !!k.is_teacher, calm: cls.includes("still") })}</span>`;
  /* Festes Lehrpersonen-Konto der Klasse: dort ist immer alles freigeschaltet */
  const isLP = () => !!(S.me && S.me.student && S.me.student.is_teacher);
  const lpName = k => k && k.is_teacher ? (CFG.TEACHER_NAME || "Lehrperson") : (k ? k.first_name : "");
  const nameFix = k => { if (k && k.is_teacher) k.first_name = CFG.TEACHER_NAME || "Lehrperson"; return k; };
  /* Freischaltung pro Klasse (Lehrpersonen-Bereich): offen, zu, kette (nach dem Modul davor) oder Standard */
  /* Freigabe-Codes: deiner (Einstellungen) und die der weiteren Lehrpersonen dieser Klasse */
  const mainCode = () => String(CFG.TEACHER_PIN || "4313");
  const coTeachers = st => ((st || {}).teachers || []).filter(t => t && t.code);
  const classCodes = () => [mainCode()].concat(coTeachers(S.me?.class_settings).map(t => String(t.code)));
  const newTeacherCode = taken => { let c; do { c = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 9)).join(""); } while (taken.includes(c)); return c; };
  const modSet = m => ((S.me?.class_settings || {}).mods || {})[m.id] || "";
  /* Reihenfolge pro Klasse (Lehrperson verschiebt Themen und Module) */
  const byOrder = (list, ord) => { if (!Array.isArray(ord) || !ord.length) return list; const ix = (x, k) => { const i = ord.indexOf(x.id); return i < 0 ? 1e4 + k : i; }; return list.map((x, k) => [x, ix(x, k)]).sort((a, b) => a[1] - b[1]).map(a => a[0]); };
  const sortThemes = (list, subj, st) => byOrder(list, (((st || {}).order || {}).themes || {})[subj]);
  const sortMods = (list, theme, st) => byOrder(list, (((st || {}).order || {}).mods || {})[theme]);
  const modPrev = m => { const list = sortMods(H.modules.filter(x => x.theme === m.theme && !x.soon), m.theme, S.me?.class_settings); const i = list.findIndex(x => x.id === m.id); return i > 0 ? list[i - 1] : null; };
  const modSolved = m0 => { const m = m0.alias ? (H.modules.find(x => x.id === m0.alias) || m0) : m0; const st = modStars(m), mx = H.maxStars(m); return H.openEnded(m) || !mx ? st > 0 : st >= Math.ceil(mx / 2); };
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

  /* ---------- Eingebaute Hintergründe fürs Zimmer: freigeschaltet durch abgeschlossene Themen und Module ---------- */
  const COL = (x, c) => `<rect x="${x}" y="10" width="7" height="2" fill="#F4EAD5"/><rect x="${x + 1}" y="12" width="5" height="42" fill="#EDE3CC"/><path d="M${x + 2} 12v42M${x + 4} 12v42" stroke="#CFC2A3" stroke-width=".5"/><rect x="${x}" y="54" width="7" height="2.5" fill="#F4EAD5"/>`;
  const BUILTIN_BGS = [
    { id: "bg_rom", n: "Römische Villa", ic: "🏛️", wand: ["#6E2318", "#B3503A"], boden: ["#E8E0CC", "#D3C7AC", "#B9AC8E"], reqTxt: "Thema «Die Römer» abschliessen",
      svg: COL(14, 0) + COL(139, 0) + `<path d="M58 54V30a22 22 0 0 1 44 0v24" fill="#3A140E" stroke="#F4EAD5" stroke-width="2"/><path d="M62 54V31a18 18 0 0 1 36 0v23" fill="#5E9BC8"/><circle cx="88" cy="24" r="4" fill="#FFE07A"/><path d="M62 46c8-4 14-2 18-6s10-3 18 2v12H62z" fill="#7BA35A"/><path d="M68 42v-6l2-2 2 2v6M84 40v-7l2-2 2 2v7" fill="#E8DCC0"/>`
        + `<g fill="none" stroke="#7FA34A" stroke-width="1.6" stroke-linecap="round"><path d="M30 8c6 4 12 5 18 4M130 8c-6 4-12 5-18 4"/></g>` + Array.from({ length: 6 }, (_, k) => `<ellipse cx="${32 + k * 3}" cy="${9 - (k % 2)}" rx="1.6" ry=".9" fill="#9BC062" transform="rotate(-20 ${32 + k * 3} 9)"/><ellipse cx="${128 - k * 3}" cy="${9 - (k % 2)}" rx="1.6" ry=".9" fill="#9BC062" transform="rotate(20 ${128 - k * 3} 9)"/>`).join("")
        + `<text x="80" y="8" font-size="5" font-weight="700" text-anchor="middle" fill="#F4D58A" font-family="Georgia,serif" letter-spacing="1">SPQR</text>`,
      done: () => { const L = H.modules.filter(m => m.theme === "nmg-roemer" && !m.soon && !m.lpOnly); return L.length > 0 && L.every(modSolved); } },
    { id: "bg_en", n: "London-Zimmer", ic: "💂", wand: ["#13204A", "#2C4291"], boden: ["#6B3F22", "#8A5530", "#5A321A"], reqTxt: "«How long does it take?» abschliessen",
      svg: `<rect x="96" y="12" width="44" height="34" rx="2" fill="#0B1430" stroke="#F4EAD5" stroke-width="2"/><path d="M96 29h44M118 12v34" stroke="#F4EAD5" stroke-width="1.4"/><circle cx="104" cy="18" r="1" fill="#fff"/><circle cx="132" cy="20" r=".8" fill="#fff"/>`
        + `<rect x="104" y="24" width="7" height="22" fill="#3A3A44"/><path d="M104 24l3.5-6 3.5 6z" fill="#3A3A44"/><circle cx="107.5" cy="28" r="2.4" fill="#FFE07A"/><rect x="122" y="34" width="14" height="12" fill="#2A2A33"/><rect x="124" y="30" width="3" height="16" fill="#2A2A33"/>`
        + `<g transform="translate(18 18)"><rect width="16" height="34" rx="2" fill="#D8221F"/><rect x="2" y="3" width="12" height="3" fill="#F4EAD5"/><text x="8" y="5.4" font-size="2.4" font-weight="800" text-anchor="middle" fill="#D8221F" font-family="sans-serif">TELEPHONE</text>`
        + `<g fill="#F9E6A8">${[0, 1, 2, 3, 4].map(r => `<rect x="3" y="${9 + r * 4.4}" width="4" height="3.4"/><rect x="9" y="${9 + r * 4.4}" width="4" height="3.4"/>`).join("")}</g></g>`
        + `<rect x="46" y="14" width="34" height="18" rx="2" fill="#F4EAD5"/><text x="63" y="22" font-size="6" font-weight="800" text-anchor="middle" fill="#13204A" font-family="sans-serif">Hello!</text><text x="63" y="28.5" font-size="3.4" text-anchor="middle" fill="#B3263A" font-family="sans-serif">How long does it take?</text>`
        + `<path d="M4 6c10 6 20 6 30 0s20 6 30 0 20 6 30 0 20 6 30 0 20 6 30 0" stroke="#F4EAD5" stroke-width=".6" fill="none"/>` + [10, 30, 50, 70, 90, 110, 130, 150].map((x, k) => `<path d="M${x - 3} ${7.5} l3 5 3-5z" fill="${["#D8221F", "#F4EAD5", "#2C4291"][k % 3]}"/>`).join(""),
      done: () => { const m = H.modules.find(x => x.id === "en-how-long"); return !!m && modSolved(m); } },
    { id: "bg_wueste", n: "Wüsten-Oase", ic: "🏜️", wand: ["#E86F2C", "#F7CB74"], boden: ["#E9C47C", "#D6A85A", "#BC8C40"], reqTxt: "Wüsten-Game: alle drei Level spielen",
      svg: `<circle cx="124" cy="18" r="9" fill="#FFF2B0" opacity=".95"/><circle cx="124" cy="18" r="13" fill="#FFF2B0" opacity=".25"/><path d="M0 50c20-10 40-12 62-4s40 6 58-2 30-6 40 0v20H0z" fill="#E2A957"/><path d="M0 56c24-6 44-4 66 0s46 2 64-4 20-2 30 2v14H0z" fill="#CF9445"/>`
        + `<g transform="translate(26 26)"><rect x="-1.5" y="0" width="3" height="28" rx="1.5" fill="#2E8B57"/><path d="M-1.5 12h-5v-7a2 2 0 0 1 3 0v4h2M1.5 9h5v-6a2 2 0 0 0-3 0v3h-2" fill="#2E8B57"/></g>`
        + `<g transform="translate(78 22)"><path d="M0 34c1-12 0-22-3-30" stroke="#7A4A22" stroke-width="2.4" fill="none"/><path d="M-3 4c-8-2-14 1-17 6 6-2 11-2 17-6zM-3 4c-2-7-8-10-14-9 5 3 9 5 14 9zM-3 4c4-7 10-8 16-6-6 1-11 3-16 6zM-3 4c7-1 13 3 15 8-6-3-10-4-15-8z" fill="#3AA35B"/><circle cx="-2" cy="7" r="1.6" fill="#7A4A22"/><circle cx="-5" cy="6" r="1.4" fill="#8B5A2B"/></g>`
        + `<ellipse cx="100" cy="58" rx="16" ry="3" fill="#4FB3E8"/><ellipse cx="100" cy="57.4" rx="12" ry="1.6" fill="#9EE3FF"/><path d="M60 12l3-1 2 1M70 9l3-1 2 1" stroke="#7A4A22" stroke-width=".8" fill="none"/>`,
      done: () => { const m = H.modules.find(x => x.id === "de-wueste"); return !!m && m.activities.every(x => actStars(m, x) > 0); } },
    { id: "bg_dschungel", n: "Dschungel-Hütte", ic: "🌴", wand: ["#0F5132", "#2BB57A"], boden: ["#7A5230", "#5E3E22", "#4F3420"], reqTxt: "Dschungel-Game: alle drei Level spielen",
      svg: `<path d="M0 0h160v8c-14 6-24 2-36 6s-22 0-34 5-24-1-36 4-30 0-54 3z" fill="#0B3D24"/>`
        + [10, 34, 62, 98, 126, 150].map((x, k) => `<path d="M${x} 6c${k % 2 ? 4 : -4} 10 ${k % 2 ? -3 : 3} 20 0 ${28 + (k % 3) * 6}" stroke="#3CC48A" stroke-width="1.6" fill="none"/><ellipse cx="${x + (k % 2 ? 2 : -2)}" cy="${30 + (k % 3) * 6}" rx="4" ry="2" fill="#5FDC9F"/>`).join("")
        + `<g transform="translate(118 14)"><rect x="0" y="0" width="30" height="26" rx="2" fill="#163F2A" stroke="#7A5230" stroke-width="2"/><path d="M15 0v26M0 13h30" stroke="#7A5230" stroke-width="1.4"/><circle cx="23" cy="7" r="3" fill="#FFE07A" opacity=".8"/></g>`
        + `<g transform="translate(70 18)"><rect x="0" y="6" width="8" height="10" fill="#E53935"/><rect x="0" y="3" width="6" height="4" fill="#E53935"/><rect x="6" y="4" width="3" height="2" fill="#FFC21A"/><rect x="1" y="4" width="2" height="1.6" fill="#fff"/><rect x="-2" y="10" width="3" height="6" fill="#2E6BE6"/><rect x="2" y="16" width="3" height="7" fill="#FFC21A"/><path d="M-6 6h24" stroke="#7A5230" stroke-width="1.6"/></g>`
        + `<path d="M0 58c10-8 22-8 30-2s14-6 24-4M120 60c8-10 22-12 40-6" stroke="#1F9D68" stroke-width="5" fill="none" stroke-linecap="round"/>`
        + `<g fill="#FFE680">${[[20, 40], [48, 30], [96, 46], [104, 22], [140, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9"/>`).join("")}</g>`,
      done: () => gameAll("de-dschungel") },
    { id: "bg_tundra", n: "Polar-Iglu", ic: "🐻‍❄️", wand: ["#0B1D3A", "#2C4A86"], boden: ["#E8F1FA", "#D3E3F2", "#B9CFE6"], reqTxt: "Tundra-Game: alle drei Level spielen",
      svg: `<path d="M0 14c30-10 60 6 90-2s50-8 70-2" stroke="#3CFF7A" stroke-width="4" fill="none" opacity=".55"/><path d="M0 22c34-8 64 6 96-2s46-6 64 0" stroke="#00E5FF" stroke-width="3" fill="none" opacity=".45"/><path d="M10 6c30-6 60 4 90-2" stroke="#B79CFF" stroke-width="2" fill="none" opacity=".5"/>`
        + `<g fill="#fff">${[[8, 30], [24, 8], [44, 34], [70, 6], [112, 30], [134, 10], [150, 34], [86, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8"/>`).join("")}</g>`
        + `<path d="M0 60l18-14 14 8 22-18 20 16 18-10 22 12 18-8 28 14z" fill="#DDEBF7"/><path d="M54 36l-6 8 6-2 4 4 2-6z" fill="#fff"/>`
        + `<g transform="translate(106 38)"><path d="M0 22a16 16 0 0 1 32 0z" fill="#F4F9FF" stroke="#B9CFE6" stroke-width="1"/><path d="M4 16h24M2 20h28M10 8l2 6M20 8l-2 6M16 6v8" stroke="#B9CFE6" stroke-width=".7"/><path d="M11 22a5 5 0 0 1 10 0z" fill="#2C4A86"/></g>`
        + `<g transform="translate(24 44)"><rect x="0" y="4" width="14" height="9" rx="3" fill="#fff"/><circle cx="3" cy="4" r="2" fill="#fff"/><circle cx="11" cy="4" r="2" fill="#fff"/><circle cx="5" cy="8" r=".9" fill="#14062E"/><circle cx="9" cy="8" r=".9" fill="#14062E"/><rect x="6" y="10" width="2" height="1" fill="#14062E"/></g>`,
      done: () => gameAll("de-tundra") },
    { id: "bg_lava", n: "Vulkan-Labor", ic: "🌋", wand: ["#2A0A12", "#6E1A12"], boden: ["#3A2A26", "#2A1C18", "#1C1210"], reqTxt: "Lava-Game spielen",
      svg: `<circle cx="80" cy="22" r="22" fill="#FF6A00" opacity=".18"/><path d="M36 60L68 22h24l32 38z" fill="#5A2A1E" stroke="#8A3A1A" stroke-width="1.2"/><path d="M50 60l22-26h4l-8 26zM110 60L90 34h-4l10 26z" fill="#3A1A12"/>`
        + `<path d="M68 22h24l-4 5H72z" fill="#FFC21A"/><path d="M73 26c-3 8 2 12-2 20s3 9 1 14" stroke="#FF6A00" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M86 26c3 7-2 12 2 18" stroke="#FF8A1F" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
        + `<circle cx="72" cy="12" r="2.4" fill="#FFC21A"/><circle cx="84" cy="8" r="2" fill="#FF6A00"/><circle cx="92" cy="14" r="1.6" fill="#FFC21A"/><circle cx="78" cy="4" r="1.4" fill="#FF8A1F"/>`
        + `<g transform="translate(16 18)"><rect x="0" y="0" width="22" height="26" rx="2" fill="#1C0A0E" stroke="#8A3A1A" stroke-width="1.6"/><path d="M4 20l4-8 4 5 3-6 4 9" stroke="#FFC21A" stroke-width="1.2" fill="none"/><text x="11" y="7" font-size="4" font-weight="800" text-anchor="middle" fill="#FF8A1F" font-family="sans-serif">°C</text></g>`
        + `<g transform="translate(130 22)"><path d="M6 0l6 8-6 14-6-14z" fill="#9EE3FF"/><path d="M6 0v22M0 8h12" stroke="#fff" stroke-width=".7" opacity=".8"/><circle cx="6" cy="10" r="10" fill="#9EE3FF" opacity=".15"/></g>`
        + `<path d="M0 56c20-4 30 2 44 0M116 58c14-4 28 0 44-2" stroke="#FF6A00" stroke-width="2" fill="none"/>`,
      done: () => gameAll("de-lava") }
  ];

  /* ---------- Zusätzliche Zimmer-Gegenstände für Module, die bisher wenig gaben (Zimmer 160 × 100) ---------- */
  const BUILTIN_ROOM = [
    { id: "hr_amphore", slot: "deko", n: "Römische Amphore", box: [96, 56, 24, 36], badge: "hub:nmg-tombola-romana", reqTxt: "«Tombola Romana» spielen",
      svg: `<rect x="103" y="58" width="10" height="3" fill="#8A3E14"/><path d="M104 61h8v3c4 3 6 8 6 13 0 7-4 13-10 13s-10-6-10-13c0-5 2-10 6-13z" fill="#C2652A"/><path d="M104 65c-4 0-5 4-3 7M112 65c4 0 5 4 3 7" stroke="#8A3E14" stroke-width="1.4" fill="none"/><rect x="99" y="73" width="18" height="3.4" fill="#1A1210"/><path d="M101 74.7h2M105 74.7h2M109 74.7h2M113 74.7h2" stroke="#F4D58A" stroke-width=".8"/><path d="M103 82c3 2 7 2 10 0" stroke="#F4D58A" stroke-width=".7" fill="none"/>` },
    { id: "hr_bueste", slot: "rechts", n: "Marmor-Büste", box: [116, 38, 42, 54], badge: "hub:nmg-statuen-pose", reqTxt: "«Römische Statuen – Pose-Blitz» spielen",
      svg: `<rect x="124" y="66" width="26" height="23" fill="#E8E0CC"/><rect x="122" y="63" width="30" height="3.4" fill="#D3C7AC"/><rect x="122" y="88" width="30" height="3.4" fill="#B9AC8E"/><path d="M128 66v22M146 66v22" stroke="#CFC2A3" stroke-width=".6"/><path d="M126 63c0-6 4-9 11-9s11 3 11 9z" fill="#F4F0E6"/><rect x="134" y="52" width="6" height="4" fill="#ECE6D8"/><ellipse cx="137" cy="46" rx="6.5" ry="8" fill="#F4F0E6"/><path d="M131 44c1-6 11-6 12 0" stroke="#7FA34A" stroke-width="1.6" fill="none"/><g class="rm-twinkle"><circle cx="131" cy="43" r="1" fill="#9BC062"/><circle cx="143" cy="43" r="1" fill="#9BC062"/></g><circle cx="135" cy="46" r=".7" fill="#9A8F78"/><circle cx="139.4" cy="46" r=".7" fill="#9A8F78"/><path d="M135.6 50.5h3" stroke="#9A8F78" stroke-width=".6"/>` },
    { id: "hr_festmahl", slot: "links", n: "Römisches Festmahl", box: [2, 58, 46, 34], badge: "hub:nmg-essen-tierlist", reqTxt: "«Römisches Essen – Tier-List» spielen",
      svg: `<rect x="5" y="77" width="40" height="3.4" fill="#8B5A2B"/><rect x="8" y="80" width="3" height="11" fill="#5D3A1A"/><rect x="39" y="80" width="3" height="11" fill="#5D3A1A"/><path d="M10 77c0-5 5-7 9-7s9 2 9 7z" fill="#C9A227"/><path d="M10 77h18" stroke="#8A6A10" stroke-width=".8"/>`
        + [[14, 69], [17, 67], [20, 68], [23, 66.5], [16, 64.5], [19, 63.5], [22, 63.8], [18, 61]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="#7A3E9D"/>`).join("") + `<path d="M19 59l1-3" stroke="#3C7A2A" stroke-width=".8"/><ellipse cx="36" cy="75" rx="6" ry="2.6" fill="#D9A066"/><path d="M32 74l2 1M36 73.4l2 1" stroke="#A8743A" stroke-width=".6"/><rect x="40" y="69" width="3" height="8" fill="#C9A227"/><g class="rm-steam"><path d="M41.5 67c-1-2 1-3 0-5" stroke="#fff" stroke-width=".5" fill="none" opacity=".7"/></g>` },
    { id: "hr_mosaik", slot: "teppich", n: "Römischer Mosaik-Boden", box: [46, 82, 68, 14], badge: "hb:bg_rom", reqTxt: "Thema «Die Römer» abschliessen",
      svg: `<rect x="50" y="84" width="60" height="11" fill="#E8E0CC"/>` + Array.from({ length: 15 }, (_, i) => `<rect x="${50 + i * 4}" y="84" width="2" height="2" fill="${i % 2 ? "#1A1210" : "#B3503A"}"/><rect x="${52 + i * 4}" y="93" width="2" height="2" fill="${i % 2 ? "#B3503A" : "#1A1210"}"/>`).join("")
        + `<path d="M74 89.5h12M80 86.5v6" stroke="#B3503A" stroke-width="1.6"/><rect x="77.5" y="87.5" width="5" height="4" fill="#3F7FB8"/><circle cx="62" cy="89.5" r="1.6" fill="#C9A227"/><circle cx="98" cy="89.5" r="1.6" fill="#C9A227"/>` },
    { id: "hr_bigben", slot: "wand", n: "Big-Ben-Uhr", box: [6, 18, 28, 38], badge: "hub:en-how-long", reqTxt: "«How long does it take?» spielen",
      svg: `<path d="M20 18l-5 8h10z" fill="#3A3A44"/><rect x="13" y="26" width="14" height="28" fill="#C9A86A"/><rect x="13" y="26" width="14" height="2" fill="#8A6A3A"/><circle cx="20" cy="35" r="5.4" fill="#F4EAD5" stroke="#3A3A44" stroke-width="1"/><g class="rm-pend" style="transform-origin:20px 35px"><path d="M20 35V31.4" stroke="#13204A" stroke-width=".9"/></g><path d="M20 35h2.6" stroke="#13204A" stroke-width=".9"/><path d="M15 44h10M15 48h10" stroke="#8A6A3A" stroke-width=".6"/><rect x="17" y="49" width="6" height="5" fill="#5A4A2A"/>` },
    { id: "hr_turm", slot: "deko", n: "Prompt-Baustein-Turm", box: [96, 56, 24, 36], badge: "erfinder", reqTxt: "Diplom «Erfinder» (Prompt-Labor 1)",
      svg: [["#3CC48A", 60], ["#6592F7", 68], ["#F06C6C", 76], ["#F2BE2E", 84]].map(([c, y], k) => `<g class="rm-bob" style="animation-delay:${k * .2}s"><rect x="${99 + (k % 2) * 2}" y="${y}" width="16" height="7" fill="${c}"/><rect x="${101 + (k % 2) * 2}" y="${y - 2}" width="4" height="2" fill="${c}"/><rect x="${109 + (k % 2) * 2}" y="${y - 2}" width="4" height="2" fill="${c}"/></g>`).join("") + `<rect x="98" y="91" width="20" height="1.6" fill="#4A23A0"/>` },
    { id: "hr_spots", slot: "decke", n: "Bühnen-Scheinwerfer", box: [40, 0, 80, 22], badge: "buehne", reqTxt: "Diplom «Bühnen-Profi» (Prompt-Labor 1)",
      svg: `<rect x="44" y="1" width="72" height="2" fill="#2A2A33"/>` + [[56, "#FF2BD6"], [80, "#FFC21A"], [104, "#00E5FF"]].map(([x, c], k) => `<path d="M${x} 3v3" stroke="#2A2A33" stroke-width="1"/><rect x="${x - 4}" y="6" width="8" height="6" rx="1" fill="#3A3A44"/><g class="rm-glowpulse" style="animation-delay:${k * .5}s"><path d="M${x - 3} 12l-8 10h22l-8-10z" fill="${c}" opacity=".35"/><rect x="${x - 3}" y="11" width="6" height="1.6" fill="${c}"/></g>`).join("") },
    { id: "hr_testmonitor", slot: "rechts", n: "Test-Monitor", box: [116, 46, 42, 46], badge: "tester", reqTxt: "Diplom «Tester» (Prompt-Labor 2)",
      svg: `<rect x="120" y="50" width="34" height="24" rx="2" fill="#2A2A33"/><rect x="122.5" y="52.5" width="29" height="19" fill="#0B1430"/><g class="rm-code"><path d="M125 56h3M125 60h3M125 64h3" stroke="#3CFF7A" stroke-width="1.2"/><path d="M130 56h14M130 60h10M130 64h16" stroke="#7FB2FF" stroke-width="1"/></g><path d="M125 67.5l1.4 1.4 2.6-3" stroke="#3CFF7A" stroke-width="1" fill="none"/><rect x="134" y="74" width="6" height="8" fill="#3A3A44"/><rect x="128" y="82" width="18" height="2.4" fill="#3A3A44"/><rect x="122" y="84" width="30" height="8" fill="#8B5A2B"/><g class="rm-bob"><circle cx="150" cy="80" r="2.4" fill="#E53935"/><path d="M148.6 78.4l-1.4-1.4M151.4 78.4l1.4-1.4" stroke="#111" stroke-width=".5"/></g>` },
    { id: "hr_zeitung", slot: "deko", n: "Zeitungsstapel mit Lupe", box: [94, 66, 26, 26], badge: "fn_bild", reqTxt: "Diplom «Bild-Detektiv» (Fake-News-Detektiv)",
      svg: [0, 1, 2].map(k => `<rect x="${97 + k}" y="${86 - k * 4}" width="20" height="4" fill="${k % 2 ? "#E8E8E8" : "#F7F7F7"}" stroke="#B0BEC5" stroke-width=".4"/>`).join("") + `<path d="M100 79h12M100 81h8" stroke="#78909C" stroke-width=".7"/><rect x="99" y="74.6" width="7" height="3" fill="#14062E"/><g class="rm-bob"><circle cx="111" cy="71" r="4.2" fill="rgba(189,244,255,.45)" stroke="#5D4037" stroke-width="1.4"/><path d="M114 74l4 4" stroke="#5D4037" stroke-width="1.8"/></g>` },
    { id: "hr_pinnwand", slot: "wand", n: "Detektiv-Pinnwand", box: [4, 20, 32, 34], badge: "fn_alle", reqTxt: "Diplom «Fall-Meister» (Fake-News-Detektiv)",
      svg: `<rect x="5" y="22" width="30" height="28" fill="#5D3A1A"/><rect x="7" y="24" width="26" height="24" fill="#C9A06A"/><rect x="9" y="26" width="7" height="6" fill="#F7F7F7"/><rect x="23" y="27" width="8" height="6" fill="#BFE3F2"/><rect x="11" y="38" width="8" height="7" fill="#F7F7F7"/><rect x="24" y="39" width="7" height="6" fill="#FFE680"/><path d="M12.5 29L27 30M27 30L15 41.5M15 41.5L27.5 42" stroke="#D52B1E" stroke-width=".6" fill="none"/><g class="rm-pin">${[[12.5, 26.6], [27, 27.6], [15, 38.6], [27.5, 39.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#D52B1E"/>`).join("")}</g><text x="12.5" y="44" font-size="3.2" font-weight="800" fill="#D52B1E" font-family="sans-serif">?</text>` },
    { id: "hr_staffelei", slot: "links", n: "Pixel-Staffelei", box: [2, 40, 44, 52], badge: "ki_theorie", reqTxt: "Diplom «Bild-Kenner» (KI-Bild oder echt?)",
      svg: `<path d="M12 90l8-46M34 90l-8-46M23 44v46" stroke="#8B5A2B" stroke-width="1.8"/><rect x="9" y="48" width="28" height="24" fill="#F7F1E3" stroke="#5D3A1A" stroke-width="1"/><rect x="11" y="50" width="12" height="20" fill="#8FD0F5"/><path d="M11 64c3-3 6-3 12 0v6H11z" fill="#3CC48A"/><circle cx="19" cy="54" r="2" fill="#FFE07A"/>`
        + `<g class="rm-rgb">${Array.from({ length: 12 }, (_, i) => `<rect x="${23 + (i % 3) * 4.6}" y="${50 + Math.floor(i / 3) * 5}" width="4.6" height="5" fill="${["#FF2BD6", "#00E5FF", "#8B5CFF", "#3CFF7A"][(i * 7) % 4]}"/>`).join("")}</g><rect x="8" y="72" width="30" height="2" fill="#5D3A1A"/>` },
    { id: "hr_kiplakat", slot: "wand", n: "KI-Check-Plakat", box: [4, 20, 32, 36], badge: "ki_plakat", reqTxt: "Diplom «Plakat-Profi» (KI-Bild oder echt?)",
      svg: `<rect x="6" y="22" width="28" height="32" fill="#0B3E5A"/><rect x="8" y="24" width="24" height="7" fill="#00B3C7"/><text x="20" y="29.4" font-size="4.2" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">KI-CHECK</text>`
        + [34, 40, 46].map((y, k) => `<rect x="9" y="${y}" width="4" height="4" fill="#fff"/><path d="M9.6 ${y + 2}l1.2 1.2 1.8-2.4" stroke="#1F9D68" stroke-width=".8" fill="none"/><rect x="15" y="${y + 1}" width="${14 - k * 2}" height="1.6" fill="#BFE3F2"/>`).join("") + `<g class="rm-twinkle"><rect x="29" y="49" width="2" height="2" fill="#FFE680"/></g>` },
    { id: "hr_matte", slot: "teppich", n: "Hoi-Fussmatte", box: [46, 82, 68, 14], badge: "hub:mi-start", reqTxt: "«Hallo gLiTCh!» spielen",
      svg: `<rect x="58" y="84" width="44" height="11" rx="2" fill="#8B5CFF"/><rect x="60" y="85.6" width="40" height="7.8" rx="1.4" fill="none" stroke="#B79CFF" stroke-width=".8"/><text x="74" y="91.6" font-size="5.4" font-weight="900" text-anchor="middle" fill="#fff" font-family="monospace">HOI!</text><rect x="86" y="86.6" width="9" height="6" fill="#B79CFF"/><rect x="87.6" y="88" width="1.8" height="1.8" fill="#14062E"/><rect x="91.6" y="88" width="1.8" height="1.8" fill="#14062E"/><rect x="88.4" y="91" width="4" height=".8" fill="#14062E"/>` },
    { id: "hr_kaktus", slot: "deko", n: "Wüsten-Kaktus", box: [96, 56, 24, 36], badge: "hd:wueste:quelle", reqTxt: "Diplom «Quellen-Finder» (Wüsten-Game)",
      svg: `<path d="M101 80h14l-2 11h-10z" fill="#C2652A"/><rect x="100" y="78" width="16" height="3" fill="#A0501E"/><g class="rm-sway" style="transform-origin:108px 78px"><rect x="105.5" y="58" width="5" height="20" rx="2.4" fill="#2E8B57"/><path d="M105.5 68h-3v-6a1.6 1.6 0 0 1 3 0M110.5 65h3v-5a1.6 1.6 0 0 0-3 0" fill="#2E8B57"/><circle cx="108" cy="57.6" r="1.6" fill="#FF6FAE"/></g>` },
    { id: "hr_monstera", slot: "rechts", n: "Dschungel-Monstera", box: [116, 34, 42, 58], badge: "hd:dschungel:frucht", reqTxt: "Diplom «Heilfrucht-Sammler» (Dschungel-Game)",
      svg: `<path d="M126 78h22l-3 13h-16z" fill="#7A5230"/><rect x="125" y="76" width="24" height="3" fill="#5E3E22"/><g class="rm-sway" style="transform-origin:137px 76px">`
        + [[-1, 128, 52], [1, 146, 50], [-1, 132, 40], [1, 142, 38], [0, 137, 46]].map(([d, x, y]) => `<path d="M137 76C${137 + d * 2} 66 ${x} ${y + 8} ${x} ${y}" stroke="#2E8B57" stroke-width="1.2" fill="none"/><ellipse cx="${x}" cy="${y}" rx="7" ry="5" fill="#2BB57A"/><path d="M${x - 5} ${y}h10M${x - 2} ${y - 3}l2 3 2-3" stroke="#0F5132" stroke-width=".6" fill="none"/>`).join("") + `</g>` },
    { id: "hr_schneekugel", slot: "deko", n: "Tundra-Schneekugel", box: [96, 62, 24, 30], badge: "hd:tundra:nacht", reqTxt: "Diplom «Polarnacht-Profi» (Tundra-Game)",
      svg: `<path d="M100 84h16l-2 7h-12z" fill="#2C4A86"/><circle cx="108" cy="75" r="10" fill="rgba(200,230,255,.35)" stroke="#BFE3F2" stroke-width="1"/><path d="M100 80c3-3 13-3 16 0" fill="#fff"/><rect x="105" y="74" width="6" height="5" fill="#fff"/><rect x="105.6" y="72" width="1.6" height="2" fill="#fff"/><rect x="108.8" y="72" width="1.6" height="2" fill="#fff"/><circle cx="107" cy="76" r=".5" fill="#14062E"/><circle cx="109.2" cy="76" r=".5" fill="#14062E"/>`
        + `<g class="rm-twinkle">${[[103, 70], [112, 68], [106, 67], [113, 74], [102, 75]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".7" fill="#fff"/>`).join("")}</g>` },
    { id: "hr_lavalampe", slot: "deko", n: "Lavalampe", box: [96, 56, 24, 36], badge: "hd:lava:forscher", reqTxt: "Diplom «Vulkan-Forscher» (Lava-Game)",
      svg: `<path d="M103 88h10l2 4h-14z" fill="#3A3A44"/><path d="M104 62h8l3 26h-14z" fill="#4A1020"/><path d="M105 62h6l-1-4h-4z" fill="#3A3A44"/><g class="rm-bob"><ellipse cx="107" cy="80" rx="3" ry="3.6" fill="#FF6A00"/></g><g class="rm-bob" style="animation-delay:1s"><ellipse cx="109.6" cy="70" rx="2.2" ry="2.8" fill="#FFC21A"/></g><g class="rm-bob" style="animation-delay:.5s"><ellipse cx="106" cy="66" rx="1.4" ry="1.8" fill="#FF8A1F"/></g><ellipse cx="108" cy="78" rx="12" ry="14" fill="#FF6A00" opacity=".08"/>` }
  ];
  /* ---------- Belohnungen der Abenteuer-Games (Deutsch · Gespräche führen): Diplome, Emote, Skin ----------
     Sterne pro Level = Tankstand / 10 (höchstens 10). Diplome: Level mit 6+ Sternen, Meister = alle Level voll. */
  const GAME_REW = [
    { mod: "de-wueste", emoji: "🏜️", skin: { n: "Sandsturm", base: "#E0A84A" },
      dips: [{ id: "quelle", n: "Quellen-Finder", emoji: "💧", wand: "medaille", lv: 1, min: 6 }, { id: "karawane", n: "Karawanen-Führer", emoji: "🐪", wand: "wimpel", lv: 2, min: 6 },
        { id: "fata", n: "Fata-Morgana-Entlarver", emoji: "🏝️", wand: "schild", lv: 3, min: 6 }, { id: "meister", n: "Wüsten-Meister", emoji: "🏜️", wand: "pokal", all: 10 }] },
    { mod: "de-dschungel", emoji: "🌴", skin: { n: "Dschungel", base: "#2FA866" }, emote: { n: "Lianen-Schwung", d: "gLiTCh schwingt sich wie ein Affe an einer Liane durchs Bild. Uh-uh-ah-ah!", ic: "🐒", text: "Uh-uh-ah-ah!", anim: "wackeln", farben: ["#2FA866", "#FFC21A"] },
      dips: [{ id: "frucht", n: "Heilfrucht-Sammler", emoji: "🍈", wand: "holz", lv: 1, min: 6 }, { id: "fluss", n: "Krokodil-Überquerer", emoji: "🐊", wand: "wimpel", lv: 2, min: 6 },
        { id: "tempel", n: "Tempel-Entdecker", emoji: "🛕", wand: "rolle", lv: 3, min: 6 }, { id: "meister", n: "Dschungel-Meister", emoji: "🌴", wand: "pokal", all: 10 }] },
    { mod: "de-tundra", emoji: "❄️", skin: { n: "Eiszapfen", base: "#7FC8F8" }, emote: { n: "Schneegestöber", d: "Ein Schneesturm wirbelt los und gLiTCh bibbert: Brrr!", ic: "❄️", text: "Brrr!", anim: "regen", farben: ["#9FD8FF", "#FFFFFF"] },
      dips: [{ id: "nacht", n: "Polarnacht-Profi", emoji: "🌙", wand: "rahmen", lv: 1, min: 6 }, { id: "sturm", n: "Schneesturm-Bezwinger", emoji: "🌨️", wand: "schild", lv: 2, min: 6 },
        { id: "nordlicht", n: "Nordlicht-Debattierer", emoji: "🌌", wand: "stern", lv: 3, min: 6 }, { id: "meister", n: "Tundra-Meister", emoji: "🐻‍❄️", wand: "pokal", all: 10 }] },
    { mod: "de-lava", emoji: "🌋", skin: { n: "Vulkanglut", base: "#E2471B" }, emote: { n: "Vulkanausbruch", d: "Der Vulkan bricht aus und gLiTCh jubelt mitten im Funkenregen. BOOM!", ic: "🌋", text: "BOOM!", anim: "jubeln", farben: ["#FF6A00", "#FFC21A"] },
      dips: [{ id: "forscher", n: "Vulkan-Forscher", emoji: "🌋", wand: "medaille", lv: 1, min: 4 }, { id: "baendiger", n: "Lava-Bändiger", emoji: "🔥", wand: "schild", lv: 1, min: 7 },
        { id: "held", n: "Eiskristall-Held", emoji: "💎", wand: "pokal", lv: 1, min: 10 }] }
  ];
  const gameMod = id => H.modules.find(x => x.id === id);
  const rawSt = (m, x) => { const st = progOf(m.id, x.id)?.stars || 0; return lpStat(m) === "fertig" ? fullAct(x, st) : st; };
  const gameAll = id => { const m = gameMod(id); return !!m && m.activities.every(x => rawSt(m, x) > 0); };
  const gameLv = (m, n) => { const x = m.activities[n - 1]; return x ? rawSt(m, x) : 0; };
  const gameSum = m => m.activities.reduce((a, x) => a + rawSt(m, x), 0), gameMax = m => m.activities.reduce((a, x) => a + (x.maxStars || 0), 0);
  const dipOk = (m, d) => d.all ? m.activities.every(x => rawSt(m, x) >= d.all) : gameLv(m, d.lv) >= d.min;
  const dipTxt = (m, d) => d.all ? `«${m.title}»: in allen Levels den Tank ganz füllen`
    : `«${m.title}»: ${m.activities.length > 1 ? `in Level ${d.lv} ` : ""}${d.min} Sterne holen (Tank ${d.min >= 10 ? "ganz" : `zu ${d.min * 10} %`} voll)`;
  /* ---------- Zimmer-Gegenstände der Abenteuer-Games (Dschungel, Tundra, Lava): nach Sternen freigeschaltet ----------
     need: {sum: n} = insgesamt n Sterne im Game · {lv, min} = in Level lv mindestens min Sterne · {all: 10} = alle Tanks voll */
  const BULBS = (cols, cls) => `<path d="M0 2 Q20 7 40 2 T80 2 T120 2 T160 2" stroke="#2A1C18" stroke-width=".7" fill="none"/><g class="${cls}">${Array.from({ length: 16 }, (_, i) => { const x = 5 + i * 10, y = 2 + 4.2 * Math.abs(Math.sin((x / 40) * Math.PI)); return `<circle cx="${x}" cy="${y + 1.6}" r="1.6" fill="${cols[i % cols.length]}"/>`; }).join("")}</g>`;
  const GAME_ROOM = [
    /* Dschungel */
    { mod: "de-dschungel", id: "gr_lianen", slot: "decke", n: "Lianen-Vorhang", box: [0, 0, 160, 24], need: { sum: 3 },
      svg: [6, 22, 40, 120, 138, 154].map((x, k) => `<g class="rm-sway" style="transform-origin:${x}px 0px;animation-delay:${k * .3}s"><path d="M${x} 0c${k % 2 ? 3 : -3} 6 ${k % 2 ? -3 : 3} 12 0 ${14 + (k % 3) * 4}" stroke="#2E8B57" stroke-width="1.4" fill="none"/>${[5, 10, 15].map(y => `<ellipse cx="${x + (y % 10 ? 2 : -2)}" cy="${y + (k % 3)}" rx="2.4" ry="1.2" fill="#3CC48A"/>`).join("")}</g>`).join("") },
    { mod: "de-dschungel", id: "gr_papagei", slot: "rechts", n: "Papagei auf der Stange", box: [118, 36, 40, 56], need: { lv: 1, min: 3 },
      svg: `<rect x="137" y="52" width="2" height="38" fill="#7A5230"/><rect x="130" y="89" width="16" height="3" fill="#5E3E22"/><rect x="128" y="51" width="20" height="2" fill="#7A5230"/><g class="rm-bob"><rect x="131" y="40" width="8" height="11" rx="3" fill="#E53935"/><rect x="133" y="37" width="6" height="5" rx="2" fill="#E53935"/><path d="M139 39l3 1.4-3 1.2z" fill="#FFC21A"/><circle cx="136.6" cy="39.4" r=".8" fill="#fff"/><circle cx="136.8" cy="39.4" r=".4" fill="#111"/><rect x="130" y="44" width="4" height="6" fill="#2E6BE6"/><path d="M133 51l-1 6h3z" fill="#FFC21A"/></g>` },
    { mod: "de-dschungel", id: "gr_bananen", slot: "links", n: "Bananenstaude", box: [2, 34, 46, 58], need: { sum: 9 },
      svg: `<path d="M14 80h18l-2 11H16z" fill="#7A5230"/><rect x="21" y="52" width="4" height="28" fill="#6B8E3A"/><g class="rm-sway" style="transform-origin:23px 52px"><path d="M23 52c-8-6-16-4-20 2 8-1 14 0 20-2zM23 52c6-8 15-8 20-3-8 0-14 1-20 3zM23 52c-4-8-2-14 2-16 0 6-1 11-2 16z" fill="#3CC48A"/></g>${[0, 1, 2, 3].map(i => `<path d="M${26 + i * 2} 59c1 4 3 6 5 6" stroke="#FFD43B" stroke-width="2" fill="none" stroke-linecap="round"/>`).join("")}` },
    { mod: "de-dschungel", id: "gr_kroko", slot: "teppich", n: "Krokodil-Teppich", box: [46, 82, 68, 14], need: { lv: 2, min: 6 },
      svg: `<ellipse cx="78" cy="90" rx="24" ry="4.5" fill="#3C8A3A"/><path d="M100 88l12 1.4-12 2.8z" fill="#3C8A3A"/><path d="M56 90l-8-2v4z" fill="#3C8A3A"/><g fill="#2A6A2A">${[62, 68, 74, 80, 86, 92].map(x => `<path d="M${x} 86l2-2 2 2z"/>`).join("")}</g><circle cx="102" cy="87.6" r="1" fill="#fff"/><circle cx="102.2" cy="87.6" r=".5" fill="#111"/><path d="M104 91h6" stroke="#fff" stroke-width=".5" stroke-dasharray="1 1"/>` },
    { mod: "de-dschungel", id: "gr_maske", slot: "wand", n: "Tempel-Maske", box: [4, 20, 32, 34], need: { lv: 3, min: 6 },
      svg: `<rect x="8" y="22" width="24" height="30" rx="3" fill="#8A7A4A"/><rect x="10" y="24" width="20" height="26" rx="2" fill="#C9A227"/><path d="M10 26h20" stroke="#E8C547" stroke-width="1"/><rect x="13" y="30" width="5" height="4" fill="#14062E"/><rect x="22" y="30" width="5" height="4" fill="#14062E"/><g class="rm-twinkle"><rect x="14.5" y="31" width="2" height="2" fill="#3CFF7A"/><rect x="23.5" y="31" width="2" height="2" fill="#3CFF7A"/></g><rect x="18" y="35" width="4" height="6" fill="#A8861A"/><rect x="14" y="43" width="12" height="3" fill="#14062E"/><path d="M15 43v3M18 43v3M21 43v3M24 43v3" stroke="#C9A227" stroke-width=".7"/>` },
    { mod: "de-dschungel", id: "gr_goldfrucht", slot: "deko", n: "Goldfrucht auf dem Sockel", box: [96, 56, 24, 36], need: { lv: 3, min: 9 },
      svg: `<rect x="100" y="78" width="16" height="12" fill="#8A7A4A"/><rect x="98" y="76" width="20" height="3" fill="#A8986A"/><rect x="98" y="89" width="20" height="3" fill="#6A5A3A"/><circle cx="108" cy="68" r="9" fill="#FFC21A" opacity=".18"/><g class="rm-bob"><ellipse cx="108" cy="69" rx="5" ry="6" fill="#FFC21A"/><path d="M108 63c0-2 1-3 3-3" stroke="#2E8B57" stroke-width="1" fill="none"/><ellipse cx="106.4" cy="67" rx="1.2" ry="2" fill="#FFF3B0"/></g>` },
    { mod: "de-dschungel", id: "gr_haengematte", slot: "links", n: "Hängematte", box: [2, 40, 46, 52], need: { all: 10 },
      svg: `<rect x="4" y="50" width="3" height="42" fill="#7A5230"/><rect x="41" y="50" width="3" height="42" fill="#7A5230"/><g class="rm-sway" style="transform-origin:24px 56px"><path d="M7 56c6 16 28 16 34 0c-6 10-28 10-34 0z" fill="#E8590C"/><path d="M10 61c6 7 22 7 28 0" stroke="#FFC21A" stroke-width="1.2" fill="none"/><path d="M12 64c5 5 19 5 24 0" stroke="#2BB57A" stroke-width="1.2" fill="none"/></g>` },
    /* Tundra */
    { mod: "de-tundra", id: "gr_polarkette", slot: "decke", n: "Polarlicht-Lichterkette", box: [0, 0, 160, 12], need: { sum: 3 }, svg: BULBS(["#3CFF7A", "#00E5FF", "#B79CFF"], "rm-bulbs") },
    { mod: "de-tundra", id: "gr_iglulicht", slot: "deko", n: "Iglu-Nachtlicht", box: [96, 66, 24, 26], need: { lv: 1, min: 3 },
      svg: `<path d="M98 90a10 10 0 0 1 20 0z" fill="#F4F9FF" stroke="#B9CFE6" stroke-width=".8"/><path d="M100 85h16M99 88h18M104 80l1 5M112 80l-1 5M108 79v6" stroke="#B9CFE6" stroke-width=".5"/><g class="rm-glowpulse"><path d="M105 90a3 3 0 0 1 6 0z" fill="#FFE07A"/><circle cx="108" cy="86" r="8" fill="#FFE07A" opacity=".12"/></g>` },
    { mod: "de-tundra", id: "gr_schlitten", slot: "links", n: "Holzschlitten", box: [2, 64, 46, 28], need: { sum: 9 },
      svg: `<path d="M6 88h34c3 0 4-3 2-4" stroke="#8A5530" stroke-width="1.6" fill="none"/><rect x="10" y="80" width="2" height="8" fill="#8A5530"/><rect x="34" y="80" width="2" height="8" fill="#8A5530"/><rect x="8" y="77" width="32" height="4" fill="#C88A4A"/><path d="M10 79h28" stroke="#8A5530" stroke-width=".5"/><rect x="14" y="72" width="12" height="5" fill="#D52B1E"/><path d="M16 72v5M20 72v5M24 72v5" stroke="#fff" stroke-width=".6"/><path d="M40 77c4-2 5-6 3-8" stroke="#5E3E22" stroke-width=".8" fill="none"/>` },
    { mod: "de-tundra", id: "gr_flockenteppich", slot: "teppich", n: "Schneeflocken-Teppich", box: [46, 82, 68, 14], need: { lv: 2, min: 6 },
      svg: `<ellipse cx="80" cy="90" rx="32" ry="5.5" fill="#2C4A86"/><ellipse cx="80" cy="89.6" rx="28" ry="4.2" fill="#3E63A8"/><g stroke="#fff" stroke-width=".7">${[60, 70, 80, 90, 100].map((x, k) => { const y = 89.6 + (k % 2 ? -1 : 1); return `<path d="M${x - 2} ${y}h4M${x} ${y - 2}v4M${x - 1.4} ${y - 1.4}l2.8 2.8M${x + 1.4} ${y - 1.4}l-2.8 2.8"/>`; }).join("")}</g>` },
    { mod: "de-tundra", id: "gr_nordfenster", slot: "wand", n: "Nordlicht-Fenster", box: [4, 20, 32, 32], need: { lv: 3, min: 6 },
      svg: `<rect x="5" y="22" width="30" height="28" fill="#5E3E22"/><rect x="7" y="24" width="26" height="24" fill="#0B1D3A"/><g class="rm-rgb"><path d="M7 32c6-4 12 2 18-2s6-2 8-1" stroke="#3CFF7A" stroke-width="2" fill="none" opacity=".8"/><path d="M7 36c6-3 12 2 18-1s6-2 8-1" stroke="#00E5FF" stroke-width="1.4" fill="none" opacity=".7"/></g><path d="M7 44l6-4 5 3 6-5 9 6v4H7z" fill="#DDEBF7"/><path d="M20 24v24M7 36h26" stroke="#5E3E22" stroke-width="1.2"/><g class="rm-twinkle"><circle cx="11" cy="27" r=".6" fill="#fff"/><circle cx="29" cy="28" r=".6" fill="#fff"/></g>` },
    { mod: "de-tundra", id: "gr_schneemann", slot: "rechts", n: "Schneemann", box: [118, 42, 40, 50], need: { sum: 15 },
      svg: `<circle cx="138" cy="82" r="9" fill="#fff"/><circle cx="138" cy="68" r="6.5" fill="#fff"/><circle cx="138" cy="57" r="5" fill="#fff"/><rect x="133" y="50" width="10" height="2" fill="#14062E"/><rect x="135" y="44" width="6" height="6" fill="#14062E"/><rect x="135" y="48" width="6" height="1.2" fill="#D52B1E"/><circle cx="136.3" cy="56" r=".7" fill="#14062E"/><circle cx="139.7" cy="56" r=".7" fill="#14062E"/><path d="M138 57.6l4 1-4 .8z" fill="#FF8A1F"/><rect x="132" y="61" width="12" height="2.4" fill="#2E6BE6"/><rect x="141" y="62" width="2.4" height="6" fill="#2E6BE6"/><circle cx="138" cy="67" r=".7" fill="#14062E"/><circle cx="138" cy="70" r=".7" fill="#14062E"/><g class="rm-sway" style="transform-origin:132px 66px"><path d="M132 66l-8-5" stroke="#7A5230" stroke-width="1"/></g><path d="M144 66l7-6" stroke="#7A5230" stroke-width="1"/>` },
    { mod: "de-tundra", id: "gr_rentier", slot: "deko", n: "Rentier-Figur", box: [96, 60, 26, 32], need: { all: 10 },
      svg: `<rect x="100" y="76" width="14" height="7" fill="#A8743A"/><rect x="101" y="83" width="2" height="7" fill="#7A5230"/><rect x="111" y="83" width="2" height="7" fill="#7A5230"/><rect x="112" y="70" width="5" height="7" fill="#A8743A"/><rect x="116" y="72" width="3" height="3" fill="#A8743A"/><g class="rm-blink"><circle cx="119.4" cy="73.4" r="1" fill="#D52B1E"/></g><path d="M113 70l-2-5-2 1M113 66l1-2M116 70l2-5 2 1M118 66l-1-2" stroke="#5E3E22" stroke-width=".8" fill="none"/><rect x="98" y="90" width="22" height="2" fill="#B9CFE6"/>` },
    /* Lava */
    { mod: "de-lava", id: "gr_glutkette", slot: "decke", n: "Glut-Lichterkette", box: [0, 0, 160, 12], need: { lv: 1, min: 2 }, svg: BULBS(["#FF6A00", "#FFC21A", "#E53935"], "rm-flicker") },
    { mod: "de-lava", id: "gr_magmar", slot: "rechts", n: "Magmar-Plüschtier", box: [118, 60, 40, 32], need: { lv: 1, min: 3 },
      svg: `<g class="rm-flicker"><path d="M130 81l2-7 2 4 4-9 4 9 2-4 2 7z" fill="#FF8A1F"/><path d="M135 80l3-6 3 6z" fill="#FFC21A"/></g><path d="M126 90c0-10 6-16 12-16s12 6 12 16z" fill="#4A2A26"/><ellipse cx="138" cy="86" rx="6" ry="4" fill="#FF6A00"/><rect x="133" y="79" width="3" height="3" fill="#FFC21A"/><rect x="140" y="79" width="3" height="3" fill="#FFC21A"/><path d="M135 84h6" stroke="#14062E" stroke-width=".8"/><rect x="124" y="90" width="28" height="2" fill="#2A1C18"/>` },
    { mod: "de-lava", id: "gr_obsidian", slot: "teppich", n: "Obsidian-Teppich", box: [46, 82, 68, 14], need: { lv: 1, min: 5 },
      svg: `<ellipse cx="80" cy="90" rx="32" ry="5.5" fill="#1C1210"/><ellipse cx="80" cy="89.4" rx="28" ry="4" fill="none" stroke="#3A2A26" stroke-width=".6"/><g class="rm-glowpulse"><path d="M54 90l8-1 6 2 8-2 6 1M84 89l8 2 6-1 6 1M70 92l4-1 4 1" stroke="#FF6A00" stroke-width=".8" fill="none"/></g>` },
    { mod: "de-lava", id: "gr_ignisposter", slot: "wand", n: "Vulkan-Poster «Ignis»", box: [4, 20, 32, 36], need: { lv: 1, min: 6 },
      svg: `<rect x="6" y="22" width="28" height="32" fill="#2A0A12" stroke="#8A3A1A" stroke-width="1.2"/><path d="M9 47l9-14h4l9 14z" fill="#5A2A1E"/><path d="M18 33h4l-1 2h-2z" fill="#FF6A00"/><g class="rm-flicker"><circle cx="19" cy="29" r="1.2" fill="#FFC21A"/><circle cx="22" cy="27" r="1" fill="#FF6A00"/></g><path d="M20 35c-1 5 1 8-1 12" stroke="#FF8A1F" stroke-width="1.2" fill="none"/><text x="20" y="52" font-size="3.6" font-weight="900" text-anchor="middle" fill="#FFC21A" font-family="monospace">IGNIS</text>` },
    { mod: "de-lava", id: "gr_lavakamin", slot: "links", n: "Lava-Kamin", box: [2, 46, 46, 46], need: { lv: 1, min: 8 },
      svg: `<rect x="6" y="52" width="38" height="40" fill="#4A3A36"/><rect x="4" y="49" width="42" height="4" fill="#2A1C18"/><path d="M6 60h38M6 70h7M37 70h7M6 80h7M37 80h7" stroke="#2A1C18" stroke-width=".6"/><rect x="13" y="66" width="24" height="26" fill="#1C1210"/><path d="M13 66a12 8 0 0 1 24 0" fill="#1C1210"/><g class="rm-flame"><path d="M16 92c0-6 3-8 3-12 2 3 4 4 4 8 1-3 3-5 3-8 2 4 4 6 4 12z" fill="#FF6A00"/><path d="M20 92c0-3 2-4 2-6 1 2 3 3 3 6z" fill="#FFC21A"/></g>` },
    { mod: "de-lava", id: "gr_vitrine", slot: "deko", n: "Eiskristall-Vitrine", box: [96, 56, 24, 36], need: { lv: 1, min: 10 },
      svg: `<rect x="99" y="86" width="18" height="6" fill="#3A3A44"/><rect x="100" y="60" width="16" height="26" fill="rgba(190,230,255,.18)" stroke="#BFE3F2" stroke-width=".8"/><circle cx="108" cy="73" r="9" fill="#9EE3FF" opacity=".12"/><g class="rm-bob"><path d="M108 64l5 8-5 10-5-10z" fill="#9EE3FF"/><path d="M108 64v18M103 72h10" stroke="#fff" stroke-width=".5" opacity=".8"/></g>` }
  ];
  const needOk = (m, n) => n.all ? m.activities.every(x => rawSt(m, x) >= n.all) : n.sum ? gameSum(m) >= n.sum : gameLv(m, n.lv) >= n.min;
  const needTxt = (m, n) => n.all ? `${m.title}: alle Tanks ganz voll` : n.sum ? `${m.title}: insgesamt ${n.sum} Sterne`
    : `${m.title}: ${m.activities.length > 1 ? `Level ${n.lv} mit ` : ""}${n.min} Sterne`;
  const gameExtras = lp => {
    const out = { dips: [], mods: [], emotes: [], skins: [] }, earned = [];
    GAME_REW.forEach(g => {
      const m = gameMod(g.mod); if (!m) return;
      const art = (H.modArt || {})[m.id] || {}, c = art.c || "#8B5CFF", key = m.id.slice(3);
      out.mods.push({ id: m.id, n: m.title, c, emoji: g.emoji });
      g.dips.forEach(d => { const id = `hd:${key}:${d.id}`; if (lp || dipOk(m, d)) earned.push(id); out.dips.push({ id, n: d.n, d: dipTxt(m, d), emoji: d.emoji, wand: d.wand, mod: m.title, modId: m.id, c }); });
      if (g.emote) { const id = "he_" + key, badge = "hb:" + id, half = Math.ceil((m.activities[0].maxStars || 10) / 2);
        if (lp || gameLv(m, 1) >= half) earned.push(badge);
        out.emotes.push(Object.assign({ id, badge, mod: m.title, d: `Aus dem «${m.title}».`, reqTxt: `«${m.title}»: ${m.activities.length > 1 ? "in Level 1 " : ""}${half} Sterne holen` }, g.emote)); }
      if (g.skin) { const id = "hs_" + key, badge = "hb:" + id, sh = window.GLGlitch ? GLGlitch.shades(g.skin.base) : {};
        if (lp || gameSum(m) >= Math.ceil(gameMax(m) * .9)) earned.push(badge);
        out.skins.push({ id, badge, mod: m.title, n: g.skin.n, base: g.skin.base, light: sh.light, dark: sh.dark, hi: sh.hi, reqTxt: `${m.title}: 90 % der Sterne` }); }
    });
    out.room = BUILTIN_ROOM.map(x => Object.assign({ mod: "" }, x));
    if (lp) BUILTIN_ROOM.forEach(x => earned.push(x.badge));
    GAME_ROOM.forEach(x => { const m = gameMod(x.mod); if (!m) return; const badge = "hb:" + x.id;
      if (lp || needOk(m, x.need)) earned.push(badge);
      out.room.push({ id: x.id, slot: x.slot, n: x.n, box: x.box, svg: x.svg, badge, mod: m.title, reqTxt: needTxt(m, x.need) }); });
    return { custom: out, earned };
  };
  if (window.GLGlitch && GLGlitch.addSkins) GLGlitch.addSkins(GAME_REW.map(g => ({ id: "hs_" + g.mod.slice(3), n: g.skin.n, base: g.skin.base })));
  const builtinExtras = () => { const lp = isLP(), ge = gameExtras(lp);
    return { bgs: BUILTIN_BGS.map(({ done, ...b }) => Object.assign({ badge: "hb:" + b.id }, b)), earned: BUILTIN_BGS.filter(b => lp || b.done()).map(b => "hb:" + b.id).concat(ge.earned), custom: ge.custom }; };

  /* ---------- gLiTCh streicheln: mit Finger oder Maus hin und her über gLiTCh fahren ---------- */
  const PET_LINES = ["Hihi! Das kitzelt!", "Mehr! Mein Code schnurrt!", "Oh, so lieb!", "Bzzzt … das tut gut!", "Pixel-Kuschelzeit!"];
  function pettable(el, say) {
    if (!el || el.dataset.pet) return; el.dataset.pet = "1";
    let last = null, dir = 0, flips = 0, dist = 0, t = null, petted = false;
    const heart = () => { const r = el.getBoundingClientRect(), h = document.createElement("span"); h.className = "pet-heart"; h.textContent = Math.random() < .5 ? "♥" : "💜";
      h.style.left = (r.left + r.width * (.2 + Math.random() * .6)) + "px"; h.style.top = (r.top + r.height * .2) + "px"; document.body.appendChild(h); setTimeout(() => h.remove(), 1300); };
    const reset = () => { last = null; dir = 0; flips = 0; dist = 0; petted = false; el.classList.remove("petted"); const g = el.querySelector(".glitch"); if (g && el.dataset.petOld) { g.innerHTML = el.dataset.petOld; delete el.dataset.petOld; } };
    el.addEventListener("pointermove", e => {
      if (last) { const dx = e.clientX - last[0]; dist += Math.hypot(dx, e.clientY - last[1]); const d = Math.sign(dx); if (d && dir && d !== dir && Math.abs(dx) > 1) flips++; if (d) dir = d; }
      last = [e.clientX, e.clientY];
      if (dist > 160 && flips >= 2) {
        if (!petted) { petted = true; el.classList.add("petted"); const g = el.querySelector(".glitch"); if (g) { el.dataset.petOld = g.innerHTML; g.innerHTML = G.svg("love", "#8B5CFF", { outfit: outfitOf(), lp: isLP() }); } say(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]); }
        if (Math.random() < .25) heart();
      }
      clearTimeout(t); t = setTimeout(reset, 800);
    });
    el.addEventListener("pointerleave", () => { clearTimeout(t); t = setTimeout(reset, 500); });
  }
  /* ---------- Logo: gLiTCh mit animiertem Glitch-Schriftzug ---------- */
  const brandLogo = (mood, sub) => `<span class="brand-g" aria-hidden="true"><span class="glitch">${G.svg(mood, "#8B5CFF", { outfit: S.me ? outfitOf() : {}, lp: isLP() })}</span><i class="brand-spark s1"></i><i class="brand-spark s2"></i></span>
    <span class="brand-t"><b class="logo-word" data-t="Glitchlab"><span class="lw-a">Glitch</span><span class="lw-b">lab</span></b></span>`;
  const clsChip = name => name ? `<span class="cls-chip" title="Klasse"><i aria-hidden="true">🏫</i>${esc(name)}</span>` : "";
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
      toast("Ups, gLiTCh hat sich verhaspelt: " + (err && err.message ? err.message : err) + ". Zeig es der Lehrperson.", "err", 9000);
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
      <button type="button" class="brand" data-home aria-label="Zur Startseite">${brandLogo("happy", S.me?.class_name || "")}</button>
      <div class="top-r">
        ${st ? `${clsChip(S.me.class_name || "")}<span class="starcount" title="Deine Sterne"><i>★</i>${allStars()}</span>
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
      <div class="gate-head">${gl("wink", "#8B5CFF")}<div><p class="eyebrow">Glitchlab</p><h1>Hoi! Ich bin gLiTCh.</h1><p>Gib den Klassencode ein. Du findest ihn auf deiner Login-Karte.</p></div></div>
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
    if (extT && S.me) { clearTimeout(extT); extT = null; try { await S.be.saveExtras(S.token, S.me.extras); } catch (e) { /* egal */ } }
    S.cls = null;   // Namensliste neu laden: zeigt die aktuellen gLiTChs (Outfit, Skin)
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
          <div class="stage-g"><span class="glitch">${G.svg("happy", "#8B5CFF", { outfit: outfitOf(), lp: isLP() })}</span><span class="floor"></span></div>
          <div class="bubble"><p class="eyebrow">${esc(S.me.class_name || "")}</p><h1>${hello}</h1><p>gLiTCh räumt kurz sein Zimmer auf …</p></div>
        </div>
        <iframe class="roomframe" id="roomFrame" title="gLiTChs Zimmer mit Garderobe" src="lab/index.html${window.GL_V ? "?v=" + window.GL_V : ""}#home"></iframe>
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
  const themesOf = id => sortThemes(H.themes.filter(t => t.subject === id && (!t.lpOnly || isLP())), id, S.me?.class_settings);
  const themeMods = id => sortMods(H.modules.filter(m => m.theme === id && visMod(m)), id, S.me?.class_settings);

  /* Grosser animierter Kopf-Banner: Szene über die ganze Breite, Pixel-Funken und ein gLiTCh, der durchläuft */
  function heroBanner(o) {
    const scene = o.scene || "";
    const sparks = Array.from({ length: 12 }, (_, k) => `<i style="--x:${(k * 37 + 7) % 100}%;--y:${(k * 53 + 11) % 90}%;--d:${(k * .41) % 3}s;--k:${["#FFE680", "#00E5FF", "#FF2BD6", "#FFFFFF"][k % 4]}"></i>`).join("");
    return `<header class="hero-banner" style="--mc:${o.c};--mc2:${o.c2}">
      <div class="hb-scene">${scene}</div><div class="hb-sparks" aria-hidden="true">${sparks}</div>
      <span class="hb-walker" aria-hidden="true"><span class="glitch">${G.svg("happy", "#8B5CFF", { outfit: outfitOf(), lp: isLP(), calm: true })}</span></span>
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
      <div class="row"><span>${m.minutes ? `ca. ${m.minutes} Min.` : ""}</span>${m.noStars ? `<span class="hint" style="margin:0">Zum Ausprobieren · ohne Sterne</span>` : m.alias ? `<span class="stars" title="Sterne zählen zusammen mit Teil 1">★ <b style="color:var(--ink)">${modStars(H.modules.find(x => x.id === m.alias) || m)}</b></span>` : H.openEnded(m) ? `<span class="stars">★ <b style="color:var(--ink)">${got}</b></span>` : starRow(got, max)}</div>
      ${H.openEnded(m) || m.alias || m.noStars ? "" : `<span class="bar" style="--c:${a.c}"><i style="width:${max ? Math.round(got / max * 100) : 0}%"></i></span>`}
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
        <div class="buddy"><span class="glitch">${G.svg("normal", "#8B5CFF", { outfit: outfitOf(), lp: isLP() })}</span><p id="buddySay" aria-live="polite">Los geht's!</p></div></div>
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
    catch (e) { console.error(e); $("#modBody").innerHTML = `<p class="err">Dieses Modul hat einen Fehler. Sag es der Lehrperson.</p>`; }
  }

  /* =================================================================
     5b) gLiTCh-Lab: Module und gLiTChs Zimmer (lab/index.html)
     Die Lab-Seite läuft in einem Rahmen und spricht über window.GLHubBridge
     mit dem Glitchlab: wer arbeitet, Sterne, Diplome, Outfit und gespeicherte Arbeit.
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
    const oldO = JSON.stringify((S.me.extras || {}).outfit || {});
    S.me.extras = Object.assign({}, S.me.extras || {}, x);
    if (JSON.stringify(S.me.extras.outfit || {}) !== oldO) $$(`[data-kg="${CSS.escape(S.me.student.id)}"]`).forEach(el => { el.innerHTML = G.svg(el.closest(".chip") ? "normal" : "happy", "#8B5CFF", { outfit: outfitOf(), lp: isLP(), calm: el.classList.contains("still") }); });
    clearTimeout(extT); extT = setTimeout(() => S.be.saveExtras(S.token, S.me.extras).catch(() => {}), 800);
  }
  let ovTimer = null;
  window.GLHubBridge = {
    context(lab) {
      const k = s => ({ id: s.id, n: s.first_name, c: s.color });
      const mods = {}; let labSum = 0;
      H.modules.filter(m => m.kind === "lab" && !m.alias).forEach(m => {
        const l = m.lab, p = progOf(m.id, "lab"), done = lpStat(m) === "fertig"; if (!p && !done) return;
        const d = (p && p.data) || {}, stars = done ? fullAct({ maxStars: null }, p ? p.stars : 0) : p.stars;
        mods[l] = { stars, badges: [...new Set([...(d.badges || []), ...(done ? labBadges(m) : [])])], fed: d.fed || 0, deaths: d.deaths || 0 };
        labSum += stars;
      });
      /* Hub-Module (ohne Lab) zählen als «geschafft», sobald es Sterne gab: z. B. für Emotes */
      const hubDone = H.modules.filter(m => m.kind !== "lab" && modStars(m) > 0).map(m => "hub:" + m.id);
      mods.hub = { stars: Math.max(0, allStars() - labSum), badges: [...myBadges(), ...hubDone], fed: myMax("fed"), deaths: myMax("deaths") };
      /* Extras aus hochgeladenen Modulen: freigeschaltete kommen als «up:…»-Merker dazu */
      const up = H.uploadExtras(m => modStars(m), m => upBadges(m.id), isLP(), () => levelOf(allStars()) + 1);
      const bi = builtinExtras(); up.custom.bgs = bi.bgs.concat(up.custom.bgs || []);
      ["dips", "mods", "emotes", "skins", "room"].forEach(k => { up.custom[k] = (bi.custom[k] || []).concat(up.custom[k] || []); });
      mods.hub.badges = [...new Set([...mods.hub.badges, ...up.earned, ...bi.earned])];
      if (isLP()) {   // Lehrpersonen-Konto: höchstes Level, alle Diplome, alles freigeschaltet
        mods.hub.stars = GD.LEVELS[99].s + 1;
        mods.hub.badges = [...new Set([...mods.hub.badges, ...GD.BADGES.map(b => b.id), ...H.modules.map(m => "hub:" + m.id)])];
        mods.hub.fed = 99; mods.hub.deaths = 9;
      }
      return {
        lp: isLP(), me: k(S.me.student), team: S.team.map(t => k(t.student)), className: S.me.class_name || "",
        code: mainCode(), codes: classCodes().slice(1), teacher: CFG.TEACHER_NAME_DATIV || "der Lehrperson", quiz: [],
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
        const newly = H.uploadExtras(x => modStars(x), x => upBadges(x.id), false, () => levelOf(allStars()) + 1);
        toast(`Spezial-Aufgabe geschafft!${newly.earned.length ? " Schaut in gLiTChs Zimmer nach Neuem." : ""}`, "star");
      }).catch(err => toast(err.message, "err", 5000));
    },
    glitchSvg(mood) { return G.svg(mood || "happy", "#8B5CFF", { outfit: outfitOf(), lp: isLP(), calm: true }); },
    checkCode(c) { return classCodes().includes(String(c).trim()); },
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
      /* Sicherheitsnetz: Ist im Zimmer kein Fenster mehr offen, gibt das Glitchlab die Seite wieder frei (sonst wären die Fächer blockiert) */
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
      <div class="labbar"><button type="button" class="btn small" data-labback>← ${m ? esc((H.themes.find(t => t.id === m.theme) || {}).title || "Zurück") : "Glitchlab"}</button>
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
    fr.className = "labframe"; fr.title = m ? m.title : "gLiTChs Zimmer"; fr.allow = "fullscreen";
    if (upHtml != null) fr.srcdoc = H.uploadDoc(upHtml, m, workKey(lab), S.me.student.first_name, S.team.map(t => t.student.first_name));
    else { const qv = window.GL_V ? "?v=" + window.GL_V : ""; fr.src = m && m.src ? m.src + qv : "lab/index.html" + qv + "#" + ((m && m.hash) || lab); }
    if (m && m.frameBg) fr.style.background = m.frameBg;
    fr.onload = () => { const l = $("#labLoad"); if (l) l.remove(); };
    $(".labshell").appendChild(fr);
    /* gLiTCh sitzt in der Ecke, so wie er angezogen ist (nicht bei Lab-Modulen, die ihn schon zeigen, und nicht bei Spielen mit eigenem Maskottchen) */
    const ownGlitch = m && (m.kind === "lab" || m.noBuddy || (m.upload && m.meta && m.meta.maskottchen));
    if (m && !ownGlitch) {
      const LINES = ["Du schaffst das!", "Ich bin da, falls ihr Hilfe braucht.", "Wenn ihr fertig seid: oben auf «✓ Fertig» tippen!", "Pixel-Power! Weiter so!", "Kleine Pause? Kurz strecken, dann weiter!"];
      const cb = document.createElement("div"); cb.className = "corner-g";
      cb.innerHTML = `<p class="corner-say" hidden></p><button type="button" class="corner-btn" aria-label="gLiTCh"><span class="glitch">${G.svg("happy", "#8B5CFF", { outfit: outfitOf(), lp: isLP() })}</span></button>`;
      $(".labshell").appendChild(cb);
      let n = 0, tm = null;
      $(".corner-btn", cb).onclick = () => { const p = $(".corner-say", cb); p.textContent = LINES[n++ % LINES.length]; p.hidden = false; clearTimeout(tm); tm = setTimeout(() => { p.hidden = true; }, 4000); };
      pettable($(".corner-btn", cb), txt => { const p = $(".corner-say", cb); p.textContent = txt; p.hidden = false; clearTimeout(tm); tm = setTimeout(() => { p.hidden = true; }, 3000); });
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
      <button type="button" class="brand" data-exit>${brandLogo("cool", "Lehrpersonen")}</button>
      <div class="top-r">${clsChip("Lehrpersonen")}${who ? `<span class="hint">${esc(who.email)}</span><button type="button" class="btn small" data-signout>Abmelden</button>` : ""}
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
          <div class="row"><input class="input" id="clsName" placeholder="z. B. 6i Gartenhof" maxlength="40" required style="flex:1;min-width:200px"><button class="btn primary" type="submit">Klasse anlegen</button></div>
          <label class="f" for="clsTeachers" style="margin-top:12px">Weitere Lehrpersonen (freiwillig, ein Name pro Zeile)<textarea class="input" id="clsTeachers" placeholder="Frau Muster&#10;Herr Beispiel" style="min-height:64px"></textarea></label>
          <p class="hint" style="margin:0">Jede weitere Lehrperson bekommt einen eigenen Freigabe-Code. Damit gibt sie den Kindern in den Modulen die nächste Etappe frei, genau wie du mit deinem Code.</p></form>
        <section class="panel" id="restore"><h2>Klasse aus Datei wiederherstellen</h2>
          <p class="hint">Hast du eine Klasse mit «💾 Klasse sichern» als Datei gespeichert? Lade sie hier hoch. Die Klasse kommt mit allen Kindern, Bild-Passwörtern, Sternen, Diplomen, Garderoben, gespeicherten Arbeiten und Einstellungen zurück. Die Kinder melden sich danach genau wie vorher an.</p>
          <label class="btn" style="cursor:pointer">📂 Sicherungsdatei wählen<input type="file" id="restoreFile" accept=".json,application/json" hidden></label>
          <div id="restoreInfo"></div></section>
        ${uploadsPanelHTML()}
        ${modsPanelHTML()}
        ${S.be.mode === "demo" ? `<p class="hint">Demo-Modus aktiv. <button type="button" class="link" data-resetdemo>Demo-Daten zurücksetzen</button></p>` : ""}
      </main>`;
      bindLpTop(); bindModsPanel(); bindUploadsPanel(); bindRestore();
      $$("[data-cls]").forEach(b => b.onclick = () => { LP.cur = LP.classes.find(c => c.id === b.dataset.cls); LP.cards = false; render(); });
      $("#newCls").onsubmit = async e => {
        e.preventDefault();
        try {
          const names = $("#clsTeachers").value.split(/\n|,/).map(x => x.trim().slice(0, 40)).filter(Boolean);
          LP.cur = await S.be.createClass($("#clsName").value); LP.cards = false;
          if (names.length) { const taken = [mainCode()], teachers = names.map(n => { const code = newTeacherCode(taken); taken.push(code); return { id: Math.random().toString(36).slice(2, 10), name: n, code }; });
            const settings = Object.assign({}, LP.cur.settings || {}, { teachers }); await S.be.saveClassSettings(LP.cur.id, settings); LP.cur.settings = settings; }
          toast(`Klasse angelegt. Code: ${LP.cur.code}${names.length ? ` · ${names.length} weitere ${names.length === 1 ? "Lehrperson" : "Lehrpersonen"}` : ""}`); render();
        }
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
          <button type="button" class="btn small" data-backup title="Speichert die ganze Klasse als Datei: Kinder, Bild-Passwörter, Sterne, Diplome, Garderobe, Arbeiten und Einstellungen">💾 Klasse sichern</button>
          <label class="hint" style="display:inline-flex;gap:6px;align-items:center;margin:0"><input type="checkbox" id="backupMods" checked> mit hochgeladenen Modulen</label>
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
      ${teachersPanelHTML(c)}
      ${accessPanelHTML(c)}
      ${kidModsPanelHTML()}
      <section class="panel"><h2>Fortschritt pro Modul</h2>
        ${H.modules.length && LP.kids.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kind</th>${H.modules.filter(m => !m.noStars).map(m => `<th class="num" title="${esc(m.title)}">${esc(m.title)}</th>`).join("")}</tr></thead><tbody>
          ${LP.kids.map(k => `<tr><td class="kid">${esc(k.first_name)}</td>${H.modules.filter(m => !m.noStars).map(m => {
            const got = kidModStars(LP.prog, k.id, m);
            const team = [...new Set(LP.prog.filter(p => p.student_id === k.id && p.module_id === m.id).flatMap(p => p.team || []))];
            return `<td class="num" title="${team.length ? "Mit: " + esc(team.join(", ")) : ""}">${H.openEnded(m) ? "★ " + got : got + " / " + H.maxStars(m)}${team.length ? " 👥" : ""}</td>`;
          }).join("")}</tr>`).join("")}</tbody></table></div><p class="hint">👥 = im Team gelöst (Maus darüber zeigt mit wem).</p>` : `<p class="hint">Sobald Kinder Aufgaben lösen, siehst du hier ihre Sterne.</p>`}
      </section></main>`;
    bindLpTop();
    $("[data-allcls]").onclick = () => { LP.cur = null; LP.confirm = null; render(); };
    $("[data-cards]").onclick = () => { LP.cards = true; render(); };
    $("[data-backup]").onclick = async ev => { const b = ev.currentTarget, t = b.textContent; b.disabled = true; b.textContent = "Wird gesichert …";
      try {
        const data = await S.be.exportClass(c.id, $("#backupMods").checked);
        const file = Object.assign({ format: "glitchlab-klasse", version: 1, saved_at: new Date().toISOString() }, data);
        const d = new Date(), stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        await saveFile(new Blob([JSON.stringify(file)], { type: "application/json" }), `Glitchlab-Klasse-${c.name.replace(/[^\wäöüÄÖÜ-]+/g, "-")}-${stamp}.json`);
        toast(`Klasse «${c.name}» gesichert: ${data.students.filter(k => !k.is_teacher).length} Kinder, ${data.progress.length} Spielstände.`, "star", 5000);
      } catch (err) { toast("Sichern ging nicht: " + (err.message || err), "err", 6000); }
      b.disabled = false; b.textContent = t; };
    $("[data-delcls]").onclick = async () => {
      if (LP.confirm !== "cls") { LP.confirm = "cls"; return render(); }
      await S.be.deleteClass(c.id); LP.cur = null; LP.confirm = null; toast("Klasse gelöscht."); render();
    };
    $$("[data-newpin]").forEach(b => b.onclick = async () => { await S.be.newPin(b.dataset.newpin); toast("Neues Bild-Passwort erstellt."); render(); });
    $$("[data-test]").forEach(b => b.onclick = async () => {
      await S.be.testUnlock(b.dataset.test, GD.LEVELS[99].s, GD.BADGES.map(x => x.id));
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
    bindAccessPanel(c); bindKidModsPanel(); bindTeachersPanel(c);
    $("#addKids").onsubmit = async e => {
      e.preventDefault();
      const names = $("#kidNames").value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
      if (!names.length) return;
      try { const r = await S.be.addStudents(c.id, names); toast(`${r.length} ${r.length === 1 ? "Kind" : "Kinder"} hinzugefügt.`); render(); }
      catch (err) { toast(err.message, "err"); }
    };
  }
  /* ---------- Klasse aus Datei wiederherstellen ---------- */
  function bindRestore() {
    const inp = $("#restoreFile"); if (!inp) return;
    inp.onchange = async () => {
      const f = inp.files && inp.files[0]; inp.value = ""; if (!f) return;
      let b = null; try { b = JSON.parse(await f.text()); } catch (e) { b = null; }
      const box = $("#restoreInfo");
      if (!b || b.format !== "glitchlab-klasse" || !b.cls || !Array.isArray(b.students)) { box.innerHTML = `<p class="err">Diese Datei ist keine Klassen-Sicherung aus dem Glitchlab.</p>`; return; }
      const kids = b.students.filter(k => !k.is_teacher), taken = LP.classes.some(x => x.code === b.cls.code);
      box.innerHTML = `<div class="restore-card"><b>${esc(b.cls.name)}</b><small>Gesichert am ${esc(new Date(b.saved_at).toLocaleString("de-CH"))} · ${kids.length} Kinder · ${(b.progress || []).length} Spielstände${(b.uploads || []).length ? ` · ${b.uploads.length} hochgeladene Module` : ""}</small>
        <p class="hint" style="margin:6px 0">${taken ? `Eine Klasse mit dem Code ${esc(b.cls.code)} gibt es schon. Die wiederhergestellte Klasse bekommt einen neuen Klassencode.` : `Die Klasse bekommt wieder den Code <b>${esc(b.cls.code)}</b>, wenn er noch frei ist.`}</p>
        <div class="row"><button type="button" class="btn primary" id="restoreGo">Klasse wiederherstellen</button><button type="button" class="btn" id="restoreNo">Abbrechen</button></div></div>`;
      $("#restoreNo").onclick = () => { box.innerHTML = ""; };
      $("#restoreGo").onclick = async ev => { const btn = ev.currentTarget; btn.disabled = true; btn.textContent = "Wird wiederhergestellt …";
        try { const cls = await S.be.importClass(b); LP.cur = cls; LP.cards = false; toast(`Klasse «${cls.name}» ist zurück. Klassencode: ${cls.code}`, "star", 6000); render(); }
        catch (err) { btn.disabled = false; btn.textContent = "Klasse wiederherstellen"; toast("Wiederherstellen ging nicht: " + (err.message || err), "err", 7000); } };
    };
  }
  /* ---------- Login-Karten als PDF: 8 Karten pro A4 (2 × 4), zum Ausschneiden ---------- */
  function loadJs(src) { return new Promise((ok, no) => { const sc = document.createElement("script"); sc.src = src; sc.onload = ok; sc.onerror = () => no(new Error("Bibliothek nicht geladen")); document.head.appendChild(sc); }); }
  function svgImg(svg) { return new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')); }); }
  /* Datei speichern: in claude.ai über die Download-Freigabe, sonst als normaler Download */
  async function saveFile(blob, name) {
    let dl = null; try { dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch (e) { dl = null; }
    if (dl) { await dl.save({ filename: name, data: blob }); return; }
    const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
  }
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
      x.fillStyle = "#FFFFFF"; x.font = "800 34px system-ui, -apple-system, Segoe UI, sans-serif"; x.fillText("Glitchlab", 145, 62);
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
    await saveFile(doc.output("blob"), name);
    toast(`PDF «${name}» mit ${kids.length} Karten erstellt.`, "star", 4500);
  }

  /* ---------- Module für diese Klasse freischalten ---------- */
  const ACCESS = [["", "Standard"], ["offen", "Offen"], ["kette", "Nach dem Modul davor"], ["zu", "Gesperrt"]];
  function stdTxt(m) { return m.soon ? "kommt bald" : m.req ? "Standard: " + m.req.txt : "Standard: offen"; }
  /* ---------- Weitere Lehrpersonen der Klasse: eigene Freigabe-Codes ---------- */
  function teachersPanelHTML(c) {
    const list = coTeachers(c.settings);
    return `<section class="panel" id="lpTeachers"><h2>Lehrpersonen dieser Klasse</h2>
      <p class="hint">Alle hier können den Kindern mit ihrem eigenen Freigabe-Code die nächste Etappe freigeben: im gLiTCh-Lab und in hochgeladenen Modulen mit «Freigabe mit LP-Code». Die Codes gelten nur in dieser Klasse.</p>
      <div class="tch-list">
        <div class="tch main"><span class="tch-n"><b>${esc(CFG.TEACHER_NAME || "Du")}</b><small>Hauptlehrperson · dein Code aus den Einstellungen</small></span><span class="tch-code">${esc(mainCode())}</span><span></span></div>
        ${list.map(t => `<div class="tch"><span class="tch-n"><b>${esc(t.name)}</b><small>Weitere Lehrperson</small></span><span class="tch-code">${esc(t.code)}</span>
          <span class="acts-cell"><button type="button" class="btn small" data-tnew="${esc(t.id)}">Neuer Code</button><button type="button" class="btn small danger" data-tdel="${esc(t.id)}">${LP.confirm === "t" + t.id ? "Sicher?" : "Entfernen"}</button></span></div>`).join("")}
      </div>
      <form class="row" id="tchAdd" style="margin-top:12px"><input class="input" id="tchName" placeholder="Name, z. B. Frau Muster" maxlength="40" required style="flex:1;min-width:180px">
        <input class="input" id="tchCode" placeholder="Code (leer = automatisch)" inputmode="numeric" pattern="[1-9]{4,8}" title="4 bis 8 Ziffern von 1 bis 9" maxlength="8" style="width:200px">
        <button class="btn primary" type="submit">Lehrperson hinzufügen</button></form></section>`;
  }
  function bindTeachersPanel(c) {
    const store = async (teachers, msg) => { const settings = Object.assign({}, c.settings || {}, { teachers });
      try { await S.be.saveClassSettings(c.id, settings); c.settings = settings; LP.confirm = null; toast(msg); render(); } catch (err) { toast(err.message, "err"); } };
    const list = () => coTeachers(c.settings).slice(), taken = () => [mainCode()].concat(list().map(t => String(t.code)));
    $("#tchAdd").onsubmit = e => { e.preventDefault();
      const name = $("#tchName").value.trim().slice(0, 40), want = $("#tchCode").value.trim(); if (!name) return;
      if (want && !/^[1-9]{4,8}$/.test(want)) return toast("Der Code braucht 4 bis 8 Ziffern von 1 bis 9.", "err");
      if (want && taken().includes(want)) return toast("Diesen Code hat schon jemand in dieser Klasse. Nimm einen anderen.", "err");
      const code = want || newTeacherCode(taken());
      store(list().concat({ id: Math.random().toString(36).slice(2, 10), name, code }), `${name} hinzugefügt. Freigabe-Code: ${code}`); };
    $$("[data-tnew]").forEach(b => b.onclick = () => { const l = list(), t = l.find(x => x.id === b.dataset.tnew); if (!t) return;
      t.code = newTeacherCode(taken()); store(l, `Neuer Code für ${t.name}: ${t.code}`); });
    $$("[data-tdel]").forEach(b => b.onclick = () => { const id = b.dataset.tdel; if (LP.confirm !== "t" + id) { LP.confirm = "t" + id; return render(); }
      const t = list().find(x => x.id === id); store(list().filter(x => x.id !== id), `${t ? t.name : "Lehrperson"} entfernt. Ihr Code gilt nicht mehr.`); });
  }
  /* ---------- Module pro Kind: Status setzen (Abgeschlossen = alle Belohnungen) ---------- */
  function kidModStars(prog, kidId, m) {
    const done = lpStatOf(prog, kidId, m) === "fertig";
    return m.activities.reduce((a, x) => { const v = (prog.find(p => p.student_id === kidId && p.module_id === m.id && p.activity_id === x.id) || {}).stars || 0;
      return a + H.scaled(m, x, done ? fullAct(x, v) : v); }, 0);
  }
  function autoStat(prog, kidId, m) {
    const own = m.activities.reduce((a, x) => a + ((prog.find(p => p.student_id === kidId && p.module_id === m.id && p.activity_id === x.id) || {}).stars || 0), 0);
    if (!own) return "offen";
    if (m.kind === "lab") { const have = new Set(prog.filter(p => p.student_id === kidId && p.module_id === m.id).flatMap(p => (p.data && p.data.badges) || [])), all = labBadges(m);
      return all.length && all.every(b => have.has(b)) ? "fertig" : "arbeit"; }
    const mx = H.rawMax(m); return mx && own >= mx ? "fertig" : "arbeit";
  }
  function kidModsPanelHTML() {
    const kids = LP.kids.filter(k => !k.is_teacher);
    if (!kids.length) return "";
    if (LP.kidSel !== "__all" && !kids.some(k => k.id === LP.kidSel)) LP.kidSel = "__all";
    const ALL = LP.kidSel === "__all", k = ALL ? null : kids.find(x => x.id === LP.kidSel), targets = ALL ? kids : [k];
    const subjects = H.subjects.filter(sj => H.modules.some(m => m.subject === sj.id && !m.soon && !m.lpOnly));
    const row = m => {
      if (ALL) {
        const st = targets.map(x => ({ set: lpStatOf(LP.prog, x.id, m), cur: lpStatOf(LP.prog, x.id, m) || autoStat(LP.prog, x.id, m) })), nSet = st.filter(x => x.set).length;
        const cnt = v => st.filter(x => x.cur === v).length;
        return `<div class="km-r"><span class="acc-n"><b>${esc(m.title)}</b><small>${cnt("fertig")} von ${targets.length} abgeschlossen${nSet ? ` · bei ${nSet} von dir gesetzt` : " · automatisch"}</small></span>
        <span class="km-seg" role="group" aria-label="Status von ${esc(m.title)} für die ganze Klasse">${STATUS.map(([v, n]) => { const c = cnt(v), on = c === targets.length; return `<button type="button" class="km-b ${v}${on ? " on" : ""}${c && !on ? " part" : ""}" data-kstat="${esc(m.id)}" data-v="${v}" aria-pressed="${on}" title="Für alle ${targets.length} Kinder setzen">${n}${c && !on ? ` <em>${c}</em>` : ""}</button>`; }).join("")}</span>
        ${nSet ? `<button type="button" class="link km-x" data-kstat="${esc(m.id)}" data-v="" title="Für alle wieder automatisch">↺ automatisch</button>` : `<span class="km-x"></span>`}</div>`;
      }
      const set = lpStatOf(LP.prog, k.id, m), auto = autoStat(LP.prog, k.id, m), cur = set || auto, got = kidModStars(LP.prog, k.id, m);
      return `<div class="km-r"><span class="acc-n"><b>${esc(m.title)}</b><small>${H.openEnded(m) ? "★ " + got : got + " / " + H.maxStars(m) + " ★"} · ${set ? "von dir gesetzt" : "automatisch"}</small></span>
        <span class="km-seg" role="group" aria-label="Status von ${esc(m.title)}">${STATUS.map(([v, n]) => `<button type="button" class="km-b ${v}${cur === v ? " on" : ""}${cur === v && !set ? " auto" : ""}" data-kstat="${esc(m.id)}" data-v="${v}" aria-pressed="${cur === v}">${n}</button>`).join("")}</span>
        ${set ? `<button type="button" class="link km-x" data-kstat="${esc(m.id)}" data-v="" title="Wieder automatisch (so, wie das Kind gearbeitet hat)">↺ automatisch</button>` : `<span class="km-x"></span>`}</div>`; };
    return `<section class="panel" id="kidMods"><h2>Module pro Kind verwalten</h2>
      <p class="hint"><b>Offen:</b> noch nicht begonnen. <b>In Bearbeitung:</b> das Modul ist frei. <b>Abgeschlossen:</b> alle Belohnungen des Moduls, also alle Sterne (und damit die Level), alle Diplome und alles, was das Modul freischaltet (Outfits, Emotes, Zimmer). Mit «Ganze Klasse» setzt du es für alle Kinder auf einmal; die Zahl im Knopf zeigt, bei wie vielen es schon so ist. «↺ automatisch» nimmt deine Einstellung zurück. Die eigene Arbeit der Kinder bleibt immer erhalten.</p>
      <div class="km-kids" role="tablist" aria-label="Kind wählen"><button type="button" class="km-kid all${ALL ? " on" : ""}" data-ksel="__all" role="tab" aria-selected="${ALL}"><span class="km-allic" aria-hidden="true">👥</span><span>Ganze Klasse</span></button>${kids.map(x => `<button type="button" class="km-kid${!ALL && x.id === k.id ? " on" : ""}" data-ksel="${x.id}" role="tab" aria-selected="${!ALL && x.id === k.id}">${gl("normal", x.color, "still")}<span>${esc(x.first_name)}</span></button>`).join("")}</div>
      <div class="km-all row"><span class="hint" style="margin:0">Alles auf einmal für ${ALL ? "die ganze Klasse" : esc(k.first_name)}:</span><button type="button" class="btn small" data-kall="fertig">Alle Module abschliessen</button><button type="button" class="btn small" data-kall="">Alle automatisch</button></div>
      <div class="acc">${subjects.map(sj => `<div class="acc-s"><h3 style="--c:${sj.color}"><span>${esc(sj.short)}</span>${esc(sj.name)}</h3>
        ${H.themes.filter(t => t.subject === sj.id && H.modules.some(m => m.theme === t.id && !m.soon && !m.lpOnly)).map(t => `<div class="acc-t"><small>${esc(t.title)}</small>
          ${H.modules.filter(m => m.theme === t.id && !m.soon && !m.lpOnly && !m.alias && !m.noStars).map(row).join("")}</div>`).join("")}</div>`).join("")}</div></section>`;
  }
  function bindKidModsPanel() {
    const keep = async fn => { const y = window.scrollY; await fn(); await render(); window.scrollTo(0, y); };
    const targets = () => LP.kidSel === "__all" ? LP.kids.filter(x => !x.is_teacher) : LP.kids.filter(x => x.id === LP.kidSel);
    const who = () => LP.kidSel === "__all" ? "die ganze Klasse" : (targets()[0] || {}).first_name;
    $$("[data-ksel]").forEach(b => b.onclick = () => keep(async () => { LP.kidSel = b.dataset.ksel; }));
    $$("[data-kstat]").forEach(b => b.onclick = () => keep(async () => {
      const m = H.modules.find(x => x.id === b.dataset.kstat), v = b.dataset.v;
      try { for (const k of targets()) { if ((lpStatOf(LP.prog, k.id, m) || "") !== v) await S.be.setModStatus(k.id, m.id, v || null); }
        toast(v === "fertig" ? `«${m.title}» abgeschlossen für ${who()}: alle Belohnungen.` : v ? `«${m.title}» für ${who()}: ${STATUS.find(s => s[0] === v)[1]}.` : `«${m.title}» für ${who()} wieder automatisch.`);
      } catch (err) { toast(err.message, "err"); }
    }));
    $$("[data-kall]").forEach(b => b.onclick = () => keep(async () => {
      const v = b.dataset.kall;
      try { for (const k of targets()) for (const m of H.modules.filter(x => !x.soon && !x.lpOnly)) { if ((lpStatOf(LP.prog, k.id, m) || "") !== v) await S.be.setModStatus(k.id, m.id, v || null); }
        toast(v ? `Alle Module für ${who()} abgeschlossen.` : `Alle Module für ${who()} wieder automatisch.`);
      } catch (err) { toast(err.message, "err"); }
    }));
  }
  function accessPanelHTML(c) {
    const set = (c.settings && c.settings.mods) || {};
    const subjects = H.subjects.filter(sj => H.modules.some(m => m.subject === sj.id && !m.soon));
    return `<section class="panel"><div class="row" style="justify-content:space-between"><h2>Module für diese Klasse</h2>
        <span class="row"><button type="button" class="btn small" data-accall="offen">Alle offen</button><button type="button" class="btn small" data-accall="kette">Alle als Kette</button><button type="button" class="btn small" data-accall="">Alle Standard</button></span></div>
      <p class="hint">Mit ↑ ↓ verschiebst du Themen im Fach und Module im Thema. So sehen es die Kinder dieser Klasse. <b>Offen:</b> sofort frei. <b>Gesperrt:</b> die Kinder sehen das Modul, können es aber nicht öffnen. <b>Nach dem Modul davor:</b> frei, sobald das vorherige Modul im selben Thema geschafft ist (mindestens die Hälfte der Sterne). <b>Standard:</b> so, wie das Modul gebaut ist. Das Lehrpersonen-Konto sieht immer alles.</p>
      <div class="acc">${subjects.map(sj => `<div class="acc-s"><h3 style="--c:${sj.color}"><span>${esc(sj.short)}</span>${esc(sj.name)}</h3>
        ${(() => { const TL = sortThemes(H.themes.filter(t => t.subject === sj.id && H.modules.some(m => m.theme === t.id && !m.soon)), sj.id, c.settings); return TL.map((t, ti) => { const ML = sortMods(H.modules.filter(m => m.theme === t.id && !m.soon), t.id, c.settings); return `<div class="acc-t"><div class="acc-th"><small>${esc(t.title)}</small>${TL.length > 1 ? `<span class="mv"><button type="button" class="mv-b" data-tmv="${esc(sj.id)}|${esc(t.id)}|-1" ${ti ? "" : "disabled"} aria-label="Thema «${esc(t.title)}» nach oben">↑</button><button type="button" class="mv-b" data-tmv="${esc(sj.id)}|${esc(t.id)}|1" ${ti < TL.length - 1 ? "" : "disabled"} aria-label="Thema «${esc(t.title)}» nach unten">↓</button></span>` : ""}</div>
          ${ML.map((m, i) => `<div class="acc-r"><span class="acc-n"><b>${i + 1}. ${esc(m.title)}</b><small>${esc(stdTxt(m))}</small></span>${ML.length > 1 ? `<span class="mv"><button type="button" class="mv-b" data-mmv="${esc(t.id)}|${esc(m.id)}|-1" ${i ? "" : "disabled"} aria-label="«${esc(m.title)}» nach oben">↑</button><button type="button" class="mv-b" data-mmv="${esc(t.id)}|${esc(m.id)}|1" ${i < ML.length - 1 ? "" : "disabled"} aria-label="«${esc(m.title)}» nach unten">↓</button></span>` : `<span></span>`}
            <select class="input acc-sel" data-acc="${esc(m.id)}" aria-label="Freischaltung für ${esc(m.title)}">${ACCESS.map(([v, n]) => `<option value="${v}"${(set[m.id] || "") === v ? " selected" : ""}${v === "kette" && i === 0 ? " disabled" : ""}>${n}</option>`).join("")}</select></div>`).join("")}</div>`; }).join(""); })()}</div>`).join("")}</div>
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
    /* Reihenfolge: Themen im Fach, Module im Thema */
    const saveOrder = async (order, msg) => { const settings = Object.assign({}, c.settings || {}, { order }); const y = window.scrollY;
      try { await S.be.saveClassSettings(c.id, settings); c.settings = settings; toast(msg); } catch (err) { toast(err.message, "err"); } await render(); window.scrollTo(0, y); };
    const move = (list, id, d) => { const i = list.indexOf(id), j = i + d; if (i < 0 || j < 0 || j >= list.length) return list; const l = list.slice(); [l[i], l[j]] = [l[j], l[i]]; return l; };
    $$("[data-tmv]").forEach(b => b.onclick = () => { const [sj, tid, d] = b.dataset.tmv.split("|"), o = JSON.parse(JSON.stringify((c.settings || {}).order || {}));
      const cur = sortThemes(H.themes.filter(t => t.subject === sj && H.modules.some(m => m.theme === t.id && !m.soon)), sj, c.settings).map(t => t.id);
      o.themes = Object.assign({}, o.themes, { [sj]: move(cur, tid, +d) }); saveOrder(o, `Thema «${(H.themes.find(t => t.id === tid) || {}).title}» verschoben.`); });
    $$("[data-mmv]").forEach(b => b.onclick = () => { const [tid, mid, d] = b.dataset.mmv.split("|"), o = JSON.parse(JSON.stringify((c.settings || {}).order || {}));
      const cur = sortMods(H.modules.filter(m => m.theme === tid && !m.soon), tid, c.settings).map(m => m.id);
      o.mods = Object.assign({}, o.mods, { [tid]: move(cur, mid, +d) }); saveOrder(o, `«${(H.modules.find(m => m.id === mid) || {}).title}» verschoben.`); });
    $$("[data-accall]").forEach(b => b.onclick = async () => {
      const v = b.dataset.accall, mods = {};
      if (v) H.modules.filter(m => !m.soon).forEach(m => { const first = sortMods(H.modules.filter(x => x.theme === m.theme && !x.soon), m.theme, c.settings)[0] === m; mods[m.id] = v === "kette" && first ? "offen" : v; });
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
      <p class="hint">Zieh fertige HTML-Module oder Belohnungs-Pakete (Addons mit Belohnungen für höhere Level) hierher, zum Beispiel aus dem gLiTCh-Editor. Outfits, Emotes, Zimmer-Gegenstände und Hintergründe aus dem Steckbrief der Datei werden im Glitchlab verfügbar. Die Kinder schalten sie im Modul frei.</p>
      <label class="dropzone" id="upDrop" tabindex="0">
        <input type="file" id="upFile" accept=".html,.htm,text/html" multiple hidden>
        <span class="dz-ic" aria-hidden="true">⬇️</span><b>HTML-Datei hierher ziehen</b><span class="hint">oder tippen zum Auswählen · max. 8 MB pro Datei</span>
      </label>
      ${ups.length ? `<div class="uplist">${ups.map(u => { const d = u.meta || {}, e = d.extras || {}, m = H.modules.find(x => x.uploadId === u.id), t = m && H.themes.find(x => x.id === m.theme);
        return `<div class="upitem${u.published ? "" : " off"}">
          <span class="up-art">${(H.modArt && H.modArt["up-" + u.id] || {}).svg || ""}</span>
          <div class="up-txt"><b>${esc(d.title)}</b><small>${d.addon ? "🎁 Belohnungs-Paket" : `${esc(subjName(d.subject))}${t ? " · " + esc(t.title) : ""} · ${H.maxStars(m || { activities: [] })} Sterne`}</small>
            <span class="up-ex">${[["outfits", "👕", "Outfits"], ["emotes", "✨", "Emotes"], ["room", "🛋️", "Zimmer"], ["bgs", "🖼️", "Hintergründe"], ["skins", "🎨", "Skins"]].map(([k, ic, n]) => (e[k] || []).length ? `<span title="${n}">${ic} ${(e[k] || []).length} ${n}</span>` : "").join("") || `<span>Keine Extras</span>`}</span></div>
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
        <div class="sheet-h">${gl("happy", "#8B5CFF")}<div><h2 id="upT">${meta.addon ? "🎁 Belohnungs-Paket" : isReplace ? "Modul ersetzen" : "Modul hochladen"}</h2><p>${esc(fileName)}</p></div></div>
        ${warn.length ? `<div class="up-warn">${warn.map(w => `<p>⚠️ ${esc(w)}</p>`).join("")}</div>` : ""}
        <label class="f">Titel<input class="input" id="upTitle" value="${esc(meta.title)}" maxlength="60"></label>
        <label class="f">Kurzbeschreibung<input class="input" id="upTeaser" value="${esc(meta.teaser)}" maxlength="160"></label>
        <div class="ed-grid" ${meta.addon ? "hidden" : ""}>
          <label class="f">Fach<select class="input" id="upSubj"><option value="">Bitte wählen …</option>${subjOpts()}</select></label>
          <label class="f">Thema<select class="input" id="upTheme"></select></label>
          <label class="f" id="upNewWrap">Neues Thema<input class="input" id="upNew" value="${esc(meta.theme)}" maxlength="50" placeholder="z. B. Naturgewalten"></label>
        </div>
        <p class="hint" ${meta.addon ? "hidden" : ""}>Sterne: ${meta.activities.length ? meta.activities.map(a => `${esc(a.title)} (${a.maxStars})`).join(", ") + " + " : ""}1 für «Fertig».</p>
        ${H.extrasCount(meta) ? `<div class="up-extras">${exList("outfits", "👕", "Outfits", x => (x.emoji ? x.emoji + " " : "") + x.n)}${exList("emotes", "✨", "Emotes", x => x.ic + " " + x.n)}${exList("room", "🛋️", "Zimmer", x => (x.emoji ? x.emoji + " " : "") + x.n)}${exList("skins", "🎨", "Skins", x => x.n)}${exList("bgs", "🖼️", "Hintergründe", x => (x.ic ? x.ic + " " : "") + x.n)}</div>` : `<p class="hint">Keine Extras im Steckbrief.</p>`}
        <p class="err" id="upErr" role="alert"></p>
        <div class="row"><button type="button" class="btn primary" data-upok>${isReplace ? "Ersetzen" : "Hochladen & freigeben"}</button><button type="button" class="btn" data-upno>Abbrechen</button></div></div>`;
      document.body.appendChild(ov);
      const paint = () => { const sid = $("#upSubj", ov).value; $("#upTheme", ov).innerHTML = sid ? themeOpts(sid) : `<option value="__neu">+ Neues Thema …</option>`; $("#upNewWrap", ov).hidden = $("#upTheme", ov).value !== "__neu"; };
      paint();
      $("#upSubj", ov).onchange = paint; $("#upTheme", ov).onchange = () => { $("#upNewWrap", ov).hidden = $("#upTheme", ov).value !== "__neu"; };
      $("[data-upno]", ov).onclick = () => { ov.remove(); done(null); };
      $("[data-upok]", ov).onclick = () => {
        const sid = $("#upSubj", ov).value, th = $("#upTheme", ov).value === "__neu" ? $("#upNew", ov).value.trim() : $("#upTheme", ov).value;
        if (!sid && !meta.addon) { $("#upErr", ov).textContent = "Bitte ein Fach wählen."; return; }
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
  catch (e) { app.innerHTML = `<main class="wrap gate"><div class="card"><h1>Keine Verbindung</h1><p>Das Glitchlab kann die Datenbank gerade nicht laden. Prüf das Internet und lade die Seite neu.</p></div></main>`; return; }
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
