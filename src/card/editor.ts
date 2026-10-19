// The card editor's logic, without DOM: the form schema, what the form shows
// (the configuration plus what the card detects), and the configuration a
// form change writes back (only real deviations from detection). The element
// in editor-element.ts puts this into HA's form.
import { T } from "../i18n";
import { PLATFORM } from "../sources/vi-climate-devices";
import type { CardConfig } from "./config";
import type { Slot } from "./slots";

export interface FormField {
  name: string;
  type?: "expandable";
  title?: string;
  default?: unknown;
  selector?: Record<string, unknown>;
  schema?: FormField[];
}

/** What the card finds without configuration: the first heat pump and the
 * entities on the device in use. */
export interface Detected {
  device?: string;
  entities: Record<string, string>;
}

const E = T.editor;

export function buildSchema(slots: Slot[], presets: string[]): FormField[] {
  const schema: FormField[] = [{ name: "device", selector: { device: { filter: { integration: PLATFORM } } } }];
  if (presets.length > 1) {
    schema.push({ name: "preset", selector: { select: { mode: "dropdown", options: presets } } });
  }
  schema.push(
    { name: "show_state", default: true, selector: { boolean: {} } },
    { name: "info", default: true, selector: { boolean: {} } },
    { name: "animations", default: true, selector: { boolean: {} } },
    {
      type: "expandable",
      name: "entities",
      title: E.entities,
      schema: slots.map((s) => ({ name: s.key, selector: { entity: { filter: { domain: s.domain } } } })),
    },
  );
  return schema;
}

/** Field label: the editor's own words, else the part name. */
export const fieldLabel = (slots: Slot[], name: string): string | undefined =>
  E.labels[name] ?? slots.find((s) => s.key === name)?.label;

/** Field helper: what the field is for, and for device and parts where the
 * shown value comes from. */
export function fieldHelper(name: string, config: CardConfig, detected: Detected, slots: Slot[]): string | undefined {
  if (name === "device") return `${E.helpers.device} ${config.device ? E.own : E.autoDevice}`;
  if (!slots.some((s) => s.key === name)) return E.helpers[name];
  const own = config.entities?.[name];
  if (own === null) return E.hidden;
  if (own) return E.own;
  return detected.entities[name] ? E.auto : E.notFound;
}

/** The form's data: detected device and entities, overridden by the
 * configuration. Hidden parts (`null`) stay empty. */
export function formData(config: CardConfig, detected: Detected): Record<string, unknown> {
  const entities: Record<string, string> = { ...detected.entities };
  for (const [key, id] of Object.entries(config.entities ?? {})) {
    if (id) entities[key] = id;
    else if (id === null) delete entities[key];
  }
  return { ...config, device: config.device || detected.device, entities };
}

/** The configuration after a form change. A device or entity equal to what
 * the card detects is not stored, so the card keeps finding it; a cleared
 * field means "automatic"; hidden parts stay hidden. `detected` must belong
 * to the device the form now shows. */
export function configFromForm(
  config: CardConfig,
  value: Record<string, unknown>,
  detected: Detected,
  slots: Slot[],
): CardConfig {
  const next: CardConfig = { ...config, ...(value as Partial<CardConfig>) };
  if (!next.device || next.device === detected.device) delete next.device;
  const shown = (value.entities ?? {}) as Record<string, string | undefined>;
  const entities: Record<string, string | null> = {};
  for (const { key } of slots) {
    const id = shown[key];
    if (id && id !== detected.entities[key]) entities[key] = id;
    else if (!id && config.entities?.[key] === null) entities[key] = null;
  }
  // Keys the card does not draw stay as they were.
  for (const [key, id] of Object.entries(config.entities ?? {})) {
    if (!slots.some((s) => s.key === key) && id !== undefined) entities[key] = id;
  }
  if (Object.keys(entities).length) next.entities = entities;
  else delete next.entities;
  return next;
}
