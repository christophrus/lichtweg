# Lichtweg – Roadmap

Gepflegt von Claude, abgenommen vom Repo-Besitzer. Jede Stufe kommt als eigener Commit auf `main`.

Leitlinie: Das Spiel bleibt **eine HTML-Datei ohne Abhängigkeiten und ohne Server**. Es soll ruhig, schön und
fair bleiben. Jedes Level ist garantiert lösbar, weil der Generator den Lösungsweg zuerst legt.

## ✅ Erledigt
- **v1 – Grundspiel:** Spiegel drehen, Kristalle färben das Licht, unendlich viele Level, Sterne, Ton.
- **v2 – Tagesrätsel:** ein Level pro Tag, für alle gleich (aus dem Datum erzeugt), Serie, Ergebnis teilen, Link `#heute`.
- **v3 – Komfort:** Rückgängig, Levelübersicht mit Sternen, Bedienung nur mit Tastatur (Auswahlrahmen springt von
  Spiegel zu Spiegel), Kristallformen für Farbfehlsichtige, Ansagen für Screenreader.
- **v4 – Farbtore** (ab Level 10, Tagesrätsel ab 24.11.2026): Sie lassen nur Licht in ihrer Farbe durch, goldene Tore
  nur ungefärbtes. Level 1–9 und Tagesrätsel #1 sind unverändert. Spätere Level behalten ihren Aufbau, es kommen nur Tore dazu.
- **v5 – Als App:** Manifest, Icons, Service Worker (offline spielbar), Installieren-Knopf, Vibration, sichere
  Ränder für Notch-Handys.
- **v6 – Strahlteiler** (ab Level 22): drehbare Glasscheiben teilen das Licht, zwei Linsen müssen leuchten.
  Ein Teiler sitzt auf einem freien Feld oder ersetzt einen Spiegel des Lösungswegs. Alles Bisherige bleibt.
- **v7 – Level-Editor:** eigene Level bauen (`#bauen`), sofort testen und als Link teilen. Das Level steckt
  komprimiert in der URL (`#l=…`), ein Server ist nicht nötig. Vor dem Teilen werden die Spiegel verdreht.
- **v8 – Atmosphäre:** ein leiser Klangteppich, in dem jeder leuchtende Kristall eine eigene Stimme bekommt, und ein
  Himmel, der der Uhrzeit folgt (Nacht, Morgenrot, Tag, Abendrot).
- **v9 – Portale** (ab Level 35, wo Platz ist): Das Licht springt vom einen Portal zum anderen und kommt über einen
  Umweg mit neuen Spiegeln zum Lösungsweg zurück. Lösungsweg und Level vor 35 bleiben unverändert. Auch im Editor.
- **v10 – Zufallslevel:** neue Level in deiner Stufe aus einem zufälligen Startwert, teilbar als `#z=Stufe-Startwert`.
- **v11 – Prismen** (ab Level 45): einseitige Spiegel mit vier Stellungen. Nur die helle Seite spiegelt, die Rückseite
  schluckt das Licht. Ein Prisma kann bis zu drei Tipper brauchen. Lösungsweg und Level vor 45 bleiben unverändert.
- **v12 – Statistik** in der Levelübersicht: perfekte Level, Tagesrätsel, längste Serie, Zufallslevel.
- **v13 – Sonntagsrätsel** (ab 29.11.2026): sonntags mit Strahlteiler und Prisma. Werktage bleiben, wie sie waren.
- **v14 – Tipp, Klangteppich-Schalter, Portal-Mittwoch:** Der Tipp zeigt das erste falsche Teil und kostet einen Zug.
  Der Klangteppich lässt sich einzeln abschalten. Ab 2.12.2026 hat das Tagesrätsel mittwochs ein Portal.
- **v15 – English:** komplette englische Fassung, je nach Browsersprache, umschaltbar in der Levelübersicht.
- **v16 – Komfort:** Spielstand als Code sichern und laden, Kalender der Tagesrätsel, Rückgängig im Editor,
  ruhige Darstellung bei „Bewegung reduzieren“.
- **v17 – Editor mit Tastatur:** Pfeile, Ziffern für Werkzeuge, Leertaste, Entf, mit Ansagen für Screenreader.
- **v18 – Pflege:** Regressionstest im Repo (`node tests/regress.js`), Vorschaubild für geteilte Links.
- **v19 – Teilen mit Gesicht:** Titel für eigene Level im Link, Bild des gelösten Bretts zum Teilen.
- **v20 – QR-Codes:** Level-Links als QR-Code (Editor, Gewinnkarte), eigener Encoder, geprüft mit OpenCV.
- **v20.1 – Offline-Pflege:** Der Service Worker hält beide Kopien der Seite aktuell, alter Cache wird geräumt.
- **v21 – Formen auf dem Strahl:** Farbiges Licht zeigt die Form seines Kristalls, so sind Farbtore auch ohne
  Farbsehen lesbar. Vibration erst nach einer echten Berührung.
- **v22 – Ansagen beim Spielen:** Screenreader beschreiben das gewählte Teil (Stellung, helle Seite, Lichtweg).
- **v23 – Brett in Worten:** Taste `B` sagt das ganze Brett an, samt erreichten Linsen und Ende des Lichts.
- **v23.1:** `B` auch im Editor, Einzahl in der Ansage, erste Linse kennt ihre Koordinaten (Level unverändert).
- **v24 – Saubere Dialoge:** Unsichtbare Karten sind nicht mehr per Tab erreichbar, Übersicht, Gewinnkarte und
  QR-Karte sind Dialoge, der Fokus springt hinein und beim Schließen zurück. Geprüft mit einem Kontrast-Audit
  (alle Texte über WCAG AA, außer abgeschalteten Knöpfen).
- **v24.1:** Der Regressionstest prüft auch das Seitengerüst: doppelte IDs, tote `$(…)`- und aria-Verweise.
- **v25 – Robuster Spielstand:** Ein kaputter Eintrag im Speicher hielt das Spiel beim Start an. Jetzt wird er
  geglättet (Unlesbares bleibt unter `lichtweg-kaputt` erhalten), gesperrter oder voller Speicher wirft nicht mehr.
- **v25.1 – Links gefuzzt:** 27 kaputte und böswillige Links (HTML im Titel, abgeschnittene Codes, Riesenzahlen)
  ohne Fehler. Kaputte Zufallslevel-Links melden sich jetzt auch, Screenreader hören die Meldung.
- **v25.2 – Größere Knöpfe am Handy:** Die Spielknöpfe stehen auf schmalen Bildschirmen in eigener Zeile,
  mindestens 38×44 statt 25×36 px. Das Brett bleibt gleich groß (geprüft bei 375×812, 375×667, 320×568).
- **v26 – Rückmeldung:** Knopf in der Levelübersicht öffnet ein GitHub-Issue mit dem aktuellen Level (ohne
  persönliche Daten). Damit hat „Als Nächstes“ eine Quelle.
- **v26.1 – CI:** Regressionstest und QR-Prüfung laufen bei jedem Push in GitHub Actions, Issue-Vorlage für Rückmeldungen.
- **v26.2 – Erklärt im Tagesrätsel:** Wer nur Tagesrätsel spielt, bekommt Farbtore (ab 24.11.) im Hinweis erklärt,
  sonntags sagt der Hinweis, was Strahlteiler und Prisma tun.
- **v26.3:** Gewinn-Ansage für Screenreader wieder vollständig (seit v24 nur „Gelöst!“), jetzt mit Sternen;
  „1 Zug“ statt „1 Züge“ überall. Tagesrätsel über Mitternacht geprüft: Ergebnis und Serie stimmen.
- **v26.4 – Browser-Test:** Playwright spielt das Spiel bei jedem Push in Chromium (14 Prüfungen, auch Editor →
  Link → Lösen und Offline-Start). Gegenproben:
  fängt den Ansage-Fehler aus v24 und einen Service Worker ohne Offline-Antwort.

## Als Nächstes

Neue Mechaniken werden im Generator rückwärts gebaut und sind damit automatisch lösbar. Sie kommen mit einem
kurzen Hinweis-Level. Die Liste ist gerade abgearbeitet. Neue Punkte kommen aus dem Spielen und aus Rückmeldungen
(Knopf „Rückmeldung“ in der Levelübersicht, landet als Issue im Repo):
Was zu schwer, zu selten oder unklar ist, landet hier.

## Bewusst nicht geplant
- Konten, Bestenlisten mit Server, Werbung, Tracking.
- Zeitdruck. Lichtweg ist ein ruhiges Spiel.
- Weitere Mechaniken wie bewegliche Teile, Schalter oder Lichtzeit: Mit Spiegeln, Kristallen, Toren, Teilern, Portalen
  und Prismen ist das Brett ausgereizt. Jedes weitere Teil würde es unübersichtlicher machen, nicht schöner.
- Erfolge, Abzeichen, Belohnungen: Die Sterne und die Serie reichen. Mehr würde zum Sammeln drängen statt zum Rätseln.
- Designs und Skins: Lichtweg hat ein Aussehen, und das soll man wiedererkennen.
- Handgebaute Levelpakete: Der Generator legt unendlich viele faire Level, eigene baut jeder im Editor.
- Mehrspieler: braucht einen Server. Teilen über Links ist die ruhige Form davon.
