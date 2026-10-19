// Bundles src/index.ts into dist/vi-climate-cards.js, the single file that
// Home Assistant loads as a dashboard resource.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// Version: package version plus the git revision, ".dirty" with uncommitted
// changes. It is printed in the banner, so a deployed file names its source.
function revision() {
  try {
    const sh = (cmd) =>
      execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim();
    return sh("git rev-parse --short HEAD") + (sh("git status --porcelain") ? ".dirty" : "");
  } catch {
    return "dev";
  }
}
const version = `${pkg.version}+${revision()}`;

// "file?raw" imports the file content as a string, as Vite does in the tests.
const raw = {
  name: "raw",
  setup(b) {
    b.onResolve({ filter: /\?raw$/ }, (a) => ({
      path: path.resolve(a.resolveDir, a.path.slice(0, -4)),
      namespace: "raw",
    }));
    b.onLoad({ filter: /.*/, namespace: "raw" }, async (a) => ({
      contents: await readFile(a.path, "utf8"),
      loader: "text",
    }));
  },
};

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/vi-climate-cards.js",
  bundle: true,
  format: "esm",
  target: "es2022",
  minify: true,
  legalComments: "none",
  charset: "utf8",
  banner: { js: `/* vi-climate-cards ${version} */` },
  define: { __VERSION__: JSON.stringify(version) },
  plugins: [raw],
  logLevel: "warning",
});
const size = readFileSync("dist/vi-climate-cards.js").length;
console.log(`dist/vi-climate-cards.js ${version} ${size} bytes`);
