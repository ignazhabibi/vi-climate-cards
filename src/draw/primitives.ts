// SVG drawing helpers shared by all layouts. Markup uses single-quoted
// attributes. `p` is the layout name; it prefixes ids because all layouts of
// a card live in one shadow root. `defs` collects clip paths, patterns, and
// gradients for the layout's <defs>.
import { DEFROST_H, DEFROST_W, FAN, LAWN, PLINTH, RADH, V4R, VR } from "./constants";
import { div, fixed, g, roundEven, roundTo } from "./num";

export type Defs = string[];

export function clip(defs: Defs, cid: string, x: number, y: number, w: number, h: number, r: number): string {
  defs.push(`<clipPath id='${cid}'><rect x='${x}' y='${y}' width='${w}' height='${h}' rx='${r}'/></clipPath>`);
  return `url(#${cid})`;
}

/** Makes a drawn device open the more-info dialog of entity key. */
export const tap = (key: string, svg: string): string => `<g class='tap' data-k='${key}'>${svg}</g>`;

/** Standing cylindrical tank with well-rounded ends on a narrow dark base. */
export function tank(p: string, defs: Defs, tid: string, x: number, y: number, w: number, h: number): string {
  const r = roundEven(w / 4);
  const bh = h - 10; // body height; the base fills the rest down to the floor
  const cp = clip(defs, `vi-${p}-c-${tid}`, x, y, w, bh, r);
  return (
    "<g>" +
    `<rect class='devd' x='${x + 10}' y='${y + bh - 6}' width='${w - 20}' height='16' rx='3'/>` +
    `<rect class='dev' x='${x}' y='${y}' width='${w}' height='${bh}' rx='${r}'/>` +
    `<g clip-path='${cp}'><rect class='shade' x='${g(x + w * 0.72)}' y='${y}' width='${g(w * 0.28)}' height='${bh}'/></g>` +
    `<rect class='devl' x='${x}' y='${y}' width='${w}' height='${bh}' rx='${r}'/>` +
    "</g>"
  );
}

export function fan(cx: number, cy: number, r = 38): string {
  const k = r / 38;
  return (
    `<circle class='guard' cx='${cx}' cy='${cy}' r='${r}' stroke-width='1.5'/>` +
    `<circle class='guard' cx='${cx}' cy='${cy}' r='${g(r - 6 * k)}' stroke-width='1' stroke-dasharray='2 5'/>` +
    `<circle class='fan-disc' cx='${cx}' cy='${cy}' r='${g(26 * k)}'/>` +
    `<g transform='translate(${cx} ${cy})'><g class='fan'><path transform='scale(${g(1.4 * k, 3)}) translate(-12 -12)' d='${FAN}'/></g></g>`
  );
}

/** Three drifting air waves that flow towards the outdoor unit. */
export const air = (x0: number, cy: number): string =>
  `<g class='air'>${[-14, 0, 14].map((dy) => `<path d='M${x0} ${cy + dy} q6 -5 12 0 t12 0'/>`).join("")}</g>`;

export type FanSpot = [cx: number, cy: number, key: string];

/** Outdoor unit after the Vitocal 250-A: a dark box with a ribbed grille on
 * a plinth. Both fans sit behind the grille; each spins with the speed of its
 * own entity. */
export function outdoor(
  p: string,
  defs: Defs,
  x: number,
  y: number,
  w: number,
  h: number,
  fans: FanSpot[],
  r: number,
  seam: number,
): string {
  const cp = clip(defs, `vi-${p}-c-odu`, x, y, w, h, 10);
  defs.push(
    `<pattern id='vi-${p}-rib' patternUnits='userSpaceOnUse' x='${x}' y='0' width='6' height='8'>` +
      "<rect class='rib' width='1.2' height='8'/></pattern>",
  );
  return (
    "<g>" +
    `<rect class='devd plinth' x='${x + 10}' y='${y + h - 4}' width='${w - 20}' height='${PLINTH + 4}' rx='2'/>` +
    `<rect class='devd' x='${x}' y='${y}' width='${w}' height='${h}' rx='10'/>` +
    `<g clip-path='${cp}'>` +
    fans.map(([cx, cy, k]) => `<g class='fanbox tap' data-k='${k}'>${fan(cx, cy, r)}</g>`).join("") +
    // The grille lies over the fans but lets taps through to them.
    `<rect class='nohit' x='${x + 3}' y='${y}' width='${w - 6}' height='${h}' fill='url(#vi-${p}-rib)'/>` +
    `<rect class='side nohit' x='${x + w - 8}' y='${y}' width='8' height='${h}'/>` +
    `<line class='seam nohit' x1='${x}' y1='${seam}' x2='${x + w}' y2='${seam}'/>` +
    "</g>" +
    `<rect class='devl' x='${x}' y='${y}' width='${w}' height='${h}' rx='10'/>` +
    "</g>"
  );
}

/** Wall-hung indoor unit with a dark display band at the bottom. dcx moves
 * the display off center, clear of pipes that cross the band. */
export function indoor(p: string, defs: Defs, x: number, y: number, w: number, h: number, band: number, dcx?: number) {
  const cx = dcx || x + div(w, 2);
  const cp = clip(defs, `vi-${p}-c-idu`, x, y, w, h + band, 12);
  return (
    "<g>" +
    `<rect class='dev' x='${x}' y='${y}' width='${w}' height='${h + band}' rx='12'/>` +
    `<g clip-path='${cp}'>` +
    `<rect class='shade' x='${x + w - 12}' y='${y}' width='12' height='${h}'/>` +
    `<rect class='devd' x='${x}' y='${y + h}' width='${w}' height='${band}'/>` +
    "</g>" +
    `<rect class='devl' x='${x}' y='${y}' width='${w}' height='${h + band}' rx='12'/>` +
    `<rect class='disp' x='${cx - 22}' y='${g(y + h + band / 2 - 3)}' width='44' height='6' rx='2'/>` +
    `<circle class='led' cx='${cx + 14}' cy='${g(y + h + band / 2)}' r='2'/>` +
    "</g>"
  );
}

export function radiator(x0: number, y0: number, fins: number, h = RADH): string {
  const width = (fins - 1) * 13 + 8;
  let out = "<g class='rad'>";
  for (let i = 0; i < fins; i++) out += `<rect x='${g(x0 + i * 13)}' y='${y0}' width='8' height='${h}' rx='4'/>`;
  return (
    out +
    `<rect x='${g(x0)}' y='${y0 + 6}' width='${width}' height='5' rx='2.5'/>` +
    `<rect x='${g(x0)}' y='${y0 + h - 11}' width='${width}' height='5' rx='2.5'/></g>`
  );
}

/** Plain device after the HA covers concept, like the tanks: flat fill, a
 * shade strip on the right (28 % of the width, at most 20), fine outline. */
export function box(p: string, defs: Defs, bid: string, x: number, y: number, w: number, h: number): string {
  const sw = Math.min(roundTo(w * 0.28, 2), 20);
  const cp = clip(defs, `vi-${p}-c-${bid}`, x, y, w, h, 6);
  return (
    `<rect class='dev' x='${x}' y='${y}' width='${w}' height='${h}' rx='6'/>` +
    `<g clip-path='${cp}'><rect class='shade' x='${g(x + w - sw)}' y='${y}' width='${g(sw)}' height='${h}'/></g>` +
    `<rect class='devl' x='${x}' y='${y}' width='${w}' height='${h}' rx='6'/>`
  );
}

/** Small vessel, shaded like the tanks so it does not read as a badge. */
export const defrostBuffer = (p: string, defs: Defs, x: number, y: number): string =>
  box(p, defs, "dfb", x - div(DEFROST_W, 2), y - div(DEFROST_H, 2), DEFROST_W, DEFROST_H);

/** 4/3-way valve; its pointer turns with the valve position. */
export const valve = (vx: number, vy: number): string =>
  `<g class='tap' data-k='valve'><circle class='hit' cx='${vx}' cy='${vy}' r='22'/>` +
  `<circle class='valve' cx='${vx}' cy='${vy}' r='${VR}' stroke-width='1.5'/>` +
  `<line class='ptr p1' x1='${vx}' y1='${vy}' x2='${vx + VR - 4}' y2='${vy}'/>` +
  `<line class='ptr p2' x1='${vx}' y1='${vy}' x2='${vx - VR + 4}' y2='${vy}'/>` +
  `<circle class='hub' cx='${vx}' cy='${vy}' r='2.5'/></g>`;

/** Pump in the standard symbol: a circle with an inscribed triangle whose
 * tip points in the flow direction. The triangle fills while the pump runs;
 * the state is shown by the drawing, not by a badge. */
export function pump(x: number, y: number, key: string, flow: [number, number] = [0, 1]): string {
  const a0 = Math.atan2(flow[1], flow[0]);
  const r = VR - 1;
  const tri = [0, 1, 2]
    .map((k) => {
      const a = a0 + (k * 2 * Math.PI) / 3;
      return `${fixed(x + r * Math.cos(a), 1)} ${fixed(y + r * Math.sin(a), 1)}`;
    })
    .join(" L");
  return (
    `<g class='pump tap' data-k='${key}'><circle class='hit' cx='${x}' cy='${y}' r='22'/>` +
    `<circle class='valve' cx='${x}' cy='${y}' r='${VR}' stroke-width='1.5'/>` +
    `<path class='ptri' d='M${tri} Z'/></g>`
  );
}

/** Power line: thin and gray, so it does not read as a refrigerant pipe. */
export const wire = (x1: number, x2: number, y: number): string =>
  `<line class='wire' x1='${x1}' y1='${y}' x2='${x2}' y2='${y}'/>`;

/** Power line that leaves a device at the bottom and turns into another. */
export const wireDown = (x1: number, y1: number, x2: number, y2: number): string =>
  `<path class='wire' d='M${x1} ${y1} V${y2} H${x2}'/>`;

/** Heating rod in the pump's circle: three coil turns along the pipe. The
 * coil turns warm while a stage runs. */
export function heater(x: number, y: number, key: string): string {
  const coil =
    `M${x - 10} ${y + 3} L${x - 7} ${y + 3} ` +
    [x - 7, x - 2, x + 3].map((x0) => `C${x0 + 8} ${y - 10} ${x0 - 3} ${y - 10} ${x0 + 5} ${y + 3}`).join(" ") +
    ` L${x + 10} ${y + 3}`;
  return (
    `<g class='heater tap' data-k='${key}'><circle class='hit' cx='${x}' cy='${y}' r='22'/>` +
    `<circle class='valve' cx='${x}' cy='${y}' r='${VR}' stroke-width='1.5'/>` +
    `<path class='coil' d='${coil}'/></g>`
  );
}

/** Faint outdoor air behind the outdoor unit, fading out towards the top. */
export function sky(p: string, defs: Defs, x: number, y: number, w: number, h: number): string {
  defs.push(
    `<linearGradient id='vi-${p}-sky' x1='0' y1='0' x2='0' y2='1'>` +
      "<stop class='sky0' offset='0'/><stop class='sky1' offset='1'/></linearGradient>",
  );
  return `<rect fill='url(#vi-${p}-sky)' x='${x}' y='${y}' width='${w}' height='${h}'/>`;
}

/** Horizontal ground band with rounded bottom-left (rl) and bottom-right (rr) corners. */
export const band = (cls: string, x0: number, x1: number, y: number, depth: number, rl: number, rr: number): string =>
  `<path class='${cls}' d='M${x0} ${y} H${x1} V${y + depth - rr} a${rr} ${rr} 0 0 1 ${-rr} ${rr} ` +
  `H${x0 + rl} a${rl} ${rl} 0 0 1 ${-rl} ${-rl} Z'/>`;

/** Lawn strip with small tufts on top of the ground band. */
export function lawn(p: string, defs: Defs, x0: number, x1: number, y: number): string {
  defs.push(
    `<pattern id='vi-${p}-tuft' patternUnits='userSpaceOnUse' x='${x0 + 3}' y='${y - 4}' width='9' height='4'>` +
      "<path class='lawn' d='M0 4 l2 -4 l2 4 Z'/></pattern>",
  );
  return (
    `<rect class='lawn' x='${x0}' y='${y}' width='${x1 - x0}' height='${LAWN}'/>` +
    `<rect x='${x0}' y='${y - 4}' width='${x1 - x0}' height='4' fill='url(#vi-${p}-tuft)'/>`
  );
}

/** A pipe: side ("s" supply, "r" return), group (switched on together), path. */
export type Pipe = [side: string, group: string, d: string];

/** Each path is drawn twice: a .pipe stroke and a .fl flow-dot overlay. */
export const pipes = (items: Pipe[]): string =>
  items.map(([r, gr, d]) => `<path class='pipe ${r}' data-g='${gr}' d='${d}'/>`).join("") +
  items.map(([, gr, d]) => `<path class='fl' data-g='${gr}' d='${d}'/>`).join("");

// Refrigerant circuit parts -----------------------------------------------------

/** Evaporator: a finned coil, fins drawn across its long side. */
export function coil(p: string, defs: Defs, x: number, y: number, w: number, h: number): string {
  const fin =
    h >= w
      ? `x='0' y='${y}' width='8' height='5'><rect class='fin' width='8' height='1.2'/>`
      : `x='${x}' y='0' width='5' height='8'><rect class='fin' width='1.2' height='8'/>`;
  defs.push(`<pattern id='vi-${p}-fin' patternUnits='userSpaceOnUse' ${fin}</pattern>`);
  return (
    `<rect class='dev' x='${x}' y='${y}' width='${w}' height='${h}' rx='6'/>` +
    `<rect x='${x + 4}' y='${y + 6}' width='${w - 8}' height='${h - 12}' fill='url(#vi-${p}-fin)'/>` +
    `<rect class='devl' x='${x}' y='${y}' width='${w}' height='${h}' rx='6'/>`
  );
}

/** Upright compressor shell, rounded like the tanks (radius a quarter of its width). */
export function compressor(x: number, y: number, w: number, h: number): string {
  const r = div(w, 4);
  return (
    `<rect class='devd' x='${x}' y='${y}' width='${w}' height='${h}' rx='${r}'/>` +
    `<rect class='hl' x='${x + 8}' y='${y + r}' width='6' height='${h - 2 * r}' rx='3'/>` +
    `<rect class='devl' x='${x}' y='${y}' width='${w}' height='${h}' rx='${r}'/>`
  );
}

/** One of the two outdoor fans in its dark housing; spins with its own speed. */
export function fanbox(cx: number, cy: number, key: string, s = 60): string {
  const h = div(s, 2);
  return (
    `<g class='fanbox tap' data-k='${key}'>` +
    `<rect class='devd' x='${cx - h}' y='${cy - h}' width='${s}' height='${s}' rx='8'/>` +
    fan(cx, cy, h - 6) +
    "</g>"
  );
}

/** Electronic expansion valve: bow-tie body with its actuator. */
export function eev(x: number, y: number, vertical = false): string {
  let body: string;
  let act: string;
  if (vertical) {
    body = `M${x - 7} ${y - 11} L${x} ${y} L${x + 7} ${y - 11} Z M${x - 7} ${y + 11} L${x} ${y} L${x + 7} ${y + 11} Z`;
    act = `<line class='eev' x1='${x}' y1='${y}' x2='${x + 13}' y2='${y}'/><circle class='eev' cx='${x + 16}' cy='${y}' r='4'/>`;
  } else {
    body = `M${x - 11} ${y - 7} L${x} ${y} L${x - 11} ${y + 7} Z M${x + 11} ${y - 7} L${x} ${y} L${x + 11} ${y + 7} Z`;
    act = `<line class='eev' x1='${x}' y1='${y}' x2='${x}' y2='${y - 13}'/><circle class='eev' cx='${x}' cy='${y - 16}' r='4'/>`;
  }
  return `${act}<path class='eev' d='${body}'/>`;
}

/** 4-way reversing valve as in the Viessmann flow diagram: four valve
 * triangles meeting in the middle, drawn like the expansion valves, inside
 * the round body of the other valves. No passages are drawn; the pipe colors
 * show which way the refrigerant runs. The ports of each call are noted in a
 * comment there (E evaporator, C condenser, S suction, D discharge). */
export function fourWay(x: number, y: number): string {
  const r = V4R - 3; // triangle length from the center
  const w = 5; // triangle half width
  const tris = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
    .map(
      ([dx, dy]) =>
        `M${x} ${y} L${x + dx * r - dy * w} ${y + dy * r - dx * w} L${x + dx * r + dy * w} ${y + dy * r + dx * w} Z`,
    )
    .join(" ");
  return `<circle class='valve' cx='${x}' cy='${y}' r='${V4R}' stroke-width='1.5'/><path class='eev' d='${tris}'/>`;
}
