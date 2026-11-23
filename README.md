# Lichtweg

Ein ruhiges Licht-Puzzle in einer einzigen HTML-Datei: Spiegel drehen, den Strahl durch alle Kristalle in die Linse lenken.

- **Spielen:** `index.html` im Browser öffnen (oder `python -m http.server 8765` und http://localhost:8765).
- **Steuerung:** Klick/Tippen dreht einen Spiegel · `R` Neustart · `←`/`→` Level · `M` Ton.
- **Level:** unendlich viele, deterministisch aus der Levelnummer erzeugt. Der Generator legt zuerst einen
  Lösungsweg, setzt Spiegel an die Knicke und verdreht sie danach. So ist jedes Level garantiert lösbar.
  „Ziel“ ist die Zahl der verdrehten Spiegel.
- Kristalle färben das Licht, das sie durchquert. Bronze-Spiegel mit Nieten sind fest.
- Fortschritt und Sterne liegen im `localStorage`.
