// Re-export the resolver from the original source.
// The consumer project should import this and register it in their GraphQL setup.
// This file contains the full server-side resolver logic.

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const vreinResponseCache = new Map<string, CacheEntry<any[]>>();
const skuProductCache = new Map<string, CacheEntry<any>>();
const vreinPopupConfigCache = new Map<string, CacheEntry<any>>();
const vreinPopupContentCache = new Map<string, CacheEntry<any>>();
const vreinPopupImageContentCache = new Map<string, CacheEntry<any>>();

const VREIN_CACHE_TTL_MS = Number(process.env.VREIN_CACHE_TTL_MS) || 60_000;
const VTEX_CACHE_TTL_MS = Number(process.env.VTEX_CACHE_TTL_MS) || 300_000;
const VREIN_POPUP_CONFIG_TTL_MS =
  Number(process.env.VREIN_POPUP_CONFIG_TTL_MS) || 120_000;
const VREIN_POPUP_CONTENT_TTL_MS =
  Number(process.env.VREIN_POPUP_CONTENT_TTL_MS) || 300_000;
const MAX_CACHE_SIZE = 500;
const BATCH_SIZE = 20;

const VREIN_BRANCH_OFFICE = "1";
const VREIN_SECRET =
  process.env.VREIN_SECRET || "9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3";

// Popup endpoint host — still in QA on the Vrein backend side as of this change,
// not a placeholder. Overridable via env so the eventual QA -> production cutover
// is a config change, not a package release.
const VREIN_POPUP_BASE_URL =
  process.env.NEXT_PUBLIC_VREIN_POPUP_URL ||
  process.env.VREIN_POPUP_URL ||
  "https://script-qa.vrein.ai";

function getCached<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  data: T,
  ttlMs: number,
): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function buildVreinU(
  context: string,
  vtexAccount: string,
): Promise<string> {
  let parsed: any;
  try {
    parsed = JSON.parse(context);
  } catch {
    return context || "home//";
  }

  const {
    pageType,
    productId,
    categoryId,
    searchTerm,
    lastProducts = "",
    lastSku = "",
    lastCategory = "",
    cartProducts = "",
    queryTerm = "",
    zipcode = "",
  } = parsed;

  const zipcodeParam = zipcode ? `/${zipcode}` : "";

  switch (pageType) {
    case "home": {
      const queryLogic = queryTerm || "";
      return `/home/1/${lastCategory}/${lastProducts}/${cartProducts}/${queryLogic}${zipcodeParam}`;
    }

    case "product": {
      if (!productId) {
        return `/home/1/${lastCategory}/${lastProducts}/${cartProducts}/${queryTerm || ""}${zipcodeParam}`;
      }

      let directCat = "";
      let indirectCat = "";
      let allCatIds = "";

      let filteredLastProducts = lastProducts;
      if (lastProducts) {
        const prodArray = lastProducts
          .split(",")
          .filter((id: string) => id !== String(productId));
        filteredLastProducts = prodArray.join(",");
      }

      try {
        const catalogUrl = `https://${vtexAccount}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${productId}`;
        const res = await fetch(catalogUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.[0]?.categoriesIds?.[0]) {
            const rawPath = data[0].categoriesIds[0] as string;
            const categorias = rawPath
              .substring(1, rawPath.length - 1)
              .split("/");
            directCat = categorias[categorias.length - 1] || "";
            indirectCat =
              categorias.length < 3
                ? categorias[0] || ""
                : categorias[categorias.length - 2] || "";
            allCatIds = categorias.join(",");
          }
        }
      } catch (err) {
        console.warn(
          "[Vrein Resolver] Failed to fetch product categories:",
          err,
        );
      }

      return `product/${productId}/${directCat}/${indirectCat}/${allCatIds}/${filteredLastProducts}/${lastSku}/${cartProducts}${zipcodeParam}`;
    }

    case "category":
      return `/category/${categoryId || lastCategory}//${lastProducts}/${cartProducts}${zipcodeParam}`;

    case "search":
      return `/search/${searchTerm || ""}/${lastCategory}${zipcodeParam}`;

    case "searchnoresult":
      return `/searchnoresult/${searchTerm || ""}/${lastCategory}${zipcodeParam}`;

    default:
      return `/home/1/${lastCategory}/${lastProducts}/${cartProducts}/${queryTerm || ""}${zipcodeParam}`;
  }
}

function transformToFastStoreProduct(vtexProduct: any, targetSkuId?: string) {
  try {
    if (!vtexProduct || !vtexProduct.items || vtexProduct.items.length === 0) {
      return null;
    }

    let targetItem = vtexProduct.items[0];
    if (targetSkuId) {
      const match = vtexProduct.items.find(
        (item: any) => String(item.itemId) === String(targetSkuId),
      );
      if (match) targetItem = match;
    } else {
      const inStockItem = vtexProduct.items.find(
        (item: any) =>
          (item.sellers?.[0]?.commertialOffer?.AvailableQuantity || 0) > 0,
      );
      if (inStockItem) targetItem = inStockItem;
    }

    const seller = targetItem.sellers?.[0];
    const offer = seller?.commertialOffer;

    if (!offer) return null;

    const imageUrl = targetItem.images?.[0]?.imageUrl || "";
    const cleanImageUrl = imageUrl.replace(/-55-55/g, "-300-300");

    const categories = vtexProduct.categories || [];
    const categoryPath = categories[0] || "";
    const categoryIds = (vtexProduct.categoriesIds || []).join(",");

    // console.log("VTEX PRODUCT FASTSTORE", vtexProduct);

    return {
      id: String(vtexProduct.productId || ""),
      sku: String(targetItem.itemId || ""),
      slug: String(vtexProduct.linkText || vtexProduct.productId || ""),
      name: String(vtexProduct.productName || "Producto sin nombre"),
      brand: {
        name: String(vtexProduct.brand || "Sin marca"),
        id: String(vtexProduct.brandId || ""),
        imageUrl: String(vtexProduct.brandImageUrl || ""),
      },
      categories: categoryPath,
      categoryIds: categoryIds,
      image: [
        {
          url: cleanImageUrl || "https://via.placeholder.com/300x300",
          alternateName: String(vtexProduct.productName || "Producto"),
        },
      ],
      offers: {
        offers: [
          {
            price: Number(offer.Price) || 0,
            listPrice: Number(offer.ListPrice || offer.Price) || 0,
            availability:
              offer.AvailableQuantity > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            installments: Array.isArray(offer.Installments)
              ? offer.Installments
              : [],
          },
        ],
      },
      isVariantOf: {
        productGroupID: String(vtexProduct.productId || ""),
        name: String(vtexProduct.productName || "Producto sin nombre"),
      },
    };
  } catch (error) {
    console.error("[Vrein Resolver] Error transforming product:", error);
    return null;
  }
}

function transformToFullProduct(vtexProduct: any) {
  try {
    if (!vtexProduct || !vtexProduct.items || vtexProduct.items.length === 0) {
      return null;
    }

    const firstItem = vtexProduct.items[0];
    const seller = firstItem.sellers?.[0];
    const offer = seller?.commertialOffer;

    const imageUrl = firstItem.images?.[0]?.imageUrl || "";
    const cleanImageUrl = imageUrl.replace(/-55-55/g, "-300-300");

    const categories = vtexProduct.categories || [];
    const categoryPath = categories[0] || "";
    const rawCatPath: string = (vtexProduct.categoriesIds || [])[0] || "";
    const categoryIds = rawCatPath
      ? rawCatPath.substring(1, rawCatPath.length - 1).replace(/\//g, ",")
      : "";

    const categoryNames = categories
      .map((cat: string) => cat.replace(/^\//, "").replace(/\/$/, ""))
      .join(" > ");

    // console.log("VTEX PRODUCT FULL", vtexProduct);

    return {
      id: String(vtexProduct.productId || ""),
      sku: String(firstItem.itemId || ""),
      slug: String(vtexProduct.linkText || ""),
      name: String(vtexProduct.productName || ""),
      description: String(vtexProduct.description || ""),
      brand: {
        name: String(vtexProduct.brand || "Sin marca"),
        id: String(vtexProduct.brandId || ""),
        imageUrl: String(vtexProduct.brandImageUrl || ""),
      },
      categories: categoryPath,
      categoryIds: categoryIds,
      categoryNames: categoryNames,
      offers: {
        offers: [
          {
            price: Number(offer?.Price) || 0,
            listPrice: Number(offer?.ListPrice || offer?.Price) || 0,
            availability:
              offer?.AvailableQuantity > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            installments: Array.isArray(offer?.Installments)
              ? offer.Installments
              : [],
          },
        ],
      },
      price: Number(offer?.Price) || 0,
      listPrice: Number(offer?.ListPrice || offer?.Price) || 0,
      availability: offer?.AvailableQuantity > 0 ? "InStock" : "OutOfStock",
      image: cleanImageUrl,
      url: `/${vtexProduct.linkText}/p`,
      clusterHighlights: vtexProduct.clusterHighlights || {},
      productClusters: vtexProduct.productClusters || {},
      allSpecifications: vtexProduct.allSpecifications || [],
      allSpecificationsGroups: vtexProduct.allSpecificationsGroups || [],
    };
  } catch (error) {
    console.error("[Vrein Resolver] Error transforming full product:", error);
    return null;
  }
}

async function resolveVtexProductsByIds(
  productIds: string[],
  vtexAccount: string,
): Promise<any[]> {
  const cachedProducts: Map<string, any> = new Map();
  const fetchNeeded: string[] = [];

  for (const productId of productIds) {
    const cached = getCached<any>(skuProductCache, productId);
    if (cached) {
      cachedProducts.set(productId, cached);
    } else {
      fetchNeeded.push(productId);
    }
  }

  const fetchedProducts: Map<string, any> = new Map();

  if (fetchNeeded.length > 0) {
    const chunks = chunkArray(fetchNeeded, BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      chunks.map(async (chunk) => {
        const fqParams = chunk
          .map((productId) => `fq=productId:${productId}`)
          .join("&");
        const url = `https://${vtexAccount}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${fqParams}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status} for batch of ${chunk.length} productIds`,
          );
        }

        const products: any[] = await response.json();
        return { chunk, products };
      }),
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        const { chunk, products } = result.value;

        const productIdToProduct = new Map<string, any>();
        for (const vtexProduct of products) {
          if (!vtexProduct?.productId) continue;
          if (chunk.includes(String(vtexProduct.productId))) {
            productIdToProduct.set(
              String(vtexProduct.productId),
              vtexProduct,
            );
          }
        }

        for (const productId of chunk) {
          const vtexProduct = productIdToProduct.get(productId);
          if (!vtexProduct) continue;

          const transformed = transformToFastStoreProduct(vtexProduct);
          if (transformed) {
            setCached(
              skuProductCache,
              productId,
              transformed,
              VTEX_CACHE_TTL_MS,
            );
            fetchedProducts.set(productId, transformed);
          }
        }
      } else {
        console.warn(
          "[Vrein Resolver] Batch fetch failed:",
          result.reason?.message || result.reason,
        );
      }
    }
  }

  const products: any[] = [];
  for (const productId of productIds) {
    const product =
      cachedProducts.get(productId) || fetchedProducts.get(productId);
    if (product) {
      const availability = product.offers?.offers?.[0]?.availability;
      if (availability === "https://schema.org/InStock") {
        products.push(product);
      }
    }
  }

  console.log(
    "[Vrein Resolver] Successfully fetched",
    products.length,
    "in-stock products",
  );

  return products;
}

// String-typed boolean flags from BrainDW arrive as "True"/"False" strings, not
// booleans. Boolean(v) and empty(v)-style checks both silently invert this gate —
// only the literal string "true" (case-insensitive, trimmed) counts as set.
function isFlagTrue(value: unknown): boolean {
  return String(value ?? "")
    .trim()
    .toLowerCase() === "true";
}

// Expiration gates AvailableFrom/AvailableTo. When Expiration is not the literal
// string "true", the window is ignored entirely, even if populated — deliberate
// and counterintuitive, ported as-is from the reference implementation.
function isWithinPopupAvailabilityWindow(
  config: {
    Expiration?: unknown;
    AvailableFrom?: unknown;
    AvailableTo?: unknown;
  },
  now: number,
): boolean {
  if (!isFlagTrue(config.Expiration)) {
    return true;
  }

  const availableFrom = config.AvailableFrom
    ? Date.parse(String(config.AvailableFrom))
    : NaN;
  if (!Number.isNaN(availableFrom) && now < availableFrom) {
    return false;
  }

  const availableTo = config.AvailableTo
    ? Date.parse(String(config.AvailableTo))
    : NaN;
  if (!Number.isNaN(availableTo) && now > availableTo) {
    return false;
  }

  return true;
}

// Both /tracking/modalblock and /tracking/track return either a bare object
// or a one-item array. Normalize both shapes to a single object, and to null
// when empty or malformed.
function normalizePopupApiResponse(raw: any): any | null {
  if (Array.isArray(raw)) {
    return raw.length > 0 ? raw[0] : null;
  }
  if (raw && typeof raw === "object") {
    return raw;
  }
  return null;
}

// A popup block is content from either /tracking/track (products) or
// /tracking/smartimage (banner images) — two different endpoints, so the
// choice has to be made *before* fetching anything. The only signal
// available at that point is the BrainDW blockId naming convention, e.g.
// "BDW-HOME-IMAGES-PU1" vs "BDW-Home-Carrusel-PU1" (confirmed against the
// live modalblock config for HOME). The response body's own `Type` field
// ("images" vs "products") is authoritative but only exists *after* the
// fetch, so it is used as a post-fetch safety net below (fails closed to
// null on a mismatch) rather than as the dispatch signal itself.
const VREIN_IMAGE_BLOCK_ID_PATTERN = /IMAGES/i;
function isImageBlockId(blockId: string): boolean {
  return VREIN_IMAGE_BLOCK_ID_PATTERN.test(blockId);
}

export const vreinResolvers = {
  Query: {
    vreinProducts: async (_: any, { sectionId, context }: any, ctx: any) => {
      try {
        const VREIN_HASH =
          process.env.NEXT_PUBLIC_VREIN_HASH || process.env.VREIN_HASH;
        if (!VREIN_HASH) {
          throw new Error(
            "[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.",
          );
        }

        console.log(
          "[Vrein Resolver] Fetching recommendations for section:",
          sectionId,
        );

        const VREIN_API_URL = "https://s2.braindw.com/tracking/track";
        const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT || "brain";

        let sessionGuid = "";
        let path = "/";
        try {
          const ctxParsed = JSON.parse(context || "{}");
          sessionGuid = ctxParsed.sessionGuid || "";
          path = ctxParsed.path || "/";
        } catch {
          // ignore
        }

        const contextParam = await buildVreinU(
          context || "home//",
          VTEX_ACCOUNT,
        );
        console.log("[Vrein Resolver] Built u param:", contextParam);

        const timestamp = Date.now();
        const vreinUrl = `${VREIN_API_URL}?HASH=${VREIN_HASH}&branchOffice=${VREIN_BRANCH_OFFICE}&u=${encodeURIComponent(contextParam)}&hs=${timestamp}&upath=${encodeURIComponent(path)}&sectionId=${encodeURIComponent(sectionId)}`;

        const vreinCacheKey = `${VREIN_HASH}:${VREIN_BRANCH_OFFICE}:${sectionId}:${contextParam}`;
        let vreinData = getCached<any[]>(vreinResponseCache, vreinCacheKey);

        if (vreinData) {
          console.log(
            "[Vrein Resolver] Vrein API cache HIT for key:",
            vreinCacheKey,
          );
        } else {
          console.log("[Vrein Resolver] Calling Vrein API:", vreinUrl);

          const cookies = sessionGuid ? ` guid=${sessionGuid}; ` : "";

          const vreinResponse = await fetch(vreinUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(VREIN_SECRET
                ? {
                    bdw_secretcode: VREIN_SECRET,
                    "bdw-secretcode": VREIN_SECRET,
                  }
                : {}),
              bdw_sectionid: sectionId,
              "X-VTEX-Use-Https": "true",
              ...(cookies ? { Cookie: cookies } : {}),
            },
          });

          if (!vreinResponse.ok) {
            console.error(
              "[Vrein Resolver] Vrein API error:",
              vreinResponse.status,
            );
            return {
              products: [],
              totalCount: 0,
              title: "",
              endpointName: "",
              apiUrl: vreinUrl,
            };
          }

          vreinData = await vreinResponse.json();
          setCached(
            vreinResponseCache,
            vreinCacheKey,
            vreinData!,
            VREIN_CACHE_TTL_MS,
          );
        }

        const sections = vreinData as any[];

        const sectionIdLower = sectionId.toLowerCase();
        const section = sections.find(
          (item: any) => item.Section?.toLowerCase() === sectionIdLower,
        );

        if (!section || !section.Products || section.Products.length === 0) {
          console.warn(
            "[Vrein Resolver] Section not found or empty:",
            sectionId,
          );
          return {
            products: [],
            totalCount: 0,
            title: "",
            endpointName: "",
            apiUrl: vreinUrl,
          };
        }

        const productIds: string[] = section.Products;

        const products = await resolveVtexProductsByIds(
          productIds,
          VTEX_ACCOUNT,
        );

        return {
          products,
          totalCount: products.length,
          title: section.Title || "",
          endpointName: section.Endpoint || "Contenidos",
          apiUrl: vreinUrl,
        };
      } catch (error) {
        console.error("[Vrein Resolver] Error:", error);
        return {
          products: [],
          totalCount: 0,
          title: "",
          endpointName: "",
          apiUrl: "",
        };
      }
    },

    vreinImages: async (
      _: any,
      { sectionId, email, categoryId, whitelabel, sessionGuid }: any,
    ) => {
      try {
        const VREIN_HASH =
          process.env.NEXT_PUBLIC_VREIN_HASH || process.env.VREIN_HASH;
        if (!VREIN_HASH) {
          throw new Error(
            "[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.",
          );
        }

        const params = new URLSearchParams({
          HASH: VREIN_HASH,
          email: email || "",
          branchOffice: VREIN_BRANCH_OFFICE,
          whitelabel: whitelabel || "",
          sectionid: sectionId,
          idcategory: categoryId || "",
        });

        const url = `https://s2.braindw.com/tracking/SmartImage?${params}`;

        const cookies = sessionGuid ? `guid=${sessionGuid};` : "";

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-VTEX-Use-Https": "true",
            "Cache-Control": "no-store",
            ...(VREIN_SECRET ? { "bdw-secretcode": VREIN_SECRET } : {}),
            ...(cookies ? { Cookie: cookies } : {}),
          },
        });

        if (!response.ok) {
          console.error(
            "[Vrein Resolver] SmartImage API error:",
            response.status,
          );
          return { images: [], smartCountdown: null };
        }

        const data = await response.json();

        if (!data || data.length === 0 || !data[0]?.Images) {
          return { images: [], smartCountdown: null };
        }

        const section = data[0];

        const images = section.Images.map((img: any) => ({
          title: section.Title || "",
          image: img.UrlDesktop || "",
          mobileImage: img.UrlMobile || "",
          link: img.Link || "",
        }));

        const smartCountdown = section.SmartCountdown
          ? {
              dateStart: section.SmartCountdown.DateStart || "",
              dateEnd: section.SmartCountdown.DateEnd || "",
              fontSizeDesktop: section.SmartCountdown.FontSizeDesktop || 20,
              fontSizeMobile: section.SmartCountdown.FontSizeMobile || 14,
              positionDesktop: section.SmartCountdown.PositionDesktop || "2.2",
              positionMobile: section.SmartCountdown.PositionMobile || "2.2",
              fontColor: section.SmartCountdown.FontColor || "white",
              enabled: section.SmartCountdown.Enabled || false,
              timeZoneOffset: section.SmartCountdown.TimeZoneOffset || 0,
            }
          : null;

        return { images, smartCountdown };
      } catch (error) {
        console.error("[Vrein Resolver] Error fetching images:", error);
        return { images: [], smartCountdown: null };
      }
    },

    vreinProductData: async (_: any, { productId, skuId }: any) => {
      try {
        const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT || "brain";

        let url = "";
        if (skuId) {
          url = `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${skuId}`;
        } else if (productId) {
          url = `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${productId}`;
        } else {
          return null;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (!data || data.length === 0) return null;

        return transformToFullProduct(data[0]);
      } catch (error) {
        console.error("[Vrein Resolver] Error fetching product data:", error);
        return null;
      }
    },

    vreinCategoryId: async (_: any, { pathname }: any) => {
      try {
        const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT || "brain";
        const parts = (pathname || "").split("/").filter(Boolean);

        if (parts.length === 0) return { categoryId: "" };

        const depth = Math.max(parts.length, 3);
        const treeUrl = `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${depth}`;
        const res = await fetch(treeUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) return { categoryId: "" };

        const tree = await res.json();

        let currentLevel = tree;
        let found: any = null;

        for (const slug of parts) {
          found = currentLevel.find((cat: any) => {
            const catUrl = cat.url || "";
            const catSlug = catUrl.split("/").filter(Boolean).pop() || "";
            return slug.toLowerCase() === catSlug.toLowerCase();
          });

          if (!found) break;
          currentLevel = found.children || [];
        }

        return { categoryId: found ? String(found.id) : "" };
      } catch (error) {
        console.error("[Vrein Resolver] Error resolving categoryId:", error);
        return { categoryId: "" };
      }
    },

    vreinPopup: async (_: any, { section, context, email }: any) => {
      // `whitelabel` is intentionally not read from args here: it is a
      // non-configurable constant (always sent empty) for both BrainDW popup
      // calls, per design decision D2/D12.
      try {
        const VREIN_HASH =
          process.env.NEXT_PUBLIC_VREIN_HASH || process.env.VREIN_HASH;
        if (!VREIN_HASH) {
          throw new Error(
            "[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.",
          );
        }

        const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT || "brain";
        const emailParam = email || "";

        let sessionGuid = "";
        try {
          const ctxParsed = JSON.parse(context || "{}");
          sessionGuid = ctxParsed.sessionGuid || "";
        } catch {
          // ignore
        }
        const cookies = sessionGuid ? `guid=${sessionGuid};` : "";

        const popupHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(VREIN_SECRET
            ? {
                bdw_secretcode: VREIN_SECRET,
                "bdw-secretcode": VREIN_SECRET,
              }
            : {}),
          "X-VTEX-Use-Https": "true",
          ...(cookies ? { Cookie: cookies } : {}),
        };

        // Step 1: GET /tracking/modalblock — config for this section.
        const configParams = new URLSearchParams({
          HASH: VREIN_HASH,
          email: emailParam,
          branchOffice: VREIN_BRANCH_OFFICE,
          whitelabel: "",
          sectionid: section.toLowerCase(),
        });
        const modalblockUrl = `${VREIN_POPUP_BASE_URL}/tracking/modalblock?${configParams}`;

        const configCacheKey = `${VREIN_HASH}:${VREIN_BRANCH_OFFICE}:${section}:${emailParam}`;
        let config = getCached<any>(vreinPopupConfigCache, configCacheKey);

        if (!config) {
          const configResponse = await fetch(modalblockUrl, {
            method: "GET",
            headers: popupHeaders,
          });

          if (!configResponse.ok) {
            console.warn(
              "[Vrein Resolver] Popup modalblock API error:",
              configResponse.status,
            );
            return null;
          }

          config = normalizePopupApiResponse(await configResponse.json());
          setCached(
            vreinPopupConfigCache,
            configCacheKey,
            config,
            VREIN_POPUP_CONFIG_TTL_MS,
          );
        }

        if (!config) {
          console.warn(
            "[Vrein Resolver] Popup no modalblock config for section:",
            section,
          );
          return null;
        }

        // Gate (b): Type validated against the closed set, case-sensitive —
        // absent/empty/unrecognized values fail closed, no track call made.
        const type = typeof config.Type === "string" ? config.Type : "";
        if (type !== "modal" && type !== "slider") {
          console.warn(
            "[Vrein Resolver] Popup invalid or unrecognized type:",
            config.Type,
          );
          return null;
        }

        // Gates (c)+(d): availability window, evaluated live against the
        // server clock — never from a cached decision.
        if (!isWithinPopupAvailabilityWindow(config, Date.now())) {
          return null;
        }

        // ShowOnce is modal-only, enforced server-side, always false for slider.
        const showOnce = type === "modal" && isFlagTrue(config.ShowOnce);

        const blockIds: string[] = [config.Block1, config.Block2].filter(
          (id: unknown): id is string =>
            typeof id === "string" && id.trim() !== "",
        );

        if (blockIds.length === 0) {
          console.warn(
            "[Vrein Resolver] Popup no blocks configured for section:",
            section,
          );
          return null;
        }

        let u = await buildVreinU(context || "home//", VTEX_ACCOUNT);
        if (!u) {
          // Defensive only: buildVreinU cannot structurally return empty, but
          // the popup content endpoint 500s on an empty u, so guard anyway.
          u = "home//";
        }

        // Step 2: one GET per block — /tracking/smartimage for image blocks,
        // /tracking/track for product blocks — parallel and failure-isolated,
        // a single failing block must never abort the rest. Block order
        // (Block1, Block2 as configured) is preserved via blockIds.map.
        const blockResults = await Promise.allSettled(
          blockIds.map(async (blockId) => {
            if (isImageBlockId(blockId)) {
              const smartImageParams = new URLSearchParams({
                HASH: VREIN_HASH,
                email: emailParam,
                branchOffice: VREIN_BRANCH_OFFICE,
                whitelabel: "",
                sectionId: blockId,
                u,
              });
              const smartImageUrl = `${VREIN_POPUP_BASE_URL}/tracking/smartimage?${smartImageParams}`;

              const imageContentCacheKey = `${VREIN_HASH}:${blockId}:${section}:${emailParam}:${u}`;
              let content = getCached<any>(
                vreinPopupImageContentCache,
                imageContentCacheKey,
              );

              if (!content) {
                const smartImageResponse = await fetch(smartImageUrl, {
                  method: "GET",
                  headers: popupHeaders,
                });

                if (!smartImageResponse.ok) {
                  console.warn(
                    "[Vrein Resolver] Popup smartimage API error for block:",
                    blockId,
                    smartImageResponse.status,
                  );
                  return null;
                }

                const rawBody = await smartImageResponse.json();
                content = normalizePopupApiResponse(rawBody);
                setCached(
                  vreinPopupImageContentCache,
                  imageContentCacheKey,
                  content,
                  VREIN_POPUP_CONTENT_TTL_MS,
                );
              }

              if (!content) {
                return null;
              }

              // Safety-net cross-check against the blockId-based dispatch
              // above: only trust a response that self-identifies as
              // "images" once we actually have it.
              if (content.Type && content.Type !== "images") {
                console.warn(
                  "[Vrein Resolver] Popup smartimage block returned unexpected Type:",
                  blockId,
                  content.Type,
                );
                return null;
              }

              const rawImages: any[] = Array.isArray(content.Images)
                ? content.Images
                : [];

              const images = rawImages
                .map((img: any) => ({
                  link: String(img?.Link || ""),
                  urlDesktop: String(img?.UrlDesktop || ""),
                  urlMobile: String(img?.UrlMobile || ""),
                }))
                .filter((img) => img.urlDesktop || img.urlMobile);

              if (images.length === 0) {
                return null;
              }

              return {
                blockId,
                title: content.Title || "",
                link: content.Link || "",
                gaEventAction: content.GaEventAction || "",
                gaEventCategory: content.GaEventCategory || "",
                gaEventLabel: content.GaEventLabel || "",
                blockType: "images",
                products: [],
                images,
              };
            }

            const trackParams = new URLSearchParams({
              HASH: VREIN_HASH,
              email: emailParam,
              branchOffice: VREIN_BRANCH_OFFICE,
              whitelabel: "",
              sectionId: blockId,
              u,
            });
            const trackUrl = `${VREIN_POPUP_BASE_URL}/tracking/track?${trackParams}`;

            const contentCacheKey = `${VREIN_HASH}:${blockId}:${section}:${emailParam}:${u}`;
            let content = getCached<any>(
              vreinPopupContentCache,
              contentCacheKey,
            );

            if (!content) {
              const trackResponse = await fetch(trackUrl, {
                method: "GET",
                headers: popupHeaders,
              });

              if (!trackResponse.ok) {
                console.warn(
                  "[Vrein Resolver] Popup track API error for block:",
                  blockId,
                  trackResponse.status,
                );
                return null;
              }

              const rawBody = await trackResponse.json();
              content = normalizePopupApiResponse(rawBody);
              setCached(
                vreinPopupContentCache,
                contentCacheKey,
                content,
                VREIN_POPUP_CONTENT_TTL_MS,
              );
            }

            if (!content) {
              return null;
            }

            const productIds: string[] = Array.isArray(content.Products)
              ? content.Products
              : [];

            const products = await resolveVtexProductsByIds(
              productIds,
              VTEX_ACCOUNT,
            );

            if (products.length === 0) {
              return null;
            }

            return {
              blockId,
              title: content.Title || "",
              link: content.Link || "",
              gaEventAction: content.GaEventAction || "",
              gaEventCategory: content.GaEventCategory || "",
              gaEventLabel: content.GaEventLabel || "",
              blockType: "products",
              products,
              images: [],
            };
          }),
        );

        const blocks: any[] = [];
        for (const result of blockResults) {
          if (result.status === "fulfilled" && result.value !== null) {
            blocks.push(result.value);
          } else if (result.status === "rejected") {
            console.warn(
              "[Vrein Resolver] Popup block resolution failed:",
              result.reason?.message || result.reason,
            );
          }
        }

        if (blocks.length === 0) {
          console.warn(
            "[Vrein Resolver] Popup all blocks empty or failed for section:",
            section,
          );
          return null;
        }

        return {
          section,
          type,
          showOnce,
          blocks,
          apiUrl: modalblockUrl,
        };
      } catch (error) {
        console.error("[Vrein Resolver] Error resolving popup:", error);
        return null;
      }
    },
  },
};

export default vreinResolvers;
