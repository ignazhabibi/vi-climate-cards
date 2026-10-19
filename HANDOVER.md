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
  build `0.1.0+139732b` (48,621 bytes, djb2 2344975736, checked in the
  browser against the local file), which includes the cleanup below. `dashboard-heizung` uses the new card
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

## Next Steps

1. Plan agreed with the user (own instance, built publish-ready):
   - Texts into a dictionary (German only for now).
   - Entities found through the device and `translation_key`, `entities` only
     for overrides; list what the integration has to provide.
   - HA card contract: `getStubConfig`, `getConfigForm`, `customCards` with
     `preview` and `documentationURL`, render only on own entity changes.
   - Keyboard access and labels for every tappable element, focus ring,
     optional tap/hold actions, an option to stop animations.
   - Device colors derived from the theme; big values through
     `formatEntityStateToParts`, names through `formatEntityName`.
