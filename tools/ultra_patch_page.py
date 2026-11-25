# Ultra-Prestige (Rang 11–20): Blitze und Spezialeffekte.
# Patcht lab/index.html (CSS, neue Beschwörungs-Emotes) und lab/hub-portal.js (Anzeigen bis Rang 20).
# Wird von build_lab.py ausgeführt (nach prestige_patch_page.py); läuft auch direkt: python3 tools/ultra_patch_page.py
# Idempotent.
import pathlib as _pl

_UR = _pl.Path(__file__).resolve().parent.parent if "__file__" in globals() else _pl.Path.cwd()

def _ultra_css():
    s = (_UR / "css" / "style.css").read_text(encoding="utf-8")
    return s[s.index("/* ---------- Ultra-Prestige: Blitze und Spezialeffekte"):]

_SUMMON = r'''  } else if (k === "zap" || k === "storm" || k === "ultra"){
    /* Ultra-Prestige: Blitze schlagen ein (zap: 3 Blitze, storm: Gewitterwolke, ultra: Regenbogen-Blitze + Krone) */
    ms = k === "zap" ? 2400 : 3800;
    const bw = Math.max(22, W*.4);
    const boltSVG = (h, c) => { const p = [[bw/2, 0]]; for (let i=1; i<=7; i++) p.push([i === 7 ? bw/2 : bw/2 + (i % 2 ? -1 : 1)*bw*(.15 + Math.random()*.3), h*i/7]);
      const d = "M" + p.map(q=>q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L");
      return `<svg width="${bw}" height="${h}" viewBox="0 0 ${bw} ${h}" style="display:block;overflow:visible"><path d="${d}" stroke="${c}" stroke-width="9" opacity=".3" fill="none" stroke-linejoin="round"/><path d="${d}" stroke="${c}" stroke-width="3.6" fill="none" stroke-linejoin="round"/><path d="${d}" stroke="#fff" stroke-width="1.3" fill="none" stroke-linejoin="round"/></svg>`; };
    const flash = c => { const f = propEl("", `left:0; top:0; width:100vw; height:100vh; background:${c}`); fin(f, f.animate([{opacity:0},{opacity:.3, offset:.12},{opacity:0, offset:.4},{opacity:.18, offset:.55},{opacity:0}], {duration:380})); };
    const strike = (x, yTop, yEnd, c, t) => setTimeout(()=>{ const b = propEl(boltSVG(Math.max(30, yEnd - yTop), c), `left:${x}px; top:${yTop}px; transform:translateX(-50%)`);
      fin(b, b.animate([{opacity:0},{opacity:1, offset:.06},{opacity:.15, offset:.2},{opacity:1, offset:.32},{opacity:0}], {duration:460})); flash(c); burst(x, yEnd, cols, 10, 60); snd([110, 70, 55]); }, t);
    const top = Math.max(0, r.top - W*1.3), ground = r.bottom - W*.08;
    if (k === "zap"){
      strike(cx - W*.75, top, ground, cols[0], 250); strike(cx + W*.8, top, ground, cols[2] || cols[0], 800); strike(cx, top, r.top + W*.1, cols[0], 1400);
      setTimeout(()=>{ el.animate([{transform:"none", filter:"none"},{transform:"translate(-4px,0)", filter:`brightness(2) drop-shadow(0 0 12px ${cols[0]})`},{transform:"translate(4px,-3px)"},{transform:"translate(-3px,1px)", filter:`brightness(1.6) drop-shadow(0 0 8px ${cols[0]})`},{transform:"translate(2px,0)"},{transform:"none", filter:"none"}], {duration:700}); burst(cx, r.top, cols, 22, 90, ["⚡"]); }, 1450);
    } else {
      const cy0 = top + W*.25; portal(cx, cy0, 1.4, 1200); const cl = k === "ultra" ? propEl(`<span style="font-size:${sz*1.25}px;line-height:1;display:block">⛈️</span>`, `left:${cx}px; top:${cy0}px; transform:translate(-50%,-50%) scale(0)`) : item(cx, cy0, 1.25);
      fin(cl, cl.animate([{transform:"translate(-50%,-50%) scale(0)"},{transform:"translate(-50%,-50%) scale(1.15)", offset:.12},{transform:"translate(calc(-50% - 6px),-50%) scale(1)", offset:.4},{transform:"translate(calc(-50% + 6px),-50%) scale(1)", offset:.7},{transform:"translate(-50%,-50%) scale(0)"}], {duration:ms}));
      const N = k === "ultra" ? 7 : 5;
      for (let i=0; i<N; i++){ const x = cx + (i % 2 ? 1 : -1)*W*(.35 + (i*.37 % 1.1)); strike(x, cy0 + W*.25, ground, k === "ultra" ? cols[i % cols.length] : cols[i % 2 ? 1 : 0], 500 + i*330); }
      for (let i=0; i<26; i++) setTimeout(()=>{ const d = propEl(`<span style="display:block;width:2px;height:${W*.18}px;background:${cols[0]};opacity:.7;border-radius:2px"></span>`, `left:${cx + (Math.random() - .5)*W*1.9}px; top:${cy0 + W*.25}px`);
        fin(d, d.animate([{transform:"translateY(0)", opacity:.8},{transform:`translateY(${ground - cy0}px)`, opacity:.2}], {duration:700, easing:"ease-in"})); }, 400 + i*90);
      if (k === "ultra"){ setTimeout(()=>{ const c = propEl(`<span style="font-size:${sz*.8}px;line-height:1;display:block">👑</span>`, `left:${cx}px; top:${r.top + W*.02}px; transform:translate(-50%,-50%)`);
          fin(c, c.animate([{transform:`translate(-50%, calc(-50% - ${W}px)) scale(0) rotate(-30deg)`},{transform:"translate(-50%,-50%) scale(1.2) rotate(8deg)", offset:.3},{transform:"translate(-50%,-50%) scale(1)", offset:.45},{transform:"translate(-50%,-50%) scale(1)", offset:.9},{transform:"translate(-50%,-50%) scale(0)"}], {duration:1700}));
          snd([523,659,784,1046,1318,1568]); [0, 300, 600].forEach(t=>setTimeout(()=>burst(cx + (Math.random() - .5)*W*1.4, r.top - W*.2, cols, 26, 100, ["⚡","✨"]), t)); }, 2300); }
    }
  } else if (k === "laser"){
    /* Laser aus den Augen, die quer durchs Bild schwenken */
    ms = 2800; const ey = r.top + r.height*.42, L = Math.hypot(innerWidth, innerHeight);
    [[-1, cols[0]], [1, cols[1] || cols[0]]].forEach(([s, c], j)=>{ const b = propEl(`<span style="display:block;width:${L}px;height:4px;border-radius:4px;background:linear-gradient(90deg, #fff, ${c} 6%, ${c}00);box-shadow:0 0 10px ${c}, 0 0 22px ${c}"></span>`, `left:${cx + s*W*.12}px; top:${ey}px; transform-origin:0 50%`);
      const a0 = s < 0 ? 180 : 0; fin(b, b.animate([{transform:`rotate(${a0 + 20*s}deg) scaleX(0)`},{transform:`rotate(${a0 + 20*s}deg) scaleX(1)`, offset:.12},{transform:`rotate(${a0 - 25*s}deg) scaleX(1)`, offset:.45},{transform:`rotate(${a0 + 30*s}deg) scaleX(1)`, offset:.8},{transform:`rotate(${a0}deg) scaleX(0)`}], {duration:ms, easing:"ease-in-out"})); });
    [0, 500, 1000, 1500, 2000].forEach((t, i)=>setTimeout(()=>{ snd([1400 - i*120, 700]); burst(cx + (i % 2 ? 1 : -1)*W*(1 + i*.2), ey + (Math.random() - .5)*W, cols, 8, 50); }, t));
  } else if (k === "nova"){
    /* Druckwellen: gLiTCh lädt sich auf und explodiert in Ringen */
    ms = 3000;
    el.animate([{transform:"none", filter:"none"},{transform:"scale(.9)", filter:`brightness(1.4) drop-shadow(0 0 8px ${cols[0]})`, offset:.3},{transform:"scale(1.25)", filter:`brightness(2.4) drop-shadow(0 0 22px ${cols[0]})`, offset:.42},{transform:"scale(1)", filter:"brightness(1.2)", offset:.6},{transform:"none", filter:"none"}], {duration:ms});
    setTimeout(()=>{ snd([200, 150, 100, 80]); const f = propEl("", `left:0; top:0; width:100vw; height:100vh; background:radial-gradient(circle at ${cx}px ${cy}px, #fff, ${cols[0]}66 30%, transparent 60%)`); fin(f, f.animate([{opacity:0},{opacity:.85, offset:.15},{opacity:0}], {duration:700}));
      [0, 180, 360].forEach((t, i)=>setTimeout(()=>{ const ring = propEl(`<span style="display:block;width:${W}px;height:${W}px;border-radius:50%;border:${4 - i}px solid ${cols[i % cols.length]};box-shadow:0 0 16px ${cols[i % cols.length]}"></span>`, `left:${cx}px; top:${cy}px`);
        fin(ring, ring.animate([{transform:"translate(-50%,-50%) scale(.2)", opacity:1},{transform:"translate(-50%,-50%) scale(5)", opacity:0}], {duration:1100, easing:"ease-out"})); }, t));
      burst(cx, cy, cols, 30, 130, [e.ic, "✨"]); }, 1250);
  } else if (k === "vortex"){
    /* Schwarzes Loch: saugt gLiTCh ein und spuckt ihn wieder aus */
    ms = 3600; const hx = cx + W*1.05, hy = cy;
    const h = propEl(`<span style="display:block;width:${W*.9}px;height:${W*.9}px;border-radius:50%;background:radial-gradient(circle, #000 34%, ${cols[0]} 46%, ${cols[1] || cols[0]} 58%, transparent 70%);box-shadow:0 0 24px ${cols[0]}"></span>`, `left:${hx}px; top:${hy}px`);
    fin(h, h.animate([{transform:"translate(-50%,-50%) scale(0) rotate(0)"},{transform:"translate(-50%,-50%) scale(1) rotate(200deg)", offset:.15},{transform:"translate(-50%,-50%) scale(1.15) rotate(900deg)", offset:.7},{transform:"translate(-50%,-50%) scale(0) rotate(1300deg)"}], {duration:ms}));
    el.animate([{transform:"none", opacity:1, offset:0},{transform:"none", offset:.15},{transform:`translate(${W*.6}px, 0) rotate(-200deg) scale(.6)`, offset:.32},{transform:`translate(${W*1.05}px, 0) rotate(-720deg) scale(0)`, opacity:0, offset:.45},{transform:`translate(${-W*1.2}px, 0) scale(0)`, opacity:0, offset:.62},{transform:`translate(${-W*.4}px, 0) rotate(360deg) scale(1.15)`, opacity:1, offset:.78},{transform:"none", opacity:1}], {duration:ms, easing:"ease-in-out"});
    setTimeout(()=>snd([300, 240, 180, 120, 90]), 500); setTimeout(()=>{ burst(cx - W*1.2, cy, cols, 20, 90, ["✨"]); snd([880, 1320]); }, ms*.62);
'''

def ultra_patch(page):
    if "/* ---------- Ultra-Prestige: Blitze und Spezialeffekte" not in page:
        page = page.replace("</style>", _ultra_css() + "\n</style>", 1)
    if ".pt-lv-ultra{" not in page:
        page = page.replace("</style>", ".pt-lv-ultra{background:linear-gradient(90deg, rgba(255,225,77,.2), rgba(0,229,255,.12))!important}.pt-lv-ultra b{color:#FFE14D}\n</style>", 1)
    if 'k === "vortex"' not in page:
        a = '  } else { delete el.dataset.emo; return playEmoteCustom(el, Object.assign({}, e, {sum:null})); }'
        assert a in page, "playSummon-Ende nicht gefunden"
        page = page.replace(a, _SUMMON + a, 1)
        page = page.replace('if (k === "ride" || k === "dragon" || k === "beam" || k === "crown") ms = 3600;', 'if (k === "ride" || k === "dragon" || k === "beam" || k === "crown") ms = 3600;\n  if (k === "storm" || k === "ultra" || k === "vortex") ms = 3800;', 1)
    return page

def ultra_portal(js):
    js = js.replace('return `Prestige-Rang ${P.roman(Math.min(p, 10))}${p > 10 ? " ★" + (p - 9) : ""} · Stufe',
                    'return `${P.rankTxt ? P.rankTxt(p) : "Prestige-Rang " + P.roman(Math.min(p, 10))} · Stufe', 1)
    js = js.replace("const c = P.RANKS[Math.min(p, 10) - 1].c;", "const c = P.RANKS[Math.min(p, P.RANKS.length) - 1].c;", 1)
    if "pt-lv-ultra" not in js:
        js = js.replace('return `<li class="pt-lv-row pt-lv-pp ${cls}" style="--pc:${R.c}"><span class="pt-lv-n">${P.roman(k)}</span>',
            'return (k === 11 ? `<li class="pt-lv-row pt-lv-ph pt-lv-ultra"><span class="pt-lv-n">⚡</span><div><b>Ultra-Prestige</b><small>Nach Prestige X geht es weiter: 10 Ultra-Ränge mit Blitzen und Spezialeffekten, wieder alle ${P.STEP} Sterne einer.</small></div><span aria-hidden="true"></span></li>` : "")'
            ' + `<li class="pt-lv-row pt-lv-pp ${cls}" style="--pc:${R.c}"><span class="pt-lv-n">${P.num ? P.num(k) : P.roman(k)}</span>', 1)
        js = js.replace('<span class="pt-lv-n">X+</span><div><b>Und danach?</b><small>Alle weiteren ${P.STEP} Sterne gibt es einen Zusatzstern: Regenbogen ★2, ★3 …</small>',
            '<span class="pt-lv-n">${P.RANKS.length > 10 ? "UX+" : "X+"}</span><div><b>Und danach?</b><small>Alle weiteren ${P.STEP} Sterne gibt es einen Zusatzstern: ${esc(P.RANKS[P.RANKS.length - 1].n)} ★2, ★3 …</small>', 1)
        js = js.replace("alle 300 Sterne ein neuer Rang (I bis X) mit animiertem Hintergrund",
                        "alle 300 Sterne ein neuer Rang (Prestige I bis X, danach Ultra-Prestige I bis X mit Blitzen und Spezialeffekten) mit animiertem Hintergrund", 1)
    return js

if "page" in globals():
    page = ultra_patch(page)
    _pp = _pl.Path(globals().get("out_dir", _UR / "lab")) / "hub-portal.js"
    if _pp.exists(): _pp.write_text(ultra_portal(_pp.read_text(encoding="utf-8")), encoding="utf-8")
elif __name__ == "__main__":
    for name, fn in (("index.html", ultra_patch), ("hub-portal.js", ultra_portal)):
        p = _UR / "lab" / name
        p.write_text(fn(p.read_text(encoding="utf-8")), encoding="utf-8")
    print("ok")
