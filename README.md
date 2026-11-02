# Glitchlab-Hub

Die Lernplattform mit gLiTCh: Startseite mit dem Maskottchen, Fächer (M&I, NMG, Deutsch, Mathematik) und darin die Module.
Kinder haben eigene Konten, die in Klassen eingeteilt sind. Der Fortschritt (Sterne) ist auf jedem Gerät gleich.
Mehrere Kinder können als **Team auf einem Gerät** arbeiten: Alle bekommen die Sterne in ihr eigenes Konto.

Alles ist gratis: **GitHub Pages** zeigt die Webseite, **Supabase** speichert die Daten.

---

## So funktioniert es für die Kinder

1. **Klassencode** eingeben (einmal pro iPad, wird gemerkt). Beispiel: `PIXEL-4821`
2. **Namen antippen**
3. **Bild-Passwort**: drei Bilder in der richtigen Reihenfolge (z. B. 🍕 🚀 ⚽)
4. Fach wählen → Modul wählen → arbeiten → Sterne sammeln

**Teamarbeit:** Oben auf «+ Teampartner» tippen, Namen wählen, die Partnerin gibt ihr eigenes Bild-Passwort ein.
Ab jetzt gehen alle Sterne an das ganze Team (bis 4 Kinder pro Gerät). Mit dem × beim Namen wird jemand wieder entfernt.

**Sterne gehen nie verloren:** Wer eine Aufgabe wiederholt, behält immer das beste Resultat.

**gLiTChs Zimmer:** Auf der Startseite auf «gLiTChs Zimmer» tippen. Dort gibt es Garderobe, Zimmer, Emotes,
Diplome und alle Level. Sterne aus **allen Fächern** zählen zusammen. Das Outfit trägt gLiTCh überall im Hub.
Hier rüstet man alles aus: Outfits, Zimmer-Gegenstände, Hintergrund und Emotes.

**Emotes** gibt es nicht über Level, sondern über Module: «Hopp Schwiiz!» und «W» hat man von Anfang an, jedes weitere
Emote kommt mit einem geschafften Modul (z. B. «Grüezi mitenand» mit «Hallo gLiTCh!», «Richi» mit der Alten
Eidgenossenschaft, das 1.-August-Feuerwerk mit dem Prompt-Labor). Die Meme-Emotes aus dem gLiTCh-Lab sind auch dabei:
6 7 (Hallo gLiTCh!), Dab (Prompt-Labor), Käsiger Michael (Fake-News), +1000 Aura (KI-Bild), Floss (Wüsten-Game). Die Liste steht in `tools/build_lab.py` (EMOTE_REQ).

## NMG · Entdeckungsreise Schweiz

Die 8 Module aus dem gLiTCh-Lab «NMG Schweiz» (Alte Eidgenossenschaft bis «Die drei Ebenen») liegen im Thema
«Entdeckungsreise Schweiz». Jedes Modul wird frei, wenn im vorherigen alle 4 Etappen präsentiert sind.
Die Schweizer Accessoires (Sennenkäppi, Edelweiss, Alphorn …) gibt es mit den Schweizer Diplomen in der Garderobe.
Das **Chalet** als Zimmer-Hintergrund wird frei, sobald die «Alte Eidgenossenschaft» fertig ist
(Zimmer einrichten → Hintergrund).

## Deutsch · Gespräche führen

Das **Wüsten-Game** mit seinen 3 Levels. Pro Level gibt es bis zu 10 Sterne (Wasserstand ÷ 10).
Die Gruppe ist mit den Namen des Teams schon ausgefüllt. **Dschungel-Game** und **Tundra-Game** sind als «Bald» vorbereitet.

## Module aus dem gLiTCh-Lab (M&I)

| Modul | Freigeschaltet |
| --- | --- |
| Prompt-Labor | sofort |
| Fake-News-Detektiv | nach dem Diplom «Bühnen-Profi» (alle 4 Etappen im Prompt-Labor präsentiert) |
| KI-Bild oder echt? | nach allen 6 Fallakten im Fake-News-Detektiv |

- Gruppen gibt es nicht mehr separat: **Das Team auf dem Gerät ist die Gruppe.** Im Modul steht z. B. «Gruppe M+A» (Anfangsbuchstaben).
- Die Arbeit der Gruppe (z. B. der Prompt) wird alle paar Sekunden gespeichert, und zwar für jedes Teammitglied.
  Arbeitet Anna nächste Woche auf ihrem eigenen iPad weiter, findet sie den neuesten Stand.
- Der **Freigabe-Code** für die Etappen ist `4313`. Ändern kannst du ihn in `js/config.js` (`TEACHER_PIN`).
- Das Bilder-Quiz mit eigenen Fotos aus dem alten Lab ist noch nicht im Hub. «KI-Bild oder echt?» läuft ohne diesen Teil.

## So funktioniert es für dich (Lehrperson)

**Festes Lehrpersonen-Konto:** Jede Klasse hat automatisch ein Konto «Herr Wehrli» (Name in `js/config.js`), das
zuoberst in der Namensliste steht. Dort ist immer alles freigeschaltet: alle Module, alle Level, Diplome, Outfits,
Emotes und das Chalet. Das Bild-Passwort dafür steht im Lehrpersonen-Bereich bei der Klasse. Im Demo-Modus: ⭐⭐⭐.

Unten auf «Für Lehrpersonen» tippen und mit E-Mail und Passwort anmelden. Dort kannst du:

- Klassen anlegen (der Klassencode wird automatisch erstellt)
- Kinder eintragen (ein Vorname pro Zeile, Bild-Passwörter entstehen automatisch)
- **Login-Karten** anzeigen und drucken (Name, Klassencode, Bild-Passwort)
- ein neues Bild-Passwort erstellen, Sterne löschen, Kinder entfernen
- den Fortschritt pro Fach und pro Modul sehen (👥 = im Team gelöst) und das Level jedes Kindes
- **Test: alles frei** gibt einem Kind das höchste Level und alle Diplome (zum Ausprobieren von Garderobe und Zimmer).
  **Zurücksetzen** löscht Sterne, gespeicherte Arbeiten und Garderobe dieses Kindes.

---

## Spiele aus eigenen Artefakten

Im Ordner `games/` liegen fertige Spiele, die im Hub im Rahmen laufen. Mit «✓ Fertig» oben bekommen die Kinder 1 Stern:

| Fach · Thema | Spiel | Ordner |
| --- | --- | --- |
| NMG · Die Römer | Tombola Romana, Römische Statuen – Pose-Blitz, Römisches Essen – Tier-List | `tombola-romana`, `statuen-pose-blitz`, `essen-tierlist` |
| Englisch · How long does it take? | How long does it take? | `how-long` |
| Minigames · Quiz-Shows | Schweiz-Jeopardy, Herbst-Jeopardy (**nur im Lehrpersonen-Konto sichtbar**) | `jeopardy-schweiz`, `jeopardy-herbst` |

## Module hochladen (HTML-Dateien)

Im Lehrpersonen-Bereich gibt es das Feld **«Module hochladen»**. Zieh eine fertige HTML-Datei hinein, zum Beispiel aus dem gLiTCh-Editor. Der Hub liest den **Steckbrief**, einen kleinen JSON-Block (eine Datenliste in Textform) in der Datei: `<script type="application/json" id="glitchlab-modul">`. Daraus übernimmt er Titel, Fach, Thema, Aufgaben mit Sternen und die Extras.

- **Extras:** Outfits, Emotes, Zimmer-Gegenstände und Hintergründe. Nach dem Hochladen erscheinen sie im Zimmer von gLiTCh. Freigeschaltet werden sie im Modul, je nach Bedingung: `sofort`, `start`, `sterne:5`, `fertig` oder `badge:NAME`.
- **Im Modul** gibt es `window.GLHub` mit `sterne(aufgabe, n)`, `badge(name)`, `speichern(obj)`, `laden()`, `fertig()` und `beenden()`. Sterne bekommen alle im Team, die Arbeit wird auf alle Geräte synchronisiert (abgeglichen).
- **Ohne Steckbrief** geht es auch: Fach und Thema wählst du beim Hochladen. Die Kinder bekommen 1 Stern für «✓ Fertig».
- **Vorlage:** Der Knopf «Vorlage herunterladen» liefert eine Beispieldatei mit allen Erklärungen.
- Pro Modul kannst du **Testen** (Vorschau ohne Sterne), **Sichtbar/Versteckt** umschalten, eine neue Version **ersetzen** oder **löschen**. Die Dateien liegen in der Tabelle `teacher_uploads` (max. 8 MB pro Datei).

## Module pro Klasse freischalten

In jeder Klasse gibt es im Lehrpersonen-Bereich den Abschnitt **«Module für diese Klasse»**. Dort stellst du für jedes Modul ein: **Standard** (so, wie das Modul gebaut ist), **Offen**, **Gesperrt** oder **Nach dem Modul davor**. Bei «Nach dem Modul davor» wird das Modul frei, sobald das vorherige Modul im selben Thema geschafft ist, also mindestens die Hälfte der Sterne. Die Einstellung liegt in `classes.settings`. Das Lehrpersonen-Konto sieht immer alles.

## gLiTCh-Editor (Module mit KI erstellen)

Der Ordner `editor/` enthält den **gLiTCh-Editor**, ein eigenes Artefakt in claude.ai. Dort gibst du Thema, Fach, Schulstufe, Ideen, PDFs, Word-Dateien und Links ein und wählst Diplome, Outfits, Emotes, Zimmer-Gegenstände und Hintergründe. Das geht selbst oder mit «✨ Vorschlagen». gLiTCh plant danach die Etappen, schreibt die Aufgaben und zeigt eine Vorschau. Am Ende lädst du eine HTML-Datei herunter und ziehst sie hier ins Feld «Module hochladen». `editor/build.py` baut `editor/glitch-editor.html` aus `editor/src/`.

## Einrichtung (ca. 30 Minuten, einmalig)

Ohne Einrichtung läuft der Hub im **Demo-Modus**: Alles bleibt nur auf dem jeweiligen Gerät.
Für echte Konten braucht es die zwei Gratis-Dienste.

### Schritt 1: Datenbank bei Supabase

> **Supabase** ist ein Online-Speicher (Datenbank) mit Anmeldung. Gratis-Plan: 500 MB, das reicht für viele Klassen.

1. Auf [supabase.com](https://supabase.com) ein Konto erstellen (geht mit GitHub-Konto oder E-Mail).
2. **New project** → Name `glitchlab-hub`, ein sicheres Datenbank-Passwort (gut aufbewahren),
   **Region: Central Europe (Zurich)**. So bleiben die Daten in der Schweiz.
3. Warten, bis das Projekt bereit ist (1–2 Minuten).
4. Links auf **SQL Editor** → **New query** → den ganzen Inhalt von `supabase/schema.sql` hineinkopieren → **Run**.
   Supabase warnt eventuell vor einer «destructive operation» (die Datei löscht alte Regeln, bevor sie neue anlegt) → **Run this query**.
   Es sollte «Success. No rows returned» erscheinen. Die Datei darf später jederzeit nochmals ausgeführt werden (nach Updates).
5. Links auf **Project Settings → API** (oder «Data API»). Dort kopierst du zwei Werte:
   - **Project URL** (sieht aus wie `https://abcdefgh.supabase.co`)
   - **Publishable key** (beginnt mit `sb_publishable_…`) oder bei älteren Projekten der **anon public key** (beginnt mit `eyJ…`).
     Nie den **Secret key** / **service_role key** nehmen!
6. Die Datei `js/config.js` öffnen und die zwei Werte zwischen die Anführungszeichen setzen.

> Der «anon key» darf öffentlich sein. Die Datenbank schützt sich selbst: Kinder kommen nur mit Klassencode und
> Bild-Passwort an ihre Daten, und Lehrpersonen sehen nur ihre eigenen Klassen.

### Schritt 2: Webseite bei GitHub Pages

> **GitHub** speichert die Dateien der Webseite. **GitHub Pages** macht daraus gratis eine Webseite mit eigenem Link.

1. Auf [github.com](https://github.com) ein Konto erstellen.
2. Oben rechts **+ → New repository** → Name `glitchlab-hub` → **Public** → **Create repository**.
3. Auf **uploading an existing file** klicken und den **Inhalt** des Ordners `glitchlab-hub` hineinziehen
   (`index.html`, `README.md`, `.nojekyll` und die Ordner `css`, `js`, `lab`, `games`, `editor`, `supabase`, `tools`) → **Commit changes**.
4. **Settings → Pages** → bei «Branch» `main` und `/ (root)` wählen → **Save**.
5. Nach 1–2 Minuten erscheint oben der Link, z. B. `https://dein-name.github.io/glitchlab-hub/`.
   Diesen Link öffnest du auf den iPads. Tipp: in Safari «Teilen → Zum Home-Bildschirm», dann sieht er aus wie eine App.

### Schritt 3: Dein Lehrpersonen-Konto

1. Den Link öffnen → unten «Für Lehrpersonen» → E-Mail und Passwort (mind. 8 Zeichen) → **Konto erstellen**.
2. Den Bestätigungslink in deiner E-Mail anklicken, dann anmelden.
   Damit der Link auf deinen Hub führt: in Supabase **Authentication → URL Configuration → Site URL** auf deinen
   GitHub-Pages-Link setzen (z. B. `https://dein-name.github.io/glitchlab-hub/`).
3. **Wichtig:** Danach in Supabase **Authentication → Sign In / Providers** die Option
   **«Allow new users to sign up»** ausschalten. So kann niemand sonst ein Lehrpersonen-Konto auf deinem Hub erstellen.
4. Klasse anlegen, Kinder eintragen, Login-Karten drucken. Fertig!

### Schritt 4 (empfohlen): Datenbank in den Ferien wachhalten

Supabase pausiert Gratis-Projekte, wenn eine Woche lang niemand den Hub benutzt (z. B. in den Ferien).
Die Daten bleiben erhalten. Du kannst das Projekt im Supabase-Dashboard mit **Resume project** wieder starten.

Bequemer: Die Datei `.github/workflows/wachhalten.yml` fragt alle 3 Tage kurz bei der Datenbank an.
Ordner, die mit einem Punkt beginnen, sind auf dem Mac oft unsichtbar. Darum so anlegen:
im Repository **Add file → Create new file** → als Name `.github/workflows/wachhalten.yml` eintippen →
Inhalt der Datei hineinkopieren → **Commit changes**.

---

## Datenschutz in Kürze

- Gespeichert werden nur **Vorname** (bei Bedarf mit Initial), eine Farbe, das Bild-Passwort und die Sterne.
  Keine Nachnamen, keine Geburtsdaten, keine E-Mail-Adressen der Kinder.
- Die Daten liegen in Zürich (wenn du diese Region wählst).
- Nach 5 falschen Bild-Passwörtern ist ein Konto 2 Minuten gesperrt.
- Kläre vor dem Einsatz mit der Schulleitung bzw. der Praxislehrperson, ob die Schule Online-Dienste mit Vornamen erlaubt.

---

## Neues Modul einbauen

Module sind einzelne JavaScript-Dateien. Vorlage und Erklärung stehen oben in `js/modules.js`.

Jedes Fach ist in **Themen** gegliedert (Fach → Thema → Module). Die Themen stehen oben in `js/modules.js`
(z. B. «Entdeckungsreise Schweiz», «Die Römer», «Im Gespräch»), die animierten Bilder in `js/module-art.js`.
Ein Thema ohne Module zeigt «Bald».

1. Neue Datei anlegen, z. B. `modules/nmg-schweiz.js`, darin `GLHub.registerModule({...})` mit `theme: "nmg-schweiz"`.
2. In `index.html` vor `js/app.js` einbinden: `<script src="modules/nmg-schweiz.js"></script>`
3. Hochladen. Die Sterne erscheinen automatisch auf der Fachseite, im Total und im Lehrpersonen-Bereich.

Das Modul bekommt `api.award(aufgabe, sterne, daten)`. Damit gehen die Sterne an alle Kinder im Team.
Die `id` eines Moduls und seiner Aufgaben nie mehr ändern, sonst passen die gespeicherten Sterne nicht mehr.

Mit Claude Code geht das am schnellsten: «Baue das Modul X für den Glitchlab-Hub nach der Vorlage in js/modules.js».

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Die Seite selbst |
| `css/style.css` | Aussehen (hell und dunkel) |
| `js/config.js` | **Hier** kommen die zwei Supabase-Werte hinein |
| `js/glitch.js` | gLiTCh als Pixelbild mit Stimmungen |
| `js/backend.js` | Verbindung zur Datenbank (und Demo-Modus) |
| `js/modules.js` | Fächer, Modul-Vorlage und das Startmodul «Hallo gLiTCh!» |
| `js/app.js` | Anmeldung, Team, Fächer, Lehrpersonen-Bereich |
| `js/glitch-data.js` | Outfits, Level und Diplome aus dem gLiTCh-Lab |
| `lab/index.html` | Das gLiTCh-Lab (Prompt-Labor, Fake-News-Detektiv, KI-Bild, Zimmer) |
| `lab/hub-portal.js` | Brücke zwischen Lab und Hub (wer arbeitet, Sterne, Speichern) |
| `tools/build_lab.py` | Baut `lab/` neu aus dem gLiTCh-Lab «NMG Schweiz» (+ M&I-Module aus dem älteren Lab) |
| `games/wueste/index.html` | Das Wüsten-Game (Deutsch · Gespräche führen) mit Brücke zum Hub |
| `tools/build_games.py` | Baut `games/wueste/` neu aus einer neuen Version des Wüsten-Games |
| `js/uploads.js` | Hochgeladene HTML-Module: Steckbrief lesen, Extras, Schnittstelle `GLHub`, Vorlage |
| `js/custom-modules.js` | Eigene Module aus dem Modul-Editor (Spieler für die Kinder) |
| `supabase/schema.sql` | Datenbank-Tabellen und Sicherheitsregeln |
