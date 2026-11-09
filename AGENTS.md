# AGENTS.md

## Scope and Priorities

Follow runtime instructions first, then this file. Design history and domain
notes are in `docs/history.md`.

Keep changes small and directly related to the request. Do not start tasks the
user has not asked for, and do not refactor unrelated code. State assumptions
and tradeoffs when they materially affect the result.

Communicate with the user in German. Write code, comments, identifiers, and
repository documentation in English; project, file, and element names are
English too. User-facing card text (labels, explanations) is German and
lives only in `src/i18n/de.ts`; code takes it from there (`T`, `fill()`).

## Project Context

- `vi-climate-cards` holds two Home Assistant dashboard cards for the user's
  Viessmann Vitocal 250-A with live values: `vi-hydraulic-card` (hydraulic
  schematic) and `vi-refrigerant-card` (refrigerant circuit). Both are in one
  bundle and share one base class.
- Target (agreed 2026-10-19): the user's own instance first, built so it can
  be published without a rewrite. Published 2026-11-09 as a HACS custom
  repository (`ignazhabibi/vi-climate-cards`, category Dashboard), labelled
  as a proof of concept: only the Vitocal 250-A with this hydraulic layout
  through vi_climate_devices is supported (see the README warning; keep it
  true). The refrigerant card is the more portable one: its hardware is the
  same in every 250-A, while the hydraulics differ per house.
- The cards complete the user's Viessmann package (`vi_api_client`,
  `vi_climate_devices`, both developed by the user). Name, focus, and
  drawings stay Viessmann. Other manufacturers may work through manual
  `entities` mapping but get no priority and no drawings of their own.
- Entities come from the integration first: `src/sources/vi-climate-devices.ts`
  matches each key in `slots.ts` by the `viessmann_feature_name` attribute
  (status sensors by translation key, water heater and climate by domain) on
  the heat pump device; `entities` overrides single keys. New drawing
  variants (presets) follow Viessmann products and are added only for a real
  installation that can be checked.
- The cards belong to the Home Assistant integration in
  `/Users/michael/Projekte/vi_climate_devices`, which the user maintains, but
  this is a separate project. Never edit the integration or `vi_api_client`
  from here. If the card needs an integration change (for example a stable
  `translation_key` or a sensor enabled by default), explain the change and
  its rationale instead.
- The project replaces `/Users/michael/Projekte/vi-anlagenschema-card`
  (Python generator). Its history is in `docs/history.md`. Do not change the
  old project.

## Source of Truth

- `src/` (TypeScript) is the only source. `scripts/build.mjs` bundles it with
  esbuild into `dist/vi-climate-cards.js` (git-ignored). Never edit `dist/`.
- Layout of `src/`:
  - `draw/`: geometry constants, number helpers, SVG drawing helpers, and
    `layout()`, which turns a drawing into SVG, overlay, and positions.
  - `hydraulic/`, `refrigerant/`: per card the layouts (`wide`, `narrow`),
    the explanation dialog, and the card class with `_apply()`.
  - `card/`: the shared base class `ViCard`, the configuration types and
    check (`config.ts`, no DOM, so it is unit-tested), `hass` types, dialog
    types.
  - `styles/card.css`: the stylesheet; `%NAME%` placeholders are filled from
    the constants in `styles/index.ts`.
  - `assets.ts`: computes layouts, dialogs, and CSS once on first use.
  - `i18n/`: the dictionary (`de.ts`) with every text the cards and the
    editor show; `Texts` is its shape for a later second language.
  - `index.ts`: registers the cards and their card picker entries.
- All geometry uses SVG viewBox units (hydraulic: wide 790 × 616, narrow
  400 × 674; refrigerant: wide 944 × 728, narrow 400 × 768). Badge overlays
  are positioned in percent of that box; `layout()` computes the
  percentages. SVG ids carry the layout name (`vi-wide-…`, `vi-rf-…`)
  because all layouts live in one shadow root.

## Design Rules

- HA-native look: Home Assistant theme variables (`--card-background-color`,
  `--divider-color`, `--primary-text-color`, `--secondary-text-color`,
  `--state-icon-color`, `--deep-orange-color`, `--blue-color`,
  `--green-color`, `--red-color`), Roboto via the HA font variable, `ha-icon`
  for MDI icons, and HA badge styling (pill, 10px name, 12px state).
- Every value takes one of three forms: measuring points on a pipe are
  badges without icons; a device's main value is a big whole number inside
  the device; minor values are small text. States are drawn, not written:
  pump triangles fill while running, fans spin, pipes animate.
- Scene and components follow the HA covers design concept
  (https://ux-design-concepts.openhomefoundation.org/ha-covers-refinement/):
  the drawing shows the devices in a small, calm scene, and nature (a faint
  sky and a strip of lawn) is the link to reality. Keep it sparse: devices and
  surroundings use a few neutral tokens on `.wrap` with dark variants on
  `.wrap.dark` (`--dev`, `--devd`, `--devl`, `--shade`, `--ground`, `--wall`);
  `--dev` and `--devl` derive from the theme's text and card colors through
  `color-mix` (mix shares `--dev-k`, `--devl-k` per mode);
  only the pipes carry color (`--warm`, `--cold`), plus the muted lawn green.
  The user found a more realistic, colorful version too busy. Check every
  change in light and dark mode.
- Overlay sizes scale with the card through `--u` (container query units,
  clamped). Keep new overlay sizes in `calc(N * var(--u))`.
- Alignment matters to the user. Keep elements on shared axes: badges centered
  on the pipe they measure, related badges in one column, titles and captions on
  one row. Check alignment visually, not only by numbers.
- Colors: supply `--warm`, return `--cold`, inactive `--off`. The same pipe
  path is drawn twice: a `.pipe` stroke and a `.fl` flow-dot overlay.
- Animations run only inside `@media (prefers-reduced-motion: no-preference)`,
  and not with the option `animations: false` (class `.still`).
- Every tappable part is a button for the keyboard and screen readers
  (`role`, `tabindex`, `aria-label` with the part name and state), with a
  focus ring (`--ha-color-focus`) on badges and a glow on drawn parts. A tap
  always opens more-info (the user decided against card-wide actions:
  each part has its own entity). Viewers can pause the motion.
- Contrast: pipes keep 3:1 against card and devices in both modes (see the
  `--warm-k`, `--cold-k`, `--off-k` mixes); check new colors with numbers.
- The editor (`editor-element.ts`, logic in `editor.ts`) shows the detected
  device and entities and saves only deviations.
- Valve state values come from the integration's enum sensor. Some keys look
  misspelled (`climat_circuit_two_defrost`, `climat_circuit_one_and_two`); they
  are the real API values. Keep them.

## Verification

1. `npm run check`: type check, Biome lint and format check, Vitest, build.
   `test/snapshots/` holds everything the cards draw (SVG one element per
   line, overlay, positions, CSS, dialogs). When a change alters the drawing
   on purpose, update them with `./node_modules/.bin/vitest run -u` and check
   that the diff contains only the intended change.
   Run the tools from `node_modules/.bin` directly when `npm`/`npx` print
   certificate noise in the sandbox. Install packages with
   `npm_config_cache="$TMPDIR/npm-cache"`; the sandbox blocks `~/.npm`.
2. Before deploying or showing a design, render it and look at the result:
   `test/screenshot.sh <absolute out.png> <width> "<query>" [height]` for the
   relevant scenarios: `m=heat`, `m=dhw`, `m=byp`, `m=mixed`, `m=idle`, each
   also with `dark=1`, at widths 760 and 1000 (wide layout) and 320, 380, and
   540 (narrow layout, window height `2 * width + 120`). Add `card=rf` for the
   refrigerant card (`m=heat`, `m=byp` for defrost, `m=idle`). Headless Chrome
   needs to run outside the sandbox.
3. Read the PNGs and check alignment, overlaps, and text fit.

The test page cannot load the MDI font inside the stubbed `ha-icon`, so icons
show as squares there. That is expected.

After a release is installed, check the live view in the browser pane at
`http://192.168.9.29:8123/dashboard-heizung/diagnose` (refrigerant card) and
`/dashboard-heizung/uebersicht` (hydraulic card). The user logs in there;
never enter credentials yourself.

## Deployment

- The cards are installed in the user's Home Assistant through HACS (since
  2026-11-09, custom repository `ignazhabibi/vi-climate-cards`, repository id
  `1451383529`). HACS installs the release asset `vi-climate-cards.js` and
  registers the dashboard resource itself
  (`/local/community/vi-climate-cards/vi-climate-cards.js?v=…`). No SSH, no
  `scp`, no manual resource. Never create a second resource for the cards: a
  double registration defines the elements twice.
- Release flow: commit, push, then tag `vX.Y.Z` and push the tag. The
  workflow `.github/workflows/release.yml` runs `npm run check` and creates
  the GitHub release with `dist/vi-climate-cards.js` as asset. Set the
  version in `package.json` first. Release only when the user asks; use a
  dash in the tag (`v0.2.0-beta.1`) only for pre-releases, which HACS ignores
  by default. Push and tag only when the user asks.
- Update in Home Assistant through the HA MCP (`ha_manage_hacs`, called via
  `ha_call_write_tool`): `update_information` with the repository id to
  surface the new release, then `download` with `repository_id` and the
  `version` tag. Then reload the dashboard in the browser (clear the cache).
  Check the installed version with `ha_get_hacs_info` (`action=info`) and the
  banner line of the served file.
- To try an uncommitted change on the real instance there is no deploy path
  any more; check it with the test page (Verification) and release it.
- Dashboard edits go through the HA MCP tools (`ha_config_get_dashboard`, then
  `ha_config_set_dashboard` with `python_transform` and the current
  `config_hash`). The server runs in strict best-practices mode: read the
  dashboard guide through `ha_get_skill_guide` to get the current
  `BestPracticeKey` before a dashboard write.
- Ask before changing anything in Home Assistant beyond the requested scope,
  for example other views, entities, helpers, or themes.

## Home Assistant Access

- Use the HA MCP tools for all data reads and changes: entity search and
  states (`ha_search`, `ha_get_state`), the entity registry (`ha_get_entity`,
  `ha_set_entity`), dashboards, and the card resource. Do not read or change
  Home Assistant data through JavaScript in the browser pane.
- Use the browser pane only for what the MCP cannot do: looking at the
  rendered dashboard, comparing a checksum of the deployed resource with the
  local file, and checking that a tap opens the right more-info dialog.

## Git

Branch `main`, remote `origin` is `github.com/ignazhabibi/vi-climate-cards`
(public since 2026-11-09). Commit only when the user asks. Do not push or tag
unless the user asks. The repository is public: keep local paths, addresses,
and credentials out of commits.
