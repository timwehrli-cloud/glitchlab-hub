/* =====================================================================
   Glitchlab · animierte Bilder für Themen und Module (120 × 60, Pixel-Stil)
   Die Bilder der gLiTCh-Lab-Module stammen 1:1 aus dem alten Lab (MOD_ART),
   die neuen Themen-Bilder sind im gleichen Stil gezeichnet.
   Bewegungen: «Modul-Bilder» in css/style.css (Klassen ma-…).
   ===================================================================== */
(function () {
  const H = window.GLHub = window.GLHub || {};
  /* ---- aus dem gLiTCh-Lab übernommen ---- */
const MINI_G = (x, y, s=1) => `<g transform="translate(${x} ${y}) scale(${s})" class="ma-bob"><rect x="2" y="0" width="10" height="2" fill="#B79CFF"/><rect x="0" y="2" width="14" height="10" fill="#8B5CFF"/><rect x="2" y="12" width="3" height="2" fill="#6A3FE0"/><rect x="9" y="12" width="3" height="2" fill="#6A3FE0"/><rect x="3" y="4" width="3" height="3" fill="#fff"/><rect x="8" y="4" width="3" height="3" fill="#fff"/><rect x="4" y="5" width="1" height="2" fill="#14062E"/><rect x="9" y="5" width="1" height="2" fill="#14062E"/><rect x="4" y="9" width="6" height="1" fill="#14062E"/></g>`;
const MOD_ART = {
  prompt: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <g class="ma-drop d1"><rect x="62" y="40" width="22" height="8" fill="#F2BE2E"/><rect x="65" y="37" width="5" height="3" fill="#F2BE2E"/><rect x="76" y="37" width="5" height="3" fill="#F2BE2E"/></g>
    <g class="ma-drop d2"><rect x="64" y="30" width="22" height="8" fill="#F06C6C"/><rect x="67" y="27" width="5" height="3" fill="#F06C6C"/><rect x="78" y="27" width="5" height="3" fill="#F06C6C"/></g>
    <g class="ma-drop d3"><rect x="61" y="20" width="22" height="8" fill="#6592F7"/><rect x="64" y="17" width="5" height="3" fill="#6592F7"/><rect x="75" y="17" width="5" height="3" fill="#6592F7"/></g>
    <g class="ma-drop d4"><rect x="63" y="10" width="22" height="8" fill="#3CC48A"/><rect x="66" y="7" width="5" height="3" fill="#3CC48A"/><rect x="77" y="7" width="5" height="3" fill="#3CC48A"/></g>
    ${MINI_G(30, 30, 1.2)}<g class="ma-type"><rect x="16" y="14" width="34" height="11" fill="#14062E"/><text x="19" y="22" font-size="6" font-family="monospace" fill="#3CFF7A">Prompt_</text></g>
    <g class="ma-twinkle"><rect x="98" y="12" width="2" height="2" fill="#FFE680"/><rect x="104" y="30" width="2" height="2" fill="#fff"/><rect x="10" y="44" width="2" height="2" fill="#FFE680"/></g></svg>`,
  fakenews: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="40" y="10" width="44" height="40" fill="#F5F5F5"/><rect x="44" y="14" width="36" height="5" fill="#14062E"/><rect x="44" y="22" width="16" height="12" fill="#B0BEC5"/><rect x="63" y="22" width="17" height="2" fill="#78909C"/><rect x="63" y="26" width="15" height="2" fill="#78909C"/><rect x="63" y="30" width="17" height="2" fill="#78909C"/><rect x="44" y="37" width="36" height="2" fill="#78909C"/><rect x="44" y="41" width="30" height="2" fill="#78909C"/>
    <g class="ma-stamp"><rect x="62" y="34" width="22" height="9" fill="none" stroke="#E53935" stroke-width="2"/><text x="73" y="41" font-size="6" font-weight="700" font-family="monospace" text-anchor="middle" fill="#E53935">FAKE?</text></g>
    <g class="ma-scan"><circle cx="0" cy="0" r="9" fill="rgba(189,244,255,.35)" stroke="#5D4037" stroke-width="2.5" shape-rendering="geometricPrecision"/><rect x="6" y="6" width="3" height="10" fill="#5D4037" transform="rotate(-45 7 7)"/></g>
    ${MINI_G(8, 34, 1.1)}<rect x="9" y="31" width="14" height="3" fill="#8B5A2B"/><rect x="11" y="28" width="10" height="3" fill="#A9773F"/></svg>`,
  kibilder: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="36" y="8" width="48" height="40" fill="#FFC21A"/><rect x="39" y="11" width="42" height="34" fill="#4FC3F7"/>
    <g class="ma-real"><rect x="39" y="34" width="42" height="11" fill="#3CC48A"/><rect x="66" y="15" width="7" height="7" fill="#FFE680"/><rect x="46" y="24" width="10" height="10" fill="#1F9D68"/></g>
    <g class="ma-fake"><rect x="39" y="34" width="42" height="11" fill="#FF2BD6"/><rect x="63" y="14" width="10" height="10" fill="#00E5FF"/><rect x="45" y="22" width="12" height="12" fill="#8B5CFF"/><rect x="39" y="26" width="42" height="2" fill="#fff" opacity=".7"/></g>
    <text x="60" y="57" font-size="6" font-weight="700" font-family="monospace" text-anchor="middle" fill="#fff" class="ma-label">ECHT?</text>
    ${MINI_G(92, 30, 1.1)}</svg>`,
  datenspuren: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    ${[0,1,2,3,4,5].map(k=>`<g class="ma-step" style="animation-delay:${k*.35}s"><rect x="${14+k*14}" y="${k%2 ? 36 : 42}" width="5" height="7" rx="2" fill="#3CFF7A" shape-rendering="geometricPrecision"/><rect x="${15+k*14}" y="${k%2 ? 33 : 39}" width="3" height="2" fill="#3CFF7A"/></g>`).join("")}
    <g class="ma-ping"><rect x="96" y="10" width="14" height="10" fill="#14062E" stroke="#3CFF7A"/><text x="103" y="17" font-size="5" font-family="monospace" text-anchor="middle" fill="#3CFF7A">01</text></g>
    ${MINI_G(96, 30, 1.1)}</svg>`,
  werbung: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="30" y="24" width="10" height="12" fill="#B0BEC5"/><path d="M40 24 L58 14 L58 46 L40 36 Z" fill="#E53935" shape-rendering="geometricPrecision"/><rect x="34" y="36" width="4" height="8" fill="#78909C"/>
    <g class="ma-wave"><path d="M64 22 Q70 30 64 38" stroke="#FFC21A" stroke-width="3" fill="none" shape-rendering="geometricPrecision"/></g><g class="ma-wave w2"><path d="M72 16 Q82 30 72 44" stroke="#FFC21A" stroke-width="3" fill="none" shape-rendering="geometricPrecision"/></g>
    <g class="ma-coin"><rect x="86" y="10" width="8" height="8" fill="#FFE680"/><text x="90" y="16" font-size="6" font-weight="700" font-family="monospace" text-anchor="middle" fill="#B8860B">$</text></g>
    ${MINI_G(6, 32, 1.1)}<rect x="6" y="36" width="14" height="3" fill="#00E5FF" opacity=".8"/></svg>`,
  netiquette: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <g class="ma-pop p1"><rect x="20" y="8" width="38" height="14" fill="#fff"/><rect x="24" y="22" width="5" height="4" fill="#fff"/><rect x="24" y="13" width="26" height="2" fill="#B0BEC5"/><rect x="24" y="17" width="18" height="2" fill="#B0BEC5"/></g>
    <g class="ma-pop p2"><rect x="58" y="24" width="40" height="14" fill="#FF4F8B"/><rect x="88" y="38" width="5" height="4" fill="#FF4F8B"/><rect x="62" y="29" width="28" height="2" fill="#fff"/><rect x="62" y="33" width="20" height="2" fill="#fff"/></g>
    <g class="ma-pop p3"><rect x="24" y="40" width="22" height="12" fill="#3CC48A"/><text x="35" y="49" font-size="7" font-family="monospace" text-anchor="middle" fill="#fff">♥ 👍</text></g>
    ${MINI_G(100, 40, 1)}</svg>`
};

  const r = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
  const svg = inner => `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">${inner}</svg>`;

  /* ---- neu: Hallo gLiTCh! (winkt mit Sprechblase) ---- */
  const hallo = svg(`
    <g class="ma-pop p1">${r(52, 8, 40, 16, "#fff")}${r(58, 24, 6, 4, "#fff")}<text x="72" y="20" font-size="9" font-weight="700" font-family="monospace" text-anchor="middle" fill="#7B4CEF">HOI!</text></g>
    ${MINI_G(30, 30, 1.6)}<g class="ma-wave">${r(56, 32, 4, 8, "#B79CFF")}</g>
    <g class="ma-twinkle">${r(12, 10, 2, 2, "#FFE680")}${r(104, 40, 2, 2, "#fff")}${r(96, 8, 2, 2, "#00E5FF")}</g>
    <g class="ma-coin" style="transform-origin:100px 26px">${r(96, 22, 8, 8, "#FFC21A")}${r(99, 23, 2, 6, "#FFE680")}</g>`);

  /* ---- neu: Entdeckungsreise Schweiz (Matterhorn, Gondel, Fahne) ---- */
  const schweiz = svg(`
    <path d="M0 52 L22 30 L34 40 L58 8 L80 42 L96 30 L120 50 L120 60 L0 60 Z" fill="#5B7A8C" shape-rendering="geometricPrecision"/>
    <path d="M58 8 L66 20 L62 19 L58 23 L54 19 L50 20 Z" fill="#fff" shape-rendering="geometricPrecision"/>
    ${r(0, 52, 120, 8, "#3CC48A")}
    <path d="M6 14 L114 36" stroke="#14062E" stroke-width="1" shape-rendering="geometricPrecision"/>
    <g class="ma-ride">${r(-2, -2, 1, 5, "#14062E")}${r(-6, 3, 10, 7, "#E3000F")}${r(-4, 5, 2, 2, "#BDF4FF")}${r(0, 5, 2, 2, "#BDF4FF")}</g>
    ${r(100, 40, 1, 14, "#8B5A2B")}<g class="ma-wave" style="animation-name:maFlag">${r(101, 40, 10, 8, "#E3000F")}${r(105, 41, 2, 6, "#fff")}${r(103, 43, 6, 2, "#fff")}</g>
    ${MINI_G(18, 40, 1)}`);

  /* ---- neu: Die Römer (Tempel, Münzen, Lorbeer) ---- */
  const roemer = svg(`
    ${r(30, 14, 60, 4, "#F5E6C8")}<path d="M28 14 L60 2 L92 14 Z" fill="#E8D3A6" shape-rendering="geometricPrecision"/>
    ${[34, 46, 58, 70, 82].map(x => r(x, 18, 5, 26, "#F5E6C8") + r(x, 18, 1, 26, "#D9C49A")).join("")}
    ${r(26, 44, 68, 4, "#E8D3A6")}${r(22, 48, 76, 4, "#D9C49A")}
    <text x="60" y="12" font-size="5" font-weight="700" font-family="monospace" text-anchor="middle" fill="#8B5A2B">SPQR</text>
    <g class="ma-coin">${r(100, 14, 9, 9, "#FFC21A")}${r(103, 16, 3, 5, "#E3A300")}</g>
    <g class="ma-twinkle">${r(10, 8, 2, 2, "#FFE680")}${r(112, 34, 2, 2, "#fff")}</g>
    ${MINI_G(6, 38, 1.1)}${r(7, 36, 4, 2, "#3CC48A")}${r(15, 36, 4, 2, "#3CC48A")}`);

  /* ---- neu: Im Gespräch (Sprechblasen hin und her) ---- */
  const gespraech = svg(`
    <g class="ma-pop p1">${r(20, 6, 40, 14, "#fff")}${r(26, 20, 5, 4, "#fff")}${r(25, 11, 28, 2, "#B0BEC5")}${r(25, 15, 18, 2, "#B0BEC5")}</g>
    <g class="ma-pop p2">${r(60, 20, 42, 14, "#FFC21A")}${r(92, 34, 5, 4, "#FFC21A")}${r(65, 25, 30, 2, "#fff")}${r(65, 29, 22, 2, "#fff")}</g>
    <g class="ma-pop p3">${r(24, 36, 30, 12, "#3CC48A")}<text x="39" y="45" font-size="7" font-family="monospace" text-anchor="middle" fill="#fff">!?</text></g>
    ${MINI_G(100, 42, 1)}`);

  /* ---- neu: Wüste (Dünen, Sonne, Kaktus, Fennek Fenni, Hitzeflimmern) ---- */
  const wueste = svg(`
    <g class="ma-twinkle">${r(96, 6, 16, 16, "#FFC21A")}${r(100, 2, 8, 4, "#FFC21A")}${r(100, 22, 8, 4, "#FFC21A")}</g>
    <path d="M0 40 Q30 28 60 40 T120 38 L120 60 L0 60 Z" fill="#E8B04A" shape-rendering="geometricPrecision"/>
    <path d="M0 48 Q40 38 80 50 T120 46 L120 60 L0 60 Z" fill="#D49530" shape-rendering="geometricPrecision"/>
    ${r(20, 24, 4, 20, "#2E8B57")}${r(14, 30, 4, 8, "#2E8B57")}${r(18, 30, 2, 2, "#2E8B57")}${r(26, 27, 4, 8, "#2E8B57")}${r(24, 33, 2, 2, "#2E8B57")}
    <g class="ma-wave">${r(40, 18, 14, 1, "#FFF3D6")}${r(44, 22, 12, 1, "#FFF3D6")}</g>
    <g class="ma-bob">${r(76, 38, 12, 6, "#FF8A1F")}${r(74, 32, 3, 6, "#FF8A1F")}${r(85, 32, 3, 6, "#FF8A1F")}${r(76, 34, 12, 5, "#FF8A1F")}${r(78, 36, 2, 2, "#14062E")}${r(84, 36, 2, 2, "#14062E")}${r(81, 39, 2, 1, "#14062E")}${r(88, 40, 6, 2, "#FF8A1F")}${r(93, 38, 2, 2, "#FFF3D6")}${r(77, 44, 2, 3, "#C96A10")}${r(85, 44, 2, 3, "#C96A10")}</g>
    <g class="ma-coin" style="transform-origin:60px 30px">${r(56, 26, 8, 9, "#4FC3F7")}${r(58, 24, 4, 2, "#4FC3F7")}${r(57, 28, 2, 3, "#E1F5FE")}</g>`);

  /* ---- neu: Dschungel (Lianen, Blätter, Papagei, Glühwürmchen) ---- */
  const dschungel = svg(`
    ${r(0, 0, 120, 60, "#0F5132")}${r(0, 44, 120, 16, "#0B3D24")}
    ${[8, 30, 58, 84, 104].map((x, k) => `<g class="ma-pop p${(k % 3) + 1}">${r(x, 0, 2, 26 + (k % 3) * 6, "#3CC48A")}${r(x - 3, 20 + (k % 3) * 6, 8, 3, "#5FDC9F")}</g>`).join("")}
    ${r(0, 36, 22, 10, "#1F9D68")}${r(96, 34, 24, 12, "#1F9D68")}${r(40, 40, 30, 8, "#2BB57A")}
    <g class="ma-bob">${r(70, 18, 8, 10, "#E53935")}${r(70, 16, 6, 3, "#E53935")}${r(76, 17, 3, 2, "#FFC21A")}${r(71, 17, 2, 1, "#fff")}${r(68, 22, 3, 6, "#2E6BE6")}${r(72, 28, 3, 6, "#FFC21A")}</g>
    <g class="ma-twinkle">${r(20, 14, 2, 2, "#FFE680")}${r(50, 24, 2, 2, "#FFE680")}${r(92, 12, 2, 2, "#FFE680")}${r(110, 26, 2, 2, "#FFE680")}</g>`);

  /* ---- neu: Tundra (Schnee, Eisberg, Polarlicht, Schneeflocken) ---- */
  const tundra = svg(`
    ${r(0, 0, 120, 60, "#0B1D3A")}
    <g class="ma-wave">${r(0, 8, 120, 3, "#3CFF7A")}</g><g class="ma-wave w2">${r(0, 14, 120, 2, "#00E5FF")}</g>
    <path d="M0 44 L20 34 L34 40 L52 26 L70 40 L88 32 L120 42 L120 60 L0 60 Z" fill="#DDEBF7" shape-rendering="geometricPrecision"/>
    ${r(0, 50, 120, 10, "#FFFFFF")}${r(52, 26, 4, 4, "#FFFFFF")}
    <g class="ma-bob">${r(86, 40, 12, 9, "#FFFFFF")}${r(88, 38, 3, 3, "#FFFFFF")}${r(95, 38, 3, 3, "#FFFFFF")}${r(89, 43, 2, 2, "#14062E")}${r(94, 43, 2, 2, "#14062E")}${r(91, 46, 3, 1, "#14062E")}</g>
    <g class="ma-twinkle">${r(10, 22, 2, 2, "#fff")}${r(30, 28, 2, 2, "#fff")}${r(70, 20, 2, 2, "#fff")}${r(104, 26, 2, 2, "#fff")}${r(44, 18, 2, 2, "#fff")}</g>`);

  /* ---- neu: Lava (Vulkan, Lavaströme, Glut, Eiskristall) ---- */
  const lava = svg(`
    ${r(0, 0, 120, 60, "#2A0A12")}${r(0, 0, 120, 14, "#4A1020")}
    <path d="M30 60 L52 18 L68 18 L90 60 Z" fill="#4A2A26" shape-rendering="geometricPrecision"/>
    <path d="M52 18 L68 18 L64 24 L56 24 Z" fill="#FF6A00" shape-rendering="geometricPrecision"/>
    <g class="ma-wave">${r(57, 24, 3, 14, "#FF6A00")}${r(56, 38, 3, 8, "#FFC21A")}${r(63, 26, 2, 18, "#FF8A1F")}${r(62, 44, 3, 10, "#FF6A00")}</g>
    <g class="ma-pop p1">${r(54, 8, 4, 4, "#FFC21A")}</g><g class="ma-pop p2">${r(62, 4, 3, 3, "#FF6A00")}</g><g class="ma-pop p3">${r(68, 10, 3, 3, "#FFC21A")}</g>
    ${r(0, 52, 120, 8, "#1A0508")}<g class="ma-wave w2">${r(0, 54, 30, 2, "#FF6A00")}${r(88, 55, 32, 2, "#FF6A00")}</g>
    <g class="ma-coin" style="transform-origin:100px 26px">${r(97, 20, 6, 12, "#9EE3FF")}${r(95, 24, 10, 4, "#9EE3FF")}${r(99, 22, 2, 4, "#FFFFFF")}</g>
    <g class="ma-twinkle">${r(12, 18, 2, 2, "#FFC21A")}${r(24, 30, 2, 2, "#FF8A1F")}${r(108, 44, 2, 2, "#FFC21A")}</g>
    ${MINI_G(8, 38, 1)}`);

  H.modArt = {
    "mi-start": { c: "#8B5CFF", c2: "#3A1D7A", svg: hallo },
    "lab-prompt": { c: "#8B5CFF", c2: "#3A1D7A", svg: MOD_ART.prompt },
    "lab-fakenews": { c: "#DD4646", c2: "#5A1414", svg: MOD_ART.fakenews },
    "lab-kibilder": { c: "#00B3C7", c2: "#0B3E5A", svg: MOD_ART.kibilder },
    "de-wueste": { c: "#F2C14E", c2: "#B5651D", svg: wueste },
    "de-dschungel": { c: "#2BB57A", c2: "#0B3D24", svg: dschungel },
    "de-tundra": { c: "#5B8CFF", c2: "#0B1D3A", svg: tundra },
    "de-lava": { c: "#FF6A00", c2: "#2A0A12", svg: lava }
  };
  /* Bilder der Schweiz-Module (aus dem gLiTCh-Lab «NMG Schweiz») */
  ((window.GL_DATA && window.GL_DATA.LABMODS) || []).forEach(m => {
    const art = (window.GL_DATA.LABART || {})[m.id]; if (art) H.modArt["lab-" + m.id] = { c: m.c, c2: m.c2, svg: art };
  });
  H.themeArt = {
    hallo, prompt: MOD_ART.prompt, fakenews: MOD_ART.fakenews, kibilder: MOD_ART.kibilder,
    datenspuren: MOD_ART.datenspuren, werbung: MOD_ART.werbung, netiquette: MOD_ART.netiquette,
    schweiz, roemer, gespraech, wueste, dschungel, tundra, lava
  };
})();
