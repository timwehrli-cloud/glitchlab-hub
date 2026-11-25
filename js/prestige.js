/* =====================================================================
   Glitchlab · Prestige ab Level 100
   Die Sterne bleiben alle erhalten. Ab Level 100 gibt es alle 300 Sterne
   einen Prestige-Rang (I bis X), danach 10 Ultra-Ränge mit Blitzen
   und Spezialeffekten (Ultra I bis X), danach «Blitz-Legende ★2, ★3 …».
   Pro Rang: animierter Hintergrund, Diplom, Beschwörungs-Emote, animierter Skin.
   Die Hintergründe nutzen die Animationen «pb-…» (stehen im Zimmer, tools/prestige_patch_page.py).
   ===================================================================== */
(function () {
  const r = (x, y, w, h, f, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${extra}/>`;
  const stars = (pts, c = "#fff", cls = "pb-tw") => pts.map(([x, y, s = 1], k) => `<g class="${cls}" style="animation-delay:${(k * .37) % 2.2}s">${r(x, y, s, s, c)}</g>`).join("");

  const RANKS = [
    { n: "Bronze", ic: "🥉", c: "#C47A3A", c2: "#5A2E10",
      bg: { n: "Bronze-Schmiede", wand: ["#140804", "#3A1C0C"], boden: ["#3A2A22", "#2A1C18", "#1C1210"],
        svg: `<circle cx="132" cy="40" r="20" fill="#FF8A1F" opacity=".22" class="pb-pulse"/><rect x="116" y="30" width="32" height="26" rx="3" fill="#3A2418"/><path d="M120 56V40a12 10 0 0 1 24 0v16z" fill="#1A0C06"/><g class="pb-flick"><path d="M124 56c0-6 3-8 4-12 2 4 4 5 4 9 1-3 3-5 3-8 3 5 5 7 5 11z" fill="#FF6A00"/><path d="M128 56c0-3 2-4 3-7 1 3 3 4 3 7z" fill="#FFC21A"/></g>`
          + `<path d="M30 52h26l-4 4H34zM38 52v-6h12v6M34 46h20" fill="#4A3A36" stroke="#2A1C18" stroke-width=".8"/>` + [0, 1, 2, 3, 4, 5, 6].map(k => `<g class="pb-rise" style="animation-delay:${k * .45}s">${r(124 + (k * 5) % 18, 34, 1.4, 1.4, k % 2 ? "#FFC21A" : "#FF6A00")}</g>`).join("")
          + `<path d="M8 4v18M14 4v12M20 4v22" stroke="#7A5A3A" stroke-width="1" stroke-dasharray="2 1"/><g class="pb-swing" style="transform-origin:20px 4px"><circle cx="20" cy="28" r="3" fill="none" stroke="#C47A3A" stroke-width="1.4"/></g>` },
      dip: { n: "Prestige I · Bronze", emoji: "🥉", wand: "medaille" },
      emote: { n: "Amboss-Schlag", ic: "🔨", text: "KLONG!", sum: "smash", farben: ["#C47A3A", "#FFC21A", "#FF6A00"], d: "Ein Schmiedehammer erscheint aus dem Portal und schlägt Funken direkt neben gLiTCh." },
      skin: { n: "Bronze-Glut", base: "#B8733A", fx: "glow" } },
    { n: "Silber", ic: "🥈", c: "#B8C2D2", c2: "#2A3448",
      bg: { n: "Silberne Mondnacht", wand: ["#060A1C", "#162042"], boden: ["#2A3550", "#202A42", "#161E32"],
        svg: `<circle cx="128" cy="20" r="17" fill="#E8EEF8" opacity=".1" class="pb-pulse"/><path d="M124 7a13 13 0 1 0 14 19a10.5 10.5 0 1 1 -14 -19z" fill="#E8EEF8"/><circle cx="121" cy="19" r="1.4" fill="#C9D3E0"/><circle cx="125" cy="27" r="1" fill="#C9D3E0"/>`
          + stars([[10, 8], [24, 22], [40, 6], [56, 16, 1.4], [72, 4], [88, 24], [100, 10], [148, 34], [14, 40], [60, 34], [146, 8]], "#fff")
          + `<g class="pb-shoot">${r(30, 10, 10, .8, "#fff")}${r(28, 10, 2, .8, "#B8C2D2")}</g><g class="pb-shoot" style="animation-delay:2.5s">${r(80, 6, 8, .8, "#fff")}</g>`
          + `<path d="M0 60l20-16 16 8 22-18 18 14 20-10 24 14 20-8 20 16z" fill="#1C2A48"/>` },
      dip: { n: "Prestige II · Silber", emoji: "🥈", wand: "medaille" },
      emote: { n: "Mond-Ritt", ic: "🌙", text: "Huiii!", sum: "ride", farben: ["#E8EEF8", "#B8C2D2", "#7FB2FF"], d: "Eine Mondsichel fliegt heran, gLiTCh setzt sich darauf und reitet eine Runde durch die Sterne." },
      skin: { n: "Silbermond", base: "#AEB8C8", fx: "shine" } },
    { n: "Bernstein", ic: "🔶", c: "#E8A317", c2: "#5A3A08",
      bg: { n: "Bernstein-Schatzkammer", wand: ["#1C1004", "#3E2608"], boden: ["#3A2612", "#2E1E0C", "#221608"],
        svg: [[18, 52], [40, 54], [110, 52], [140, 54]].map(([x, y]) => `<path d="M${x - 10} ${y + 6}c2-8 18-8 20 0z" fill="#E8A317"/>${[0, 1, 2].map(k => r(x - 6 + k * 4, y - 2 + (k % 2), 3, 2, "#FFD45A")).join("")}`).join("")
          + `<rect x="66" y="40" width="28" height="18" rx="2" fill="#7A4A10" stroke="#3A2208" stroke-width="1"/><path d="M66 46h28" stroke="#E8A317" stroke-width="1.2"/><rect x="77" y="44" width="6" height="5" fill="#E8A317"/><circle cx="80" cy="42" r="12" fill="#FFD45A" opacity=".18" class="pb-pulse"/>`
          + stars([[22, 44, 1.4], [44, 46, 1.4], [112, 44, 1.4], [138, 46, 1.4], [80, 30, 1.6], [60, 20], [100, 18]], "#FFF3B0") },
      dip: { n: "Prestige III · Bernstein", emoji: "🔶", wand: "schild" },
      emote: { n: "Schatz-Regen", ic: "💰", text: "Reich!", sum: "chest", farben: ["#E8A317", "#FFD45A", "#FFF3B0"], d: "Ein Geldsack fällt aus dem Portal, gLiTCh springt drauf und es regnet Münzen." },
      skin: { n: "Bernstein", base: "#E8A317", fx: "pulse" } },
    { n: "Smaragd", ic: "❇️", c: "#19B36B", c2: "#0B3D24",
      bg: { n: "Smaragd-Zauberwald", wand: ["#030F07", "#082A1A"], boden: ["#2A4A2A", "#1F3A1F", "#142A14"],
        svg: [[10, 22], [34, 18], [124, 20], [148, 24]].map(([x, y]) => `<path d="M${x} ${y}l-10 22h20z M${x} ${y + 10}l-12 22h24z" fill="#0B3D24"/>${r(x - 1.5, y + 32, 3, 8, "#3A2A1A")}`).join("")
          + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => `<g class="pb-float" style="animation-delay:${k * .5}s"><g class="pb-tw" style="animation-delay:${k * .3}s"><circle cx="${20 + k * 15}" cy="${16 + (k * 13) % 30}" r="1.3" fill="#B7FF6A"/><circle cx="${20 + k * 15}" cy="${16 + (k * 13) % 30}" r="3" fill="#B7FF6A" opacity=".25"/></g></g>`).join("")
          + `<circle cx="80" cy="30" r="9" fill="#19B36B" opacity=".2" class="pb-pulse"/><path d="M80 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#B7FF6A" class="pb-spin" style="transform-origin:80px 30px"/>` },
      dip: { n: "Prestige IV · Smaragd", emoji: "❇️", wand: "rolle" },
      emote: { n: "Zauberstab", ic: "🪄", text: "Simsalabim!", sum: "wand", farben: ["#19B36B", "#B7FF6A", "#FFFFFF"], d: "gLiTCh beschwört einen Zauberstab und lässt Funken in einer Spirale um sich wirbeln." },
      skin: { n: "Smaragd", base: "#19B36B", fx: "hue" } },
    { n: "Saphir", ic: "🔷", c: "#2F6BFF", c2: "#0B1D4A",
      bg: { n: "Saphir-Tiefsee", wand: ["#020A18", "#06204A"], boden: ["#122A42", "#0E223A", "#0A1A2E"],
        svg: [30, 70, 110].map((x, k) => `<path d="M${x} 0l-10 60h20z" fill="#7FB2FF" opacity=".08" class="pb-pulse" style="animation-delay:${k * .7}s"/>`).join("")
          + [0, 1, 2, 3, 4, 5, 6, 7].map(k => `<g class="pb-rise" style="animation-delay:${k * .6}s"><circle cx="${12 + k * 19}" cy="56" r="${1 + (k % 3) * .6}" fill="none" stroke="#BFE3FF" stroke-width=".6"/></g>`).join("")
          + `<g class="pb-drift"><path d="M40 30c4-4 10-4 14 0-4 4-10 4-14 0zM54 30l5-3v6z" fill="#FFC21A"/><circle cx="44" cy="29.4" r=".7" fill="#111"/></g><g class="pb-drift" style="animation-delay:-3s;animation-direction:reverse"><path d="M110 18c3-3 8-3 11 0-3 3-8 3-11 0zM121 18l4-2v4z" fill="#FF6FAE"/></g>`
          + `<path d="M0 60c6-10 10-10 12 0M16 60c4-14 8-14 10 0M140 60c4-12 10-12 12 0" fill="#19B36B" class="pb-sway"/>` },
      dip: { n: "Prestige V · Saphir", emoji: "🔷", wand: "schild" },
      emote: { n: "Delfin-Sprung", ic: "🐬", text: "Platsch!", sum: "jump", farben: ["#2F6BFF", "#7FB2FF", "#BFE3FF"], d: "Ein Delfin springt aus dem Portal in hohem Bogen über gLiTCh, und es spritzt überall." },
      skin: { n: "Saphir", base: "#2F6BFF", fx: "wave" } },
    { n: "Rubin", ic: "♦️", c: "#E0234E", c2: "#4A0614",
      bg: { n: "Rubin-Drachenhöhle", wand: ["#0E0204", "#32060E"], boden: ["#3A1A1A", "#2A1212", "#1C0A0A"],
        svg: [8, 26, 50, 78, 104, 130, 152].map((x, k) => `<path d="M${x - 5} 0l5 ${8 + (k % 3) * 5}l5-${8 + (k % 3) * 5}z" fill="#2A0A10"/>`).join("")
          + `<g class="pb-blink"><circle cx="112" cy="34" r="1.6" fill="#FFC21A"/><circle cx="120" cy="34" r="1.6" fill="#FFC21A"/></g><path d="M104 40c6-6 18-6 24 0" stroke="#3A0A12" stroke-width="3" fill="none"/>`
          + [0, 1, 2, 3, 4, 5, 6, 7].map(k => `<g class="pb-rise" style="animation-delay:${k * .5}s">${r(10 + k * 18, 56, 1.4, 1.4, k % 2 ? "#FF6A00" : "#E0234E")}</g>`).join("")
          + `<path d="M30 44l6-10 6 10-6 6z" fill="#E0234E" class="pb-pulse"/><path d="M36 34v16M30 44h12" stroke="#FF8AA0" stroke-width=".5"/>` },
      dip: { n: "Prestige VI · Rubin", emoji: "♦️", wand: "pokal" },
      emote: { n: "Mini-Drache", ic: "🐉", text: "FAUCH!", sum: "dragon", farben: ["#E0234E", "#FF6A00", "#FFC21A"], d: "Ein kleiner Drache kreist zweimal um gLiTCh und speit dann einen Feuerstoss." },
      skin: { n: "Rubinfeuer", base: "#E0234E", fx: "flicker" } },
    { n: "Amethyst", ic: "🔮", c: "#9B4DFF", c2: "#2A0B5A",
      bg: { n: "Amethyst-Sternennebel", wand: ["#09021A", "#22083E"], boden: ["#2A1A4A", "#20123A", "#160C2A"],
        svg: `<g class="pb-hue"><ellipse cx="50" cy="24" rx="40" ry="12" fill="#FF2BD6" opacity=".18"/><ellipse cx="110" cy="30" rx="44" ry="14" fill="#9B4DFF" opacity=".22"/><ellipse cx="80" cy="18" rx="30" ry="8" fill="#00E5FF" opacity=".12"/></g>`
          + `<g class="pb-spin" style="transform-origin:80px 28px"><path d="M80 28m-14 0a14 6 0 1 0 28 0a14 6 0 1 0 -28 0" fill="none" stroke="#D6B8FF" stroke-width=".6" stroke-dasharray="3 2"/></g><circle cx="80" cy="28" r="3" fill="#F3E8FF"/>`
          + stars([[8, 10], [20, 40], [36, 6], [64, 46], [96, 8], [120, 44], [140, 12], [152, 36], [28, 22, 1.4], [132, 24, 1.4]], "#F3E8FF") },
      dip: { n: "Prestige VII · Amethyst", emoji: "🔮", wand: "stern" },
      emote: { n: "Teleport-Portal", ic: "🌀", text: "Zapp!", sum: "portal", farben: ["#9B4DFF", "#FF2BD6", "#00E5FF"], d: "Ein Portal öffnet sich, gLiTCh springt hinein, verschwindet und taucht aus einem zweiten Portal wieder auf." },
      skin: { n: "Amethyst", base: "#9B4DFF", fx: "nebula" } },
    { n: "Diamant", ic: "💎", c: "#7FE3FF", c2: "#0B3E5A",
      bg: { n: "Diamant-Kristallpalast", wand: ["#05141F", "#123A52"], boden: ["#2A3E4E", "#223442", "#1A2A36"],
        svg: [[14, 30, 10], [36, 36, 7], [124, 28, 12], [148, 38, 7], [80, 14, 8]].map(([x, y, s], k) => `<g class="pb-shine" style="animation-delay:${k * .5}s"><path d="M${x} ${y - s * 2}l${s} ${s * 2}-${s} ${s * 2.4}-${s}-${s * 2.4}z" fill="#7FC8E0" opacity=".55"/><path d="M${x} ${y - s * 2}v${s * 4.4}M${x - s} ${y}h${s * 2}" stroke="#fff" stroke-width=".5" opacity=".7"/></g>`).join("")
          + stars([[28, 12, 1.6], [60, 20, 1.4], [100, 10, 1.6], [140, 16, 1.4], [70, 44, 1.4], [110, 46, 1.6]], "#FFFFFF")
          + `<path d="M50 60V40l30-14 30 14v20" fill="none" stroke="#BFF4FF" stroke-width="1" opacity=".5"/>` },
      dip: { n: "Prestige VIII · Diamant", emoji: "💎", wand: "rahmen" },
      emote: { n: "Diamant-Schild", ic: "💎", text: "Unzerstörbar!", sum: "shield", farben: ["#7FE3FF", "#BFF4FF", "#FFFFFF"], d: "Drei Diamanten erscheinen und kreisen als funkelnder Schutzschild um gLiTCh." },
      skin: { n: "Diamant", base: "#9FE7FF", fx: "sparkle" } },
    { n: "Kosmos", ic: "🪐", c: "#5B6CFF", c2: "#060818",
      bg: { n: "Kosmos-Station", wand: ["#010104", "#0A0E24"], boden: ["#2A2E44", "#1E2236", "#14182A"],
        svg: stars([[6, 6], [18, 30], [30, 12], [44, 44], [58, 8], [76, 38], [92, 6], [104, 30], [118, 10], [150, 40], [140, 22], [66, 24]], "#fff")
          + `<circle cx="34" cy="28" r="9" fill="#FF8A5B"/><path d="M22 30c8-5 18-5 24-2" stroke="#FFD4A8" stroke-width="1.4" fill="none"/><circle cx="34" cy="28" r="14" fill="none" stroke="#FFD4A8" stroke-width=".6" opacity=".4"/>`
          + `<g class="pb-spin" style="transform-origin:126px 26px"><circle cx="126" cy="26" r="6" fill="#5B6CFF"/><circle cx="138" cy="26" r="2" fill="#BFC8FF"/></g>`
          + `<g class="pb-drift"><path d="M70 18l6-3 6 3-6 3z" fill="#BFC8FF"/>${r(75, 18, 2, 6, "#7FE3FF", ' opacity=".5"')}</g><g class="pb-shoot" style="animation-delay:1s">${r(96, 8, 10, .8, "#fff")}</g>` },
      dip: { n: "Prestige IX · Kosmos", emoji: "🪐", wand: "stern" },
      emote: { n: "UFO-Entführung", ic: "🛸", text: "Beam me up!", sum: "beam", farben: ["#5B6CFF", "#7FE3FF", "#3CFF7A"], d: "Ein UFO schwebt herbei, beamt gLiTCh im Lichtstrahl hoch und setzt ihn sanft wieder ab." },
      skin: { n: "Kosmos", base: "#3A44C8", fx: "cosmos" } },
    { n: "Regenbogen", ic: "🌈", c: "#FF3D7F", c2: "#14062E",
      bg: { n: "Glitch-Dimension", wand: ["#05020C", "#160634"], boden: ["#120828", "#0E0620", "#0A0418"],
        svg: `<g opacity=".35">${Array.from({ length: 9 }, (_, k) => `<path d="M${k * 20} 0v60" stroke="#00E5FF" stroke-width=".4"/>`).join("")}${Array.from({ length: 4 }, (_, k) => `<path d="M0 ${k * 15 + 6}h160" stroke="#FF2BD6" stroke-width=".4"/>`).join("")}</g>`
          + `<g class="pb-hue">${["#FF3D7F", "#FFC21A", "#3CFF7A", "#00E5FF", "#9B4DFF"].map((c, k) => `<path d="M30 54a50 ${40 - k * 6} 0 0 1 100 0" stroke="${c}" stroke-width="2.4" fill="none" opacity=".45" transform="translate(0 ${k * 3})"/>`).join("")}</g>`
          + [[12, 10, "#00E5FF"], [140, 14, "#FF2BD6"], [60, 6, "#3CFF7A"], [104, 40, "#FFC21A"]].map(([x, y, c], k) => `<g class="pb-glitch" style="animation-delay:${k * .7}s">${r(x, y, 10, 3, c)}${r(x + 3, y + 3, 6, 2, c, ' opacity=".6"')}</g>`).join("")
          + `<g class="pb-scan">${r(0, 0, 160, 1.2, "#fff", ' opacity=".18"')}</g>` },
      dip: { n: "Prestige X · Regenbogen", emoji: "🌈", wand: "pokal" },
      emote: { n: "Pixel-Krone", ic: "👑", text: "LEGENDE!", sum: "crown", farben: ["#FF3D7F", "#FFC21A", "#3CFF7A", "#00E5FF", "#9B4DFF"], d: "Eine Pixel-Krone schwebt aus dem Portal auf gLiTChs Kopf, und ein Regenbogen-Feuerwerk geht los." },
      skin: { n: "Regenbogen", base: "#FF3D7F", fx: "rainbow" } }
  ];

  /* ---------- Ultra-Prestige (Rang 11–20): Blitze und Spezialeffekte ----------
     Neue Animationen «pb-bolt», «pb-flashw», «pb-current», «pb-orbit», «pb-ring», «pb-beam», «pb-spinf», «pb-arc» (css/style.css, Abschnitt «Ultra-Prestige»). */
  const zz = (x, y, h, k = 0) => { const s = [3, -2.6, 2.2, -3, 1.6], p = [[x, y]]; for (let i = 1; i <= 5; i++) p.push([x + (i < 5 ? s[(i + k) % 5] : 0), y + h * i / 5]); return "M" + p.map(q => q.map(v => +v.toFixed(1)).join(" ")).join("L"); };
  const bolt = (x, y, h, c, d = 0, w = 1.1, k = 0) => { const dd = zz(x, y, h, k);
    return `<g class="pb-bolt" style="animation-delay:${d}s"><path d="${dd}" stroke="${c}" stroke-width="${w * 3}" opacity=".3" fill="none" stroke-linejoin="round"/><path d="${dd}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linejoin="round"/><path d="${dd}" stroke="#fff" stroke-width="${w * .4}" fill="none" stroke-linejoin="round"/></g>`; };
  const arcH = (x1, x2, y, k) => { const n = 8, pts = []; for (let i = 0; i <= n; i++) pts.push([x1 + (x2 - x1) * i / n, y + (i % n ? ((i + k) % 2 ? -1 : 1) * (1.5 + ((i * 7 + k * 3) % 4)) : 0)]); return "M" + pts.map(q => q.join(" ")).join("L"); };
  const flashW = (c = "#fff", d = 0) => `<g class="pb-flashw" style="animation-delay:${d}s">${r(0, 0, 160, 60, c)}</g>`;
  const rain = (n, c) => Array.from({ length: n }, (_, k) => `<g class="pb-fall" style="animation-delay:${(k * .41) % 3.2}s;animation-duration:${1.4 + (k % 3) * .3}s">${r((k * 37) % 158, -4 + (k * 13) % 10, .5, 4, c, ' opacity=".7"')}</g>`).join("");
  const ULTRA = [
    { n: "Funke", ic: "⚡", c: "#FFE14D", c2: "#3A2E00",
      bg: { n: "Tesla-Labor", wand: ["#07070F", "#1C1A2E"], boden: ["#2A2A33", "#22222A", "#1A1A20"],
        svg: [26, 134].map(x => `<rect x="${x - 7}" y="50" width="14" height="6" fill="#3A3A44"/><rect x="${x - 4}" y="22" width="8" height="28" fill="#B87333"/>` + [24, 27, 30, 33, 36, 39, 42, 45].map(y => r(x - 4, y, 8, .7, "#7A4A1E")).join("") + `<ellipse cx="${x}" cy="18" rx="9" ry="4.4" fill="#C9D3E0"/><ellipse cx="${x}" cy="17" rx="7" ry="2.6" fill="#EAF0F8"/>`).join("")
          + [0, 1, 2].map(k => `<g class="pb-arc" style="animation-delay:${k * .23}s"><path d="${arcH(35, 125, 18 + (k - 1) * 3, k)}" stroke="#FFE14D" stroke-width="2.4" opacity=".3" fill="none"/><path d="${arcH(35, 125, 18 + (k - 1) * 3, k)}" stroke="#fff" stroke-width=".7" fill="none"/></g>`).join("")
          + [0, 1, 2, 3, 4, 5].map(k => `<g class="pb-rise" style="animation-delay:${k * .5}s">${r(70 + (k * 7) % 22, 30, 1, 1, k % 2 ? "#FFE14D" : "#7FE3FF")}</g>`).join("")
          + `<path d="M80 38l7 12H73z" fill="#FFE14D" stroke="#14062E" stroke-width=".8"/><path d="M80.6 41l-2 4.4h2.4l-1.6 3.4" stroke="#14062E" stroke-width=".9" fill="none"/>` },
      dip: { n: "Ultra-Prestige I · Funke", emoji: "⚡", wand: "stern" },
      emote: { n: "Funken-Sprung", ic: "⚡", text: "BZZZT!", sum: "zap", farben: ["#FFE14D", "#FFFFFF", "#7FE3FF"], d: "Dreimal schlägt ein Blitz neben gLiTCh ein. Beim letzten Mal stehen ihm alle Pixel zu Berge!" },
      skin: { n: "Funkengelb", base: "#F2C21A", fx: "zap" } },
    { n: "Donner", ic: "🌩️", c: "#7FA8FF", c2: "#101A36",
      bg: { n: "Gewitternacht", wand: ["#03050C", "#18213A"], boden: ["#1E2A30", "#18222A", "#121A20"],
        svg: flashW("#BFD4FF") + flashW("#BFD4FF", 1.9) + `<path d="M0 60l14-10 12 4 18-12 16 10 20-6 18 12 14-8 22 6 26-8v12z" fill="#0A1020"/><path d="M118 52v-14M118 42l-5-4M118 45l5-5" stroke="#0A1020" stroke-width="2.2"/>`
          + bolt(42, 8, 44, "#BFD4FF", 0, 1.3) + bolt(118, 8, 30, "#FFE14D", 1.9, 1.2, 2)
          + `<g class="pb-drift">${[[20, 6, 22], [52, 4, 26], [92, 7, 24], [132, 5, 26]].map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="5" fill="#2A3350"/><ellipse cx="${x + 6}" cy="${y - 2}" rx="${w / 3}" ry="4" fill="#35405F"/>`).join("")}</g>` + rain(26, "#7FA8FF") },
      dip: { n: "Ultra-Prestige II · Donner", emoji: "🌩️", wand: "schild" },
      emote: { n: "Gewitterwolke", ic: "⛈️", text: "KRAWUMM!", sum: "storm", farben: ["#BFD4FF", "#FFE14D", "#7FA8FF"], d: "Eine Gewitterwolke zieht über gLiTCh auf. Es regnet, donnert und blitzt rundherum." },
      skin: { n: "Gewittergrau", base: "#5B6C8F", fx: "storm" } },
    { n: "Kugelblitz", ic: "💠", c: "#7FE3FF", c2: "#06303C",
      bg: { n: "Kugelblitz-Höhle", wand: ["#02090E", "#0B2A36"], boden: ["#1C2A2E", "#152024", "#0E171A"],
        svg: `<path d="M0 0h160v6l-8 7-6-7-10 10-7-10-12 6-9-6-11 12-8-12-10 8-8-8-12 10-9-10-10 6-8-6-12 9-8-9-6 5z" fill="#061418"/>`
          + [[34, 28, 6, 0], [80, 20, 8, 1.3], [124, 32, 5, 2.4], [58, 42, 3.4, .7], [104, 44, 4, 1.9]].map(([x, y, s, d]) => `<g class="pb-float" style="animation-delay:${d}s"><g class="pb-pulse"><circle cx="${x}" cy="${y}" r="${s * 2}" fill="#7FE3FF" opacity=".12"/></g><circle cx="${x}" cy="${y}" r="${s * 1.2}" fill="#7FE3FF" opacity=".35"/><circle cx="${x}" cy="${y}" r="${s * .7}" fill="#E6FBFF"/>`
            + `<g class="pb-arc" style="animation-delay:${d}s"><path d="M${x + s} ${y - s * .4}l${s * .8} -${s * .6} ${s * .2} ${s * .9} ${s} -${s * .4}" stroke="#BFF4FF" stroke-width=".5" fill="none"/><path d="M${x - s} ${y + s * .3}l-${s * .7} ${s * .5} -${s * .2} -${s * .8} -${s * .9} ${s * .3}" stroke="#BFF4FF" stroke-width=".5" fill="none"/></g></g>`).join("") },
      dip: { n: "Ultra-Prestige III · Kugelblitz", emoji: "💠", wand: "medaille" },
      emote: { n: "Kugelblitz-Wirbel", ic: "💠", text: "Wuuusch!", sum: "shield", farben: ["#7FE3FF", "#E6FBFF", "#39C6F0"], d: "Drei Kugelblitze sausen aus dem Portal und kreisen knisternd um gLiTCh." },
      skin: { n: "Kugelblitz", base: "#39C6F0", fx: "orb" } },
    { n: "Plasma", ic: "🔮", c: "#E040FB", c2: "#3A0A4A",
      bg: { n: "Plasma-Kugel", wand: ["#0B0314", "#2A0A3E"], boden: ["#1A0A26", "#140820", "#0E0518"],
        svg: `<path d="M66 56l4-6h20l4 6z" fill="#2A2A33"/><rect x="70" y="48" width="20" height="3" fill="#3A3A44"/><circle cx="80" cy="27" r="22" fill="#14062E" opacity=".85"/>`
          + `<g class="pb-spinf" style="transform-origin:80px 27px;animation-duration:18s">${Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4, x2 = 80 + Math.cos(a) * 21, y2 = 27 + Math.sin(a) * 21, mx = 80 + Math.cos(a + .5) * 10, my = 27 + Math.sin(a + .5) * 10;
            return `<g class="pb-arc" style="animation-delay:${k * .17}s"><path d="M80 27Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#FF7AF5" stroke-width="2" opacity=".35" fill="none"/><path d="M80 27Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#FFD6FB" stroke-width=".6" fill="none"/><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="1.2" fill="#FF7AF5"/></g>`; }).join("")}</g>`
          + `<circle cx="80" cy="27" r="4.4" fill="#E040FB" class="pb-pulse"/><circle cx="80" cy="27" r="2" fill="#fff"/><circle cx="80" cy="27" r="22" fill="none" stroke="#C9B8FF" stroke-width=".8" opacity=".6"/><path d="M66 14a18 18 0 0 1 10-6" stroke="#fff" stroke-width="1.2" opacity=".45" fill="none"/>`
          + stars([[12, 10], [30, 30], [140, 12], [150, 38], [118, 6], [20, 44]], "#FF7AF5") },
      dip: { n: "Ultra-Prestige IV · Plasma", emoji: "🔮", wand: "stern" },
      emote: { n: "Plasma-Entladung", ic: "🔮", text: "ZAAAP!", sum: "nova", farben: ["#E040FB", "#FF7AF5", "#7FE3FF"], d: "gLiTCh lädt sich mit Plasma auf und entlädt sich in leuchtenden Druckwellen." },
      skin: { n: "Plasma", base: "#B03CE0", fx: "plasma" } },
    { n: "Neonstrom", ic: "🔌", c: "#3CFF7A", c2: "#06301A",
      bg: { n: "Neon-Schaltkreis", wand: ["#010804", "#06261A"], boden: ["#0A1A12", "#08140E", "#050E0A"],
        svg: (() => { const P = ["M0 14h30v12h24v-8h30v16h22v-10h54", "M0 40h18v-8h28v14h26v-6h30v10h20v-12h38", "M44 0v10h20v8M112 0v14h-10v8M130 60v-14h12v-10", "M70 60v-10h-18v-6M8 60v-12h14"];
          return P.map(d => `<path d="${d}" stroke="#0E3A22" stroke-width="1.6" fill="none"/>`).join("") + P.map((d, k) => `<path class="pb-current" style="animation-delay:${k * .4}s" d="${d}" stroke="${k % 2 ? "#00E5FF" : "#3CFF7A"}" stroke-width="1.2" fill="none" stroke-dasharray="8 46"/>`).join("")
            + [[50, 22], [100, 30], [26, 36], [128, 18]].map(([x, y], k) => `<rect x="${x - 6}" y="${y - 4}" width="12" height="8" rx="1" fill="#10161A" stroke="#2A3A30" stroke-width=".6"/>${[0, 1, 2].map(i => r(x - 5 + i * 4, y - 6, 1, 2, "#7A8A80") + r(x - 5 + i * 4, y + 4, 1, 2, "#7A8A80")).join("")}<g class="pb-blink" style="animation-delay:${k * .6}s">${r(x + 3, y - 2, 1.4, 1.4, k % 2 ? "#FF2BD6" : "#3CFF7A")}</g>`).join(""); })() },
      dip: { n: "Ultra-Prestige V · Neonstrom", emoji: "🔌", wand: "schild" },
      emote: { n: "Kurzschluss", ic: "🔌", text: "Kurzschluss!", sum: "zap", farben: ["#3CFF7A", "#00E5FF", "#FFFFFF"], d: "Grüne Neon-Blitze zucken um gLiTCh. Sein Bildschirm flackert kurz. Hoppla!" },
      skin: { n: "Neon-Grün", base: "#22D36A", fx: "neon" } },
    { n: "Polarsturm", ic: "🌌", c: "#00FFC8", c2: "#032A2A",
      bg: { n: "Polarlicht-Sturm", wand: ["#010510", "#0A1A2E"], boden: ["#DDE8F2", "#C9D8E6", "#B5C7D8"],
        svg: stars([[10, 6], [34, 14], [62, 4], [96, 10], [128, 4], [150, 16], [20, 22], [140, 28]], "#fff")
          + `<g class="pb-hue">${[["#00FFC8", 0], ["#3CFF7A", 4], ["#9B4DFF", 8]].map(([c, o], k) => `<g class="pb-sway" style="animation-delay:${k * .8}s"><path d="M-4 ${24 + o}c20-14 34 10 54-2s30-16 50-2 28 8 64-6" stroke="${c}" stroke-width="${7 - k * 1.5}" opacity=".32" fill="none"/></g>`).join("")}</g>`
          + bolt(30, 6, 30, "#00FFC8", .6, .9) + bolt(136, 4, 26, "#C9B8FF", 2.2, .9, 3)
          + `<path d="M0 60l18-18 10 8 20-22 18 20 14-10 22 18 16-14 18 12 24-10v16z" fill="#0E1A2E"/><path d="M48 28l5.4 6-2.4-.8-3 2-3-2-2.4.8zM80 38l4.4 3.2-2-.4-2.4 1.6-2.4-1.6-2 .4z" fill="#EAF2FF"/>` },
      dip: { n: "Ultra-Prestige VI · Polarsturm", emoji: "🌌", wand: "stern" },
      emote: { n: "Polarlicht-Ritt", ic: "🌌", text: "Juhuuu!", sum: "ride", farben: ["#00FFC8", "#9B4DFF", "#7FE3FF"], d: "Ein Band aus Polarlicht schwebt heran, gLiTCh springt auf und surft eine Runde durch den Himmel." },
      skin: { n: "Polarlicht", base: "#1FC9A8", fx: "aurora" } },
    { n: "Laser", ic: "🔦", c: "#FF2B4F", c2: "#3A0614",
      bg: { n: "Laser-Show", wand: ["#030006", "#1A0420"], boden: ["#14061E", "#100418", "#0A0210"],
        svg: [[18, 58, "#FF2B4F", 0], [142, 58, "#3CFF7A", .8], [80, 4, "#00E5FF", 1.6], [50, 58, "#FFE14D", 2.2], [110, 58, "#FF2BD6", 1.2]].map(([x, y, c, d]) => { const up = y > 30;
            return `<g class="pb-beam" style="transform-origin:${x}px ${y}px;animation-delay:-${d}s"><path d="M${x} ${y}L${x} ${up ? y - 90 : y + 90}" stroke="${c}" stroke-width="2.2" opacity=".25"/><path d="M${x} ${y}L${x} ${up ? y - 90 : y + 90}" stroke="${c}" stroke-width=".6"/></g>${r(x - 3, up ? y - 2 : y - 2, 6, 4, "#2A2A33")}`; }).join("")
          + `<path d="M80 0v8" stroke="#5E6676" stroke-width=".6"/><g class="pb-spinf" style="transform-origin:80px 14px;animation-duration:4s"><circle cx="80" cy="14" r="6" fill="#9AA3B5"/>${[[-3, -3], [1, -4], [3, 0], [-1, 1], [-4, 1], [2, 3]].map(([dx, dy], k) => r(80 + dx, 14 + dy, 1.6, 1.6, k % 2 ? "#fff" : "#C9D3E0")).join("")}</g>`
          + `<g class="pb-glitch">${r(0, 40, 160, .5, "#FF2BD6", ' opacity=".4"')}</g>` },
      dip: { n: "Ultra-Prestige VII · Laser", emoji: "🔦", wand: "pokal" },
      emote: { n: "Laser-Blick", ic: "😎", text: "Pew pew!", sum: "laser", farben: ["#FF2B4F", "#3CFF7A", "#00E5FF"], d: "gLiTCh setzt die Sonnenbrille auf und schiesst Laserstrahlen aus den Augen quer durchs Zimmer." },
      skin: { n: "Laser-Rot", base: "#E0233F", fx: "laser" } },
    { n: "Supernova", ic: "💥", c: "#FFB020", c2: "#4A1A00",
      bg: { n: "Supernova", wand: ["#060108", "#2A0A14"], boden: ["#1C0A0E", "#14070A", "#0E0507"],
        svg: stars([[10, 8], [26, 36], [44, 12], [140, 44], [150, 10], [60, 50], [20, 52]], "#FFE2B0")
          + [0, 1, 2].map(k => `<circle class="pb-ring" style="animation-delay:${k * 1.1}s" cx="104" cy="24" r="10" fill="none" stroke="${["#FFB020", "#FF3B30", "#FFE14D"][k]}" stroke-width="1.4"/>`).join("")
          + `<g class="pb-pulse"><circle cx="104" cy="24" r="9" fill="#FF6A00" opacity=".25"/></g><circle cx="104" cy="24" r="4.6" fill="#FFE2B0" class="pb-pulse"/><circle cx="104" cy="24" r="2" fill="#fff"/>`
          + Array.from({ length: 10 }, (_, k) => { const a = k * .63; return `<g class="pb-drift" style="animation-delay:${k * .7}s">${r(104 + Math.cos(a) * (14 + k % 3 * 6), 24 + Math.sin(a) * (10 + k % 3 * 4), 1.2, 1.2, k % 2 ? "#FFB020" : "#FF3B30")}</g>`; }).join("")
          + `<circle cx="30" cy="22" r="6" fill="#3A6EA5"/><path d="M24 22c3 1 9 1 12 0" stroke="#7FB2FF" stroke-width=".8" opacity=".6"/><ellipse cx="30" cy="22" rx="10" ry="2" fill="none" stroke="#C9B8FF" stroke-width=".7"/>` },
      dip: { n: "Ultra-Prestige VIII · Supernova", emoji: "💥", wand: "medaille" },
      emote: { n: "Supernova", ic: "💥", text: "BOOOM!", sum: "nova", farben: ["#FFB020", "#FF3B30", "#FFFFFF"], d: "gLiTCh leuchtet heller und heller, bis er wie ein Stern explodiert. Natürlich nur zum Schein!" },
      skin: { n: "Supernova", base: "#FF8A1F", fx: "nova" } },
    { n: "Ereignishorizont", ic: "🕳️", c: "#9B4DFF", c2: "#14062E",
      bg: { n: "Schwarzes Loch", wand: ["#000000", "#0C0418"], boden: ["#0A0614", "#08040F", "#05020A"],
        svg: stars([[8, 6], [24, 40], [40, 10], [130, 50], [150, 8], [140, 30], [16, 24], [60, 52]], "#fff")
          + `<g class="pb-shoot">${r(20, 8, 10, .7, "#fff")}</g><g class="pb-shoot" style="animation-delay:3s">${r(120, 40, 8, .7, "#C9B8FF")}</g>`
          + [["#FF8A1F", 34, 9, 0], ["#FFC21A", 28, 7, .5], ["#9B4DFF", 40, 11, 1]].map(([c, rx, ry, d]) => `<ellipse class="pb-current" style="animation-delay:${d}s" cx="80" cy="28" rx="${rx}" ry="${ry}" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="14 10" opacity=".8"/>`).join("")
          + `<g class="pb-pulse"><circle cx="80" cy="28" r="12" fill="#9B4DFF" opacity=".25"/></g><circle cx="80" cy="28" r="9" fill="#000"/><circle cx="80" cy="28" r="9.6" fill="none" stroke="#FFC21A" stroke-width=".6" opacity=".8"/>`
          + `<path d="M46 28a34 9 0 0 0 68 0" stroke="#FF8A1F" stroke-width="2" fill="none"/>` },
      dip: { n: "Ultra-Prestige IX · Ereignishorizont", emoji: "🕳️", wand: "stern" },
      emote: { n: "Schwarzes Loch", ic: "🕳️", text: "Schlüüürf!", sum: "vortex", farben: ["#9B4DFF", "#FF8A1F", "#FFC21A"], d: "Ein Schwarzes Loch saugt gLiTCh wirbelnd ein und spuckt ihn auf der anderen Seite wieder aus." },
      skin: { n: "Ereignishorizont", base: "#3A1A6E", fx: "void" } },
    { n: "Blitz-Legende", ic: "👑", c: "#FFE14D", c2: "#2A1450",
      bg: { n: "Thron der Blitze", wand: ["#07040F", "#2A1450"], boden: ["#3A2A10", "#2A1E0A", "#1C1406"],
        svg: flashW("#FFF6C8", .4) + [[14, "#00E5FF", 0], [34, "#FF2BD6", 1.1], [126, "#3CFF7A", .5], [148, "#FFE14D", 1.6], [60, "#FF8A1F", 2.4], [100, "#9B4DFF", 2.9]].map(([x, c, d], k) => bolt(x, 0, 30 + (k % 3) * 8, c, d, 1, k)).join("")
          + `<g class="pb-spinf" style="transform-origin:80px 28px;animation-duration:30s">${Array.from({ length: 12 }, (_, k) => { const a = k * Math.PI / 6, b = a + .13; return `<path d="M80 28L${(80 + Math.cos(a) * 90).toFixed(1)} ${(28 + Math.sin(a) * 90).toFixed(1)}L${(80 + Math.cos(b) * 90).toFixed(1)} ${(28 + Math.sin(b) * 90).toFixed(1)}z" fill="#FFE14D" opacity=".07"/>`; }).join("")}</g><g class="pb-pulse"><circle cx="80" cy="28" r="20" fill="#FFE14D" opacity=".1"/></g>`
          + `<g class="pb-shine"><path d="M86 6L70 30h9l-6 22 19-28h-10z" fill="#FFE14D" stroke="#C98A00" stroke-width="1"/><path d="M84 9L74 27h7" stroke="#FFF6C8" stroke-width="1" fill="none"/></g>`
          + `<path d="M70 4l3 4 3-5 3 5 3-5 3 5 3-4v6H70z" fill="#FFC21A" stroke="#C98A00" stroke-width=".5" transform="translate(0 -2) scale(1)"/>`
          + [[52, 44], [108, 44]].map(([x, y]) => `<rect x="${x - 4}" y="${y}" width="8" height="16" fill="#C98A00"/><rect x="${x - 5}" y="${y - 2}" width="10" height="2.4" fill="#FFE14D"/>`).join("")
          + `<g class="pb-glitch">${r(20, 20, 8, 2, "#00E5FF")}${r(132, 34, 8, 2, "#FF2BD6")}</g>` },
      dip: { n: "Ultra-Prestige X · Blitz-Legende", emoji: "👑", wand: "pokal" },
      emote: { n: "Ultra-Blitz-Krone", ic: "👑", text: "ULTRA-LEGENDE!", sum: "ultra", farben: ["#FFE14D", "#00E5FF", "#FF2BD6", "#3CFF7A"], d: "Regenbogen-Blitze schlagen rund um gLiTCh ein, dann landet eine goldene Krone auf seinem Kopf." },
      skin: { n: "Ultra-Blitz", base: "#FFD21A", fx: "ultra" } }
  ];
  RANKS.push(...ULTRA);

  const P = window.GL_PRESTIGE = {
    STEP: 300, MAX: 20, RANKS,
    roman: n => ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || String(n),
    /* Rang aus den Sternen (base = Sterne für Level 100); kann über 10 gehen */
    of: (stars, base) => stars < base ? 0 : Math.floor((stars - base) / 300),
    label(p) { if (p <= 0) return ""; const N = RANKS.length, q = Math.min(p, N), R = RANKS[q - 1], extra = p > N ? " ★" + (p - N + 1) : "";
      return q <= 10 ? `Prestige ${P.roman(q)} · ${R.n}${extra}` : `Ultra-Prestige ${P.roman(q - 10)} · ${R.n}${extra}`; },
    /* Kurzform für Anzeigen: «Prestige-Rang IV» oder «Ultra-Rang II ★3» */
    rankTxt(p) { const N = RANKS.length, q = Math.min(p, N), extra = p > N ? " ★" + (p - N + 1) : ""; return (q <= 10 ? `Prestige-Rang ${P.roman(q)}` : `Ultra-Rang ${P.roman(q - 10)}`) + extra; },
    num: k => k <= 10 ? P.roman(k) : "U" + P.roman(k - 10),
    /* Name von Level 100 + k (k ≥ 1, alle 30 Sterne ein Level) */
    lvName(k) { const p = Math.floor(k / 10), s = k % 10; return p ? P.label(p) + (s ? ` · +${s}` : "") : "gLiTCh-Legende +" + k; }
  };
})();
