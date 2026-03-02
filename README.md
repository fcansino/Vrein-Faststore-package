# @vreinai/faststore-components

Componentes y utilidades de **Vrein AI** para proyectos [FastStore](https://www.faststore.dev/) (Next.js).

Incluye:

- **VreinCarousel** — carrusel de productos con recomendaciones personalizadas de Vrein AI
- **VreinImageBanner** — banner de imágenes dinámico con soporte de countdown inteligente
- **GraphQL handler** — endpoint standalone que bypasea el sistema de persisted queries de FastStore
- **SDK** — hooks y utilidades para consumir la API de Vrein desde el cliente

---

## Instalación

```bash
npm install @vreinai/faststore-components
```

### Peer dependencies

```bash
npm install react react-dom next swr @faststore/ui
```

---

## Variables de entorno

Agrega estas variables al `.env` de tu proyecto:

```env
NEXT_PUBLIC_VREIN_HASH=tu_client_key
NEXT_PUBLIC_VREIN_BRANCH_OFFICE=1
NEXT_PUBLIC_VREIN_SECRET=tu_secret
```

---

## Setup del API Route

FastStore usa **persisted queries** en `/api/graphql` y rechaza cualquier operación no registrada. Por eso este paquete requiere montar un handler propio.

### App Router (Next.js 13+)

```ts
// app/api/vrein/route.ts
import { createVreinRouteHandlers } from '@vreinai/faststore-components/graphql'

export const { GET, POST } = createVreinRouteHandlers()
```

### Pages Router

```ts
// pages/api/vrein.ts
import { createVreinApiHandler } from '@vreinai/faststore-components/graphql'

export default createVreinApiHandler()
```

> Por defecto los componentes apuntan a `/api/vrein`. Si montás el handler en otra ruta, llamá `setVreinApiEndpoint('/tu-ruta')` una vez al inicio de la app.

---

## Componentes

### VreinCarousel

Carrusel de productos con recomendaciones personalizadas por sección.

```tsx
import { VreinCarousel } from '@vreinai/faststore-components'

export default function HomePage() {
  return (
    <VreinCarousel sectionId="HOME-Carrusel-1" />
  )
}
```

**Props**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `sectionId` | `string` | ID de la sección configurada en Vrein (ej: `BDW-HOME-Carrusel-1`) |
| `productCardOverride` | `{ Component, props? } \| null` | Componente de producto personalizado del proyecto consumidor |

---

### VreinImageBanner

Banner de imágenes dinámico con múltiples imágenes, soporte mobile/desktop y countdown opcional.

```tsx
import { VreinImageBanner } from '@vreinai/faststore-components'

export default function HomePage() {
  return (
    <VreinImageBanner
      sectionId="HOME-Banner-1"
      showArrows
      showDots
      autoplay
    />
  )
}
```

**Props**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `sectionId` | `string` | — | ID de la sección en Vrein |
| `pageContext` | `string` | — | Contexto de página para personalización |
| `height` | `number` | — | Altura del banner en px |
| `showArrows` | `boolean` | `false` | Muestra flechas de navegación |
| `showDots` | `boolean` | `false` | Muestra indicadores de posición |
| `autoplay` | `boolean` | `false` | Avance automático entre imágenes |
| `showLazyLoading` | `boolean` | `false` | Activa lazy loading en imágenes |
| `lazyLoadingHeight` | `number` | — | Altura del placeholder de lazy loading |

---

## Hooks

Para casos de uso avanzados los hooks están disponibles por separado.

```ts
import {
  useVreinRecommendations,
  useVreinImages,
  useVreinMetrics,
  useVreinContext,
} from '@vreinai/faststore-components'
```

| Hook | Descripción |
|------|-------------|
| `useVreinRecommendations` | Obtiene productos recomendados para una sección |
| `useVreinImages` | Obtiene imágenes de banner para una sección |
| `useVreinMetrics` | Registra métricas de interacción (impresiones, clicks) |
| `useVreinContext` | Lee el contexto de sesión de Vrein (guid, etc.) |

---

## Utilidades

```ts
import {
  vreinToProductSummary,
  getClientConfig,
  getShelfTitleTag,
  setVreinApiEndpoint,
  enableVreinDebug,
  disableVreinDebug,
} from '@vreinai/faststore-components'
```

| Utilidad | Descripción |
|----------|-------------|
| `vreinToProductSummary` | Convierte un producto Vrein al formato `ProductSummary` de FastStore |
| `getClientConfig` | Retorna la configuración del cliente Vrein |
| `getShelfTitleTag` | Retorna el tag HTML del título del shelf según configuración |
| `setVreinApiEndpoint(path)` | Sobreescribe la ruta del API handler (default: `/api/vrein`) |
| `enableVreinDebug()` | Activa logs de debug en `window.VREIN_DEBUG` |
| `disableVreinDebug()` | Desactiva los logs de debug |

---

## CMS Sections

El paquete incluye schemas de secciones para el CMS de FastStore en la carpeta `cms/`:

- `vreinCarouselSection.json`
- `vreinImageBannerSection.json`

Copiá estos archivos a la carpeta `cms/` de tu proyecto para habilitar la edición de secciones desde el CMS de FastStore.

---

## Licencia

UNLICENSED — uso interno Vrein AI / BrainDW.
