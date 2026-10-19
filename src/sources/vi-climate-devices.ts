// Finds the entities of a card in the vi_climate_devices integration. Every
// sensor and binary sensor of the integration names its Viessmann API feature
// in the attribute `viessmann_feature_name`, which stays the same whatever the
// entity ID or name; status sensors share one feature and differ by their
// translation key; water heater and heating circuit are found by domain.
import type { Hass } from "../card/hass";
import type { Slot } from "../card/slots";

export const PLATFORM = "vi_climate_devices";

/** A heat pump reports this feature; it picks the device without `device`. */
const HEAT_PUMP_FEATURE = "heating.compressors.0.active";

const featureOf = (hass: Hass, id: string): unknown => hass.states[id]?.attributes.viessmann_feature_name;

/** The first device of the integration that has a compressor. */
export function findHeatPumpDevice(hass: Hass): string | undefined {
  for (const [id, entry] of Object.entries(hass.entities ?? {})) {
    if (entry?.platform === PLATFORM && entry.device_id && featureOf(hass, id) === HEAT_PUMP_FEATURE) {
      return entry.device_id;
    }
  }
  return undefined;
}

/** Entity per slot key among the device's entities of the integration. */
export function discoverEntities(hass: Hass, deviceId: string, slots: Slot[]): Record<string, string> {
  // Index the device's entities once; the first entity wins on a clash.
  const index = new Map<string, string>();
  const add = (key: string, id: string) => {
    if (!index.has(key)) index.set(key, id);
  };
  for (const [id, entry] of Object.entries(hass.entities ?? {})) {
    if (entry?.platform !== PLATFORM || entry.device_id !== deviceId) continue;
    const domain = id.split(".")[0];
    const feature = featureOf(hass, id);
    if (typeof feature === "string") add(`${domain}|f|${feature}`, id);
    if (entry.translation_key) add(`${domain}|t|${entry.translation_key}`, id);
    add(`${domain}|d`, id);
  }
  const found: Record<string, string> = {};
  for (const slot of slots) {
    const key = slot.feature
      ? `${slot.domain}|f|${slot.feature}`
      : slot.translationKey
        ? `${slot.domain}|t|${slot.translationKey}`
        : `${slot.domain}|d`;
    const id = index.get(key);
    if (id) found[slot.key] = id;
  }
  return found;
}
