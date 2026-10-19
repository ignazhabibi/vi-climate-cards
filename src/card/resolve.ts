// Which entity drives which part of the drawing: the integration's entities
// of the device, overridden key by key by the card's `entities` option.
import { discoverEntities, findHeatPumpDevice } from "../sources/vi-climate-devices";
import type { CardConfig } from "./config";
import type { Hass } from "./hass";
import type { Slot } from "./slots";

export function resolveEntities(hass: Hass, config: CardConfig, slots: Slot[]): Record<string, string> {
  const device = config.device || findHeatPumpDevice(hass);
  const entities = device ? discoverEntities(hass, device, slots) : {};
  // An entity in `entities` wins; `null` (`key:` without a value in YAML)
  // hides the part even if the integration provides it. An empty string, as
  // a cleared editor field leaves it, means "found automatically".
  for (const [key, id] of Object.entries(config.entities ?? {})) {
    if (id) entities[key] = id;
    else if (id === null) delete entities[key];
  }
  return entities;
}

/** Slots that are settled: they have an entity, or `entities` hides them. */
export const isSettled = (slot: Slot, entities: Record<string, string>, config: CardConfig): boolean =>
  !!entities[slot.key] || config.entities?.[slot.key] === null;
