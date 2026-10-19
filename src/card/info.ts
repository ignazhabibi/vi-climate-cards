// Shape of the explanation dialog of a card, and the frame of its small step
// drawings.

export interface InfoStep {
  /** Title. */
  t: string;
  /** Drawing (SVG markup). */
  svg: string;
  /** Explanation. */
  p: string;
  /** Live line; {key} is the formatted state of that entity. */
  now: string;
  /** Show the live line also while the circuit rests. */
  always?: boolean;
}

export interface InfoContent {
  title: string;
  intro: string;
  /** Status note while the circuit runs, rests, or defrosts. */
  run: string;
  off: string;
  defrost: string;
  /** Line patterns: pipe classes, flow classes, text. */
  legend: [pipe: string, flow: string, text: string][];
  steps: InfoStep[];
  tips: { t: string; p: string }[];
}

/** 64 × 64 tile behind each step drawing. */
export const infoTile = (body: string): string =>
  `<svg viewBox='0 0 64 64' aria-hidden='true'><rect class='itile' width='64' height='64' rx='12'/>${body}</svg>`;
