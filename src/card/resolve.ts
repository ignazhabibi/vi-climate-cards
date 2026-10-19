// Which entity drives which part of the drawing: the integration's entities
// of the device, overridden key by key by the card's `entities` option.
import { discoverEntities, findHeatPumpDevice } from "../sources/vi-climate-devices";
import type { CardConfig } from "./config";
import type { Hass } from "./hass";
import type { Slot } from "./slots";

export function resolveEntities(hass: Hass, config: CardConfig, slots: Slot[]): Record<string, string> {
  const device = config.device || findHeatPumpDevice(hass);
  const entities = device ? discoverEntities(hass, device, slots) : {};
  // An entry in `entities` wins; an empty one (`key:` or `key: null`) hides
  // the part even if the integration provides it.
  for (const [key, id] of Object.entries(config.entities ?? {})) {
    if (id) entities[key] = id;
    else delete entities[key];
  }
  return entities;
}

/** Slots that are settled: they have an entity, or `entities` hides them. */
export const isSettled = (slot: Slot, entities: Record<string, string>, config: CardConfig): boolean =>
  !!entities[slot.key] || (!!config.entities && slot.key in config.entities);
