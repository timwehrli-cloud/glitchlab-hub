# Wird von build_lab.py ausgeführt (exec), nach overview_patch_portal.py.
# Prestige im Zimmer (Portal): Anzeige beim Level, Prestige-Zeilen unter «Alle Level».

def _prep(a, b):
    global portal
    assert portal.count(a) == 1, "Prestige-Patch: Stelle nicht gefunden: " + a[:60]
    portal = portal.replace(a, b)

_HELP = r'''/* ---- Prestige (ab Level 100, Daten aus js/prestige.js im Glitchlab) ---- */
const prestigeP = () => window.GLAB_P || (()=>{ try { return window.parent !== window && window.parent.GL_PRESTIGE || null; } catch(e){ return null; } })();
function prestigeOfT(T){ const P = prestigeP(); return P ? P.of(T.stars, LIB.LEVELS[99].s) : 0; }
function prestigeSub(T, li){
  const P = prestigeP(); if (!P) return `Level ${li+1} · über 100!`;
  const base = LIB.LEVELS[99].s, p = P.of(T.stars, base);
  if (!p) return `Level ${li+1} · noch ${base + P.STEP - T.stars} ★ bis Prestige I`;
  return `Prestige-Rang ${P.roman(Math.min(p, 10))}${p > 10 ? " ★" + (p - 9) : ""} · Stufe ${((li - 99) % 10) + 1} von 10`;
}
function prestigeRing(T){ const P = prestigeP(), p = prestigeOfT(T); if (!P || !p) return ""; const c = P.RANKS[Math.min(p, 10) - 1].c; return ` style="border-color:${c};box-shadow:0 0 14px ${c}, inset 0 0 8px ${c}"`; }
function prestigeRows(T){
  const P = prestigeP(); if (!P) return "";
  const base = LIB.LEVELS[99].s, have = P.of(T.stars, base);
  return `<li class="pt-lv-row pt-lv-ph"><span class="pt-lv-n">🏆</span><div><b>Prestige</b><small>Ab Level 100 gibt es alle ${P.STEP} Sterne einen neuen Rang. Die Sterne bleiben alle erhalten.</small></div><span aria-hidden="true"></span></li>`
    + P.RANKS.map((R, i)=>{ const k = i + 1, got = have >= k, cls = got ? "done" : k === have + 1 ? "cur" : "next";
      const gifts = [`<span class="pt-gift"><i>${R.ic}</i>Hintergrund «${esc(R.bg.n)}»</span>`, `<span class="pt-gift"><i>${R.dip.emoji}</i>Diplom</span>`,
        `<span class="pt-gift"><i>${R.emote.ic}</i>Emote «${esc(R.emote.n)}»</span>`, `<span class="pt-gift"><i class="glitch">${LIB.glitchSVG("normal", {outfit:{skin:"ps_" + k}})}</i>Skin «${esc(R.skin.n)}»</span>`];
      return `<li class="pt-lv-row pt-lv-pp ${cls}" style="--pc:${R.c}"><span class="pt-lv-n">${P.roman(k)}</span><div><b>${esc(P.label(k))}</b><small>ab ${base + k * P.STEP} ★</small><div class="pt-gifts">${gifts.join("")}</div></div><span aria-hidden="true">${got ? "✓" : cls === "cur" ? "★" : "🔒"}</span></li>`; }).join("")
    + `<li class="pt-lv-row pt-lv-ph"><span class="pt-lv-n">X+</span><div><b>Und danach?</b><small>Alle weiteren ${P.STEP} Sterne gibt es einen Zusatzstern: Regenbogen ★2, ★3 …</small></div><span aria-hidden="true">✨</span></li>`;
}
(function(){ if (document.getElementById("ppCss")) return; const st = document.createElement("style"); st.id = "ppCss";
  st.textContent = ".pt-lv-pp{border-left:4px solid var(--pc)!important}.pt-lv-pp .pt-lv-n{background:var(--pc)!important;color:#14062E!important}.pt-lv-ph{background:rgba(255,194,26,.1)!important}.pt-lv-ph b{color:#FFC21A}";
  (document.head || document.documentElement).appendChild(st); })();
'''
_a = "/* ---- Alle Level ---- */"
assert _a in portal
portal = portal.replace(_a, _HELP + _a, 1)

_prep('<span class="pt-ring">${li+1}</span><div><span>${li < 100 ? `Level ${li+1} von 100` : `Level ${li+1} · über 100!`}</span>',
      '<span class="pt-ring"${prestigeRing(T)}>${li+1}</span><div><span>${li < 100 ? `Level ${li+1} von 100` : prestigeSub(T, li)}</span>')
_prep('${L.map((l,k)=>{', '${L.slice(0, 100).map((l,k)=>{')
_prep('}).join("")}${LV_TEASER}', '}).join("")}${prestigeRows(T)}')
_prep('Danach geht es offen weiter: alle 30 Sterne ein Level.', 'Danach beginnt Prestige: alle 300 Sterne ein neuer Rang (I bis X) mit animiertem Hintergrund, Diplom, Beschwörungs-Emote und animiertem Skin.')
