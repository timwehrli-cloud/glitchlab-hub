/* gLiTCh-Modul · Laufzeit (vom gLiTCh-Editor in jede Moduldatei eingebaut)
   Daten: window.MODUL = { titel, beschreibung, emoji, farbe, intro, schluss,
     etappen:[{titel, ziel, emoji, intro, lob, aufgaben:[…]}], lexikon:[{wort, erklaerung}],
     diplome:[{id, name, emoji, beschreibung, bedingung}], links:[{titel, url}] }
   Im Glitchlab-Hub gibt es window.GLHub (Sterne, Diplome, Speichern). */
(function () {
  "use strict";
  const M = window.MODUL || {}, HUB = window.GLHub || null, G = window.GLGlitch;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const slug = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, " ").trim();
  /* gLiTCh so, wie das Kind ihn im Hub angezogen hat (ohne Hub: ohne Outfit) */
  /* Maskottchen aus dem Editor: gLiTCh (Standard), Fenni oder ein eigenes */
  const MAS = (M.opt && M.opt.mascot) || { typ: "glitch" }, NAME = window.GLMascot ? GLMascot.nameOf(MAS) : "gLiTCh";
  const MSVG = window.GLMascot ? GLMascot.svg(MAS) : null;
  const nm = t => MSVG ? String(t ?? "").replace(/gLiTChs/g, NAME + "s").replace(/gLiTCh/g, NAME) : t;
  if (MSVG) document.documentElement.classList.add("own-mascot");
  const gsvg = mood => { if (MSVG) return MSVG; try { const x = HUB && HUB.glitch && HUB.glitch(mood); if (x) return x; } catch (e) { /* ohne Hub */ } return G ? G.svg(mood, "#8B5CFF") : ""; };
  const gl = (mood, cls = "") => `<span class="glitch ${cls}">${gsvg(mood)}</span>`;
  /* Schalter aus dem Editor: was das Modul anbietet und wie es zwischen den Etappen weitergeht */
  const O = Object.assign({ tipps: true, vorlesen: true, lexikon: true, pdf: true, freigabe: "keine", code: "" }, M.opt || {});
  const ET = (M.etappen || []).filter(e => e && Array.isArray(e.aufgaben));
  const LEX = O.lexikon ? (M.lexikon || []).filter(w => w && w.wort) : [];
  const DIP = (M.diplome || []).filter(d => d && d.id);
  const wall = d => window.GLWall ? GLWall.svg(d.wand, d.emoji, M.farbe, d.id) : esc(d.emoji || "🏅");
  const scorable = a => a && a.typ !== "info";
  const KEY = "glmod." + slug(M.titel || "modul");
  document.documentElement.style.setProperty("--mc", /^#[0-9a-f]{3,8}$/i.test(M.farbe || "") ? M.farbe : "#A07CFF");
  document.title = M.titel || "gLiTCh-Modul";

  /* ---------- Speicherstand (im Hub fürs ganze Team, sonst nur auf diesem Gerät) ---------- */
  let S = null;
  try { S = HUB ? HUB.laden() : JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  S = Object.assign({ ans: {}, dips: [], lex: false, fertig: false, gate: {}, selbst: {} }, S || {});
  const save = () => { try { if (HUB) HUB.speichern(S); else localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* voll */ } };
  const k = (e, t) => e + "-" + t;
  /* Sterne pro Aufgabe: Spiele geben mehr Sterne als eine einzelne Quizfrage */
  const WERT = { mc: 1, tf: 1, text: 1, luecke: 2, ordnen: 2, zuordnen: 2, schreiben: 2, mehrfach: 2, schaetzen: 2, gestalten: 2, sortieren: 3, zeitmaschine: 3, raetsel: 3, memory: 3, wortsalat: 2, wortraten: 2, blitz: 2, markieren: 2, wortsuche: 3, karteikarten: 2, chat: 2, meinung: 2 };
  const wert = a => WERT[a.typ] || 1;
  const solved = (e, t) => !!(S.ans[k(e, t)] && S.ans[k(e, t)].ok);
  const etStarsRaw = e => ET[e].aufgaben.reduce((n, a, t) => { const x = S.ans[k(e, t)]; return n + (scorable(a) && x && x.ok ? Math.min(wert(a), x.pts != null ? x.pts : wert(a)) : 0); }, 0);
  const etMaxRaw = e => ET[e].aufgaben.reduce((n, a) => n + (scorable(a) ? wert(a) : 0), 0);
  /* Sterne-Budget aus dem Editor: die Punkte der Aufgaben werden auf die Sterne des Moduls umgerechnet */
  const RAWMAX = ET.reduce((n, _, e) => n + etMaxRaw(e), 0), SCL = +M.sterne > 0 && RAWMAX ? +M.sterne / RAWMAX : 1;
  const etStars = e => Math.round(etStarsRaw(e) * SCL);
  const etMax = e => Math.round(etMaxRaw(e) * SCL);
  const etOpen = e => ET[e].aufgaben.filter((a, t) => scorable(a) && !solved(e, t)).length;
  const etDone = e => ET[e].aufgaben.some(scorable) ? etOpen(e) === 0 : !!S.ans[k(e, "seen")];
  const total = () => ET.reduce((n, _, e) => n + etStars(e), 0);
  const totalMax = () => ET.reduce((n, _, e) => n + etMax(e), 0);
  const who = () => HUB && HUB.alle ? HUB.alle.join(" und ") : "";
  /* Freigabe zwischen den Etappen: keine | selbst (Selbsteinschätzung) | lp (Code der Lehrperson) */
  /* Freigabe-Schritte (frei kombinierbar): selbst = Selbsteinschätzung, praes = Präsentation, lp = Code der Lehrperson */
  const GORDER = ["selbst", "praes", "lp"];
  const GATES = (Array.isArray(O.gates) ? O.gates : O.freigabe === "selbst" ? ["selbst"] : O.freigabe === "lp" ? ["lp"] : []).filter((g, i, a) => GORDER.includes(g) && a.indexOf(g) === i).sort((a, b) => GORDER.indexOf(a) - GORDER.indexOf(b));
  const stepsFor = e => GATES.filter(g => g !== "lp" || e < ET.length - 1 || GATES.length > 1);   // nur LP-Code: nach der letzten Etappe nicht nötig
  const gateNeeded = e => stepsFor(e).length > 0;
  S.gs = S.gs || {};
  const gateDone = e => !!S.gate[e] || stepsFor(e).every(g => (S.gs[e] || {})[g]);
  const etUnlocked = e => e <= 0 || !GATES.length || (etDone(e - 1) && (!gateNeeded(e - 1) || gateDone(e - 1)) && etUnlocked(e - 1));
  const GNAME = { selbst: "euch selbst einschätzen", praes: "präsentieren", lp: "von der Lehrperson freigeben lassen" };
  const missing = e => stepsFor(e).filter(g => !(S.gs[e] || {})[g]);
  const andList = l => l.length > 1 ? l.slice(0, -1).join(", ") + " und " + l[l.length - 1] : l.join("");
  const SELBST = [["super", "🤩", "Kann ich super"], ["gut", "🙂", "Kann ich gut"], ["teils", "🤔", "Teilweise"], ["hilfe", "😵‍💫", "Brauche noch Hilfe"]];

  /* ---------- Diplome ---------- */
  function dipOk(d) {
    const b = String(d.bedingung || "alle").toLowerCase().trim();
    if (b === "start") return total() > 0;
    if (b === "lexikon") return !!S.lex;
    if (b === "alle") return ET.length > 0 && ET.every((_, e) => etDone(e));
    if (b === "perfekt") return ET.length > 0 && ET.every((_, e) => etDone(e)) && Object.values(S.ans).every(a => !a.ok || a.first);
    const m = b.match(/^etappe:(\d+)$/); if (m) return !!ET[+m[1] - 1] && etDone(+m[1] - 1);
    const s = b.match(/^sterne:(\d+)$/); if (s) return total() >= +s[1];
    return false;
  }
  function checkDips() {
    DIP.forEach(d => {
      if (S.dips.includes(d.id) || !dipOk(d)) return;
      S.dips.push(d.id); save();
      if (HUB) HUB.badge(d.id);
      setTimeout(() => showDip(d), 500);
    });
    if (!S.fertig && ET.length && ET.every((_, e) => etDone(e))) { S.fertig = true; save(); if (HUB) HUB.fertig(); }
  }
  function report(e) { if (HUB) HUB.sterne("etappe-" + (e + 1), etStars(e)); }

  /* ---------- Text mit Fachwörtern (antippen = Erklärung) ---------- */
  function rich(txt) {
    const raw = String(nm(txt) ?? ""), taken = [];
    LEX.slice().sort((a, b) => b.wort.length - a.wort.length).forEach(w => {
      const re = new RegExp("(^|[^\\wäöüÄÖÜß])(" + w.wort.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?=[^\\wäöüÄÖÜß]|$)", "i");
      const m = re.exec(raw); if (!m) return;
      const st = m.index + m[1].length, en = st + m[2].length;
      if (taken.some(x => st < x.en && en > x.st)) return;
      taken.push({ st, en, w: w.wort });
    });
    taken.sort((a, b) => a.st - b.st);
    let h = "", pos = 0;
    taken.forEach(x => { h += esc(raw.slice(pos, x.st)) + `<button type="button" class="lex" data-lex="${esc(x.w)}">${esc(raw.slice(x.st, x.en))}</button>`; pos = x.en; });
    h += esc(raw.slice(pos));
    h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return h.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
  }

  /* ---------- Bausteine: jede Aufgabe ist ein Baustein, Infos davor sind «gLiTCh erklärt» ---------- */
  const B = [];
  ET.forEach((E, e) => {
    let pend = [], any = false;
    E.aufgaben.forEach((a, t) => { if (!scorable(a)) { pend.push(a); return; } B.push({ e, t, erkl: pend }); pend = []; any = true; });
    if (pend.length) { if (any) B[B.length - 1].nach = pend; else B.push({ e, t: -1, erkl: pend, info: true }); }
  });
  const bDone = i => { const x = B[i]; return x.info ? !!S.ans[k(x.e, "seen")] : solved(x.e, x.t); };
  const KIND = { info: "Info", mc: "Quiz", tf: "Richtig oder falsch?", text: "Antwort eintippen", luecke: "Lückentext", ordnen: "Reihenfolge", zuordnen: "Verbinden", schreiben: "Schreibauftrag",
    sortieren: "Sortier-Spiel", zeitmaschine: "Zeitmaschine", raetsel: "Rätsel", memory: "Memory", mehrfach: "Mehrere richtig", schaetzen: "Schätzen", gestalten: "Gestalten",
    wortsalat: "Buchstabensalat", wortraten: "Wort-Raten", blitz: "Blitzrunde", markieren: "Wörter markieren", wortsuche: "Wörtersuche", karteikarten: "Lernkarten", chat: "Chat-Gespräch", meinung: "Meinung bilden" };
  const TIPS = { mc: "Lies jede Antwort genau. Welche passt wirklich zur Frage?", tf: "Ein einziges falsches Wort macht die ganze Aussage falsch!", text: "Schau nochmals in «gLiTCh erklärt». Dort steht das Wort.",
    luecke: "Lies den ganzen Satz laut. Welches Wort klingt richtig?", ordnen: "Was passiert zuerst? Beginne mit dem, was du sicher weisst.", zuordnen: "Fang mit dem Paar an, bei dem du ganz sicher bist.",
    sortieren: "Überlege bei jeder Karte: Was ist das Besondere daran?", zeitmaschine: "Überlegt zuerst: Eher früher oder später als die anderen Ereignisse?", raetsel: "Holt euch ruhig den nächsten Hinweis!",
    memory: "Merkt euch, wo die Karten liegen. Sagt die Begriffe laut!", mehrfach: "Prüft jede Antwort einzeln: stimmt sie oder nicht?", schaetzen: "Vergleicht mit etwas, das ihr kennt.",
    gestalten: "Eine kurze, starke Überschrift und zwei, drei klare Sätze reichen.", schreiben: "Schreibt zuerst Stichworte, dann ganze Sätze.",
    wortsalat: "Mit welchem Buchstaben fängt das Wort wohl an?", wortraten: "Probiert zuerst die häufigen Buchstaben: E, N, R, A, S.", blitz: "Nicht zu lange überlegen: Das Erste, was ihr denkt, stimmt oft!",
    markieren: "Lest Satz für Satz und fragt bei jedem Wort: Passt es zur Anleitung?", wortsuche: "Sucht zuerst nach dem ersten Buchstaben eines Wortes.", karteikarten: "Sagt die Antwort laut, bevor ihr umdreht!",
    chat: "Was würde eine höfliche und kluge Person antworten?", meinung: "Eine gute Begründung braucht ein «weil» und ein Beispiel." };
  const PRAISE = ["Pixel-perfekt!", "Jawoll, richtig!", "Mega, das stimmt!", "Super gemacht!", "Volltreffer!"];
  const short = a => a.titel || (a.frage || a.aussage || a.auftrag || a.anleitung || a.person || "").split(/[?.!:]/)[0].split(" ").slice(0, 3).join(" ") || KIND[a.typ];

  const app = document.getElementById("app");
  let view = { b: 0 }, sayT = null;
  function say(text, mood = "happy", ms) {
    const t = $("#sayT"), g = $("#bigG"); if (!t) return;
    t.innerHTML = rich(nm(text)).replace(/^<p>|<\/p>$/g, ""); if (g) g.innerHTML = gsvg(mood);
    $$(".lex", t).forEach(b => b.onclick = () => showLex(b.dataset.lex));
    const bub = $("#say"); if (bub) { bub.classList.remove("pop"); void bub.offsetWidth; bub.classList.add("pop"); }
    clearTimeout(sayT); if (ms) sayT = setTimeout(() => { const x = B[view.b]; say(x ? `Baustein ${view.b + 1}: ${short(ET[x.e].aufgaben[x.t] || x.erkl[0] || {})}. ${TIPS_START}` : "", "normal"); }, ms);
  }
  const TIPS_START = O.tipps ? "Brauchst du Hilfe? Tippe auf «💡 Tipp»." : "";
  function frame() {
    app.innerHTML = `<header class="lab-top">
        <button type="button" class="menu-btn" id="menuBtn" aria-haspopup="true" aria-expanded="false">☰ Menü</button>
        <div class="logo"><span class="logo-g">gLiTCh</span><span class="logo-l">-Lab</span><span class="logo-chip">${esc(M.fachkurz || M.fachname || "Modul")}</span>
          <small>${esc(M.emoji || "")} ${esc(M.titel || "")}${HUB ? "" : ' · <b class="test">Testmodus</b>'}</small></div>
        <div class="talk"><div class="say-bub" id="say" aria-live="polite"><b>${esc(NAME)}</b><p id="sayT"></p></div><span class="glitch big" id="bigG">${gsvg("happy")}</span></div>
      </header>
      <div class="menu" id="menu" hidden>
        ${LEX.length ? `<button type="button" data-go="lex">📖 Lexikon <small>${LEX.length} Fachwörter</small></button>` : ""}
        ${DIP.length ? `<button type="button" data-go="dip">🏅 Diplome <small>${S.dips.length} von ${DIP.length}</small></button>` : ""}
        ${(M.links || []).length ? `<button type="button" data-go="links">🔗 Links</button>` : ""}
        ${O.pdf ? `<button type="button" data-go="pdf">📄 Zusammenfassung als PDF</button>` : ""}
        <button type="button" data-go="ziel">🏁 Ziel</button>
        ${HUB ? `<button type="button" data-go="exit">← Zurück zum Hub</button>` : ""}
      </div>
      <nav class="tabs" id="tabs" aria-label="Bausteine"></nav>
      <main class="lab-grid"><section class="stage" id="stage"></section><aside class="side" id="side"></aside></main>`;
    const mb = $("#menuBtn"), mn = $("#menu");
    mb.onclick = () => { mn.hidden = !mn.hidden; mb.setAttribute("aria-expanded", String(!mn.hidden)); };
    document.addEventListener("click", ev => { if (!mn.hidden && !mn.contains(ev.target) && ev.target !== mb) { mn.hidden = true; mb.setAttribute("aria-expanded", "false"); } });
    $$("[data-go]", mn).forEach(b => b.onclick = () => { mn.hidden = true; const g = b.dataset.go; if (g === "lex") showLex(); if (g === "dip") showDips(); if (g === "links") showLinks(); if (g === "ziel") goB(B.length); if (g === "pdf") summaryPdf(); if (g === "exit" && HUB) HUB.beenden(); });
    $("#bigG").onclick = () => { const x = B[view.b], a = x && ET[x.e].aufgaben[x.t]; say(a && O.tipps ? (a.tipp || TIPS[a.typ] || "Du schaffst das!") : a ? "Du schaffst das! Lies nochmals genau." : "Hoi! Ich bin gLiTCh.", "wink", 7000); };
  }
  function paintTabs() {
    let lastE = -1;
    $("#tabs").innerHTML = B.map((x, i) => { const a = ET[x.e].aufgaben[x.t] || x.erkl[0] || {}, sep = x.e !== lastE; lastE = x.e;
      const lock = !etUnlocked(x.e);
      return `${sep ? `<span class="tab-sep" title="${esc(ET[x.e].titel)}">${esc(ET[x.e].emoji || "")}</span>` : ""}<button type="button" class="tab${i === view.b ? " cur" : ""}${bDone(i) ? " done" : ""}${lock ? " locked" : ""}" data-b="${i}" aria-current="${i === view.b ? "step" : "false"}"${lock ? ' aria-disabled="true"' : ""}><b>${lock ? "🔒" : bDone(i) ? "✓" : i + 1}</b><span>${esc(short(a))}</span></button>`; }).join("")
      + `<button type="button" class="tab ziel${view.b >= B.length ? " cur" : ""}" data-b="${B.length}"><b>🏁</b><span>Ziel</span></button>`;
    $$("[data-b]", $("#tabs")).forEach(b => b.onclick = () => goB(+b.dataset.b));
    const cur = $(".tab.cur"); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "center" });
  }
  function paintSide() {
    const sd = $("#side"); if (!sd) return;
    const st = total(), mx = totalMax(), dn = B.filter((_, i) => bDone(i)).length;
    sd.innerHTML = `<div class="side-card lvl"><div class="ring" style="--p:${mx ? Math.round(st / mx * 100) : 0}"><span>★</span></div><div><small>Sterne in diesem Modul</small><b>${st} von ${mx}</b>${who() ? `<small>Team: ${esc(who())}</small>` : ""}</div></div>
      ${DIP.length ? `<div class="side-card"><small class="cap">Diplome: ${esc(M.titel || "")}</small><div class="hexes">${DIP.map(d => `<button type="button" class="hex${S.dips.includes(d.id) ? " got" : ""}" data-dip="${esc(d.id)}" title="${esc(d.name)}">${S.dips.includes(d.id) ? wall(d) : "🔒"}</button>`).join("")}</div>
        <p class="side-note">Tippt ein Diplom an, dann verrät ${esc(NAME)}, wie ihr es bekommt.</p></div>` : ""}
      <div class="side-card"><div class="prog-h"><b>Fortschritt</b><span>${dn} / ${B.length}</span></div><div class="pbar"><i style="width:${B.length ? Math.round(dn / B.length * 100) : 0}%"></i></div>
        ${ET.map((E, e) => { const se = S.selbst[e] && SELBST.find(x => x[0] === S.selbst[e].w);
          return `<div class="et-row${etDone(e) ? " ok" : ""}${etUnlocked(e) ? "" : " lock"}"><span>${etUnlocked(e) ? esc(E.emoji || "⭐") : "🔒"}</span><span>${esc(E.titel)}</span><small>${se ? se[1] + " " : ""}${etDone(e) ? (!gateNeeded(e) || gateDone(e) ? "✓" : "✓ · " + ({ selbst: "Einschätzung", praes: "Präsentation", lp: "Freigabe" })[missing(e)[0]] + " fehlt") : `★ ${etStars(e)}/${etMax(e)}`}</small></div>`; }).join("")}
        ${GATES.length ? `<p class="side-note">Nach jeder Etappe: ${andList(GATES.map(g => ({ selbst: "🪞 Selbsteinschätzung", praes: "🎤 Präsentation", lp: "🔐 Freigabe mit dem Code der Lehrperson" })[g]))}.</p>` : ""}</div>
      ${LEX.length ? `<div class="side-card"><div class="prog-h"><b>📖 Fachwörter</b><span>${(S.words || []).length} / ${LEX.length}</span></div><p class="side-note">Wörter mit gepunkteter Linie antippen: ${esc(NAME)} erklärt sie.</p><button type="button" class="btn small" data-golex>Lexikon öffnen</button></div>` : ""}`;
    $$("[data-dip]", sd).forEach(b => b.onclick = () => { const d = DIP.find(x => x.id === b.dataset.dip); say(S.dips.includes(d.id) ? `${d.emoji || "🏅"} **${d.name}**: geschafft! ${d.beschreibung || ""}` : `${d.emoji || "🏅"} **${d.name}**: ${d.beschreibung || "Löst die Bausteine, dann bekommt ihr es."}`, S.dips.includes(d.id) ? "cool" : "wink", 7000); });
    const gl2 = $("[data-golex]", sd); if (gl2) gl2.onclick = () => showLex();
  }
  function goB(i) {
    i = Math.max(0, Math.min(B.length, i));
    const x = B[i];
    if (x && !etUnlocked(x.e)) {
      let p = 0; while (p < x.e && etUnlocked(p + 1)) p++;   // letzte offene Etappe
      if (etDone(p) && gateNeeded(p) && !gateDone(p)) return gateDlg(p);
      return say(`🔒 Zuerst Etappe ${p + 1} «${ET[p].titel}» fertig machen${gateNeeded(p) ? " und " + andList(missing(p).map(g => GNAME[g])) : ""}.`, "hmm", 7000);
    }
    view.b = i; paintTabs(); stage(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  /* ---------- Freigabe-Fenster nach einer Etappe ---------- */
  function gateDlg(e, then) {
    const E = ET[e], nextI = B.findIndex(y => y.e === e + 1);
    const finish = () => { save(); paintTabs(); paintSide(); if (then) then(); else if (nextI >= 0) goB(nextI); else goB(B.length); };
    if (!gateNeeded(e) || gateDone(e)) return finish();
    const step = missing(e)[0], nSteps = stepsFor(e).length, nr = nSteps > 1 ? ` <small class="g-step">Schritt ${stepsFor(e).indexOf(step) + 1} von ${nSteps}</small>` : "";
    const pass = () => { S.gs[e] = Object.assign({}, S.gs[e], { [step]: new Date().toISOString() }); save(); paintTabs(); paintSide(); if (gateDone(e)) finish(); else setTimeout(() => gateDlg(e, then), 350); };
    if (step === "praes") return praesDlg(e, nr, pass);
    if (step === "selbst") {
      const ov = dlg(`<h2>🪞 Selbsteinschätzung${nr}</h2><div class="hero">${gl("wink")}<div class="bubble"><b>${esc(NAME)}</b><div><p>Etappe ${e + 1} «${esc(E.titel)}» ist geschafft! Wie gut kannst du das jetzt?</p></div></div></div>
        <div class="selbst" role="radiogroup" aria-label="Selbsteinschätzung">${SELBST.map(([v, ic, n]) => `<button type="button" class="sb" data-sb="${v}" role="radio" aria-checked="false"><span>${ic}</span>${esc(n)}</button>`).join("")}</div>
        <label class="f"><span>Das nehme ich mit (ein Satz, freiwillig)</span><textarea class="in" id="sbTxt" style="min-height:60px" placeholder="z. B. Ich weiss jetzt, dass …"></textarea></label>`);
      const ok = $("[data-x]", ov); ok.textContent = "Speichern und weiter →"; ok.disabled = true;
      let w = (S.selbst[e] || {}).w || "";
      const mark = () => { $$("[data-sb]", ov).forEach(b => { b.classList.toggle("on", b.dataset.sb === w); b.setAttribute("aria-checked", String(b.dataset.sb === w)); }); ok.disabled = !w; };
      $$("[data-sb]", ov).forEach(b => b.onclick = () => { w = b.dataset.sb; mark(); }); mark();
      ok.onclick = () => { if (!w) return; S.selbst[e] = { w, t: $("#sbTxt", ov).value.trim().slice(0, 300), at: new Date().toISOString() }; ov.remove(); say(w === "hilfe" ? "Gut, dass du das sagst! Frag deine Lehrperson oder schau nochmals in «gLiTCh erklärt»." : "Danke! Weiter geht's.", w === "hilfe" ? "hmm" : "happy", 6000); pass(); };
      return;
    }
    let code = "";
    const ov = dlg(`<h2>🔐 Freigabe durch die Lehrperson${nr}</h2><div class="hero">${gl("cool")}<div class="bubble"><b>${esc(NAME)}</b><div><p>${GATES.includes("praes") ? `Präsentation von Etappe ${e + 1} geschafft! Jetzt gibt eure Lehrperson mit ihrem Code ${e < ET.length - 1 ? "die nächste Etappe" : "das Ziel"} frei.` : `Etappe ${e + 1} «${esc(E.titel)}» ist geschafft! Zeigt eure Arbeit eurer Lehrperson. Sie gibt mit ihrem Code die nächste Etappe frei.`}</p></div></div></div>
      <div class="pin"><div class="pin-dots" id="pinD" aria-live="polite"></div><div class="pin-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-pn="${n}">${n}</button>`).join("")}<button type="button" data-pn="del" aria-label="Löschen">⌫</button><button type="button" data-pn="0">0</button><button type="button" class="go" data-pn="ok">OK</button></div><p class="err" id="pinE" role="alert"></p></div>`);
    $("[data-x]", ov).textContent = "Später";
    const paint = () => { $("#pinD", ov).textContent = code ? "●".repeat(code.length) : "Code eingeben"; };
    const check = () => {
      let ok = false; try { ok = HUB && HUB.pruefeCode ? !!HUB.pruefeCode(code) : code === String(O.code || "1234"); } catch (err) { ok = false; }
      if (ok) { ov.remove(); confetti(30); say(e < ET.length - 1 ? "Freigegeben! Weiter zur nächsten Etappe." : "Freigegeben! Ab zum Ziel.", "cool", 6000); pass(); }
      else { code = ""; paint(); $("#pinE", ov).textContent = "Falscher Code. Nochmals versuchen."; const p = $(".pin", ov); p.classList.remove("shake"); void p.offsetWidth; p.classList.add("shake"); }
    };
    $$("[data-pn]", ov).forEach(b => b.onclick = () => { const v = b.dataset.pn; $("#pinE", ov).textContent = "";
      if (v === "del") code = code.slice(0, -1); else if (v === "ok") return check(); else if (code.length < 8) code += v; paint(); });
    paint();
  }
  /* ---------- Präsentation einer Etappe (wie im gLiTCh-Lab): Stichworte, eigene Produkte, Vollbild ---------- */
  function praesDlg(e, nr, pass) {
    const E = ET[e], A = E.aufgaben;
    const own = A.map((a, t) => ({ a, x: S.ans[k(e, t)] })).filter(({ a, x }) => (a.typ === "schreiben" || a.typ === "gestalten") && x && x.v)
      .map(({ a, x }) => typeof x.v === "string" ? { titel: a.titel || KIND[a.typ], text: x.v } : { titel: x.v.titel || a.titel || KIND[a.typ], text: x.v.text || "", farbe: x.v.farbe });
    const txt = A.map(a => [a.text, a.frage, a.aussage, a.auftrag].join(" ")).join(" ");
    const words = LEX.filter(w => new RegExp("(^|[^\\wäöüÄÖÜß])" + w.wort.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?=[^\\wäöüÄÖÜß]|$)", "i").test(txt)).slice(0, 4);
    const ideas = A.filter(a => !scorable(a) && a.titel).map(a => a.titel).slice(0, 4);
    const ov = dlg(`<div class="praes" id="praesBox"><h2>🎤 Etappe ${e + 1} präsentieren${nr}</h2>
      <div class="praes-head" style="--ec:${["#E3A300", "#1F9D68", "#2E6BE6", "#DD4646", "#7B4CEF", "#00B3C7"][e % 6]}"><span>${esc(E.emoji || "⭐")}</span><div><b>${esc(E.titel)}</b>${E.ziel ? `<small>${esc(E.ziel)}</small>` : ""}</div><em>★ ${etStars(e)} / ${etMax(e)}</em></div>
      <p class="praes-lead">${who() ? esc(who()) + ": " : ""}Erzählt der Klasse oder eurer Lehrperson, was ihr in dieser Etappe herausgefunden habt.</p>
      <ol class="praes-list">
        <li><b>Worum ging es?</b> ${E.ziel ? esc(E.ziel) : "Erklärt das Thema in zwei Sätzen."}</li>
        ${ideas.length ? `<li><b>Das haben wir gelernt:</b> ${ideas.map(esc).join(" · ")}</li>` : ""}
        ${words.length ? `<li><b>Erklärt diese Fachwörter:</b> ${words.map(w => `<span class="pw">${esc(w.wort)}</span>`).join(" ")}</li>` : `<li><b>Ein schwieriges Wort</b> aus der Etappe erklären.</li>`}
        <li><b>Das war spannend oder schwierig:</b> Was nehmt ihr mit?</li>
      </ol>
      ${own.length ? `<h3>Unser Produkt</h3><div class="praes-own">${own.map(o => `<div class="po" style="--pc:${/^#[0-9a-f]{6}$/i.test(o.farbe || "") ? o.farbe : "var(--mc)"}"><b>${esc(o.titel)}</b><p>${esc(o.text).replace(/\n/g, "<br>")}</p></div>`).join("")}</div>` : ""}
      <div class="row praes-act"><button type="button" class="btn" data-full>⛶ Vollbild für die Klasse</button><button type="button" class="btn primary" data-done>✓ Wir haben präsentiert</button></div></div>`);
    $("[data-x]", ov).textContent = "Später";
    const box = $(".dlg", ov);
    $("[data-full]", ov).onclick = () => { try { if (document.fullscreenElement) document.exitFullscreen(); else box.requestFullscreen(); } catch (err) { box.classList.toggle("big"); } };
    $("[data-done]", ov).onclick = () => { try { if (document.fullscreenElement) document.exitFullscreen(); } catch (err) { /* egal */ } ov.remove(); confetti(30); say("Applaus! 👏 Toll präsentiert.", "cool", 5000); pass(); };
  }
  function readAloud(text) {
    try { const u = new SpeechSynthesisUtterance(String(text).replace(/\*\*/g, "")); u.lang = "de-CH"; u.rate = .95; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { say("Vorlesen geht auf diesem Gerät leider nicht.", "sad", 4000); }
  }
  function erklHTML(list, cls = "") {
    return list.map((a, n) => `<div class="erkl ${cls}"><div class="erkl-h">${gl("normal", "mini")}<b>${esc(NAME)} erklärt</b>${a.titel ? `<span>· ${esc(a.titel)}</span>` : ""}${O.vorlesen ? `<button type="button" class="btn small" data-read="${n}">🔊 Vorlesen</button>` : ""}</div><div class="txt">${rich(a.text || "")}</div></div>`).join("");
  }
  function stage() {
    const sg = $("#stage");
    if (view.b >= B.length) return ziel();
    const x = B[view.b], E = ET[x.e], a = E.aufgaben[x.t];
    const first = B.findIndex(y => y.e === x.e) === view.b, nInE = B.filter(y => y.e === x.e).length, posInE = B.slice(0, view.b).filter(y => y.e === x.e).length + 1;
    sg.innerHTML = `<div class="stage-card" style="--ec:${["#E3A300", "#1F9D68", "#2E6BE6", "#DD4646", "#7B4CEF", "#00B3C7"][x.e % 6]}">
      <div class="eyebrow"><span>Etappe ${x.e + 1} · ${esc(E.titel)}</span><span>Baustein ${view.b + 1} von ${B.length}</span></div>
      <h1>${esc(a ? short(a) : (x.erkl[0].titel || E.titel))}</h1>${first && E.ziel ? `<p class="lead">${esc(E.ziel)}</p>` : ""}
      ${erklHTML(x.erkl)}
      ${x.info ? `<div class="nav"><button type="button" class="btn" data-prev ${view.b ? "" : "disabled"}>← Zurück</button><button type="button" class="btn primary" data-next>${view.b === B.length - 1 ? "Zum Ziel 🏁" : "Weiter →"}</button></div>` : `<div id="task"></div>`}
      ${x.nach ? `<div id="nach" ${bDone(view.b) ? "" : "hidden"}>${erklHTML(x.nach, "nach")}</div>` : ""}
    </div>`;
    $$("[data-read]", sg).forEach(b => b.onclick = () => { const all = [...x.erkl, ...(x.nach || [])]; readAloud((all[+b.dataset.read + (b.closest(".nach") ? x.erkl.length : 0)] || {}).text || ""); });
    $$(".erkl .lex", sg).forEach(b => b.onclick = () => showLex(b.dataset.lex));
    if (x.info) { const wasSeen = etDone(x.e); S.ans[k(x.e, "seen")] = { seen: true }; save(); checkDips(); paintSide(); if (!wasSeen && etDone(x.e)) paintTabs(); $("[data-prev]").onclick = () => goB(view.b - 1); $("[data-next]").onclick = () => goB(view.b + 1); }
    else { view.e = x.e; view.t = x.t; renderTask(); }
    if (first && posInE === 1 && !bDone(view.b)) say(E.intro || `Etappe ${x.e + 1}: ${E.titel}. Los geht's!`, "happy", 9000);
    else say(`${a ? KIND[a.typ] : "Info"}: ${posInE} von ${nInE} in dieser Etappe. ${TIPS_START}`, "normal");
  }
  function ziel() {
    const all = ET.every((_, e) => etDone(e)), st = total(), mx = totalMax();
    $("#stage").innerHTML = `<div class="stage-card ziel-card"><div class="eyebrow"><span>Ziel</span><span>${B.filter((_, i) => bDone(i)).length} von ${B.length} Bausteinen</span></div>
      <h1>${all ? "Geschafft! 🎉" : "Fast am Ziel"}</h1>
      <div class="ziel-hero">${gl(all ? "cool" : "wink", "huge")}<div><p class="ziel-stars">★ ${st} <small>von ${mx}</small></p><p>${esc(all ? (M.schluss || "Super, ihr habt alles geschafft!") : "Löst die offenen Bausteine (ohne ✓ in der Leiste oben), dann seid ihr am Ziel.")}</p></div></div>
      ${DIP.length ? `<h3>Diplome</h3><div class="dips">${DIP.map(d => `<div class="dip${S.dips.includes(d.id) ? " got" : ""}"><span class="e wall" aria-hidden="true">${wall(d)}</span><b>${esc(d.name)}</b><small>${esc(d.beschreibung || "")}</small></div>`).join("")}</div>` : ""}
      ${GATES.includes("selbst") && Object.keys(S.selbst).length ? `<h3>Eure Selbsteinschätzung</h3><div class="selbst-list">${ET.map((E, e) => { const se = S.selbst[e], x = se && SELBST.find(y => y[0] === se.w); return x ? `<div><span>${x[1]}</span><b>${esc(E.titel)}</b><small>${esc(x[2])}${se.t ? " · «" + esc(se.t) + "»" : ""}</small></div>` : ""; }).join("")}</div>` : ""}
      ${O.pdf ? `<div class="pdf-box"><span>📄</span><div><b>Zusammenfassung als PDF</b><small>Alles Wichtige aus dem Modul${LEX.length ? ", die Fachwörter" : ""} und eure Sterne zum Aufbewahren.</small></div><button type="button" class="btn" data-pdf>Herunterladen</button></div>` : ""}
      <div class="nav"><button type="button" class="btn" data-prev>← Zurück</button>${HUB ? `<button type="button" class="btn primary" data-exit>Zurück zum Hub</button>` : ""}</div></div>`;
    $("[data-prev]").onclick = () => goB(B.length - 1);
    const pb = $("[data-pdf]"); if (pb) pb.onclick = () => summaryPdf(pb);
    const ex = $("[data-exit]"); if (ex) ex.onclick = () => HUB.beenden();
    say(all ? (M.schluss || "Ihr habt alles geschafft!") : "Noch nicht ganz! Schaut, welche Bausteine noch kein ✓ haben.", all ? "cool" : "wink");
    if (all) confetti(40);
  }
  function done(e, t, ok, first, extra, pts) {
    const key = k(e, t), old = S.ans[key] || {}, a = ET[e].aufgaben[t];
    if (old.ok) return;
    const wasDone = etDone(e), tries = (old.tries || 0) + 1;
    if (pts == null) pts = ok ? Math.max(1, wert(a) - (tries - 1)) : 0;
    S.ans[key] = Object.assign({}, old, extra || {}, { ok, tries, pts, first: ok && tries === 1 && pts >= wert(a) });
    save(); if (ok) { report(e); confetti(); }
    checkDips(); paintSide(); paintTabs();
    const nach = $("#nach"); if (ok && nach) nach.hidden = false;
    if (ok && !wasDone && etDone(e)) { setTimeout(() => say(`${ET[e].lob || "Etappe geschafft!"} ⭐`, "cool", 9000), 900); if (gateNeeded(e) && !gateDone(e)) { const when = () => { if (gateDone(e)) return; if (document.querySelector(".ov")) return setTimeout(when, 500); gateDlg(e); }; setTimeout(when, 2200); } }
  }
  function fb(ok, text) {
    const f = document.createElement("div"); f.className = "fb " + (ok ? "ok" : "bad");
    f.innerHTML = `${gl(ok ? "happy" : "hmm")}<div><p><b>${ok ? "Richtig!" : "Noch nicht ganz."}</b></p>${text ? rich(text) : ""}</div>`;
    const old = $("#task .fb"); if (old) old.remove();
    $("#task .task").appendChild(f);
    $$(".lex", f).forEach(b => b.onclick = () => showLex(b.dataset.lex));
    const x = B[view.b], a = x && ET[x.e].aufgaben[x.t];
    if (ok) say(PRAISE[Math.floor(Math.random() * PRAISE.length)] + (a && wert(a) > 1 ? " Spiel gemeistert!" : ""), "happy", 5000);
    else say(!O.tipps ? "Versuch es nochmal!" : a && a.tipp ? `Kleiner Tipp: ${a.tipp}` : (TIPS[a && a.typ] || "Versuch es nochmal!"), "hmm", 9000);
  }
  function renderTask() {
    const { e, t } = view, A = ET[e].aufgaben, a = A[t], key = k(e, t), st = S.ans[key] || {};
    const last = view.b === B.length - 1;
    const stars = scorable(a) ? ` · bis ${Math.max(1, Math.round(wert(a) * SCL))} ★` : "";
    let body = "";
    if (a.typ === "info") body = `<h3>${esc(a.titel || "")}</h3><div class="txt">${rich(a.text || "")}</div>`;
    if (a.typ === "mc") body = `<h3>${rich(a.frage).replace(/^<p>|<\/p>$/g, "")}</h3><div class="opts">${(a.optionen || []).map((o, i) => `<button type="button" class="opt${st.ok && i === +a.richtig ? " ok" : ""}" data-o="${i}" ${st.ok ? 'aria-disabled="true"' : ""}>${esc(o)}</button>`).join("")}</div>`;
    if (a.typ === "tf") body = `<h3>${rich(a.aussage).replace(/^<p>|<\/p>$/g, "")}</h3><div class="tf"><button type="button" class="opt" data-tf="1">👍 Richtig</button><button type="button" class="opt" data-tf="0">👎 Falsch</button></div>`;
    if (a.typ === "text") body = `<h3>${rich(a.frage).replace(/^<p>|<\/p>$/g, "")}</h3><div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><input class="in" id="ans" autocomplete="off" style="flex:1;min-width:180px" value="${esc(st.v || "")}" placeholder="Deine Antwort"><button type="button" class="btn primary" data-check>Prüfen</button></div>`;
    if (a.typ === "luecke") {
      let n = 0; const opts = a.optionen && a.optionen.length ? a.optionen : null;
      const html = esc(a.text || "").replace(/\[\[(.+?)\]\]/g, () => { const i = n++; return opts ? `<select class="in gap" data-g="${i}"><option value="">…</option>${opts.map(o => `<option>${esc(o)}</option>`).join("")}</select>` : `<input class="in gap" data-g="${i}" autocomplete="off" size="10">`; });
      body = `<h3>${esc(a.anleitung || "Fülle die Lücken.")}</h3><div class="txt"><p style="line-height:2.2">${html.replace(/\n/g, "<br>")}</p></div><button type="button" class="btn primary" data-check>Prüfen</button>`;
    }
    if (a.typ === "ordnen") {
      const items = st.order || shuffle((a.elemente || []).map((x, i) => i));
      view.order = items.slice();
      body = `<h3>${esc(a.frage || "Bringe in die richtige Reihenfolge.")}</h3><ol class="order" id="ord"></ol><button type="button" class="btn primary" data-check>Prüfen</button>`;
    }
    if (a.typ === "zuordnen") {
      view.mt = { sel: null, ok: st.ok ? a.paare.map((_, i) => i) : [], miss: 0, right: shuffle(a.paare.map((_, i) => i)) };
      body = `<h3>${esc(a.frage || "Was gehört zusammen?")}</h3><p class="hintline">Tippe links einen Begriff an, dann rechts das Passende.</p><div class="connect"><div class="col" id="mtL"></div><div class="col" id="mtR"></div></div>`;
    }
    if (a.typ === "sortieren") {
      const cats = (a.kategorien || []).map(String);
      view.so = { i: 0, right: 0, order: shuffle((a.elemente || []).map((_, i) => i)), log: [] };
      body = `<h3>${esc(a.frage || "Sortiere!")}</h3><div class="sorter"><div class="sort-card" id="soCard" aria-live="polite"></div><div class="sort-bins">${cats.map((c, i) => `<button type="button" class="bin" data-bin="${esc(c)}" style="--h:${(i * 97 + 180) % 360}"><span>${esc(c)}</span></button>`).join("")}</div><p class="hintline" id="soInfo"></p></div>`;
    }
    if (a.typ === "zeitmaschine") {
      view.zm = { i: 0, res: [] };
      body = `<h3>${esc(a.frage || "Stellt die Zeitmaschine auf das richtige Jahr!")}</h3><div class="tm"><div class="tm-ev" id="tmEv"></div>
        <div class="tm-dial"><output id="tmOut">${a.von}</output><span class="tm-unit">${esc(a.einheit || "")}</span></div>
        <input type="range" class="tm-range" id="tmR" min="${+a.von}" max="${+a.bis}" step="1" value="${Math.round((+a.von + +a.bis) / 2)}" aria-label="Jahr wählen">
        <div class="tm-ticks"><span>${a.von}</span><span>${Math.round((+a.von + +a.bis) / 2)}</span><span>${a.bis}</span></div>
        <div class="row" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn small" data-tm="-10">−10</button><button type="button" class="btn small" data-tm="-1">−1</button><button type="button" class="btn small" data-tm="1">+1</button><button type="button" class="btn small" data-tm="10">+10</button></div>
        <button type="button" class="btn primary" id="tmGo">🚀 Losreisen!</button><ul class="tm-log" id="tmLog"></ul></div>`;
    }
    if (a.typ === "raetsel") {
      view.ra = view.ra && view.ra.key === key ? view.ra : { key, shown: 1 };
      body = `<h3>${esc(a.frage || "Wer oder was ist gemeint?")}</h3><p class="hintline">Je weniger Hinweise ihr braucht, desto mehr Sterne.</p><ol class="clues" id="raL"></ol>
        <div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><input class="in" id="ans" autocomplete="off" style="flex:1;min-width:180px" placeholder="Eure Lösung"><button type="button" class="btn primary" data-check>Prüfen</button><button type="button" class="btn" id="raMore">💡 Nächster Hinweis</button></div>`;
    }
    if (a.typ === "memory") {
      const cards = shuffle(a.paare.flatMap((p, i) => [{ i, txt: p[0] }, { i, txt: p[1] }]));
      view.me = { cards, open: [], found: st.ok ? a.paare.map((_, i) => i) : [], miss: 0, lock: false };
      body = `<h3>${esc(a.frage || "Findet die Paare!")}</h3><p class="hintline">Deckt zwei Karten auf. Passen sie zusammen, bleiben sie offen.</p><div class="memory" id="meG"></div><p class="hintline" id="meInfo"></p>`;
    }
    if (a.typ === "mehrfach") {
      view.mf = new Set();
      body = `<h3>${rich(a.frage).replace(/^<p>|<\/p>$/g, "")}</h3><p class="hintline">Es können mehrere Antworten richtig sein.</p><div class="opts">${(a.optionen || []).map((o, i) => `<button type="button" class="opt chk" data-mf="${i}" aria-pressed="false"><i aria-hidden="true"></i>${esc(o)}</button>`).join("")}</div><button type="button" class="btn primary" data-check style="margin-top:12px">Prüfen</button>`;
    }
    if (a.typ === "schaetzen") {
      const mid = Math.round((+a.min + +a.max) / 2);
      body = `<h3>${rich(a.frage).replace(/^<p>|<\/p>$/g, "")}</h3><div class="tm"><div class="tm-dial"><output id="esOut">${mid.toLocaleString("de-CH")}</output><span class="tm-unit">${esc(a.einheit || "")}</span></div>
        <input type="range" class="tm-range" id="esR" min="${+a.min}" max="${+a.max}" step="${Math.max(1, Math.round((+a.max - +a.min) / 200))}" value="${mid}" aria-label="Schätzwert">
        <div class="tm-ticks"><span>${(+a.min).toLocaleString("de-CH")}</span><span>${(+a.max).toLocaleString("de-CH")}</span></div><button type="button" class="btn primary" data-check>Prüfen</button></div>`;
    }
    if (a.typ === "gestalten") {
      const v = st.v || {}, COLS = ["#FF6A00", "#FF2BD6", "#2EE6D6", "#A07CFF", "#3CFF7A", "#FFC21A"], stick = (a.sticker && a.sticker.length ? a.sticker : ["⭐", "💡", "🎉", "❤️", "🔥", "🌈"]).slice(0, 8);
      view.ge = Object.assign({ titel: "", text: "", farbe: "", sticker: "" }, v);
      body = `<h3>${rich(a.auftrag).replace(/^<p>|<\/p>$/g, "")}</h3><div class="maker"><div class="mk-form">
          <label class="f"><span>${esc(a.titelname || "Überschrift")}</span><input class="in" id="geT" maxlength="60" value="${esc(view.ge.titel)}"></label>
          <label class="f"><span>${esc(a.textname || "Text")}</span><textarea class="in" id="geX">${esc(view.ge.text)}</textarea></label>
          <div class="f"><span>Farbe</span><div class="sw">${COLS.map(c => `<button type="button" class="swb" data-gc="${c}" style="--c:${c}" aria-label="Farbe ${c}" aria-pressed="${view.ge.farbe === c}"></button>`).join("")}</div></div>
          <div class="f"><span>Sticker</span><div class="sw">${stick.map(x => `<button type="button" class="stk" data-gs="${esc(x)}" aria-pressed="${view.ge.sticker === x}">${esc(x)}</button>`).join("")}</div></div>
        </div><div class="poster" id="gePv"></div></div><p class="hintline" id="geInfo"></p><button type="button" class="btn primary" data-check>Fertig gestaltet</button>`;
    }
    if (a.typ === "schreiben") body = `<h3>${rich(a.auftrag).replace(/^<p>|<\/p>$/g, "")}</h3><textarea class="in" id="wr" placeholder="Schreibe hier …">${esc(st.v || "")}</textarea><p style="color:var(--muted);margin:6px 0" id="wc"></p><button type="button" class="btn primary" data-check>Abgeben</button>`;
    /* ---------- neue Aufgabenarten ---------- */
    const up = s => String(s || "").toUpperCase().replace(/ß/g, "SS");
    if (a.typ === "wortsalat") {
      const w = up(a.wort).replace(/[^A-ZÄÖÜ]/g, "");
      view.ws = view.ws && view.ws.key === key ? view.ws : { key, w, pool: shuffle(w.split("").map((c, i) => ({ c, i }))), pick: [] };
      body = `<h3>${rich(a.frage || "Welches Wort versteckt sich hier?").replace(/^<p>|<\/p>$/g, "")}</h3><p class="hintline">Tippt die Buchstaben in der richtigen Reihenfolge an. Antippen im Wort nimmt einen Buchstaben zurück.</p>
        <div class="ws-slots" id="wsS"></div><div class="ws-pool" id="wsP"></div><button type="button" class="btn primary" data-check>Prüfen</button>`;
    }
    if (a.typ === "wortraten") {
      const w = up(a.wort);
      view.wr = view.wr && view.wr.key === key ? view.wr : { key, w, got: new Set(), miss: 0 };
      body = `<h3>${rich(a.frage || "Welches Wort ist gesucht?").replace(/^<p>|<\/p>$/g, "")}</h3><p class="hintline">Tippt Buchstaben an. Bei 7 falschen Buchstaben ist der Akku leer.</p>
        <div class="wr-word" id="wrW"></div><div class="wr-bat" id="wrB" aria-live="polite"></div><div class="wr-keys" id="wrK"></div>`;
    }
    if (a.typ === "blitz") {
      view.bz = { i: -1, right: 0, t: null, left: 0 };
      body = `<h3>${rich(a.frage || "Blitzrunde: Stimmt das?").replace(/^<p>|<\/p>$/g, "")}</h3><p class="hintline">${(a.aussagen || []).length} Aussagen, je ${+a.sekunden || 8} Sekunden. Schnell entscheiden!</p>
        <div class="bz" id="bz"><button type="button" class="btn primary" id="bzGo">⚡ Blitzrunde starten</button></div>`;
    }
    if (a.typ === "markieren") {
      const toks = []; String(a.text || "").split(/(\s+)/).forEach(p => { if (/^\s+$/.test(p) || !p) { toks.push({ sp: p }); return; } const m = p.match(/^([«"(]*)\*(.+?)\*([.,;:!?»")]*)$/); if (m) toks.push({ pre: m[1], w: m[2], post: m[3], hit: true }); else { const m2 = p.match(/^([«"(]*)(.*?)([.,;:!?»")]*)$/); toks.push({ pre: m2[1], w: m2[2].replace(/\*/g, ""), post: m2[3], hit: false }); } });
      view.mk = view.mk && view.mk.key === key ? view.mk : { key, toks, on: new Set() };
      body = `<h3>${esc(a.anleitung || "Markiert die richtigen Wörter.")}</h3><p class="hintline">Antippen markiert ein Wort, nochmals antippen nimmt die Markierung weg.</p><p class="mk-text" id="mkT"></p><button type="button" class="btn primary" data-check>Prüfen</button>`;
    }
    if (a.typ === "wortsuche") {
      view.su = view.su && view.su.key === key ? view.su : Object.assign({ key, found: [], sel: null }, buildGrid((a.woerter || []).map(up)));
      body = `<h3>${rich(a.frage || "Findet die versteckten Wörter!").replace(/^<p>|<\/p>$/g, "")}</h3><p class="hintline">Tippt den ersten und dann den letzten Buchstaben eines Wortes an. Die Wörter stehen waagrecht, senkrecht oder schräg.</p>
        <div class="su-wrap"><div class="su-grid" id="suG"></div><ul class="su-list" id="suL"></ul></div>`;
    }
    if (a.typ === "karteikarten") {
      view.kk = view.kk && view.kk.key === key ? view.kk : { key, stack: shuffle((a.karten || []).map((_, i) => i)), flip: false, known: 0, again: 0 };
      body = `<h3>${rich(a.frage || "Lernkarten").replace(/^<p>|<\/p>$/g, "")}</h3><p class="hintline">Lest die Vorderseite, überlegt die Antwort und dreht die Karte um. Seid ehrlich: Was ihr noch nicht wusstet, kommt nochmals.</p><div class="kk" id="kk"></div>`;
    }
    if (a.typ === "chat") {
      view.ch = view.ch && view.ch.key === key ? view.ch : { key, i: 0, log: [], miss: 0 };
      body = `<h3>${rich(a.frage || "Chattet mit " + (a.person || "jemandem")).replace(/^<p>|<\/p>$/g, "")}</h3><div class="chat"><div class="chat-head"><span>${esc(a.emoji || "🙂")}</span><b>${esc(a.person || "Chat")}</b><small>online</small></div><div class="chat-log" id="chL" aria-live="polite"></div><div class="chat-opts" id="chO"></div></div>`;
    }
    if (a.typ === "meinung") {
      const v = st.v || {}; view.mn = Object.assign({ pos: 50, args: [], text: "" }, v);
      body = `<h3>${rich(a.frage || "Was meint ihr?").replace(/^<p>|<\/p>$/g, "")}</h3><div class="mn">
        <div class="mn-scale"><span>${esc(a.links || "Ja")}</span><input type="range" min="0" max="100" value="${view.mn.pos}" id="mnR" aria-label="Eure Meinung"><span>${esc(a.rechts || "Nein")}</span></div>
        ${(a.argumente || []).length ? `<p class="hintline">Welche Argumente überzeugen euch? (mindestens eins)</p><div class="mn-args">${a.argumente.map((x, i) => `<button type="button" class="opt chk" data-mn="${i}" aria-pressed="${view.mn.args.includes(i)}"><i aria-hidden="true"></i>${esc(x)}</button>`).join("")}</div>` : ""}
        <label class="f"><span>Begründet eure Meinung (mit «weil …»)</span><textarea class="in" id="mnX" placeholder="Wir finden, dass …, weil …">${esc(view.mn.text)}</textarea></label><p class="hintline" id="mnI"></p>
        <button type="button" class="btn primary" data-check>Meinung abgeben</button></div>`;
    }
    $("#task").innerHTML = `<div class="task"><div class="task-h"><span class="kind">${KIND[a.typ] || "Aufgabe"}${stars}</span>${O.tipps ? `<button type="button" class="tipbtn" data-tip>💡 Tipp von ${esc(NAME)}</button>` : ""}</div>${body}</div>
      <div class="nav"><button type="button" class="btn" data-prev ${view.b ? "" : "disabled"}>← Zurück</button><button type="button" class="btn primary" data-next>${last ? "Zum Ziel 🏁" : "Weiter →"}</button></div>`;
    if ($("[data-tip]")) $("[data-tip]").onclick = () => say(a.tipp || TIPS[a.typ] || "Lies nochmals in «gLiTCh erklärt» nach!", "wink", 10000);
    $$("#task .lex").forEach(b => b.onclick = () => showLex(b.dataset.lex));
    if (a.typ === "info") { S.ans[key] = { ok: false, seen: true }; if (!etMax(e)) S.ans[k(e, "seen")] = { seen: true }; save(); }
    if (st.ok && a.typ !== "info") fb(true, a.erklaerung);
    const chk = $("[data-check]");
    if (a.typ === "mc") $$("[data-o]").forEach(b => b.onclick = () => { if ((S.ans[key] || {}).ok) return; const ok = +b.dataset.o === +a.richtig; b.classList.add(ok ? "ok" : "bad"); if (!ok) b.setAttribute("aria-disabled", "true"); done(e, t, ok, true); fb(ok, ok ? a.erklaerung : (a.tipp || "Versuch es nochmal!")); if (ok) $$("[data-o]").forEach(x => x.setAttribute("aria-disabled", "true")); });
    if (a.typ === "tf") $$("[data-tf]").forEach(b => b.onclick = () => { if ((S.ans[key] || {}).ok) return; const ok = (b.dataset.tf === "1") === !!a.richtig; b.classList.add(ok ? "ok" : "bad"); done(e, t, ok, true); fb(ok, ok ? a.erklaerung : (a.tipp || "Überlege nochmal!")); });
    if (a.typ === "text") { const go = () => { const v = $("#ans").value; const ok = (a.antworten || []).some(x => norm(x) === norm(v)); done(e, t, ok, true, { v }); fb(ok, ok ? a.erklaerung : (a.tipp || "Versuch es nochmal. Achte auf die Schreibweise.")); }; chk.onclick = go; $("#ans").onkeydown = ev => { if (ev.key === "Enter") go(); }; }
    if (a.typ === "luecke") chk.onclick = () => { const sol = [...String(a.text || "").matchAll(/\[\[(.+?)\]\]/g)].map(m => m[1].split("|")); let all = true;
      $$("[data-g]").forEach(g => { const ok = sol[+g.dataset.g].some(x => norm(x) === norm(g.value)); g.classList.toggle("ok", ok); g.classList.toggle("bad", !ok); all = all && ok; });
      done(e, t, all, true); fb(all, all ? a.erklaerung : "Die roten Lücken stimmen noch nicht."); };
    if (a.typ === "ordnen") { const paint = () => { $("#ord").innerHTML = view.order.map((ix, p) => `<li><span>${esc(a.elemente[ix])}</span><button type="button" class="btn small" data-up="${p}" ${p ? "" : "disabled"} aria-label="Nach oben">↑</button><button type="button" class="btn small" data-dn="${p}" ${p < view.order.length - 1 ? "" : "disabled"} aria-label="Nach unten">↓</button></li>`).join("");
        $$("[data-up]").forEach(b => b.onclick = () => { const p = +b.dataset.up; [view.order[p - 1], view.order[p]] = [view.order[p], view.order[p - 1]]; paint(); });
        $$("[data-dn]").forEach(b => b.onclick = () => { const p = +b.dataset.dn; [view.order[p + 1], view.order[p]] = [view.order[p], view.order[p + 1]]; paint(); }); };
      paint(); chk.onclick = () => { const ok = view.order.every((ix, p) => ix === p); $$("#ord li").forEach((li, p) => li.classList.toggle(view.order[p] === p ? "ok" : "bad", true)); done(e, t, ok, true, { order: view.order.slice() }); fb(ok, ok ? a.erklaerung : "Die rot markierten stehen noch am falschen Platz."); setTimeout(paint, ok ? 99999 : 1400); }; }
    if (a.typ === "zuordnen") { const M = view.mt, paint = () => {
        $("#mtL").innerHTML = a.paare.map((p, i) => `<button type="button" class="cn${M.ok.includes(i) ? " done c" + (M.ok.indexOf(i) % 6) : ""}${M.sel === i ? " sel" : ""}" data-l="${i}" ${M.ok.includes(i) ? 'aria-disabled="true"' : ""}>${esc(p[0])}</button>`).join("");
        $("#mtR").innerHTML = M.right.map(i => `<button type="button" class="cn${M.ok.includes(i) ? " done c" + (M.ok.indexOf(i) % 6) : ""}" data-r="${i}" ${M.ok.includes(i) ? 'aria-disabled="true"' : ""}>${esc(a.paare[i][1])}</button>`).join("");
        $$("[data-l]").forEach(b => b.onclick = () => { if (M.ok.includes(+b.dataset.l)) return; M.sel = +b.dataset.l; paint(); });
        $$("[data-r]").forEach(b => b.onclick = () => { const r = +b.dataset.r; if (M.sel == null || M.ok.includes(r)) { if (M.sel == null) b.animate([{ transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "none" }], { duration: 250 }); return; }
          if (r === M.sel) { M.ok.push(r); M.sel = null; paint(); if (M.ok.length === a.paare.length) { done(e, t, true, M.miss === 0, {}, M.miss <= 1 ? 2 : 1); fb(true, a.erklaerung); } }
          else { M.miss++; b.classList.add("bad"); setTimeout(() => { M.sel = null; paint(); }, 600); } }); };
      paint(); }
    if (a.typ === "sortieren") { const O = view.so, cards = O.order, paint = () => {
        const n = cards.length, it = a.elemente[cards[O.i]];
        $("#soCard").innerHTML = O.i < n ? `<small>${O.i + 1} / ${n}</small><b>${esc(it.text)}</b>` : `<small>Fertig</small><b>${O.right} von ${n} richtig</b>`;
        $("#soInfo").textContent = O.log.length ? O.log[O.log.length - 1] : "Wohin gehört diese Karte?";
        $$("[data-bin]").forEach(b => b.disabled = O.i >= n || !!st.ok); };
      $$("[data-bin]").forEach(b => b.onclick = () => { const n = cards.length; if (O.i >= n) return; const it = a.elemente[cards[O.i]], ok = norm(it.kat) === norm(b.dataset.bin);
        if (ok) O.right++; O.log.push(ok ? "✓ Richtig!" : `✗ Gehört zu «${it.kat}».${it.warum ? " " + it.warum : ""}`);
        b.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 250 }); $("#soCard").classList.toggle("bad", !ok); $("#soCard").classList.toggle("good", ok);
        O.i++; paint();
        if (O.i >= n) { const r = O.right / n; done(e, t, true, r === 1, {}, r === 1 ? 3 : r >= .7 ? 2 : 1); fb(r >= .7, (r === 1 ? "" : `${O.right} von ${n} richtig. `) + (a.erklaerung || "")); } });
      paint(); }
    if (a.typ === "zeitmaschine") { const Z = view.zm, ev = a.ereignisse || [], span = Math.max(1, +a.bis - +a.von), R0 = $("#tmR");
      const pts = d => d <= Math.max(1, span * .02) ? 3 : d <= span * .08 ? 2 : d <= span * .2 ? 1 : 0;
      const paint = () => { $("#tmEv").innerHTML = Z.i < ev.length ? `<small>Reise ${Z.i + 1} von ${ev.length}</small><b>${esc(ev[Z.i].text)}</b>` : `<small>Alle Reisen geschafft</small><b>🕰️ Zurück in der Gegenwart!</b>`;
        $("#tmLog").innerHTML = Z.res.map(r => `<li class="p${r.p}"><span>${esc(r.text)}</span><b>${r.jahr}</b><small>${r.d === 0 ? "Punktlandung!" : `ihr wart ${r.d} daneben`} ${"★".repeat(r.p)}</small></li>`).join("");
        $("#tmGo").disabled = Z.i >= ev.length || !!st.ok; };
      const show = () => { $("#tmOut").textContent = R0.value; }; R0.oninput = show; show();
      $$("[data-tm]").forEach(b => b.onclick = () => { R0.value = Math.max(+a.von, Math.min(+a.bis, +R0.value + +b.dataset.tm)); show(); });
      $("#tmGo").onclick = () => { if (Z.i >= ev.length) return; const x = ev[Z.i], d = Math.abs(+R0.value - +x.jahr); Z.res.push({ text: x.text, jahr: x.jahr, d, p: pts(d) }); Z.i++;
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches) $(".tm").animate([{ filter: "hue-rotate(0)" }, { filter: "hue-rotate(160deg) blur(1px)" }, { filter: "hue-rotate(0)" }], { duration: 500 });
        paint(); if (Z.i >= ev.length) { const avg = Z.res.reduce((n, r) => n + r.p, 0) / ev.length; done(e, t, true, avg >= 2.5, {}, Math.max(1, Math.round(avg))); fb(avg >= 1.5, a.erklaerung || "Gut gereist!"); } };
      paint(); }
    if (a.typ === "raetsel") { const Q = view.ra, H = a.hinweise || [], paint = () => { $("#raL").innerHTML = H.slice(0, Q.shown).map(h => `<li>${esc(h)}</li>`).join(""); $("#raMore").disabled = Q.shown >= H.length || !!st.ok; };
      paint(); $("#raMore").onclick = () => { Q.shown = Math.min(H.length, Q.shown + 1); paint(); };
      const go = () => { const ok = (a.antworten || []).some(x => norm(x) === norm($("#ans").value)); if (ok) { done(e, t, true, Q.shown === 1, {}, Math.max(1, 3 - (Q.shown - 1))); fb(true, a.erklaerung); } else { const old = S.ans[key] || {}; S.ans[key] = Object.assign({}, old, { tries: (old.tries || 0) + 1 }); save(); fb(false, Q.shown < H.length ? "Noch nicht. Holt euch einen weiteren Hinweis!" : (a.tipp || "Versucht es nochmal.")); } };
      chk.onclick = go; $("#ans").onkeydown = ev => { if (ev.key === "Enter") go(); }; }
    if (a.typ === "memory") { const Me = view.me, paint = () => {
        $("#meG").innerHTML = Me.cards.map((c, n) => { const up = Me.found.includes(c.i) || Me.open.includes(n); return `<button type="button" class="mcard${up ? " up" : ""}${Me.found.includes(c.i) ? " found" : ""}" data-mc="${n}" aria-label="${up ? esc(c.txt) : "Verdeckte Karte"}"><span class="back" aria-hidden="true">?</span><span class="front">${esc(c.txt)}</span></button>`; }).join("");
        $("#meInfo").textContent = `${Me.found.length} von ${a.paare.length} Paaren · ${Me.miss} Fehlversuche`;
        $$("[data-mc]").forEach(b => b.onclick = () => { const n = +b.dataset.mc, c = Me.cards[n]; if (Me.lock || Me.found.includes(c.i) || Me.open.includes(n)) return; Me.open.push(n); paint();
          if (Me.open.length === 2) { const [x, y] = Me.open.map(m => Me.cards[m]); Me.lock = true;
            setTimeout(() => { if (x.i === y.i) Me.found.push(x.i); else Me.miss++; Me.open = []; Me.lock = false; paint();
              if (Me.found.length === a.paare.length && !(S.ans[key] || {}).ok) { const pp = Me.miss <= a.paare.length ? 3 : Me.miss <= 2 * a.paare.length ? 2 : 1; done(e, t, true, pp === 3, {}, pp); fb(true, a.erklaerung || "Alle Paare gefunden!"); } }, x.i === y.i ? 350 : 900); } }); };
      paint(); }
    if (a.typ === "mehrfach") { const ok0 = new Set((a.richtig || []).map(Number));
      $$("[data-mf]").forEach(b => b.onclick = () => { if ((S.ans[key] || {}).ok) return; const i = +b.dataset.mf; if (view.mf.has(i)) view.mf.delete(i); else view.mf.add(i); b.setAttribute("aria-pressed", String(view.mf.has(i))); $$("[data-mf]").forEach(x => x.classList.remove("ok", "bad")); });
      chk.onclick = () => { const ok = view.mf.size === ok0.size && [...view.mf].every(i => ok0.has(i)); $$("[data-mf]").forEach(b => { const i = +b.dataset.mf; if (view.mf.has(i)) b.classList.add(ok0.has(i) ? "ok" : "bad"); });
        const miss = [...ok0].filter(i => !view.mf.has(i)).length; done(e, t, ok, true); fb(ok, ok ? a.erklaerung : miss && ![...view.mf].some(i => !ok0.has(i)) ? `Es fehlt noch ${miss === 1 ? "eine richtige Antwort" : miss + " richtige Antworten"}.` : (a.tipp || "Die rot markierten stimmen nicht.")); }; }
    if (a.typ === "schaetzen") { const R1 = $("#esR"), show = () => { $("#esOut").textContent = (+R1.value).toLocaleString("de-CH"); }; R1.oninput = show; show();
      chk.onclick = () => { const v = +R1.value, d = v - +a.antwort, ok = Math.abs(d) <= (+a.toleranz || Math.round((+a.max - +a.min) * .05)); done(e, t, ok, true, { v }); fb(ok, ok ? `Die richtige Zahl ist ${(+a.antwort).toLocaleString("de-CH")} ${a.einheit || ""}. ${a.erklaerung || ""}` : (d > 0 ? "Das ist zu hoch geschätzt. " : "Das ist zu tief geschätzt. ") + (a.tipp || "")); }; }
    if (a.typ === "gestalten") { const V = view.ge, min = +a.mindestwoerter || 15, paint = () => {
        $("#gePv").style.setProperty("--pc", V.farbe || "#A07CFF");
        $("#gePv").innerHTML = `<span class="pst" aria-hidden="true">${esc(V.sticker || "")}</span><b>${esc(V.titel || "Eure Überschrift")}</b><p>${esc(V.text || "Euer Text erscheint hier …")}</p>`;
        const n = (V.text.match(/\S+/g) || []).length; $("#geInfo").textContent = `${n} von mindestens ${min} Wörtern${V.farbe ? "" : " · Farbe wählen"}`; };
      $("#geT").oninput = ev => { V.titel = ev.target.value; paint(); }; $("#geX").oninput = ev => { V.text = ev.target.value; paint(); };
      $$("[data-gc]").forEach(b => b.onclick = () => { V.farbe = b.dataset.gc; $$("[data-gc]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); paint(); });
      $$("[data-gs]").forEach(b => b.onclick = () => { V.sticker = b.dataset.gs; $$("[data-gs]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); paint(); });
      paint(); chk.onclick = () => { const n = (V.text.match(/\S+/g) || []).length, ok = V.titel.trim().length >= 3 && n >= min && !!V.farbe; done(e, t, ok, true, { v: Object.assign({}, V) }, ok ? 2 : 0); fb(ok, ok ? (a.erklaerung || "Sieht super aus!") : "Es fehlt noch etwas: Überschrift, genug Text und eine Farbe."); }; }
    if (a.typ === "schreiben") { const min = +a.mindestwoerter || 20, wc = () => { const n = ($("#wr").value.match(/\S+/g) || []).length; $("#wc").textContent = `${n} von mindestens ${min} Wörtern`; return n; };
      wc(); $("#wr").oninput = wc; chk.onclick = () => { const ok = wc() >= min; done(e, t, ok, true, { v: $("#wr").value }); fb(ok, ok ? (a.erklaerung || "Super geschrieben!") : `Schreibe noch etwas mehr (mindestens ${min} Wörter).`); }; }
    /* ---------- neue Aufgabenarten: Bedienung ---------- */
    if (a.typ === "wortsalat") { const W = view.ws, paint = () => {
        $("#wsS").innerHTML = W.w.split("").map((_, p) => { const it = W.pick[p]; return `<button type="button" class="ws-b slot${it ? " full" : ""}" data-wsx="${p}" ${it ? "" : "disabled"}>${it ? esc(it.c) : ""}</button>`; }).join("");
        $("#wsP").innerHTML = W.pool.map((it, p) => `<button type="button" class="ws-b" data-wsp="${p}" ${W.pick.includes(it) ? "disabled" : ""}>${esc(it.c)}</button>`).join("");
        $$("[data-wsp]").forEach(b => b.onclick = () => { if (st.ok || (S.ans[key] || {}).ok) return; const it = W.pool[+b.dataset.wsp]; if (W.pick.length < W.w.length) { W.pick.push(it); paint(); } });
        $$("[data-wsx]").forEach(b => b.onclick = () => { if ((S.ans[key] || {}).ok) return; W.pick.splice(+b.dataset.wsx, 1); paint(); }); };
      if (st.ok) W.pick = W.w.split("").map((c, i) => ({ c, i })); paint();
      chk.onclick = () => { const v = W.pick.map(x => x.c).join(""), ok = v === W.w; $$(".ws-b.slot").forEach(b => b.classList.toggle(ok ? "ok" : "bad", true)); done(e, t, ok, true, { v }); fb(ok, ok ? a.erklaerung : (W.pick.length < W.w.length ? "Es fehlen noch Buchstaben." : "Noch nicht das richtige Wort. Antippen nimmt Buchstaben zurück.")); if (!ok) setTimeout(() => $$(".ws-b.slot").forEach(b => b.classList.remove("bad")), 900); };
    }
    if (a.typ === "wortraten") { const R = view.wr, ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ".split(""), letters = new Set(R.w.replace(/[^A-ZÄÖÜ]/g, "").split(""));
      const won = () => [...letters].every(c => R.got.has(c)), lost = () => R.miss >= 7;
      const paint = () => {
        const show = (st.ok || won() || lost());
        $("#wrW").innerHTML = R.w.split("").map(c => /[A-ZÄÖÜ]/.test(c) ? `<span class="${R.got.has(c) || show ? "on" : ""}${lost() && !R.got.has(c) ? " miss" : ""}">${R.got.has(c) || show ? esc(c) : ""}</span>` : `<span class="sp">${esc(c)}</span>`).join("");
        $("#wrB").innerHTML = `<span class="bat">${Array.from({ length: 7 }, (_, i) => `<i class="${i < 7 - R.miss ? "on" : ""}"></i>`).join("")}</span><small>${7 - R.miss} Versuche übrig</small>`;
        $("#wrK").innerHTML = ABC.map(c => `<button type="button" class="wr-k${R.got.has(c) ? (letters.has(c) ? " ok" : " bad") : ""}" data-wr="${c}" ${R.got.has(c) || won() || lost() || st.ok ? "disabled" : ""}>${c}</button>`).join("") + (lost() && !won() ? `<button type="button" class="btn small" id="wrAgain" style="grid-column:span 4">↺ Nochmal</button>` : "");
        $$("[data-wr]").forEach(b => b.onclick = () => { const c = b.dataset.wr; R.got.add(c); if (!letters.has(c)) R.miss++; paint();
          if (won()) { done(e, t, true, R.miss === 0, {}, R.miss <= 2 ? 2 : 1); fb(true, a.erklaerung); }
          else if (lost()) { done(e, t, false, true); fb(false, `Das Wort war «${R.w}». Versucht es nochmals!`); } });
        const ag = $("#wrAgain"); if (ag) ag.onclick = () => { view.wr = { key, w: R.w, got: new Set(), miss: 0 }; renderTask(); }; };
      paint(); }
    if (a.typ === "blitz") { const Z = view.bz, L = a.aussagen || [], sec = Math.max(4, Math.min(20, +a.sekunden || 8));
      const end = () => { clearInterval(Z.t); const ok = Z.right >= Math.ceil(L.length * .7);
        $("#bz").innerHTML = `<div class="bz-end"><b>${Z.right} von ${L.length} richtig</b><small>${ok ? "Blitzschnell!" : "Für den Stern braucht ihr " + Math.ceil(L.length * .7) + " richtige."}</small><button type="button" class="btn" id="bzGo">↺ Nochmals</button></div>`;
        $("#bzGo").onclick = () => { Z.i = -1; Z.right = 0; next(); };
        done(e, t, ok, true, { v: Z.right }, ok ? (Z.right === L.length ? 2 : 1) : 0); fb(ok, ok ? a.erklaerung : "Lest nochmals in den Erklärungen nach und startet die Blitzrunde neu."); };
      const answer = v => { clearInterval(Z.t); const s0 = L[Z.i], ok = v === !!s0.richtig; if (ok) Z.right++;
        $("#bz").querySelector(".bz-card").classList.add(ok ? "ok" : "bad"); setTimeout(next, 650); };
      const next = () => { Z.i++; if (Z.i >= L.length) return end(); Z.left = sec;
        $("#bz").innerHTML = `<div class="bz-top"><small>${Z.i + 1} / ${L.length}</small><span class="bz-time"><i id="bzT" style="width:100%"></i></span></div><div class="bz-card"><b>${esc(L[Z.i].text)}</b></div><div class="tf"><button type="button" class="opt" data-bz="1">👍 Stimmt</button><button type="button" class="opt" data-bz="0">👎 Stimmt nicht</button></div>`;
        $$("[data-bz]").forEach(b => b.onclick = () => answer(b.dataset.bz === "1"));
        const t0 = Date.now(); clearInterval(Z.t); Z.t = setInterval(() => { const f = 1 - (Date.now() - t0) / (sec * 1000); const bar = $("#bzT"); if (!bar) return clearInterval(Z.t); bar.style.width = Math.max(0, f * 100) + "%"; if (f <= 0) answer(null); }, 100); };
      $("#bzGo").onclick = next; }
    if (a.typ === "markieren") { const K = view.mk, paint = () => {
        $("#mkT").innerHTML = K.toks.map((x, i) => x.sp != null ? esc(x.sp) : `${esc(x.pre)}<button type="button" class="mk-w${K.on.has(i) ? " on" : ""}" data-mk="${i}" aria-pressed="${K.on.has(i)}">${esc(x.w)}</button>${esc(x.post)}`).join("");
        $$("[data-mk]").forEach(b => b.onclick = () => { if ((S.ans[key] || {}).ok) return; const i = +b.dataset.mk; K.on.has(i) ? K.on.delete(i) : K.on.add(i); paint(); }); };
      if (st.ok) K.toks.forEach((x, i) => { if (x.hit) K.on.add(i); }); paint();
      chk.onclick = () => { const hits = K.toks.map((x, i) => x.hit ? i : -1).filter(i => i >= 0), miss = hits.filter(i => !K.on.has(i)).length, extra = [...K.on].filter(i => !K.toks[i].hit).length, ok = !miss && !extra;
        $$("[data-mk]").forEach(b => { const i = +b.dataset.mk; b.classList.toggle("ok", K.on.has(i) && K.toks[i].hit); b.classList.toggle("bad", K.on.has(i) && !K.toks[i].hit); });
        done(e, t, ok, true); fb(ok, ok ? a.erklaerung : `${miss ? `Es fehlen noch ${miss}. ` : ""}${extra ? `${extra} markiert, die nicht passen (rot).` : ""}`); };
    }
    if (a.typ === "wortsuche") { const U = view.su, N = U.n, paint = () => {
        const inFound = (x, y) => U.found.some(f => f.cells.some(([cx, cy]) => cx === x && cy === y));
        $("#suG").style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        $("#suG").innerHTML = U.grid.map((row, y) => row.map((c, x) => `<button type="button" class="su-c${inFound(x, y) ? " on" : ""}${U.sel && U.sel[0] === x && U.sel[1] === y ? " sel" : ""}" data-su="${x},${y}">${c}</button>`).join("")).join("");
        $("#suL").innerHTML = U.words.map(w => `<li class="${U.found.some(f => f.w === w) ? "on" : ""}">${esc(w)}</li>`).join("");
        $$("[data-su]").forEach(b => b.onclick = () => { if ((S.ans[key] || {}).ok) return; const [x, y] = b.dataset.su.split(",").map(Number);
          if (!U.sel) { U.sel = [x, y]; return paint(); }
          const [x0, y0] = U.sel; U.sel = null; const dx = Math.sign(x - x0), dy = Math.sign(y - y0), len = Math.max(Math.abs(x - x0), Math.abs(y - y0)) + 1;
          if ((x !== x0 && y !== y0 && Math.abs(x - x0) !== Math.abs(y - y0)) || len < 2) return paint();
          const cells = Array.from({ length: len }, (_, i) => [x0 + dx * i, y0 + dy * i]), str = cells.map(([cx, cy]) => U.grid[cy][cx]).join(""), rev = str.split("").reverse().join("");
          const w = U.words.find(w => (w === str || w === rev) && !U.found.some(f => f.w === w));
          if (w) { U.found.push({ w, cells }); paint(); say(`«${w}» gefunden!`, "happy", 3000); if (U.found.length === U.words.length) { done(e, t, true, true, {}, 3); fb(true, a.erklaerung); } }
          else { paint(); b.animate([{ transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "none" }], { duration: 250 }); } }); };
      if (st.ok) U.found = U.places.map(p => ({ w: p.w, cells: p.cells })); paint(); }
    if (a.typ === "karteikarten") { const C = view.kk, cards = a.karten || [], paint = () => {
        if (!C.stack.length || st.ok && C.known === 0 && !C.flip && (S.ans[key] || {}).ok) {
          $("#kk").innerHTML = `<div class="kk-end"><b>Alle ${cards.length} Karten gewusst! 🎉</b><button type="button" class="btn" id="kkAgain">↺ Nochmals üben</button></div>`;
          $("#kkAgain").onclick = () => { view.kk = { key, stack: shuffle(cards.map((_, i) => i)), flip: false, known: 0, again: 0 }; renderTask(); }; return; }
        const c = cards[C.stack[0]];
        $("#kk").innerHTML = `<p class="hintline">Noch ${C.stack.length} Karte${C.stack.length === 1 ? "" : "n"}</p><button type="button" class="kk-card${C.flip ? " flip" : ""}" id="kkC" aria-label="Karte umdrehen"><span class="kk-f">${esc(c[0])}</span><span class="kk-b">${esc(c[1])}</span></button>
          ${C.flip ? `<div class="tf"><button type="button" class="opt" data-kk="1">✓ Gewusst</button><button type="button" class="opt" data-kk="0">↺ Nochmal</button></div>` : `<p class="hintline">Antippen zum Umdrehen</p>`}`;
        $("#kkC").onclick = () => { C.flip = !C.flip; paint(); };
        $$("[data-kk]").forEach(b => b.onclick = () => { const i = C.stack.shift(); if (b.dataset.kk === "1") C.known++; else { C.again++; C.stack.push(i); } C.flip = false;
          if (!C.stack.length) { done(e, t, true, C.again === 0, {}, C.again <= 1 ? 2 : 1); fb(true, a.erklaerung || "Super geübt!"); } paint(); }); };
      paint(); }
    if (a.typ === "chat") { const H = view.ch, steps = a.schritte || [], paint = () => {
        const msgs = []; for (let i = 0; i <= Math.min(H.i, steps.length - 1); i++) { msgs.push(`<div class="cm cm-in"><span>${esc(steps[i].sagt)}</span></div>`); const L = H.log.filter(x => x.i === i); L.forEach(x => { msgs.push(`<div class="cm cm-out${x.ok ? "" : " no"}"><span>${esc(x.txt)}</span></div>`); if (!x.ok) msgs.push(`<div class="cm cm-in"><span>${esc(steps[i].falsch || "Hmm, bist du sicher? Überleg nochmals.")}</span></div>`); else if (steps[i].antwort) msgs.push(`<div class="cm cm-in"><span>${esc(steps[i].antwort)}</span></div>`); }); }
        $("#chL").innerHTML = msgs.join(""); $("#chL").scrollTop = 1e6;
        if (H.i >= steps.length || (S.ans[key] || {}).ok) { $("#chO").innerHTML = `<p class="hintline">✓ Gespräch beendet</p>`; return; }
        const s0 = steps[H.i], tried = H.log.filter(x => x.i === H.i && !x.ok).map(x => x.o);
        $("#chO").innerHTML = (s0.optionen || []).map((o, j) => `<button type="button" class="opt" data-ch="${j}" ${tried.includes(j) ? 'aria-disabled="true" disabled' : ""}>${esc(o)}</button>`).join("");
        $$("[data-ch]").forEach(b => b.onclick = () => { const j = +b.dataset.ch, ok = j === +s0.richtig; H.log.push({ i: H.i, o: j, txt: s0.optionen[j], ok }); if (!ok) H.miss++;
          if (ok) { H.i++; if (H.i >= steps.length) { done(e, t, true, H.miss === 0, {}, H.miss <= 1 ? 2 : 1); fb(true, a.erklaerung); } }
          paint(); }); };
      if (st.ok && !H.log.length) { steps.forEach((s0, i) => H.log.push({ i, o: +s0.richtig, txt: (s0.optionen || [])[+s0.richtig] || "", ok: true })); H.i = steps.length; }
      paint(); }
    if (a.typ === "meinung") { const V = view.mn, min = Math.max(5, +a.mindestwoerter || 10), info = () => { const n = (V.text.match(/\S+/g) || []).length; $("#mnI").textContent = `${n} von mindestens ${min} Wörtern${(a.argumente || []).length && !V.args.length ? " · ein Argument wählen" : ""}`; return n; };
      $("#mnR").oninput = ev => { V.pos = +ev.target.value; };
      $$("[data-mn]").forEach(b => b.onclick = () => { const i = +b.dataset.mn; V.args = V.args.includes(i) ? V.args.filter(x => x !== i) : V.args.concat(i); b.setAttribute("aria-pressed", String(V.args.includes(i))); info(); });
      $("#mnX").oninput = ev => { V.text = ev.target.value; info(); }; info();
      chk.onclick = () => { const ok = info() >= min && (!(a.argumente || []).length || V.args.length > 0); done(e, t, ok, true, { v: { pos: V.pos, args: V.args.slice(), text: V.text, titel: "Unsere Meinung" } }); fb(ok, ok ? (a.erklaerung || "Gut begründet! Andere dürfen anderer Meinung sein.") : "Wählt ein Argument und schreibt eure Begründung etwas länger."); };
    }
    $("[data-prev]").onclick = () => goB(view.b - 1);
    $("[data-next]").onclick = () => goB(view.b + 1);
  }
  /* ---------- Zusammenfassung als PDF ---------- */
  const plain = t => String(t || "").replace(/\*\*/g, "").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").replace(/[ \t]+/g, " ").trim();
  function loadJsPdf() { return window.jspdf ? Promise.resolve() : new Promise((ok, no) => { const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; sc.onload = ok; sc.onerror = () => no(new Error("PDF-Bibliothek nicht erreichbar")); document.head.appendChild(sc); }); }
  async function saveFile(blob, name) {
    let dl = null;
    try { const C = (window.claude && window.claude.use) ? window.claude : (window.parent !== window && window.parent.claude && window.parent.claude.use) ? window.parent.claude : null; dl = C ? await C.use("downloads") : null; } catch (e) { dl = null; }
    if (dl) { await dl.save({ filename: name, data: blob }); return; }
    const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
  }
  async function summaryPdf(btn) {
    const t0 = btn ? btn.textContent : ""; if (btn) { btn.disabled = true; btn.textContent = "PDF wird erstellt …"; }
    try {
      await loadJsPdf();
      const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" }), W = 210, X = 18, MW = W - 2 * X; let y = 20;
      const col = (M.farbe && /^#[0-9a-f]{6}$/i.test(M.farbe)) ? M.farbe : "#7B4CEF", rgb = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
      const need = h => { if (y + h > 280) { doc.addPage(); y = 20; } };
      const text = (t, size = 10.5, style = "normal", color = [30, 24, 50], gap = 1.5) => { doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
        doc.splitTextToSize(plain(t), MW).forEach(l => { need(size * .45); doc.text(l, X, y); y += size * .42 + .6; }); y += gap; };
      doc.setFillColor(...rgb); doc.rect(0, 0, W, 34, "F");
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.text(doc.splitTextToSize(plain(M.titel || "Modul"), MW)[0], X, 16);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.text(plain(`Zusammenfassung · ${M.fachname || ""}${who() ? " · " + who() : ""} · ${new Date().toLocaleDateString("de-CH")}`), X, 25);
      y = 44;
      text(`Sterne: ${total()} von ${totalMax()}   ·   Diplome: ${S.dips.length} von ${DIP.length}`, 11, "bold", rgb, 3);
      if (M.beschreibung) text(M.beschreibung, 10.5, "italic", [90, 82, 120], 4);
      ET.forEach((E, e) => {
        need(20); doc.setDrawColor(...rgb); doc.setLineWidth(.6); doc.line(X, y, X + MW, y); y += 6;
        text(`Etappe ${e + 1}: ${E.titel}`, 14, "bold", [20, 10, 50], 1);
        text(`${etDone(e) ? "Geschafft" : "Noch offen"} · ${etStars(e)} von ${etMax(e)} Sternen`, 9.5, "normal", [110, 100, 140], 2);
        if (E.ziel) text("Ziel: " + E.ziel, 10.5, "italic", [60, 50, 90], 2);
        E.aufgaben.filter(a => !scorable(a)).forEach(a => { if (a.titel) text(a.titel, 11, "bold", [40, 30, 70], .5); text(a.text, 10.5); });
        const se = S.selbst[e], x = se && SELBST.find(z => z[0] === se.w);
        if (x) text(`Meine Selbsteinschätzung: ${x[2]}${se.t ? " – " + se.t : ""}`, 10.5, "bold", [31, 157, 104], 3);
      });
      if (LEX.length) { need(20); doc.setDrawColor(...rgb); doc.line(X, y, X + MW, y); y += 6; text("Fachwörter", 14, "bold", [20, 10, 50], 2);
        LEX.slice().sort((a, b) => a.wort.localeCompare(b.wort, "de")).forEach(w => { text(w.wort, 10.5, "bold", [40, 30, 70], 0); text(w.erklaerung, 10, "normal", [60, 55, 80], 1.5); }); }
      const got = DIP.filter(d => S.dips.includes(d.id));
      if (got.length) { need(16); text("Meine Diplome", 14, "bold", [20, 10, 50], 2); got.forEach(d => text(`${d.name}${d.beschreibung ? ": " + d.beschreibung : ""}`, 10.5)); }
      const n = doc.getNumberOfPages(); for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8.5); doc.setTextColor(150, 140, 170); doc.text(`gLiTCh-Lab · Seite ${i} von ${n}`, W - X, 290, { align: "right" }); }
      await saveFile(doc.output("blob"), `Zusammenfassung-${slug(M.titel || "modul") || "modul"}.pdf`);
      say("Deine Zusammenfassung ist bereit! 📄", "cool", 5000);
    } catch (err) { say("Das PDF ging gerade nicht. Probiert es später nochmals.", "sad", 6000); }
    if (btn) { btn.disabled = false; btn.textContent = t0; }
  }
  function start() {
    frame();
    let i = B.findIndex((_, n) => !bDone(n)); if (i < 0) i = B.length;
    let gateE = -1; if (B[i] && !etUnlocked(B[i].e)) { const e = B[i].e; let p = 0; while (p < e && etUnlocked(p + 1)) p++; gateE = p; i = B.map(y => y.e).lastIndexOf(p); }
    view.b = i; paintTabs(); paintSide(); stage();
    if (gateE >= 0 && etDone(gateE)) setTimeout(() => gateDlg(gateE), 600);
    if (!Object.keys(S.ans).length) say(M.intro || M.beschreibung || "Hoi! Los geht's!", "happy", 10000);
    checkDips();
  }

  /* Wörtersuche: Wörter in ein Buchstabenraster setzen (waagrecht, senkrecht, schräg; auch rückwärts) */
  function buildGrid(words) {
    words = [...new Set(words.map(w => w.replace(/[^A-ZÄÖÜ]/g, "")).filter(w => w.length >= 2 && w.length <= 12))].slice(0, 8);
    const n = Math.max(8, Math.min(13, Math.max(...words.map(w => w.length), 0) + 2)), D8 = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1]];
    for (let tries = 0; tries < 40; tries++) {
      const g = Array.from({ length: n }, () => Array(n).fill("")), places = []; let ok = true;
      for (const w of words.slice().sort((a, b) => b.length - a.length)) {
        let put = false;
        for (let k = 0; k < 200 && !put; k++) {
          const [dx, dy] = D8[Math.floor(Math.random() * (tries > 20 ? 2 : D8.length))], x0 = Math.floor(Math.random() * n), y0 = Math.floor(Math.random() * n), xe = x0 + dx * (w.length - 1), ye = y0 + dy * (w.length - 1);
          if (xe < 0 || ye < 0 || xe >= n || ye >= n) continue;
          const cells = w.split("").map((_, i) => [x0 + dx * i, y0 + dy * i]);
          if (cells.every(([x, y], i) => !g[y][x] || g[y][x] === w[i])) { cells.forEach(([x, y], i) => { g[y][x] = w[i]; }); places.push({ w, cells }); put = true; }
        }
        if (!put) { ok = false; break; }
      }
      if (!ok) continue;
      const ABC = "ABCDEFGHIJKLMNOPRSTUVWZ";
      g.forEach(row => row.forEach((c, x) => { if (!c) row[x] = ABC[Math.floor(Math.random() * ABC.length)]; }));
      return { grid: g, words, places, n };
    }
    return { grid: [words.join("").slice(0, 8).split("")], words: [], places: [], n: 8 };
  }
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } if (b.length > 1 && b.every((x, i) => x === a[i])) [b[0], b[1]] = [b[1], b[0]]; return b; }

  /* ---------- Fenster ---------- */
  function dlg(html, onClose) {
    const ov = document.createElement("div"); ov.className = "ov"; ov.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}<div class="nav"><span></span><button type="button" class="btn primary" data-x>Schliessen</button></div></div>`;
    document.body.appendChild(ov); const close = () => { ov.remove(); if (onClose) onClose(); };
    $("[data-x]", ov).onclick = close; ov.onclick = ev => { if (ev.target === ov) close(); };
    document.addEventListener("keydown", function f(ev) { if (ev.key === "Escape") { close(); document.removeEventListener("keydown", f); } });
    setTimeout(() => $("[data-x]", ov).focus(), 20); return ov;
  }
  function showMsg(mood, text, btn, then) { const ov = dlg(`<div class="hero">${gl(mood)}<div class="bubble"><b>${esc(NAME)}</b><div>${rich(text)}</div></div></div>`, then); $("[data-x]", ov).textContent = btn; }
  function showLex(word) {
    if (!S.lex) { S.lex = true; save(); checkDips(); }
    if (word) { S.words = [...new Set([...(S.words || []), word])]; save(); paintSide(); }
    const ov = dlg(`<h2>📖 Lexikon</h2><input class="in" id="lq" placeholder="Wort suchen …" style="margin-bottom:10px"><dl class="dl" id="ll"></dl>`);
    const paint = q => { $("#ll", ov).innerHTML = LEX.filter(w => !q || norm(w.wort + " " + w.erklaerung).includes(norm(q))).sort((a, b) => a.wort.localeCompare(b.wort, "de")).map(w => `<div${word && w.wort === word ? ' style="border-color:var(--teal)"' : ""}><dt>${esc(w.wort)}</dt><dd>${esc(w.erklaerung)}</dd></div>`).join("") || "<p>Nichts gefunden.</p>"; };
    paint(""); $("#lq", ov).oninput = ev => paint(ev.target.value);
    if (word) { const w = LEX.find(x => x.wort === word); if (w) { $("#ll", ov).insertAdjacentHTML("beforebegin", `<div class="bubble" style="margin-bottom:12px"><b>${esc(w.wort)}</b><p>${esc(w.erklaerung)}</p></div>`); } }
  }
  function showDips() { dlg(`<h2>🏅 Diplome</h2><div class="dips">${DIP.map(d => `<div class="dip${S.dips.includes(d.id) ? " got" : ""}"><span class="e wall" aria-hidden="true">${wall(d)}</span><b>${esc(d.name)}</b><small>${esc(d.beschreibung || "")}</small></div>`).join("")}</div>`); }
  function showDip(d) { confetti(40); setTimeout(() => { const h = document.querySelector(".ov .hero"); if (h) h.insertAdjacentHTML("afterend", `<div class="dip-new">${wall(d)}</div>`); }, 0); showMsg("cool", `🏅 **Neues Diplom: ${d.name}!**\n\n${d.beschreibung || ""}${HUB ? "\n\nSchaut im Hub in eurem Zimmer: Vielleicht gibt es dort etwas Neues." : ""}`, "Juhui!"); }
  function showLinks() { dlg(`<h2>🔗 Links</h2><ul class="links">${(M.links || []).map(l => `<li><a href="${esc(/^https?:\/\//i.test(l.url) ? l.url : "#")}" target="_blank" rel="noopener">${esc(l.titel || l.url)}</a>${l.titel ? `<br><small>${esc(l.url)}</small>` : ""}</li>`).join("")}</ul>`); }
  function confetti(n = 18) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < n; i++) { const c = document.createElement("i"); c.className = "confetti"; c.style.cssText += `left:${50 + (Math.random() - .5) * 40}vw;top:40vh;background:${["#FFC21A", "#FF2BD6", "#2EE6D6", "#A07CFF", "#3CFF7A"][i % 5]}`; document.body.appendChild(c);
      c.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 600}px,${200 + Math.random() * 300}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1200 + Math.random() * 800, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => c.remove(); }
  }
  start();
})();
