/* =====================================================================
   Glitchlab · Prestige ab Level 100
   Die Sterne bleiben alle erhalten. Ab Level 100 gibt es alle 300 Sterne
   einen Prestige-Rang (I bis X, danach «Regenbogen ★2, ★3 …»).
   Pro Rang: animierter Hintergrund, Diplom, Beschwörungs-Emote, animierter Skin.
   Die Hintergründe nutzen die Animationen «pb-…» (stehen im Zimmer, tools/prestige_patch_page.py).
   ===================================================================== */
(function () {
  const r = (x, y, w, h, f, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${extra}/>`;
  const stars = (pts, c = "#fff", cls = "pb-tw") => pts.map(([x, y, s = 1], k) => `<g class="${cls}" style="animation-delay:${(k * .37) % 2.2}s">${r(x, y, s, s, c)}</g>`).join("");

  const RANKS = [
    { n: "Bronze", ic: "🥉", c: "#C47A3A", c2: "#5A2E10",
      bg: { n: "Bronze-Schmiede", wand: ["#2A1208", "#6E3A1A"], boden: ["#3A2A22", "#2A1C18", "#1C1210"],
        svg: `<circle cx="132" cy="40" r="20" fill="#FF8A1F" opacity=".22" class="pb-pulse"/><rect x="116" y="30" width="32" height="26" rx="3" fill="#3A2418"/><path d="M120 56V40a12 10 0 0 1 24 0v16z" fill="#1A0C06"/><g class="pb-flick"><path d="M124 56c0-6 3-8 4-12 2 4 4 5 4 9 1-3 3-5 3-8 3 5 5 7 5 11z" fill="#FF6A00"/><path d="M128 56c0-3 2-4 3-7 1 3 3 4 3 7z" fill="#FFC21A"/></g>`
          + `<path d="M30 52h26l-4 4H34zM38 52v-6h12v6M34 46h20" fill="#4A3A36" stroke="#2A1C18" stroke-width=".8"/>` + [0, 1, 2, 3, 4, 5, 6].map(k => `<g class="pb-rise" style="animation-delay:${k * .45}s">${r(124 + (k * 5) % 18, 34, 1.4, 1.4, k % 2 ? "#FFC21A" : "#FF6A00")}</g>`).join("")
          + `<path d="M8 4v18M14 4v12M20 4v22" stroke="#7A5A3A" stroke-width="1" stroke-dasharray="2 1"/><g class="pb-swing" style="transform-origin:20px 4px"><circle cx="20" cy="28" r="3" fill="none" stroke="#C47A3A" stroke-width="1.4"/></g>` },
      dip: { n: "Prestige I · Bronze", emoji: "🥉", wand: "medaille" },
      emote: { n: "Amboss-Schlag", ic: "🔨", text: "KLONG!", sum: "smash", farben: ["#C47A3A", "#FFC21A", "#FF6A00"], d: "Ein Schmiedehammer erscheint aus dem Portal und schlägt Funken direkt neben gLiTCh." },
      skin: { n: "Bronze-Glut", base: "#B8733A", fx: "glow" } },
    { n: "Silber", ic: "🥈", c: "#B8C2D2", c2: "#2A3448",
      bg: { n: "Silberne Mondnacht", wand: ["#0B1430", "#2A3A6A"], boden: ["#3A4A6A", "#2A3A5A", "#1C2A48"],
        svg: `<circle cx="128" cy="20" r="17" fill="#E8EEF8" opacity=".1" class="pb-pulse"/><path d="M124 7a13 13 0 1 0 14 19a10.5 10.5 0 1 1 -14 -19z" fill="#E8EEF8"/><circle cx="121" cy="19" r="1.4" fill="#C9D3E0"/><circle cx="125" cy="27" r="1" fill="#C9D3E0"/>`
          + stars([[10, 8], [24, 22], [40, 6], [56, 16, 1.4], [72, 4], [88, 24], [100, 10], [148, 34], [14, 40], [60, 34], [146, 8]], "#fff")
          + `<g class="pb-shoot">${r(30, 10, 10, .8, "#fff")}${r(28, 10, 2, .8, "#B8C2D2")}</g><g class="pb-shoot" style="animation-delay:2.5s">${r(80, 6, 8, .8, "#fff")}</g>`
          + `<path d="M0 60l20-16 16 8 22-18 18 14 20-10 24 14 20-8 20 16z" fill="#1C2A48"/>` },
      dip: { n: "Prestige II · Silber", emoji: "🥈", wand: "medaille" },
      emote: { n: "Mond-Ritt", ic: "🌙", text: "Huiii!", sum: "ride", farben: ["#E8EEF8", "#B8C2D2", "#7FB2FF"], d: "Eine Mondsichel fliegt heran, gLiTCh setzt sich darauf und reitet eine Runde durch die Sterne." },
      skin: { n: "Silbermond", base: "#AEB8C8", fx: "shine" } },
    { n: "Bernstein", ic: "🔶", c: "#E8A317", c2: "#5A3A08",
      bg: { n: "Bernstein-Schatzkammer", wand: ["#3A2208", "#7A4A10"], boden: ["#5A3A1A", "#4A2E12", "#3A220C"],
        svg: [[18, 52], [40, 54], [110, 52], [140, 54]].map(([x, y]) => `<path d="M${x - 10} ${y + 6}c2-8 18-8 20 0z" fill="#E8A317"/>${[0, 1, 2].map(k => r(x - 6 + k * 4, y - 2 + (k % 2), 3, 2, "#FFD45A")).join("")}`).join("")
          + `<rect x="66" y="40" width="28" height="18" rx="2" fill="#7A4A10" stroke="#3A2208" stroke-width="1"/><path d="M66 46h28" stroke="#E8A317" stroke-width="1.2"/><rect x="77" y="44" width="6" height="5" fill="#E8A317"/><circle cx="80" cy="42" r="12" fill="#FFD45A" opacity=".18" class="pb-pulse"/>`
          + stars([[22, 44, 1.4], [44, 46, 1.4], [112, 44, 1.4], [138, 46, 1.4], [80, 30, 1.6], [60, 20], [100, 18]], "#FFF3B0") },
      dip: { n: "Prestige III · Bernstein", emoji: "🔶", wand: "schild" },
      emote: { n: "Schatz-Regen", ic: "💰", text: "Reich!", sum: "chest", farben: ["#E8A317", "#FFD45A", "#FFF3B0"], d: "Ein Geldsack fällt aus dem Portal, gLiTCh springt drauf und es regnet Münzen." },
      skin: { n: "Bernstein", base: "#E8A317", fx: "pulse" } },
    { n: "Smaragd", ic: "❇️", c: "#19B36B", c2: "#0B3D24",
      bg: { n: "Smaragd-Zauberwald", wand: ["#06200F", "#0F5132"], boden: ["#2A4A2A", "#1F3A1F", "#142A14"],
        svg: [[10, 22], [34, 18], [124, 20], [148, 24]].map(([x, y]) => `<path d="M${x} ${y}l-10 22h20z M${x} ${y + 10}l-12 22h24z" fill="#0B3D24"/>${r(x - 1.5, y + 32, 3, 8, "#3A2A1A")}`).join("")
          + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => `<g class="pb-float" style="animation-delay:${k * .5}s"><g class="pb-tw" style="animation-delay:${k * .3}s"><circle cx="${20 + k * 15}" cy="${16 + (k * 13) % 30}" r="1.3" fill="#B7FF6A"/><circle cx="${20 + k * 15}" cy="${16 + (k * 13) % 30}" r="3" fill="#B7FF6A" opacity=".25"/></g></g>`).join("")
          + `<circle cx="80" cy="30" r="9" fill="#19B36B" opacity=".2" class="pb-pulse"/><path d="M80 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#B7FF6A" class="pb-spin" style="transform-origin:80px 30px"/>` },
      dip: { n: "Prestige IV · Smaragd", emoji: "❇️", wand: "rolle" },
      emote: { n: "Zauberstab", ic: "🪄", text: "Simsalabim!", sum: "wand", farben: ["#19B36B", "#B7FF6A", "#FFFFFF"], d: "gLiTCh beschwört einen Zauberstab und lässt Funken in einer Spirale um sich wirbeln." },
      skin: { n: "Smaragd", base: "#19B36B", fx: "hue" } },
    { n: "Saphir", ic: "🔷", c: "#2F6BFF", c2: "#0B1D4A",
      bg: { n: "Saphir-Tiefsee", wand: ["#04142E", "#0B3E8A"], boden: ["#1A3A5A", "#123050", "#0C2440"],
        svg: [30, 70, 110].map((x, k) => `<path d="M${x} 0l-10 60h20z" fill="#7FB2FF" opacity=".08" class="pb-pulse" style="animation-delay:${k * .7}s"/>`).join("")
          + [0, 1, 2, 3, 4, 5, 6, 7].map(k => `<g class="pb-rise" style="animation-delay:${k * .6}s"><circle cx="${12 + k * 19}" cy="56" r="${1 + (k % 3) * .6}" fill="none" stroke="#BFE3FF" stroke-width=".6"/></g>`).join("")
          + `<g class="pb-drift"><path d="M40 30c4-4 10-4 14 0-4 4-10 4-14 0zM54 30l5-3v6z" fill="#FFC21A"/><circle cx="44" cy="29.4" r=".7" fill="#111"/></g><g class="pb-drift" style="animation-delay:-3s;animation-direction:reverse"><path d="M110 18c3-3 8-3 11 0-3 3-8 3-11 0zM121 18l4-2v4z" fill="#FF6FAE"/></g>`
          + `<path d="M0 60c6-10 10-10 12 0M16 60c4-14 8-14 10 0M140 60c4-12 10-12 12 0" fill="#19B36B" class="pb-sway"/>` },
      dip: { n: "Prestige V · Saphir", emoji: "🔷", wand: "schild" },
      emote: { n: "Delfin-Sprung", ic: "🐬", text: "Platsch!", sum: "jump", farben: ["#2F6BFF", "#7FB2FF", "#BFE3FF"], d: "Ein Delfin springt aus dem Portal in hohem Bogen über gLiTCh, und es spritzt überall." },
      skin: { n: "Saphir", base: "#2F6BFF", fx: "wave" } },
    { n: "Rubin", ic: "♦️", c: "#E0234E", c2: "#4A0614",
      bg: { n: "Rubin-Drachenhöhle", wand: ["#1A0408", "#5A0A18"], boden: ["#3A1A1A", "#2A1212", "#1C0A0A"],
        svg: [8, 26, 50, 78, 104, 130, 152].map((x, k) => `<path d="M${x - 5} 0l5 ${8 + (k % 3) * 5}l5-${8 + (k % 3) * 5}z" fill="#2A0A10"/>`).join("")
          + `<g class="pb-blink"><circle cx="112" cy="34" r="1.6" fill="#FFC21A"/><circle cx="120" cy="34" r="1.6" fill="#FFC21A"/></g><path d="M104 40c6-6 18-6 24 0" stroke="#3A0A12" stroke-width="3" fill="none"/>`
          + [0, 1, 2, 3, 4, 5, 6, 7].map(k => `<g class="pb-rise" style="animation-delay:${k * .5}s">${r(10 + k * 18, 56, 1.4, 1.4, k % 2 ? "#FF6A00" : "#E0234E")}</g>`).join("")
          + `<path d="M30 44l6-10 6 10-6 6z" fill="#E0234E" class="pb-pulse"/><path d="M36 34v16M30 44h12" stroke="#FF8AA0" stroke-width=".5"/>` },
      dip: { n: "Prestige VI · Rubin", emoji: "♦️", wand: "pokal" },
      emote: { n: "Mini-Drache", ic: "🐉", text: "FAUCH!", sum: "dragon", farben: ["#E0234E", "#FF6A00", "#FFC21A"], d: "Ein kleiner Drache kreist zweimal um gLiTCh und speit dann einen Feuerstoss." },
      skin: { n: "Rubinfeuer", base: "#E0234E", fx: "flicker" } },
    { n: "Amethyst", ic: "🔮", c: "#9B4DFF", c2: "#2A0B5A",
      bg: { n: "Amethyst-Sternennebel", wand: ["#12042E", "#3A0E6E"], boden: ["#2A1A4A", "#20123A", "#160C2A"],
        svg: `<g class="pb-hue"><ellipse cx="50" cy="24" rx="40" ry="12" fill="#FF2BD6" opacity=".18"/><ellipse cx="110" cy="30" rx="44" ry="14" fill="#9B4DFF" opacity=".22"/><ellipse cx="80" cy="18" rx="30" ry="8" fill="#00E5FF" opacity=".12"/></g>`
          + `<g class="pb-spin" style="transform-origin:80px 28px"><path d="M80 28m-14 0a14 6 0 1 0 28 0a14 6 0 1 0 -28 0" fill="none" stroke="#D6B8FF" stroke-width=".6" stroke-dasharray="3 2"/></g><circle cx="80" cy="28" r="3" fill="#F3E8FF"/>`
          + stars([[8, 10], [20, 40], [36, 6], [64, 46], [96, 8], [120, 44], [140, 12], [152, 36], [28, 22, 1.4], [132, 24, 1.4]], "#F3E8FF") },
      dip: { n: "Prestige VII · Amethyst", emoji: "🔮", wand: "stern" },
      emote: { n: "Teleport-Portal", ic: "🌀", text: "Zapp!", sum: "portal", farben: ["#9B4DFF", "#FF2BD6", "#00E5FF"], d: "Ein Portal öffnet sich, gLiTCh springt hinein, verschwindet und taucht aus einem zweiten Portal wieder auf." },
      skin: { n: "Amethyst", base: "#9B4DFF", fx: "nebula" } },
    { n: "Diamant", ic: "💎", c: "#7FE3FF", c2: "#0B3E5A",
      bg: { n: "Diamant-Kristallpalast", wand: ["#0B2A44", "#2C7AA8"], boden: ["#BFE3F2", "#9CCDE6", "#7FB8D6"],
        svg: [[14, 30, 10], [36, 36, 7], [124, 28, 12], [148, 38, 7], [80, 14, 8]].map(([x, y, s], k) => `<g class="pb-shine" style="animation-delay:${k * .5}s"><path d="M${x} ${y - s * 2}l${s} ${s * 2}-${s} ${s * 2.4}-${s}-${s * 2.4}z" fill="#BFF4FF" opacity=".9"/><path d="M${x} ${y - s * 2}v${s * 4.4}M${x - s} ${y}h${s * 2}" stroke="#fff" stroke-width=".5" opacity=".7"/></g>`).join("")
          + stars([[28, 12, 1.6], [60, 20, 1.4], [100, 10, 1.6], [140, 16, 1.4], [70, 44, 1.4], [110, 46, 1.6]], "#FFFFFF")
          + `<path d="M50 60V40l30-14 30 14v20" fill="none" stroke="#BFF4FF" stroke-width="1" opacity=".5"/>` },
      dip: { n: "Prestige VIII · Diamant", emoji: "💎", wand: "rahmen" },
      emote: { n: "Diamant-Schild", ic: "💎", text: "Unzerstörbar!", sum: "shield", farben: ["#7FE3FF", "#BFF4FF", "#FFFFFF"], d: "Drei Diamanten erscheinen und kreisen als funkelnder Schutzschild um gLiTCh." },
      skin: { n: "Diamant", base: "#9FE7FF", fx: "sparkle" } },
    { n: "Kosmos", ic: "🪐", c: "#5B6CFF", c2: "#060818",
      bg: { n: "Kosmos-Station", wand: ["#020208", "#141A40"], boden: ["#2A2E44", "#1E2236", "#14182A"],
        svg: stars([[6, 6], [18, 30], [30, 12], [44, 44], [58, 8], [76, 38], [92, 6], [104, 30], [118, 10], [150, 40], [140, 22], [66, 24]], "#fff")
          + `<circle cx="34" cy="28" r="9" fill="#FF8A5B"/><path d="M22 30c8-5 18-5 24-2" stroke="#FFD4A8" stroke-width="1.4" fill="none"/><circle cx="34" cy="28" r="14" fill="none" stroke="#FFD4A8" stroke-width=".6" opacity=".4"/>`
          + `<g class="pb-spin" style="transform-origin:126px 26px"><circle cx="126" cy="26" r="6" fill="#5B6CFF"/><circle cx="138" cy="26" r="2" fill="#BFC8FF"/></g>`
          + `<g class="pb-drift"><path d="M70 18l6-3 6 3-6 3z" fill="#BFC8FF"/>${r(75, 18, 2, 6, "#7FE3FF", ' opacity=".5"')}</g><g class="pb-shoot" style="animation-delay:1s">${r(96, 8, 10, .8, "#fff")}</g>` },
      dip: { n: "Prestige IX · Kosmos", emoji: "🪐", wand: "stern" },
      emote: { n: "UFO-Entführung", ic: "🛸", text: "Beam me up!", sum: "beam", farben: ["#5B6CFF", "#7FE3FF", "#3CFF7A"], d: "Ein UFO schwebt herbei, beamt gLiTCh im Lichtstrahl hoch und setzt ihn sanft wieder ab." },
      skin: { n: "Kosmos", base: "#3A44C8", fx: "cosmos" } },
    { n: "Regenbogen", ic: "🌈", c: "#FF3D7F", c2: "#14062E",
      bg: { n: "Glitch-Dimension", wand: ["#0A0418", "#2A0B5A"], boden: ["#1A0B3A", "#14082E", "#0E0622"],
        svg: `<g opacity=".35">${Array.from({ length: 9 }, (_, k) => `<path d="M${k * 20} 0v60" stroke="#00E5FF" stroke-width=".4"/>`).join("")}${Array.from({ length: 4 }, (_, k) => `<path d="M0 ${k * 15 + 6}h160" stroke="#FF2BD6" stroke-width=".4"/>`).join("")}</g>`
          + `<g class="pb-hue">${["#FF3D7F", "#FFC21A", "#3CFF7A", "#00E5FF", "#9B4DFF"].map((c, k) => `<path d="M30 54a50 ${40 - k * 6} 0 0 1 100 0" stroke="${c}" stroke-width="2.4" fill="none" transform="translate(0 ${k * 3})"/>`).join("")}</g>`
          + [[12, 10, "#00E5FF"], [140, 14, "#FF2BD6"], [60, 6, "#3CFF7A"], [104, 40, "#FFC21A"]].map(([x, y, c], k) => `<g class="pb-glitch" style="animation-delay:${k * .7}s">${r(x, y, 10, 3, c)}${r(x + 3, y + 3, 6, 2, c, ' opacity=".6"')}</g>`).join("")
          + `<g class="pb-scan">${r(0, 0, 160, 1.2, "#fff", ' opacity=".18"')}</g>` },
      dip: { n: "Prestige X · Regenbogen", emoji: "🌈", wand: "pokal" },
      emote: { n: "Pixel-Krone", ic: "👑", text: "LEGENDE!", sum: "crown", farben: ["#FF3D7F", "#FFC21A", "#3CFF7A", "#00E5FF", "#9B4DFF"], d: "Eine Pixel-Krone schwebt aus dem Portal auf gLiTChs Kopf, und ein Regenbogen-Feuerwerk geht los." },
      skin: { n: "Regenbogen", base: "#FF3D7F", fx: "rainbow" } }
  ];

  const P = window.GL_PRESTIGE = {
    STEP: 300, MAX: 10, RANKS,
    roman: n => ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || String(n),
    /* Rang aus den Sternen (base = Sterne für Level 100); kann über 10 gehen */
    of: (stars, base) => stars < base ? 0 : Math.floor((stars - base) / 300),
    label(p) { if (p <= 0) return ""; const q = Math.min(p, 10), R = RANKS[q - 1]; return `Prestige ${P.roman(q)} · ${R.n}${p > 10 ? " ★" + (p - 9) : ""}`; },
    /* Name von Level 100 + k (k ≥ 1, alle 30 Sterne ein Level) */
    lvName(k) { const p = Math.floor(k / 10), s = k % 10; return p ? P.label(p) + (s ? ` · +${s}` : "") : "gLiTCh-Legende +" + k; }
  };
})();
