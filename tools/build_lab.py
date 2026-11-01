"""Baut lab/index.html und lab/hub-portal.js für den Glitchlab-Hub.

Aufruf: python3 tools/build_lab.py <gLiTCh-Lab-NMG-Schweiz.html> <gLiTCh-Lab-NMG.html (alt)>

- Grundlage ist das gLiTCh-Lab «NMG Schweiz» (8 Schweiz-Module, Schweizer Outfits, Chalet-Zimmer).
- Aus dem älteren gLiTCh-Lab kommen die M&I-Module (Prompt-Labor, Fake-News, KI-Bild) in die
  Modulliste und das Pixel-Zimmer als zweiter Hintergrund.
- Das alte «Portal» (Konten, AirDrop-Dateien, Lehrperson) wird durch eine Brücke zum Hub ersetzt."""
import re, sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
old = pathlib.Path(sys.argv[2]).read_text(encoding="utf-8")
out_dir = pathlib.Path(__file__).resolve().parent.parent / "lab"

def func_text(text, head):
    """Ganze JS-Funktion ab 'head' (Klammern zählen, Strings grob überspringen)."""
    i = text.index(head); j = text.index("{", i); depth = 0; k = j; q = None
    while True:
        ch = text[k]
        if q:
            if ch == "\\": k += 2; continue
            if ch == q: q = None
        elif ch in "'\"`": q = ch
        elif ch == "{": depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0: return text[i:k + 1]
        k += 1

# ---------- Zwei Zimmer: Pixel (alt) und Chalet (neu) ----------
pixel = func_text(old, "function roomSVG(items){").replace("function roomSVG(items){", "function roomSVGPixel(items){", 1)
assert src.count("function roomSVG(items){") == 1
src = src.replace("function roomSVG(items){", pixel + "\nfunction roomSVG(items){ return (window.GLAB_ROOMBG === \"chalet\" ? roomSVGChalet : roomSVGPixel)(items); }\nfunction roomSVGChalet(items){", 1)

# ---------- Meme-Emotes aus dem alten gLiTCh-Lab zurückholen (zusätzlich zu den Schweizer Emotes) ----------
old_play = func_text(old, "function playEmote(el, id){").replace("function playEmote(el, id){", "function playEmoteMeme(el, id){", 1).replace("emoSound(id);", "emoSoundMeme(id);", 1)
oi_ = old.index("const EMO_SFX = {"); old_sfx = old[oi_:old.index("\n};", oi_) + 3].replace("const EMO_SFX = {", "const EMO_SFX_MEME = {", 1)
meme = old_sfx + "\nfunction emoSoundMeme(id){ if (!soundOn()) return; try { (EMO_SFX_MEME[id] || (()=>{}))(); } catch(e){} }\n" + old_play + "\n"
assert src.count("function playEmote(el, id){") == 1
src = src.replace("function playEmote(el, id){", meme + "function playEmote(el, id){\n  if (String(id).startsWith(\"m_\")) return playEmoteMeme(el, String(id).slice(2));", 1)
ei = old.index("const EMOTES = ["); old_em = old[ei + len("const EMOTES = ["):old.index("\n];", ei)]
old_em = old_em.replace('{id:"', '{id:"m_')
ni = src.index("const EMOTES = ["); ne = src.index("\n];", ni)
src = src[:ne] + ",\n  // Meme-Emotes aus dem gLiTCh-Lab (M&I)" + old_em + src[ne:]

# ---------- Lexikon: Modul auswählbar (Alle oder ein einzelnes Modul) ----------
def srep(a, b, count=1):
    global src
    n = src.count(a); assert n == count, f"{n}x statt {count}: {a[:60]!r}"
    src = src.replace(a, b)
srep('const mods = cur.scope === "all" ? ORDER() : [cur.mod];', 'const mods = cur.scope === "all" ? ORDER() : [cur.scope];', 2)
srep('const title = cur.scope === "all" || !cur.mod ? "Lexikon: alle Module" : "Lexikon: " + MODS()[cur.mod].short;', 'const title = cur.scope === "all" ? "Lexikon: alle Module" : "Lexikon: " + MODS()[cur.scope].short;')
srep('cur = Object.assign({scope:"mod", haveOf:()=>[], who:""}, o); if (!cur.mod) cur.scope = "all";', 'cur = Object.assign({haveOf:()=>[], who:""}, o); cur.scope = cur.mod && MODS()[cur.mod] ? cur.mod : "all";')
srep('''${cur.mod ? `<div class="gl-lex-scope" role="group" aria-label="Welche Wörter?"><button type="button" data-gl-scope="mod">${esc((MODS()[cur.mod] || {}).short || "Dieses Modul")}</button><button type="button" data-gl-scope="all">Alle Module</button></div>` : ""}''',
     '''<div class="gl-lex-scope" role="group" aria-label="Von welchem Modul?"><button type="button" data-gl-scope="all">Alle Module</button>${ORDER().map(m=>`<button type="button" data-gl-scope="${m}" style="--mc:${MODS()[m].c || "#8B5CFF"}">${esc(MODS()[m].short || m)}</button>`).join("")}</div>''')
src = src.replace("</head>", "<style>.gl-lex-scope{flex-wrap:wrap} .gl-lex-scope button{flex:none}</style></head>", 1)

# ---------- Portal herauslösen ----------
start_marker = "/* ================= gLiTCh-Lab Lernumgebung =================\n"
i = src.index(start_marker); s0 = src.rindex("<script>", 0, i); s1 = src.index("</script>", i)
portal = src[s0 + len("<script>"):s1]
def rep(old_, new, count=1):
    global portal
    n = portal.count(old_)
    assert n == count, f"{n}x gefunden statt {count}: {old_[:70]!r}"
    portal = portal.replace(old_, new)

# M&I-Module aus dem alten Lab vorne in die Modulliste
oi = old.index(start_marker); op = old[oi:old.index("</script>", oi)]
mi = op[op.index("const MODULES = [\n") + len("const MODULES = [\n"):op.index('  {id:"datenspuren"')]
rep("const MODULES = [\n", "const MODULES = [\n" + mi)

a = portal.index("const PKEY = "); b = portal.index("const MODULES = [")
portal = portal[:a] + portal[b:]
a = portal.index("let D = lsGet(PKEY)"); b = portal.index("const OUTFIT_MAP")
portal = portal[:a] + r'''/* ===== Brücke zum Glitchlab-Hub =====
   Der Hub liefert Kind, Team, Sterne und Extras. Alles wird dort gespeichert. */
const HB = (()=>{ try { return window.parent !== window && window.parent.GLHubBridge ? window.parent.GLHubBridge : null; } catch(e){ return null; } })();
const MODE = (location.hash || "#lobby").slice(1);
const LAB_MODS = ["prompt","fakenews","kibilder"].concat(MODULES.filter(m=>!["prompt","fakenews","kibilder"].includes(m.id) && m.live).map(m=>m.id));
const curMod = LAB_MODS.includes(MODE) ? MODE : null;
const ctx = HB ? HB.context(curMod) : null;
let D = {cls:null, prog:{}, me:null};
if (ctx){
  D.cls = {id:"hub", name: ctx.className, code: ctx.code, rev:0, students: [ctx.me].concat(ctx.team), groups:{}, kiQuiz: ctx.quiz || []};
  if (curMod){ D.cls.groups[curMod] = {}; D.cls.students.forEach(s=>{ D.cls.groups[curMod][s.id] = ctx.group; }); }
  D.me = ctx.me.id;
  D.prog[ctx.me.id] = Object.assign({mods: ctx.mods || {}, outfit:{}, outfitAt:0, seen:0}, ctx.extras || {});
  D.prog[ctx.me.id].mods = ctx.mods || {};
}
/* Hintergrund des Zimmers: Pixel-Zimmer oder Chalet (Chalet ab dem ersten fertigen NMG-Modul) */
const CHALET_BADGE = "eidgenossen_4";
window.GLAB_ROOMBG = (ctx && ctx.extras && ctx.extras.bg === "chalet") ? "chalet" : "pixel";
const pickExtras = p => ({outfit: p.outfit || {}, outfitAt: p.outfitAt || 0, seen: p.seen || 0, room: p.room || null, roomSeen: p.roomSeen || 0, emote: p.emote || null, prefsAt: p.prefsAt || 0, wall: p.wall || null, bg: window.GLAB_ROOMBG});
function saveD(){ if (HB && D.me && D.prog[D.me]) HB.saveExtras(pickExtras(D.prog[D.me])); }
function cloudPush(){}
let S = {};

const codeOf = () => (ctx && ctx.code) || "4313";
const student = id => D.cls && D.cls.students.find(s=>s.id === id);
const colorOf = id => { const s = student(id); return (s && s.c) || COLS[0]; };
const groupOf = (sid, mod="prompt") => (D.cls && D.cls.groups && D.cls.groups[mod] && D.cls.groups[mod][sid]) || null;
const membersOf = (nr, mod="prompt") => D.cls ? D.cls.students.filter(s=>String(groupOf(s.id, mod)) === String(nr)) : [];
const workKey = (nr, mod="prompt") => ctx ? ctx.workKey(mod) : "glhub.w.lokal." + mod;
const managed = () => true;
const uniquePin = () => "0000";
const prog = sid => (D.prog[sid] = D.prog[sid] || {mods:{}, outfit:{}, outfitAt:0, seen:0});

const me = student(D.me);
const modNr = curMod && me ? groupOf(me.id, curMod) : null;
const inModule = !!(curMod === "prompt" && me && modNr);
const inFN = !!(curMod === "fakenews" && me && modNr);
const inKI = !!(curMod === "kibilder" && me && modNr);
const inGE = !!(curMod && !["prompt","fakenews","kibilder"].includes(curMod) && me && modNr);

let LIB = null;
const GLAB = window.GLAB = {
  lobby: !inModule,
  key: inModule ? workKey(modNr) : null,
  applyTo(st){
    if (!inModule) return;
    st.gruppeNr = String(modNr);
    st.members = membersOf(modNr).map(s=>s.n);
    const o = prog(me.id).outfit; if (o && Object.keys(o).length) st.outfit = Object.assign({}, o);
  },
  report(r){
    if (!curMod || !HB) return;
    const p = prog(me.id), m = p.mods[curMod] || {stars:0, badges:[], fed:0, deaths:0};
    m.stars = Math.max(m.stars || 0, r.stars || 0);
    m.badges = Array.from(new Set([...(m.badges||[]), ...(r.badges||[])]));
    m.fed = Math.max(m.fed || 0, r.fed || 0); m.deaths = Math.max(m.deaths || 0, r.deaths || 0); m.at = now();
    p.mods[curMod] = m;
    if (r.outfit && JSON.stringify(r.outfit || {}) !== JSON.stringify(p.outfit || {})){ p.outfit = Object.assign({}, r.outfit || {}); p.outfitAt = now(); saveD(); }
    HB.report(curMod, {stars: r.stars || 0, badges: r.badges || [], fed: r.fed || 0, deaths: r.deaths || 0});
  },
  totals(live){ return totalsFor(me ? me.id : null, live); },
  exit(){ if (HB) HB.exit(); else history.back(); },
  emote(){ const sid = D.me; if (!sid || !LIB || !window.GLAB_R) return null; const p = prog(sid), li = LIB.levelOf(totalsFor(sid).stars); const x = window.GLAB_R.EMOTES.find(e=>e.id === (p.emote || "w")); return x && li >= x.lv ? x.id : (li >= window.GLAB_R.EMOTES[0].lv ? "w" : null); },
  hasEmote(){ const sid = D.me; if (!sid || !LIB || !window.GLAB_R) return false; const li = LIB.levelOf(totalsFor(sid).stars); return window.GLAB_R.EMOTES.some(e=>li >= e.lv); },
  libSet(lib){ if (!LIB) LIB = withFN(lib); },
  gsvg(mood, opts={}){ if (!LIB) return ""; const base = D.me ? Object.assign({}, prog(D.me).outfit || {}) : {}; return LIB.glitchSVG(mood, Object.assign({}, opts, {outfit: Object.assign(base, opts.outfit || {})})); },
  code(){ return codeOf(); },
  who(){ return me ? {name: me.n, nr: modNr} : null; },
  ready(lib){ LIB = withFN(lib); if (HB && HB.lib) try { HB.lib(LIB, typeof MOD_ART !== "undefined" ? MOD_ART : null); } catch(e){} if (inModule) return; document.body.classList.add("in-portal"); portalEl.hidden = false;
    const X = mod => ({root: portalEl, key: workKey(modNr, mod), nr: modNr, members: membersOf(modNr, mod).map(s=>s.n), teacher: LP_NAME, code: codeOf(), quiz: (D.cls && D.cls.kiQuiz) || [],
      glitch: (m, o)=>GLAB.gsvg(m, o), labLogo: LIB.labLogo, LEVELS: LIB.LEVELS, levelOf: LIB.levelOf, totals: live=>totalsFor(me.id, Object.assign({mod}, live)), report: r=>GLAB.report(r), exit: ()=>GLAB.exit()});
    if (inKI && window.GLAB_KI){ portalEl.classList.add("fn-mode"); window.GLAB_KI.start(X("kibilder")); return; }
    if (inFN && window.GLAB_FN){ portalEl.classList.add("fn-mode"); window.GLAB_FN.start(X("fakenews")); return; }
    if (inGE && window.GLAB_GE){ portalEl.classList.add("fn-mode"); window.GLAB_GE.start(Object.assign({mod: curMod}, X(curMod))); return; }
    render(); }
};

''' + portal[b:]

# Abzeichen aus allen Modulen; Outfits gehen mit dem alten ODER dem neuen Schweizer Diplom auf
a = portal.index("function withFN(lib){"); b = portal.index("function totalsFor(")
portal = portal[:a] + r'''function withFN(lib){
  const BADGES = lib.BADGES.filter(b=>!b.mod || b.mod === "prompt").map(b=>Object.assign({mod:"prompt"}, b))
    .concat(window.GLAB_FN_BADGES || []).concat(window.GLAB_KI_BADGES || []).concat(window.GLAB_GE_BADGES || [])
    .filter((b, k, all)=>all.findIndex(x=>x.id === b.id) === k);
  (lib.OUTFITS || []).forEach(o=>{ if (o.badge && OUTFIT_MAP[o.badge]) o.alt = OUTFIT_MAP[o.badge]; if (o.id === "fahne") o.say = "Hopp Schwiiz! Von 1291 bis 1815 kenne ich jetzt alles."; });
  const outfitReq = x => { if (x.badge){ const b = BADGES.find(b=>b.id === x.badge), a = x.alt && BADGES.find(b=>b.id === x.alt); return `Diplom «${b ? b.n : x.badge}»${a ? ` oder «${a.n}»` : ""}`; } return lib.outfitReq(x); };
  return Object.assign({}, lib, {BADGES, outfitReq, OUTFITS: lib.OUTFITS.slice()});
}
''' + portal[b:]
rep('''  if (x.badge && !T.badges.has(x.badge)) return false;''', '''  if (x.badge && !T.badges.has(x.badge) && !(x.alt && T.badges.has(x.alt))) return false;''')

# ---------- Kein Online-Speicher der alten Version ----------
rep("setTimeout(cloudInit, 0);", "")
rep('const LP_NAME = "Herrn Wehrli";', 'const LP_NAME = (ctx && ctx.teacher) || "deiner Lehrperson";')

# ---------- Ansicht: nur noch gLiTChs Zimmer ----------
a = portal.index("function render(){"); b = portal.index("function setupHTML(){")
portal = portal[:a] + r'''function render(){
  if (!LIB) return;
  if (curMod){ if (window.GLAB_ONCLOSE) try { window.GLAB_ONCLOSE(); } catch(e){} return; }
  if (!ctx){ portalEl.innerHTML = `<div class="pt-card" style="margin-top:40px"><h2>Bitte über den Glitchlab-Hub öffnen</h2><p>Diese Seite gehört zum Glitchlab-Hub. Öffne zuerst den Hub und melde dich dort an.</p></div>`; return; }
  portalEl.innerHTML = dashHTML();
  sayHide();
  if (MODE === "home") homeHooks();
}
''' + portal[b:]
portal, n = re.subn(r"Deine Lernwelt f[^$`<]*", "gLiTChs Zimmer", portal, count=1); assert n == 1
rep('''  return topHTML(`<span class="pt-chip" style="--c:${colorOf(s.id)}"><i aria-hidden="true">${esc(s.n.charAt(0).toUpperCase())}</i>${esc(s.n)}</span><button type="button" class="pt-btn small" data-pt="logout">Abmelden</button>`)''',
    '''  return (MODE === "home" ? "" : topHTML(`<span class="pt-chip" style="--c:${colorOf(s.id)}"><i aria-hidden="true">${esc(s.n.charAt(0).toUpperCase())}</i>${esc(s.n)}</span><button type="button" class="pt-btn small primary" data-pt="hub">← Zurück zum Hub</button>`))''')
m = re.search(r"\n    <h2 class=\"pt-h\">Module</h2>.*?(?=`;\n}\nfunction railBtn)", portal, re.S); assert m, "Modulliste nicht gefunden"
portal = portal[:m.start()] + portal[m.end():]
rep('''  const greet = T.stars === 0 ?''', '''  const team = D.cls.students.map(x=>x.n), who = team.length > 1 ? team.slice(0, -1).join(", ") + " und " + team[team.length-1] : s.n;
  const greet = MODE === "home" ? (team.length > 1 ? `Hoi ${who}! Ihr arbeitet als Team: Alle Sterne bekommt ihr gemeinsam.` : T.stars === 0 ? `Hoi ${s.n}! Willkommen in meinem Zimmer. Wähle unten ein Fach, dann sammeln wir Sterne.` : `Hoi ${s.n}! Schön, dass du da bist. Wohin geht's heute?`) : T.stars === 0 ?''')
rep('''  if (a === "logo"){''', '''  if (a === "hub"){ return GLAB.exit(); }
  if (a === "bg-pixel" || a === "bg-chalet"){ return pickBg(a.slice(3)); }
  if (a === "logo"){''')
rep('''<p>Sterne aus allen Modulen zählen zusammen. Jedes Level bringt eine Belohnung.</p>''', '''<p>Sterne aus allen Fächern im Hub zählen zusammen. Jedes Level bringt eine Belohnung.</p>''')

# Hintergrund-Auswahl im Dialog «Zimmer einrichten»
rep('''    <div class="pt-room" style="margin-top:14px">${RR.roomSVG(items)}''', '''    ${bgHTML(T)}
    <div class="pt-room" style="margin-top:14px">${RR.roomSVG(items)}''')
rep('''function roomHTML(){''', r'''function bgHTML(T){
  const chalet = T.badges.has(CHALET_BADGE), cur = window.GLAB_ROOMBG;
  const b = (id, n, open, sub) => `<button type="button" class="wd-item${cur === id ? " on" : ""}${open ? "" : " locked"}" data-pt="bg-${id}" ${open ? "" : 'aria-disabled="true"'} aria-pressed="${cur === id}"><b>${n}</b><small>${open ? (cur === id ? "aktiv" : "antippen") : sub}</small>${open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`;
  return `<div class="pt-bgpick"><b>Hintergrund</b><div class="wd-grid">${b("pixel", "🟪 Pixel-Zimmer", true, "")}${b("chalet", "🏔️ Schweizer Chalet", chalet, "nach dem ersten NMG-Modul (Alte Eidgenossenschaft)")}</div></div>`;
}
function pickBg(id){
  const T = totalsFor(D.me);
  if (id === "chalet" && !T.badges.has(CHALET_BADGE)){ const el = document.querySelector('[data-pt="bg-chalet"]'); if (el) el.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  window.GLAB_ROOMBG = id; saveD();
  const ov = document.getElementById("ptRm"); if (ov){ const sc = ov.scrollTop; ov.innerHTML = roomHTML(); ov.scrollTop = sc; }
}
function roomHTML(){''')

# ---------- Startseiten-Modus (#home): gLiTChs Zimmer direkt im Hub ----------
rep("""function railBtn(act, ic, n, sub, isNew, c, k){""", """/* Im Hub eingebettet: Höhe melden und Fenster (Garderobe usw.) gross machen */
let homeHooked = false;
function homeHooks(){
  if (homeHooked || !HB) return; homeHooked = true;
  document.documentElement.classList.add("hub-home");
  const size = ()=>{ try { HB.resize && HB.resize(Math.ceil(portalEl.getBoundingClientRect().height)); } catch(e){} };
  try { new ResizeObserver(size).observe(portalEl); } catch(e){ setInterval(size, 1000); }
  size();
  let open = false;
  const check = ()=>{ const now = !!document.querySelector("body > .wd-ov, body > .pt-ov"); if (now !== open){ open = now; try { HB.overlay && HB.overlay(now); } catch(e){} } };
  new MutationObserver(check).observe(document.body, {childList:true});
}
function railBtn(act, ic, n, sub, isNew, c, k){""")

# ---------- Emotes: werden über Module freigeschaltet (nicht mehr über Level) ----------
rep("""const pickExtras = p =>""", """/* Jedes Emote gehört zu einem Modul. Wer das Modul schafft, bekommt das Emote. «Hopp Schwiiz!» gibt es von Anfang an. */
const EMOTE_REQ = {
  sixseven: ["hub:mi-start", "Hallo gLiTCh!"], augustfeuer: ["buehne", "Prompt-Labor (alle 4 Etappen)"],
  richi: ["eidgenossen_4", "Alte Eidgenossenschaft"], kaese: ["helvetik_4", "Helvetische Republik"], aura: ["mediation_4", "Mediationszeit"],
  floss: ["restauration_4", "Restauration und Wiener Kongress"], dab: ["nachbarn_4", "Nachbarländer der Schweiz"],
  postauto: ["erfindungen_4", "Schweizer Erfindungen"], hosenlupf: ["politik_4", "Schweizer Politik"], fondue: ["ebenen_4", "Die drei Ebenen"],
  m_sixseven: ["hub:mi-start", "Hallo gLiTCh!"], m_dab: ["buehne", "Prompt-Labor (alle 4 Etappen)"], m_kaese: ["fn_alle", "Fake-News-Detektiv"],
  m_aura: ["ki_plakat", "KI-Bild oder echt?"], m_floss: ["hub:de-wueste", "Wüsten-Game"]
};
if (window.GLAB_R) window.GLAB_R.EMOTES.forEach(x=>{ const r = EMOTE_REQ[x.id]; x.req = r ? {badge: r[0], mod: r[1]} : null; x.lv = r ? 9999 : 0; });
const emoteOpen = (x, T) => !x.req || T.badges.has(x.req.badge);
const emoteReq = x => x.req ? `Modul «${x.req.mod}» schaffen` : "von Anfang an";
const pickExtras = p =>""")
rep("""const x = window.GLAB_R.EMOTES.find(e=>e.id === (p.emote || "w")); return x && li >= x.lv ? x.id : (li >= window.GLAB_R.EMOTES[0].lv ? "w" : null); },""",
    """const x = window.GLAB_R.EMOTES.find(e=>e.id === (p.emote || "w")); return x && emoteOpen(x, totalsFor(sid)) ? x.id : "w"; },""")
rep("""return window.GLAB_R.EMOTES.some(e=>li >= e.lv); },""", """return true; },""")
rep("""  const emoUnl = RR.EMOTES.filter(x=>li >= x.lv).length;""", """  const emoUnl = RR.EMOTES.filter(x=>emoteOpen(x, T)).length;""")
rep("""Das W-Emote hast du von Anfang an, alle 10 Level kommt ein neues Meme-Emote dazu.""", """«Hopp Schwiiz!» und «W» hast du von Anfang an. Jedes weitere Emote bekommst du, wenn du das passende Modul schaffst.""")
rep("""${RR.EMOTES.map(x=>{ const open = li >= x.lv, on = (p.emote || "w") === x.id;""", """${RR.EMOTES.map(x=>{ const open = emoteOpen(x, totalsFor(s.id)), on = (p.emote || "w") === x.id;""")
rep("""esc(x.d)) : `ab Level ${x.lv+1}`}</small>""", """esc(x.d)) : esc(emoteReq(x))}</small>""")
rep("""  if (li < x.lv){ const b = ov.querySelector(`[data-pt-emote="${id}"]`);""", """  if (!emoteOpen(x, totalsFor(D.me))){ const b = ov.querySelector(`[data-pt-emote="${id}"]`);""")

# Diplome zählen: nur echte Diplome (keine Hub-Merker wie «hub:mi-start»)
portal = portal.replace("T.badges.size", "LIB.BADGES.filter(b=>T.badges.has(b.id)).length")
exec(open(pathlib.Path(__file__).with_name("upload_patch_portal.py"), encoding="utf-8").read())
(out_dir / "hub-portal.js").write_text(portal.strip() + "\n", encoding="utf-8")

# ---------- Seite zusammensetzen ----------
def script_block(text, marker):
    m = text.index(marker); a_ = text.rindex("<script>", 0, m); b_ = text.index("</script>", m) + len("</script>")
    return text[a_:b_]
# Fake-News-Detektiv und KI-Bild fehlen in der Schweiz-Version: Skripte aus dem alten Lab übernehmen
extra = ""
for marker in ["window.GLAB_FN = {", "window.GLAB_KI = {"]:
    if marker not in src: extra += script_block(old, marker) + "\n"
page = src[:s0] + extra + '<script src="hub-portal.js"></script>' + src[s1 + len("</script>"):]
shim = '''<script>
/* Speichern von Bildern/PDFs ausserhalb der Claude-Ansicht: normaler Download */
if (!(window.claude && window.claude.use)) window.claude = Object.assign(window.claude || {}, {use: async n => n === "downloads" ? {save: async ({filename, data}) => {
  const u = URL.createObjectURL(data), a = document.createElement("a"); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u), 4000); }} : null});
</script>
'''
k = page.index("<script>"); page = page[:k] + shim + page[k:]
page = page.replace("</head>", """<style>
html.hub-home, html.hub-home body{background:transparent!important; padding:0!important; margin:0!important; overflow:hidden}
html.hub-home .pt{max-width:none; margin:0}
html.hub-home .pt-card.pt-home{margin:0}
.pt-bgpick{margin-top:12px; display:grid; gap:8px}
.pt-bgpick .wd-grid{grid-template-columns:repeat(2, minmax(0, 1fr))}
</style></head>""", 1)
exec(open(pathlib.Path(__file__).with_name("lex_patch.py"), encoding="utf-8").read())
exec(open(pathlib.Path(__file__).with_name("upload_patch_page.py"), encoding="utf-8").read())
page = re.sub(r"<title>[^<]*</title>", "<title>gLiTCh-Lab · Glitchlab-Hub</title>", page, count=1)
(out_dir / "index.html").write_text(page, encoding="utf-8")
print("ok", len(page), len(portal))
