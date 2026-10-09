/**
 * Acceptance smoke: Berbagai pasar + start week + UM survive reload;
 * empty storage still defaults to satu-pasar.
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE = process.env.PINJEM_URL ?? "http://127.0.0.1:8080";

async function readState(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("pinjem100-v2");
    if (!raw) return { empty: true };
    const parsed = JSON.parse(raw);
    const state = parsed.state ?? parsed;
    const list = state.mode === "berbagai-pasar" ? state.berbagai : state.satu;
    const p1 = list?.[0];
    return {
      empty: false,
      mode: state.mode,
      p1Id: p1?.id,
      startWeek: p1?.startWeek,
      umPercent: p1?.terms?.umPercent,
      hydratedHint: typeof window !== "undefined",
    };
  });
}

async function waitHydrated(page) {
  await page.waitForFunction(() => {
    const el = document.body?.dataset;
    // After client rehydrate, store writes journal via StatsBeacon → key exists
    // or we can poke the zustand API if exposed. Prefer localStorage merge.
    return localStorage.getItem("pinjem100-v2") != null;
  }, { timeout: 15_000 });
  // Allow StatsBeacon post-hydration write to settle without racing.
  await page.waitForTimeout(300);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // --- new visitor default ---
  await page.goto(`${BASE}/portofolio`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await waitHydrated(page);
  let st = await readState(page);
  assert.equal(st.mode, "satu-pasar", `new visitor mode: ${JSON.stringify(st)}`);

  // --- set berbagai + distinctive fields via store actions in page ---
  await page.goto(`${BASE}/portofolio`, { waitUntil: "networkidle" });
  await waitHydrated(page);

  // Click Berbagai pasar button in UI
  await page.getByRole("button", { name: /Berbagai pasar/i }).click();
  await page.waitForTimeout(200);

  // Change P1 start week and UM through zustand by dispatching like the UI
  await page.evaluate(() => {
    // Access store from a React fiber is hard; mutate localStorage then reload
    // is what we want to prove survives StatsBeacon — so set via UI path below.
  });

  // Go to proyek for first project of berbagai list
  await page.goto(`${BASE}/proyek`, { waitUntil: "networkidle" });
  await waitHydrated(page);

  // Select first chip if needed — ensure Drainase / P1
  const chips = page.locator("main button").filter({ hasText: /Drainase|Rumah|Finishing|Renovasi/ });
  const chipCount = await chips.count();
  assert.ok(chipCount >= 1, "project chips");
  await chips.first().click();
  await page.waitForTimeout(150);

  // Sliders: Mulai then Uang muka — Radix sliders respond to keyboard
  const mulai = page.getByRole("slider", { name: /Mulai|minggu mulai/i }).first();
  if ((await mulai.count()) === 0) {
    // Fallback: unlabeled sliders under Setting kontrak
    const sliders = page.getByRole("slider");
    await sliders.nth(0).focus();
    for (let i = 0; i < 14; i++) await page.keyboard.press("ArrowRight");
  } else {
    await mulai.focus();
    for (let i = 0; i < 14; i++) await page.keyboard.press("ArrowRight");
  }

  const um = page.getByRole("slider").nth(1);
  await um.focus();
  // Move UM down from default (~15–20) toward ~10
  for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(300);

  const before = await readState(page);
  assert.equal(before.mode, "berbagai-pasar", `before mode: ${JSON.stringify(before)}`);
  assert.ok(
    typeof before.startWeek === "number" && before.startWeek !== 7,
    `startWeek should move off default 7: ${JSON.stringify(before)}`,
  );
  assert.ok(
    typeof before.umPercent === "number",
    `umPercent missing: ${JSON.stringify(before)}`,
  );
  const umBefore = before.umPercent;
  const weekBefore = before.startWeek;

  // Hard reload — the old bug reset mode to satu-pasar here
  await page.reload({ waitUntil: "networkidle" });
  await waitHydrated(page);
  // Extra beat so a racing StatsBeacon would have overwritten if bug returned
  await page.waitForTimeout(500);

  const after = await readState(page);
  assert.equal(after.mode, "berbagai-pasar", `after reload mode: ${JSON.stringify(after)}`);
  assert.equal(after.startWeek, weekBefore, `startWeek: ${JSON.stringify({ before, after })}`);
  assert.equal(after.umPercent, umBefore, `umPercent: ${JSON.stringify({ before, after })}`);

  // new visitor again
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await waitHydrated(page);
  const fresh = await readState(page);
  assert.equal(fresh.mode, "satu-pasar", `fresh default: ${JSON.stringify(fresh)}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        before: { mode: before.mode, startWeek: weekBefore, umPercent: umBefore },
        after: { mode: after.mode, startWeek: after.startWeek, umPercent: after.umPercent },
        freshDefault: fresh.mode,
      },
      null,
      2,
    ),
  );

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
