/* =====================================================================
   Glitchlab · eigene Module der Lehrperson (aus dem Modul-Editor)
   Ein eigenes Modul ist reine Daten (kein Code):
   { title, teaser, subject, theme, newTheme:{title, art}, art, minutes,
     items: [ {type:"info", title, text}
              {type:"mc",   q, options:[...], correct, explain}
              {type:"tf",   q, answer:true|false, explain}
              {type:"text", q, answers:"Bern, bern", explain} ] }
   Jede Aufgabe (ausser Info-Seiten) gibt einen Stern.
   ===================================================================== */
(function () {
  const H = window.GLHub = window.GLHub || {};
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  /* Bilder, die man im Editor auswählen kann (animiert, aus js/module-art.js) */
  H.ART_CHOICES = [
    { key: "hallo", n: "gLiTCh sagt Hoi", c: "#8B5CFF", c2: "#3A1D7A" },
    { key: "schweiz", n: "Schweiz", c: "#4FB3E8", c2: "#0B3E5A" },
    { key: "roemer", n: "Römer", c: "#C98A00", c2: "#4A2E00" },
    { key: "gespraech", n: "Gespräch", c: "#E3A300", c2: "#6B3A00" },
    { key: "wueste", n: "Wüste", c: "#F2C14E", c2: "#B5651D" },
    { key: "dschungel", n: "Dschungel", c: "#2BB57A", c2: "#0B3D24" },
    { key: "tundra", n: "Tundra", c: "#5B8CFF", c2: "#0B1D3A" },
    { key: "lava", n: "Lava", c: "#FF6A00", c2: "#2A0A12" },
    { key: "prompt", n: "Bausteine", c: "#7B4CEF", c2: "#2A1466" },
    { key: "fakenews", n: "Zeitung & Lupe", c: "#DD4646", c2: "#5A1414" },
    { key: "kibilder", n: "Bild: echt oder KI?", c: "#00B3C7", c2: "#0B3E5A" },
    { key: "datenspuren", n: "Fussspuren", c: "#1F9D68", c2: "#0B2E22" },
    { key: "werbung", n: "Megafon", c: "#E3A300", c2: "#6B3A00" },
    { key: "netiquette", n: "Chat", c: "#FF4F8B", c2: "#5A0F33" }
  ];
  const artOf = key => H.ART_CHOICES.find(a => a.key === key) || H.ART_CHOICES[0];
  H.scorable = d => (d.items || []).filter(i => i.type !== "info");

  /* Veröffentlichte Module (Liste aus der Datenbank) im Glitchlab anmelden */
  H.registerCustom = list => {
    H.modules = H.modules.filter(m => !m.custom);
    H.themes = H.themes.filter(t => !t.custom);
    (list || []).forEach(({ id, data }) => {
      const d = data || {};
      if (!d.title || !d.subject || !H.subjects.some(s => s.id === d.subject)) return;
      let theme = d.theme;
      if (theme === "__neu" && d.newTheme && d.newTheme.title) {
        theme = "ct-" + d.subject + "-" + slug(d.newTheme.title);
        if (!H.themes.some(t => t.id === theme)) {
          const a = artOf(d.newTheme.art || d.art);
          H.themes.push({ id: theme, subject: d.subject, title: d.newTheme.title, teaser: d.newTheme.teaser || "", art: a.key, c: a.c, c2: a.c2, custom: true });
        }
      }
      if (!H.themes.some(t => t.id === theme && t.subject === d.subject)) theme = null;
      const mid = "custom-" + id, a = artOf(d.art);
      H.modules.push({
        id: mid, custom: true, subject: d.subject, theme: theme || (H.themes.find(t => t.subject === d.subject) || {}).id,
        title: d.title, teaser: d.teaser || "", minutes: +d.minutes || 0,
        activities: [{ id: "quiz", title: "Aufgaben", maxStars: H.scorable(d).length }],
        mount: (el, api) => H.playCustom(el, api, d)
      });
      H.modArt = H.modArt || {};
      H.modArt[mid] = { c: a.c, c2: a.c2, svg: (H.themeArt || {})[a.key] || "" };
    });
    H.modules.filter(m => m.custom && !m.theme).forEach(m => {   // Fach ohne Themen: «Weitere Module»
      m.theme = m.subject + "-weitere";
      if (!H.themes.some(t => t.id === m.theme)) H.themes.push({ id: m.theme, subject: m.subject, title: "Weitere Module", teaser: "", art: "hallo", c: "#8B5CFF", c2: "#3A1D7A", custom: true });
    });
  };

  /* ---------- Spieler: so erleben die Kinder ein eigenes Modul ---------- */
  const norm = s => String(s || "").toLowerCase().normalize("NFC").replace(/\s+/g, " ").replace(/[.!?]+$/, "").trim();
  H.playCustom = (el, api, d) => {
    const items = d.items || [], total = H.scorable(d).length;
    let i = 0, right = 0, answered = null;
    const names = [api.student, ...(api.team || [])].map(k => k.first_name);
    const draw = () => {
      if (i >= items.length) return end();
      const it = items[i], n = items.slice(0, i + 1).filter(x => x.type !== "info").length;
      const head = `<p class="mq-step">${it.type === "info" ? "Info" : `Aufgabe ${n} von ${total}`}</p>`;
      const nextBtn = `<button type="button" class="btn primary mq-next">${i < items.length - 1 ? "Weiter" : "Auswerten"}</button>`;
      const why = ok => `<p class="mq-why"><b>${ok ? "Richtig!" : "Nicht ganz."}</b> ${esc(it.explain || "")}</p>`;
      if (it.type === "info") {
        el.innerHTML = `<div class="mq">${head}<h2 class="mq-q">${esc(it.title || "")}</h2>
          <div class="mq-info">${String(it.text || "").split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}</div>${nextBtn}</div>`;
      } else if (it.type === "mc" || it.type === "tf") {
        const opts = it.type === "tf" ? ["Richtig", "Falsch"] : (it.options || []).filter(o => String(o).trim());
        const ok = it.type === "tf" ? (it.answer ? 0 : 1) : +it.correct;
        el.innerHTML = `<div class="mq">${head}<h2 class="mq-q">${esc(it.q)}</h2>
          <div class="mq-opts${it.type === "tf" ? " tf" : ""}">${opts.map((o, k) => `<button type="button" class="mq-opt${answered === null ? "" : k === ok ? " ok" : k === answered ? " no" : " dim"}" data-k="${k}" ${answered === null ? "" : "disabled"}>${esc(o)}</button>`).join("")}</div>
          ${answered === null ? "" : why(answered === ok) + nextBtn}</div>`;
        el.querySelectorAll(".mq-opt").forEach(b => b.onclick = () => {
          answered = +b.dataset.k; if (answered === ok) right++;
          api.say(answered === ok ? "Jawoll! Pixel-perfekt!" : "Hmm, knapp daneben. Lies die Erklärung!", answered === ok ? "happy" : "hmm");
          draw();
        });
      } else if (it.type === "text") {
        const accepted = String(it.answers || "").split(/[,\n;]/).map(norm).filter(Boolean);
        el.innerHTML = `<div class="mq">${head}<h2 class="mq-q">${esc(it.q)}</h2>
          <form class="row mq-text"><input class="input" id="mqIn" autocomplete="off" placeholder="Deine Antwort" ${answered === null ? "" : "disabled"} value="${esc(answered === null ? "" : answered.v)}" style="flex:1;min-width:180px">
          ${answered === null ? `<button class="btn primary" type="submit">Prüfen</button>` : ""}</form>
          ${answered === null ? "" : why(answered.ok) + (answered.ok ? "" : `<p class="hint">Richtig wäre: ${esc(String(it.answers || "").split(/[,\n;]/)[0].trim())}</p>`) + nextBtn}</div>`;
        const f = el.querySelector("form");
        f.onsubmit = e => {
          e.preventDefault(); if (answered !== null) return;
          const v = el.querySelector("#mqIn").value; if (!v.trim()) return;
          const ok = accepted.includes(norm(v)); answered = { v, ok }; if (ok) right++;
          api.say(ok ? "Genau so!" : "Fast! Schau dir die Lösung an.", ok ? "happy" : "hmm"); draw();
        };
        if (answered === null) setTimeout(() => { const x = el.querySelector("#mqIn"); if (x) x.focus(); }, 30);
      }
      const nx = el.querySelector(".mq-next"); if (nx) nx.onclick = () => { i++; answered = null; draw(); };
    };
    const end = () => {
      el.innerHTML = `<div class="mq mq-end"><p class="mq-step">Geschafft</p><h2 class="mq-q">${right} von ${total} richtig</h2>
        <p class="mq-stars">${total > 8 ? `★ ${right} / ${total}` : "★".repeat(right) + `<span>${"★".repeat(total - right)}</span>`}</p>
        <p class="mq-why">${names.length > 1 ? `Die Sterne gehen an <b>${names.map(esc).join("</b> und <b>")}</b>.` : "Die Sterne landen in deinem Konto."}</p>
        <div class="mq-nav"><button type="button" class="btn" data-again>Nochmal</button><button type="button" class="btn primary" data-back>Fertig</button></div></div>`;
      el.querySelector("[data-again]").onclick = () => { i = 0; right = 0; answered = null; draw(); };
      el.querySelector("[data-back]").onclick = () => api.back();
      if (total) api.award("quiz", right, { last: right });
      api.say(right === total ? "Alles richtig! Ich mache einen Pixel-Salto!" : "Gut gemacht! Du kannst es jederzeit nochmal versuchen.", right === total ? "cool" : "happy");
    };
    if (!items.length) { el.innerHTML = `<p class="hint">Dieses Modul hat noch keine Aufgaben.</p>`; return; }
    draw();
  };
})();
