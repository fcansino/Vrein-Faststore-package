import * as react_jsx_runtime from 'react/jsx-runtime';
export { createVreinApiHandler, createVreinRouteHandlers, vreinResolvers, vreinTypeDefs } from './graphql.js';

type VreinCarouselProps = {
    /** ID de la sección específica de Vrein (ej: BDW-HOME-Carrusel-1) */
    sectionId: string;
    /** Optional ProductCard override config from the consumer project */
    productCardOverride?: {
        Component: React.ComponentType<any>;
        props?: Record<string, any>;
    } | null;
};

declare const VreinCarousel: ({ sectionId, productCardOverride, }: VreinCarouselProps) => react_jsx_runtime.JSX.Element | null;

interface VreinImageBannerProps {
    sectionId: string;
    pageContext?: string;
    height?: number;
    showArrows?: boolean;
    showDots?: boolean;
    autoplay?: boolean;
    showLazyLoading?: boolean;
    lazyLoadingHeight?: number;
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

declare const VreinImageBanner: ({ sectionId, height, showLazyLoading, lazyLoadingHeight, }: VreinImageBannerProps) => react_jsx_runtime.JSX.Element | null;

interface VreinBrand {
    name: string;
}
interface VreinImage {
    url: string;
    alternateName: string;
}
interface VreinOffer {
    price: number;
    listPrice: number;
    availability: string;
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

type VreinProductItemProps = {
    item: VreinProduct;
    bordered?: boolean;
    showDiscountBadge?: boolean;
    position?: number;
    onProductClick?: (productId: string, productName: string, position: number) => void;
};
declare const VreinProductItem: ({ item, bordered, showDiscountBadge, position, onProductClick, }: VreinProductItemProps) => react_jsx_runtime.JSX.Element;

interface VreinRecommendationsData {
    products: VreinProduct[];
    title: string;
    endpointName: string;
}
interface VreinRecommendationsParams {
    sectionId: string;
    context?: string;
}
declare function useVreinRecommendations({ sectionId, context, }: VreinRecommendationsParams): {
    data: VreinRecommendationsData | null;
    loading: boolean;
    error: string | null;
};

interface UseVreinImagesParams {
    sectionId: string;
    categoryId?: string;
    whitelabel?: string;
}
declare function useVreinImages({ sectionId, categoryId, whitelabel, }: UseVreinImagesParams): {
    data: VreinImageBannerData | null;
    loading: boolean;
    error: string | null;
};

declare function useVreinMetrics(): {
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
    }) => void;
    trackABTestVariation: (testId: string, data: {
        variation: string;
        componentName: string;
    }) => void;
    trackCustomMetric: (eventName: string, data: Record<string, any>) => void;
};
declare global {
    interface Window {
        VREIN_DEBUG?: boolean;
    }
}

declare function useVreinContext(sectionId: string): string;

declare function vreinToProductSummary(item: VreinProduct): {
    id: string;
    slug: string;
    sku: string;
    name: string;
    gtin: string;
    unitMultiplier: number | null;
    brand: {
        name: string;
        brandName: string;
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

/**
 * Override the default Vrein API endpoint.
 * Call this once at app startup if you mount the handler at a different path.
 *
 * @example setVreinApiEndpoint('/api/custom-vrein')
 */
declare function setVreinApiEndpoint(endpoint: string): void;

export { VREIN_CONFIG, VREIN_ENV, type VreinBannerImage$1 as VreinBannerImageType, VreinCarousel, type VreinCarouselProps, type VreinFullProduct, VreinImageBanner, type VreinImageBannerConnection, type VreinImageBannerData, type VreinImageBannerProps, type VreinProduct, type VreinProductConnection, VreinProductItem, type VreinRecommendationsParams, type VreinSmartCountdown$1 as VreinSmartCountdownType, disableVreinDebug, enableVreinDebug, getClientConfig, getShelfTitleTag, getVreinConfig, setVreinApiEndpoint, useVreinContext, useVreinImages, useVreinMetrics, useVreinRecommendations, vreinToProductSummary };
