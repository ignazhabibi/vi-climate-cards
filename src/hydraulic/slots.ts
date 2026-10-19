import { COMMON_SLOTS as C, fanSlot, type Slot } from "../card/slots";
import { T } from "../i18n";

const P = T.parts;

/** Everything the hydraulic schematic shows (Vitocal 250-A with one heating
 * circuit, external buffer, and DHW tank). */
export const HYDRAULIC_SLOTS: Slot[] = [
  {
    key: "valve",
    label: P.valve,
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
    label: P.generator_supply,
    domain: "sensor",
    feature: "heating.boiler.sensors.temperature.commonSupply",
  },
  {
    key: "internal_pump",
    label: P.internal_pump,
    domain: "sensor",
    feature: "heating.boiler.pumps.internal.current",
  },
  { key: "heater", label: P.heater, domain: "sensor", translationKey: "heating_rod_stage" },
  {
    key: "noise_reduction",
    label: P.noise_reduction,
    domain: "sensor",
    feature: "heating.noise.reduction.operating.programs.active",
  },
  C.defrost,
  {
    key: "circuit_supply",
    label: P.circuit_supply,
    domain: "sensor",
    feature: "heating.circuits.0.sensors.temperature.supply",
  },
  {
    key: "circuit_pump",
    label: P.circuit_pump,
    domain: "binary_sensor",
    feature: "heating.circuits.0.circulation.pump.status",
  },
  {
    key: "buffer",
    label: P.buffer,
    domain: "sensor",
    feature: "heating.bufferCylinder.sensors.temperature.main",
  },
  {
    key: "dhw",
    label: P.dhw,
    domain: "sensor",
    feature: "heating.dhw.sensors.temperature.hotWaterStorage",
  },
  {
    key: "circulation_pump",
    label: P.circulation_pump,
    domain: "binary_sensor",
    feature: "heating.dhw.pumps.circulation.status",
  },
  // Opened by tapping the tank and the radiator. With several heating
  // circuits the first climate entity of the device is taken.
  { key: "water_heater", label: P.water_heater, domain: "water_heater" },
  { key: "climate", label: P.climate, domain: "climate" },
];
