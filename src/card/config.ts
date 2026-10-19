// Card configuration and its validation. Home Assistant shows the message of
// an error thrown in setConfig instead of the card.
import { fill, T } from "../i18n";

const C = T.config;

/** HA's `state` condition, the only visibility condition the header knows.
 * `entity` is the dashboard shape; `entity_id` the automation shape that the
 * HA editor writes since 2026.10. */
export interface StateCondition {
  condition?: string;
  entity?: string;
  entity_id?: string;
  state?: string | string[];
  state_not?: string | string[];
}

export interface StatusItemConfig {
  entity: string;
  /** Overrides the entity name; `false` shows the state alone. */
  name?: string | false;
  visibility?: StateCondition[];
}

/** A Home Assistant action, as the `ui_action` selector writes it
 * (`more-info`, `navigate`, `perform-action`, `none`, …). */
export interface ActionConfig {
  action: string;
  [key: string]: unknown;
}

export interface CardConfig {
  type: string;
  /** Device of the vi_climate_devices integration; without it the card takes
   * the first heat pump. */
  device?: string;
  /** Drawing variant; each card has one so far. */
  preset?: string;
  /** Entity per drawing key, e.g. `valve: sensor.…`. Overrides what the
   * integration provides; `null` hides the part. */
  entities?: Record<string, string | null | undefined>;
  /** Template for the header; returns {state, detail, info} or plain text. */
  status?: string;
  /** Entity whose state heads the header, with "seit …" from its last change. */
  status_entity?: string;
  /** Entities for the header line below the state. */
  status_items?: (string | StatusItemConfig)[];
  /** `false` hides the info button. */
  info?: boolean;
  /** `false` stops pipes, fans, and air; colors still show the state. */
  animations?: boolean;
  /** What tapping a part does, with the part's entity; default: more-info. */
  tap_action?: ActionConfig;
  /** What holding a part does; default: nothing beyond a tap. */
  hold_action?: ActionConfig;
}

/** The entity a condition looks at, in either shape. */
export const conditionEntity = (c: StateCondition): string | undefined => c.entity ?? c.entity_id;

/** Throws on a configuration the card cannot read or would misread. Whether
 * the required entities exist is only known once the card sees Home
 * Assistant; the card reports missing ones itself. */
export function checkConfig(config: CardConfig, presets: string[]): void {
  if (!config || typeof config !== "object") throw new Error(C.missing);
  if (config.entities !== undefined && (typeof config.entities !== "object" || Array.isArray(config.entities))) {
    throw new Error(C.entities);
  }
  if (config.device !== undefined && typeof config.device !== "string") throw new Error(C.device);
  if (config.preset !== undefined && !presets.includes(config.preset)) {
    throw new Error(fill(C.preset, { preset: config.preset, presets: presets.join(", ") }));
  }
  for (const name of ["tap_action", "hold_action"] as const) {
    const action = config[name];
    if (action !== undefined && typeof action?.action !== "string") throw new Error(fill(C.action, { name }));
  }
  for (const item of config.status_items ?? []) {
    if (typeof item === "string") continue;
    if (!item?.entity) throw new Error(C.itemEntity);
    for (const c of item.visibility ?? []) {
      // Any other condition type would silently count as met.
      if (c.condition !== undefined && c.condition !== "state") {
        throw new Error(fill(C.condition, { condition: c.condition }));
      }
      if (typeof conditionEntity(c) !== "string") throw new Error(C.conditionEntity);
      if (c.state === undefined && c.state_not === undefined) {
        throw new Error(C.conditionState);
      }
    }
  }
}
