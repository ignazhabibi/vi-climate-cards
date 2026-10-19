// vi-climate-cards: Home Assistant dashboard cards for the Viessmann
// Vitocal 250-A. Registers both cards; this file is the bundle entry. It
// exports nothing, so the bundle also loads as a classic script (test page).
import { ViHydraulicCard } from "./hydraulic/card";
import { ViRefrigerantCard } from "./refrigerant/card";

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string }[];
  }
}

const cards: [type: string, cls: CustomElementConstructor, name: string, description: string][] = [
  [
    "vi-hydraulic-card",
    ViHydraulicCard,
    "Viessmann Anlagenschema",
    "Hydraulikschema der Vitocal 250-A mit Live-Werten",
  ],
  ["vi-refrigerant-card", ViRefrigerantCard, "Viessmann Kältekreis", "Kältekreis der Vitocal 250-A mit Live-Werten"],
];

for (const [type, cls, name, description] of cards) {
  if (customElements.get(type)) continue;
  customElements.define(type, cls);
  window.customCards = window.customCards || [];
  window.customCards.push({ type, name, description });
}
