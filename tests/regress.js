// Regressionstest für Lichtweg: node tests/regress.js
// Lädt den Spielcode direkt aus index.html (ohne Zeichnen und Ton) und prüft, was nie kaputtgehen darf:
// alte Level bleiben gleich, jedes Level und Tagesrätsel ist lösbar, Level-Links überstehen Hin- und Rückweg.
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const cut = (from, to) => { const a = html.indexOf(from), b = html.indexOf(to, a); if (a < 0 || b < 0) throw new Error("Abschnitt fehlt: " + from); return html.slice(a, b); };
const code = [
  cut('"use strict";', "// ---------- Ton"),                       // Grundlagen, Generator, Strahlverfolgung
  cut("const DAILY_START", "const starsFor"),                        // Tagesrätsel
  cut("// ---------- Eigene Level: Kodierung", "function startPlay"), // Level-Links
].join("\n");
const api = new Function(code + `
return { generate, trace, isSolved, dailyLevel, shiftDay, encodeLevel, decodeLevel, rotatable, isSunday, isPortalDay, hasPortal,
  T: { EMPTY, WALL, MIRROR, CRYSTAL, SRC, RECV, GATE, SPLIT, PORTAL, PRISM } };`)();
const { generate, trace, isSolved, dailyLevel, shiftDay, encodeLevel, decodeLevel, isSunday, isPortalDay, hasPortal, T } = api;

let failed = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "ok  " : "FEHLER"} ${name}${detail ? " – " + detail : ""}`); if (!ok) failed++; };
const sha = x => crypto.createHash("sha1").update(x).digest("hex");
const solve = L => { for (const c of L.grid.flat()) { if (c.flipped) c.o ^= 1; if (c.t === T.PRISM) c.r = c.sol; } return L; };
const needed = L => L.grid.flat().reduce((s, c) => s + (c.flipped ? 1 : 0) + (c.t === T.PRISM ? (c.sol - c.r + 4) % 4 : 0), 0);

// 1. Fingerabdruck der Level 1–60 ohne spätere Zusätze (Tore zählen als leer) – darf sich nie ändern
const fp = L => L.grid.map(r => r.map(c => (c.t === T.GATE ? 0 : c.t) + (c.t === T.MIRROR ? String(c.o) + (c.locked ? "L" : "") : "")).join("")).join("/");
const base = []; for (let n = 1; n <= 60; n++) base.push(fp(generate(n, undefined, { splitters: false, portals: false, prisms: false })));
check("Level 1–60 unverändert (Fingerabdruck)", sha(base.join("|")) === "aadc634e64957fce4f34ffe15cfe541ff73d154f");

// 2. Jede Mechanik lässt die Level vor ihrem Start in Ruhe
for (const [opt, from] of [["splitters", 22], ["portals", 35], ["prisms", 45]]) {
  let same = true;
  for (let n = 1; n < from; n++) if (JSON.stringify(generate(n).grid) !== JSON.stringify(generate(n, undefined, { [opt]: false }).grid)) same = false;
  check(`Level 1–${from - 1} ohne Einfluss von ${opt}`, same);
}

// 3. Level 1–400: verdreht ungelöst, Ziel stimmt, gelöst lösbar
let bad = [];
for (let n = 1; n <= 400; n++) {
  const L = generate(n);
  if (isSolved(L, trace(L)) || needed(L) !== L.par || L.par < 1 || !isSolved(L, trace(solve(L)))) bad.push(n);
}
check("Level 1–400 fair und lösbar", !bad.length, bad.slice(0, 10).join(", "));

// 4. Tagesrätsel: #1 unverändert, zwei Jahre lösbar, Sonntage und Mittwoche wie versprochen
const d1 = dailyLevel({ y: 2026, m: 11, d: 23 });
check("Tagesrätsel #1 unverändert", sha(fp(d1)) === "d734f990181af3f5df6dea60c2c38ada2916c67b");
let dbad = 0, wedMiss = 0;
for (let i = 0; i < 730; i++) {
  const t = shiftDay({ y: 2026, m: 11, d: 23 }, i), L = dailyLevel(t);
  if (L.par < 4 || isSolved(L, trace(L)) || !isSolved(L, trace(solve(L)))) dbad++;
  if (isPortalDay(t) && !hasPortal(L)) wedMiss++;
}
check("Tagesrätsel 2 Jahre fair und lösbar", !dbad, dbad + " Fehler");
check("Portal-Mittwoche haben ein Portal", !wedMiss, wedMiss + " ohne");

// 5. Level-Links: Hin und zurück identisch, gelöst lösbar, kaputte Codes werden abgelehnt
let cbad = 0;
for (let n = 1; n <= 300; n += 3) {
  const L = generate(n), c = encodeLevel(L), D = decodeLevel(c);
  if (!D || encodeLevel(D) !== c || c.length > 140) { cbad++; continue; }
  for (let y = 0; y < L.size; y++) for (let x = 0; x < L.size; x++) { const k = L.grid[y][x]; if (k.flipped) D.grid[y][x].o ^= 1; if (k.t === T.PRISM) D.grid[y][x].r = k.sol; }
  if (!isSolved(D, trace(D))) cbad++;
}
check("Level-Links überstehen Hin und Rückweg", !cbad, cbad + " Fehler");
check("Kaputte Links werden abgelehnt", ["", "xyz", "AQcB", "!!!"].every(c => decodeLevel(c) === null));

// 6. Zufallslevel aus beliebigen Startwerten
let sbad = 0;
for (const n of [3, 22, 45, 120]) for (let i = 0; i < 60; i++) {
  const seed = (i * 2654435761) >>> 0, L = generate(n, seed);
  if (isSolved(L, trace(L)) || !isSolved(L, trace(solve(L)))) sbad++;
}
check("Zufallslevel lösbar", !sbad, sbad + " Fehler");

// 7. Kaputter oder gesperrter Speicher hält das Spiel nicht an
const startWith = (raw, broken = false) => {
  const kept = {};
  const localStorage = { getItem: k => { if (broken) throw new Error("gesperrt"); return k === "lichtweg" ? raw : null; },
    setItem: (k, v) => { if (broken) throw new Error("voll"); kept[k] = v; } };
  const save = new Function("localStorage", cut('"use strict";', "const tx") + cut("// ---------- Zustand", "let mode =") + "\nreturn save;")(localStorage);
  return { save, kept };
};
let sv = 0;
for (const raw of ["{kaputt", "null", "[1]", "7", '{"unlocked":"x","stars":null,"daily":5}']) {
  try { const { save } = startWith(raw); if (save.unlocked !== 1 || typeof save.stars !== "object" || typeof save.daily.results !== "object") sv++; } catch { sv++; }
}
try { startWith("{}", true); } catch { sv++; }
check("Kaputter oder gesperrter Speicher wird geglättet", !sv, sv + " Fehler");
let keptOk = false; try { keptOk = startWith("{kaputt").kept["lichtweg-kaputt"] === "{kaputt"; } catch {}
check("Unlesbarer Spielstand wird aufgehoben", keptOk);
const good = startWith(JSON.stringify({ unlocked: 9, current: 4, stars: { 3: 2 }, daily: { results: { "2026-11-20": { moves: 5, par: 5, stars: 3 } }, streak: 2 } })).save;
check("Gültiger Spielstand bleibt erhalten", good.unlocked === 9 && good.current === 4 && good.stars[3] === 2 && good.daily.streak === 2 && good.daily.results["2026-11-20"].stars === 3);

// 8. Seitengerüst: jede ID nur einmal, jeder Verweis aus dem Code und aus aria-* zeigt auf etwas
const markup = html.slice(0, html.indexOf("<script>")), script = html.slice(html.indexOf("<script>"));
const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const made = [...script.matchAll(/\bid\s*=\s*"([^"]+)"/g)].map(m => m[1]);   // im Code erzeugte Elemente
const dups = ids.filter((x, i) => ids.indexOf(x) !== i);
check("Jede ID nur einmal", !dups.length, dups.join(", "));
const refs = [...new Set([...script.matchAll(/\$\("([^"]+)"\)/g)].map(m => m[1]))].filter(r => !ids.includes(r) && !made.includes(r));
check("Jedes $(…) findet sein Element", !refs.length, refs.join(", "));
const aria = [...html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)).filter(r => !ids.includes(r));
check("aria-Verweise zeigen auf vorhandene IDs", !aria.length, aria.join(", "));

// 9. Kleine Fallen, die schon einmal zugeschnappt sind
check("Kein festes „Züge“ hinter einer Zahl (1 Zug, 2 Züge)", !/\}\s*Züge/.test(script));
check("Kein innerText (liefert bei unsichtbaren Karten nichts)", !/\.innerText\b/.test(script));

console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen.` : "\nAlles in Ordnung.");
process.exit(failed ? 1 : 0);
