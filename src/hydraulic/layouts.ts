// Hydraulic schematic. "wide" is the desktop and tablet schematic, "narrow"
// stacks the units vertically for phones and narrow columns. A container
// query on the card width shows one of them.
//
// Both layouts are a small, calm scene: the outdoor unit stands on a strip of
// lawn under a faint sky (the outdoor air it draws its energy from), the
// indoor unit and the tanks are inside the house. Devices and surroundings use
// a few neutral tones that work in light and dark mode; only the pipes carry
// color.
//
// Pipe groups: all (secondary circuit), heat (to the buffer), dhw (to the DHW
// tank), heatdhw (shared return of both), byp (defrost buffer), hc (heating
// circuit), circ (DHW circulation).
import { DEFROST_H, DEFROST_W, GAP, PLINTH, RADH, VR } from "../draw/constants";
import { type BadgeSpec, dropRows, type LabelSpec, layout, type ValueSpec } from "../draw/layout";
import { div, roundEven } from "../draw/num";
import {
  air,
  band,
  type Defs,
  defrostBuffer,
  heater,
  indoor,
  lawn,
  outdoor,
  pipes,
  pump,
  radiator,
  sky,
  tank,
  tap,
  valve,
} from "../draw/primitives";

function wide() {
  // Outside on the left (faint sky, lawn, outdoor unit), a thick house wall,
  // inside on the right (wall-hung indoor unit above the two tanks). Lawn and
  // floor are one level. Supply and return leave the outdoor unit at the
  // bottom, run through the ground and rise inside the wall.
  const W = 790;
  const H = 616;
  const TITLE_Y = 34;
  const WALL = [256, 292] as const;
  // Indoor unit: the supply enters at the top, crosses the heating rod, and
  // drops to the valve past Durchfluss and Vorlauf Erzeuger. The internal
  // (secondary) pump sits on the common return to the outdoor unit, as in the
  // Viessmann diagnosis screen: it pushes the water through the condenser.
  const IDU = [400, 52, 200, 254] as const;
  const BAND = 14;
  const SUP_Y = IDU[1] + 26;
  const RISER_X = IDU[0] + 49; // heating rod, defrost buffer, and return riser
  const VX = IDU[0] + 120;
  const [, PUMP_Y, GEN_Y] = dropRows(SUP_Y, 3);
  const FLOW_Y = PUMP_Y; // Durchfluss on the heating circuit pump row
  const VY = GEN_Y + 16 + GAP + VR;
  const RET_Y = VY + 38;
  const IPX = RISER_X - 25; // internal pump on the common return, inside the unit
  const TANK_W = 104;
  const TANK_H = 224;
  const TANK_Y = IDU[1] + IDU[3] + BAND + 30;
  const FLOOR = TANK_Y + TANK_H;
  const DEPTH = 34; // ground band below the floor line
  const DHW = [VX - div(TANK_W, 2), TANK_Y, TANK_W, TANK_H] as const;
  const BUF = [624, TANK_Y, TANK_W, TANK_H] as const;
  const BCX = BUF[0] + div(TANK_W, 2);
  const BUF_IN = BUF[0] + div(TANK_W, 4); // generator supply enters the buffer top here
  const TANK_VALUE_Y = TANK_Y + roundEven(TANK_H * 0.32);
  const MAN_Y = FLOOR + 14; // return manifold inside the floor slab
  const HCR_X = BUF[0] + TANK_W + 26;
  const RY0 = IDU[1]; // radiator hangs level with the indoor unit
  const FINS = 8;
  const RX0 = BCX - 50;
  const RAD_R = RX0 + (FINS - 1) * 13 + 8;
  const SEC_X = div(WALL[1] + IDU[0], 2); // Sekundärkreis column between wall and indoor unit
  const ODU_W = 200;
  const ODU_H = 222; // top level with the tanks
  const ODU = [44, FLOOR - PLINTH - ODU_H, ODU_W, ODU_H] as const;
  const OCX = ODU[0] + div(ODU_W, 2);
  // Two fans stacked as on the unit, one in each half of the grille.
  const SEAM_Y = ODU[1] + div(ODU_H, 2);
  const FAN1_Y = ODU[1] + 56;
  const FAN2_Y = ODU[1] + ODU_H - 56;
  // Title above the unit with the noise reduction as a caption between
  // title and unit.
  const ODU_TITLE_Y = ODU[1] - 36;
  // Circulation: an outlet on the right side of the DHW tank with the pump
  // in the gap between the tanks.
  const CIRC_Y = TANK_VALUE_Y + 62;
  const CIRC_X = div(DHW[0] + TANK_W + BUF[0], 2);
  const ODU_B = ODU[1] + ODU_H;
  // The return leaves the unit further left and runs deeper, the supply runs
  // on the outer side of the wall: the two never cross.
  const RET_OX = ODU[0] + ODU_W - 48;
  const SUP_OX = ODU[0] + ODU_W - 28;
  const SUP_WX = WALL[0] + 11;
  const RET_WX = WALL[1] - 11;
  const SUP_GY = FLOOR + 11;
  const RET_GY = FLOOR + 23;

  const defs: Defs = [];
  const body = [
    sky("wide", defs, 16, 8, WALL[0] - 16, FLOOR - 8),
    band("ground", 16, W - 16, FLOOR, DEPTH, 16, 16),
    lawn("wide", defs, 16, WALL[0], FLOOR),
    `<rect class='wall' x='${WALL[0]}' y='8' width='${WALL[1] - WALL[0]}' height='${FLOOR + DEPTH - 8}'/>`,
    air(16, FAN1_Y),
    air(16, FAN2_Y),
    outdoor(
      "wide",
      defs,
      ...ODU,
      [
        [OCX, FAN1_Y, "fan"],
        [OCX, FAN2_Y, "fan_2"],
      ],
      38,
      SEAM_Y,
    ),
    indoor("wide", defs, ...IDU, BAND, div(RISER_X + VX, 2)),
    tap("defrost", defrostBuffer("wide", defs, RISER_X, VY)),
    tap("buffer", tank("wide", defs, "buf", ...BUF)),
    tap("water_heater", tank("wide", defs, "dhw", ...DHW)),
    tap("climate", radiator(RX0, RY0, FINS)),
    pipes([
      ["s", "all", `M${SUP_OX} ${ODU_B} V${SUP_GY} H${SUP_WX} V${SUP_Y} H${VX} V${VY - VR}`],
      ["s", "heat", `M${VX + VR} ${VY} H${BUF_IN} V${BUF[1]}`],
      ["s", "dhw", `M${VX} ${VY + VR} V${DHW[1]}`],
      ["s", "circ", `M${DHW[0] + TANK_W} ${CIRC_Y} H${CIRC_X - VR}`],
      ["s", "byp", `M${VX - VR} ${VY} H${RISER_X + div(DEFROST_W, 2)}`],
      ["s", "hc", `M${BCX} ${BUF[1]} V${RY0 + RADH}`],
      ["r", "hc", `M${RAD_R} ${RY0 + RADH - 8} H${HCR_X} V${FLOOR - 40} H${BUF[0] + TANK_W}`],
      ["r", "heat", `M${BCX} ${FLOOR} V${MAN_Y} H${VX}`],
      ["r", "dhw", `M${VX} ${FLOOR} V${MAN_Y}`],
      ["r", "heatdhw", `M${VX} ${MAN_Y} H${RISER_X} V${RET_Y}`],
      ["r", "byp", `M${RISER_X} ${VY + div(DEFROST_H, 2)} V${RET_Y}`],
      ["r", "all", `M${RISER_X} ${RET_Y} H${RET_WX} V${RET_GY} H${RET_OX} V${ODU_B}`],
    ]),
    valve(VX, VY),
    pump(IPX, RET_Y, "internal_pump", [-1, 0]),
    pump(BCX, PUMP_Y, "circuit_pump", [0, -1]),
    pump(CIRC_X, CIRC_Y, "circulation_pump", [1, 0]),
    heater(RISER_X, SUP_Y, "heater"),
  ];
  const labels: LabelSpec[] = [
    ["cap", OCX, TITLE_Y, "Außenluft"],
    ["title", OCX, ODU_TITLE_Y, "Außeneinheit"],
    ["cap", SEC_X, TITLE_Y, "Sekundärkreis"],
    ["title", IDU[0] + div(IDU[2], 2), TITLE_Y, "Inneneinheit"],
    ["cap", BCX, TITLE_Y, "Heizkreis"],
    ["dl", RISER_X, VY, "Abtaupuffer"],
    ["dl", VX, CIRC_Y, "Zirkulation"], // inside the tank, at its outlet
  ];
  // Badges only for measuring points, without icons: the pipe color and the
  // position already say what is measured.
  const badges: BadgeSpec[] = [
    ["secondary_supply", SEC_X, SUP_Y, "", "", "Vorlauf"],
    ["return", SEC_X, RET_Y, "", "", "Rücklauf"],
    ["volumetric_flow", VX, FLOW_Y, "", "", "Durchfluss"],
    ["generator_supply", VX, GEN_Y, "", "", "Vorlauf Erzeuger"],
    ["circuit_supply", BCX, GEN_Y, "", "", "Vorlauf"],
  ];
  const values: ValueSpec[] = [
    ["primary_supply", OCX, TITLE_Y + 20, "Primärkreis", "sm"], // under Außenluft
    ["noise_reduction", OCX, ODU[1] - 16, "Geräuschreduzierung", "sm"],
    ["dhw", VX, TANK_VALUE_Y, "Warmwasser", "big"],
    ["buffer", BCX, TANK_VALUE_Y, "Puffer", "big"],
  ];
  return layout({ name: "wide", w: W, h: H, defs, body, labels, badges, values, vx: VX, vy: VY, umin: 0.9 });
}

function narrow() {
  // Outside on top (faint sky, outdoor unit on the lawn, its title and badges
  // beside it), the house below: the pipes leave the outdoor unit at the
  // bottom and pass through the ground into the indoor unit, which hangs
  // above the two tanks. The return rises on the left. Everything is packed
  // tightly so the card fits on a phone screen without scrolling.
  const W = 400;
  const L = 32; // left edge of the indoor unit
  const AX = 120; // indoor title and defrost buffer share this axis
  const CX = 312; // heating circuit column and Sekundärkreis caption
  const RX = 64; // return riser
  const SX = 184; // supply line
  const GAP_N = 12; // gap between stacked badges
  const ODU_W = 160;
  const ODU_H = 132;
  const ODU = [40, 16, ODU_W, ODU_H] as const;
  const ODU_B = ODU[1] + ODU_H;
  const GROUND = ODU_B + PLINTH;
  const DEPTH = 18;
  // Two fans side by side above the seam, evenly spaced in the grille.
  const FAN_Y = ODU[1] + 56;
  const FAN_R = 30;
  const FAN1_X = ODU[0] + 41;
  const FAN2_X = ODU[0] + ODU_W - 49;
  const COL_X = div(ODU[0] + ODU_W + W - 16, 2); // outdoor title and badges beside the unit
  const SEC_Y = GROUND + DEPTH + 28;
  const IDU_Y = SEC_Y + 16 + 16;
  // The heating rod sits on the title row. Below it, on the supply and GAP_N
  // apart: Durchfluss and Vorlauf Erzeuger, then the valve. The internal pump
  // sits on the return riser, on the row of the heating circuit pump.
  const TITLE_Y = IDU_Y + 20;
  const HEAT_Y = TITLE_Y;
  const [, PUMP_Y, ROW_Y] = dropRows(HEAT_Y + VR, 3, GAP_N);
  const FLOW_Y = PUMP_Y;
  const VX = SX;
  const VY = ROW_Y + 16 + GAP_N + VR;
  const BAND = 10;
  const IDU = [L, IDU_Y, 220, VY + 24 - IDU_Y] as const;
  const TANK_W = 104; // as wide as in the wide layout
  const TANK_H = 160;
  const TANK_Y = IDU[1] + IDU[3] + BAND + 22;
  const FLOOR = TANK_Y + TANK_H;
  const FLOOR_D = 18;
  const H = FLOOR + FLOOR_D + 8;
  const DHW = [SX - div(TANK_W, 2), TANK_Y, TANK_W, TANK_H] as const;
  const BUF = [CX - div(TANK_W, 2), TANK_Y, TANK_W, TANK_H] as const;
  const BUF_IN = BUF[0] + div(TANK_W, 4); // generator supply enters the buffer top here
  const TANK_VALUE_Y = TANK_Y + roundEven(TANK_H * 0.32);
  const MAN_Y = FLOOR + div(FLOOR_D, 2);
  // Circulation: an outlet on the left side of the DHW tank, the pump between
  // tank and return riser.
  const CIRC_Y = TANK_VALUE_Y + 50;
  const CIRC_X = div(RX + DHW[0], 2);
  const HCR_X = BUF[0] + TANK_W + 12;
  const RADH_N = 40;
  const FINS = 7;
  const RY0 = dropRows(HEAT_Y + VR, 1, GAP_N)[0] + 16 - RADH_N; // bottom level with the first badge row
  const RX0 = CX - div((FINS - 1) * 13 + 8, 2);
  const RAD_R = RX0 + (FINS - 1) * 13 + 8;
  const DFB_L = AX - div(DEFROST_W, 2);
  const DFB_R = AX + div(DEFROST_W, 2);

  const defs: Defs = [];
  const body = [
    sky("narrow", defs, 16, 8, W - 32, GROUND - 8),
    band("wall", 16, W - 16, GROUND, DEPTH, 0, 0),
    lawn("narrow", defs, 16, W - 16, GROUND),
    band("ground", 16, W - 16, FLOOR, FLOOR_D, 16, 16),
    air(14, FAN_Y),
    outdoor(
      "narrow",
      defs,
      ...ODU,
      [
        [FAN1_X, FAN_Y, "fan"],
        [FAN2_X, FAN_Y, "fan_2"],
      ],
      FAN_R,
      ODU[1] + 112,
    ),
    indoor("narrow", defs, ...IDU, BAND),
    tap("defrost", defrostBuffer("narrow", defs, AX, VY)),
    tap("buffer", tank("narrow", defs, "buf", ...BUF)),
    tap("water_heater", tank("narrow", defs, "dhw", ...DHW)),
    tap("climate", radiator(RX0, RY0, FINS, RADH_N)),
    pipes([
      ["s", "all", `M${SX} ${ODU_B} V${VY - VR}`],
      ["s", "heat", `M${VX + VR} ${VY} H${BUF_IN} V${BUF[1]}`],
      ["s", "dhw", `M${VX} ${VY + VR} V${DHW[1]}`],
      ["s", "circ", `M${DHW[0]} ${CIRC_Y} H${CIRC_X + VR}`],
      ["s", "byp", `M${VX - VR} ${VY} H${DFB_R}`],
      ["s", "hc", `M${CX} ${BUF[1]} V${RY0 + RADH_N}`],
      ["r", "hc", `M${RAD_R} ${RY0 + RADH_N - 8} H${HCR_X} V${FLOOR - 32} H${BUF[0] + TANK_W}`],
      ["r", "heat", `M${CX} ${FLOOR} V${MAN_Y} H${SX}`],
      ["r", "dhw", `M${SX} ${FLOOR} V${MAN_Y}`],
      ["r", "heatdhw", `M${SX} ${MAN_Y} H${RX} V${VY}`],
      ["r", "byp", `M${DFB_L} ${VY} H${RX}`],
      ["r", "all", `M${RX} ${VY} V${ODU_B}`],
    ]),
    valve(VX, VY),
    pump(RX, PUMP_Y, "internal_pump", [0, -1]),
    pump(CX, PUMP_Y, "circuit_pump", [0, -1]),
    pump(CIRC_X, CIRC_Y, "circulation_pump", [-1, 0]),
    heater(SX, HEAT_Y, "heater"),
  ];
  const labels: LabelSpec[] = [
    ["title", COL_X, ODU[1] + 29, "Außeneinheit"],
    ["cap", CX, SEC_Y, "Sekundärkreis"],
    ["title", AX, TITLE_Y, "Inneneinheit"],
    ["cap", CX, TITLE_Y, "Heizkreis"],
    ["dl", AX, VY, "Abtaupuffer"],
    ["dl", SX, CIRC_Y, "Zirkulation"],
  ];
  const badges: BadgeSpec[] = [
    ["return", RX, SEC_Y, "", "", "Rücklauf"],
    ["secondary_supply", SX, SEC_Y, "", "", "Vorlauf"],
    ["volumetric_flow", SX, FLOW_Y, "", "", "Durchfluss"],
    ["generator_supply", SX, ROW_Y, "", "", "Vorlauf Erzeuger"],
    ["circuit_supply", CX, ROW_Y, "", "", "Vorlauf"],
  ];
  const values: ValueSpec[] = [
    // Under the title, name above value: the column beside the outdoor unit
    // is too narrow for "Geräuschreduzierung Leicht reduziert".
    ["primary_supply", COL_X, ODU[1] + 58, "Primärkreis", "sm st"],
    ["noise_reduction", COL_X, ODU[1] + 92, "Geräuschreduzierung", "sm st"],
    ["dhw", SX, TANK_VALUE_Y, "Warmwasser", "big"],
    ["buffer", CX, TANK_VALUE_Y, "Puffer", "big"],
  ];
  return layout({ name: "narrow", w: W, h: H, defs, body, labels, badges, values, vx: VX, vy: VY });
}

export const hydraulicLayouts = () => [wide(), narrow()];
