# Prüft den eingebauten QR-Encoder unabhängig: python tests/qr_check.py  (braucht node, numpy und opencv-python)
# Erzeugt viele QR-Codes mit dem Code aus index.html und liest sie mit zwei OpenCV-Detektoren zurück.
import json, os, random, string, subprocess, sys, tempfile
import numpy as np, cv2

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, "index.html"), encoding="utf-8").read()
a = html.index("// ---------- QR-Code"); b = html.index("function showQR", a)
js = html[a:b] + "\nconst T = JSON.parse(require('fs').readFileSync(0, 'utf8'));\nconsole.log(JSON.stringify(T.map(t => { const q = qrMatrix(t); return q && q.mods.map(r => r.map(Number).join('')); })));"

random.seed(3)
base = "https://christophrus.github.io/lichtweg/"
alpha = string.ascii_letters + string.digits + "-_"
texts = ["A", base + "#heute", base + "#z=45-123456789", base + "#l=AQcB&t=%E2%80%9EH%C3%BC%E2%80%9C", "Grüße „Lichtweg“ ✓"]
for n in range(20, 301, 20):
    for _ in range(8):
        texts.append(base + "#l=" + "".join(random.choice(alpha) for _ in range(n)))

with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
    f.write(js); path = f.name
out = subprocess.run(["node", path], input=json.dumps(texts), capture_output=True, text=True, encoding="utf-8")
os.unlink(path)
if out.returncode: print(out.stderr); sys.exit(1)

dets = [cv2.QRCodeDetector(), cv2.QRCodeDetectorAruco()]
ok = wrong = unread = 0
for t, m in zip(texts, json.loads(out.stdout)):
    if m is None: unread += 1; print("zu lang:", t[:60]); continue
    arr = np.pad(np.array([[0 if c == "1" else 255 for c in r] for r in m], dtype=np.uint8), 4, constant_values=255)
    got = [d.detectAndDecode(cv2.resize(arr, None, fx=8, fy=8, interpolation=cv2.INTER_NEAREST))[0] for d in dets]
    if t in got: ok += 1
    elif any(got): wrong += 1; print("FALSCH gelesen:", t[:60], got)
    else: unread += 1; print("nicht lesbar:", t[:60])
print(f"{ok}/{len(texts)} gelesen, {wrong} falsch, {unread} nicht lesbar")
sys.exit(0 if ok == len(texts) else 1)
