// Refrigerant circuit: the outdoor unit opened up, arranged like the
// refrigerant circuit screen of the Vitocal 250-A.
//
// Pipe groups: e evaporator to 4-way valve, c 4-way valve to condenser,
// s suction to the compressor, d discharge, l1a/l1b condenser to valve 1 to
// the internal heat exchanger, l2a/l2b internal heat exchanger to valve 2 to
// the evaporator, wv/wr water supply and return.
import { GAP, PLINTH, V4R } from "../draw/constants";
import { type BadgeSpec, type LabelSpec, layout, type ValueSpec } from "../draw/layout";
import { div } from "../draw/num";
import {
  air,
  band,
  box,
  coil,
  compressor,
  type Defs,
  eev,
  fanbox,
  fourWay,
  heater,
  lawn,
  pipes,
  sky,
  tap,
  wire,
  wireDown,
} from "../draw/primitives";
import { T } from "../i18n";

const D = T.drawing;

function wide() {
  // Heating: the liquid runs along the top from the condenser through
  // expansion valve 1, the internal heat exchanger, and expansion valve 2 into
  // the evaporator; the suction gas leaves the evaporator at the bottom,
  // passes the 4-way valve and the internal heat exchanger and enters the
  // compressor; the hot gas runs from the compressor through the 4-way valve
  // up the condenser, which heats the secondary circuit. The internal heat
  // exchanger (API: economizer) sits between liquid and suction line.
  //
  // Columns from left to right: evaporator coil with both fans in front of
  // it, inverter, internal heat exchanger above the compressor, 4-way valve,
  // condenser. Each heat exchanger shows its liquid temperature on the pipe
  // right above it; the valve openings sit above the valve symbols. Badges
  // share rows across the columns (PITCH apart where they stack), and every
  // device is wider than the badges it holds.
  const W = 944;
  const H = 728;
  const TITLE_Y = 34;
  const PITCH = 32 + GAP;
  const ODU = [150, 52, 668, 636] as const; // housing; the frame is 8 units thick
  const [ox, oy, ow, oh] = ODU;
  const FLOOR = oy + oh + PLINTH;
  const OUT_X = div(16 + ox, 2); // outside air column
  const SEC_X = div(ox + ow + W - 16, 2); // secondary circuit column
  const VB_Y = 94; // valve opening badges
  const TOP_Y = 140; // liquid line
  const LB_Y = TOP_Y + 40; // liquid temperature badges on the drops below it
  const HX_Y = TOP_Y + 80; // all three heat exchangers start here
  const COIL = [180, HX_Y, 100, 370] as const;
  const CCX = COIL[0] + div(COIL[2], 2);
  const FAN1_Y = HX_Y + 48; // fan 1 and the water return share this row
  const COMP = [428, 412, 118, 216] as const;
  const MX = COMP[0] + div(COMP[2], 2);
  // The internal heat exchanger starts on the compressor's left edge; the
  // suction gas leaves it at the bottom straight down into the compressor.
  const IHX = [COMP[0], HX_Y, 171, 80] as const;
  const IHX_L = IHX[0] + 8; // liquid ports on its top
  const IHX_R = IHX[0] + IHX[2] - 8;
  const IHX_SY = IHX[1] + div(IHX[3], 2); // suction gas enters on its right side
  const ROW1 = COMP[1] + 50; // compressor rows
  const ROW2 = ROW1 + PITCH;
  const ROW3 = ROW1 + 2 * PITCH;
  // Suction badges centered between the internal heat exchanger and the compressor.
  const SUC1_Y = div(IHX[1] + IHX[3] + COMP[1], 2) - div(PITCH, 2);
  const SUC2_Y = SUC1_Y + PITCH;
  // The inverter drives the compressor: between evaporator and compressor, on
  // the row of the Verdampfer plate, with a power line down to the compressor.
  const INV_Y = div(FAN1_Y + ROW2 - 64, 2); // between the fans, see FAN2_Y
  const INV = [div(COIL[0] + COIL[2] + COMP[0], 2) - 56, INV_Y - 40, 112, 80] as const; // centered between coil and compressor
  const IX = INV[0] + div(INV[2], 2);
  const COND = [736, HX_Y, 36, 260] as const; // clear of the Überhitzung badge on the suction line
  const KX = COND[0] + div(COND[2], 2);
  // 4-way valve and valve 1 centered between the two liquid drops; the hot
  // gas badge on the discharge line, on the Öl row.
  const V4X = div(IHX[0] + IHX[2] - 8 + KX, 2);
  const V4Y = ROW2;
  // The accumulator on the suction line is left out: it has no values, and
  // the drawing does not need every part.
  const EEV2_X = IX; // valve 2 on the inverter axis
  const EEV1_X = V4X; // valve 1 on the 4-way valve axis
  const FAN2_Y = ROW2 - 64; // fan 2 on the water supply row
  const BOT_Y = COMP[1] + COMP[3] + 18; // suction line below everything
  const RL_Y = FAN1_Y; // water pipes on the fan rows, like the air waves
  const VL_Y = FAN2_Y;

  const defs: Defs = [];
  const body = [
    sky("rf", defs, 16, 8, W - 32, FLOOR - 8),
    band("ground", 16, W - 16, FLOOR, 18, 16, 16),
    lawn("rf", defs, 16, W - 16, FLOOR),
    air(ox - 28, FAN1_Y),
    air(ox - 28, FAN2_Y),
    `<rect class='devd plinth' x='${ox + 10}' y='${oy + oh - 4}' width='${ow - 20}' height='${PLINTH + 4}' rx='2'/>`,
    `<rect class='devd' x='${ox}' y='${oy}' width='${ow}' height='${oh}' rx='14'/>`,
    `<rect class='dev' x='${ox + 8}' y='${oy + 8}' width='${ow - 16}' height='${oh - 16}' rx='8'/>`,
    coil("rf", defs, ...COIL),
    fanbox(CCX, FAN1_Y, "fan_1", 72),
    fanbox(CCX, FAN2_Y, "fan_2", 72),
    tap("inverter_power", box("rf", defs, "inv", ...INV)),
    wireDown(IX, INV[1] + INV[3], COMP[0], ROW1), // out at the bottom, into the compressor side
    box("rf", defs, "cond", ...COND),
    box("rf", defs, "ihx", ...IHX),
    tap("compressor_speed", compressor(...COMP)),
    pipes([
      ["r", "l2b", `M${EEV2_X - 11} ${TOP_Y} H${CCX} V${COIL[1]}`],
      ["s", "l2a", `M${IHX_L} ${IHX[1]} V${TOP_Y} H${EEV2_X + 11}`],
      ["s", "l1b", `M${EEV1_X - 11} ${TOP_Y} H${IHX_R} V${IHX[1]}`],
      ["s", "l1a", `M${KX} ${COND[1]} V${TOP_Y} H${EEV1_X + 11}`],
      ["r", "e", `M${CCX} ${COIL[1] + COIL[3]} V${BOT_Y} H${V4X} V${V4Y + V4R}`],
      ["r", "s", `M${V4X} ${V4Y - V4R} V${IHX_SY} H${IHX[0] + IHX[2]}`],
      ["r", "s", `M${MX} ${IHX[1] + IHX[3]} V${COMP[1]}`],
      ["s", "d", `M${COMP[0] + COMP[2]} ${V4Y} H${V4X - V4R}`],
      ["s", "c", `M${V4X + V4R} ${V4Y} H${KX} V${COND[1] + COND[3]}`],
      ["r", "wr", `M${W - 16} ${RL_Y} H${COND[0] + COND[2]}`],
      ["s", "wv", `M${COND[0] + COND[2]} ${VL_Y} H${W - 16}`],
    ]),
    fourWay(V4X, V4Y), // ports: S top, C right, E bottom, D left
    tap("valve_2", `<circle class='hit' cx='${EEV2_X}' cy='${TOP_Y - 6}' r='20'/>${eev(EEV2_X, TOP_Y)}`),
    tap("valve_1", `<circle class='hit' cx='${EEV1_X}' cy='${TOP_Y - 6}' r='20'/>${eev(EEV1_X, TOP_Y)}`),
    heater(MX, ROW3 + PITCH, "crankcase_heater"),
    heater(CCX, ROW3, "base_heater"),
  ];
  const labels: LabelSpec[] = [
    ["cap", OUT_X, TITLE_Y, D.outdoorAir],
    ["title", ox + div(ow, 2), TITLE_Y, D.outdoorUnit],
    ["cap", SEC_X, TITLE_Y, D.secondaryCircuit],
    // Device names as on the defrost buffer; the upright condenser has its
    // name turned, the finned coil a plate that masks the fins.
    ["dv", CCX, div(FAN1_Y + FAN2_Y, 2), D.evaporator], // centered between the fans
    ["dl", IHX[0] + div(IHX[2], 2), IHX_SY, D.internalHeatExchanger],
    ["dl v", KX, COND[1] + div(COND[3], 2), D.condenser],
  ];
  // Same rules as in the schematic: badges only for measuring points on the
  // pipes, without icons; a device shows its own main value inside it
  // (inverter power, compressor speed) and minor values small (Öl, Motor,
  // Primärkreis); the fans show their speed by turning and open on tap.
  const badges: BadgeSpec[] = [
    ["valve_2", EEV2_X, VB_Y, "", "", D.valve2],
    ["valve_1", EEV1_X, VB_Y, "", "", D.valve1],
    ["evaporator_liquid", CCX, LB_Y, "", "", D.liquidGas],
    // The liquid sensor for heating sits between expansion valve 1 and the
    // internal heat exchanger (service manual, Abb. 133).
    ["economizer_liquid", IHX_R, LB_Y, "", "", D.liquidGas],
    ["condenser_liquid", KX, LB_Y, "", "", D.liquidGas],
    // From the suction gas sensor behind the 4-way valve, so the badge stays
    // on the suction side in defrost too.
    ["superheat", V4X, SUC1_Y, "", "", D.superheat], // on the Sauggas row
    ["suction_temp", MX, SUC1_Y, "", "", D.suctionGas],
    ["suction_pressure", MX, SUC2_Y, "", "", D.lowPressure],
    ["hot_gas", div(COMP[0] + COMP[2] + V4X - V4R, 2), V4Y, "", "", D.hotGas],
    ["return", SEC_X, RL_Y, "", "", D.return],
    ["secondary_supply", SEC_X, VL_Y, "", "", D.supply],
  ];
  const values: ValueSpec[] = [
    ["primary_supply", OUT_X, div(FAN1_Y + FAN2_Y, 2), D.primaryCircuit, "sm"], // on the Verdampfer row
    ["inverter_power", IX, INV_Y, D.inverter, "big"],
    ["compressor_speed", MX, ROW1, D.compressor, "big dk"],
    // Öl on the Heißgas row, Motor close below as a pair.
    ["oil_temp", MX, ROW2, D.oil, "sm dk"],
    ["motor_temp", MX, ROW2 + 22, D.motor, "sm dk"],
  ];
  // Badges reach full size at the same card width as in the hydraulic
  // schematic, so both cards show them at one size.
  return layout({
    name: "wide rf",
    w: W,
    h: H,
    defs,
    body,
    labels,
    badges,
    values,
    label: D.refrigerantCircuit,
    unit: 790,
    umin: 0.9,
  });
}

function narrow() {
  // The same circuit for phones. Fans and evaporator on top. The liquid rises
  // in the middle from the internal heat exchanger through expansion valve 2
  // into the evaporator; the suction gas leaves it on the right, passes the
  // 4-way valve and the internal heat exchanger and runs down to the
  // compressor; the hot gas goes from the compressor up through the 4-way
  // valve and down the right edge to the condenser at the bottom; the liquid
  // comes back up the left through expansion valve 1. Valve openings sit
  // directly on the pipe here. Less important compressor and inverter values
  // are left out to save height. Rows are shared across the three columns,
  // PITCH apart.
  const W = 400;
  const PITCH = 32 + GAP;
  // Columns, balanced so the left badges and the hot gas lane keep about the
  // same distance from the housing.
  const LX = 88;
  const MX = 192;
  const RX = 288;
  const LANE_X = 352; // hot gas lane right of the compressor
  const TITLE_Y = 30;
  const FAN_Y = 100;
  const COIL = [64, 146, 272, 28] as const;
  const CB = COIL[1] + COIL[3];
  const ROW1 = CB + GAP + 16; // Verdampfer, Ventil 2, internal heat exchanger
  const ROW2 = ROW1 + PITCH;
  const IHX = [MX - 62, ROW2 + 16 + GAP, 124, 60] as const; // right below expansion valve 2; wide enough for one-word lines
  const EY = IHX[1] + div(IHX[3], 2);
  const V4Y = EY;
  const SUC1_Y = IHX[1] + IHX[3] + GAP + 16; // Sauggas and Heißgas
  const SUC2_Y = SUC1_Y + PITCH;
  const COMP = [RX - 48, SUC1_Y + 16 + GAP, 96, 212] as const;
  const CROW1 = COMP[1] + 48; // compressor rows
  const CROW2 = CROW1 + PITCH;
  const CROW3 = CROW1 + 2 * PITCH;
  // Liquid line rows: Flüssiggas, expansion valve 1, Flüssiggas, starting on
  // the Niederdruck row so the inverter gets room above the condenser.
  const LROW1 = SUC2_Y;
  const LROW2 = LROW1 + PITCH;
  const LROW3 = LROW1 + 2 * PITCH;
  const COND = [64, COMP[1] + COMP[3] + GAP, 272, 36] as const;
  // Supply on the right under the hot gas inlet, return on the left under
  // the liquid outlet, so each water pipe sits on its side of the condenser.
  const VL_X = 250;
  const RL_X = 150;
  const ODU = [16, 52, W - 32, COND[1] + COND[3] + 16 - 52] as const;
  const FLOOR = ODU[1] + ODU[3] + PLINTH;
  const DEPTH = 18;
  const WAT_Y = FLOOR + DEPTH + 30;
  const H = WAT_Y + 16 + 12;
  // Inverter above the condenser, beside the compressor it drives, joined by
  // a power line; flat to fit between the badges and the condenser.
  const INV_X = LX + 16; // clear of the liquid line, below its badges
  const INV_TOP = LROW3 + 16 + GAP;
  const INV = [INV_X, INV_TOP, COMP[0] - 12 - INV_X, COND[1] - GAP - INV_TOP] as const;

  const defs: Defs = [];
  const [ox, oy, ow, oh] = ODU;
  const body = [
    sky("rfn", defs, 16, 8, W - 32, FLOOR - 8),
    band("wall", 16, W - 16, FLOOR, DEPTH, 0, 0),
    lawn("rfn", defs, 16, W - 16, FLOOR),
    `<rect class='devd plinth' x='${ox + 10}' y='${oy + oh - 4}' width='${ow - 20}' height='${PLINTH + 4}' rx='2'/>`,
    `<rect class='devd' x='${ox}' y='${oy}' width='${ow}' height='${oh}' rx='14'/>`,
    `<rect class='dev' x='${ox + 8}' y='${oy + 8}' width='${ow - 16}' height='${oh - 16}' rx='8'/>`,
    fanbox(165, FAN_Y, "fan_1"),
    fanbox(235, FAN_Y, "fan_2"),
    tap("inverter_power", box("rfn", defs, "inv", ...INV)),
    wire(INV[0] + INV[2], COMP[0], INV[1] + div(INV[3], 2)),
    coil("rfn", defs, ...COIL),
    box("rfn", defs, "cond", ...COND),
    box("rfn", defs, "ihx", ...IHX),
    tap("compressor_speed", compressor(...COMP)),
    pipes([
      ["r", "l2b", `M${MX} ${ROW2} V${CB}`],
      ["s", "l2a", `M${MX} ${IHX[1]} V${ROW2}`],
      ["r", "e", `M${RX} ${CB} V${V4Y - V4R}`],
      ["r", "s", `M${RX - V4R} ${V4Y} H${IHX[0] + IHX[2]}`],
      // Suction enters the compressor at mid height, clear of the inverter.
      ["r", "s", `M${MX} ${IHX[1] + IHX[3]} V${COMP[1] + div(COMP[3], 2)} H${COMP[0]}`],
      ["s", "d", `M${RX} ${COMP[1]} V${V4Y + V4R}`],
      ["s", "c", `M${RX + V4R} ${V4Y} H${LANE_X} V${COND[1] + div(COND[3], 2)} H${COND[0] + COND[2]}`],
      ["s", "l1a", `M${LX} ${COND[1]} V${LROW2}`],
      ["s", "l1b", `M${LX} ${LROW2} V${EY} H${IHX[0]}`],
      ["s", "wv", `M${VL_X} ${COND[1] + COND[3]} V${WAT_Y}`],
      ["r", "wr", `M${RL_X} ${WAT_Y} V${COND[1] + COND[3]}`],
    ]),
    fourWay(RX, V4Y), // ports: E top, S left, D bottom, C right
    // Expansion valves drawn on their pipes; the opening is in the more-info.
    tap("valve_2", `<circle class='hit' cx='${MX + 4}' cy='${ROW2}' r='20'/>${eev(MX, ROW2, true)}`),
    tap("valve_1", `<circle class='hit' cx='${LX + 4}' cy='${LROW2}' r='20'/>${eev(LX, LROW2, true)}`),
    heater(RX, CROW3 + 44, "crankcase_heater"),
    // Between the two pipes, so no pipe seems to leave the heater.
    heater(div(MX + RX, 2), COIL[1] + div(COIL[3], 2), "base_heater"),
  ];
  const labels: LabelSpec[] = [
    ["title", div(W, 2), TITLE_Y, D.outdoorUnit],
    ["dv", div(COIL[0] + MX, 2), COIL[1] + div(COIL[3], 2), D.evaporator],
    ["dl", MX - 10, EY, D.internalHeatExchanger], // centered on the lit face, left of the shade
    ["dl", COND[0] + div(COND[2], 2), COND[1] + div(COND[3], 2), D.condenser],
  ];
  const badges: BadgeSpec[] = [
    ["evaporator_liquid", MX, ROW1, "", "", D.liquidGas],
    // Between expansion valve 1 and the internal heat exchanger.
    ["economizer_liquid", LX, LROW1, "", "", D.liquidGas],
    ["superheat", RX, ROW2, "", "", D.superheat],
    ["suction_temp", MX, SUC1_Y, "", "", D.suctionGas],
    ["suction_pressure", MX, SUC2_Y, "", "", D.lowPressure],
    ["hot_gas", RX, SUC1_Y, "", "", D.hotGas],
    ["condenser_liquid", LX, LROW3, "", "", D.liquidGas],
    ["secondary_supply", VL_X, WAT_Y, "", "", D.supply],
    ["return", RL_X, WAT_Y, "", "", D.return],
  ];
  const values: ValueSpec[] = [
    // Beside the fans, off the title row; two lines to fit the narrow space.
    ["primary_supply", div(265 + ox + ow - 8, 2), FAN_Y, D.primaryCircuit, "sm st"],
    ["inverter_power", INV[0] + div(INV[2], 2), INV[1] + div(INV[3], 2), D.inverter, "big"],
    ["compressor_speed", RX, CROW1, D.compressor, "big dk"],
    ["oil_temp", RX, CROW2, D.oil, "sm dk"],
    ["motor_temp", RX, CROW2 + 22, D.motor, "sm dk"],
  ];
  return layout({ name: "narrow rfn", w: W, h: H, defs, body, labels, badges, values, label: D.refrigerantCircuit });
}

export const refrigerantLayouts = () => [wide(), narrow()];
