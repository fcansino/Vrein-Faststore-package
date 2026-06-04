# Changelog

All notable changes to `@vreinai/faststore-components` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
