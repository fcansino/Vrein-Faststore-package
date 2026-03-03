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
  scripts/
    ThirdPartyScripts.tsx   ← copiar
```

Luego registrar en `src/components/index.tsx`:

```tsx
import { VreinCarousel } from './sections/VreinCarousel'
import { VreinImageBanner } from './sections/VreinImageBanner'

export default { VreinCarousel, VreinImageBanner }
```

### 4. ThirdPartyScripts

El script de tracking inyecta el hash al cliente via `window.__VREIN_CONFIG`. Agregar en el layout raíz:

```tsx
import ThirdPartyScripts from 'src/scripts/ThirdPartyScripts'

// En el layout:
<ThirdPartyScripts />
```

Lee `process.env.NEXT_PUBLIC_VREIN_HASH` en el servidor y lo escribe en el HTML. Los componentes client-side lo leen desde `process.env.NEXT_PUBLIC_VREIN_HASH` directamente (Next.js lo inlinea en el bundle).

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

## Licencia

UNLICENSED — uso interno Vrein AI / BrainDW.
