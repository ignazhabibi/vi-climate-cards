// Explanation dialog of the hydraulic schematic: where the warm water goes,
// in four steps. Steps marked "always" show their live line also while no
// water flows (tank temperatures stay meaningful at rest).
import { type InfoContent, infoTile } from "../card/info";
import { fan } from "../draw/primitives";
import { T } from "../i18n";

function outdoorUnit(): string {
  const waves = [22, 32, 42].map((y) => `<path d='M2 ${y} q3 -3 6 0 t6 0'/>`).join("");
  return infoTile(
    `<g class='air'>${waves}</g><rect class='devd' x='16' y='10' width='40' height='44' rx='5'/>${fan(36, 32, 14)}`,
  );
}

const valve = (): string =>
  infoTile(
    "<path class='pipe on s' d='M4 32 H22'/><path class='pipe on s' d='M42 32 H60'/><path class='pipe on s' d='M32 42 V60'/>" +
      "<circle class='valve' cx='32' cy='32' r='10' stroke-width='1.5'/>" +
      "<line class='ptr' x1='32' y1='32' x2='39' y2='32'/><circle class='hub' cx='32' cy='32' r='2'/>",
  );

function heating(): string {
  const fins = [42, 48, 54].map((x) => `<rect x='${x}' y='20' width='4' height='26' rx='2'/>`).join("");
  return infoTile(
    "<path class='pipe on s' d='M30 26 H44'/>" +
      "<rect class='dev' x='8' y='8' width='24' height='48' rx='9'/>" +
      "<rect class='shade' x='25' y='8' width='7' height='48'/>" +
      "<rect class='devl' x='8' y='8' width='24' height='48' rx='9'/>" +
      `<g class='rad'>${fins}<rect x='42' y='24' width='16' height='3' rx='1.5'/><rect x='42' y='39' width='16' height='3' rx='1.5'/></g>`,
  );
}

const hotWater = (): string =>
  infoTile(
    "<path class='pipe on s' d='M36 18 H50 V26'/>" +
      "<rect class='dev' x='12' y='8' width='26' height='48' rx='9'/>" +
      "<rect class='shade' x='31' y='8' width='7' height='48'/>" +
      "<rect class='devl' x='12' y='8' width='26' height='48' rx='9'/>" +
      "<path class='drop' d='M50 31 C46 37 46 41 50 41 C54 41 54 37 50 31 Z'/>",
  );

export function hydraulicInfo(): InfoContent {
  const x = T.hydraulic.info;
  const svgs = [outdoorUnit(), valve(), heating(), hotWater()];
  return {
    title: x.title,
    intro: x.intro,
    run: x.run,
    off: x.off,
    defrost: x.defrost,
    legend: [
      ["on s", "", x.legend[0]],
      ["on r", "", x.legend[1]],
    ],
    // Heizen and Warmwasser: tank temperatures stay meaningful at rest.
    steps: x.steps.map((s, i) => ({ t: s.t, svg: svgs[i], p: s.p, now: s.now, ...(i >= 2 ? { always: true } : {}) })),
    tips: x.tips,
  };
}
