(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const slug = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const isCol = c => /^#[0-9a-f]{6}$/i.test(String(c || ""));
  const G = window.GLGlitch;
  const gl = (id, mood) => { const el = document.getElementById(id); if (el && G) el.innerHTML = G.svg(mood, "#8B5CFF"); };
  gl("mastG", "happy"); gl("sayG", "wink"); gl("pvG", "sleep");

  /* ---------- Glitchlab-Struktur (gleich wie im Glitchlab) ---------- */
  const SUBJ = [["mi", "Medien & Informatik"], ["nmg", "Natur, Mensch, Gesellschaft"], ["de", "Deutsch"], ["ma", "Mathematik"], ["en", "Englisch"], ["fr", "Französisch"], ["sp", "Sport"], ["mg", "Minigames"]];
  const THEMES = { mi: ["Start mit gLiTCh", "KI & Prompts", "Medien durchschauen"], nmg: ["Entdeckungsreise Schweiz", "Die Römer"], de: ["Gespräche führen"] };
  /* Aufgabenarten = alle Spiele aus den NMG- und M&I-Modulen, die sich mit Inhalten füllen lassen */
  /* Aufgabenarten in Gruppen, je mit kleinem Bild */
  const TG = [
    ["Wissen prüfen", [["mc", "Quiz", "Eine Antwort ist richtig"], ["tf", "Richtig/Falsch", "Stimmt die Aussage?"], ["mehrfach", "Mehrere richtig", "Alle passenden ankreuzen"], ["text", "Antwort eintippen", "Kurze Antwort schreiben"], ["blitz", "Blitzrunde", "Aussagen gegen die Zeit"]]],
    ["Wörter & Sprache", [["luecke", "Lückentext", "Fehlende Wörter einsetzen"], ["wortsalat", "Buchstabensalat", "Buchstaben ordnen"], ["wortraten", "Wort-Raten", "Buchstabe um Buchstabe"], ["wortsuche", "Wörtersuche", "Wörter im Raster finden"], ["markieren", "Wörter markieren", "Im Text antippen"]]],
    ["Ordnen & Verbinden", [["ordnen", "Reihenfolge", "Schritte oder Zeitstrahl"], ["zuordnen", "Verbinden", "Paare zusammenführen"], ["sortieren", "Sortier-Spiel", "Karten in Gruppen"], ["zeitmaschine", "Zeitmaschine", "Das richtige Jahr einstellen"]]],
    ["Spiele & Rätsel", [["memory", "Memory", "Paare aufdecken"], ["raetsel", "Hinweis-Rätsel", "Mit Hinweisen erraten"], ["schaetzen", "Schätzen", "Mit dem Regler schätzen"], ["karteikarten", "Lernkarten", "Umdrehen und üben"]]],
    ["Reden & Gestalten", [["chat", "Chat-Gespräch", "Mit einer Figur chatten"], ["meinung", "Meinung bilden", "Position und Begründung"], ["schreiben", "Schreibauftrag", "Eigenen Text schreiben"], ["gestalten", "Gestalten", "Plakat oder Steckbrief"]]]
  ];
  const TYPES = TG.flatMap(g => g[1].map(([v, n]) => [v, n]));
  const IR = (x, y, w, h, f, r = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}"/>`, IT = (x, y, t, f = "#14062E", z = 9) => `<text x="${x}" y="${y}" font-size="${z}" font-weight="800" text-anchor="middle" font-family="system-ui,sans-serif" fill="${f}">${t}</text>`;
  const ICON = {
    mc: IR(6, 5, 36, 7, "#fff") + IR(6, 15, 36, 7, "#3CFF7A") + IR(6, 25, 36, 7, "#fff") + '<path d="M10 18.5l2 2 4-4" stroke="#14062E" stroke-width="1.6" fill="none"/>',
    tf: IT(15, 25, "👍", "#000", 16) + IT(35, 25, "👎", "#000", 16),
    mehrfach: [5, 15, 25].map((y, i) => IR(6, y, 7, 7, i === 1 ? "#fff" : "#3CFF7A", 1.5) + IR(16, y + 1, 26, 5, "#fff")).join("") + '<path d="M7.5 8.5l1.6 1.6 2.6-3M7.5 28.5l1.6 1.6 2.6-3" stroke="#14062E" stroke-width="1.4" fill="none"/>',
    text: IR(4, 12, 40, 13, "#fff") + IT(17, 22, "Bern", "#14062E", 9) + '<rect x="30" y="15" width="1.6" height="8" fill="#A07CFF"/>',
    blitz: '<circle cx="22" cy="19" r="13" fill="#fff"/><path d="M22 19V9" stroke="#14062E" stroke-width="2"/><path d="M22 19l6 4" stroke="#FF2BD6" stroke-width="2"/><path d="M40 3l-5 9h4l-3 8 8-11h-4l3-6z" fill="#FFC21A"/>',
    luecke: IR(4, 9, 12, 6, "#fff") + IR(18, 9, 12, 6, "#FFC21A") + IR(32, 9, 12, 6, "#fff") + IR(4, 21, 18, 6, "#fff") + IR(24, 21, 20, 6, "#2EE6D6"),
    wortsalat: ["L", "A", "V", "A"].map((c, i) => IR(4 + i * 11, 6 + (i % 2) * 10, 9, 11, "#fff") + IT(8.5 + i * 11, 14.5 + (i % 2) * 10, c, "#14062E", 8)).join(""),
    wortraten: ["K", "", "A", ""].map((c, i) => `<path d="M${5 + i * 10} 22h7" stroke="#fff" stroke-width="2"/>` + (c ? IT(8.5 + i * 10, 19, c, "#fff", 9) : "")).join("") + [0, 1, 2, 3, 4].map(i => IR(10 + i * 6, 27, 4, 5, i < 3 ? "#3CFF7A" : "#5A4A80", 1)).join(""),
    wortsuche: Array.from({ length: 16 }, (_, k) => IT(9 + (k % 4) * 10, 9 + Math.floor(k / 4) * 8, "MAGLXVOSAKPITEUN"[k], "#fff", 7)).join("") + '<rect x="3" y="2" width="42" height="9" rx="4.5" fill="none" stroke="#FFC21A" stroke-width="1.6"/>',
    markieren: IR(4, 8, 10, 6, "#fff") + IR(16, 8, 14, 6, "#FFE680") + IR(32, 8, 12, 6, "#fff") + IR(4, 20, 16, 6, "#fff") + IR(22, 20, 10, 6, "#FFE680") + IR(34, 20, 10, 6, "#fff"),
    ordnen: [0, 1, 2].map(i => IR(14, 4 + i * 10, 28, 7, "#fff") + IT(8, 10 + i * 10, i + 1, "#FFC21A", 8)).join(""),
    zuordnen: IR(4, 6, 12, 7, "#fff") + IR(4, 22, 12, 7, "#fff") + IR(32, 6, 12, 7, "#2EE6D6") + IR(32, 22, 12, 7, "#FF2BD6") + '<path d="M16 9.5L32 25.5M16 25.5L32 9.5" stroke="#fff" stroke-width="1.5"/>',
    sortieren: IR(10, 2, 14, 9, "#fff") + '<path d="M17 12v5" stroke="#fff" stroke-width="1.5"/>' + IR(4, 20, 18, 14, "#A07CFF") + IR(26, 20, 18, 14, "#2EE6D6"),
    zeitmaschine: '<path d="M4 24h40" stroke="#fff" stroke-width="2"/>' + [8, 18, 28, 38].map(x => `<path d="M${x} 21v6" stroke="#fff" stroke-width="1.5"/>`).join("") + '<circle cx="24" cy="24" r="4" fill="#FFC21A"/>' + IT(24, 13, "1291", "#fff", 9),
    memory: [0, 1, 2, 3].map(i => IR(5 + (i % 2) * 20, 3 + Math.floor(i / 2) * 16, 17, 13, i === 1 || i === 2 ? "#fff" : "#A07CFF")).join("") + IT(33.5, 13, "🌋", "#000", 8) + IT(13.5, 29, "🌋", "#000", 8),
    raetsel: IT(15, 28, "?", "#FFC21A", 26) + '<circle cx="32" cy="15" r="7" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M37 20l5 5" stroke="#fff" stroke-width="3"/>',
    schaetzen: '<path d="M6 25h36" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="25" r="5" fill="#FFC21A"/>' + IT(30, 14, "≈3000", "#fff", 8),
    karteikarten: IR(14, 3, 28, 20, "#2EE6D6", 3) + IR(6, 11, 28, 20, "#fff", 3) + IT(20, 25, "?", "#14062E", 11),
    chat: IR(4, 4, 26, 11, "#fff", 5) + IR(18, 20, 26, 11, "#A07CFF", 5) + IR(8, 8.5, 16, 2, "#B9B2D0", 1) + IR(22, 24.5, 16, 2, "#fff", 1),
    meinung: '<path d="M6 22h36" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="22" r="5" fill="#FF2BD6"/>' + IT(7, 12, "👍", "#000", 9) + IT(41, 12, "👎", "#000", 9),
    schreiben: IR(8, 3, 26, 30, "#fff", 2) + [9, 15, 21].map(y => `<path d="M12 ${y}h18" stroke="#B9B2D0" stroke-width="1.5"/>`).join("") + '<path d="M43 6L29 26l-2 5 4-3L45 8z" fill="#FFC21A"/>',
    gestalten: IR(8, 3, 32, 30, "#FF6A00", 3) + IR(12, 7, 24, 6, "#fff", 1) + IR(12, 16, 24, 2, "#fff", 1) + IR(12, 20, 18, 2, "#fff", 1) + IT(32, 30, "⭐", "#000", 8)
  };
  const typeSvg = v => `<svg viewBox="0 0 48 36" aria-hidden="true">${ICON[v] || ""}</svg>`;
  const WERT = { mc: 1, tf: 1, text: 1, luecke: 2, ordnen: 2, zuordnen: 2, schreiben: 2, mehrfach: 2, schaetzen: 2, gestalten: 2, sortieren: 3, zeitmaschine: 3, raetsel: 3, memory: 3, wortsalat: 2, wortraten: 2, blitz: 2, markieren: 2, wortsuche: 3, karteikarten: 2, chat: 2, meinung: 2 };
  const wert = a => WERT[a.typ] || 1;
  const etSterne = e => e.aufgaben.reduce((n, a) => n + (a.typ === "info" ? 0 : wert(a)), 0);
  /* Sterne-Budget: Standard 60 Sterne pro Lektion (45 Minuten), anpassbar */
  const STARS_PER_LESSON = 60;
  const budgetAuto = () => Math.max(5, Math.round((+D.minuten || 45) / 45 * STARS_PER_LESSON));
  const budget = () => +D.sterne > 0 ? Math.round(+D.sterne) : budgetAuto();
  const rawTotal = () => D.inhalt.reduce((n, e) => n + (e ? etSterne(e) : 0), 0);
  const etBudget = e => { const r = rawTotal(); return r ? Math.round(etSterne(e) * budget() / r) : 0; };
  const OUT_SLOTS = [["kopf", "Kopf"], ["augen", "Augen"], ["mund", "Mund"], ["hals", "Hals & Rücken"], ["fuesse", "Füsse & Beine"], ["hand", "In der Hand"], ["haustier", "Haustier"]];
  const ROOM_SLOTS = [["links", "Links"], ["rechts", "Rechts"], ["wand", "Wand"], ["teppich", "Teppich"], ["deko", "Deko"], ["decke", "Decke"]];
  const ANIMS = [["huepfen", "Hüpfen"], ["drehen", "Drehen"], ["wackeln", "Wackeln"], ["gross", "Gross werden"], ["jubeln", "Jubeln"], ["regen", "Emoji-Regen"]];
  const KLASSEN = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => [String(k), `${k}. Klasse (Zyklus ${k <= 2 ? 1 : k <= 6 ? 2 : 3})`]);

  /* ---------- Entwurf (bleibt in diesem Browser) ---------- */
  const KEY = "gle.draft.v1";
  const fresh = () => ({ typenV2: true, typenV3: true, titel: "", fach: "nmg", hubThema: "", hubNeu: "", klasse: "6", minuten: "45", etappen: "4", rahmen: "auto", ideen: "", typen: TYPES.map(t => t[0]), material: [], links: "", belIdeen: "",
    diplome: [], outfits: [], emotes: [], zimmer: [], hintergruende: [], skins: [], plan: null, inhalt: [], step: 1, opt: freshOpt(), art: "modul", sterne: "", addonName: "", addonText: "" });
  const freshOpt = () => ({ tipps: true, vorlesen: true, lexikon: true, pdf: true, gates: [], code: "", mascot: { typ: "glitch" } });
  let D = fresh();
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s === "object") D = Object.assign(fresh(), s); } catch (e) { /* kein Speicher */ }
  D.opt = Object.assign(freshOpt(), D.opt || {});
  if (!Array.isArray(D.skins)) D.skins = [];
  if (!D.opt.mascot || !D.opt.mascot.typ) D.opt.mascot = { typ: "glitch" };
  if (!Array.isArray(D.opt.gates)) D.opt.gates = D.opt.freigabe === "selbst" ? ["selbst"] : D.opt.freigabe === "lp" ? ["lp"] : [];
  if (!D.typenV3) { D.typen = [...new Set([...D.typen, "wortsalat", "wortraten", "blitz", "markieren", "wortsuche", "karteikarten", "chat", "meinung"])]; D.typenV3 = true; }
  if (!D.typenV2) { D.typen = [...new Set([...D.typen, "mehrfach", "memory", "sortieren", "zeitmaschine", "raetsel", "schaetzen", "gestalten"])]; D.typenV2 = true; }
  let saveT = null;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { try { localStorage.setItem(KEY, JSON.stringify(Object.assign({}, D, { material: D.material.map(m => Object.assign({}, m, { text: m.text.slice(0, 20000) })) }))); } catch (e2) { /* zu gross */ } } }, 400); };
  function toast(t, ms = 3200) { const x = document.createElement("div"); x.className = "toast"; x.setAttribute("role", "status"); x.textContent = t; document.body.appendChild(x); setTimeout(() => x.remove(), ms); }

  /* ---------- Schritte ---------- */
  function go(n) {
    if (D.art === "addon" && n === 2) n = 3;
    D.step = n; save();
    $$("[data-pane]").forEach(p => p.hidden = +p.dataset.pane !== n);
    $$(".step").forEach(s => { s.setAttribute("aria-current", +s.dataset.step === n ? "step" : "false"); });
    if (n === 3) renderCats();
    if (n === 4) { if (D.art === "addon") renderAddon(); else renderResult(); }
    paintSteps(); window.scrollTo({ top: 0 });
  }
  const nx0 = () => D.outfits.length + D.emotes.length + D.zimmer.length + D.hintergruende.length + (D.skins || []).length;
  function paintSteps() {
    const AD = D.art === "addon";
    $(".step[data-step='1']").classList.toggle("ok", AD ? !!(D.addonName || "").trim() : !!D.titel.trim());
    $(".step[data-step='2']").classList.toggle("ok", D.material.length > 0 || !!D.links.trim());
    $(".step[data-step='3']").classList.toggle("ok", D.diplome.length + nx0() > 0);
    $(".step[data-step='4']").classList.toggle("ok", AD ? nx0() > 0 : D.inhalt.length > 0);
    $("#s2sub").textContent = D.material.length ? `${D.material.length} Datei${D.material.length === 1 ? "" : "en"}` : "PDF, Word, Links";
    const nx = D.outfits.length + D.emotes.length + D.zimmer.length + D.hintergruende.length + (D.skins || []).length;
    $("#s3sub").textContent = D.diplome.length + nx ? `${D.diplome.length} Diplome · ${nx} Extras` : "Diplome & Extras";
    $("#s4sub").textContent = AD ? "Paket als Datei" : D.inhalt.length ? "Modul fertig" : "Vorschau & Datei";
    $("#s1sub").textContent = AD ? "Name des Pakets" : "Thema & Stufe"; $("#s3sub").textContent = AD ? `${nx} Belohnungen` : $("#s3sub").textContent;
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
    const sHint = () => { const auto = !(+D.sterne > 0); $("#sterneAuto").checked = auto; $("#sterneIn").disabled = auto; $("#sterneIn").value = budget();
      $("#sterneHint").textContent = auto ? `automatisch: ${STARS_PER_LESSON} Sterne pro Lektion (45 Min.)` : `eigene Zahl · automatisch wären es ${budgetAuto()}`; };
    $("#sterneAuto").onchange = () => { D.sterne = $("#sterneAuto").checked ? "" : String(budget()); save(); sHint(); };
    $("#sterneIn").oninput = () => { if (+$("#sterneIn").value >= 5) { D.sterne = String(Math.min(2000, Math.round(+$("#sterneIn").value))); save(); $("#sterneHint").textContent = `eigene Zahl · automatisch wären es ${budgetAuto()}`; } };
    window.__sHint = sHint;
    const paintArt = () => { document.body.classList.toggle("addon", D.art === "addon"); $$("[data-art]").forEach(b => { b.classList.toggle("on", b.dataset.art === D.art); b.setAttribute("aria-checked", String(b.dataset.art === D.art)); }); };
    $$("[data-art]").forEach(b => b.onclick = () => { D.art = b.dataset.art; save(); paintArt(); paintSteps(); });
    paintArt();
    ["addonName", "addonText"].forEach(id => { const el = $("#" + id); el.value = D[id] || ""; el.oninput = () => { D[id] = el.value; save(); paintSteps(); }; });
    const durHint = () => { const m = +D.minuten || 45, l = m / 45; if (window.__sHint) window.__sHint(); $("#durHint").textContent = `ca. ${m} Minuten · ${Number.isInteger(l) ? l + (l === 1 ? " Lektion" : " Lektionen") : "etwa " + (Math.round(l * 10) / 10).toLocaleString("de-CH") + " Lektionen"}`; $$("[data-min]").forEach(b => b.classList.toggle("on", +b.dataset.min === m)); };
    const setMin = v => { D.minuten = String(Math.max(10, Math.min(600, Math.round(+v || 45)))); $("#minuten").value = D.minuten; save(); durHint(); };
    $("#minuten").value = D.minuten || "45"; $("#minuten").oninput = () => { if (+$("#minuten").value >= 10) { D.minuten = String(Math.min(600, Math.round(+$("#minuten").value))); save(); durHint(); } }; $("#minuten").onchange = () => setMin($("#minuten").value);
    $$("[data-min]").forEach(b => b.onclick = () => setMin(b.dataset.min)); durHint();
    ["etappen", "rahmen", "klasse"].forEach(id => { const el = $("#" + id); el.value = D[id]; el.onchange = () => { D[id] = el.value; save(); }; });
    $("#fach").onchange = e => { D.fach = e.target.value; D.hubThema = ""; paintThemes(); save(); };
    $("#hubThema").onchange = e => { D.hubThema = e.target.value; $("#neuWrap").hidden = D.hubThema !== "__neu"; save(); };
    paintThemes();
    paintTypes();
    paintOpts(); paintMascot();
  }

  /* ---------- Aufgabenarten: Gruppen mit Bild ---------- */
  function paintTypes() {
    const on = new Set(D.typen);
    $("#typen").innerHTML = `<div class="ty-top"><span>${on.size} von ${TYPES.length} gewählt</span><button type="button" class="btn small ghost" data-tyall="1">Alle</button><button type="button" class="btn small ghost" data-tyall="mix">Gemischt (Empfehlung)</button></div>`
      + TG.map(([g, list], gi) => { const n = list.filter(x => on.has(x[0])).length;
        return `<div class="ty-g"><div class="ty-gh"><b>${esc(g)}</b><small>${n} / ${list.length}</small><button type="button" class="link" data-tyg="${gi}">${n === list.length ? "keine" : "alle"}</button></div>
          <div class="ty-list">${list.map(([v, nm, d]) => `<label class="ty${on.has(v) ? " on" : ""}"><input type="checkbox" value="${v}"${on.has(v) ? " checked" : ""}><span class="ty-pic">${typeSvg(v)}</span><span class="ty-t"><b>${esc(nm)}</b><small>${esc(d)}</small></span><i class="ty-ck" aria-hidden="true">${on.has(v) ? "✓" : ""}</i></label>`).join("")}</div></div>`; }).join("");
    const set = list => { if (!list.length) { toast("Mindestens eine Aufgabenart muss gewählt sein."); paintTypes(); return; } D.typen = list; save(); paintTypes(); };
    $$("#typen input").forEach(c => c.onchange = () => set(TYPES.map(t => t[0]).filter(v => v === c.value ? c.checked : on.has(v))));
    $$("[data-tyg]").forEach(b => b.onclick = () => { const L = TG[+b.dataset.tyg][1].map(x => x[0]), all = L.every(v => on.has(v)); set(TYPES.map(t => t[0]).filter(v => L.includes(v) ? !all : on.has(v))); });
    $$("[data-tyall]").forEach(b => b.onclick = () => set(b.dataset.tyall === "1" ? TYPES.map(t => t[0]) : ["mc", "tf", "mehrfach", "luecke", "wortsalat", "wortsuche", "ordnen", "zuordnen", "sortieren", "memory", "raetsel", "chat", "meinung", "gestalten"]));
  }

  /* ---------- Funktionen und Freigabe ---------- */
  const TOGGLES = [["tipps", "💡 Tipps von gLiTCh", "Tipp-Knopf bei jeder Aufgabe und Hilfe bei Fehlern"], ["vorlesen", "🔊 Vorlesen", "«gLiTCh erklärt» lässt sich vorlesen"],
    ["lexikon", "📖 Fachwörter-Lexikon", "Schwierige Wörter antippen, gLiTCh erklärt sie"], ["pdf", "📄 Zusammenfassung als PDF", "Die Kinder laden am Schluss alles Wichtige als PDF herunter"]];
  const FREI = [["keine", "Keine Freigabe", "Die Kinder gehen frei von Etappe zu Etappe."], ["selbst", "🪞 Selbsteinschätzung", "Die Kinder schätzen sich ein (4 Stufen und ein Satz)."],
    ["praes", "🎤 Präsentation", "Wie im M&I-Lab: Die Gruppe präsentiert die Etappe mit Stichworten, Fachwörtern und ihrem Produkt, auch im Vollbild."],
    ["lp", "🔐 Freigabe mit LP-Code", "Die Lehrperson gibt mit ihrem Code frei. Im Glitchlab gilt der Code jeder Lehrperson der Klasse."]];
  function paintOpts() {
    const O = D.opt;
    $("#toggles").innerHTML = TOGGLES.map(([k, n, d]) => `<label class="tg"><input type="checkbox" data-opt="${k}"${O[k] ? " checked" : ""}><i aria-hidden="true"></i><span><b>${esc(n)}</b><small>${esc(d)}</small></span></label>`).join("");
    $$("[data-opt]").forEach(c => c.onchange = () => { O[c.dataset.opt] = c.checked; save(); if (D.step === 4) renderResult(); });
    const G = O.gates;
    $("#freigabe").innerHTML = FREI.map(([v, n, d]) => { const on = v === "keine" ? !G.length : G.includes(v);
      return `<button type="button" role="${v === "keine" ? "radio" : "checkbox"}" aria-checked="${on}" class="${on ? "on" : ""}${v === "keine" ? "" : " multi"}" data-fr="${v}"><b>${v === "keine" ? "" : `<span class="ck" aria-hidden="true">${on ? "✓" : ""}</span>`}${esc(n)}</b><small>${esc(d)}</small></button>`; }).join("");
    $$("[data-fr]").forEach(b => b.onclick = () => { const v = b.dataset.fr;
      if (v === "keine") O.gates = []; else O.gates = G.includes(v) ? G.filter(x => x !== v) : ["selbst", "praes", "lp"].filter(x => x === v || G.includes(x));
      save(); paintOpts(); if (D.step === 4) renderResult(); });
    $("#codeWrap").hidden = !G.includes("lp");
    $("#frHint").textContent = (G.length > 1 ? `Nach jeder Etappe in dieser Reihenfolge: ${G.map(g => ({ selbst: "Selbsteinschätzung", praes: "Präsentation", lp: "LP-Code" })[g]).join(" → ")}. ` : G.length ? "" : "Wähle eine, zwei oder alle drei Freigaben. ") + (G.includes("lp") ? "Im Glitchlab gilt der Freigabe-Code jeder Lehrperson der Klasse (deiner und die der weiteren Lehrpersonen). Der Code hier gilt nur in der Vorschau und wenn das Modul ohne Glitchlab geöffnet wird (leer = 1234)." : "");
    const c = $("#optCode"); c.value = O.code || ""; c.oninput = () => { O.code = c.value.replace(/\D/g, "").slice(0, 8); save(); };
    c.onchange = () => { c.value = O.code; if (D.step === 4) renderResult(); };
  }

  /* ---------- Maskottchen ---------- */
  function paintMascot() {
    const ms = D.opt.mascot, own = ms.pix ? GLMascot.pixel(ms.pix, ms.pal) : "";
    const L = [["glitch", "gLiTCh", "Das Pixel-Maskottchen des Glitchlabs, mit Outfit und Skin des Kindes.", G ? `<span class="glitch">${G.svg("happy", "#8B5CFF")}</span>` : ""],
      ["fenni", "Fenni", "Der Wüstenfuchs aus dem Wüsten-Game.", GLMascot.fenni()],
      ["eigen", ms.typ === "eigen" && ms.name ? ms.name : "Eigenes", own ? "Dein eigenes Maskottchen. Beschreibung ändern und neu generieren geht jederzeit." : "Beschreibe es, gLiTCh zeichnet es als Pixel-Figur.", own || '<span style="font-size:28px">✨</span>']];
    $("#masOpts").innerHTML = L.map(([v, n, d, pic]) => `<button type="button" class="mas${ms.typ === v ? " on" : ""}" role="radio" aria-checked="${ms.typ === v}" data-mas="${v}"><span class="pic">${pic}</span><span><b>${esc(n)}</b><small>${esc(d)}</small></span></button>`).join("");
    $$("[data-mas]").forEach(b => b.onclick = () => { ms.typ = b.dataset.mas; if (ms.typ === "fenni") ms.name = "Fenni"; save(); paintMascot(); if (D.step === 4) renderResult(); });
    $("#masOwn").hidden = ms.typ !== "eigen";
    const d = $("#masDesc"), n = $("#masName"); d.value = ms.desc || ""; n.value = ms.typ === "eigen" ? ms.name || "" : "";
    d.oninput = () => { ms.desc = d.value; save(); }; n.oninput = () => { ms.name = n.value.trim().slice(0, 24); save(); };
    n.onchange = () => { paintMascot(); if (D.step === 4) renderResult(); };
    $("#masGen").disabled = !SAMPLE;
    if (!SAMPLE) $("#masMsg").textContent = "Generieren geht nur, wenn der Editor in claude.ai geöffnet ist.";
    $("#masGen").onclick = genMascot;
  }
  async function genMascot() {
    const ms = D.opt.mascot, b = $("#masGen"); if (!SAMPLE) return;
    if (!(ms.desc || "").trim()) { $("#masMsg").textContent = "Beschreibe zuerst, wie es aussehen soll."; $("#masDesc").focus(); return; }
    const t = b.textContent; b.disabled = true; b.textContent = "gLiTCh zeichnet …"; $("#masMsg").textContent = "Das dauert etwa 20 Sekunden.";
    const prompt = `Zeichne ein Pixel-Art-Maskottchen für ein Lernmodul einer Schweizer Primarschule (${stufe()}).
Beschreibung der Lehrperson: ${ms.desc.trim()}
${ms.name ? `Name: ${ms.name}` : "Erfinde einen kurzen, freundlichen Namen (1 Wort)."}

Stil wie gLiTCh (ein Pixel-Monster) und Fenni (ein Pixel-Wüstenfuchs): niedlich, freundlich, grosse Augen mit weissem Glanzpunkt, kräftige Farben, dunkle Umrisslinie, frontal, Figur füllt das Raster gut aus und steht mittig.
Raster: genau 20 Zeilen mit je genau 20 Zeichen. «.» = leer (durchsichtig). Jeder andere Buchstabe (a–h) ist eine Farbe aus der Palette. Höchstens 8 Farben, eine davon ist die Umrisslinie.
Gib NUR JSON zurück: {"name":"…","palette":{"a":"#rrggbb", …},"pixel":["....................", … 20 Zeilen]}`;
    try {
      const r = await SAMPLE.json(prompt, { modelTier: "complex", cache: false });
      const c = GLMascot.clean(r && r.pixel, r && r.palette);
      if (!Object.keys(c.pal).length || c.pix.join("").replace(/\./g, "").length < 40) throw new Error("leer");
      ms.typ = "eigen"; ms.pix = c.pix; ms.pal = c.pal; if (!ms.name && r.name) ms.name = String(r.name).trim().slice(0, 24);
      save(); paintMascot(); if (D.step === 4) renderResult(); $("#masMsg").textContent = "Fertig! Gefällt es dir nicht? Beschreibung anpassen und nochmals generieren.";
    } catch (e) { $("#masMsg").textContent = "Das hat nicht geklappt. " + (typeof errMsg === "function" ? errMsg(e) : "Versuch es nochmals."); }
    b.disabled = false; b.textContent = t;
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
  $("#pasteAdd").onclick = () => {
    const t = $("#pasteTxt").value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(); if (!t) { $("#pasteTxt").focus(); return; }
    const nr = D.material.filter(m => m.kind === "Text eingefügt").length + 1, name = $("#pasteName").value.trim() || `Eingefügter Text ${nr}`;
    D.material.push({ id: Math.random().toString(36).slice(2, 9), name, kind: "Text eingefügt", pages: 0, text: t.slice(0, MAXC), cut: t.length > MAXC });
    $("#pasteTxt").value = ""; $("#pasteName").value = ""; renderFiles(); save(); paintSteps(); toast(`«${name}» als Material hinzugefügt.`);
  };
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => addFiles([...e.dataTransfer.files]));
  drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#fileIn").click(); } });
  $("#fileIn").onchange = e => { addFiles([...e.target.files]); e.target.value = ""; };

  /* ---------- 3 Belohnungen ---------- */
  const CATS = [
    { k: "diplome", n: "Diplome", ic: "🏅", d: "Auszeichnungen im Modul. Im Glitchlab hängen sie als Gegenstand an gLiTChs Wand (10 Plätze), im gleichen Stil wie die NMG- und M&I-Diplome. Wähle pro Diplom, was an der Wand hängt. Sie können auch Extras freischalten." },
    { k: "outfits", n: "Outfits für gLiTCh", ic: "👕", d: "Kleider und Accessoires für die Garderobe." },
    { k: "emotes", n: "Emotes", ic: "✨", d: "Kleine Animationen, die gLiTCh vorführt." },
    { k: "zimmer", n: "Zimmer-Gegenstände", ic: "🛋️", d: "Möbel und Deko für gLiTChs Zimmer." },
    { k: "hintergruende", n: "Hintergründe", ic: "🖼️", d: "Neue Farben und Stimmung für das ganze Zimmer." },
    { k: "skins", n: "Spezial-Skins", ic: "🎨", d: "Eigene Farben für gLiTCh. Standard: frei, wenn das Modul abgeschlossen ist (90 % der Sterne)." }
  ];
  const catsNow = () => D.art === "addon" ? CATS.filter(c => c.k !== "diplome") : CATS;
  const LEVEL_OPTS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 105, 110, 120, 130, 140, 150, 175, 200, 250, 300].map(n => [`level:${n}`, `Ab Level ${n}`]);
  const DIP_COND = () => [["start", "Erster Stern"], ...Array.from({ length: +D.etappen || 4 }, (_, i) => [`etappe:${i + 1}`, `Etappe ${i + 1} geschafft`]), ["alle", "Alle Etappen"], ["perfekt", "Alles beim 1. Versuch"], ["lexikon", "Lexikon geöffnet"]];
  const UNLOCK = () => D.art === "addon" ? [["sofort", "Sofort"], ...LEVEL_OPTS] : [["sofort", "Sofort"], ["start", "Ab 1. Stern"], ["prozent:25", "Ab 25 % der Sterne"], ["prozent:50", "Ab der Hälfte der Sterne"], ["prozent:90", "Modul abgeschlossen (90 %)"], ["fertig", "Alle Sterne"], ...D.diplome.map(d => [`badge:${d.id}`, `Diplom «${d.name}»`]), ...LEVEL_OPTS];
  const sel = (list, cur, attr) => `<select class="in" ${attr}>${opts(list, cur)}</select>`;
  function uid(list, base) { let id = slug(base) || "x", n = 2; while (list.some(x => x.id === id)) id = slug(base) + "-" + n++; return id; }
  function rowHTML(c, x, i) {
    const del = `<button type="button" class="btn small danger" data-del="${c.k}:${i}" aria-label="Entfernen">✕</button>`;
    const emo = `<input class="in emo" data-f="${c.k}:${i}:emoji" value="${esc(x.emoji)}" maxlength="8" aria-label="Emoji">`;
    const name = `<input class="in" data-f="${c.k}:${i}:name" value="${esc(x.name)}" maxlength="40" aria-label="Name">`;
    const unl = sel(UNLOCK(), x.freischalten, `data-f="${c.k}:${i}:freischalten" aria-label="Freischalten"`);
    if (c.k === "diplome") { if (!x.wand) x.wand = GLWall.pick(x.id || x.name);
      return `<div class="item dip"><span class="wl-prev" title="So hängt es an gLiTChs Wand">${GLWall.svg(x.wand, x.emoji, (D.plan && D.plan.farbe) || "#7B4CEF")}</span>${emo}${name}<input class="in" data-f="${c.k}:${i}:beschreibung" value="${esc(x.beschreibung)}" maxlength="120" aria-label="Beschreibung" placeholder="Wofür gibt es das Diplom?">${sel(DIP_COND(), x.bedingung, `data-f="${c.k}:${i}:bedingung" aria-label="Bedingung"`)}${sel(GLWall.KINDS, x.wand, `data-f="${c.k}:${i}:wand" aria-label="Wandgegenstand"`)}${del}</div>`; }
    if (c.k === "skins") return `<div class="item skin"><span class="sk-prev">${G ? G.svg("happy", isCol(x.farbe) ? x.farbe : "#8B5CFF", { calm: true }) : ""}</span>${name}<input type="color" class="in" data-f="${c.k}:${i}:farbe" value="${isCol(x.farbe) ? x.farbe : "#FF6A00"}" aria-label="Farbe" style="padding:2px;height:40px">${sel(UNLOCK(), x.freischalten || "prozent:90", `data-f="${c.k}:${i}:freischalten" aria-label="Freischalten"`)}${del}</div>`;
    if (c.k === "outfits") return `<div class="item">${emo}${name}${sel(OUT_SLOTS, x.platz, `data-f="${c.k}:${i}:platz" aria-label="Platz"`)}${unl}${del}</div>`;
    if (c.k === "emotes") return `<div class="item">${emo}${name}${sel(ANIMS, x.animation, `data-f="${c.k}:${i}:animation" aria-label="Animation"`)}${unl}${del}</div>`;
    if (c.k === "zimmer") return `<div class="item">${emo}${name}${sel(ROOM_SLOTS, x.platz, `data-f="${c.k}:${i}:platz" aria-label="Platz"`)}${unl}${del}</div>`;
    return `<div class="item bg">${emo}${name}<label class="sw" title="Wandfarbe"><input type="color" data-f="${c.k}:${i}:wand0" value="${isCol(x.wand && x.wand[0]) ? x.wand[0] : "#241052"}" aria-label="Wandfarbe oben"><input type="color" data-f="${c.k}:${i}:wand1" value="${isCol(x.wand && x.wand[1]) ? x.wand[1] : "#4B2696"}" aria-label="Wandfarbe unten"></label>
      <label class="sw" title="Bodenfarbe"><input type="color" data-f="${c.k}:${i}:boden0" value="${isCol(x.boden && x.boden[0]) ? x.boden[0] : "#7A4A26"}" aria-label="Bodenfarbe hinten"><input type="color" data-f="${c.k}:${i}:boden1" value="${isCol(x.boden && x.boden[1]) ? x.boden[1] : "#9C6534"}" aria-label="Bodenfarbe vorne"></label>${unl}${del}</div>`;
  }
  const blank = k => k === "skins" ? { name: "Neuer Skin", farbe: "#FF6A00", freischalten: D.art === "addon" ? "level:110" : "prozent:90" } : ({ diplome: { emoji: "🏅", name: "Neues Diplom", beschreibung: "", bedingung: "alle" }, outfits: { emoji: "🎩", name: "Neues Outfit", platz: "kopf", freischalten: "start" }, emotes: { emoji: "🎉", name: "Neues Emote", animation: "huepfen", text: "", freischalten: "fertig" }, zimmer: { emoji: "🪴", name: "Neuer Gegenstand", platz: "deko", freischalten: "sterne:5" }, hintergruende: { emoji: "🎨", name: "Neuer Hintergrund", wand: ["#241052", "#4B2696"], boden: ["#7A4A26", "#9C6534"], freischalten: "fertig" } })[k];
  function renderCats() {
    $("#cats").innerHTML = catsNow().map(c => `<div class="f" style="gap:10px"><div class="cat-h"><span aria-hidden="true" style="font-size:1.3rem">${c.ic}</span><h3>${c.n} <span class="n">${D[c.k].length}</span></h3>
        <button type="button" class="btn small" data-add="${c.k}">+ Eigenes</button><button type="button" class="btn small teal" data-sug="${c.k}">✨ Vorschlagen</button></div>
        <p class="hint">${c.d}</p><div class="list">${D[c.k].map((x, i) => rowHTML(c, x, i)).join("") || `<div class="empty">Noch nichts. Füge eigene hinzu oder lass gLiTCh etwas vorschlagen.</div>`}</div></div>`).join(`<hr style="border:0;border-top:1px solid var(--line);margin:4px 0;width:100%">`);
    $$("[data-f]", $("#cats")).forEach(el => { el.oninput = el.onchange = () => {
      const [k, i, f] = el.dataset.f.split(":"), x = D[k][+i]; if (!x) return;
      if (f === "wand0" || f === "wand1") { x.wand = x.wand || []; x.wand[+f.slice(-1)] = el.value; }
      else if (f === "boden0" || f === "boden1") { x.boden = x.boden || []; x.boden[+f.slice(-1)] = el.value; }
      else x[f] = el.value;
      if (k === "skins" && f === "farbe") { const pv = el.closest(".item").querySelector(".sk-prev"); if (pv && G) pv.innerHTML = G.svg("happy", el.value, { calm: true }); }
      if (k === "diplome" && (f === "wand" || f === "emoji")) { const pv = el.closest(".item").querySelector(".wl-prev"); if (pv) pv.innerHTML = GLWall.svg(x.wand, x.emoji, (D.plan && D.plan.farbe) || "#7B4CEF"); }
      if (k === "diplome" && f === "name" && el.tagName === "INPUT") { /* Name ändert die id nicht, damit Freischaltungen gültig bleiben */ }
      save(); paintSteps(); if (k === "diplome" && f === "name") $$("select[data-f$=':freischalten']", $("#cats")).forEach(s => { const v = s.value; s.innerHTML = opts(UNLOCK(), v); });
    }; });
    $$("[data-del]", $("#cats")).forEach(b => b.onclick = () => { const [k, i] = b.dataset.del.split(":"); const gone = D[k].splice(+i, 1)[0];
      if (k === "diplome" && gone) CATS.slice(1).forEach(c => D[c.k].forEach(x => { if (x.freischalten === "badge:" + gone.id) x.freischalten = "fertig"; }));
      save(); renderCats(); paintSteps(); });
    $$("[data-add]", $("#cats")).forEach(b => b.onclick = () => { const k = b.dataset.add, x = blank(k); if (D.art === "addon" && k !== "skins") x.freischalten = "level:110"; x.id = uid(D[k], x.name); D[k].push(x); save(); renderCats(); paintSteps(); const ins = $$(`[data-f^="${k}:${D[k].length - 1}:name"]`); if (ins[0]) ins[0].select(); });
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
    const MS = D.opt.mascot, MN = GLMascot.nameOf(MS), mNote = MS.typ === "glitch" ? "" : `\n\nWICHTIG: In diesem Modul spricht nicht gLiTCh, sondern das Maskottchen «${MN}»${MS.typ === "fenni" ? " (ein freundlicher Wüstenfuchs)" : MS.desc ? ` (${MS.desc.trim().slice(0, 200)})` : ""}. Überall, wo unten gLiTCh steht, schreibst du in den Texten «${MN}» und lässt ${MN} sprechen.`;
    return `Du bist gLiTCh, das freundliche Pixel-Maskottchen des «Glitchlab», einer Lernplattform einer Schweizer Primarschule. Du baust Lernmodule im Stil der gLiTCh-Lab-Module für NMG und Medien & Informatik: eine Rahmengeschichte, mehrere Etappen wie Missionen, gLiTCh spricht die Kinder in einer Sprechblase an, kurze Infotexte, abwechslungsreiche Aufgaben, Fachwörter im Lexikon, Diplome als Belohnung.${mNote}

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
      hintergruende: "hintergruende: 1–2 Hintergründe {name, emoji, wand:[hex oben, hex unten], boden:[hex hinten, hex vorne]} – eher dunkle, stimmige Farben, damit gLiTCh gut sichtbar bleibt",
      skins: "skins: 1–2 Spezial-Skins {name, farbe} – farbe ist eine kräftige Hex-Farbe, die zum Thema passt (keine Haut- oder Menschenfarben, kein Gold)" };
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
    if (k === "skins") return isCol(x.farbe) ? { name: name.slice(0, 30), farbe: x.farbe, freischalten: D.art === "addon" ? "" : "prozent:90" } : null;
    if (k === "hintergruende") return { emoji: emoji || "🎨", name, wand: (Array.isArray(x.wand) ? x.wand : []).filter(isCol).slice(0, 2), boden: (Array.isArray(x.boden) ? x.boden : []).filter(isCol).slice(0, 2), freischalten: "" };
    return null;
  }
  /* Neue Extras ohne Freischaltung bekommen eine sinnvolle: der Reihe nach Diplome, sonst Sterne */
  function linkUnlocks() {
    if (D.art === "addon") { let lv = 105; ["outfits", "emotes", "zimmer", "hintergruende", "skins"].forEach(k => D[k].forEach(x => { if (!x.freischalten) { x.freischalten = "level:" + Math.min(300, lv); lv += 5; } })); return; }
    const pool = D.diplome.map(d => "badge:" + d.id), fallback = ["start", "prozent:50", "prozent:90"]; let i = 0;
    ["outfits", "emotes", "zimmer", "hintergruende"].forEach(k => D[k].forEach(x => { if (!x.freischalten) { x.freischalten = pool.length ? pool[i % pool.length] : fallback[i % fallback.length]; i++; } }));
  }
  $("#sugAll").onclick = () => suggest(catsNow().map(c => c.k), $("#sugAll"));

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
- {"typ":"wortsalat","frage":"Umschreibung des Wortes, ohne es zu nennen","wort":"VULKAN","erklaerung":"…","tipp":"…"}   (ein Fachwort, 4–12 Buchstaben, ohne Leerzeichen)
- {"typ":"wortraten","frage":"Umschreibung des gesuchten Wortes","wort":"KRATER","erklaerung":"…","tipp":"…"}   (ein Wort oder zwei kurze, 4–14 Buchstaben)
- {"typ":"blitz","frage":"Blitzrunde: …","aussagen":[{"text":"…","richtig":true},{"text":"…","richtig":false}],"sekunden":8,"erklaerung":"…"}   (5–8 kurze Aussagen, gemischt wahr und falsch)
- {"typ":"markieren","anleitung":"Markiert alle … / Findet die 3 Fehler","text":"Ein Text mit 2–4 Sätzen, in dem die gesuchten Wörter mit *Sternchen* markiert sind.","erklaerung":"…","tipp":"…"}   (2–6 markierte einzelne Wörter)
- {"typ":"wortsuche","frage":"Findet die 5 versteckten Begriffe zu …","woerter":["MAGMA","LAVA","KRATER"],"erklaerung":"…"}   (4–7 Fachwörter, je 3–10 Buchstaben, keine Leerzeichen)
- {"typ":"karteikarten","frage":"Lernkarten: …","karten":[["Vorderseite (Frage/Begriff)","Rückseite (Antwort/Erklärung)"]],"erklaerung":"…"}   (4–8 Karten, kurz)
- {"typ":"chat","frage":"Chattet mit …","person":"Name einer passenden Figur (z. B. Zeitzeugin, Forscher)","emoji":"🧑‍🔬","schritte":[{"sagt":"Nachricht der Figur","optionen":["Antwort A","Antwort B","Antwort C"],"richtig":1,"antwort":"Reaktion auf die richtige Antwort","falsch":"Reaktion auf eine falsche Antwort mit kleinem Hinweis"}],"erklaerung":"…"}   (3–5 Schritte, die Figur vermittelt Wissen im Gespräch)
- {"typ":"meinung","frage":"Eine Frage, zu der man verschiedener Meinung sein darf","links":"Ja, unbedingt","rechts":"Nein, gar nicht","argumente":["Argument dafür","Argument dagegen","…"],"mindestwoerter":12,"erklaerung":"…"}   (3–5 Argumente für beide Seiten)
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
    const WU = v => s(v).toUpperCase().replace(/ß/g, "SS");
    if (t === "wortsalat") { const w = WU(a.wort).replace(/[^A-ZÄÖÜ]/g, ""); return w.length >= 3 && w.length <= 14 ? { typ: t, frage: s(a.frage), wort: w, erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null; }
    if (t === "wortraten") { const w = WU(a.wort).replace(/[^A-ZÄÖÜ \-]/g, "").trim(); return w.replace(/[^A-ZÄÖÜ]/g, "").length >= 3 && w.length <= 20 ? { typ: t, frage: s(a.frage), wort: w, erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null; }
    if (t === "blitz") { const L = (a.aussagen || []).filter(x => x && s(x.text)).map(x => ({ text: s(x.text), richtig: x.richtig === true || x.richtig === "true" })).slice(0, 10); return L.length >= 3 ? { typ: t, frage: s(a.frage), aussagen: L, sekunden: Math.max(4, Math.min(20, +a.sekunden || 8)), erklaerung: s(a.erklaerung) } : null; }
    if (t === "markieren") return /\*[^*\s][^*]*\*/.test(s(a.text)) ? { typ: t, anleitung: s(a.anleitung), text: s(a.text), erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null;
    if (t === "wortsuche") { const w = [...new Set((a.woerter || []).map(WU).map(x => x.replace(/[^A-ZÄÖÜ]/g, "")).filter(x => x.length >= 2 && x.length <= 11))].slice(0, 8); return w.length >= 3 ? { typ: t, frage: s(a.frage), woerter: w, erklaerung: s(a.erklaerung) } : null; }
    if (t === "karteikarten") { const kk = (a.karten || []).filter(x => Array.isArray(x) && s(x[0]) && s(x[1])).map(x => [s(x[0]), s(x[1])]).slice(0, 10); return kk.length >= 3 ? { typ: t, frage: s(a.frage), karten: kk, erklaerung: s(a.erklaerung) } : null; }
    if (t === "chat") { const sc = (a.schritte || []).filter(x => x && s(x.sagt) && Array.isArray(x.optionen) && x.optionen.length >= 2 && +x.richtig >= 0 && +x.richtig < x.optionen.length).map(x => ({ sagt: s(x.sagt), optionen: x.optionen.map(s), richtig: +x.richtig, antwort: s(x.antwort), falsch: s(x.falsch) })).slice(0, 6); return sc.length >= 2 ? { typ: t, frage: s(a.frage), person: s(a.person) || "Chat", emoji: s(a.emoji).slice(0, 8) || "🙂", schritte: sc, erklaerung: s(a.erklaerung), tipp: s(a.tipp) } : null; }
    if (t === "meinung") return s(a.frage) ? { typ: t, frage: s(a.frage), links: s(a.links) || "Ja", rechts: s(a.rechts) || "Nein", argumente: (a.argumente || []).map(s).filter(Boolean).slice(0, 6), mindestwoerter: Math.max(5, Math.min(80, +a.mindestwoerter || 12)), erklaerung: s(a.erklaerung) } : null;
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

  /* ---------- Aufgaben einzeln bearbeiten ---------- */
  const OPEN = new Set();
  const hashStr = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return s.length + ":" + h; };
  let KN = null;
  const kindName = typ => { if (!KN) KN = Object.assign({ info: "Info" }, Object.fromEntries(TYPES), KIND); return KN[typ] || typ; };
  const sumOf = a => String(a.frage || a.aussage || a.auftrag || a.anleitung || a.text || a.titel || "").replace(/\*\*|\[\[|\]\]/g, "").replace(/\s+/g, " ").slice(0, 90);
  /* Felder pro Aufgabenart. Art: s Zeile · t Text · n Zahl · b Ja/Nein · lines Liste · pairs «A = B» · opts1/optsN Antworten mit * · events «Jahr = Ereignis» · sortel «Text = Kategorie = Grund» · blitz «+ / -» · chars Emojis · json */
  const F_FRAGE = ["frage", "Frage", "t"];
  const FORM = {
    info: [["titel", "Überschrift (freiwillig)", "s"], ["text", "Text, den gLiTCh erklärt. **fett** geht, Absätze mit einer Leerzeile", "t"]],
    mc: [F_FRAGE, ["optionen", "Antworten, eine pro Zeile. Die richtige mit * am Anfang", "opts1"]],
    mehrfach: [F_FRAGE, ["optionen", "Antworten, eine pro Zeile. Alle richtigen mit * am Anfang", "optsN"]],
    tf: [["aussage", "Aussage", "t"], ["richtig", "Die Aussage stimmt", "b"]],
    text: [F_FRAGE, ["antworten", "Richtige Antworten, eine pro Zeile (verschiedene Schreibweisen)", "lines"]],
    luecke: [["anleitung", "Anleitung", "s"], ["text", "Text mit Lücken in [[doppelten eckigen Klammern]], Varianten mit |, z. B. [[Bern|die Stadt Bern]]", "t"], ["optionen", "Auswahlliste für die Lücken (freiwillig), eine pro Zeile", "lines"]],
    ordnen: [F_FRAGE, ["elemente", "Elemente in der RICHTIGEN Reihenfolge, eines pro Zeile", "lines"]],
    zuordnen: [F_FRAGE, ["paare", "Paare, eines pro Zeile: Begriff = passende Erklärung", "pairs"]],
    schreiben: [["auftrag", "Schreibauftrag", "t"], ["mindestwoerter", "Mindestens so viele Wörter", "n"]],
    memory: [F_FRAGE, ["paare", "Kartenpaare, eines pro Zeile: Begriff = Gegenstück", "pairs"]],
    sortieren: [F_FRAGE, ["kategorien", "Kategorien, eine pro Zeile", "lines"], ["elemente", "Karten, eine pro Zeile: Text = Kategorie = kurzer Grund (Grund freiwillig)", "sortel"]],
    zeitmaschine: [F_FRAGE, ["von", "Zeitleiste von (Jahr)", "n"], ["bis", "bis (Jahr)", "n"], ["einheit", "Einheit (freiwillig, z. B. «v. Chr.»)", "s"], ["ereignisse", "Ereignisse, eines pro Zeile: Jahr = Ereignis", "events"]],
    raetsel: [F_FRAGE, ["hinweise", "Hinweise vom schweren zum leichten, einer pro Zeile", "lines"], ["antworten", "Richtige Antworten, eine pro Zeile", "lines"]],
    schaetzen: [F_FRAGE, ["min", "Schieberegler von", "n"], ["max", "bis", "n"], ["antwort", "Richtige Zahl", "n"], ["toleranz", "So weit daneben gilt noch als richtig", "n"], ["einheit", "Einheit (z. B. m, km, Jahre)", "s"]],
    wortsalat: [["frage", "Umschreibung des Wortes (ohne es zu nennen)", "t"], ["wort", "Das gesuchte Wort", "s"]],
    wortraten: [["frage", "Umschreibung des Wortes (ohne es zu nennen)", "t"], ["wort", "Das gesuchte Wort", "s"]],
    blitz: [F_FRAGE, ["aussagen", "Aussagen, eine pro Zeile: + am Anfang = stimmt, - am Anfang = stimmt nicht", "blitz"], ["sekunden", "Sekunden pro Aussage", "n"]],
    markieren: [["anleitung", "Anleitung, z. B. «Markiert alle Fehler»", "s"], ["text", "Text. Die gesuchten Wörter mit *Sternchen* markieren", "t"]],
    wortsuche: [F_FRAGE, ["woerter", "Versteckte Wörter, eines pro Zeile", "lines"]],
    karteikarten: [F_FRAGE, ["karten", "Karten, eine pro Zeile: Vorderseite = Rückseite", "pairs"]],
    chat: [F_FRAGE, ["person", "Name der Figur", "s"], ["emoji", "Emoji der Figur", "s"], ["schritte", "Gesprächsschritte (Profi-Format JSON)", "json"]],
    meinung: [F_FRAGE, ["links", "Beschriftung links", "s"], ["rechts", "Beschriftung rechts", "s"], ["argumente", "Argumente, eines pro Zeile", "lines"], ["mindestwoerter", "Mindestens so viele Wörter", "n"]],
    gestalten: [["auftrag", "Gestaltungsauftrag", "t"], ["titelname", "Name des Titelfelds", "s"], ["textname", "Name des Textfelds", "s"], ["mindestwoerter", "Mindestens so viele Wörter", "n"], ["sticker", "Sticker (Emojis, mit Leerzeichen getrennt)", "chars"]]
  };
  const COMMON = [["titel", "Name des Bausteins (1–3 Wörter)", "s"], ["tipp", "Tipp von gLiTCh (hilft, ohne die Lösung zu verraten)", "s"], ["erklaerung", "Erklärung nach dem Lösen (warum stimmt es?)", "t"]];
  const MINHINT = { info: "Der Text darf nicht leer sein.", mc: "Es braucht eine Frage, mindestens 2 Antworten und genau eine mit * davor.", mehrfach: "Es braucht eine Frage, mindestens 3 Antworten und mindestens eine mit * davor.", tf: "Die Aussage darf nicht leer sein.", text: "Es braucht eine Frage und mindestens eine richtige Antwort.", luecke: "Im Text braucht es mindestens eine Lücke in [[doppelten Klammern]].", ordnen: "Es braucht mindestens 3 verschiedene Elemente.", zuordnen: "Es braucht mindestens 2 Paare mit «=», und die rechten Seiten müssen verschieden sein.", schreiben: "Der Auftrag darf nicht leer sein.", memory: "Es braucht mindestens 3 Paare mit «=».", sortieren: "Es braucht mindestens 2 Kategorien und 4 Karten, deren Kategorie genau so heisst wie oben.", zeitmaschine: "Es braucht «von» und «bis» und mindestens 2 Ereignisse mit Jahr dazwischen.", raetsel: "Es braucht mindestens 2 Hinweise und eine Antwort.", schaetzen: "Die richtige Zahl muss zwischen «von» und «bis» liegen.", wortsalat: "Das Wort braucht 3 bis 14 Buchstaben, ohne Leerzeichen.", wortraten: "Das Wort braucht mindestens 3 Buchstaben.", blitz: "Es braucht mindestens 3 Aussagen mit + oder - davor.", markieren: "Im Text müssen Wörter mit *Sternchen* markiert sein.", wortsuche: "Es braucht mindestens 3 Wörter mit 2 bis 11 Buchstaben.", karteikarten: "Es braucht mindestens 3 Karten mit «=».", chat: "Es braucht mindestens 2 gültige Gesprächsschritte.", meinung: "Die Frage darf nicht leer sein.", gestalten: "Der Auftrag darf nicht leer sein." };
  const BLANK = { info: { text: "" }, mc: { optionen: ["", ""], richtig: 0 }, mehrfach: { optionen: [], richtig: [] }, tf: { richtig: true }, schreiben: { mindestwoerter: 25 }, zeitmaschine: { von: 1200, bis: 2000 }, schaetzen: { min: 0, max: 100, antwort: 50, toleranz: 5 }, blitz: { sekunden: 8 }, chat: { person: "", emoji: "🙂", schritte: [{ sagt: "Hallo!", optionen: ["Antwort A", "Antwort B"], richtig: 0, antwort: "Genau!", falsch: "Nicht ganz." }] }, meinung: { links: "Ja", rechts: "Nein", mindestwoerter: 12 }, gestalten: { mindestwoerter: 20, sticker: ["⭐"] } };
  const splitEq = l => { const k = l.indexOf("="); return k < 0 ? [l.trim(), ""] : [l.slice(0, k).trim(), l.slice(k + 1).trim()]; };
  const linesOf = v => String(v || "").split("\n").map(x => x.trim()).filter(Boolean);
  function toVal(a, key, kind) {
    const v = a[key];
    if (kind === "lines") return (v || []).join("\n");
    if (kind === "pairs") return (v || []).map(p => p[0] + " = " + p[1]).join("\n");
    if (kind === "opts1" || kind === "optsN") { const r = Array.isArray(a.richtig) ? a.richtig : [a.richtig]; return (v || []).map((o, i) => (r.includes(i) ? "* " : "") + o).join("\n"); }
    if (kind === "events") return (v || []).map(e => e.jahr + " = " + e.text).join("\n");
    if (kind === "sortel") return (v || []).map(e => [e.text, e.kat, e.warum].filter(Boolean).join(" = ")).join("\n");
    if (kind === "blitz") return (v || []).map(x => (x.richtig ? "+ " : "- ") + x.text).join("\n");
    if (kind === "chars") return (v || []).join(" ");
    if (kind === "json") return JSON.stringify(v || [], null, 1);
    if (kind === "b") return !!v;
    return v == null ? "" : String(v);
  }
  function fromVal(o, key, kind, raw) {
    if (kind === "lines") o[key] = linesOf(raw);
    else if (kind === "pairs") o[key] = linesOf(raw).map(splitEq);
    else if (kind === "opts1" || kind === "optsN") { const L = linesOf(raw), r = []; o[key] = L.map((l, i) => { if (/^\*/.test(l)) { r.push(i); return l.replace(/^\*\s*/, ""); } return l.replace(/^[-–]\s+/, ""); }); o.richtig = kind === "opts1" ? (r.length === 1 ? r[0] : -1) : r; }
    else if (kind === "events") o[key] = linesOf(raw).map(l => { const [j, x] = splitEq(l); return { jahr: +j.replace(/[^\d-]/g, ""), text: x }; });
    else if (kind === "sortel") o[key] = linesOf(raw).map(l => { const p = l.split("=").map(x => x.trim()); return { text: p[0], kat: p[1] || "", warum: p.slice(2).join(" = ") }; });
    else if (kind === "blitz") o[key] = linesOf(raw).map(l => ({ text: l.replace(/^[+\-–]\s*/, ""), richtig: !/^[-–]/.test(l) }));
    else if (kind === "chars") o[key] = String(raw || "").split(/\s+/).filter(Boolean);
    else if (kind === "json") { try { o[key] = JSON.parse(raw); } catch (e) { o[key] = null; o.__jsonErr = true; } }
    else if (kind === "n") o[key] = raw === "" ? undefined : +raw;
    else if (kind === "b") o[key] = !!raw;
    else o[key] = String(raw || "");
  }
  function taskListHTML(i) {
    const c = D.inhalt[i]; if (!c) return "";
    return `<div class="tl">
      <button type="button" class="tl-row tl-et" data-etedit="${i}"><span class="tag">Etappe</span><span class="tl-s"><b>${esc(c.titel || "")}</b> · Einleitung und Lob von gLiTCh</span><span class="tl-ic">✏️</span></button>
      ${c.aufgaben.map((a, k) => `<div class="tl-row${a.typ === "info" ? " info" : ""}"><span class="tag">${esc(kindName(a.typ))}</span><button type="button" class="tl-s" data-tedit="${i}:${k}" title="Bearbeiten">${esc(sumOf(a) || "(leer)")}</button>
        <span class="tl-b"><button type="button" class="btn small" data-tmv="${i}:${k}:-1" ${k ? "" : "disabled"} aria-label="Nach oben">↑</button><button type="button" class="btn small" data-tmv="${i}:${k}:1" ${k < c.aufgaben.length - 1 ? "" : "disabled"} aria-label="Nach unten">↓</button><button type="button" class="btn small" data-tedit="${i}:${k}" aria-label="Bearbeiten">✏️</button>${a.typ !== "info" ? `<button type="button" class="btn small" data-tnew="${i}:${k}" ${SAMPLE ? "" : "disabled"} title="Nur diese Aufgabe von Claude neu schreiben lassen" aria-label="Neu schreiben">↻</button>` : ""}<button type="button" class="btn small danger" data-tdel="${i}:${k}" aria-label="Löschen">${DELC === i + ":" + k ? "Sicher?" : "🗑"}</button></span></div>`).join("")}
      <div class="row tl-add"><select class="in" id="addTyp${i}" aria-label="Art der neuen Aufgabe" style="width:auto;padding:7px 30px 7px 10px"><option value="info">Info (gLiTCh erklärt)</option>${TYPES.map(([v, n]) => `<option value="${v}">${esc(n)}</option>`).join("")}</select><button type="button" class="btn small" data-tadd="${i}">＋ Aufgabe</button></div></div>`;
  }
  let DELC = "";
  function bindTaskList() {
    $$("[data-tlopen]").forEach(b => b.onclick = () => { const i = +b.dataset.tlopen; OPEN.has(i) ? OPEN.delete(i) : OPEN.add(i); renderResult(); });
    $$("[data-tedit]").forEach(b => b.onclick = () => { const [i, k] = b.dataset.tedit.split(":").map(Number); taskDlg(i, k); });
    $$("[data-etedit]").forEach(b => b.onclick = () => etDlg(+b.dataset.etedit));
    $$("[data-tmv]").forEach(b => b.onclick = () => { const [i, k, d] = b.dataset.tmv.split(":").map(Number), A = D.inhalt[i].aufgaben; [A[k], A[k + d]] = [A[k + d], A[k]]; save(); renderResult(); });
    $$("[data-tdel]").forEach(b => b.onclick = () => { if (DELC !== b.dataset.tdel) { DELC = b.dataset.tdel; return renderResult(); } const [i, k] = b.dataset.tdel.split(":").map(Number); DELC = ""; D.inhalt[i].aufgaben.splice(k, 1); save(); renderResult(); toast("Aufgabe gelöscht."); });
    $$("[data-tadd]").forEach(b => b.onclick = () => { const i = +b.dataset.tadd; taskDlg(i, -1, $("#addTyp" + i).value); });
    $$("[data-tnew]").forEach(b => b.onclick = () => redoTask(...b.dataset.tnew.split(":").map(Number), b));
    $$("[data-quick]").forEach(b => b.onclick = () => quickDlg(+b.dataset.quick));
  }
  function edDlg(html) {
    const ov = document.createElement("div"); ov.className = "edov"; ov.innerHTML = `<div class="eddlg" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(ov); const close = () => { ov.remove(); document.removeEventListener("keydown", esc_); };
    const esc_ = e => { if (e.key === "Escape") close(); }; document.addEventListener("keydown", esc_);
    ov.querySelectorAll("[data-edx]").forEach(b => b.onclick = close); setTimeout(() => { const f = ov.querySelector("textarea, input"); if (f) f.focus(); }, 30);
    return { ov, close };
  }
  function taskDlg(i, k, newTyp) {
    const isNew = k < 0, a = isNew ? Object.assign({ typ: newTyp }, JSON.parse(JSON.stringify(BLANK[newTyp] || {}))) : JSON.parse(JSON.stringify(D.inhalt[i].aufgaben[k])), typ = a.typ;
    const fields = (FORM[typ] || []).concat(typ === "info" ? [] : COMMON.filter(([key]) => !(FORM[typ] || []).some(f => f[0] === key)));
    const field = ([key, label, kind], n) => { const id = "tf" + n, v = toVal(a, key, kind);
      if (kind === "b") return `<label class="f ed-b"><input type="checkbox" id="${id}" ${v ? "checked" : ""}> <span>${esc(label)}</span></label>`;
      if (kind === "s" || kind === "n" || kind === "chars") return `<label class="f" for="${id}"><span>${esc(label)}</span><input class="in" id="${id}" ${kind === "n" ? 'type="number" inputmode="decimal"' : ""} value="${esc(v)}"></label>`;
      const rows = Math.min(12, Math.max(3, String(v).split("\n").length + 1));
      return `<label class="f" for="${id}"><span>${esc(label)}</span><textarea class="in${kind === "json" ? " mono" : ""}" id="${id}" rows="${rows}" style="min-height:0">${esc(v)}</textarea></label>`; };
    const { ov, close } = edDlg(`<h2>${isNew ? "Neue Aufgabe" : "Aufgabe bearbeiten"} · <span class="tag">${esc(kindName(typ))}</span></h2>
      ${["mc", "mehrfach"].includes(typ) ? `<p class="hint">Beispiel:<br><code>* Bern</code> (richtig)<br><code>Zürich</code><br><code>Genf</code></p>` : ""}
      <div class="ed-f">${fields.map(field).join("")}</div><p class="err" id="tfErr" role="alert"></p>
      <div class="row"><button type="button" class="btn primary" data-edok>💾 Speichern</button><button type="button" class="btn" data-edx>Abbrechen</button></div>`);
    ov.querySelector("[data-edok]").onclick = () => {
      const o = { typ };
      fields.forEach(([key, , kind], n) => { const el = ov.querySelector("#tf" + n); fromVal(o, key, kind, kind === "b" ? el.checked : el.value); });
      if (o.__jsonErr) { ov.querySelector("#tfErr").textContent = "Das JSON bei den Gesprächsschritten ist nicht gültig."; return; }
      const v = validTask(o);
      if (!v) { ov.querySelector("#tfErr").textContent = "Da fehlt noch etwas. " + (MINHINT[typ] || ""); return; }
      if (typ !== "info" && !v.titel) v.titel = autoTitel(v);
      if (isNew) D.inhalt[i].aufgaben.push(v); else D.inhalt[i].aufgaben[k] = v;
      save(); close(); OPEN.add(i); renderResult(); toast(isNew ? "Aufgabe hinzugefügt." : "Gespeichert.");
    };
  }
  function etDlg(i) {
    const c = D.inhalt[i], P = D.plan;
    const { ov, close } = edDlg(`<h2>Etappe ${i + 1} bearbeiten</h2><div class="ed-f">
      <label class="f" for="etT"><span>Titel der Etappe</span><input class="in" id="etT" value="${esc(c.titel || "")}" maxlength="60"></label>
      <label class="f" for="etE"><span>Emoji</span><input class="in" id="etE" value="${esc(c.emoji || "")}" maxlength="8" style="max-width:120px"></label>
      <label class="f" for="etI"><span>gLiTCh leitet die Etappe ein</span><textarea class="in" id="etI" rows="3" style="min-height:0">${esc(c.intro || "")}</textarea></label>
      <label class="f" for="etL"><span>gLiTCh lobt am Ende der Etappe</span><textarea class="in" id="etL" rows="2" style="min-height:0">${esc(c.lob || "")}</textarea></label></div>
      <div class="row"><button type="button" class="btn primary" data-edok>💾 Speichern</button><button type="button" class="btn" data-edx>Abbrechen</button></div>`);
    ov.querySelector("[data-edok]").onclick = () => {
      c.titel = ov.querySelector("#etT").value.trim() || c.titel; c.emoji = ov.querySelector("#etE").value.trim() || c.emoji; c.intro = ov.querySelector("#etI").value.trim(); c.lob = ov.querySelector("#etL").value.trim();
      if (P.etappen[i]) Object.assign(P.etappen[i], { titel: c.titel, emoji: c.emoji });
      save(); close(); renderResult(); toast("Gespeichert.");
    };
  }
  const autoTitel = a => { const w = String(a.frage || a.aussage || a.auftrag || a.anleitung || a.text || "Aufgabe").replace(/\[\[|\]\]|\*/g, "").replace(/[«»"?!.:,;()]/g, "").split(/\s+/).filter(Boolean);
    const nomen = w.slice(1).filter(x => /^[A-ZÄÖÜ]/.test(x) && x.length > 2); return ((nomen.length ? nomen : w).slice(0, nomen.length ? 2 : 3).join(" ") || "Aufgabe").slice(0, 30); };
  async function redoTask(i, k, btn) {
    if (!SAMPLE || ctl) return; const P = D.plan, E = D.inhalt[i], old = E.aufgaben[k], wish = ($("#wish" + i) || {}).value || "";
    btn.disabled = true; btn.textContent = "…"; ctl = new AbortController();
    const prompt = `${context()}

MODULPLAN
Titel: ${P.titel}
Etappe ${i + 1}: «${E.titel}» – ${E.ziel || ""}
Lexikon-Wörter: ${P.lexikon.map(w => w.wort).join(", ")}
Andere Aufgaben dieser Etappe: ${E.aufgaben.filter((x, n) => n !== k).map(x => kindName(x.typ) + ": " + sumOf(x)).join(" | ")}

AUFGABE: Schreibe EINE neue Aufgabe vom Typ «${old.typ}», die diese ersetzt: ${JSON.stringify(old)}
Sie soll zum Ziel der Etappe passen, etwas anderes fragen als die anderen Aufgaben und fachlich korrekt sein.${wish ? `\nWunsch der Lehrperson: ${wish}` : ""}

${TASK_DOC}

Gib NUR das JSON-Objekt dieser einen Aufgabe zurück.`;
    try {
      const r = await SAMPLE.json(prompt, { modelTier: $("#tier").value, cache: false, signal: ctl.signal });
      const v = validTask(r && r.aufgabe ? r.aufgabe : r);
      if (!v || v.typ !== old.typ) throw { code: "invalid_json" };
      if (!v.titel) v.titel = autoTitel(v); E.aufgaben[k] = v; save(); toast("Aufgabe neu geschrieben.");
    } catch (e) { toast(errMsg(e)); }
    ctl = null; renderResult();
  }

  /* ---------- Schnell-Import: eigene Aufgaben in einem einfachen Muster ---------- */
  const QUICK_EX = `Info: Bern ist seit 1848 die Bundesstadt der Schweiz. Dort arbeiten Bundesrat und Parlament.

? Wie heisst die Bundesstadt der Schweiz?
* Bern
- Zürich
- Genf
Tipp: Dort steht das Bundeshaus.

? Welche Städte liegen am Genfersee?
* Lausanne
* Genf
- Basel
- Luzern

? In welchem Jahr wurde Bern Bundesstadt?
= 1848

R: Die Schweiz hat 26 Kantone.
F: Der Rhein fliesst durch Genf.

Lücke: Der höchste Berg der Schweiz ist die [Dufourspitze]. Sie liegt im Kanton [Wallis].

Paare: Was gehört zusammen?
Bern = Bundesstadt
Genf = Uno-Stadt
Basel = Rheinhafen

Reihenfolge: Ordne von Norden nach Süden.
Basel
Luzern
Lugano

Schreiben: Beschreibe deinen Lieblingsort in der Schweiz in 3 bis 4 Sätzen.`;
  function parseQuick(src) {
    const out = [], errs = [], blocks = String(src || "").replace(/\r/g, "").split(/\n\s*\n/).map(b => b.split("\n").map(l => l.trim()).filter(Boolean)).filter(b => b.length);
    blocks.forEach((L, bi) => {
      const meta = {}; const lines = L.filter(l => { const m = l.match(/^(tipp|hinweis|erklärung|erklaerung|warum|titel)\s*:\s*(.*)$/i); if (!m) return true; const k = m[1].toLowerCase(); meta[k === "hinweis" ? "tipp" : /^erkl|warum/.test(k) ? "erklaerung" : k] = m[2]; return false; });
      if (!lines.length) return;
      const head = lines[0], rest = lines.slice(1), after = re => head.replace(re, "").trim();
      const push = (a, nr) => { Object.assign(a, meta); const v = validTask(a); if (v) { if (v.typ !== "info" && !v.titel) v.titel = autoTitel(v); out.push(v); } else errs.push(`Block ${nr || bi + 1} («${head.slice(0, 40)}»): ${MINHINT[a.typ] || "nicht erkannt"}`); };
      let m;
      if (/^(info|merke|text|i)\s*:/i.test(head)) return push({ typ: "info", text: [after(/^(info|merke|text|i)\s*:/i)].concat(rest).join("\n") });
      if (/^(r|f|richtig|falsch|stimmt|stimmt nicht)\s*:/i.test(head)) return lines.forEach(l => { const mm = l.match(/^(r|f|richtig|falsch|stimmt nicht|stimmt)\s*:\s*(.+)$/i); if (mm) push({ typ: "tf", aussage: mm[2], richtig: /^(r|richtig|stimmt)$/i.test(mm[1]) }); else errs.push(`Block ${bi + 1}: «${l.slice(0, 40)}» braucht R: oder F: am Anfang.`); });
      if ((m = head.match(/^(lücke|luecke|lücken|luecken|l)\s*:\s*(.*)$/i))) { const txt = [m[2]].concat(rest.filter(l => !/^(auswahl|optionen)\s*:/i.test(l))).join(" ").replace(/\[\[(.+?)\]\]/g, "⟦$1⟧").replace(/\[(.+?)\]/g, "[[$1]]").replace(/⟦(.+?)⟧/g, "[[$1]]"); const opt = (rest.find(l => /^(auswahl|optionen)\s*:/i.test(l)) || "").replace(/^(auswahl|optionen)\s*:/i, "").split(/[,;]/).map(x => x.trim()).filter(Boolean); return push({ typ: "luecke", anleitung: "Fülle die Lücken aus.", text: txt, optionen: opt }); }
      if ((m = head.match(/^(paare|zuordnen|verbinden|memory|karten|karteikarten|lernkarten)\s*:?\s*(.*)$/i))) { const k = m[1].toLowerCase(), typ = k === "memory" ? "memory" : /karten/.test(k) ? "karteikarten" : "zuordnen"; return push({ typ, frage: m[2] || (typ === "memory" ? "Findet die Paare!" : typ === "karteikarten" ? "Lernkarten" : "Was gehört zusammen?"), paare: rest.map(splitEq), karten: rest.map(splitEq) }); }
      if ((m = head.match(/^(reihenfolge|ordnen)\s*:?\s*(.*)$/i))) return push({ typ: "ordnen", frage: m[2] || "Bringt in die richtige Reihenfolge.", elemente: rest.map(l => l.replace(/^\d+[.)]\s*/, "")) });
      if ((m = head.match(/^(sortieren)\s*:?\s*(.*)$/i))) { const el = rest.map(l => { const p = l.split("=").map(x => x.trim()); return { text: p[0], kat: p[1] || "", warum: p[2] || "" }; }); return push({ typ: "sortieren", frage: m[2] || "Sortiert die Karten.", kategorien: [...new Set(el.map(e => e.kat).filter(Boolean))], elemente: el }); }
      if ((m = head.match(/^(schreiben|auftrag)\s*:\s*(.*)$/i))) return push({ typ: "schreiben", auftrag: [m[2]].concat(rest).join(" "), mindestwoerter: 25 });
      if ((m = head.match(/^(rätsel|raetsel)\s*:?\s*(.*)$/i))) { const an = rest.filter(l => /^=/.test(l)).flatMap(l => l.replace(/^=\s*/, "").split("|")).map(x => x.trim()); return push({ typ: "raetsel", frage: m[2] || "Wer oder was ist gemeint?", hinweise: rest.filter(l => !/^=/.test(l)).map(l => l.replace(/^[-–]\s*/, "")), antworten: an }); }
      if (/^\?/.test(head) || /\?$/.test(head)) {
        const frage = head.replace(/^\?\s*/, ""), eq = rest.filter(l => /^=/.test(l)), op = rest.filter(l => /^[*+\-–]/.test(l));
        if (eq.length) return push({ typ: "text", frage, antworten: eq.flatMap(l => l.replace(/^=\s*/, "").split("|")).map(x => x.trim()) });
        if (op.length) { const opt = op.map(l => l.replace(/^[*+\-–]\s*/, "")), r = op.map((l, i) => /^[*+]/.test(l) ? i : -1).filter(i => i >= 0); return push(r.length > 1 ? { typ: "mehrfach", frage, optionen: opt, richtig: r } : { typ: "mc", frage, optionen: opt, richtig: r.length ? r[0] : -1 }); }
        return errs.push(`Block ${bi + 1} («${frage.slice(0, 40)}»): Nach der Frage fehlen die Antworten. Richtige mit * davor, falsche mit - davor, oder = Antwort.`);
      }
      errs.push(`Block ${bi + 1} («${head.slice(0, 40)}»): nicht erkannt. Beginne mit ?, Info:, R:/F:, Lücke:, Paare:, Memory:, Karten:, Reihenfolge:, Sortieren:, Rätsel: oder Schreiben:.`);
    });
    return { tasks: out, errs };
  }
  function quickDlg(i) {
    const { ov, close } = edDlg(`<h2>⚡ Eigene Aufgaben einfügen · Etappe ${i + 1}</h2>
      <p class="hint">Schreib deine Aufgaben in diesem einfachen Muster oder kopiere sie aus einem Arbeitsblatt. Zwischen zwei Aufgaben kommt eine leere Zeile. Claude erfindet hier nichts dazu: Es kommt genau das ins Modul, was du schreibst.</p>
      <details class="qhelp"><summary>So schreibst du die Aufgaben</summary><ul>
        <li><code>? Frage</code>, dann Antworten: richtige mit <code>*</code>, falsche mit <code>-</code>. Mehrere <code>*</code> = Mehrfachauswahl</li>
        <li><code>? Frage</code> und <code>= Antwort</code> = Antwort eintippen (Varianten mit <code>|</code>)</li>
        <li><code>R: Aussage</code> (stimmt) oder <code>F: Aussage</code> (stimmt nicht)</li>
        <li><code>Lücke: Satz mit [Lösung]</code>, freiwillig <code>Auswahl: A, B, C</code></li>
        <li><code>Paare:</code>, <code>Memory:</code> oder <code>Karten:</code>, dann Zeilen <code>Begriff = Erklärung</code></li>
        <li><code>Reihenfolge:</code> und die Elemente in der richtigen Reihenfolge</li>
        <li><code>Sortieren:</code> und Zeilen <code>Karte = Kategorie</code></li>
        <li><code>Rätsel:</code>, Hinweise vom schweren zum leichten, <code>= Lösung</code></li>
        <li><code>Schreiben: Auftrag</code> · <code>Info: Text</code>, den gLiTCh erklärt</li>
        <li>In jeder Aufgabe freiwillig: <code>Tipp: …</code>, <code>Erklärung: …</code>, <code>Titel: …</code></li></ul></details>
      <textarea class="in mono" id="qIn" rows="12" placeholder="? Wie heisst die Bundesstadt der Schweiz?&#10;* Bern&#10;- Zürich&#10;- Genf"></textarea>
      <div class="row"><button type="button" class="btn small" data-qex>Beispiel einfügen</button></div>
      <div id="qPrev" class="qprev" aria-live="polite"></div>
      <div class="row"><button type="button" class="btn primary" data-edok disabled>＋ Zu Etappe ${i + 1} hinzufügen</button><button type="button" class="btn" data-edx>Abbrechen</button></div>`);
    const inp = ov.querySelector("#qIn"), ok = ov.querySelector("[data-edok]");
    let res = { tasks: [], errs: [] };
    const prev = () => { res = parseQuick(inp.value); const c = {}; res.tasks.forEach(a => c[kindName(a.typ)] = (c[kindName(a.typ)] || 0) + 1);
      ov.querySelector("#qPrev").innerHTML = (res.tasks.length ? `<p class="ok">✓ ${res.tasks.length} erkannt: ${Object.entries(c).map(([k, n]) => `${n}× ${esc(k)}`).join(", ")}</p>` : "") + res.errs.map(e => `<p class="err">⚠ ${esc(e)}</p>`).join("");
      ok.disabled = !res.tasks.length; ok.textContent = res.tasks.length ? `＋ ${res.tasks.length} Aufgabe${res.tasks.length === 1 ? "" : "n"} zu Etappe ${i + 1} hinzufügen` : `＋ Zu Etappe ${i + 1} hinzufügen`; };
    inp.oninput = prev;
    ov.querySelector("[data-qex]").onclick = () => { inp.value = QUICK_EX; prev(); };
    ok.onclick = () => { if (!res.tasks.length) return; D.inhalt[i].aufgaben.push(...res.tasks); save(); close(); OPEN.add(i); renderResult(); toast(`${res.tasks.length} Aufgaben hinzugefügt.`); };
  }
  /* Modul ohne Claude: nur ein Gerüst mit leeren Etappen, die man selbst füllt */
  function manualModule() {
    if (!D.titel.trim()) { go(1); $("#titel").focus(); toast("Gib zuerst ein Thema ein."); return; }
    if (D.inhalt.length && !confirmManual) { confirmManual = true; $("#btnManual").textContent = "Wirklich? Das bisherige Modul wird ersetzt."; return; }
    confirmManual = false; const n = +D.etappen || 4;
    D.plan = { titel: D.titel.trim(), beschreibung: "", emoji: "⭐", farbe: "#A07CFF", intro: `Hallo! Heute geht es um ${D.titel.trim()}. Los geht's!`, schluss: "Super gemacht! Du hast alles geschafft.", etappen: Array.from({ length: n }, (_, k) => ({ titel: `Etappe ${k + 1}`, ziel: "", emoji: "⭐" })), lexikon: [] };
    D.inhalt = D.plan.etappen.map(e => ({ titel: e.titel, ziel: "", emoji: e.emoji, intro: "", lob: "Stark gemacht!", aufgaben: [] }));
    OPEN.clear(); D.inhalt.forEach((e, k) => OPEN.add(k)); save(); renderResult(); paintSteps(); $("#btnManual").textContent = "✍️ Ohne Claude: Modul selbst zusammenstellen";
    say("Das Gerüst steht. Füge in jeder Etappe deine Aufgaben ein, mit «⚡ Eigene Aufgaben einfügen» oder «＋ Aufgabe».", "happy");
  }
  let confirmManual = false;
  $("#btnManual").onclick = manualModule;

  /* ---------- Ergebnis, Vorschau, Datei ---------- */
  const KIND = { info: "Info", mc: "Quiz", tf: "R/F", text: "Eintippen", luecke: "Lücken", ordnen: "Ordnen", zuordnen: "Verbinden", schreiben: "Schreiben", mehrfach: "Mehrfach", memory: "Memory", sortieren: "Sortieren", zeitmaschine: "Zeitmaschine", raetsel: "Rätsel", schaetzen: "Schätzen", gestalten: "Gestalten" };
  function renderResult() {
    const ready = D.plan && D.inhalt.length && D.inhalt.every(e => e && e.aufgaben.some(a => a.typ !== "info"));
    $("#result").hidden = !D.inhalt.length;
    $("#btnGen").textContent = D.inhalt.length ? "⚙️ Ganz neu erstellen" : "⚙️ Modul erstellen";
    if (D.plan) $("#ets").innerHTML = D.plan.etappen.map((e, i) => { const c = D.inhalt[i];
      return `<div class="et"><div class="et-h"><span class="emo" aria-hidden="true">${esc(e.emoji)}</span><b>${i + 1}. ${esc(e.titel)}</b>${c ? `<span class="tag">★ ${etBudget(c)}</span>` : `<span class="tag">fehlt</span>`}</div>
        ${c ? `<div class="tags">${c.aufgaben.map(a => `<span class="tag">${KIND[a.typ]}</span>`).join("")}</div>` : ""}
        <div class="row"><input class="in" id="wish${i}" placeholder="Änderungswunsch, z. B. «einfachere Fragen» oder «mehr zum Experiment»" style="flex:1;min-width:180px;padding:7px 10px"><button type="button" class="btn small" data-redo="${i}" ${SAMPLE ? "" : "disabled"}>↻ Neu schreiben</button></div>
        ${c ? `<div class="row"><button type="button" class="btn small" data-tlopen="${i}" aria-expanded="${OPEN.has(i)}">${OPEN.has(i) ? "▾" : "▸"} ✏️ Aufgaben bearbeiten (${c.aufgaben.length})</button><button type="button" class="btn small" data-quick="${i}">⚡ Eigene Aufgaben einfügen</button></div>
        ${OPEN.has(i) ? taskListHTML(i) : ""}` : ""}</div>`; }).join("");
    bindTaskList();
    $$("[data-redo]").forEach(b => b.onclick = async () => {
      const i = +b.dataset.redo; if (!SAMPLE || ctl) return;
      ctl = new AbortController(); b.disabled = true; b.textContent = "schreibt …"; $("#btnGen").disabled = true;
      rows = []; rows[i + 1] = { t: `Etappe ${i + 1} neu schreiben`, st: "run" }; progRows(rows); say(`Ich schreibe Etappe ${i + 1} neu …`, "hmm");
      try { D.inhalt[i] = await writeEtappe(i, ctl.signal, $("#wish" + i).value.trim()); save(); rows = [{ t: `Etappe ${i + 1} neu geschrieben`, st: "ok" }]; progRows(rows); say("Erledigt! Schau es dir rechts an.", "happy"); }
      catch (e) { rows = [{ t: `Etappe ${i + 1}`, st: "err" }]; progRows(rows); $("#genErr").textContent = errMsg(e); }
      ctl = null; $("#btnGen").disabled = false; renderResult();
    });
    if (ready) { const html = buildModule(); const pv = $("#pv"), sig = hashStr(html); if (pv.dataset.sig !== sig) { pv.srcdoc = html; pv.dataset.sig = sig; } pv.hidden = false; $("#pvEmpty").hidden = true; $("#pvName").textContent = slug(D.plan.titel) + ".html"; }
    else { $("#pv").hidden = true; $("#pvEmpty").hidden = false; const leer = D.plan && D.inhalt.length ? D.inhalt.map((e, k) => e && e.aufgaben.some(a => a.typ !== "info") ? 0 : k + 1).filter(Boolean) : [];
      if (leer.length) $("#pvEmpty p").innerHTML = `Etappe ${leer.join(", ")} hat noch keine Aufgaben.<br>Füge mit «⚡ Eigene Aufgaben einfügen» oder «＋ Aufgabe» welche hinzu.`; }
    $("#btnDl").disabled = !ready; $("#btnPdf").disabled = !ready;
  }
  /* ---------- Belohnungs-Paket (Addon) ---------- */
  const addonUnlock = x => /^(sofort|level:\d+)$/.test(x.freischalten || "") ? x.freischalten : "level:110";
  function addonManifest() {
    const nm = (D.addonName || "").trim() || "Belohnungs-Paket";
    return { typ: "addon", titel: nm, beschreibung: (D.addonText || "").trim(), emoji: "🎁",
      extras: {
        outfits: D.outfits.map(x => ({ id: x.id, name: x.name, platz: x.platz, emoji: x.emoji, spruch: x.spruch || "", freischalten: addonUnlock(x) })),
        emotes: D.emotes.map(x => ({ id: x.id, name: x.name, emoji: x.emoji, text: x.text || x.name, animation: x.animation, farben: x.farben || [], beschreibung: `Aus dem Paket «${nm}».`, freischalten: addonUnlock(x) })),
        zimmer: D.zimmer.map(x => ({ id: x.id, name: x.name, platz: x.platz, emoji: x.emoji, freischalten: addonUnlock(x) })),
        hintergruende: D.hintergruende.map(x => ({ id: x.id, name: x.name, emoji: x.emoji, wand: x.wand || [], boden: x.boden || [], freischalten: addonUnlock(x) })),
        skins: D.skins.map(x => ({ id: x.id, name: x.name, farbe: x.farbe, freischalten: addonUnlock(x) }))
      }, erstellt: "gLiTCh-Editor" };
  }
  function buildAddon() {
    const m = addonManifest(), j = o => JSON.stringify(o).replace(/</g, "\\u003c"), SC = "<" + "/script>";
    const rows = [["outfits", "👕 Outfits"], ["emotes", "✨ Emotes"], ["zimmer", "🛋️ Zimmer"], ["hintergruende", "🖼️ Hintergründe"], ["skins", "🎨 Skins"]].map(([k, n]) => m.extras[k].length ? `<h2>${n}</h2><ul>${m.extras[k].map(x => `<li>${esc((x.emoji ? x.emoji + " " : "") + x.name)} · <small>${esc(x.freischalten === "sofort" ? "sofort" : "ab Level " + x.freischalten.slice(6))}</small></li>`).join("")}</ul>` : "").join("");
    return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(m.titel)}</title>
<!-- Belohnungs-Paket aus dem gLiTCh-Editor. Ins Glitchlab hochladen: Lehrpersonen → «Module hochladen». -->
<script type="application/json" id="glitchlab-modul">${j(m)}${SC}
<style>body{font:16px/1.5 system-ui,sans-serif;background:#14062E;color:#F3EEFF;max-width:720px;margin:0 auto;padding:24px}h1{margin:0 0 4px}small{color:#B9B2D0}h2{font-size:1.05rem;margin:18px 0 6px}li{margin:4px 0}.hint{background:#2A1466;border-radius:12px;padding:12px 14px}</style></head>
<body><h1>🎁 ${esc(m.titel)}</h1><p>${esc(m.beschreibung || "Belohnungen für gLiTCh.")}</p><p class="hint">Diese Datei im Glitchlab unter Lehrpersonen → «Module hochladen» hineinziehen. Die Belohnungen erscheinen bei den Kindern, sobald sie das Level erreichen.</p>${rows}</body></html>`;
  }
  function renderAddon() {
    const m = addonManifest(), n = ["outfits", "emotes", "zimmer", "hintergruende", "skins"].reduce((a, k) => a + m.extras[k].length, 0);
    $("#addonSum").innerHTML = n ? `<p><b>${esc(m.titel)}</b> · ${n} Belohnungen</p><div class="tags">${["outfits", "emotes", "zimmer", "hintergruende", "skins"].flatMap(k => m.extras[k].map(x => `<span class="tag">${esc((x.emoji ? x.emoji + " " : "") + x.name)} · ${x.freischalten === "sofort" ? "sofort" : "Level " + x.freischalten.slice(6)}</span>`)).join("")}</div>`
      : `<p class="hint">Noch keine Belohnungen. Lege sie in Schritt 3 an.</p>`;
    $("#btnAddon").disabled = !n;
  }
  $("#btnAddon").onclick = async () => {
    const html = buildAddon(), name = (slug(D.addonName) || "belohnungs-paket") + ".html";
    let dl = null; try { dl = await claude.use("downloads"); } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename: name, data: new Blob([html], { type: "text/html" }) }); toast(`«${name}» gespeichert. Jetzt im Glitchlab hochladen.`); return; } catch (e) { if (e && e.code === "declined") return; } }
    const u = URL.createObjectURL(new Blob([html], { type: "text/html" })), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
  };
  function manifest() {
    const P = D.plan;
    const un = x => x.freischalten || "fertig";
    return {
      titel: P.titel, fach: D.fach, thema: hubThemaName(), beschreibung: P.beschreibung || "", minuten: +D.minuten, farbe: P.farbe, emoji: P.emoji,
      aufgaben: D.inhalt.map((e, i) => ({ id: "etappe-" + (i + 1), titel: e.titel, sterne: etBudget(e) })), sterne: budget(),
      diplome: D.diplome.map(d => ({ id: d.id, name: d.name, emoji: d.emoji, beschreibung: d.beschreibung, wand: d.wand || GLWall.pick(d.id) })),
      extras: {
        outfits: D.outfits.map(x => ({ id: x.id, name: x.name, platz: x.platz, emoji: x.emoji, spruch: x.spruch || "", freischalten: un(x) })),
        emotes: D.emotes.map(x => ({ id: x.id, name: x.name, emoji: x.emoji, text: x.text || x.name, animation: x.animation, farben: x.farben || [], beschreibung: `Aus dem Modul «${P.titel}».`, freischalten: un(x) })),
        zimmer: D.zimmer.map(x => ({ id: x.id, name: x.name, platz: x.platz, emoji: x.emoji, freischalten: un(x) })),
        hintergruende: D.hintergruende.map(x => ({ id: x.id, name: x.name, emoji: x.emoji, wand: x.wand || [], boden: x.boden || [], freischalten: un(x) })),
        skins: D.skins.map(x => ({ id: x.id, name: x.name, farbe: x.farbe, freischalten: x.freischalten || "prozent:90" }))
      },
      erstellt: "gLiTCh-Editor", maskottchen: (D.opt.mascot || {}).typ || "glitch"
    };
  }
  function buildModule() {
    const P = D.plan, j = o => JSON.stringify(o).replace(/</g, "\\u003c");
    const mod = { titel: P.titel, beschreibung: P.beschreibung, emoji: P.emoji, farbe: P.farbe, intro: P.intro, schluss: P.schluss, fachname: fachName(), fachkurz: ({ mi: "M&I", nmg: "NMG", de: "DE", ma: "MA", en: "EN", fr: "FR", sp: "SPORT", mg: "GAMES" })[D.fach] || "",
      etappen: D.inhalt, lexikon: P.lexikon, opt: Object.assign({}, D.opt), sterne: budget(), diplome: D.diplome.map(d => ({ id: d.id, name: d.name, emoji: d.emoji, beschreibung: d.beschreibung, bedingung: d.bedingung, wand: d.wand || GLWall.pick(d.id) })), links: linkList() };
    const T = id => document.getElementById(id).textContent;
    const SC = "<" + "/script>";
    return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(P.titel)}</title>
<!-- Erstellt mit dem gLiTCh-Editor. Ins Glitchlab hochladen: Lehrpersonen → «Module hochladen». -->
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
  /* ---------- Übersicht für die Lehrperson als PDF: Etappen, Aufgaben und Lösungen ---------- */
  function loadJsPdf() { return window.jspdf ? Promise.resolve() : new Promise((ok, no) => { const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; sc.onload = ok; sc.onerror = () => no(new Error("PDF-Bibliothek nicht erreichbar")); document.head.appendChild(sc); }); }
  const pl = t => String(t ?? "").replace(/\*\*/g, "").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").replace(/[ \t]+/g, " ").trim();
  function solution(a) {
    const L = l => (l || []).map(pl);
    switch (a.typ) {
      case "mc": return [`Frage: ${pl(a.frage)}`, ...L(a.optionen).map((o, i) => `${i === +a.richtig ? "[richtig]" : "[ ]"} ${o}`)];
      case "tf": return [`Aussage: ${pl(a.aussage)}`, `Lösung: ${a.richtig ? "richtig" : "falsch"}`];
      case "text": return [`Frage: ${pl(a.frage)}`, `Lösung: ${L(a.antworten).join(" / ")}`];
      case "mehrfach": return [`Frage: ${pl(a.frage)}`, ...L(a.optionen).map((o, i) => `${(a.richtig || []).includes(i) ? "[richtig]" : "[ ]"} ${o}`)];
      case "luecke": return [pl(a.anleitung), `Text: ${pl(a.text).replace(/\[\[(.+?)\]\]/g, (m, x) => "[" + x.split("|")[0] + "]")}`];
      case "ordnen": return [pl(a.frage), ...L(a.elemente).map((x, i) => `${i + 1}. ${x}`)];
      case "zuordnen": case "memory": return [pl(a.frage), ...(a.paare || []).map(p => `${pl(p[0])} – ${pl(p[1])}`)];
      case "sortieren": return [pl(a.frage), ...(a.kategorien || []).map(k => `${pl(k)}: ${(a.elemente || []).filter(x => x.kat === k).map(x => pl(x.text)).join(", ")}`)];
      case "zeitmaschine": return [pl(a.frage), ...(a.ereignisse || []).map(x => `${x.jahr} – ${pl(x.text)}`)];
      case "raetsel": return [pl(a.frage), ...L(a.hinweise).map((h, i) => `Hinweis ${i + 1}: ${h}`), `Lösung: ${L(a.antworten).join(" / ")}`];
      case "schaetzen": return [pl(a.frage), `Lösung: ${a.antwort} ${pl(a.einheit)} (gilt ± ${a.toleranz})`];
      case "schreiben": case "gestalten": return [`Auftrag: ${pl(a.auftrag)}`, `Mindestens ${a.mindestwoerter || 20} Wörter`];
      case "wortsalat": case "wortraten": return [pl(a.frage), `Lösung: ${pl(a.wort)}`];
      case "blitz": return [pl(a.frage), ...(a.aussagen || []).map(x => `${x.richtig ? "richtig" : "falsch"}: ${pl(x.text)}`)];
      case "markieren": return [pl(a.anleitung), `Text: ${pl(a.text).replace(/\*([^*]+)\*/g, "[$1]")}`];
      case "wortsuche": return [pl(a.frage), `Wörter: ${L(a.woerter).join(", ")}`];
      case "karteikarten": return [pl(a.frage), ...(a.karten || []).map(k => `${pl(k[0])} = ${pl(k[1])}`)];
      case "chat": return [`Chat mit ${pl(a.person)}`, ...(a.schritte || []).map((x, i) => `${i + 1}. «${pl(x.sagt)}» = ${pl((x.optionen || [])[+x.richtig])}`)];
      case "meinung": return [pl(a.frage), `Skala: ${pl(a.links)} / ${pl(a.rechts)}`, ...L(a.argumente).map(x => `• ${x}`), "Keine richtige Lösung: Begründung zählt."];
      default: return [];
    }
  }
  async function lpPdf() {
    const b = $("#btnPdf"), t0 = b.textContent; b.disabled = true; b.textContent = "PDF wird erstellt …";
    try {
      await loadJsPdf();
      const P = D.plan, doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" }), W = 210, X = 16, MW = W - 2 * X; let y = 18;
      const col = isCol(P.farbe) ? P.farbe : "#7B4CEF", rgb = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
      const need = h => { if (y + h > 282) { doc.addPage(); y = 18; } };
      const text = (t, size = 10, style = "normal", color = [30, 24, 50], gap = 1, ind = 0) => { doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
        doc.splitTextToSize(pl(t), MW - ind).forEach(l => { need(size * .45); doc.text(l, X + ind, y); y += size * .42 + .5; }); y += gap; };
      doc.setFillColor(...rgb); doc.rect(0, 0, W, 30, "F"); doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text(doc.splitTextToSize(pl(P.titel), MW)[0], X, 14);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(pl(`Übersicht für die Lehrperson · ${fachName()} · ${D.klasse}. Klasse · ca. ${D.minuten} Minuten · ${D.inhalt.length} Etappen`), X, 23);
      y = 40;
      if (P.beschreibung) text(P.beschreibung, 10.5, "italic", [80, 70, 110], 2);
      const G = (D.opt.gates || []).map(g => ({ selbst: "Selbsteinschätzung", praes: "Präsentation", lp: "LP-Code" })[g]);
      text(`Maskottchen: ${GLMascot.nameOf(D.opt.mascot)} · Freigabe nach jeder Etappe: ${G.length ? G.join(", ") : "keine"} · Sterne total: ${budget()}`, 9.5, "normal", [90, 82, 120], 4);
      D.inhalt.forEach((E, e) => {
        need(18); doc.setDrawColor(...rgb); doc.setLineWidth(.6); doc.line(X, y, X + MW, y); y += 6;
        text(`Etappe ${e + 1}: ${E.titel || (P.etappen[e] || {}).titel || ""}`, 13, "bold", [20, 10, 50], 1);
        if ((P.etappen[e] || {}).ziel) text("Ziel: " + P.etappen[e].ziel, 10, "italic", [70, 60, 100], 2);
        let nr = 0;
        (E.aufgaben || []).forEach(a => {
          if (a.typ === "info") { text(`Info${a.titel ? ": " + a.titel : ""}`, 10, "bold", [60, 50, 90], 0); text(a.text, 9.5, "normal", [70, 65, 90], 2, 3); return; }
          nr++; text(`${nr}. ${(TYPES.find(x => x[0] === a.typ) || [, a.typ])[1]}${a.titel ? " · " + a.titel : ""} (Wert ${wert(a)})`, 10.5, "bold", rgb, .5);
          solution(a).filter(Boolean).forEach(l => text(l, 9.5, "normal", [40, 35, 60], .2, 4));
          if (a.erklaerung) text("Erklärung: " + a.erklaerung, 9, "italic", [100, 95, 120], .5, 4);
          y += 1.5;
        });
      });
      if ((P.lexikon || []).length) { need(16); doc.line(X, y, X + MW, y); y += 6; text("Lexikon", 13, "bold", [20, 10, 50], 2); P.lexikon.forEach(w => { text(w.wort, 10, "bold", [40, 30, 70], 0); text(w.erklaerung, 9.5, "normal", [70, 65, 90], 1.2, 3); }); }
      if (D.diplome.length) { need(16); text("Diplome", 13, "bold", [20, 10, 50], 2); D.diplome.forEach(d => text(`${d.name}: ${d.beschreibung || ""}`, 10)); }
      const n = doc.getNumberOfPages(); for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150, 140, 170); doc.text(`gLiTCh-Editor · ${pl(P.titel)} · Seite ${i} von ${n}`, W - X, 290, { align: "right" }); }
      const name = `${slug(P.titel) || "modul"}-uebersicht.pdf`, blob = doc.output("blob");
      let dl = null; try { dl = await claude.use("downloads"); } catch (e) { dl = null; }
      if (dl) { try { await dl.save({ filename: name, data: blob }); toast(`«${name}» gespeichert.`); } catch (e) { if (!(e && e.code === "declined")) toast("Speichern hat nicht geklappt."); } }
      else { const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
    } catch (e) { toast("Das PDF konnte nicht erstellt werden: " + (e.message || e)); }
    b.disabled = false; b.textContent = t0;
  }
  $("#btnPdf").onclick = lpPdf;
  $("#btnDl").onclick = async () => {
    const html = buildModule(), name = (slug(D.plan.titel) || "modul") + ".html";
    let dl = null; try { dl = await claude.use("downloads"); } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename: name, data: new Blob([html], { type: "text/html" }) }); toast(`«${name}» gespeichert. Jetzt im Glitchlab hochladen.`); return; } catch (e) { if (e && e.code === "declined") return; } }
    $("#btnCopy").hidden = false; $("#dlHint").textContent = "Herunterladen geht hier nicht. Tippe auf «Code kopieren», füge ihn in eine leere Textdatei ein und speichere sie als «" + name + "».";
  };
  $("#btnCopy").onclick = async () => { try { await navigator.clipboard.writeText(buildModule()); toast("Code kopiert."); } catch (e) { toast("Kopieren ging nicht. Versuch es in einem anderen Browser."); } };

  /* ---------- Start ---------- */
  bindBasics(); renderFiles(); go(D.step || 1);
})();
