# Lichtweg – Roadmap

Gepflegt von Claude, abgenommen vom Repo-Besitzer. Jede Stufe kommt als eigener Pull Request.

Leitlinie: Das Spiel bleibt **eine HTML-Datei ohne Abhängigkeiten und ohne Server**. Es soll ruhig, schön und
fair bleiben. Jedes Level ist garantiert lösbar, weil der Generator den Lösungsweg zuerst legt.

## ✅ Erledigt
- **v1 – Grundspiel:** Spiegel drehen, Kristalle färben das Licht, unendlich viele Level, Sterne, Ton.
- **v2 – Tagesrätsel:** ein Level pro Tag, für alle gleich (aus dem Datum erzeugt), Serie, Ergebnis teilen, Link `#heute`.

## Als Nächstes

### 1. Komfort, der fehlt (klein)
- **Rückgängig** (`Z` / Button), damit man nicht neu starten muss.
- **Levelübersicht:** Raster aller freigeschalteten Level mit Sternen, statt nur ‹ ›.
- **Tastatur und Barrierefreiheit:** Spiegel per Pfeiltasten anwählen und mit Leertaste drehen. Kristalle bekommen
  zusätzlich zur Farbe eine Form (Raute, Dreieck, Kreis …), damit man sie auch bei Farbfehlsichtigkeit unterscheidet.

### 2. Neue Mechaniken (das Herzstück)
Jede Mechanik wird im Generator rückwärts gebaut und ist damit automatisch lösbar. Sie wird mit einem kurzen Hinweis-Level eingeführt.
- **Farbtore:** lassen nur Licht in ihrer Farbe durch. Dadurch zählt die *Reihenfolge* der Kristalle, nicht nur, dass alle getroffen werden.
- **Strahlteiler:** halbdurchlässige Spiegel teilen das Licht. Zwei Strahlen müssen gleichzeitig zwei Linsen treffen.
- **Portale:** ein Paar, das den Strahl versetzt weiterführt.
- **Drehprismen mit vier Stellungen** statt zwei, für spätere Level.

### 3. Selbst bauen und teilen
- **Level-Editor:** Felder setzen, Lösung testen, dann als Link teilen. Das Level steckt komprimiert in der URL
  (`#l=…`), es braucht also keinen Server.
- **Seed-Links:** `#seed=1234` für „versuch mal dieses hier“.

### 4. Zuhause auf dem Handy
- **PWA:** Manifest und Service Worker. Dann lässt sich das Spiel auf dem Homescreen installieren und spielt offline.
- **Sanfte Haptik** (`navigator.vibrate`) beim Drehen und Lösen.

### 5. Klang und Atmosphäre
- Leiser, generativer Hintergrund-Drone, der mit jedem leuchtenden Kristall eine Stimme dazubekommt.
- Tageszeit-Himmel: Das Tagesrätsel hat morgens, mittags und nachts einen anderen Himmel.

## Bewusst nicht geplant
- Konten, Bestenlisten mit Server, Werbung, Tracking.
- Zeitdruck. Lichtweg ist ein ruhiges Spiel.
