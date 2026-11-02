/* ================= gLiTCh-Lab Lernumgebung =================
   Konten (Vorname + PIN) und Klassen-Daten liegen auf jedem iPad im Browser-Speicher.
   Austausch zwischen Geräten: «Klassen-Datei» (Lehrperson → iPads) und «Sicherung» (iPad → Lehrperson), z. B. per AirDrop.
   Beim Laden einer Datei wird zusammengeführt: Sterne zählen das Maximum, Abzeichen werden vereinigt, Projekte: neuester Stand gewinnt. */
/* Die Artifact-Ansicht blockiert echtes Formular-Absenden: Knopf-Klick und Enter lösen das submit-Ereignis selbst aus */
document.addEventListener("click", e=>{
  const b = e.target.closest && e.target.closest("button"); if (!b || !b.form) return;
  const ty = (b.getAttribute("type") || "submit").toLowerCase(); if (ty !== "submit") return;
  e.preventDefault(); b.form.dispatchEvent(new Event("submit", {bubbles:true, cancelable:true}));
}, true);
document.addEventListener("keydown", e=>{
  if (e.key !== "Enter" || e.isComposing) return; const el = e.target;
  if (!el || el.tagName !== "INPUT" || !el.form || el.closest("[data-pt-form]")) return;
  e.preventDefault(); el.form.dispatchEvent(new Event("submit", {bubbles:true, cancelable:true}));
}, true);
(function(){
const MODULES = [
  {id:"prompt", n:"Prompt-Labor", d:"Baut in der Gruppe den ultimativen Prompt für eine Klassen-App, testet sie und macht sie besser.", c:"#8B5CFF", c2:"#3A1D7A", live:true,
   i:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v1h6v-1c0-.4.2-.8.5-1.1A6 6 0 0 0 12 3z"/>'},
  {id:"fakenews", req:{badge:"buehne", txt:"Wird freigeschaltet, sobald ihr Teil 1 im Prompt-Labor fertig habt (alle 4 Etappen präsentiert)."}, n:"Fake-News-Detektiv", d:"Echte Meldung oder Falle? Spuren sichern, Bilder rückwärts suchen und eine Faktencheck-Karte gestalten.", c:"#DD4646", c2:"#5A1414", live:true,
   i:'<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5M8 10.5h5M10.5 8v5"/>'},
  {id:"kibilder", req:{badge:"fn_alle", txt:"Wird freigeschaltet, sobald ihr alle 6 Fallakten im Fake-News-Detektiv gelöst habt."}, live:true, n:"KI-Bild oder echt?", d:"Wie entstehen KI-Bilder und Filter? Unterschiede entdecken und ein eigenes Vorher-Nachher-Plakat erstellen.", c:"#00B3C7", c2:"#0B3E5A",
   i:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/>'},
  {id:"eidgenossen", live:true, n:"Alte Eidgenossenschaft", y:"1291 – 1798", d:"Bundesbrief, Sagen und Schlachten: Wie aus drei Talschaften ein Bund von 13 Orten wurde. Am Schluss schreibt ihr eine Chronik-Seite.", c:"#D52B1E", c2:"#5A0F0A",
   i:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>'},
  {id:"helvetik", live:true, req:{badge:"eidgenossen_4", txt:"Wird freigeschaltet, sobald ihr alle 4 Etappen der Alten Eidgenossenschaft präsentiert habt."}, n:"Helvetische Republik", y:"1798 – 1803", d:"Die Franzosen kommen! Ein neuer Staat mit gleichen Rechten, aber auch Streit und Not. Am Schluss gestaltet ihr ein Flugblatt.", c:"#1F9D68", c2:"#0B2E22",
   i:'<path d="M12 21v-6M12 3l5 7h-3l4 5H6l4-5H7z"/>'},
  {id:"mediation", live:true, req:{badge:"helvetik_4", txt:"Wird freigeschaltet, sobald ihr alle 4 Etappen der Helvetischen Republik präsentiert habt."}, n:"Mediationszeit", y:"1803 – 1813", d:"Napoleon vermittelt: 19 Kantone, Soldaten für Frankreich und das Drama an der Beresina. Am Schluss macht ihr eine Zeitungs-Titelseite.", c:"#2E6BE6", c2:"#10265A",
   i:'<path d="M2 15c3-6 17-6 20 0-6 2-14 2-20 0zM8 11c1-3 7-3 8 0"/>'},
  {id:"restauration", live:true, req:{badge:"mediation_4", txt:"Wird freigeschaltet, sobald ihr alle 4 Etappen der Mediationszeit präsentiert habt."}, n:"Restauration und Wiener Kongress", y:"1815", d:"Nach Napoleon wird Europa in Wien neu geordnet. Die Schweiz bekommt 22 Kantone und wird neutral. Am Schluss schreibt ihr einen Brief aus Wien.", c:"#E3A300", c2:"#6B3A00",
   i:'<path d="M3 13c4 0 6-2 8-6 1 3 3 5 7 5l3-2-1 4c-2 3-6 5-11 5-3 0-5-2-6-6z"/>'}
,
  {id:"nachbarn", live:true, req:{badge:"restauration_4", txt:"Wird freigeschaltet, sobald ihr alle 4 Etappen von «Restauration und Wiener Kongress» präsentiert habt."}, n:"Nachbarländer der Schweiz", y:"5 Länderakten", d:"Deutschland, Frankreich, Italien, Österreich und Liechtenstein: Wählt eine Länderakte und entdeckt Geografie, Geschichte, Sprache und Alltag. Am Schluss gestaltet ihr einen Reisepass mit Stempeln.", c:"#00B3C7", c2:"#0B3E5A",
   i:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'},
  {id:"erfindungen", live:true, req:{badge:"nachbarn_4", txt:"Wird freigeschaltet, sobald ihr den Reisepass der Nachbarländer präsentiert habt."}, n:"Schweizer Erfindungen", y:"Lektion 45 Min. + Extra-Level", d:"Vom Sackmesser über die Milchschokolade bis zum Klettverschluss: Erfinder-Rätsel, Zeitmaschine und Extra-Level. Am Schluss meldet ihr eine eigene Erfindung zum Patent an.", c:"#FF7A00", c2:"#5A2A00",
   i:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v1h6v-1c0-.4.2-.8.5-1.1A6 6 0 0 0 12 3z"/>'},
  {id:"politik", live:true, req:{badge:"erfindungen_4", txt:"Wird freigeschaltet, sobald ihr alle 4 Etappen der Schweizer Erfindungen präsentiert habt."}, n:"Schweizer Politik", y:"Abstimmungs-Simulation", d:"Bringt eine eigene Volksinitiative auf den Weg: Unterschriften sammeln, Argumente abwägen, Kampagne führen und am Abstimmungssonntag auf Volk und Kantone hoffen.", c:"#8B5CFF", c2:"#2A1660",
   i:'<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M9 10V5h6v5M10 14h4"/>'},
  {id:"ebenen", live:true, req:{badge:"politik_4", txt:"Wird freigeschaltet, sobald ihr alle 4 Etappen der Schweizer Politik präsentiert habt."}, n:"Die drei Ebenen: Bund, Kantone, Gemeinden", y:"Ebenen-Simulator", d:"Wer ist wofür zuständig? Im Ebenen-Simulator verteilt ihr Anliegen, findet Kantone auf der Karte und überzeugt die Gemeindeversammlung von eurem Budget.", c:"#FF4F8B", c2:"#5A0F33",
   i:'<path d="M4 20h16M6 16h12M8 12h8M12 4l5 4H7z"/>'}
];
const COLS = ["#8B5CFF","#DD4646","#2E6BE6","#1F9D68","#E3A300","#FF4F8B","#00B3C7","#7B5CFF","#FF7A00","#3A1D7A"];
const DIPCOL = ["#FF2BD6","#00E5FF","#FFC21A","#3CFF7A","#B79CFF","#FF7A00","#5B8CFF","#FF5D8F"];
const BCOL = ["#FFC21A","#FF2BD6","#00E5FF","#3CC48A","#FF7A00","#B79CFF","#FF5D5D","#5B8CFF","#F5E663","#FFFFFF"];
const GROUP_MAX = 8;

const esc = s => String(s ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const newPin = () => String(Math.floor(1000 + Math.random()*9000));
const now = () => Date.now();
function lsGet(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } }
function lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e){ return false; } }

/* ===== Brücke zum Glitchlab =====
   Das Glitchlab liefert Kind, Team, Sterne und Extras. Alles wird dort gespeichert. */
const HB = (()=>{ try { return window.parent !== window && window.parent.GLHubBridge ? window.parent.GLHubBridge : null; } catch(e){ return null; } })();
const MODE0 = (location.hash || "#lobby").slice(1);
/* Prompt-Labor: Teil 1 und Teil 2 sind im Glitchlab zwei Module (gleiche Arbeit, eigene Ansicht) */
window.GLAB_PART = HB ? (MODE0 === "prompt2" ? 2 : MODE0 === "prompt" ? 1 : 0) : 0;
const MODE = MODE0 === "prompt2" ? "prompt" : MODE0;
const LAB_MODS = ["prompt","fakenews","kibilder"].concat(MODULES.filter(m=>!["prompt","fakenews","kibilder"].includes(m.id) && m.live).map(m=>m.id));
const curMod = LAB_MODS.includes(MODE) ? MODE : null;
const ctx = HB ? HB.context(curMod) : null;
/* Extras aus hochgeladenen Modulen (vom Glitchlab geliefert). Jedes Extra hat ein «badge»: das bekommt man, wenn die Bedingung im Modul erfüllt ist. */
const CU = window.GLAB_CUSTOM = Object.assign({outfits:[], emotes:[], room:[], bgs:[], dips:[], mods:[]}, (ctx && ctx.custom) || {});
/* Hochgeladene Module erscheinen in der Diplom-Übersicht (ihre Diplome hängen an der Wand wie alle anderen) */
CU.mods.forEach(m=>{ if (!MODULES.some(x=>x.id === m.id)) MODULES.push({id:m.id, n:m.n, d:"", c:m.c || "#8B5CFF", c2:"#1A0B3A", live:false, i:`<text x="12" y="13" font-size="15" text-anchor="middle" dominant-baseline="central" stroke="none" fill="currentColor">${String(m.emoji || "🧩").replace(/[<>&"]/g, "")}</text>`}); });
const MI_WALL = {
  erfinder: `<g class="wl-sway"><path d="M10 1.2V6.2" stroke="#3A2410" stroke-width=".4"/><rect x="8.5" y="6" width="3" height="2.2" rx=".4" fill="#7A7F8C"/><path d="M8.5 7h3M8.5 7.7h3" stroke="#5A6475" stroke-width=".25"/><circle cx="10" cy="12.4" r="4.3" fill="#FFE680" stroke="#C98A00" stroke-width=".4"/><path d="M8.3 12.6l.85-1.2.85 1.2.85-1.2.85 1.2" stroke="#C98A00" stroke-width=".4" fill="none"/><path d="M8 10.2a2.6 2.6 0 0 1 1.6-1.4" stroke="#fff" stroke-width=".5" fill="none"/></g><g class="wl-glow"><path d="M3 12.4h-1.4M18.4 12.4H17M4.4 7.4l-1-1M15.6 7.4l1-1M4.4 17.4l-1 1M15.6 17.4l1 1" stroke="#FFC21A" stroke-width=".6"/></g>`,
  namen: `<g class="wl-sway"><path d="M5 6.5L10 1.2L15 6.5" stroke="#3A2410" stroke-width=".35" fill="none"/><rect x="2.4" y="6.5" width="15.2" height="7.4" rx="1" fill="#C68A4E" stroke="#7A4A22" stroke-width=".5"/><path d="M3.4 8.4h13.2M3.4 12h13.2" stroke="#A86F38" stroke-width=".3"/><text x="10" y="11.6" font-size="3.6" font-weight="800" text-anchor="middle" fill="#3A2410" font-family="system-ui,sans-serif">ABC</text></g><path class="wl-flake" style="animation-delay:-0.4s" d="M16.6 14.9v1.8M15.700000000000001 15.8h1.8" stroke="#FFF3B0" stroke-width=".35"/><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  logo: `<path d="M4 5L10 1.2L16 5" stroke="#3A2410" stroke-width=".35" fill="none"/><rect x="2.5" y="5" width="15" height="13" rx=".6" fill="#5D3A1A"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#F6EFDF"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#2A1A4A"/><path d="M10.00 7.60L11.00 10.22L13.80 10.36L11.62 12.13L12.35 14.84L10.00 13.30L7.65 14.84L8.38 12.13L6.20 10.36L9.00 10.22z" fill="#FFC21A" stroke="#C98A00" stroke-width=".3"/><path class="wl-flake" style="animation-delay:-0s" d="M5.6 7.1v1.8M4.699999999999999 8h1.8" stroke="#FFF3B0" stroke-width=".35"/><path class="wl-flake" style="animation-delay:-1.2s" d="M14.4 14.1v1.8M13.5 15h1.8" stroke="#FFF3B0" stroke-width=".35"/><path class="wl-flake" style="animation-delay:-0.6s" d="M14.6 7.299999999999999v1.8M13.7 8.2h1.8" stroke="#FFF3B0" stroke-width=".35"/><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  daten: `<path d="M6 4.6L10 1.2L14 4.6" stroke="#3A2410" stroke-width=".35" fill="none"/><g class="wl-sway"><path d="M10 4.4l5.2 1.9v4.2c0 3.6-2.5 5.9-5.2 7.1-2.7-1.2-5.2-3.5-5.2-7.1V6.3z" fill="#1F9D68" stroke="#0F5A3A" stroke-width=".45"/><path d="M10 5.6l4 1.5v3.4c0 2.8-1.9 4.6-4 5.6z" fill="#3CC48A"/><path d="M8.9 10.6V9.5a1.1 1.1 0 0 1 2.2 0v1.1" stroke="#FFC21A" stroke-width=".6" fill="none"/><rect x="8.1" y="10.5" width="3.8" height="3.1" rx=".5" fill="#FFC21A" stroke="#C98A00" stroke-width=".3"/><circle cx="10" cy="11.8" r=".45" fill="#3A2410"/><path d="M10 12.1v.8" stroke="#3A2410" stroke-width=".3"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  buehne: `<path d="M4 5L10 1.2L16 5" stroke="#3A2410" stroke-width=".35" fill="none"/><rect x="2.5" y="5" width="15" height="13" rx=".6" fill="#5D3A1A"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#F6EFDF"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#24123F"/><path class="wl-glow" d="M10 6.1 6.2 16.9h7.6z" fill="#FFF3B0" fill-opacity=".35"/><path d="M3.6 6.1h4c-.6 3.4-.4 7 .6 10.8H3.6z" fill="#D52B1E"/><path d="M16.4 6.1h-4c.6 3.4.4 7-.6 10.8h4.6z" fill="#D52B1E"/><path d="M3.6 6.1h12.8v1.4H3.6z" fill="#A61E14"/><rect x="3.6" y="15.6" width="12.8" height="1.3" fill="#8B5A2B"/><path class="wl-fly" d="M10 10.6l.5 1 1.1.1-.8.8.2 1.1-1-.5-1 .5.2-1.1-.8-.8 1.1-.1z" fill="#FFC21A"/><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  worte: `<path d="M5 4L10 1.2L15 4" stroke="#3A2410" stroke-width=".35" fill="none"/><rect x="4.4" y="4" width="11.2" height="13.4" rx=".4" fill="#FFFDF6" stroke="#C9B79C" stroke-width=".4"/><path d="M6 7h7.2M6 9h8M6 11h6.4M6 13h7.2" stroke="#8A94A6" stroke-width=".4"/><g class="wl-fly"><path d="M17.4 4.2c-3.4 1-5.6 4.4-7 9.4l.7.3c2-4.2 4.4-6.8 6.3-9.7z" fill="#E8F3FF" stroke="#5A6475" stroke-width=".3"/><path d="M17 4.6 10.8 13.8" stroke="#5A6475" stroke-width=".25"/><path d="M10.5 13.6l-.5 1.4" stroke="#2E3A55" stroke-width=".4"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  tester: `<rect x="4" y="3.6" width="12" height="15.2" rx="1" fill="#B5793F" stroke="#7A4A22" stroke-width=".4"/><rect x="5.2" y="5.4" width="9.6" height="12.2" fill="#fff"/><rect x="7.6" y="2.4" width="4.8" height="2.2" rx=".5" fill="#8A94A6" stroke="#5A6475" stroke-width=".3"/><path class="wl-glow" style="animation-delay:-0.0s" d="M6.1 7.6l.7.7 1.3-1.4" stroke="#1F9D68" stroke-width=".6" fill="none"/><path d="M9.4 7.4h4.2" stroke="#C9B79C" stroke-width=".5"/><path class="wl-glow" style="animation-delay:-0.5s" d="M6.1 10.399999999999999l.7.7 1.3-1.4" stroke="#1F9D68" stroke-width=".6" fill="none"/><path d="M9.4 10.2h4.2" stroke="#C9B79C" stroke-width=".5"/><path class="wl-glow" style="animation-delay:-1.0s" d="M6.1 13.2l.7.7 1.3-1.4" stroke="#1F9D68" stroke-width=".6" fill="none"/><path d="M9.4 13.0h4.2" stroke="#C9B79C" stroke-width=".5"/><path class="wl-glow" style="animation-delay:-1.5s" d="M6.1 15.999999999999998l.7.7 1.3-1.4" stroke="#1F9D68" stroke-width=".6" fill="none"/><path d="M9.4 15.799999999999999h4.2" stroke="#C9B79C" stroke-width=".5"/><circle cx="10" cy="3.4" r=".8" fill="#3A2410"/>`,
  bug: `<path d="M4 5L10 1.2L16 5" stroke="#3A2410" stroke-width=".35" fill="none"/><rect x="2.5" y="5" width="15" height="13" rx=".6" fill="#3A4A5A"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#F6EFDF"/><circle cx="10" cy="6.9" r=".55" fill="#DD4646"/><g class="wl-wig"><path d="M7.6 9.6 5.4 8.4M7.4 11.6H5M7.6 13.6l-2.2 1.2M12.4 9.6l2.2-1.2M12.6 11.6H15M12.4 13.6l2.2 1.2M9.4 7.6 8.4 6.6M10.6 7.6l1-1" stroke="#3A2410" stroke-width=".4" fill="none"/></g><ellipse cx="10" cy="11.8" rx="2.6" ry="3.4" fill="#DD4646" stroke="#7A1E1E" stroke-width=".3"/><circle cx="10" cy="8.1" r="1.3" fill="#3A2410"/><path d="M10 8.9v6.3" stroke="#3A2410" stroke-width=".35"/><circle cx="8.9" cy="10.8" r=".5" fill="#3A2410"/><circle cx="11.1" cy="11.4" r=".5" fill="#3A2410"/><circle cx="9" cy="13.2" r=".45" fill="#3A2410"/><circle cx="11" cy="13.6" r=".4" fill="#3A2410"/><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  feature: `<path d="M7 6.4L10 1.2L13 6.4" stroke="#3A2410" stroke-width=".35" fill="none"/><g class="wl-spin"><path d="M14.93 11.18L14.93 12.82L13.51 12.81L13.05 13.91L14.07 14.91L12.91 16.07L11.91 15.05L10.81 15.51L10.82 16.93L9.18 16.93L9.19 15.51L8.09 15.05L7.09 16.07L5.93 14.91L6.95 13.91L6.49 12.81L5.07 12.82L5.07 11.18L6.49 11.19L6.95 10.09L5.93 9.09L7.09 7.93L8.09 8.95L9.19 8.49L9.18 7.07L10.82 7.07L10.81 8.49L11.91 8.95L12.91 7.93L14.07 9.09L13.05 10.09L13.51 11.19z" fill="#8A94A6" stroke="#5A6475" stroke-width=".35"/><circle cx="10" cy="12" r="2.6" fill="#5A6475"/></g><path d="M9.4 10.4h1.2v1h1v1.2h-1v1h-1.2v-1h-1v-1.2h1z" fill="#FFC21A"/><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  zielgruppe: `<path d="M5 6L10 1.2L15 6" stroke="#3A2410" stroke-width=".35" fill="none"/><circle cx="10" cy="12" r="6.3" fill="#3A2410"/><circle cx="10" cy="12" r="5.5" fill="#fff"/><circle cx="10" cy="12" r="4.1" fill="#DD4646"/><circle cx="10" cy="12" r="2.7" fill="#fff"/><circle cx="10" cy="12" r="1.3" fill="#DD4646"/><g class="wl-quiv"><path d="M10 12 16.2 5.8" stroke="#3A2410" stroke-width=".55"/><path d="M16.2 5.8l1.6-.4-.4 1.6-1.4.2zM15.4 5.2l.8-1.4.6 1z" fill="#2E6BE6"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  gourmet: `<g class="wl-sway"><rect x="9.2" y=".8" width="1.6" height="7.6" rx=".7" fill="#5D3A1A"/><circle cx="10" cy="1.9" r=".55" fill="#2A1A0E"/><circle cx="10" cy="13.4" r="5.2" fill="#2E2E36"/><circle cx="10" cy="13.4" r="4.2" fill="#4A4A55"/><path d="M7.4 13.2c-.6-1.8 1-3 2.4-2.6 1.6-.8 3.4.4 2.8 2 .8 1.4-.6 3-2.2 2.6-1.4.8-3.2-.4-3-2z" fill="#fff"/><circle cx="10.1" cy="13.2" r="1.15" fill="#FFC21A"/><path class="wl-glow" d="M8 7.6c-.6-.8.4-1.4-.2-2.2M12 7.4c-.6-.8.4-1.4-.2-2.2" stroke="#E8E2D0" stroke-width=".35" fill="none"/></g>`,
  lexikon: `<rect x="2.4" y="16" width="15.2" height="1.3" rx=".3" fill="#8B5A2B"/><path d="M4.4 17.3l1.4 1.6M15.6 17.3l-1.4 1.6" stroke="#5D3A1A" stroke-width=".6"/><path d="M10 9c-2-1.3-4.6-1.5-6.8-.9v7.4c2.2-.6 4.8-.4 6.8.9 2-1.3 4.6-1.5 6.8-.9V8.1C14.6 7.5 12 7.7 10 9z" fill="#2E6BE6"/><path d="M10 8.6c-1.8-1.1-4-1.3-6-.8v7.1c2-.5 4.2-.3 6 .8z" fill="#FFFDF6" stroke="#C9B79C" stroke-width=".25"/><path class="wl-wave" d="M10 8.6c1.8-1.1 4-1.3 6-.8v7.1c-2-.5-4.2-.3-6 .8z" fill="#FFFDF6" stroke="#C9B79C" stroke-width=".25"/><path d="M5 9.4c1.4-.3 2.6-.1 3.8.4M5 11c1.4-.3 2.6-.1 3.8.4M5 12.6c1.4-.3 2.6-.1 3.8.4M11.2 9.8c1.2-.5 2.4-.7 3.8-.4M11.2 11.4c1.2-.5 2.4-.7 3.8-.4" stroke="#8A94A6" stroke-width=".3" fill="none"/>`,
  lexmeister: `<rect x="2.4" y="16" width="15.2" height="1.3" rx=".3" fill="#8B5A2B"/><path d="M4.4 17.3l1.4 1.6M15.6 17.3l-1.4 1.6" stroke="#5D3A1A" stroke-width=".6"/><rect x="4.4" y="13.6" width="11.2" height="2.4" rx=".3" fill="#D52B1E"/><rect x="5" y="11.2" width="10" height="2.4" rx=".3" fill="#2E6BE6"/><rect x="5.6" y="8.8" width="8.8" height="2.4" rx=".3" fill="#1F9D68"/><path d="M14.8 14v1.6M14.2 11.6v1.6M13.8 9.2v1.6" stroke="#FFFDF6" stroke-width=".5"/><path d="M6 14.8h4M6.6 12.4h3.4M7.2 10h3" stroke="#FFC21A" stroke-width=".35"/><g class="wl-fly"><path d="M6.4 7.6 6 3.6l2.2 1.8L10 2.6l1.8 2.8L14 3.6l-.4 4z" fill="#FFC21A" stroke="#C98A00" stroke-width=".3"/><circle cx="10" cy="5.8" r=".5" fill="#D52B1E"/></g>`,
  detektiv: `<g class="wl-sway"><path d="M10 1.2 8.8 5.4" stroke="#3A2410" stroke-width=".35"/><circle cx="8.6" cy="9.8" r="4.4" fill="#CFEAF7" stroke="#7A4A22" stroke-width="1"/><path d="M6.6 8.6a2.4 2.4 0 0 1 1.8-1.6" stroke="#fff" stroke-width=".6" fill="none"/><path d="M11.8 13l4.4 4.4" stroke="#5D3A1A" stroke-width="1.8" stroke-linecap="round"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  tierfreund: `<path d="M4 5L10 1.2L16 5" stroke="#3A2410" stroke-width=".35" fill="none"/><rect x="2.5" y="5" width="15" height="13" rx=".6" fill="#8B5A2B"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#F6EFDF"/><ellipse cx="10" cy="13.6" rx="2.7" ry="2.2" fill="#C0705A"/><circle cx="6.8" cy="10.8" r="1.15" fill="#C0705A"/><circle cx="8.9" cy="9" r="1.15" fill="#C0705A"/><circle cx="11.1" cy="9" r="1.15" fill="#C0705A"/><circle cx="13.2" cy="10.8" r="1.15" fill="#C0705A"/><path class="wl-fly" d="M14.6 8.2c-.5-.6-1.4-.3-1.4.4 0 .7 1.4 1.5 1.4 1.5s1.4-.8 1.4-1.5c0-.7-.9-1-1.4-.4z" fill="#FF4F8B"/><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  meister: `<rect x="2.4" y="16" width="15.2" height="1.3" rx=".3" fill="#8B5A2B"/><path d="M4.4 17.3l1.4 1.6M15.6 17.3l-1.4 1.6" stroke="#5D3A1A" stroke-width=".6"/><path d="M6.4 4.6h7.2v3.2c0 2.4-1.6 4-3.6 4s-3.6-1.6-3.6-4z" fill="#F2C94C" stroke="#8B6914" stroke-width=".35"/><path d="M6.4 5.6H4.8c0 2 .8 3 2 3.2M13.6 5.6h1.6c0 2-.8 3-2 3.2" stroke="#C9A227" stroke-width=".55" fill="none"/><rect x="9.3" y="11.6" width="1.4" height="2" fill="#C9A227"/><rect x="7.2" y="13.6" width="5.6" height="2.4" rx=".3" fill="#5D3A1A"/><path d="M10.00 6.00L10.41 7.03L11.52 7.11L10.67 7.82L10.94 8.89L10.00 8.30L9.06 8.89L9.33 7.82L8.48 7.11L9.59 7.03z" fill="#fff"/><path class="wl-flake" style="animation-delay:-0s" d="M4.4 2.5v1.8M3.5000000000000004 3.4h1.8" stroke="#FFF3B0" stroke-width=".35"/><path class="wl-flake" style="animation-delay:-1s" d="M15.6 9.5v1.8M14.7 10.4h1.8" stroke="#FFF3B0" stroke-width=".35"/>`,
  fn_spuren: `<path d="M4 5L10 1.2L16 5" stroke="#3A2410" stroke-width=".35" fill="none"/><rect x="2.5" y="5" width="15" height="13" rx=".6" fill="#3A4A5A"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#F6EFDF"/><g class="wl-flake" style="animation-delay:-0.0s"><ellipse cx="5.6" cy="15.4" rx=".9" ry="1.4" fill="#6B4A2B"/><circle cx="5.1" cy="13.5" r=".3" fill="#6B4A2B"/><circle cx="5.699999999999999" cy="13.3" r=".3" fill="#6B4A2B"/><circle cx="6.199999999999999" cy="13.6" r=".3" fill="#6B4A2B"/></g><g class="wl-flake" style="animation-delay:-0.6s"><ellipse cx="8" cy="13.6" rx=".9" ry="1.4" fill="#6B4A2B"/><circle cx="7.5" cy="11.7" r=".3" fill="#6B4A2B"/><circle cx="8.1" cy="11.5" r=".3" fill="#6B4A2B"/><circle cx="8.6" cy="11.799999999999999" r=".3" fill="#6B4A2B"/></g><g class="wl-flake" style="animation-delay:-1.2s"><ellipse cx="10" cy="11.6" rx=".9" ry="1.4" fill="#6B4A2B"/><circle cx="9.5" cy="9.7" r=".3" fill="#6B4A2B"/><circle cx="10.1" cy="9.5" r=".3" fill="#6B4A2B"/><circle cx="10.6" cy="9.799999999999999" r=".3" fill="#6B4A2B"/></g><g class="wl-flake" style="animation-delay:-1.7999999999999998s"><ellipse cx="12.4" cy="10.2" rx=".9" ry="1.4" fill="#6B4A2B"/><circle cx="11.9" cy="8.299999999999999" r=".3" fill="#6B4A2B"/><circle cx="12.5" cy="8.1" r=".3" fill="#6B4A2B"/><circle cx="13.0" cy="8.399999999999999" r=".3" fill="#6B4A2B"/></g><circle cx="14" cy="9.4" r="1.6" fill="#CFEAF7" stroke="#5D3A1A" stroke-width=".4"/><path d="M15.1 10.5l1 1" stroke="#5D3A1A" stroke-width=".6"/><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  fn_bild: `<g transform="rotate(-5 10 10)"><rect x="4" y="3.6" width="12" height="14.4" fill="#fff" stroke="#D7D2C6" stroke-width=".3"/><rect x="5" y="4.6" width="10" height="9.4" fill="#9CD0EE"/><path d="M5 14l3.4-4.4 2.2 2.6 1.6-1.8L15 14z" fill="#1F9D68"/><circle cx="13" cy="6.6" r="1" fill="#FFC21A"/><rect x="8" y="2.4" width="4" height="2" fill="#F4E7C8" fill-opacity=".9"/></g><g class="wl-fly"><circle cx="13.4" cy="14.4" r="2.2" fill="#CFEAF7" fill-opacity=".8" stroke="#5D3A1A" stroke-width=".5"/><path d="M15 16l1.8 1.8" stroke="#5D3A1A" stroke-width=".9" stroke-linecap="round"/></g>`,
  fn_quellen: `<path d="M5 4L10 1.2L15 4" stroke="#3A2410" stroke-width=".35" fill="none"/><g class="wl-sway"><rect x="3.4" y="4" width="13.2" height="14" fill="#F6F3EA" stroke="#B9B2A2" stroke-width=".3"/><rect x="4.8" y="5.2" width="10.4" height="1.8" fill="#3A3A44"/><rect x="4.8" y="8" width="5" height="4" fill="#C9D6E6"/><path d="M10.8 8.4h4.4M10.8 9.8h4.4M10.8 11.2h4.4M4.8 13.4h10.4M4.8 14.8h10.4M4.8 16.2h7" stroke="#8A8478" stroke-width=".4"/></g><g class="wl-glow"><circle cx="15.4" cy="16.4" r="2" fill="#1F9D68"/><path d="M14.5 16.4l.7.7 1.2-1.3" stroke="#fff" stroke-width=".5" fill="none"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  fn_urteil: `<rect x="3" y="6.4" width="14" height="11" rx="2" fill="#7A4A22" stroke="#5A3412" stroke-width=".4"/><rect x="4.4" y="14.4" width="7" height="1.6" rx=".4" fill="#5D3A1A"/><path d="M5 6.4L10 1.2L15 6.4" stroke="#3A2410" stroke-width=".35" fill="none"/><g class="wl-knock"><rect x="6" y="9.6" width="5.4" height="2.6" rx=".6" fill="#C68A4E" stroke="#5A3412" stroke-width=".3" transform="rotate(-20 8.7 10.9)"/><path d="M9.4 11.8l5.4 3.4" stroke="#C68A4E" stroke-width=".9" stroke-linecap="round"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  fn_karte: `<g class="wl-sway"><g transform="rotate(3 10 11)"><rect x="3.4" y="5" width="13.2" height="11.6" fill="#FFF8D6" stroke="#E3C770" stroke-width=".3"/><path d="M3.4 7.4h13.2" stroke="#DD4646" stroke-width=".4"/><path d="M4.8 9.6h10.4M4.8 11.4h10.4M4.8 13.2h10.4M4.8 15h10.4" stroke="#B9D2EE" stroke-width=".25"/><path d="M5.2 11l1 1 2-2" stroke="#1F9D68" stroke-width=".7" fill="none"/><path d="M11.4 10l2 2M13.4 10l-2 2" stroke="#DD4646" stroke-width=".7"/></g><circle cx="10" cy="5" r="1.1" fill="#DD4646"/><circle cx="9.7" cy="4.7" r=".35" fill="#fff"/></g>`,
  fn_alle: `<path d="M5 5.6L10 1.2L15 5.6" stroke="#3A2410" stroke-width=".35" fill="none"/><path d="M3 6.4h4.6l1 1.2H17v10.2H3z" fill="#D99A2B" stroke="#9A6A12" stroke-width=".35"/><rect x="3" y="7.8" width="14" height="10" fill="#F2B84B" stroke="#9A6A12" stroke-width=".35"/><rect x="5" y="9.4" width="6.4" height="3.2" fill="#fff"/><path d="M5.8 10.4h4.8M5.8 11.6h3.4" stroke="#8A94A6" stroke-width=".35"/><g class="wl-glow"><path d="M13 16.4l-.8 2.6 1.4-.6.8 1.2.6-2.8zM15.2 16.4l.8 2.6-1.4-.6" fill="#DD4646"/><circle cx="14" cy="15" r="2.4" fill="#FFC21A" stroke="#C98A00" stroke-width=".35"/><path d="M14.00 13.70L14.32 14.56L15.24 14.60L14.52 15.17L14.76 16.05L14.00 15.55L13.24 16.05L13.48 15.17L12.76 14.60L13.68 14.56z" fill="#fff"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  ki_theorie: `<g class="wl-sway"><path d="M10 1.2 4.4 8.2M10 1.2l5.6 7" stroke="#3A2410" stroke-width=".55" fill="none"/><rect x="6" y="6.6" width="4" height="2" rx=".4" fill="#3A3A44"/><rect x="3" y="8" width="14" height="9" rx="1.2" fill="#3A3A44"/><circle cx="10" cy="12.6" r="3.1" fill="#8A94A6"/><circle cx="10" cy="12.6" r="2.2" fill="#2E3A55"/><circle cx="9.3" cy="11.9" r=".6" fill="#fff"/><rect class="wl-glow" x="13.4" y="9.2" width="2.2" height="1.3" rx=".3" fill="#FFE680"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  ki_fehler: `<path d="M4 5L10 1.2L16 5" stroke="#3A2410" stroke-width=".35" fill="none"/><rect x="2.5" y="5" width="15" height="13" rx=".6" fill="#5D3A1A"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#F6EFDF"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#DFF0FA"/><rect x="6.8" y="11.4" width="6.4" height="5" rx="1.6" fill="#F2C9A0"/><rect x="6.8" y="8.8" width=".9" height="4" rx=".45" fill="#F2C9A0"/><rect x="7.9" y="8.8" width=".9" height="4" rx=".45" fill="#F2C9A0"/><rect x="9.0" y="8.2" width=".9" height="4" rx=".45" fill="#F2C9A0"/><rect x="10.1" y="8.2" width=".9" height="4" rx=".45" fill="#F2C9A0"/><rect x="11.2" y="8.8" width=".9" height="4" rx=".45" fill="#F2C9A0"/><rect x="12.3" y="8.8" width=".9" height="4" rx=".45" fill="#F2C9A0"/><ellipse class="wl-glow" cx="10" cy="10.6" rx="4.6" ry="3.4" fill="none" stroke="#DD4646" stroke-width=".55"/><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  ki_adler: `<g class="wl-sway"><path d="M10 1.2 5 7.4M10 1.2l5 6.2" stroke="#3A2410" stroke-width=".5" fill="none"/><rect x="3.6" y="7" width="5.4" height="9" rx="1.4" fill="#2E3A55"/><rect x="11" y="7" width="5.4" height="9" rx="1.4" fill="#2E3A55"/><rect x="8.6" y="9" width="2.8" height="3" fill="#3A4A6A"/><circle cx="6.3" cy="14.6" r="2" fill="#9CD0EE" stroke="#1C2438" stroke-width=".4"/><circle cx="13.7" cy="14.6" r="2" fill="#9CD0EE" stroke="#1C2438" stroke-width=".4"/><path class="wl-flake" style="animation-delay:-0s" d="M5.7 13.1v1.8M4.8 14h1.8" stroke="#FFF3B0" stroke-width=".35"/><path class="wl-flake" style="animation-delay:-0.8s" d="M13.1 13.1v1.8M12.2 14h1.8" stroke="#FFF3B0" stroke-width=".35"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>`,
  ki_plakat: `<rect x="3.4" y="3" width="13.2" height="15.6" fill="#fff" stroke="#D7D2C6" stroke-width=".3"/><rect x="4.6" y="4.2" width="10.8" height="2.6" rx=".3" fill="#7B4CEF"/><path d="M6 5.5h8" stroke="#fff" stroke-width=".6"/><circle cx="5.6" cy="8.8" r=".6" fill="#1F9D68"/><path d="M7 8.8h7.4" stroke="#8A94A6" stroke-width=".45"/><circle cx="5.6" cy="11.200000000000001" r=".6" fill="#1F9D68"/><path d="M7 11.200000000000001h7.4" stroke="#8A94A6" stroke-width=".45"/><circle cx="5.6" cy="13.600000000000001" r=".6" fill="#1F9D68"/><path d="M7 13.600000000000001h7.4" stroke="#8A94A6" stroke-width=".45"/><rect x="4.6" y="15.6" width="5" height="1.6" rx=".3" fill="#FFC21A"/><path class="wl-wave" d="M16.6 18.6h-2.6l2.6-2.6z" fill="#E8E2D0"/><rect x="2.4" y="2.2" width="3" height="1.4" fill="#F4E7C8" fill-opacity=".9" transform="rotate(-30 3.9 2.9)"/><rect x="14.6" y="2.2" width="3" height="1.4" fill="#F4E7C8" fill-opacity=".9" transform="rotate(30 16.1 2.9)"/>`
};
window.GLWALL_NOCSS = true;
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

const dipArt = (emoji, c, wand, id) => window.GLWall ? GLWall.svg(wand || (id ? "" : "medaille"), emoji, c, id) : dipArtOld(emoji, c);
const dipArtOld = (emoji, c) => { const e = String(emoji || "🏅").replace(/[<>&"]/g, ""), col = String(c || "#7B4CEF").replace(/[^#\w(),.% -]/g, "");
  return `<svg viewBox="0 0 20 20" aria-hidden="true"><g class="wl-medal"><path d="M10 1.2 5.8 9.6h2.6L10 5.2z" fill="${col}"/><path d="M10 1.2l4.2 8.4h-2.6L10 5.2z" fill="${col}" fill-opacity=".75"/>`
    + `<circle cx="10" cy="13.4" r="5.2" fill="#F2C94C" stroke="#8B6914" stroke-width=".5"/><circle cx="10" cy="13.4" r="4" fill="#FFE680" stroke="#C98A00" stroke-width=".3"/>`
    + `<text x="10" y="13.7" font-size="4.6" text-anchor="middle" dominant-baseline="central">${e}</text><path class="wl-glow" d="M6.6 11.2a4.2 4.2 0 0 1 2-2" stroke="#fff" stroke-width=".6" fill="none"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/></svg>`; };
(function(){ if (document.getElementById("wlMiCss")) return; const st = document.createElement("style"); st.id = "wlMiCss"; st.textContent = '.wl-glow{animation:wlGlow 2.2s ease-in-out infinite}.wl-spin{transform-box:fill-box; transform-origin:50% 50%; animation:wlSpin 7s linear infinite}.wl-wig{transform-origin:10px 11px; animation:wlWig .9s ease-in-out infinite}.wl-quiv{transform-origin:10px 12px; animation:wlQuiv 2.6s ease-in-out infinite}.wl-knock{transform-origin:15px 15px; animation:wlKnock 2.8s ease-in-out infinite}.wl-medal{transform-origin:10px 1.2px; animation:wlMedal 3.4s ease-in-out infinite}@keyframes wlGlow{0%,100%{opacity:1}50%{opacity:.35}}@keyframes wlSpin{to{transform:rotate(360deg)}}@keyframes wlWig{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.9)}}@keyframes wlQuiv{0%,86%,100%{transform:rotate(0)}90%{transform:rotate(-4deg)}94%{transform:rotate(3deg)}}@keyframes wlKnock{0%,70%,100%{transform:rotate(0)}80%{transform:rotate(-16deg)}88%{transform:rotate(2deg)}}@keyframes wlMedal{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}@media (prefers-reduced-motion: reduce){.wl-glow,.wl-spin,.wl-wig,.wl-quiv,.wl-knock,.wl-medal{animation:none}}'; (document.head || document.documentElement).appendChild(st); })();
let D = {cls:null, prog:{}, me:null};
window.GLAB_PET = (g, on) => { try { const sp = g.querySelector(":scope > span"); if (!sp) return; if (on){ if (!g.dataset.petOld) g.dataset.petOld = sp.innerHTML; const p = (D.me && D.prog[D.me]) || {}; sp.innerHTML = LIB.glitchSVG("love", {outfit: p.outfit || {}}); } else if (g.dataset.petOld){ sp.innerHTML = g.dataset.petOld; delete g.dataset.petOld; } } catch(e){} };
window.GLAB_SKINS = [{"id": "violett", "n": "Violett", "base": "#8B5CFF", "light": "#B79CFF", "dark": "#6A3FE0", "hi": "#E3D6FF"}, {"id": "blau", "n": "Blau", "base": "#3D7BFF", "light": "#87ADFF", "dark": "#3060C7", "hi": "#C5D7FF"}, {"id": "tuerkis", "n": "Türkis", "base": "#14B8C4", "light": "#6DD3DA", "dark": "#109099", "hi": "#B8EAED"}, {"id": "gruen", "n": "Grün", "base": "#22B55E", "light": "#76D19B", "dark": "#1B8D49", "hi": "#BDE9CF"}, {"id": "limette", "n": "Limette", "base": "#8CC63F", "light": "#B8DC88", "dark": "#6D9A31", "hi": "#DCEEC5"}, {"id": "orange", "n": "Orange", "base": "#FF8A1F", "light": "#FFB674", "dark": "#C76C18", "hi": "#FFDCBC"}, {"id": "rot", "n": "Rot", "base": "#EF4444", "light": "#F58B8B", "dark": "#BA3535", "hi": "#FAC7C7"}, {"id": "pink", "n": "Pink", "base": "#FF4FA3", "light": "#FF92C6", "dark": "#C73E7F", "hi": "#FFCAE3"}, {"id": "mint", "n": "Mint", "base": "#5BE3B6", "light": "#99EED2", "dark": "#47B18E", "hi": "#CEF7E9"}, {"id": "silber", "n": "Silber", "base": "#8A94A6", "light": "#B6BDC8", "dark": "#6C7381", "hi": "#DCDFE4"}, {"id": "gold", "n": "Gold", "base": "#F2B705", "light": "#F7D264", "dark": "#BD8F04", "hi": "#FBE9B4"}];
window.GLAB_SKINS = window.GLAB_SKINS.concat([{"id": "sonne", "n": "Sonnenuntergang", "lv": 19, "base": "#FF7A3D", "light": "#FFD25A", "dark": "#C2255C", "hi": "#FFF1B8"}, {"id": "ozean", "n": "Ozean", "lv": 39, "base": "#1E88E5", "light": "#4DE3E0", "dark": "#123B8C", "hi": "#C9FBFF"}, {"id": "galaxie", "n": "Galaxie", "lv": 59, "base": "#6A2BD9", "light": "#FF5ED8", "dark": "#1A1060", "hi": "#FFD6F6"}, {"id": "lava", "n": "Lava", "lv": 79, "base": "#E8361C", "light": "#FFB21A", "dark": "#5A1208", "hi": "#FFE7A0"}, {"id": "aurora", "n": "Polarlicht", "lv": 99, "base": "#19C79A", "light": "#9BFF6B", "dark": "#5B2BB5", "hi": "#E4FFD2"}]).concat(((typeof CU !== 'undefined' && CU.skins) || []).map(x=>Object.assign({}, x)));
window.GLAB_CODE_OK = (v, primary) => { const x = String(v || "").trim().toLowerCase(); return !!x && [primary || "4313"].concat(window.GLAB_EXTRA_CODES || []).some(c => String(c).trim().toLowerCase() === x); };
if (ctx){
  D.cls = {id:"hub", name: ctx.className, code: ctx.code, rev:0, students: [ctx.me].concat(ctx.team), groups:{}, kiQuiz: ctx.quiz || []};
  window.GLAB_EXTRA_CODES = (ctx.codes || []).map(String);
  window.GLAB_IS_LP = !!ctx.lp; window.GLAB_CUR_SKIN = ((ctx.extras || {}).outfit || {}).skin || "";
  if (curMod){ D.cls.groups[curMod] = {}; D.cls.students.forEach(s=>{ D.cls.groups[curMod][s.id] = ctx.group; }); }
  D.me = ctx.me.id;
  D.prog[ctx.me.id] = Object.assign({mods: ctx.mods || {}, outfit:{}, outfitAt:0, seen:0}, ctx.extras || {});
  D.prog[ctx.me.id].mods = ctx.mods || {};
}
/* Hintergrund des Zimmers: Pixel-Zimmer oder Chalet (Chalet ab dem ersten fertigen NMG-Modul) */
const CHALET_BADGE = "eidgenossen_4";
window.GLAB_ROOMBG = (ctx && ctx.extras && (ctx.extras.bg === "chalet" || CU.bgs.some(b=>b.id === ctx.extras.bg && !/^bg_(l|p)\d/.test(b.id)))) ? ctx.extras.bg : "pixel";
window.GLAB_SITEBG = (ctx && ctx.extras && ctx.extras.siteBg) || "";
/* Jedes Emote gehört zu einem Modul. Wer das Modul schafft, bekommt das Emote. «Hopp Schwiiz!» gibt es von Anfang an. */
const EMOTE_REQ = {
  sixseven: ["hub:mi-start", "Hallo gLiTCh!"], augustfeuer: ["buehne", "Prompt-Labor (alle 4 Etappen)"],
  richi: ["eidgenossen_4", "Alte Eidgenossenschaft"], kaese: ["helvetik_4", "Helvetische Republik"], aura: ["mediation_4", "Mediationszeit"],
  floss: ["restauration_4", "Restauration und Wiener Kongress"], dab: ["nachbarn_4", "Nachbarländer der Schweiz"],
  postauto: ["erfindungen_4", "Schweizer Erfindungen"], hosenlupf: ["politik_4", "Schweizer Politik"], fondue: ["ebenen_4", "Die drei Ebenen"],
  m_sixseven: ["hub:mi-start", "Hallo gLiTCh!"], m_dab: ["buehne", "Prompt-Labor (alle 4 Etappen)"], m_kaese: ["fn_alle", "Fake-News-Detektiv"],
  m_aura: ["ki_plakat", "KI-Bild oder echt?"], m_floss: ["hub:de-wueste", "Wüsten-Game"]
};
if (window.GLAB_R) window.GLAB_R.EMOTES.forEach(x=>{ const r = EMOTE_REQ[x.id]; x.req = r ? {badge: r[0], mod: r[1]} : null; x.lv = r ? 9999 : 0; });
if (window.GLAB_R){
  CU.emotes.forEach(e=>{ if (!window.GLAB_R.EMOTES.some(x=>x.id === e.id)) window.GLAB_R.EMOTES.push({id:e.id, n:e.n, d:e.d || "", ic:e.ic || "✨", lv:9999, req: e.badge ? {badge:e.badge, mod:e.mod, txt:e.reqTxt} : null}); });
  CU.room.forEach(r=>{ if (!window.GLAB_R.ROOM.some(x=>x.id === r.id)) window.GLAB_R.ROOM.push({id:r.id, slot:r.slot, n:r.n, lv:0, box:r.box, svg:r.svg, badge:r.badge || null, reqTxt:r.reqTxt || ""}); });
}
const roomOpen = (x, li) => x.sw ? swCount(totalsFor(D.me)) >= x.sw : x.badge ? totalsFor(D.me).badges.has(x.badge) : x.lv <= li;
const bgOpen = (b, T) => (b.lv == null || LIB.levelOf(T.stars) >= b.lv) && (!b.badge || T.badges.has(b.badge));
const emoteOpen = (x, T) => !x.req || T.badges.has(x.req.badge);
const emoteReq = x => x.req ? (x.req.txt || `Modul «${x.req.mod}» schaffen`) : "von Anfang an";
const pickExtras = p => ({outfit: p.outfit || {}, outfitAt: p.outfitAt || 0, seen: p.seen || 0, room: p.room || null, roomSeen: p.roomSeen || 0, emote: p.emote || null, prefsAt: p.prefsAt || 0, wall: p.wall || null, seenW: p.seenW || null, seenR: p.seenR || null, seenB: p.seenB || null, siteBg: window.GLAB_SITEBG || "", bg: window.GLAB_ROOMBG});
function saveD(){ if (HB && D.me && D.prog[D.me]) HB.saveExtras(pickExtras(D.prog[D.me])); }
function cloudPush(){}
let S = {};

const codeOf = () => (ctx && ctx.code) || "4313";
const student = id => D.cls && D.cls.students.find(s=>s.id === id);
const colorOf = id => { const s = student(id); return (s && s.c) || COLS[0]; };
const groupOf = (sid, mod="prompt") => (D.cls && D.cls.groups && D.cls.groups[mod] && D.cls.groups[mod][sid]) || null;
const membersOf = (nr, mod="prompt") => D.cls ? D.cls.students.filter(s=>String(groupOf(s.id, mod)) === String(nr)) : [];
const workKey = (nr, mod="prompt") => ctx ? ctx.workKey(mod) : "glhub.w.lokal." + mod;
const managed = () => true;
const uniquePin = () => "0000";
const prog = sid => (D.prog[sid] = D.prog[sid] || {mods:{}, outfit:{}, outfitAt:0, seen:0});

const me = student(D.me);
const modNr = curMod && me ? groupOf(me.id, curMod) : null;
const inModule = !!(curMod === "prompt" && me && modNr);
const inFN = !!(curMod === "fakenews" && me && modNr);
const inKI = !!(curMod === "kibilder" && me && modNr);
const inGE = !!(curMod && !["prompt","fakenews","kibilder"].includes(curMod) && me && modNr);

let LIB = null;
const GLAB = window.GLAB = {
  lobby: !inModule,
  key: inModule ? workKey(modNr) : null,
  applyTo(st){
    if (!inModule) return;
    st.gruppeNr = String(modNr);
    st.members = membersOf(modNr).map(s=>s.n);
    const o = prog(me.id).outfit; if (o && Object.keys(o).length) st.outfit = Object.assign({}, o);
  },
  report(r){
    if (!curMod || !HB) return;
    const p = prog(me.id), m = p.mods[curMod] || {stars:0, badges:[], fed:0, deaths:0};
    m.stars = Math.max(m.stars || 0, r.stars || 0);
    m.badges = Array.from(new Set([...(m.badges||[]), ...(r.badges||[])]));
    m.fed = Math.max(m.fed || 0, r.fed || 0); m.deaths = Math.max(m.deaths || 0, r.deaths || 0); m.at = now();
    p.mods[curMod] = m;
    if (r.outfit && JSON.stringify(r.outfit || {}) !== JSON.stringify(p.outfit || {})){ p.outfit = Object.assign({}, r.outfit || {}); p.outfitAt = now(); saveD(); }
    HB.report(curMod, {stars: r.stars || 0, badges: r.badges || [], fed: r.fed || 0, deaths: r.deaths || 0});
  },
  totals(live){ return totalsFor(me ? me.id : null, live); },
  exit(){ if (HB) HB.exit(); else history.back(); },
  emote(){ const sid = D.me; if (!sid || !LIB || !window.GLAB_R) return null; const p = prog(sid), li = LIB.levelOf(totalsFor(sid).stars); const x = window.GLAB_R.EMOTES.find(e=>e.id === (p.emote || "w")); return x && emoteOpen(x, totalsFor(sid)) ? x.id : "w"; },
  hasEmote(){ const sid = D.me; if (!sid || !LIB || !window.GLAB_R) return false; const li = LIB.levelOf(totalsFor(sid).stars); return true; },
  libSet(lib){ if (!LIB) LIB = withFN(lib); },
  gsvg(mood, opts={}){ if (!LIB) return ""; const base = D.me ? Object.assign({}, prog(D.me).outfit || {}) : {}; return LIB.glitchSVG(mood, Object.assign({}, opts, {outfit: Object.assign(base, opts.outfit || {})})); },
  code(){ return codeOf(); },
  who(){ return me ? {name: me.n, nr: modNr} : null; },
  ready(lib){ LIB = withFN(lib); if (HB && HB.lib) try { HB.lib(LIB, typeof MOD_ART !== "undefined" ? MOD_ART : null); } catch(e){} if (inModule) return; document.body.classList.add("in-portal"); portalEl.hidden = false;
    const X = mod => ({root: portalEl, key: workKey(modNr, mod), nr: modNr, members: membersOf(modNr, mod).map(s=>s.n), teacher: LP_NAME, code: codeOf(), quiz: (D.cls && D.cls.kiQuiz) || [],
      glitch: (m, o)=>GLAB.gsvg(m, o), labLogo: LIB.labLogo, LEVELS: LIB.LEVELS, levelOf: LIB.levelOf, totals: live=>totalsFor(me.id, Object.assign({mod}, live)), report: r=>GLAB.report(r), exit: ()=>GLAB.exit()});
    if (inKI && window.GLAB_KI){ portalEl.classList.add("fn-mode"); window.GLAB_KI.start(X("kibilder")); return; }
    if (inFN && window.GLAB_FN){ portalEl.classList.add("fn-mode"); window.GLAB_FN.start(X("fakenews")); return; }
    if (inGE && window.GLAB_GE){ portalEl.classList.add("fn-mode"); window.GLAB_GE.start(Object.assign({mod: curMod}, X(curMod))); return; }
    render(); }
};

const OUTFIT_MAP = {erfinder:"eidgenossen_1", namen:"eidgenossen_2", logo:"eidgenossen_3", buehne:"eidgenossen_4", daten:"helvetik_1", worte:"helvetik_2", tester:"helvetik_3", bug:"helvetik_4", feature:"mediation_1", zielgruppe:"mediation_2", gourmet:"mediation_3", lexikon:"mediation_4", lexmeister:"restauration_1", detektiv:"restauration_2", tierfreund:"restauration_3", meister:"restauration_4"};
const OUTFIT_HIDE = ["vr","visor","robo","antennen","laser","astro","schnorchel"];

/* ===== Belohnungen: Schweiz-Gegenstände gehören zu «Entdeckungsreise Schweiz», alles andere verteilt bis Level 100 ===== */
const SW_MODS = [["eidgenossen", "Alte Eidgenossenschaft"], ["helvetik", "Helvetische Republik"], ["mediation", "Mediationszeit"], ["restauration", "Restauration und Wiener Kongress"], ["nachbarn", "Nachbarländer der Schweiz"], ["erfindungen", "Schweizer Erfindungen"], ["politik", "Schweizer Politik"], ["ebenen", "Die drei Ebenen"]], SW_OUT = {"socken": "eidgenossen_1", "fahne": "eidgenossen_1", "armbrust": "eidgenossen_2", "tellapfel": "eidgenossen_3", "fahnenschwinger": "eidgenossen_4", "sennenkaeppi": "helvetik_1", "edelweiss": "helvetik_2", "tracht": "helvetik_3", "treichel": "helvetik_4", "skibrille": "mediation_1", "alphorn": "mediation_2", "wanderschuhe": "mediation_3", "bernhardiner": "mediation_4", "schwingerhose": "restauration_1", "steinbock": "restauration_2", "sennenhut": "restauration_3", "murmeli": "restauration_4", "brezel": "nachbarn_1", "beret": "nachbarn_2", "pizza": "nachbarn_3", "fuerstenhut": "nachbarn_3", "tirolerhut": "nachbarn_4", "erfinderbrille": "erfindungen_1", "sackmesser": "erfindungen_2", "gluehbirne": "erfindungen_3", "laborkittel": "erfindungen_4", "klettschuhe": "erfindungen_4", "stimmcouvert": "politik_1", "megafon": "politik_2", "jaanstecker": "politik_3", "bundesratskrawatte": "politik_4", "feuerwehrhelm": "ebenen_1", "postmuetze": "ebenen_2", "baer": "ebenen_3", "kuh": "ebenen_4"}, SW_OUT_N = {"goldeuhr": 16, "edelweisskrone": 24, "legendencape": 32}, SW_ROOM = {"fahne": "eidgenossen_4", "girlande": "helvetik_4", "eiffel": "nachbarn_2", "europakarte": "nachbarn_4", "werkbank": "erfindungen_2", "zahnraduhr": "erfindungen_3", "urne": "politik_2", "bundeshausposter": "politik_3", "kartenteppich": "ebenen_2", "postauto": "ebenen_4"}, SW_ROOM_N = {"geranien": 1, "fenster": 2, "trychel": 3, "ofen": 4, "alphorn": 5, "kuckuck": 6, "lampe": 7, "kuhfell": 8, "schrank": 9, "milch": 10, "laterne": 11, "scherenschnitt": 12, "edelweiss": 13, "fondue": 14, "holzkuh": 15, "herzen": 17, "gondel": 20, "globus": 26, "sterne": 28, "thron": 32};
const SW_BADGE = id => { const m = SW_MODS.find(x=>id.startsWith(x[0] + "_")); return m ? m[1] : ""; };
const swCount = T => [...T.badges].filter(b=>SW_MODS.some(x=>b.startsWith(x[0] + "_"))).length;
const swTxt = (badge, n) => n ? `${n} Diplome aus «Entdeckungsreise Schweiz»` : `Diplom aus «${SW_BADGE(badge)}»`;
window.GLAB_LEVEL_SKINS = [{"id": "sonne", "n": "Sonnenuntergang", "lv": 19, "base": "#FF7A3D", "light": "#FFD25A", "dark": "#C2255C", "hi": "#FFF1B8"}, {"id": "ozean", "n": "Ozean", "lv": 39, "base": "#1E88E5", "light": "#4DE3E0", "dark": "#123B8C", "hi": "#C9FBFF"}, {"id": "galaxie", "n": "Galaxie", "lv": 59, "base": "#6A2BD9", "light": "#FF5ED8", "dark": "#1A1060", "hi": "#FFD6F6"}, {"id": "lava", "n": "Lava", "lv": 79, "base": "#E8361C", "light": "#FFB21A", "dark": "#5A1208", "hi": "#FFE7A0"}, {"id": "aurora", "n": "Polarlicht", "lv": 99, "base": "#19C79A", "light": "#9BFF6B", "dark": "#5B2BB5", "hi": "#E4FFD2"}];
function rewardsFix(lib){
  if (lib.__rw) return; lib.__rw = 1;
  const dipName = id => { const b = (lib.BADGES || []).concat(window.GLAB_GE_BADGES || []).find(x=>x.id === id); return b ? b.n : ""; };
  (lib.OUTFITS || []).forEach(o=>{
    if (SW_OUT[o.id]){ o.badge = SW_OUT[o.id]; o.alt = null; o.lv = null; o.reqTxt = `Diplom «${dipName(o.badge) || o.badge}» (${SW_BADGE(o.badge)})`; }
    else if (SW_OUT_N[o.id]){ o.sw = SW_OUT_N[o.id]; o.badge = null; o.alt = null; o.lv = null; o.reqTxt = swTxt("", o.sw); }
  });
  /* restliche Level-Belohnungen gleichmässig bis Level 100 verteilen */
  const lvl = (lib.OUTFITS || []).filter(o=>o.lv != null && o.lv > 0 && !o.badge && !o.sw).sort((a,b)=>a.lv - b.lv);
  lvl.forEach((o,k)=>{ o.lv = Math.min(98, Math.round(2 + k * 96 / Math.max(1, lvl.length - 1))); });
  /* Start-Outfits: nur das erste bleibt auf Level 1, die anderen kommen auf freie Level bis Level 50 */
  const start = (lib.OUTFITS || []).filter(o=>o.lv === 0 && !o.badge && !o.sw), used = new Set(lvl.map(o=>o.lv));
  const free = []; for (let k = 1; k < 50; k++) if (!used.has(k)) free.push(k);
  start.slice(1).forEach((o,i,arr)=>{ o.lv = free[Math.round((i + 1) * (free.length - 1) / (arr.length + 1))]; });
  const R = window.GLAB_R;
  if (R && R.ROOM) R.ROOM.forEach(x=>{
    if (SW_ROOM[x.id]){ x.badge = SW_ROOM[x.id]; x.lv = 9999; x.reqTxt = `Diplom «${dipName(x.badge) || x.badge}» (${SW_BADGE(x.badge)})`; }
    else if (SW_ROOM_N[x.id]){ x.sw = SW_ROOM_N[x.id]; x.lv = 9999; x.reqTxt = swTxt("", x.sw); }
  });
}
function withFN(lib){
  rewardsFix(lib);
  if (lib.OUTFITS && !lib.OUTFITS.__cu){ lib.OUTFITS.__cu = 1; CU.outfits.forEach(o=>{ if (!lib.OUTFITS.some(x=>x.id === o.id)) lib.OUTFITS.push({id:o.id, slot:o.slot, n:o.n, say:o.say || "", lv:0, svg:o.svg, badge:o.badge || null, reqTxt:o.reqTxt || ""}); }); }
  const BADGES = lib.BADGES.filter(b=>!b.mod || b.mod === "prompt").map(b=>Object.assign({mod:"prompt"}, b))
    .concat(window.GLAB_FN_BADGES || []).concat(window.GLAB_KI_BADGES || []).concat(window.GLAB_GE_BADGES || [])
    .filter((b, k, all)=>all.findIndex(x=>x.id === b.id) === k);
  (lib.OUTFITS || []).forEach(o=>{ if (o.badge && OUTFIT_MAP[o.badge]) o.alt = OUTFIT_MAP[o.badge]; if (o.id === "fahne") o.say = "Hopp Schwiiz! Von 1291 bis 1815 kenne ich jetzt alles."; });
  const outfitReq = x => { if (x.reqTxt) return x.reqTxt; if (x.badge){ const b = BADGES.find(b=>b.id === x.badge), a = x.alt && BADGES.find(b=>b.id === x.alt); return `Diplom «${b ? b.n : x.badge}»${a ? ` oder «${a.n}»` : ""}`; } return lib.outfitReq(x); };
  BADGES.forEach((b, k)=>{ if (!b.art) BADGES[k] = Object.assign({}, b, {art: MI_WALL[b.id] ? `<svg viewBox="0 0 20 20" aria-hidden="true">${MI_WALL[b.id]}</svg>` : dipArt("🏅", "#7B4CEF")}); });
  CU.dips.forEach(b=>{ if (!BADGES.some(x=>x.id === b.id)) BADGES.push({id:b.id, n:b.n, d:b.d || `Aus dem Modul «${b.mod}».`, mod:b.modId, art:dipArt(b.emoji, b.c, b.wand, b.id)}); });
  return Object.assign({}, lib, {BADGES, outfitReq, OUTFITS: lib.OUTFITS.slice()});
}
function totalsFor(sid, live){
  const p = sid ? prog(sid) : {mods:{}};
  let stars = 0; const badges = new Set(); let fed = 0, deaths = 0;
  Object.entries(p.mods || {}).forEach(([k, m])=>{
    let st = m.stars || 0;
    if (live && k === (live.mod || "prompt")) st = Math.max(st, live.stars || 0);
    stars += st; (m.badges || []).forEach(b=>badges.add(b)); fed = Math.max(fed, m.fed || 0); deaths = Math.max(deaths, m.deaths || 0);
  });
  if (live){
    if (!(p.mods || {})[live.mod || "prompt"]) stars += live.stars || 0;
    (live.badges ? Array.from(live.badges) : []).forEach(b=>badges.add(b));
    fed = Math.max(fed, live.fed || 0); deaths = Math.max(deaths, live.deaths || 0);
  }
  return {stars, badges, fed, deaths};
}

/* ================= Dateien: Export & Zusammenführen ================= */
function snapshot(kind){
  const work = {};
  if (D.cls){ const pre = WPRE + D.cls.id + "."; try { for (let i=0; i<localStorage.length; i++){ const k = localStorage.key(i); if (k && k.startsWith(pre)){ const v = lsGet(k); if (v) work[k] = v; } } } catch(e){} }
  const cls = D.cls && kind === "klasse" ? Object.assign({}, D.cls, {self: undefined}) : D.cls;
  return {glab:1, kind, at: now(), cls, prog: D.prog, work};
}
function mergeIn(f){
  if (!f || f.glab !== 1 || !f.cls || !Array.isArray(f.cls.students)) throw new Error("bad");
  let replaced = false;
  if (!D.cls || D.cls.id !== f.cls.id){ if (D.cls) replaced = true; D.cls = f.cls; D.prog = {}; D.me = null; }
  else if ((f.cls.rev || 0) > (D.cls.rev || 0)) D.cls = f.cls;
  Object.entries(f.prog || {}).forEach(([sid, q])=>{
    const p = prog(sid);
    Object.entries(q.mods || {}).forEach(([k, m])=>{
      if (k === "cheat") return;
      const a = p.mods[k] || {stars:0, badges:[], fed:0, deaths:0};
      p.mods[k] = {stars: Math.max(a.stars||0, m.stars||0), badges: Array.from(new Set([...(a.badges||[]), ...(m.badges||[])])), fed: Math.max(a.fed||0, m.fed||0), deaths: Math.max(a.deaths||0, m.deaths||0), at: Math.max(a.at||0, m.at||0)};
    });
    if ((q.outfitAt || 0) > (p.outfitAt || 0)){ p.outfit = q.outfit || {}; p.outfitAt = q.outfitAt; }
    if ((q.prefsAt || 0) > (p.prefsAt || 0)){ p.room = q.room || {}; p.emote = q.emote || null; p.prefsAt = q.prefsAt; }
  });
  let projects = 0;
  Object.entries(f.work || {}).forEach(([k, v])=>{
    if (!k.startsWith(WPRE + D.cls.id + ".")) return;
    const cur = lsGet(k);
    if (!cur || (v.at || 0) > (cur.at || 0)){ lsSet(k, v); projects++; }
  });
  if (D.me && !student(D.me)) D.me = null;
  saveD();
  return {replaced, projects};
}
/* Konten anderer Geräte nach Vorname zusammenführen (Kind hat selbst angefangen, ohne Klassen-Datei) */
const normN = n => String(n || "").trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");
function mergeProgInto(sid, q){
  const p = prog(sid);
  Object.entries(q.mods || {}).forEach(([k, m])=>{
    if (k === "cheat") return;
    const a = p.mods[k] || {stars:0, badges:[], fed:0, deaths:0};
    p.mods[k] = {stars: Math.max(a.stars||0, m.stars||0), badges: Array.from(new Set([...(a.badges||[]), ...(m.badges||[])])), fed: Math.max(a.fed||0, m.fed||0), deaths: Math.max(a.deaths||0, m.deaths||0), at: Math.max(a.at||0, m.at||0)};
  });
  if ((q.outfitAt || 0) > (p.outfitAt || 0)){ p.outfit = q.outfit || {}; p.outfitAt = q.outfitAt; }
  if ((q.prefsAt || 0) > (p.prefsAt || 0)){ p.room = q.room || {}; p.emote = q.emote || null; p.prefsAt = q.prefsAt; }
}
function mergeForeign(f){
  if (!f || f.glab !== 1 || !f.cls || !Array.isArray(f.cls.students)) throw new Error("bad");
  const map = {}; let added = [];
  f.cls.students.forEach(fs=>{ let s = D.cls.students.find(x=>normN(x.n) === normN(fs.n));
    if (!s){ s = {id: D.cls.students.some(x=>x.id === fs.id) ? uid() : fs.id, n: String(fs.n).trim().slice(0,30)}; D.cls.students.push(s); added.push(s.n); }
    map[fs.id] = s.id; });
  Object.entries(f.prog || {}).forEach(([fid, q])=>{ if (map[fid]) mergeProgInto(map[fid], q); });
  D.cls.groups = D.cls.groups || {};
  Object.entries(f.cls.groups || {}).forEach(([mod, g])=>{ D.cls.groups[mod] = D.cls.groups[mod] || {}; Object.entries(g || {}).forEach(([fid, nr])=>{ if (map[fid] && nr) D.cls.groups[mod][map[fid]] = nr; }); });
  let projects = 0; const fpre = WPRE + f.cls.id + ".";
  Object.entries(f.work || {}).forEach(([k, v])=>{ if (!k.startsWith(fpre)) return; const nk = WPRE + D.cls.id + "." + k.slice(fpre.length); const cur = lsGet(nk);
    if (!cur || (v.at || 0) > (cur.at || 0)){ lsSet(nk, v); projects++; } });
  D.cls.rev = now(); saveD();
  return {added, projects, map};
}
function importFile(f){
  if (!f || f.glab !== 1 || !f.cls || !Array.isArray(f.cls.students)) throw new Error("bad");
  const teacher = view === "lp" && lpOk;
  if (!D.cls){
    if (teacher){ D.cls = {id: uid(), name: "Meine Klasse", code: "4313", rev: now(), students: [], groups: {}}; D.prog = {}; return Object.assign({replaced:false}, mergeForeign(f)); }
    const r = mergeIn(f); return Object.assign({added:[]}, r);
  }
  if (D.cls.id === f.cls.id) return (teacher || f.kind !== "klasse") ? Object.assign({replaced:false}, mergeForeign(f)) : Object.assign({added:[]}, mergeIn(f));
  if (teacher || f.kind !== "klasse") return Object.assign({replaced:false}, mergeForeign(f));
  if (D.cls.self){
    const old = snapshot("sicherung"), meName = (student(D.me) || {}).n;
    D.cls = null; D.prog = {}; mergeIn(f); const r = mergeForeign(old);
    const m = D.cls.students.find(s=>normN(s.n) === normN(meName)); D.me = m ? m.id : null; saveD();
    return Object.assign({replaced:false}, r);
  }
  return Object.assign({added:[]}, mergeIn(f));
}
async function saveFile(kind, btn){
  const msg = $p("#ptMsg");
  const who = kind === "klasse" ? (D.cls ? D.cls.name : "Klasse") : (student(D.me) || {n:"Sicherung"}).n;
  const filename = (kind === "klasse" ? "gLiTCh-Klasse " : "gLiTCh-Sicherung ") + who.replace(/[^\wäöüÄÖÜ\- ]+/g, "").trim() + ".json";
  try {
    const dl = (window.claude && window.claude.use ? await window.claude.use("downloads") : null) || fbDownloads();
    if (btn) btn.disabled = true;
    await dl.save({filename, data: new Blob([JSON.stringify(snapshot(kind))], {type:"application/json"})});
    say(msg, kind === "klasse"
      ? "Gespeichert! Jetzt per AirDrop an die iPads der Klasse senden. Dort: «Klassen-Datei laden»."
      : "Gespeichert! Jetzt per AirDrop an die Lehrperson senden: Teilen-Symbol → AirDrop.");
  } catch(e){
    const code = e && e.code;
    say(msg, code === "declined" ? "Speichern abgebrochen." : code === "rate_limited" ? "Bitte einen Moment warten und nochmals versuchen." : "Speichern hat nicht geklappt.", true);
  } finally { if (btn) btn.disabled = false; }
}
async function loadFiles(files){
  const msg = $p("#ptMsg"); let ok = 0, projects = 0, bad = [], replaced = false, added = [];
  for (const file of files){
    try { const r = importFile(JSON.parse(await file.text())); ok++; projects += r.projects; replaced = replaced || r.replaced; (r.added || []).forEach(n=>added.push(n)); }
    catch(e){ bad.push(file.name); }
  }
  render();
  const m = $p("#ptMsg") || msg;
  if (ok) say(m, (ok === 1 ? "Datei geladen." : ok + " Dateien geladen.") + (projects ? " " + projects + " Projekt(e) aktualisiert." : "") + (added.length && view === "lp" ? " Neu in der Klasse: " + added.join(", ") + "." : "") + (replaced ? " Achtung: Die Klasse auf diesem Gerät wurde ersetzt." : "") + (bad.length ? " Nicht lesbar: " + bad.join(", ") : ""), !!bad.length);
  else say(m, "Das ist keine gLiTCh-Lab-Datei" + (bad.length ? ": " + bad.join(", ") : "") + ".", true);
}
function say(el, text, err){ if (!el) return; el.textContent = text; el.classList.toggle("err", !!err); }

/* ================= Online-Speicher (nur für die Lehrperson, wenn bei Claude angemeldet) ================= */
let cloud = {db:null, state:"wait", at:0}, pushT = null, pushing = Promise.resolve(), pushed = {};
const CDOC = "glab/klasse", CWORK = "glab_work", CIMG = "glab_img";
const clsLite = c => c ? Object.assign({}, c, {kiQuiz: (c.kiQuiz || []).map(q=>({id:q.id, ans:q.ans, hint:q.hint, src:q.src}))}) : c;
function cloudHTML(){
  const st = cloud.state;
  if (cloud.fb || FBX.on()){ const t2 = st === "on" ? `Online gespeichert im Klassen-Speicher${cloud.at ? " · zuletzt " + new Date(cloud.at).toLocaleTimeString("de-CH", {hour:"2-digit", minute:"2-digit"}) : ""}. Alle iPads mit dem Klassen-Link sind auf dem gleichen Stand.` : st === "wait" ? "Verbinde mit dem Klassen-Speicher …" : `Online-Speichern hat gerade nicht geklappt. Alles ist auf diesem Gerät gespeichert, ich versuche es gleich nochmals.${fbSync.err ? " (" + FBX.explain(fbSync.err) + ")" : ""}`;
    return `<div class="pt-cloud ${st}" role="status"><span aria-hidden="true">${st === "on" ? "☁" : st === "wait" ? "…" : "⚠"}</span><span>${t2}</span></div>`; }
  const txt = st === "on" ? `Online gespeichert${cloud.at ? " · zuletzt " + new Date(cloud.at).toLocaleTimeString("de-CH", {hour:"2-digit", minute:"2-digit"}) : ""}. Auf all deinen Geräten, auf denen du bei Claude angemeldet bist, ist alles gleich.`
    : st === "wait" ? "Verbinde mit dem Online-Speicher …"
    : st === "err" ? "Online-Speichern hat gerade nicht geklappt. Alles ist auf diesem Gerät gespeichert, ich versuche es beim nächsten Speichern nochmals."
    : "Nur auf diesem Gerät gespeichert. Online speichern geht nur, wenn du als Besitzer bei Claude angemeldet bist.";
  return `<div class="pt-cloud ${st}" role="status"><span aria-hidden="true">${st === "on" ? "☁" : st === "wait" ? "…" : "⚠"}</span><span>${txt}</span></div>`;
}
function setCloud(st){ cloud.state = st; const el = document.querySelector(".pt-cloud"); if (el) el.outerHTML = cloudHTML(); }
function workKeys(){ const out = []; if (!D.cls) return out; const pre = WPRE + D.cls.id + "."; try { for (let i=0; i<localStorage.length; i++){ const k = localStorage.key(i); if (k && k.startsWith(pre)) out.push(k); } } catch(e){} return out; }
/* ================= Online-Speicher ohne Claude-Konto (Firebase Firestore, REST) =================
   Pro Klasse: klassen/{Code}/meta/klasse, klassen/{Code}/kinder/{id}, klassen/{Code}/arbeit/{Schlüssel}.
   Anmeldung anonym, die Kinder brauchen kein Konto. Konfiguration und Klassen-Code kommen über den Klassen-Link. */
const FBX = (()=>{
  const LS = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const LSS = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  try { const h = new URLSearchParams(location.hash.slice(1)), k = h.get("klasse"), f = h.get("fb");
    if (f){ const [p, a] = f.split("~"); if (p && a) LSS("glab.fbcfg", {projectId:p, apiKey:a}); }
    if (k) LSS("glab.fbclass", k);
    if (k || f) history.replaceState(null, "", location.pathname + location.search); } catch(e){}
  const BAKED = {projectId:"glitch-lab-8a5aa", apiKey:"AIzaSyAdotB234MxWe7y2y0-9VydxkTdpxkXz9k"};
  const cfg = () => { const c = BAKED || LS("glab.fbcfg"); return c && c.projectId && c.apiKey ? c : null; };
  const klass = () => LS("glab.fbclass");
  const on = () => !!(cfg() && klass());
  let tok = LS("glab.fbauth");
  const err = (code, status, body) => Object.assign(new Error(code), {code, status, body});
  async function token(c){
    if (tok && tok.key === c.apiKey && tok.exp > Date.now() + 60000) return tok.id;
    if (tok && tok.key === c.apiKey && tok.refresh){
      const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(c.apiKey)}`, {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:"grant_type=refresh_token&refresh_token=" + encodeURIComponent(tok.refresh)});
      if (r.ok){ const j = await r.json(); tok = {key:c.apiKey, id:j.id_token, refresh:j.refresh_token, exp:Date.now() + (+j.expires_in)*1000}; LSS("glab.fbauth", tok); return tok.id; }
    }
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(c.apiKey)}`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({returnSecureToken:true})});
    if (!r.ok) throw err("auth", r.status, await r.text());
    const j = await r.json(); tok = {key:c.apiKey, id:j.idToken, refresh:j.refreshToken, exp:Date.now() + (+j.expiresIn)*1000}; LSS("glab.fbauth", tok); return tok.id;
  }
  const base = c => `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(c.projectId)}/databases/(default)/documents/klassen/${encodeURIComponent(klass())}`;
  async function call(method, path, body){
    const c = cfg(); if (!c || !klass()) throw err("off");
    const t = await token(c);
    const r = await fetch(base(c) + path, {method, headers:{"Authorization":"Bearer " + t, "Content-Type":"application/json"}, body: body ? JSON.stringify(body) : undefined});
    if (r.status === 404) return null;
    if (!r.ok) throw err("fs", r.status, await r.text());
    return method === "DELETE" ? {} : r.json();
  }
  const dec = d => { try { return JSON.parse(d.fields.json.stringValue); } catch(e){ return null; } };
  const seg = p => p.split("/").map(encodeURIComponent).join("/");
  return {
    cfg, klass, on, setCfg: c=>LSS("glab.fbcfg", c), setKlass: k=>LSS("glab.fbclass", k), baked: ()=>!!BAKED,
    async get(path){ const d = await call("GET", "/" + seg(path)); return d ? dec(d) : null; },
    async set(path, obj){ await call("PATCH", "/" + seg(path), {fields:{json:{stringValue:JSON.stringify(obj)}, at:{integerValue:String(Date.now())}}}); },
    async del(path){ await call("DELETE", "/" + seg(path)); },
    async list(coll){ const out = []; let pt = "";
      for (let i = 0; i < 30; i++){ const d = await call("GET", `/${coll}?pageSize=300${pt ? "&pageToken=" + encodeURIComponent(pt) : ""}`);
        ((d && d.documents) || []).forEach(x=>{ const v = dec(x); if (v) out.push(v); }); if (!d || !d.nextPageToken) break; pt = d.nextPageToken; }
      return out; },
    explain(e){ if (!e) return ""; if (e.code === "auth") return "Die anonyme Anmeldung hat nicht geklappt. In Firebase unter «Authentication» → «Sign-in method» muss «Anonym» aktiviert sein. Prüfe auch den API-Key.";
      if (e.code === "fs" && e.status === 403) return "Firebase verweigert den Zugriff. Prüfe die Regeln unter «Firestore Database» → «Regeln».";
      if (e.code === "fs" && e.status === 404) return "Die Datenbank wurde nicht gefunden. Lege unter «Firestore Database» eine Datenbank an und prüfe die Projekt-ID.";
      if (e.code === "fs") return "Firebase meldet einen Fehler (" + e.status + ").";
      return "Keine Verbindung zum Internet oder zu Firebase."; }
  };
})();
const fbSync = {lastG:{}, lastMeta:"", sig:{}, err:null, timer:null};
const fbMetaOf = c => { const m = Object.assign({}, c); delete m.students; delete m.groups; delete m.kiQuiz; delete m.self; return m; };
const fbGroupsOf = sid => { const g = {}; Object.entries((D.cls && D.cls.groups) || {}).forEach(([m, x])=>{ if (x && x[sid]) g[m] = x[sid]; }); return g; };
function fbProgMerge(a, b){
  const p = JSON.parse(JSON.stringify(a || {mods:{}, outfit:{}, outfitAt:0}));
  p.mods = p.mods || {};
  Object.entries((b && b.mods) || {}).forEach(([k, m])=>{ if (k === "cheat") return; const x = p.mods[k] || {stars:0, badges:[], fed:0, deaths:0};
    p.mods[k] = {stars: Math.max(x.stars||0, m.stars||0), badges: Array.from(new Set([...(x.badges||[]), ...(m.badges||[])])), fed: Math.max(x.fed||0, m.fed||0), deaths: Math.max(x.deaths||0, m.deaths||0), at: Math.max(x.at||0, m.at||0)}; });
  if (b && (b.outfitAt || 0) > (p.outfitAt || 0)){ p.outfit = b.outfit || {}; p.outfitAt = b.outfitAt; }
  if (b && (b.prefsAt || 0) > (p.prefsAt || 0)){ p.room = b.room || {}; p.emote = b.emote || null; p.prefsAt = b.prefsAt; }
  ["wall","wallKnown","seen"].forEach(k=>{ if (b && b[k] != null && p[k] == null) p[k] = b[k]; });
  return p;
}
async function fbPull(){
  const meta = await FBX.get("meta/klasse");
  if (!meta || !meta.cls) return null;
  const kids = await FBX.list("kinder"), work = await FBX.list("arbeit");
  return {meta, kids, work};
}
function fbAdopt(r){
  const mc = r.meta.cls, kids = r.kids.filter(k=>k && k.s && k.s.id);
  if (!D.cls || D.cls.id !== mc.id){
    const old = D.cls ? snapshot("sicherung") : null, meName = (student(D.me) || {}).n;
    D.cls = Object.assign({}, mc, {students:[], groups:{}}); D.prog = {}; D.me = null;
    fbMergeKids(kids, true);
    if (old && old.cls && !mc.self){ old.cls = Object.assign({}, old.cls, {students: old.cls.students.filter(x=>D.cls.students.some(y=>normN(y.n) === normN(x.n)))}); }
    if (old && old.cls && old.cls.students.length){ mergeForeign(old); D.cls.rev = mc.rev || D.cls.rev; }
    const m = meName ? D.cls.students.find(s=>normN(s.n) === normN(meName)) : null; D.me = m ? m.id : null;
  } else {
    if ((mc.rev || 0) > (D.cls.rev || 0)) Object.assign(D.cls, fbMetaOf(mc), {rev: mc.rev});
    fbMergeKids(kids, false);
  }
  fbSync.lastMeta = JSON.stringify(fbMetaOf(D.cls));
  const pre = WPRE + D.cls.id + ".", openKey = curMod && modNr ? workKey(modNr, curMod) : null;
  r.work.forEach(w=>{ if (!w || !w.k || !w.v || !w.k.startsWith(pre) || w.k === openKey) return; const cur = lsGet(w.k);
    if (!cur || (w.v.at || 0) > (cur.at || 0)){ lsSet(w.k, w.v); fbSync.sig["a:" + w.k] = JSON.stringify(w.v); } });
  lsSet(PKEY, D);
}
function fbMergeKids(kids, fresh){
  D.cls.groups = D.cls.groups || {};
  const ids = new Set(kids.map(k=>k.s.id));
  D.cls.students = D.cls.students.filter(s=>{ if (!s.cl || ids.has(s.id) || kids.some(k=>normN(k.s.n) === normN(s.n))) return true;
    Object.values(D.cls.groups).forEach(g=>{ if (g) delete g[s.id]; }); delete D.prog[s.id]; if (D.me === s.id) D.me = null; return false; });
  kids.forEach(k=>{
    let s = D.cls.students.find(x=>x.id === k.s.id) || D.cls.students.find(x=>normN(x.n) === normN(k.s.n));
    if (!s){ s = Object.assign({}, k.s); D.cls.students.push(s); }
    else if ((k.s.at || 0) > (s.at || 0)){ s.n = k.s.n; s.pin = k.s.pin; s.at = k.s.at; }
    s.cl = 1;
    D.prog[s.id] = fbProgMerge(D.prog[s.id], k.prog);
    const cg = k.groups || {}, cgs = JSON.stringify(cg), local = JSON.stringify(fbGroupsOf(s.id));
    const localChanged = !fresh && fbSync.lastG[s.id] != null && fbSync.lastG[s.id] !== local;
    if (!localChanged){ Object.values(D.cls.groups).forEach(g=>{ if (g) delete g[s.id]; }); Object.entries(cg).forEach(([m, nr])=>{ (D.cls.groups[m] = D.cls.groups[m] || {})[s.id] = nr; }); fbSync.lastG[s.id] = cgs; }
  });
}
async function fbPush(){
  if (!FBX.on() || !D.cls) return;
  try {
    const metaSig = JSON.stringify(fbMetaOf(D.cls));
    if (metaSig !== fbSync.lastMeta){ await FBX.set("meta/klasse", {cls: Object.assign(fbMetaOf(D.cls), {students:[], groups:{}})}); fbSync.lastMeta = metaSig; }
    for (const s of D.cls.students){
      const g = fbGroupsOf(s.id), mine = {s:{id:s.id, n:s.n, pin:s.pin, at:s.at || 0}, prog: D.prog[s.id] || {mods:{}}, groups: g}, sig = JSON.stringify(mine);
      if (fbSync.sig["k:" + s.id] === sig) continue;
      const cloudK = await FBX.get("kinder/" + s.id);
      const out = Object.assign({}, mine);
      if (cloudK){ out.prog = fbProgMerge(mine.prog, cloudK.prog);
        if (cloudK.s && (cloudK.s.at || 0) > (s.at || 0)){ s.n = cloudK.s.n; s.pin = cloudK.s.pin; s.at = cloudK.s.at; out.s = Object.assign({}, cloudK.s); } D.prog[s.id] = fbProgMerge(D.prog[s.id], cloudK.prog);
        const localChanged = fbSync.lastG[s.id] == null || fbSync.lastG[s.id] !== JSON.stringify(g); if (!localChanged) out.groups = cloudK.groups || {}; }
      await FBX.set("kinder/" + s.id, out); s.cl = 1; fbSync.lastG[s.id] = JSON.stringify(out.groups); fbSync.sig["k:" + s.id] = JSON.stringify(Object.assign({}, out, {prog: D.prog[s.id]}));
    }
    for (const k of workKeys()){
      const raw = localStorage.getItem(k); if (!raw || fbSync.sig["a:" + k] === raw || raw.length > 600000) continue;
      const v = lsGet(k) || {}; const c = await FBX.get("arbeit/" + k);
      if (c && c.v && (c.v.at || 0) > (v.at || 0)){ const openKey = curMod && modNr ? workKey(modNr, curMod) : null; if (k !== openKey){ lsSet(k, c.v); fbSync.sig["a:" + k] = JSON.stringify(c.v); continue; } }
      await FBX.set("arbeit/" + k, {k, v}); fbSync.sig["a:" + k] = raw;
    }
    lsSet(PKEY, D); fbSync.err = null; cloud.at = Date.now(); setCloud("on");
  } catch(e){ fbSync.err = e; setCloud("err"); }
}
async function fbInit(render1){
  setCloud("wait");
  try {
    const r = await fbPull();
    if (r){ const before = JSON.stringify([D.cls, D.prog]); fbAdopt(r); if (render1 !== false && LIB && !curMod && before !== JSON.stringify([D.cls, D.prog]) && !document.querySelector(".pt-ov")) render(); }
    cloud.fb = true; cloud.at = Date.now(); fbSync.err = null; setCloud("on");
    await fbPush();
  } catch(e){ cloud.fb = true; fbSync.err = e; setCloud("err"); }
  clearInterval(fbSync.timer); fbSync.timer = setInterval(()=>{ if (document.hidden) return; fbInit(); }, 60000);
}
function fbDownloads(){ return {save: async ({filename, data})=>{ const url = URL.createObjectURL(data); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 4000); }}; }
const fbCode = () => { const a = "abcdefghijkmnpqrstuvwxyz23456789"; let s = ""; const r = new Uint32Array(16); crypto.getRandomValues(r); r.forEach(x=>s += a[x % a.length]); return s; };
const fbLink = () => { const c = FBX.cfg(), k = FBX.klass(); return c && k ? `${location.origin}${location.pathname}#klasse=${k}&fb=${c.projectId}~${c.apiKey}` : ""; };
function fbSetupHTML(){
  const c = FBX.cfg(), k = FBX.klass(), link = fbLink(), here = /^https?:/.test(location.protocol) && !/claude\.ai|claudeusercontent|anthropic/.test(location.hostname);
  return `<div class="pt-card" style="margin-top:16px"><h2>Online-Speicher ohne Claude-Konto</h2>
    <p>Damit speichern alle iPads der Klasse automatisch online, ohne Anmeldung. Du brauchst einmalig ein kostenloses Firebase-Projekt. Die Anleitung steht unten.</p>
    ${!here ? `<p class="pt-lockmsg">ℹ️ Diese Ansicht läuft innerhalb von Claude. Den Online-Speicher richtest du in der Version ein, die du selbst ins Netz stellst (zum Beispiel bei Netlify).</p>` : ""}
    <ol class="pt-steps">
      <li><b>Firebase-Projekt:</b> Auf <b>console.firebase.google.com</b> mit einem Google-Konto ein Projekt erstellen (Google Analytics braucht es nicht).</li>
      <li><b>Datenbank:</b> «Firestore Database» → «Datenbank erstellen» → Standort <b>europe-west6 (Zürich)</b> → «Im Produktionsmodus starten».</li>
      <li><b>Regeln:</b> Bei «Firestore Database» → «Regeln» alles ersetzen durch den Text unten und «Veröffentlichen» tippen.</li>
      <li><b>Anonyme Anmeldung:</b> «Authentication» → «Los geht's» → «Sign-in method» → «Anonym» aktivieren.</li>
      <li><b>Web-App:</b> Projekteinstellungen (Zahnrad) → «Meine Apps» → Web-Symbol &lt;/&gt; → Namen eingeben → registrieren. Den angezeigten Block mit <code>firebaseConfig</code> kopieren und hier einfügen.</li>
      <li><b>Klassen-Code erstellen</b> und den Klassen-Link (oder QR-Code) an die Kinder geben. Wer den Link einmal öffnet, ist verbunden.</li></ol>
    <pre class="pt-rules" id="ptRules">rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /klassen/{code}/{rest=**} {
      allow read, write: if request.auth != null &amp;&amp; code.size() >= 12;
    }
  }
}</pre><div class="pt-row" style="justify-content:flex-start; margin-top:6px"><button type="button" class="pt-btn small" data-pt-fb="copyrules">Regeln kopieren</button></div>
    <div class="pt-form" style="margin-top:14px; flex-direction:column; align-items:stretch"><label for="ptFbCfg" style="font-weight:700">Firebase-Konfiguration ${c ? `<span style="color:#1F9D68">✓ gespeichert (Projekt ${esc(c.projectId)})</span>` : ""}</label>
      <textarea class="pt-in" id="ptFbCfg" rows="4" placeholder='const firebaseConfig = { apiKey: "…", projectId: "…", … };' ${FBX.baked() ? "disabled" : ""}></textarea>
      <div class="pt-row" style="justify-content:flex-start; margin-top:6px"><button type="button" class="pt-btn" data-pt-fb="savecfg" ${FBX.baked() ? "disabled" : ""}>Konfiguration speichern</button>${c ? `<button type="button" class="pt-btn small danger" data-pt-fb="clearcfg">Online-Speicher trennen</button>` : ""}</div></div>
    <div style="margin-top:14px"><b>Klassen-Code:</b> ${k ? `<code>${esc(k)}</code>` : "noch keiner"}
      <div class="pt-row" style="justify-content:flex-start; margin-top:6px"><button type="button" class="pt-btn ${k ? "" : "primary"}" data-pt-fb="newcode" ${c ? "" : "disabled"}>${k ? "Neuen Klassen-Code erstellen" : "Klassen-Code erstellen"}</button>${k && c ? `<button type="button" class="pt-btn" data-pt-fb="test">Verbindung testen</button>` : ""}</div></div>
    ${link ? `<div class="pt-fblink"><b>Klassen-Link für die Kinder</b><input class="pt-in" id="ptFbLink" readonly value="${esc(link)}"><div class="pt-row" style="justify-content:flex-start; margin-top:6px"><button type="button" class="pt-btn primary" data-pt-fb="copylink">Link kopieren</button><button type="button" class="pt-btn" data-pt-fb="qr">QR-Code zeigen</button></div><div id="ptFbQr" class="pt-fbqr"></div>
      <p style="color:var(--muted); font-size:.85rem">Der Link enthält den Klassen-Code. Gib ihn nur deiner Klasse. Ein neuer Klassen-Code startet einen neuen, leeren Online-Speicher: Verteile danach den neuen Link.</p></div>` : ""}
    <p class="pt-msg" id="ptFbMsg" role="status">${fbSync.err ? esc(FBX.explain(fbSync.err)) : ""}</p></div>`;
}
async function fbAction(a, btn){
  const msg = document.getElementById("ptFbMsg"), out = (t, bad)=>{ if (msg){ msg.textContent = t; msg.style.color = bad ? "#DD4646" : ""; } };
  if (a === "copyrules" || a === "copylink"){ const t = a === "copylink" ? fbLink() : document.getElementById("ptRules").textContent; try { await navigator.clipboard.writeText(t); out("Kopiert!"); } catch(e){ const i = document.getElementById("ptFbLink"); if (i && a === "copylink"){ i.select(); out("Markiert: jetzt kopieren."); } else out("Kopieren ging nicht. Bitte von Hand markieren.", true); } return; }
  if (a === "savecfg"){ const t = (document.getElementById("ptFbCfg").value || ""); const p = (t.match(/projectId["']?\s*:\s*["']([^"']+)/) || [])[1], k = (t.match(/apiKey["']?\s*:\s*["']([^"']+)/) || [])[1];
    if (!p || !k){ out("Ich finde darin keine «apiKey» und «projectId». Bitte den ganzen firebaseConfig-Block einfügen.", true); return; }
    FBX.setCfg({projectId:p.trim(), apiKey:k.trim()}); render(); setTimeout(()=>{ const m = document.getElementById("ptFbMsg"); if (m) m.textContent = "Gespeichert. Jetzt einen Klassen-Code erstellen."; }, 50); return; }
  if (a === "clearcfg"){ FBX.setCfg(null); FBX.setKlass(null); clearInterval(fbSync.timer); cloud.fb = false; setCloud("off"); render(); return; }
  if (a === "newcode"){ FBX.setKlass(fbCode()); fbSync.lastMeta = ""; fbSync.sig = {}; fbSync.lastG = {}; render(); out("Verbinde …"); await fbInit(false); render(); setTimeout(()=>{ const m = document.getElementById("ptFbMsg"); if (m) m.textContent = fbSync.err ? FBX.explain(fbSync.err) : "Verbunden! Die Klasse ist jetzt online gespeichert."; if (m && fbSync.err) m.style.color = "#DD4646"; }, 50); return; }
  if (a === "test"){ out("Teste …"); fbSync.sig = {}; fbSync.lastMeta = ""; await fbInit(false); out(fbSync.err ? FBX.explain(fbSync.err) : "Alles in Ordnung: verbunden und gespeichert.", !!fbSync.err); return; }
  if (a === "qr"){ const box = document.getElementById("ptFbQr"); if (!box) return; box.innerHTML = "QR-Code wird erstellt …";
    try { if (!window.QRCode) await new Promise((ok, no)=>{ const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
      box.innerHTML = ""; new window.QRCode(box, {text: fbLink(), width: 220, height: 220, correctLevel: window.QRCode.CorrectLevel.L}); } catch(e){ box.textContent = "QR-Code konnte nicht geladen werden."; } return; }
}

window.fbDownloads = fbDownloads;
async function cloudInit(){
  if (FBX.on()) return fbInit();
  let db = null;
  try { db = window.claude && window.claude.use ? await window.claude.use("db") : null; } catch(e){ db = null; }
  if (!db){ setCloud("off"); return; }
  try {
    const snap = await db.doc(CDOC).get();
    const f = {glab:1, cls:null, prog:{}, work:{}};
    if (snap.exists){ const d = snap.data() || {}; try { f.cls = JSON.parse(d.cls || "null"); f.prog = JSON.parse(d.prog || "{}"); } catch(e){} }
    if (f.cls){
      if ((f.cls.kiQuiz || []).length){ try { const is = await db.collection(CIMG).get(); const m = {}; is.docs.forEach(x=>{ const d = x.data() || {}; if (d.id && d.img){ m[d.id] = d.img; pushed["img:" + d.id] = "1"; } }); const loc = {}; ((D.cls && D.cls.kiQuiz) || []).forEach(q=>{ if (q.img) loc[q.id] = q.img; }); f.cls.kiQuiz = f.cls.kiQuiz.map(q=>Object.assign({}, q, {img: m[q.id] || loc[q.id] || ""})); } catch(e){} }
      const ws = await db.collection(CWORK).get();
      ws.docs.forEach(x=>{ const d = x.data() || {}; if (d.k && d.json){ try { f.work[d.k] = JSON.parse(d.json); } catch(e){} } });
      if (D.cls && D.cls.id !== f.cls.id && (D.cls.rev || 0) > (f.cls.rev || 0)){ /* lokal neuere, andere Klasse: lokal behalten und hochladen */ }
      else { const keep = f.work; if (curMod) f.work = {}; mergeIn(f); f.work = keep; }
      pushed[CDOC] = JSON.stringify({cls: JSON.stringify(clsLite(f.cls)), prog: JSON.stringify(f.prog)});
      Object.entries(f.work).forEach(([k,v])=>{ pushed[k] = JSON.stringify(v); });
    }
    cloud.db = db; cloud.at = Date.now(); setCloud("on");
    if (LIB && !curMod) render();
    cloudPush(true);
  } catch(e){ cloud.db = null; setCloud(e && e.code === "invalid_argument" ? "off" : "err"); }
}
function cloudPush(now){
  if (cloud.fb){ clearTimeout(pushT); pushT = setTimeout(()=>{ pushing = pushing.then(fbPush).catch(()=>{}); }, now ? 0 : 1500); return; }
  if (!cloud.db || !D.cls) return;
  clearTimeout(pushT);
  pushT = setTimeout(()=>{ pushing = pushing.then(doPush).catch(()=>{}); }, now ? 0 : 1500);
}
async function doPush(){
  const db = cloud.db; if (!db || !D.cls) return;
  try {
    const body = {cls: JSON.stringify(clsLite(D.cls)), prog: JSON.stringify(D.prog), at: Date.now()};
    const sig = JSON.stringify({cls: body.cls, prog: body.prog});
    if (pushed[CDOC] !== sig){ await db.doc(CDOC).set(body); pushed[CDOC] = sig; }
    for (const q of (D.cls.kiQuiz || [])){ if (!q.img || pushed["img:" + q.id] === "1" || q.img.length > 250000) continue; await db.collection(CIMG).doc(q.id).set({id:q.id, img:q.img}); pushed["img:" + q.id] = "1"; }
    for (const k of workKeys()){
      const raw = localStorage.getItem(k); if (!raw || pushed[k] === raw) continue;
      if (raw.length > 240000) continue;
      const v = lsGet(k) || {};
      await db.collection(CWORK).doc(k).set({k, at: v.at || Date.now(), json: raw});
      pushed[k] = raw;
    }
    cloud.at = Date.now(); if (cloud.state !== "on") setCloud("on"); else { const el = document.querySelector(".pt-cloud"); if (el) el.outerHTML = cloudHTML(); }
  } catch(e){
    if (e && e.code === "invalid_argument"){ cloud.db = null; setCloud("off"); }
    else setCloud("err");
  }
}

/* ================= Darstellung ================= */
const portalEl = document.getElementById("portal");
const $p = sel => portalEl.querySelector(sel) || document.querySelector(sel);
let view = "home", lpTab = "sus", lpOk = false;
const LP_NAME = (ctx && ctx.teacher) || "deiner Lehrperson";


function topHTML(right){
  return `<header class="pt-top"><div class="pt-brand" data-pt="logo" role="button" tabindex="0" title="Zur Startseite" style="cursor:pointer"><div class="lab-logo" aria-hidden="true">${LIB.labLogo(64)}</div><div>
    <h1 class="lab-title"><span class="lt-g">gLiTCh</span><span class="lt-l">-Lab</span><span class="nmg-badge" aria-label="NMG"><svg viewBox="0 0 60 22" shape-rendering="crispEdges" aria-hidden="true"><rect x="0" y="0" width="60" height="22" rx="3" fill="#D52B1E"/><path d="M0 22 L10 12 L15 16 L24 7 L33 15 L39 10 L50 19 L60 13 L60 22Z" fill="#B71C1C"/><path d="M22 9 L24 7 L26 9 L25 9 L24 8 L23 9Z" fill="#fff" opacity=".7"/><g class="nmg-cross"><rect x="7" y="5" width="4" height="12" fill="#fff"/><rect x="3" y="9" width="12" height="4" fill="#fff"/></g><g class="nmg-c"><rect x="20" y="5" width="2" height="2" fill="#00E5FF"/><rect x="28" y="5" width="2" height="2" fill="#00E5FF"/><rect x="20" y="7" width="2" height="2" fill="#00E5FF"/><rect x="22" y="7" width="2" height="2" fill="#00E5FF"/><rect x="28" y="7" width="2" height="2" fill="#00E5FF"/><rect x="20" y="9" width="2" height="2" fill="#00E5FF"/><rect x="24" y="9" width="2" height="2" fill="#00E5FF"/><rect x="28" y="9" width="2" height="2" fill="#00E5FF"/><rect x="20" y="11" width="2" height="2" fill="#00E5FF"/><rect x="26" y="11" width="2" height="2" fill="#00E5FF"/><rect x="28" y="11" width="2" height="2" fill="#00E5FF"/><rect x="20" y="13" width="2" height="2" fill="#00E5FF"/><rect x="28" y="13" width="2" height="2" fill="#00E5FF"/><rect x="32" y="5" width="2" height="2" fill="#00E5FF"/><rect x="40" y="5" width="2" height="2" fill="#00E5FF"/><rect x="32" y="7" width="2" height="2" fill="#00E5FF"/><rect x="34" y="7" width="2" height="2" fill="#00E5FF"/><rect x="38" y="7" width="2" height="2" fill="#00E5FF"/><rect x="40" y="7" width="2" height="2" fill="#00E5FF"/><rect x="32" y="9" width="2" height="2" fill="#00E5FF"/><rect x="36" y="9" width="2" height="2" fill="#00E5FF"/><rect x="40" y="9" width="2" height="2" fill="#00E5FF"/><rect x="32" y="11" width="2" height="2" fill="#00E5FF"/><rect x="40" y="11" width="2" height="2" fill="#00E5FF"/><rect x="32" y="13" width="2" height="2" fill="#00E5FF"/><rect x="40" y="13" width="2" height="2" fill="#00E5FF"/><rect x="46" y="5" width="2" height="2" fill="#00E5FF"/><rect x="48" y="5" width="2" height="2" fill="#00E5FF"/><rect x="50" y="5" width="2" height="2" fill="#00E5FF"/><rect x="44" y="7" width="2" height="2" fill="#00E5FF"/><rect x="44" y="9" width="2" height="2" fill="#00E5FF"/><rect x="48" y="9" width="2" height="2" fill="#00E5FF"/><rect x="50" y="9" width="2" height="2" fill="#00E5FF"/><rect x="52" y="9" width="2" height="2" fill="#00E5FF"/><rect x="44" y="11" width="2" height="2" fill="#00E5FF"/><rect x="52" y="11" width="2" height="2" fill="#00E5FF"/><rect x="46" y="13" width="2" height="2" fill="#00E5FF"/><rect x="48" y="13" width="2" height="2" fill="#00E5FF"/><rect x="50" y="13" width="2" height="2" fill="#00E5FF"/></g><g class="nmg-m"><rect x="22" y="5" width="2" height="2" fill="#FF2BD6"/><rect x="30" y="5" width="2" height="2" fill="#FF2BD6"/><rect x="22" y="7" width="2" height="2" fill="#FF2BD6"/><rect x="24" y="7" width="2" height="2" fill="#FF2BD6"/><rect x="30" y="7" width="2" height="2" fill="#FF2BD6"/><rect x="22" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="26" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="30" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="22" y="11" width="2" height="2" fill="#FF2BD6"/><rect x="28" y="11" width="2" height="2" fill="#FF2BD6"/><rect x="30" y="11" width="2" height="2" fill="#FF2BD6"/><rect x="22" y="13" width="2" height="2" fill="#FF2BD6"/><rect x="30" y="13" width="2" height="2" fill="#FF2BD6"/><rect x="34" y="5" width="2" height="2" fill="#FF2BD6"/><rect x="42" y="5" width="2" height="2" fill="#FF2BD6"/><rect x="34" y="7" width="2" height="2" fill="#FF2BD6"/><rect x="36" y="7" width="2" height="2" fill="#FF2BD6"/><rect x="40" y="7" width="2" height="2" fill="#FF2BD6"/><rect x="42" y="7" width="2" height="2" fill="#FF2BD6"/><rect x="34" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="38" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="42" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="34" y="11" width="2" height="2" fill="#FF2BD6"/><rect x="42" y="11" width="2" height="2" fill="#FF2BD6"/><rect x="34" y="13" width="2" height="2" fill="#FF2BD6"/><rect x="42" y="13" width="2" height="2" fill="#FF2BD6"/><rect x="48" y="5" width="2" height="2" fill="#FF2BD6"/><rect x="50" y="5" width="2" height="2" fill="#FF2BD6"/><rect x="52" y="5" width="2" height="2" fill="#FF2BD6"/><rect x="46" y="7" width="2" height="2" fill="#FF2BD6"/><rect x="46" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="50" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="52" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="54" y="9" width="2" height="2" fill="#FF2BD6"/><rect x="46" y="11" width="2" height="2" fill="#FF2BD6"/><rect x="54" y="11" width="2" height="2" fill="#FF2BD6"/><rect x="48" y="13" width="2" height="2" fill="#FF2BD6"/><rect x="50" y="13" width="2" height="2" fill="#FF2BD6"/><rect x="52" y="13" width="2" height="2" fill="#FF2BD6"/></g><g class="nmg-w"><rect x="21" y="5" width="2" height="2" fill="#FFFFFF"/><rect x="29" y="5" width="2" height="2" fill="#FFFFFF"/><rect x="21" y="7" width="2" height="2" fill="#FFFFFF"/><rect x="23" y="7" width="2" height="2" fill="#FFFFFF"/><rect x="29" y="7" width="2" height="2" fill="#FFFFFF"/><rect x="21" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="25" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="29" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="21" y="11" width="2" height="2" fill="#FFFFFF"/><rect x="27" y="11" width="2" height="2" fill="#FFFFFF"/><rect x="29" y="11" width="2" height="2" fill="#FFFFFF"/><rect x="21" y="13" width="2" height="2" fill="#FFFFFF"/><rect x="29" y="13" width="2" height="2" fill="#FFFFFF"/><rect x="33" y="5" width="2" height="2" fill="#FFFFFF"/><rect x="41" y="5" width="2" height="2" fill="#FFFFFF"/><rect x="33" y="7" width="2" height="2" fill="#FFFFFF"/><rect x="35" y="7" width="2" height="2" fill="#FFFFFF"/><rect x="39" y="7" width="2" height="2" fill="#FFFFFF"/><rect x="41" y="7" width="2" height="2" fill="#FFFFFF"/><rect x="33" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="37" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="41" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="33" y="11" width="2" height="2" fill="#FFFFFF"/><rect x="41" y="11" width="2" height="2" fill="#FFFFFF"/><rect x="33" y="13" width="2" height="2" fill="#FFFFFF"/><rect x="41" y="13" width="2" height="2" fill="#FFFFFF"/><rect x="47" y="5" width="2" height="2" fill="#FFFFFF"/><rect x="49" y="5" width="2" height="2" fill="#FFFFFF"/><rect x="51" y="5" width="2" height="2" fill="#FFFFFF"/><rect x="45" y="7" width="2" height="2" fill="#FFFFFF"/><rect x="45" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="49" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="51" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="53" y="9" width="2" height="2" fill="#FFFFFF"/><rect x="45" y="11" width="2" height="2" fill="#FFFFFF"/><rect x="53" y="11" width="2" height="2" fill="#FFFFFF"/><rect x="47" y="13" width="2" height="2" fill="#FFFFFF"/><rect x="49" y="13" width="2" height="2" fill="#FFFFFF"/><rect x="51" y="13" width="2" height="2" fill="#FFFFFF"/></g><rect class="nmg-scan" x="0" y="0" width="60" height="1" fill="#fff" opacity=".35"/></svg></span></h1><p>gLiTChs Zimmer</p></div></div>
    <div class="pt-who">${right || ""}</div></header>`;
}
let sayT = null;
function sayHide(){ clearTimeout(sayT); const el = document.getElementById("ptSay"); if (!el) return; el.classList.remove("gone"); sayT = setTimeout(()=>{ const e2 = document.getElementById("ptSay"); if (e2) e2.classList.add("gone"); }, 7000); }
function render(){
  if (!LIB) return;
  if (curMod){ if (window.GLAB_ONCLOSE) try { window.GLAB_ONCLOSE(); } catch(e){} return; }
  if (!ctx){ portalEl.innerHTML = `<div class="pt-card" style="margin-top:40px"><h2>Bitte über das Glitchlab öffnen</h2><p>Diese Seite gehört zum Glitchlab. Öffne zuerst das Glitchlab und melde dich dort an.</p></div>`; return; }
  portalEl.innerHTML = dashHTML();
  sayHide();
  if (MODE === "home") homeHooks();
}
function setupHTML(){
  return topHTML() + `<div class="pt-card"><div class="pt-hello"><span class="glitch">${LIB.glitchSVG("happy")}</span>
    <div class="pt-bubble"><b class="gname">gLiTCh</b>${FBX.on() ? "Hallo! Ich bin gLiTCh. Gleich zeige ich dir die Namen deiner Klasse." : "Hallo! Ich bin gLiTCh. Wie heisst du? Schreib nur deinen Vornamen."}</div></div>
    ${FBX.on() ? `<p class="pt-empty">${cloud.state === "err" ? "Ich erreiche den Klassen-Speicher gerade nicht. Ist das iPad mit dem Internet verbunden?" : cloud.state === "wait" ? "Ich lade deine Klasse …" : "Deine Lehrperson hat die Klasse noch nicht eingerichtet."}</p>` : `<div class="pt-form pt-join" data-pt-form="join"><input class="pt-in" id="ptJoin" placeholder="Dein Vorname" maxlength="30" autocomplete="off" aria-label="Dein Vorname"><button type="button" data-pt-submit class="pt-btn primary">Los geht's →</button></div>`}
    <div class="pt-foot" style="margin-top:18px"><label class="pt-btn small">Klassen-Datei laden<input type="file" data-pt-file accept=".json,application/json"></label><button type="button" class="pt-btn small" data-pt="lp">Lehrperson</button></div>
    <p class="pt-msg" id="ptMsg" role="status"></p></div>`;
}
function loginHTML(){
  const list = D.cls.students.slice().sort((a,b)=>a.n.localeCompare(b.n, "de"));
  return topHTML() + `<div class="pt-hello"><span class="glitch">${LIB.glitchSVG("wink")}</span>
    <div class="pt-bubble"><b class="gname">gLiTCh</b>${managed() ? "Wer bist du? Tippe auf deinen Namen und gib deinen PIN ein. Auf jedem iPad geht es dort weiter, wo du aufgehört hast." : "Wer bist du? Tippe auf deinen eigenen Namen, dann geht es dort weiter, wo du aufgehört hast."}</div></div>
    ${list.length ? `<div class="pt-names">${list.map(s=>`<button type="button" class="pt-name" data-pt-login="${s.id}" style="--c:${colorOf(s.id)}"><i aria-hidden="true">${esc(s.n.charAt(0).toUpperCase())}</i>${esc(s.n)}</button>`).join("")}</div>`
      : `<p class="pt-empty">In dieser Klasse gibt es noch keine Konten.</p>`}
    ${managed() ? `<p class="pt-empty" style="margin-top:14px">Dein Name fehlt? Frag deine Lehrperson. Sie legt dein Konto an und gibt dir deinen PIN.</p>` : `<div class="pt-form pt-join" data-pt-form="join" style="margin-top:18px"><input class="pt-in" id="ptJoin" placeholder="Nicht in der Liste? Vorname eintippen" maxlength="30" autocomplete="off" aria-label="Neuer Vorname"><button type="button" data-pt-submit class="pt-btn">+ Das bin ich</button></div>`}
    <div class="pt-foot"><label class="pt-btn small">Klassen-Datei laden<input type="file" data-pt-file accept=".json,application/json"></label><button type="button" class="pt-btn small" data-pt="lp">Lehrperson</button></div>
    <p class="pt-msg" id="ptMsg" role="status" style="text-align:center"></p>`;
}
function outfitOpenFor(x, T){
  if (x.sw && swCount(T) < x.sw) return false;
  if (x.lv != null && LIB.levelOf(T.stars) < x.lv) return false;
  if (x.badge && !T.badges.has(x.badge) && !(x.alt && T.badges.has(x.alt))) return false;
  if (x.fed && T.fed < x.fed) return false;
  if (x.deaths && T.deaths < x.deaths) return false;
  return true;
}
function dashHTML(){
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id), RR = window.GLAB_R;
  const L = LIB.LEVELS, li = LIB.levelOf(T.stars), nx = L[li+1];
  const pct = nx ? Math.round(100 * (T.stars - L[li].s) / (nx.s - L[li].s)) : 100;
  const unl = LIB.OUTFITS.filter(x=>outfitOpenFor(x, T)).length;
  const roomUnl = RR.ROOM.filter(x=>roomOpen(x, li)).length;
  const emoUnl = RR.EMOTES.filter(x=>emoteOpen(x, T)).length;
  const items = roomOf(p);
  const wallIds = wallOf(p, T);
  const dips = RR.WALL_SLOTS.map((sl,k)=>{ const b = LIB.BADGES.find(x=>x.id === wallIds[k]), pos = RR.diplomaPos(k);
    if (!b) return `<i class="pt-nail" style="left:${sl[0] + sl[2]/2}%; top:${sl[1] + 1}%" aria-hidden="true"></i>`;
    return `<button type="button" class="pt-dip on" data-pt-badge="${b.id}" style="left:${pos.left}%; top:${pos.top}%; width:${pos.w}%; rotate:${pos.r}deg" aria-label="Diplom ${esc(b.n)}">${b.art ? `<span class="pt-wall">${b.art}</span>` : `<svg viewBox="0 0 24 24" aria-hidden="true">${b.i}</svg>`}</button>`; }).join("");
  const team = D.cls.students.map(x=>x.n), who = team.length > 1 ? team.slice(0, -1).join(", ") + " und " + team[team.length-1] : s.n;
  const greet = MODE === "home" ? (team.length > 1 ? `Hoi ${who}! Ihr arbeitet als Team: Alle Sterne bekommt ihr gemeinsam.` : T.stars === 0 ? `Hoi ${s.n}! Willkommen in meinem Zimmer. Wähle unten ein Fach, dann sammeln wir Sterne.` : `Hoi ${s.n}! Schön, dass du da bist. Wohin geht's heute?`) : T.stars === 0 ? `Willkommen in meinem Zimmer, ${s.n}! Starte ein Modul, dann sammeln wir Sterne.` : `Hey ${s.n}! Schön, dass du da bist. Wohin geht's heute?`;
  return (MODE === "home" ? "" : topHTML(`<span class="pt-chip" style="--c:${colorOf(s.id)}"><i aria-hidden="true">${esc(s.n.charAt(0).toUpperCase())}</i>${esc(s.n)}</span><button type="button" class="pt-btn small primary" data-pt="hub">← Zurück zum Glitchlab</button>`))
  + `<div class="pt-card pt-dark pt-home">
      <div class="pt-home-main">
        <div class="pt-room" id="ptRoom">${RR.roomSVG(items)}${dips}
          <span class="pt-room-g glitch" role="img" aria-label="gLiTCh in seinem Zimmer"><span>${LIB.glitchSVG("happy", {outfit: p.outfit || {}})}</span></span>
          <div class="pt-room-say" id="ptSay"><b class="gname">gLiTCh</b>${window.GLAB_IDLE_SAY && Date.now() < window.GLAB_IDLE_SAY.until ? window.GLAB_IDLE_SAY.txt : esc(greet)}</div>
          <span class="pt-room-hint">Auf gLiTCh tippen und nach unten ziehen: Emote!</span></div>
        <div class="pt-lvl" style="margin-top:16px"><span class="pt-ring"${prestigeRing(T)}>${li+1}</span><div><span>${li < 100 ? `Level ${li+1} von 100` : prestigeSub(T, li)}</span><b>${esc(L[li].n)}</b><span>${nx ? `noch ${nx.s - T.stars} Sterne bis «${esc(nx.n)}»` : "Level 100 geschafft! Du bist die ultimative gLiTCh-Legende."}</span></div>
          <span class="pt-stars" title="Deine Sterne" aria-label="${T.stars} Sterne"><i aria-hidden="true">★</i>${T.stars}</span></div>
        <div class="pt-bar" aria-hidden="true"><i style="width:${Math.max(3, Math.min(100, pct))}%"></i></div>
      </div>
      <nav class="pt-rail" aria-label="Mein gLiTCh">
        ${railBtn("wardrobe", "👕", "Garderobe", `${unl} / ${LIB.OUTFITS.length}`, unl > (p.seen || 0), "#FF2BD6", 0)}
        ${railBtn("room", "🛋️", "Zimmer", `${roomUnl} / ${RR.ROOM.length}`, roomUnl > (p.roomSeen || 0), "#00E5FF", 1)}
        ${railBtn("emotes", "✨", "Emotes", `${emoUnl} / ${RR.EMOTES.length}`, false, "#FFC21A", 2)}
        ${railBtn("diplome", "📜", "Diplome", `${LIB.BADGES.filter(b=>T.badges.has(b.id)).length} / ${LIB.BADGES.length}`, false, "#3CFF7A", 3)}
        ${railBtn("bgs", "🖼️", "Hintergrund", `${bgList(T, true).filter(x=>x.open).length} / ${bgList(T, true).length}`, bgList(T, true).filter(x=>x.open).length > ((prog(D.me).seenB || []).length || 99), "#00E5FF", 4)}
        ${railBtn("lexikon", "📖", "Lexikon", "als PDF", false, "#8B5CFF", 4)}
        ${railBtn("levels", "🏆", "Alle Level", (li < 100 ? `${li+1} / 100` : `${li+1} ★`), false, "#B79CFF", 4)}
        ${railBtn("sound", window.GLAB_R.soundOn() ? "🔊" : "🔇", "Ton", window.GLAB_R.soundOn() ? "an" : "aus", false, "#FF7A00", 5)}
      </nav></div>`;
}
/* Im Glitchlab eingebettet: Höhe melden und Fenster (Garderobe usw.) gross machen */
let homeHooked = false;
function homeHooks(){
  if (homeHooked || !HB) return; homeHooked = true;
  document.documentElement.classList.add("hub-home");
  const size = ()=>{ try { HB.resize && HB.resize(Math.ceil(portalEl.getBoundingClientRect().height)); } catch(e){} };
  try { new ResizeObserver(size).observe(portalEl); } catch(e){ setInterval(size, 1000); }
  size();
  let open = false;
  const visible = el => !el.hidden && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
  const check = ()=>{ const now = [...document.querySelectorAll("body > .wd-ov, body > .pt-ov")].some(visible); if (now !== open){ open = now; try { HB.overlay && HB.overlay(now); } catch(e){} } };
  new MutationObserver(check).observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:["hidden","style","class"]});
  setInterval(check, 1500);
  /* Escape schliesst jedes offene Fenster */
  document.addEventListener("keydown", e=>{ if (e.key !== "Escape") return; const ov = [...document.querySelectorAll("body > .wd-ov, body > .pt-ov")].filter(visible).pop(); if (!ov) return;
    const x = ov.querySelector('[data-pt$="-close"], [data-gl-lex="close"]'); if (x) x.click(); else ov.remove(); setTimeout(check, 50); });
}
function railBtn(act, ic, n, sub, isNew, c, k){
  return `<button type="button" class="pt-rb" data-pt="${act}" style="--rc:${c}; --rd:${(k*.35).toFixed(2)}s"${act === "sound" ? ` aria-pressed="${window.GLAB_R.soundOn()}"` : ""}><span class="pt-rb-ic" aria-hidden="true">${ic}</span><span class="pt-rb-t"><b>${n}</b><small>${sub}</small></span>${isNew ? `<span class="pt-new">NEU</span>` : ""}</button>`;
}
/* ---- Diplome-Übersicht ---- */
/* Welche Diplome hängen an der Wand? Erreichte Diplome der Reihe nach, ohne die abgehängten, höchstens 10 */
const WALL_MAX = 10;
function wallOf(p, T){ const E = LIB.BADGES.filter(b=>T.badges.has(b.id)).map(b=>b.id); if (!Array.isArray(p.wall)) return E.slice(0, WALL_MAX);
  const list = p.wall.filter(id=>T.badges.has(id)), known = new Set(p.wallKnown || []);
  E.forEach(id=>{ if (list.length < WALL_MAX && !list.includes(id) && !known.has(id)) list.push(id); }); return list.slice(0, WALL_MAX); }
function diplomasHTML(){
  const s = student(D.me), T = totalsFor(s.id), RR = window.GLAB_R, hungIds = wallOf(prog(s.id), T);
  const card = (b, k)=>{ const on = T.badges.has(b.id); return `<div class="pt-dipc ${on ? "on" : "off"}" style="--bc:${DIPCOL[k % DIPCOL.length]}; --dl:-${(k*.73 % 6).toFixed(2)}s"><span class="pt-dipf">${b.art ? `<span class="pt-wall">${b.art}</span>` : (on ? `<svg viewBox="0 0 24 24" aria-hidden="true">${b.i}</svg>` : "")}</span><b>${esc(b.n)}</b><small>${esc(b.d)}</small><span class="st">${on ? "✓ erreicht" : "noch offen"}</span>${on ? `<button type="button" class="pt-wallbtn${hungIds.includes(b.id) ? " on" : ""}" data-pt-wall="${b.id}">${hungIds.includes(b.id) ? "🖼️ Hängt an der Wand · abhängen" : "An die Wand hängen"}</button>` : ""}</div>`; };
  const mods = MODULES.map(m=>{ const list = LIB.BADGES.map((b,k)=>[b,k]).filter(([b])=>(b.mod || "prompt") === m.id);
    const head = `<div class="pt-dipmod" style="--mc:${m.c}"><i>${svg(m.i)}</i><h3>${esc(m.n)}</h3><span>${list.length ? `${list.filter(([b])=>T.badges.has(b.id)).length} / ${list.length}` : "bald"}</span></div>`;
    return head + (list.length ? `<div class="pt-dips">${list.map(([b,k])=>card(b,k)).join("")}</div>` : `<div class="pt-dipsoon">Diplome für dieses Modul kommen, sobald es freigeschaltet ist.</div>`); }).join("");
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptDpT" style="max-width:860px">
    <div class="wd-head"><div><small>${esc(s.n)} · ${LIB.BADGES.filter(b=>T.badges.has(b.id)).length} von ${LIB.BADGES.length} Diplomen</small><h2 id="ptDpT">Diplome</h2><p>An der Wand in gLiTChs Chalet ist Platz für ${WALL_MAX} Diplome (${hungIds.length} von ${WALL_MAX} belegt). Wählt hier, welche hängen sollen. Ihr seht auch, in welchem Modul es welches Diplom gibt.</p></div>
      <button type="button" class="btn" data-pt="dp-close">Fertig</button></div>${mods}</div>`;
}
function openDiplomas(){
  closeOv("ptDp"); const ov = document.createElement("div"); ov.className = "wd-ov"; ov.id = "ptDp"; ov.innerHTML = diplomasHTML();
  document.body.appendChild(ov); document.body.style.overflow = "hidden"; ov.querySelector('[data-pt="dp-close"]').focus({preventScroll:true});
}
function modHTML(m, s, p){
  const art = `<div class="pt-art" style="--mc:${m.c}; --mc2:${m.c2}">${MOD_ART[m.id] || ""}</div>`;
  if (!m.live) return `<div class="pt-mod soon" style="--mc:${m.c}">${art}<span class="pt-soon">Bald</span><div class="pt-mod-b"><h3>${esc(m.n)}</h3><p>${esc(m.d)}</p></div></div>`;
  const nr = groupOf(s.id, m.id), mem = nr ? membersOf(nr, m.id) : [];
  if (!modOpen(m, s.id)) return `<div class="pt-mod locked" style="--mc:${m.c}">${art}<span class="pt-soon">🔒 Gesperrt</span><div class="pt-mod-b"><h3>${esc(m.n)}</h3>${m.y ? `<span class="pt-yr">${esc(m.y)}</span>` : ""}<p>${esc(m.d)}</p>
    <p class="pt-lockmsg">🔒 ${esc(m.req.txt)}</p></div></div>`;
  const st = (p.mods[m.id] || {}).stars || 0;
  return `<div class="pt-mod live" style="--mc:${m.c}">${art}<div class="pt-mod-b"><h3>${esc(m.n)}</h3>${m.y ? `<span class="pt-yr">${esc(m.y)}</span>` : ""}<p>${esc(m.d)}</p>
    <div class="meta"><span class="pt-tag">★ ${st}</span></div>
    <button type="button" class="pt-btn primary go" data-pt-modgo="${m.id}">Modul starten →</button></div></div>`;
}
const svg = inner => `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
const roomOf = p => (p.room && Object.keys(p.room).length) ? p.room : {links:"bett", teppich:"teppichrot"};

/* Animierte Modul-Bilder (120 × 60) */
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
    ${MINI_G(100, 40, 1)}</svg>`,
  eidgenossen: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <path d="M0 50 L22 22 L34 34 L52 12 L74 40 L88 26 L120 50 Z" fill="#8FA3BF"/><path d="M46 20 L52 12 L58 20 L55 18 L52 21 L49 18 Z" fill="#fff"/><path d="M84 31 L88 26 L92 31 L88 30 Z" fill="#fff"/>
    <rect x="0" y="50" width="120" height="10" fill="#3CC48A"/>
    <rect x="26" y="14" width="2" height="36" fill="#8B5A2B"/><g class="ma-bob"><rect x="28" y="14" width="18" height="16" fill="#D52B1E"/><rect x="35" y="17" width="4" height="10" fill="#fff"/><rect x="32" y="20" width="10" height="4" fill="#fff"/></g>
    <g class="ma-drop d2"><rect x="62" y="38" width="24" height="10" fill="#F4E7C8"/><rect x="60" y="37" width="3" height="12" fill="#D9C28E"/><rect x="85" y="37" width="3" height="12" fill="#D9C28E"/><rect x="66" y="41" width="14" height="1" fill="#8B5A2B"/><rect x="66" y="44" width="10" height="1" fill="#8B5A2B"/><text x="74" y="36" font-size="6" font-weight="700" font-family="monospace" text-anchor="middle" fill="#fff">1291</text></g>
    ${MINI_G(96, 36, 1)}</svg>`,
  helvetik: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="0" y="50" width="120" height="10" fill="#6B4A2B"/>
    <rect x="36" y="16" width="3" height="34" fill="#8B5A2B"/><rect x="30" y="8" width="15" height="10" fill="#1F9D68"/><rect x="33" y="5" width="9" height="4" fill="#3CC48A"/><rect x="33" y="22" width="9" height="2" fill="#D52B1E"/><rect x="33" y="26" width="9" height="2" fill="#FFC21A"/>
    <rect x="58" y="12" width="2" height="38" fill="#B0BEC5"/><g class="ma-bob"><rect x="60" y="12" width="30" height="6" fill="#1F9D68"/><rect x="60" y="18" width="30" height="6" fill="#D52B1E"/><rect x="60" y="24" width="30" height="6" fill="#FFC21A"/></g>
    <g class="ma-twinkle"><rect x="100" y="10" width="2" height="2" fill="#FFE680"/><rect x="108" y="22" width="2" height="2" fill="#fff"/><rect x="14" y="20" width="2" height="2" fill="#FFE680"/></g>
    ${MINI_G(94, 36, 1)}</svg>`,
  mediation: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="52" y="14" width="42" height="40" fill="#F1ECE0"/><rect x="56" y="18" width="34" height="4" fill="#10265A"/><rect x="56" y="26" width="30" height="2" fill="#9AA3B5"/><rect x="56" y="30" width="26" height="2" fill="#9AA3B5"/><rect x="56" y="46" width="20" height="2" fill="#9AA3B5"/>
    <g class="ma-stamp"><rect x="62" y="33" width="22" height="10" fill="none" stroke="#B8322A" stroke-width="2"/><text x="73" y="40.5" font-size="6" font-weight="700" font-family="monospace" text-anchor="middle" fill="#B8322A">1803</text></g>
    <g class="ma-bob"><path d="M6 30 Q26 12 46 30 Q26 26 6 30 Z" fill="#14141C" shape-rendering="geometricPrecision"/><rect x="24" y="18" width="4" height="4" fill="#2E6BE6"/><rect x="25" y="19" width="2" height="2" fill="#fff"/><rect x="25" y="20" width="2" height="1" fill="#D52B1E"/></g>
    ${MINI_G(16, 36, 1)}<text x="104" y="22" font-size="8" font-weight="700" font-family="monospace" text-anchor="middle" fill="#FFE680" class="ma-label">19</text></svg>`,
  restauration: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="34" y="10" width="40" height="40" fill="#D52B1E"/><rect x="50" y="17" width="8" height="26" fill="#fff"/><rect x="41" y="26" width="26" height="8" fill="#fff"/>
    <g class="ma-bob"><path d="M78 20 Q86 12 94 18 L102 14 L98 22 Q92 30 82 26 L76 28 Z" fill="#FFFFFF" shape-rendering="geometricPrecision"/><rect x="92" y="17" width="2" height="2" fill="#14062E"/><path d="M100 20 L106 22 L100 24 Z" fill="#3CC48A" shape-rendering="geometricPrecision"/></g>
    <g class="ma-pop p1"><rect x="8" y="10" width="20" height="10" fill="#FFC21A"/><text x="18" y="17.5" font-size="6" font-weight="700" font-family="monospace" text-anchor="middle" fill="#14062E">1815</text></g>
    <g class="ma-pop p2"><rect x="80" y="38" width="30" height="10" fill="#fff"/><text x="95" y="45.5" font-size="5.5" font-weight="700" font-family="monospace" text-anchor="middle" fill="#14062E">NEUTRAL</text></g>
    ${MINI_G(10, 36, 1)}</svg>`,
  nachbarn: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <g class="ma-pop p1"><rect x="14" y="8" width="20" height="4" fill="#111"/><rect x="14" y="12" width="20" height="4" fill="#DD0000"/><rect x="14" y="16" width="20" height="4" fill="#FFCE00"/></g>
    <g class="ma-pop p2"><rect x="86" y="8" width="7" height="12" fill="#0055A4"/><rect x="93" y="8" width="7" height="12" fill="#fff"/><rect x="100" y="8" width="7" height="12" fill="#EF4135"/></g>
    <g class="ma-pop p3"><rect x="14" y="40" width="7" height="12" fill="#009246"/><rect x="21" y="40" width="7" height="12" fill="#fff"/><rect x="28" y="40" width="7" height="12" fill="#CE2B37"/></g>
    <g class="ma-pop p1" style="animation-delay:2.4s"><rect x="86" y="40" width="21" height="4" fill="#ED2939"/><rect x="86" y="44" width="21" height="4" fill="#fff"/><rect x="86" y="48" width="21" height="4" fill="#ED2939"/></g>
    <g class="ma-bob"><rect x="50" y="18" width="20" height="20" fill="#D52B1E"/><rect x="58" y="21" width="4" height="14" fill="#fff"/><rect x="53" y="26" width="14" height="4" fill="#fff"/></g>
    <g class="ma-twinkle"><rect x="40" y="28" width="6" height="2" fill="#fff" opacity=".6"/><rect x="74" y="28" width="6" height="2" fill="#fff" opacity=".6"/></g>
    ${MINI_G(52, 42, .9)}</svg>`,
  erfindungen: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <g class="ma-blade"><rect x="30" y="20" width="26" height="5" fill="#D9DEE6"/><rect x="52" y="20" width="4" height="3" fill="#fff"/></g>
    <rect x="22" y="24" width="34" height="10" rx="3" fill="#D52B1E"/><rect x="36" y="26" width="2" height="6" fill="#fff"/><rect x="34" y="28" width="6" height="2" fill="#fff"/>
    <g class="ma-twinkle"><rect x="78" y="10" width="12" height="12" fill="#FFE680"/><rect x="80" y="22" width="8" height="4" fill="#B0BEC5"/><rect x="74" y="6" width="2" height="2" fill="#FFE680"/><rect x="92" y="6" width="2" height="2" fill="#FFE680"/><rect x="72" y="14" width="2" height="2" fill="#FFE680"/><rect x="94" y="14" width="2" height="2" fill="#FFE680"/></g>
    <g class="ma-drop d2"><rect x="70" y="38" width="22" height="12" fill="#6D3B1F"/><rect x="70" y="38" width="7" height="6" fill="#8B5A2B"/><rect x="77" y="44" width="8" height="6" fill="#8B5A2B"/><rect x="85" y="38" width="7" height="6" fill="#8B5A2B"/></g>
    ${MINI_G(98, 34, 1)}</svg>`,
  politik: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="12" y="30" width="34" height="22" fill="#E6E2D6"/><rect x="16" y="34" width="4" height="18" fill="#C9C2AE"/><rect x="27" y="34" width="4" height="18" fill="#C9C2AE"/><rect x="38" y="34" width="4" height="18" fill="#C9C2AE"/>
    <rect x="20" y="20" width="18" height="10" fill="#3CA08A"/><rect x="26" y="14" width="6" height="6" fill="#3CA08A"/><rect x="28" y="10" width="2" height="4" fill="#D52B1E"/>
    <rect x="62" y="34" width="28" height="18" fill="#8B5CFF"/><rect x="70" y="32" width="12" height="3" fill="#2A1660"/>
    <g class="ma-drop d1"><rect x="70" y="16" width="12" height="8" fill="#fff"/><rect x="72" y="18" width="5" height="2" fill="#B0BEC5"/></g>
    <g class="ma-drop d3"><rect x="70" y="16" width="12" height="8" fill="#FFF6C9"/><rect x="74" y="19" width="4" height="2" fill="#1F9D68"/></g>
    <g class="ma-label"><text x="76" y="47" font-size="6" font-weight="700" font-family="monospace" text-anchor="middle" fill="#fff">JA?</text></g>
    ${MINI_G(98, 38, 1)}</svg>`,
  ebenen: `<svg viewBox="0 0 120 60" shape-rendering="crispEdges" aria-hidden="true">
    <g class="ma-bob"><rect x="22" y="6" width="44" height="12" fill="#D52B1E"/><rect x="56" y="8" width="4" height="8" fill="#fff"/><rect x="54" y="10" width="8" height="4" fill="#fff"/><text x="26" y="14.5" font-size="6" font-weight="700" font-family="monospace" fill="#fff">BUND</text></g>
    <g class="ma-bob" style="animation-delay:.3s"><rect x="18" y="22" width="52" height="12" fill="#2E6BE6"/><rect x="58" y="24" width="8" height="8" fill="#FFC21A"/><text x="22" y="30.5" font-size="6" font-weight="700" font-family="monospace" fill="#fff">KANTON</text></g>
    <g class="ma-bob" style="animation-delay:.6s"><rect x="14" y="38" width="60" height="12" fill="#1F9D68"/><rect x="61" y="41" width="8" height="7" fill="#F4E7C8"/><rect x="60" y="39" width="10" height="2" fill="#8B5A2B"/><text x="18" y="46.5" font-size="6" font-weight="700" font-family="monospace" fill="#fff">GEMEINDE</text></g>
    ${MINI_G(88, 30, .9)}</svg>`
};

/* ---- Übersicht für Garderobe und Zimmer ---- */
window.GLAB_VF = window.GLAB_VF || {wd:"mine", rm:"mine", bg:"all"};
const NEWSET = {wd:new Set(), rm:new Set()};
function markNew(kind){
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id), li = LIB.levelOf(T.stars);
  const ids = kind === "wd"
    ? LIB.OUTFITS.filter(x=>outfitOpenFor(x, T)).map(x=>x.id).concat((window.GLAB_SKINS || []).filter(x=>x.id !== "gold" && skinOpen(x, T)).map(x=>"sk:" + x.id))
    : window.GLAB_R.ROOM.filter(x=>roomOpen(x, li)).map(x=>x.id).concat(CU.bgs.filter(x=>bgOpen(x, T)).map(x=>"bg:" + x.id));
  const key = kind === "wd" ? "seenW" : "seenR", had = Array.isArray(p[key]) ? new Set(p[key]) : null;
  NEWSET[kind] = had ? new Set(ids.filter(i=>!had.has(i))) : new Set();
  p[key] = ids;
}
function vfBar(kind, nOpen, nAll){
  const f = window.GLAB_VF[kind], b = (v, t) => `<button type="button" class="vf-b${f === v ? " on" : ""}" data-pt-vf="${kind}:${v}" aria-pressed="${f === v}">${t}</button>`;
  return `<div class="vf-bar" role="group" aria-label="Was anzeigen?">${b("mine", `✓ Meine Sachen <i>${nOpen}</i>`)}${b("todo", `🔒 Noch zu holen <i>${nAll - nOpen}</i>`)}${b("all", `Alle <i>${nAll}</i>`)}</div>`;
}
const vfShow = (kind, open, on) => { const f = window.GLAB_VF[kind]; return on || f === "all" || (f === "mine" ? open : !open); };
const vfSort = (its, isOpen) => its.slice().sort((a, b) => (isOpen(b) - isOpen(a)) || ((a.lv == null ? 9999 : a.lv) - (b.lv == null ? 9999 : b.lv)));
const vfEmpty = kind => `<p class="vf-empty">${window.GLAB_VF[kind] === "mine" ? "Hier ist noch nichts frei. Unter «🔒 Noch zu holen» siehst du, wie du etwas bekommst." : "Hier hast du schon alles! 🎉"}</p>`;
const vfNew = on => on ? '<span class="vf-new">NEU</span>' : "";
function nextGift(kind, T){
  const li = LIB.levelOf(T.stars);
  const L = kind === "wd"
    ? LIB.OUTFITS.filter(x=>x.lv != null && !x.badge && !x.sw && x.lv > li).map(x=>({n:x.n, lv:x.lv})).concat((window.GLAB_SKINS || []).filter(x=>x.lv != null && !x.badge && x.lv > li).map(x=>({n:"Skin «" + x.n + "»", lv:x.lv})))
    : window.GLAB_R.ROOM.filter(x=>!x.badge && !x.sw && x.lv > li && x.lv < 9999).map(x=>({n:x.n, lv:x.lv}));
  if (!L.length){
    if (kind !== "rm") return "";
    const tip = window.GLAB_R.ROOM.filter(x=>x.badge && !roomOpen(x, li) && x.reqTxt).sort((a, b)=>(b.id.startsWith("hr_") - a.id.startsWith("hr_"))).slice(0, 2);
    return tip.length ? `<div class="vf-next"><span aria-hidden="true">🎁</span><span><b>Als Nächstes zum Beispiel:</b> ${tip.map(x=>esc(x.n)).join(", ")}<small>${tip.map(x=>esc(x.reqTxt)).join(" · ")}</small></span></div>` : "";
  }
  const lv = Math.min(...L.map(x=>x.lv)), g = L.filter(x=>x.lv === lv), need = LIB.LEVELS[lv] ? Math.max(0, LIB.LEVELS[lv].s - T.stars) : 0;
  return `<div class="vf-next"><span aria-hidden="true">🎁</span><span><b>Nächste Belohnung:</b> ${g.map(x=>esc(x.n)).join(", ")}<small>ab Level ${lv + 1}${need ? ` · noch ${need} ★` : ""}</small></span></div>`;
}
document.addEventListener("click", e=>{ const b = e.target.closest && e.target.closest("[data-pt-vf]"); if (!b) return; e.preventDefault();
  const [kind, v] = b.dataset.ptVf.split(":"); window.GLAB_VF[kind] = v;
  const ov = document.getElementById(kind === "wd" ? "ptWd" : kind === "bg" ? "ptBg" : "ptRm"); if (ov){ const sc = ov.scrollTop; ov.innerHTML = kind === "wd" ? wardrobeHTML() : kind === "bg" ? bgsHTML() : roomHTML(); ov.scrollTop = sc; } });
(function(){ if (document.getElementById("vfCss")) return; const st = document.createElement("style"); st.id = "vfCss";
  st.textContent = ".vf-bar{position:sticky;top:-20px;z-index:3;display:flex;gap:6px;flex-wrap:wrap;margin:10px -20px 8px;padding:10px 20px;background:#14062E;border-bottom:1px solid rgba(139,92,255,.35)}"
  + ".vf-b{all:unset;cursor:pointer;box-sizing:border-box;padding:7px 12px;border-radius:999px;border:2px solid #4A23A0;background:#2A0F66;font:800 .85rem/1.1 system-ui,sans-serif;color:#fff}"
  + ".vf-b i{font-style:normal;opacity:.75;margin-left:4px}.vf-b.on{background:#FFC21A;border-color:#FFC21A;color:#14062E}.vf-b:focus-visible{outline:3px solid #00E5FF;outline-offset:2px}"
  + ".vf-next{display:flex;gap:10px;align-items:center;margin:0 0 12px;padding:10px 12px;border-radius:14px;background:rgba(255,194,26,.12);border:1px dashed rgba(255,194,26,.6);font-size:.92rem}"
  + ".vf-next > span:first-child{font-size:1.4rem}.vf-next small{display:block;opacity:.8;font-size:.8rem;margin-top:2px}"
  + ".vf-new{position:absolute;top:6px;left:6px;padding:1px 6px;border-radius:999px;background:#FF2BD6;color:#fff;font:900 .62rem/1.4 system-ui,sans-serif;letter-spacing:.04em}"
  + ".vf-empty{margin:0;padding:6px 14px 16px;opacity:.8;font-size:.9rem}.wd-sk{position:relative}.wd-sk .vf-new{top:2px;left:2px}"
  + ".pt-stars{font-family:Silkscreen,ui-monospace,monospace!important;font-size:1.15rem!important;color:#FFE08A!important;background:rgba(255,204,51,.2);border:2px solid rgba(255,204,51,.6);border-radius:999px;padding:6px 14px;gap:8px!important;font-variant-numeric:tabular-nums;box-shadow:0 0 14px rgba(255,204,51,.25)}.pt-stars i{font-style:normal;color:#FFCC33}"
  + ".acc-emo{font-size:26px;line-height:1;display:grid;place-items:center;width:100%;height:100%}";
  (document.head || document.documentElement).appendChild(st); })();
/* ---- Zimmer einrichten ---- */
const isSiteBg = id => /^bg_(l|p)\d/.test(String(id));
function bgList(T, site){
  if (site) return [{id:"std", n:"Standard", ic:"🌌", open:true, req:"", grp:-1}].concat(CU.bgs.filter(x=>isSiteBg(x.id)).map(x=>({id:x.id, n:x.n, ic:x.ic || "🖼️", open:bgOpen(x, T), req:x.reqTxt || "", lv:x.lv, wand:x.wand, svg:x.svg, grp: String(x.id).startsWith("bg_p") ? 2 : 0}))).map((x,i)=>Object.assign({i}, x)).sort((a,b)=>(a.grp - b.grp) || ((a.lv || 0) - (b.lv || 0)) || (a.i - b.i));
  return [{id:"pixel", n:"Pixel-Zimmer", ic:"🟪", open:true, req:""}, {id:"chalet", n:"Schweizer Chalet", ic:"🏔️", open:T.badges.has(CHALET_BADGE), req:"nach dem ersten NMG-Modul (Alte Eidgenossenschaft)"}]
    .concat(CU.bgs.filter(x=>!isSiteBg(x.id)).map(x=>({id:x.id, n:x.n, ic:x.ic || "🖼️", open:bgOpen(x, T), req:x.reqTxt || "", lv:x.lv, wand:x.wand, svg:x.svg, grp: x.lv != null ? 0 : String(x.id).startsWith("bg_p") ? 2 : 1})))
    .map((x,i)=>Object.assign({i}, x)).sort((a,b)=>((a.grp == null ? -1 : a.grp) - (b.grp == null ? -1 : b.grp)) || ((a.lv || 0) - (b.lv || 0)) || (a.i - b.i));
}
function bgHTML(T){
  const cur = window.GLAB_ROOMBG || "pixel", L = bgList(T), NW = NEWSET.rm, c = L.find(x=>x.id === cur) || L[0];
  const show = vfSort(L.filter(x=>vfShow("rm", x.open, cur === x.id)), x=>x.open);
  return window.GLAB_ACC("rm", "bg", "Hintergrund", {cur: esc(c.n), prev: `<span class="acc-emo">${c.ic}</span>`, n: L.filter(x=>x.open).length, t: L.length, isNew: L.some(x=>NW.has("bg:" + x.id))}, true)
    + (show.length ? `<div class="wd-grid">${show.map(x=>`<button type="button" class="wd-item${cur === x.id ? " on" : ""}${x.open ? "" : " locked"}" data-pt="bg-${x.id}" ${x.open ? "" : 'aria-disabled="true"'} aria-pressed="${cur === x.id}">${vfNew(NW.has("bg:" + x.id))}<span class="pt-emo-ic" aria-hidden="true">${x.ic}</span><b>${esc(x.n)}</b><small>${x.open ? (cur === x.id ? "aktiv" : "antippen") : esc(x.req)}</small>${x.open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`).join("")}</div>` : vfEmpty("rm")) + `</details>`;
}
function bgThumb(x){
  const w = x.id === "pixel" || x.id === "std" ? ["#241052","#4B2696"] : x.id === "chalet" ? ["#6B3F1F","#9C6534"] : (x.wand || ["#241052","#4B2696"]), u = "bgt_" + String(x.id).replace(/[^\w-]/g, "");
  return `<svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${u}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${w[0]}"/><stop offset="1" stop-color="${w[1] || w[0]}"/></linearGradient></defs><rect width="160" height="64" fill="url(#${u})"/>${x.svg || (x.id === "chalet" ? '<path d="M0 40h160M0 52h160M40 28v36M120 28v36" stroke="#4A2A12" stroke-width="2"/>' : "")}</svg>`;
}
function bgsHTML(){
  const s = student(D.me), T = totalsFor(s.id), li = LIB.levelOf(T.stars), L = bgList(T, true), cur = window.GLAB_SITEBG || "std", NW = NEWSET.bg || new Set();
  const show = vfSort(L.filter(x=>vfShow("bg", x.open, cur === x.id)), x=>x.open), nOpen = L.filter(x=>x.open).length;
  const nx = L.filter(x=>!x.open && x.lv != null && x.lv > li).sort((a,b)=>a.lv - b.lv)[0];
  const need = nx && LIB.LEVELS[nx.lv] ? Math.max(0, LIB.LEVELS[nx.lv].s - T.stars) : 0;
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptBgT">
    <div class="wd-head"><div><small>${esc(s.n)} · Level ${li+1}</small><h2 id="ptBgT">Hintergrund</h2><p>Wähle den Hintergrund für die ganze Seite. Neue gibt es mit den Leveln und mit Prestige. Den Hintergrund von gLiTChs Zimmer wählst du unter «Zimmer».</p></div>
      <button type="button" class="btn" data-pt="bgs-close">Fertig</button></div>
    ${vfBar("bg", nOpen, L.length)}${nx ? `<div class="vf-next"><span aria-hidden="true">🎁</span><span><b>Nächster Hintergrund:</b> ${nx.ic} ${esc(nx.n)}<small>ab Level ${nx.lv + 1}${need ? ` · noch ${need} ★` : ""}</small></span></div>` : ""}
    ${show.length ? `<div class="bg-grid">${show.map(x=>`<button type="button" class="bg-card${cur === x.id ? " on" : ""}${x.open ? "" : " locked"}" data-pt="sbg-${x.id}" ${x.open ? "" : 'aria-disabled="true"'} aria-pressed="${cur === x.id}">${vfNew(NW.has("bg:" + x.id))}<span class="bg-th">${bgThumb(x)}</span><b>${x.ic} ${esc(x.n)}</b><small>${x.open ? (cur === x.id ? "aktiv" : "antippen") : esc(x.req)}</small>${x.open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`).join("")}</div>` : vfEmpty("bg")}
  </div>`;
}
function pickSiteBg(id){
  const T = totalsFor(D.me), x = bgList(T, true).find(b=>b.id === id); if (!x) return;
  if (!x.open){ const el = document.querySelector(`[data-pt="sbg-${id}"]`); if (el) el.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  window.GLAB_SITEBG = id === "std" ? "" : id; saveD();
  const ob = document.getElementById("ptBg"); if (ob){ const sc = ob.scrollTop; ob.innerHTML = bgsHTML(); ob.scrollTop = sc; }
}
function openBgs(){
  closeOv("ptBg"); const T = totalsFor(D.me), p = prog(D.me), ids = bgList(T, true).filter(x=>x.open).map(x=>"bg:" + x.id);
  const had = Array.isArray(p.seenB) ? new Set(p.seenB) : null; NEWSET.bg = had ? new Set(ids.filter(i=>!had.has(i))) : new Set(); p.seenB = ids; saveD();
  const ov = document.createElement("div"); ov.className = "wd-ov"; ov.id = "ptBg"; ov.innerHTML = bgsHTML();
  document.body.appendChild(ov); document.body.style.overflow = "hidden"; ov.querySelector('[data-pt="bgs-close"]').focus({preventScroll:true});
}
(function(){ if (document.getElementById("bgCss")) return; const st = document.createElement("style"); st.id = "bgCss";
  st.textContent = ".bg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:6px}"
  + ".bg-card{all:unset;box-sizing:border-box;cursor:pointer;position:relative;display:grid;gap:4px;padding:8px;border-radius:14px;background:#2A0F66;border:2px solid #4A23A0;text-align:center}"
  + ".bg-card.on{border-color:#FFC21A;box-shadow:0 0 0 2px rgba(255,194,26,.35)}.bg-card:focus-visible{outline:3px solid #00E5FF;outline-offset:2px}"
  + ".bg-th{display:block;aspect-ratio:160/64;border-radius:9px;overflow:hidden;background:#14062E}.bg-th svg{width:100%;height:100%;display:block}"
  + ".bg-card b{font:800 .86rem/1.2 system-ui,sans-serif}.bg-card small{font-size:.74rem;opacity:.8}.bg-card.locked .bg-th{filter:grayscale(.7) brightness(.55)}.bg-card.locked b{opacity:.7}";
  (document.head || document.documentElement).appendChild(st); })();
function pickBg(id){
  const T = totalsFor(D.me);
  if (id === "chalet" && !T.badges.has(CHALET_BADGE)){ const el = document.querySelector('[data-pt="bg-chalet"]'); if (el) el.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  const cb = CU.bgs.find(x=>x.id === id);
  if (cb && !bgOpen(cb, T)){ const el = document.querySelector(`[data-pt="bg-${id}"]`); if (el) el.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  if (id !== "pixel" && id !== "chalet" && !cb) return;
  window.GLAB_ROOMBG = id; saveD();
  const ov = document.getElementById("ptRm"); if (ov){ const sc = ov.scrollTop; ov.innerHTML = roomHTML(); ov.scrollTop = sc; }
  const ob = document.getElementById("ptBg"); if (ob){ const sc = ob.scrollTop; ob.innerHTML = bgsHTML(); ob.scrollTop = sc; render(); }
}
function roomHTML(){
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id), li = LIB.levelOf(T.stars), RR = window.GLAB_R, items = roomOf(p), NW = NEWSET.rm;
  const nOpen = RR.ROOM.filter(x=>roomOpen(x, li)).length, nAll = RR.ROOM.length;
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptRmT">
    <div class="wd-head"><div><small>${esc(s.n)} · Level ${li+1}</small><h2 id="ptRmT">Zimmer einrichten</h2><p>Pro Platz einen Gegenstand antippen, nochmals tippen räumt ihn weg. Neues gibt es mit höheren Leveln und für Diplome aus den Modulen. Unter «Hintergrund» rechts wählst du den Hintergrund der ganzen Seite.</p></div>
      <button type="button" class="btn" data-pt="rm-close">Fertig</button></div>
    <div class="pt-room" style="margin-top:14px">${RR.roomSVG(items)}<span class="pt-room-g glitch"><span>${LIB.glitchSVG("cool", {outfit: p.outfit || {}})}</span></span></div>
    ${vfBar("rm", nOpen, nAll)}${nextGift("rm", T)}
    ${bgHTML(T)}
    ${RR.ROOM_SLOTS.map(sl=>{
      const its = RR.ROOM.filter(x=>x.slot === sl.id), cur = its.find(x=>items[sl.id] === x.id), isOpen = x=>roomOpen(x, li);
      const show = vfSort(its.filter(x=>vfShow("rm", isOpen(x), items[sl.id] === x.id)), isOpen);
      return window.GLAB_ACC("rm", sl.id, sl.n, {cur: cur ? esc(cur.n) : "", prev: cur ? RR.thumb(cur) : "", n: its.filter(isOpen).length, t: its.length, isNew: its.some(x=>NW.has(x.id))}, false) + (show.length ? `<div class="wd-grid">${show.map(x=>{
      const open = isOpen(x), on = items[sl.id] === x.id;
      return `<button type="button" class="wd-item${on ? " on" : ""}${open ? "" : " locked"}" data-pt-room="${x.id}" ${open ? "" : 'aria-disabled="true"'} aria-pressed="${on}">${vfNew(NW.has(x.id))}
        <span class="pt-thumb wd-mini">${RR.thumb(x)}</span><b>${esc(x.n)}</b><small>${open ? (on ? "im Zimmer" : "antippen") : (x.reqTxt ? esc(x.reqTxt) : `ab Level ${x.lv+1}`)}</small>${open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`;
    }).join("")}</div>` : vfEmpty("rm")) + `</details>`; }).join("")}</div>`;
}
function openRoom(){
  closeOv("ptRm"); markNew("rm"); const p = prog(D.me), li = LIB.levelOf(totalsFor(D.me).stars);
  p.roomSeen = window.GLAB_R.ROOM.filter(x=>roomOpen(x, li)).length; saveD();
  const ov = document.createElement("div"); ov.className = "wd-ov"; ov.id = "ptRm"; ov.innerHTML = roomHTML();
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  ov.querySelector('[data-pt="rm-close"]').focus({preventScroll:true});
}
function pickRoom(id){
  const x = window.GLAB_R.ROOM.find(o=>o.id === id); if (!x) return;
  const p = prog(D.me), li = LIB.levelOf(totalsFor(D.me).stars), ov = document.getElementById("ptRm");
  if (!roomOpen(x, li)){ const b = ov.querySelector(`[data-pt-room="${id}"]`); if (b) b.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  const r = Object.assign({}, roomOf(p)); r[x.slot] = r[x.slot] === x.id ? null : x.id; p.room = r; p.prefsAt = now(); saveD();
  const sc = ov.scrollTop; ov.innerHTML = roomHTML(); ov.scrollTop = sc;
}

/* ---- Emotes ---- */
function emotesHTML(){
  const s = student(D.me), p = prog(s.id), li = LIB.levelOf(totalsFor(s.id).stars), RR = window.GLAB_R;
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptEmT">
    <div class="wd-head"><div><small>${esc(s.n)} · Level ${li+1}</small><h2 id="ptEmT">Emotes</h2><p>«Hopp Schwiiz!» und «W» hast du von Anfang an. Jedes weitere Emote bekommst du, wenn du das passende Modul schaffst. Wähle eines aus. Dann auf gLiTCh tippen und nach unten ziehen oder wischen, auch in den Modulen.</p></div>
      <button type="button" class="btn" data-pt="em-close">Fertig</button></div>
    <div class="wd-stage"><span class="glitch wd-g pt-room-g" style="position:static; width:150px">${LIB.glitchSVG("happy", {outfit: p.outfit || {}})}</span></div>
    <div class="wd-grid">${RR.EMOTES.map(x=>{ const open = emoteOpen(x, totalsFor(s.id)), on = (p.emote || "w") === x.id;
      return `<button type="button" class="wd-item${on ? " on" : ""}${open ? "" : " locked"}" data-pt-emote="${x.id}" ${open ? "" : 'aria-disabled="true"'} aria-pressed="${on}">
        <span class="pt-emo-ic" aria-hidden="true">${x.ic}</span><b>${esc(x.n)}</b><small>${open ? (on ? "aktiv · nochmals tippen zum Vorführen" : esc(x.d)) : esc(emoteReq(x))}</small>${open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`; }).join("")}</div></div>`;
}
function openEmotes(){
  closeOv("ptEm"); const ov = document.createElement("div"); ov.className = "wd-ov"; ov.id = "ptEm"; ov.innerHTML = emotesHTML();
  document.body.appendChild(ov); document.body.style.overflow = "hidden"; ov.querySelector('[data-pt="em-close"]').focus({preventScroll:true});
}
function pickEmote(id){
  const x = window.GLAB_R.EMOTES.find(o=>o.id === id); if (!x) return;
  const p = prog(D.me), li = LIB.levelOf(totalsFor(D.me).stars), ov = document.getElementById("ptEm");
  if (!emoteOpen(x, totalsFor(D.me))){ const b = ov.querySelector(`[data-pt-emote="${id}"]`); if (b) b.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  const again = p.emote === id; p.emote = id; p.prefsAt = now(); saveD();
  ov.innerHTML = emotesHTML();
  const g = ov.querySelector(".pt-room-g"); setTimeout(()=>window.GLAB_R.playEmote(g, id), again ? 0 : 150);
}

/* ---- Prestige (ab Level 100, Daten aus js/prestige.js im Glitchlab) ---- */
const prestigeP = () => window.GLAB_P || (()=>{ try { return window.parent !== window && window.parent.GL_PRESTIGE || null; } catch(e){ return null; } })();
function prestigeOfT(T){ const P = prestigeP(); return P ? P.of(T.stars, LIB.LEVELS[99].s) : 0; }
function prestigeSub(T, li){
  const P = prestigeP(); if (!P) return `Level ${li+1} · über 100!`;
  const base = LIB.LEVELS[99].s, p = P.of(T.stars, base);
  if (!p) return `Level ${li+1} · noch ${base + P.STEP - T.stars} ★ bis Prestige I`;
  return `Prestige-Rang ${P.roman(Math.min(p, 10))}${p > 10 ? " ★" + (p - 9) : ""} · Stufe ${((li - 99) % 10) + 1} von 10`;
}
function prestigeRing(T){ const P = prestigeP(), p = prestigeOfT(T); if (!P || !p) return ""; const c = P.RANKS[Math.min(p, 10) - 1].c; return ` style="border-color:${c};box-shadow:0 0 14px ${c}, inset 0 0 8px ${c}"`; }
function prestigeRows(T){
  const P = prestigeP(); if (!P) return "";
  const base = LIB.LEVELS[99].s, have = P.of(T.stars, base);
  return `<li class="pt-lv-row pt-lv-ph"><span class="pt-lv-n">🏆</span><div><b>Prestige</b><small>Ab Level 100 gibt es alle ${P.STEP} Sterne einen neuen Rang. Die Sterne bleiben alle erhalten.</small></div><span aria-hidden="true"></span></li>`
    + P.RANKS.map((R, i)=>{ const k = i + 1, got = have >= k, cls = got ? "done" : k === have + 1 ? "cur" : "next";
      const gifts = [`<span class="pt-gift"><i>${R.ic}</i>Hintergrund «${esc(R.bg.n)}»</span>`, `<span class="pt-gift"><i>${R.dip.emoji}</i>Diplom</span>`,
        `<span class="pt-gift"><i>${R.emote.ic}</i>Emote «${esc(R.emote.n)}»</span>`, `<span class="pt-gift"><i class="glitch">${LIB.glitchSVG("normal", {outfit:{skin:"ps_" + k}})}</i>Skin «${esc(R.skin.n)}»</span>`];
      return `<li class="pt-lv-row pt-lv-pp ${cls}" style="--pc:${R.c}"><span class="pt-lv-n">${P.roman(k)}</span><div><b>${esc(P.label(k))}</b><small>ab ${base + k * P.STEP} ★</small><div class="pt-gifts">${gifts.join("")}</div></div><span aria-hidden="true">${got ? "✓" : cls === "cur" ? "★" : "🔒"}</span></li>`; }).join("")
    + `<li class="pt-lv-row pt-lv-ph"><span class="pt-lv-n">X+</span><div><b>Und danach?</b><small>Alle weiteren ${P.STEP} Sterne gibt es einen Zusatzstern: Regenbogen ★2, ★3 …</small></div><span aria-hidden="true">✨</span></li>`;
}
(function(){ if (document.getElementById("ppCss")) return; const st = document.createElement("style"); st.id = "ppCss";
  st.textContent = ".pt-lv-pp{border-left:4px solid var(--pc)!important}.pt-lv-pp .pt-lv-n{background:var(--pc)!important;color:#14062E!important}.pt-lv-ph{background:rgba(255,194,26,.1)!important}.pt-lv-ph b{color:#FFC21A}";
  (document.head || document.documentElement).appendChild(st); })();
/* ---- Alle Level ---- */
function levelsHTML(){
  const s = student(D.me), T = totalsFor(s.id), li = LIB.levelOf(T.stars), L = LIB.LEVELS, RR = window.GLAB_R;
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptLvT">
    <div class="wd-head"><div><small>${esc(s.n)} · ★ ${T.stars}</small><h2 id="ptLvT">Alle Level</h2><p>Sterne aus allen Modulen und Fächern zählen zusammen. Bis Level 100 bringt fast jedes Level eine Belohnung. Danach beginnt Prestige: alle 300 Sterne ein neuer Rang (I bis X) mit animiertem Hintergrund, Diplom, Beschwörungs-Emote und animiertem Skin. Gegenstände aus der Schweiz gibt es für die Diplome aus «Entdeckungsreise Schweiz».</p></div>
      <button type="button" class="btn" data-pt="lv-close">Fertig</button></div>
    <ol class="pt-lv-list">${L.slice(0, 100).map((l,k)=>{
      const gifts = LIB.OUTFITS.filter(o=>o.lv === k).map(o=>`<span class="pt-gift"><i class="glitch">${LIB.glitchSVG("normal", {outfit:{[o.slot]:o.id}})}</i>${esc(o.n)}</span>`).concat(RR.rewardsAt(k).map(r=>`<span class="pt-gift"><i>${r.ic}</i>${esc(r.n)}</span>`));
      return `<li class="pt-lv-row ${k < li ? "done" : k === li ? "cur" : "next"}"><span class="pt-lv-n">${k+1}</span><div><b>${esc(l.n)}</b><small>${k ? `ab ${l.s} ★` : "Start"}</small><div class="pt-gifts">${gifts.join("") || `<span class="pt-gift">Futter für gLiTCh im Modul</span>`}</div></div><span aria-hidden="true">${k < li ? "✓" : k === li ? "★" : "🔒"}</span></li>`; }).join("")}${prestigeRows(T)}</ol></div>`;
}
const LV_TEASER = "";
function openLevels(){
  closeOv("ptLv"); const ov = document.createElement("div"); ov.className = "wd-ov"; ov.id = "ptLv"; ov.innerHTML = levelsHTML();
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  const cur = ov.querySelector(".pt-lv-row.cur"); if (cur) cur.scrollIntoView({block:"center"}); ov.querySelector('[data-pt="lv-close"]').focus({preventScroll:true});
}


/* ---- Garderobe (Konto) ---- */
function wardrobeHTML(){
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id), o = p.outfit || {}, NW = NEWSET.wd;
  const li = LIB.levelOf(T.stars), isOpen = x=>outfitOpenFor(x, T), LP = !!window.GLAB_IS_LP;
  const SK = (window.GLAB_SKINS || []).filter(x=>x.id !== "gold"), skOpen = SK.filter(x=>skinOpen(x, T)).length;
  const nOpen = LIB.OUTFITS.filter(isOpen).length + (LP ? 0 : skOpen), nAll = LIB.OUTFITS.length + (LP ? 0 : SK.length);
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptWdT">
    <div class="wd-head"><div><small>${esc(s.n)} · Level ${li+1}</small><h2 id="ptWdT">Garderobe</h2><p>Dein gLiTCh trägt das auch in den Modulen. Pro Körperteil eines antippen, nochmals tippen nimmt es wieder ab.</p></div>
      <button type="button" class="btn" data-pt="wd-close">Fertig</button></div>
    <div class="wd-stage"><span class="glitch wd-g">${LIB.glitchSVG("cool", {outfit:o})}</span></div>
    ${vfBar("wd", nOpen, nAll)}${nextGift("wd", T)}
    ${skinPickHTML(o)}
    ${LIB.SLOTS.map(sl=>{
      const its = LIB.OUTFITS.filter(x=>x.slot === sl.id), cur = its.find(x=>o[sl.id] === x.id);
      const show = vfSort(its.filter(x=>vfShow("wd", isOpen(x), o[sl.id] === x.id)), isOpen);
      return window.GLAB_ACC("wd", sl.id, sl.n, {cur: cur ? esc(cur.n) : "", glitch:true, prev: LIB.glitchSVG("normal", {outfit: cur ? {[sl.id]:cur.id} : {}}), n: its.filter(isOpen).length, t: its.length, isNew: its.some(x=>NW.has(x.id))}, false) + (show.length ? `<div class="wd-grid">${show.map(x=>{
      const open = isOpen(x), on = o[sl.id] === x.id;
      return `<button type="button" class="wd-item${on ? " on" : ""}${open ? "" : " locked"}" data-pt-outfit="${x.id}" ${open ? "" : 'aria-disabled="true"'} aria-pressed="${on}">${vfNew(NW.has(x.id))}
        <span class="glitch wd-mini">${LIB.glitchSVG("normal", {outfit:{[sl.id]:x.id}})}</span>
        <b>${esc(x.n)}</b><small>${open ? (on ? "angezogen" : "antippen") : esc(LIB.outfitReq(x))}</small>${open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`;
    }).join("")}</div>` : vfEmpty("wd")) + `</details>`; }).join("")}</div>`;
}
function skinPickHTML(o){
  const SK = (window.GLAB_SKINS || []).filter(x=>x.id !== "gold"), cur = o.skin || "violett", NW = NEWSET.wd;
  if (window.GLAB_IS_LP) return window.GLAB_ACC("wd", "skin", "Skin", {cur: "Gold", glitch:true, prev: LIB.glitchSVG("happy"), n: 1, t: 1}, true)
    + `<div class="wd-skin" style="padding:4px 14px 14px"><div class="wd-skins"><span class="wd-sk on gold" style="--sk:#F2B705" aria-label="Gold"><span class="glitch">${LIB.glitchSVG("happy")}</span><small>Gold</small></span></div><p class="wd-skin-note">✨ Lehrpersonen sind immer golden. Diese Farbe gibt es nur für Lehrpersonen.</p></div></details>`;
  const T = totalsFor(D.me), c = SK.find(x=>x.id === cur) || SK[0], isOpen = x=>skinOpen(x, T);
  const show = vfSort(SK.filter(x=>vfShow("wd", isOpen(x), cur === x.id)), isOpen);
  return window.GLAB_ACC("wd", "skin", "Skin", {cur: esc(c ? c.n : "Violett"), glitch:true, prev: LIB.glitchSVG("normal", {outfit:{skin:cur}}), n: SK.filter(isOpen).length, t: SK.length, isNew: SK.some(x=>NW.has("sk:" + x.id))}, true)
    + (show.length ? `<div class="wd-skin" style="padding:4px 14px 14px"><div class="wd-skins" role="radiogroup" aria-label="Skin von gLiTCh">${show.map(x=>{ const open = isOpen(x); return `<button type="button" class="wd-sk${cur === x.id ? " on" : ""}${open ? "" : " locked"}" data-pt-skin="${x.id}" role="radio" aria-checked="${cur === x.id}" ${open ? "" : 'aria-disabled="true"'} style="--sk:${x.base}">${vfNew(NW.has("sk:" + x.id))}<span class="glitch">${LIB.glitchSVG("normal", {outfit:{skin:x.id}})}</span><small>${esc(x.n)}</small>${open ? "" : `<em>${esc(skinReq(x))}</em>`}</button>`; }).join("")}</div></div>` : vfEmpty("wd")) + `</details>`;
}
const skinOpen = (x, T) => (x.lv == null || LIB.levelOf(T.stars) >= x.lv) && (!x.badge || T.badges.has(x.badge));
const skinReq = x => x.reqTxt || (x.lv != null ? `ab Level ${x.lv + 1}` : "");
function pickSkin(id){
  const sk = (window.GLAB_SKINS || []).find(x=>x.id === id);
  if (window.GLAB_IS_LP || id === "gold" || !sk) return;
  if (!skinOpen(sk, totalsFor(D.me))){ const b = document.querySelector(`[data-pt-skin="${id}"]`); if (b) b.animate([{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"none"}], {duration:280}); return; }
  const s = student(D.me), p = prog(s.id), ov = document.getElementById("ptWd");
  p.outfit = Object.assign({}, p.outfit, {skin: id === "violett" ? null : id}); p.outfitAt = now(); window.GLAB_CUR_SKIN = id === "violett" ? "" : id; saveD();
  if (ov){ const sc = ov.scrollTop; ov.innerHTML = wardrobeHTML(); ov.scrollTop = sc; }
}
document.addEventListener("click", e=>{ const b = e.target.closest && e.target.closest("[data-pt-skin]"); if (b){ e.preventDefault(); pickSkin(b.dataset.ptSkin); } });
(function(){ if (document.getElementById("wdSkinCss")) return; const st = document.createElement("style"); st.id = "wdSkinCss";
  st.textContent = ".wd-skin{margin:4px 0 14px}.wd-skin > b{display:block;margin:0 0 8px;font:800 .95rem/1.2 system-ui,sans-serif}.wd-skins{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:8px}"
  + ".wd-sk{all:unset;box-sizing:border-box;cursor:pointer;display:grid;justify-items:center;gap:2px;padding:8px 4px 6px;border-radius:14px;background:rgba(255,255,255,.06);border:2px solid transparent;text-align:center}"
  + ".wd-sk .glitch{width:40px;height:40px;display:block}.wd-sk .glitch svg{width:100%;height:100%}.wd-sk small{font:700 .72rem/1.1 system-ui,sans-serif;opacity:.85}"
  + ".wd-sk.on{border-color:var(--sk);background:color-mix(in srgb, var(--sk) 22%, transparent)}.wd-sk:focus-visible{outline:3px solid #FFC21A;outline-offset:2px}"
  + ".wd-skin-note{margin:8px 0 0;font-size:.85rem;opacity:.85}.wd-sk.locked .glitch{filter:grayscale(.85) brightness(.6)}.wd-sk em{font:600 .62rem/1.15 system-ui,sans-serif;font-style:normal;opacity:.75}";
  (document.head || document.documentElement).appendChild(st); })();
function openWardrobe(){
  closeOv("ptWd"); markNew("wd");
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id);
  p.seen = LIB.OUTFITS.filter(x=>outfitOpenFor(x, T)).length; saveD();
  const ov = document.createElement("div"); ov.className = "wd-ov"; ov.id = "ptWd"; ov.innerHTML = wardrobeHTML();
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  ov.querySelector('[data-pt="wd-close"]').focus({preventScroll:true});
}
function pickOutfit(id){
  const x = LIB.OUTFITS.find(o=>o.id === id); if (!x) return;
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id), ov = document.getElementById("ptWd");
  if (!outfitOpenFor(x, T)){ const b = ov.querySelector(`[data-pt-outfit="${id}"]`); if (b){ b.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); } return; }
  const o = Object.assign({}, p.outfit); o[x.slot] = o[x.slot] === x.id ? null : x.id; p.outfit = o; p.outfitAt = now(); saveD();
  const sc = ov.scrollTop; ov.innerHTML = wardrobeHTML(); ov.scrollTop = sc;
}
/* ---- Modul starten: Gruppe und Namen im Pop-up ---- */
let GS = null;
function grpStartHTML(){
  const m = MODULES.find(x=>x.id === GS.mod), meN = (student(D.me) || {}).n;
  return `<div class="pt-dlg pt-gs" role="dialog" aria-modal="true" aria-labelledby="ptGsT" style="--mc:${m.c}">
    <div class="pt-gs-h"><span class="glitch">${LIB.glitchSVG("happy")}</span><div><small>Modul starten</small><h2 id="ptGsT">${esc(m.n)}</h2></div></div>
    <b class="pt-gs-l">1. Welche Gruppe seid ihr?</b>
    <div class="pt-gs-nrs">${Array.from({length:GROUP_MAX},(_,k)=>k+1).map(n=>`<button type="button" data-pt-gsnr="${n}" aria-pressed="${String(GS.nr)===String(n)}">${n}</button>`).join("")}</div>
    <small class="pt-gs-hint">Die Nummer sagt euch die Lehrperson. Alle in der Gruppe wählen dieselbe.</small>
    <b class="pt-gs-l">2. Wer arbeitet mit?</b>
    <div class="pt-gs-names">${GS.names.map((n,i)=>`<span class="pt-gs-name${normN(n)===normN(meN) ? " me" : ""}">${esc(n)}${normN(n)===normN(meN) ? " (du)" : `<button type="button" data-pt-gsdel="${i}" aria-label="${esc(n)} entfernen">✕</button>`}</span>`).join("")}</div>
    ${managed() ? `<small class="pt-gs-hint">Tippt die Namen an, die mit euch arbeiten:</small><div class="pt-gs-pick">${D.cls.students.filter(x=>x.id !== D.me).slice().sort((a,b)=>a.n.localeCompare(b.n, "de")).map(x=>{ const on = GS.names.some(n=>normN(n) === normN(x.n)); return `<button type="button" data-pt-gstog="${x.id}" aria-pressed="${on}">${on ? "✓ " : "+ "}${esc(x.n)}</button>`; }).join("")}</div>` : `<div class="pt-form" data-pt-form="gsadd"><input class="pt-in" id="ptGsAdd" placeholder="Vorname eintippen" maxlength="30" autocomplete="off" aria-label="Vorname hinzufügen"><button type="button" data-pt-submit class="pt-btn">+ Dazu</button></div>`}
    <p class="pt-gs-info">⭐ Alle Namen hier bekommen die Sterne, Diplome und Freischaltungen gutgeschrieben. Ihr braucht nur ein iPad pro Gruppe.</p>
    <p class="pt-err" id="ptGsErr" role="alert"></p>
    <div class="pt-row"><button type="button" class="pt-btn" data-pt="gs-close">Abbrechen</button><button type="button" class="pt-btn primary" data-pt="gs-go">Starten →</button></div></div>`;
}
const testOpen = id => { try { const o = JSON.parse(localStorage.getItem("glab.testUnlock") || "[]"); return o.includes("*") || o.includes(id); } catch(e){ return false; } };
const modOpen = (m, sid) => !m.req || testOpen(m.id) || totalsFor(sid).badges.has(m.req.badge);
function openGrpStart(mod){
  const mm = MODULES.find(x=>x.id === mod); if (mm && !modOpen(mm, D.me)) return;
  if (!D.me || !student(D.me)) return;
  D.cls.groups = D.cls.groups || {}; const g = D.cls.groups[mod] = D.cls.groups[mod] || {};
  if (g[D.me] !== "p:" + D.me){ g[D.me] = "p:" + D.me; saveD(); }
  S = {sid: D.me, mod}; lsSet(SKEY, S);
  const gb = document.querySelector(`[data-pt-modgo="${mod}"]`); if (gb){ gb.disabled = true; gb.textContent = "Wird gestartet …"; }
  setTimeout(()=>location.reload(), cloud.fb ? 700 : 0); return;
  const nr = groupOf(D.me, mod), me = student(D.me);
  GS = {mod, nr, names: nr ? membersOf(nr, mod).map(s=>s.n) : [me.n]};
  if (!GS.names.some(n=>normN(n) === normN(me.n))) GS.names.unshift(me.n);
  closeOv("ptGs"); const ov = document.createElement("div"); ov.className = "pt-ov"; ov.id = "ptGs"; ov.innerHTML = grpStartHTML();
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
}
function gsRender(){ const ov = document.getElementById("ptGs"); if (ov){ ov.innerHTML = grpStartHTML(); } }
function gsGo(){
  if (!GS.nr){ document.getElementById("ptGsErr").textContent = "Wählt zuerst eure Gruppennummer."; const r = document.querySelector(".pt-gs-nrs"); r.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  const mod = GS.mod; D.cls.groups = D.cls.groups || {}; const g = D.cls.groups[mod] = D.cls.groups[mod] || {};
  const ids = GS.names.map(n=>{ let s = D.cls.students.find(x=>normN(x.n) === normN(n)); if (!s){ if (managed()) return null; s = {id: uid(), n}; D.cls.students.push(s); } return s.id; }).filter(Boolean);
  Object.keys(g).forEach(sid=>{ if (String(g[sid]) === String(GS.nr) && !ids.includes(sid)) delete g[sid]; });
  ids.forEach(id=>{ g[id] = +GS.nr; });
  saveD(); S = {sid: D.me, mod}; lsSet(SKEY, S);
  const b = document.querySelector('[data-pt="gs-go"]'); if (b){ b.disabled = true; b.textContent = "Wird gestartet …"; } location.reload();
}
function closeOv(id){ const el = document.getElementById(id); if (el){ el.remove(); document.body.style.overflow = ""; } }


/* ---- Zugangskarten zum Ausdrucken ---- */
async function printCards(){
  const link = typeof fbLink === "function" ? fbLink() : "";
  let qr = "";
  if (link){ try { if (!window.QRCode) await new Promise((ok, no)=>{ const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); });
    const box = document.createElement("div"); new window.QRCode(box, {text: link, width: 240, height: 240, correctLevel: window.QRCode.CorrectLevel.L}); const cv = box.querySelector("canvas"); qr = cv ? cv.toDataURL() : ""; } catch(e){} }
  const list = D.cls.students.slice().sort((a,b)=>a.n.localeCompare(b.n, "de"));
  closeOv("ptCards");
  const ov = document.createElement("div"); ov.className = "pt-ov pt-cardsov"; ov.id = "ptCards";
  ov.innerHTML = `<div class="pt-cardsbar"><b>Zugangskarten · ${esc(D.cls.name)}</b><span>Ausschneiden und jedem Kind seine Karte geben.</span><button type="button" class="pt-btn primary" data-pt="cards-print">🖨️ Drucken</button><button type="button" class="pt-btn" data-pt="cards-close">Schliessen</button></div>
    <div class="pt-cardsgrid">${list.map(s=>`<div class="pt-acard"><div class="pt-acard-h"><span class="glitch">${LIB.glitchSVG("happy", {outfit: (D.prog[s.id] || {}).outfit || {}})}</span><div><small>gLiTCh-Lab NMG · ${esc(D.cls.name)}</small><b>${esc(s.n)}</b></div></div>
      <div class="pt-acard-pin"><small>Dein PIN</small><b>${esc(s.pin || "––––")}</b></div>${qr ? `<img src="${qr}" alt="QR-Code zum Klassen-Link">` : ""}<p>${qr ? "QR-Code scannen, Namen antippen, PIN eingeben." : "Namen antippen, PIN eingeben."} Den PIN verrätst du niemandem!</p></div>`).join("")}</div>`;
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
}
/* ---- PIN-Eingabe ---- */
let pinFor = null, pinVal = "";
function openPin(sid){
  pinFor = sid; pinVal = "";
  const s = student(sid); closeOv("ptPin");
  const ov = document.createElement("div"); ov.className = "pt-ov"; ov.id = "ptPin";
  ov.innerHTML = `<div class="pt-dlg" role="dialog" aria-modal="true" aria-labelledby="ptPinT"><span class="glitch" style="display:block; width:70px; height:70px; margin:0 auto">${LIB.glitchSVG("happy", {outfit: prog(sid).outfit || {}})}</span>
    <h2 id="ptPinT">Hallo ${esc(s.n)}!</h2><p>Gib deinen 4-stelligen PIN ein.</p>
    <div class="pt-dots" id="ptDots" aria-live="polite" aria-label="0 von 4 Ziffern">${"<i></i>".repeat(4)}</div>
    <div class="pt-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" class="pt-key" data-pt-key="${n}">${n}</button>`).join("")}<button type="button" class="pt-key ghost" data-pt="pin-close">Zurück</button><button type="button" class="pt-key" data-pt-key="0">0</button><button type="button" class="pt-key ghost" data-pt-key="del" aria-label="Löschen">⌫</button></div>
    <p class="pt-err" id="ptPinErr" role="alert"></p></div>`;
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  ov.querySelector('[data-pt-key="1"]').focus({preventScroll:true});
}
function pinKey(k){
  if (k === "del") pinVal = pinVal.slice(0, -1); else if (pinVal.length < 4) pinVal += k;
  const dots = document.getElementById("ptDots"); if (!dots) return;
  dots.querySelectorAll("i").forEach((d,i)=>d.classList.toggle("on", i < pinVal.length));
  dots.setAttribute("aria-label", pinVal.length + " von 4 Ziffern");
  if (pinVal.length === 4){
    const s = student(pinFor);
    if (s && s.pin === pinVal){ D.me = s.id; saveD(); closeOv("ptPin"); view = "home"; render(); }
    else { document.getElementById("ptPinErr").textContent = "Falscher PIN. Versuch es nochmals!"; dots.classList.remove("shake"); void dots.offsetWidth; dots.classList.add("shake"); pinVal = ""; setTimeout(()=>dots.querySelectorAll("i").forEach(d=>d.classList.remove("on")), 350); }
  }
}

/* ---- Lehrperson ---- */
function askTeacher(){
  if (lpOk){ view = "lp"; render(); return; }
  closeOv("ptCode");
  const ov = document.createElement("div"); ov.className = "pt-ov"; ov.id = "ptCode";
  ov.innerHTML = `<div class="pt-dlg" role="dialog" aria-modal="true" aria-labelledby="ptCodeT" data-pt-form="code"><h2 id="ptCodeT">Lehrperson</h2>
    <p>${D.cls ? "Gib den Lehrpersonen-Code ein." : "Zum Einrichten den Lehrpersonen-Code eingeben."}</p>
    ${window.GLAB_KEYPAD("ptCodeIn", "#ptCodeOk")}
    <p class="pt-err" id="ptCodeErr" role="alert"></p>
    <div class="pt-row"><button type="button" class="pt-btn" data-pt="code-close">Abbrechen</button><button type="button" data-pt-submit id="ptCodeOk" class="pt-btn primary" hidden>Öffnen</button></div></div>`;
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  
}
function checkCode(){
  const v = (document.getElementById("ptCodeIn").value || "").trim();
  const code = codeOf();
  if (v.toLowerCase() === code.toLowerCase()){ lpOk = true; closeOv("ptCode"); view = "lp"; render(); }
  else document.getElementById("ptCodeErr").textContent = "Falscher Code.";
}
function touch(){ D.cls.rev = now(); saveD(); }
function teacherHTML(){
  const back = `<button type="button" class="pt-btn small" data-pt="lp-close">Zurück</button><button type="button" class="pt-btn small" data-pt="lp-lock">Sperren</button>`;
  if (!D.cls) return topHTML(back) + `<div class="pt-card"><h2>Neue Klasse einrichten</h2><p>Gib einen Klassennamen und die Vornamen ein (einer pro Zeile). Keine Nachnamen (Datenschutz).</p>
    <div data-pt-form="create" class="pt-lp"><input class="pt-in" id="ptClsName" placeholder="Klassenname, z. B. 6a Allschwil" maxlength="40" required>
    <textarea class="pt-in" id="ptNames" placeholder="Anna&#10;Ben&#10;Lia" aria-label="Vornamen, einer pro Zeile"></textarea>
    <div class="pt-row" style="justify-content:flex-start"><button type="button" data-pt-submit class="pt-btn primary">Klasse erstellen</button></div></div>
    <p>Oder direkt die Dateien der Kinder laden. Die Klasse entsteht dann automatisch aus ihren Vornamen:</p><label class="pt-btn">📥 Dateien laden<input type="file" data-pt-file accept=".json,application/json" multiple></label>
    <p class="pt-msg" id="ptMsg" role="status"></p></div>`;
  const tabs = [["sus","Schülerinnen & Schüler"],["dateien","Dateien & Sync"],["test","🧪 Test-Modus"],["setup","Einstellungen"]];
  return topHTML(back) + `<div class="pt-lp">${cloudHTML()}<div class="pt-tabs" role="tablist">${tabs.map(([k,n])=>`<button type="button" class="pt-tab" role="tab" aria-selected="${lpTab===k}" data-pt-tab="${k}">${n}</button>`).join("")}</div>
    ${({sus:lpSus, gruppen:lpGroups, dateien:lpFiles, test:lpTest, quiz:lpQuiz, setup:lpSetup}[lpTab] || lpSus)()}</div>`;
}
function grpSelect(sid, mod){
  const cur = groupOf(sid, mod);
  return `<select data-pt-grp="${sid}" data-mod="${mod}" aria-label="Gruppe für ${esc(student(sid).n)}"><option value="">–</option>${Array.from({length:GROUP_MAX},(_,k)=>k+1).map(n=>`<option value="${n}"${String(cur)===String(n)?" selected":""}>Gruppe ${n}</option>`).join("")}</select>`;
}
function lpSus(){
  const list = D.cls.students;
  return `<div class="pt-card"><h2>Konten</h2><p>${managed() ? "Jedes Kind meldet sich auf einem beliebigen iPad mit seinem Namen und seinem 4-stelligen PIN an." + (FBX.on() ? " Dank dem Online-Speicher ist der Stand auf allen Geräten gleich." : "") + " Neue Kinder fügst du unten hinzu." : "Die Kinder melden sich selbst mit dem Vornamen an und wählen ihre Gruppe. Neue Kinder erscheinen hier, sobald du ihre Datei unter «Dateien & Sync» lädst."}</p>
    ${managed() ? `<div class="pt-row" style="justify-content:flex-start; margin:0 0 10px"><button type="button" class="pt-btn primary" data-pt="cards">🖨️ Zugangskarten drucken</button>${list.some(s=>!s.pin) ? `<button type="button" class="pt-btn" data-pt="allpins">Fehlende PINs erstellen</button>` : ""}</div>` : ""}
    <div class="pt-scroll"><table class="pt-table"><thead><tr><th>Vorname</th>${managed() ? "<th>PIN</th>" : ""}<th>Level</th><th>Sterne</th><th>Abzeichen</th><th></th></tr></thead><tbody>
    ${list.map(s=>{ const T = totalsFor(s.id), li = LIB.levelOf(T.stars); return `<tr><td><b>${esc(s.n)}</b></td>${managed() ? `<td class="pt-pin"><code>${esc(s.pin || "–")}</code><button type="button" class="pt-btn small" data-pt-repin="${s.id}" title="Neuen PIN erstellen">${s.pin ? "neu" : "erstellen"}</button></td>` : ""}
      <td>${li+1} · ${esc(LIB.LEVELS[li].n)}</td><td>★ ${T.stars}</td><td>${LIB.BADGES.filter(b=>T.badges.has(b.id)).length} / ${LIB.BADGES.length}</td>
      <td><button type="button" class="pt-btn small danger" data-pt-del="${s.id}">${delAsk === s.id ? "Wirklich löschen?" : "Entfernen"}</button></td></tr>`; }).join("") || `<tr><td colspan="7" class="pt-empty">Noch keine Konten.</td></tr>`}
    </tbody></table></div>
    <div class="pt-form" data-pt-form="add" style="margin-top:14px"><input class="pt-in" id="ptAdd" placeholder="Vorname" maxlength="30" aria-label="Vorname hinzufügen"><button type="button" data-pt-submit class="pt-btn primary">+ Konto hinzufügen</button></div>
    <p class="pt-msg" id="ptMsg" role="status"></p></div>`;
}
function lpGroups(){
  return MODULES.filter(m=>m.live).map(m=>{
    const nrs = Array.from({length:GROUP_MAX},(_,k)=>k+1).filter(n=>membersOf(n, m.id).length);
    const free = D.cls.students.filter(s=>!groupOf(s.id, m.id));
    return `<div class="pt-card" style="margin-bottom:16px"><h2>Gruppen: ${esc(m.n)}</h2><p>Jede Gruppe arbeitet auf einem iPad. Sterne und Diplome bekommen alle Mitglieder der Gruppe.</p>
    <div class="pt-groups">${nrs.map(n=>{ const w = lsGet(workKey(n, m.id)); const st = w && w.state ? w.state.banked : null;
      const what = !w ? "Noch kein Projekt auf diesem Gerät" : window.GLAB_GE_MODS && window.GLAB_GE_MODS[m.id] ? `${esc(window.GLAB_GE_MODS[m.id].prod.file)}: ${esc((w.state && w.state.title) || "–")}` : m.id === "prompt" ? `Projekt${w.state && w.state.name ? ` «${esc(w.state.name)}»` : ""}` : m.id === "kibilder" ? `Plakat: ${esc((w.state && w.state.title) || "–")}${w.state && w.state.quiz ? ` · Quiz: ${Object.keys(w.state.quiz).length} beantwortet` : ""}` : `Meldung: ${esc((w.state && w.state.news) || "–")}${w.state && w.state.verdict ? ` · Urteil: ${esc(w.state.verdict)}` : ""}`;
      return `<div class="pt-group"><b>Gruppe ${n}</b><ul>${membersOf(n, m.id).map(s=>`<li>${esc(s.n)}</li>`).join("")}</ul>
      <p style="margin:8px 0 0; font-size:.88rem; color:var(--muted)">${what}${st != null ? ` · ★ ${st}` : ""}</p></div>`; }).join("") || `<p class="pt-empty">Noch keine Gruppen zugewiesen.</p>`}</div>
    ${free.length ? `<p style="margin-top:14px"><b>Ohne Gruppe:</b> ${esc(free.map(s=>s.n).join(", "))}</p>` : ""}</div>`; }).join("");
}
function lpFiles(){
  return `<div class="pt-card"><h2>Dateien & Sync</h2><p>Die Konten liegen auf jedem iPad. Mit Dateien bringst du alle auf den gleichen Stand.</p>
    <ol class="pt-steps"><li><b>Start:</b> Die Kinder öffnen den Link, tippen ihren Vornamen und wählen im Modul ihre Gruppennummer. Mehr braucht es nicht.</li>
      <li><b>Nach jeder Lektion:</b> Die Kinder tippen im Hauptmenü auf «📤 Datei speichern» und schicken sie dir per AirDrop.</li>
      <li><b>Hier laden:</b> alle Dateien auf einmal auswählen. Neue Kinder kommen automatisch in die Klasse (gleicher Vorname = gleiches Konto). Sterne, Diplome, Gruppen und Projekte werden zusammengeführt.</li>
      <li><b>Optional verteilen:</b> Die Klassen-Datei bringt deinen Lehrpersonen-Code und die Sterne der ganzen Gruppe auf die iPads.</li></ol>
    <div class="pt-row" style="justify-content:flex-start"><button type="button" class="pt-btn gold" data-pt="export">Klassen-Datei speichern</button>
      <label class="pt-btn primary">📥 Dateien der Kinder laden<input type="file" data-pt-file accept=".json,application/json" multiple></label></div>
    <p class="pt-msg" id="ptMsg" role="status"></p></div>`;
}
function lpPins(){
  return `<div class="pt-card"><h2>PIN-Liste</h2><p>Zum Ausschneiden oder als Bildschirmfoto. Jedes Kind bekommt nur seine eigene Karte.</p>
    <div class="pt-pins">${D.cls.students.map(s=>`<div class="pt-pincard"><b>${esc(s.n)}</b><span>${esc(s.pin)}</span></div>`).join("") || `<p class="pt-empty">Noch keine Konten.</p>`}</div></div>`;
}
function lpSetup(){
  return `<div class="pt-card"><h2>Einstellungen</h2>
    <div class="pt-form" data-pt-form="rename"><label for="ptRen" style="font-weight:700">Klassenname</label><input class="pt-in" id="ptRen" value="${esc(D.cls.name)}" maxlength="40"><button type="button" data-pt-submit class="pt-btn">Speichern</button></div>
    <div class="pt-form" data-pt-form="code2" style="margin-top:14px"><label for="ptNewCode" style="font-weight:700">Lehrpersonen-Code</label><input class="pt-in" id="ptNewCode" placeholder="neuer Code, nur Ziffern 1–9" maxlength="8" inputmode="numeric" autocomplete="off"><button type="button" data-pt-submit class="pt-btn">Ändern</button></div>
    <p style="color:var(--muted); font-size:.9rem">Der Code wird mit der Klassen-Datei auf die iPads übertragen. Er wird über das Zahlenfeld eingegeben (nur Ziffern 1–9, 4 bis 8 Stellen). Zu Beginn lautet er 4313.</p>
    <p class="pt-msg" id="ptMsg" role="status"></p></div>` + fbSetupHTML();
}
let delAsk = null, grpEdit = null;
function lpQuiz(){
  const Q = D.cls.kiQuiz || [], ready = Q.filter(q=>q.img && q.ans).length, kb = Math.round(Q.reduce((n,q)=>n + (q.img || "").length, 0) * .75 / 1024);
  return `<div class="pt-card"><h2>Bilder-Quiz für «KI-Bild oder echt?»</h2>
    <p>Lade echte Fotos und KI-Bilder hoch, zum Beispiel eigene Fotos und Bilder, die du mit einem KI-Bildprogramm erzeugt hast. Verwende nur Bilder, die du nutzen darfst, und keine Fotos von Kindern. Pro Bild wählst du «Foto» oder «KI-Bild» und schreibst einen Hinweis, den die Kinder nach ihrer Antwort sehen. Die Bilder werden verkleinert und kommen mit der Klassen-Datei auf die iPads.</p>
    <div class="pt-row" style="justify-content:flex-start; margin-top:0"><label class="pt-btn primary">+ Bilder hinzufügen<input type="file" data-pt-qfile accept="image/*" multiple></label><span style="align-self:center; color:var(--muted); font-size:.9rem">${ready} von ${Q.length} Bildern bereit · ca. ${kb} KB</span></div>
    <p class="pt-msg" id="ptMsg" role="status"></p>
    <div class="pt-qlist">${Q.map((q,i)=>`<div class="pt-qi${q.ans ? "" : " todo"}"><span class="pt-qn">${i+1}</span><img src="${q.img}" alt="Quiz-Bild ${i+1}">
      <div class="pt-qf"><div class="pt-qa" role="group" aria-label="Antwort für Bild ${i+1}"><button type="button" data-pt-qans="${q.id}" data-val="foto" aria-pressed="${q.ans==="foto"}">📷 Foto</button><button type="button" data-pt-qans="${q.id}" data-val="ki" aria-pressed="${q.ans==="ki"}">🤖 KI-Bild</button></div>
        <textarea class="pt-in" data-pt-qhint="${q.id}" placeholder="Hinweis nach der Antwort, z. B. «Schau die Finger an: Es sind sechs!»" aria-label="Hinweis für Bild ${i+1}">${esc(q.hint || "")}</textarea><input class="pt-in" data-pt-qsrc="${q.id}" value="${esc(q.src || "")}" placeholder="Quelle, z. B. «Foto: Anna Muster» oder «Bild: WDR, CC BY 4.0»" aria-label="Quelle für Bild ${i+1}" maxlength="120"></div>
      <div class="pt-qb"><button type="button" class="pt-btn small" data-pt-qmove="${q.id}" data-d="-1" ${i ? "" : "disabled"} aria-label="Nach oben">↑</button><button type="button" class="pt-btn small" data-pt-qmove="${q.id}" data-d="1" ${i < Q.length-1 ? "" : "disabled"} aria-label="Nach unten">↓</button><button type="button" class="pt-btn small danger" data-pt-qdel="${q.id}" aria-label="Bild entfernen">✕</button></div></div>`).join("") || `<p class="pt-empty">Noch keine Bilder. Gut sind etwa 8 bis 12 Bilder, gemischt Fotos und KI-Bilder.</p>`}</div>
    <p style="color:var(--muted); font-size:.9rem; margin-top:12px">Danach unter «Dateien & Sync» eine neue Klassen-Datei verteilen, damit die Bilder auf die iPads kommen.</p></div>`;
}
function shrinkImage(file){ return new Promise((ok, no)=>{ const fr = new FileReader(); fr.onerror = no; fr.onload = ()=>{ const im = new Image(); im.onerror = no; im.onload = ()=>{ const M = 800, k = Math.min(1, M / Math.max(im.width, im.height)); const c = document.createElement("canvas"); c.width = Math.round(im.width*k); c.height = Math.round(im.height*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", .8)); }; im.src = fr.result; }; fr.readAsDataURL(file); }); }
async function addQuizImages(files){
  const msg = $p("#ptMsg"); let n = 0;
  D.cls.kiQuiz = D.cls.kiQuiz || [];
  for (const f of files){ try { const img = await shrinkImage(f); D.cls.kiQuiz.push({id: "q" + uid(), ans:"", hint:"", img}); n++; } catch(e){} }
  touch(); render(); say($p("#ptMsg"), n ? `${n} Bild(er) hinzugefügt. Jetzt bei jedem Bild «Foto» oder «KI-Bild» wählen.` : "Diese Datei(en) konnte ich nicht lesen.", !n);
}
function lpTest(){
  const L = LIB.LEVELS;
  return `<div class="pt-card"><h2>Test-Modus (Cheats)</h2><p>Zum Ausprobieren: Gib einem Konto ein Level, alle Abzeichen oder einfach alles. Test-Werte bleiben auf diesem Gerät und werden nicht mit den iPads der Kinder synchronisiert. Danach mit «Test entfernen» wieder zurücksetzen.</p>
    <div class="pt-form"><select id="ptCheatWho" aria-label="Konto"><option value="*">Alle Konten</option>${D.cls.students.map(s=>`<option value="${s.id}"${s.id === D.me ? " selected" : ""}>${esc(s.n)}${prog(s.id).mods.cheat ? " (Test)" : ""}</option>`).join("")}</select>
      <select id="ptCheatLv" aria-label="Level">${L.map((l,k)=>`<option value="${k}"${k === L.length-1 ? " selected" : ""}>Level ${k+1} · ${esc(l.n)}</option>`).join("")}</select>
      <button type="button" class="pt-btn primary" data-pt-cheat="level">Level geben</button></div>
    <div class="pt-row" style="justify-content:flex-start">
      <button type="button" class="pt-btn gold" data-pt-cheat="all">⚡ Alles freischalten</button>
      <button type="button" class="pt-btn" data-pt-cheat="badges">Alle Abzeichen</button>
      <button type="button" class="pt-btn danger" data-pt-cheat="reset">Test entfernen</button></div>
    <h3 style="margin-top:18px">Bausteine freischalten</h3><p style="color:var(--muted); font-size:.9rem">Öffnet ein Modul mit allen Bausteinen und Etappen, ohne dass man zuerst präsentieren muss. «Weiter» geht auch ohne fertige Aufgabe. Gilt nur auf diesem Gerät.</p>
    <div class="pt-form"><select id="ptUnlMod" aria-label="Modul"><option value="*">Alle Module</option>${MODULES.filter(m=>m.live).map(m=>`<option value="${m.id}">${esc(m.n)}${testOpen(m.id) ? " (offen)" : ""}</option>`).join("")}</select>
      <button type="button" class="pt-btn primary" data-pt-unl="on">🔓 Alle Bausteine freischalten</button><button type="button" class="pt-btn" data-pt-unl="off">🔒 Wieder sperren</button></div>
    <p style="color:var(--muted); font-size:.85rem">Jetzt offen: ${(()=>{ let o = []; try { o = JSON.parse(localStorage.getItem("glab.testUnlock") || "[]"); } catch(e){} return o.length ? o.map(id=>id === "*" ? "alle Module" : esc((MODULES.find(m=>m.id === id) || {}).n || id)).join(", ") : "nichts"; })()}</p>
    <p style="color:var(--muted); font-size:.9rem; margin-top:12px">«Alles freischalten» gibt Level ${L.length}, alle Abzeichen und die geheimen Accessoires. Danach als Kind anmelden und Zimmer, Garderobe und Emotes ausprobieren.</p>
    <p class="pt-msg" id="ptMsg" role="status"></p></div>`;
}
function cheat(kind){
  const who = (document.getElementById("ptCheatWho") || {}).value || "*";
  const lv = +((document.getElementById("ptCheatLv") || {}).value || 0);
  const ids = who === "*" ? D.cls.students.map(s=>s.id) : [who];
  ids.forEach(id=>{
    const p = prog(id);
    if (kind === "reset"){ delete p.mods.cheat; return; }
    const c = p.mods.cheat || {stars:0, badges:[], fed:0, deaths:0};
    if (kind === "level" || kind === "all"){
      const L = LIB.LEVELS, target = kind === "all" ? L[L.length-1].s : L[lv].s;
      const base = Object.entries(p.mods).filter(([k])=>k !== "cheat").reduce((n,[,m])=>n + (m.stars||0), 0);
      c.stars = Math.max(0, target - base);
    }
    if (kind === "badges" || kind === "all") c.badges = LIB.BADGES.map(b=>b.id);
    if (kind === "all"){ c.fed = 7; c.deaths = 1; }
    c.at = now(); p.mods.cheat = c;
  });
  saveD(); render();
  say($p("#ptMsg"), kind === "reset" ? "Test-Werte entfernt." : `Erledigt für ${who === "*" ? "alle Konten" : student(who).n}.`);
}

/* ---- Ereignisse ---- */
portalEl.addEventListener("change", e=>{
  const t = e.target;
  if (t.matches("[data-pt-qfile]") && t.files && t.files.length){ addQuizImages(Array.from(t.files)); t.value = ""; return; }
  if (t.matches("[data-pt-qsrc]")){ const q = (D.cls.kiQuiz || []).find(x=>x.id === t.dataset.ptQsrc); if (q){ q.src = t.value.slice(0, 120); touch(); } return; }
  if (t.matches("[data-pt-qhint]")){ const q = (D.cls.kiQuiz || []).find(x=>x.id === t.dataset.ptQhint); if (q){ q.hint = t.value.slice(0, 300); touch(); } return; }
  if (t.matches("[data-pt-file]") && t.files && t.files.length){ loadFiles(Array.from(t.files)); t.value = ""; return; }
  if (t.matches("[data-pt-grp]")){ const mod = t.dataset.mod; D.cls.groups = D.cls.groups || {}; D.cls.groups[mod] = D.cls.groups[mod] || {}; if (t.value) D.cls.groups[mod][t.dataset.ptGrp] = +t.value; else delete D.cls.groups[mod][t.dataset.ptGrp]; touch(); say($p("#ptMsg"), "Gruppe gespeichert."); }
});
/* Formulare ohne <form>-Absenden (die Artifact-Ansicht blockiert das): Knopf oder Enter-Taste */
document.addEventListener("click", e=>{ const b = e.target.closest("[data-pt-submit]"); if (!b) return; const f = b.closest("[data-pt-form]"); if (f){ e.preventDefault(); runForm(f.dataset.ptForm); } });
document.addEventListener("keydown", e=>{ if (e.key !== "Enter" || e.isComposing) return; const el = e.target; if (!el || el.tagName !== "INPUT") return; const f = el.closest("[data-pt-form]"); if (f){ e.preventDefault(); runForm(f.dataset.ptForm); } });
function runForm(k){
  if (k === "code") return checkCode();
  if (k === "join"){
    const n = (document.getElementById("ptJoin").value || "").trim().slice(0,30); if (!n){ const i = document.getElementById("ptJoin"); i.focus(); i.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
    if (!D.cls){ D.cls = {id: uid(), self: true, name: "Meine Klasse", code: "4313", rev: 0, students: [], groups: {}}; D.prog = {}; }
    let s = D.cls.students.find(x=>normN(x.n) === normN(n)); if (!s){ s = {id: uid(), n}; D.cls.students.push(s); D.cls.rev = D.cls.self ? 0 : now(); }
    D.me = s.id; saveD(); view = "home"; render(); return;
  }
  if (k === "gsadd"){ const inp = document.getElementById("ptGsAdd"), n = (inp.value || "").trim().slice(0,30); if (!n) return; if (!GS.names.some(x=>normN(x) === normN(n))) GS.names.push(n); gsRender(); const i = document.getElementById("ptGsAdd"); if (i) i.focus(); return; }
  if (k.startsWith("mem:")){
    const mod = k.slice(4), inp = document.getElementById("ptMem-" + mod), n = (inp.value || "").trim().slice(0,30), nr = groupOf(D.me, mod); if (!n || !nr) return;
    let s = D.cls.students.find(x=>normN(x.n) === normN(n)); if (!s){ s = {id: uid(), n}; D.cls.students.push(s); }
    D.cls.groups[mod] = D.cls.groups[mod] || {}; D.cls.groups[mod][s.id] = nr; saveD(); render(); return;
  }
  if (k === "create"){
    const name = document.getElementById("ptClsName").value.trim() || "Meine Klasse";
    const names = Array.from(new Set(document.getElementById("ptNames").value.split(/\n|,/).map(x=>x.trim()).filter(Boolean))).slice(0, 40);
    D.cls = {id: uid(), name, code: "4313", rev: now(), students: names.map(n=>({id: uid(), n: n.slice(0,30), pin: newPin(), at: now()})), groups:{prompt:{}}};
    D.prog = {}; D.me = null; saveD(); lpTab = "sus"; render(); say($p("#ptMsg"), "Klasse erstellt. Drucke jetzt die Zugangskarten mit den PINs."); return;
  }
  if (k === "add"){
    const inp = document.getElementById("ptAdd"); const n = inp.value.trim().slice(0,30); if (!n) return;
    D.cls.students.push({id: uid(), n, pin: uniquePin(), at: now()}); touch(); render(); say($p("#ptMsg"), `Konto für ${n} erstellt.`); const a = document.getElementById("ptAdd"); if (a) a.focus(); return;
  }
  if (k === "rename"){ D.cls.name = document.getElementById("ptRen").value.trim() || D.cls.name; touch(); render(); say($p("#ptMsg"), "Gespeichert."); return; }
  if (k === "code2"){ const c = document.getElementById("ptNewCode").value.trim(); if (!/^[1-9]{4,8}$/.test(c)){ say($p("#ptMsg"), "Der Code braucht 4 bis 8 Ziffern von 1 bis 9 (keine 0).", true); return; } D.cls.code = c; touch(); render(); say($p("#ptMsg"), "Neuer Code gespeichert. Verteile danach eine neue Klassen-Datei."); return; }
}
document.addEventListener("click", e=>{
  const t = e.target.closest("[data-pt-wall],[data-pt-modgo],[data-pt-gsnr],[data-pt-gsdel],[data-pt-gstog],[data-pt-pick],[data-pt-grpedit],[data-pt],[data-pt-login],[data-pt-key],[data-pt-start],[data-pt-tab],[data-pt-repin],[data-pt-del],[data-pt-outfit],[data-pt-badge],[data-pt-room],[data-pt-emote],[data-pt-cheat],[data-pt-unl],[data-pt-fb],[data-pt-qans],[data-pt-qmove],[data-pt-qdel]");
  if (!t){ if (["ptWd","ptRm","ptEm","ptLv","ptDp"].includes(e.target.id)){ closeOv(e.target.id); render(); } return; }
  const a = t.dataset.pt;
  if (t.dataset.ptModgo) return openGrpStart(t.dataset.ptModgo);
  if (t.dataset.ptGsnr){ GS.nr = +t.dataset.ptGsnr; gsRender(); return; }
  if (t.dataset.ptGsdel !== undefined){ GS.names.splice(+t.dataset.ptGsdel, 1); gsRender(); return; }
  if (a === "gs-close") return closeOv("ptGs");
  if (a === "gs-go") return gsGo();
  if (t.dataset.ptGstog){ const s2 = student(t.dataset.ptGstog); if (s2){ const i = GS.names.findIndex(n=>normN(n) === normN(s2.n)); if (i >= 0) GS.names.splice(i, 1); else GS.names.push(s2.n); gsRender(); } return; }
  if (a === "cards") return printCards();
  if (a === "cards-print"){ try { window.print(); } catch(e){} return; }
  if (a === "cards-close") return closeOv("ptCards");
  if (a === "allpins"){ D.cls.students.forEach(s2=>{ if (!s2.pin){ s2.pin = uniquePin(); s2.at = now(); } }); touch(); render(); return; }
  if (t.dataset.ptPick){ const mod = t.dataset.ptPick; D.cls.groups = D.cls.groups || {}; D.cls.groups[mod] = D.cls.groups[mod] || {}; D.cls.groups[mod][D.me] = +t.dataset.nr; grpEdit = null; saveD(); render(); return; }
  if (t.dataset.ptGrpedit){ grpEdit = t.dataset.ptGrpedit; render(); return; }
  if (t.dataset.ptLogin){ const ls = student(t.dataset.ptLogin); if (ls && ls.pin) return openPin(ls.id); D.me = t.dataset.ptLogin; saveD(); view = "home"; render(); return; }
  if (t.dataset.ptKey) return pinKey(t.dataset.ptKey);
  if (t.dataset.ptStart){ S = {sid: D.me, mod: t.dataset.ptStart}; lsSet(SKEY, S); t.disabled = true; t.textContent = "Wird gestartet …"; location.reload(); return; }
  if (t.dataset.ptTab){ lpTab = t.dataset.ptTab; delAsk = null; render(); return; }
  if (t.dataset.ptRepin){ const s = student(t.dataset.ptRepin); s.pin = uniquePin(); s.at = now(); touch(); render(); say($p("#ptMsg"), `Neuer PIN für ${s.n}: ${s.pin}`); return; }
  if (t.dataset.ptDel){ const id = t.dataset.ptDel; if (delAsk !== id){ delAsk = id; render(); return; } const s = student(id); D.cls.students = D.cls.students.filter(x=>x.id !== id); Object.values(D.cls.groups || {}).forEach(g=>delete g[id]); delete D.prog[id]; if (cloud.fb) FBX.del("kinder/" + id).catch(()=>{}); if (D.me === id) D.me = null; delAsk = null; touch(); render(); say($p("#ptMsg"), `Konto ${s ? s.n : ""} entfernt.`); return; }
  if (t.dataset.ptFb) return fbAction(t.dataset.ptFb, t);
  if (t.dataset.ptCheat) return cheat(t.dataset.ptCheat);
  if (t.dataset.ptUnl){ const id = (document.getElementById("ptUnlMod") || {}).value || "*"; let o = []; try { o = JSON.parse(localStorage.getItem("glab.testUnlock") || "[]"); } catch(e){}
    if (t.dataset.ptUnl === "on"){ if (!o.includes(id)) o.push(id); } else o = id === "*" ? [] : o.filter(x=>x !== id);
    try { localStorage.setItem("glab.testUnlock", JSON.stringify(o)); } catch(e){} render(); say($p("#ptMsg"), t.dataset.ptUnl === "on" ? "Freigeschaltet. Jetzt als Kind ins Modul gehen." : "Wieder gesperrt."); return; }
  if (t.dataset.ptQans){ const q = (D.cls.kiQuiz || []).find(x=>x.id === t.dataset.ptQans); if (q){ q.ans = t.dataset.val; touch(); render(); } return; }
  if (t.dataset.ptQmove){ const Q = D.cls.kiQuiz || [], i = Q.findIndex(x=>x.id === t.dataset.ptQmove), j = i + (+t.dataset.d); if (i >= 0 && j >= 0 && j < Q.length){ [Q[i], Q[j]] = [Q[j], Q[i]]; touch(); render(); } return; }
  if (t.dataset.ptQdel){ D.cls.kiQuiz = (D.cls.kiQuiz || []).filter(x=>x.id !== t.dataset.ptQdel); touch(); render(); return; }
  if (t.dataset.ptOutfit) return pickOutfit(t.dataset.ptOutfit);
  if (t.dataset.ptRoom) return pickRoom(t.dataset.ptRoom);
  if (t.dataset.ptEmote) return pickEmote(t.dataset.ptEmote);
  if (t.dataset.ptWall){ const p = prog(D.me), T = totalsFor(D.me), id = t.dataset.ptWall, list = wallOf(p, T), i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else { if (list.length >= WALL_MAX){ t.textContent = "Die Wand ist voll: zuerst ein Diplom abhängen"; t.classList.add("full"); return; } list.push(id); }
    p.wall = list; p.wallKnown = LIB.BADGES.filter(b=>T.badges.has(b.id)).map(b=>b.id); saveD(); const sc = (document.querySelector("#ptDp .wd-box") || {}).scrollTop || 0; openDiplomas(); const bx = document.querySelector("#ptDp .wd-box"); if (bx) bx.scrollTop = sc; return; }
  if (t.dataset.ptBadge){ const b = LIB.BADGES.find(x=>x.id === t.dataset.ptBadge); const on = totalsFor(D.me).badges.has(b.id); const el = document.getElementById("ptSay"); if (el){ el.innerHTML = `<b>${on ? "Diplom: " : "Noch offen: "}${esc(b.n)}</b>${esc(b.d)}`; el.animate([{opacity:.3},{opacity:1}], {duration:250}); sayHide(); } return; }
  if (a === "hub"){ return GLAB.exit(); }
  if (a && a.startsWith("bg-")){ return pickBg(a.slice(3)); }
  if (a === "logo"){ ["ptWd","ptRm","ptEm","ptLv","ptDp","ptCode"].forEach(closeOv); view = "home"; render(); scrollTo(0,0); return; }
  if (a === "logout"){ D.me = null; saveD(); view = "home"; render(); return; }
  if (a === "pin-close") return closeOv("ptPin");
  if (a === "wardrobe") return openWardrobe();
  if (a === "room") return openRoom();
  if (a === "sound"){ try { localStorage.setItem("promptBaukasten.sound", window.GLAB_R.soundOn() ? "off" : "on"); } catch(e){} render(); return; }
  if (a === "emotes") return openEmotes();
  if (a === "levels") return openLevels();
  if (a === "diplome") return openDiplomas();
  if (a === "bgs") return openBgs();
  if (a && a.startsWith("sbg-")) return pickSiteBg(a.slice(4));
  if (a === "bgs-close"){ closeOv("ptBg"); render(); return; }
  if (a === "lexikon"){ if (window.GLAB_LEX) window.GLAB_LEX.open({who: (student(D.me) || {}).n || "", haveOf: m=>{ const out = new Set(); [groupOf(D.me, m), "p:" + D.me].filter(Boolean).forEach(nr=>{ const v = lsGet(workKey(nr, m)); ((v && v.buddy && v.buddy.lex) || []).forEach(w=>out.add(w)); }); return [...out]; }}); return; }
  if (a === "dp-close"){ closeOv("ptDp"); render(); return; }
  if (a === "rm-close" || a === "em-close" || a === "lv-close"){ closeOv({"rm-close":"ptRm","em-close":"ptEm","lv-close":"ptLv"}[a]); render(); return; }
  if (a === "wd-close"){ closeOv("ptWd"); render(); return; }
  if (a === "lp") return askTeacher();
  if (a === "code-close") return closeOv("ptCode");
  if (a === "lp-close"){ view = "home"; delAsk = null; render(); return; }
  if (a === "lp-lock"){ lpOk = false; view = "home"; delAsk = null; render(); return; }
  if (a === "backup") return saveFile("sicherung", t);
  if (a === "export") return saveFile("klasse", t);
});
document.addEventListener("keydown", e=>{
  if (!document.getElementById("ptPin")) { if (e.key === "Escape"){ ["ptGs","ptWd","ptRm","ptEm","ptLv","ptDp","ptCode"].forEach(closeOv); } return; }
  if (/^[0-9]$/.test(e.key)){ e.preventDefault(); pinKey(e.key); }
  else if (e.key === "Backspace"){ e.preventDefault(); pinKey("del"); }
  else if (e.key === "Escape") closeOv("ptPin");
});
window.GLAB.openWardrobe = ()=>openWardrobe();
window.GLAB.openLevels = ()=>openLevels();
window.GLAB.openDiplomas = ()=>openDiplomas();
})();

/* ---- Zimmer lebendiger ---- */
(function(){
  if (document.getElementById("fxCss")) return; const st = document.createElement("style"); st.id = "fxCss";
  st.textContent = ".pt-home-main > .pt-room{position:relative;animation:ptNeon 8s linear infinite}"
  + "@keyframes ptNeon{0%,100%{box-shadow:0 0 0 2px #8B5CFF,0 0 22px rgba(139,92,255,.45)}33%{box-shadow:0 0 0 2px #00E5FF,0 0 22px rgba(0,229,255,.35)}66%{box-shadow:0 0 0 2px #FF2BD6,0 0 22px rgba(255,43,214,.35)}}"
  + ".pt-fx{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit;z-index:2}"
  + ".pt-fx i{position:absolute;bottom:-6px;width:4px;height:4px;background:var(--c);box-shadow:0 0 6px var(--c);opacity:0;animation:ptPix var(--t) linear infinite;animation-delay:var(--d)}"
  + "@keyframes ptPix{0%{transform:translateY(0);opacity:0}10%{opacity:.8}100%{transform:translateY(-260px) translateX(var(--x));opacity:0}}"
  + ".pt-bar i{background-image:linear-gradient(90deg,#FFC21A,#FF2BD6,#00E5FF,#FFC21A)!important;background-size:300% 100%!important;animation:ptBarFlow 5s linear infinite;box-shadow:0 0 12px rgba(255,43,214,.55)}"
  + "@keyframes ptBarFlow{to{background-position:300% 0}}"
  + ".pt-rb::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 40%,rgba(255,255,255,.16) 50%,transparent 60%);background-size:250% 100%;background-position:150% 0;animation:ptSweep 7s ease-in-out infinite;animation-delay:var(--rd);pointer-events:none}"
  + "@keyframes ptSweep{0%,80%{background-position:150% 0}100%{background-position:-100% 0}}"
  + ".pt-rb:hover .pt-rb-ic,.pt-rb:focus-visible .pt-rb-ic{animation:ptWig .5s ease-in-out}"
  + "@keyframes ptWig{25%{transform:rotate(-12deg) scale(1.15)}75%{transform:rotate(10deg) scale(1.1)}}"
  + ".pt-ring{animation:ptRing 3s ease-in-out infinite}@keyframes ptRing{50%{transform:scale(1.06)}}"
  + "@media (prefers-reduced-motion: reduce){.pt-home-main > .pt-room,.pt-fx i,.pt-bar i,.pt-rb::after,.pt-ring{animation:none!important}.pt-fx{display:none}}";
  (document.head || document.documentElement).appendChild(st);
  const COLS = ["#8B5CFF","#00E5FF","#FF2BD6","#FFC21A","#3CFF7A"];
  const LINES = ["Psst … streichle mich mal! Einfach hin und her fahren. 💜", "Teamarbeit lohnt sich: Alle im Team bekommen die Sterne! 👥",
    "Hast du schon alle Emotes ausprobiert? Auf mich tippen und nach unten ziehen! ✨", "Unter «Hintergrund» kannst du die ganze Seite verändern. 🖼️",
    "Ich zähle deine Sterne … eins, zwei, ganz viele! ⭐", "Diplome kannst du an die Wand hängen. Schau unter «Diplome»! 📜",
    "Bzzzt! Mein Code tanzt heute. 💃", "Witz: Warum ist der Computer müde? Er hatte zu viele Tabs offen! 😴",
    "Nach Level 100 kommt Prestige. Dort gibt es richtig spezielle Sachen! 🏆", "Witz: Was macht ein Pixel im Urlaub? Es macht sich klein! 🏖️",
    "In der Garderobe wartet vielleicht etwas Neues auf dich. 👕", "Ich mag es, wenn du lernst. Dann wachse ich mit! 🌱"];
  const fx = ()=>{ const room = document.querySelector(".pt-home-main > .pt-room"); if (!room || room.querySelector(".pt-fx")) return;
    const f = document.createElement("div"); f.className = "pt-fx"; f.setAttribute("aria-hidden", "true");
    f.innerHTML = Array.from({length: 12}, (_, k)=>`<i style="left:${4 + k * 8}%;--c:${COLS[k % 5]};--t:${7 + (k % 5) * 1.6}s;--d:${(k * 1.3) % 9}s;--x:${(k % 2 ? 1 : -1) * (6 + k % 4 * 4)}px"></i>`).join("");
    room.appendChild(f); };
  let last = -1;
  const idle = ()=>{
    if ([...document.querySelectorAll("body > .wd-ov, body > .pt-ov")].some(o=>!o.hidden && getComputedStyle(o).display !== "none") || document.hidden) return;
    const el = document.getElementById("ptSay"), g = document.querySelector(".pt-home-main .pt-room-g"); if (!el || !g) return;
    let i; do { i = Math.floor(Math.random() * LINES.length); } while (i === last && LINES.length > 1); last = i;
    window.GLAB_IDLE_SAY = {txt: LINES[i], until: Date.now() + 8000};
    el.innerHTML = `<b class="gname">gLiTCh</b>${LINES[i]}`; if (typeof sayHide === "function") sayHide();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) (g.querySelector(":scope > span") || g).animate([{transform:"none"},{transform:"translateY(-12%) rotate(-6deg)"},{transform:"translateY(0) rotate(4deg)"},{transform:"none"}], {duration:700, easing:"ease-out"});
  };
  setInterval(fx, 1500);
  setInterval(idle, 16000);
})();
