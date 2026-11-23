# Lichtweg

Ein ruhiges Licht-Puzzle in einer einzigen HTML-Datei: Spiegel drehen, den Strahl durch alle Kristalle in die Linse lenken.

**Spielen:** https://christophrus.github.io/lichtweg/ · **Tagesrätsel:** https://christophrus.github.io/lichtweg/#heute

- **Steuerung:** Klick/Tippen dreht einen Spiegel · `R` Neustart · `←`/`→` Level · `T` Tagesrätsel · `M` Ton.
- **Level:** unendlich viele, fest aus der Levelnummer erzeugt. Der Generator legt zuerst einen
  Lösungsweg, setzt Spiegel an die Knicke und verdreht sie danach. So ist jedes Level garantiert lösbar.
  „Ziel“ ist die Zahl der verdrehten Spiegel.
- **Tagesrätsel (☀):** jeden Tag ein Rätsel, für alle gleich, aus dem Datum erzeugt. Gewertet wird der erste
  Lösungsweg des Tages, alle Züge zählen, auch über Neustarts hinweg. Gelöste Tage nacheinander ergeben eine Serie,
  das Ergebnis lässt sich als Text teilen.
- Kristalle färben das Licht, das sie durchquert. Bronze-Spiegel mit Nieten sind fest.
- Fortschritt, Sterne und Serie liegen im `localStorage` des Browsers.
- Lokal: `index.html` öffnen oder `python -m http.server 8765` starten.

Was als Nächstes kommt: [ROADMAP.md](ROADMAP.md)
