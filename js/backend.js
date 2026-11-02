/* =====================================================================
   Glitchlab-Hub · Datenspeicher
   Zwei Varianten mit derselben Schnittstelle:
   - SupabaseBackend: echte Online-Datenbank (alle Geräte gleich)
   - DemoBackend:     nur dieses Gerät (localStorage), zum Ausprobieren
   ===================================================================== */
(function () {
  const ERR = {
    PIN_FALSCH: "Die Bilder stimmen nicht. Versuch es nochmal!",
    GESPERRT: "Zu viele Versuche. Warte 2 Minuten und versuch es dann nochmal.",
    NICHT_GEFUNDEN: "Dieses Kind gibt es in der Klasse nicht mehr.",
    SITZUNG_UNGUELTIG: "Du bist nicht mehr angemeldet.",
    TEAM_UNGUELTIG: "Im Team ist etwas schiefgelaufen. Meldet euch neu an.",
    KLASSE_FEHLT: "Diesen Klassencode gibt es nicht. Frag deine Lehrperson.",
    MODUL_FEHLT: "Dieses Modul gibt es nicht mehr. Frag deine Lehrperson."
  };
  class GLError extends Error { constructor(code) { super(ERR[code] || code); this.code = code; } }
  const pickErr = e => {
    const m = String((e && (e.message || e.code)) || e);
    const k = Object.keys(ERR).find(k => m.includes(k));
    return k ? new GLError(k) : (e instanceof Error ? e : new Error(m));
  };

  /* ---------- Hilfen für beide ---------- */
  const COLORS = ["#8B5CFF", "#FF5FA2", "#2E9BFF", "#1FB574", "#FF8A1F", "#E8B400", "#00B8C4", "#E54848"];
  const randPin = () => [0, 1, 2].map(() => Math.floor(Math.random() * 9)).join("-");
  const WORDS = ["PIXEL", "ROBO", "KOMET", "BLITZ", "TURBO", "LASER", "NEON", "COSMO", "BYTE", "ZACK"];
  const randCode = () => WORDS[Math.floor(Math.random() * WORDS.length)] + "-" + String(Math.floor(1000 + Math.random() * 9000));
  /* wie in der Datenbank: Abzeichen vereinigen, fed/deaths Maximum, sonst neuer Wert */
  function mergeData(a, b) {
    a = a || {}; b = b || {};
    const out = Object.assign({}, a, b);
    if (Array.isArray(a.badges) || Array.isArray(b.badges)) out.badges = [...new Set([...(a.badges || []), ...(b.badges || [])])];
    ["fed", "deaths"].forEach(k => { if (k in a || k in b) out[k] = Math.max(+a[k] || 0, +b[k] || 0); });
    return out;
  }
  const cleanName = n => String(n || "").replace(/\s+/g, " ").trim().slice(0, 30);

  /* =================================================================
     Supabase
     ================================================================= */
  class SupabaseBackend {
    constructor(url, key) {
      this.mode = "online";
      this.sb = window.supabase.createClient(url, key, { auth: { persistSession: true, storageKey: "glhub.lp" } });
    }
    async rpc(fn, args) {
      const { data, error } = await this.sb.rpc(fn, args);
      if (error) throw pickErr(error);
      if (data && data.error) throw new GLError(data.error);
      return data;
    }
    /* Kinder */
    async classByCode(code) {
      const c = await this.rpc("kid_class", { p_code: code });
      if (!c) throw new GLError("KLASSE_FEHLT");
      return c;
    }
    login(code, studentId, pin) { return this.rpc("kid_login", { p_code: code, p_student: studentId, p_pin: pin }); }
    me(token) { return this.rpc("kid_me", { p_token: token }); }
    award(tokens, moduleId, activityId, stars, data) {
      return this.rpc("kid_award", { p_tokens: tokens, p_module: moduleId, p_activity: activityId, p_stars: stars, p_data: data || {} });
    }
    async logout(token) { try { await this.rpc("kid_logout", { p_token: token }); } catch (e) { /* egal */ } }
    saveExtras(token, data) { return this.rpc("kid_extras_set", { p_token: token, p_data: data || {} }); }
    workGet(tokens, moduleId) { return this.rpc("kid_work_get", { p_tokens: tokens, p_module: moduleId }); }
    workPut(tokens, moduleId, data) { return this.rpc("kid_work_put", { p_tokens: tokens, p_module: moduleId, p_data: data }); }
    kidModules(token) { return this.rpc("kid_modules", { p_token: token }); }
    /* Modul-Editor */
    listMyModules() { return this.q(this.sb.from("teacher_modules").select("id,data,published,updated_at").order("created_at")); }
    async saveModule(id, data, published) {
      const row = { data, published: !!published, updated_at: new Date().toISOString() };
      if (id) { await this.q(this.sb.from("teacher_modules").update(row).eq("id", id)); return id; }
      const r = await this.q(this.sb.from("teacher_modules").insert(row).select("id").single()); return r.id;
    }
    deleteModule(id) { return this.q(this.sb.from("teacher_modules").delete().eq("id", id)); }
    /* Hochgeladene HTML-Module */
    kidUploads(token) { return this.rpc("kid_uploads", { p_token: token }); }
    kidUploadHtml(token, id) { return this.rpc("kid_upload_html", { p_token: token, p_id: id }); }
    listUploads() { return this.q(this.sb.from("teacher_uploads").select("id,meta,published,updated_at").order("created_at")); }
    async uploadHtml(id) { const r = await this.q(this.sb.from("teacher_uploads").select("html").eq("id", id).single()); return r.html; }
    async saveUpload(id, meta, html, published) {
      const row = { meta, published: !!published, updated_at: new Date().toISOString() }; if (html != null) row.html = html;
      if (id) { await this.q(this.sb.from("teacher_uploads").update(row).eq("id", id)); return id; }
      const r = await this.q(this.sb.from("teacher_uploads").insert(row).select("id").single()); return r.id;
    }
    deleteUpload(id) { return this.q(this.sb.from("teacher_uploads").delete().eq("id", id)); }

    /* Lehrperson */
    async teacher() { const { data } = await this.sb.auth.getSession(); return data.session ? { email: data.session.user.email } : null; }
    async teacherSignIn(email, pw) {
      const { error } = await this.sb.auth.signInWithPassword({ email, password: pw });
      if (error) throw new Error(error.message.includes("Invalid") ? "E-Mail oder Passwort stimmt nicht." : error.message);
    }
    async teacherSignUp(email, pw) {
      const { data, error } = await this.sb.auth.signUp({ email, password: pw });
      if (error) throw new Error(error.message);
      return data.session ? "ok" : "bestaetigen";
    }
    async teacherSignOut() { await this.sb.auth.signOut(); }
    async q(p) { const { data, error } = await p; if (error) throw new Error(error.message); return data; }
    listClasses() { return this.q(this.sb.from("classes").select("id,name,code,settings,created_at").order("created_at")); }
    saveClassSettings(id, settings) { return this.q(this.sb.from("classes").update({ settings: settings || {} }).eq("id", id)); }
    async createClass(name) {
      for (let i = 0; i < 5; i++) {
        const { data, error } = await this.sb.from("classes").insert({ name: cleanName(name).slice(0, 40), code: randCode() }).select().single();
        if (!error) return data;
        if (!String(error.message).includes("duplicate")) throw new Error(error.message);
      }
      throw new Error("Kein freier Klassencode gefunden. Versuch es nochmal.");
    }
    deleteClass(id) { return this.q(this.sb.from("classes").delete().eq("id", id)); }
    listStudents(classId) { return this.q(this.sb.from("students").select("id,first_name,color,pin,is_teacher").eq("class_id", classId).order("is_teacher", { ascending: false }).order("first_name")); }
    async addStudents(classId, names) {
      const rows = names.map(cleanName).filter(Boolean).map((n, i) => ({ class_id: classId, first_name: n, pin: randPin(), color: COLORS[i % COLORS.length] }));
      if (!rows.length) return [];
      return this.q(this.sb.from("students").insert(rows).select());
    }
    updateStudent(id, patch) { return this.q(this.sb.from("students").update(patch).eq("id", id)); }
    newPin(id) { return this.updateStudent(id, { pin: randPin(), fails: 0, locked_until: null }); }
    deleteStudent(id) { return this.q(this.sb.from("students").delete().eq("id", id)); }
    async classProgress(classId) {
      const ids = (await this.listStudents(classId)).map(s => s.id);
      if (!ids.length) return [];
      return this.q(this.sb.from("progress").select("student_id,module_id,activity_id,stars,data,team,updated_at").in("student_id", ids));
    }
    async resetProgress(studentId) {
      await this.q(this.sb.from("progress").delete().eq("student_id", studentId));
      await this.q(this.sb.from("work").delete().eq("student_id", studentId));
      await this.q(this.sb.from("extras").delete().eq("student_id", studentId));
    }
    setModStatus(studentId, moduleId, status) {
      if (!status) return this.q(this.sb.from("progress").delete().eq("student_id", studentId).eq("module_id", moduleId).eq("activity_id", "lp-status"));
      return this.q(this.sb.from("progress").upsert({ student_id: studentId, module_id: moduleId, activity_id: "lp-status", stars: 0, data: { status, at: new Date().toISOString() } }));
    }
    testUnlock(studentId, stars, badges) {
      return this.q(this.sb.from("progress").upsert({ student_id: studentId, module_id: "test", activity_id: "alles", stars, data: { badges, fed: 7, deaths: 1 } }));
    }
  }

  /* =================================================================
     Demo (nur dieses Gerät)
     ================================================================= */
  class DemoBackend {
    constructor() {
      this.mode = "demo";
      this.key = "glhub.demo.v1";
      this.db = this.load();
      if (!this.db) { this.db = this.seed(); this.save(); }
    }
    load() {
      try { const d = JSON.parse(localStorage.getItem(this.key)); if (d) { d.extras = d.extras || {}; d.work = d.work || []; d.mods = d.mods || []; d.uploads = d.uploads || [];
        (d.classes || []).forEach(c => { if (!d.students.some(s => s.class_id === c.id && s.is_teacher)) d.students.unshift({ id: c.id === "demo-6i" ? "demo-lp" : "lp-" + c.id, class_id: c.id, first_name: "Lehrperson", pin: c.id === "demo-6i" ? "8-8-8" : randPin(), color: "#FFC21A", is_teacher: true, fails: 0, locked_until: 0 }); }); } return d; }
      catch (e) { return null; }
    }
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.db)); } catch (e) { /* privat: nur im Speicher */ } }
    uid() { return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).toString(); }
    seed() {
      const cid = "demo-6i";
      const kids = [["Anna", "4-1-7"], ["Elias", "0-3-5"], ["Lea", "2-2-8"], ["Max", "1-6-3"], ["Mia", "5-0-4"], ["Noah", "7-7-2"], ["Sofia", "3-8-1"], ["Yanis", "6-4-0"]];
      return {
        classes: [{ id: cid, name: "6i Demo", code: "DEMO-6I", teacher: "demo", created_at: new Date().toISOString() }],
        students: [{ id: "demo-lp", class_id: cid, first_name: "Lehrperson", pin: "8-8-8", color: "#FFC21A", is_teacher: true, fails: 0, locked_until: 0 }]
          .concat(kids.map(([n, p], i) => ({ id: "demo-" + n.toLowerCase(), class_id: cid, first_name: n, pin: p, color: COLORS[i % COLORS.length], fails: 0, locked_until: 0 }))),
        sessions: {}, progress: [], extras: {}, work: [], mods: [], uploads: [], teacher: null
      };
    }
    wait(v) { return new Promise(r => setTimeout(() => r(v), 120)); }
    kid(token) {
      const sid = this.db.sessions[token];
      const s = sid && this.db.students.find(x => x.id === sid);
      if (!s) throw new GLError("SITZUNG_UNGUELTIG");
      return s;
    }
    pub(s) { return { id: s.id, first_name: s.first_name, color: s.color, class_id: s.class_id, is_teacher: !!s.is_teacher }; }

    async classByCode(code) {
      const c = this.db.classes.find(c => c.code === String(code).trim().toUpperCase());
      if (!c) throw new GLError("KLASSE_FEHLT");
      const students = this.db.students.filter(s => s.class_id === c.id).sort((a, b) => (b.is_teacher ? 1 : 0) - (a.is_teacher ? 1 : 0) || a.first_name.localeCompare(b.first_name, "de"))
        .map(s => ({ id: s.id, first_name: s.first_name, color: s.color, is_teacher: !!s.is_teacher, outfit: (this.db.extras[s.id] || {}).outfit || {} }));
      return this.wait({ id: c.id, name: c.name, code: c.code, students });
    }
    async login(code, studentId, pin) {
      const c = this.db.classes.find(c => c.code === String(code).trim().toUpperCase());
      const s = c && this.db.students.find(s => s.id === studentId && s.class_id === c.id);
      if (!s) throw new GLError("NICHT_GEFUNDEN");
      if (s.locked_until > Date.now()) throw new GLError("GESPERRT");
      if (s.pin !== pin) {
        s.fails = (s.fails || 0) + 1;
        if (s.fails >= 5) { s.fails = 0; s.locked_until = Date.now() + 120000; }
        this.save(); throw new GLError("PIN_FALSCH");
      }
      s.fails = 0; s.locked_until = 0;
      const token = this.uid(); this.db.sessions[token] = s.id; this.save();
      return this.wait({ token, student: this.pub(s) });
    }
    async me(token) {
      const s = this.kid(token);
      return this.wait({
        student: this.pub(s),
        class_name: (this.db.classes.find(c => c.id === s.class_id) || {}).name,
        class_settings: (this.db.classes.find(c => c.id === s.class_id) || {}).settings || {},
        extras: this.db.extras[s.id] || {},
        progress: this.db.progress.filter(p => p.student_id === s.id)
      });
    }
    async award(tokens, moduleId, activityId, stars, data) {
      const kids = tokens.map(t => this.kid(t));
      if (!kids.length || kids.length > 6 || kids.some(k => k.class_id !== kids[0].class_id)) throw new GLError("TEAM_UNGUELTIG");
      const names = kids.map(k => k.first_name);
      const out = kids.map(k => {
        let p = this.db.progress.find(p => p.student_id === k.id && p.module_id === moduleId && p.activity_id === activityId);
        const team = names.filter(n => n !== k.first_name);
        if (!p) { p = { student_id: k.id, module_id: moduleId, activity_id: activityId, stars: 0, data: {}, team: [] }; this.db.progress.push(p); }
        p.stars = Math.max(p.stars, Math.max(0, Math.min(10000, stars | 0)));
        p.data = mergeData(p.data, data);
        p.team = [...new Set([...p.team, ...team])];
        p.updated_at = new Date().toISOString();
        return { student_id: k.id, first_name: k.first_name, stars: p.stars };
      });
      this.save(); return this.wait(out);
    }
    async logout(token) { delete this.db.sessions[token]; this.save(); }
    async kidModules(token) { this.kid(token); return this.wait(this.db.mods.filter(m => m.published).map(m => ({ id: m.id, data: m.data }))); }
    async listMyModules() { return this.wait(this.db.mods.map(m => ({ ...m }))); }
    async saveModule(id, data, published) {
      let m = id && this.db.mods.find(x => x.id === id);
      if (!m) { m = { id: this.uid() }; this.db.mods.push(m); }
      Object.assign(m, { data, published: !!published, updated_at: new Date().toISOString() }); this.save(); return m.id;
    }
    async deleteModule(id) { this.db.mods = this.db.mods.filter(m => m.id !== id); this.save(); }
    /* Hochgeladene HTML-Module: Steckbrief im Demo-Speicher, die Datei in IndexedDB (grösser als localStorage) */
    idb() {
      if (this._idb) return this._idb;
      this._mem = this._mem || {};
      this._idb = new Promise(ok => { try { const r = indexedDB.open("glhub-demo", 1); r.onupgradeneeded = () => r.result.createObjectStore("html"); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); } catch (e) { ok(null); } });
      return this._idb;
    }
    async htmlPut(id, html) { this._mem = this._mem || {}; this._mem[id] = html; const db = await this.idb(); if (!db) return; await new Promise(ok => { try { const t = db.transaction("html", "readwrite"); t.objectStore("html").put(html, id); t.oncomplete = ok; t.onerror = ok; } catch (e) { ok(); } }); }
    async htmlGet(id) { if (this._mem && this._mem[id]) return this._mem[id]; const db = await this.idb(); if (!db) return null; return new Promise(ok => { try { const r = db.transaction("html").objectStore("html").get(id); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); } catch (e) { ok(null); } }); }
    async htmlDel(id) { if (this._mem) delete this._mem[id]; const db = await this.idb(); if (!db) return; try { db.transaction("html", "readwrite").objectStore("html").delete(id); } catch (e) { /* egal */ } }
    async kidUploads(token) { this.kid(token); return this.wait(this.db.uploads.filter(u => u.published).map(u => ({ id: u.id, meta: u.meta }))); }
    async kidUploadHtml(token, id) { this.kid(token); const u = this.db.uploads.find(x => x.id === id && x.published); const h = u && await this.htmlGet(id); if (!h) throw new GLError("MODUL_FEHLT"); return h; }
    async listUploads() { return this.wait(this.db.uploads.map(u => ({ ...u }))); }
    async uploadHtml(id) { return this.htmlGet(id); }
    async saveUpload(id, meta, html, published) {
      let u = id && this.db.uploads.find(x => x.id === id);
      if (!u) { u = { id: this.uid() }; this.db.uploads.push(u); }
      Object.assign(u, { meta, published: !!published, updated_at: new Date().toISOString() });
      if (html != null) await this.htmlPut(u.id, html);
      this.save(); return u.id;
    }
    async deleteUpload(id) { this.db.uploads = this.db.uploads.filter(u => u.id !== id); await this.htmlDel(id); this.save(); }
    async saveExtras(token, data) { const s = this.kid(token); this.db.extras[s.id] = data || {}; this.save(); }
    async workGet(tokens, moduleId) {
      const ids = tokens.map(t => this.kid(t).id);
      const w = this.db.work.filter(x => ids.includes(x.student_id) && x.module_id === moduleId).sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
      return w ? { data: w.data, updated_at: w.updated_at } : null;
    }
    async workPut(tokens, moduleId, data) {
      const kids = tokens.map(t => this.kid(t)); const at = new Date().toISOString();
      kids.forEach(k => {
        let w = this.db.work.find(x => x.student_id === k.id && x.module_id === moduleId);
        if (!w) { w = { student_id: k.id, module_id: moduleId }; this.db.work.push(w); }
        w.data = data; w.updated_at = at;
      });
      this.save();
    }

    async teacher() { return this.db.teacher; }
    async teacherSignIn(email) { this.db.teacher = { email: email || "demo@glitchlab" }; this.save(); }
    async teacherSignUp(email) { await this.teacherSignIn(email); return "ok"; }
    async teacherSignOut() { this.db.teacher = null; this.save(); }
    async listClasses() { return this.wait(this.db.classes.map(({ teacher, ...c }) => Object.assign({ settings: {} }, c))); }
    async saveClassSettings(id, settings) { const c = this.db.classes.find(x => x.id === id); if (c) { c.settings = settings || {}; this.save(); } }
    async createClass(name) {
      let code; do { code = randCode(); } while (this.db.classes.some(c => c.code === code));
      const c = { id: this.uid(), name: cleanName(name).slice(0, 40), code, teacher: "demo", created_at: new Date().toISOString() };
      this.db.classes.push(c);
      this.db.students.push({ id: this.uid(), class_id: c.id, first_name: "Lehrperson", pin: randPin(), color: "#FFC21A", is_teacher: true, fails: 0, locked_until: 0 });
      this.save(); return this.wait(c);
    }
    async deleteClass(id) {
      const ids = this.db.students.filter(s => s.class_id === id).map(s => s.id);
      this.db.classes = this.db.classes.filter(c => c.id !== id);
      this.db.students = this.db.students.filter(s => s.class_id !== id);
      this.db.progress = this.db.progress.filter(p => !ids.includes(p.student_id));
      this.save();
    }
    async listStudents(classId) {
      return this.wait(this.db.students.filter(s => s.class_id === classId).sort((a, b) => (b.is_teacher ? 1 : 0) - (a.is_teacher ? 1 : 0) || a.first_name.localeCompare(b.first_name, "de"))
        .map(s => ({ id: s.id, first_name: s.first_name, color: s.color, pin: s.pin, is_teacher: !!s.is_teacher })));
    }
    async addStudents(classId, names) {
      const n0 = this.db.students.filter(s => s.class_id === classId).length;
      const rows = names.map(cleanName).filter(Boolean).map((n, i) => ({ id: this.uid(), class_id: classId, first_name: n, pin: randPin(), color: COLORS[(n0 + i) % COLORS.length], fails: 0, locked_until: 0 }));
      this.db.students.push(...rows); this.save(); return rows;
    }
    async updateStudent(id, patch) { Object.assign(this.db.students.find(s => s.id === id) || {}, patch); this.save(); }
    async newPin(id) { return this.updateStudent(id, { pin: randPin(), fails: 0, locked_until: 0 }); }
    async deleteStudent(id) {
      this.db.students = this.db.students.filter(s => s.id !== id);
      this.db.progress = this.db.progress.filter(p => p.student_id !== id);
      for (const t in this.db.sessions) if (this.db.sessions[t] === id) delete this.db.sessions[t];
      this.save();
    }
    async classProgress(classId) {
      const ids = this.db.students.filter(s => s.class_id === classId).map(s => s.id);
      return this.wait(this.db.progress.filter(p => ids.includes(p.student_id)));
    }
    async resetProgress(studentId) {
      this.db.progress = this.db.progress.filter(p => p.student_id !== studentId);
      this.db.work = this.db.work.filter(w => w.student_id !== studentId);
      delete this.db.extras[studentId]; this.save();
    }
    async setModStatus(studentId, moduleId, status) {
      this.db.progress = this.db.progress.filter(p => !(p.student_id === studentId && p.module_id === moduleId && p.activity_id === "lp-status"));
      if (status) this.db.progress.push({ student_id: studentId, module_id: moduleId, activity_id: "lp-status", stars: 0, data: { status, at: new Date().toISOString() }, team: [], updated_at: new Date().toISOString() });
      this.save(); return this.wait(true);
    }
    async testUnlock(studentId, stars, badges) {
      this.db.progress = this.db.progress.filter(p => !(p.student_id === studentId && p.module_id === "test"));
      this.db.progress.push({ student_id: studentId, module_id: "test", activity_id: "alles", stars, data: { badges, fed: 7, deaths: 1 }, team: [], updated_at: new Date().toISOString() });
      this.save();
    }
    resetDemo() { this.db = this.seed(); this.save(); }
  }

  /* ---------- Auswahl ---------- */
  function loadScript(src) {
    return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  }
  window.GLBackend = {
    COLORS, GLError,
    async create() {
      const c = window.GL_CONFIG || {};
      if (c.SUPABASE_URL && c.SUPABASE_ANON_KEY) {
        if (!window.supabase) await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.0/dist/umd/supabase.js");
        return new SupabaseBackend(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
      }
      return new DemoBackend();
    }
  };
})();
