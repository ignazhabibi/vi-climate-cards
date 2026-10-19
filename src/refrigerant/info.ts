// Explanation dialog of the refrigerant card: the cycle in four steps for
// laypeople, each with a small drawing of its part in the card's style. The
// live line shows while the compressor runs.
import { type InfoContent, infoTile } from "../card/info";
import { eev, fan } from "../draw/primitives";

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

export const refrigerantInfo = (): InfoContent => ({
  title: "So funktioniert der Kältekreis",
  intro:
    "Die Wärmepumpe holt Wärme aus der Außenluft und bringt sie ins Wasser für Heizung und Warmwasser. " +
    "Dafür kreist ein Kältemittel in einem geschlossenen Kreis, immer in diesen vier Schritten:",
  run: "Die Wärmepumpe läuft. Bei jedem Schritt steht, was gerade passiert.",
  off: "Die Wärmepumpe läuft gerade nicht. Sobald sie läuft, steht bei jedem Schritt, was gerade passiert.",
  defrost: "Gerade wird abgetaut: Der Kreis läuft kurz rückwärts (siehe unten).",
  legend: [
    ["", "liq", "flüssig"],
    ["", "mix", "nach dem Ventil: Tröpfchen"],
    ["", "gas", "gasförmig"],
  ],
  steps: [
    {
      t: "Verdampfen",
      svg: evaporator(),
      p:
        "Die Ventilatoren ziehen Außenluft durch den Verdampfer. Das Kältemittel darin ist kälter als die Luft, " +
        "nimmt ihre Wärme auf und verdampft. Das klappt auch bei Frost, denn das Kältemittel Propan siedet schon " +
        "bei etwa −42 °C.",
      now: "Außenluft {primary_supply} · Kältemittel {evaporator_liquid}",
    },
    {
      t: "Verdichten",
      svg: compressor(),
      p:
        "Der Verdichter presst das Gas zusammen. Dabei wird es heiß, so wie eine Fahrradpumpe beim Pumpen " +
        "warm wird. Der Inverter regelt, wie schnell der Verdichter läuft.",
      now: "Drehzahl {compressor_speed} · Gas danach {hot_gas}",
    },
    {
      t: "Verflüssigen",
      svg: condenser(),
      p:
        "Im Verflüssiger gibt das heiße Gas seine Wärme an das Wasser für Heizung oder Warmwasser ab. " +
        "Dabei kühlt es ab und wird wieder flüssig.",
      now: "Wasser {return} → {secondary_supply}",
    },
    {
      t: "Entspannen",
      svg: expansionValve(),
      p:
        "Das Expansionsventil lässt das flüssige Kältemittel durch eine enge Stelle. Dahinter ist der Druck " +
        "niedrig, und es wird schlagartig kalt, wie Spray aus der Dose. Dann beginnt der Kreis von vorn.",
      now: "Ventil {valve_2} geöffnet · Druck danach {suction_pressure}",
    },
  ],
  tips: [
    {
      t: "Interner Wärmetauscher",
      p: "Er gibt Restwärme vom flüssigen an das gasförmige Kältemittel ab. So arbeitet der Kreis effizienter.",
    },
    {
      t: "Abtauen",
      p:
        "Bei Kälte kann der Verdampfer vereisen. Dann dreht das 4-Wege-Ventil den Kreis kurz um: Das heiße Gas " +
        "strömt in den Verdampfer und taut das Eis ab. Die Wärme dafür kommt aus dem Heizungswasser.",
    },
  ],
});
