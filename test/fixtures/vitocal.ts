// A Home Assistant object with the vi_climate_devices entities of the user's
// Vitocal 250-A (entity IDs, features, and translation keys as read from the
// live instance on 2026-10-19), plus a few made-up neighbours that discovery
// has to ignore.
import type { Hass } from "../../src/card/hass";

export const DEVICE = "bd5354237765b40a51fbb3d220ec3738";
const OTHER_DEVICE = "made-up-second-device";

// [entity_id, feature, translation key]
type Row = [id: string, feature?: string, translationKey?: string];

const vitocal: Row[] = [
  ["sensor.e3_vitocal_16_4_3_wege_ventil_position", "heating.valves.fourThreeWay.position"],
  ["sensor.e3_vitocal_16_volumenstrom", "heating.sensors.volumetricFlow.allengra"],
  ["sensor.e3_vitocal_16_vorlauf_primarkreis", "heating.primaryCircuit.sensors.temperature.supply"],
  ["binary_sensor.e3_vitocal_16_verdichter_0", "heating.compressors.0.active"],
  ["sensor.e3_vitocal_16_lufter_0_drehzahl", "heating.primaryCircuit.fans.0.current", "fan_speed_numbered"],
  ["sensor.e3_vitocal_16_lufter_1_drehzahl", "heating.primaryCircuit.fans.1.current", "fan_speed_numbered"],
  ["sensor.e3_vitocal_16_vorlauf_sekundarkreis", "heating.secondaryCircuit.sensors.temperature.supply"],
  ["sensor.e3_vitocal_16_rucklauftemperatur", "heating.sensors.temperature.return"],
  ["sensor.e3_vitocal_16_gemeinsamer_vorlauf", "heating.boiler.sensors.temperature.commonSupply"],
  ["sensor.e3_vitocal_16_boiler_pumps_internal_current", "heating.boiler.pumps.internal.current"],
  ["sensor.keller_warmepumpe_warmepumpe_zustand", "device.messages.status.raw", "heat_pump_state"],
  ["sensor.keller_warmepumpe_heizstab", "device.messages.status.raw", "heating_rod_stage"],
  ["binary_sensor.keller_warmepumpe_warmwasserbereitung_aktiv", "device.messages.status.raw", "dhw_heating"],
  ["sensor.keller_warmepumpe_noise_reduction_operating_programs_active", "heating.noise.reduction.operating.programs.active"],
  ["binary_sensor.e3_vitocal_16_abtauvorgang", "heating.outdoor.defrosting.active"],
  ["sensor.e3_vitocal_16_vorlauf_heizkreis_0", "heating.circuits.0.sensors.temperature.supply"],
  ["binary_sensor.e3_vitocal_16_heizkreispumpe_heizkreis_0", "heating.circuits.0.circulation.pump.status"],
  ["sensor.e3_vitocal_16_pufferspeichertemperatur", "heating.bufferCylinder.sensors.temperature.main"],
  ["sensor.e3_vitocal_16_warmwassertemperatur", "heating.dhw.sensors.temperature.hotWaterStorage"],
  ["binary_sensor.e3_vitocal_16_zirkulationspumpe_warmwasser", "heating.dhw.pumps.circulation.status"],
  ["water_heater.e3_vitocal_16_warmwasser", undefined, "dhw_water_heater"],
  ["climate.warmepumpe_heizkreis_0", undefined, "heating_circuit"],
  ["sensor.e3_vitocal_16_aussentemperatur", "heating.sensors.temperature.outside"],
  ["sensor.keller_warmepumpe_production_current", "heating.heat.production.current"],
  ["sensor.e3_vitocal_16_verdampfer_0_flussigkeitstemperatur", "heating.evaporators.0.sensors.temperature.liquid"],
  ["sensor.e3_vitocal_16_verdampfer_0_uberhitzung", "heating.evaporators.0.sensors.temperature.overheat"],
  ["binary_sensor.e3_vitocal_16_verdampfer_0_basisheizung", "heating.evaporators.0.heater.base.active"],
  ["sensor.e3_vitocal_16_verdichter_0_einlasstemperatur", "heating.compressors.0.sensors.temperature.inlet"],
  ["sensor.e3_vitocal_16_verdichter_0_einlassdruck", "heating.compressors.0.sensors.pressure.inlet"],
  ["sensor.e3_vitocal_16_verdichter_0_drehzahl", "heating.compressors.0.speed.current"],
  ["sensor.e3_vitocal_16_verdichter_0_auslasstemperatur", "heating.compressors.0.sensors.temperature.outlet"],
  ["sensor.e3_vitocal_16_verdichter_0_oltemperatur", "heating.compressors.0.sensors.temperature.oil"],
  ["sensor.e3_vitocal_16_verdichter_0_motortemperatur", "heating.compressors.0.sensors.temperature.motorChamber"],
  ["binary_sensor.e3_vitocal_16_verdichter_0_kurbelgehauseheizung", "heating.compressors.0.heater.crankcase.active"],
  ["sensor.e3_vitocal_16_verflussiger_0_flussigkeitstemperatur", "heating.condensors.0.sensors.temperature.liquid"],
  ["sensor.e3_vitocal_16_economizer_0_flussigkeitstemperatur", "heating.economizers.0.sensors.temperature.liquid"],
  ["sensor.e3_vitocal_16_sensors_valve_0_expansion_target", "heating.sensors.valve.0.expansion.target"],
  ["sensor.e3_vitocal_16_sensors_valve_1_expansion_target", "heating.sensors.valve.1.expansion.target"],
  ["sensor.e3_vitocal_16_aktueller_stromverbrauch_0", "heating.inverters.0.sensors.power.output"],
  ["sensor.e3_vitocal_16_inverters_0_sensors_power_current", "heating.inverters.0.sensors.power.current"],
  ["sensor.e3_vitocal_16_inverters_0_sensors_temperature_power_module", "heating.inverters.0.sensors.temperature.powerModule"],
];

/** Builds a hass object; `unavailable` entities have no feature attribute, as
 * after a Home Assistant restart before the integration has loaded. */
export function vitocalHass(options: { unavailable?: string[] } = {}): Hass {
  const hass: Hass = { states: {}, entities: {}, formatEntityState: (s) => s.state };
  const add = (id: string, device: string, platform: string, feature?: string, translationKey?: string) => {
    const unavailable = options.unavailable?.includes(id);
    (hass.entities as Record<string, object>)[id] = {
      device_id: device,
      platform,
      ...(translationKey ? { translation_key: translationKey } : {}),
    };
    hass.states[id] = {
      entity_id: id,
      state: unavailable ? "unavailable" : "0",
      last_changed: "2026-10-19T08:00:00Z",
      attributes: feature && !unavailable ? { viessmann_feature_name: feature } : {},
    };
  };
  // Made up: a compressor of another integration comes first and must not
  // pick the device; neither may a second Viessmann device.
  add("binary_sensor.other_heat_pump_compressor", "other-integration-device", "other", "heating.compressors.0.active");
  add("sensor.made_up_gateway_outside", OTHER_DEVICE, "vi_climate_devices", "heating.sensors.temperature.outside");
  // Made up: a select on the same feature as a sensor; the slot's domain decides.
  add("select.made_up_noise_reduction", DEVICE, "vi_climate_devices", "heating.noise.reduction.operating.programs.active");
  for (const [id, feature, tk] of vitocal) add(id, DEVICE, "vi_climate_devices", feature, tk);
  return hass;
}

/** The `entities` mapping of an example configuration (examples/*.yaml). */
export function exampleEntities(yaml: string): Record<string, string> {
  const block = yaml.slice(yaml.indexOf("\nentities:"));
  return Object.fromEntries([...block.matchAll(/^ {2}(\w+): ([\w.]+)/gm)].map((m) => [m[1], m[2]]));
}
