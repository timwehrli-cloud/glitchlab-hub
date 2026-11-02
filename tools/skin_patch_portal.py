# gLiTCh-Skins in der Garderobe: 10 Farben, Standard Violett; Lehrpersonen immer Gold (nicht wählbar)
import json as _json
_SK = (pathlib.Path(__file__).parent / "skins.json").read_text(encoding="utf-8")

a = "let D = {cls:null, prog:{}, me:null};"
assert a in portal
portal = portal.replace(a, a + "\nwindow.GLAB_SKINS = " + _SK + ";", 1)
a = '''  window.GLAB_EXTRA_CODES = (ctx.codes || []).map(String);'''
assert a in portal
portal = portal.replace(a, a + '''
  window.GLAB_IS_LP = !!ctx.lp; window.GLAB_CUR_SKIN = ((ctx.extras || {}).outfit || {}).skin || "";''', 1)

# Garderobe: Skin zuoberst
a = '''    <div class="wd-stage"><span class="glitch wd-g">${LIB.glitchSVG("cool", {outfit:o})}</span></div>'''
assert a in portal
portal = portal.replace(a, a + '''
    ${skinPickHTML(o)}''', 1)
a = "function openWardrobe(){"
portal = portal.replace(a, '''function skinPickHTML(o){
  const L = (window.GLAB_SKINS || []).filter(x=>x.id !== "gold"), cur = o.skin || "violett";
  if (window.GLAB_IS_LP) return `<div class="wd-skin"><b>Skin</b><div class="wd-skins"><span class="wd-sk on gold" style="--sk:#F2B705" aria-label="Gold"><span class="glitch">${LIB.glitchSVG("happy")}</span><small>Gold</small></span></div><p class="wd-skin-note">✨ Lehrpersonen sind immer golden. Diese Farbe gibt es nur für Lehrpersonen.</p></div>`;
  const T = totalsFor(D.me);
  return `<div class="wd-skin"><b>Skin</b><div class="wd-skins" role="radiogroup" aria-label="Skin von gLiTCh">${L.map(x=>{ const open = skinOpen(x, T); return `<button type="button" class="wd-sk${cur === x.id ? " on" : ""}${open ? "" : " locked"}" data-pt-skin="${x.id}" role="radio" aria-checked="${cur === x.id}" ${open ? "" : 'aria-disabled="true"'} style="--sk:${x.base}"><span class="glitch">${LIB.glitchSVG("normal", {outfit:{skin:x.id}})}</span><small>${esc(x.n)}</small>${open ? "" : `<em>${esc(skinReq(x))}</em>`}</button>`; }).join("")}</div></div>`;
}
const skinOpen = (x, T) => (x.lv == null || LIB.levelOf(T.stars) >= x.lv) && (!x.badge || T.badges.has(x.badge));
const skinReq = x => x.reqTxt || (x.lv != null ? `ab Level ${x.lv + 1}` : "");
function pickSkin(id){
  const sk = (window.GLAB_SKINS || []).find(x=>x.id === id);
  if (window.GLAB_IS_LP || id === "gold" || !sk) return;
  if (!skinOpen(sk, totalsFor(D.me))){ const b = document.querySelector(`[data-pt-skin="${id}"]`); if (b) b.animate([{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"none"}], {duration:280}); return; }
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
  + ".wd-skin-note{margin:8px 0 0;font-size:.85rem;opacity:.85}.wd-sk.locked .glitch{filter:grayscale(.85) brightness(.6)}.wd-sk em{font:600 .62rem/1.15 system-ui,sans-serif;font-style:normal;opacity:.75}";
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


# gLiTCh streicheln: Gesicht wechselt auf «love»
portal = portal.replace("let D = {cls:null, prog:{}, me:null};", """let D = {cls:null, prog:{}, me:null};
window.GLAB_PET = (g, on) => { try { const sp = g.querySelector(":scope > span"); if (!sp) return; if (on){ if (!g.dataset.petOld) g.dataset.petOld = sp.innerHTML; const p = (D.me && D.prog[D.me]) || {}; sp.innerHTML = LIB.glitchSVG("love", {outfit: p.outfit || {}}); } else if (g.dataset.petOld){ sp.innerHTML = g.dataset.petOld; delete g.dataset.petOld; } } catch(e){} };""", 1)

# ---------- Level-Anzeigen: bis 100 «x von 100», danach offen ----------
for _a, _b in [('<span>Level ${li+1} von ${L.length}</span>', '<span>${li < 100 ? `Level ${li+1} von 100` : `Level ${li+1} · über 100!`}</span>'),
               ('`${li+1} / ${L.length}`', '(li < 100 ? `${li+1} / 100` : `${li+1} ★`)'),
               ('<h2 id="ptLvT">Alle ${L.length} Level</h2><p>Sterne aus allen Fächern im Glitchlab zählen zusammen. Jedes Level bringt eine Belohnung.</p>',
                '<h2 id="ptLvT">Alle Level</h2><p>Sterne aus allen Modulen und Fächern zählen zusammen. Bis Level 100 bringt fast jedes Level eine Belohnung. Danach geht es offen weiter: alle 30 Sterne ein Level. Gegenstände aus der Schweiz gibt es für die Diplome aus «Entdeckungsreise Schweiz».</p>')]:
    assert _a in portal, _a
    portal = portal.replace(_a, _b, 1)

# ---------- Belohnungen neu verteilt ----------
SW_MODS = [("eidgenossen", "Alte Eidgenossenschaft"), ("helvetik", "Helvetische Republik"), ("mediation", "Mediationszeit"), ("restauration", "Restauration und Wiener Kongress"),
           ("nachbarn", "Nachbarländer der Schweiz"), ("erfindungen", "Schweizer Erfindungen"), ("politik", "Schweizer Politik"), ("ebenen", "Die drei Ebenen")]
SW_OUT = {"socken": "eidgenossen_1", "fahne": "eidgenossen_1", "armbrust": "eidgenossen_2", "tellapfel": "eidgenossen_3", "fahnenschwinger": "eidgenossen_4",
          "sennenkaeppi": "helvetik_1", "edelweiss": "helvetik_2", "tracht": "helvetik_3", "treichel": "helvetik_4",
          "skibrille": "mediation_1", "alphorn": "mediation_2", "wanderschuhe": "mediation_3", "bernhardiner": "mediation_4",
          "schwingerhose": "restauration_1", "steinbock": "restauration_2", "sennenhut": "restauration_3", "murmeli": "restauration_4",
          "brezel": "nachbarn_1", "beret": "nachbarn_2", "pizza": "nachbarn_3", "fuerstenhut": "nachbarn_3", "tirolerhut": "nachbarn_4",
          "erfinderbrille": "erfindungen_1", "sackmesser": "erfindungen_2", "gluehbirne": "erfindungen_3", "laborkittel": "erfindungen_4", "klettschuhe": "erfindungen_4",
          "stimmcouvert": "politik_1", "megafon": "politik_2", "jaanstecker": "politik_3", "bundesratskrawatte": "politik_4",
          "feuerwehrhelm": "ebenen_1", "postmuetze": "ebenen_2", "baer": "ebenen_3", "kuh": "ebenen_4"}
SW_OUT_N = {"goldeuhr": 16, "edelweisskrone": 24, "legendencape": 32}
SW_ROOM = {"fahne": "eidgenossen_4", "girlande": "helvetik_4", "eiffel": "nachbarn_2", "europakarte": "nachbarn_4", "werkbank": "erfindungen_2", "zahnraduhr": "erfindungen_3",
           "urne": "politik_2", "bundeshausposter": "politik_3", "kartenteppich": "ebenen_2", "postauto": "ebenen_4"}
SW_ROOM_N = {"geranien": 1, "fenster": 2, "trychel": 3, "ofen": 4, "alphorn": 5, "kuckuck": 6, "lampe": 7, "kuhfell": 8, "schrank": 9, "milch": 10, "laterne": 11,
             "scherenschnitt": 12, "edelweiss": 13, "fondue": 14, "holzkuh": 15, "herzen": 17, "gondel": 20, "globus": 26, "sterne": 28, "thron": 32}
LEVEL_SKINS = [{"id": "sonne", "n": "Sonnenuntergang", "lv": 19, "base": "#FF7A3D", "light": "#FFD25A", "dark": "#C2255C", "hi": "#FFF1B8"},
               {"id": "ozean", "n": "Ozean", "lv": 39, "base": "#1E88E5", "light": "#4DE3E0", "dark": "#123B8C", "hi": "#C9FBFF"},
               {"id": "galaxie", "n": "Galaxie", "lv": 59, "base": "#6A2BD9", "light": "#FF5ED8", "dark": "#1A1060", "hi": "#FFD6F6"},
               {"id": "lava", "n": "Lava", "lv": 79, "base": "#E8361C", "light": "#FFB21A", "dark": "#5A1208", "hi": "#FFE7A0"},
               {"id": "aurora", "n": "Polarlicht", "lv": 99, "base": "#19C79A", "light": "#9BFF6B", "dark": "#5B2BB5", "hi": "#E4FFD2"}]
_rew = """
/* ===== Belohnungen: Schweiz-Gegenstände gehören zu «Entdeckungsreise Schweiz», alles andere verteilt bis Level 100 ===== */
const SW_MODS = %s, SW_OUT = %s, SW_OUT_N = %s, SW_ROOM = %s, SW_ROOM_N = %s;
const SW_BADGE = id => { const m = SW_MODS.find(x=>id.startsWith(x[0] + "_")); return m ? m[1] : ""; };
const swCount = T => [...T.badges].filter(b=>SW_MODS.some(x=>b.startsWith(x[0] + "_"))).length;
const swTxt = (badge, n) => n ? `${n} Diplome aus «Entdeckungsreise Schweiz»` : `Diplom aus «${SW_BADGE(badge)}»`;
window.GLAB_LEVEL_SKINS = %s;
function rewardsFix(lib){
  if (lib.__rw) return; lib.__rw = 1;
  const dipName = id => { const b = (lib.BADGES || []).concat(window.GLAB_GE_BADGES || []).find(x=>x.id === id); return b ? b.n : ""; };
  (lib.OUTFITS || []).forEach(o=>{
    if (SW_OUT[o.id]){ o.badge = SW_OUT[o.id]; o.alt = null; o.lv = null; o.reqTxt = `Diplom «${dipName(o.badge) || o.badge}» (${SW_BADGE(o.badge)})`; }
    else if (SW_OUT_N[o.id]){ o.sw = SW_OUT_N[o.id]; o.badge = null; o.alt = null; o.lv = null; o.reqTxt = swTxt("", o.sw); }
  });
  /* restliche Level-Belohnungen gleichmässig bis Level 100 verteilen */
  const lvl = (lib.OUTFITS || []).filter(o=>o.lv != null && o.lv > 0 && !o.badge && !o.sw).sort((a,b)=>a.lv - b.lv);
  lvl.forEach((o,k)=>{ o.lv = Math.min(98, Math.round(2 + k * 96 / Math.max(1, lvl.length - 1))); });
  /* Start-Outfits: nur das erste bleibt auf Level 1, die anderen kommen auf freie Level bis Level 50 */
  const start = (lib.OUTFITS || []).filter(o=>o.lv === 0 && !o.badge && !o.sw), used = new Set(lvl.map(o=>o.lv));
  const free = []; for (let k = 1; k < 50; k++) if (!used.has(k)) free.push(k);
  start.slice(1).forEach((o,i,arr)=>{ o.lv = free[Math.round((i + 1) * (free.length - 1) / (arr.length + 1))]; });
  const R = window.GLAB_R;
  if (R && R.ROOM) R.ROOM.forEach(x=>{
    if (SW_ROOM[x.id]){ x.badge = SW_ROOM[x.id]; x.lv = 9999; x.reqTxt = `Diplom «${dipName(x.badge) || x.badge}» (${SW_BADGE(x.badge)})`; }
    else if (SW_ROOM_N[x.id]){ x.sw = SW_ROOM_N[x.id]; x.lv = 9999; x.reqTxt = swTxt("", x.sw); }
  });
}
""" % (_json.dumps(SW_MODS, ensure_ascii=False), _json.dumps(SW_OUT), _json.dumps(SW_OUT_N), _json.dumps(SW_ROOM), _json.dumps(SW_ROOM_N), _json.dumps(LEVEL_SKINS, ensure_ascii=False))
_a = "function withFN(lib){"
assert _a in portal
portal = portal.replace(_a, _rew + _a + "\n  rewardsFix(lib);", 1)
_a = "function outfitOpenFor(x, T){"
portal = portal.replace(_a, _a + "\n  if (x.sw && swCount(T) < x.sw) return false;", 1)
_a = "const roomOpen = (x, li) => x.badge ? totalsFor(D.me).badges.has(x.badge) : x.lv <= li;"
assert _a in portal
portal = portal.replace(_a, "const roomOpen = (x, li) => x.sw ? swCount(totalsFor(D.me)) >= x.sw : x.badge ? totalsFor(D.me).badges.has(x.badge) : x.lv <= li;", 1)
# Level-Skins in der Garderobe (gesperrt bis zum Level)
_a = "window.GLAB_SKINS = " + _SK + ";"
assert _a in portal
portal = portal.replace(_a, _a + "\nwindow.GLAB_SKINS = window.GLAB_SKINS.concat(%s).concat(((typeof CU !== 'undefined' && CU.skins) || []).map(x=>Object.assign({}, x)));" % _json.dumps(LEVEL_SKINS, ensure_ascii=False), 1)
