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
- Deployed 2026-10-19: resource `a94feedfed44424592ffb50bf9328be2` holds
  build `0.1.0+1fdb53d` (48,978 bytes, djb2 4199979991, checked in the
  browser against the local file). `dashboard-heizung` uses the new card
  types: `vi-hydraulic-card` in view `uebersicht` (`views[0].sections[1]`),
  `vi-refrigerant-card` in view `diagnose` (`views[1].sections[0]`). Both
  views were checked live (rendering, no error cards, no console errors,
  a badge tap opens its more-info dialog).
- The dashboard changed since `docs/history.md`: it now has only the views
  `uebersicht` and `diagnose`; the former view `anlage` is gone and the
  refrigerant card sits in `diagnose` next to Kennwerte, Verdichter, and
  Heizstab tiles. No other dashboard uses the cards (the default dashboard
  has no stored config).
- Design history, the former Home Assistant setup (header model, entity
  names), and domain notes are in `docs/history.md`; they still apply apart
  from the view layout above.

## Next Steps

1. Remove the aliases for the former card names (`index.ts`): no dashboard
   uses them any more.
2. Cleanup from the review (2026-10-19):
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
3. Plan agreed with the user (own instance, built publish-ready):
   - Texts into a dictionary (German only for now).
   - Entities found through the device and `translation_key`, `entities` only
     for overrides; list what the integration has to provide.
   - HA card contract: `getStubConfig`, `getConfigForm`, `customCards` with
     `preview` and `documentationURL`, render only on own entity changes.
   - Keyboard access and labels for every tappable element, focus ring,
     optional tap/hold actions, an option to stop animations.
   - Device colors derived from the theme; big values through
     `formatEntityStateToParts`, names through `formatEntityName`.
