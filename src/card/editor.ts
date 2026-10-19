// The card editor. Home Assistant builds the form from this schema
// (getConfigForm). The entities come from vi_climate_devices; the expandable
// section replaces single ones. Options the form does not show, such as
// `status_items`, stay in the YAML.
import { T } from "../i18n";
import { PLATFORM } from "../sources/vi-climate-devices";
import type { Slot } from "./slots";

export interface FormField {
  name: string;
  type?: "expandable";
  title?: string;
  /** Expandable only: its fields stay top-level keys of the configuration. */
  flatten?: boolean;
  default?: unknown;
  selector?: Record<string, unknown>;
  schema?: FormField[];
}

export interface ConfigForm {
  schema: FormField[];
  computeLabel: (field: { name: string }) => string | undefined;
  computeHelper: (field: { name: string }) => string | undefined;
}

const E = T.editor;

export function buildConfigForm(slots: Slot[], presets: string[]): ConfigForm {
  const schema: FormField[] = [{ name: "device", selector: { device: { filter: { integration: PLATFORM } } } }];
  if (presets.length > 1) {
    schema.push({ name: "preset", selector: { select: { mode: "dropdown", options: presets } } });
  }
  schema.push(
    { name: "status_entity", selector: { entity: {} } },
    { name: "info", default: true, selector: { boolean: {} } },
    { name: "animations", default: true, selector: { boolean: {} } },
    {
      type: "expandable",
      name: "entities",
      title: E.entities,
      schema: slots.map((s) => ({ name: s.key, selector: { entity: { filter: { domain: s.domain } } } })),
    },
    // As on HA's own cards: one action for all parts, each with its entity.
    {
      type: "expandable",
      name: "interactions",
      title: E.interactions,
      flatten: true,
      schema: [
        { name: "tap_action", selector: { ui_action: { default_action: "more-info" } } },
        { name: "hold_action", selector: { ui_action: { default_action: "none" } } },
      ],
    },
  );
  const slotLabels: Record<string, string> = Object.fromEntries(slots.map((s) => [s.key, s.label]));
  return {
    schema,
    computeLabel: (field) => E.labels[field.name] ?? slotLabels[field.name],
    computeHelper: (field) => E.helpers[field.name],
  };
}
