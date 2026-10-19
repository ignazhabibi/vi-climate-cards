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
- The port is checked, not assumed:
  - `test/parity.test.ts` compares SVG, overlay, badge positions, CSS, and
    dialog content with the former build's data (`test/fixtures/legacy.json`).
    They match exactly apart from the listed renames.
  - `test/compare-legacy.mjs` rendered both test pages in 80 scenarios
    (all modes, light and dark, all widths, headers, dialog) with
    animations off: all 80 are pixel-identical. With animations on, only
    the moving parts differ, because a screenshot catches them in a random
    phase.
- Not deployed yet. Home Assistant still runs the former build in resource
  `a94feedfed44424592ffb50bf9328be2`, and the dashboards use the former card
  types. Nothing is committed yet.
- Design history, Home Assistant setup (dashboards, views, header model), and
  domain notes are in `docs/history.md`; they still apply.

## Next Steps

1. Commit the port (after the user's go-ahead).
2. Switch the deployment: update the resource with `dist/vi-climate-cards.js`
   (the aliases keep the former card types working), check both views live,
   then change the card types in `dashboard-heizung` views `uebersicht` and
   `anlage` to the new names. Remove the aliases once no dashboard uses them.
3. Cleanup from the review (2026-10-19):
   - Remove the unused round status dots (`dots`, `.dot`): no layout has any.
   - Decide with the user whether the `status` template header stays; no view
     uses it since step 22 in `docs/history.md`.
   - The refrigerant card requires `compressor` but `_running()` falls back to
     `compressor_speed`; keep one of the two.
   - `_visible()` treats unknown condition types as true; reject them in
     `setConfig`.
   - Start the minute timer only with `status_entity`.
   - Retire `test/parity.test.ts`, `test/compare-legacy.mjs`, and the fixture
     once the drawing changes on purpose; replace them with snapshot tests.
4. Plan agreed with the user (own instance, built publish-ready):
   - Texts into a dictionary (German only for now).
   - Entities found through the device and `translation_key`, `entities` only
     for overrides; list what the integration has to provide.
   - HA card contract: `getStubConfig`, `getConfigForm`, `customCards` with
     `preview` and `documentationURL`, render only on own entity changes.
   - Keyboard access and labels for every tappable element, focus ring,
     optional tap/hold actions, an option to stop animations.
   - Device colors derived from the theme; big values through
     `formatEntityStateToParts`, names through `formatEntityName`.
