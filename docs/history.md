# History of the former project (vi-anlagenschema-card)

This is the handover file of the former Python project, kept as it was on
2026-10-19 when the cards moved here. Names in it are the old ones:
`vi-anlagenschema-card` is now `vi-hydraulic-card`, `vi-kaeltekreis-card` is
`vi-refrigerant-card`, `build.py` is the TypeScript code in `src/`, and the
pipe group `hk` is `hc`. The design history and the domain notes still apply.

State as of 2026-10-16. Read `AGENTS.md` first for the working rules.

## Current State

The card has two layouts, both deployed and checked live:

- **wide** (viewBox 790 × 616): desktop and tablet. The user likes it
  ("schon saucool").
- **narrow** (viewBox 400 × 674): phones and narrow columns, shown when the card
  is narrower than 600 px (container query on `.wrap`). The graphic stops
  growing at 460 px and is centered.

`dist/vi-anlagenschema-card.js` is byte-identical to the deployed resource
(79,464 bytes, djb2 1455680099, deployed 2026-10-18). It holds both cards.
On 2026-10-17 the Außen badge was removed from both cards (the user shows
the outdoor temperature as an HA badge at the top of the dashboard); the
Primärkreis value now sits right under the Außenluft caption (wide
schematic) or the Außeneinheit title (narrow schematic); in the refrigerant
circuit card it stays where it was, between the fans (user's choice). The `outside_temp` mapping key is no
longer drawn by the card.
The refrigerant circuit card (open task 2) replaced the "Verdichter" section
(compressor speed history graph) in view `anlage` on 2026-10-16.

The schematic card sits in view `uebersicht` since 2026-10-16; the user
removed it from view `anlage`, which now shows only the refrigerant circuit
card. In `anlage` the schematic had replaced the Wassertemperaturen and
Durchfluss chart sections; the wide viewBox height was chosen to match their
combined area (855 × 716 px at a 1418 px wide browser). The separate subview
`anlagenschema` and its navigation tiles were removed on 2026-10-15.

### Home Assistant setup

- Resource: inline module, id `a94feedfed44424592ffb50bf9328be2`.
- Dashboard `dashboard-heizung`, view `anlage` (index 4, a regular view tab
  since the user changed it; `back_path` to `uebersicht` is still set):
  `type: sections`, `max_columns: 3`, view header markdown "# Anlage",
  sidebar layout (main sections `column_span: 3`, plus `sidebar.sections`).
  - `sections[0]`: heading "Kältekreis" (subtitle) and the refrigerant
    circuit card with `status` (see header states below).
  - `sections[1]`: phone-only copy of the sidebar (`view_columns` max 1),
    moved to the end by the user. Sidebar and copy hold Kennwerte (gauges
    Druck, Spreizung, Volumenstrom; the user replaced the Interne Pumpe
    gauge), Verdichter tiles (Heute, Seit Inbetriebnahme), and an
    "Aktivität" logbook of the heat pump device, all added by the user.
  - Schematic mapping extras: `outside_temp`, `circulation_pump`
    (`binary_sensor.e3_vitocal_16_zirkulationspumpe_warmwasser`),
    `water_heater` (DHW tank tap), `climate` (radiator tap).
    `inverter_current` and `inverter_temp` were removed from the refrigerant
    mapping.
  - Status history: the in-card header line was removed in step 14 in
    favor of HA headings, then markdown sentences under the headings
    (heading badges were tried first; the user wanted readable prose), and
    since step 18 the cards show the state again in their own header,
    rendered from a template.
  - The Volumenstrom gauge shows the same value as the Durchfluss badge in
    the schematic. Left as the user set it up.
- View `uebersicht` (index 0): the schematic card with the mapping in
  `example-card.yaml`, `status_entity:
  sensor.keller_warmepumpe_warmepumpe_zustand`, and the `status_items` shown
  there.
- Header model (2026-10-17, agreed with the user after several rounds).
  Line 1 is the integration's Betriebsphase (Viessmann status messages),
  translated by HA, with "seit …" from its last change. Line 2 shows only
  entity states:
  - "Heizkreispumpe In Betrieb"
    (`binary_sensor.e3_vitocal_16_heizkreispumpe_heizkreis_0`) while the
    Betriebsphase is off, so heating from the buffer reads "Aus /
    Heizkreispumpe In Betrieb · Heizprogramm Normal". The header uses no
    helper at all.
  - The DHW mode while
    `binary_sensor.keller_warmepumpe_warmwasserbereitung_aktiv` is on, card
    name "Warmwasser", so it reads "Warmwasser Eco". The user switched the
    entity on 2026-10-18 from the select to
    `water_heater.e3_vitocal_16_warmwasser` (states eco / performance).
  - The heating program (`sensor.warmepumpe_circuits_0_operating_programs_active`,
    "Heizprogramm Normal", also Urlaub, Urlaub zu Hause, Sommer Eco,
    Standby) while DHW heating is not active.
  - The heating rod while a stage runs.
  - During DHW heating line 1 says "Heizen": S.125 covers both, and line 2
    says "Warmwasser …".
- Entity names set in the registry (IDs unchanged) so the header and the
  logbook read "Name · state": Wärmepumpe Betriebsphase
  (`sensor.keller_warmepumpe_warmepumpe_zustand`), Wärmepumpe Heizprogramm,
  Wärmepumpe Warmwassermodus. A registry name replaces the whole friendly
  name here, so it carries the device name; the card and the device logbook
  strip it.
- Removed on 2026-10-17: the helpers "Wärmepumpe Status" / "Betrieb",
  "Vorgabe", and "Heizen aus Puffer" (the header needs none), and the binary
  sensors
  `binary_sensor.e3_vitocal_16_operating_programs_holiday_active` and
  `..._holiday_at_home_active` are disabled. The user tested both holiday
  programs: the heating program switches to `holiday` / `holiday_at_home` in
  the same second as the binary sensors. The holiday alerts in the
  Übersicht warning section (main column and sidebar, including the
  section's visibility condition) now use the heating program with state
  `holiday` or `holiday_at_home`. The summer eco binary sensor stays (not
  tested yet).
- Rejected on the way: raw entity lists in line 2 (too much), heat output
  and heating circuit pump in line 2, a separate defrost item, an own
  activity helper in line 1 (it duplicated the Betriebsphase in the
  logbook), and a "Vorgabe" helper (it duplicated program and DHW mode).
- New integration entities (v3.1.0) use the device name, so their IDs start
  with `keller_warmepumpe_` while older ones keep `e3_vitocal_16_`; the user
  keeps them that way. Proposed integration changes (for vi_climate_devices,
  not made from here): name the state sensor "Betriebsphase" (its original
  name "Wärmepumpe Zustand" doubles the device name), "Heizprogramm" for
  `heating.circuits.N.operating.programs.active`, "Warmwassermodus" for the
  DHW mode select, and German state translations "Eco" / "Komfort" for
  `efficient` / `efficientWithMinComfort`.
- The header states listed below were the earlier template version; they
  are kept for reference and replaced by the header model above.
- Header states (2026-10-16, refined with the user). Line 1 is the state
  with "seit …" (macro `dur`: "12 Min.", "3 Std.", "2 Tagen") as `detail`;
  line 2 holds at most two values. Schematic, in priority order:
  - Abtauen (since defrost): Außen · Puffer.
  - Compressor on (since the later of compressor and valve change):
    Warmwasser (Wärmeleistung · Speicher actual → target from the
    water heater), Abtaupuffer laden (valve bypass; Wärmeleistung), Heizen
    (also with bypass; Wärmeleistung · Vorlauf Erzeuger).
  - Heizen aus dem Puffer (compressor off, heating circuit pump on; since
    the later change of both): Puffer · Vorlauf Heizkreis. The buffer is a
    hydraulic separator, so the house can be heated while the heat pump is
    idle; the old "Umwälzen" only looked at the secondary flow and showed
    "Bereit" in this case.
  - Nachlauf (only secondary flow, internal pump): Rücklauf.
  - Bereit: Puffer · Warmwasser.
  - A hint replaces the second value: "taktet häufig" (3+ starts today and
    under 30 min per start) or the coolest room ("Wohnzimmer zu kühl", 1 K
    or more below target, from nine room climates). "heute COP" was
    dropped as a daily figure, not a state.
  Refrigerant circuit: Abtauen (Kreis läuft rückwärts · Strom), Verdichter
  läuft (rps · Strom from `sensor.keller_warmepumpe_consumption_current`),
  Verdichter aus (no second line).
- Units in this instance: compressor speed `rps`, fan speed `%`, volumetric
  flow `L/h`.

## Design History

1. Mockups explored the schematic as a Home Assistant picture-elements card.
2. The user asked for an HA-native look (colors, Roboto, badges), HA-style
   badges inside the graphic, values for every circuit (Primärkreis,
   Sekundärkreis, Vorlauf Erzeuger, Heizkreis), and animated return flow.
3. The user criticised misalignment (fan rings off-center, badges not on
   shared axes), squeezed badges, and odd-looking tanks. Fixes: shared axes,
   more spacing, realistic standing tanks (domed jacket, darker cap and base,
   feet, cutaway window with stratification, heat-exchanger coil in the DHW
   tank), radiator moved above the buffer.
4. Picture-elements could not render two-line HA badges or scale text with the
   graphic. The user chose a custom card instead.
5. The first deployed version (viewBox 790 × 660) felt too space-filling on the
   iPad. The current version is compacted to 790 × 520.
6. On a 1030 px wide card the user found the badges and the whole graphic too
   heavy ("zu wuchtig"). Badges must never be larger than the HA view badges
   (36 px high, 10/12 px text, 18 px icon). Changes: `--u` is capped at 1px,
   all text moved from the SVG into the HTML overlay so it scales with `--u`
   instead of the graphic, pipes 6 → 4, valve radius 16 → 14, lighter
   radiator. Alignment fixes: defrost buffer, heating rod, and return riser
   share x = 388; "Vorlauf Erzeuger" sits on the "Durchfluss" row; both tank
   badges sit 30 units below their window top.
7. The viewBox grew from 790 × 520 to 790 × 661 to match the two chart
   sections in view `anlage`. Units are 300 high (was 244), both tanks 262
   (DHW and buffer the same height), the fan and ODU badges follow `FAN_Y`, and
   the "Die Kreise" block is centered vertically in the free area below the
   outdoor unit. Chart heights are fixed, so the match is exact only at this
   browser width; at other widths the card height scales with its width.
8. The Durchfluss badge floated in empty space between the units. It now sits
   on the supply drop inside the indoor unit, above Vorlauf Erzeuger, in both
   layouts. Both tanks now stand on one floor (same top and bottom). The
   generator supply enters the buffer top at its left shoulder (a quarter of
   the tank width), next to the heating circuit supply at the top center.
9. Pump badges: "Interne Pumpe" (`internal_pump`, percent) sits on the supply
   drop in the indoor unit between Durchfluss and Vorlauf Erzeuger. The
   heating circuit pump (`circuit_pump`, the existing binary sensor, shown as
   "Pumpe" under the "Heizkreis" caption; HA formats its state as
   "In Betrieb") sits on the same row in the heating circuit column. The
   radiator sits one badge gap above that pump in both layouts.

10. Scene redesign after the HA covers design concept
    (https://ux-design-concepts.openhomefoundation.org/ha-covers-refinement/)
    and photos of the user's Viessmann components. The user approved these
    points: a header line with the operating mode and its start time,
    two-tone shading and realistic components, a ground line, a realistic
    outdoor unit (one fan is enough, the user does not want two; reversed in step 14), removing
    the "Die Kreise" block and the legend, Material easing (0.3 s,
    `cubic-bezier(.4,0,.2,1)`), and tappable components. The user added the
    scene idea: nature as the link to reality, as daylight is in the HA
    concept; here the outdoor air and a lawn under the heat pump.
    - Wide: sky panel with two clouds on the left, the outdoor unit stands on
      a lawn with a gravel bed at the bottom left, the house wall separates
      outside and inside, supply and return rise along the facade and enter
      through the wall. Inside: wall-hung indoor unit (white, dark display
      band with a red line and the compressor LED), both tanks on the floor
      slab; the return manifold runs inside the slab. Primärkreis and
      Verdichter badges sit on the outdoor unit below the fan.
    - Narrow: sky on top with the outdoor unit on the lawn, title and
      Primärkreis in the air to its right, Verdichter on the unit. The pipes
      pass through the ground into the house below.
    - Grille ribs, lawn tufts, and gravel use SVG patterns to keep the inline
      payload small.
11. The user found step 10 too realistic and colorful and the proportions
    off. Changes: neutral device and scene tokens that work in light and dark
    mode, color only on the pipes (plus a muted lawn), no clouds, soil,
    gravel, logos, or red accent line; gray fan (the spin alone shows
    operation); radiator and defrost buffer neutral. Outdoor unit wider
    (200 × 220). House wall thicker (36); supply and return both leave the
    outdoor unit at the bottom, run through the ground, and rise inside the
    wall (supply on the outer side, return on the inner side and deeper, so
    they never cross). Both tanks share one style: well-rounded cylinder
    (corner radius a quarter of the width) on a narrow dark base, without the
    cutaway window and coil. Indoor unit smaller (200 × 256 instead of
    240 × 320, title above it); badges on the supply drop sit 14 units apart.
12. Only badges, the 4/3-way valve, and the heating rod circle are tappable.
    The heating rod circle has the valve's size (both 28 graphic units, via
    `--g`) and opens the new config key `heater`, mapped to the total counter
    `sensor.e3_vitocal_16_heizstab_starts`; the user does not want a daily
    helper. Pump badges keep `mdi:pump` (the internal pump reports percent,
    not on/off). The narrow layout shrank from 400 × 837 to 400 × 674 so the
    card fits on a phone screen (642 px high at 375 px width): smaller outdoor
    unit with title and both outdoor badges beside it, Sekundärkreis caption
    on the badge row, heating rod on the indoor title row, 12-unit badge gaps,
    shorter tanks (88 × 160) and radiator (40).
13. Design review pass of the schematic (2026-10-16, user approved all
    points). Wide: radiator top level with the indoor unit (y 52); outdoor
    unit 222 high so its top is level with the tanks (338), fan 70 below its
    top, Primärkreis and Verdichter 46 apart with 14 to the seam and the
    bottom; heating rod, defrost buffer, and return riser axis moved to
    x = 449 (14 from the indoor unit edge); display and LED centered between
    the return riser and the DHW drop so no pipe crosses them. Narrow: tanks
    104 wide as in the wide layout (the Warmwasser badge used to overhang the
    88 wide tank), heating circuit column at x = 312, its return 12 right of
    the buffer; radiator bottom level with the Durchfluss badge (12 above the
    pump); title and badges beside the outdoor unit centered on it. Both: the
    defrost buffer is drawn as a device (shade strip, corner radius 6) so it
    no longer reads as a badge; the header line is indented in viewBox units
    so it stays flush with the scene at every card width.
14. Header line removed from both cards (2026-10-16, user request); the HA
    heading above each card shows the state and one or two key values
    instead. Schematic: the outdoor unit shows both fans, each spinning with
    its own speed (`fan`, `fan_2`; stacked in the wide layout, one per half of
    the grille, side by side on phones); the Verdichter badge is gone and
    Primärkreis sits in the air above the unit, the title above it.
    Refrigerant circuit: the inverter is a dark housing with cooling ribs
    (driven parts dark, heat exchangers light) at fan 1 height; its first
    badge is named "Inverter" like "Verdichter" on the compressor. A design
    critique (user approved points 1–3) added name plates on the heat
    exchangers (the condenser plate is turned in the wide layout, the narrow
    economizer grew to 80 wide for it), a stronger outline for heat
    exchangers (`--hxl`), the liquid temperature badges renamed "Flüssiggas",
    and the inverter badges on the Sauggas and Saugdruck rows. Open critique
    points: touch targets below 40 px on phones, badge text down to 7 px at
    about 620 px card width (`--u` clamps at .7), badges not reachable by
    keyboard or screen reader, little top margin in the narrow refrigerant
    layout, optional Außen badge in the schematic sky. Steps 16 and 17
    resolved the touch targets, the text size, and the Außen badge.
15. Follow-up (2026-10-16, user request): the inverter, economizer, and
    condenser are plain devices like the defrost buffer (flat fill, shade
    strip on the right, fine outline; helper `box()` in `build.py`) instead
    of the dark ribbed inverter and the chevron plates; their names are plain
    device labels (class `dl`, like "Abtaupuffer"); only the finned
    evaporator keeps a name plate. The stronger heat exchanger outline is
    gone again. Schematic: "Außeneinheit" sits right above the outdoor unit,
    Primärkreis above the title.
16. Follow-up (2026-10-16, user request): schematic shows "Außenluft" with
    the outside temperature at the top left (narrow: Außen between title and
    Primärkreis beside the unit) and a "Zirkulation" badge on the DHW tank.
    Drawn devices are tappable (`tap()` in `build.py`, removed when the key
    has no entity): DHW tank → `water_heater`, buffer and radiator →
    `climate`, defrost buffer → `defrost`, fans → `fan`/`fan_2` (`fan_1`/
    `fan_2` in the refrigerant card), compressor → `compressor`, inverter →
    `inverter_power`. Refrigerant circuit: the inverter shows only its power
    badge and is as high as the fan 1 housing; the "4-Wege-Ventil" caption
    is gone.
17. Redesign of both cards after UI/UX hints from the user (2026-10-16,
    built as a draft, critiqued, then deployed). Every value has one of
    three forms:
    - **Measuring points** on a pipe are badges without icons (class
      `bd ni`); the pipe color and position say what is measured. Schematic:
      Außen, Vorlauf and Rücklauf (Sekundärkreis), Durchfluss, Vorlauf
      Erzeuger, Vorlauf (Heizkreis). Refrigerant circuit: Außen, Ventil 1/2,
      Flüssiggas ×3, Überhitzung, Sauggas, Saugdruck, Heißgas, Rücklauf,
      Vorlauf. The Lüfter badges are gone (the fans show their speed by
      turning and open on tap), and so is the warm/cold recoloring of
      refrigerant badges in defrost (the badge `data-g` field).
    - **Main values of a device** are big whole numbers inside it (`values`
      list in `build.py`, class `vv big`, not tappable; the device below
      opens on tap): Warmwasser and Puffer in the tanks, Inverter power,
      Verdichter speed (`dk` on the dark compressor).
    - **Minor values** are small text (`vv sm`, tappable): Primärkreis above
      the outdoor unit and beside the refrigerant circuit, Öl and Motor on
      the compressor as a pair 22 apart. The narrow refrigerant layout stacks
      Primärkreis (`sm st`) beside the fans.
    - **States** are drawn: the three pumps (internal, heating circuit,
      circulation) are ISO pump symbols (`pump()`: circle and triangle
      pointing in the flow direction) whose triangle fills `--warm` while
      the pump runs (state `on`, or a percentage above 0). The circulation
      pump sits on a short outlet pipe of the DHW tank (right side in the
      wide layout, left side in the narrow one) and its pipe animates while
      it runs.
    Taps: buffer tank → `buffer` (its temperature history, since the badge
    is gone; the radiator still opens `climate`), compressor →
    `compressor_speed`, valve symbols in the refrigerant card → `valve_1`/
    `valve_2`. Tap areas are about 44 px (badge `::after` ±6, pump and valve
    hit circles). `--u` clamps at 0.9 px (wide layouts) or 0.85 px (narrow)
    instead of 0.7, so text stays readable; device labels use
    `min(11u, 11g)` so they fit their device at about 620 px. The
    refrigerant card switches to its narrow layout below 700 px
    (`KK_NARROW_BELOW`), the schematic below 600 px. Critique fixes (user
    approved 1–5): big values whole and 20u with 11u names, Öl and Motor as
    a pair, Verdampfer plate centered between the fans, circulation pump on
    its outlet with the label inside the tank, Primärkreis 10 above the
    title.
18. Optional status header (2026-10-16, user request for view
    `uebersicht`): config key `status` holds a template that the card
    renders through the `render_template` subscription, as the markdown
    card does (strict, errors reported). The result is an object with
    `state` (24 px, normal weight), `detail` (14 px, gray, on the same
    baseline), and `info` (14 px, gray, line below); a JSON string is
    parsed, any other result is shown as the state, and a template error
    appears in the info line in the error color. The header sits in each
    layout above the scene (`.hd` before `.sc`, which holds the SVG and the
    overlay) and is indented 16 viewBox units, flush with the sky panel.
    Without `status` the card renders exactly as before. Both cards
    support the key; on the user's request view `anlage` switched to it as
    well, and its markdown cards were removed.
    Refined the same day: `detail` now carries "seit …", the info line
    holds state-specific values, and a new state covers heating from the
    buffer (see "Header states" above).
19. Check against the Viessmann manuals (2026-10-17, user request; see
    Domain Notes). Schematic: the internal (secondary) pump moved from the
    supply drop to the common return to the outdoor unit, inside the indoor
    unit (wide: on the horizontal return left of the riser, the indoor unit
    12 units taller and the tanks 12 units shorter; narrow: on the return
    riser on the heating circuit pump row). Durchfluss moved onto the pump
    row. Refrigerant circuit: an accumulator ("Sammler") on the suction line
    between the 4-way valve and the internal heat exchanger (wide: upright,
    rotated label; narrow: lying on the pipe, label below, only about 4 units
    from the heat exchanger); "Economizer" renamed "Wärmetauscher" (two lines
    in the narrow layout). New card option `status_entity`: the header shows
    the entity's state, "seit …" from its `last_changed` (refreshed every
    minute), and its `info` attribute; a `detail` attribute replaces
    "seit …". Prepared for the status template sensor that follows once the
    integration exposes the status messages (issue
    ignazhabibi/vi_climate_devices#236). Same day, after integration v3.1.0:
    option `status_info` (a template for the line below the state when
    `status_entity` is set), the status template helper, and the Übersicht
    switched to it. The refrigerant card in `anlage` still uses `status`.
20. Header from entities (2026-10-17): `status_info` removed. New option
    `status_items`, a list of entities (or `{entity, name}`) for line 2:
    each is shown only when it says something (binary on: name; numbers
    above 0 and states other than off: name and state; `name: false`: state
    only), names without the device prefix, joined by " · ", items kept on
    one line each. Line 1 shows the translated state of `status_entity`.
    Every header part opens its more-info dialog. Per-item `visibility`
    (HA's `state` condition with `state` or `state_not`) switches line 2
    between heating program and DHW mode. Line 1 is the Betriebsphase
    directly and no helper is left. Binary sensors show name and state like
    every other item ("Heizkreispumpe In Betrieb"; see HA Setup).

21. Outdoor and heating rod (2026-10-18, user request): the grille, side, and
    seam of the outdoor unit no longer catch taps, so both fans open their
    entity. The heating rod is a drawn symbol in the pump's circle (three
    coil turns, chosen over a zigzag and a meander) that turns warm while
    `heater` reports a stage (any state but off/unavailable/unknown);
    `heater` now points to `sensor.keller_warmepumpe_heizstab` instead of
    the start counter. New small value `noise_reduction`
    (`sensor.keller_warmepumpe_noise_reduction_operating_programs_active`):
    wide, as a caption between the "Außeneinheit" title (moved up 18 units)
    and the unit; narrow, stacked under Primärkreis (both values name above
    value, the column is too narrow for one line).

22. Refrigerant card review (2026-10-18): the crankcase and base heater are
    drawn coil symbols like the heating rod (warm while on), so no card uses
    the round HTML dots any more; the heater state moved to the shared base
    class. An empty header info line takes no space. View `anlage`: the
    refrigerant card's `status` template is gone; the header is the
    Betriebsphase with `status_items` Wärmeleistung
    (`sensor.keller_warmepumpe_production_current`, hidden at 0), Ø Laufzeit
    (`sensor.verdichter_laufzeit_je_start_heute`, the user's helper; chosen
    over starts today because it does not depend on the time of day), and
    Abtauungen heute (`sensor.keller_warmepumpe_abtauungen_heute`, only while
    the compressor is off, hidden at 0), so at most two items show.

23. Refrigerant card rework (2026-10-18, checked against the flow diagram in
    the installation and service manual, p. 208): no accumulator (no values,
    the card shows the principle, not every part). The 4-way valve is a
    neutral symbol (four expansion-valve triangles in a circle); the pipe
    colors show the direction, a port-exact drawing needs crossings. Terms
    and sensor positions follow the manual: "Flüssiggas" for the liquid
    sensors, superheat after the 4-way valve, "Niederdruck" for the suction
    pressure, badges "Ventil 1/2" (wide only; narrow draws the
    valve symbols on the pipes and their values open via more-info). In
    defrost the water return is the warm side. The inverter feeds the
    compressor and has a power wire (`.wire`): wide, it sits level with the
    evaporator label and the wire leaves its bottom into the compressor
    side; narrow, it sits left of the compressor with a short wire. Narrow
    was rebalanced (columns 88/192/288, suction enters the compressor at
    mid height, wider internal heat exchanger with a one-line-break label,
    Vorlauf right and Rücklauf left under the condenser). Only the
    evaporator has fins. Narrow viewBox is now 400 × 768.

24. Wide refrigerant layout pass (2026-10-18, user request): the Überhitzung
    badge overlapped the condenser at small card widths. The housing is 12
    units wider and the condenser moved right (x 736). The internal heat
    exchanger now starts at the compressor's left edge (171 wide); suction
    leaves it straight down into the compressor center. Alignment fixes:
    inverter centered between coil and compressor with valve 2 on its axis;
    valve 1 and the 4-way valve centered between the two liquid drops;
    Sauggas and Niederdruck centered between heat exchanger and compressor;
    Primärkreis on the Verdampfer row. The valve badges read "Ventil 1/2"
    (shorter than "Expansionsventil"). Check the wide layout at 720 px card
    width: badges are largest relative to the drawing there.

25. Explanation dialog (2026-10-18, user request, experiment): the
    refrigerant card has an info button at the right of its header row
    (`static info = VKK_INFO`; the header is then always rendered; `info:
    false` hides it). It opens a native `<dialog>` (top layer, so no
    container clips it; inside `.wrap`, so it inherits the light/dark
    tokens), styled like an HA dialog and full screen below 450 px. Content
    for laypeople: intro, four steps (Verdampfen, Verdichten, Verflüssigen,
    Entspannen), each with a small drawing of its part in the card's style,
    and two notes (internal heat exchanger, defrost). Live line "Jetzt: …"
    per step only while the compressor runs and the cycle runs forwards; off
    and defrost show a note instead. Test page: `info=1` opens it. Headless
    Chrome cannot go below about 500 px, so check the full-screen variant in
    the browser pane.

26. Refrigerant state in the pipes (2026-10-18, user request): the flow
    overlay of the refrigerant card shows the state, the color still shows
    warm/cold. Gas (`.fl.gas`): sparse fast dots; liquid (`.fl.liq`): dense
    slow dashes (variant A, chosen over short dense dashes); two-phase mix
    after the expanding valve (`.fl.mix`): droplets. Heating: l1a, l1b, l2a
    liquid, l2b mix; defrost: l2b, l2a, l1b liquid, l1a mix (valve 1
    expands); all other refrigerant groups gas, water unchanged. The info
    dialog has a legend "In den Leitungen" with the three patterns on a
    neutral pipe.

27. Refrigerant card review (2026-10-18): the info button has a 48 px
    touch target like HA icon buttons. Notes on the three "Flüssiggas"
    values and the small heaters were tried in the dialog and removed again:
    the user found the dialog too long. Keep it at intro, four steps,
    legend, and two notes. Full-screen
    dialog checked live at 375 × 812 (by measurement; the pane window was
    minimized). Still not seen live: defrost, heaters on, reduced motion.

28. Explanation dialog for the schematic (2026-10-18, user request): same
    dialog as the refrigerant card (`static info = VAS_INFO`), kept short:
    four steps (Erwärmen, Verteilen, Heizen, Warmwasser) with small
    drawings, a legend for supply and return, and one note (defrost).
    Live lines while water flows (`_infoLive()` per card); steps marked
    `always` (buffer, DHW tank) show theirs also at rest. Legend entries are
    now (pipe classes, flow classes, text). Checked live on the Übersicht
    view.

## Domain Notes (Vitocal 250-A)

- Primärkreis is the air side; its supply sensor is the air inlet temperature.
- The refrigerant circuit (R290 monoblock) sits inside the outdoor unit.
- Sekundärkreis is heating water between outdoor and indoor unit (about
  1,300 L/h in operation).
- "Vorlauf Erzeuger" is measured after the heating rod and before the 4/3-way
  valve.
- 4/3-way valve positions from the actuator test in the installation and
  service manual (indoor unit with one integrated circuit): 0 % secondary
  circuit, heating circuit 1 or external buffer (`climate_circuit_one`);
  0 to 50 % mixed operation of secondary circuit and integrated buffer
  (`climat_circuit_one_and_two`); 50 % integrated buffer, defrost, also the
  resting position (`climat_circuit_two_defrost`); 100 % DHW
  (`domestic_hot_water`). The valve also works as the overflow valve for the
  minimum flow rate.
- Indoor unit with one integrated circuit: the only pump inside is the
  secondary pump ("interne Pumpe"). It sits on the return to the outdoor unit
  and moves water through outdoor unit, indoor unit, and the buffer or DHW
  tank; it runs in pre-run, operation, and post-run. The heating circuit pump
  after the external buffer is connected to the indoor unit (configurable
  output, "z. B. Umwälzpumpe zur Pufferentladung") and runs whenever the
  operating mode is heating.
- Refrigerant circuit after the flow diagram in the installation and service
  manual (p. 208): condenser → expansion valve 1 → internal heat exchanger →
  expansion valve 2 → evaporator; suction: evaporator → 4-way valve →
  accumulator → internal heat exchanger → compressor (types A04 to A13 have
  a second accumulator before the compressor). The card leaves the
  accumulators out. The inverter (frequency converter) powers the compressor
  and sets its speed.
- Heating rod: three stages of 2.4 / 2.4 / 3.2 kW (8 kW), minimum flow
  250 / 425 / 600 l/h.
- Status messages: listed in the service manual "Vitocal 1/25x-A –
  Systemkonfiguration und Diagnose" (document 6200041). Observed live:
  S.123 off and S.134 valve idle after a run; S.118 and S.124 pre-run when
  the secondary pump starts; S.125 heating about two minutes later, when the
  compressor starts. `device.messages.status.raw` holds the current set,
  timestamps are local time despite the `Z`.
- The external buffer acts as a hydraulic separator. The heating circuit is fed
  from the buffer and runs on its own pump, independent of the valve.
- Defrost uses the internal buffer first and can fall back to the heating
  circuit or external buffer.

## Open Tasks

1. **Narrow layout review.** Built from the earlier approved phone direction:
   outdoor unit on top, secondary circuit below it with Rücklauf and Vorlauf
   in one row, indoor unit with the valve and the heating circuit column
   beside it, both tanks on one floor below, return riser down the left side.
   Shared axes: x = 120 (captions, indoor title, defrost buffer), 184 (supply,
   heater, Durchfluss, Interne Pumpe, Vorlauf Erzeuger, valve, DHW), 312
   (heating circuit pump and supply, buffer). Since step 10 the outdoor unit stands
   on a lawn under a sky panel at the top. Wait for the user's feedback.
2. **Refrigerant circuit card (deployed 2026-10-16).** `vi-kaeltekreis-card`
   is built in `build.py` (same file, shared base class `VasCard`). It sits in
   view `anlage` as section 3 (heading "Kältekreis"), in place of the former
   "Verdichter" history graph section. Mapping: `example-kaeltekreis-card.yaml`.
   - Checked against https://github.com/mschneider82/vieventlog (photos of
     the Viessmann refrigerant screen, API mapping). Corrections: the
     economizer is the internal heat exchanger between liquid and suction
     line (no vapour injection); there are two expansion valves (1 between
     condenser and economizer, 2 between economizer and evaporator; heating
     regulates valve 2, defrost valve 1); suction runs evaporator → 4-way
     valve → economizer → compressor.
   - The user had the integration's disabled sensors for valve openings and
     inverter enabled through the MCP (2026-10-16):
     `sensor.e3_vitocal_16_sensors_valve_0/1_expansion_target`,
     `sensor.e3_vitocal_16_aktueller_stromverbrauch_0` (inverter output
     power, renamed by the user), `..._inverters_0_sensors_power_current`,
     `..._inverters_0_sensors_temperature_power_module`. The user will enable
     them by default in `vi_climate_devices`. Valve 0 = valve 1 follows
     vieventlog; confirm against the display (top valve near 99 % while
     heating).
   - `binary_sensor.e3_vitocal_16_heating_rod_active` (disabled) only
     reports whether the heating rod is enabled at all, not whether it is
     heating right now (per the user), so it cannot drive the rod symbol.
   - Design review pass (2026-10-16, user approved all points). Wide
     (viewBox 944 × 728), columns from left: evaporator coil with both fans
     in front of it, inverter, economizer above the compressor, 4-way valve,
     condenser. Each heat exchanger shows its liquid temperature on the drop
     right above it (one row); the valve openings sit above the valve
     symbols, in one row with Außen. Heißgas sits on the discharge line
     (compressor to 4-way valve), as in the narrow layout. Shared rows
     (after step 17): inverter value and fan 1; Primärkreis and Sauggas;
     Öl, Heißgas, and the 4-way valve. Shared axes: valve 2 with the
     inverter, valve 1 with the 4-way valve. Water
     pipes on the fan rows. Interne Pumpe and Durchfluss are not shown (the
     pump sits in the indoor unit); `volumetric_flow` still drives the water
     pipe animation. Badges use `unit=790` for `--u`, so they match the
     schematic's badge size at every card width.
   - Narrow (viewBox 400 × 768): same circuit upright; the valves are drawn
     symbols on the pipe without badges (step 23). Title centered above the unit with Außen on the left (no
     "Außenluft" caption, to save height); Primärkreis stacked beside the
     fans.
   - Both: stacked badges 46 apart (as in the schematic), at least 14 units
     from the housing frame; compressor and inverter are wider than their
     badges, the compressor has tank-like corners (radius = width / 4); the
     4-way valve has the same radius as all other circles (14). Badges stay
     neutral in defrost; only the pipes swap warm and cold.
   - Pipe groups `e`, `c`, `s`, `d`, `l1a`, `l1b`, `l2a`, `l2b`, `wv`, `wr`;
     defrost swaps warm and cold and runs the dots backwards.
   The user confirmed the valve 1/2 mapping on 2026-10-18.
3. Smaller points to raise with the user when relevant:
   - The API has no on/off state for the heating rod; its symbol is static.
   - The folder is not under version control yet.

## Practical Notes

- HA MCP: call the proxy tools sequentially. The dashboard screenshot tool is
  not enabled, so verify in the browser pane.
- An inline resource is a data URI, so every content change changes its URL.
  Clients load the new version after a page reload.
- Overlay scale per layout: `--u: clamp(umin, calc(100cqw / W), 1px)` with
  W = 790 (wide) or 400 (narrow) and umin 0.9 px (wide layouts) or 0.85 px
  (narrow); `100cqw` is the `.lay` width. The wide
  refrigerant layout passes `unit=790` so its badges match the schematic;
  `--g` (dot size) still follows its own viewBox width. Badges and all
  text use it, so they never exceed HA badge size while the graphic grows.
- `build.py` has one function per layout (`wide()`, `narrow()`) and shared
  drawing helpers. SVG ids carry the layout name (`vas-wide-…`,
  `vas-narrow-…`) because both SVGs live in one shadow root. Markup uses
  single-quoted attributes so the JSON in `dist/` needs no escaped quotes,
  which keeps the inline deploy payload small and safe to copy.
- `test/screenshot.sh` takes an optional window height as 4th argument; the
  narrow layout needs about `2 * width + 200`. It changes into `test/`, so
  pass an absolute output path; a relative one fails silently. Add `se=1`
  to the query for the entity header with status items, or `st=1` for the
  header from a stubbed template result. The images in
  `test/preview/` are the refrigerant card at 1200 (`m=heat`, height 1060),
  790 (`m=byp&dark=1`, height 740), and 380 (`m=heat`, height 1020).
- Verify a deploy beyond the size check: in the browser pane, decode the
  resource from `lovelace/resources` and compare a checksum with the local
  file (the page is plain HTTP, so `crypto.subtle` is unavailable; a djb2 hash
  over the UTF-8 bytes works).
- The user checks results on an iPad and a desktop browser.
