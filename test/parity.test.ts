// Migration check: the TypeScript port draws exactly what the last build of
// the former Python project (vi-anlagenschema-card) drew. The fixture holds
// that build's embedded data (scripts/extract-legacy.mjs). Only the renames
// listed in `renamed` differ. Once the drawing changes on purpose, this test
// is retired.
import { describe, expect, it } from "vitest";
import type { InfoContent } from "../src/card/info";
import type { Layout } from "../src/draw/layout";
import { hydraulicInfo } from "../src/hydraulic/info";
import { hydraulicLayouts } from "../src/hydraulic/layouts";
import { refrigerantInfo } from "../src/refrigerant/info";
import { refrigerantLayouts } from "../src/refrigerant/layouts";
import { cardCss } from "../src/styles";
import legacy from "./fixtures/legacy.json";

// Renames from the port: English names for ids, classes, and pipe groups.
function renamed(s: string): string {
  return s
    .replaceAll("vas-", "vi-")
    .replace(/\bvi-kkn-/g, "vi-rfn-")
    .replace(/\bvi-kk-/g, "vi-rf-")
    .replace(/\.lay\.kkn\b/g, ".lay.rfn")
    .replace(/\.lay\.kk\b/g, ".lay.rf")
    .replace(/-c-puf\b/g, "-c-buf")
    .replace(/-c-ww\b/g, "-c-dhw")
    .replace(/-c-abt\b/g, "-c-dfb")
    .replace(/-c-eco\b/g, "-c-ihx")
    .replaceAll("data-g='hk'", "data-g='hc'");
}

const renamedLayout = (l: Layout): Layout => ({
  ...l,
  c: l.c.replace(/\bkkn\b/, "rfn").replace(/\bkk\b/, "rf"),
  svg: renamed(l.svg),
  text: renamed(l.text),
});

// Points at the first difference of two long strings.
function sameText(actual: string, expected: string, what: string): void {
  if (actual === expected) return;
  let i = 0;
  while (actual[i] === expected[i]) i++;
  const at = (s: string) => s.slice(Math.max(0, i - 80), i + 80);
  expect.fail(`${what} differs at ${i}:\n  new: …${at(actual)}…\n  old: …${at(expected)}…`);
}

function sameLayouts(actual: Layout[], expected: Layout[]): void {
  expect(actual.map((l) => l.c)).toEqual(expected.map((l) => l.c));
  actual.forEach((a, i) => {
    const e = expected[i];
    sameText(a.svg, e.svg, `${a.c} svg`);
    sameText(a.text, e.text, `${a.c} text`);
    expect(a.badges, `${a.c} badges`).toEqual(e.badges);
    expect(a.values, `${a.c} values`).toEqual(e.values);
    expect(a.dots, `${a.c} dots`).toEqual(e.dots);
  });
}

const hydraulic = hydraulicLayouts();
const refrigerant = refrigerantLayouts();

describe("parity with vi-anlagenschema-card", () => {
  it("draws the hydraulic layouts", () => {
    sameLayouts(
      hydraulic.map((l) => l.layout),
      (legacy.VAS_LAYOUTS as Layout[]).map(renamedLayout),
    );
  });

  it("draws the refrigerant layouts", () => {
    sameLayouts(
      refrigerant.map((l) => l.layout),
      (legacy.VKK_LAYOUTS as Layout[]).map(renamedLayout),
    );
  });

  it("builds the stylesheet", () => {
    const css = cardCss([...hydraulic, ...refrigerant].map((l) => l.css));
    sameText(css, renamed(legacy.VAS_CSS.replace(/^\n/, "")), "css");
  });

  it("explains both cards", () => {
    expect(hydraulicInfo()).toEqual(legacy.VAS_INFO as unknown as InfoContent);
    expect(refrigerantInfo()).toEqual(legacy.VKK_INFO as unknown as InfoContent);
  });
});
