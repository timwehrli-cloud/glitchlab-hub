/* =====================================================================
   Glitchlab-Hub · Fächer und Module
   ---------------------------------------------------------------------
   Ein neues Modul wird so eingebaut (eigene Datei in /modules oder hier):

   GLHub.registerModule({
     id: "nmg-schweiz",            // eindeutig, nie mehr ändern (Sterne hängen daran)
     subject: "nmg",               // mi | nmg | de | ma
     theme: "nmg-schweiz",         // ein Thema aus H.themes (oben in dieser Datei)
     title: "Entdeckungsreise Schweiz",
     teaser: "Ein Satz, worum es geht.",
     minutes: 20,
     activities: [                 // jede Aufgabe mit max. Sternen
       { id: "kantone", title: "Kantone-Quiz", maxStars: 3 }
     ],
     mount(el, api) {              // el = leere Fläche für das Modul
       // api.student / api.team        → wer arbeitet gerade (Team auf diesem Gerät)
       // api.award(aktivität, sterne, daten) → Sterne an ALLE im Team
       // api.progress(aktivität)        → {stars, data} oder null
       // api.say(text, stimmung)        → gLiTCh spricht
       // api.back()                     → zurück zur Fachseite
       return () => {};            // optional: Aufräumen beim Verlassen
     }
   });
   ===================================================================== */
(function () {
  const H = window.GLHub = window.GLHub || {};
  H.subjects = [
    { id: "mi", name: "Medien & Informatik", short: "M&I", color: "#7B4CEF", soft: "#EFE8FF",
      icon: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M8.5 9l-2 1.5 2 1.5M15.5 9l2 1.5-2 1.5M13 8l-2 5"/>' },
    { id: "nmg", name: "Natur, Mensch, Gesellschaft", short: "NMG", color: "#14935F", soft: "#DFF5EA",
      icon: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.6 2.6 3.6 5.6 3.6 9s-1 6.4-3.6 9c-2.6-2.6-3.6-5.6-3.6-9s1-6.4 3.6-9z"/>' },
    { id: "de", name: "Deutsch", short: "DE", color: "#C98A00", soft: "#FFF3D1",
      icon: '<path d="M4 5.5C6.5 4 9.5 4 12 5.5v14c-2.5-1.5-5.5-1.5-8 0zM20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0z"/>' },
    { id: "ma", name: "Mathematik", short: "MA", color: "#2563D9", soft: "#E1ECFF",
      icon: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>' },
    { id: "en", name: "Englisch", short: "EN", color: "#C2255C", soft: "#FCE4EE",
      icon: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>' },
    { id: "fr", name: "Französisch", short: "FR", color: "#0E8C8A", soft: "#DDF5F4",
      icon: '<path d="M12 3l-2 8h4zM10 11l-3 10M14 11l3 10M8.5 16h7"/>' },
    { id: "sp", name: "Sport", short: "SP", color: "#E8590C", soft: "#FFE8D9",
      icon: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.5 5.5c3 3 3 10 0 13M18.5 5.5c-3 3-3 10 0 13"/>' },
    { id: "mg", name: "Minigames", short: "GAMES", color: "#7048E8", soft: "#ECE6FF",
      icon: '<rect x="3" y="7" width="18" height="11" rx="5"/><path d="M8 10v5M5.5 12.5h5M15 11h.01M17.5 13.5h.01"/>' }
  ];
  /* Themen: Jedes Fach ist in Themen gegliedert, jedes Modul gehört zu einem Thema.
     art = Name des Bildes in js/module-art.js, c/c2 = Farbverlauf dahinter. */
  H.themes = [
    { id: "mi-start", subject: "mi", title: "Start mit gLiTCh", teaser: "So funktioniert der Hub: Sterne, Teamarbeit und dein Bild-Passwort.", art: "hallo", c: "#8B5CFF", c2: "#3A1D7A" },
    { id: "mi-ki", subject: "mi", title: "KI & Prompts", teaser: "Mit einem Prompt eine eigene App für die Klasse erfinden, testen und verbessern.", art: "prompt", c: "#7B4CEF", c2: "#2A1466" },
    { id: "mi-medien", subject: "mi", title: "Medien durchschauen", teaser: "Fake News entlarven und KI-Bilder von echten Fotos unterscheiden.", art: "fakenews", c: "#DD4646", c2: "#5A1414" },
    { id: "nmg-schweiz", subject: "nmg", title: "Entdeckungsreise Schweiz", teaser: "Kantone, Berge, Flüsse und Städte: Wir reisen quer durch die Schweiz.", art: "schweiz", c: "#4FB3E8", c2: "#0B3E5A" },
    { id: "nmg-roemer", subject: "nmg", title: "Die Römer", teaser: "Leben, Bauten und Erfindungen der Römerinnen und Römer.", art: "roemer", c: "#C98A00", c2: "#4A2E00" },
    { id: "de-gespraech", subject: "de", title: "Gespräche führen", teaser: "Gesprächsregeln, eine Meinung vertreten und euch in der Gruppe einigen.", art: "gespraech", c: "#E3A300", c2: "#6B3A00" }
  ];
  H.modules = [];
  H.registerModule = m => {
    if (!m || !m.id || !m.subject || !Array.isArray(m.activities)) { console.warn("Modul unvollständig", m); return; }
    if (H.modules.some(x => x.id === m.id)) return;
    if (!m.theme || !H.themes.some(t => t.id === m.theme)) {
      console.warn("Modul ohne gültiges Thema – kommt in «Weitere Module»", m.id);
      m.theme = m.subject + "-weitere";
      if (!H.themes.some(t => t.id === m.theme)) H.themes.push({ id: m.theme, subject: m.subject, title: "Weitere Module", teaser: "", art: "hallo", c: "#8B5CFF", c2: "#3A1D7A" });
    }
    H.modules.push(m);
  };
  H.maxStars = m => m.activities.reduce((a, x) => a + (x.maxStars || 0), 0);   // 0 = offen nach oben
  H.openEnded = m => m.activities.some(x => x.maxStars == null);

  /* ---------------------------------------------------------------
     Startmodul: zeigt, wie Sterne und Teamarbeit funktionieren
     --------------------------------------------------------------- */
  const QUIZ = [
    { q: "Max und Anna lösen eine Aufgabe zusammen auf Max' iPad. Wer bekommt die Sterne?",
      a: ["Nur Max, weil es sein iPad ist", "Beide, wenn Anna als Teampartnerin angemeldet ist", "Niemand, Teamarbeit zählt nicht"], ok: 1,
      why: "Genau! Wer als Teampartner angemeldet ist, bekommt die Sterne auch. Sie landen in seinem eigenen Konto." },
    { q: "Dein Bild-Passwort (die drei Bilder) ist …",
      a: ["… geheim. Ich verrate es niemandem.", "… für alle. Je mehr es wissen, desto besser.", "… egal. Man braucht es nicht."], ok: 0,
      why: "Richtig! Sonst könnte jemand anderes mit deinem Konto Sterne sammeln oder deine Arbeit verändern." },
    { q: "Du machst eine Aufgabe nochmal und bist diesmal schlechter. Was passiert mit deinen Sternen?",
      a: ["Sie werden weniger", "Sie bleiben: Es zählt immer dein bestes Resultat", "Alle Sterne sind weg"], ok: 1,
      why: "Stimmt! Sterne gehen nie verloren. Üben lohnt sich also immer." }
  ];

  H.registerModule({
    id: "mi-start", subject: "mi", theme: "mi-start", title: "Hallo gLiTCh!", minutes: 5,
    teaser: "Lerne den Hub kennen: Sterne, Team und dein Bild-Passwort.",
    activities: [
      { id: "quiz", title: "Hub-Quiz", maxStars: 3 },
      { id: "team", title: "Team-Check", maxStars: 1 }
    ],
    mount(el, api) {
      let i = 0, right = 0, picked = null;
      const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      const names = [api.student, ...api.team].map(k => k.first_name);
      const draw = () => {
        if (i < QUIZ.length) {
          const Q = QUIZ[i];
          el.innerHTML = `<div class="mq">
            <p class="mq-step">Frage ${i + 1} von ${QUIZ.length}</p>
            <h2 class="mq-q">${esc(Q.q)}</h2>
            <div class="mq-opts">${Q.a.map((a, k) => `<button type="button" class="mq-opt${picked === null ? "" : k === Q.ok ? " ok" : k === picked ? " no" : " dim"}" data-k="${k}" ${picked === null ? "" : "disabled"}>${esc(a)}</button>`).join("")}</div>
            ${picked === null ? "" : `<p class="mq-why">${esc(picked === Q.ok ? Q.why : "Nicht ganz. " + Q.why.replace(/^(Genau|Richtig|Stimmt)! /, ""))}</p>
              <button type="button" class="btn primary mq-next">${i < QUIZ.length - 1 ? "Nächste Frage" : "Auswerten"}</button>`}
          </div>`;
          el.querySelectorAll(".mq-opt").forEach(b => b.onclick = () => {
            picked = +b.dataset.k; if (picked === Q.ok) right++;
            api.say(picked === Q.ok ? "Jawoll! Pixel-perfekt!" : "Hmm, knapp daneben. Lies die Erklärung!", picked === Q.ok ? "happy" : "hmm");
            draw();
          });
          const nx = el.querySelector(".mq-next"); if (nx) nx.onclick = () => { i++; picked = null; draw(); };
          return;
        }
        // Auswertung
        const hasTeam = api.team.length > 0;
        el.innerHTML = `<div class="mq mq-end">
          <p class="mq-step">Geschafft</p>
          <h2 class="mq-q">${right} von ${QUIZ.length} richtig</h2>
          <p class="mq-stars" aria-label="${right} Sterne">${"★".repeat(right)}<span>${"★".repeat(QUIZ.length - right)}</span></p>
          <p class="mq-why">${names.length > 1 ? `Die Sterne gehen an <b>${names.map(esc).join("</b> und <b>")}</b>.` : "Die Sterne landen in deinem Konto."}</p>
          <div class="mq-team ${hasTeam ? "ok" : ""}">
            <h3>Team-Check</h3>
            <p>${hasTeam ? "Ihr seid ein Team auf diesem Gerät. Dafür gibt es einen Teamstern!" : "Hol dir oben mit «+ Teampartner» jemanden dazu. Dann gibt es einen Teamstern für euch beide."}</p>
          </div>
          <div class="mq-nav"><button type="button" class="btn" data-again>Nochmal</button><button type="button" class="btn primary" data-back>Zurück zu M&amp;I</button></div>
        </div>`;
        el.querySelector("[data-again]").onclick = () => { i = 0; right = 0; picked = null; draw(); };
        el.querySelector("[data-back]").onclick = () => api.back();
        api.award("quiz", right, { last: right, at: new Date().toISOString() });
        if (hasTeam) api.award("team", 1, { with: names });
        api.say(right === 3 ? "Volle Punktzahl! Ich mache einen Pixel-Salto!" : "Gut gemacht! Du kannst es jederzeit nochmal versuchen.", right === 3 ? "cool" : "happy");
      };
      draw();
    }
  });

  /* ---------------------------------------------------------------
     Module aus dem gLiTCh-Lab (laufen in lab/index.html über eine Brücke).
     Ihre Sterne sind offen nach oben (maxStars: null), Diplome zählen hub-weit.
     --------------------------------------------------------------- */
  const LAB = [
    { id: "lab-prompt", lab: "prompt", theme: "mi-ki", title: "Prompt-Labor", minutes: 135,
      teaser: "Baut in der Gruppe den ultimativen Prompt für eine Klassen-App, testet sie und macht sie besser." },
    { id: "lab-fakenews", lab: "fakenews", theme: "mi-medien", title: "Fake-News-Detektiv", minutes: 90,
      teaser: "Echte Meldung oder Falle? Spuren sichern, Bilder rückwärts suchen und eine Faktencheck-Karte gestalten.",
      req: { badge: "buehne", txt: "Wird frei, sobald du im Prompt-Labor alle 4 Etappen präsentiert hast." } },
    { id: "lab-kibilder", lab: "kibilder", theme: "mi-medien", title: "KI-Bild oder echt?", minutes: 90,
      teaser: "Wie entstehen KI-Bilder und Filter? Unterschiede entdecken und ein eigenes Vorher-Nachher erklären.",
      req: { badge: "fn_alle", txt: "Wird frei, sobald du alle 6 Fallakten im Fake-News-Detektiv gelöst hast." } }
  ];
  LAB.forEach(m => H.registerModule(Object.assign({ subject: "mi", kind: "lab", activities: [{ id: "lab", title: m.title, maxStars: null }] }, m)));

  /* ---------------------------------------------------------------
     Deutsch · Gespräche führen: Wüsten-Game (games/wueste) + Platzhalter
     --------------------------------------------------------------- */
  /* ---------- Spiele aus eigenen Artefakten (laufen im Rahmen, «✓ Fertig» gibt 1 Stern) ---------- */
  H.themes.push(
    { id: "mg-quiz", subject: "mg", title: "Quiz-Shows", teaser: "Jeopardy für die ganze Klasse: Die Lehrperson leitet das Spiel.", art: "hallo", c: "#7048E8", c2: "#24104F", lpOnly: true },
    { id: "en-time", subject: "en", title: "How long does it take?", teaser: "Nach der Dauer fragen und richtig antworten.", art: "hallo", c: "#C2255C", c2: "#4A0A23" }
  );
  const game = (o) => H.registerModule(Object.assign({ kind: "frame", doneBtn: true, activities: [{ id: "fertig", title: "Fertig gemeldet", maxStars: 1 }] }, o));
  game({ id: "mg-jeopardy-schweiz", subject: "mg", theme: "mg-quiz", src: "games/jeopardy-schweiz/index.html", title: "Schweiz-Jeopardy", minutes: 45, lpOnly: true, emoji: "🇨🇭", c: "#D52B1E",
    teaser: "Fragen rund um die Schweiz, in Teams gespielt. Nur im Lehrpersonen-Konto sichtbar." });
  game({ id: "mg-jeopardy-herbst", subject: "mg", theme: "mg-quiz", src: "games/jeopardy-herbst/index.html", title: "Herbst-Jeopardy", minutes: 45, lpOnly: true, emoji: "🍂", c: "#E8590C",
    teaser: "Herbst-Fragen für die 6. Klasse, in Teams gespielt. Nur im Lehrpersonen-Konto sichtbar." });
  game({ id: "en-how-long", subject: "en", theme: "en-time", src: "games/how-long/index.html", title: "How long does it take?", minutes: 30, emoji: "⏱️", c: "#C2255C",
    teaser: "Theorie zum Nachlesen und drei kurze Übungen zum Schulalltag." });
  game({ id: "nmg-tombola-romana", subject: "nmg", theme: "nmg-roemer", src: "games/tombola-romana/index.html", title: "Tombola Romana", minutes: 20, emoji: "🎲", c: "#8A2E2A",
    teaser: "Bingo mit römischen Zahlen von I bis C." });
  game({ id: "nmg-statuen-pose", subject: "nmg", theme: "nmg-roemer", src: "games/statuen-pose-blitz/index.html", title: "Römische Statuen – Pose-Blitz", minutes: 20, emoji: "🗿", c: "#C9A227",
    teaser: "Die Drehscheibe wählt eine römische Figur. Schnell die Pose einnehmen und erstarren!" });
  game({ id: "nmg-essen-tierlist", subject: "nmg", theme: "nmg-roemer", src: "games/essen-tierlist/index.html", title: "Römisches Essen – Tier-List", minutes: 25, emoji: "🍇", c: "#7A3E9D",
    teaser: "Römische Speisen bewerten und in eine Rangliste von S bis D sortieren." });

  H.registerModule({
    id: "de-wueste", subject: "de", theme: "de-gespraech", kind: "frame", src: "games/wueste/index.html", work: "wueste",
    title: "Wüsten-Game", minutes: 90, frameBg: "#FFF6E0", noBuddy: true,   // hat schon den Wüstenfuchs
    teaser: "Wörter lernen, Superkräfte wählen und euch im Gespräch einigen: Rettet die Stadt vor dem Verdursten!",
    activities: [
      { id: "level1", title: "Level 1 · Die Wasserquelle", maxStars: 10 },
      { id: "level2", title: "Level 2 · Die Wasser-Karawane", maxStars: 10 },
      { id: "level3", title: "Level 3 · Die Fata Morgana", maxStars: 10 }
    ]
  });
  H.registerModule({ id: "de-dschungel", subject: "de", theme: "de-gespraech", soon: true, title: "Dschungel-Game",
    teaser: "Das nächste Abenteuer: Im Dschungel müsst ihr euch einigen, welcher Weg zum Ziel führt.", activities: [] });
  H.registerModule({ id: "de-tundra", subject: "de", theme: "de-gespraech", soon: true, title: "Tundra-Game",
    teaser: "Eiskalt diskutiert: Ein Abenteuer in der Tundra, bald hier im Hub.", activities: [] });
  /* ---------------------------------------------------------------
     NMG · Entdeckungsreise Schweiz: die 8 Module aus dem gLiTCh-Lab «NMG Schweiz»
     (Daten in js/glitch-data.js, Bilder dort unter LABART)
     --------------------------------------------------------------- */
  ((window.GL_DATA && window.GL_DATA.LABMODS) || []).forEach(m => H.registerModule({
    id: "lab-" + m.id, lab: m.id, subject: "nmg", theme: "nmg-schweiz", kind: "lab", title: m.n,
    teaser: m.d, sub: m.y, minutes: 90, color: m.c, color2: m.c2,
    req: m.req ? { badge: m.req.badge, txt: m.req.txt.replace("Wird freigeschaltet", "Wird frei").replace("ihr ", "du ").replace(/habt\.$/, "hast.") } : undefined,
    activities: [{ id: "lab", title: m.n, maxStars: null }]
  }));
})();
