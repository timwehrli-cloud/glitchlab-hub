/* =====================================================================
   Glitchlab-Hub · Einstellungen
   Hier trägst du nach der Einrichtung die zwei Werte aus Supabase ein
   (Supabase → Project Settings → API). Solange beide leer sind, läuft
   der Hub im Demo-Modus: Alles wird nur auf diesem Gerät gespeichert.
   ===================================================================== */
window.GL_CONFIG = {
  SUPABASE_URL: "https://twhwcypheyfivroawfkx.supabase.co",        // z. B. "https://abcdefgh.supabase.co"
  SUPABASE_ANON_KEY: "sb_publishable_560fkXWEMr-NDSIgs2-N-A_T9BV9Xn3",   // «Publishable key» (sb_publishable_…) oder «anon public» (eyJ…). Darf öffentlich sein. Nie den Secret key!
  TEACHER_NAME: "Herr Wehrli",
  TEACHER_NAME_DATIV: "Herrn Wehrli",   // für Sätze wie «Schickt es an Herrn Wehrli»
  TEACHER_PIN: "4313",                  // Freigabe-Code im gLiTCh-Lab (nur Ziffern 1–9, 4–8 Stellen)
  // Link zum gLiTCh-Editor (Module mit KI erstellen). Leer lassen, um den Knopf auszublenden.
  EDITOR_URL: "https://claude.ai/artifact/XSQgRzzSRHCW2AoEkqLgEV"
};
