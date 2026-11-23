// Browser-Test für Lichtweg: spielt das Spiel in echtem Chromium und prüft, was regress.js nicht sehen kann
// (Ansagen, Dialoge, Fokus, Fehler beim Laden). Aufruf: node tests/e2e.mjs [URL], Standard http://localhost:8765/
// Braucht Playwright (npm i playwright && npx playwright install chromium); läuft in GitHub Actions.
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:8765/";
const browser = await chromium.launch();
let failed = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "ok  " : "FEHLER"} ${name}${detail ? " – " + detail : ""}`); if (!ok) failed++; };

async function page(lang = "de", setup) {
  const ctx = await browser.newContext({ locale: lang === "de" ? "de-DE" : "en-US", serviceWorkers: "block" });
  const p = await ctx.newPage();
  p.errors = [];
  p.on("pageerror", e => p.errors.push(e.message));
  p.on("console", m => { if (m.type() === "error" && !/vibrate/.test(m.text())) p.errors.push(m.text()); });
  if (setup) await p.addInitScript(setup);
  return p;
}
const solve = p => p.evaluate(() => { for (const c of L.grid.flat()) if (c.t === MIRROR && c.solO !== undefined && c.o !== c.solO) flip(c); });

// 1. Start, Level 1 lösen: Ansage mit Ergebnis, Gewinnkarte bekommt den Fokus
{
  const p = await page();
  await p.goto(base);
  await p.waitForFunction(() => typeof L !== "undefined" && L);
  await p.evaluate(() => loadLevel(1));
  await solve(p);
  await p.waitForSelector("#win.show", { timeout: 8000 });
  const said = await p.evaluate(() => [$("sr").textContent, document.activeElement.id]);
  check("Gewinn-Ansage nennt Sterne und Züge", /Gelöst! \d von 3 Sternen\. \d+ Zug/.test(said[0]), said[0]);
  check("Gewinnkarte bekommt den Fokus", ["go", "again"].includes(said[1]), said[1]);
  check("Keine Fehler beim Spielen", !p.errors.length, p.errors.join(" | "));
  await p.context().close();
}

// 2. Unsichtbare Karten sind nicht per Tab erreichbar, offene schon
{
  const p = await page();
  await p.goto(base);
  await p.waitForFunction(() => typeof L !== "undefined" && L);
  const hidden = await p.evaluate(() => [...document.querySelectorAll("#win button, .overlay button")]
    .filter(b => getComputedStyle(b).visibility !== "hidden" && !b.closest(".show")).map(b => b.id));
  check("Ausgeblendete Karten nicht fokussierbar", !hidden.length, hidden.join(", "));
  await p.keyboard.press("l");
  await p.waitForSelector("#levels.show");
  const inside = await p.evaluate(() => !!document.activeElement.closest("#levels"));
  check("Levelübersicht holt den Fokus", inside);
  await p.keyboard.press("Escape");
  await p.context().close();
}

// 3. Kaputter Spielstand hält das Spiel nicht an
{
  const p = await page("de", () => { if (!sessionStorage.getItem("done")) { localStorage.setItem("lichtweg", "{kaputt"); sessionStorage.setItem("done", 1); } });
  await p.goto(base);
  const ok = await p.waitForFunction(() => typeof L !== "undefined" && L, null, { timeout: 5000 }).then(() => true, () => false);
  check("Kaputter Spielstand: Spiel startet", ok, p.errors.join(" | "));
  await p.context().close();
}

// 4. Kaputter Link meldet sich
{
  const p = await page();
  await p.goto(base + "#z=5-");
  await p.waitForFunction(() => typeof L !== "undefined" && L);
  const hint = await p.textContent("#hint");
  check("Kaputter Zufallslevel-Link meldet sich", /kaputt/.test(hint), hint);
  await p.context().close();
}

// 5. Englisch: Brett beschreiben per Taste B
{
  const p = await page("en");
  await p.goto(base);
  await p.waitForFunction(() => typeof L !== "undefined" && L);
  await p.evaluate(() => loadLevel(1));
  await p.keyboard.press("b");
  await p.waitForFunction(() => $("sr").textContent.length > 10);
  const said = await p.textContent("#sr");
  check("Englisch: B beschreibt das Brett", /^Board 5 by 5\. Source at column/.test(said), said.slice(0, 60));
  check("Englisch: keine Fehler", !p.errors.length, p.errors.join(" | "));
  await p.context().close();
}

await browser.close();
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen.` : "\nAlles in Ordnung.");
process.exit(failed ? 1 : 0);
