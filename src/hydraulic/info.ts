// Explanation dialog of the hydraulic schematic: where the warm water goes,
// in four steps. Steps marked "always" show their live line also while no
// water flows (tank temperatures stay meaningful at rest).
import { type InfoContent, infoTile } from "../card/info";
import { fan } from "../draw/primitives";

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

export const hydraulicInfo = (): InfoContent => ({
  title: "So funktioniert die Anlage",
  intro:
    "Die Außeneinheit erwärmt Wasser. Die Anlage bringt es dorthin, wo Wärme gebraucht wird, in diesen vier " +
    "Schritten:",
  run: "Gerade fließt Wasser. Bei jedem Schritt steht, was gerade passiert.",
  off: "Gerade fließt kein Wasser zur Außeneinheit. Sobald sie läuft, steht bei jedem Schritt, was gerade passiert.",
  defrost: "Gerade wird abgetaut (siehe unten).",
  legend: [
    ["on s", "", "Vorlauf, warm"],
    ["on r", "", "Rücklauf, abgekühlt"],
  ],
  steps: [
    {
      t: "Erwärmen",
      svg: outdoorUnit(),
      p:
        "In der Außeneinheit gibt der Kältekreis seine Wärme an das Wasser ab. Warm fließt es zur Inneneinheit, " +
        "abgekühlt kommt es zurück.",
      now: "Hin {secondary_supply} · zurück {return}",
    },
    {
      t: "Verteilen",
      svg: valve(),
      p:
        "Eine Pumpe hält das Wasser in Bewegung. Ein Ventil schickt es zur Heizung oder in den " +
        "Warmwasserspeicher. Bei Bedarf hilft ein Heizstab.",
      now: "Durchfluss {volumetric_flow} · Vorlauf {generator_supply}",
    },
    {
      t: "Heizen",
      svg: heating(),
      p: "Der Pufferspeicher sammelt das warme Wasser. Von dort bringt die Heizkreispumpe es zu den Heizkörpern.",
      now: "Puffer {buffer} · Heizkreis {circuit_supply}",
      always: true,
    },
    {
      t: "Warmwasser",
      svg: hotWater(),
      p:
        "Der Speicher hält das Wasser zum Duschen und Spülen warm. Die Zirkulationspumpe sorgt dafür, dass es " +
        "schnell warm aus dem Hahn kommt.",
      now: "Speicher {dhw}",
      always: true,
    },
  ],
  tips: [
    {
      t: "Abtauen",
      p:
        "Bei Frost vereist die Außeneinheit. Zum Abtauen holt sie sich kurz Wärme aus dem Abtaupuffer in der " +
        "Inneneinheit.",
    },
  ],
});
