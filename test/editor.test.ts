import { describe, expect, it } from "vitest";
import { buildSchema, configFromForm, type FormField, fieldHelper, fieldLabel, formData } from "../src/card/editor";
import { HYDRAULIC_SLOTS } from "../src/hydraulic/slots";
import { REFRIGERANT_SLOTS } from "../src/refrigerant/slots";

const field = (schema: FormField[], name: string) => schema.find((f) => f.name === name);

const detected = {
  device: "dev1",
  entities: { compressor: "binary_sensor.c", superheat: "sensor.sh", state: "sensor.phase" },
};
const slots = REFRIGERANT_SLOTS;

describe("card editor", () => {
  it("offers the device of the integration and the card options", () => {
    const schema = buildSchema(HYDRAULIC_SLOTS, ["vitocal-250a-buffer"]);
    expect(field(schema, "device")?.selector).toEqual({ device: { filter: { integration: "vi_climate_devices" } } });
    for (const name of ["show_state", "info", "animations"]) {
      expect(field(schema, name)).toMatchObject({ default: true, selector: { boolean: {} } });
    }
    // One drawing variant: nothing to choose.
    expect(field(schema, "preset")).toBeUndefined();
    expect(field(buildSchema(HYDRAULIC_SLOTS, ["a", "b"]), "preset")?.selector).toEqual({
      select: { mode: "dropdown", options: ["a", "b"] },
    });
  });

  it("lets every entity key be replaced, filtered by its domain", () => {
    for (const s of [HYDRAULIC_SLOTS, REFRIGERANT_SLOTS]) {
      const entities = field(buildSchema(s, []), "entities");
      expect(entities?.type).toBe("expandable");
      expect(entities?.schema?.map((f) => f.name)).toEqual(s.map((x) => x.key));
      for (const slot of s) {
        expect(field(entities?.schema ?? [], slot.key)?.selector).toEqual({
          entity: { filter: { domain: slot.domain } },
        });
      }
    }
  });

  it("labels fields in German and says where a value comes from", () => {
    expect(fieldLabel(slots, "device")).toBe("Wärmepumpe");
    expect(fieldLabel(slots, "valve_1")).toBe("Ventil 1");
    const own = { type: "x", entities: { superheat: "sensor.mine", oil_temp: null } };
    expect(fieldHelper("device", { type: "x" }, detected, slots)).toContain("Automatisch erkannt");
    expect(fieldHelper("device", { type: "x", device: "dev2" }, detected, slots)).toContain("Eigene Wahl");
    expect(fieldHelper("compressor", own, detected, slots)).toBe("Automatisch erkannt.");
    expect(fieldHelper("superheat", own, detected, slots)).toContain("Eigene Wahl");
    expect(fieldHelper("oil_temp", own, detected, slots)).toContain("Ausgeblendet");
    expect(fieldHelper("valve_1", own, detected, slots)).toContain("Nicht gefunden");
  });

  it("shows detected device and entities, overridden by the configuration", () => {
    const data = formData({ type: "x", entities: { superheat: "sensor.mine", state: null } }, detected);
    expect(data.device).toBe("dev1");
    expect(data.entities).toEqual({ compressor: "binary_sensor.c", superheat: "sensor.mine" });
  });

  it("stores only deviations from detection", () => {
    const config = { type: "x", entities: { state: null, outside_temp: "sensor.out" } };
    const shown = formData(config, detected) as { entities: Record<string, string> };
    // Unchanged form: nothing new is written.
    expect(configFromForm(config, shown, detected, slots)).toEqual(config);
    // A replaced entity is stored; a cleared field goes back to automatic.
    const changed = { ...shown, entities: { ...shown.entities, superheat: "sensor.mine", compressor: "" } };
    expect(configFromForm(config, changed, detected, slots).entities).toEqual({
      superheat: "sensor.mine",
      state: null,
      outside_temp: "sensor.out",
    });
    // Another device is stored, the detected one is not.
    expect(configFromForm(config, { ...shown, device: "dev2" }, detected, slots).device).toBe("dev2");
    expect(configFromForm({ type: "x" }, { device: "dev1" }, detected, slots)).toEqual({ type: "x" });
  });
});
