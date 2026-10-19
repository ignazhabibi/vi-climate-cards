// The visual editor: HA's own form (ha-form, which HA loads for every card
// editor), filled with what the card detects, so device and entity fields
// show what the card uses. Saving writes only deviations (see editor.ts).
import { discoverEntities, findHeatPumpDevice } from "../sources/vi-climate-devices";
import type { CardConfig } from "./config";
import { buildSchema, configFromForm, type Detected, fieldHelper, fieldLabel, formData } from "./editor";
import type { Hass } from "./hass";
import type { Slot } from "./slots";

export const EDITOR_TAG = "vi-climate-cards-editor";

interface HaForm extends HTMLElement {
  hass: Hass;
  data: Record<string, unknown>;
  schema: unknown[];
  computeLabel: (field: { name: string }) => string | undefined;
  computeHelper: (field: { name: string }) => string | undefined;
}

export class ViCardEditor extends HTMLElement {
  /** The card class: its entity keys and drawing variants. */
  card?: { slots: Slot[]; presets: string[] };
  private _config?: CardConfig;
  private _hass?: Hass;
  private _form?: HaForm;
  private _registry?: Hass["entities"];

  setConfig(config: CardConfig): void {
    this._config = config;
    this._render();
  }

  set hass(hass: Hass) {
    const fresh = hass.entities !== this._registry;
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    // Detection depends on the registry only; states need no new form data.
    if (fresh || !this._form) this._render();
  }

  private _detect(device?: string): Detected {
    const hass = this._hass as Hass;
    const first = findHeatPumpDevice(hass);
    const used = device || first;
    return { device: first, entities: used ? discoverEntities(hass, used, this.card?.slots ?? []) : {} };
  }

  private _render(): void {
    const hass = this._hass;
    const config = this._config;
    const card = this.card;
    if (!hass || !config || !card) return;
    this._registry = hass.entities;
    if (!this._form) {
      this._form = document.createElement("ha-form") as HaForm;
      this._form.addEventListener("value-changed", (ev) => this._changed(ev as CustomEvent));
      this.append(this._form);
    }
    const detected = this._detect(config.device);
    const form = this._form;
    form.hass = hass;
    form.schema = buildSchema(card.slots, card.presets);
    form.computeLabel = (field) => fieldLabel(card.slots, field.name);
    form.computeHelper = (field) => fieldHelper(field.name, config, detected, card.slots);
    form.data = formData(config, detected);
  }

  private _changed(ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const config = this._config;
    if (!config || !this.card || !this._hass) return;
    let value = ev.detail.value;
    // On a new device the entity fields still show the old device's
    // entities; only the card's own overrides carry over.
    if (value.device !== formData(config, this._detect(config.device)).device) {
      const own = Object.fromEntries(Object.entries(config.entities ?? {}).filter(([, id]) => id));
      value = { ...value, entities: own };
    }
    const next = configFromForm(config, value, this._detect(value.device as string), this.card.slots);
    this._config = next;
    this._render();
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
}
