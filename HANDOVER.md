# Handover

State as of 2026-10-19. Read `AGENTS.md` first for the working rules.

## Current State

- The cards moved from the Python generator in
  `/Users/michael/Projekte/vi-anlagenschema-card` to this TypeScript project
  (2026-10-19), with English names: `vi-hydraulic-card` (was
  `vi-anlagenschema-card`) and `vi-refrigerant-card` (was
  `vi-kaeltekreis-card`). The geometry is now computed in the browser on
  first use instead of shipping finished SVG, so the bundle is about 49 KB
  instead of 79 KB.
- The port was checked, not assumed: a test compared SVG, overlay, badge
  positions, CSS, and dialog content with the former build's data (exact
  match apart from renames), and both test pages were rendered in 80
  scenarios (all modes, light and dark, all widths, headers, dialog) with
  animations off: pixel-identical. Both migration checks were removed after
  the cleanup; git history has them (commit `1fdb53d`).
- Tests now: `test/drawing.test.ts` keeps everything the cards draw as files
  in `test/snapshots/` (taken from the verified port); `test/config.test.ts`
  and `test/card.test.ts` cover the configuration check and the minute timer.
- Deployed 2026-10-19: resource `a94feedfed44424592ffb50bf9328be2` holds
  build `0.1.0+27ccf4b` (67,577 bytes, djb2 2768155876, checked in the
  browser against the local file), which includes the cleanup, the entity
  discovery, the card editor, the plan items, and the review follow-up below. `dashboard-heizung` uses the new card
  types: `vi-hydraulic-card` in view `uebersicht` (`views[0].sections[1]`),
  `vi-refrigerant-card` in view `diagnose` (`views[1].sections[0]`). Both
  views were checked live while the heat pump was heating (rendering, no
  error cards, no console errors, the refrigerant explanation shows its live
  lines; with the first deploy also a badge tap opened its more-info
  dialog).
- The dashboard changed since `docs/history.md`: it now has only the views
  `uebersicht` and `diagnose`; the former view `anlage` is gone and the
  refrigerant card sits in `diagnose` next to Kennwerte, Verdichter, and
  Heizstab tiles. No other dashboard uses the cards (the default dashboard
  has no stored config).
- Design history, the former Home Assistant setup (header model, entity
  names), and domain notes are in `docs/history.md`; they still apply apart
  from the view layout above.

## Done in the cleanup (2026-10-19, deployed)

- Aliases for the former card names removed (no dashboard used them).
- Unused round status dots (`dots`, `.dot`) removed; the snapshot diff showed
  only the `.dot` CSS rules, and all 80 rendered scenarios stayed
  pixel-identical to the former project.
- The refrigerant card requires `compressor`; the fallback to
  `compressor_speed` is gone. Each card decides when its explanation shows
  live values (`_infoLive()`).
- `setConfig` rejects `status_items` visibility conditions other than
  `state`, conditions without entity, and conditions without `state` or
  `state_not`; `entity_id` (the shape the HA editor writes since 2026.10) is
  accepted next to `entity`.
- The minute timer for "seit …" runs only while the card is connected and
  shows a `status_entity` header.
- The `status` template header stays for now (user decision 2026-10-19),
  although no view uses it.

## Entity discovery (2026-10-19, deployed)

- The cards find their entities in vi_climate_devices (v3.1.0 or later):
  on the heat pump device (`device:` or the first device whose entity reports
  `heating.compressors.0.active`), each key in `src/*/slots.ts` matches the
  entity attribute `viessmann_feature_name`; the two status sensors that share
  `device.messages.status.raw` match by translation key (`heating_rod_stage`),
  water heater and climate by domain. `entities` overrides single keys; an
  empty value hides a part. Required parts the card cannot find are named in
  a note on the card.
- Checked against the live instance: all 39 entities of both cards carry the
  attribute and sit on one device; `test/discovery.test.ts` resolves exactly
  the mapping of `examples/*.yaml` from that data.
- Checked live after the deploy: a card without `entities`, given the real
  `hass` object, found all 20 hydraulic and all 23 refrigerant parts, with no
  difference to the hand-made mapping of the dashboards.
- The `entities` blocks are removed from both cards in `dashboard-heizung`
  (2026-10-19, with the user's go-ahead); each card now holds only its type,
  `grid_options`, and the header options. Checked live: both cards found all
  parts themselves (20 and 23), no note, no console errors, and a tap opened
  the discovered entity. To go back, the former mapping is in
  `examples/*.yaml`.
- At startup the integration's entities can be unavailable and carry no
  attribute yet; the card keeps searching while keys are open and keeps what
  it found (`_resolve()` in `base-card.ts`).
- Option `preset` with one value per card (`vitocal-250a-buffer`,
  `vitocal-250a`); presets follow Viessmann products, added only for a real
  installation that can be checked.
- Proposed integration change (for the user, not made from here): give
  `climate` entities the attribute `viessmann_feature_name`
  (`heating.circuits.N.operating.modes.active`), so cards can tell several
  heating circuits apart; today only the unique ID holds the circuit.

## Card editor (2026-10-19, deployed)

- `getConfigForm()` builds the visual editor from the slot tables
  (`src/card/editor.ts`): device (filtered to vi_climate_devices), header
  state entity, info button, and an expandable "Entitäten anpassen" with one
  entity field per key (filtered by domain). The preset field appears once a
  card has more than one variant. `status_items` is not in the form and stays
  in the YAML.
- `getStubConfig()` returns `{}`; the picker entry has `preview: true`.
- `entities` semantics: an entity overrides, `null` (`key:` in YAML) hides a
  part, an empty string (a cleared editor field) means automatic.
- Checked live on HA 2026.10.2 without saving: the editor of the hydraulic
  card shows the header entity, the info switch on for a card without `info`,
  and the section with all 20 labelled fields; the device list holds only the
  heat pump of Viessmann Climate Devices; switching the info off updates the
  preview; the YAML view keeps all `status_items`, and opening the form adds
  no keys. The picker finds both cards under "Viessmann" and renders their
  previews with live values from discovery. The dashboard config was
  unchanged afterwards.
- HA's device picker shows no label while empty, only its placeholder
  "Gerät auswählen" (the label "Wärmepumpe" is set and used as `aria-label`;
  entity pickers do show theirs). The helper text below explains the field.

## Plan items done (2026-10-19, deployed)

- Texts: every card and editor text is in `src/i18n/de.ts` (`T`, `fill()`);
  the drawing snapshots stayed byte-identical through the move.
- Keyboard and screen readers: badges, small values, and drawn parts are
  buttons (Tab, Enter, Space) with `aria-label` "<part>: <state>"; the SVG is
  a `group` so its parts are reachable; header links are buttons too. Focus
  shows a ring on badges and a glow on drawn parts (checked in light and
  dark, wide and narrow).
- Actions: `tap_action` (default more-info) and `hold_action` (default
  none), in the editor under "Interaktionen" (`ui_action` selectors, flat
  keys). Other actions go to HA as `hass-action` with the part's entity;
  checked live on HA 2026.10.2 that HA handles that event.
- `animations: false` (editor "Bewegung zeigen") stops pipes, fans, and air.
- Device body and outline (`--dev`, `--devl`) derive from the theme via
  `color-mix`; light and dark renders match the former colors (dark is a
  shade more neutral).
- Big values use HA's `formatEntityStateToParts` for unit and spacing with
  the number rounded; header item names use `formatEntityName` (both with
  the former code as fallback).
- The card redraws only when its own entities, header entities, the
  registry, the theme mode, or HA's formatters change (`_changed()`); the
  former per-update state key is gone.
- Checked in headless Chrome: labels, Enter and click open more-info, a hold
  runs the hold action and swallows the following click, no animation with
  `animations: false`, no redraw on an unrelated entity. Bundle 62.7 KB
  (was 55.9 KB): the dictionary structure and the new behaviour.
- Not done: `documentationURL` needs a public repository.
- Checked live after the deploy (nothing saved, dashboard config hash
  unchanged): both cards find all parts (20 and 23) and show no note or
  console error; labels such as "Puffer: 28,0 °C" and "Verdichter Drehzahl:
  38,6 rps"; Tab moves between badges with a visible ring, Enter opened the
  right more-info dialog, a focused pump glows; the refrigerant editor shows
  "Bewegung zeigen" and "Interaktionen" (tap: more-info, hold: none), and
  switching motion off stopped the preview.

## Review follow-up (2026-10-19, deployed)

- Card-wide `tap_action` / `hold_action` removed again (user decision: every
  part has its own entity, so a tap always opens more-info).
- Header state is discovered: slot `state` (translation key
  `heat_pump_state`) on both cards, switch `show_state` (default on).
  `status_entity` still works and replaces it; the dashboards still set it
  and could drop it (ask first).
- New editor element (`getConfigElement`, HA's `ha-form` inside): device and
  entity fields show what the card detects, helpers say "Automatisch
  erkannt" / "Eigene Wahl" / "Ausgeblendet" / "Nicht gefunden", and only
  deviations are saved (`configFromForm`). Checked live in HA (refrigerant
  card, nothing saved): the device field shows "Wärmepumpe · Keller" as
  detected, all 24 entity fields are filled and marked "Automatisch
  erkannt", and Speichern stays disabled until something changes.
- Viewer pause button (WCAG 2.2.2) left of the info button, remembered in
  localStorage for all cards, hidden with reduced motion.
- Contrast: inactive pipes 1.45:1 → 3:1 and more (lightest gray mixed from
  the text color); orange and blue darkened in light mode only (2.8 → 3.5,
  3.1 → 3.4). Focus in `--ha-color-focus`. Spacing, radii, and weights use
  `--ha-*` tokens; text and card colors stay the theme's legacy variables,
  which user themes set.
- Checked live after the deploy: both cards find all parts (21 and 24 with
  the state), headers show the detected state, the pause button switches to
  play and stops the motion (switched back), no console errors. The header
  line wraps one word earlier because of the second button.
- Small values have 24 px tap targets; "Öl" and "Motor" sit 33 units apart
  (`PAIR` in the refrigerant layouts), so their targets stay apart down to
  the narrowest card (36 px live).
- Dashboard cleanup (2026-10-19, user's go-ahead "mach fertig"): `device`
  and `status_entity` removed from both cards; each now holds only `type`,
  `grid_options`, and `status_items`. Checked live: headers show the
  detected state, 21 and 24 parts, no note, no console errors.
- The darker inactive pipe gray stays for the user to judge live.
- Refrigerant card (27ccf4b): the open housing's interior takes the card
  background, so the components read as devices; device names there use the
  size of the value names (11 px at full size). Warning note, hover, info
  box, and dialog spacing use HA's semantic tokens. Kept on purpose: the
  drawing's own colors (dark outdoor unit, white overlays on it), the
  overlay sizes in `--u` units, and fixed line heights and header button
  geometry, which have no matching HA token.

## Next Steps

1. User judges the inactive pipe gray live.
2. `documentationURL` once the repository is public.
