# Wird von build_lab.py ausgeführt (exec): Lexikon mit M&I-Wörtern + Filter Fach / Modul / Suche
def prep(a, b, count=1):
    global page
    n = page.count(a); assert n == count, f"{n}x statt {count}: {a[:60]!r}"
    page = page.replace(a, b)
# Die M&I-Wortlisten stecken in Modul-Skripten, die nicht in jedem Modus laufen:
# deshalb als Kopie in ein eigenes Skript ganz oben, das immer läuft.
def lex_obj(start):
    i = page.index(start); j = page.index("\n};", i) + 3
    return page[page.index("{", i):j - 1]
extra = {k: lex_obj(st) for k, st in [("fakenews", 'const LEX = {\n  "Fake News"'), ("kibilder", 'const LEX = {\n  "Sensor"'), ("prompt", 'const LEX_DEF = {\n  "Prompt"')]}
k0 = page.index("<script>")
page = page[:k0] + "<script>window.GLAB_LEX_EXTRA = {" + ",".join(f'"{k}":{v}' for k, v in extra.items()) + "};</script>" + page[k0:]
prep('const MODS = () => window.GLAB_GE_MODS || {};\nconst ORDER = () => Object.keys(MODS());',
'''const MI_LEX = [["prompt","Prompt-Labor","#00B8D9"],["fakenews","Fake-News-Detektiv","#FF2BD6"],["kibilder","KI-Bild oder echt?","#7C4DFF"]];
const MODS = () => { const o = {}, X = window.GLAB_LEX_EXTRA || {};
  MI_LEX.forEach(([id, short, c])=>{ if (X[id]) o[id] = {short, c, lex: X[id], fach:"mi"}; });
  Object.entries(window.GLAB_GE_MODS || {}).forEach(([id, m])=>{ o[id] = Object.assign({}, m, {fach:"nmg"}); });
  return o; };
const FACH = {mi:"Medien & Informatik", nmg:"Natur, Mensch, Gesellschaft"};
const ORDER = () => Object.keys(MODS());
const inScope = () => ORDER().filter(m=>(!cur.fach || MODS()[m].fach === cur.fach) && (!cur.mod || m === cur.mod));
const qOK = ([w,t]) => { const q = (cur.q || "").trim().toLowerCase(); return !q || (w + " " + t).toLowerCase().includes(q); };
const scopeTitle = () => cur.mod ? "Lexikon: " + MODS()[cur.mod].short : cur.fach ? "Lexikon: " + FACH[cur.fach] : "Lexikon: alle Fächer";''')
prep('''  const mods = cur.scope === "all" ? ORDER() : [cur.scope];
  const total''', '''  const mods = inScope(), q = (cur.q || "").trim();
  const modSel = ov.querySelector("#glLexMod");
  modSel.innerHTML = `<option value="">Alle Module</option>` + Object.keys(FACH).filter(f=>!cur.fach || f === cur.fach).map(f=>{ const ms = ORDER().filter(m=>MODS()[m].fach === f); return ms.length ? `<optgroup label="${esc(FACH[f])}">${ms.map(m=>`<option value="${m}"${cur.mod === m ? " selected" : ""}>${esc(MODS()[m].short)}</option>`).join("")}</optgroup>` : ""; }).join("");
  const total''')
prep('''  ov.querySelector(".gl-lex-body").innerHTML = mods.map(m=>{ const W = words(m); if (!W.length) return ""; const have = cur.haveOf(m);''',
     '''  let shown = 0;
  ov.querySelector(".gl-lex-body").innerHTML = mods.map(m=>{ const W = words(m).filter(qOK); if (!W.length) return ""; const have = cur.haveOf(m); shown += W.length;''')
prep('''  ov.querySelector(".gl-lex-count").textContent = `${total} Wörter · ${got} davon schon gesammelt`;
  ov.querySelectorAll("[data-gl-scope]").forEach(b=>b.setAttribute("aria-pressed", String(b.dataset.glScope === cur.scope)));''',
'''  if (!shown) ov.querySelector(".gl-lex-body").innerHTML = `<p class="gl-lex-none">Keine Wörter gefunden. Ändere die Auswahl oder die Suche.</p>`;
  ov.querySelector(".gl-lex-count").textContent = q ? `${shown} von ${total} Wörtern passen` : `${total} Wörter · ${got} davon schon gesammelt`;
  ov.querySelector("#glLexT").textContent = scopeTitle().replace("Lexikon: ", "Lexikon · ");''')
prep('''cur = Object.assign({haveOf:()=>[], who:""}, o); cur.scope = cur.mod && MODS()[cur.mod] ? cur.mod : "all";''',
     '''cur = Object.assign({haveOf:()=>[], who:""}, o); if (!(cur.mod && MODS()[cur.mod])) cur.mod = ""; cur.fach = cur.mod ? MODS()[cur.mod].fach : ""; cur.q = "";''')
prep('''<div class="gl-lex-scope" role="group" aria-label="Von welchem Modul?"><button type="button" data-gl-scope="all">Alle Module</button>${ORDER().map(m=>`<button type="button" data-gl-scope="${m}" style="--mc:${MODS()[m].c || "#8B5CFF"}">${esc(MODS()[m].short || m)}</button>`).join("")}</div>''',
'''<div class="gl-lex-filter" role="search" aria-label="Lexikon filtern">
      <label><span>Fach</span><select id="glLexFach"><option value="">Alle Fächer</option>${Object.entries(FACH).map(([f,n])=>`<option value="${f}"${cur.fach === f ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></label>
      <label><span>Modul</span><select id="glLexMod"></select></label>
      <label class="q"><span>Suche</span><input id="glLexQ" type="search" placeholder="Wort suchen …" autocomplete="off"></label></div>''')
prep('''    if (!t) return; if (t.dataset.glScope){ cur.scope = t.dataset.glScope; render(); return; }''', '''    if (!t) return;''')
prep('''  render();
}
async function loadJsPDF''', '''  ov.querySelector("#glLexFach").onchange = e=>{ cur.fach = e.target.value; cur.mod = ""; render(); };
  ov.querySelector("#glLexMod").onchange = e=>{ cur.mod = e.target.value; if (cur.mod) { cur.fach = MODS()[cur.mod].fach; ov.querySelector("#glLexFach").value = cur.fach; } render(); };
  ov.querySelector("#glLexQ").oninput = e=>{ cur.q = e.target.value; render(); };
  render();
}
async function loadJsPDF''')
prep('''    const mods = cur.scope === "all" ? ORDER() : [cur.scope];
    const title = cur.scope === "all" ? "Lexikon: alle Module" : "Lexikon: " + MODS()[cur.scope].short;''',
     '''    const mods = inScope();
    const title = scopeTitle() + ((cur.q || "").trim() ? ` · Suche «${cur.q.trim()}»` : "");''')
prep('''for (const m of mods){ const list = words(m);''', '''for (const m of mods){ const list = words(m).filter(qOK);''')
page = page.replace("</head>", """<style>
.gl-lex-filter{display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:8px 10px; margin:10px 0}
.gl-lex-filter label{display:flex; flex-direction:column; gap:3px; min-width:0}
.gl-lex-filter span{font-size:.7rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; color:#2EE6D6}
.gl-lex-filter select, .gl-lex-filter input{font:inherit; font-weight:700; color:#fff; background:#120A24; border:1.5px solid #8B5CFF; border-radius:12px; padding:8px 10px; min-width:0; width:100%; box-sizing:border-box}
.gl-lex-filter select:focus-visible, .gl-lex-filter input:focus-visible{outline:none; border-color:#2EE6D6; box-shadow:0 0 0 3px rgba(46,230,214,.25)}
.gl-lex-filter option, .gl-lex-filter optgroup{background:#120A24; color:#fff}
.gl-lex-none{opacity:.8; font-weight:700; padding:12px 4px}
@media (max-width:560px){ .gl-lex-filter{grid-template-columns:1fr 1fr} .gl-lex-filter .q{grid-column:1/-1} }
</style></head>""", 1)
