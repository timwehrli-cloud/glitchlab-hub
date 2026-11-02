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


# Skin von gLiTCh (Garderobe im Glitchlab): Schattierungen aus GLAB_SKINS, Lehrpersonen immer Gold
_a = 'const shade = y => y<=3 ? "#B79CFF" : y>=11 ? "#6A3FE0" : "#8B5CFF";'
assert _a in page
page = page.replace(_a, '''const _L = window.GLAB_SKINS || [], _id = (opts.outfit && opts.outfit.skin) || window.GLAB_CUR_SKIN;
  const _sk = (window.GLAB_IS_LP ? _L.find(x=>x.id === "gold") : _L.find(x=>x.id === _id && x.id !== "gold")) || {light:"#B79CFF", base:"#8B5CFF", dark:"#6A3FE0", hi:"#E3D6FF"};
  const shade = y => y<=3 ? _sk.light : y>=11 ? _sk.dark : _sk.base;''', 1)
_a = '<rect x="2" y="3" width="1" height="1" fill="#E3D6FF"/><rect x="0" y="0" width="1" height="1" fill="#00E5FF"/>'
assert _a in page
page = page.replace(_a, '<rect x="2" y="3" width="1" height="1" fill="${_sk.hi}"/><rect x="0" y="0" width="1" height="1" fill="#00E5FF"/>', 1)

page = _lpfix(page)
page = _lvfix(page)


# Prompt-Labor im Glitchlab: Teil 1 und Teil 2 als eigene Module (je nur ihr Reiter)
_a = 'mode = o.mode==="verbessern" && o.unlocked2 ? "verbessern" : "bauen"; unlocked2 = !!o.unlocked2; }\n} catch(e) {}'
assert _a in page
page = page.replace(_a, _a + '''
const HUB_PART = (()=>{ try { return window.parent !== window && window.parent.GLHubBridge ? (location.hash === "#prompt2" ? 2 : location.hash === "#prompt" ? 1 : 0) : 0; } catch(e){ return 0; } })();
if (HUB_PART === 2){ unlocked2 = true; mode = "verbessern"; } else if (HUB_PART === 1) mode = "bauen";''', 1)
_a = 'function renderTabs(){\n  $("#tabs").innerHTML = `'
assert _a in page
page = page.replace(_a, 'function renderTabs(){\n  if (HUB_PART){ $("#tabs").innerHTML = HUB_PART === 1 ? `<button type="button" class="tab" aria-pressed="true" disabled><b>Teil 1<span class="tl-x"> · Prompt bauen</span><span class="tl-s"> · Bauen</span></b><span>Prompt-Labor 1</span></button>` : `<button type="button" class="tab" aria-pressed="true" disabled><b>Teil 2<span class="tl-x"> · Testen &amp; verbessern</span><span class="tl-s"> · Testen</span></b><span>Prompt-Labor 2</span></button>`; $("#sub").textContent = M.sub; $("#promptTitle").textContent = M.promptTitle; return; }\n  $("#tabs").innerHTML = `', 1)

# gLiTCh im Zimmer streicheln: hin und her über gLiTCh fahren (Finger oder Maus); ein Wisch nach unten bleibt das Emote
_a = "/* Belohnungen pro Level (für Level-Übersichten) */"
assert _a in page
page = page.replace(_a, '''/* Streicheln im Zimmer */
(function(){
  let P = null;
  const heart = g => { const r = g.getBoundingClientRect(), h = document.createElement("span"); h.textContent = Math.random() < .5 ? "♥" : "💜";
    h.style.cssText = `position:fixed;left:${r.left + r.width*(.2 + Math.random()*.6)}px;top:${r.top + r.height*.2}px;z-index:9999;pointer-events:none;font-size:20px;color:#FF4F8B;transition:transform 1.2s ease-out, opacity 1.2s`;
    document.body.appendChild(h); requestAnimationFrame(()=>{ h.style.transform = "translateY(-50px) scale(1.3)"; h.style.opacity = "0"; }); setTimeout(()=>h.remove(), 1300); };
  const LINES = ["Hihi! Das kitzelt!","Mehr! Mein Code schnurrt!","Oh, so lieb!","Bzzzt … das tut gut!","Pixel-Kuschelzeit!"];
  const end = () => { if (P && P.on){ P.g.classList.remove("pt-petted"); if (window.GLAB_PET) window.GLAB_PET(P.g, false); } P = null; };
  document.addEventListener("pointermove", e=>{
    const g = e.target.closest && e.target.closest(".pt-room-g"); if (!g){ if (P && !P.on) P = null; return; }
    if (!P || P.g !== g) P = {g, last:null, dir:0, flips:0, dist:0, on:false, t:null};
    if (P.last){ const dx = e.clientX - P.last[0]; P.dist += Math.hypot(dx, e.clientY - P.last[1]); const d = Math.sign(dx); if (d && P.dir && d !== P.dir && Math.abs(dx) > 1) P.flips++; if (d) P.dir = d; }
    P.last = [e.clientX, e.clientY];
    if (P.dist > 160 && P.flips >= 2){
      if (!P.on){ P.on = true; window.__bdSwipe = lastSwipe = Date.now() + 99999; g.classList.add("pt-petted"); if (window.GLAB_PET) window.GLAB_PET(g, true); floatMsg(g, LINES[Math.floor(Math.random()*LINES.length)]); }
      if (Math.random() < .25) heart(g);
    }
    clearTimeout(P.t); P.t = setTimeout(()=>{ end(); lastSwipe = Date.now(); }, 800);
  }, true);
  const css = document.createElement("style"); css.textContent = ".pt-room-g.pt-petted > span{animation:ptPet .35s ease-in-out infinite}@keyframes ptPet{0%,100%{transform:rotate(-4deg) scale(1.03)}50%{transform:rotate(4deg) scale(1.07)}}@media (prefers-reduced-motion: reduce){.pt-room-g.pt-petted > span{animation:none}}"; document.head.appendChild(css);
})();
''' + _a, 1)

# Level nach oben offen: ab Level 100 alle 30 Sterne ein weiteres Level («gLiTCh-Legende +1», «+2» …)
_a = 'const levelOf = st => { let i = 0; LEVELS.forEach((l,k)=>{ if (st >= l.s) i = k; }); return i; };'
assert _a in page
page = page.replace(_a, '''const LV_STEP = 30;
function lvEnsure(n){ while (LEVELS.length < n){ const k = LEVELS.length - 99; LEVELS.push({n: "gLiTCh-Legende +" + k, s: LEVELS[99].s + k * LV_STEP}); } }
const levelOf = st => { if (st >= LEVELS[99].s) lvEnsure(100 + Math.floor((st - LEVELS[99].s) / LV_STEP) + 2); let i = 0; LEVELS.forEach((l,k)=>{ if (st >= l.s) i = k; }); return i; };''', 1)
