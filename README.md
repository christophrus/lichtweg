# Lichtweg

Ein ruhiges Licht-Puzzle in einer einzigen HTML-Datei: Spiegel drehen, den Strahl durch alle Kristalle in die Linse lenken.

**Spielen:** https://christophrus.github.io/lichtweg/ · **Tagesrätsel:** https://christophrus.github.io/lichtweg/#heute

- **Steuerung:** Klick/Tippen dreht einen Spiegel · `Z` / ↶ Rückgängig · `R` Neustart · `T` Tagesrätsel · `M` Ton · `H` / ? Tipp.
  Ein Klick auf den Titel oder `L` öffnet die Levelübersicht. `N`/`P` wechseln zum nächsten oder vorherigen Level.
- **Nur mit Tastatur:** Pfeiltasten springen von Spiegel zu Spiegel, die Leertaste dreht ihn. Ein Screenreader sagt an, welches Teil gewählt ist,
  wie es steht und woher das Licht kommt und wohin es geht. `B` beschreibt das ganze Brett: Quelle, Kristalle, Tore,
  Portale, Linsen und wo das Licht endet.
- **Ohne Farben unterscheidbar:** Jeder Kristall hat seine eigene Form (Raute, Dreieck, Sechseck, Stern, Kreis). Gefärbtes Licht trägt die Form seines Kristalls als kleine Zeichen auf dem Strahl.
- **Level:** unendlich viele, fest aus der Levelnummer erzeugt. Der Generator legt zuerst einen
  Lösungsweg, setzt Spiegel an die Knicke und verdreht sie danach. So ist jedes Level garantiert lösbar.
  „Ziel“ ist die Zahl der verdrehten Spiegel.
- **Tagesrätsel (☀):** jeden Tag ein Rätsel, für alle gleich, aus dem Datum erzeugt. Gewertet wird der erste
  Lösungsweg des Tages, alle Züge zählen, auch über Neustarts hinweg. Gelöste Tage nacheinander ergeben eine Serie,
  das Ergebnis lässt sich als Text teilen. Ab dem 29.11.2026 ist sonntags ein Sonntagsrätsel mit Strahlteiler und Prisma,
  ab dem 2.12.2026 mittwochs ein Portal-Mittwoch.
- **Tipp** (?): markiert das erste Teil, an dem das Licht vom Lösungsweg abkommt. Jeder Tipp kostet einen Zug.
- Kristalle färben das Licht, das sie durchquert. Bronze-Spiegel mit Nieten sind fest.
- **Farbtore** (ab Level 10): Sie lassen nur Licht in ihrer Farbe durch, goldene Tore nur ungefärbtes. Das Symbol im
  Tor zeigt den passenden Kristall. Tore werden erst nach dem fertigen Level gesetzt, und zwar in genau der Farbe, die
  das Licht dort auf dem Lösungsweg hat. So bleibt jedes Level lösbar.
- **Strahlteiler** (ab Level 22): drehbare Glasscheiben, die das Licht durchlassen und zugleich spiegeln. Dann gibt es
  zwei Linsen, und beide müssen leuchten. Auch hier wird der zweite Weg rückwärts gelegt.
- **Prismen** (ab Level 45): Sie spiegeln nur auf ihrer hellen Seite, der dunkle Glaskeil auf der Rückseite schluckt
  das Licht. Jedes Tippen dreht sie um eine Vierteldrehung, ein Prisma kann also bis zu drei Züge brauchen.
- **Zufallslevel** (Levelübersicht): ein frisches Level in deiner Stufe. Gelöst lässt es sich als Link teilen
  (`#z=Stufe-Startwert`), und wer ihn öffnet, bekommt genau dieses Level.
- **Selbst bauen** (Levelübersicht → „Selbst bauen“ oder `#bauen`): Quelle, Linsen, Spiegel, Kristalle, Tore,
  Teiler, Portale, Prismen und Wände setzen. Nochmal tippen dreht Spiegel, Teiler, Prisma und Quelle, wechselt die Farbe von Kristall
  und Tor oder das Paar eines Portals. Der Editor zeigt, ob der Strahl schon alles erreicht. „Testen“ verdreht die Spiegel und lässt dich selbst lösen. „Link teilen“
  kopiert einen Link, in dem das ganze Level steckt (`#l=…`). Der Entwurf bleibt im Browser gespeichert.
  Ein Titel (optional) reist im Link mit und erscheint beim Empfänger oben.
  „QR“ zeigt den Link als QR-Code, zum Scannen von Handy zu Handy (eigener Encoder, keine Bibliothek).
  Mit Tastatur: Pfeile wandern Feld für Feld, Ziffern wählen das Werkzeug, Leertaste setzt es, `Entf` radiert, `Z` nimmt zurück.
- **Portale** (ab Level 35): Licht, das in ein Portal fällt, kommt am Partner in derselben Richtung wieder heraus.
  Punkte unter dem Ring zeigen, welche Portale zusammengehören. Der Generator legt dafür einen Umweg mit neuen Spiegeln
  an, der wieder zum Lösungsweg zurückführt.
- **Als App:** Lichtweg lässt sich auf dem Handy auf den Homescreen legen („Zum Startbildschirm“ bzw. „Als App
  installieren“ in der Levelübersicht) und läuft danach auch offline. Auf dem Handy vibriert es leicht, der ♪-Schalter
  schaltet Ton und Vibration zusammen. Den Klangteppich allein schaltet man in der Levelübersicht aus.
- **Atmosphäre:** Unter den Glocken liegt ein leiser Klangteppich. Jeder leuchtende Kristall bringt eine eigene Stimme
  dazu. Der Himmel folgt der Uhrzeit: Nacht, Morgenrot, Tag und Abendrot.
- **Bild teilen:** Nach dem Lösen macht „Bild“ ein Foto vom gelösten Brett mit Ergebniszeile, zum Teilen oder Speichern.
- **Spielstand sichern:** In der Levelübersicht gibt es einen Code (`LW1:…`), mit dem sich der Fortschritt auf ein
  anderes Gerät mitnehmen lässt. Darüber zeigt ein Kalender die Tagesrätsel der letzten vier Wochen.
- **Ruhige Darstellung:** Wer im System „Bewegung reduzieren“ eingestellt hat, bekommt kein Flackern, Funkeln oder Kreiseln.
- **Sprache:** Deutsch oder Englisch, je nach Browser. Umschalten in der Levelübersicht.
- Fortschritt, Sterne und Serie liegen im `localStorage` des Browsers. Die Levelübersicht zeigt eine kleine Statistik
  (perfekte Level, gelöste Tagesrätsel, längste Serie, Zufallslevel).
- Lokal: `index.html` öffnen oder `python -m http.server 8765` starten.

## Entwicklung

`node tests/regress.js` prüft in unter einer Sekunde, was nie kaputtgehen darf:
- Level 1–60 und Tagesrätsel #1 bleiben gleich (Fingerabdruck).
- Neue Mechaniken lassen frühere Level in Ruhe.
- Level 1–400, zwei Jahre Tagesrätsel und Zufallslevel sind fair und lösbar.
- Level-Links überstehen Hin- und Rückweg.

Vor jeder Änderung am Generator laufen lassen.

`python tests/qr_check.py` (braucht opencv-python) liest 125 erzeugte QR-Codes mit zwei unabhängigen Decodern zurück.

Was als Nächstes kommt: [ROADMAP.md](ROADMAP.md)

## English

A calm light puzzle in a single HTML file: turn mirrors and guide the beam through every crystal into the lens.
Play at https://christophrus.github.io/lichtweg/ (daily puzzle: `#heute`). The game switches to English when your
browser isn't set to German, and the level overview has a language button. It includes endless generated levels,
a daily puzzle, colour gates, beam splitters, portals, prisms, a level editor with share links, random levels and
hints. Everything runs offline in the browser, with no accounts and no tracking.
