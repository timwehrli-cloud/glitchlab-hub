/* =====================================================================
   Glitchlab-Hub · animierte Pixel-Szenen für die Fächer-Auswahl
   Jede Szene ist ein SVG (160 × 80) im Pixel-Stil von gLiTCh.
   Die Bewegungen stehen in css/style.css unter «Fächer-Szenen».
   ===================================================================== */
(function () {
  const H = window.GLHub = window.GLHub || {};
  const r = (x, y, w, h, f, cls = "") => `<rect${cls ? ` class="${cls}"` : ""} x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;

  /* kleiner gLiTCh (14 × 14 Pixel), dx/dy = Position, s = Grösse */
  const mini = (dx, dy, s = 1, cls = "sa-bob") => `<g transform="translate(${dx} ${dy}) scale(${s})"><g class="${cls}">
    ${r(2, 0, 2, 2, "#B79CFF")}${r(10, 0, 2, 2, "#B79CFF")}${r(3, 2, 8, 1, "#B79CFF")}${r(2, 3, 10, 1, "#B79CFF")}
    ${r(1, 4, 12, 2, "#8B5CFF")}${r(0, 6, 14, 3, "#8B5CFF")}${r(1, 9, 12, 2, "#8B5CFF")}${r(2, 11, 10, 1, "#6A3FE0")}
    ${r(2, 12, 1, 2, "#6A3FE0")}${r(4, 12, 2, 1, "#6A3FE0")}${r(8, 12, 2, 1, "#6A3FE0")}${r(11, 12, 1, 2, "#6A3FE0")}
    <g class="sa-blink">${r(3, 5, 2, 2, "#fff")}${r(9, 5, 2, 2, "#fff")}${r(4, 6, 1, 1, "#14062E")}${r(10, 6, 1, 1, "#14062E")}</g>
    ${r(5, 9, 4, 1, "#14062E")}</g></g>`;

  H.subjectArt = {
    /* Medien & Informatik: Bildschirm mit Code, der sich selbst schreibt, WLAN-Wellen, Pixel-Funken */
    mi: `<svg viewBox="0 0 160 80" shape-rendering="crispEdges" aria-hidden="true">
      ${r(0, 0, 160, 80, "#2A1466")}${r(0, 60, 160, 20, "#1E0E4D")}
      <g class="sa-twinkle">${r(12, 10, 2, 2, "#FFE680")}${r(140, 16, 2, 2, "#00E5FF")}${r(150, 44, 2, 2, "#FF2BD6")}${r(24, 40, 2, 2, "#fff")}</g>
      ${r(46, 10, 72, 46, "#14062E")}${r(48, 12, 68, 40, "#0B0322")}${r(74, 56, 16, 4, "#3A1D7A")}${r(64, 60, 36, 3, "#3A1D7A")}
      <g class="sa-code">
        <g class="sa-line l1">${r(52, 17, 10, 3, "#FF2BD6")}${r(64, 17, 18, 3, "#00E5FF")}</g>
        <g class="sa-line l2">${r(56, 23, 14, 3, "#3CFF7A")}${r(72, 23, 24, 3, "#B79CFF")}</g>
        <g class="sa-line l3">${r(56, 29, 8, 3, "#FFC21A")}${r(66, 29, 12, 3, "#00E5FF")}${r(80, 29, 10, 3, "#FF2BD6")}</g>
        <g class="sa-line l4">${r(52, 35, 20, 3, "#B79CFF")}${r(74, 35, 8, 3, "#3CFF7A")}</g>
        <g class="sa-line l5">${r(56, 41, 26, 3, "#00E5FF")}</g>
      </g>
      ${r(84, 41, 3, 4, "#FFFFFF", "sa-cursor")}
      <g class="sa-wifi">${r(129, 22, 4, 4, "#00E5FF")}
        <g class="w1">${r(125, 18, 12, 2, "#00E5FF")}</g><g class="w2">${r(121, 13, 20, 2, "#00E5FF")}</g></g>
      ${mini(18, 52, 1.4)}
    </svg>`,

    /* NMG: Alpen mit Schnee, Sonne, Wolken, Baum im Wind, kleiner Vogel */
    nmg: `<svg viewBox="0 0 160 80" shape-rendering="crispEdges" aria-hidden="true">
      ${r(0, 0, 160, 80, "#7FD4F5")}${r(0, 36, 160, 44, "#A9E3F7")}
      <g class="sa-sun">${r(122, 8, 16, 16, "#FFC21A")}${r(126, 4, 8, 4, "#FFC21A")}${r(126, 24, 8, 4, "#FFC21A")}${r(118, 12, 4, 8, "#FFC21A")}${r(138, 12, 4, 8, "#FFC21A")}${r(124, 10, 6, 4, "#FFE680")}</g>
      <g class="sa-cloud c1">${r(0, 14, 22, 6, "#fff")}${r(4, 10, 12, 4, "#fff")}</g>
      <g class="sa-cloud c2">${r(0, 26, 16, 5, "#fff")}${r(3, 23, 8, 3, "#fff")}</g>
      <path d="M0 64 L28 30 L44 46 L66 18 L92 50 L108 36 L136 62 L160 50 L160 80 L0 80 Z" fill="#5B7A8C" shape-rendering="geometricPrecision"/>
      <path d="M66 18 L74 28 L70 27 L66 31 L62 27 L58 28 Z M28 30 L34 37 L28 36 L23 37 Z M108 36 L114 43 L108 42 L103 43 Z" fill="#FFFFFF" shape-rendering="geometricPrecision"/>
      ${r(0, 62, 160, 18, "#3CC48A")}${r(0, 62, 160, 3, "#5FDC9F")}
      <g class="sa-sway">${r(22, 44, 4, 18, "#8B5A2B")}${r(12, 32, 24, 10, "#1F9D68")}${r(16, 26, 16, 8, "#1F9D68")}${r(18, 22, 12, 6, "#2BB57A")}</g>
      <g class="sa-bird">${r(0, 0, 3, 1, "#14062E")}${r(3, 1, 1, 1, "#14062E")}${r(4, 0, 3, 1, "#14062E")}</g>
      ${r(10, 70, 2, 2, "#FF2BD6")}${r(30, 72, 2, 2, "#FFE680")}${r(98, 71, 2, 2, "#FF2BD6")}
      ${mini(56, 52, 1.2)}${r(70, 46, 1, 8, "#8B5A2B")}<g class="sa-flag">${r(71, 46, 6, 5, "#E3000F")}${r(73, 47, 2, 3, "#fff")}${r(72, 48, 4, 1, "#fff")}</g>
    </svg>`,

    /* Deutsch: offenes Buch mit blätternder Seite, Buchstaben schweben hoch */
    de: `<svg viewBox="0 0 160 80" shape-rendering="crispEdges" aria-hidden="true">
      ${r(0, 0, 160, 80, "#FFE7A3")}${r(0, 62, 160, 18, "#F2C44D")}
      <g class="sa-letter a1"><text x="40" y="40" font-family="Silkscreen, monospace" font-size="12" fill="#C98A00">A</text></g>
      <g class="sa-letter a2"><text x="62" y="40" font-family="Silkscreen, monospace" font-size="10" fill="#E53935">b</text></g>
      <g class="sa-letter a3"><text x="96" y="40" font-family="Silkscreen, monospace" font-size="12" fill="#2E6BE6">C</text></g>
      <g class="sa-letter a4"><text x="116" y="40" font-family="Silkscreen, monospace" font-size="10" fill="#1F9D68">ä</text></g>
      ${r(36, 44, 88, 22, "#8B5A2B")}
      ${r(40, 40, 40, 24, "#FFFFFF")}${r(80, 40, 40, 24, "#FFFDF5")}${r(79, 40, 2, 24, "#C9B79C")}
      ${r(44, 45, 30, 2, "#C9B79C")}${r(44, 50, 26, 2, "#C9B79C")}${r(44, 55, 30, 2, "#C9B79C")}
      ${r(86, 45, 28, 2, "#C9B79C")}${r(86, 50, 30, 2, "#C9B79C")}${r(86, 55, 22, 2, "#C9B79C")}
      <g class="sa-page">${r(80, 40, 38, 24, "#FFFFFF")}${r(84, 46, 28, 2, "#E5D8C3")}${r(84, 51, 24, 2, "#E5D8C3")}</g>
      ${mini(128, 50, 1.2)}${r(126, 52, 4, 2, "#FFC21A")}
      <g class="sa-twinkle">${r(20, 14, 2, 2, "#FF2BD6")}${r(140, 12, 2, 2, "#2E6BE6")}${r(12, 48, 2, 2, "#1F9D68")}</g>
    </svg>`,

    /* Mathematik: Rechenrahmen mit rollenden Kugeln, Rechenzeichen poppen auf */
    ma: `<svg viewBox="0 0 160 80" shape-rendering="crispEdges" aria-hidden="true">
      ${r(0, 0, 160, 80, "#C9DCFF")}
      <g opacity=".5">${Array.from({ length: 11 }, (_, i) => r(i * 16, 0, 1, 80, "#9DBBF5")).join("")}${Array.from({ length: 6 }, (_, i) => r(0, i * 16, 160, 1, "#9DBBF5")).join("")}</g>
      ${r(30, 14, 4, 54, "#8B5A2B")}${r(110, 14, 4, 54, "#8B5A2B")}${r(30, 12, 84, 4, "#A9773F")}${r(30, 66, 84, 4, "#A9773F")}
      ${[24, 36, 48, 58].map((y, k) => r(34, y, 76, 2, "#6D4420")).join("")}
      <g class="sa-bead b1">${r(36, 21, 8, 8, "#E53935")}${r(46, 21, 8, 8, "#E53935")}${r(56, 21, 8, 8, "#E53935")}</g>
      <g class="sa-bead b2">${r(36, 33, 8, 8, "#2E6BE6")}${r(46, 33, 8, 8, "#2E6BE6")}</g>
      <g class="sa-bead b3">${r(36, 45, 8, 8, "#FFC21A")}${r(46, 45, 8, 8, "#FFC21A")}${r(56, 45, 8, 8, "#FFC21A")}${r(66, 45, 8, 8, "#FFC21A")}</g>
      <g class="sa-bead b4">${r(36, 55, 8, 8, "#1F9D68")}</g>
      <g class="sa-pop p1">${r(128, 14, 10, 2, "#2563D9")}${r(132, 10, 2, 10, "#2563D9")}</g>
      <g class="sa-pop p2">${r(130, 34, 10, 2, "#E53935")}</g>
      <g class="sa-pop p3">${r(10, 18, 2, 2, "#1F9D68")}${r(12, 20, 2, 2, "#1F9D68")}${r(14, 22, 2, 2, "#1F9D68")}${r(14, 18, 2, 2, "#1F9D68")}${r(10, 22, 2, 2, "#1F9D68")}</g>
      <g class="sa-pop p4">${r(8, 46, 10, 2, "#C98A00")}${r(12, 42, 2, 2, "#C98A00")}${r(12, 50, 2, 2, "#C98A00")}</g>
      ${mini(128, 52, 1.2)}
    </svg>`,

    /* Englisch: roter Doppeldeckerbus fährt vorbei, Sprechblase «Hello!» */
    en: `<svg viewBox="0 0 160 80" shape-rendering="crispEdges" aria-hidden="true">
      ${r(0, 0, 160, 80, "#BFE3FF")}${r(0, 60, 160, 20, "#8C9AA8")}${r(0, 66, 160, 2, "#FFFFFF")}
      ${r(18, 22, 10, 38, "#6B7A89")}${r(16, 18, 14, 6, "#6B7A89")}${r(20, 28, 6, 6, "#FFE680")}${r(21, 29, 4, 4, "#14062E")}
      <g class="sa-cloud c1">${r(0, 10, 22, 6, "#fff")}${r(4, 6, 12, 4, "#fff")}</g>
      <g class="sa-pop p1">${r(98, 8, 46, 16, "#fff")}${r(104, 24, 6, 4, "#fff")}<text x="121" y="20" font-family="Silkscreen, monospace" font-size="9" text-anchor="middle" fill="#C2255C">Hello!</text></g>
      <g class="sa-bus">${r(0, 32, 46, 26, "#D62828")}${r(0, 44, 46, 2, "#14062E")}${[3, 13, 23, 33].map(x => r(x, 35, 7, 6, "#BDF4FF") + r(x, 48, 7, 6, "#BDF4FF")).join("")}${r(6, 58, 8, 6, "#14062E")}${r(32, 58, 8, 6, "#14062E")}${r(8, 60, 4, 2, "#8C9AA8")}${r(34, 60, 4, 2, "#8C9AA8")}</g>
      ${mini(132, 44, 1.2)}
    </svg>`,

    /* Französisch: Eiffelturm, Croissant hüpft, «Bonjour!» */
    fr: `<svg viewBox="0 0 160 80" shape-rendering="crispEdges" aria-hidden="true">
      ${r(0, 0, 160, 80, "#C7F0EE")}${r(0, 62, 160, 18, "#7CCB8F")}
      <g class="sa-twinkle">${r(14, 10, 2, 2, "#FFE680")}${r(140, 14, 2, 2, "#fff")}${r(96, 8, 2, 2, "#FFE680")}</g>
      ${r(57, 6, 2, 8, "#6D4C41")}${r(55, 14, 6, 10, "#8D6E63")}${r(52, 24, 12, 4, "#6D4C41")}${r(50, 28, 16, 12, "#8D6E63")}${r(46, 40, 24, 4, "#6D4C41")}
      ${r(42, 44, 8, 18, "#8D6E63")}${r(66, 44, 8, 18, "#8D6E63")}${r(50, 48, 16, 3, "#6D4C41")}${r(54, 52, 8, 10, "#C7F0EE")}
      <g class="sa-pop p2">${r(84, 12, 52, 16, "#fff")}${r(90, 28, 6, 4, "#fff")}<text x="110" y="24" font-family="Silkscreen, monospace" font-size="9" text-anchor="middle" fill="#0E8C8A">Bonjour!</text></g>
      <g class="sa-bead b1">${r(16, 54, 18, 6, "#E3A300")}${r(20, 50, 10, 4, "#F2C14E")}${r(14, 56, 4, 3, "#C98A00")}${r(32, 56, 4, 3, "#C98A00")}</g>
      ${mini(118, 50, 1.2)}${r(119, 47, 12, 3, "#14062E")}${r(122, 44, 6, 3, "#14062E")}
    </svg>`,

    /* Sport: Laufbahn, Ball springt, gLiTCh rennt */
    sp: `<svg viewBox="0 0 160 80" shape-rendering="crispEdges" aria-hidden="true">
      ${r(0, 0, 160, 80, "#BDE7FF")}${r(0, 46, 160, 34, "#D9603B")}${[52, 62, 72].map(y => r(0, y, 160, 1, "#FFFFFF")).join("")}
      ${r(0, 40, 160, 6, "#4CAF50")}
      <g class="sa-sun">${r(132, 8, 14, 14, "#FFC21A")}</g>
      <g class="sa-ball">${r(0, 0, 10, 10, "#FFFFFF")}${r(2, 0, 6, 10, "#14062E")}${r(0, 4, 10, 2, "#14062E")}${r(1, 1, 3, 3, "#FFFFFF")}</g>
      ${r(120, 26, 2, 20, "#FFFFFF")}${r(150, 26, 2, 20, "#FFFFFF")}${r(120, 26, 32, 2, "#FFFFFF")}
      <g class="sa-run">${mini(0, 44, 1.2, "sa-hop")}</g>
    </svg>`,

    /* Minigames: Spielautomat mit Pixel-Invaders und Punkte-Zähler */
    mg: `<svg viewBox="0 0 160 80" shape-rendering="crispEdges" aria-hidden="true">
      ${r(0, 0, 160, 80, "#1B1033")}
      ${r(46, 6, 68, 70, "#7048E8")}${r(50, 10, 60, 38, "#0B0322")}${r(46, 52, 68, 4, "#5A36C9")}
      <g class="sa-inv">${[0, 1, 2, 3].map(k => `${r(56 + k * 13, 16, 8, 4, "#3CFF7A")}${r(58 + k * 13, 14, 4, 2, "#3CFF7A")}${r(56 + k * 13, 20, 2, 2, "#3CFF7A")}${r(62 + k * 13, 20, 2, 2, "#3CFF7A")}`).join("")}</g>
      <g class="sa-shot">${r(79, 30, 2, 6, "#FFE680")}</g>
      ${r(74, 40, 12, 4, "#00E5FF")}${r(78, 38, 4, 2, "#00E5FF")}
      <text x="80" y="12" font-family="Silkscreen, monospace" font-size="5" text-anchor="middle" fill="#FF2BD6" class="sa-cursor">HI 9999</text>
      ${r(60, 60, 4, 8, "#14062E")}${r(58, 58, 8, 4, "#E53935")}${r(88, 60, 6, 6, "#FFC21A")}${r(98, 60, 6, 6, "#00E5FF")}
      <g class="sa-twinkle">${r(14, 14, 2, 2, "#FF2BD6")}${r(140, 20, 2, 2, "#00E5FF")}${r(24, 60, 2, 2, "#FFE680")}${r(132, 62, 2, 2, "#fff")}</g>
      ${mini(16, 52, 1.2)}
    </svg>`
  };
})();
