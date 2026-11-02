# gLiTCh-Hautfarben in der Garderobe: 10 Farben, Standard Violett; Lehrpersonen immer Gold (nicht wählbar)
import json as _json
_SK = (pathlib.Path(__file__).parent / "skins.json").read_text(encoding="utf-8")

a = "let D = {cls:null, prog:{}, me:null};"
assert a in portal
portal = portal.replace(a, a + "\nwindow.GLAB_SKINS = " + _SK + ";", 1)
a = '''  window.GLAB_EXTRA_CODES = (ctx.codes || []).map(String);'''
assert a in portal
portal = portal.replace(a, a + '''
  window.GLAB_IS_LP = !!ctx.lp; window.GLAB_CUR_SKIN = ((ctx.extras || {}).outfit || {}).skin || "";''', 1)

# Garderobe: Hautfarbe zuoberst
a = '''    <div class="wd-stage"><span class="glitch wd-g">${LIB.glitchSVG("cool", {outfit:o})}</span></div>'''
assert a in portal
portal = portal.replace(a, a + '''
    ${skinPickHTML(o)}''', 1)
a = "function openWardrobe(){"
portal = portal.replace(a, '''function skinPickHTML(o){
  const L = (window.GLAB_SKINS || []).filter(x=>x.id !== "gold"), cur = o.skin || "violett";
  if (window.GLAB_IS_LP) return `<div class="wd-skin"><b>Hautfarbe</b><div class="wd-skins"><span class="wd-sk on gold" style="--sk:#F2B705" aria-label="Gold"><span class="glitch">${LIB.glitchSVG("happy")}</span><small>Gold</small></span></div><p class="wd-skin-note">✨ Lehrpersonen sind immer golden. Diese Farbe gibt es nur für Lehrpersonen.</p></div>`;
  return `<div class="wd-skin"><b>Hautfarbe</b><div class="wd-skins" role="radiogroup" aria-label="Hautfarbe von gLiTCh">${L.map(x=>`<button type="button" class="wd-sk${cur === x.id ? " on" : ""}" data-pt-skin="${x.id}" role="radio" aria-checked="${cur === x.id}" style="--sk:${x.base}"><span class="glitch">${LIB.glitchSVG("normal", {outfit:{skin:x.id}})}</span><small>${esc(x.n)}</small></button>`).join("")}</div></div>`;
}
function pickSkin(id){
  if (window.GLAB_IS_LP || id === "gold" || !(window.GLAB_SKINS || []).some(x=>x.id === id)) return;
  const s = student(D.me), p = prog(s.id), ov = document.getElementById("ptWd");
  p.outfit = Object.assign({}, p.outfit, {skin: id === "violett" ? null : id}); p.outfitAt = now(); window.GLAB_CUR_SKIN = id === "violett" ? "" : id; saveD();
  if (ov){ const sc = ov.scrollTop; ov.innerHTML = wardrobeHTML(); ov.scrollTop = sc; }
}
document.addEventListener("click", e=>{ const b = e.target.closest && e.target.closest("[data-pt-skin]"); if (b){ e.preventDefault(); pickSkin(b.dataset.ptSkin); } });
(function(){ if (document.getElementById("wdSkinCss")) return; const st = document.createElement("style"); st.id = "wdSkinCss";
  st.textContent = ".wd-skin{margin:4px 0 14px}.wd-skin > b{display:block;margin:0 0 8px;font:800 .95rem/1.2 system-ui,sans-serif}.wd-skins{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:8px}"
  + ".wd-sk{all:unset;box-sizing:border-box;cursor:pointer;display:grid;justify-items:center;gap:2px;padding:8px 4px 6px;border-radius:14px;background:rgba(255,255,255,.06);border:2px solid transparent;text-align:center}"
  + ".wd-sk .glitch{width:40px;height:40px;display:block}.wd-sk .glitch svg{width:100%;height:100%}.wd-sk small{font:700 .72rem/1.1 system-ui,sans-serif;opacity:.85}"
  + ".wd-sk.on{border-color:var(--sk);background:color-mix(in srgb, var(--sk) 22%, transparent)}.wd-sk:focus-visible{outline:3px solid #FFC21A;outline-offset:2px}"
  + ".wd-skin-note{margin:8px 0 0;font-size:.85rem;opacity:.85}";
  (document.head || document.documentElement).appendChild(st); })();
function openWardrobe(){''', 1)

# ---------- Überall «Lehrperson» statt «Herr Wehrli» ----------
def _lpfix(t):
    import re as _re
    R = [('Erzählt ${esc(X.teacher)}', 'Erzählt der Lehrperson'), ('an ${esc(X.teacher)}', 'an die Lehrperson'), ('Zeigt ${esc(X.teacher)}', 'Zeigt der Lehrperson'),
         ('${esc(X.teacher.replace(/^Herrn/,"Herr"))} lädt', 'Die Lehrperson lädt'), ('"Gespeichert! Jetzt per AirDrop an " + LP_NAME + " senden', '"Gespeichert! Jetzt per AirDrop an die Lehrperson senden'),
         ('Die Nummer sagt euch ${LP_NAME.replace(/^Herrn/,"Herr")}.', 'Die Nummer sagt euch die Lehrperson.'), ('Foto: Tim Wehrli', 'Foto: Anna Muster'),
         ('an Herrn Wehrli', 'an die Lehrperson'), ('und Herrn Wehrli', 'und der Lehrperson')]
    for a, b in R: t = t.replace(a, b)
    t = _re.sub(r'(^|["`>]|[.!?:]\s)Herrn Wehrli', lambda m: m.group(1) + 'Der Lehrperson', t)
    t = t.replace('Herrn Wehrli', 'der Lehrperson')
    t = _re.sub(r'(^|["`>(]|[.!?:]\s)Herr Wehrli', lambda m: m.group(1) + 'Die Lehrperson', t)
    t = t.replace('Herr Wehrli', 'die Lehrperson').replace('Wehrli', 'Lehrperson')
    return t
portal = _lpfix(portal)

# ---------- Level: über alle Fächer, rund um gLiTCh (10 Ränge × I–X) ----------
_RANKS = ["Pixel-Neuling", "gLiTCh-Beginner", "Bit-Entdecker", "gLiTCh-Kenner", "gLiTCh-Profi", "gLiTCh-Experte", "Pixel-Held", "gLiTCh-Master", "gLiTCh-Champion", "gLiTCh-Legende"]
_ROM = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
LEVEL_NAMES = [f"{_RANKS[i // 10]} {_ROM[i % 10]}" for i in range(100)]
LEVEL_NAMES[99] = "Ultimative gLiTCh-Legende"
portal = portal.replace('"Level 100 geschafft! Du bist eine echte Schweizer Legende."', '"Level 100 geschafft! Du bist die ultimative gLiTCh-Legende."')
def _lvfix(t):
    import re as _re
    i = t.index("const LEVELS = ["); j = t.index("];", i)
    block = t[i:j]; k = [0]
    def sub(m):
        n = LEVEL_NAMES[k[0]] if k[0] < 100 else m.group(1); k[0] += 1
        return '{n:"' + n + '"'
    block = _re.sub(r'\{n:"([^"]*)"', sub, block)
    t = t[:i] + block + t[j:]
    return t.replace("Mit diesem Cape bin ich eine echte Schweizer Legende.", "Mit diesem Cape bin ich eine echte gLiTCh-Legende.")
