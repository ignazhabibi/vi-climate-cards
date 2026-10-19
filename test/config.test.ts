import { describe, expect, it } from "vitest";
import { type CardConfig, checkConfig } from "../src/card/config";

const base: CardConfig = { type: "custom:vi-refrigerant-card", entities: { compressor: "binary_sensor.c" } };
const withItems = (status_items: CardConfig["status_items"]): CardConfig => ({ ...base, status_items });

describe("checkConfig", () => {
  it("needs the required entities", () => {
    expect(() => checkConfig({ ...base, entities: {} }, ["compressor"])).toThrow("entities.compressor fehlt");
    expect(() => checkConfig({ type: "x" } as CardConfig, [])).toThrow("entities fehlt");
    expect(() => checkConfig(base, ["compressor"])).not.toThrow();
  });

  it("accepts state conditions in both shapes", () => {
    const items = withItems([
      "sensor.plain",
      { entity: "sensor.a", visibility: [{ condition: "state", entity: "binary_sensor.w", state: "on" }] },
      { entity: "sensor.b", visibility: [{ condition: "state", entity_id: "binary_sensor.w", state_not: ["on"] }] },
    ]);
    expect(() => checkConfig(items, [])).not.toThrow();
  });

  it("rejects conditions it cannot evaluate", () => {
    const item = (c: object) => withItems([{ entity: "sensor.a", visibility: [c] }]);
    expect(() => checkConfig(item({ condition: "numeric_state", entity: "sensor.x", above: 1 }), [])).toThrow(
      'Bedingung "numeric_state" wird nicht unterstützt',
    );
    expect(() => checkConfig(item({ condition: "state", state: "on" }), [])).toThrow("Bedingung ohne entity");
    expect(() => checkConfig(item({ condition: "state", entity: "sensor.x" }), [])).toThrow("state oder state_not");
    expect(() => checkConfig(withItems([{ name: "x" } as never]), [])).toThrow("status_items: entity fehlt");
  });
});
