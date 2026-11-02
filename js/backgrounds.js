/* =====================================================================
   Glitchlab · Hintergründe fürs Zimmer, die mit dem Level kommen (Wand 160 × 64)
   Alle dunkel gehalten, Bewegungen dezent (Animationen «pb-…» im Zimmer).
   ===================================================================== */
(function () {
  const r = (x, y, w, h, f, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${extra}/>`;
  const tw = (pts, c = "#fff") => pts.map(([x, y, s = 1], k) => `<g class="pb-tw" style="animation-delay:${(k * .41) % 2.2}s">${r(x, y, s, s, c)}</g>`).join("");
  const win = (x, y, cols, rows, c = "#FFD45A", gap = 3) => Array.from({ length: cols * rows }, (_, i) => { const cx = i % cols, cy = Math.floor(i / cols); return (i * 7) % 5 === 0 ? "" : r(x + cx * gap, y + cy * gap, 1.4, 1.6, c, ' opacity=".75"'); }).join("");

  const LEVEL_BGS = [
    { lv: 9, id: "bg_l10", n: "Schweizer Berge", ic: "🏔️", wand: ["#0A1430", "#1E3460"], boden: ["#3A4A3A", "#2E3C2E", "#222E22"],
      svg: tw([[12, 6], [30, 14], [56, 4], [90, 10], [120, 6], [148, 12]])
        + `<path d="M0 64L22 30l12 12 18-28 20 26 16-14 22 22 18-20 32 36z" fill="#2A3A5A"/>`
        + `<path d="M52 14l-7 10 4-1 3 3 3-3 4 1zM104 22l-6 8 3-1 3 2 2-2 4 1zM22 30l-5 7 3-1 2 2 3-2 2 1z" fill="#C9D3E0" opacity=".85"/>`
        + `<path d="M0 64l30-18 22 10 26-16 24 14 22-10 36 20z" fill="#1E3A2A"/>`
        + `<g class="pb-sway">${r(51, 6, .8, 8, "#8A6A4A")}${r(51.8, 6, 5, 3.4, "#B3261E")}${r(53.6, 6.8, 1.4, 1.8, "#fff")}${r(53, 7.2, 2.6, 1, "#fff")}</g>` },
    { lv: 19, id: "bg_l20", n: "Winternacht", ic: "❄️", wand: ["#04070F", "#121C30"], boden: ["#2E3644", "#242A36", "#1A1F28"],
      svg: `<circle cx="132" cy="14" r="6" fill="#C9D3E0" opacity=".6"/><circle cx="132" cy="14" r="11" fill="#C9D3E0" opacity=".06"/>`
        + `<path d="M0 64L18 34l14 10 20-24 22 22 18-12 24 20 16-14 28 28z" fill="#161E2E"/><path d="M52 20l-6 9 3-1 3 2 3-2 3 1zM18 34l-5 7 3-1 2 2 2-2 3 1zM114 30l-5 6 3 0 2 2 2-2 3 0z" fill="#8A97AC" opacity=".6"/>`
        + `<path d="M0 64l26-14 30 8 28-12 30 10 46-6z" fill="#222C3E"/>`
        + Array.from({ length: 16 }, (_, k) => `<g class="pb-fall" style="animation-delay:${(k * .53) % 6}s;animation-duration:${6 + (k % 4)}s">${r(6 + (k * 37) % 152, -2, 1, 1, "#E8EEF8", ' opacity=".7"')}</g>`).join("") },
    { lv: 29, id: "bg_l30", n: "Glitch-Bildschirm", ic: "👾", wand: ["#06030E", "#140A2A"], boden: ["#1A1030", "#140C26", "#0E081C"],
      svg: `<g opacity=".18">${Array.from({ length: 11 }, (_, k) => `<path d="M${k * 16} 0v64" stroke="#8B5CFF" stroke-width=".4"/>`).join("")}${Array.from({ length: 5 }, (_, k) => `<path d="M0 ${k * 14 + 4}h160" stroke="#8B5CFF" stroke-width=".4"/>`).join("")}</g>`
        + [[14, 10, "#00E5FF"], [46, 30, "#FF2BD6"], [96, 8, "#3CFF7A"], [128, 34, "#FFC21A"], [70, 46, "#00E5FF"]].map(([x, y, c], k) => `<g class="pb-glitch" style="animation-delay:${k * 1.1}s">${r(x, y, 12, 2.4, c, ' opacity=".55"')}${r(x + 4, y + 2.4, 6, 1.6, c, ' opacity=".35"')}</g>`).join("")
        + `<g transform="translate(72 14)" opacity=".5"><rect x="2" y="0" width="12" height="2" fill="#8B5CFF"/><rect x="0" y="2" width="16" height="10" fill="#8B5CFF"/><rect x="3" y="5" width="3" height="3" fill="#06030E"/><rect x="10" y="5" width="3" height="3" fill="#06030E"/></g>`
        + `<g class="pb-scan">${r(0, 0, 160, 1, "#fff", ' opacity=".07"')}</g>` },
    { lv: 39, id: "bg_l40", n: "Dichter Dschungel", ic: "🌿", wand: ["#020C06", "#0B2414"], boden: ["#1E2A16", "#162010", "#10180A"],
      svg: [0, 20, 44, 70, 96, 122, 146].map((x, k) => `<path d="M${x} 64c-4-20 2-38 ${8 + k % 3 * 2}-56 4 18 8 36 6 56z" fill="#0F2E18"/>`).join("")
        + Array.from({ length: 14 }, (_, k) => `<ellipse cx="${(k * 23) % 160}" cy="${8 + (k * 17) % 44}" rx="${9 + k % 4 * 2}" ry="${4 + k % 3}" fill="${k % 2 ? "#14401F" : "#1A5228"}" opacity=".9"/>`).join("")
        + [12, 58, 104, 140].map((x, k) => `<g class="pb-sway" style="animation-delay:${k * .8}s"><path d="M${x} 0c3 10-3 18 0 ${26 + k * 4}" stroke="#2E6A34" stroke-width="1.2" fill="none"/></g>`).join("")
        + Array.from({ length: 7 }, (_, k) => `<g class="pb-float" style="animation-delay:${k * .6}s"><g class="pb-tw" style="animation-delay:${k * .4}s"><circle cx="${18 + k * 21}" cy="${14 + (k * 11) % 34}" r=".9" fill="#C8FF7A"/></g></g>`).join("") },
    { lv: 49, id: "bg_l50", n: "Aura", ic: "✨", wand: ["#0A0418", "#1E0A3A"], boden: ["#1E1236", "#160C2A", "#10081E"],
      svg: [[40, 30, "#FFC21A"], [110, 24, "#FF2BD6"], [80, 44, "#00E5FF"]].map(([x, y, c], k) => `<g class="pb-pulse" style="animation-delay:${k * 1.2}s"><circle cx="${x}" cy="${y}" r="26" fill="${c}" opacity=".08"/><circle cx="${x}" cy="${y}" r="14" fill="${c}" opacity=".09"/></g>`).join("")
        + Array.from({ length: 10 }, (_, k) => `<g class="pb-rise" style="animation-delay:${k * .7}s">${r(10 + k * 15, 60, 1, 1, ["#FFE07A", "#FF8AD8", "#7FF2FF"][k % 3])}</g>`).join("")
        + tw([[20, 8], [70, 6], [130, 10], [150, 30], [8, 40]], "#FFE07A") },
    { lv: 59, id: "bg_l60", n: "London bei Nacht", ic: "🇬🇧", wand: ["#05081A", "#141E40"], boden: ["#2A2A33", "#222229", "#18181E"],
      svg: tw([[10, 6], [40, 10], [64, 4], [96, 8], [150, 6]])
        + `<g class="pb-spin" style="transform-origin:128px 32px"><circle cx="128" cy="32" r="16" fill="none" stroke="#5A6A9A" stroke-width=".8"/>${Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `<path d="M128 32l${(Math.cos(a) * 16).toFixed(1)} ${(Math.sin(a) * 16).toFixed(1)}" stroke="#5A6A9A" stroke-width=".4"/>${r(128 + Math.cos(a) * 16 - 1, 32 + Math.sin(a) * 16 - 1, 2, 2, "#7FB2FF")}`; }).join("")}</g><path d="M124 64l4-32 4 32z" fill="#2A3050"/>`
        + `${r(30, 14, 8, 50, "#2A2E44")}<path d="M30 14l4-8 4 8z" fill="#2A2E44"/>${r(31.5, 18, 5, 5, "#E8C547", ' opacity=".8"')}<circle cx="34" cy="20.5" r="1.6" fill="#2A2E44"/>`
        + `${r(0, 36, 26, 28, "#1C2036")}${r(40, 30, 22, 34, "#20243C")}${r(64, 40, 18, 24, "#1A1E32")}${r(84, 34, 28, 30, "#1E2238")}${r(146, 38, 14, 26, "#1C2036")}`
        + win(3, 40, 7, 6) + win(43, 34, 6, 8) + win(67, 44, 5, 5) + win(87, 38, 8, 7) + win(148, 42, 4, 6) },
    { lv: 69, id: "bg_l70", n: "Paris bei Nacht", ic: "🗼", wand: ["#0A0616", "#22163E"], boden: ["#2E2A3A", "#24202E", "#1A1724"],
      svg: tw([[14, 8], [44, 4], [100, 6], [130, 12], [152, 4]]) + `<circle cx="24" cy="14" r="5" fill="#E8E0C8" opacity=".55"/>`
        + `<path d="M80 6l-2 12h4zM78 18l-5 22h14l-5-22zM73 40l-9 24h8l8-12 8 12h8l-9-24z" fill="#3A3048"/>${r(77, 26, 6, 1.2, "#2A2238")}${r(74, 40, 12, 1.6, "#2A2238")}`
        + `<g class="pb-tw">${r(79.4, 5, 1.2, 1.2, "#FFD45A")}</g>` + [[70, 30], [90, 34], [76, 50], [84, 50]].map(([x, y], k) => `<g class="pb-tw" style="animation-delay:${k * .5}s">${r(x, y, .9, .9, "#FFE8A0")}</g>`).join("")
        + `${r(0, 42, 30, 22, "#1E1A2E")}<path d="M0 42l15-6 15 6z" fill="#262036"/>${r(110, 40, 24, 24, "#201C30")}<path d="M110 40l12-5 12 5z" fill="#28223A"/>${r(136, 46, 24, 18, "#1E1A2E")}`
        + win(3, 46, 8, 5, "#FFC98A") + win(113, 44, 7, 6, "#FFC98A") + win(139, 50, 6, 4, "#FFC98A") },
    { lv: 79, id: "bg_l80", n: "Mathe-Tafel", ic: "📐", wand: ["#071410", "#0F241C"], boden: ["#3A2A1E", "#2E2218", "#221810"],
      svg: `${r(8, 6, 144, 46, "#0F2A20", ' stroke="#5A4028" stroke-width="2"')}<g opacity=".14">${Array.from({ length: 13 }, (_, k) => `<path d="M${14 + k * 11} 8v42" stroke="#C8E6D2" stroke-width=".3"/>`).join("")}</g>`
        + `<g fill="#D8EEE0" opacity=".75" font-family="monospace" font-weight="700"><text x="16" y="18" font-size="6">a² + b² = c²</text><text x="96" y="20" font-size="7">π ≈ 3.14</text><text x="20" y="34" font-size="5">7 · 8 = 56</text><text x="64" y="44" font-size="6">∑ 1+2+3 = 6</text><text x="118" y="38" font-size="5">½ + ¼ = ¾</text></g>`
        + `<path d="M74 28l10-12 10 12z" fill="none" stroke="#FFD45A" stroke-width=".7" opacity=".6"/><circle cx="130" cy="14" r="5" fill="none" stroke="#7FD4FF" stroke-width=".7" opacity=".6"/>`
        + `<g class="pb-float">${r(62, 52, 10, 2, "#E8E8E8")}</g>` + Array.from({ length: 5 }, (_, k) => `<g class="pb-rise" style="animation-delay:${k * 1.1}s">${r(40 + k * 20, 50, .8, .8, "#E8EEE8", ' opacity=".6"')}</g>`).join("") },
    { lv: 89, id: "bg_l90", n: "Stadion bei Nacht", ic: "⚽", wand: ["#03080A", "#0C1C24"], boden: ["#1E4A28", "#173A20", "#102C18"],
      svg: [18, 142].map((x, k) => `${r(x - 1, 8, 2, 40, "#3A4048")}${r(x - 6, 4, 12, 5, "#4A5058")}<g class="pb-pulse" style="animation-delay:${k}s"><path d="M${x - 6} 9l${k ? -30 : 30} 40h-10z" fill="#E8F4FF" opacity=".06"/></g>${[0, 1, 2, 3].map(i => r(x - 5 + i * 2.8, 5, 1.6, 2.6, "#F4FAFF")).join("")}`).join("")
        + `${r(0, 36, 160, 12, "#1A2028")}` + Array.from({ length: 40 }, (_, k) => r(2 + k * 4, 38 + (k % 3) * 3, 1.6, 1.6, ["#B3261E", "#2E6BE6", "#FFC21A", "#E8E8E8"][k % 4], ' opacity=".5"')).join("")
        + `<path d="M60 64V50h40v14" fill="none" stroke="#E8E8E8" stroke-width="1" opacity=".55"/><path d="M60 50l4 4h32l4-4" stroke="#E8E8E8" stroke-width=".5" opacity=".35" fill="none"/>`
        + `<g class="pb-float"><circle cx="118" cy="56" r="3" fill="#F4F4F4"/><path d="M117 54.4l1 1.2 1.4-.6" stroke="#222" stroke-width=".6" fill="none"/></g>` },
    { lv: 99, id: "bg_l100", n: "Klötzchen-Welt", ic: "🧱", wand: ["#060A14", "#14203A"], boden: ["#3A2A1A", "#2E2014", "#22180E"],
      svg: tw([[10, 6], [36, 12], [70, 4], [104, 10], [150, 8]]) + r(126, 6, 10, 10, "#E8E0B0", ' opacity=".55"')
        + `<g class="pb-drift">${r(20, 12, 18, 4, "#3A4458")}${r(24, 9, 10, 3, "#3A4458")}</g><g class="pb-drift" style="animation-delay:-4s">${r(84, 8, 22, 4, "#3A4458")}${r(90, 5, 10, 3, "#3A4458")}</g>`
        + [[0, 44, 4], [32, 40, 5], [72, 46, 3], [96, 38, 6], [140, 44, 4]].map(([x, y, n]) => Array.from({ length: n }, (_, i) => `${r(x + i * 8, y, 8, 3, "#2E6A2A")}${r(x + i * 8, y + 3, 8, 64 - y - 3, "#4A3420")}${r(x + i * 8 + 2, y + 8, 2, 2, "#5E4428")}${r(x + i * 8 + 5, y + 14, 2, 2, "#3A2818")}`).join("")).join("")
        + `${r(110, 22, 4, 16, "#4A3420")}${r(102, 12, 20, 12, "#1E5A22")}${r(106, 8, 12, 4, "#1E5A22")}${r(108, 16, 3, 3, "#2E7A32")}`
        + `<g class="pb-tw">${r(60, 34, 2, 2, "#5AE8FF")}</g>` }
  ];
  window.GL_LEVEL_BGS = LEVEL_BGS;
})();
