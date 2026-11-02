# Wird von build_lab.py ausgeführt (exec), bevor hub-portal.js geschrieben wird.
# Extras aus hochgeladenen Modulen der Lehrperson (Outfits, Emotes, Zimmer, Hintergründe) einbauen.
def urep(a, b, count=1):
    global portal
    n = portal.count(a); assert n == count, f"{n}x statt {count}: {a[:70]!r}"
    portal = portal.replace(a, b)

# 1) Daten vom Glitchlab übernehmen
urep("const ctx = HB ? HB.context(curMod) : null;\n",
'''const ctx = HB ? HB.context(curMod) : null;
/* Extras aus hochgeladenen Modulen (vom Glitchlab geliefert). Jedes Extra hat ein «badge»: das bekommt man, wenn die Bedingung im Modul erfüllt ist. */
const CU = window.GLAB_CUSTOM = Object.assign({outfits:[], emotes:[], room:[], bgs:[], dips:[], mods:[]}, (ctx && ctx.custom) || {});
/* Hochgeladene Module erscheinen in der Diplom-Übersicht (ihre Diplome hängen an der Wand wie alle anderen) */
CU.mods.forEach(m=>{ if (!MODULES.some(x=>x.id === m.id)) MODULES.push({id:m.id, n:m.n, d:"", c:m.c || "#8B5CFF", c2:"#1A0B3A", live:false, i:`<text x="12" y="13" font-size="15" text-anchor="middle" dominant-baseline="central" stroke="none" fill="currentColor">${String(m.emoji || "🧩").replace(/[<>&"]/g, "")}</text>`}); });
const dipArt = (emoji, c) => `<svg viewBox="0 0 40 32" aria-hidden="true"><rect x="1" y="1" width="38" height="30" rx="2" fill="#8B5A2B"/><rect x="3" y="3" width="34" height="26" fill="#FFF8E7"/><rect x="3" y="3" width="34" height="5" fill="${c}"/><text x="20" y="18.5" font-size="11" text-anchor="middle" dominant-baseline="central">${String(emoji || "🏅").replace(/[<>&"]/g, "")}</text><rect x="9" y="25" width="22" height="1.2" fill="#C9B79A"/><circle cx="33" cy="25" r="2.6" fill="#FFC21A" stroke="#C98A00" stroke-width=".6"/></svg>`;
''')
urep('window.GLAB_ROOMBG = (ctx && ctx.extras && ctx.extras.bg === "chalet") ? "chalet" : "pixel";',
     'window.GLAB_ROOMBG = (ctx && ctx.extras && (ctx.extras.bg === "chalet" || CU.bgs.some(b=>b.id === ctx.extras.bg))) ? ctx.extras.bg : "pixel";')
# 2) Emotes + Zimmer-Gegenstände in die Listen des Labs schieben
urep("const emoteOpen = (x, T) =>",
'''if (window.GLAB_R){
  CU.emotes.forEach(e=>{ if (!window.GLAB_R.EMOTES.some(x=>x.id === e.id)) window.GLAB_R.EMOTES.push({id:e.id, n:e.n, d:e.d || "", ic:e.ic || "✨", lv:9999, req: e.badge ? {badge:e.badge, mod:e.mod, txt:e.reqTxt} : null}); });
  CU.room.forEach(r=>{ if (!window.GLAB_R.ROOM.some(x=>x.id === r.id)) window.GLAB_R.ROOM.push({id:r.id, slot:r.slot, n:r.n, lv:0, box:r.box, svg:r.svg, badge:r.badge || null, reqTxt:r.reqTxt || ""}); });
}
const roomOpen = (x, li) => x.badge ? totalsFor(D.me).badges.has(x.badge) : x.lv <= li;
const bgOpen = (b, T) => !b.badge || T.badges.has(b.badge);
const emoteOpen = (x, T) =>''')
urep('const emoteReq = x => x.req ? `Modul «${x.req.mod}» schaffen` : "von Anfang an";',
     'const emoteReq = x => x.req ? (x.req.txt || `Modul «${x.req.mod}» schaffen`) : "von Anfang an";')
# 3) Outfits: in die Original-Liste (die zeichnet gLiTCh)
urep("function withFN(lib){\n", '''function withFN(lib){
  if (lib.OUTFITS && !lib.OUTFITS.__cu){ lib.OUTFITS.__cu = 1; CU.outfits.forEach(o=>{ if (!lib.OUTFITS.some(x=>x.id === o.id)) lib.OUTFITS.push({id:o.id, slot:o.slot, n:o.n, say:o.say || "", lv:0, svg:o.svg, badge:o.badge || null, reqTxt:o.reqTxt || ""}); }); }
''')
urep("  return Object.assign({}, lib, {BADGES, outfitReq, OUTFITS: lib.OUTFITS.slice()});",
     "  CU.dips.forEach(b=>{ if (!BADGES.some(x=>x.id === b.id)) BADGES.push({id:b.id, n:b.n, d:b.d || `Aus dem Modul «${b.mod}».`, mod:b.modId, art:dipArt(b.emoji, b.c)}); });\n  return Object.assign({}, lib, {BADGES, outfitReq, OUTFITS: lib.OUTFITS.slice()});")
urep("const outfitReq = x => { if (x.badge){", "const outfitReq = x => { if (x.reqTxt) return x.reqTxt; if (x.badge){")
# 4) Zimmer: Freischaltung über Badge statt Level
portal = portal.replace("li >= x.lv", "roomOpen(x, li)")
urep("  if (li < x.lv){ const b = ov.querySelector(`[data-pt-room=\"${id}\"]`);", "  if (!roomOpen(x, li)){ const b = ov.querySelector(`[data-pt-room=\"${id}\"]`);")
urep("`ab Level ${x.lv+1}`}</small>${open ? \"\" : '<span class=\"wd-lock\" aria-hidden=\"true\"></span>'}</button>`;\n    }).join(\"\")}</div></details>`",
     "(x.reqTxt ? esc(x.reqTxt) : `ab Level ${x.lv+1}`)}</small>${open ? \"\" : '<span class=\"wd-lock\" aria-hidden=\"true\"></span>'}</button>`;\n    }).join(\"\")}</div></details>`")
# 5) Hintergründe
urep('''${b("chalet", "🏔️ Schweizer Chalet", chalet, "nach dem ersten NMG-Modul (Alte Eidgenossenschaft)")}</div></div>`;''',
     '''${b("chalet", "🏔️ Schweizer Chalet", chalet, "nach dem ersten NMG-Modul (Alte Eidgenossenschaft)")}${CU.bgs.map(x=>b(x.id, esc((x.ic ? x.ic + " " : "") + x.n), bgOpen(x, T), esc(x.reqTxt || ""))).join("")}</div></div>`;''')
urep('''  window.GLAB_ROOMBG = id; saveD();''', '''  const cb = CU.bgs.find(x=>x.id === id);
  if (cb && !bgOpen(cb, T)){ const el = document.querySelector(`[data-pt="bg-${id}"]`); if (el) el.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  if (id !== "pixel" && id !== "chalet" && !cb) return;
  window.GLAB_ROOMBG = id; saveD();''')
urep('''  if (a === "bg-pixel" || a === "bg-chalet"){ return pickBg(a.slice(3)); }''', '''  if (a && a.startsWith("bg-")){ return pickBg(a.slice(3)); }''')

# Fenster-Erkennung robuster: nur sichtbare Fenster zählen, auch versteckte/umgestylte erkennen, plus Sicherheits-Takt
urep('''  const check = ()=>{ const now = !!document.querySelector("body > .wd-ov, body > .pt-ov"); if (now !== open){ open = now; try { HB.overlay && HB.overlay(now); } catch(e){} } };
  new MutationObserver(check).observe(document.body, {childList:true});''', '''  const visible = el => !el.hidden && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
  const check = ()=>{ const now = [...document.querySelectorAll("body > .wd-ov, body > .pt-ov")].some(visible); if (now !== open){ open = now; try { HB.overlay && HB.overlay(now); } catch(e){} } };
  new MutationObserver(check).observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:["hidden","style","class"]});
  setInterval(check, 1500);
  /* Escape schliesst jedes offene Fenster */
  document.addEventListener("keydown", e=>{ if (e.key !== "Escape") return; const ov = [...document.querySelectorAll("body > .wd-ov, body > .pt-ov")].filter(visible).pop(); if (!ov) return;
    const x = ov.querySelector('[data-pt$="-close"], [data-gl-lex="close"]'); if (x) x.click(); else ov.remove(); setTimeout(check, 50); });''')
