(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const slug = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const isCol = c => /^#[0-9a-f]{6}$/i.test(String(c || ""));
  const G = window.GLGlitch;
  const gl = (id, mood) => { const el = document.getElementById(id); if (el && G) el.innerHTML = G.svg(mood, "#8B5CFF"); };
  gl("mastG", "happy"); gl("sayG", "wink"); gl("pvG", "sleep");

  /* ---------- Hub-Struktur (gleich wie im Glitchlab-Hub) ---------- */
  const SUBJ = [["mi", "Medien & Informatik"], ["nmg", "Natur, Mensch, Gesellschaft"], ["de", "Deutsch"], ["ma", "Mathematik"], ["en", "Englisch"], ["fr", "Französisch"], ["sp", "Sport"], ["mg", "Minigames"]];
  const THEMES = { mi: ["Start mit gLiTCh", "KI & Prompts", "Medien durchschauen"], nmg: ["Entdeckungsreise Schweiz", "Die Römer"], de: ["Gespräche führen"] };
  /* Aufgabenarten = alle Spiele aus den NMG- und M&I-Modulen, die sich mit Inhalten füllen lassen */
  const TYPES = [["mc", "Quiz (Auswahl)"], ["tf", "Richtig/Falsch"], ["text", "Antwort eintippen"], ["mehrfach", "Mehrere richtig"], ["luecke", "Lückentext"], ["ordnen", "Reihenfolge / Zeitstrahl"], ["zuordnen", "Verbinden"], ["memory", "Memory"],
    ["sortieren", "Sortier-Spiel"], ["zeitmaschine", "Zeitmaschine"], ["raetsel", "Hinweis-Rätsel"], ["schaetzen", "Schätzen"], ["gestalten", "Gestalten (Plakat, Steckbrief)"], ["schreiben", "Schreibauftrag"]];
  const WERT = { mc: 1, tf: 1, text: 1, luecke: 2, ordnen: 2, zuordnen: 2, schreiben: 2, mehrfach: 2, schaetzen: 2, gestalten: 2, sortieren: 3, zeitmaschine: 3, raetsel: 3, memory: 3 };
  const wert = a => WERT[a.typ] || 1;
  const etSterne = e => e.aufgaben.reduce((n, a) => n + (a.typ === "info" ? 0 : wert(a)), 0);
  const OUT_SLOTS = [["kopf", "Kopf"], ["augen", "Augen"], ["mund", "Mund"], ["hals", "Hals & Rücken"], ["fuesse", "Füsse & Beine"], ["hand", "In der Hand"], ["haustier", "Haustier"]];
  const ROOM_SLOTS = [["links", "Links"], ["rechts", "Rechts"], ["wand", "Wand"], ["teppich", "Teppich"], ["deko", "Deko"], ["decke", "Decke"]];
  const ANIMS = [["huepfen", "Hüpfen"], ["drehen", "Drehen"], ["wackeln", "Wackeln"], ["gross", "Gross werden"], ["jubeln", "Jubeln"], ["regen", "Emoji-Regen"]];
  const KLASSEN = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => [String(k), `${k}. Klasse (Zyklus ${k <= 2 ? 1 : k <= 6 ? 2 : 3})`]);

  /* ---------- Entwurf (bleibt in diesem Browser) ---------- */
  const KEY = "gle.draft.v1";
  const fresh = () => ({ typenV2: true, titel: "", fach: "nmg", hubThema: "", hubNeu: "", klasse: "6", minuten: "45", etappen: "4", rahmen: "auto", ideen: "", typen: TYPES.map(t => t[0]), material: [], links: "", belIdeen: "",
    diplome: [], outfits: [], emotes: [], zimmer: [], hintergruende: [], plan: null, inhalt: [], step: 1, opt: freshOpt() });
  const freshOpt = () => ({ tipps: true, vorlesen: true, lexikon: true, pdf: true, freigabe: "keine", code: "" });
  let D = fresh();
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s === "object") D = Object.assign(fresh(), s); } catch (e) { /* kein Speicher */ }
  D.opt = Object.assign(freshOpt(), D.opt || {});
  if (!D.typenV2) { D.typen = [...new Set([...D.typen, "mehrfach", "memory", "sortieren", "zeitmaschine", "raetsel", "schaetzen", "gestalten"])]; D.typenV2 = true; }
  let saveT = null;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { try { localStorage.setItem(KEY, JSON.stringify(Object.assign({}, D, { material: D.material.map(m => Object.assign({}, m, { text: m.text.slice(0, 20000) })) }))); } catch (e2) { /* zu gross */ } } }, 400); };
  function toast(t, ms = 3200) { const x = document.createElement("div"); x.className = "toast"; x.setAttribute("role", "status"); x.textContent = t; document.body.appendChild(x); setTimeout(() => x.remove(), ms); }

  /* ---------- Schritte ---------- */
  function go(n) {
    D.step = n; save();
    $$("[data-pane]").forEach(p => p.hidden = +p.dataset.pane !== n);
    $$(".step").forEach(s => { s.setAttribute("aria-current", +s.dataset.step === n ? "step" : "false"); });
    if (n === 3) renderCats();
    if (n === 4) renderResult();
    paintSteps(); window.scrollTo({ top: 0 });
  }
  function paintSteps() {
    $(".step[data-step='1']").classList.toggle("ok", !!D.titel.trim());
    $(".step[data-step='2']").classList.toggle("ok", D.material.length > 0 || !!D.links.trim());
    $(".step[data-step='3']").classList.toggle("ok", D.diplome.length + D.outfits.length + D.emotes.length + D.zimmer.length + D.hintergruende.length > 0);
    $(".step[data-step='4']").classList.toggle("ok", D.inhalt.length > 0);
    $("#s2sub").textContent = D.material.length ? `${D.material.length} Datei${D.material.length === 1 ? "" : "en"}` : "PDF, Word, Links";
    const nx = D.outfits.length + D.emotes.length + D.zimmer.length + D.hintergruende.length;
    $("#s3sub").textContent = D.diplome.length + nx ? `${D.diplome.length} Diplome · ${nx} Extras` : "Diplome & Extras";
    $("#s4sub").textContent = D.inhalt.length ? "Modul fertig" : "Vorschau & Datei";
  }
  $$(".step").forEach(b => b.onclick = () => go(+b.dataset.step));
  $$("[data-goto]").forEach(b => b.onclick = () => go(+b.dataset.goto));
  $("#btnNew").onclick = () => {
    const b = $("#btnNew");
    if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Alles löschen? Nochmals tippen"; setTimeout(() => { b.dataset.sure = ""; b.textContent = "Neues Modul"; }, 4000); return; }
    D = fresh(); save(); b.dataset.sure = ""; b.textContent = "Neues Modul"; bindBasics(); renderFiles(); go(1); toast("Neues Modul angefangen.");
  };

  /* ---------- 1 Grundlagen ---------- */
  function opts(list, cur) { return list.map(([v, n]) => `<option value="${esc(v)}"${String(cur) === String(v) ? " selected" : ""}>${esc(n)}</option>`).join(""); }
  function paintThemes() {
    const ts = THEMES[D.fach] || [];
    if (D.hubThema && D.hubThema !== "__neu" && !ts.includes(D.hubThema)) D.hubThema = "";
    if (!D.hubThema) D.hubThema = ts.length ? "__neu" : "__neu";
    $("#hubThema").innerHTML = ts.map(t => `<option${D.hubThema === t ? " selected" : ""}>${esc(t)}</option>`).join("") + `<option value="__neu"${D.hubThema === "__neu" ? " selected" : ""}>+ Neues Thema …</option>`;
    $("#neuWrap").hidden = D.hubThema !== "__neu";
  }
  function bindBasics() {
    $("#fach").innerHTML = opts(SUBJ, D.fach);
    $("#klasse").innerHTML = opts(KLASSEN, D.klasse);
    ["titel", "hubNeu", "ideen", "links", "belIdeen"].forEach(id => { const el = $("#" + id); el.value = D[id] || ""; el.oninput = () => { D[id] = el.value; save(); paintSteps(); }; });
    ["minuten", "etappen", "rahmen", "klasse"].forEach(id => { const el = $("#" + id); el.value = D[id]; el.onchange = () => { D[id] = el.value; save(); }; });
    $("#fach").onchange = e => { D.fach = e.target.value; D.hubThema = ""; paintThemes(); save(); };
    $("#hubThema").onchange = e => { D.hubThema = e.target.value; $("#neuWrap").hidden = D.hubThema !== "__neu"; save(); };
    paintThemes();
    $("#typen").innerHTML = TYPES.map(([v, n]) => `<label class="chip"><input type="checkbox" value="${v}"${D.typen.includes(v) ? " checked" : ""}> ${esc(n)}</label>`).join("");
    paintOpts();
    $$("#typen input").forEach(c => c.onchange = () => { D.typen = $$("#typen input:checked").map(x => x.value); if (!D.typen.length) { c.checked = true; D.typen = [c.value]; toast("Mindestens eine Aufgabenart muss gewählt sein."); } save(); });
  }

  /* ---------- Funktionen und Freigabe ---------- */
  const TOGGLES = [["tipps", "💡 Tipps von gLiTCh", "Tipp-Knopf bei jeder Aufgabe und Hilfe bei Fehlern"], ["vorlesen", "🔊 Vorlesen", "«gLiTCh erklärt» lässt sich vorlesen"],
    ["lexikon", "📖 Fachwörter-Lexikon", "Schwierige Wörter antippen, gLiTCh erklärt sie"], ["pdf", "📄 Zusammenfassung als PDF", "Die Kinder laden am Schluss alles Wichtige als PDF herunter"]];
  const FREI = [["keine", "Keine Freigabe", "Die Kinder gehen frei von Etappe zu Etappe."], ["selbst", "🪞 Selbsteinschätzung", "Nach jeder Etappe schätzen sich die Kinder ein (4 Stufen und ein Satz). Erst dann geht die nächste auf."],
    ["lp", "🔐 Freigabe mit LP-Code", "Nach jeder Etappe gibt die Lehrperson mit ihrem Code frei. Im Hub gilt der Code jeder Lehrperson der Klasse."]];
  function paintOpts() {
    const O = D.opt;
    $("#toggles").innerHTML = TOGGLES.map(([k, n, d]) => `<label class="tg"><input type="checkbox" data-opt="${k}"${O[k] ? " checked" : ""}><i aria-hidden="true"></i><span><b>${esc(n)}</b><small>${esc(d)}</small></span></label>`).join("");
    $$("[data-opt]").forEach(c => c.onchange = () => { O[c.dataset.opt] = c.checked; save(); if (D.step === 4) renderResult(); });
    $("#freigabe").innerHTML = FREI.map(([v, n, d]) => `<button type="button" role="radio" aria-checked="${O.freigabe === v}" class="${O.freigabe === v ? "on" : ""}" data-fr="${v}"><b>${esc(n)}</b><small>${esc(d)}</small></button>`).join("");
    $$("[data-fr]").forEach(b => b.onclick = () => { O.freigabe = b.dataset.fr; save(); paintOpts(); if (D.step === 4) renderResult(); });
    $("#codeWrap").hidden = O.freigabe !== "lp";
    $("#frHint").textContent = O.freigabe === "lp" ? "Im Hub gilt der Freigabe-Code jeder Lehrperson der Klasse (deiner und die der weiteren Lehrpersonen). Der Code hier gilt nur in der Vorschau und wenn das Modul ohne Hub geöffnet wird (leer = 1234)." : "";
    const c = $("#optCode"); c.value = O.code || ""; c.oninput = () => { O.code = c.value.replace(/\D/g, "").slice(0, 8); save(); };
    c.onchange = () => { c.value = O.code; if (D.step === 4) renderResult(); };
  }

  /* ---------- 2 Material ---------- */
  if (window.pdfjsLib) { try { pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; } catch (e) { /* ok */ } }
  const MAXC = 60000;
  async function readFile(f) {
    const name = f.name, low = name.toLowerCase();
    if (low.endsWith(".pdf") || f.type === "application/pdf") {
      if (!window.pdfjsLib) throw new Error("Der PDF-Leser konnte nicht geladen werden.");
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise; let out = "";
      for (let p = 1; p <= Math.min(pdf.numPages, 80) && out.length < MAXC; p++) { const tc = await (await pdf.getPage(p)).getTextContent(); out += tc.items.map(i => i.str + (i.hasEOL ? "\n" : " ")).join("") + "\n\n"; }
      return { kind: "PDF", pages: pdf.numPages, text: out };
    }
    if (low.endsWith(".docx")) {
      if (!window.mammoth) throw new Error("Der Word-Leser konnte nicht geladen werden.");
      const r = await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() });
      return { kind: "Word", text: r.value };
    }
    if (low.endsWith(".doc")) throw new Error("Alte .doc-Dateien gehen nicht. Speichere die Datei in Word als .docx.");
    return { kind: "Text", text: await f.text() };
  }
  async function addFiles(list) {
    for (const f of list) {
      const id = Math.random().toString(36).slice(2, 9);
      D.material.push({ id, name: f.name, kind: "…", text: "", busy: true }); renderFiles();
      try {
        const r = await readFile(f), t = r.text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
        const m = D.material.find(x => x.id === id); if (!m) continue;
        Object.assign(m, { kind: r.kind, pages: r.pages || 0, text: t.slice(0, MAXC), cut: t.length > MAXC, busy: false });
        if (!t) m.err = "Kein Text gefunden. Ist es ein eingescanntes PDF (nur Bilder)?";
      } catch (e) { const m = D.material.find(x => x.id === id); if (m) Object.assign(m, { busy: false, err: e.message || "Datei konnte nicht gelesen werden." }); }
      renderFiles(); save(); paintSteps();
    }
  }
  function renderFiles() {
    $("#files").innerHTML = D.material.map(m => `<div class="file"><span class="ic" aria-hidden="true">${m.kind === "PDF" ? "📕" : m.kind === "Word" ? "📘" : "📄"}</span>
      <div style="min-width:0"><b>${esc(m.name)}</b><small>${m.busy ? "wird gelesen …" : m.err ? `<span style="color:var(--bad)">${esc(m.err)}</span>` : `${m.kind}${m.pages ? ` · ${m.pages} Seiten` : ""} · ${m.text.length.toLocaleString("de-CH")} Zeichen${m.cut ? " (gekürzt)" : ""}`}</small></div>
      <button type="button" class="btn small danger" data-rmf="${m.id}" aria-label="${esc(m.name)} entfernen">✕</button></div>`).join("");
    $$("[data-rmf]").forEach(b => b.onclick = () => { D.material = D.material.filter(m => m.id !== b.dataset.rmf); renderFiles(); save(); paintSteps(); });
  }
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => addFiles([...e.dataTransfer.files]));
  drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#fileIn").click(); } });
  $("#fileIn").onchange = e => { addFiles([...e.target.files]); e.target.value = ""; };

  /* ---------- 3 Belohnungen ---------- */
  const CATS = [
    { k: "diplome", n: "Diplome", ic: "🏅", d: "Auszeichnungen im Modul. Im Hub hängen sie als Bild an gLiTChs Wand (10 Plätze). Sie können auch Extras freischalten." },
    { k: "outfits", n: "Outfits für gLiTCh", ic: "👕", d: "Kleider und Accessoires für die Garderobe." },
    { k: "emotes", n: "Emotes", ic: "✨", d: "Kleine Animationen, die gLiTCh vorführt." },
    { k: "zimmer", n: "Zimmer-Gegenstände", ic: "🛋️", d: "Möbel und Deko für gLiTChs Zimmer." },
    { k: "hintergruende", n: "Hintergründe", ic: "🖼️", d: "Neue Farben und Stimmung für das ganze Zimmer." }
  ];
  const DIP_COND = () => [["start", "Erster Stern"], ...Array.from({ length: +D.etappen || 4 }, (_, i) => [`etappe:${i + 1}`, `Etappe ${i + 1} geschafft`]), ["alle", "Alle Etappen"], ["perfekt", "Alles beim 1. Versuch"], ["lexikon", "Lexikon geöffnet"]];
  const UNLOCK = () => [["sofort", "Sofort"], ["start", "Ab 1. Stern"], ["sterne:5", "Ab 5 Sternen"], ["sterne:10", "Ab 10 Sternen"], ["fertig", "Alle Sterne"], ...D.diplome.map(d => [`badge:${d.id}`, `Diplom «${d.name}»`])];
  const sel = (list, cur, attr) => `<select class="in" ${attr}>${opts(list, cur)}</select>`;
  function uid(list, base) { let id = slug(base) || "x", n = 2; while (list.some(x => x.id === id)) id = slug(base) + "-" + n++; return id; }
  function rowHTML(c, x, i) {
    const del = `<button type="button" class="btn small danger" data-del="${c.k}:${i}" aria-label="Entfernen">✕</button>`;
    const emo = `<input class="in emo" data-f="${c.k}:${i}:emoji" value="${esc(x.emoji)}" maxlength="8" aria-label="Emoji">`;
    const name = `<input class="in" data-f="${c.k}:${i}:name" value="${esc(x.name)}" maxlength="40" aria-label="Name">`;
    const unl = sel(UNLOCK(), x.freischalten, `data-f="${c.k}:${i}:freischalten" aria-label="Freischalten"`);
    if (c.k === "diplome") return `<div class="item dip">${emo}${name}<input class="in" data-f="${c.k}:${i}:beschreibung" value="${esc(x.beschreibung)}" maxlength="120" aria-label="Beschreibung" placeholder="Wofür gibt es das Diplom?">${sel(DIP_COND(), x.bedingung, `data-f="${c.k}:${i}:bedingung" aria-label="Bedingung"`)}${del}</div>`;
    if (c.k === "outfits") return `<div class="item">${emo}${name}${sel(OUT_SLOTS, x.platz, `data-f="${c.k}:${i}:platz" aria-label="Platz"`)}${unl}${del}</div>`;
    if (c.k === "emotes") return `<div class="item">${emo}${name}${sel(ANIMS, x.animation, `data-f="${c.k}:${i}:animation" aria-label="Animation"`)}${unl}${del}</div>`;
    if (c.k === "zimmer") return `<div class="item">${emo}${name}${sel(ROOM_SLOTS, x.platz, `data-f="${c.k}:${i}:platz" aria-label="Platz"`)}${unl}${del}</div>`;
    return `<div class="item bg">${emo}${name}<label class="sw" title="Wandfarbe"><input type="color" data-f="${c.k}:${i}:wand0" value="${isCol(x.wand && x.wand[0]) ? x.wand[0] : "#241052"}" aria-label="Wandfarbe oben"><input type="color" data-f="${c.k}:${i}:wand1" value="${isCol(x.wand && x.wand[1]) ? x.wand[1] : "#4B2696"}" aria-label="Wandfarbe unten"></label>
      <label class="sw" title="Bodenfarbe"><input type="color" data-f="${c.k}:${i}:boden0" value="${isCol(x.boden && x.boden[0]) ? x.boden[0] : "#7A4A26"}" aria-label="Bodenfarbe hinten"><input type="color" data-f="${c.k}:${i}:boden1" value="${isCol(x.boden && x.boden[1]) ? x.boden[1] : "#9C6534"}" aria-label="Bodenfarbe vorne"></label>${unl}${del}</div>`;
  }
  const blank = k => ({ diplome: { emoji: "🏅", name: "Neues Diplom", beschreibung: "", bedingung: "alle" }, outfits: { emoji: "🎩", name: "Neues Outfit", platz: "kopf", freischalten: "start" }, emotes: { emoji: "🎉", name: "Neues Emote", animation: "huepfen", text: "", freischalten: "fertig" }, zimmer: { emoji: "🪴", name: "Neuer Gegenstand", platz: "deko", freischalten: "sterne:5" }, hintergruende: { emoji: "🎨", name: "Neuer Hintergrund", wand: ["#241052", "#4B2696"], boden: ["#7A4A26", "#9C6534"], freischalten: "fertig" } })[k];
  function renderCats() {
    $("#cats").innerHTML = CATS.map(c => `<div class="f" style="gap:10px"><div class="cat-h"><span aria-hidden="true" style="font-size:1.3rem">${c.ic}</span><h3>${c.n} <span class="n">${D[c.k].length}</span></h3>
        <button type="button" class="btn small" data-add="${c.k}">+ Eigenes</button><button type="button" class="btn small teal" data-sug="${c.k}">✨ Vorschlagen</button></div>
        <p class="hint">${c.d}</p><div class="list">${D[c.k].map((x, i) => rowHTML(c, x, i)).join("") || `<div class="empty">Noch nichts. Füge eigene hinzu oder lass gLiTCh etwas vorschlagen.</div>`}</div></div>`).join(`<hr style="border:0;border-top:1px solid var(--line);margin:4px 0;width:100%">`);
    $$("[data-f]", $("#cats")).forEach(el => { el.oninput = el.onchange = () => {
      const [k, i, f] = el.dataset.f.split(":"), x = D[k][+i]; if (!x) return;
      if (f === "wand0" || f === "wand1") { x.wand = x.wand || []; x.wand[+f.slice(-1)] = el.value; }
      else if (f === "boden0" || f === "boden1") { x.boden = x.boden || []; x.boden[+f.slice(-1)] = el.value; }
      else x[f] = el.value;
      if (k === "diplome" && f === "name" && el.tagName === "INPUT") { /* Name ändert die id nicht, damit Freischaltungen gültig bleiben */ }
      save(); paintSteps(); if (k === "diplome" && f === "name") $$("select[data-f$=':freischalten']", $("#cats")).forEach(s => { const v = s.value; s.innerHTML = opts(UNLOCK(), v); });
    }; });
    $$("[data-del]", $("#cats")).forEach(b => b.onclick = () => { const [k, i] = b.dataset.del.split(":"); const gone = D[k].splice(+i, 1)[0];
      if (k === "diplome" && gone) CATS.slice(1).forEach(c => D[c.k].forEach(x => { if (x.freischalten === "badge:" + gone.id) x.freischalten = "fertig"; }));
      save(); renderCats(); paintSteps(); });
    $$("[data-add]", $("#cats")).forEach(b => b.onclick = () => { const k = b.dataset.add, x = blank(k); x.id = uid(D[k], x.name); D[k].push(x); save(); renderCats(); paintSteps(); const ins = $$(`[data-f^="${k}:${D[k].length - 1}:name"]`); if (ins[0]) ins[0].select(); });
    $$("[data-sug]", $("#cats")).forEach(b => b.onclick = () => suggest([b.dataset.sug], b));
  }

  /* ---------- Claude ---------- */
  let SAMPLE = null, ctl = null;
  (async () => {
    try { SAMPLE = window.claude && claude.use ? await claude.use("sample") : null; } catch (e) { SAMPLE = null; }
    if (!SAMPLE) { $("#sayT").textContent = "Hier kann ich gerade keine Module erstellen. Öffne den Editor in claude.ai, dann klappt es."; $("#btnGen").disabled = true; $("#sugAll").disabled = true; $("#sugMsg").textContent = "Vorschläge gibt es nur, wenn der Editor in claude.ai geöffnet ist."; }
  })();
  const ERRTXT = { not_granted: "Du hast gLiTCh nicht erlaubt, Claude zu fragen. Lade die Seite neu und erlaube es.", sampling_disabled: "Claude ist für dieses Konto nicht verfügbar.", rate_limited: "Gerade zu viele Anfragen. Warte ein paar Minuten und versuch es dann nochmal.", invalid_json: "Die Antwort war unvollständig. Tippe nochmals auf den Knopf.", prompt_too_large: "Das Material ist zu lang. Entferne eine Datei oder kürze den Text.", refused: "Claude hat diese Anfrage abgelehnt. Ändere das Thema oder die Ideen.", cancelled: "Gestoppt.", session_expired: "Bitte melde dich in claude.ai neu an." };
  const errMsg = e => ERRTXT[e && e.code] || "Etwas hat nicht geklappt. Tippe nochmals auf den Knopf.";
  const fachName = () => (SUBJ.find(s => s[0] === D.fach) || [, ""])[1];
  const hubThemaName = () => D.hubThema === "__neu" ? (D.hubNeu.trim() || D.titel.trim()) : D.hubThema;
  const stufe = () => { const k = +D.klasse; return `${k}. Klasse, Zyklus ${k <= 2 ? 1 : k <= 6 ? 2 : 3} (Lehrplan 21, Schweiz), Kinder ca. ${k + 5}–${k + 7} Jahre`; };
  function material(max = 45000) {
    const parts = D.material.filter(m => m.text && !m.err); if (!parts.length) return "";
    const per = Math.floor(max / parts.length);
    return "\n\nMATERIAL DER LEHRPERSON (nutze die Inhalte, Fakten und Begriffe daraus):\n" + parts.map(m => `--- ${m.name} ---\n${m.text.slice(0, per)}`).join("\n\n");
  }
  const linkList = () => D.links.split("\n").map(l => l.trim()).filter(Boolean).map(l => { const p = l.split("|"); const url = (p.length > 1 ? p.slice(1).join("|") : p[0]).trim(); return { titel: p.length > 1 ? p[0].trim() : "", url }; }).filter(l => /^https?:\/\//i.test(l.url));
  function context() {
    const L = linkList();
    return `Du bist gLiTCh, das freundliche Pixel-Maskottchen des «Glitchlab-Hub», einer Lernplattform einer Schweizer Primarschule. Du baust Lernmodule im Stil der gLiTCh-Lab-Module für NMG und Medien & Informatik: eine Rahmengeschichte, mehrere Etappen wie Missionen, gLiTCh spricht die Kinder in einer Sprechblase an, kurze Infotexte, abwechslungsreiche Aufgaben, Fachwörter im Lexikon, Diplome als Belohnung.

MODUL
- Thema: ${D.titel.trim() || "(noch kein Titel)"}
- Fach: ${fachName()}${hubThemaName() ? ` · Themenbereich: ${hubThemaName()}` : ""}
- Schulstufe: ${stufe()}
- Dauer: ca. ${D.minuten} Minuten, ${D.etappen} Etappen. Die Kinder arbeiten oft zu zweit an einem Gerät.
- Rahmengeschichte: ${D.rahmen === "auto" ? "wähle eine passende, kindgerechte Rahmengeschichte" : D.rahmen}
${D.ideen.trim() ? `- Ideen und Wünsche der Lehrperson: ${D.ideen.trim()}` : ""}
${L.length ? `- Links, die im Modul stehen (du kannst sie nicht öffnen, nur erwähnen): ${L.map(l => (l.titel ? l.titel + " " : "") + l.url).join(" · ")}` : ""}

SPRACHE
- Schweizer Hochdeutsch: immer «ss» statt «ß», Anführungszeichen «…».
- Sprich die Kinder mit «ihr» an. Kurze, klare Sätze, passend zur Stufe. Schwierige Wörter erklärst du oder nimmst sie ins Lexikon.
- Fachlich korrekt. Keine erfundenen Fakten. Lieber einfach und richtig als ausführlich.${material()}`;
  }

  /* Vorschläge für Diplome und Extras */
  async function suggest(keys, btn) {
    if (!SAMPLE) return;
    const want = { diplome: "diplome: 3–4 Diplome {id, name, emoji, beschreibung, bedingung} – bedingung ist eine von: start, etappe:1 … etappe:" + D.etappen + ", alle, perfekt, lexikon",
      outfits: `outfits: 3 Outfits {name, emoji, platz, spruch} – platz ist eine von: ${OUT_SLOTS.map(s => s[0]).join(", ")}. Das Emoji muss gut als Kleidungsstück oder Accessoire passen.`,
      emotes: `emotes: 2–3 Emotes {name, emoji, text, animation, farben} – animation ist eine von: ${ANIMS.map(a => a[0]).join(", ")}; text ist ein kurzer Ausruf (max. 3 Wörter); farben 2–3 Hex-Farben`,
      zimmer: `zimmer: 3 Gegenstände {name, emoji, platz} – platz ist eine von: ${ROOM_SLOTS.map(s => s[0]).join(", ")}`,
      hintergruende: "hintergruende: 1–2 Hintergründe {name, emoji, wand:[hex oben, hex unten], boden:[hex hinten, hex vorne]} – eher dunkle, stimmige Farben, damit gLiTCh gut sichtbar bleibt" };
    const have = keys.map(k => D[k].length ? `Schon vorhanden bei ${k}: ${D[k].map(x => x.name).join(", ")} (nichts doppelt vorschlagen)` : "").filter(Boolean).join("\n");
    const prompt = `${context()}

AUFGABE: Schlage Belohnungen für dieses Modul vor. Sie sollen zum Thema passen, witzig und kindgerecht sein.
${D.belIdeen.trim() ? `Ideen der Lehrperson (unbedingt einbauen): ${D.belIdeen.trim()}\n` : ""}${have}
Gib NUR ein JSON-Objekt zurück mit diesen Feldern:
${keys.map(k => "- " + want[k]).join("\n")}
Beispiel: {"${keys[0]}": [ … ]}`;
    const old = btn.innerHTML; btn.disabled = true; btn.textContent = "gLiTCh überlegt …"; $("#sugMsg").textContent = "gLiTCh sammelt Ideen. Das dauert etwa 20 Sekunden.";
    try {
      const r = await SAMPLE.json(prompt, { modelTier: "default", cache: false });
      let n = 0;
      keys.forEach(k => (Array.isArray(r && r[k]) ? r[k] : []).slice(0, 6).forEach(x => { const it = normReward(k, x); if (it) { it.id = uid(D[k], it.name); D[k].push(it); n++; } }));
      // Extras ohne passende Freischaltung: Diplome nutzen, wenn vorhanden
      linkUnlocks();
      save(); renderCats(); paintSteps(); $("#sugMsg").textContent = n ? `${n} Vorschläge dazugekommen. Ändere, was nicht passt.` : "Diesmal kam nichts Brauchbares. Versuch es nochmals.";
    } catch (e) { $("#sugMsg").textContent = errMsg(e); }
    btn.disabled = false; btn.innerHTML = old;
  }
  function normReward(k, x) {
    if (!x || typeof x !== "object" || !x.name) return null;
    const name = String(x.name).slice(0, 40), emoji = String(x.emoji || "").slice(0, 8);
    if (k === "diplome") { const b = String(x.bedingung || "alle").toLowerCase(); return { emoji: emoji || "🏅", name, beschreibung: String(x.beschreibung || "").slice(0, 120), bedingung: DIP_COND().some(c => c[0] === b) ? b : "alle" }; }
    if (k === "outfits") return { emoji: emoji || "🎩", name, platz: OUT_SLOTS.some(s => s[0] === x.platz) ? x.platz : "kopf", spruch: String(x.spruch || "").slice(0, 140), freischalten: "" };
    if (k === "emotes") return { emoji: emoji || "🎉", name, text: String(x.text || "").slice(0, 30), animation: ANIMS.some(a => a[0] === x.animation) ? x.animation : "huepfen", farben: (Array.isArray(x.farben) ? x.farben : []).filter(isCol).slice(0, 3), freischalten: "" };
    if (k === "zimmer") return { emoji: emoji || "🪴", name, platz: ROOM_SLOTS.some(s => s[0] === x.platz) ? x.platz : "deko", freischalten: "" };
    if (k === "hintergruende") return { emoji: emoji || "🎨", name, wand: (Array.isArray(x.wand) ? x.wand : []).filter(isCol).slice(0, 2), boden: (Array.isArray(x.boden) ? x.boden : []).filter(isCol).slice(0, 2), freischalten: "" };
    return null;
  }
  /* Neue Extras ohne Freischaltung bekommen eine sinnvolle: der Reihe nach Diplome, sonst Sterne */
  function linkUnlocks() {
    const pool = D.diplome.map(d => "badge:" + d.id), fallback = ["start", "sterne:5", "fertig"]; let i = 0;
    ["outfits", "emotes", "zimmer", "hintergruende"].forEach(k => D[k].forEach(x => { if (!x.freischalten) { x.freischalten = pool.length ? pool[i % pool.length] : fallback[i % fallback.length]; i++; } }));
  }
  $("#sugAll").onclick = () => suggest(CATS.map(c => c.k), $("#sugAll"));

  /* ---------- 4 Erstellen ---------- */
  const TASK_DOC = `AUFGABEN (JSON-Objekte mit Feld "typ"):
Jede Aufgabe (nicht info) hat zusätzlich "titel" (Name des Bausteins, 1–3 Wörter, z. B. "Der Bundesbrief") und "tipp" (ein Hinweis von gLiTCh, der hilft, ohne die Lösung zu verraten).
- {"typ":"info","titel":"…","text":"gLiTCh erklärt: 2–5 kurze Sätze für Kinder. Absätze mit Leerzeile. **fett** erlaubt. Ein Merksatz oder «Falsch gedacht: … / Richtig: …» macht es lebendig."}
- {"typ":"mc","frage":"…","optionen":["…","…","…"],"richtig":0,"erklaerung":"…","tipp":"…"}   (3–4 Optionen, richtig = Index)
- {"typ":"tf","aussage":"…","richtig":true,"erklaerung":"…","tipp":"…"}
- {"typ":"text","frage":"…","antworten":["Bern","die Stadt Bern"],"erklaerung":"…","tipp":"…"}   (eindeutige Antwort aus 1–3 Wörtern, mehrere gültige Schreibweisen)
- {"typ":"luecke","anleitung":"…","text":"Satz mit [[Lösung]] und [[Lösung2|Variante]].","optionen":["Lösung","Lösung2","Ablenker"],"erklaerung":"…"}   (2–4 Lücken; optionen = Auswahlliste für alle Lücken, freiwillig)
- {"typ":"ordnen","frage":"…","elemente":["1. Schritt","2. Schritt","3. Schritt","4. Schritt"],"erklaerung":"…"}   (in der RICHTIGEN Reihenfolge angeben)
- {"typ":"zuordnen","frage":"…","paare":[["Begriff","passende Erklärung"],["…","…"]],"erklaerung":"…"}   (3–5 Paare, rechte Seiten alle verschieden)
- {"typ":"schreiben","auftrag":"…","mindestwoerter":25,"erklaerung":"…"}
- {"typ":"mehrfach","frage":"…","optionen":["…","…","…","…","…"],"richtig":[0,2,3],"erklaerung":"…","tipp":"…"}   (4–6 Optionen, 2–4 davon richtig)
- {"typ":"memory","frage":"…","paare":[["Begriff","Gegenstück"],["…","…"]],"erklaerung":"…"}   (4–6 Paare, kurze Texte, max. 6 Wörter pro Karte)
- {"typ":"sortieren","frage":"…","kategorien":["Kategorie A","Kategorie B"],"elemente":[{"text":"…","kat":"Kategorie A","warum":"kurzer Grund"}],"erklaerung":"…"}   (2–4 Kategorien, 6–10 Karten, kat genau wie in kategorien)
- {"typ":"zeitmaschine","frage":"…","von":1200,"bis":2000,"einheit":"","ereignisse":[{"text":"Ereignis","jahr":1291}],"erklaerung":"…"}   (3–5 Ereignisse mit sicheren Jahreszahlen zwischen von und bis; nur bei Themen mit Jahreszahlen)
- {"typ":"raetsel","frage":"Wer oder was ist gemeint?","hinweise":["schwerer Hinweis","mittlerer Hinweis","leichter Hinweis"],"antworten":["Lösung","Variante"],"erklaerung":"…"}   (3–4 Hinweise vom schweren zum leichten)
- {"typ":"schaetzen","frage":"…","min":0,"max":5000,"antwort":4634,"toleranz":300,"einheit":"m","erklaerung":"…"}   (eine gesicherte Zahl; toleranz grosszügig)
- {"typ":"gestalten","auftrag":"Gestaltet ein Plakat / einen Steckbrief / eine Zeitungsseite zu …","titelname":"Überschrift","textname":"Text","mindestwoerter":20,"sticker":["🌋","🔥","⭐"],"erklaerung":"…"}`;
  const typesAllowed = () => D.typen.length ? D.typen : TYPES.map(t => t[0]);
  const perEt = () => Math.max(3, Math.min(8, Math.round(+D.minuten / 6 / (+D.etappen || 4))));
  function validTask(a) {
    const r = validTask0(a); if (r && r.typ !== "info") { r.titel = String(a.titel || "").trim().slice(0, 40); if (!r.tipp && a.tipp) r.tipp = String(a.tipp).trim(); }
    return r;
  }
  function validTask0(a) {
    if (!a || typeof a !== "object") return null; const t = a.typ, s = v => String(v ?? "").trim();
    if (t === "info") return s(a.text) ? { typ: t, titel: s(a.titel), text: s(a.text) } : null;
    if (t === "mc") { const o = (a.optionen || []).map(s).filter(Boolean); const r = +a.richtig; return s(a.frage) && o.length >= 2 && r >= 0 && r < o.length ? { typ: t, frage: s(a.frage), optionen: o, richtig: r, erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null; }
    if (t === "tf") return s(a.aussage) ? { typ: t, aussage: s(a.aussage), richtig: a.richtig === true || a.richtig === "true", erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null;
    if (t === "text") { const an = (Array.isArray(a.antworten) ? a.antworten : [a.antworten]).map(s).filter(Boolean); return s(a.frage) && an.length ? { typ: t, frage: s(a.frage), antworten: an, erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null; }
    if (t === "luecke") return /\[\[.+?\]\]/.test(s(a.text)) ? { typ: t, anleitung: s(a.anleitung), text: s(a.text), optionen: (a.optionen || []).map(s).filter(Boolean), erklaerung: s(a.erklaerung) } : null;
    if (t === "ordnen") { const el = (a.elemente || []).map(s).filter(Boolean); return el.length >= 3 && new Set(el).size === el.length ? { typ: t, frage: s(a.frage), elemente: el, erklaerung: s(a.erklaerung) } : null; }
    if (t === "zuordnen") { const p = (a.paare || []).filter(x => Array.isArray(x) && s(x[0]) && s(x[1])).map(x => [s(x[0]), s(x[1])]); return p.length >= 2 && new Set(p.map(x => x[1])).size === p.length ? { typ: t, frage: s(a.frage), paare: p, erklaerung: s(a.erklaerung) } : null; }
    if (t === "schreiben") return s(a.auftrag) ? { typ: t, auftrag: s(a.auftrag), mindestwoerter: Math.max(5, Math.min(200, +a.mindestwoerter || 25)), erklaerung: s(a.erklaerung) } : null;
    if (t === "mehrfach") { const o = (a.optionen || []).map(s).filter(Boolean), r = [...new Set((a.richtig || []).map(Number))].filter(i => i >= 0 && i < o.length); return s(a.frage) && o.length >= 3 && r.length >= 1 ? { typ: t, frage: s(a.frage), optionen: o, richtig: r, erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null; }
    if (t === "memory") { const p = (a.paare || []).filter(x => Array.isArray(x) && s(x[0]) && s(x[1])).map(x => [s(x[0]), s(x[1])]).slice(0, 8); return p.length >= 3 ? { typ: t, frage: s(a.frage), paare: p, erklaerung: s(a.erklaerung) } : null; }
    if (t === "sortieren") { const k = (a.kategorien || []).map(s).filter(Boolean).slice(0, 4), el = (a.elemente || []).filter(x => x && s(x.text) && k.some(c => c.toLowerCase() === s(x.kat).toLowerCase())).map(x => ({ text: s(x.text), kat: k.find(c => c.toLowerCase() === s(x.kat).toLowerCase()), warum: s(x.warum) })); return k.length >= 2 && el.length >= 4 ? { typ: t, frage: s(a.frage), kategorien: k, elemente: el.slice(0, 12), erklaerung: s(a.erklaerung) } : null; }
    if (t === "zeitmaschine") { const von = Math.round(+a.von), bis = Math.round(+a.bis), ev = (a.ereignisse || []).filter(x => x && s(x.text) && isFinite(+x.jahr) && +x.jahr >= von && +x.jahr <= bis).map(x => ({ text: s(x.text), jahr: Math.round(+x.jahr) })); return isFinite(von) && isFinite(bis) && bis > von && ev.length >= 2 ? { typ: t, frage: s(a.frage), von, bis, einheit: s(a.einheit), ereignisse: ev.slice(0, 6), erklaerung: s(a.erklaerung) } : null; }
    if (t === "raetsel") { const h = (a.hinweise || []).map(s).filter(Boolean), an = (Array.isArray(a.antworten) ? a.antworten : [a.antworten]).map(s).filter(Boolean); return h.length >= 2 && an.length ? { typ: t, frage: s(a.frage), hinweise: h.slice(0, 5), antworten: an, erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null; }
    if (t === "schaetzen") { const mn = +a.min, mx = +a.max, an = +a.antwort; return s(a.frage) && isFinite(mn) && isFinite(mx) && mx > mn && an >= mn && an <= mx ? { typ: t, frage: s(a.frage), min: mn, max: mx, antwort: an, toleranz: Math.max(0, +a.toleranz || Math.round((mx - mn) * .05)), einheit: s(a.einheit), erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null; }
    if (t === "gestalten") return s(a.auftrag) ? { typ: t, auftrag: s(a.auftrag), titelname: s(a.titelname), textname: s(a.textname), mindestwoerter: Math.max(5, Math.min(120, +a.mindestwoerter || 20)), sticker: (a.sticker || []).map(s).filter(Boolean).slice(0, 8), erklaerung: s(a.erklaerung) } : null;
    return null;
  }
  function progRows(rows) { $("#prog").innerHTML = rows.filter(Boolean).map(r => `<div class="pr ${r.st || ""}"><i></i><span>${esc(r.t)}</span><small>${esc(r.info || "")}</small></div>`).join(""); }
  let rows = [];
  const setRow = (i, o) => { rows[i] = Object.assign(rows[i] || {}, o); progRows(rows); };
  async function ask(prompt, i, signal) {
    let n = 0;
    return SAMPLE.json(prompt, { modelTier: $("#tier").value, cache: false, signal, onText: ({ text }) => { n = text.length; setRow(i, { info: `${n.toLocaleString("de-CH")} Zeichen` }); } });
  }
  async function planModule(signal) {
    const needDip = !D.diplome.length;
    const prompt = `${context()}

AUFGABE: Plane das Modul. Gib NUR ein JSON-Objekt zurück:
{"titel":"kurzer, packender Modultitel","beschreibung":"1 Satz für die Kinder, worum es geht","emoji":"1 passendes Emoji","farbe":"#hex (kräftige Farbe, die auf dunklem Grund leuchtet)",
"intro":"gLiTCh begrüsst die Kinder und erzählt die Rahmengeschichte (2–3 Sätze)","schluss":"gLiTCh gratuliert am Ende (1–2 Sätze)",
"etappen":[{"titel":"…","ziel":"was die Kinder in dieser Etappe herausfinden (1 Satz)","emoji":"…"}],
"lexikon":[{"wort":"Fachwort","erklaerung":"kindgerechte Erklärung in 1–2 Sätzen"}]${needDip ? `,
"diplome":[{"id":"kurze-id","name":"…","emoji":"…","beschreibung":"wofür es das Diplom gibt","bedingung":"start | etappe:1 … etappe:${D.etappen} | alle | perfekt | lexikon"}]` : ""}}
Genau ${D.etappen} Etappen, die aufeinander aufbauen. 8–14 Fachwörter im Lexikon, die im Modul wirklich vorkommen.${needDip ? " 3–4 Diplome." : ""}`;
    const p = await ask(prompt, 0, signal);
    if (!p || !Array.isArray(p.etappen) || !p.etappen.length) throw { code: "invalid_json" };
    p.etappen = p.etappen.slice(0, +D.etappen).map(e => ({ titel: String(e.titel || "Etappe").slice(0, 60), ziel: String(e.ziel || ""), emoji: String(e.emoji || "⭐").slice(0, 8) }));
    p.lexikon = (Array.isArray(p.lexikon) ? p.lexikon : []).filter(w => w && w.wort && w.erklaerung).map(w => ({ wort: String(w.wort).slice(0, 40), erklaerung: String(w.erklaerung).slice(0, 300) }));
    p.farbe = isCol(p.farbe) ? p.farbe : "#A07CFF";
    if (needDip && Array.isArray(p.diplome)) { p.diplome.slice(0, 5).forEach(x => { const it = normReward("diplome", x); if (it) { it.id = uid(D.diplome, x.id || it.name); D.diplome.push(it); } }); linkUnlocks(); }
    delete p.diplome; return p;
  }
  async function writeEtappe(i, signal, wish) {
    const P = D.plan, E = P.etappen[i];
    const prompt = `${context()}

MODULPLAN
Titel: ${P.titel}
Etappen: ${P.etappen.map((e, k) => `${k + 1}. ${e.titel} – ${e.ziel}`).join(" | ")}
Lexikon-Wörter: ${P.lexikon.map(w => w.wort).join(", ")}

AUFGABE: Schreibe Etappe ${i + 1} «${E.titel}» (Ziel: ${E.ziel}).
- Aufbau wie in den gLiTCh-Lab-Modulen: lauter BAUSTEINE. Ein Baustein = eine kurze «info» (gLiTCh erklärt) direkt vor einer Aufgabe. Vor jeder ersten oder zweiten Aufgabe kommt eine neue «info», sodass die Kinder immer zuerst lesen und dann knobeln.
- Danach ${perEt()} Aufgaben. Erlaubte Aufgabenarten: ${typesAllowed().join(", ")}.
- Abwechslung ist das Wichtigste: in jeder Etappe mindestens ${Math.min(3, typesAllowed().length)} verschiedene Arten, darunter mindestens ein Spiel (${["memory", "sortieren", "zeitmaschine", "raetsel", "zuordnen", "schaetzen", "mehrfach"].filter(x => typesAllowed().includes(x)).join(", ") || "beliebig"}). Nimm Arten, die in den anderen Etappen noch selten vorkommen.${usedTypes(i)}
- «zeitmaschine» nur, wenn es sichere Jahreszahlen gibt. «schaetzen» nur mit gesicherten Zahlen. «gestalten» höchstens einmal pro Modul, gut als Abschluss.
- Aufgaben prüfen, was in den Infos steht. Erklärungen sagen kurz, warum die Antwort stimmt. Jede Aufgabe hat «titel» und «tipp» (gLiTCh gibt den Tipp auf Knopfdruck).
- Schwierige Wörter kommen ins Lexikon und werden in den Texten benutzt: Die Kinder tippen sie an und gLiTCh erklärt sie.
- Bleib in der Rahmengeschichte. Benutze Lexikon-Wörter.${wish ? `\n- Wunsch der Lehrperson für diese Etappe: ${wish}` : ""}

${TASK_DOC}

Gib NUR ein JSON-Objekt zurück: {"intro":"gLiTCh leitet die Etappe ein (1–2 Sätze)","lob":"gLiTCh lobt am Ende der Etappe (1 Satz)","aufgaben":[ … ]}`;
    const r = await ask(prompt, i + 1, signal);
    const auf = (Array.isArray(r && r.aufgaben) ? r.aufgaben : []).map(validTask).filter(Boolean).filter(a => a.typ === "info" || typesAllowed().includes(a.typ));
    if (!auf.some(a => a.typ !== "info")) throw { code: "invalid_json" };
    return { titel: E.titel, ziel: E.ziel, emoji: E.emoji, intro: String(r.intro || ""), lob: String(r.lob || ""), aufgaben: auf };
  }
  function say(t, mood) { $("#sayT").textContent = t; gl("sayG", mood || "wink"); }
  async function generate() {
    if (!SAMPLE) return;
    if (!D.titel.trim()) { go(1); $("#titel").focus(); toast("Gib zuerst ein Thema ein."); return; }
    $("#genErr").textContent = ""; ctl = new AbortController(); const signal = ctl.signal;
    $("#btnGen").disabled = true; $("#btnStop").hidden = false;
    rows = [{ t: "Plan: Etappen, Lexikon" + (D.diplome.length ? "" : ", Diplome"), st: "run" }, ...Array.from({ length: +D.etappen }, (_, i) => ({ t: `Etappe ${i + 1}` }))]; progRows(rows);
    say("Ich plane die Etappen und suche die Fachwörter …", "hmm");
    try {
      D.plan = await planModule(signal); D.inhalt = []; save();
      setRow(0, { st: "ok", t: `Plan: «${D.plan.titel}»`, info: `${D.plan.etappen.length} Etappen · ${D.plan.lexikon.length} Wörter` });
      D.plan.etappen.forEach((e, i) => setRow(i + 1, { t: `Etappe ${i + 1}: ${e.titel}` }));
      for (let i = 0; i < D.plan.etappen.length; i++) {
        setRow(i + 1, { st: "run" }); say(`Ich schreibe Etappe ${i + 1}: «${D.plan.etappen[i].titel}» …`, "hmm");
        let et = null;
        try { et = await writeEtappe(i, signal); } catch (e) { if (e && e.code === "cancelled") throw e; et = await writeEtappe(i, signal); }   // ein zweiter Versuch, falls die Antwort unbrauchbar war
        D.inhalt[i] = et; save();
        setRow(i + 1, { st: "ok", info: `${et.aufgaben.filter(a => a.typ !== "info").length} Aufgaben` });
        renderResult();
      }
      say(`Fertig! «${D.plan.titel}» hat ${totalTasks()} Aufgaben. Probiere es rechts aus und lade es dann herunter.`, "cool");
    } catch (e) {
      rows = rows.map(r => r.st === "run" ? Object.assign(r, { st: "err" }) : r); progRows(rows);
      $("#genErr").textContent = errMsg(e); say(e && e.code === "cancelled" ? "Okay, ich höre auf. Was schon fertig ist, bleibt." : "Hoppla, da hat etwas nicht geklappt.", "sad");
    }
    $("#btnGen").disabled = false; $("#btnStop").hidden = true; ctl = null; renderResult(); paintSteps();
  }
  const usedTypes = i => { const used = D.inhalt.filter((e, k) => e && k !== i).flatMap(e => e.aufgaben.map(a => a.typ)).filter(x => x !== "info"); if (!used.length) return ""; const c = {}; used.forEach(x => c[x] = (c[x] || 0) + 1); return ` Schon benutzt in anderen Etappen: ${Object.entries(c).map(([x, n]) => x + " ×" + n).join(", ")}.`; };
  const totalTasks = () => D.inhalt.reduce((n, e) => n + (e ? e.aufgaben.filter(a => a.typ !== "info").length : 0), 0);
  $("#btnGen").onclick = generate;
  $("#btnStop").onclick = () => { if (ctl) ctl.abort(); };

  /* ---------- Ergebnis, Vorschau, Datei ---------- */
  const KIND = { info: "Info", mc: "Quiz", tf: "R/F", text: "Eintippen", luecke: "Lücken", ordnen: "Ordnen", zuordnen: "Verbinden", schreiben: "Schreiben", mehrfach: "Mehrfach", memory: "Memory", sortieren: "Sortieren", zeitmaschine: "Zeitmaschine", raetsel: "Rätsel", schaetzen: "Schätzen", gestalten: "Gestalten" };
  function renderResult() {
    const ready = D.plan && D.inhalt.length && D.inhalt.every(Boolean);
    $("#result").hidden = !D.inhalt.length;
    $("#btnGen").textContent = D.inhalt.length ? "⚙️ Ganz neu erstellen" : "⚙️ Modul erstellen";
    if (D.plan) $("#ets").innerHTML = D.plan.etappen.map((e, i) => { const c = D.inhalt[i];
      return `<div class="et"><div class="et-h"><span class="emo" aria-hidden="true">${esc(e.emoji)}</span><b>${i + 1}. ${esc(e.titel)}</b>${c ? `<span class="tag">★ ${etSterne(c)}</span>` : `<span class="tag">fehlt</span>`}</div>
        ${c ? `<div class="tags">${c.aufgaben.map(a => `<span class="tag">${KIND[a.typ]}</span>`).join("")}</div>` : ""}
        <div class="row"><input class="in" id="wish${i}" placeholder="Änderungswunsch, z. B. «einfachere Fragen» oder «mehr zum Experiment»" style="flex:1;min-width:180px;padding:7px 10px"><button type="button" class="btn small" data-redo="${i}" ${SAMPLE ? "" : "disabled"}>↻ Neu schreiben</button></div></div>`; }).join("");
    $$("[data-redo]").forEach(b => b.onclick = async () => {
      const i = +b.dataset.redo; if (!SAMPLE || ctl) return;
      ctl = new AbortController(); b.disabled = true; b.textContent = "schreibt …"; $("#btnGen").disabled = true;
      rows = []; rows[i + 1] = { t: `Etappe ${i + 1} neu schreiben`, st: "run" }; progRows(rows); say(`Ich schreibe Etappe ${i + 1} neu …`, "hmm");
      try { D.inhalt[i] = await writeEtappe(i, ctl.signal, $("#wish" + i).value.trim()); save(); rows = [{ t: `Etappe ${i + 1} neu geschrieben`, st: "ok" }]; progRows(rows); say("Erledigt! Schau es dir rechts an.", "happy"); }
      catch (e) { rows = [{ t: `Etappe ${i + 1}`, st: "err" }]; progRows(rows); $("#genErr").textContent = errMsg(e); }
      ctl = null; $("#btnGen").disabled = false; renderResult();
    });
    if (ready) { const html = buildModule(); const pv = $("#pv"); if (pv.dataset.sig !== String(html.length) + D.plan.titel + JSON.stringify(D.opt)) { pv.srcdoc = html; pv.dataset.sig = String(html.length) + D.plan.titel + JSON.stringify(D.opt); } pv.hidden = false; $("#pvEmpty").hidden = true; $("#pvName").textContent = slug(D.plan.titel) + ".html"; }
    else { $("#pv").hidden = true; $("#pvEmpty").hidden = false; }
    $("#btnDl").disabled = !ready;
  }
  function manifest() {
    const P = D.plan;
    const un = x => x.freischalten || "fertig";
    return {
      titel: P.titel, fach: D.fach, thema: hubThemaName(), beschreibung: P.beschreibung || "", minuten: +D.minuten, farbe: P.farbe, emoji: P.emoji,
      aufgaben: D.inhalt.map((e, i) => ({ id: "etappe-" + (i + 1), titel: e.titel, sterne: etSterne(e) })),
      diplome: D.diplome.map(d => ({ id: d.id, name: d.name, emoji: d.emoji, beschreibung: d.beschreibung })),
      extras: {
        outfits: D.outfits.map(x => ({ id: x.id, name: x.name, platz: x.platz, emoji: x.emoji, spruch: x.spruch || "", freischalten: un(x) })),
        emotes: D.emotes.map(x => ({ id: x.id, name: x.name, emoji: x.emoji, text: x.text || x.name, animation: x.animation, farben: x.farben || [], beschreibung: `Aus dem Modul «${P.titel}».`, freischalten: un(x) })),
        zimmer: D.zimmer.map(x => ({ id: x.id, name: x.name, platz: x.platz, emoji: x.emoji, freischalten: un(x) })),
        hintergruende: D.hintergruende.map(x => ({ id: x.id, name: x.name, emoji: x.emoji, wand: x.wand || [], boden: x.boden || [], freischalten: un(x) }))
      },
      erstellt: "gLiTCh-Editor", maskottchen: "glitch"
    };
  }
  function buildModule() {
    const P = D.plan, j = o => JSON.stringify(o).replace(/</g, "\\u003c");
    const mod = { titel: P.titel, beschreibung: P.beschreibung, emoji: P.emoji, farbe: P.farbe, intro: P.intro, schluss: P.schluss, fachname: fachName(), fachkurz: ({ mi: "M&I", nmg: "NMG", de: "DE", ma: "MA", en: "EN", fr: "FR", sp: "SPORT", mg: "GAMES" })[D.fach] || "",
      etappen: D.inhalt, lexikon: P.lexikon, opt: Object.assign({}, D.opt), diplome: D.diplome.map(d => ({ id: d.id, name: d.name, emoji: d.emoji, beschreibung: d.beschreibung, bedingung: d.bedingung })), links: linkList() };
    const T = id => document.getElementById(id).textContent;
    const SC = "<" + "/script>";
    return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(P.titel)}</title>
<!-- Erstellt mit dem gLiTCh-Editor. In den Glitchlab-Hub hochladen: Lehrpersonen → «Module hochladen». -->
<script type="application/json" id="glitchlab-modul">${j(manifest())}${SC}
<style>${T("rt-gcss")}
${T("rt-css")}</style>
</head>
<body>
<div id="app"></div>
<script>window.MODUL = ${j(mod)};${SC}
<script>${T("rt-gjs")}${SC}
<script>${T("rt-js")}${SC}
</body>
</html>`;
  }
  $("#btnDl").onclick = async () => {
    const html = buildModule(), name = (slug(D.plan.titel) || "modul") + ".html";
    let dl = null; try { dl = await claude.use("downloads"); } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename: name, data: new Blob([html], { type: "text/html" }) }); toast(`«${name}» gespeichert. Jetzt im Hub hochladen.`); return; } catch (e) { if (e && e.code === "declined") return; } }
    $("#btnCopy").hidden = false; $("#dlHint").textContent = "Herunterladen geht hier nicht. Tippe auf «Code kopieren», füge ihn in eine leere Textdatei ein und speichere sie als «" + name + "».";
  };
  $("#btnCopy").onclick = async () => { try { await navigator.clipboard.writeText(buildModule()); toast("Code kopiert."); } catch (e) { toast("Kopieren ging nicht. Versuch es in einem anderen Browser."); } };

  /* ---------- Start ---------- */
  bindBasics(); renderFiles(); go(D.step || 1);
})();
