# Changelog

All notable changes to `@vreinai/faststore-components` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
