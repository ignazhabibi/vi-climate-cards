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

describe("actions", () => {
  type Inner = { _entities: Record<string, string>; _act(key: string, kind: "tap" | "hold"): void };

  const fired = (cfg: Partial<CardConfig>, key: string, kind: "tap" | "hold") => {
    const card = new ViRefrigerantCard();
    const events: { type: string; detail: unknown }[] = [];
    (card as unknown as { dispatchEvent: (e: CustomEvent) => boolean }).dispatchEvent = (e) => {
      events.push({ type: e.type, detail: e.detail });
      return true;
    };
    card.setConfig({ ...config, ...cfg });
    (card as unknown as Inner)._entities = { compressor: "binary_sensor.c" };
    (card as unknown as Inner)._act(key, kind);
    return events;
  };

  it("opens more-info on tap by default and does nothing on hold", () => {
    expect(fired({}, "compressor", "tap")).toEqual([
      { type: "hass-more-info", detail: { entityId: "binary_sensor.c" } },
    ]);
    expect(fired({}, "compressor", "hold")).toEqual([]);
    // A part without entity is not tappable.
    expect(fired({}, "oil_temp", "tap")).toEqual([]);
  });

  it("hands configured actions to Home Assistant with the part's entity", () => {
    const nav = { action: "navigate", navigation_path: "/config" };
    expect(fired({ hold_action: nav }, "compressor", "hold")).toEqual([
      { type: "hass-action", detail: { config: { entity: "binary_sensor.c", hold_action: nav }, action: "hold" } },
    ]);
    expect(fired({ tap_action: { action: "none" } }, "compressor", "tap")).toEqual([]);
  });
});
