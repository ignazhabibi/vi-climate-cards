// Turns the drawing of one layout into what the card renders: the SVG, the
// text overlay, and the positions of badges and values in percent of the
// viewBox, plus the layout's scale rules for the stylesheet.
import { GAP } from "./constants";
import { fixed, roundTo } from "./num";
import type { Defs } from "./primitives";

/** A text label in the overlay: class, x, y, text (may contain <br>). */
export type LabelSpec = [cls: string, x: number, y: number, text: string];
/** A badge on a pipe: entity key, x, y, icon, class, name. */
export type BadgeSpec = [key: string, x: number, y: number, icon: string, cls: string, name: string];
/** A plain reading: entity key, x, y, name, class ("big" or "sm", plus modifiers). */
export type ValueSpec = [key: string, x: number, y: number, name: string, cls: string];

export interface Badge {
  k: string;
  x: number;
  y: number;
  i: string;
  c: string;
  n: string;
}
export interface Value {
  k: string;
  x: number;
  y: number;
  n: string;
  c: string;
}

export interface Layout {
  /** Layout classes; the last one names the layout and scopes its rules. */
  c: string;
  svg: string;
  text: string;
  badges: Badge[];
  values: Value[];
}

export interface LayoutSpec {
  name: string;
  w: number;
  h: number;
  defs: Defs;
  body: string[];
  labels: LabelSpec[];
  badges: BadgeSpec[];
  values?: ValueSpec[];
  /** Center of the 4/3-way valve; its pointer turns around it. */
  vx?: number;
  vy?: number;
  label?: string;
  /** Card width at which badges reach full size; cards on one dashboard share it so their badges match. */
  unit?: number;
  /** Smallest overlay scale in px per unit; keeps text and badges readable on narrow cards. */
  umin?: number;
}

export function layout(s: LayoutSpec): { layout: Layout; css: string } {
  const { name, w, h, vx = 0, vy = 0, label = "Anlagenschema", umin = 0.85 } = s;
  const px = (x: number) => roundTo((x / w) * 100, 3);
  const py = (y: number) => roundTo((y / h) * 100, 3);
  const pct = (x: number, y: number) => `left:${fixed((x / w) * 100, 3)}%;top:${fixed((y / h) * 100, 3)}%`;
  const svg = `<svg viewBox='0 0 ${w} ${h}' role='img' aria-label='${label}'><defs>${s.defs.join("")}</defs>${s.body.join("")}</svg>`;
  // Text lives in the HTML overlay so that it scales with --u like the badges
  // instead of growing with the graphic.
  const text = s.labels.map(([c, x, y, t]) => `<div class='lb ${c}' style='${pct(x, y)}'>${t}</div>`).join("");
  const scope = name.split(" ").at(-1);
  return {
    layout: {
      c: name,
      svg,
      text,
      badges: s.badges.map(([k, x, y, i, c, n]) => ({ k, x: px(x), y: py(y), i, c, n })),
      // Plain readings: "big" is the content of a tank (the tank itself is
      // the tap target), "sm" a minor value written next to a device.
      values: (s.values ?? []).map(([k, x, y, n, c]) => ({ k, x: px(x), y: py(y), n, c })),
    },
    css:
      `.lay.${scope} :is(.ov,.hd){--u:clamp(${umin}px,calc(100cqw / ${s.unit || w}),1px);--g:calc(100cqw / ${w})}` +
      `.lay.${scope} .ptr{transform-origin:${vx}px ${vy}px}`,
  };
}

/** Centers of n badges stacked below a pipe corner at y=top, gap apart. */
export const dropRows = (top: number, n: number, gap = GAP): number[] =>
  Array.from({ length: n }, (_, i) => top + gap + 16 + i * (32 + gap));
