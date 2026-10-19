import { NARROW_BELOW, NARROW_MAX, RF_NARROW_BELOW, VR } from "../draw/constants";
import base from "./card.css?raw";

/** The card stylesheet: the base rules with their constants filled in, then
 * the scale rules of each layout. */
export const cardCss = (layoutCss: string[]): string =>
  base
    .replaceAll("%VR%", String(VR))
    .replaceAll("%NARROW_MAX%", String(NARROW_MAX))
    // Container queries take a max-width; just below the switch width.
    .replaceAll("%NARROW_BELOW_MAX%", String(NARROW_BELOW - 0.02))
    .replaceAll("%RF_NARROW_BELOW_MAX%", String(RF_NARROW_BELOW - 0.02)) + layoutCss.join("\n");
