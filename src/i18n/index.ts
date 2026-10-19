// The texts the cards use. German only for now; another language would be a
// file of the same shape (`Texts`), picked here.
import { de } from "./de";

export type Texts = typeof de;

export const T: Texts = de;

/** Fills `{name}` placeholders; unknown names stay as they are. */
export const fill = (text: string, values: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
