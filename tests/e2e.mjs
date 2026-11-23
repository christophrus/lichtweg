// Browser-Test für Lichtweg: spielt das Spiel in echtem Chromium und prüft, was regress.js nicht sehen kann
// (Ansagen, Dialoge, Fokus, Fehler beim Laden). Aufruf: node tests/e2e.mjs [URL], Standard http://localhost:8765/
// Braucht Playwright (npm i playwright && npx playwright install chromium); läuft in GitHub Actions.
// LW_BROWSER=chromium|firefox|webkit wählt die Engine (WebKit = Safari, also jedes iPhone).
import * as pw from "playwright";

const base = process.argv[2] || "http://localhost:8765/";
const engine = process.env.LW_BROWSER || "chromium";
// Lokal ohne Browser-Download: LW_CHANNEL=chrome nimmt das installierte Chrome
const browser = await pw[engine].launch(process.env.LW_CHANNEL ? { channel: process.env.LW_CHANNEL } : {});
console.log("Engine:", engine);
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

// 6. Editor: gelöstes Level teilen, Link in frischem Browser öffnen, Titel ist da, Level ist lösbar
{
  const p = await page();
  await p.goto(base + "#bauen");
  await p.waitForFunction(() => typeof mode !== "undefined" && mode === "edit");
  const [link, solvedCode] = await p.evaluate(() => {
    const lv = generate(5); for (const c of lv.grid.flat()) { if (c.flipped) c.o ^= 1; if (c.t === PRISM) c.r = c.sol; }
    openEditor(lv); $("etitle").value = "Prüfstein <b>";
    const solved = encodeLevel(L), code = scrambleForShare(); return [code && levelLink(withTitle(code)), solved];
  });
  check("Editor erzeugt einen Link", !!link);
  const q = await page();
  await q.goto(link);
  await q.waitForFunction(() => typeof mode !== "undefined" && mode === "custom");
  const title = await q.textContent("#lvl");
  check("Geteilter Titel kommt als Text an", title === "„Prüfstein <b>“", title);
  // Jedes Teil so drehen, wie es im gelösten Editor-Stand stand (wie ein Mensch durch Tippen)
  await q.evaluate(code => { const S = decodeLevel(code, true);
    for (const c of L.grid.flat()) { const s = S.grid[c.y][c.x]; let g = 0; while (rotatable(c) && (c.t === PRISM ? c.r !== s.r : c.o !== s.o) && g++ < 4) flip(c); } }, solvedCode);
  const won = await q.waitForSelector("#win.show", { timeout: 8000 }).then(() => true, () => false);
  check("Geteiltes Level ist lösbar", won);
  check("Editor und Link ohne Fehler", !p.errors.length && !q.errors.length, [...p.errors, ...q.errors].join(" | "));
  await p.context().close(); await q.context().close();
}

// 7. Offline: Nach dem ersten Besuch lädt das Spiel ohne Netz aus dem Service Worker
//    (nur Chromium: Playwright kann den Service Worker in Firefox/WebKit nicht offline schalten)
if (engine === "chromium") {
  const ctx = await browser.newContext({ locale: "de-DE" });
  const p = await ctx.newPage();
  await p.goto(base);
  const ready = await p.evaluate(() => navigator.serviceWorker.ready.then(() => true)).catch(() => false);
  await p.reload(); await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 8000 }).catch(() => {});
  await ctx.setOffline(true);
  const ok = await p.reload().then(() => p.waitForFunction(() => typeof L !== "undefined" && L, null, { timeout: 8000 })).then(() => true, () => false);
  check("Offline spielbar nach dem ersten Besuch", ready && ok);
  await ctx.close();
}

// 8. Handy: keine waagrechte Scrollleiste, Spielknöpfe groß genug zum Tippen
{
  const ctx = await browser.newContext({ locale: "de-DE", viewport: { width: 375, height: 667 }, serviceWorkers: "block",
    ...(engine === "firefox" ? {} : { isMobile: true, hasTouch: true }) });
  const p = await ctx.newPage();
  await p.goto(base);
  await p.waitForFunction(() => typeof L !== "undefined" && L);
  const m = await p.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    small: [...document.querySelectorAll("#hud > .ctrl button")].map(b => b.getBoundingClientRect()).filter(r => r.width < 36 || r.height < 40).length,
    board: cs * L.size <= innerWidth }));
  check("Handy: keine Scrollleiste, Brett passt", !m.overflow && m.board, JSON.stringify(m));
  check("Handy: Spielknöpfe mindestens 36×40 px", !m.small, m.small + " zu klein");
  // Tippen auf einen Spiegel dreht ihn (echter Touch, wo die Engine es kann)
  const turned = await p.evaluate(() => { const c = L.grid.flat().find(rotatable); return [c._x, c._y, c.o]; });
  if (engine === "firefox") await p.mouse.click(turned[0], turned[1]); else await p.touchscreen.tap(turned[0], turned[1]);
  const after = await p.evaluate(([x, y]) => { const c = L.grid.flat().find(rotatable); return c.o; }, turned);
  check("Handy: Tippen dreht den Spiegel", after !== turned[2]);
  await ctx.close();
}

await browser.close();
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen.` : "\nAlles in Ordnung.");
process.exit(failed ? 1 : 0);
