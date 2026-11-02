/* =====================================================================
   gLiTCh · Diplome als Gegenstände an der Wand (20 × 20, ohne Hintergrund)
   Gleicher Stil wie die Diplome der NMG- und M&I-Module im gLiTCh-Lab.
   GLWall.svg(art, emoji, farbe) → SVG-Text. art: siehe GLWall.KINDS
   ===================================================================== */
window.GLWall = window.GLWall || (function () {
  const NAIL = '<circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>';
  const STR = (a, b, y) => `<path d="M${a} ${y}L10 1.2L${b} ${y}" stroke="#3A2410" stroke-width=".35" fill="none"/>`;
  const SHELF = '<rect x="2.4" y="16" width="15.2" height="1.3" rx=".3" fill="#8B5A2B"/><path d="M4.4 17.3l1.4 1.6M15.6 17.3l-1.4 1.6" stroke="#5D3A1A" stroke-width=".6"/>';
  const clean = e => String(e || "🏅").replace(/[<>&"']/g, "").slice(0, 8) || "🏅";
  const col = c => /^#[0-9a-f]{6}$/i.test(String(c || "")) ? c : "#7B4CEF";
  const mix = (c, t, f) => "#" + [1, 3, 5].map(i => { const v = parseInt(c.slice(i, i + 2), 16); return Math.round(v + (t - v) * f).toString(16).padStart(2, "0"); }).join("");
  const dk = c => mix(c, 0, .38), lt = (c, f = .8) => mix(c, 255, f);
  const em = (e, x, y, s) => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="central">${e}</text>`;
  const spark = (x, y, d) => `<path class="wl-flake" style="animation-delay:-${d}s" d="M${x} ${y - .9}v1.8M${x - .9} ${y}h1.8" stroke="#FFF3B0" stroke-width=".35"/>`;
  const star = (cx, cy, ro, ri) => "M" + Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + Math.PI * k / 5, r = k % 2 ? ri : ro; return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`; }).join("L") + "z";
  const K = {
    rahmen: (e, c) => STR(4, 16, 5) + `<rect x="2.5" y="5" width="15" height="13" rx=".6" fill="#7A4A22"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="${lt(c)}"/><rect x="3.6" y="14.6" width="12.8" height="2.3" fill="${lt(c, .55)}"/><g class="wl-fly">${em(e, 10, 11, 6.2)}</g>` + NAIL,
    wimpel: (e, c) => `<path d="M10 1.2V3" stroke="#3A2410" stroke-width=".4"/><g class="wl-sway"><rect x="2.4" y="2.6" width="15.2" height="1.1" rx=".55" fill="#8B5A2B"/><path d="M3.2 3.7h13.6L10 18.8z" fill="${c}" stroke="${dk(c)}" stroke-width=".4"/><path d="M4.6 5.2h10.8" stroke="${lt(c, .5)}" stroke-width=".5"/>${em(e, 10, 8.8, 5)}</g>` + NAIL,
    schild: (e, c) => STR(6, 14, 4.6) + `<g class="wl-sway"><path d="M10 4.4l5.6 2v4.2c0 3.8-2.7 6.1-5.6 7.3-2.9-1.2-5.6-3.5-5.6-7.3V6.4z" fill="${c}" stroke="${dk(c)}" stroke-width=".45"/><path d="M10 5.5l4.3 1.6v3.5c0 3-2 4.8-4.3 5.8z" fill="${lt(c, .25)}"/>${em(e, 10, 10.8, 5.2)}</g>` + NAIL,
    pokal: (e, c) => SHELF + `<path d="M6.2 4.2h7.6v3.6c0 2.6-1.7 4.2-3.8 4.2s-3.8-1.6-3.8-4.2z" fill="#F2C94C" stroke="#8B6914" stroke-width=".35"/><path d="M6.2 5.4H4.6c0 2 .8 3 2 3.2M13.8 5.4h1.6c0 2-.8 3-2 3.2" stroke="#C9A227" stroke-width=".55" fill="none"/><rect x="9.3" y="12" width="1.4" height="1.8" fill="#C9A227"/><rect x="7" y="13.8" width="6" height="2.2" rx=".3" fill="${dk(c)}"/>${em(e, 10, 7.7, 3.8)}` + spark(4.2, 3.2, 0) + spark(15.8, 10.6, 1),
    medaille: (e, c) => `<g class="wl-sway"><path d="M10 1.2 5.8 9.6h2.6L10 5.2z" fill="${c}"/><path d="M10 1.2l4.2 8.4h-2.6L10 5.2z" fill="${dk(c)}"/><circle cx="10" cy="13.4" r="5.2" fill="#F2C94C" stroke="#8B6914" stroke-width=".5"/><circle cx="10" cy="13.4" r="4" fill="#FFE680" stroke="#C98A00" stroke-width=".3"/>${em(e, 10, 13.6, 4.6)}<path class="wl-glow" d="M6.6 11.2a4.2 4.2 0 0 1 2-2" stroke="#fff" stroke-width=".6" fill="none"/></g>` + NAIL,
    rolle: (e, c) => STR(5, 15, 4) + `<rect x="4" y="4" width="12" height="13" fill="#F1E2BC" stroke="#B89A5E" stroke-width=".4"/><rect x="3.4" y="3.2" width="13.2" height="1.8" rx=".9" fill="#D9C28E"/><rect x="3.4" y="16.2" width="13.2" height="1.8" rx=".9" fill="#D9C28E"/>${em(e, 10, 9.4, 4.6)}<path d="M6 13h8" stroke="#6B4A2B" stroke-width=".45"/><path d="M13.4 17.4v1.4" stroke="${dk(c)}" stroke-width=".5"/><circle class="wl-sway" cx="13.4" cy="18.9" r="1.2" fill="${c}"/>` + NAIL,
    holz: (e, c) => `<g class="wl-sway">` + STR(5, 15, 6.2) + `<rect x="2.6" y="6.2" width="14.8" height="9.4" rx="1" fill="#C68A4E" stroke="#7A4A22" stroke-width=".5"/><path d="M3.6 8.4h12.8M3.6 13.4h12.8" stroke="#A86F38" stroke-width=".3"/><rect x="2.6" y="14.2" width="14.8" height="1.4" fill="${c}"/>${em(e, 10, 10.6, 5)}</g>` + NAIL,
    stern: (e, c) => STR(6, 14, 4) + `<g class="wl-sway"><path d="${star(10, 11, 7.4, 3.4)}" fill="${c}" stroke="${dk(c)}" stroke-width=".45"/><path d="${star(10, 11, 5.6, 2.6)}" fill="${lt(c, .35)}"/>${em(e, 10, 11.4, 4.2)}</g>` + spark(3.4, 5.4, .4) + spark(16.4, 16, 1.2) + NAIL
  };
  const KINDS = [["rahmen", "Bilderrahmen"], ["wimpel", "Wimpel"], ["schild", "Wappenschild"], ["pokal", "Pokal"], ["medaille", "Medaille"], ["rolle", "Urkunde"], ["holz", "Holzschild"], ["stern", "Stern"]];
  const pick = id => { let h = 0; String(id || "").split("").forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; }); return KINDS[h % KINDS.length][0]; };
  const svg = (art, emoji, c, id) => `<svg viewBox="0 0 20 20" aria-hidden="true" class="wl-art">${(K[art] || K[pick(id || emoji)])(clean(emoji), col(c))}</svg>`;
  const CSS = ".wl-sway{transform-box:fill-box;transform-origin:50% 0;animation:wlSway 3.2s ease-in-out infinite}.wl-wave{transform-box:fill-box;transform-origin:0 50%;animation:wlWave 1.6s ease-in-out infinite}.wl-fly{animation:wlFly 3s ease-in-out infinite}.wl-flake{animation:wlFlake 2.6s linear infinite}.wl-glow{animation:wlGlow 2.2s ease-in-out infinite}"
    + "@keyframes wlSway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}@keyframes wlWave{0%,100%{transform:skewY(0) scaleX(1)}50%{transform:skewY(-5deg) scaleX(.93)}}@keyframes wlFly{50%{transform:translateY(-.8px)}}@keyframes wlFlake{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0}}@keyframes wlGlow{0%,100%{opacity:1}50%{opacity:.35}}"
    + "@media (prefers-reduced-motion: reduce){.wl-sway,.wl-wave,.wl-fly,.wl-flake,.wl-glow{animation:none}}";
  try { if (!window.GLWALL_NOCSS && !document.getElementById("glWallCss")) { const st = document.createElement("style"); st.id = "glWallCss"; st.textContent = CSS; (document.head || document.documentElement).appendChild(st); } } catch (e) { /* ohne DOM */ }
  return { svg, KINDS, pick, CSS };
})();
