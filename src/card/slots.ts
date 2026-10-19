// The entity keys a card draws, as data: what each one shows, which domain it
// expects, and how the vi_climate_devices integration provides it. Discovery
// and, later, the card editor are built from these tables.

export interface Slot {
  /** Key in the card's `entities` option. */
  key: string;
  /** What the drawing shows for it (German, as on the card). */
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
  compressor: {
    key: "compressor",
    label: "Verdichter",
    domain: "binary_sensor",
    feature: "heating.compressors.0.active",
  },
  primary_supply: {
    key: "primary_supply",
    label: "Primärkreis",
    domain: "sensor",
    feature: "heating.primaryCircuit.sensors.temperature.supply",
  },
  secondary_supply: {
    key: "secondary_supply",
    label: "Vorlauf Sekundärkreis",
    domain: "sensor",
    feature: "heating.secondaryCircuit.sensors.temperature.supply",
  },
  return: {
    key: "return",
    label: "Rücklauf",
    domain: "sensor",
    feature: "heating.sensors.temperature.return",
  },
  volumetric_flow: {
    key: "volumetric_flow",
    label: "Durchfluss",
    domain: "sensor",
    feature: "heating.sensors.volumetricFlow.allengra",
  },
  defrost: {
    key: "defrost",
    label: "Abtauen",
    domain: "binary_sensor",
    feature: "heating.outdoor.defrosting.active",
  },
};

/** A fan of the outdoor unit; index 0 is the first fan. */
export const fanSlot = (key: string, index: number): Slot => ({
  key,
  label: `Ventilator ${index + 1}`,
  domain: "sensor",
  feature: `heating.primaryCircuit.fans.${index}.current`,
});
