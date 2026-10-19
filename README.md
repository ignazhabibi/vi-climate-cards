# vi-climate-cards

Home Assistant dashboard cards for a Viessmann Vitocal 250-A, with live values
from the [vi_climate_devices](https://github.com/ignazhabibi/vi_climate_devices)
integration.

- `vi-hydraulic-card` shows the hydraulic schematic: outdoor unit, secondary
  circuit, indoor unit with heating rod, 4/3-way valve and defrost buffer,
  buffer tank with heating circuit, and DHW tank.
- `vi-refrigerant-card` opens up the outdoor unit and shows the refrigerant
  circuit as on the Vitocal 250-A's own screen: fans and evaporator, 4-way
  valve, compressor with inverter, condenser, the internal heat exchanger,
  and both expansion valves. The flow pattern shows the refrigerant state
  (gas, liquid, droplets behind the valve); in defrost the circuit reverses.

Both cards are one ES module without runtime dependencies. They use the Home
Assistant theme variables, so light and dark mode follow the HA theme. Card
text is German.

## Behaviour

- Pipes animate while water or refrigerant flows; the active hydraulic path
  follows the valve position. Pumps fill their triangle while running, fans
  spin with their speed, heaters turn warm while on.
- Values take three forms: measuring points on the pipes are badges, a
  device's main value is a big number inside it, minor values are small text.
- Tapping a badge, a small value, or a drawn device opens the entity's
  more-info dialog.
- Optional header: `status_entity` (state as the big word, "seit …" from its
  last change) with `status_items` for the line below, or `status`, a template
  returning `{"state", "detail", "info"}`.
- An info button opens an explanation for laypeople (`info: false` hides it).

Configuration examples with the full entity mapping:
[examples/hydraulic-card.yaml](examples/hydraulic-card.yaml),
[examples/refrigerant-card.yaml](examples/refrigerant-card.yaml).

## Installation

Build the bundle (see below) and add `dist/vi-climate-cards.js` as a dashboard
resource of type `module`, for example by copying it to `/config/www/` and
registering `/local/vi-climate-cards.js?v=<version>`.

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
| `src/card/` | Shared base class, configuration check, and types |
| `src/styles/card.css` | Stylesheet of both cards |
| `test/drawing.test.ts`, `test/snapshots/` | Snapshots of everything the cards draw; update on purpose with `npx vitest run -u` |
| `test/config.test.ts`, `test/card.test.ts` | Configuration check and card behaviour |
| `test/page/`, `test/screenshot.sh` | Test page with stubbed `hass`, screenshots |
| `docs/history.md` | Design history and domain notes |
