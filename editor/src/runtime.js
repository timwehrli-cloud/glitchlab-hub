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
  const gl = (mood, cls = "") => `<span class="glitch ${cls}">${G ? G.svg(mood, "#8B5CFF") : ""}</span>`;
  const ET = (M.etappen || []).filter(e => e && Array.isArray(e.aufgaben));
  const LEX = (M.lexikon || []).filter(w => w && w.wort);
  const DIP = (M.diplome || []).filter(d => d && d.id);
  const scorable = a => a && a.typ !== "info";
  const KEY = "glmod." + slug(M.titel || "modul");
  document.documentElement.style.setProperty("--mc", /^#[0-9a-f]{3,8}$/i.test(M.farbe || "") ? M.farbe : "#A07CFF");
  document.title = M.titel || "gLiTCh-Modul";

  /* ---------- Speicherstand (im Hub fürs ganze Team, sonst nur auf diesem Gerät) ---------- */
  let S = null;
  try { S = HUB ? HUB.laden() : JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  S = Object.assign({ ans: {}, dips: [], lex: false, fertig: false }, S || {});
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
    h = h.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    return h.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
  }

  /* ---------- Ansichten ---------- */
  const app = document.getElementById("app");
  let view = { name: "home" };
  function top() {
    return `<header class="top">${gl("happy")}<div class="top-t"><small>${esc(M.fachname || "gLiTCh-Modul")}${HUB ? "" : '<span class="test">Testmodus</span>'}</small><h1>${esc(M.emoji || "")} ${esc(M.titel || "Modul")}</h1></div>
      <span class="stars" title="Sterne in diesem Modul">★ ${total()} / ${totalMax()}</span></header>`;
  }
  function home() {
    app.innerHTML = `<div class="wrap">${top()}
      <section class="hero">${gl(S.fertig ? "cool" : "happy")}<div><div class="bubble"><b>gLiTCh</b><div>${rich(S.fertig ? (M.schluss || "Super, ihr habt alles geschafft!") : (M.intro || M.beschreibung || "Los geht's!"))}</div></div>
        ${who() ? `<p class="who">Heute dabei: ${esc(who())}</p>` : ""}</div><span class="big-emo" aria-hidden="true">${esc(M.emoji || "")}</span></section>
      <div class="grid">${ET.map((e, i) => { const mx = etMax(i), st = etStars(i);
        return `<button type="button" class="card${etDone(i) ? " done" : ""}" data-et="${i}"><span class="nr">${i + 1}</span><span class="emo" aria-hidden="true">${esc(e.emoji || "⭐")}</span>
          <h3>${esc(e.titel)}</h3><p>${esc(e.ziel || "")}</p>${mx ? `<span class="bar"><i style="width:${Math.round(st / mx * 100)}%"></i></span><small style="color:var(--muted)">★ ${st} / ${mx}</small>` : ""}</button>`; }).join("")}</div>
      <div class="tools">${LEX.length ? `<button type="button" class="btn" data-go="lex">📖 Lexikon (${LEX.length})</button>` : ""}
        ${DIP.length ? `<button type="button" class="btn" data-go="dip">🏅 Diplome ${S.dips.length}/${DIP.length}</button>` : ""}
        ${(M.links || []).length ? `<button type="button" class="btn" data-go="links">🔗 Links</button>` : ""}
        ${HUB ? `<button type="button" class="btn" data-go="exit">← Zurück zum Hub</button>` : ""}</div></div>`;
    $$("[data-et]").forEach(b => b.onclick = () => openEt(+b.dataset.et));
    bindTools();
  }
  function bindTools() {
    $$("[data-go]").forEach(b => b.onclick = () => { const g = b.dataset.go; if (g === "lex") showLex(); if (g === "dip") showDips(); if (g === "links") showLinks(); if (g === "exit" && HUB) HUB.beenden(); if (g === "home") { view = { name: "home" }; home(); } });
  }
  function openEt(e) {
    const A = ET[e].aufgaben; let t = A.findIndex((a, i) => scorable(a) && !(S.ans[k(e, i)] || {}).ok);
    if (t < 0 || !A.some((a, i) => S.ans[k(e, i)])) t = 0;
    view = { name: "et", e, t, intro: true }; etView(); window.scrollTo(0, 0);
  }
  function etView() {
    const { e } = view, E = ET[e], A = E.aufgaben;
    const steps = A.map((a, i) => { const s = S.ans[k(e, i)]; return `<i class="${i === view.t && !view.intro ? "cur" : s && s.ok ? "ok" : !scorable(a) && s ? "ok" : ""}"></i>`; }).join("");
    app.innerHTML = `<div class="wrap">${top()}<section class="panel">
      <div class="ehead"><span class="emo" aria-hidden="true">${esc(E.emoji || "⭐")}</span><h2>Etappe ${e + 1}: ${esc(E.titel)}</h2><button type="button" class="btn small" data-go="home">← Übersicht</button></div>
      <div class="steps" aria-label="Fortschritt">${steps}</div>
      ${view.intro ? `<div class="hero" style="margin-top:6px">${gl("wink")}<div class="bubble"><b>gLiTCh</b><div>${rich(E.intro || E.ziel || "Los geht's!")}</div></div></div>
        <div class="nav"><span></span><button type="button" class="btn primary" data-start>Los geht's →</button></div>` : `<div id="task"></div>`}
      </section>${LEX.length ? `<div class="tools"><button type="button" class="btn small" data-go="lex">📖 Lexikon</button></div>` : ""}</div>`;
    bindTools();
    const st = $("[data-start]"); if (st) st.onclick = () => { view.intro = false; etView(); };
    if (!view.intro) renderTask();
  }
  function done(e, t, ok, first, extra, pts) {
    const key = k(e, t), old = S.ans[key] || {}, a = ET[e].aufgaben[t];
    if (old.ok) return;
    const tries = (old.tries || 0) + 1;
    if (pts == null) pts = ok ? Math.max(1, wert(a) - (tries - 1)) : 0;
    S.ans[key] = Object.assign({}, old, extra || {}, { ok, tries, pts, first: ok && tries === 1 && pts >= wert(a) });
    save(); if (ok) { report(e); confetti(); }
    checkDips();
    $(".stars").textContent = `★ ${total()} / ${totalMax()}`;
  }
  function fb(ok, text) {
    const f = document.createElement("div"); f.className = "fb " + (ok ? "ok" : "bad");
    f.innerHTML = `${gl(ok ? "happy" : "hmm")}<div><p><b>${ok ? "Richtig!" : "Noch nicht ganz."}</b></p>${text ? rich(text) : ""}</div>`;
    const old = $("#task .fb"); if (old) old.remove();
    $("#task .task").appendChild(f);
    $$(".lex", f).forEach(b => b.onclick = () => showLex(b.dataset.lex));
  }
  function renderTask() {
    const { e, t } = view, A = ET[e].aufgaben, a = A[t], key = k(e, t), st = S.ans[key] || {};
    const last = t === A.length - 1;
    const KIND = { info: "Info", mc: "Quiz", tf: "Richtig oder falsch?", text: "Antwort eintippen", luecke: "Lückentext", ordnen: "Reihenfolge", zuordnen: "Verbinden", schreiben: "Schreibauftrag",
      sortieren: "Sortier-Spiel", zeitmaschine: "Zeitmaschine", raetsel: "Rätsel", memory: "Memory", mehrfach: "Mehrere richtig", schaetzen: "Schätzen", gestalten: "Gestalten" };
    const stars = wert(a) > 1 && scorable(a) ? ` · bis ${"★".repeat(wert(a))}` : "";
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
    $("#task").innerHTML = `<div class="task"><span class="kind">${KIND[a.typ] || "Aufgabe"} · ${t + 1}/${A.length}${stars}</span>${body}</div>
      <div class="nav"><button type="button" class="btn" data-prev ${t ? "" : "disabled"}>← Zurück</button><button type="button" class="btn primary" data-next>${last ? "Etappe abschliessen ✓" : "Weiter →"}</button></div>`;
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
    $("[data-prev]").onclick = () => { view.t--; etView(); };
    $("[data-next]").onclick = () => {
      if (!last) { view.t++; etView(); return; }
      checkDips();
      const ok = etDone(e);
      showMsg(ok ? "cool" : "hmm", ok ? (ET[e].lob || "Etappe geschafft!") : `Es ${etOpen(e) === 1 ? "fehlt noch 1 Aufgabe" : `fehlen noch ${etOpen(e)} Aufgaben`}. Die grauen Striche oben zeigen, welche.`, ok ? "Zur Übersicht" : "Weiterarbeiten", () => { if (ok) { view = { name: "home" }; home(); } else { view.t = ET[e].aufgaben.findIndex((x, i) => scorable(x) && !(S.ans[k(e, i)] || {}).ok); etView(); } });
    };
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
  home(); checkDips();
})();
