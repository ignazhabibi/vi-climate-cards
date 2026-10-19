import { defineConfig } from "vitest/config";

export default defineConfig({
  // css: the stylesheet is imported as raw text ("card.css?raw"); without
  // CSS processing Vitest would hand it over empty.
  test: { include: ["test/**/*.test.ts"], environment: "node", css: true },
});
