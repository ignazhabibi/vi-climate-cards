import { describe, expect, it } from "vitest";
import { buildConfigForm, type FormField } from "../src/card/editor";
import { HYDRAULIC_SLOTS } from "../src/hydraulic/slots";
import { REFRIGERANT_SLOTS } from "../src/refrigerant/slots";

const field = (schema: FormField[], name: string) => schema.find((f) => f.name === name);

describe("card editor", () => {
  it("offers the device of the integration and the header options", () => {
    const { schema } = buildConfigForm(HYDRAULIC_SLOTS, ["vitocal-250a-buffer"]);
    expect(field(schema, "device")?.selector).toEqual({ device: { filter: { integration: "vi_climate_devices" } } });
    expect(field(schema, "status_entity")?.selector).toEqual({ entity: {} });
    expect(field(schema, "info")).toMatchObject({ default: true, selector: { boolean: {} } });
    expect(field(schema, "animations")).toMatchObject({ default: true, selector: { boolean: {} } });
    // One drawing variant: nothing to choose.
    expect(field(schema, "preset")).toBeUndefined();
    expect(field(buildConfigForm(HYDRAULIC_SLOTS, ["a", "b"]).schema, "preset")?.selector).toEqual({
      select: { mode: "dropdown", options: ["a", "b"] },
    });
  });

  it("lets every entity key be replaced, filtered by its domain", () => {
    for (const slots of [HYDRAULIC_SLOTS, REFRIGERANT_SLOTS]) {
      const entities = field(buildConfigForm(slots, []).schema, "entities");
      expect(entities?.type).toBe("expandable");
      expect(entities?.schema?.map((f) => f.name)).toEqual(slots.map((s) => s.key));
      for (const slot of slots) {
        expect(field(entities?.schema ?? [], slot.key)?.selector).toEqual({
          entity: { filter: { domain: slot.domain } },
        });
      }
    }
  });

  it("labels fields in German", () => {
    const form = buildConfigForm(REFRIGERANT_SLOTS, []);
    expect(form.computeLabel({ name: "device" })).toBe("Wärmepumpe");
    expect(form.computeLabel({ name: "valve_1" })).toBe("Ventil 1");
    expect(form.computeLabel({ name: "superheat" })).toBe("Überhitzung");
    expect(form.computeHelper({ name: "device" })).toContain("Viessmann Climate Devices");
    expect(form.computeHelper({ name: "valve_1" })).toBeUndefined();
  });

  it("offers tap and hold actions as top-level options", () => {
    const interactions = field(buildConfigForm(HYDRAULIC_SLOTS, []).schema, "interactions");
    expect(interactions).toMatchObject({ type: "expandable", flatten: true });
    expect(interactions?.schema?.map((f) => [f.name, f.selector])).toEqual([
      ["tap_action", { ui_action: { default_action: "more-info" } }],
      ["hold_action", { ui_action: { default_action: "none" } }],
    ]);
  });
});
