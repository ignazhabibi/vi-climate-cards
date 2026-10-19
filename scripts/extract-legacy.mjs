// One-off migration helper: reads the data embedded in the last build of the
// former Python project (vi-anlagenschema-card) and stores it as the parity
// fixture for test/parity.test.ts.
// Usage: node scripts/extract-legacy.mjs <path to vi-anlagenschema-card.js>
import { readFileSync, writeFileSync } from "node:fs";

const [src] = process.argv.slice(2);
if (!src) throw new Error("usage: node scripts/extract-legacy.mjs <legacy dist file>");
const js = readFileSync(src, "utf8");
const out = {};
for (const name of ["VAS_CSS", "VAS_LAYOUTS", "VKK_LAYOUTS", "VKK_INFO", "VAS_INFO"]) {
  const m = js.match(new RegExp(`^const ${name} = (.*);$`, "m"));
  if (!m) throw new Error(`${name} not found`);
  out[name] = JSON.parse(m[1]);
}
writeFileSync(new URL("../test/fixtures/legacy.json", import.meta.url), `${JSON.stringify(out, null, 1)}\n`);
console.log(Object.keys(out).join(", "));
