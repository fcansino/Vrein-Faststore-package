declare const vreinResolvers: {
    Query: {
        vreinProducts: (_: any, { sectionId, context }: any, ctx: any) => Promise<{
            products: any[];
            totalCount: number;
            title: any;
            endpointName: any;
            apiUrl: string;
        }>;
        vreinImages: (_: any, { sectionId, email, categoryId, whitelabel, sessionGuid }: any) => Promise<{
            images: any;
            smartCountdown: {
                dateStart: any;
                dateEnd: any;
                fontSizeDesktop: any;
                fontSizeMobile: any;
                positionDesktop: any;
                positionMobile: any;
                fontColor: any;
                enabled: any;
                timeZoneOffset: any;
            } | null;
        }>;
        vreinProductData: (_: any, { productId, skuId }: any) => Promise<{
            id: string;
            sku: string;
            slug: string;
            name: string;
            description: string;
            brand: {
                name: string;
                id: string;
                imageUrl: string;
            };
            categories: any;
            categoryIds: string;
            categoryNames: any;
            offers: {
                offers: {
                    price: number;
                    listPrice: number;
                    availability: string;
                    installments: any;
                }[];
            };
            price: number;
            listPrice: number;
            availability: string;
            image: any;
            url: string;
            clusterHighlights: any;
            productClusters: any;
            allSpecifications: any;
            allSpecificationsGroups: any;
        } | null>;
        vreinCategoryId: (_: any, { pathname }: any) => Promise<{
            categoryId: string;
        }>;
    };
};

declare const vreinTypeDefs = "\ntype VreinProduct {\n  id: String!\n  sku: String!\n  slug: String!\n  name: String!\n  brand: VreinBrand!\n  categories: String\n  categoryIds: String\n  image: [VreinImage!]!\n  offers: VreinOffers!\n  isVariantOf: VreinProductGroup!\n}\n\ntype VreinBrand {\n  name: String!\n}\n\ntype VreinImage {\n  url: String!\n  alternateName: String!\n}\n\ntype VreinOffers {\n  offers: [VreinOffer!]!\n}\n\ntype VreinInstallment {\n  Value: Float!\n  InterestRate: Float!\n  TotalValuePlusInterestRate: Float!\n  NumberOfInstallments: Int!\n  PaymentSystemName: String!\n  PaymentSystemGroupName: String!\n  Name: String!\n}\n\ntype VreinOffer {\n  price: Float!\n  listPrice: Float!\n  availability: String!\n  installments: [VreinInstallment!]!\n}\n\ntype VreinProductGroup {\n  productGroupID: String!\n  name: String!\n}\n\ntype VreinProductConnection {\n  products: [VreinProduct!]!\n  totalCount: Int!\n  title: String!\n  endpointName: String!\n  apiUrl: String!\n}\n\ntype VreinFullProduct {\n  id: String!\n  sku: String!\n  slug: String!\n  name: String!\n  description: String\n  brand: String!\n  categories: String\n  categoryIds: String\n  categoryNames: String\n  price: Float!\n  listPrice: Float!\n  availability: String!\n  image: String!\n  url: String!\n}\n\ntype VreinBannerImage {\n  title: String\n  image: String!\n  mobileImage: String\n  link: String\n}\n\ntype VreinSmartCountdown {\n  dateStart: String\n  dateEnd: String!\n  fontSizeDesktop: Int\n  fontSizeMobile: Int\n  positionDesktop: String\n  positionMobile: String\n  fontColor: String\n  enabled: Boolean!\n  timeZoneOffset: Int\n}\n\ntype VreinImageBannerConnection {\n  images: [VreinBannerImage!]!\n  smartCountdown: VreinSmartCountdown\n}\n\ntype VreinCategoryResult {\n  categoryId: String!\n}\n\ntype VreinPopupBlock {\n  blockId: String!\n  title: String!\n  link: String!\n  gaEventAction: String!\n  gaEventCategory: String!\n  gaEventLabel: String!\n  products: [VreinProduct!]!\n}\n\ntype VreinPopupData {\n  section: String!\n  type: String!\n  showOnce: Boolean!\n  blocks: [VreinPopupBlock!]!\n  apiUrl: String!\n}\n\nextend type Query {\n  vreinProducts(sectionId: String!, context: String): VreinProductConnection!\n  vreinProductData(productId: String, skuId: String): VreinFullProduct\n  vreinImages(sectionId: String!, email: String, categoryId: String, whitelabel: String, sessionGuid: String): VreinImageBannerConnection!\n  vreinCategoryId(pathname: String!): VreinCategoryResult!\n  vreinPopup(section: String!, context: String, email: String, whitelabel: String): VreinPopupData\n}\n";

export { vreinResolvers, vreinTypeDefs };
