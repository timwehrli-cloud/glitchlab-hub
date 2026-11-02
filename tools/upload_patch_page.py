# Wird von build_lab.py ausgeführt (exec) auf lab/index.html: Hintergründe + Emotes aus hochgeladenen Modulen zeichnen/abspielen.
def uprep(a, b, count=1):
    global page
    n = page.count(a); assert n == count, f"{n}x statt {count}: {a[:70]!r}"
    page = page.replace(a, b)
uprep('function roomSVG(items){ return (window.GLAB_ROOMBG === "chalet" ? roomSVGChalet : roomSVGPixel)(items); }',
'''function roomSVG(items){
  const cb = ((window.GLAB_CUSTOM && window.GLAB_CUSTOM.bgs) || []).find(b=>b.id === window.GLAB_ROOMBG);
  if (cb) return roomSVGCustom(items, cb);
  return (window.GLAB_ROOMBG === "chalet" ? roomSVGChalet : roomSVGPixel)(items); }
/* Eigener Hintergrund: Pixel-Zimmer mit anderen Wand-/Bodenfarben und einer eigenen Zeichnung an der Wand */
function roomSVGCustom(items, b){
  let s = roomSVGPixel(items); const w = b.wand || [], f = b.boden || [];
  const col = c => /^#[0-9a-f]{3,8}$/i.test(String(c || "")) ? c : null;
  if (col(w[0])) s = s.replace('stop-color="#241052"', `stop-color="${w[0]}"`);
  if (col(w[1] || w[0])) s = s.replace('stop-color="#4B2696"', `stop-color="${w[1] || w[0]}"`);
  if (col(f[0])) s = s.replace('stop-color="#7A4A26"', `stop-color="${f[0]}"`);
  if (col(f[1] || f[0])) s = s.replace('stop-color="#9C6534"', `stop-color="${f[1] || f[0]}"`).replace('stop-color="#6B3F1F"', `stop-color="${f[2] || f[1] || f[0]}"`);
  const u = String(b.id).replace(/[^\w-]/g, ""); s = s.replace(/rmWall/g, "rmWall_" + u).replace(/rmFloor/g, "rmFloor_" + u);
  if (b.svg) s = s.replace('<rect width="160" height="64" fill="url(#rmPat)"/>', '<rect width="160" height="64" fill="url(#rmPat)"/>' + b.svg);
  return s;
}''')
uprep('''function playEmote(el, id){
''', '''/* Emote aus einem hochgeladenen Modul: Emoji-Effekt + Text + Bewegung */
function playEmoteCustom(el, e){
  if (!el || el.dataset.emo) return; el.dataset.emo = "1";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, r = el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
  const cols = (e.farben && e.farben.length ? e.farben : ["#FFC21A","#FF2BD6","#00E5FF"]), ic = e.ic || "✨", ms = 2600;
  const G = window.GLAB && GLAB.gsvg ? GLAB.gsvg : null; if (G) swapFace(el, G(e.mood || "happy", {flex: e.anim === "jubeln"}), ms);
  try { if (soundOn() && typeof tone === "function") [523,659,784].forEach((f,k)=>tone(f, k*.12, .16, "square", .03)); } catch(err){}
  const A = {huepfen:[{transform:"none"},{transform:"translateY(-14%)"},{transform:"none"}], drehen:[{transform:"rotate(0)"},{transform:"rotate(360deg)"}], wackeln:[{transform:"rotate(0)"},{transform:"rotate(-10deg)"},{transform:"rotate(10deg)"},{transform:"rotate(0)"}], gross:[{transform:"scale(1)"},{transform:"scale(1.18)"},{transform:"scale(1)"}], jubeln:[{transform:"none"},{transform:"translateY(-8%) scale(1.05)"},{transform:"none"}]};
  if (!reduce && e.anim !== "regen") el.animate(A[e.anim] || A.huepfen, {duration: e.anim === "drehen" ? 900 : 600, iterations: e.anim === "drehen" ? 2 : 4});
  if (e.anim === "regen" && !reduce){ for (let k=0; k<18; k++){ const p = propEl(`<span style="font-size:${22+Math.random()*14}px">${ic}</span>`, `left:${Math.random()*100}vw; top:-40px`); p.animate([{transform:"translateY(0) rotate(0)"},{transform:`translateY(${innerHeight+80}px) rotate(${Math.random()*360-180}deg)`}], {duration:1600+Math.random()*1200, delay:Math.random()*700, easing:"ease-in", fill:"backwards"}).onfinish = ()=>p.remove(); } }
  else burst(cx, cy, cols, 14, 90, [ic]);
  setTimeout(()=>burst(cx, r.top, cols, 24, 110), 300);
  if (e.text) setTimeout(()=>textPop(cx, r.top, e.text, cols[0], 24, -55, 1600), 200);
  setTimeout(()=>{ delete el.dataset.emo; }, ms + 50);
}
function playEmote(el, id){
  const cuE = ((window.GLAB_CUSTOM && window.GLAB_CUSTOM.emotes) || []).find(x=>x.id === id); if (cuE) return playEmoteCustom(el, cuE);
''')


# Mehrere Lehrpersonen: alle Freigabe-Codes der Klasse gelten (GLAB_CODE_OK aus hub-portal.js)
for _w in ("ge", "fn", "ki"):
    _a = 'if (v.toLowerCase() !== (X.code || "4313").toLowerCase()){ document.getElementById("%sErr")' % _w
    assert _a in page, _w
    page = page.replace(_a, 'if (!(window.GLAB_CODE_OK ? GLAB_CODE_OK(v, X.code) : v.toLowerCase() === (X.code || "4313").toLowerCase())){ document.getElementById("%sErr")' % _w)
_a = 'const pwOK = v => v.trim().toUpperCase() === String(window.GLAB && GLAB.code ? GLAB.code() : PASSWORT).toUpperCase();'
assert _a in page
page = page.replace(_a, 'const pwOK = v => window.GLAB_CODE_OK ? GLAB_CODE_OK(v, window.GLAB && GLAB.code ? GLAB.code() : PASSWORT) : v.trim().toUpperCase() === String(window.GLAB && GLAB.code ? GLAB.code() : PASSWORT).toUpperCase();')


# Hautfarbe von gLiTCh (Garderobe im Hub): Schattierungen aus GLAB_SKINS, Lehrpersonen immer Gold
_a = 'const shade = y => y<=3 ? "#B79CFF" : y>=11 ? "#6A3FE0" : "#8B5CFF";'
assert _a in page
page = page.replace(_a, '''const _L = window.GLAB_SKINS || [], _id = (opts.outfit && opts.outfit.skin) || window.GLAB_CUR_SKIN;
  const _sk = (window.GLAB_IS_LP ? _L.find(x=>x.id === "gold") : _L.find(x=>x.id === _id && x.id !== "gold")) || {light:"#B79CFF", base:"#8B5CFF", dark:"#6A3FE0", hi:"#E3D6FF"};
  const shade = y => y<=3 ? _sk.light : y>=11 ? _sk.dark : _sk.base;''', 1)
_a = '<rect x="2" y="3" width="1" height="1" fill="#E3D6FF"/><rect x="0" y="0" width="1" height="1" fill="#00E5FF"/>'
assert _a in page
page = page.replace(_a, '<rect x="2" y="3" width="1" height="1" fill="${_sk.hi}"/><rect x="0" y="0" width="1" height="1" fill="#00E5FF"/>', 1)
