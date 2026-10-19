// vi-climate-cards: Home Assistant dashboard cards for the Viessmann
// Vitocal 250-A. Registers both cards; this file is the bundle entry.
import { EDITOR_TAG, ViCardEditor } from "./card/editor-element";
import { ViHydraulicCard } from "./hydraulic/card";
import { T } from "./i18n";
import { ViRefrigerantCard } from "./refrigerant/card";

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string; preview?: boolean }[];
  }
}

const cards: [type: string, cls: CustomElementConstructor, texts: { name: string; description: string }][] = [
  ["vi-hydraulic-card", ViHydraulicCard, T.cards.hydraulic],
  ["vi-refrigerant-card", ViRefrigerantCard, T.cards.refrigerant],
];

for (const [type, cls, { name, description }] of cards) {
  if (customElements.get(type)) continue;
  customElements.define(type, cls);
  window.customCards = window.customCards || [];
  // The picker shows a live preview: the card finds the heat pump itself.
  window.customCards.push({ type, name, description, preview: true });
}

if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, ViCardEditor);
