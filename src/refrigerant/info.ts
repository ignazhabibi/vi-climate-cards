// Explanation dialog of the refrigerant card: the cycle in four steps for
// laypeople, each with a small drawing of its part in the card's style. The
// live line shows while the compressor runs.
import { type InfoContent, infoTile } from "../card/info";
import { eev, fan } from "../draw/primitives";
import { T } from "../i18n";

function evaporator(): string {
  let fins = "";
  for (let y = 11; y < 56; y += 4) fins += `<line class='ifin' x1='20' y1='${y}' x2='54' y2='${y}'/>`;
  const waves = [22, 32, 42].map((y) => `<path d='M3 ${y} q3 -3 6 0 t6 0'/>`).join("");
  return infoTile(
    `<g class='air'>${waves}</g>` +
      "<rect class='dev' x='16' y='6' width='42' height='52' rx='5'/>" +
      fins +
      "<rect class='devl' x='16' y='6' width='42' height='52' rx='5'/>" +
      "<rect class='devd' x='20' y='15' width='34' height='34' rx='6'/>" +
      fan(37, 32, 15),
  );
}

const compressor = (): string =>
  infoTile(
    "<path class='pipe on r' d='M4 44 H18'/><path class='pipe on s' d='M46 20 H60'/>" +
      "<rect class='devd' x='18' y='7' width='28' height='50' rx='7'/>" +
      "<rect class='hl' x='22' y='14' width='3' height='36' rx='1.5'/>" +
      "<path class='bolt' d='M35 18 L27 34 H32 L30 46 L39 29 H34 Z'/>",
  );

const condenser = (): string =>
  infoTile(
    "<path class='pipe on s' d='M4 16 H22'/><path class='pipe on s' d='M42 16 H60'/><path class='pipe on r' d='M60 48 H42'/>" +
      "<rect class='dev' x='22' y='6' width='20' height='52' rx='4'/>" +
      "<rect class='shade' x='36' y='6' width='6' height='52'/>" +
      "<rect class='devl' x='22' y='6' width='20' height='52' rx='4'/>",
  );

const expansionValve = (): string =>
  infoTile(`<path class='pipe on s' d='M4 38 H21'/><path class='pipe on r' d='M43 38 H60'/>${eev(32, 38)}`);

export function refrigerantInfo(): InfoContent {
  const x = T.refrigerant.info;
  const svgs = [evaporator(), compressor(), condenser(), expansionValve()];
  return {
    title: x.title,
    intro: x.intro,
    run: x.run,
    off: x.off,
    defrost: x.defrost,
    legend: [
      ["", "liq", x.legend[0]],
      ["", "mix", x.legend[1]],
      ["", "gas", x.legend[2]],
    ],
    steps: x.steps.map((s, i) => ({ t: s.t, svg: svgs[i], p: s.p, now: s.now })),
    tips: x.tips,
  };
}
