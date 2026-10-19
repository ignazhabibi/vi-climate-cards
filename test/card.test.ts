// Card behaviour that needs no rendering. A bare HTMLElement stand-in lets
// the card classes load in Node.
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { CardConfig } from "../src/card/config";

let ViRefrigerantCard: typeof import("../src/refrigerant/card").ViRefrigerantCard;

beforeAll(async () => {
  globalThis.HTMLElement ??= class {} as unknown as typeof HTMLElement;
  // The pause choice is shared through window events.
  globalThis.window ??= { addEventListener() {}, removeEventListener() {} } as unknown as Window & typeof globalThis;
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

describe("updates", () => {
  type Inner = { _entities: Record<string, string>; _changed(prev: unknown, next: unknown): boolean };
  const state = (s: string) => ({ entity_id: "x", state: s, last_changed: "", attributes: {} });
  const fmt = () => "";

  it("redraws only when something the card shows changed", () => {
    const card = new ViRefrigerantCard();
    const inner = card as unknown as Inner;
    card.setConfig({
      ...config,
      status_entity: "sensor.phase",
      status_items: [
        { entity: "sensor.rod", visibility: [{ condition: "state", entity: "binary_sensor.ww", state: "on" }] },
      ],
    });
    inner._entities = { compressor: "binary_sensor.c" };
    const states = {
      "binary_sensor.c": state("on"),
      "sensor.phase": state("heating"),
      "sensor.rod": state("off"),
      "binary_sensor.ww": state("off"),
      "sensor.other": state("1"),
    };
    const prev = { states, formatEntityState: fmt };
    const next = (id: string) => ({ states: { ...states, [id]: state("new") }, formatEntityState: fmt });

    expect(inner._changed(prev, { states: { ...states }, formatEntityState: fmt })).toBe(false);
    expect(inner._changed(prev, next("sensor.other"))).toBe(false);
    for (const id of ["binary_sensor.c", "sensor.phase", "sensor.rod", "binary_sensor.ww"]) {
      expect(inner._changed(prev, next(id))).toBe(true);
    }
    // New translations or a theme switch redraw everything.
    expect(inner._changed(prev, { states, formatEntityState: () => "x" })).toBe(true);
    expect(inner._changed(prev, { states, formatEntityState: fmt, themes: { darkMode: true } })).toBe(true);
  });
});

describe("taps", () => {
  type Inner = { _entities: Record<string, string>; _moreInfo(key: string): void };

  it("open more-info of the tapped part", () => {
    const card = new ViRefrigerantCard();
    const events: { type: string; detail: unknown }[] = [];
    (card as unknown as { dispatchEvent: (e: CustomEvent) => boolean }).dispatchEvent = (e) => {
      events.push({ type: e.type, detail: e.detail });
      return true;
    };
    card.setConfig(config);
    (card as unknown as Inner)._entities = { compressor: "binary_sensor.c" };
    (card as unknown as Inner)._moreInfo("compressor");
    // A part without entity is not tappable.
    (card as unknown as Inner)._moreInfo("oil_temp");
    expect(events).toEqual([{ type: "hass-more-info", detail: { entityId: "binary_sensor.c" } }]);
  });
});

describe("header", () => {
  type Inner = { _entities: Record<string, string>; _headEntity(): string | undefined };

  it("shows the detected heat pump state unless turned off or replaced", () => {
    const card = new ViRefrigerantCard();
    const inner = card as unknown as Inner;
    card.setConfig({ type: "x" });
    inner._entities = { state: "sensor.phase" };
    expect(inner._headEntity()).toBe("sensor.phase");
    card.setConfig({ type: "x", show_state: false });
    inner._entities = { state: "sensor.phase" };
    expect(inner._headEntity()).toBeUndefined();
    card.setConfig({ type: "x", status_entity: "sensor.other" });
    expect(inner._headEntity()).toBe("sensor.other");
    card.setConfig({ type: "x", status: "{{ 1 }}" });
    inner._entities = { state: "sensor.phase" };
    expect(inner._headEntity()).toBeUndefined();
  });
});
