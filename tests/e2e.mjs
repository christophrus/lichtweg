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
  // Tab bleibt im Dialog, auch rückwärts
  let out = 0;
  for (let i = 0; i < 30; i++) { await p.keyboard.press(i < 20 ? "Tab" : "Shift+Tab"); if (!(await p.evaluate(() => !!document.activeElement.closest("#levels")))) out++; }
  check("Tab bleibt in der Levelübersicht", !out, out + "× draußen");
  // Pfeiltasten im Levelraster: rechts = nächstes Level, runter = eine Zeile tiefer, gleiche Spalte
  await p.evaluate(() => { save.unlocked = 30; closeLevels(); openLevels(); $("levelGrid").querySelector("button").focus(); });
  await p.keyboard.press("ArrowRight");
  const right = await p.evaluate(() => document.activeElement.textContent.trim());
  await p.keyboard.press("ArrowDown");
  const down = await p.evaluate(() => { const a = document.activeElement, b = $("levelGrid").querySelectorAll("button")[1];
    return [a.textContent.trim(), Math.abs(a.getBoundingClientRect().left - b.getBoundingClientRect().left) < 2, a.getBoundingClientRect().top > b.getBoundingClientRect().top]; });
  check("Pfeiltasten wandern durchs Levelraster", right === "2" && down[1] && down[2], `${right} → ${down[0]}`);
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
  // Levelübersicht ist höher als ein kleines Handy: Sie muss in den Bildschirm passen und innen scrollen
  await p.setViewportSize({ width: 320, height: 568 });
  await p.evaluate(() => { save.unlocked = 30; openLevels(); });
  await p.waitForSelector("#levels.show");
  const fit = await p.evaluate(() => { const c = $("levels").querySelector(".card"), r = c.getBoundingClientRect();
    $("feedback").scrollIntoView({ block: "nearest" }); const f = $("feedback").getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, h: innerHeight, last: f.bottom <= innerHeight && f.top >= 0 }; });
  check("Handy: Levelübersicht passt und scrollt bis unten", fit.top >= 0 && fit.bottom <= fit.h && fit.last, JSON.stringify(fit));
  // Quer: Brett nutzt die Höhe, Knöpfe rechts daneben, nichts liegt übereinander
  await p.evaluate(() => { closeLevels(); loadLevel(30); });
  await p.setViewportSize({ width: 667, height: 375 });
  await p.waitForFunction(() => document.body.classList.contains("land"));
  const q = await p.evaluate(() => {
    const board = { l: ox, r: ox + cs * L.size, t: oy, b: oy + cs * L.size };
    const hit = el => { const r = el.getBoundingClientRect(); return r.right > board.l && r.left < board.r && r.bottom > board.t && r.top < board.b; };
    const btns = [...document.querySelectorAll("#hud button")];
    return { cs: Math.round(cs), small: btns.filter(b => { const r = b.getBoundingClientRect(); return r.width < 36 || r.height < 36; }).length,
      overlap: [...btns, $("stats"), $("hint")].filter(hit).map(e => e.id), inside: board.t >= 0 && board.b <= innerHeight && board.r <= innerWidth };
  });
  check("Handy quer: Felder groß, nichts überdeckt das Brett", q.cs >= 34 && !q.small && !q.overlap.length && q.inside, JSON.stringify(q));
  // QR-Code steht in seiner Karte, quer und hochkant (eine allgemeine canvas-Regel hatte ihn herausgelöst)
  for (const [w, h] of [[667, 375], [375, 667]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.evaluate(() => showQR(location.href)); await p.waitForTimeout(450);
    const r = await p.evaluate(() => { const c = $("qrBox").querySelector(".card").getBoundingClientRect(), q = $("qrCanvas").getBoundingClientRect();
      const px = q.width * devicePixelRatio / +$("qrCanvas").dataset.n;
      return { inCard: q.top >= c.top && q.bottom <= c.bottom && q.left >= c.left && q.right <= c.right, onScreen: c.top >= 0 && c.bottom <= innerHeight,
        size: Math.round(q.width), whole: Math.abs(px - Math.round(px)) < .01 }; });
    check(`QR-Code ganz in seiner Karte, Module ganze Pixel (${w}×${h})`, r.inCard && r.onScreen && r.size >= 140 && r.whole, JSON.stringify(r));
    await p.evaluate(() => closeQR());
  }
  await p.setViewportSize({ width: 667, height: 375 });
  // Editor quer: Werkzeugspalte links neben dem Brett, bis „Fertig“ scrollbar
  await p.evaluate(() => openEditor()); await p.waitForFunction(() => mode === "edit");
  const e = await p.evaluate(() => { const t = $("tools").getBoundingClientRect(); $("edone").scrollIntoView({ block: "nearest" });
    const d = $("edone").getBoundingClientRect(); return { cs: Math.round(cs), toolsRight: Math.round(t.right), ox, done: d.bottom <= innerHeight && d.top >= 0 }; });
  check("Editor quer: Brett groß, Werkzeuge daneben", e.cs >= 34 && e.toolsRight <= e.ox && e.done, JSON.stringify(e));
  await ctx.close();
}

// 9. Archiv: Ein verpasstes Tagesrätsel nachholen, ohne Serie und heutigen Stand anzufassen (Datum: 5.12.2026)
{
  const p = await page("de", () => {
    const T = new Date(2026, 11, 5, 12).getTime(), D = Date;
    globalThis.Date = class extends D { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } };
    if (!sessionStorage.getItem("done")) { sessionStorage.setItem("done", 1);
      localStorage.setItem("lichtweg", JSON.stringify({ unlocked: 3, current: 1, stars: {}, mode: "level", daily: {
        results: { "2026-12-03": { moves: 6, par: 6, stars: 3 }, "2026-12-04": { moves: 7, par: 6, stars: 2 } },
        streak: 2, last: "2026-12-04", progress: { day: "2026-12-05", moves: 3 } } })); }
  });
  await p.goto(base);
  await p.waitForFunction(() => typeof L !== "undefined" && L);
  await p.keyboard.press("l");
  await p.waitForSelector("#levels.show");
  const cal = await p.evaluate(() => [$("cal").querySelectorAll("button").length, $("cal").querySelectorAll("i").length,
    [...$("cal").querySelectorAll("button")].filter(b => { const r = b.getBoundingClientRect(); return r.width < 24 || r.height < 24; }).length,
    $("cal").lastElementChild.className, $("cal").querySelector(".today")?.textContent]);
  check("Kalender: Tage seit #1 sind Knöpfe, Wochen von Montag bis Sonntag", cal[0] === 13 && cal[1] === 15 && cal[3] === "future" && cal[4] === "5", cal.join("/"));
  check("Kalender: Tage mindestens 24×24 px", !cal[2], cal[2] + " zu klein");
  await p.click('#cal button[aria-label*="30.11."]');
  const st = await p.evaluate(() => [mode, L.archive, location.hash, L.day]);
  check("Archivtag öffnet sich", st[0] === "daily" && st[1] === true && st[2] === "#tag=2026-11-30", st.join(" "));
  await p.evaluate(() => { for (const c of L.grid.flat()) { let g = 0;
    while (rotatable(c) && g++ < 4 && (c.t === PRISM ? c.r !== c.sol : c.solO !== undefined && c.o !== c.solO)) flip(c); } });
  await p.waitForSelector("#win.show", { timeout: 8000 });
  const d = await p.evaluate(() => save.daily);
  const lateCell = await p.evaluate(() => { openLevels(); const b = $("cal").querySelector('button[aria-label*="30.11."]'); const out = [b.className, b.getAttribute("aria-label")]; closeLevels(); return out; });
  check("Nachgeholt steht im Kalender, erkennbar als nachgeholt", d.results["2026-11-30"]?.late === true && /late/.test(lateCell[0]) && /nachgeholt/.test(lateCell[1]), lateCell.join(" | "));
  const shared = await p.evaluate(() => dailyShareText());
  check("Geteilt wird der Tag, nicht heute, und keine Serie", /#tag=2026-11-30$/.test(shared) && /nachgeholt/.test(shared) && !/Serie/.test(shared), shared);
  // 30.11. gelöst; 1.12. und 2.12. sind offen -> weiter zum 1.12.
  check("Weiter-Knopf führt zum nächsten offenen Tag", await p.evaluate(() => $("go").textContent === "Weiter: Tagesrätsel #9"), await p.evaluate(() => $("go").textContent));
  check("QR-Code des Tagesrätsels zeigt auf seinen Tag", await p.evaluate(() => currentLink().endsWith("#tag=2026-11-30")));
  await p.click("#go");
  check("Weiter öffnet den 1.12.", await p.evaluate(() => L.day === "2026-12-01" && L.archive && location.hash === "#tag=2026-12-01"));
  check("Serie und heutiger Stand bleiben", d.streak === 2 && d.last === "2026-12-04" && d.progress?.moves === 3, JSON.stringify([d.streak, d.last, d.progress]));
  await p.evaluate(() => { location.hash = "#heute"; });
  await p.waitForFunction(() => !L.archive && L.day === "2026-12-05");
  check("Zurück zu heute mit gespeicherten Zügen", await p.evaluate(() => moves === 3));
  await p.evaluate(() => { location.hash = "#tag=2026-12-07"; });
  await p.waitForTimeout(200);
  check("Zukunft lässt sich nicht öffnen, mit Erklärung", await p.evaluate(() => L.day === "2026-12-05" && !L.archive && /Mitternacht/.test($("hint").textContent)));
  await p.evaluate(() => { location.hash = "#tag=2026-11-01"; });
  await p.waitForFunction(() => /noch kein/.test($("hint").textContent), null, { timeout: 3000 }).catch(() => {});
  check("Tag vor #1 meldet sich", await p.evaluate(() => /noch kein/.test($("hint").textContent) && L.day === "2026-12-05"));
  await p.evaluate(() => loadLevel(1)); await p.evaluate(() => { location.hash = "#tag=2026-12-05"; });
  await p.waitForFunction(() => mode === "daily");
  check("Link auf heute öffnet das heutige Rätsel", await p.evaluate(() => L.day === "2026-12-05" && !L.archive && moves === 3));
  check("Archiv ohne Fehler", !p.errors.length, p.errors.join(" | "));
  await p.context().close();
}

await browser.close();
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen.` : "\nAlles in Ordnung.");
process.exit(failed ? 1 : 0);
