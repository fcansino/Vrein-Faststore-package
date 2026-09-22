import * as react_jsx_runtime from 'react/jsx-runtime';
export { vreinResolvers, vreinTypeDefs } from './graphql.js';

/**
 * QueryExecutor — matches the signature of FastStore's src/sdk/graphql/useQuery exactly.
 *
 * T = response data type
 * V = variables type
 *
 * The return shape mirrors SWR: data is undefined while loading (not null),
 * and isValidating is used instead of loading.
 * Component hooks map isValidating → loading and data !== undefined → data.
 */
interface QueryExecutor {
    <T, V = Record<string, unknown>>(query: {
        __meta__: {
            operationName: string;
            storeName?: string;
        };
    }, variables: V, options?: {
        doNotRun?: boolean;
    }): {
        data: T | undefined;
        isValidating: boolean;
        error?: unknown;
    };
}

type PageType$1 = 'home' | 'product' | 'category' | 'search' | 'searchnoresult';
type VreinCarouselProps = {
    /** Injected FastStore useQuery executor (dependency injection for persisted-query path) */
    useQueryFn: QueryExecutor;
    /** Injected query document from @generated/graphql (VreinProductsQueryDocument) */
    vreinProductsDocument: unknown;
    /** ID de la sección específica de Vrein (ej: BDW-HOME-Carrusel-1) */
    sectionId: string;
    /** Optional ProductCard override config from the consumer project */
    productCardOverride?: {
        Component: React.ComponentType<any>;
        props?: Record<string, any>;
    } | null;
    /**
     * ID del carrito actual (desde useCart del framework).
     * Se usa en métricas y se persiste en localStorage para el script de tracking.
     * Si no se provee, el hook genera un ID de sesión como fallback.
     */
    cartId?: string;
    /**
     * Resultado de la búsqueda en página /s (para secciones SR/SNR).
     * - true  → hay resultados → mostrar sección SR, ocultar SNR
     * - false → sin resultados → mostrar sección SNR, ocultar SR
     * - null  → cargando (aún no hay datos) → ocultar ambas hasta saber
     * - undefined → no aplica (no es página de búsqueda)
     * Si se provee, tiene prioridad sobre la detección DOM interna.
     */
    hasSearchResults?: boolean | null;
    /**
     * Fuerza el pageType para la construcción del contexto de Vrein.
     * Útil en páginas /s donde el sectionId indica si es SR o SNR pero el
     * componente no puede determinarlo desde la URL sola.
     */
    pageTypeOverride?: PageType$1;
};

declare const VreinCarousel: ({ sectionId, productCardOverride, cartId, hasSearchResults, pageTypeOverride, useQueryFn, vreinProductsDocument, }: VreinCarouselProps) => react_jsx_runtime.JSX.Element | null;

interface VreinImageBannerProps {
    /** Injected FastStore useQuery executor (dependency injection for persisted-query path) */
    useQueryFn: QueryExecutor;
    /** Injected query document from @generated/graphql (VreinImagesQueryDocument) */
    vreinImagesDocument: unknown;
    sectionId: string;
    pageContext?: string;
    height?: number;
    showArrows?: boolean;
    showDots?: boolean;
    autoplay?: boolean;
    showLazyLoading?: boolean;
    lazyLoadingHeight?: number;
    /** ID del carrito actual (desde useCart del framework). Se usa en métricas. */
    cartId?: string;
}
interface VreinBannerImage$1 {
    title: string;
    image: string;
    mobileImage: string;
    link: string;
}
interface VreinSmartCountdown$1 {
    dateStart: string;
    dateEnd: string;
    fontSizeDesktop: number;
    fontSizeMobile: number;
    positionDesktop: string;
    positionMobile: string;
    fontColor: string;
    enabled: boolean;
    timeZoneOffset: number;
}
interface VreinImageBannerData {
    images: VreinBannerImage$1[];
    smartCountdown: VreinSmartCountdown$1 | null;
}

declare const VreinImageBanner: ({ sectionId, height, showLazyLoading, lazyLoadingHeight, cartId, useQueryFn, vreinImagesDocument, }: VreinImageBannerProps) => react_jsx_runtime.JSX.Element | null;

type VreinDataLayerEvent = Record<string, unknown>;
interface VreinAnalyticsEvent {
    name: string;
    params: unknown;
}
/**
 * Signature of FastStore's useAnalyticsEvent hook (@faststore/sdk).
 * The hook is injected by the client wrapper instead of imported here:
 * @faststore/sdk is ESM-only (no "main"/"exports" fields), so requiring it
 * from this package's CJS dist crashes Next's externalized server bundles
 * with "Cannot find module '@faststore/sdk'".
 */
type UseAnalyticsEventFn = (handler: (event: VreinAnalyticsEvent) => void) => void;
declare global {
    interface Window {
        __VREIN_CONFIG?: {
            hash: string;
        };
        __VREIN_PROCESS_EVENT?: (event: VreinDataLayerEvent) => void;
    }
}
interface VreinTrackingProps {
    /** FastStore's useAnalyticsEvent hook, injected by the client wrapper. */
    useAnalyticsEventFn?: UseAnalyticsEventFn;
}
declare function VreinTracking({ useAnalyticsEventFn }: VreinTrackingProps): null;

interface VreinBrand {
    name: string;
    id: string;
    imageUrl: string;
}
interface VreinImage {
    url: string;
    alternateName: string;
}
interface VreinInstallment {
    Value: number;
    InterestRate: number;
    TotalValuePlusInterestRate: number;
    NumberOfInstallments: number;
    PaymentSystemName: string;
    PaymentSystemGroupName: string;
    Name: string;
}
interface VreinOffer {
    price: number;
    listPrice: number;
    availability: string;
    installments: VreinInstallment[];
}
interface VreinOffers {
    offers: VreinOffer[];
}
interface VreinProductGroup {
    productGroupID: string;
    name: string;
}
interface VreinProduct {
    id: string;
    sku: string;
    slug: string;
    name: string;
    brand: VreinBrand;
    categories?: string;
    categoryIds?: string;
    image: VreinImage[];
    offers: VreinOffers;
    isVariantOf: VreinProductGroup;
}
interface VreinProductConnection {
    products: VreinProduct[];
    totalCount: number;
    title: string;
    endpointName: string;
    apiUrl: string;
}
interface VreinBannerImage {
    title: string;
    image: string;
    mobileImage: string;
    link: string;
}
interface VreinSmartCountdown {
    dateStart: string;
    dateEnd: string;
    fontSizeDesktop: number;
    fontSizeMobile: number;
    positionDesktop: string;
    positionMobile: string;
    fontColor: string;
    enabled: boolean;
    timeZoneOffset: number;
}
interface VreinImageBannerConnection {
    images: VreinBannerImage[];
    smartCountdown: VreinSmartCountdown | null;
}
interface VreinFullProduct {
    id: string;
    sku: string;
    slug: string;
    name: string;
    description?: string;
    brand: string;
    categories?: string;
    categoryIds?: string;
    categoryNames?: string;
    price: number;
    listPrice: number;
    availability: string;
    image: string;
    url: string;
}
type PopupSection = "HOME" | "PDP" | "PLP" | "SEARCH";
type PopupType = "modal" | "slider";
interface VreinPopupBlock$1 {
    blockId: string;
    title: string;
    link: string;
    gaEventAction: string;
    gaEventCategory: string;
    gaEventLabel: string;
    products: VreinProduct[];
}
interface VreinPopupData {
    section: string;
    type: PopupType;
    showOnce: boolean;
    blocks: VreinPopupBlock$1[];
    apiUrl: string;
}

type VreinProductItemProps = {
    item: VreinProduct;
    bordered?: boolean;
    showDiscountBadge?: boolean;
    position?: number;
    onProductClick?: (productId: string, productName: string, position: number) => void;
};
declare const VreinProductItem: ({ item, bordered, showDiscountBadge, position, onProductClick, }: VreinProductItemProps) => react_jsx_runtime.JSX.Element;

type VreinPopupProps = {
    /** Injected FastStore useQuery executor (persisted-query path) */
    useQueryFn: QueryExecutor;
    /** Injected document from @generated/graphql (VreinPopupQueryDocument) */
    vreinPopupDocument: unknown;
    /** Cart id from useCart(), for metrics parity with VreinCarouselProps.cartId */
    cartId?: string;
    /**
     * QA escape hatch; also settable via `?vrein_popup_section=PDP`. Mirrors
     * Magento's `section_override`. Bypasses the page-type mapping table
     * entirely and is used verbatim, uppercased. Never merchant-facing — the
     * CMS schema for this section stays empty.
     */
    sectionOverride?: PopupSection | string;
    /**
     * Optional SPA route key (e.g. `usePathname() + search` in a Next app).
     * When provided, overrides the package's internal `history`-patch-based
     * navigation detection for re-resolving the section on client-side nav.
     */
    routeKey?: string;
    /**
     * Path prefixes where the popup must never render, matched against
     * `window.location.pathname`. Mitigation for the PLP fail-open documented
     * in design decision D8 (content routes falling through to `category`).
     */
    excludedPaths?: string[];
};

/**
 * Root orchestrator. `'use client'`.
 *
 * Returns `null` on the server and on the first client render — before
 * `hasMounted` flips `true`, `VreinPopupMounted` (and every hook it calls,
 * including the reused `useVreinContext`, which still reads `window` inside
 * a `useState` lazy initializer) is never even instantiated. This keeps the
 * "no browser API access before mount" guarantee literal, not just about the
 * final rendered output: nothing in this tree touches `window`, `document`,
 * `localStorage`, or `sessionStorage` until a render pass that only happens
 * after mount.
 */
declare const VreinPopup: (props: VreinPopupProps) => react_jsx_runtime.JSX.Element | null;

type VreinPopupModalProps = {
    data: VreinPopupData;
    section: string;
    onClose: () => void;
};
/**
 * Overlay + centered content box + close control, capable of rendering one
 * or two resolved blocks in the same modal instance. Owns the dismiss
 * interaction (calls `onClose`, which the root wires to `usePopupDismissal`'s
 * `dismiss()`).
 *
 * Accessibility: `role="dialog"`, `aria-modal="true"`, an accessible close
 * label, Escape-to-close, and focus restoration on close (design safety
 * note #8 — the Magento reference only has a bare `aria-label`).
 */
declare const VreinPopupModal: ({ data, section, onClose }: VreinPopupModalProps) => react_jsx_runtime.JSX.Element;

type VreinPopupSliderProps = {
    data: VreinPopupData;
    section: string;
    collapsed: boolean;
    onToggle: () => void;
};
/**
 * Fixed right rail with a collapsible vertical-label tab, capable of
 * rendering one or two resolved blocks. Never consults the ShowOnce/
 * dismissal gate — the slider has no ShowOnce logic by design (spec:
 * "ShowOnce ignored for slider"). Collapse state is owned by the root via
 * `useSliderCollapse` (sessionStorage only, never localStorage) and does not
 * survive a full page reload.
 *
 * Two-blocks UX (label from the first non-empty block's title, each block
 * kept visually separate via the shared `VreinPopupBlock`) mirrors the
 * Magento port; whether blocks should instead be flattened into one list is
 * an open product question, not resolved by this change.
 */
declare const VreinPopupSlider: ({ data, section, collapsed, onToggle }: VreinPopupSliderProps) => react_jsx_runtime.JSX.Element;

type VreinPopupBlockProps = {
    block: VreinPopupBlock$1;
};
/**
 * One resolved popup block: optional title, a product carousel built from
 * the same `VreinProductItem` the carousel uses, and an optional CTA link.
 *
 * The API-supplied `link` is routed through `safeHttpUrl()` before ever
 * reaching an `href` (design safety note #1); no CTA renders when it comes
 * back `null`. `title` and the GA passthrough fields render as plain text /
 * attributes only — no `dangerouslySetInnerHTML` anywhere in this tree
 * (design safety note #2).
 */
declare const VreinPopupBlock: ({ block }: VreinPopupBlockProps) => react_jsx_runtime.JSX.Element;

interface VreinRecommendationsData {
    products: VreinProduct[];
    title: string;
    endpointName: string;
    apiUrl: string;
}
interface VreinRecommendationsParams {
    sectionId: string;
    context?: string;
}
declare function useVreinRecommendations(useQueryFn: QueryExecutor, queryDocument: unknown, { sectionId, context }: VreinRecommendationsParams): {
    data: VreinRecommendationsData | null;
    loading: boolean;
    error: string | null;
};

interface UseVreinImagesParams {
    sectionId: string;
    categoryId?: string;
    whitelabel?: string;
}
declare function useVreinImages(useQueryFn: QueryExecutor, queryDocument: unknown, { sectionId, categoryId, whitelabel, }: UseVreinImagesParams): {
    data: VreinImageBannerData | null;
    loading: boolean;
    error: string | null;
};

declare function useVreinMetrics({ cartId }?: {
    cartId?: string;
}): {
    trackCarouselRender: (carouselId: string, data: {
        sectionId: string;
        totalItems: number;
        title?: string;
        endpoint?: string;
        products?: Array<{
            productId: string;
            productName: string;
        }>;
    }) => void;
    trackCarouselClick: (carouselId: string, data: {
        sectionId: string;
        productId: string;
        productName: string;
        position: number;
        title?: string;
        endpoint?: string;
    }) => void;
    trackBannerRender: (data: {
        sectionId: string;
        totalImages: number;
        hasCountdown?: boolean;
    }) => void;
    trackBannerClick: (data: {
        sectionId: string;
        imageUrl?: string;
        link?: string;
    }) => void;
};
declare global {
    interface Window {
        VREIN_DEBUG?: boolean;
    }
}

type PageType = 'home' | 'product' | 'category' | 'search' | 'searchnoresult';
/**
 * @param sectionId - ID de la sección del carrusel
 * @param pageTypeOverride - Fuerza el pageType. Usar para SR/SNR donde ambas
 *   secciones están en la misma URL /s y detectPageType no puede distinguirlas.
 *   Pasar 'search' para secciones SR, 'searchnoresult' para SNR.
 */
declare function useVreinContext(sectionId: string, pageTypeOverride?: PageType): string;

/**
 * Hook que observa si un elemento está al menos `threshold` visible en el viewport.
 * Usa callback ref para capturar el nodo correctamente incluso si monta después de
 * un estado de carga (evita el problema de useRef + useEffect donde ref.current es null).
 * Se desconecta automáticamente al primer disparo (triggerOnce).
 */
declare function useInViewport(threshold?: number): {
    ref: (node: HTMLElement | null) => void;
    isVisible: boolean;
};

declare function useIsMobile(breakpoint?: number): boolean;

interface VreinLocation {
    pathname: string;
    search: string;
    key: string;
}
/**
 * SPA-aware location hook. Unlike a `popstate`-only listener, this also detects
 * client-side `history.pushState`/`replaceState` navigation (Next.js `router.push`,
 * `<Link>` clicks), which never fire `popstate`.
 *
 * Initializes to an empty location on the server and on the first client render —
 * the real value is resolved only inside `useEffect` (SSR/hydration safety, D7).
 *
 * Package-local, no `next/navigation` import: the package deliberately avoids a hard
 * Next.js runtime dependency (D6). A Next-runtime consumer can bypass this hook
 * entirely via the `routeKey` escape hatch on components that need one.
 */
declare function useCurrentLocation(): VreinLocation;

/**
 * Mount gate. Returns `false` on the server and on the first client render,
 * `true` thereafter. Used to defer any browser-only-dependent rendering until
 * after hydration, avoiding SSR/client markup mismatches (D7).
 */
declare function useHasMounted(): boolean;

interface VreinPopupQueryParams {
    section: string | null;
    context?: string;
    email?: string;
    whitelabel?: string;
}
/**
 * Query hook for the `vreinPopup` persisted GraphQL query, shaped like
 * `useVreinRecommendations` — injected `useQueryFn` + injected document,
 * `doNotRun` while `section` is unresolved, `isValidating` mapped to `loading`.
 */
declare function useVreinPopup(useQueryFn: QueryExecutor, queryDocument: unknown, { section, context, email, whitelabel }: VreinPopupQueryParams): {
    data: VreinPopupData | null;
    loading: boolean;
    error: string | null;
};

/**
 * Permanent, global (not per-section, not per-page) modal dismissal flag,
 * persisted in `localStorage` under `vrein_popup_dismissed_v1`.
 *
 * Only meaningful when `showOnce` is true (server already enforces
 * `showOnce = type === 'modal' && isFlagTrue(config.ShowOnce)` — this hook
 * never re-derives that gate, it only persists the outcome).
 *
 * Tri-state: `dismissed` is `null` until resolved inside `useEffect` (never a
 * `useState` lazy initializer) — SSR/hydration safety (D7). Every storage
 * access is guarded by `typeof window !== 'undefined'` AND `try/catch`; on
 * throw (e.g. Safari private mode) fails open to "not dismissed" without
 * crashing the page.
 */
declare function usePopupDismissal(showOnce: boolean, section: string): {
    dismissed: boolean | null;
    dismiss: () => void;
};

/**
 * Slider collapse UI state, persisted only in `sessionStorage` (per-tab, not
 * across a fresh page load) — the slider MUST NOT consult the ShowOnce/
 * dismissal gate at any point, and its collapse state MUST NOT survive a full
 * page reload (spec: "Slider collapse state is non-persistent").
 *
 * Tri-state: `collapsed` is `null` until resolved inside `useEffect` (never a
 * `useState` lazy initializer) — SSR/hydration safety (D7). Every storage
 * access is guarded by `typeof window !== 'undefined'` AND `try/catch`; on
 * throw, fails open to expanded (`false`) without crashing the page.
 */
declare function useSliderCollapse(): {
    collapsed: boolean | null;
    toggle: () => void;
};

/**
 * Resolves the current FastStore page into the uppercase SECTION vocabulary the
 * BrainDW backend expects.
 *
 * Fails closed to `null` on SSR and for any page type outside the mapping table.
 * `cart` and `checkout` are not reachable as mountable React routes in this
 * storefront (cart is a minicart slide-over; checkout is served outside the
 * Next application by VTEX) and therefore ship unmapped by design, not by
 * omission — see spec `popup-section-mapping`.
 *
 * `override` (the `sectionOverride` prop) and the `?vrein_popup_section=` query
 * param both bypass the mapping table entirely and are used verbatim, uppercased.
 * This is a QA/consumer-only escape hatch, never merchant-facing (D8) — the CMS
 * schema for this section stays empty so merchants never see it.
 */
declare function resolvePopupSection(override?: string): string | null;

/**
 * Sanitizes an API-supplied URL before it is ever rendered into an `href`.
 *
 * Permits only `http:`, `https:`, and site-relative (`/...`) URL forms; returns
 * `null` for anything else, notably `javascript:` schemes and protocol-relative
 * (`//host/...`) URLs. React escapes text content but not URL schemes, so an
 * unsanitized anchor is an XSS vector (design safety note #1).
 *
 * Pure function, no `window`/`document` access — safe to call during SSR.
 */
declare function safeHttpUrl(raw: string | null | undefined): string | null;

declare function vreinToProductSummary(item: VreinProduct): {
    id: string;
    slug: string;
    sku: string;
    name: string;
    gtin: string;
    unitMultiplier: number | null;
    brand: {
        name: string;
        id: string;
        imageUrl: string;
    };
    isVariantOf: {
        productGroupID: string;
        name: string;
        skuVariants: null;
    };
    image: any[];
    offers: {
        lowPrice: number;
        lowPriceWithTaxes: number;
        offers: {
            availability: string;
            price: number;
            listPrice: number;
            listPriceWithTaxes: number;
            priceWithTaxes: number;
            quantity: number;
            seller: {
                identifier: string;
            };
            installments: VreinInstallment[];
        }[];
    };
    additionalProperty: Array<{
        propertyID: string;
        name: string;
        value: unknown;
        valueReference: unknown;
    }>;
    advertisement: null;
};

interface ClientConfig {
    useH1Title: boolean;
    useH2Title: boolean;
    useGAImpressions: boolean;
    separateMercadoTracking: boolean;
    mercadoCategoryPath: string;
}
declare function getClientConfig(clientHash?: string): ClientConfig;
declare function getShelfTitleTag(clientHash?: string): 'h1' | 'h2' | 'div';

declare const VREIN_CONFIG: {
    readonly SESSION_COOKIE_NAME: "vrein_session";
    readonly SESSION_EXPIRY_DAYS: 30;
    readonly S2_URL: "https://s2.braindw.com";
    readonly P_URL: "https://p2.vrein.ai";
    readonly ABTEST_URL: "https://abtest.braindw.com";
    readonly GET_GUID_ENDPOINT: "/tracking/GetGuid";
    readonly CAPTURE_ENDPOINT: "/tracking/capture";
    readonly PERSISTENCE_ENDPOINT: "/api/data/capture";
    readonly ABTEST_ENDPOINT: "/api/abtest/events/capture";
    readonly MAX_LAST_PRODUCTS: 15;
    readonly CLICKED_PRODUCTS_MAX_HOURS: 3;
    readonly DEFAULT_SALES_CHANNEL: "1";
    readonly DEFAULT_CURRENCY: "ARS";
};
declare function getVreinConfig(): {
    clientKey: string;
    vreinHash: string;
    branchOffice: string;
};
declare const VREIN_ENV: {
    readonly CLIENT_KEY: string;
    readonly VREIN_HASH: string;
    readonly BRANCH_OFFICE: string;
};
declare function enableVreinDebug(): void;
declare function disableVreinDebug(): void;

export { type PageType$1 as PageType, type PopupSection, type PopupType, type QueryExecutor, type UseAnalyticsEventFn, VREIN_CONFIG, VREIN_ENV, type VreinAnalyticsEvent, type VreinBannerImage$1 as VreinBannerImageType, VreinCarousel, type VreinCarouselProps, type VreinDataLayerEvent, type VreinFullProduct, VreinImageBanner, type VreinImageBannerConnection, type VreinImageBannerData, type VreinImageBannerProps, VreinPopup, VreinPopupBlock, type VreinPopupBlock$1 as VreinPopupBlockType, type VreinPopupData, VreinPopupModal, type VreinPopupProps, type VreinPopupQueryParams, VreinPopupSlider, type VreinProduct, type VreinProductConnection, VreinProductItem, type VreinRecommendationsParams, type VreinSmartCountdown$1 as VreinSmartCountdownType, VreinTracking, type VreinTrackingProps, disableVreinDebug, enableVreinDebug, getClientConfig, getShelfTitleTag, getVreinConfig, resolvePopupSection, safeHttpUrl, useCurrentLocation, useHasMounted, useInViewport, useIsMobile, usePopupDismissal, useSliderCollapse, useVreinContext, useVreinImages, useVreinMetrics, useVreinPopup, useVreinRecommendations, vreinToProductSummary };
