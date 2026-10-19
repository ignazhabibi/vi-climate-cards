import { COMMON_SLOTS as C, fanSlot, type Slot } from "../card/slots";

const sensor = (key: string, label: string, feature: string): Slot => ({ key, label, domain: "sensor", feature });

/** Everything the refrigerant circuit shows (Vitocal 250-A). */
export const REFRIGERANT_SLOTS: Slot[] = [
  { ...C.compressor, required: true },
  C.primary_supply,
  fanSlot("fan_1", 0),
  fanSlot("fan_2", 1),
  sensor("evaporator_liquid", "Flüssiggas Verdampfer", "heating.evaporators.0.sensors.temperature.liquid"),
  sensor("superheat", "Überhitzung", "heating.evaporators.0.sensors.temperature.overheat"),
  {
    key: "base_heater",
    label: "Basisheizung",
    domain: "binary_sensor",
    feature: "heating.evaporators.0.heater.base.active",
  },
  sensor("suction_temp", "Sauggas", "heating.compressors.0.sensors.temperature.inlet"),
  sensor("suction_pressure", "Niederdruck", "heating.compressors.0.sensors.pressure.inlet"),
  sensor("compressor_speed", "Verdichter Drehzahl", "heating.compressors.0.speed.current"),
  sensor("hot_gas", "Heißgas", "heating.compressors.0.sensors.temperature.outlet"),
  sensor("oil_temp", "Öl", "heating.compressors.0.sensors.temperature.oil"),
  sensor("motor_temp", "Motor", "heating.compressors.0.sensors.temperature.motorChamber"),
  {
    key: "crankcase_heater",
    label: "Kurbelgehäuseheizung",
    domain: "binary_sensor",
    feature: "heating.compressors.0.heater.crankcase.active",
  },
  sensor("condenser_liquid", "Flüssiggas Verflüssiger", "heating.condensors.0.sensors.temperature.liquid"),
  sensor("economizer_liquid", "Flüssiggas Wärmetauscher", "heating.economizers.0.sensors.temperature.liquid"),
  C.secondary_supply,
  C.return,
  C.volumetric_flow,
  C.defrost,
  // Valve 1 sits between condenser and internal heat exchanger, valve 2
  // before the evaporator; the API counts them from 0.
  sensor("valve_1", "Ventil 1", "heating.sensors.valve.0.expansion.target"),
  sensor("valve_2", "Ventil 2", "heating.sensors.valve.1.expansion.target"),
  sensor("inverter_power", "Inverter", "heating.inverters.0.sensors.power.output"),
];
