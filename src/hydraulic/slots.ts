import { COMMON_SLOTS as C, fanSlot, type Slot } from "../card/slots";

/** Everything the hydraulic schematic shows (Vitocal 250-A with one heating
 * circuit, external buffer, and DHW tank). */
export const HYDRAULIC_SLOTS: Slot[] = [
  {
    key: "valve",
    label: "4/3-Wege-Ventil",
    domain: "sensor",
    required: true,
    feature: "heating.valves.fourThreeWay.position",
  },
  { ...C.volumetric_flow, required: true },
  C.compressor,
  C.primary_supply,
  fanSlot("fan", 0),
  fanSlot("fan_2", 1),
  C.secondary_supply,
  C.return,
  {
    key: "generator_supply",
    label: "Vorlauf Erzeuger",
    domain: "sensor",
    feature: "heating.boiler.sensors.temperature.commonSupply",
  },
  {
    key: "internal_pump",
    label: "Interne Pumpe",
    domain: "sensor",
    feature: "heating.boiler.pumps.internal.current",
  },
  { key: "heater", label: "Heizstab", domain: "sensor", translationKey: "heating_rod_stage" },
  {
    key: "noise_reduction",
    label: "Geräuschreduzierung",
    domain: "sensor",
    feature: "heating.noise.reduction.operating.programs.active",
  },
  C.defrost,
  {
    key: "circuit_supply",
    label: "Vorlauf Heizkreis",
    domain: "sensor",
    feature: "heating.circuits.0.sensors.temperature.supply",
  },
  {
    key: "circuit_pump",
    label: "Heizkreispumpe",
    domain: "binary_sensor",
    feature: "heating.circuits.0.circulation.pump.status",
  },
  {
    key: "buffer",
    label: "Puffer",
    domain: "sensor",
    feature: "heating.bufferCylinder.sensors.temperature.main",
  },
  {
    key: "dhw",
    label: "Warmwasser",
    domain: "sensor",
    feature: "heating.dhw.sensors.temperature.hotWaterStorage",
  },
  {
    key: "circulation_pump",
    label: "Zirkulationspumpe",
    domain: "binary_sensor",
    feature: "heating.dhw.pumps.circulation.status",
  },
  // Opened by tapping the tank and the radiator. With several heating
  // circuits the first climate entity of the device is taken.
  { key: "water_heater", label: "Warmwasserspeicher", domain: "water_heater" },
  { key: "climate", label: "Heizkreis", domain: "climate" },
];
