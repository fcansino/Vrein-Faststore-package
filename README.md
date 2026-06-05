# @vreinai/faststore-components

Resolvers GraphQL server-side y utilidades de **Vrein AI** para proyectos [FastStore](https://www.faststore.dev/) (Next.js + VTEX).

---

## Qué incluye este paquete

- **Resolvers GraphQL** (`vreinProducts`, `vreinImages`, `vreinProductData`, `vreinCategoryId`) — lógica server-side que consulta la API de Vrein y enriquece con el Catalog API de VTEX
- **Tipos TypeScript** — para los datos retornados por los resolvers
- **Configuración** — helpers de entorno y config por cliente

> **Nota:** Los componentes UI (VreinCarousel, VreinImageBanner), hooks y estilos se distribuyen como **archivos locales** en el proyecto consumidor (patron template), no como imports del paquete. Esto es necesario porque FastStore requiere que los hooks con `gql()` estén en el proyecto para registrar las queries como persisted documents en build time.

---

## Instalación

```bash
yarn add @vreinai/faststore-components
```

---

## Variables de entorno

Solo necesitas configurar **2 variables** en `vtex.env` (o en Vercel > Settings > Environment Variables):

```env
# Hash único de tu tienda — proporcionado por el equipo de Vrein
NEXT_PUBLIC_VREIN_HASH=<tu_hash>

# Account VTEX de tu tienda
VTEX_ACCOUNT=<tu_account>
```

Las constantes del paquete están hardcodeadas (iguales para todos los clientes):

| Constante | Valor |
|-----------|-------|
| `BRANCH_OFFICE` | `1` |
| `SECRET` | hardcodeado internamente |
| `API_URL` | `https://s2.braindw.com/tracking/track` |

> El resolver lee `NEXT_PUBLIC_VREIN_HASH` con fallback a `VREIN_HASH`. Si tu proyecto anterior usaba `VREIN_HASH`, sigue funcionando.

---

## Integración en FastStore

### 1. Registrar los resolvers

En `src/graphql/thirdParty/resolvers/vrein.ts`:

```ts
import { vreinResolvers } from '@vreinai/faststore-components/graphql'

export default vreinResolvers
```

En `src/graphql/thirdParty/resolvers/index.ts`, agregar el spread:

```ts
import vrein from './vrein'

export const resolvers = {
  Query: {
    ...vrein.Query,
    // ...otros resolvers
  }
}
```

### 2. Registrar los tipos GraphQL

Copiar `src/graphql/thirdParty/typeDefs/vrein.graphql` al proyecto. El CLI de FastStore los procesa automáticamente.

### 3. Copiar archivos de componentes

Los siguientes archivos se copian como template al proyecto consumidor:

```
src/
  components/sections/
    VreinCarousel/          ← copiar completo
    VreinImageBanner/       ← copiar completo
    VreinTracking/          ← copiar completo (Global Section)
```

Luego registrar en `src/components/index.tsx`:

```tsx
import { VreinCarousel } from './sections/VreinCarousel'
import { VreinImageBanner } from './sections/VreinImageBanner'
import { VreinTracking } from './sections/VreinTracking'

export default { VreinCarousel, VreinImageBanner, VreinTracking }
```

### 4. VreinTracking (Global Section)

El tracking se activa con la sección CMS `VreinTracking`. Colocarla en el **Global Section** del Headless CMS para que cargue en todas las páginas. El scaffolder genera el wrapper en `src/components/sections/VreinTracking/VreinTracking.tsx`.

Cómo funciona:

- Descarga el script de tracking desde el CDN (`s2.braindw.com/Script/braindw/{hash}`) — el script se actualiza del lado de Vrein sin redeploy del cliente.
- Captura los eventos de analytics de FastStore con `useAnalyticsEvent` (`@faststore/sdk`) y los reenvía a `window.__VREIN_PROCESS_EVENT`. Los eventos disparados antes de que el script termine de cargar se bufferean y se procesan al estar listo.
- Lee `process.env.NEXT_PUBLIC_VREIN_HASH` (Next.js lo inlinea en el bundle) y lo expone via `window.__VREIN_CONFIG`.

Requiere `@faststore/sdk` como peer dependency (ya presente en cualquier proyecto FastStore).

### 5. Sincronizar schemas CMS

Copiar los archivos de `cms/` al proyecto y ejecutar:

```bash
yarn cms-sync
```

---

## Resolvers disponibles

| Resolver | Descripción |
|----------|-------------|
| `vreinProducts(sectionId, context)` | Recomendaciones de productos por sección |
| `vreinImages(sectionId, ...)` | Banners SmartImage con countdown |
| `vreinProductData(productId, skuId)` | Datos completos de un producto para persistencia |
| `vreinCategoryId(pathname)` | Resuelve pathname de URL a categoryId numérico de VTEX |

---

## Variables de cache opcionales (server-side)

```env
VREIN_CACHE_TTL_MS=60000     # Cache de respuestas Vrein API (default: 1 min)
VTEX_CACHE_TTL_MS=300000     # Cache de productos VTEX Catalog (default: 5 min)
```

---

## Debugging

En la consola del navegador del proyecto consumidor:

```js
vrein_debug()      // Activa logs + borde visual en carruseles/banners
vrein_debug_off()  // Desactiva
```

---

---

## Migration: v0.1.x → v0.2.0

### Breaking changes

- `useVreinRecommendations` — signature changed: `(useQueryFn, queryDocument, params)`. The hook no longer fetches internally.
- `useVreinImages` — same change.
- Components `VreinCarousel` and `VreinImageBanner` now require `useQueryFn` and `vreinProductsDocument`/`vreinImagesDocument` props.
- `/api/vrein` route no longer exists. Requests flow through `/api/graphql` via FastStore's persisted-query path.
- Package entry points `@vreinai/faststore-components/sdk` and the old handler export are removed.
- `postinstall` script (CLI patcher) removed from the package. Run a clean `yarn install` after upgrading.

### Migration steps

1. **Upgrade package:**
   ```bash
   yarn add @vreinai/faststore-components@^0.2.0
   ```

2. **Run the scaffolder** (generates query files and updated wrappers):
   ```bash
   npx @vreinai/faststore-components setup
   ```
   Or if installed locally:
   ```bash
   yarn vrein-setup
   ```

3. **Review generated files** — confirm `VreinCarousel.tsx` and `VreinImageBanner.tsx` look correct.

4. **Build** to generate `.faststore/@generated/persisted-documents.json` with Vrein query hashes:
   ```bash
   yarn build
   ```

5. **Verify** `.faststore/@generated/persisted-documents.json` contains entries for:
   `VreinProductsQuery`, `VreinImagesQuery`, `VreinProductDataQuery`, `VreinCategoryIdQuery`

6. **Sync CMS section schemas** (if sections.json was updated by scaffolder):
   ```bash
   yarn cms-sync
   ```

7. **Delete stale API route** if it exists (scaffolder will warn about it):
   ```
   src/customizations/src/pages/api/vrein.ts
   ```

8. **Clean reinstall** to remove the old CLI patch from node_modules:
   ```bash
   rm -rf node_modules && yarn install
   ```

9. **Verify runtime**: network tab should show `GET /api/graphql?operationName=vreinProducts` — zero requests to `/api/vrein`.

---

## Licencia

UNLICENSED — uso interno Vrein AI / BrainDW.
