import { describe, expect, it } from "vitest";
import hydraulicYaml from "../examples/hydraulic-card.yaml?raw";
import refrigerantYaml from "../examples/refrigerant-card.yaml?raw";
import type { CardConfig } from "../src/card/config";
import { isSettled, resolveEntities } from "../src/card/resolve";
import { HYDRAULIC_SLOTS } from "../src/hydraulic/slots";
import { REFRIGERANT_SLOTS } from "../src/refrigerant/slots";
import { findHeatPumpDevice } from "../src/sources/vi-climate-devices";
import { DEVICE, exampleEntities, vitocalHass } from "./fixtures/vitocal";

const keys = (slots: { key: string }[]) => new Set(slots.map((s) => s.key));
// The example configurations as used on the user's dashboard, without keys
// the cards no longer draw (outside_temp).
const onlySlots = (entities: Record<string, string>, slots: { key: string }[]) =>
  Object.fromEntries(Object.entries(entities).filter(([k]) => keys(slots).has(k)));

describe("discovery through vi_climate_devices", () => {
  it("finds the heat pump device", () => {
    expect(findHeatPumpDevice(vitocalHass())).toBe(DEVICE);
  });

  it("finds every entity the user mapped by hand", () => {
    const hass = vitocalHass();
    for (const [name, yaml, slots] of [
      ["hydraulic", hydraulicYaml, HYDRAULIC_SLOTS],
      ["refrigerant", refrigerantYaml, REFRIGERANT_SLOTS],
    ] as const) {
      const found = resolveEntities(hass, { type: name }, slots);
      expect(found, name).toEqual(onlySlots(exampleEntities(yaml), slots));
      expect(Object.keys(found).sort(), `${name}: every slot`).toEqual([...keys(slots)].sort());
    }
  });

  it("keeps entities of other devices, platforms, and domains apart", () => {
    const found = resolveEntities(vitocalHass(), { type: "x" }, HYDRAULIC_SLOTS);
    expect(found.noise_reduction).toBe("sensor.keller_warmepumpe_noise_reduction_operating_programs_active");
    expect(found.compressor).toBe("binary_sensor.e3_vitocal_16_verdichter_0");
    expect(found.heater).toBe("sensor.keller_warmepumpe_heizstab");
  });

  it("lets the entities option override and hide parts", () => {
    const config: CardConfig = {
      type: "x",
      entities: { dhw: "sensor.my_own_dhw", circulation_pump: null, buffer: "" },
    };
    const found = resolveEntities(vitocalHass(), config, HYDRAULIC_SLOTS);
    expect(found.dhw).toBe("sensor.my_own_dhw");
    expect(found).not.toHaveProperty("circulation_pump");
    // A cleared editor field leaves "": the part is found automatically.
    expect(found.buffer).toBe("sensor.e3_vitocal_16_pufferspeichertemperatur");
    const slot = HYDRAULIC_SLOTS.find((s) => s.key === "circulation_pump");
    expect(slot && isSettled(slot, found, config)).toBe(true);
  });

  it("finds nothing on an unknown device, and leaves unavailable entities open", () => {
    expect(resolveEntities(vitocalHass(), { type: "x", device: "nope" }, HYDRAULIC_SLOTS)).toEqual({});
    const hass = vitocalHass({ unavailable: ["sensor.e3_vitocal_16_sensors_valve_0_expansion_target"] });
    const found = resolveEntities(hass, { type: "x" }, REFRIGERANT_SLOTS);
    expect(found).not.toHaveProperty("valve_1");
    expect(found.valve_2).toBe("sensor.e3_vitocal_16_sensors_valve_1_expansion_target");
  });
});
