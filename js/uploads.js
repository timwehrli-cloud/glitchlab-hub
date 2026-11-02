/* =====================================================================
   Glitchlab · hochgeladene HTML-Module der Lehrperson
   Die Lehrperson zieht eine fertige HTML-Datei in den Lehrpersonen-Bereich.
   Optional steckt in der Datei ein «Steckbrief» (Manifest) als JSON:

   <script type="application/json" id="glitchlab-modul"> { … } </script>

   Darin stehen Titel, Fach, Thema, Aufgaben mit Sternen und die Extras
   (Outfits, Emotes, Zimmer-Gegenstände, Hintergründe), die man im Modul
   freischaltet. Die Vorlage (H.uploadTemplate) erklärt alles.
   Im Modul gibt es dann window.GLHub mit sterne(), badge(), speichern(),
   laden(), fertig() und beenden().
   ===================================================================== */
(function () {
  const H = window.GLHub = window.GLHub || {};
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const slug = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const isCol = c => /^#[0-9a-f]{3,8}$/i.test(String(c || ""));
  const str = (v, n = 200) => String(v ?? "").trim().slice(0, n);
  H.UPLOAD_MAX = 8 * 1024 * 1024;   // 8 MB pro Datei

  /* Plätze, an die man Outfits und Zimmer-Gegenstände setzen kann */
  H.OUTFIT_SLOTS = { kopf: "Kopf", augen: "Augen", mund: "Mund", hals: "Hals & Rücken", fuesse: "Füsse & Beine", hand: "In der Hand", haustier: "Haustier" };
  H.ROOM_SLOTS = { links: "Links", rechts: "Rechts", wand: "Wand", teppich: "Teppich", deko: "Deko", decke: "Decke" };
  const OUT_POS = { kopf: [7, -1.5, 6], augen: [7, 5.2, 4.2], mund: [7, 9.2, 3.2], hals: [7, 12.4, 4], fuesse: [7, 15.6, 4], hand: [15.4, 9, 5], haustier: [-1.6, 13.6, 5] };
  const ROOM_BOX = { links: [2, 52, 46, 40], rechts: [112, 52, 46, 40], wand: [4, 22, 32, 34], teppich: [46, 82, 68, 14], deko: [96, 56, 22, 36], decke: [0, 0, 160, 12] };
  const EMO_ANIM = ["huepfen", "drehen", "wackeln", "gross", "jubeln", "regen"];
  const SUBJ_ALIAS = { "mi": "mi", "m&i": "mi", "medien": "mi", "medien und informatik": "mi", "medien & informatik": "mi", "nmg": "nmg", "natur, mensch, gesellschaft": "nmg", "de": "de", "deutsch": "de", "ma": "ma", "mathe": "ma", "mathematik": "ma", "en": "en", "englisch": "en", "fr": "fr", "französisch": "fr", "franzoesisch": "fr", "sp": "sp", "sport": "sp", "mg": "mg", "minigames": "mg", "minigame": "mg" };

  const emojiText = (e, x, y, s) => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="central" style="font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${esc(e)}</text>`;
  /* SVG aus dem Manifest: nur Zeichen-Elemente, keine Skripte oder Links */
  const safeSvg = s => {
    s = String(s || "");
    if (!s.trim()) return "";
    if (/<\s*(script|foreignObject|iframe|object|embed|a\b)|\bon[a-z]+\s*=|javascript:|href\s*=/i.test(s)) return "";
    return s.slice(0, 60000);
  };

  /* ---------- Manifest aus der HTML-Datei lesen ---------- */
  H.readUpload = (html, fileName) => {
    const warn = [];
    let raw = null;
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const el = doc.querySelector('script#glitchlab-modul, script[type="application/glitchlab+json"], script[data-glitchlab]');
      if (el) { try { raw = JSON.parse(el.textContent); } catch (e) { warn.push("Der Steckbrief (glitchlab-modul) ist kein gültiges JSON: " + e.message); } }
      else warn.push("Kein Steckbrief gefunden. Das Modul funktioniert trotzdem: Die Kinder bekommen 1 Stern, wenn sie auf «Fertig» tippen.");
      if (!raw) raw = { titel: (doc.querySelector("title") || {}).textContent || "" };
    } catch (e) { raw = {}; }
    if (!raw.titel && !raw.title) raw.titel = String(fileName || "Neues Modul").replace(/\.html?$/i, "").replace(/[-_]+/g, " ");
    const meta = H.normMeta(raw, warn);
    if (!/glitchlab|GLHub/.test(html) && raw && !raw.aufgaben) { /* kein Hinweis nötig */ }
    return { meta, warn };
  };

  /* Steckbrief vereinheitlichen (deutsche Namen, englische gehen auch) */
  H.normMeta = (r, warn = []) => {
    const g = (...k) => { for (const x of k) if (r[x] != null && r[x] !== "") return r[x]; return null; };
    const subjRaw = String(g("fach", "subject") || "").toLowerCase().trim();
    const subject = SUBJ_ALIAS[subjRaw] || (H.subjects || []).find(s => s.id === subjRaw || s.name.toLowerCase() === subjRaw)?.id || "";
    if (subjRaw && !subject) warn.push(`Fach «${subjRaw}» kenne ich nicht. Bitte unten auswählen.`);
    const acts = [];
    (Array.isArray(g("aufgaben", "activities")) ? g("aufgaben", "activities") : []).slice(0, 20).forEach((a, k) => {
      const id = slug(a.id || a.titel || a.title || "aufgabe-" + (k + 1)) || "aufgabe-" + (k + 1);
      if (id === "fertig" || acts.some(x => x.id === id)) return;
      acts.push({ id, title: str(a.titel || a.title || id, 60), maxStars: Math.max(1, Math.min(600, +(a.sterne ?? a.stars ?? 3) || 3)) });
    });
    const ex = g("extras") || {};
    const unlock = v => {
      const s = String(v || "fertig").trim().toLowerCase();
      if (/^(sofort|start|fertig)$/.test(s) || /^(sterne|prozent|level):\d+$/.test(s) || /^badge:[\w\-äöü]+$/i.test(s)) return s;
      warn.push(`Freischalten «${v}» verstehe ich nicht, ich nehme «fertig».`); return "fertig";
    };
    const list = (k1, k2) => (Array.isArray(ex[k1]) ? ex[k1] : Array.isArray(ex[k2]) ? ex[k2] : []).slice(0, 30);
    const seen = new Set();
    const okId = (x, k, pre) => { let id = slug(x.id || x.name || x.n || pre + k) || pre + k; while (seen.has(id)) id += "-2"; seen.add(id); return id; };
    const outfits = list("outfits", "outfit").map((x, k) => {
      const slot = H.OUTFIT_SLOTS[x.platz || x.slot] ? (x.platz || x.slot) : "kopf";
      return { id: okId(x, k, "outfit"), slot, n: str(x.name || x.n || "Outfit", 40), say: str(x.spruch || x.say, 140), emoji: str(x.emoji, 8), svg: safeSvg(x.svg), unlock: unlock(x.freischalten || x.unlock) };
    }).filter(x => x.emoji || x.svg);
    const emotes = list("emotes", "emote").map((x, k) => ({
      id: okId(x, k, "emote"), n: str(x.name || x.n || "Emote", 40), d: str(x.beschreibung || x.d, 160), ic: str(x.emoji || x.ic || "✨", 8), text: str(x.text, 40),
      anim: EMO_ANIM.includes(x.animation || x.anim) ? (x.animation || x.anim) : "huepfen",
      farben: (Array.isArray(x.farben || x.colors) ? (x.farben || x.colors) : []).filter(isCol).slice(0, 5), unlock: unlock(x.freischalten || x.unlock)
    }));
    const room = list("zimmer", "room").map((x, k) => {
      const slot = H.ROOM_SLOTS[x.platz || x.slot] ? (x.platz || x.slot) : "deko";
      return { id: okId(x, k, "ding"), slot, n: str(x.name || x.n || "Gegenstand", 40), emoji: str(x.emoji, 8), svg: safeSvg(x.svg), unlock: unlock(x.freischalten || x.unlock) };
    }).filter(x => x.emoji || x.svg);
    const bgs = list("hintergruende", "backgrounds").map((x, k) => ({
      id: okId(x, k, "bg"), n: str(x.name || x.n || "Hintergrund", 40), ic: str(x.emoji || x.ic, 8),
      wand: (Array.isArray(x.wand) ? x.wand : []).filter(isCol).slice(0, 2), boden: (Array.isArray(x.boden) ? x.boden : []).filter(isCol).slice(0, 3),
      svg: safeSvg(x.svg), unlock: unlock(x.freischalten || x.unlock)
    }));
    const skins = list("skins", "skin").map((x, k) => ({ id: okId(x, k, "skin"), n: str(x.name || x.n || "Skin", 30), base: isCol(x.farbe || x.base) ? (x.farbe || x.base) : "", unlock: unlock(x.freischalten || x.unlock || "prozent:90") })).filter(x => x.base);
    const addon = /^(addon|paket|belohnungen)$/i.test(String(g("typ", "type") || ""));
    const dips = (Array.isArray(g("diplome", "badges")) ? g("diplome", "badges") : []).slice(0, 20).map((x, k) => ({
      id: slug(x.id || x.name || "diplom-" + (k + 1)) || "diplom-" + (k + 1), n: str(x.name || x.n || "Diplom", 40), emoji: str(x.emoji, 8) || "🏅", d: str(x.beschreibung || x.d, 160), wand: ["rahmen", "wimpel", "schild", "pokal", "medaille", "rolle", "holz", "stern"].includes(x.wand) ? x.wand : ""
    })).filter((x, k, a) => a.findIndex(y => y.id === x.id) === k);
    return {
      title: str(g("titel", "title") || "Neues Modul", 60), dips, teaser: str(g("beschreibung", "teaser", "description"), 160),
      subject, theme: str(g("thema", "theme"), 50), minutes: Math.max(0, Math.min(240, +g("minuten", "minutes") || 0)),
      c: isCol(g("farbe", "color")) ? g("farbe", "color") : "", emoji: str(g("emoji"), 8), maskottchen: str(g("maskottchen", "mascot"), 20),
      activities: acts, extras: { outfits, emotes, room, bgs, skins }, addon
    };
  };
  H.extrasCount = m => { const e = (m && m.extras) || {}; return ["outfits", "emotes", "room", "bgs", "skins"].reduce((a, k) => a + ((e[k] || []).length), 0); };
  H.unlockText = (u, title) => {
    if (u === "sofort") return "von Anfang an";
    if (u === "start") return `Modul «${title}» starten (1. Stern)`;
    if (u === "fertig") return `Modul «${title}» schaffen (alle Sterne)`;
    if (u.startsWith("sterne:")) return `${u.slice(7)} Sterne in «${title}»`;
    if (u.startsWith("prozent:")) return +u.slice(8) >= 90 ? `Modul «${title}» abschliessen (${u.slice(8)} % der Sterne)` : `${u.slice(8)} % der Sterne in «${title}»`;
    if (u.startsWith("level:")) return `ab Level ${u.slice(6)}`;
    if (u.startsWith("badge:")) return `Spezial-Aufgabe in «${title}»`;
    return `Modul «${title}»`;
  };

  /* ---------- Banner-Bild für die Modulkarte ---------- */
  const banner = (emoji, c, c2) => `<svg viewBox="0 0 160 80" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="ub${slug(emoji + c)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="160" height="80" fill="url(#ub${slug(emoji + c)})"/>
    ${[0, 1, 2, 3, 4, 5].map(k => `<rect class="ma-twinkle" style="animation-delay:${k * .4}s" x="${12 + k * 26}" y="${8 + (k * 17) % 50}" width="2" height="2" fill="#fff" opacity=".7"/>`).join("")}
    <g class="ma-bob">${emojiText(emoji || "🧩", 80, 42, 34)}</g></svg>`;

  /* ---------- Module im Glitchlab anmelden ---------- */
  H.registerUploads = list => {
    H.modules = H.modules.filter(m => !m.upload);
    H.themes = H.themes.filter(t => !t.up);
    H.UPLOADS = [];
    (list || []).forEach(u => {
      const d = u.meta || {};
      if (d.addon) { H.UPLOADS.push({ id: "ad-" + u.id, upload: true, addon: true, uploadId: u.id, title: d.title, activities: [], meta: d }); return; }   // Belohnungs-Paket: nur Extras, kein Modul
      if (!d.subject || !H.subjects.some(s => s.id === d.subject)) return;
      const sj = H.subjects.find(s => s.id === d.subject);
      let theme = H.themes.find(t => t.subject === d.subject && d.theme && t.title.toLowerCase() === d.theme.toLowerCase());
      if (!theme) {
        const tid = "ut-" + d.subject + "-" + (slug(d.theme) || "weitere");
        theme = H.themes.find(t => t.id === tid);
        if (!theme) { theme = { id: tid, subject: d.subject, title: d.theme || "Weitere Module", teaser: "Module von " + (window.GLHUB_CONFIG?.TEACHER_NAME || "deiner Lehrperson"), art: "hallo", c: d.c || sj.color, c2: "#1A0B3A", up: true }; H.themes.push(theme); }
      }
      const mid = "up-" + u.id, c = d.c || theme.c || sj.color;
      H.modArt = H.modArt || {};
      H.modArt[mid] = { c, c2: "#1A0B3A", svg: banner(d.emoji, c, "#1A0B3A") };
      const m = {
        id: mid, upload: true, uploadId: u.id, kind: "upload", work: mid, subject: d.subject, theme: theme.id,
        title: d.title, teaser: d.teaser || "Ein Modul von deiner Lehrperson.", minutes: d.minutes || 0,
        activities: [...(d.activities || []), { id: "fertig", title: "Fertig gemeldet", maxStars: 1 }], meta: d
      };
      H.modules.push(m); H.UPLOADS.push(m);
    });
    /* Outfits aus den Modulen auch im Glitchlab zeichnen (Namensliste, Team, Banner) */
    if (window.GL_DATA && Array.isArray(window.GL_DATA.OUTFITS)) {
      const own = H.uploadExtras(() => 0, () => new Set(), true).custom.outfits;
      window.GL_DATA.OUTFITS = window.GL_DATA.OUTFITS.filter(o => !String(o.id).startsWith("up_")).concat(own.map(o => ({ id: o.id, slot: o.slot, n: o.n, svg: o.svg })));
    }
    if (window.GLGlitch && GLGlitch.addSkins) GLGlitch.addSkins(H.uploadExtras(() => 0, () => new Set(), true).custom.skins);
  };

  /* ---------- Extras für das Lab: mit Bedingung (badge) ---------- */
  H.uploadExtras = (stars, badgesOf, all, level) => {
    const out = { outfits: [], emotes: [], room: [], bgs: [], dips: [], mods: [], skins: [] }, earned = [], lv = typeof level === "function" ? level() : (level || 0);
    (H.UPLOADS || []).forEach(m => {
      const e = m.meta.extras || {}, st = stars(m), max = H.maxStars(m), have = badgesOf(m);
      const ok = u => all || u === "sofort" || (u === "start" && st > 0) || (u === "fertig" && st >= max)
        || (u.startsWith("prozent:") && max > 0 && st >= Math.ceil(max * +u.slice(8) / 100)) || (u.startsWith("level:") && lv >= +u.slice(6))
        || (u.startsWith("sterne:") && st >= +u.slice(7)) || (u.startsWith("badge:") && have.has(u.slice(6)));
      const base = x => { const id = `up_${m.uploadId.slice(0, 8)}_${x.id}`, badge = `up:${m.uploadId}:${x.id}`; if (ok(x.unlock)) earned.push(badge); return { id, badge, reqTxt: H.unlockText(x.unlock, m.title), mod: m.title }; };
      const c = m.meta.c || (H.modArt && H.modArt[m.id] || {}).c || "#8B5CFF";
      if ((m.meta.dips || []).length) out.mods.push({ id: m.id, n: m.title, c, emoji: m.meta.emoji || "🧩" });
      (m.meta.dips || []).forEach(x => { const id = `upd:${m.uploadId}:${x.id}`; if (all || have.has(x.id)) earned.push(id); out.dips.push({ id, n: x.n, d: x.d, emoji: x.emoji, wand: x.wand || "", mod: m.title, modId: m.id, c }); });
      (e.outfits || []).forEach(x => { const [cx, cy, s] = OUT_POS[x.slot] || OUT_POS.kopf; out.outfits.push(Object.assign(base(x), { slot: x.slot, n: x.n, say: x.say, svg: x.svg || emojiText(x.emoji, cx, cy, s) })); });
      (e.emotes || []).forEach(x => out.emotes.push(Object.assign(base(x), { n: x.n, d: x.d || `Aus dem Modul «${m.title}».`, ic: x.ic, text: x.text, anim: x.anim, farben: x.farben })));
      (e.room || []).forEach(x => { const b = ROOM_BOX[x.slot] || ROOM_BOX.deko, s = Math.min(b[2], b[3]) * .8; out.room.push(Object.assign(base(x), { slot: x.slot, n: x.n, box: b, svg: x.svg || emojiText(x.emoji, b[0] + b[2] / 2, b[1] + b[3] / 2, s) })); });
      (e.skins || []).forEach(x => { const sh = window.GLGlitch ? GLGlitch.shades(x.base) : {}; out.skins.push(Object.assign(base(x), { n: x.n, base: x.base, light: sh.light, dark: sh.dark, hi: sh.hi })); });
      (e.bgs || []).forEach(x => out.bgs.push(Object.assign(base(x), { n: x.n, ic: x.ic, wand: x.wand, boden: x.boden, svg: x.svg })));
    });
    return { custom: out, earned };
  };

  /* ---------- Schnittstelle im Modul (wird vor den Inhalt gesetzt) ---------- */
  H.uploadDoc = (html, m, key, me, team) => {
    const cfg = JSON.stringify({ mid: m.id, key, ich: me, team, acts: m.activities.map(a => ({ id: a.id, titel: a.title, max: a.maxStars })) }).replace(/</g, "\\u003c");
    const api = `<script>(function(){var B=null;try{B=window.parent&&window.parent.GLHubBridge}catch(e){}var C=${cfg};
var api={ich:C.ich,team:C.team,alle:[C.ich].concat(C.team),aufgaben:C.acts,
sterne:function(a,n){if(B&&B.score)B.score(C.mid,String(a),Number(n)||0)},
badge:function(n){if(B&&B.upBadge)B.upBadge(C.mid,String(n))},
speichern:function(o){try{localStorage.setItem(C.key,JSON.stringify(o))}catch(e){}},
laden:function(){try{return JSON.parse(localStorage.getItem(C.key))}catch(e){return null}},
fertig:function(){if(B&&B.upDone)B.upDone(C.mid)},pruefeCode:function(c){try{return !!(B&&B.checkCode&&B.checkCode(String(c)))}catch(e){return false}},beenden:function(){if(B&&B.exit)B.exit()},
glitch:function(m){try{return B&&B.glitchSvg?B.glitchSvg(m):null}catch(e){return null}}};
api.stars=api.sterne;api.score=api.sterne;api.save=api.speichern;api.load=api.laden;api.done=api.fertig;api.exit=api.beenden;window.GLHub=api;})();<\/script>`;
    if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m0 => m0 + api);
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, m0 => m0 + api);
    return api + html;
  };

  /* ---------- Vorlage zum Herunterladen ---------- */
  H.uploadTemplate = () => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vulkane</title>
<!--
  ================= Glitchlab · Modul-Vorlage =================
  So wird aus einer HTML-Datei ein Modul im Glitchlab:
  1. Alles muss in DIESER einen Datei stecken (Bilder als data:-Links oder SVG).
  2. Den Steckbrief unten anpassen. Er sagt dem Glitchlab: Titel, Fach, Thema,
     welche Aufgaben es Sterne gibt und welche Extras man freischaltet.
  3. Im Lehrpersonen-Bereich die Datei ins Feld «Module hochladen» ziehen.

  Fach: "mi", "nmg", "de", "ma", "en", "fr", "sp" (Sport) oder "mg" (Minigames)
  Thema: Name eines bestehenden Themas (z. B. "Entdeckungsreise Schweiz")
         oder ein neuer Name: dann entsteht ein neues Thema.

  Freischalten (bei jedem Extra):
    "sofort"     gleich verfügbar
    "start"      sobald es im Modul den ersten Stern gibt
    "sterne:5"   ab 5 Sternen in diesem Modul
    "fertig"     wenn alle Sterne des Moduls gesammelt sind
    "badge:NAME" wenn das Modul GLHub.badge("NAME") aufruft

  Diplome: Jedes Diplom hängt im Glitchlab als Bild an gLiTChs Wand (10 Plätze).
           Das Modul vergibt es mit GLHub.badge("ID").
  Plätze für Outfits: kopf, augen, mund, hals, fuesse, hand, haustier
  Plätze im Zimmer:   links, rechts, wand, teppich, deko, decke
  Emote-Animationen:  huepfen, drehen, wackeln, gross, jubeln, regen
  Statt "emoji" kann man auch "svg" angeben (Pixel-Zeichnung ohne <svg>-Hülle):
    Outfit: Koordinaten von gLiTCh (-2 bis 16),  Zimmer: 160 × 100

  Im Modul gibt es window.GLHub (nur im Glitchlab, beim Testen am PC fehlt es):
    GLHub.ich / GLHub.team        Namen der Kinder, die gerade arbeiten
    GLHub.sterne("quiz", 3)       Sterne für eine Aufgabe aus dem Steckbrief
                                  (alle im Team bekommen sie, das Beste zählt)
    GLHub.badge("krater")         Spezial-Aufgabe geschafft (für "badge:krater")
    GLHub.speichern({...})        Arbeit speichern (geht auf alle Geräte des Teams)
    GLHub.laden()                 gespeicherte Arbeit holen (oder null)
    GLHub.fertig()                «Fertig» melden: 1 Stern
    GLHub.beenden()               zurück ins Glitchlab
  ================================================================
-->
<script type="application/json" id="glitchlab-modul">
{
  "titel": "Vulkane",
  "fach": "nmg",
  "thema": "Naturgewalten",
  "beschreibung": "Wie entsteht ein Vulkan? Findet es heraus!",
  "minuten": 20,
  "farbe": "#FF6A00",
  "emoji": "🌋",
  "aufgaben": [
    { "id": "quiz", "titel": "Vulkan-Quiz", "sterne": 3 }
  ],
  "diplome": [
    { "id": "krater", "name": "Krater-Forscher", "emoji": "🕳️", "beschreibung": "Den Krater entdeckt." }
  ],
  "extras": {
    "outfits": [
      { "id": "lavahut", "name": "Lava-Helm", "platz": "kopf", "emoji": "⛑️", "spruch": "Heiss, heiss, heiss!", "freischalten": "start" }
    ],
    "emotes": [
      { "id": "ausbruch", "name": "Vulkanausbruch", "emoji": "🌋", "text": "BOOM!", "animation": "huepfen", "farben": ["#FF6A00", "#FFC21A"], "freischalten": "fertig" }
    ],
    "zimmer": [
      { "id": "lavalampe", "name": "Lavalampe", "platz": "deko", "emoji": "🪔", "freischalten": "sterne:2" }
    ],
    "hintergruende": [
      { "id": "vulkanzimmer", "name": "Vulkan-Zimmer", "emoji": "🌋", "wand": ["#2A0505", "#7A1A08"], "boden": ["#3A2A22", "#5A3A2A"], "freischalten": "badge:krater" }
    ]
  }
}
</script>
<style>
  body { font-family: system-ui, sans-serif; background: #12061f; color: #fff; margin: 0; padding: 24px; }
  .card { max-width: 640px; margin: auto; background: #241047; border-radius: 18px; padding: 20px; }
  button { font: inherit; font-weight: 700; padding: 10px 16px; border-radius: 12px; border: 0; margin: 4px; cursor: pointer; }
  .ok { background: #3CFF7A; } .no { background: #FF5A5A; }
</style>
</head>
<body>
<div class="card">
  <h1>🌋 Vulkan-Quiz</h1>
  <p id="hallo"></p>
  <p>Wie heisst die heisse, flüssige Gesteinsmasse im Vulkan?</p>
  <button onclick="antwort(true)">Magma</button>
  <button onclick="antwort(false)">Lehm</button>
  <p id="msg"></p>
  <button onclick="window.GLHub && GLHub.badge('krater')">Krater entdecken (Spezial)</button>
  <button onclick="window.GLHub && GLHub.fertig()">Fertig!</button>
</div>
<script>
  const hub = window.GLHub;   // fehlt beim Testen ausserhalb des Glitchlabs
  document.getElementById("hallo").textContent = hub ? "Hoi " + hub.alle.join(" und ") + "!" : "Testmodus (ohne Glitchlab)";
  const stand = (hub && hub.laden()) || { richtig: 0 };
  function antwort(ok) {
    document.getElementById("msg").textContent = ok ? "Richtig!" : "Leider falsch.";
    if (ok) { stand.richtig = 3; if (hub) { hub.sterne("quiz", 3); hub.speichern(stand); } }
  }
</script>
</body>
</html>
`;

  /* Banner für eingebaute Spiele mit Emoji (z. B. Römer, Englisch, Quiz-Shows) */
  H.modArt = H.modArt || {};
  (H.modules || []).filter(m => m.emoji && !H.modArt[m.id]).forEach(m => { H.modArt[m.id] = { c: m.c || "#8B5CFF", c2: "#1A0B3A", svg: banner(m.emoji, m.c || "#8B5CFF", "#1A0B3A") }; });
})();
