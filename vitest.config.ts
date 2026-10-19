import { defineConfig } from "vitest/config";

export default defineConfig({
  // Set by scripts/build.mjs in the bundle.
  define: { __VERSION__: JSON.stringify("test") },
  // css: the stylesheet is imported as raw text ("card.css?raw"); without
  // CSS processing Vitest would hand it over empty.
  test: { include: ["test/**/*.test.ts"], environment: "node", css: true },
});
