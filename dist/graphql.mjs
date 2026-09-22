var E=new Map,$=new Map,A=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,k=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,R=500,v=20,w="1",b=process.env.VREIN_SECRET||"9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3";function _(e,n){let r=e.get(n);return r?Date.now()>r.expiresAt?(e.delete(n),null):r.data:null}function N(e,n,r,t){if(e.size>=R){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(n,{data:r,expiresAt:Date.now()+t})}function U(e,n){let r=[];for(let t=0;t<e.length;t+=n)r.push(e.slice(t,t+n));return r}async function P(e,n){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:t,productId:o,categoryId:d,searchTerm:i,lastProducts:l="",lastSku:g="",lastCategory:c="",cartProducts:u="",queryTerm:a="",zipcode:s=""}=r,p=s?`/${s}`:"";switch(t){case"home":return`/home/1/${c}/${l}/${u}/${a||""}${p}`;case"product":{if(!o)return`/home/1/${c}/${l}/${u}/${a||""}${p}`;let f="",y="",S="",V=l;l&&(V=l.split(",").filter(m=>m!==String(o)).join(","));try{let h=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,m=await fetch(h,{method:"GET",headers:{Accept:"application/json"}});if(m.ok){let C=await m.json();if(C?.[0]?.categoriesIds?.[0]){let T=C[0].categoriesIds[0],I=T.substring(1,T.length-1).split("/");f=I[I.length-1]||"",y=I.length<3?I[0]||"":I[I.length-2]||"",S=I.join(",")}}}catch(h){console.warn("[Vrein Resolver] Failed to fetch product categories:",h)}return`product/${o}/${f}/${y}/${S}/${V}/${g}/${u}${p}`}case"category":return`/category/${d||c}//${l}/${u}${p}`;case"search":return`/search/${i||""}/${c}${p}`;case"searchnoresult":return`/searchnoresult/${i||""}/${c}${p}`;default:return`/home/1/${c}/${l}/${u}/${a||""}${p}`}}function H(e,n){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(n){let u=e.items.find(a=>String(a.itemId)===String(n));u&&(r=u)}else{let u=e.items.find(a=>(a.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);u&&(r=u)}let o=r.sellers?.[0]?.commertialOffer;if(!o)return null;let i=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),g=(e.categories||[])[0]||"",c=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:g,categoryIds:c,image:[{url:i||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(o.Installments)?o.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function O(e){try{if(!e||!e.items||e.items.length===0)return null;let n=e.items[0],t=n.sellers?.[0]?.commertialOffer,d=(n.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),i=e.categories||[],l=i[0]||"",g=(e.categoriesIds||[])[0]||"",c=g?g.substring(1,g.length-1).replace(/\//g,","):"",u=i.map(a=>a.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(n.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:l,categoryIds:c,categoryNames:u,offers:{offers:[{price:Number(t?.Price)||0,listPrice:Number(t?.ListPrice||t?.Price)||0,availability:t?.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(t?.Installments)?t.Installments:[]}]},price:Number(t?.Price)||0,listPrice:Number(t?.ListPrice||t?.Price)||0,availability:t?.AvailableQuantity>0?"InStock":"OutOfStock",image:d,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(n){return console.error("[Vrein Resolver] Error transforming full product:",n),null}}async function D(e,n){let r=new Map,t=[];for(let i of e){let l=_($,i);l?r.set(i,l):t.push(i)}let o=new Map;if(t.length>0){let i=U(t,v),l=await Promise.allSettled(i.map(async g=>{let c=g.map(p=>`fq=productId:${p}`).join("&"),u=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${c}`,a=await fetch(u,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!a.ok)throw new Error(`HTTP ${a.status} for batch of ${g.length} productIds`);let s=await a.json();return{chunk:g,products:s}}));for(let g of l)if(g.status==="fulfilled"){let{chunk:c,products:u}=g.value,a=new Map;for(let s of u)s?.productId&&c.includes(String(s.productId))&&a.set(String(s.productId),s);for(let s of c){let p=a.get(s);if(!p)continue;let f=H(p);f&&(N($,s,f,k),o.set(s,f))}}else console.warn("[Vrein Resolver] Batch fetch failed:",g.reason?.message||g.reason)}let d=[];for(let i of e){let l=r.get(i)||o.get(i);l&&l.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&d.push(l)}return console.log("[Vrein Resolver] Successfully fetched",d.length,"in-stock products"),d}var L={Query:{vreinProducts:async(e,{sectionId:n,context:r},t)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",n);let d="https://s2.braindw.com/tracking/track",i=process.env.VTEX_ACCOUNT||"brain",l="",g="/";try{let m=JSON.parse(r||"{}");l=m.sessionGuid||"",g=m.path||"/"}catch{}let c=await P(r||"home//",i);console.log("[Vrein Resolver] Built u param:",c);let u=Date.now(),a=`${d}?HASH=${o}&branchOffice=${w}&u=${encodeURIComponent(c)}&hs=${u}&upath=${encodeURIComponent(g)}&sectionId=${encodeURIComponent(n)}`,s=`${o}:${w}:${n}:${c}`,p=_(E,s);if(p)console.log("[Vrein Resolver] Vrein API cache HIT for key:",s);else{console.log("[Vrein Resolver] Calling Vrein API:",a);let m=l?` guid=${l}; `:"",C=await fetch(a,{method:"GET",headers:{Accept:"application/json",...b?{bdw_secretcode:b,"bdw-secretcode":b}:{},bdw_sectionid:n,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!C.ok)return console.error("[Vrein Resolver] Vrein API error:",C.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:a};p=await C.json(),N(E,s,p,A)}let f=p,y=n.toLowerCase(),S=f.find(m=>m.Section?.toLowerCase()===y);if(!S||!S.Products||S.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",n),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:a};let V=S.Products,h=await D(V,i);return{products:h,totalCount:h.length,title:S.Title||"",endpointName:S.Endpoint||"Contenidos",apiUrl:a}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:n,email:r,categoryId:t,whitelabel:o,sessionGuid:d})=>{try{let i=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!i)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let g=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:i,email:r||"",branchOffice:w,whitelabel:o||"",sectionid:n,idcategory:t||""})}`,c=d?`guid=${d};`:"",u=await fetch(g,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...b?{"bdw-secretcode":b}:{},...c?{Cookie:c}:{}}});if(!u.ok)return console.error("[Vrein Resolver] SmartImage API error:",u.status),{images:[],smartCountdown:null};let a=await u.json();if(!a||a.length===0||!a[0]?.Images)return{images:[],smartCountdown:null};let s=a[0],p=s.Images.map(y=>({title:s.Title||"",image:y.UrlDesktop||"",mobileImage:y.UrlMobile||"",link:y.Link||""})),f=s.SmartCountdown?{dateStart:s.SmartCountdown.DateStart||"",dateEnd:s.SmartCountdown.DateEnd||"",fontSizeDesktop:s.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:s.SmartCountdown.FontSizeMobile||14,positionDesktop:s.SmartCountdown.PositionDesktop||"2.2",positionMobile:s.SmartCountdown.PositionMobile||"2.2",fontColor:s.SmartCountdown.FontColor||"white",enabled:s.SmartCountdown.Enabled||!1,timeZoneOffset:s.SmartCountdown.TimeZoneOffset||0}:null;return{images:p,smartCountdown:f}}catch(i){return console.error("[Vrein Resolver] Error fetching images:",i),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:n,skuId:r})=>{try{let t=process.env.VTEX_ACCOUNT||"brain",o="";if(r)o=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(n)o=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${n}`;else return null;let d=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!d.ok)return null;let i=await d.json();return!i||i.length===0?null:O(i[0])}catch(t){return console.error("[Vrein Resolver] Error fetching product data:",t),null}},vreinCategoryId:async(e,{pathname:n})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",t=(n||"").split("/").filter(Boolean);if(t.length===0)return{categoryId:""};let o=Math.max(t.length,3),d=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,i=await fetch(d,{method:"GET",headers:{Accept:"application/json"}});if(!i.ok)return{categoryId:""};let g=await i.json(),c=null;for(let u of t){if(c=g.find(a=>{let p=(a.url||"").split("/").filter(Boolean).pop()||"";return u.toLowerCase()===p.toLowerCase()}),!c)break;g=c.children||[]}return{categoryId:c?String(c.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}}}};var M=`
type VreinProduct {
  id: String!
  sku: String!
  slug: String!
  name: String!
  brand: VreinBrand!
  categories: String
  categoryIds: String
  image: [VreinImage!]!
  offers: VreinOffers!
  isVariantOf: VreinProductGroup!
}

type VreinBrand {
  name: String!
}

type VreinImage {
  url: String!
  alternateName: String!
}

type VreinOffers {
  offers: [VreinOffer!]!
}

type VreinInstallment {
  Value: Float!
  InterestRate: Float!
  TotalValuePlusInterestRate: Float!
  NumberOfInstallments: Int!
  PaymentSystemName: String!
  PaymentSystemGroupName: String!
  Name: String!
}

type VreinOffer {
  price: Float!
  listPrice: Float!
  availability: String!
  installments: [VreinInstallment!]!
}

type VreinProductGroup {
  productGroupID: String!
  name: String!
}

type VreinProductConnection {
  products: [VreinProduct!]!
  totalCount: Int!
  title: String!
  endpointName: String!
  apiUrl: String!
}

type VreinFullProduct {
  id: String!
  sku: String!
  slug: String!
  name: String!
  description: String
  brand: String!
  categories: String
  categoryIds: String
  categoryNames: String
  price: Float!
  listPrice: Float!
  availability: String!
  image: String!
  url: String!
}

type VreinBannerImage {
  title: String
  image: String!
  mobileImage: String
  link: String
}

type VreinSmartCountdown {
  dateStart: String
  dateEnd: String!
  fontSizeDesktop: Int
  fontSizeMobile: Int
  positionDesktop: String
  positionMobile: String
  fontColor: String
  enabled: Boolean!
  timeZoneOffset: Int
}

type VreinImageBannerConnection {
  images: [VreinBannerImage!]!
  smartCountdown: VreinSmartCountdown
}

type VreinCategoryResult {
  categoryId: String!
}

type VreinPopupBlock {
  blockId: String!
  title: String!
  link: String!
  gaEventAction: String!
  gaEventCategory: String!
  gaEventLabel: String!
  products: [VreinProduct!]!
}

type VreinPopupData {
  section: String!
  type: String!
  showOnce: Boolean!
  blocks: [VreinPopupBlock!]!
  apiUrl: String!
}

extend type Query {
  vreinProducts(sectionId: String!, context: String): VreinProductConnection!
  vreinProductData(productId: String, skuId: String): VreinFullProduct
  vreinImages(sectionId: String!, email: String, categoryId: String, whitelabel: String, sessionGuid: String): VreinImageBannerConnection!
  vreinCategoryId(pathname: String!): VreinCategoryResult!
  vreinPopup(section: String!, context: String, email: String, whitelabel: String): VreinPopupData
}
`;export{L as vreinResolvers,M as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map