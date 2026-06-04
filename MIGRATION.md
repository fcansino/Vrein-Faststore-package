# Migration Guide: v0.1.x → v0.2.0

## Overview

v0.2.0 replaces the custom `/api/vrein` runtime route and `postinstall` CLI patcher with
FastStore's native persisted-query pattern. GraphQL requests now flow through
`/api/graphql` — the same endpoint used by all FastStore queries.

---

## Breaking Changes

| What changed | v0.1.x | v0.2.0 |
|---|---|---|
| `createVreinApiHandler` export | Available from `@vreinai/faststore-components/graphql` | **Removed** |
| `postinstall` script (patch-faststore-cli) | Required in `package.json` | **Removed** |
| `/api/vrein` route | Required | **Delete it** |
| VreinCarousel props | No DI props | `useQueryFn` + `vreinProductsDocument` required |
| VreinImageBanner props | No DI props | `useQueryFn` + `vreinImagesDocument` required |

---

## Step-by-Step Migration

### 1. Update the package version

In your store's `package.json`:

```json
{
  "dependencies": {
    "@vreinai/faststore-components": "^0.2.0"
  }
}
```

Then run:

```bash
rm -rf node_modules yarn.lock
yarn install
```

> **Note (transitional):** Until v0.2.0 is published to npm, use a local tarball reference:
> ```json
> "@vreinai/faststore-components": "file:../NPM/Vrein-Faststore-package/vreinai-faststore-components-0.2.0-r1.tgz"
> ```
> After `yarn pack` in the package repo, clear the Yarn cache if needed (Yarn 1.x caches by filename hash — rename the `.tgz` to force re-extraction).

### 2. Run the setup scaffolder

```bash
# Dry-run first (no writes):
node node_modules/@vreinai/faststore-components/bin/setup.js --dry-run

# Real run (interactive — prompts before overwriting existing files):
node node_modules/@vreinai/faststore-components/bin/setup.js

# Or non-interactive (overwrites all):
node node_modules/@vreinai/faststore-components/bin/setup.js --yes
```

The scaffolder will:

- **CREATE** `src/customizations/src/graphql/vrein/vreinQueries.ts` — gql() query documents scanned by FastStore codegen
- **CREATE** `src/customizations/src/sdk/vreinQueryAdapter.ts` — isolated useQuery re-export
- **UPDATE** `src/graphql/thirdParty/typeDefs/vrein.graphql` — SDL with `VreinInstallment` type
- **UPDATE** `src/graphql/thirdParty/resolvers/vrein.ts` — resolver re-export from package
- **UPDATE** `src/components/sections/VreinCarousel/VreinCarousel.tsx` — wrapper with DI props
- **UPDATE** `src/components/sections/VreinImageBanner/VreinImageBanner.tsx` — wrapper with DI props
- **SKIP** `cms/faststore/sections.json` — if Vrein sections already present
- **WARN** about any stale `/api/vrein` handler files

### 3. Delete the stale /api/vrein handler

If you have `src/pages/api/vrein.ts` (or `src/customizations/src/pages/api/vrein.ts`),
delete it — it imports `createVreinApiHandler` which no longer exists:

```bash
rm src/pages/api/vrein.ts
# or
rm src/customizations/src/pages/api/vrein.ts
```

### 4. Remove the postinstall patch (if present)

If your `package.json` has a `postinstall` script referencing `patch-faststore-cli.js`:

```json
// Remove this:
"scripts": {
  "postinstall": "node scripts/patch-faststore-cli.js"
}
```

Also delete `scripts/patch-faststore-cli.js` if it exists. The `/api` path restriction was
removed in recent FastStore CLI versions — no patching is needed.

### 5. Run yarn build

```bash
yarn build
```

This triggers FastStore codegen which generates:
- `@generated/graphql` types + query documents
- `.faststore/persisted-documents.json` with operation hashes

### 6. Verify persisted-documents.json

After the build, check that the 4 Vrein operations appear in `.faststore/persisted-documents.json`:

```bash
cat .faststore/persisted-documents.json | grep -E "vreinProducts|vreinImages|vreinProductData|vreinCategoryId"
```

Expected output (hashes may differ across projects):
```
"27fda911...": "query VreinProductsQuery ...",
"ffac7a43...": "query VreinImagesQuery ...",
"ad9316d1...": "query VreinProductDataQuery ...",
"be6edac9...": "query VreinCategoryIdQuery ..."
```

### 7. Verify no /api/vrein traffic

Start the dev server and confirm:
- `POST /api/graphql` with VreinProductsQuery → HTTP 200
- `GET /api/vrein` → HTTP 404 (route is gone)

### 8. Set environment variables

Only 2 env vars are needed (unchanged from v0.1.x):

```env
VREIN_HASH=your-hash-here
VTEX_ACCOUNT=your-vtex-account
```

Remove any legacy env vars: `NEXT_PUBLIC_VREIN_HASH`, `NEXT_PUBLIC_VREIN_SECRET`,
`NEXT_PUBLIC_VREIN_BRANCH_OFFICE`, `VREIN_SECRET`, `VREIN_BRANCH_OFFICE`.

---

## Troubleshooting

### Persisted hash 400 in dev mode

FastStore's dev server (`yarn dev`) requires the full query string — it does not resolve
persisted query hashes at runtime. A `400` response on hash-only requests during dev is
**expected behavior**. The hashes are resolved in production builds only.

### yarn install ignores updated tarball

Yarn 1.x caches tarballs by filename. If you repack a tarball with the same filename, Yarn
may extract from the old cached version. To force a fresh extraction:

1. Rename the tarball (e.g., `v0.2.0.tgz` → `v0.2.0-r1.tgz`)
2. Update the `file:` reference in `package.json`
3. Delete `node_modules` and `yarn.lock`
4. Run `yarn install`

### TypeScript errors after migration

Ensure you have no remaining `as any` casts on the base components. v0.2.0 types include
`useQueryFn: QueryExecutor` and `vreinProductsDocument / vreinImagesDocument: unknown`,
so the wrappers generated by the scaffolder type-check cleanly.
