# Lichtweg

Ein ruhiges Licht-Puzzle in einer einzigen HTML-Datei: Spiegel drehen, den Strahl durch alle Kristalle in die Linse lenken.

**Spielen:** https://christophrus.github.io/lichtweg/ · **Tagesrätsel:** https://christophrus.github.io/lichtweg/#heute

- **Steuerung:** Klick/Tippen dreht einen Spiegel · `Z` / ↶ Rückgängig · `R` Neustart · `T` Tagesrätsel · `M` Ton.
  Ein Klick auf den Titel oder `L` öffnet die Levelübersicht. `N`/`P` wechseln zum nächsten oder vorherigen Level.
- **Nur mit Tastatur:** Pfeiltasten springen von Spiegel zu Spiegel, die Leertaste dreht ihn.
- **Ohne Farben unterscheidbar:** Jeder Kristall hat seine eigene Form (Raute, Dreieck, Sechseck, Stern, Kreis).
- **Level:** unendlich viele, fest aus der Levelnummer erzeugt. Der Generator legt zuerst einen
  Lösungsweg, setzt Spiegel an die Knicke und verdreht sie danach. So ist jedes Level garantiert lösbar.
  „Ziel“ ist die Zahl der verdrehten Spiegel.
- **Tagesrätsel (☀):** jeden Tag ein Rätsel, für alle gleich, aus dem Datum erzeugt. Gewertet wird der erste
  Lösungsweg des Tages, alle Züge zählen, auch über Neustarts hinweg. Gelöste Tage nacheinander ergeben eine Serie,
  das Ergebnis lässt sich als Text teilen.
- Kristalle färben das Licht, das sie durchquert. Bronze-Spiegel mit Nieten sind fest.
- **Farbtore** (ab Level 10): Sie lassen nur Licht in ihrer Farbe durch, goldene Tore nur ungefärbtes. Das Symbol im
  Tor zeigt den passenden Kristall. Tore werden erst nach dem fertigen Level gesetzt, und zwar in genau der Farbe, die
  das Licht dort auf dem Lösungsweg hat. So bleibt jedes Level lösbar.
- **Strahlteiler** (ab Level 22): drehbare Glasscheiben, die das Licht durchlassen und zugleich spiegeln. Dann gibt es
  zwei Linsen, und beide müssen leuchten. Auch hier wird der zweite Weg rückwärts gelegt.
- **Selbst bauen** (Levelübersicht → „Selbst bauen“ oder `#bauen`): Quelle, Linsen, Spiegel, Kristalle, Tore,
  Teiler, Portale und Wände setzen. Nochmal tippen dreht Spiegel, Teiler und Quelle, wechselt die Farbe von Kristall
  und Tor oder das Paar eines Portals. Der Editor zeigt, ob der Strahl schon alles erreicht. „Testen“ verdreht die Spiegel und lässt dich selbst lösen. „Link teilen“
  kopiert einen Link, in dem das ganze Level steckt (`#l=…`). Der Entwurf bleibt im Browser gespeichert.
- **Portale** (ab Level 35): Licht, das in ein Portal fällt, kommt am Partner in derselben Richtung wieder heraus.
  Punkte unter dem Ring zeigen, welche Portale zusammengehören. Der Generator legt dafür einen Umweg mit neuen Spiegeln
  an, der wieder zum Lösungsweg zurückführt.
- **Als App:** Lichtweg lässt sich auf dem Handy auf den Homescreen legen („Zum Startbildschirm“ bzw. „Als App
  installieren“ in der Levelübersicht) und läuft danach auch offline. Auf dem Handy vibriert es leicht, der ♪-Schalter
  schaltet Ton und Vibration zusammen.
- **Atmosphäre:** Unter den Glocken liegt ein leiser Klangteppich. Jeder leuchtende Kristall bringt eine eigene Stimme
  dazu. Der Himmel folgt der Uhrzeit: Nacht, Morgenrot, Tag und Abendrot.
- Fortschritt, Sterne und Serie liegen im `localStorage` des Browsers.
- Lokal: `index.html` öffnen oder `python -m http.server 8765` starten.

Was als Nächstes kommt: [ROADMAP.md](ROADMAP.md)
