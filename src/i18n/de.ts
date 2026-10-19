// German texts of both cards. Every word the cards show or the editor asks
// lives here, so a second language is one more file of this shape.
// Placeholders in braces are filled by `fill()`; `{key}` in the live lines of
// the explanation is the formatted state of that entity key.

export const de = {
  cards: {
    hydraulic: { name: "Viessmann Anlagenschema", description: "Hydraulikschema der Vitocal 250-A mit Live-Werten" },
    refrigerant: { name: "Viessmann Kältekreis", description: "Kältekreis der Vitocal 250-A mit Live-Werten" },
  },

  /** Words in the drawings: captions, device names, badge and value names. */
  drawing: {
    schematic: "Anlagenschema",
    refrigerantCircuit: "Kältekreis",
    outdoorAir: "Außenluft",
    outdoorUnit: "Außeneinheit",
    indoorUnit: "Inneneinheit",
    secondaryCircuit: "Sekundärkreis",
    heatingCircuit: "Heizkreis",
    defrostBuffer: "Abtaupuffer",
    circulation: "Zirkulation",
    supply: "Vorlauf",
    return: "Rücklauf",
    flow: "Durchfluss",
    generatorSupply: "Vorlauf Erzeuger",
    primaryCircuit: "Primärkreis",
    noiseReduction: "Geräuschreduzierung",
    hotWater: "Warmwasser",
    buffer: "Puffer",
    evaporator: "Verdampfer",
    internalHeatExchanger: "Interner<br>Wärmetauscher",
    condenser: "Verflüssiger",
    valve1: "Ventil 1",
    valve2: "Ventil 2",
    liquidGas: "Flüssiggas",
    superheat: "Überhitzung",
    suctionGas: "Sauggas",
    lowPressure: "Niederdruck",
    hotGas: "Heißgas",
    inverter: "Inverter",
    compressor: "Verdichter",
    oil: "Öl",
    motor: "Motor",
  },

  /** Name of each entity key, in the editor and for screen readers. */
  parts: {
    state: "Zustand in der Kopfzeile",
    valve: "4/3-Wege-Ventil",
    volumetric_flow: "Durchfluss",
    compressor: "Verdichter",
    primary_supply: "Primärkreis",
    fan: "Ventilator {n}",
    secondary_supply: "Vorlauf Sekundärkreis",
    return: "Rücklauf",
    generator_supply: "Vorlauf Erzeuger",
    internal_pump: "Interne Pumpe",
    heater: "Heizstab",
    noise_reduction: "Geräuschreduzierung",
    defrost: "Abtauen",
    circuit_supply: "Vorlauf Heizkreis",
    circuit_pump: "Heizkreispumpe",
    buffer: "Puffer",
    dhw: "Warmwasser",
    circulation_pump: "Zirkulationspumpe",
    water_heater: "Warmwasserspeicher",
    climate: "Heizkreis",
    evaporator_liquid: "Flüssiggas Verdampfer",
    superheat: "Überhitzung",
    base_heater: "Basisheizung",
    suction_temp: "Sauggas",
    suction_pressure: "Niederdruck",
    compressor_speed: "Verdichter Drehzahl",
    hot_gas: "Heißgas",
    oil_temp: "Öl",
    motor_temp: "Motor",
    crankcase_heater: "Kurbelgehäuseheizung",
    condenser_liquid: "Flüssiggas Verflüssiger",
    economizer_liquid: "Flüssiggas Wärmetauscher",
    valve_1: "Ventil 1",
    valve_2: "Ventil 2",
    inverter_power: "Inverter",
  },

  /** The card frame: header, notes, explanation dialog. */
  card: {
    noData: "Keine Daten",
    justNow: "gerade eben",
    minutes: "seit {n} Min.",
    hours: "seit {n} Std.",
    day: "seit 1 Tag",
    days: "seit {n} Tagen",
    missing:
      "Es fehlt: {parts}. Die Karte findet ihre Entitäten am Gerät der Integration „Viessmann Climate Devices“ " +
      "(Option device) oder nimmt sie aus der Option entities.",
    close: "Schließen",
    lines: "In den Leitungen",
    now: "Jetzt: {text}",
    pause: "Bewegung anhalten",
    play: "Bewegung fortsetzen",
  },

  /** Errors of setConfig; Home Assistant shows them instead of the card. */
  config: {
    missing: "Konfiguration fehlt",
    entities: "entities muss eine Zuordnung Schlüssel → Entität sein",
    device: "device muss eine Geräte-ID sein",
    preset: 'preset "{preset}" unbekannt, möglich: {presets}',
    itemEntity: "status_items: entity fehlt",
    condition: 'status_items: Bedingung "{condition}" wird nicht unterstützt, nur "state"',
    conditionEntity: "status_items: Bedingung ohne entity",
    conditionState: "status_items: Bedingung braucht state oder state_not",
  },

  editor: {
    labels: {
      device: "Wärmepumpe",
      preset: "Variante",
      show_state: "Zustand in der Kopfzeile",
      info: "Erklärung anbieten",
      animations: "Bewegung zeigen",
    } as Record<string, string>,
    helpers: {
      device: "Die Karte findet ihre Entitäten an diesem Gerät der Integration Viessmann Climate Devices.",
      show_state: "Die Betriebsphase der Wärmepumpe groß oben, mit „seit …“.",
      info: "Ein Info-Button erklärt die Anlage für Laien.",
      animations:
        "Aus: Leitungen und Ventilatoren stehen still, die Farben zeigen den Zustand weiter. " +
        "Betrachter können die Bewegung auch auf der Karte anhalten.",
    } as Record<string, string>,
    entities: "Entitäten anpassen",
    /** Status of a field: what the card uses and where it comes from. */
    auto: "Automatisch erkannt.",
    autoDevice: "Automatisch erkannt: die erste Wärmepumpe der Integration.",
    own: "Eigene Wahl; leeren für automatisch.",
    hidden: "Ausgeblendet (entities in YAML).",
    notFound: "Nicht gefunden; bitte auswählen.",
  },

  hydraulic: {
    info: {
      title: "So funktioniert die Anlage",
      intro:
        "Die Außeneinheit erwärmt Wasser. Die Anlage bringt es dorthin, wo Wärme gebraucht wird, in diesen vier " +
        "Schritten:",
      run: "Gerade fließt Wasser. Bei jedem Schritt steht, was gerade passiert.",
      off: "Gerade fließt kein Wasser zur Außeneinheit. Sobald sie läuft, steht bei jedem Schritt, was gerade passiert.",
      defrost: "Gerade wird abgetaut (siehe unten).",
      legend: ["Vorlauf, warm", "Rücklauf, abgekühlt"],
      steps: [
        {
          t: "Erwärmen",
          p:
            "In der Außeneinheit gibt der Kältekreis seine Wärme an das Wasser ab. Warm fließt es zur Inneneinheit, " +
            "abgekühlt kommt es zurück.",
          now: "Hin {secondary_supply} · zurück {return}",
        },
        {
          t: "Verteilen",
          p:
            "Eine Pumpe hält das Wasser in Bewegung. Ein Ventil schickt es zur Heizung oder in den " +
            "Warmwasserspeicher. Bei Bedarf hilft ein Heizstab.",
          now: "Durchfluss {volumetric_flow} · Vorlauf {generator_supply}",
        },
        {
          t: "Heizen",
          p: "Der Pufferspeicher sammelt das warme Wasser. Von dort bringt die Heizkreispumpe es zu den Heizkörpern.",
          now: "Puffer {buffer} · Heizkreis {circuit_supply}",
        },
        {
          t: "Warmwasser",
          p:
            "Der Speicher hält das Wasser zum Duschen und Spülen warm. Die Zirkulationspumpe sorgt dafür, dass es " +
            "schnell warm aus dem Hahn kommt.",
          now: "Speicher {dhw}",
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
    },
  },

  refrigerant: {
    info: {
      title: "So funktioniert der Kältekreis",
      intro:
        "Die Wärmepumpe holt Wärme aus der Außenluft und bringt sie ins Wasser für Heizung und Warmwasser. " +
        "Dafür kreist ein Kältemittel in einem geschlossenen Kreis, immer in diesen vier Schritten:",
      run: "Die Wärmepumpe läuft. Bei jedem Schritt steht, was gerade passiert.",
      off: "Die Wärmepumpe läuft gerade nicht. Sobald sie läuft, steht bei jedem Schritt, was gerade passiert.",
      defrost: "Gerade wird abgetaut: Der Kreis läuft kurz rückwärts (siehe unten).",
      legend: ["flüssig", "nach dem Ventil: Tröpfchen", "gasförmig"],
      steps: [
        {
          t: "Verdampfen",
          p:
            "Die Ventilatoren ziehen Außenluft durch den Verdampfer. Das Kältemittel darin ist kälter als die Luft, " +
            "nimmt ihre Wärme auf und verdampft. Das klappt auch bei Frost, denn das Kältemittel Propan siedet schon " +
            "bei etwa −42 °C.",
          now: "Außenluft {primary_supply} · Kältemittel {evaporator_liquid}",
        },
        {
          t: "Verdichten",
          p:
            "Der Verdichter presst das Gas zusammen. Dabei wird es heiß, so wie eine Fahrradpumpe beim Pumpen " +
            "warm wird. Der Inverter regelt, wie schnell der Verdichter läuft.",
          now: "Drehzahl {compressor_speed} · Gas danach {hot_gas}",
        },
        {
          t: "Verflüssigen",
          p:
            "Im Verflüssiger gibt das heiße Gas seine Wärme an das Wasser für Heizung oder Warmwasser ab. " +
            "Dabei kühlt es ab und wird wieder flüssig.",
          now: "Wasser {return} → {secondary_supply}",
        },
        {
          t: "Entspannen",
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
    },
  },
};
