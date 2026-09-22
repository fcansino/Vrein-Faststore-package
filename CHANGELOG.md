# Changelog

All notable changes to `@vreinai/faststore-components` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0] - 2026-09-22

### Added

- **`VreinPopup` component** (CMS Global Section): resolves a modal or lateral-slider popup of BrainDW/Vrein recommendations for the current page, with the same two-step BrainDW resolution pattern as `VreinTracking`/`VreinCarousel` (`vreinPopup` GraphQL query → VTEX Catalog product enrichment). Server-side: fail-closed gates (invalid/missing `Type`, `Expiration` window, empty blocks), TTL caches for config and content, `Promise.allSettled` per-block failure isolation, modal-only `ShowOnce` dismissal. Client-side: SSR-safe mounting (renders nothing until hydrated, no hydration mismatch), `localStorage`-backed permanent dismissal for the modal (`vrein_popup_dismissed_v1`), `sessionStorage`-backed non-persistent collapse for the slider (`vrein_popup_slider_collapsed`), fails open (renders) if storage access throws.
- **`vreinPopup(section, context, email, whitelabel)` resolver**: new GraphQL field, added across all three SDL copies (`src/graphql/typeDefs/vrein.graphql`, `src/graphql/typeDefs/index.ts`, `templates/graphql/vrein.graphql.tpl`).
- **`templates/components/VreinPopup.tsx.tpl`**: scaffolder wrapper for client projects.
- **`templates/graphql/vreinQueries.ts.tpl`**: `VreinPopupQueryDocument` query document.
- **`cms/vreinPopupSection.json`**: CMS section schema (no configurable props — placement in Global Section only).
- Scaffolder (`bin/setup.js`) now generates the `VreinPopup` wrapper and merges the `VreinPopup` CMS section entry.
- **Hooks exported for advanced consumers**: `useVreinPopup`, `usePopupDismissal`, `useSliderCollapse`, `useCurrentLocation`, `useHasMounted`, `resolvePopupSection`, `safeHttpUrl`.
- **Types exported**: `VreinPopupProps`, `PopupSection`, `PopupType`, `VreinPopupData`, `VreinPopupBlockType`.

### Changed

- **`useVreinContext`** (internal, used by `VreinCarousel`): replaced `popstate`-only pathname tracking with an SPA-aware `history.pushState`/`replaceState` patch (`useCurrentLocation`). This is a **behavior fix**, not just an internal refactor: client-side navigation (e.g. Next `router.push()` / `<Link>`) previously did not re-derive the Vrein context (stale `pathname`/section after the first client-side route change); it now does. Existing carousels on HOME/PDP/PLP/SEARCH/SEARCHNORESULT are unaffected in their rendering logic — only the trigger mechanism for re-deriving context changed. No public API change.

---

## [0.3.0] - 2026-06-05

### Added

- **`VreinTracking` component** (CMS Global Section): loads the BrainDW/Vrein tracking script from the CDN (`s2.braindw.com/Script/braindw/{hash}`) so it can be updated without client redeploys. Captures FastStore analytics events directly via `useAnalyticsEvent` (`@faststore/sdk`) and forwards them to `window.__VREIN_PROCESS_EVENT` — no dependency on the client's `AnalyticsHandler` or `window.dataLayer`. Events fired before the script finishes loading are buffered and flushed once ready.
- **`templates/components/VreinTracking.tsx.tpl`**: scaffolder wrapper for client projects
- **`cms/vreinTrackingSection.json`**: CMS section schema (no configurable props)
- Scaffolder (`bin/setup.js`) now generates the VreinTracking wrapper and merges the `VreinTracking` CMS section entry

### Changed

- Added `@faststore/sdk >=3.0.0` as peer dependency (required by `VreinTracking`; already present in any FastStore project)

---

## [0.2.0] - 2026-06-04

### Added

- **Scaffolder CLI** (`bin/setup.js`): `npx @vreinai/faststore-components setup` (or `node node_modules/@vreinai/faststore-components/bin/setup.js`) generates all integration files in a client FastStore project:
  - `src/customizations/src/graphql/vrein/vreinQueries.ts` — gql() query documents for FastStore codegen
  - `src/customizations/src/sdk/vreinQueryAdapter.ts` — isolated useQuery re-export
  - `src/graphql/thirdParty/typeDefs/vrein.graphql` — canonical SDL including `VreinInstallment`
  - `src/graphql/thirdParty/resolvers/vrein.ts` — resolver re-export
  - `src/components/sections/VreinCarousel/VreinCarousel.tsx` — updated wrapper with DI props
  - `src/components/sections/VreinImageBanner/VreinImageBanner.tsx` — updated wrapper with DI props
  - Supports `--dry-run`, `--yes` / `--overwrite`, `--output-dir` flags
  - Warns about stale `/api/vrein` handler files
  - Skips CMS sections already present in `cms/faststore/sections.json`
- **`QueryExecutor` interface** (`src/sdk/types.ts`): typed DI contract for the SWR-shaped useQuery hook
- **`VreinInstallment` type** in canonical SDL (`src/graphql/typeDefs/vrein.graphql`)

### Changed

- **`useVreinRecommendations`**: now accepts `useQueryFn: QueryExecutor` and `vreinProductsDocument: unknown` via props (dependency injection — no direct FastStore import)
- **`useVreinImages`**: same DI pattern with `useQueryFn` and `vreinImagesDocument`
- **`VreinCarouselProps`**: added `useQueryFn`, `vreinProductsDocument`
- **`VreinImageBannerProps`**: added `useQueryFn`, `vreinImagesDocument`
- **`src/index.ts`**: removed `createVreinApiHandler` and `vreinResolvers` from main entry; added `QueryExecutor` type export; resolvers now exported from `@vreinai/faststore-components` (re-exported in scaffolded `resolvers/vrein.ts`)

### Removed

- **`createVreinApiHandler`**: no longer exported. Delete `src/pages/api/vrein.ts` from client stores.
- **`postinstall` script** (`scripts/patch-faststore-cli.js`): removed. The `/api` path restriction was resolved in FastStore CLI; no patching is needed.
- **`scripts/` directory** from package distribution.

### Migration

See [MIGRATION.md](./MIGRATION.md) for the complete v0.1.x → v0.2.0 step-by-step guide.

---

## [0.1.14] - 2026-05-xx

- Bump version vreinai (latest stable before v0.2.0 rewrite)
- dataLayer event replay on init
- Cleanup GraphQL comments
