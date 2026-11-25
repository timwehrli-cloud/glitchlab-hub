/* =====================================================================
   gLiTCh-Lab · Deutsch «Spektakel fürs Ohr» (Deutsch Sechs, Kapitel 3)
   Drei Module im gleichen Aufbau wie die NMG-Module (GLAB_GE):
   Theorie mit gLiTCh, Aufgaben, Etappen präsentieren, Ziel mit Produkt (Hörspiel-Plakat).
   Die Hörtexte hören die Kinder im Lehrmittel «Deutsch Sechs» (LMVZ) auf dem iPad.
   ===================================================================== */
(function(){
if (!window.GLAB_GE_MODS || !window.GLAB_GE_BADGES) return;

/* ---------- Symbole für Diplome (24 × 24, Strich) ---------- */
const I = {
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8 21h8"/>',
  phones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
  slider:'<path d="M6 4v16M12 4v16M18 4v16"/><rect x="4" y="13" width="4" height="3" rx="1"/><rect x="10" y="7" width="4" height="3" rx="1"/><rect x="16" y="15" width="4" height="3" rx="1"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  book:'<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10"/>',
  ear:'<path d="M8 10a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0M11 10a2 2 0 0 1 4 0"/>',
  boat:'<path d="M3 16h18l-3 4H6zM12 4v12M12 5l6 8h-6"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  script:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h3M13 7h3M8 11h3M13 11h3M8 15h3M13 15h2"/>',
  tractor:'<circle cx="7" cy="16" r="4"/><circle cx="18" cy="17" r="3"/><path d="M7 12V6h6l2 6h4v5M11 6v6"/>',
  mask:'<path d="M4 5h16v6a8 8 0 0 1-16 0z"/><path d="M8 10h2M14 10h2M9 15c2 1.5 4 1.5 6 0"/>',
  clap:'<rect x="3" y="9" width="18" height="11" rx="1.5"/><path d="M3 9l2-5 16 2-2 3M8 4.5l-1 4M13 5l-1 4"/>'
};

/* ---------- Diplome im Hörspiel-Design: Wandbilder fürs Zimmer (20 × 20) ---------- */
const nail = '<circle cx="10" cy="1.2" r=".8" fill="#2A1206"/>';
const str = (a, b, y) => `<path d="M${a} ${y}L10 1.2L${b} ${y}" stroke="#2A1206" stroke-width=".35" fill="none"/>`;
const rec = (disc, label, frame) => str(4, 16, 4.6) + `<rect x="2.6" y="4.6" width="14.8" height="14" rx=".6" fill="${frame}"/><rect x="3.6" y="5.6" width="12.8" height="12" fill="#14062E"/>`
  + `<circle cx="10" cy="11.2" r="5.2" fill="${disc}"/><circle cx="10" cy="11.2" r="3.8" fill="none" stroke="#000" stroke-opacity=".25" stroke-width=".3"/><circle cx="10" cy="11.2" r="2.6" fill="none" stroke="#000" stroke-opacity=".25" stroke-width=".3"/><circle cx="10" cy="11.2" r="1.5" fill="${label}"/><circle cx="10" cy="11.2" r=".35" fill="#14062E"/>`
  + `<g class="rm-twinkle"><path d="M6.8 7.8l.8.8" stroke="#fff" stroke-width=".6" stroke-linecap="round"/></g>` + nail;
const frame = (inner, c) => str(4, 16, 5) + `<rect x="2.5" y="5" width="15" height="13" rx=".6" fill="${c || "#3A2A1A"}"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#1A1028"/>` + inner + nail;
const HSP_WALL = {
  hsp_tonstudio_1: rec("#E8B923", "#F28C28", "#5A3A1E"),
  hsp_tonstudio_2: '<path d="M10 1.2v2.4" stroke="#2A1206" stroke-width=".5"/><g class="wl-sway"><path d="M4.6 12V9.4a5.4 5.4 0 0 1 10.8 0V12" stroke="#3A3A44" stroke-width="1.3" fill="none"/><rect x="2.8" y="11" width="3.6" height="6" rx="1.4" fill="#F28C28"/><rect x="13.6" y="11" width="3.6" height="6" rx="1.4" fill="#F28C28"/><rect x="3.6" y="12" width="1.4" height="4" rx=".6" fill="#FFB36B"/></g>' + nail,
  hsp_tonstudio_3: str(5, 15, 6) + '<g class="wl-sway"><rect x="2.6" y="6" width="14.8" height="10" rx="1" fill="#4FC3F7"/><rect x="4" y="7.2" width="12" height="3.4" fill="#FFF8EE"/><text x="10" y="9.8" font-size="2.6" font-weight="900" text-anchor="middle" fill="#14062E" font-family="sans-serif">ABC</text><circle cx="6.6" cy="13" r="1.5" fill="#14062E"/><circle cx="13.4" cy="13" r="1.5" fill="#14062E"/><rect x="8.2" y="12.4" width="3.6" height="1.2" fill="#C9B79A"/><path d="M5 16l1-1.6h8l1 1.6" fill="#2A7FA8"/></g>' + nail,
  hsp_tonstudio_4: '<rect x="4" y="16.4" width="12" height="2.6" rx=".4" fill="#3A2A1A"/><rect x="6" y="15" width="8" height="1.6" fill="#5A3A1E"/><path d="M10 15v-3" stroke="#C98A00" stroke-width="1"/><rect x="7.6" y="3.4" width="4.8" height="9" rx="2.4" fill="#E8B923"/><path d="M7.8 6h4.4M7.8 8h4.4M7.8 10h4.4" stroke="#C98A00" stroke-width=".4"/><path d="M5.8 9a4.2 4.2 0 0 0 8.4 0" stroke="#C98A00" stroke-width=".7" fill="none"/><g class="rm-twinkle"><path d="M3 4l.6 1.2 1.2.6-1.2.6L3 7.6l-.6-1.2-1.2-.6 1.2-.6zM16.8 2.6l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z" fill="#FFF3A8"/></g>',
  hsp_geschichte_1: frame('<path d="M5 15V8.4c2-.8 3.6-.6 5 .4 1.4-1 3-1.2 5-.4V15c-2-.8-3.6-.6-5 .4-1.4-1-3-1.2-5-.4z" fill="#FFF8EE"/><path d="M10 8.8v6.6" stroke="#C9B79A" stroke-width=".4"/><path d="M6 10.4h2.6M6 12h2.6M11.4 10.4h2.6M11.4 12h2" stroke="#9A9080" stroke-width=".35"/><g class="rm-twinkle"><path d="M13.6 6.8c.8.6.8 1.8 0 2.4M14.8 6.2c1.4 1 1.4 2.6 0 3.6" stroke="#1FA3C7" stroke-width=".45" fill="none"/></g>', "#06364A"),
  hsp_geschichte_2: rec("#CFD8DC", "#1FA3C7", "#06364A"),
  hsp_geschichte_3: frame('<rect x="3.6" y="13.4" width="12.8" height="3.5" fill="#1FA3C7"/><g class="wl-sway2"><path d="M5.6 13h8.8l-1.6 2H7.2z" fill="#E8E0CC"/><path d="M10 7v6" stroke="#5D3A1A" stroke-width=".5"/><path d="M10.2 7.4l3.4 4.6h-3.4z" fill="#F7F7F7"/></g><path d="M4.4 8.6v2" stroke="#FFC21A" stroke-width=".4"/><ellipse cx="4" cy="10.6" rx=".6" ry=".45" fill="#FFC21A"/>', "#06364A"),
  hsp_geschichte_4: '<path d="M10 1.2v2.8" stroke="#2A1206" stroke-width=".5"/><circle cx="10" cy="11" r="7" fill="#B07A2A"/><circle cx="10" cy="11" r="5.8" fill="#FFF8EE"/><path d="M10 5.8v1M10 15.2v1M4.8 11h1M14.2 11h1" stroke="#5A3A1E" stroke-width=".5"/><g class="wl-tilt" style="transform-origin:10px 11px"><path d="M10 6.6l1.3 4.4h-2.6z" fill="#E53935"/><path d="M10 15.4l1.3-4.4h-2.6z" fill="#5E6676"/></g><circle cx="10" cy="11" r=".6" fill="#14062E"/><text x="10" y="8.6" font-size="1.8" font-weight="900" text-anchor="middle" fill="#E53935" font-family="sans-serif">N</text>' + nail,
  hsp_skript_1: str(6, 14, 3.4) + '<rect x="4" y="3.4" width="12" height="15.4" rx=".8" fill="#B0805A"/><rect x="7.4" y="2.6" width="5.2" height="2" rx=".6" fill="#9AA3B5"/><rect x="5" y="5" width="10" height="12.8" fill="#FFF8EE"/>' + [7, 9, 11, 13, 15].map((y, k) => `<rect x="6" y="${y}" width="2" height=".8" fill="#E0533A"/><rect x="8.6" y="${y}" width="${5 - (k % 2) * 1.6}" height=".8" fill="#9A9080"/>`).join("") + nail,
  hsp_skript_2: frame('<rect x="3.6" y="15" width="12.8" height="1.9" fill="#6B4A2A"/><g class="wl-sway2"><rect x="5" y="10.4" width="6" height="3" fill="#2E9B4A"/><rect x="9.4" y="7.6" width="3.4" height="4.4" fill="#2E9B4A"/><rect x="10.2" y="8.2" width="1.8" height="1.8" fill="#BFE6F2"/><circle cx="6.6" cy="14" r="2" fill="#14062E"/><circle cx="12.6" cy="14.4" r="1.4" fill="#14062E"/><rect x="6" y="8.6" width=".8" height="2" fill="#5E6676"/></g>', "#4A1208"),
  hsp_skript_3: '<path d="M10 1.2v2.4" stroke="#2A1206" stroke-width=".5"/><g class="wl-sway"><rect x="3" y="8" width="14" height="10" rx=".6" fill="#2A2A33"/><path d="M3 8l1-4.4 13.4 1.6L17 8z" fill="#3A3A44"/><path d="M6 4l-1 4M9.6 4.4l-1 3.6M13.2 4.8l-.8 3.2" stroke="#F7F7F7" stroke-width=".9"/><path d="M5 11h10M5 13.4h7M5 15.8h8" stroke="#F7F7F7" stroke-width=".5"/></g>' + nail,
  hsp_skript_4: rec("#7FE6FF", "#E0533A", "#4A1208")
};
const ART = id => `<svg viewBox="0 0 20 20" aria-hidden="true">${HSP_WALL[id]}</svg>`;

/* ---------- Bild-Karten für die Auswahl (48 × 48, animiert) ---------- */
const A = window.GLAB_GE_ANIM || (window.GLAB_GE_ANIM = {});
const sv = inner => `<svg viewBox="0 0 48 48" aria-hidden="true">${inner}</svg>`;
Object.assign(A, {
  hMic: sv(`<rect x="19" y="6" width="10" height="20" rx="5" fill="#9AA3B5"/><path d="M21 11h6M21 15h6M21 19h6" stroke="#5E6676" stroke-width="1.4"/><path d="M14 22a10 10 0 0 0 20 0" stroke="#5E6676" stroke-width="2.4" fill="none"/><rect x="22.6" y="32" width="2.8" height="8" fill="#5E6676"/><rect x="16" y="39" width="16" height="3" rx="1.5" fill="#5E6676"/><g class="ga-wave"><path d="M37 14c2 3 2 7 0 10M41 11c3 5 3 11 0 16" stroke="#F28C28" stroke-width="2" fill="none" stroke-linecap="round"/></g>`),
  hRegie: sv(`<rect x="8" y="20" width="32" height="20" rx="2" fill="#2A2A33"/><path d="M8 20l4-9 28 4-2 5" fill="#3A3A44"/><path d="M14 12l-2 7M22 13l-2 7M30 14l-2 6" stroke="#F7F7F7" stroke-width="2.2"/><g class="ga-wave"><text x="24" y="34" font-size="8" font-weight="800" text-anchor="middle" fill="#FFC21A" font-family="monospace">ACTION</text></g>`),
  hTechnik: sv(`<rect x="6" y="24" width="36" height="16" rx="2" fill="#3A3A44"/>${[11, 18, 25, 32, 39].map((x, k) => `<rect x="${x - 1}" y="27" width="2" height="10" fill="#14062E"/><rect class="ga-wave" style="animation-delay:${k * .3}s" x="${x - 2.5}" y="${29 + (k % 3) * 2}" width="5" height="3" rx="1" fill="${k % 2 ? "#FFC21A" : "#00E5FF"}"/>`).join("")}<rect x="10" y="8" width="28" height="13" rx="1.5" fill="#0B1430"/><path class="ga-wave" d="M12 15h4l2-4 3 8 3-6 2 3h10" stroke="#3CFF7A" stroke-width="1.4" fill="none"/>`),
  hGeraeusch: sv(`<rect x="12" y="8" width="18" height="32" rx="1" fill="#8B5A2B"/><rect x="14" y="10" width="14" height="13" fill="#A8743A"/><rect x="14" y="25" width="14" height="13" fill="#A8743A"/><circle cx="26" cy="25" r="1.6" fill="#FFC21A"/><g class="ga-wave"><path d="M34 16l4-2M34 22h6M34 28l4 2" stroke="#F28C28" stroke-width="2" stroke-linecap="round"/></g>`),
  hMusik: sv(`<g class="ga-wave"><path d="M18 34V12l18-4v22" stroke="#FF2BD6" stroke-width="2.6" fill="none"/><ellipse cx="14.5" cy="34" rx="4.5" ry="3.4" fill="#FF2BD6"/><ellipse cx="32.5" cy="30" rx="4.5" ry="3.4" fill="#FF2BD6"/></g><path d="M18 16l18-4" stroke="#FF2BD6" stroke-width="2.6"/>`),
  hSkript: sv(`<rect x="10" y="6" width="28" height="36" rx="2" fill="#FFF8EE"/>${[12, 18, 24, 30, 36].map((y, k) => `<rect x="13" y="${y}" width="6" height="2" fill="#E0533A"/><rect x="21" y="${y}" width="${14 - (k % 3) * 3}" height="2" fill="#B0A89A"/>`).join("")}<g class="ga-wave"><path d="M34 32l6-14 3 1-6 14-3 1z" fill="#FFC21A"/></g>`),
  hBoot: sv(`<rect x="0" y="34" width="48" height="14" fill="#1FA3C7"/><g class="ga-wave"><path d="M8 30h30l-5 6H13z" fill="#E8E0CC"/><rect x="22" y="12" width="2" height="18" fill="#5D3A1A"/><path d="M24 13l10 12H24z" fill="#F7F7F7"/></g><path d="M2 40q6-3 12 0t12 0 12 0 10 0" stroke="#E6F6FB" stroke-width="1.4" fill="none"/>`),
  hFischer: sv(`<rect x="0" y="0" width="48" height="48" rx="6" fill="#2A3A4A"/><circle cx="24" cy="20" r="8" fill="#E5A65C"/><path d="M14 16h20l-3-6H17z" fill="#FFC21A"/><path d="M18 26c2 4 10 4 12 0v4H18z" fill="#B0BEC5"/><g class="ga-wave"><circle cx="21" cy="20" r="1.2" fill="#14062E"/><circle cx="27" cy="20" r="1.2" fill="#14062E"/></g><rect x="14" y="30" width="20" height="12" rx="3" fill="#FFC21A"/>`),
  hRadio: sv(`<rect x="6" y="16" width="36" height="22" rx="3" fill="#C98A00"/><circle cx="16" cy="27" r="6" fill="#4A2E00"/><rect x="26" y="21" width="12" height="4" fill="#FFF3D1"/><rect x="26" y="29" width="5" height="5" rx="2" fill="#4A2E00"/><path d="M12 16l14-8" stroke="#5E6676" stroke-width="1.6"/><g class="ga-wave"><path d="M40 10c2 2 2 5 0 7M43 7c3 4 3 9 0 13" stroke="#F28C28" stroke-width="1.8" fill="none"/></g>`),
  hDialekt: sv(`<g class="ga-wave"><rect x="4" y="8" width="22" height="14" rx="4" fill="#F7F7F7"/><path d="M8 22l-2 5 6-5" fill="#F7F7F7"/><text x="15" y="18" font-size="7" font-weight="800" text-anchor="middle" fill="#14062E" font-family="monospace">Grüezi</text></g><rect x="22" y="24" width="22" height="14" rx="4" fill="#FFC21A"/><path d="M40 38l2 5-6-5" fill="#FFC21A"/><text x="33" y="34" font-size="7" font-weight="800" text-anchor="middle" fill="#14062E" font-family="monospace">Hoi</text>`),
  hTraktor: sv(`<rect x="0" y="38" width="48" height="10" fill="#6B4A2A"/><g class="ga-wave"><rect x="10" y="22" width="22" height="10" fill="#2E9B4A"/><rect x="26" y="12" width="10" height="14" fill="#2E9B4A"/><rect x="28" y="14" width="6" height="6" fill="#BFE6F2"/><circle cx="14" cy="34" r="7" fill="#14062E"/><circle cx="14" cy="34" r="3" fill="#9AA3B5"/><circle cx="34" cy="36" r="5" fill="#14062E"/><circle cx="34" cy="36" r="2" fill="#9AA3B5"/><rect x="14" y="16" width="3" height="7" fill="#5E6676"/></g>`),
  hGefuehl: sv(`<circle cx="16" cy="20" r="10" fill="#FFC21A"/><circle cx="13" cy="18" r="1.6" fill="#14062E"/><circle cx="19" cy="18" r="1.6" fill="#14062E"/><path d="M11 23c3 4 7 4 10 0" stroke="#14062E" stroke-width="1.6" fill="none"/><g class="ga-wave"><circle cx="32" cy="30" r="10" fill="#4FC3F7"/><circle cx="29" cy="28" r="1.6" fill="#14062E"/><circle cx="35" cy="28" r="1.6" fill="#14062E"/><path d="M28 35c3-3 5-3 8 0" stroke="#14062E" stroke-width="1.6" fill="none"/></g>`),
  hFluester: sv(`<circle cx="18" cy="24" r="11" fill="#B79CFF"/><circle cx="15" cy="21" r="1.6" fill="#14062E"/><circle cx="21" cy="21" r="1.6" fill="#14062E"/><rect x="11" y="26" width="14" height="2" fill="#14062E"/><rect x="17" y="18" width="2" height="12" rx="1" fill="#FFD0A8"/><g class="ga-wave"><text x="38" y="20" font-size="9" fill="#F7F7F7" font-family="monospace" text-anchor="middle">psst</text></g>`),
  hLachen: sv(`<circle cx="24" cy="24" r="14" fill="#FFC21A"/><path d="M16 20q2-3 4 0M28 20q2-3 4 0" stroke="#14062E" stroke-width="1.8" fill="none"/><path class="ga-wave" d="M15 27c4 8 14 8 18 0z" fill="#14062E"/><path d="M19 31c3 2 7 2 10 0" stroke="#E53935" stroke-width="2"/>`),
  hWut: sv(`<circle cx="24" cy="26" r="13" fill="#E53935"/><path d="M15 20l6 3M33 20l-6 3" stroke="#14062E" stroke-width="2"/><path d="M17 33c4-4 10-4 14 0" stroke="#14062E" stroke-width="2" fill="none"/><g class="ga-wave"><path d="M18 8l2 4M24 6v5M30 8l-2 4" stroke="#FF8A1F" stroke-width="2" stroke-linecap="round"/></g>`),
  hAngst: sv(`<circle cx="24" cy="24" r="13" fill="#B3E5FC"/><circle class="ga-wave" cx="19" cy="21" r="3" fill="#fff"/><circle class="ga-wave" cx="29" cy="21" r="3" fill="#fff"/><circle cx="19" cy="21" r="1.2" fill="#14062E"/><circle cx="29" cy="21" r="1.2" fill="#14062E"/><ellipse cx="24" cy="31" rx="3" ry="4" fill="#14062E"/><path d="M36 14q2 4 0 6" stroke="#4FC3F7" stroke-width="2" fill="none"/>`),
  hZoegern: sv(`<circle cx="24" cy="24" r="13" fill="#C9B8FF"/><circle cx="19" cy="22" r="1.6" fill="#14062E"/><circle cx="29" cy="22" r="1.6" fill="#14062E"/><path d="M18 31h12" stroke="#14062E" stroke-width="2"/><g class="ga-wave"><text x="38" y="14" font-size="11" font-weight="800" fill="#FFC21A" font-family="monospace" text-anchor="middle">?</text></g>`)
});

/* ---------- Farben für das Hörspiel-Plakat ---------- */
const POSTER = [
  {v:"studio", n:"Studio-Orange", c:["#2A1206","#FFF1E2","#F28C28"]},
  {v:"nacht", n:"Nachtblau", c:["#0E1A33","#EAF2FF","#4FC3F7"]},
  {v:"neon", n:"Neon-Pink", c:["#1A0B2E","#FFE9FB","#FF2BD6"]},
  {v:"gold", n:"Bühnen-Gold", c:["#1C1408","#FFF6DA","#FFC21A"]}];
const LMVZ = (nr, name) => `Öffnet auf dem iPad das Lehrmittel «Deutsch Sechs» (LMVZ) und sucht «Audio ${nr}: ${name}». Setzt Kopfhörer auf und hört den Ausschnitt zweimal: Beim ersten Mal achtet ihr darauf, worum es insgesamt geht. Beim zweiten Mal achtet ihr auf die Details: Wer spricht? Was passiert genau? Danach löst ihr hier die Fragen.`;

/* ---------- Futter für gLiTCh: Hörspiel-Sachen (8 × 8 Pixel, pro Level eins) ---------- */
const PX = (rows, pal) => rows.map((r, y) => [...r].map((ch, x) => ch === "." ? "" : `<rect x="${x}" y="${y}" width="1" height="1" fill="${pal[ch]}"/>`).join("")).join("");
const HSP_FOODS = [
  {lv:1, n:"Musiknote", say:"Eine Musiknote! Schmeckt nach Do-Re-Mi. Meine Muskeln singen!", svg:PX(["....ppp.","....p.pp","....p..p","....p...","....p...",".pppp...","ppppp...",".ppp...."], {p:"#FF2BD6"})},
  {lv:2, n:"Kassette", say:"Eine Kassette! Knusprig mit Bandsalat. Zurückspulen, nochmal essen!", svg:PX([".oooooo.","occcccco","occcccco","oddooddo","odwoowdo","oddooddo","oooooooo",".o....o."], {o:"#F28C28", c:"#FFF1E2", d:"#2A1206", w:"#E8E0CC"})},
  {lv:3, n:"CD", say:"Eine CD! Glänzt wie ein Regenbogen. Jetzt habe ich 700 MB Muskeln!", svg:PX(["..ssss..",".sabsss.","sabssccs","sbsddscs","sssddscs","sssssccs",".ssssss.","..ssss.."], {s:"#CFD8DC", a:"#FF2BD6", b:"#00E5FF", c:"#FFC21A", d:"#14062E"})},
  {lv:4, n:"Kopfhörer", say:"Kopfhörer zum Znüni! Ich höre jetzt jedes Geräusch, sogar meinen Bizeps.", svg:PX(["..kkkk..",".k....k.","k......k","k......k","pp....pp","pp....pp","pp....pp",".p....p."], {k:"#3A3A44", p:"#F28C28"})},
  {lv:5, n:"Mikrofon", say:"Ein Mikrofon! Test, Test … eins, zwei … ich bin stärker!", svg:PX(["..gggg..","..gddg..","..gggg..","..gddg..","...gg...","...kk...","...kk...","..kkkk.."], {g:"#9AA3B5", d:"#5E6676", k:"#2A2A33"})},
  {lv:6, n:"Schallplatte", say:"Eine Schallplatte! Ich drehe mich vor Freude im Kreis. Rundum stark!", svg:PX(["..kkkk..",".kggggk.","kgkrrkgk","kgrwwrgk","kgrwwrgk","kgkrrkgk",".kggggk.","..kkkk.."], {k:"#14141A", g:"#3A3A44", r:"#E53935", w:"#FFF1E2"})},
  {lv:7, n:"Goldene Schallplatte", say:"Die Goldene Schallplatte! Ich bin offiziell der stärkste Star im Tonstudio!", svg:PX(["..yyyy..",".yooooy.","yoyrryoy","yorwwroy","yorwwroy","yoyrryoy",".yooooy.","..yyyy.."], {y:"#FFE066", o:"#E8B923", r:"#E53935", w:"#FFF1E2"})}
];

const DE = {fach:"de", fachKurz:"DE", foods:HSP_FOODS};
window.GLAB_GE_MODS_DE = {

/* ================================================================ 1 Auftakt: Im Tonstudio */
hsp_tonstudio: Object.assign({}, DE, {
  short:"Im Tonstudio", meter:"Studio-Fortschritt", slogan:"Spektakel fürs Ohr · Auftakt", c:"#F28C28",
  hello:"Willkommen im Tonstudio! Ihr habt in der Klasse schon über Hörspiele gesprochen. Jetzt schauen wir hinter die Kulissen.",
  groups:["Kino für die Ohren","Die Profis im Studio","Fachwörter","Unser Hörspiel-Plakat"],
  prod:{kind:"hsp", name:"Euer Hörspiel-Plakat", stamp:"ON AIR", sub:"Spektakel fürs Ohr · Im Tonstudio", file:"Hörspiel-Plakat", colors:POSTER, picksHead:"Unsere Traumjobs im Tonstudio", textHead:"Darum"},
  sections:[
    {id:"hoerspiel", g:0, type:"mc", title:"Was ist ein Hörspiel?", q:"Was gehört zu einem Hörspiel?",
     th:{term:"Kino für die Ohren", text:"Ein Hörspiel ist eine Geschichte, die man nur hört. Man sieht nichts. Darum muss alles im Ohr passieren: Man hört die Stimmen der Figuren, Geräusche wie Schritte, Regen oder eine knarrende Tür und Musik. Oft erzählt auch eine Erzählerin oder ein Erzähler, was gerade passiert. Stimmen, Geräusche und Musik müssen gut zusammenpassen. Nur so kann man sich alles vorstellen.", weak:"Ein Hörspiel ist ein Film, bei dem das Bild fehlt.", strong:"Stimmen, Geräusche und Musik erzeugen die Bilder im Kopf."},
     qs:[
      {q:"Was kann man in einem Hörspiel NICHT hören?", pic:"music", o:[["farbe","Die Farbe eines Kleides, wenn niemand davon spricht"],["schritte","Schritte im Schnee"],["musik","Spannende Musik"]], a:"farbe", why:"Farben sieht man nur. Im Hörspiel muss jemand davon erzählen, sonst merkt man es nicht."},
      {q:"Wozu braucht es Geräusche im Hörspiel?", pic:"target", o:[["ort","Man kann sich vorstellen, wo die Geschichte spielt."],["lang","Damit das Hörspiel länger dauert."],["pause","Damit die Sprecher Pause machen können."]], a:"ort", why:"Möwen und Wellen lassen dich ans Meer denken, Vogelgezwitscher an einen Wald."},
      {q:"Wer erzählt in vielen Hörspielen, was gerade passiert?", pic:"people", o:[["erz","Eine Erzählerin oder ein Erzähler"],["regie","Die Regisseurin"],["technik","Der Tontechniker"]], a:"erz", why:"Die Erzählstimme gibt Informationen, die man aus den Dialogen nicht hört."}]},
    {id:"ohr", g:0, type:"sort", title:"Hören oder sehen?", q:"Kann man das im Hörspiel hören oder sieht man es nur?", cats:[["ohr","👂 Hört man"],["auge","👀 Sieht man nur"]],
     th:{term:"Alles muss ins Ohr", text:"Im Hörspiel wird alles über das Ohr erzählt. Was man nur sehen kann, muss jemand aussprechen oder mit einem Geräusch zeigen. Ein Gewitter hört man am Donner, ein Lächeln aber nicht.", weak:"Man merkt doch, dass jemand lächelt.", strong:"Ein stilles Lächeln hört man nicht. Jemand muss es sagen."},
     items:[
      ["Ein Gewitter mit Donner","ohr","Den Donner hört man sofort."],
      ["Ein stilles Lächeln","auge","Lächeln macht kein Geräusch."],
      ["Eine knarrende Tür","ohr","Das Knarren verrät, dass jemand hereinkommt."],
      ["Möwen und Meeresrauschen","ohr","So weiss man: Die Szene spielt am Meer."],
      ["Ein stummes Winken","auge","Winken hört man nicht."],
      ["Schnelle Schritte auf einer Treppe","ohr","Man hört, dass jemand rennt."],
      ["Die Farbe des Himmels","auge","Farben sieht man nur."],
      ["Spannende Musik vor einer Überraschung","ohr","Musik macht die Stimmung hörbar."]]},
    {id:"berufe", g:1, type:"match", title:"Wer macht was?", q:"Verbindet die Berufe mit ihren Aufgaben.",
     th:{term:"Die Profis im Tonstudio", text:"Ein Hörspiel entsteht im Tonstudio. Die Sprecherinnen und Sprecher leihen den Figuren ihre Stimme und sprechen ein, was im Hörspielskript steht. Es soll natürlich klingen und nicht abgelesen. Die Regisseurin oder der Regisseur coacht sie und achtet darauf, dass die Regieanweisungen umgesetzt werden. Die Tontechnikerin oder der Tontechniker nimmt alles auf, kontrolliert die Qualität und schneidet die Aufnahmen zum fertigen Hörspiel zusammen.", weak:"Im Tonstudio arbeitet eine Person ganz allein.", strong:"Viele Profis arbeiten zusammen: sprechen, coachen, aufnehmen."},
     pairs:[["Sprecherin / Sprecher","spricht die Sätze der Figuren ein"],["Regisseurin / Regisseur","coacht und achtet auf die Regieanweisungen"],["Tontechnikerin / Tontechniker","nimmt auf und schneidet zusammen"],["Hörspielautorin / -autor","schreibt die Geschichte als Skript"]]},
    {id:"studio", g:1, type:"mc", title:"Im Studio", q:"Was passiert bei der Aufnahme?",
     th:{term:"Regieanweisungen", text:"Im Hörspielskript stehen Regieanweisungen. Sie sagen, wie etwas gesagt werden soll, zum Beispiel flüsternd, lachend oder wütend. Manche Stellen werden mehrmals aufgenommen, bis sie natürlich klingen. Neben den Profis im Studio helfen oft noch andere mit: Geräuschemacher, Komponistinnen oder Sounddesigner.", weak:"Man liest den Text einfach einmal vor.", strong:"Man probt so lange, bis es natürlich klingt."},
     qs:[
      {q:"Was ist eine Regieanweisung?", pic:"scroll", o:[["wie","Eine Angabe im Skript, wie etwas gesagt werden soll"],["musik","Die Musik am Anfang"],["name","Der Name der Regisseurin"]], a:"wie", why:"Zum Beispiel (flüsternd) oder (wütend). Die Regisseurin achtet darauf, dass das umgesetzt wird."},
      {q:"Warum werden manche Stellen mehrmals aufgenommen?", pic:"calendar", o:[["natur","Damit es natürlich klingt und nicht abgelesen"],["spass","Weil es Spass macht"],["lang","Damit das Hörspiel länger wird"]], a:"natur", why:"Die Zuhörenden sollen glauben, dass die Figuren wirklich so reden."},
      {q:"Wer braucht man für ein Hörspiel NICHT?", pic:"people", o:[["kamera","Einen Kameramann"],["geraeusch","Einen Geräuschemacher"],["musik","Eine Komponistin"]], a:"kamera", why:"Ein Hörspiel braucht keine Kamera, aber Geräusche und Musik."}]},
    {id:"fachwoerter", g:2, type:"match", mem:true, title:"Fachwörter-Memory", q:"Findet die Paare: Fachwort und Erklärung.",
     th:{term:"Fachwörter aus dem Tonstudio", text:"Wer im Tonstudio arbeitet, braucht Fachwörter. Einsprechen heisst, einen Text ins Mikrofon sprechen. Coachen heisst, jemanden anleiten und unterstützen. Zusammenschneiden heisst, viele Aufnahmen zu einem Ganzen verbinden. Im Hörspielskript steht der ganze Text des Hörspiels.", weak:"Einsprechen heisst, jemandem etwas einreden.", strong:"Einsprechen heisst, einen Text ins Mikrofon sprechen."},
     pairs:[["einsprechen","Text ins Mikrofon sprechen"],["coachen","anleiten und unterstützen"],["zusammenschneiden","Aufnahmen verbinden"],["Tonstudio","Raum für Tonaufnahmen"],["Hörspielskript","Text des Hörspiels"],["Regieanweisung","sagt, wie man spricht"]]},
    {id:"ablauf", g:2, type:"order", title:"So entsteht ein Hörspiel", q:"Bringt die Schritte in die richtige Reihenfolge. Der erste Schritt kommt oben.",
     th:{term:"Schritt für Schritt", text:"Zuerst braucht es eine gute Geschichte. Daraus wird ein Hörspielskript geschrieben. Dann werden die Rollen verteilt und die Sätze im Tonstudio aufgenommen. Am Schluss schneidet die Tontechnik alles zusammen und ergänzt Geräusche und Musik.", weak:"Musik und Geräusche kommen ganz am Anfang.", strong:"Geräusche und Musik kommen ganz am Schluss dazu."},
     items:[["1","Eine spannende Geschichte finden"],["2","Die Geschichte als Skript schreiben"],["3","Die Rollen verteilen"],["4","Die Sätze im Tonstudio aufnehmen"],["5","Die Aufnahmen zusammenschneiden"],["6","Geräusche und Musik ergänzen"]],
     done:"Genau so entsteht ein Hörspiel: von der Geschichte bis zum fertigen Ton."},
    {id:"traumjob", g:3, type:"pick", title:"Unser Traumjob", q:"Welche Aufgaben im Tonstudio würden euch Spass machen?",
     th:{term:"Und ihr?", text:"Stellt euch vor, ihr dürft einen Tag im Tonstudio mitarbeiten. Welche Aufgaben würden euch am meisten Spass machen? Wählt zwei oder drei aus. Schreibt dann auf, welches Hörspiel ihr kennt und mögt.", weak:"Ist mir egal.", strong:"Ich möchte sprechen, weil ich gern Figuren spiele."},
     picks:[["sprechen","Ins Mikrofon sprechen","hMic"],["regie","Regie führen","hRegie"],["technik","Am Mischpult arbeiten","hTechnik"],["geraeusch","Geräusche machen","hGeraeusch"],["musik","Musik komponieren","hMusik"],["skript","Das Skript schreiben","hSkript"]],
     wow:["Welches Hörspiel kennt ihr? Was gefällt euch daran?","Wir kennen das Hörspiel … Uns gefällt, dass …"]},
    {id:"plakat", g:3, type:"product", title:"Hörspiel-Plakat", q:"Gestaltet euer Hörspiel-Plakat.",
     th:{term:"Euer Plakat", text:"Gebt eurem Plakat einen Titel. Schreibt dann, welche Aufgabe im Tonstudio ihr am liebsten übernehmen würdet und warum. Begründet mit einem «weil».", weak:"Sprechen.", strong:"Wir möchten sprechen, weil wir gern verschiedene Stimmen ausprobieren."},
     titlePh:"z. B. Unser Tag im Tonstudio", textLabel:"Welche Aufgabe würdet ihr am liebsten übernehmen und warum?", textPh:"Wir möchten am liebsten …, weil …"}
  ],
  badges:[
    {n:"Hörspiel-Kenner", d:"Etappe «Kino für die Ohren» als Meisterwerk", i:I.phones},
    {n:"Tonstudio-Profi", d:"Etappe «Die Profis im Studio» als Meisterwerk", i:I.slider},
    {n:"Fachwort-Ass", d:"Etappe «Fachwörter» als Meisterwerk", i:I.book},
    {n:"Studio-Star", d:"Alle 4 Etappen präsentiert", i:I.mic}],
  lex:{
    "Hörspiel":"Eine Geschichte, die man nur hört: mit Stimmen, Geräuschen und Musik.",
    "Hörspielskript":"Der Text eines Hörspiels. Darin steht, wer was sagt und wie.",
    "Regieanweisung":"Eine Angabe im Skript, wie etwas gesagt werden soll, zum Beispiel flüsternd oder wütend.",
    "Regisseurin":"Sie leitet die Aufnahmen und hilft den Sprecherinnen und Sprechern, die Figuren gut zu spielen.",
    "Tontechniker":"Er nimmt alles auf, prüft die Qualität und schneidet die Aufnahmen zusammen.",
    "Tonstudio":"Ein besonderer Raum, in dem man Stimmen und Musik ohne Störgeräusche aufnehmen kann.",
    "einsprechen":"Einen Text ins Mikrofon sprechen, damit er aufgenommen wird.",
    "coachen":"Jemanden anleiten, unterstützen und ihm Tipps geben.",
    "zusammenschneiden":"Viele einzelne Aufnahmen zu einem fertigen Ganzen verbinden.",
    "Erzählerin":"Die Stimme im Hörspiel, die erzählt, was passiert, und keine Figur spielt.",
    "Geräuschemacher":"Jemand, der Geräusche für ein Hörspiel herstellt, zum Beispiel Schritte oder Regen."},
  forms:{"Hörspiel":["Hörspiel","Hörspiele","Hörspiels"],"Hörspielskript":["Hörspielskript","Hörspielskripts"],"Regieanweisung":["Regieanweisung","Regieanweisungen"],"Regisseurin":["Regisseurin","Regisseur"],"Tontechniker":["Tontechnikerin","Tontechniker","Tontechnik"],"Tonstudio":["Tonstudio"],"einsprechen":["einsprechen","Einsprechen"],"coachen":["coacht","coachen","Coachen"],"zusammenschneiden":["zusammenschneiden","schneidet","Zusammenschneiden"],"Erzählerin":["Erzählerin","Erzähler"],"Geräuschemacher":["Geräuschemacher"]},
  tips:["Psst: Unterstrichene Wörter kann man antippen. Dann erkläre ich sie euch!","Schliesst die Augen und stellt euch ein Geräusch vor. Wo seid ihr?","Wischt sanft über mich, das mag ich!","Zieht mein Essen auf mich, es gibt Bonus-Sterne!"],
  poses:{six7:"Mikrofon-Check: eins, zwei, sechs, sieben … 🤷", zen:"Ommm … ich höre die Stille im Tonstudio …", juggle:"Ich jongliere mit Mikrofon, Kopfhörer und Skript!", selfie:"Selfie im Tonstudio! #OnAir"},
  game:{title:"GERÄUSCHE-JAGD", how:"Dinge, die ein Geräusch machen, antippen = +1. Stille Dinge antippen = −1 Leben. Ein Geräusch verpasst = −1 Leben.",
    items:[["🔔 Glocke",1],["🌧️ Regen",1],["🚪 Knarrende Tür",1],["🐶 Bellender Hund",1],["🎺 Trompete",1],["🌊 Wellen",1],["⛈️ Donner",1],["🌈 Regenbogen",0],["🖼️ Bild",0],["🌫️ Nebel",0],["🌙 Mond",0],["🎨 Farbe",0]]}
}),

/* ================================================================ 2 Alles beginnt mit einer guten Geschichte */
hsp_geschichte: Object.assign({}, DE, {
  short:"Alles beginnt mit einer guten Geschichte", meter:"Hörspiel-Fortschritt", slogan:"Spektakel fürs Ohr · Norde isch, wo obe isch", c:"#1FA3C7",
  hello:"Heute erfahrt ihr, wie das Hörspiel «Norde isch, wo obe isch» entstanden ist. Und dann wird zugehört!",
  groups:["Vom Buch zum Hörspiel","Richtig zuhören","Audio 1: Mel und Paul","Unsere Hörspiel-Kritik"],
  prod:{kind:"hsp", name:"Eure Hörspiel-Kritik", stamp:"GEHÖRT", sub:"Hörspiel-Kritik · Norde isch, wo obe isch", file:"Hörspiel-Kritik", colors:POSTER, picksHead:"Das macht das Hörspiel spannend", textHead:"So sprechen Mel und Paul"},
  sections:[
    {id:"buch", g:0, type:"mc", title:"Vom Buch zum Skript", q:"Wie ist das Hörspiel entstanden?",
     th:{term:"Eine Geschichte wird umgeschrieben", text:"Das Hörspiel «Norde isch, wo obe isch» von Radio SRF beruht auf einem Kinderbuch von Rüdiger Bertram. Darin lernen sich Paul und Mel zufällig kennen und reisen Richtung Norden. Die Hörspielautorin Zita Bernet fand das Buch spannend. Für ein Hörspiel von einer Stunde musste sie die Geschichte aber stark kürzen. Sie schrieb das Skript auf Schweizerdeutsch und verlegte die Orte aus Deutschland in die Schweiz.", weak:"Das Hörspiel ist gleich lang wie das Buch.", strong:"Für das Hörspiel wurde die Geschichte stark gekürzt."},
     qs:[
      {q:"Worauf beruht das Hörspiel?", pic:"scroll", o:[["buch","Auf einem Kinderbuch von Rüdiger Bertram"],["film","Auf einem Kinofilm"],["echt","Auf einer wahren Zeitungsmeldung"]], a:"buch", why:"Die Vorlage war das Buch «Norden ist, wo oben ist»."},
      {q:"Warum musste Zita Bernet die Geschichte kürzen?", pic:"calendar", o:[["stunde","Das Hörspiel sollte nur eine Stunde dauern."],["langweilig","Das Buch war langweilig."],["kinder","Kinder mögen keine langen Geschichten."]], a:"stunde", why:"Ein ganzes Buch vorzulesen, würde viel länger dauern."},
      {q:"Was hat sie noch geändert?", pic:"map", o:[["ch","Sie verlegte die Orte in die Schweiz und schrieb auf Schweizerdeutsch."],["namen","Sie gab allen Figuren neue Namen."],["ende","Sie erfand ein ganz neues Ende."]], a:"ch", why:"Ihr Hörspiel sollte in der Schweiz spielen."}]},
    {id:"besetzung", g:0, type:"mc", title:"Rollen und Aufnahme", q:"Wie ging es im Tonstudio weiter?",
     th:{term:"Rollen, Aufnahme und Schnitt", text:"Zita Bernet war auch die Regisseurin. Sie wählte die Sprecherinnen und Sprecher so aus, dass man die Figuren gut unterscheiden kann: Paul spricht Ostschweizer Dialekt, Mel Zürichdeutsch. Im Tonstudio wurde jeder Satz so lange aufgenommen, bis sie zufrieden war. Danach schnitten Tontechnikerinnen und Tontechniker alles zusammen. Ganz am Schluss kamen Geräusche und Musik dazu.", weak:"Zita Bernet hat alle Rollen selbst gesprochen.", strong:"Sie wählte Kinder mit verschiedenen Dialekten, damit man sie unterscheiden kann."},
     qs:[
      {q:"Was war Zita Bernet bei der Besetzung von Paul und Mel wichtig?", pic:"people", o:[["unter","Dass man die beiden Figuren gut unterscheiden kann"],["gross","Dass beide gleich gross sind"],["star","Dass beide berühmt sind"]], a:"unter", why:"Darum sprechen Paul und Mel verschiedene Dialekte."},
      {q:"Welche Berufe kommen bei dieser Produktion NICHT vor?", pic:"hand", o:[["foto","Fotografin"],["regie","Regisseurin"],["ton","Tontechniker"]], a:"foto", why:"Für ein Hörspiel braucht es keine Fotos."},
      {q:"Was kam ganz am Schluss dazu?", pic:"music", o:[["ger","Geräusche und Musik"],["skript","Das Skript"],["rollen","Die Rollen"]], a:"ger", why:"Zuerst wird gesprochen und geschnitten, dann kommen Geräusche und Musik."}]},
    {id:"m1", g:1, type:"sort", title:"Methode M1", q:"Wann macht ihr was beim Zuhören?", cats:[["vor","⏮️ Vorher"],["waehrend","🎧 Während"],["nach","⏭️ Nachher"]],
     th:{term:"Methode M1: Texte hören und verstehen", text:"Beim Zuhören kann man das Tempo nicht selbst bestimmen und verpasst schnell etwas. Darum hört man einen Hörtext immer mehrmals. Vor dem Zuhören sorgt ihr für Ruhe, überlegt, worum es gehen könnte, und klärt euren Hörauftrag. Beim ersten Hören achtet ihr auf das Ganze, danach auf Details, und ihr macht kurze Notizen. Nach dem Zuhören ergänzt ihr die Notizen und stellt eure Fragen.", weak:"Einmal hören reicht, dann weiss man alles.", strong:"Mehrmals hören: zuerst das Ganze, dann die Details."},
     items:[
      ["Für Ruhe sorgen","vor","Ohne Ablenkung hört ihr besser."],
      ["Überlegen, worum es gehen könnte","vor","So seid ihr vorbereitet."],
      ["Den Hörauftrag klären","vor","Dann wisst ihr, worauf ihr achten müsst."],
      ["Beim ersten Mal aufs Ganze achten","waehrend","Die Details kommen später."],
      ["Kurze Notizen machen","waehrend","Stichworte reichen."],
      ["Notizen ergänzen","nach","Jetzt ist Zeit dafür."],
      ["Offene Fragen stellen","nach","Eure Lehrperson hilft euch."]]},
    {id:"vorgeschichte", g:1, type:"mc", title:"Die Vorgeschichte", q:"Was passiert vor dem Ausschnitt?",
     th:{term:"Paul und Mel", text:"Paul lebt mit seinem reichen Vater in einer Villa mit Schiffssteg. Seine Eltern sind geschieden. Paul trickst beide aus: Jeder denkt, Paul sei beim anderen in den Ferien. In Wahrheit will er allein in der Villa bleiben. Mel ist Waise und lebt bei einer Pflegemutter. Sie ist abgehauen, weil sie ihren Bruder besuchen will. Die beiden lernen sich an einer Raststätte kennen. Paul nennt sich «Elvis», damit Mel nicht merkt, dass er reich ist. Mit dem Motorboot seines Vaters starten sie eine abenteuerliche Bootstour.", weak:"Paul erzählt Mel sofort alles über sich.", strong:"Paul gibt sich als Elvis aus und verschweigt, dass er reich ist."},
     qs:[
      {q:"Warum ist Mel unterwegs?", pic:"people", o:[["bruder","Sie will ihren Bruder besuchen."],["ferien","Sie macht Ferien am Meer."],["hund","Sie sucht ihren Hund."]], a:"bruder", why:"Mel hält es bei der Pflegemutter nicht mehr aus und will zu ihrem Bruder."},
      {q:"Wie nennt sich Paul gegenüber Mel?", pic:"music", o:[["elvis","Elvis"],["max","Max"],["erich","Erich"]], a:"elvis", why:"Mel soll nicht wissen, dass ihm die Villa gehört."},
      {q:"Womit starten die beiden ihre Reise?", pic:"river", o:[["boot","Mit dem Motorboot von Pauls Vater"],["zug","Mit dem Zug"],["velo","Mit dem Velo"]], a:"boot", why:"Die Villa hat einen eigenen Schiffssteg."}]},
    {id:"audio1", g:2, type:"mc", title:"Audio 1: Was passiert?", q:"Hört den Ausschnitt und beantwortet die Fragen.",
     th:{term:"🎧 Jetzt wird gehört!", text:LMVZ(1, "Norde isch, wo obe isch"), weak:"Wir hören nur einmal kurz rein.", strong:"Wir hören zweimal: zuerst das Ganze, dann die Details."},
     qs:[
      {q:"Wen treffen Mel und Paul im Ausschnitt?", pic:"people", o:[["erich","Den Fischer Erich"],["polizei","Einen Polizisten"],["vater","Pauls Vater"]], a:"erich", why:"Erich lädt die beiden zum Essen ein."},
      {q:"Warum findet Paul den Fischer unheimlich?", pic:"target", o:[["hund","Er spricht mit einem Hund, den es gar nicht gibt."],["schrei","Er schreit die beiden an."],["boot","Er will ihr Boot stehlen."]], a:"hund", why:"Paul hält Erich deshalb für einen «Psycho»."},
      {q:"Was hört man im Radio?", pic:"music", o:[["polizei","Die Polizei sucht nach Mel."],["wetter","Es kommt ein Sturm."],["musik","Pauls Lieblingslied"]], a:"polizei", why:"Darum muss Mel schnell handeln."},
      {q:"Warum täuscht Mel einen Hustenanfall vor?", pic:"hand", o:[["ablenken","Um Erich abzulenken"],["krank","Weil sie krank ist"],["lachen","Damit Paul lacht"]], a:"ablenken", why:"Erich holt Hilfe, und Mel und Paul fahren mit dem Boot weiter."}]},
    {id:"ereignisse", g:2, type:"order", title:"Die Reihenfolge", q:"Bringt die Ereignisse aus dem Ausschnitt in die richtige Reihenfolge.",
     th:{term:"Was passiert zuerst?", text:"Im Ausschnitt geschieht viel nacheinander. Hört ihn nochmals, wenn ihr unsicher seid. Achtet auf den Schuppen, das Radio und Mels Trick.", weak:"Die Reihenfolge ist egal.", strong:"Zuerst das Treffen, am Schluss die Flucht mit dem Boot."},
     items:[["1","Paul und Mel treffen den Fischer Erich."],["2","Erich lädt die beiden zum Essen ein."],["3","Paul entdeckt im Schuppen einen Käfig und rote Farbe."],["4","Im Radio kommt die Meldung, dass die Polizei Mel sucht."],["5","Mel täuscht einen Hustenanfall vor."],["6","Mel und Paul fahren mit dem Boot weiter."]],
     done:"Genau! Mel lenkt Erich ab, und die beiden können zum Schiff zurück."},
    {id:"stimmen", g:2, type:"sort", title:"Mel oder Paul?", q:"Welche Eigenschaft passt zu wem?", cats:[["mel","👧 Mel"],["paul","👦 Paul"]],
     th:{term:"Figuren und Stimmen", text:"Im Hörspiel hört man, wie eine Figur ist. Nicht nur das Verhalten verrät es, sondern auch die Sprechweise: laut oder leise, schnell oder zögerlich, frech oder vorsichtig. Achtet darauf, wie Mel und Paul sprechen.", weak:"Wie eine Figur ist, merkt man nur am Namen.", strong:"Die Sprechweise verrät viel über eine Figur."},
     items:[
      ["unerschrocken","mel","Mel hat keine Angst vor dem Fischer."],
      ["frech","mel","Mel sagt, was sie denkt."],
      ["um keine Antwort verlegen","mel","Mel hat immer einen Spruch bereit."],
      ["weiss, was sie will","mel","Mel will zu ihrem Bruder."],
      ["schüchtern","paul","Paul hält sich eher zurück."],
      ["vorsichtig","paul","Paul will zuerst nicht mit zum Fischer."],
      ["ein wenig ängstlich","paul","Paul findet Erich unheimlich."],
      ["misstrauisch","paul","Paul denkt bei der roten Farbe an Blut."]]},
    {id:"spannend", g:3, type:"pick", title:"Was macht es spannend?", q:"Was macht das Hörspiel spannend? Wählt zwei oder drei Punkte.",
     th:{term:"Eure Meinung", text:"Ihr habt den Ausschnitt gehört. Was macht ihn spannend? Wählt zwei oder drei Punkte aus und schreibt, was euch beim Zuhören überrascht hat.", weak:"Weiss nicht.", strong:"Spannend ist der unheimliche Fischer, weil man nicht weiss, ob er gefährlich ist."},
     picks:[["mel","Mels freche Art","hDialekt"],["fischer","Der unheimliche Fischer","hFischer"],["radio","Die Radiomeldung","hRadio"],["boot","Die Flucht mit dem Boot","hBoot"],["musik","Geräusche und Musik","hMusik"],["dialekt","Die verschiedenen Dialekte","hMic"]],
     wow:["Was hat euch beim Zuhören überrascht?","Uns hat überrascht, dass …"]},
    {id:"kritik", g:3, type:"product", title:"Hörspiel-Kritik", q:"Schreibt eure Hörspiel-Kritik.",
     th:{term:"Eine Kritik schreiben", text:"In einer Kritik sagt man, was einem gefallen hat und warum. Beschreibt, wie Mel und Paul sprechen und was das über die beiden verrät. Begründet mit «weil».", weak:"Es war gut.", strong:"Mel spricht frech und schnell, weil sie mutig ist. Paul spricht leiser."},
     titlePh:"z. B. Mel und Paul: frech und vorsichtig", textLabel:"Wie sprechen Mel und Paul, und was verrät das über sie?", textPh:"Mel spricht …, weil … Paul dagegen …"}
  ],
  badges:[
    {n:"Buch-Detektiv", d:"Etappe «Vom Buch zum Hörspiel» als Meisterwerk", i:I.book},
    {n:"Zuhör-Profi", d:"Etappe «Richtig zuhören» als Meisterwerk", i:I.ear},
    {n:"Stimmen-Kenner", d:"Etappe «Audio 1: Mel und Paul» als Meisterwerk", i:I.boat},
    {n:"Nordwärts!", d:"Alle 4 Etappen präsentiert", i:I.compass}],
  lex:{
    "Hörspielautorin":"Sie schreibt eine Geschichte als Hörspielskript.",
    "Vorlage":"Das Original, auf dem etwas Neues beruht, zum Beispiel ein Buch für ein Hörspiel.",
    "Besetzung":"Die Auswahl, wer welche Figur spricht oder spielt.",
    "Dialekt":"Die Sprache einer Region, zum Beispiel Zürichdeutsch oder Ostschweizer Dialekt.",
    "Schnitt":"Das Zusammensetzen der Aufnahmen zu einem fertigen Hörspiel.",
    "Sprechweise":"Wie jemand spricht: laut, leise, schnell, frech, zögerlich …",
    "Waise":"Ein Kind, dessen Eltern gestorben sind.",
    "Pflegemutter":"Eine Frau, die ein Kind bei sich aufnimmt und für es sorgt.",
    "Raststätte":"Ein Halteplatz an der Autobahn mit Restaurant und Tankstelle.",
    "Hörauftrag":"Die Frage oder Aufgabe, auf die man beim Zuhören achten soll."},
  forms:{"Hörspielautorin":["Hörspielautorin"],"Vorlage":["Vorlage"],"Besetzung":["Besetzung"],"Dialekt":["Dialekt","Dialekte"],"Schnitt":["Schnitt"],"Sprechweise":["Sprechweise"],"Waise":["Waise"],"Pflegemutter":["Pflegemutter"],"Raststätte":["Raststätte"],"Hörauftrag":["Hörauftrag"]},
  tips:["Hört den Ausschnitt zweimal, dann verpasst ihr nichts!","Achtet beim Zuhören auf die Stimmen: Wer klingt frech, wer vorsichtig?","Unterstrichene Wörter kann man antippen!","Zieht mein Essen auf mich, es gibt Bonus-Sterne!"],
  poses:{six7:"Norden ist … oben? Oder sechs-sieben? 🤷", zen:"Ommm … das Boot schaukelt so schön …", juggle:"Ich jongliere mit Kompass, Ruder und Kopfhörer!", selfie:"Selfie auf dem Motorboot! #Nordwärts"},
  game:{title:"BOOTSTOUR-JAGD", how:"Dinge für eine Bootstour antippen = +1. Unpassende Dinge antippen = −1 Leben. Etwas Wichtiges verpasst = −1 Leben.",
    items:[["🧭 Kompass",1],["🛟 Rettungsring",1],["🗺️ Karte",1],["🎣 Angel",1],["🥪 Proviant",1],["🔦 Taschenlampe",1],["🧥 Regenjacke",1],["🛋️ Sofa",0],["🎹 Klavier",0],["🧊 Kühlschrank",0],["🚲 Velo",0],["🛏️ Bett",0]]}
}),

/* ================================================================ 3 Das Hörspielskript */
hsp_skript: Object.assign({}, DE, {
  short:"Das Hörspielskript", meter:"Skript-Fortschritt", slogan:"Spektakel fürs Ohr · Kannawoniwasein!", c:"#E0533A",
  hello:"Heute schaut ihr in ein echtes Hörspielskript. Finn und Jola fahren Traktor!",
  groups:["So sieht ein Skript aus","Audio 2: Finn und Jola","Regieanweisungen","Unser Mini-Skript"],
  prod:{kind:"hsp", name:"Euer Mini-Skript", stamp:"SKRIPT", sub:"Hörspielskript · Spektakel fürs Ohr", file:"Mini-Skript", colors:POSTER, picksHead:"Diese Regieanweisungen brauchen wir", textHead:"Unser Skript"},
  sections:[
    {id:"aufbau", g:0, type:"mc", title:"Der Aufbau", q:"Wie ist ein Hörspielskript aufgebaut?",
     th:{term:"Das Hörspielskript", text:"Ein Hörspielskript ist der Text, den die Sprecherinnen und Sprecher im Studio vor sich haben. Links steht, wer spricht. Rechts steht, was die Figur sagt. Dazu kommen Regieanweisungen in Klammern. Sie sagen, wie etwas gesagt wird, zum Beispiel (flüsternd) oder (lachend). Manchmal steht dort auch ein Geräusch, zum Beispiel (Tür knarrt). Im Dialog reden die Figuren wie im echten Leben: mit unvollständigen Sätzen, Ausrufen wie «Hey!» und Pausen.", weak:"Die Regieanweisungen werden laut mitgesprochen.", strong:"Regieanweisungen spricht man nicht aus, man setzt sie mit der Stimme um."},
     qs:[
      {q:"Was steht links im Skript?", pic:"people", o:[["wer","Wer spricht"],["wie","Wie laut es ist"],["wo","Wo die Szene spielt"]], a:"wer", why:"Zum Beispiel «Jola:» oder «Finn:»."},
      {q:"Wozu braucht es Regieanweisungen?", pic:"scroll", o:[["wie","Sie sagen, wie etwas gesagt werden soll."],["ende","Sie verraten das Ende."],["zahl","Sie zählen die Sätze."]], a:"wie", why:"So wissen die Sprecher, ob sie flüstern, lachen oder schreien sollen."},
      {q:"Was ist typisch für einen Hörspiel-Dialog?", pic:"lingua", o:[["echt","Unvollständige Sätze, Ausrufe und Pausen"],["lang","Nur sehr lange Sätze"],["reim","Alles reimt sich"]], a:"echt", why:"Die Figuren sprechen wie im echten Leben, nicht wie in einem Aufsatz."}]},
    {id:"regieodertext", g:0, type:"sort", title:"Regie oder Text?", q:"Ist das eine Regieanweisung oder ein gesprochener Satz?", cats:[["regie","🎬 Regieanweisung"],["text","💬 Gesprochen"]],
     th:{term:"Ein Beispiel", text:"Lina: (flüsternd) Hörst du das? – Tom: Was denn? – (Ein Ast knackt.) – Lina: (ängstlich) Da ist jemand! – Tom: (lachend) Ach was, das ist bloss ein Eichhörnchen. Alles in Klammern ist Regieanweisung. Das spricht niemand aus.", weak:"(flüsternd) sagt die Sprecherin laut.", strong:"Die Sprecherin flüstert, statt «flüsternd» zu sagen."},
     items:[
      ["(flüsternd)","regie","Das sagt, wie Lina spricht."],
      ["Hörst du das?","text","Das sagt Lina wirklich."],
      ["(Ein Ast knackt.)","regie","Das ist ein Geräusch, keine gesprochene Stelle."],
      ["Da ist jemand!","text","Das ruft Lina."],
      ["(lachend)","regie","Das sagt, wie Tom spricht."],
      ["Ach was, das ist bloss ein Eichhörnchen.","text","Das sagt Tom."]]},
    {id:"audio2", g:1, type:"mc", title:"Audio 2: Was passiert?", q:"Hört den Ausschnitt und beantwortet die Fragen.",
     th:{term:"🎧 Kannawoniwasein!", text:"Das Hörspiel «Kannawoniwasein!» (gesprochen: Kann ja wohl nicht wahr sein!) beruht auf einem Kinderbuch von Martin Muser. Finn und Jola sind zusammen unterwegs nach Berlin. Jola spricht mit Berliner Akzent. Wenn ihr nicht alles versteht, ist das okay. " + LMVZ(2, "Kannawoniwasein!"), weak:"Ich muss jedes Wort verstehen.", strong:"Zuerst verstehe ich das Ganze, dann die Details."},
     qs:[
      {q:"Was entdecken Finn und Jola?", pic:"target", o:[["traktor","Einen Traktor"],["boot","Ein Boot"],["velo","Zwei Velos"]], a:"traktor", why:"Jola weiss, wie man ihn startet."},
      {q:"Wer weiss, wie man den Traktor startet?", pic:"hand", o:[["jola","Jola"],["finn","Finn"],["bauer","Ein Bauer"]], a:"jola", why:"Jola gibt dem zögernden Finn Anweisungen."},
      {q:"Warum fühlt sich Finn unwohl?", pic:"stick", o:[["schein","Sie haben keinen Führerschein."],["regen","Es regnet."],["hunger","Er hat Hunger."]], a:"schein", why:"Finn ist vorsichtig und denkt an die Regeln."},
      {q:"Was sagt Jola dazu?", pic:"lingua", o:[["land","In der Landwirtschaft dürfen auch Kinder Traktor fahren."],["egal","Das merkt niemand."],["kurz","Wir fahren nur ein kleines Stück."]], a:"land", why:"Jola findet, das sei kein Problem."}]},
    {id:"traktor", g:1, type:"order", title:"Die Traktorfahrt", q:"Bringt die Ereignisse in die richtige Reihenfolge.",
     th:{term:"Was passiert zuerst?", text:"Hört den Ausschnitt nochmals, wenn ihr unsicher seid. Achtet darauf, wann der Motor anspringt und wann Finn Bedenken bekommt.", weak:"Finn ist von Anfang an mutig.", strong:"Finn zögert, freut sich kurz und bekommt dann Bedenken."},
     items:[["1","Finn und Jola entdecken einen Traktor."],["2","Jola erklärt Finn, wie man ihn startet."],["3","Beim zweiten Versuch springt der Motor an."],["4","Die beiden fahren los, Jola jubelt."],["5","Finn bekommt Bedenken wegen des Führerscheins."]],
     done:"Genau so! Finn freut sich zuerst auch, dann wird ihm mulmig."},
    {id:"berlinerisch", g:1, type:"match", title:"Berlinerisch", q:"Jola spricht Berlinerisch. Was heisst das auf Hochdeutsch?",
     th:{term:"Ein Berliner Akzent", text:"Jola hat einen Berliner Akzent. Im Berliner Dialekt sagt man «icke» statt «ich», «lofen» statt «laufen» und «jut» statt «gut»: Das g wird oft zu einem j. Ein Trecker ist ein anderes Wort für Traktor.", weak:"Jola spricht einfach falsch.", strong:"Jola spricht einen Dialekt aus Berlin."},
     pairs:[["icke","ich"],["lofen","laufen"],["jut","gut"],["Trecker","Traktor"]]},
    {id:"finnjola", g:2, type:"sort", title:"Finn oder Jola?", q:"Welche Eigenschaft passt zu wem?", cats:[["finn","👦 Finn"],["jola","👧 Jola"]],
     th:{term:"Zwei verschiedene Figuren", text:"Finn wirkt zu Beginn unsicher und ängstlich. Er freut sich zwar mit Jola, ist aber längst nicht so ausgelassen wie sie und wird bald beunruhigt. Jola wirkt keck und selbstsicher. Sie gibt Befehle, wischt Finns Bedenken weg und ist übermütig.", weak:"Finn und Jola sind genau gleich.", strong:"Finn ist vorsichtig, Jola ist keck und übermütig."},
     items:[
      ["unsicher","finn","Finn weiss nicht, ob das eine gute Idee ist."],
      ["ängstlich","finn","Finn hat Bedenken."],
      ["beunruhigt","finn","Nach der ersten Freude wird ihm mulmig."],
      ["keck","jola","Jola hat eine freche, mutige Art."],
      ["selbstsicher","jola","Jola weiss, wie man den Traktor startet."],
      ["gibt Befehle","jola","Jola sagt Finn, was er tun soll."],
      ["übermütig","jola","Jola jubelt laut."]]},
    {id:"regie", g:2, type:"match", title:"Passende Regieanweisung", q:"Welche Regieanweisung passt zu welchem Satz?",
     th:{term:"Gefühle hörbar machen", text:"Eine gute Regieanweisung passt zum Gefühl der Figur in diesem Moment. Wer jubelt, ist übermütig oder begeistert. Wer staunt, ist verwundert. Wer zweifelt, ist skeptisch. Wer sicher ist, spricht überzeugt.", weak:"Man schreibt immer (normal).", strong:"Die Regieanweisung passt zum Gefühl: (übermütig), (skeptisch) …"},
     pairs:[["Jola: «Elasticofantastico – es funktioniert!»","übermütig, begeistert"],["Jola: «Hey, was ist denn los? Freust du dich gar nicht?»","verwundert, erstaunt"],["Finn: «Ich weiss nicht. Wir haben keinen Führerschein.»","skeptisch, besorgt"],["Jola: «Ach was! Das ist ein Trecker und kein Auto.»","überzeugt, selbstbewusst"]]},
    {id:"gefuehle", g:2, type:"match", mem:true, title:"Gefühlswörter-Memory", q:"Findet Wörter mit ähnlicher Bedeutung.",
     th:{term:"Wörter für Regieanweisungen", text:"Für Regieanweisungen braucht man viele Gefühlswörter. Ausgelassen heisst sehr fröhlich und übermütig. Verwundert heisst erstaunt. Skeptisch heisst zweifelnd. Selbstsicher heisst selbstbewusst.", weak:"Fröhlich reicht für alles.", strong:"Je genauer das Gefühlswort, desto besser die Stimme."},
     pairs:[["ausgelassen","überschäumend"],["verwundert","verblüfft"],["skeptisch","zweifelnd"],["selbstsicher","selbstbewusst"],["besorgt","beunruhigt"],["begeistert","jubelnd"]]},
    {id:"auswahl", g:3, type:"pick", title:"Unsere Regieanweisungen", q:"Welche Regieanweisungen braucht ihr in eurem Mini-Skript?",
     th:{term:"Jetzt seid ihr die Autoren", text:"Ihr schreibt ein kurzes Hörspielskript mit zwei Figuren. Wählt zuerst zwei oder drei Regieanweisungen aus, die vorkommen sollen. Schreibt dann, worum es in eurer Szene geht.", weak:"Wir schreiben einfach irgendwas.", strong:"Unsere Szene: Zwei Kinder finden nachts eine geheime Tür."},
     picks:[["begeistert","(begeistert)","hGefuehl"],["fluesternd","(flüsternd)","hFluester"],["lachend","(lachend)","hLachen"],["wuetend","(wütend)","hWut"],["aengstlich","(ängstlich)","hAngst"],["zoegernd","(zögernd)","hZoegern"]],
     wow:["Worum geht es in eurer Szene?","In unserer Szene …"]},
    {id:"skript", g:3, type:"product", title:"Mini-Skript", q:"Schreibt euer Mini-Skript.",
     th:{term:"Euer Skript", text:"Schreibt vier bis sechs Sätze mit zwei Figuren. Vor jeden Satz kommt der Name der Figur und in Klammern eine Regieanweisung. Zum Beispiel: Jola: (begeistert) Es funktioniert! Lest euer Skript danach gestaltend vor: Haltet euch an die Regieanweisungen!", weak:"Jola: Es funktioniert.", strong:"Jola: (begeistert) Es funktioniert!"},
     titlePh:"z. B. Die geheime Tür", textLabel:"Euer Mini-Skript mit Namen und Regieanweisungen", textPh:"Lina: (flüsternd) Hörst du das?\nTom: (zögernd) Was denn?\n…"}
  ],
  badges:[
    {n:"Skript-Kenner", d:"Etappe «So sieht ein Skript aus» als Meisterwerk", i:I.script},
    {n:"Traktor-Profi", d:"Etappe «Audio 2: Finn und Jola» als Meisterwerk", i:I.tractor},
    {n:"Regie-Talent", d:"Etappe «Regieanweisungen» als Meisterwerk", i:I.clap},
    {n:"Hörspiel-Autor", d:"Alle 4 Etappen präsentiert", i:I.mask}],
  lex:{
    "Hörspielskript":"Der Text eines Hörspiels. Links steht, wer spricht, rechts, was die Figur sagt.",
    "Regieanweisung":"Eine Angabe im Skript, wie etwas gesagt werden soll, zum Beispiel (flüsternd) oder (wütend).",
    "Dialog":"Ein Gespräch zwischen zwei oder mehr Figuren.",
    "Trecker":"Ein anderes Wort für Traktor, vor allem in Norddeutschland.",
    "Kupplung":"Ein Pedal im Fahrzeug, das man beim Starten und Schalten treten muss.",
    "Landwirtschaft":"Die Arbeit auf dem Bauernhof: Felder bestellen und Tiere halten.",
    "ausgelassen":"Sehr fröhlich und übermütig, voller Freude.",
    "Akzent":"Eine besondere Art auszusprechen, an der man hört, woher jemand kommt.",
    "skeptisch":"Zweifelnd, man glaubt etwas nicht so richtig.",
    "gestaltend vorlesen":"So vorlesen, dass man die Gefühle der Figuren hört."},
  forms:{"Hörspielskript":["Hörspielskript","Skript"],"Regieanweisung":["Regieanweisung","Regieanweisungen"],"Dialog":["Dialog","Dialoge"],"Trecker":["Trecker"],"Kupplung":["Kupplung"],"Landwirtschaft":["Landwirtschaft"],"ausgelassen":["ausgelassen"],"Akzent":["Akzent"],"skeptisch":["skeptisch"],"gestaltend vorlesen":["gestaltend"]},
  tips:["Alles in Klammern ist Regieanweisung. Das spricht niemand aus!","Probiert die Sätze laut aus: flüsternd, lachend, wütend!","Unterstrichene Wörter kann man antippen!","Zieht mein Essen auf mich, es gibt Bonus-Sterne!"],
  poses:{six7:"Kann ja wohl nicht wahr sein … sechs, sieben! 🤷", zen:"Ommm … der Traktor brummt so beruhigend …", juggle:"Ich jongliere mit Skript, Mikrofon und Traktorschlüssel!", selfie:"Selfie auf dem Trecker! #Kannawoniwasein"},
  game:{title:"BAUERNHOF-JAGD", how:"Dinge vom Bauernhof antippen = +1. Dinge aus der Stadt antippen = −1 Leben. Etwas vom Bauernhof verpasst = −1 Leben.",
    items:[["🚜 Traktor",1],["🐄 Kuh",1],["🌾 Weizen",1],["🐓 Huhn",1],["🐖 Schwein",1],["🥕 Rüebli",1],["🐑 Schaf",1],["🚇 U-Bahn",0],["🏢 Hochhaus",0],["🚕 Taxi",0],["🛍️ Einkaufszentrum",0],["🎡 Riesenrad",0]]}
})
};
Object.assign(window.GLAB_GE_MODS, window.GLAB_GE_MODS_DE);
Object.keys(window.GLAB_GE_MODS_DE).forEach(m=>window.GLAB_GE_MODS[m].badges.forEach((b,k)=>window.GLAB_GE_BADGES.push(Object.assign({id:`${m}_${k+1}`, mod:m, art:ART(`${m}_${k+1}`)}, b))));

/* ---------- Deutsch-Module laufen immer im Dark Mode ---------- */
if (/^#hsp_/.test(location.hash)){ document.documentElement.dataset.theme = "dark"; document.documentElement.dataset.hsp = "1"; }

/* ---------- Produkt «Hörspiel-Plakat» (Klasse ge-hsp) ---------- */
const st = document.createElement("style");
st.textContent = `
.ge-hsp{background:radial-gradient(120% 90% at 85% 0%, color-mix(in srgb, var(--p3) 28%, var(--p1)), var(--p1) 60%); box-shadow:-5px 5px 0 var(--p3), inset 0 0 0 2px color-mix(in srgb, var(--p3) 30%, transparent)}
.ge-hsp h3{font-family:"Bricolage Grotesque", system-ui, sans-serif; font-size:1.55rem; padding-right:92px; letter-spacing:.01em}
.ge-hsp .ge-ch-sub{margin:0; display:flex; align-items:center; gap:8px; font:700 .72rem/1 ui-monospace, monospace; letter-spacing:.14em; text-transform:uppercase; color:var(--p3)}
.ge-hsp .ge-ch-sub::before{content:""; width:10px; height:10px; border-radius:50%; background:#FF3B30; box-shadow:0 0 0 3px color-mix(in srgb, #FF3B30 30%, transparent); animation:geHspRec 1.4s ease-in-out infinite}
.ge-hsp .ge-stamp{background:#FF3B30; color:#fff; border-color:#FF3B30; transform:rotate(6deg)}
.ge-hsp ul{list-style:none; padding:0}
.ge-hsp li{position:relative; padding-left:22px}
.ge-hsp li::before{content:"♪"; position:absolute; left:2px; color:var(--p3); font-weight:800}
.ge-hsp .ge-pt{font-family:ui-monospace, Menlo, monospace; font-size:.95rem}
.ge-swp.ge-hsp i:first-child{background:var(--p3)}
@keyframes geHspRec{50%{opacity:.35}}
/* Diplome im Modul: Schallplatten statt Sechsecke (gold, wenn erreicht) */
html[data-hsp] .bdg{clip-path:circle(50%)!important; border-radius:50%; background:radial-gradient(circle, #3A3A44 0 30%, transparent 31%), repeating-radial-gradient(circle, #1C1C24 0 1.4px, #2A2A33 1.4px 2.8px)!important; color:rgba(255,255,255,.4)!important}
html[data-hsp] .bdg svg{width:46%; height:46%; position:relative; z-index:1}
html[data-hsp] .bdg.on{background:radial-gradient(circle, var(--bc, #F28C28) 0 31%, #14062E 32% 34%, transparent 35%), repeating-radial-gradient(circle, #E8B923 0 1.4px, #C98A00 1.4px 2.8px)!important; color:#14062E!important; animation:hspSpin 6s linear infinite}
html[data-hsp] .bdg.on::after{content:""; position:absolute; inset:0; border-radius:50%; background:linear-gradient(135deg, rgba(255,255,255,.45), transparent 45%); pointer-events:none}
html[data-hsp] .badge-pop .bdg.on{animation:hspSpin 1.6s linear infinite!important}
html[data-hsp] .badge-pop{border-color:#E8B923!important; background:linear-gradient(135deg, #2A1206, #4A1D00)!important}
html[data-hsp] .badge-pop small::before{content:"💿 "}
@keyframes hspSpin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){html[data-hsp] .bdg.on{animation:none!important}}
.rm-hsp-dance{animation:rmHspDance 1s ease-in-out infinite}
.rm-hsp-dance2{animation:rmHspDance2 1.2s ease-in-out infinite}
@keyframes rmHspDance{0%,100%{transform:rotate(-6deg) translateY(0)}25%{transform:rotate(0) translateY(-3px)}50%{transform:rotate(6deg) translateY(0)}75%{transform:rotate(0) translateY(-3px)}}
@keyframes rmHspDance2{0%,100%{transform:translateX(-2px) rotate(-3deg)}50%{transform:translateX(2px) translateY(-2px) rotate(4deg)}}
@media (prefers-reduced-motion: reduce){.rm-hsp-dance,.rm-hsp-dance2{animation:none}}
@media (prefers-reduced-motion: reduce){.ge-hsp .ge-ch-sub::before{animation:none}}`;
(document.head || document.documentElement).appendChild(st);
})();
