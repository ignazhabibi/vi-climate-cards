// Card behaviour that needs no rendering. A bare HTMLElement stand-in lets
// the card classes load in Node.
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { CardConfig } from "../src/card/config";

let ViRefrigerantCard: typeof import("../src/refrigerant/card").ViRefrigerantCard;

beforeAll(async () => {
  globalThis.HTMLElement ??= class {} as unknown as typeof HTMLElement;
  ({ ViRefrigerantCard } = await import("../src/refrigerant/card"));
});

afterEach(() => {
  vi.useRealTimers();
});

const config: CardConfig = { type: "custom:vi-refrigerant-card", entities: { compressor: "binary_sensor.c" } };

describe("minute timer", () => {
  it("runs only while connected with a status entity", () => {
    vi.useFakeTimers();
    const card = new ViRefrigerantCard();
    let connected = true;
    Object.defineProperty(card, "isConnected", { get: () => connected });

    card.setConfig(config);
    card.connectedCallback();
    expect(vi.getTimerCount()).toBe(0);

    card.setConfig({ ...config, status_entity: "sensor.phase" });
    expect(vi.getTimerCount()).toBe(1);
    card.connectedCallback();
    expect(vi.getTimerCount()).toBe(1);

    // The template header takes precedence and needs no timer.
    card.setConfig({ ...config, status_entity: "sensor.phase", status: "{{ 1 }}" });
    expect(vi.getTimerCount()).toBe(0);

    card.setConfig({ ...config, status_entity: "sensor.phase" });
    connected = false;
    card.disconnectedCallback();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("entity resolution", () => {
  // Calls the private resolver directly: the hass setter would render, which
  // needs a DOM.
  type Inner = { _hass: unknown; _resolve(): boolean; _entities: Record<string, string> };

  it("finds entities that become available later and keeps found ones", async () => {
    const { vitocalHass } = await import("./fixtures/vitocal");
    const valve1 = "sensor.e3_vitocal_16_sensors_valve_0_expansion_target";
    const card = new ViRefrigerantCard();
    const inner = card as unknown as Inner;
    card.setConfig({ type: "custom:vi-refrigerant-card" });

    // After a restart the valve is unavailable and carries no feature yet.
    inner._hass = vitocalHass({ unavailable: [valve1] });
    expect(inner._resolve()).toBe(true);
    expect(inner._entities.valve_1).toBeUndefined();
    expect(inner._entities.compressor).toBe("binary_sensor.e3_vitocal_16_verdichter_0");

    // Same registry, the valve is back: found on the next update.
    const later = vitocalHass();
    later.entities = (inner._hass as { entities: typeof later.entities }).entities;
    inner._hass = later;
    expect(inner._resolve()).toBe(true);
    expect(inner._entities.valve_1).toBe(valve1);

    // Everything settled: further updates do not search again, and an entity
    // that turns unavailable keeps its place.
    const offline = vitocalHass({ unavailable: [valve1] });
    offline.entities = later.entities;
    inner._hass = offline;
    expect(inner._resolve()).toBe(false);
    expect(inner._entities.valve_1).toBe(valve1);
  });
});
