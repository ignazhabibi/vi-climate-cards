# vi-climate-cards

Home Assistant dashboard cards for Viessmann heat pumps, starting with the
Vitocal 250-A. They complete the Viessmann package of
[vi_api_client](https://github.com/ignazhabibi/vi_api_client) and the
[vi_climate_devices](https://github.com/ignazhabibi/vi_climate_devices)
integration, which provides the live values.

- `vi-hydraulic-card` shows the hydraulic schematic: outdoor unit, secondary
  circuit, indoor unit with heating rod, 4/3-way valve and defrost buffer,
  buffer tank with heating circuit, and DHW tank.
- `vi-refrigerant-card` opens up the outdoor unit and shows the refrigerant
  circuit as on the Vitocal 250-A's own screen: fans and evaporator, 4-way
  valve, compressor with inverter, condenser, the internal heat exchanger,
  and both expansion valves. The flow pattern shows the refrigerant state
  (gas, liquid, droplets behind the valve); in defrost the circuit reverses.

Both cards are one JavaScript file without runtime dependencies. They use the Home
Assistant theme variables, so light and dark mode follow the HA theme; the
device bodies take their tint from the theme's text and card colors. Card
text is German, kept in one dictionary (`src/i18n/de.ts`).

## Configuration

With vi_climate_devices v3.1.0 or later a card needs no entity mapping:

```yaml
type: custom:vi-hydraulic-card   # or custom:vi-refrigerant-card
```

The card takes the first heat pump of the integration (`device:` picks
another one by device ID) and finds each part through the Viessmann feature
the integration names in the entity attribute `viessmann_feature_name`.
`entities:` overrides single parts; a key without a value (`null`) hides one. Without the
integration, all parts can be mapped there by hand. A note on the card names
required parts it cannot find. `preset:` selects the drawing variant; each
card has one so far (`vitocal-250a-buffer`, `vitocal-250a`).

Both cards appear in the card picker with a live preview and have a visual
editor. It shows what the card detects: the heat pump in the device field
and each part's entity under "Entitäten anpassen", marked "Automatisch
erkannt", "Eigene Wahl", or "Nicht gefunden". Only deviations are saved; a
cleared field goes back to automatic. `status_items` stays YAML.

| Option | Default | Meaning |
| --- | --- | --- |
| `device` | first heat pump | Device of vi_climate_devices |
| `entities` | discovered | Entity per part; `null` hides a part |
| `preset` | only variant | Drawing variant |
| `show_state` | `true` | Heat pump state in the header (`entities.state`) |
| `status_items`, `status` | none | Header, see below |
| `info` | `true` | Info button with the explanation |
| `animations` | `true` | `false` stops pipes, fans, and air |

## Behaviour

- Pipes animate while water or refrigerant flows; the active hydraulic path
  follows the valve position. Pumps fill their triangle while running, fans
  spin with their speed, heaters turn warm while on.
- Values take three forms: measuring points on the pipes are badges, a
  device's main value is a big number inside it, minor values are small text.
- Tapping a badge, a small value, or a drawn device opens the entity's
  more-info dialog. Every such part is reachable with the keyboard (Tab,
  Enter, Space), named for screen readers with its state, and at least 24 px
  high as a tap target.
- A pause button next to the info button stops the motion for the viewer
  (remembered in the browser, for all cards); it is hidden when the system
  asks for reduced motion.
- Pipes reach 3:1 contrast against card and devices in light and dark mode;
  styles use HA's tokens (`--ha-space-*`, `--ha-border-radius-*`,
  `--ha-font-*`, `--ha-color-focus`) with the theme's text and card colors.
- The card redraws only when one of its own entities, the theme mode, or the
  language changes.
- Header: the heat pump state the card finds (`entities.state`, the
  integration's operating phase) as the big word with "seit …" from its last
  change, and `status_items` for the line below; or `status`, a template
  returning `{"state", "detail", "info"}`. `status_entity` from older
  configurations still replaces the detected state.
- An info button opens an explanation for laypeople (`info: false` hides it).

Configuration examples with the full entity mapping and the header in use:
[examples/hydraulic-card.yaml](examples/hydraulic-card.yaml),
[examples/refrigerant-card.yaml](examples/refrigerant-card.yaml).

## Installation

Build the bundle (see below) and add `dist/vi-climate-cards.js` as a dashboard
resource of type `module`, for example by copying it to `/config/www/` and
registering `/local/vi-climate-cards.js?v=<version>`. The author does exactly
this over SSH (`scp` into the Home Assistant config's `www/` directory).

## Development

```sh
npm install
npm run check      # type check, lint, tests, build
npm run build      # dist/vi-climate-cards.js
```

Render the test page with headless Chrome (scenarios `m=heat|dhw|byp|mixed|idle`,
`dark=1`, `card=rf` for the refrigerant card):

```sh
test/screenshot.sh "$PWD/test/out/card.png" 760 "m=dhw&dark=1"
```

| Path | Purpose |
| --- | --- |
| `src/draw/` | Geometry constants, SVG drawing helpers, `layout()` |
| `src/hydraulic/`, `src/refrigerant/` | Layouts, explanation dialog, and card class per card |
| `src/i18n/` | Dictionary of all card and editor texts |
| `src/card/` | Shared base class, configuration check, entity keys (`slots.ts`), resolution, types |
| `src/sources/vi-climate-devices.ts` | Finds the entities in the vi_climate_devices integration |
| `src/hydraulic/slots.ts`, `src/refrigerant/slots.ts` | Entity keys per card with their Viessmann features |
| `src/styles/card.css` | Stylesheet of both cards |
| `test/drawing.test.ts`, `test/snapshots/` | Snapshots of everything the cards draw; update on purpose with `npx vitest run -u` |
| `test/config.test.ts`, `test/card.test.ts` | Configuration check and card behaviour |
| `test/discovery.test.ts`, `test/fixtures/vitocal.ts` | Discovery against the entities of a real Vitocal 250-A |
| `test/page/`, `test/screenshot.sh` | Test page with stubbed `hass`, screenshots |
| `docs/history.md` | Design history and domain notes |
