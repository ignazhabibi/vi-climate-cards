import { COMMON_SLOTS as C, fanSlot, type Slot } from "../card/slots";
import { T } from "../i18n";

const P = T.parts;

const sensor = (key: string, label: string, feature: string): Slot => ({ key, label, domain: "sensor", feature });

/** Everything the refrigerant circuit shows (Vitocal 250-A). */
export const REFRIGERANT_SLOTS: Slot[] = [
  { ...C.compressor, required: true },
  C.primary_supply,
  fanSlot("fan_1", 0),
  fanSlot("fan_2", 1),
  sensor("evaporator_liquid", P.evaporator_liquid, "heating.evaporators.0.sensors.temperature.liquid"),
  sensor("superheat", P.superheat, "heating.evaporators.0.sensors.temperature.overheat"),
  {
    key: "base_heater",
    label: P.base_heater,
    domain: "binary_sensor",
    feature: "heating.evaporators.0.heater.base.active",
  },
  sensor("suction_temp", P.suction_temp, "heating.compressors.0.sensors.temperature.inlet"),
  sensor("suction_pressure", P.suction_pressure, "heating.compressors.0.sensors.pressure.inlet"),
  sensor("compressor_speed", P.compressor_speed, "heating.compressors.0.speed.current"),
  sensor("hot_gas", P.hot_gas, "heating.compressors.0.sensors.temperature.outlet"),
  sensor("oil_temp", P.oil_temp, "heating.compressors.0.sensors.temperature.oil"),
  sensor("motor_temp", P.motor_temp, "heating.compressors.0.sensors.temperature.motorChamber"),
  {
    key: "crankcase_heater",
    label: P.crankcase_heater,
    domain: "binary_sensor",
    feature: "heating.compressors.0.heater.crankcase.active",
  },
  sensor("condenser_liquid", P.condenser_liquid, "heating.condensors.0.sensors.temperature.liquid"),
  sensor("economizer_liquid", P.economizer_liquid, "heating.economizers.0.sensors.temperature.liquid"),
  C.secondary_supply,
  C.return,
  C.volumetric_flow,
  C.defrost,
  // Valve 1 sits between condenser and internal heat exchanger, valve 2
  // before the evaporator; the API counts them from 0.
  sensor("valve_1", P.valve_1, "heating.sensors.valve.0.expansion.target"),
  sensor("valve_2", P.valve_2, "heating.sensors.valve.1.expansion.target"),
  sensor("inverter_power", P.inverter_power, "heating.inverters.0.sensors.power.output"),
];
