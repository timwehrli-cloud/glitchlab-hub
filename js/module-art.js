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

  /* ---- neu: Web-App-Galerie (sechs App-Kacheln, eine leuchtet auf) ---- */
  const galerie = svg(`
    ${r(0, 0, 120, 60, "#FFF8EE")}
    ${[["#1E88C7", 30, 10], ["#D3001A", 52, 10], ["#14836B", 74, 10], ["#5A3BD6", 30, 32], ["#E0498C", 52, 32], ["#7A5CC9", 74, 32]].map(([c, x, y], k) =>
      `<g>${r(x, y, 18, 18, c)}${r(x + 2, y + 2, 14, 9, "#FFFFFF")}${r(x + 4, y + 13, 10, 2, "#FFFFFF")}${r(x + 6, y + 4, 6, 4, c)}</g>`).join("")}
    <g class="ma-pop p2"><rect x="50" y="8" width="22" height="22" fill="none" stroke="#FFC21A" stroke-width="2"/></g>
    <g class="ma-twinkle">${r(22, 8, 2, 2, "#FFC21A")}${r(96, 48, 2, 2, "#FFC21A")}</g>
    ${MINI_G(96, 26, .8)}`);

  /* ---- neu: Spektakel fürs Ohr (Mikrofon, Schallwellen, Kopfhörer) ---- */
  const hoerspiel = svg(`
    ${r(0, 0, 120, 60, "#3A1600")}${r(0, 48, 120, 12, "#2A1000")}
    <g class="ma-twinkle">${r(10, 8, 2, 2, "#FFC21A")}${r(108, 12, 2, 2, "#FFE680")}${r(96, 44, 2, 2, "#FFC21A")}</g>
    ${r(52, 10, 16, 22, "#9AA3B5")}${r(54, 12, 12, 18, "#C9D1E0")}${[14, 18, 22, 26].map(y => r(54, y, 12, 1, "#7A8396")).join("")}
    ${r(58, 32, 4, 10, "#5E6676")}${r(50, 42, 20, 3, "#5E6676")}${r(46, 22, 3, 8, "#5E6676")}${r(71, 22, 3, 8, "#5E6676")}${r(46, 30, 28, 2, "#5E6676")}
    <g class="ma-wave">${r(30, 16, 2, 14, "#F28C28")}${r(24, 12, 2, 22, "#F28C28")}${r(86, 16, 2, 14, "#F28C28")}${r(92, 12, 2, 22, "#F28C28")}</g>
    <g class="ma-wave w2">${r(18, 18, 2, 10, "#FFC21A")}${r(98, 18, 2, 10, "#FFC21A")}</g>
    <g class="ma-pop p1">${r(8, 36, 14, 4, "#14062E")}${r(6, 32, 4, 10, "#F28C28")}${r(20, 32, 4, 10, "#F28C28")}</g>
    ${MINI_G(98, 34, .9)}`);
  /* Modul-Bilder: Tonstudio, Geschichte (Boot auf Wellen), Skript (Blatt und Traktor), Platzhalter */
  const hspStudio = svg(`
    ${r(0, 0, 120, 60, "#2A1A12")}${r(0, 40, 120, 20, "#4A2E1E")}
    ${r(30, 6, 60, 26, "#1B3A4A")}${r(32, 8, 56, 22, "#2E5A6E")}${[36, 44, 52, 60, 68, 76].map(x => r(x, 10, 4, 18, "#3E7088")).join("")}
    <g class="ma-blink">${r(54, 2, 12, 4, "#E53935")}</g>
    ${r(10, 38, 100, 8, "#3A3A44")}${Array.from({ length: 12 }, (_, i) => r(14 + i * 8, 40, 3, 4, i % 3 ? "#9AA3B5" : "#FFC21A")).join("")}
    <g class="ma-bob">${r(44, 18, 6, 8, "#FFD0A8")}${r(43, 16, 8, 3, "#5D3A1A")}${r(42, 20, 2, 3, "#14062E")}${r(50, 20, 2, 3, "#14062E")}</g>
    <g class="ma-bob" style="animation-delay:.5s">${r(70, 18, 6, 8, "#C98A5A")}${r(69, 16, 8, 3, "#14062E")}${r(68, 20, 2, 3, "#14062E")}${r(76, 20, 2, 3, "#14062E")}</g>
    <g class="ma-wave">${r(58, 22, 1, 6, "#3CFF7A")}${r(61, 20, 1, 8, "#3CFF7A")}${r(64, 23, 1, 4, "#3CFF7A")}</g>`);
  const hspGeschichte = svg(`
    ${r(0, 0, 120, 60, "#BFE6F2")}${r(0, 0, 120, 10, "#E6F6FB")}
    <g class="ma-twinkle">${r(100, 6, 10, 10, "#FFC21A")}</g>
    <path d="M0 40 Q15 34 30 40 T60 40 T90 40 T120 40 L120 60 L0 60 Z" fill="#1FA3C7" shape-rendering="geometricPrecision"/>
    <g class="ma-bob">${r(44, 32, 30, 6, "#E8E0CC")}${r(48, 38, 22, 3, "#B9AC8E")}${r(56, 20, 2, 12, "#5D3A1A")}${r(58, 20, 10, 8, "#F7F7F7")}
      ${r(48, 27, 4, 5, "#E5A65C")}${r(47, 25, 6, 2, "#E53935")}${r(66, 27, 4, 5, "#FFD0A8")}${r(65, 25, 6, 2, "#5D3A1A")}</g>
    <g class="ma-wave">${r(10, 46, 12, 1, "#E6F6FB")}${r(84, 48, 14, 1, "#E6F6FB")}</g>
    ${r(8, 12, 22, 16, "#C98A00")}${r(10, 14, 8, 12, "#FFF3D1")}${r(20, 14, 8, 12, "#FFF3D1")}${r(18, 12, 2, 16, "#8A5A00")}
    <text x="102" y="34" font-size="9" font-family="monospace" fill="#14062E">N</text>${r(103, 36, 2, 6, "#14062E")}`);
  const hspSkript = svg(`
    ${r(0, 0, 120, 60, "#5A1E12")}${r(0, 46, 120, 14, "#3A120A")}
    ${r(10, 6, 40, 48, "#FFF8EE")}${[12, 18, 24, 30, 36, 42].map((y, k) => r(14, y, 8, 2, "#E0533A") + r(24, y, 22 - (k % 3) * 4, 2, "#B0A89A")).join("")}
    <g class="ma-pop p2">${r(30, 23, 14, 4, "#FFC21A")}</g>
    <g class="ma-bob">${r(66, 30, 26, 12, "#2E9B4A")}${r(84, 20, 12, 14, "#2E9B4A")}${r(86, 22, 8, 6, "#BFE6F2")}${r(70, 26, 3, 6, "#5E6676")}
      ${r(64, 38, 14, 14, "#14062E")}${r(68, 42, 6, 6, "#9AA3B5")}${r(88, 42, 10, 10, "#14062E")}${r(91, 45, 4, 4, "#9AA3B5")}
      ${r(87, 23, 3, 4, "#FFD0A8")}${r(90, 23, 3, 4, "#E5A65C")}</g>
    <g class="ma-pop p1">${r(100, 10, 14, 8, "#fff")}<text x="107" y="16" font-size="5" font-family="monospace" text-anchor="middle" fill="#14062E">!!</text></g>`);
  const hspBald = (c, emo) => svg(`${r(0, 0, 120, 60, c)}<text x="60" y="38" font-size="24" text-anchor="middle" dominant-baseline="middle" style="font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${emo}</text><g class="ma-twinkle">${r(14, 10, 2, 2, "#FFE680")}${r(104, 44, 2, 2, "#FFE680")}</g>`);
  H.modArt = {
    "mi-start": { c: "#8B5CFF", c2: "#3A1D7A", svg: hallo },
    "lab-prompt": { c: "#8B5CFF", c2: "#3A1D7A", svg: MOD_ART.prompt },
    "lab-fakenews": { c: "#DD4646", c2: "#5A1414", svg: MOD_ART.fakenews },
    "lab-kibilder": { c: "#00B3C7", c2: "#0B3E5A", svg: MOD_ART.kibilder },
    "de-wueste": { c: "#F2C14E", c2: "#B5651D", svg: wueste },
    "de-dschungel": { c: "#2BB57A", c2: "#0B3D24", svg: dschungel },
    "de-tundra": { c: "#5B8CFF", c2: "#0B1D3A", svg: tundra },
    "de-lava": { c: "#FF6A00", c2: "#2A0A12", svg: lava },
    "mi-app-galerie": { c: "#7B4CEF", c2: "#FFF8EE", svg: galerie },
    "de-hsp-tonstudio": { c: "#F28C28", c2: "#2A1A12", svg: hspStudio },
    "de-hsp-geschichte": { c: "#1FA3C7", c2: "#0B3E5A", svg: hspGeschichte },
    "de-hsp-skript": { c: "#E0533A", c2: "#3A120A", svg: hspSkript },
    "de-hsp-erzaehler": { c: "#4A3A6E", c2: "#1A1030", svg: hspBald("#2A1F44", "🐦‍⬛") },
    "de-hsp-vertiefung": { c: "#C98A00", c2: "#4A2E00", svg: hspBald("#4A2E00", "📝") },
    "de-hsp-abschluss": { c: "#1FA3C7", c2: "#0B3E5A", svg: hspBald("#0B3E5A", "👂") },
    "de-hsp-wahl1": { c: "#2E9B4A", c2: "#0B3D24", svg: hspBald("#0B3D24", "🚐") },
    "de-hsp-wahl2": { c: "#7A5CC9", c2: "#24104F", svg: hspBald("#24104F", "🏰") },
    "de-hsp-wahl3": { c: "#E0533A", c2: "#3A120A", svg: hspBald("#3A120A", "✍️") }
  };
  /* Bilder der Schweiz-Module (aus dem gLiTCh-Lab «NMG Schweiz») */
  ((window.GL_DATA && window.GL_DATA.LABMODS) || []).forEach(m => {
    const art = (window.GL_DATA.LABART || {})[m.id]; if (art) H.modArt["lab-" + m.id] = { c: m.c, c2: m.c2, svg: art };
  });
  H.themeArt = {
    hallo, prompt: MOD_ART.prompt, fakenews: MOD_ART.fakenews, kibilder: MOD_ART.kibilder,
    datenspuren: MOD_ART.datenspuren, werbung: MOD_ART.werbung, netiquette: MOD_ART.netiquette,
    schweiz, roemer, gespraech, wueste, dschungel, tundra, lava, hoerspiel
  };
})();
