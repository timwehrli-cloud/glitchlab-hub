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
  const gsvg = mood => { try { const x = HUB && HUB.glitch && HUB.glitch(mood); if (x) return x; } catch (e) { /* ohne Hub */ } return G ? G.svg(mood, "#8B5CFF") : ""; };
  const gl = (mood, cls = "") => `<span class="glitch ${cls}">${gsvg(mood)}</span>`;
  /* Schalter aus dem Editor: was das Modul anbietet und wie es zwischen den Etappen weitergeht */
  const O = Object.assign({ tipps: true, vorlesen: true, lexikon: true, pdf: true, freigabe: "keine", code: "" }, M.opt || {});
  const ET = (M.etappen || []).filter(e => e && Array.isArray(e.aufgaben));
  const LEX = O.lexikon ? (M.lexikon || []).filter(w => w && w.wort) : [];
  const DIP = (M.diplome || []).filter(d => d && d.id);
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
  const WERT = { mc: 1, tf: 1, text: 1, luecke: 2, ordnen: 2, zuordnen: 2, schreiben: 2, mehrfach: 2, schaetzen: 2, gestalten: 2, sortieren: 3, zeitmaschine: 3, raetsel: 3, memory: 3 };
  const wert = a => WERT[a.typ] || 1;
  const solved = (e, t) => !!(S.ans[k(e, t)] && S.ans[k(e, t)].ok);
  const etStars = e => ET[e].aufgaben.reduce((n, a, t) => { const x = S.ans[k(e, t)]; return n + (scorable(a) && x && x.ok ? Math.min(wert(a), x.pts != null ? x.pts : wert(a)) : 0); }, 0);
  const etMax = e => ET[e].aufgaben.reduce((n, a) => n + (scorable(a) ? wert(a) : 0), 0);
  const etOpen = e => ET[e].aufgaben.filter((a, t) => scorable(a) && !solved(e, t)).length;
  const etDone = e => ET[e].aufgaben.some(scorable) ? etOpen(e) === 0 : !!S.ans[k(e, "seen")];
  const total = () => ET.reduce((n, _, e) => n + etStars(e), 0);
  const totalMax = () => ET.reduce((n, _, e) => n + etMax(e), 0);
  const who = () => HUB && HUB.alle ? HUB.alle.join(" und ") : "";
  /* Freigabe zwischen den Etappen: keine | selbst (Selbsteinschätzung) | lp (Code der Lehrperson) */
  const gateNeeded = e => O.freigabe === "selbst" || (O.freigabe === "lp" && e < ET.length - 1);
  const etUnlocked = e => e <= 0 || O.freigabe === "keine" || (etDone(e - 1) && (!gateNeeded(e - 1) || !!S.gate[e - 1]) && etUnlocked(e - 1));
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
    const raw = String(txt ?? ""), taken = [];
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
    sortieren: "Sortier-Spiel", zeitmaschine: "Zeitmaschine", raetsel: "Rätsel", memory: "Memory", mehrfach: "Mehrere richtig", schaetzen: "Schätzen", gestalten: "Gestalten" };
  const TIPS = { mc: "Lies jede Antwort genau. Welche passt wirklich zur Frage?", tf: "Ein einziges falsches Wort macht die ganze Aussage falsch!", text: "Schau nochmals in «gLiTCh erklärt». Dort steht das Wort.",
    luecke: "Lies den ganzen Satz laut. Welches Wort klingt richtig?", ordnen: "Was passiert zuerst? Beginne mit dem, was du sicher weisst.", zuordnen: "Fang mit dem Paar an, bei dem du ganz sicher bist.",
    sortieren: "Überlege bei jeder Karte: Was ist das Besondere daran?", zeitmaschine: "Überlegt zuerst: Eher früher oder später als die anderen Ereignisse?", raetsel: "Holt euch ruhig den nächsten Hinweis!",
    memory: "Merkt euch, wo die Karten liegen. Sagt die Begriffe laut!", mehrfach: "Prüft jede Antwort einzeln: stimmt sie oder nicht?", schaetzen: "Vergleicht mit etwas, das ihr kennt.",
    gestalten: "Eine kurze, starke Überschrift und zwei, drei klare Sätze reichen.", schreiben: "Schreibt zuerst Stichworte, dann ganze Sätze." };
  const PRAISE = ["Pixel-perfekt!", "Jawoll, richtig!", "Mega, das stimmt!", "Super gemacht!", "Volltreffer!"];
  const short = a => a.titel || (a.frage || a.aussage || a.auftrag || a.anleitung || "").split(/[?.!:]/)[0].split(" ").slice(0, 3).join(" ") || KIND[a.typ];

  const app = document.getElementById("app");
  let view = { b: 0 }, sayT = null;
  function say(text, mood = "happy", ms) {
    const t = $("#sayT"), g = $("#bigG"); if (!t) return;
    t.innerHTML = rich(text).replace(/^<p>|<\/p>$/g, ""); if (g) g.innerHTML = gsvg(mood);
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
        <div class="talk"><div class="say-bub" id="say" aria-live="polite"><b>gLiTCh</b><p id="sayT"></p></div><span class="glitch big" id="bigG">${gsvg("happy")}</span></div>
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
      ${DIP.length ? `<div class="side-card"><small class="cap">Diplome: ${esc(M.titel || "")}</small><div class="hexes">${DIP.map(d => `<button type="button" class="hex${S.dips.includes(d.id) ? " got" : ""}" data-dip="${esc(d.id)}" title="${esc(d.name)}">${S.dips.includes(d.id) ? esc(d.emoji || "🏅") : "🔒"}</button>`).join("")}</div>
        <p class="side-note">Tippt ein Diplom an, dann verrät gLiTCh, wie ihr es bekommt.</p></div>` : ""}
      <div class="side-card"><div class="prog-h"><b>Fortschritt</b><span>${dn} / ${B.length}</span></div><div class="pbar"><i style="width:${B.length ? Math.round(dn / B.length * 100) : 0}%"></i></div>
        ${ET.map((E, e) => { const se = S.selbst[e] && SELBST.find(x => x[0] === S.selbst[e].w);
          return `<div class="et-row${etDone(e) ? " ok" : ""}${etUnlocked(e) ? "" : " lock"}"><span>${etUnlocked(e) ? esc(E.emoji || "⭐") : "🔒"}</span><span>${esc(E.titel)}</span><small>${se ? se[1] + " " : ""}${etDone(e) ? (gateNeeded(e) && !S.gate[e] ? (O.freigabe === "lp" ? "✓ · Freigabe fehlt" : "✓ · Einschätzung fehlt") : "✓") : `★ ${etStars(e)}/${etMax(e)}`}</small></div>`; }).join("")}
        ${O.freigabe !== "keine" ? `<p class="side-note">${O.freigabe === "lp" ? "🔐 Die nächste Etappe gibt eure Lehrperson mit ihrem Code frei." : "🪞 Nach jeder Etappe schätzt ihr euch selbst ein."}</p>` : ""}</div>
      ${LEX.length ? `<div class="side-card"><div class="prog-h"><b>📖 Fachwörter</b><span>${(S.words || []).length} / ${LEX.length}</span></div><p class="side-note">Wörter mit gepunkteter Linie antippen: gLiTCh erklärt sie.</p><button type="button" class="btn small" data-golex>Lexikon öffnen</button></div>` : ""}`;
    $$("[data-dip]", sd).forEach(b => b.onclick = () => { const d = DIP.find(x => x.id === b.dataset.dip); say(S.dips.includes(d.id) ? `${d.emoji || "🏅"} **${d.name}**: geschafft! ${d.beschreibung || ""}` : `${d.emoji || "🏅"} **${d.name}**: ${d.beschreibung || "Löst die Bausteine, dann bekommt ihr es."}`, S.dips.includes(d.id) ? "cool" : "wink", 7000); });
    const gl2 = $("[data-golex]", sd); if (gl2) gl2.onclick = () => showLex();
  }
  function goB(i) {
    i = Math.max(0, Math.min(B.length, i));
    const x = B[i];
    if (x && !etUnlocked(x.e)) {
      let p = 0; while (p < x.e && etUnlocked(p + 1)) p++;   // letzte offene Etappe
      if (etDone(p) && gateNeeded(p) && !S.gate[p]) return gateDlg(p);
      return say(`🔒 Zuerst Etappe ${p + 1} «${ET[p].titel}» fertig machen${gateNeeded(p) ? (O.freigabe === "lp" ? " und von der Lehrperson freigeben lassen" : " und euch selbst einschätzen") : ""}.`, "hmm", 7000);
    }
    view.b = i; paintTabs(); stage(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  /* ---------- Freigabe-Fenster nach einer Etappe ---------- */
  function gateDlg(e, then) {
    if (!gateNeeded(e) || S.gate[e]) { if (then) then(); return; }
    const E = ET[e], nextI = B.findIndex(y => y.e === e + 1);
    const pass = () => { S.gate[e] = true; save(); paintTabs(); paintSide(); if (then) then(); else if (nextI >= 0) goB(nextI); else goB(B.length); };
    if (O.freigabe === "selbst") {
      const ov = dlg(`<h2>🪞 Selbsteinschätzung</h2><div class="hero">${gl("wink")}<div class="bubble"><b>gLiTCh</b><div><p>Etappe ${e + 1} «${esc(E.titel)}» ist geschafft! Wie gut kannst du das jetzt?</p></div></div></div>
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
    const ov = dlg(`<h2>🔐 Freigabe durch die Lehrperson</h2><div class="hero">${gl("cool")}<div class="bubble"><b>gLiTCh</b><div><p>Etappe ${e + 1} «${esc(E.titel)}» ist geschafft! Zeigt eure Arbeit eurer Lehrperson. Sie gibt mit ihrem Code die nächste Etappe frei.</p></div></div></div>
      <div class="pin"><div class="pin-dots" id="pinD" aria-live="polite"></div><div class="pin-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-pn="${n}">${n}</button>`).join("")}<button type="button" data-pn="del" aria-label="Löschen">⌫</button><button type="button" data-pn="0">0</button><button type="button" class="go" data-pn="ok">OK</button></div><p class="err" id="pinE" role="alert"></p></div>`);
    $("[data-x]", ov).textContent = "Später";
    const paint = () => { $("#pinD", ov).textContent = code ? "●".repeat(code.length) : "Code eingeben"; };
    const check = () => {
      let ok = false; try { ok = HUB && HUB.pruefeCode ? !!HUB.pruefeCode(code) : code === String(O.code || "1234"); } catch (err) { ok = false; }
      if (ok) { ov.remove(); confetti(30); say("Freigegeben! Weiter zur nächsten Etappe.", "cool", 6000); pass(); }
      else { code = ""; paint(); $("#pinE", ov).textContent = "Falscher Code. Nochmals versuchen."; const p = $(".pin", ov); p.classList.remove("shake"); void p.offsetWidth; p.classList.add("shake"); }
    };
    $$("[data-pn]", ov).forEach(b => b.onclick = () => { const v = b.dataset.pn; $("#pinE", ov).textContent = "";
      if (v === "del") code = code.slice(0, -1); else if (v === "ok") return check(); else if (code.length < 8) code += v; paint(); });
    paint();
  }
  function readAloud(text) {
    try { const u = new SpeechSynthesisUtterance(String(text).replace(/\*\*/g, "")); u.lang = "de-CH"; u.rate = .95; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { say("Vorlesen geht auf diesem Gerät leider nicht.", "sad", 4000); }
  }
  function erklHTML(list, cls = "") {
    return list.map((a, n) => `<div class="erkl ${cls}"><div class="erkl-h">${gl("normal", "mini")}<b>gLiTCh erklärt</b>${a.titel ? `<span>· ${esc(a.titel)}</span>` : ""}${O.vorlesen ? `<button type="button" class="btn small" data-read="${n}">🔊 Vorlesen</button>` : ""}</div><div class="txt">${rich(a.text || "")}</div></div>`).join("");
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
      ${DIP.length ? `<h3>Diplome</h3><div class="dips">${DIP.map(d => `<div class="dip${S.dips.includes(d.id) ? " got" : ""}"><span class="e" aria-hidden="true">${esc(d.emoji || "🏅")}</span><b>${esc(d.name)}</b><small>${esc(d.beschreibung || "")}</small></div>`).join("")}</div>` : ""}
      ${O.freigabe === "selbst" && Object.keys(S.selbst).length ? `<h3>Eure Selbsteinschätzung</h3><div class="selbst-list">${ET.map((E, e) => { const se = S.selbst[e], x = se && SELBST.find(y => y[0] === se.w); return x ? `<div><span>${x[1]}</span><b>${esc(E.titel)}</b><small>${esc(x[2])}${se.t ? " · «" + esc(se.t) + "»" : ""}</small></div>` : ""; }).join("")}</div>` : ""}
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
    if (ok && !wasDone && etDone(e)) { setTimeout(() => say(`${ET[e].lob || "Etappe geschafft!"} ⭐`, "cool", 9000), 900); if (gateNeeded(e) && !S.gate[e]) setTimeout(() => { if (!document.querySelector(".ov")) gateDlg(e, () => {}); }, 2200); }
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
    const stars = wert(a) > 1 && scorable(a) ? ` · bis ${"★".repeat(wert(a))}` : " · ★";
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
    $("#task").innerHTML = `<div class="task"><div class="task-h"><span class="kind">${KIND[a.typ] || "Aufgabe"}${stars}</span>${O.tipps ? `<button type="button" class="tipbtn" data-tip>💡 Tipp von gLiTCh</button>` : ""}</div>${body}</div>
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
    $("[data-prev]").onclick = () => goB(view.b - 1);
    $("[data-next]").onclick = () => goB(view.b + 1);
  }
  /* ---------- Zusammenfassung als PDF ---------- */
  const plain = t => String(t || "").replace(/\*\*/g, "").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").replace(/[ \t]+/g, " ").trim();
  function loadJsPdf() { return window.jspdf ? Promise.resolve() : new Promise((ok, no) => { const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; sc.onload = ok; sc.onerror = () => no(new Error("PDF-Bibliothek nicht erreichbar")); document.head.appendChild(sc); }); }
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
      doc.save(`Zusammenfassung-${slug(M.titel || "modul") || "modul"}.pdf`);
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

  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } if (b.length > 1 && b.every((x, i) => x === a[i])) [b[0], b[1]] = [b[1], b[0]]; return b; }

  /* ---------- Fenster ---------- */
  function dlg(html, onClose) {
    const ov = document.createElement("div"); ov.className = "ov"; ov.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}<div class="nav"><span></span><button type="button" class="btn primary" data-x>Schliessen</button></div></div>`;
    document.body.appendChild(ov); const close = () => { ov.remove(); if (onClose) onClose(); };
    $("[data-x]", ov).onclick = close; ov.onclick = ev => { if (ev.target === ov) close(); };
    document.addEventListener("keydown", function f(ev) { if (ev.key === "Escape") { close(); document.removeEventListener("keydown", f); } });
    setTimeout(() => $("[data-x]", ov).focus(), 20); return ov;
  }
  function showMsg(mood, text, btn, then) { const ov = dlg(`<div class="hero">${gl(mood)}<div class="bubble"><b>gLiTCh</b><div>${rich(text)}</div></div></div>`, then); $("[data-x]", ov).textContent = btn; }
  function showLex(word) {
    if (!S.lex) { S.lex = true; save(); checkDips(); }
    if (word) { S.words = [...new Set([...(S.words || []), word])]; save(); paintSide(); }
    const ov = dlg(`<h2>📖 Lexikon</h2><input class="in" id="lq" placeholder="Wort suchen …" style="margin-bottom:10px"><dl class="dl" id="ll"></dl>`);
    const paint = q => { $("#ll", ov).innerHTML = LEX.filter(w => !q || norm(w.wort + " " + w.erklaerung).includes(norm(q))).sort((a, b) => a.wort.localeCompare(b.wort, "de")).map(w => `<div${word && w.wort === word ? ' style="border-color:var(--teal)"' : ""}><dt>${esc(w.wort)}</dt><dd>${esc(w.erklaerung)}</dd></div>`).join("") || "<p>Nichts gefunden.</p>"; };
    paint(""); $("#lq", ov).oninput = ev => paint(ev.target.value);
    if (word) { const w = LEX.find(x => x.wort === word); if (w) { $("#ll", ov).insertAdjacentHTML("beforebegin", `<div class="bubble" style="margin-bottom:12px"><b>${esc(w.wort)}</b><p>${esc(w.erklaerung)}</p></div>`); } }
  }
  function showDips() { dlg(`<h2>🏅 Diplome</h2><div class="dips">${DIP.map(d => `<div class="dip${S.dips.includes(d.id) ? " got" : ""}"><span class="e" aria-hidden="true">${esc(d.emoji || "🏅")}</span><b>${esc(d.name)}</b><small>${esc(d.beschreibung || "")}</small></div>`).join("")}</div>`); }
  function showDip(d) { confetti(40); showMsg("cool", `🏅 **Neues Diplom: ${d.name}!**\n\n${d.beschreibung || ""}${HUB ? "\n\nSchaut in gLiTChs Zimmer: Vielleicht gibt es dort etwas Neues." : ""}`, "Juhui!"); }
  function showLinks() { dlg(`<h2>🔗 Links</h2><ul class="links">${(M.links || []).map(l => `<li><a href="${esc(/^https?:\/\//i.test(l.url) ? l.url : "#")}" target="_blank" rel="noopener">${esc(l.titel || l.url)}</a>${l.titel ? `<br><small>${esc(l.url)}</small>` : ""}</li>`).join("")}</ul>`); }
  function confetti(n = 18) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < n; i++) { const c = document.createElement("i"); c.className = "confetti"; c.style.cssText += `left:${50 + (Math.random() - .5) * 40}vw;top:40vh;background:${["#FFC21A", "#FF2BD6", "#2EE6D6", "#A07CFF", "#3CFF7A"][i % 5]}`; document.body.appendChild(c);
      c.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 600}px,${200 + Math.random() * 300}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1200 + Math.random() * 800, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => c.remove(); }
  }
  start();
})();
