# Wird von build_lab.py ausgeführt (exec), nach upload_patch_page.py.
# Prestige im Zimmer (Seite): animierte Skins, Hintergrund-Animationen «pb-…»,
# Beschwörungs-Emotes (gLiTCh ruft einen Gegenstand herbei, der mit ihm etwas macht),
# Level-Namen ab Level 100 aus js/prestige.js (über das Glitchlab-Fenster).
import pathlib as _pl

_SKFX = (_pl.Path(__file__).resolve().parent.parent / "css" / "style.css").read_text(encoding="utf-8")
_SKFX = _SKFX[_SKFX.index("/* Animierte Prestige-Skins (gLiTCh) */"):]
_CSS = _SKFX + r'''
/* Prestige-Hintergründe */
.pb-tw{animation:pbTw 2.2s steps(2) infinite}
.pb-pulse{animation:pbPulse 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.pb-float{animation:pbFloat 3s ease-in-out infinite}
.pb-drift{animation:pbDrift 8s ease-in-out infinite}
.pb-spin{animation:pbSpin 14s linear infinite}
.pb-shoot{animation:pbShoot 5s linear infinite;opacity:0}
.pb-rise{animation:pbRise 3.2s linear infinite;opacity:0}
.pb-flick{animation:pbFlick .5s steps(3) infinite;transform-box:fill-box;transform-origin:50% 100%}
.pb-swing{animation:pbSwing 3s ease-in-out infinite}
.pb-sway{animation:pbSway 4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
.pb-blink{animation:pbBlink 4s steps(1) infinite}
.pb-hue{animation:pbHue 8s linear infinite}
.pb-shine{animation:pbShine 2.8s ease-in-out infinite}
.pb-glitch{animation:pbGlitch 2.4s steps(1) infinite}
.pb-scan{animation:pbScan 4s linear infinite}
@keyframes pbTw{50%{opacity:.15}}
@keyframes pbPulse{0%,100%{transform:scale(.88)}50%{transform:scale(1.12)}}
@keyframes pbFloat{0%,100%{translate:0 0}50%{translate:2px -4px}}
@keyframes pbDrift{0%,100%{translate:-10px 0}50%{translate:12px 2px}}
@keyframes pbSpin{to{transform:rotate(360deg)}}
@keyframes pbShoot{0%,78%{opacity:0;translate:0 0}82%{opacity:1}94%{opacity:0;translate:40px 16px}100%{opacity:0}}
@keyframes pbRise{0%{translate:0 0;opacity:0}15%{opacity:1}100%{translate:0 -36px;opacity:0}}
@keyframes pbFlick{0%{transform:scale(1,1)}33%{transform:scale(.92,1.12)}66%{transform:scale(1.06,.9)}}
@keyframes pbSwing{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
@keyframes pbSway{0%,100%{transform:skewX(-5deg)}50%{transform:skewX(5deg)}}
@keyframes pbBlink{0%,88%,100%{opacity:1}90%,94%{opacity:0}}
@keyframes pbHue{to{filter:hue-rotate(360deg)}}
@keyframes pbShine{0%,100%{filter:brightness(1)}50%{filter:brightness(1.6) drop-shadow(0 0 2px #fff)}}
@keyframes pbGlitch{0%,70%,100%{translate:0 0;opacity:1}72%{translate:3px 0;opacity:.4}74%{translate:-4px 1px;opacity:1}76%{translate:0 0;opacity:.2}78%{opacity:1}}
@keyframes pbScan{from{translate:0 0}to{translate:0 60px}}
/* Beschwörungs-Portal */
.sm-portal{display:block;border-radius:50%;background:radial-gradient(ellipse at center,#14062E 32%,var(--pc) 52%,var(--pc2) 66%,transparent 72%);box-shadow:0 0 18px var(--pc);animation:smPortal .9s linear infinite}
@keyframes smPortal{to{filter:hue-rotate(360deg)}}
@media (prefers-reduced-motion: reduce){[class^="pb-"],[class*=" pb-"],.sm-portal{animation:none!important;opacity:1}}
'''
assert "</style>" in page
page = page.replace("</style>", _CSS + "\n</style>", 1)

# animierte Skins: Klasse am gLiTCh-Bild
_a = 'return `<svg viewBox="${opts.flex ? "-5 -3 24 21" : opts.det ? "-3 -8 26 26" : "-2 -2 18 18"}" shape-rendering="crispEdges" aria-hidden="true" style="--d:-${d}s">'
assert _a in page
page = page.replace(_a, 'return `<svg viewBox="${opts.flex ? "-5 -3 24 21" : opts.det ? "-3 -8 26 26" : "-2 -2 18 18"}" shape-rendering="crispEdges" aria-hidden="true"${_sk.fx ? ` class="skfx skfx-${_sk.fx}"` : ""} style="--d:-${d}s;--skc:${_sk.base}">', 1)

# Level-Namen ab 100: Prestige
_a = 'LEVELS.push({n: "gLiTCh-Legende +" + k,'
assert _a in page
page = page.replace(_a, 'LEVELS.push({n: (window.GLAB_P ? GLAB_P.lvName(k) : "gLiTCh-Legende +" + k),', 1)
_a = "function lvEnsure(n){"
page = page.replace(_a, "window.GLAB_P = window.GLAB_P || (()=>{ try { return window.parent !== window && window.parent.GL_PRESTIGE || null; } catch(e){ return null; } })();\n" + _a, 1)

# Beschwörungs-Emotes
_a = "function playEmoteCustom(el, e){"
assert _a in page
page = page.replace(_a, r'''/* Prestige: Beschwörungs-Emote. Ein Portal öffnet sich, ein Gegenstand erscheint und macht etwas mit gLiTCh. */
function playSummon(el, e){
  if (!el || el.dataset.emo) return; el.dataset.emo = "1";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const r = el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2, W = r.width;
  const cols = e.farben && e.farben.length ? e.farben : ["#FFC21A","#FF2BD6","#00E5FF"];
  const G = window.GLAB && GLAB.gsvg ? GLAB.gsvg : null, sz = Math.max(34, Math.min(80, W*.55));
  let ms = 3200;
  const snd = fs => { try { if (soundOn() && typeof tone === "function") fs.forEach((f,k)=>tone(f, k*.1, .14, "square", .03)); } catch(err){} };
  const portal = (x, y, s=1.2, life=1400) => { const p = propEl(`<span class="sm-portal" style="width:${sz*s}px;height:${sz*s*.38}px;--pc:${cols[0]};--pc2:${cols[1] || cols[0]}"></span>`, `left:${x}px; top:${y}px`);
    p.animate([{transform:"translate(-50%,-50%) scale(0)", opacity:0},{transform:"translate(-50%,-50%) scale(1)", opacity:1, offset:.2},{transform:"translate(-50%,-50%) scale(1)", opacity:1, offset:.8},{transform:"translate(-50%,-50%) scale(0)", opacity:0}], {duration:life, easing:"ease-out"}).onfinish = ()=>p.remove(); };
  const item = (x, y, s=1) => propEl(`<span style="font-size:${sz*s}px;line-height:1;display:block">${e.ic}</span>`, `left:${x}px; top:${y}px; transform:translate(-50%,-50%) scale(0)`);
  const fin = (p, a) => { a.onfinish = () => p.remove(); };
  const k = e.sum;
  if (k === "ride" || k === "dragon" || k === "beam" || k === "crown") ms = 3600;
  if (G) swapFace(el, G(e.mood || "happy", {flex:true}), ms);
  if (e.text) setTimeout(()=>textPop(cx, r.top, e.text, cols[0], 24, -55, 1600), 900);
  if (reduce){ burst(cx, cy, cols, 14, 80, [e.ic]); setTimeout(()=>{ delete el.dataset.emo; }, 1500); return; }
  if (k === "smash"){
    const hx = cx + W*.62, hy = r.top; portal(hx, hy - sz*.4, 1, 1200); const h = item(hx, hy);
    const up = "translate(-50%,-50%) scale(1) rotate(-55deg)", dn = `translate(-50%,calc(-50% + ${W*.38}px)) scale(1) rotate(25deg)`;
    fin(h, h.animate([{transform:"translate(-50%,-50%) scale(0)"},{transform:up, offset:.2},{transform:dn, offset:.32},{transform:up, offset:.45},{transform:dn, offset:.57},{transform:up, offset:.7},{transform:dn, offset:.82},{transform:"translate(-50%,-50%) scale(0)"}], {duration:2800, easing:"ease-in-out"}));
    [.32,.57,.82].forEach(o=>setTimeout(()=>{ burst(hx - W*.1, hy + W*.38 + sz*.3, cols, 16, 60); snd([180,120]); el.animate([{transform:"none"},{transform:"scale(1.08,.9)"},{transform:"none"}], {duration:220}); }, 2800*o));
  } else if (k === "ride"){
    const m = item(cx, cy + W*.42), L = innerWidth;
    fin(m, m.animate([{transform:`translate(calc(-50% - ${L}px),-50%) scale(1) rotate(-30deg)`},{transform:"translate(-50%,-50%) scale(1)", offset:.22},{transform:`translate(calc(-50% + ${W*.6}px), calc(-50% - ${W*.7}px)) scale(1) rotate(15deg)`, offset:.48},{transform:`translate(calc(-50% - ${W*.6}px), calc(-50% - ${W*.7}px)) scale(1) rotate(-15deg)`, offset:.7},{transform:"translate(-50%,-50%) scale(1)", offset:.86},{transform:`translate(calc(-50% + ${L}px),-50%) scale(1) rotate(30deg)`}], {duration:ms, easing:"ease-in-out"}));
    el.animate([{transform:"none", offset:0},{transform:"none", offset:.22},{transform:`translate(${W*.6}px, ${-W*.7}px) rotate(8deg)`, offset:.48},{transform:`translate(${-W*.6}px, ${-W*.7}px) rotate(-8deg)`, offset:.7},{transform:"none", offset:.86},{transform:"none"}], {duration:ms, easing:"ease-in-out"});
    for (let i=0; i<7; i++) setTimeout(()=>burst(cx + (Math.random()-.5)*W*2.4, r.top - Math.random()*W*.7, ["#fff", cols[0]], 4, 30), 900 + i*260);
    snd([523,784,1046]);
  } else if (k === "chest"){
    const bx = cx + W*.68, by = cy + W*.2; portal(bx, r.top - sz*.5, 1.1, 1100); const b = item(bx, by);
    fin(b, b.animate([{transform:`translate(-50%, calc(-50% - ${W*1.2}px)) scale(.3)`},{transform:"translate(-50%,-50%) scale(1.1,.85)", offset:.25},{transform:"translate(-50%,-62%) scale(.95,1.05)", offset:.33},{transform:"translate(-50%,-50%) scale(1)", offset:.4},{transform:"translate(-50%,-50%) scale(1)", offset:.85},{transform:"translate(-50%,-50%) scale(0)"}], {duration:3000}));
    setTimeout(()=>{ snd([523,659,784,1046]); el.animate([{transform:"none"},{transform:"translateY(-22%)"},{transform:"none"}], {duration:420, iterations:3});
      for (let i=0; i<24; i++){ const c = propEl(`<span style="font-size:${18+Math.random()*12}px">🪙</span>`, `left:${cx + (Math.random()-.5)*W*3}px; top:${r.top - W}px`); c.animate([{transform:"translateY(0) rotate(0)", opacity:1},{transform:`translateY(${W*1.8 + Math.random()*W}px) rotate(${Math.random()*540}deg)`, opacity:0}], {duration:1200 + Math.random()*800, delay:Math.random()*700, easing:"ease-in", fill:"backwards"}).onfinish = ()=>c.remove(); } }, 800);
  } else if (k === "wand"){
    const wx = cx + W*.58, wy = cy - W*.1; portal(wx, wy + sz*.55, .9, 1100); const w = item(wx, wy);
    fin(w, w.animate([{transform:"translate(-50%,-50%) scale(0) rotate(-40deg)"},{transform:"translate(-50%,-50%) scale(1) rotate(-20deg)", offset:.2},{transform:"translate(-50%,-50%) scale(1) rotate(25deg)", offset:.35},{transform:"translate(-50%,-50%) scale(1) rotate(-25deg)", offset:.5},{transform:"translate(-50%,-50%) scale(1) rotate(25deg)", offset:.65},{transform:"translate(-50%,-50%) scale(1) rotate(-10deg)", offset:.85},{transform:"translate(-50%,-50%) scale(0)"}], {duration:3000}));
    setTimeout(()=>{ snd([784,988,1175,1568]); el.animate([{transform:"rotate(0)"},{transform:"rotate(360deg)"}], {duration:900, easing:"ease-in-out"});
      for (let i=0; i<26; i++){ const s = propEl(`<span style="font-size:16px;color:${cols[i % cols.length]};text-shadow:0 0 6px ${cols[i % cols.length]}">✦</span>`, `left:${cx}px; top:${cy}px`); const an = i*.5, rad = W*(.35 + i*.025);
        s.animate([{transform:`translate(-50%,-50%) translate(${Math.cos(an)*W*.2}px,${Math.sin(an)*W*.2}px) scale(.3)`, opacity:0},{transform:`translate(-50%,-50%) translate(${Math.cos(an+2)*rad}px,${Math.sin(an+2)*rad}px) scale(1)`, opacity:1, offset:.5},{transform:`translate(-50%,-50%) translate(${Math.cos(an+4)*rad*1.4}px,${Math.sin(an+4)*rad*1.4 - W*.4}px) scale(.4)`, opacity:0}], {duration:1400, delay:i*40, fill:"backwards"}).onfinish = ()=>s.remove(); } }, 700);
  } else if (k === "jump"){
    const lx = cx - W*1.15, rx = cx + W*1.15, y = cy + W*.3; portal(lx, y, 1.1, 2300); setTimeout(()=>portal(rx, y, 1.1, 1500), 1000); const d = item(lx, y);
    const fr = []; for (let i=0; i<=12; i++){ const t = i/12; fr.push({transform:`translate(calc(-50% + ${(rx-lx)*t}px), calc(-50% - ${Math.sin(t*Math.PI)*W*1.35}px)) rotate(${(-40 + 80*t).toFixed(1)}deg) scale(-1,1)`}); }
    fr.push({transform:`translate(calc(-50% + ${rx-lx}px), -50%) scale(0)`});
    fin(d, d.animate(fr, {duration:1900, delay:450, easing:"ease-in-out", fill:"backwards"}));
    setTimeout(()=>{ el.animate([{transform:"none"},{transform:"scale(1.12,.72) translateY(14%)", offset:.3},{transform:"scale(1.12,.72) translateY(14%)", offset:.7},{transform:"none"}], {duration:900}); snd([392,523]); }, 950);
    [450, 2250].forEach((t, i)=>setTimeout(()=>burst(i ? rx : lx, y, ["#7FB2FF","#BFE3FF","#fff"], 18, 70, ["💧"]), t));
  } else if (k === "dragon"){
    portal(cx + W*.95, cy, 1, 1200); const d = item(cx + W*.95, cy);
    const fr = [{offset:0, transform:"translate(-50%,-50%) scale(0)"}]; for (let i=0; i<=24; i++){ const t = i/24, an = t*Math.PI*4; fr.push({offset:.05 + t*.65, transform:`translate(calc(-50% + ${(Math.cos(an)-1)*W*.95}px), calc(-50% + ${Math.sin(an)*W*.45}px)) scale(${(.85 + .2*Math.sin(an)).toFixed(2)})`}); }
    fr.push({offset:.95, transform:"translate(-50%,-50%) scale(1)"}); fr.push({offset:1, transform:"translate(-50%,-50%) scale(0)"});
    fin(d, d.animate(fr, {duration:ms}));
    setTimeout(()=>{ snd([110,90,70]); el.animate([{transform:"translateX(0)"},{transform:"translateX(-4%)"},{transform:"translateX(4%)"},{transform:"translateX(0)"}], {duration:160, iterations:5});
      for (let i=0; i<18; i++){ const f = propEl(`<span style="font-size:${18+Math.random()*14}px">🔥</span>`, `left:${cx + W*.95}px; top:${cy - W*.1}px`); f.animate([{transform:"translate(-50%,-50%) scale(.3)", opacity:1},{transform:`translate(calc(-50% + ${W*(.4 + Math.random()*1.2)}px), calc(-50% - ${W*(.5 + Math.random()*1.1)}px)) scale(1.2)`, opacity:0}], {duration:700 + Math.random()*500, delay:i*40, easing:"ease-out", fill:"backwards"}).onfinish = ()=>f.remove(); } }, ms*.72);
  } else if (k === "portal"){
    ms = 3000; const ox = -W*1.1, oy = -W*.9; portal(cx, r.bottom - W*.08, 1.7, 1500); setTimeout(()=>portal(cx + ox, cy + oy + W*.25, 1.5, 1500), 1050);
    el.animate([{transform:"none", opacity:1, offset:0},{transform:"translateY(10%) scale(.9,1.1)", offset:.15},{transform:"translateY(40%) scale(.1,.1)", opacity:0, offset:.35},{transform:`translate(${ox}px, ${oy}px) scale(.1)`, opacity:0, offset:.4},{transform:`translate(${ox}px, ${oy}px) scale(1.1)`, opacity:1, offset:.55},{transform:`translate(${ox*.5}px, ${oy*1.2}px) rotate(-180deg)`, offset:.72},{transform:"translateY(-6%) rotate(-360deg)", offset:.9},{transform:"none", opacity:1}], {duration:ms, easing:"ease-in-out"});
    setTimeout(()=>{ snd([880,440,1320]); burst(cx, r.bottom, cols, 18, 70, [e.ic]); }, 1000); setTimeout(()=>burst(cx + ox, cy + oy, cols, 18, 70), 1600);
  } else if (k === "shield"){
    ms = 3000; portal(cx, r.top - sz*.3, 1, 1000);
    for (let j=0; j<3; j++){ const g = item(cx, cy, .6); const fr = [{offset:0, transform:`translate(-50%, calc(-50% - ${W*.9}px)) scale(0)`}];
      for (let i=0; i<=20; i++){ const t = i/20, an = t*Math.PI*4 + j*2.094; fr.push({offset:.1 + t*.8, transform:`translate(calc(-50% + ${Math.cos(an)*W*.8}px), calc(-50% + ${Math.sin(an)*W*.55}px)) scale(1)`}); }
      fr.push({offset:1, transform:"translate(-50%,-50%) scale(0)"}); fin(g, g.animate(fr, {duration:ms})); }
    el.animate([{filter:"none"},{filter:"drop-shadow(0 0 10px #7FE3FF) drop-shadow(0 0 20px #BFF4FF)", offset:.2},{filter:"drop-shadow(0 0 14px #fff) drop-shadow(0 0 24px #7FE3FF)", offset:.8},{filter:"none"}], {duration:ms});
    snd([1046,1318,1568]); setTimeout(()=>burst(cx, cy, cols, 24, 100), ms - 300);
  } else if (k === "beam"){
    const uy = r.top - W*.85, L = innerWidth; const u = item(cx, uy);
    fin(u, u.animate([{transform:`translate(calc(-50% - ${L*.6}px), calc(-50% - ${W}px)) scale(1) rotate(-15deg)`},{transform:"translate(-50%,-50%) scale(1)", offset:.2},{transform:"translate(-50%,-56%) scale(1) rotate(4deg)", offset:.5},{transform:"translate(-50%,-50%) scale(1) rotate(-4deg)", offset:.78},{transform:`translate(calc(-50% + ${L*.6}px), calc(-50% - ${W}px)) scale(1) rotate(15deg)`}], {duration:ms, easing:"ease-in-out"}));
    const bm = propEl(`<span style="display:block;width:${W*1.1}px;height:${(cy - uy) + W*.55}px;background:linear-gradient(180deg, ${cols[1]}cc, ${(cols[2] || cols[0])}22);clip-path:polygon(40% 0,60% 0,100% 100%,0 100%)"></span>`, `left:${cx}px; top:${uy + sz*.3}px; transform-origin:top`);
    bm.animate([{transform:"translate(-50%,0) scaleY(0)", opacity:0, offset:0},{transform:"translate(-50%,0) scaleY(0)", opacity:0, offset:.22},{transform:"translate(-50%,0) scaleY(1)", opacity:.9, offset:.3},{transform:"translate(-50%,0) scaleY(1)", opacity:.9, offset:.72},{transform:"translate(-50%,0) scaleY(0)", opacity:0, offset:.8},{transform:"translate(-50%,0) scaleY(0)", opacity:0}], {duration:ms}).onfinish = ()=>bm.remove();
    el.animate([{transform:"none", offset:0},{transform:"none", offset:.3},{transform:`translateY(${-W*.55}px) rotate(10deg)`, offset:.5},{transform:`translateY(${-W*.62}px) rotate(-10deg)`, offset:.62},{transform:"none", offset:.76},{transform:"none"}], {duration:ms, easing:"ease-in-out"});
    setTimeout(()=>snd([660,880,660,880]), 900);
  } else if (k === "crown"){
    const hy = r.top + W*.04; portal(cx, r.top - W*.8, 1.3, 1500); const c = item(cx, hy);
    fin(c, c.animate([{transform:`translate(-50%, calc(-50% - ${W*.8}px)) scale(0) rotate(-20deg)`},{transform:`translate(-50%, calc(-50% - ${W*.8}px)) scale(1.2) rotate(10deg)`, offset:.15},{transform:"translate(-50%,-50%) scale(.9)", offset:.35},{transform:"translate(-50%,-62%) scale(.9)", offset:.5},{transform:"translate(-50%,-50%) scale(.9)", offset:.65},{transform:"translate(-50%,-62%) scale(.9)", offset:.8},{transform:"translate(-50%,-50%) scale(0)"}], {duration:ms}));
    setTimeout(()=>{ snd([523,659,784,1046,1318]); }, 1250);
    [1300, 1700, 2100, 2500].forEach((t, i)=>setTimeout(()=>burst(cx + (i % 2 ? 1 : -1)*W*(.6 + i*.15), r.top - W*(.3 + i*.1), cols, 26, 90), t));
  } else { delete el.dataset.emo; return playEmoteCustom(el, Object.assign({}, e, {sum:null})); }
  setTimeout(()=>{ delete el.dataset.emo; }, ms + 50);
}
function playEmoteCustom(el, e){
  if (e && e.sum) return playSummon(el, e);''', 1)

# «Alle Level»: Zimmer-Gegenstände aus Modulen (mit Diplom oder Bedingung) gehören nicht zu einem Level
_a = "ROOM.filter(it=>it.lv === k).map(it=>({kind:\"room\""
assert _a in page, "rewardsAt nicht gefunden"
page = page.replace(_a, "ROOM.filter(it=>it.lv === k && !it.badge && !it.sw).map(it=>({kind:\"room\"", 1)
