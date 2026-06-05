# Guía de instalación — Vrein para FastStore

Guía para implementadores que integran los componentes Vrein (`@vreinai/faststore-components`) en una tienda **VTEX FastStore** existente, incluyendo tiendas con customizaciones propias.

**Componentes incluidos:**

| Componente | Función |
|---|---|
| `VreinCarousel` | Carrusel de recomendaciones de producto |
| `VreinImageBanner` | Banners de imagen con countdown inteligente |
| `VreinTracking` | Script de tracking y captura de eventos (sección global del CMS) |

---

## 1. Requisitos previos

- Proyecto FastStore basado en el starter oficial (`@faststore/cli` >= 3.x, Next.js >= 13, React >= 18).
- `@faststore/ui` y `@faststore/sdk` >= 3.0.0 (peer dependencies).
- `sass` instalado en el proyecto (los componentes usan módulos SCSS).
- **Hash de cliente Vrein** (lo provee el equipo de Vrein/BrainDW, ej: `mitienda_produccion_xxxxx`).
- Account VTEX de la tienda.

## 2. Instalar el paquete

```bash
yarn add @vreinai/faststore-components
```

> Paquete: `@vreinai/faststore-components` (registry privado de Vrein AI). Si el cliente no tiene acceso al registry, solicitar el tarball `.tgz` al equipo Vrein e instalar con `yarn add file:./vreinai-faststore-components-x.y.z.tgz`.

## 3. Configurar variables de entorno

En `vtex.env` (y en las env vars de Vercel si aplica):

```env
NEXT_PUBLIC_VREIN_HASH=<hash provisto por Vrein>
VTEX_ACCOUNT=<account VTEX de la tienda>
```

No se requiere ninguna otra credencial: secret, branch office y URLs de API ya están resueltos dentro del paquete.

## 4. Copiar los archivos al proyecto (manual)

La forma recomendada es copiar los archivos desde el **repositorio de referencia `Componente-Vrein-FastStore`**, que ya contiene todos los archivos listos para usar, validados en producción. Su estructura de directorios espeja exactamente la estructura destino en la tienda, e incluye además un ejemplo de override de ProductCard (ver sección 8.2).

### 4.1 GraphQL

| Origen (en el repo de referencia) | Destino (en el proyecto del cliente) |
|---|---|
| `src/graphql/thirdParty/typeDefs/vrein.graphql` | `src/graphql/thirdParty/typeDefs/vrein.graphql` |
| `src/graphql/thirdParty/resolvers/vrein.ts` | `src/graphql/thirdParty/resolvers/vrein.ts` |
| `src/graphql/vrein/vreinQueries.ts` | `src/graphql/vrein/vreinQueries.ts` |
| `src/sdk/vreinQueryAdapter.ts` | `src/sdk/vreinQueryAdapter.ts` |

- `vrein.graphql` — tipos y queries de Vrein (extiende `Query` con `vreinProducts`, `vreinImages`, `vreinProductData`, `vreinCategoryId`).
- `resolvers/vrein.ts` — re-export de los resolvers del paquete (no contiene lógica propia).
- `vreinQueries.ts` — query documents que el codegen de FastStore escanea para generar los persisted queries. **Sin este archivo el build no registra las queries.**
- `vreinQueryAdapter.ts` — adaptador del `useQuery` de FastStore que usan los componentes.

> **Nota sobre rutas e imports**: algunos imports en los wrappers referencian `src/customizations/src/...`. Es correcto — el CLI de FastStore copia el `src/` del proyecto dentro de `.faststore/src/customizations/src/` durante el build. Los archivos físicos siempre van en las rutas indicadas (sin `customizations/`).

### 4.2 Componentes de sección

| Origen (en el repo de referencia) | Destino (en el proyecto del cliente) |
|---|---|
| `src/components/sections/VreinCarousel/` (carpeta completa) | `src/components/sections/VreinCarousel/` |
| `src/components/sections/VreinImageBanner/` (carpeta completa) | `src/components/sections/VreinImageBanner/` |
| `src/components/sections/VreinTracking/` (carpeta completa) | `src/components/sections/VreinTracking/` |

Cada carpeta ya incluye `VreinXxx.tsx`, `VreinXxx.module.scss`, `index.ts` y `section.json`.

Cada wrapper importa el componente base del paquete y le inyecta los hooks del proyecto cliente (`useCart`, `useQuery`, overrides, etc.). Son archivos **del cliente** — se pueden editar para ajustar rutas de imports si el proyecto tiene otra estructura (ver sección 8.4).

### 4.3 Scripts y typings

| Origen (en el repo de referencia) | Destino (en el proyecto del cliente) |
|---|---|
| `src/scripts/ThirdPartyScripts.tsx` | `src/scripts/ThirdPartyScripts.tsx` |
| `src/typings/vrein.d.ts` | `src/typings/vrein.d.ts` |

### 4.4 Secciones del CMS

El archivo `cms/faststore/sections.json` del repo de referencia contiene las tres entradas Vrein. Agregar esos objetos al array existente en `cms/faststore/sections.json` del proyecto del cliente — **no reemplazar el archivo completo** si el cliente ya tiene secciones propias.

> **Alternativa**: los templates también existen dentro del paquete instalado, en `node_modules/@vreinai/faststore-components/templates/` y `node_modules/@vreinai/faststore-components/cms/`. En ese caso, copiar cada archivo quitando la extensión `.tpl` y crear manualmente los `index.ts` en cada carpeta de componente.

## 5. Registrar los resolvers y los componentes

**a) Resolvers** — en `src/graphql/thirdParty/resolvers/index.ts`, agregar el spread:

```ts
import vreinResolvers from './vrein'

export default {
  Query: {
    ...vreinResolvers.Query,
    // ...resolvers existentes del cliente
  },
}
```

**b) Componentes** — en `src/components/index.tsx` (el registro de secciones del proyecto):

```tsx
import { VreinCarousel } from './sections/VreinCarousel'
import { VreinImageBanner } from './sections/VreinImageBanner'
import { VreinTracking } from './sections/VreinTracking'

const sections = {
  // ...secciones existentes del cliente
  VreinCarousel,
  VreinImageBanner,
  VreinTracking,
}
```

> Este paso es **manual** — el scaffolder no lo hace automáticamente.

## 6. Build y sincronización con el CMS

```bash
yarn build      # registra los persisted query hashes de Vrein
yarn cms-sync   # sube los schemas de sección al Headless CMS
```

Verificar que `.faststore/persisted-documents.json` contenga entradas para `vreinProducts`, `vreinImages`, `vreinProductData` y `vreinCategoryId`.

## 7. Configuración en el Headless CMS

1. **Global Section**: agregar la sección `VreinTracking` (sin props). Esto activa el tracking en toda la tienda — sin este paso no se capturan eventos ni funcionan las recomendaciones personalizadas.
2. **Páginas**: agregar `VreinCarousel` y/o `VreinImageBanner` donde corresponda, completando el `sectionId` acordado con el equipo de Vrein (ej: `HOME//Carrusel 1`, `PDP//Carrusel 2`).

> Opcional recomendado: editar las entradas Vrein de `cms/faststore/sections.json` para reemplazar el campo `sectionId` de texto libre por un `enum` con los IDs habilitados para la tienda, así el editor de CMS ve un dropdown y no puede tipear IDs inválidos. Pedir la lista de secciones al equipo Vrein.

---

## 8. Adaptar a la customización existente de la tienda (importante)

El carrusel de Vrein está diseñado para **heredar el look & feel de la tienda automáticamente**, en dos niveles:

### 8.1 Theming (automático)

Los componentes usan los componentes de `@faststore/ui` (`ProductCard`, `Carousel`, etc.) y el sistema de variables `--fs-*`. Cualquier customización del tema en `custom-theme.scss` (colores, tipografía, bordes, espaciado) se aplica al carrusel sin configuración adicional.

### 8.2 ProductCard customizado (detección automática del override)

Si la tienda tiene un **override del ProductCard** — el patrón estándar de FastStore en `src/components/overrides/ProductShelf.tsx` — el carrusel de Vrein **lo detecta y lo usa automáticamente**, de modo que las cards de recomendaciones se ven idénticas a las del resto de la tienda.

Ejemplo de override típico del cliente:

```tsx
// src/components/overrides/ProductShelf.tsx
import { SectionOverride } from '@faststore/core'
import MyCustomProductCard from '../MyCustomProductCard'

const SECTION = 'ProductShelf' as const

const override: SectionOverride = {
  section: SECTION,
  components: {
    __experimentalProductCard: {
      Component: MyCustomProductCard,
      props: {
        showDiscountBadge: true,
        // props default del card del cliente
      },
    },
  },
}

export { override }
```

Con eso el wrapper `VreinCarousel.tsx` resuelve el override vía `getSectionOverrides()` y renderiza cada producto recomendado con el componente del cliente, pasándole:

```tsx
<MyCustomProductCard
  product={productSummary}  // VreinProduct convertido a ProductSummary estándar
  index={index + 1}
  aspectRatio={1}
  imgProps={{ width: 216, height: 216, sizes: '(max-width: 768px) 42vw, 30vw' }}
  {...propsDelOverride}
/>
```

El producto llega convertido al formato `ProductSummary` estándar de FastStore (vía `vreinToProductSummary`), por lo que el card del cliente funciona sin cambios.

### 8.3 Fallback sin override

Si la tienda **no** tiene override de ProductCard, el carrusel usa `VreinProductItem` (incluido en el paquete), construido con `ProductCard`/`ProductCardImage`/`ProductCardContent` de `@faststore/ui`.

> ⚠️ El fallback formatea precios con locale `es-AR` / moneda `ARS`. Para tiendas con otra moneda/locale, definir un override de ProductCard (sección 8.2) — es la vía recomendada en cualquier caso.

### 8.4 Otros puntos de adaptación

- **Rutas de imports del wrapper**: si el proyecto cliente movió `src/sdk/cart`, `src/sdk/graphql/useQuery` u overrides a otras rutas, ajustar los imports en los wrappers generados (`src/components/sections/Vrein*/`). Son archivos del cliente, editables.
- **Estilos propios del carrusel**: los wrappers usan `.module.scss` propios; cualquier ajuste fino (gaps, flechas, badges) se hace ahí sin tocar el paquete.

---

## 9. Verificación

1. `yarn dev` y abrir la tienda.
2. En la consola del navegador ejecutar `vrein_debug()` — habilita logs `[Vrein]`.
3. Navegar a una PDP y verificar en Network:
   - `s2.braindw.com` → GetGuid y capturas de eventos
   - `/api/graphql` → queries `vreinProducts` / `vreinImages` respondiendo con productos
4. Verificar que los carruseles renderizan con el card de la tienda (si hay override).
5. Desactivar logs con `vrein_debug_off()`.

## 10. Troubleshooting rápido

| Síntoma | Causa probable |
|---|---|
| Carrusel no renderiza nada | `sectionId` inválido o hash incorrecto en `NEXT_PUBLIC_VREIN_HASH` |
| Error `PersistedQueryNotFound` | Falta `yarn build` después de copiar los archivos, o falta `vreinQueries.ts` (codegen no registró las queries) |
| No se capturan eventos | `VreinTracking` no está en el Global Section del CMS |
| Cards "genéricas" en vez de las del cliente | El override no expone `__experimentalProductCard` en `overrides/ProductShelf` |
| Error de compilación SCSS | Falta `sass` en devDependencies del proyecto |
| Existe `src/pages/api/vrein.ts` o postinstall `patch-faststore-cli` | Restos de v0.1.x — eliminar; desde v0.2.0 todo va por `/api/graphql` |

## Referencias

- Paquete: `@vreinai/faststore-components` — repo: `D:/Braindw/NPM/Vrein-Faststore-package`
- Proyecto de referencia (implementación completa): `faststore-braindw` (account VTEX `brain`)
- APIs Vrein: `s2.braindw.com` (sesión, captura, recomendaciones), `p2.vrein.ai` (persistencia), `abtest.braindw.com` (A/B testing)
- Contacto para hashes y section IDs: equipo Vrein / BrainDW
