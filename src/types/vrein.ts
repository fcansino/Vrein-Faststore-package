export interface VreinBrand {
  name: string;
  id: string;
  imageUrl: string;
}

export interface VreinImage {
  url: string;
  alternateName: string;
}

export interface VreinInstallment {
  Value: number;
  InterestRate: number;
  TotalValuePlusInterestRate: number;
  NumberOfInstallments: number;
  PaymentSystemName: string;
  PaymentSystemGroupName: string;
  Name: string;
}

export interface VreinOffer {
  price: number;
  listPrice: number;
  availability: string;
  installments: VreinInstallment[];
}

export interface VreinOffers {
  offers: VreinOffer[];
}

export interface VreinProductGroup {
  productGroupID: string;
  name: string;
}

export interface VreinProduct {
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

export interface VreinProductConnection {
  products: VreinProduct[];
  totalCount: number;
  title: string;
  endpointName: string;
  apiUrl: string;
}

export interface VreinBannerImage {
  title: string;
  image: string;
  mobileImage: string;
  link: string;
}

export interface VreinSmartCountdown {
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

export interface VreinImageBannerConnection {
  images: VreinBannerImage[];
  smartCountdown: VreinSmartCountdown | null;
}

export interface VreinImageBannerData {
  images: VreinBannerImage[];
  smartCountdown: VreinSmartCountdown | null;
}

export interface VreinFullProduct {
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

export interface VreinCategoryResult {
  categoryId: string;
}

export type PopupSection = "HOME" | "PDP" | "PLP" | "SEARCH";
export type PopupType = "modal" | "slider";
// Named PopupBlockContentType (not "VreinPopupBlockType") to avoid clashing
// with the `VreinPopupBlock as VreinPopupBlockType` alias `index.ts` already
// exports for the block *record* interface below.
export type PopupBlockContentType = "products" | "images";

export interface VreinPopupImage {
  link: string;
  urlDesktop: string;
  urlMobile: string;
}

export interface VreinPopupBlock {
  blockId: string;
  title: string;
  link: string;
  gaEventAction: string;
  gaEventCategory: string;
  gaEventLabel: string;
  blockType: PopupBlockContentType;
  products: VreinProduct[];
  images: VreinPopupImage[];
}

export interface VreinPopupData {
  section: string;
  type: PopupType;
  showOnce: boolean;
  blocks: VreinPopupBlock[];
  apiUrl: string;
}
