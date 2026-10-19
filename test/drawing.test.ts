// Regression check of everything the cards draw: SVG, overlay, badge and
// value positions, stylesheet, and explanation dialogs, kept as files in
// test/snapshots/. A change to the drawing shows up as a diff there; update
// the files on purpose with `npx vitest run -u` and review the diff.
import { describe, expect, it } from "vitest";
import type { Layout } from "../src/draw/layout";
import { hydraulicInfo } from "../src/hydraulic/info";
import { hydraulicLayouts } from "../src/hydraulic/layouts";
import { refrigerantInfo } from "../src/refrigerant/info";
import { refrigerantLayouts } from "../src/refrigerant/layouts";
import { cardCss } from "../src/styles";

// One element per line, so a diff points at the element that changed.
const lines = (markup: string) => `${markup.replaceAll("><", ">\n<")}\n`;

const placement = (l: Layout) => `${JSON.stringify({ badges: l.badges, values: l.values }, null, 1)}\n`;

const hydraulic = hydraulicLayouts();
const refrigerant = refrigerantLayouts();
const cards = [
  ["hydraulic", hydraulic],
  ["refrigerant", refrigerant],
] as const;

describe("drawing", () => {
  for (const [card, layouts] of cards) {
    for (const { layout } of layouts) {
      const name = `${card}-${layout.c.split(" ")[0]}`;
      it(`draws ${name}`, async () => {
        await expect(lines(layout.svg)).toMatchFileSnapshot(`snapshots/${name}.svg`);
        await expect(lines(layout.text)).toMatchFileSnapshot(`snapshots/${name}.text.html`);
        await expect(placement(layout)).toMatchFileSnapshot(`snapshots/${name}.json`);
      });
    }
  }

  it("builds the stylesheet", async () => {
    await expect(cardCss([...hydraulic, ...refrigerant].map((l) => l.css))).toMatchFileSnapshot("snapshots/card.css");
  });

  it("explains both cards", async () => {
    const info = { hydraulic: hydraulicInfo(), refrigerant: refrigerantInfo() };
    await expect(`${JSON.stringify(info, null, 1)}\n`).toMatchFileSnapshot("snapshots/info.json");
  });
});
