// The card editor. Home Assistant builds the form from this schema
// (getConfigForm). The entities come from vi_climate_devices; the expandable
// section replaces single ones. Options the form does not show, such as
// `status_items`, stay in the YAML.
import { PLATFORM } from "../sources/vi-climate-devices";
import type { Slot } from "./slots";

export interface FormField {
  name: string;
  type?: "expandable";
  title?: string;
  default?: unknown;
  selector?: Record<string, unknown>;
  schema?: FormField[];
}

export interface ConfigForm {
  schema: FormField[];
  computeLabel: (field: { name: string }) => string | undefined;
  computeHelper: (field: { name: string }) => string | undefined;
}

const LABELS: Record<string, string> = {
  device: "Wärmepumpe",
  preset: "Variante",
  status_entity: "Zustand in der Kopfzeile",
  info: "Erklärung anbieten",
};

const HELPERS: Record<string, string> = {
  device:
    "Gerät der Integration Viessmann Climate Devices; leer: die erste Wärmepumpe. " +
    "Die Karte findet ihre Entitäten dort selbst. Unter „Entitäten anpassen“ lässt sich jede einzeln ersetzen.",
  status_entity: "Ihr Zustand steht groß oben, mit „seit …“, zum Beispiel die Betriebsphase.",
  info: "Ein Info-Button erklärt die Anlage für Laien.",
};

export function buildConfigForm(slots: Slot[], presets: string[]): ConfigForm {
  const schema: FormField[] = [{ name: "device", selector: { device: { filter: { integration: PLATFORM } } } }];
  if (presets.length > 1) {
    schema.push({ name: "preset", selector: { select: { mode: "dropdown", options: presets } } });
  }
  schema.push(
    { name: "status_entity", selector: { entity: {} } },
    { name: "info", default: true, selector: { boolean: {} } },
    {
      type: "expandable",
      name: "entities",
      title: "Entitäten anpassen",
      schema: slots.map((s) => ({ name: s.key, selector: { entity: { filter: { domain: s.domain } } } })),
    },
  );
  const slotLabels: Record<string, string> = Object.fromEntries(slots.map((s) => [s.key, s.label]));
  return {
    schema,
    computeLabel: (field) => LABELS[field.name] ?? slotLabels[field.name],
    computeHelper: (field) => HELPERS[field.name],
  };
}
