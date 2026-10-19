// Everything the cards draw, computed once on first use: the layouts of both
// cards, their explanation dialogs, and the shared stylesheet.
import type { InfoContent } from "./card/info";
import type { Layout } from "./draw/layout";
import { hydraulicInfo } from "./hydraulic/info";
import { hydraulicLayouts } from "./hydraulic/layouts";
import { refrigerantInfo } from "./refrigerant/info";
import { refrigerantLayouts } from "./refrigerant/layouts";
import { cardCss } from "./styles";

export interface Assets {
  css: string;
  hydraulic: Layout[];
  refrigerant: Layout[];
  hydraulicInfo: InfoContent;
  refrigerantInfo: InfoContent;
}

let cache: Assets | undefined;

export function assets(): Assets {
  if (!cache) {
    const hydraulic = hydraulicLayouts();
    const refrigerant = refrigerantLayouts();
    cache = {
      // Both cards share one stylesheet with the rules of all layouts.
      css: cardCss([...hydraulic, ...refrigerant].map((l) => l.css)),
      hydraulic: hydraulic.map((l) => l.layout),
      refrigerant: refrigerant.map((l) => l.layout),
      hydraulicInfo: hydraulicInfo(),
      refrigerantInfo: refrigerantInfo(),
    };
  }
  return cache;
}
