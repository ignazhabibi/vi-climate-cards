import { describe, expect, it } from "vitest";
import { type CardConfig, checkConfig } from "../src/card/config";

const base: CardConfig = { type: "custom:vi-refrigerant-card", entities: { compressor: "binary_sensor.c" } };
const withItems = (status_items: CardConfig["status_items"]): CardConfig => ({ ...base, status_items });

describe("checkConfig", () => {
  it("needs no entities, but reads them, device, and preset correctly", () => {
    expect(() => checkConfig({ type: "x" }, [])).not.toThrow();
    expect(() => checkConfig(base, [])).not.toThrow();
    expect(() => checkConfig({ type: "x", entities: null } as unknown as CardConfig, [])).not.toThrow();
    expect(() => checkConfig({ type: "x", entities: ["a"] } as unknown as CardConfig, [])).toThrow("entities muss");
    expect(() => checkConfig({ type: "x", device: 3 } as unknown as CardConfig, [])).toThrow("device muss");
    expect(() => checkConfig({ type: "x", preset: "vitocal-250a" }, ["vitocal-250a"])).not.toThrow();
    expect(() => checkConfig({ type: "x", preset: "other" }, ["vitocal-250a"])).toThrow('preset "other" unbekannt');
    expect(() => checkConfig(undefined as unknown as CardConfig, [])).toThrow("Konfiguration fehlt");
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
