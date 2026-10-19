// The parts of Home Assistant's frontend `hass` object that the cards use.

export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed: string;
  attributes: { friendly_name?: string; unit_of_measurement?: string; [key: string]: unknown };
}

export interface Hass {
  states: Record<string, HassEntity | undefined>;
  entities?: Record<string, { device_id?: string } | undefined>;
  devices?: Record<string, { name?: string | null; name_by_user?: string | null } | undefined>;
  themes?: { darkMode?: boolean };
  locale?: { language?: string };
  language?: string;
  connection?: {
    subscribeMessage<T>(callback: (msg: T) => void, msg: Record<string, unknown>): Promise<() => void>;
  };
  formatEntityState(stateObj: HassEntity, state?: string): string;
}
