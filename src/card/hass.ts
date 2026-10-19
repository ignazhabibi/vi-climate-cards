// The parts of Home Assistant's frontend `hass` object that the cards use.

export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed: string;
  attributes: { friendly_name?: string; unit_of_measurement?: string; [key: string]: unknown };
}

export interface HassEntityEntry {
  device_id?: string;
  platform?: string;
  translation_key?: string;
}

export interface Hass {
  states: Record<string, HassEntity | undefined>;
  /** Entity registry entries as the frontend sees them. */
  entities?: Record<string, HassEntityEntry | undefined>;
  devices?: Record<string, { name?: string | null; name_by_user?: string | null } | undefined>;
  themes?: { darkMode?: boolean };
  locale?: { language?: string };
  language?: string;
  connection?: {
    subscribeMessage<T>(callback: (msg: T) => void, msg: Record<string, unknown>): Promise<() => void>;
  };
  formatEntityState(stateObj: HassEntity, state?: string): string;
}
