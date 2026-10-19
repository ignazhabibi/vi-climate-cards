// Card configuration and its validation. Home Assistant shows the message of
// an error thrown in setConfig instead of the card.

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

export interface CardConfig {
  type: string;
  /** Entity per drawing key, e.g. `valve: sensor.…`. */
  entities: Record<string, string | undefined>;
  /** Template for the header; returns {state, detail, info} or plain text. */
  status?: string;
  /** Entity whose state heads the header, with "seit …" from its last change. */
  status_entity?: string;
  /** Entities for the header line below the state. */
  status_items?: (string | StatusItemConfig)[];
  /** `false` hides the info button. */
  info?: boolean;
}

/** The entity a condition looks at, in either shape. */
export const conditionEntity = (c: StateCondition): string | undefined => c.entity ?? c.entity_id;

/** Throws on a configuration the card cannot draw or would misread. */
export function checkConfig(config: CardConfig, required: string[]): void {
  if (!config || typeof config.entities !== "object" || !config.entities) {
    throw new Error("entities fehlt");
  }
  for (const key of required) {
    if (!config.entities[key]) throw new Error(`entities.${key} fehlt`);
  }
  for (const item of config.status_items ?? []) {
    if (typeof item === "string") continue;
    if (!item?.entity) throw new Error("status_items: entity fehlt");
    for (const c of item.visibility ?? []) {
      // Any other condition type would silently count as met.
      if (c.condition !== undefined && c.condition !== "state") {
        throw new Error(`status_items: Bedingung "${c.condition}" wird nicht unterstützt, nur "state"`);
      }
      if (typeof conditionEntity(c) !== "string") throw new Error("status_items: Bedingung ohne entity");
      if (c.state === undefined && c.state_not === undefined) {
        throw new Error("status_items: Bedingung braucht state oder state_not");
      }
    }
  }
}
