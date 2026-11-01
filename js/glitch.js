/* =====================================================================
   gLiTCh · das Maskottchen (gleiche Pixel wie im gLiTCh-Lab)
   GLGlitch.svg(mood, color) liefert das Bild als SVG-Text.
   Stimmungen: normal, happy, wink, cool, shock, hmm, love, sleep, sad
   ===================================================================== */
(function () {
  const BODY = [
    "..##......##..",
    "...#......#...",
    "...########...",
    "..##########..",
    ".############.",
    ".############.",
    "##############",
    "##############",
    "##############",
    ".############.",
    ".############.",
    "..##########..",
    "..#.##..##.#..",
    "..#..#..#..#.."
  ];
  const RECTS = [];
  BODY.forEach((row, y) => { let x = 0; while (x < row.length) { if (row[x] === "#") { let w = 1; while (row[x + w] === "#") w++; RECTS.push([x, y, w]); x += w; } else x++; } });
  const body = fill => RECTS.map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="1"${fill ? ` fill="${fill(y)}"` : ""}/>`).join("");
  const W = "#fff", K = "#14062E";
  const r = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
  const EYES = {
    normal: r(3, 5, 2, 2, W) + r(9, 5, 2, 2, W) + r(4, 6, 1, 1, K) + r(10, 6, 1, 1, K),
    happy: r(3, 6, 1, 1, W) + r(4, 5, 1, 1, W) + r(5, 6, 1, 1, W) + r(8, 6, 1, 1, W) + r(9, 5, 1, 1, W) + r(10, 6, 1, 1, W),
    shock: r(3, 4, 3, 3, W) + r(8, 4, 3, 3, W) + r(4, 5, 1, 1, K) + r(9, 5, 1, 1, K),
    wink: r(3, 5, 2, 2, W) + r(4, 6, 1, 1, K) + r(8, 6, 3, 1, W),
    cool: r(2, 5, 10, 1, K) + r(3, 5, 3, 2, K) + r(8, 5, 3, 2, K) + r(3, 5, 1, 1, "#00E5FF") + r(8, 5, 1, 1, "#FF2BD6"),
    sleep: r(3, 6, 2, 1, W) + r(9, 6, 2, 1, W),
    sad: r(3, 6, 2, 2, W) + r(9, 6, 2, 2, W) + r(3, 7, 1, 1, K) + r(10, 7, 1, 1, K) + r(2, 5, 2, 1, K) + r(10, 5, 2, 1, K)
  };
  const MOUTH = {
    smile: r(4, 9, 1, 1, K) + r(9, 9, 1, 1, K) + r(5, 10, 4, 1, K),
    grin: r(4, 9, 6, 2, K) + r(5, 9, 4, 1, W),
    o: r(6, 9, 2, 2, K),
    smirk: r(5, 10, 3, 1, K) + r(8, 9, 1, 1, K),
    flat: r(5, 10, 4, 1, K),
    small: r(6, 10, 2, 1, K),
    sad: r(5, 9, 4, 1, K) + r(4, 10, 1, 1, K) + r(9, 10, 1, 1, K)
  };
  const MOOD = { normal: ["normal", "smile"], happy: ["happy", "grin"], shock: ["shock", "o"], wink: ["wink", "smirk"], cool: ["cool", "grin"], hmm: ["normal", "flat"], love: ["happy", "smile"], sleep: ["sleep", "small"], sad: ["sad", "sad"] };

  /* Farbtöne aus einer Grundfarbe ableiten (für Kinder-Avatare) */
  function shades(hex) {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
    const mix = (t, f) => "#" + c.map(v => Math.round(v + (t - v) * f).toString(16).padStart(2, "0")).join("");
    return { light: mix(255, .38), base: hex, dark: mix(0, .22), hi: mix(255, .7) };
  }

  /* Outfit aus der Garderobe (Daten aus js/glitch-data.js) */
  function outfit(o) {
    const list = (window.GL_DATA && window.GL_DATA.OUTFITS) || [];
    if (!o) return "";
    return ["fuesse", "hals", "mund", "augen", "kopf", "hand", "haustier"].map(sl => { const it = list.find(x => x.id === o[sl]); return it ? it.svg : ""; }).join("");
  }

  function svg(mood = "normal", color = "#8B5CFF", opts = {}) {
    const [e, m] = MOOD[mood] || MOOD.normal;
    const s = shades(color);
    const shade = y => y <= 3 ? s.light : y >= 11 ? s.dark : s.base;
    const d = (Math.random() * 3).toFixed(2);
    const blush = mood === "love" ? r(1, 7, 2, 2, "#FF4F7B") + r(11, 7, 2, 2, "#FF4F7B") : "";
    const glitchy = opts.calm ? "" : `<rect class="gp gp1" x="-1" y="3" width="1" height="1" fill="#00E5FF"/><rect class="gp gp2" x="15" y="8" width="1" height="1" fill="#FF2BD6"/><rect class="gp gp3" x="13" y="-1" width="1" height="1" fill="#FFC21A"/>
      <g class="gc" fill="#00E5FF">${body()}</g><g class="gm" fill="#FF2BD6">${body()}</g>`;
    return `<svg viewBox="-2 -2 18 18" shape-rendering="crispEdges" aria-hidden="true" style="--d:-${d}s">
      ${glitchy}
      <g class="gb">${body(shade)}${r(2, 3, 1, 1, s.hi)}${r(0, 0, 1, 1, "#00E5FF")}${r(13, 0, 1, 1, "#FF2BD6")}</g>
      <g class="ge">${EYES[e]}</g><g>${MOUTH[m]}</g>${blush}${outfit(opts.outfit)}
      ${opts.calm ? "" : `<g class="gsl">${body(() => "#00E5FF")}${EYES[e]}</g>`}
    </svg>`;
  }

  window.GLGlitch = { svg, shades };
})();
