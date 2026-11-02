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

  /* Hautfarben: 10 zum Auswählen (Standard Violett), Gold nur für Lehrpersonen */
  const SKINS = [{"id": "violett", "n": "Violett", "base": "#8B5CFF", "light": "#B79CFF", "dark": "#6A3FE0", "hi": "#E3D6FF"}, {"id": "blau", "n": "Blau", "base": "#3D7BFF", "light": "#87ADFF", "dark": "#3060C7", "hi": "#C5D7FF"}, {"id": "tuerkis", "n": "Türkis", "base": "#14B8C4", "light": "#6DD3DA", "dark": "#109099", "hi": "#B8EAED"}, {"id": "gruen", "n": "Grün", "base": "#22B55E", "light": "#76D19B", "dark": "#1B8D49", "hi": "#BDE9CF"}, {"id": "limette", "n": "Limette", "base": "#8CC63F", "light": "#B8DC88", "dark": "#6D9A31", "hi": "#DCEEC5"}, {"id": "orange", "n": "Orange", "base": "#FF8A1F", "light": "#FFB674", "dark": "#C76C18", "hi": "#FFDCBC"}, {"id": "rot", "n": "Rot", "base": "#EF4444", "light": "#F58B8B", "dark": "#BA3535", "hi": "#FAC7C7"}, {"id": "pink", "n": "Pink", "base": "#FF4FA3", "light": "#FF92C6", "dark": "#C73E7F", "hi": "#FFCAE3"}, {"id": "mint", "n": "Mint", "base": "#5BE3B6", "light": "#99EED2", "dark": "#47B18E", "hi": "#CEF7E9"}, {"id": "silber", "n": "Silber", "base": "#8A94A6", "light": "#B6BDC8", "dark": "#6C7381", "hi": "#DCDFE4"}, {"id": "gold", "n": "Gold", "base": "#F2B705", "light": "#F7D264", "dark": "#BD8F04", "hi": "#FBE9B4"}];
  const skinOf = (opts = {}) => { if (opts.lp) return SKINS.find(x => x.id === "gold"); const id = opts.skin || (opts.outfit && opts.outfit.skin); return SKINS.find(x => x.id === id && x.id !== "gold") || null; };
  function svg(mood = "normal", color = "#8B5CFF", opts = {}) {
    const [e, m] = MOOD[mood] || MOOD.normal;
    const s = skinOf(opts) || shades(color);
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

  window.GLGlitch = { svg, shades, SKINS };
})();
