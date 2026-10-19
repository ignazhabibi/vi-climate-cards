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
