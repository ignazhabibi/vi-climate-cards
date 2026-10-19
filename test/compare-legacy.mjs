// Migration check: renders the test pages of the former project
// (vi-anlagenschema-card) and of this one in the same scenarios with headless
// Chrome and compares the screenshots pixel by pixel. Animations are off
// (reduced motion): a screenshot catches them in a random phase. Their CSS is
// covered by test/parity.test.ts.
// Usage: node test/compare-legacy.mjs <path to vi-anlagenschema-card>
// Writes the images to test/out/legacy-compare/; prints one line per scenario.
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const run = promisify(execFile);
const legacyDir = path.resolve(process.argv[2] ?? "../vi-anlagenschema-card");
const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, "out", "legacy-compare");
mkdirSync(out, { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// [name, card ("" hydraulic, "rf" refrigerant), query, width]
const scenarios = [];
for (const m of ["heat", "dhw", "byp", "mixed", "idle"]) {
  for (const dark of ["", "&dark=1"]) {
    for (const w of [1000, 760, 540, 380, 320]) scenarios.push([`h-${m}${dark ? "-dark" : ""}-${w}`, "", `m=${m}${dark}`, w]);
  }
}
for (const m of ["heat", "byp", "idle"]) {
  for (const dark of ["", "&dark=1"]) {
    for (const w of [1200, 790, 540, 380]) scenarios.push([`r-${m}${dark ? "-dark" : ""}-${w}`, "rf", `m=${m}${dark}`, w]);
  }
}
// Headers and the explanation dialog.
for (const [name, q, w] of [
  ["h-se-heat", "m=heat&se=1", 1000],
  ["h-se-dhw-narrow", "m=dhw&se=1", 380],
  ["h-st-mixed", "m=mixed&st=1", 760],
  ["h-info", "m=heat&info=1", 1000],
  ["r-se-heat", "m=heat&se=1", 1000],
  ["r-info-dark", "m=heat&info=1&dark=1", 1000],
]) {
  scenarios.push([name, name.startsWith("r-") ? "rf" : "", q, w]);
}

// Existing images are reused (delete test/out/legacy-compare for a fresh
// run). Headless Chrome hangs now and then, so each shot has a timeout and
// up to two retries.
async function shot(file, page, query, width) {
  if (existsSync(file)) return;
  const height = width < 700 ? 2 * width + 200 : width + 200;
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--virtual-time-budget=4000",
    "--force-prefers-reduced-motion",
    `--window-size=${width + 40},${height}`,
    `--screenshot=${file}`,
    `file://${page}?w=${width}&${query}`,
  ];
  for (let attempt = 1; ; attempt++) {
    try {
      await run(CHROME, args, { timeout: 60000, killSignal: "SIGKILL" });
      return;
    } catch (err) {
      if (attempt === 3) throw err;
    }
  }
}

async function compare([name, card, query, width]) {
  const oldFile = path.join(out, `${name}-old.png`);
  const newFile = path.join(out, `${name}-new.png`);
  await shot(oldFile, path.join(legacyDir, "test", "index.html"), card ? `card=kk&${query}` : query, width);
  await shot(newFile, path.join(here, "page", "index.html"), card ? `card=rf&${query}` : query, width);
  const a = PNG.sync.read(readFileSync(oldFile));
  const b = PNG.sync.read(readFileSync(newFile));
  if (a.width !== b.width || a.height !== b.height) return `${name}: size ${a.width}x${a.height} vs ${b.width}x${b.height}`;
  const diff = pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0 });
  return `${name}: ${diff} px differ`;
}

const results = [];
const queue = [...scenarios];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const s = queue.shift();
      results.push(await compare(s));
    }
  }),
);
results.sort();
console.log(results.join("\n"));
const bad = results.filter((r) => !r.endsWith(": 0 px differ"));
console.log(`${scenarios.length} scenarios, ${bad.length} with differences`);
