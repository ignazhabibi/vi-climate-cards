// The entity keys a card draws, as data: what each one shows, which domain it
// expects, and how the vi_climate_devices integration provides it. Discovery
// and the card editor are built from these tables.
import { fill, T } from "../i18n";

const P = T.parts;

export interface Slot {
  /** Key in the card's `entities` option. */
  key: string;
  /** Name of the part, from the dictionary. */
  label: string;
  domain: "sensor" | "binary_sensor" | "water_heater" | "climate";
  /** The card cannot draw without it. */
  required?: boolean;
  /** Viessmann API feature in the entity's `viessmann_feature_name` attribute. */
  feature?: string;
  /** For entities that share a feature (status sensors): their translation key. */
  translationKey?: string;
  // Without feature and translation key, the device's entity of the domain is
  // used (water heater, heating circuit).
}

/** Measured values and states shared by both cards. */
export const COMMON_SLOTS: Record<string, Slot> = {
  // The operating phase for the header; it shares its feature with the
  // heating rod stage, so the translation key finds it.
  state: { key: "state", label: P.state, domain: "sensor", translationKey: "heat_pump_state" },
  compressor: {
    key: "compressor",
    label: P.compressor,
    domain: "binary_sensor",
    feature: "heating.compressors.0.active",
  },
  primary_supply: {
    key: "primary_supply",
    label: P.primary_supply,
    domain: "sensor",
    feature: "heating.primaryCircuit.sensors.temperature.supply",
  },
  secondary_supply: {
    key: "secondary_supply",
    label: P.secondary_supply,
    domain: "sensor",
    feature: "heating.secondaryCircuit.sensors.temperature.supply",
  },
  return: {
    key: "return",
    label: P.return,
    domain: "sensor",
    feature: "heating.sensors.temperature.return",
  },
  volumetric_flow: {
    key: "volumetric_flow",
    label: P.volumetric_flow,
    domain: "sensor",
    feature: "heating.sensors.volumetricFlow.allengra",
  },
  defrost: {
    key: "defrost",
    label: P.defrost,
    domain: "binary_sensor",
    feature: "heating.outdoor.defrosting.active",
  },
};

/** A fan of the outdoor unit; index 0 is the first fan. */
export const fanSlot = (key: string, index: number): Slot => ({
  key,
  label: fill(P.fan, { n: index + 1 }),
  domain: "sensor",
  feature: `heating.primaryCircuit.fans.${index}.current`,
});
