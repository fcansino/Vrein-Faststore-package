"use strict";var w=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var U=Object.getOwnPropertyNames;var P=Object.prototype.hasOwnProperty;var H=(e,t)=>{for(var r in t)w(e,r,{get:t[r],enumerable:!0})},O=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of U(t))!P.call(e,o)&&o!==r&&w(e,o,{get:()=>t[o],enumerable:!(n=v(t,o))||n.enumerable});return e};var D=e=>O(w({},"__esModule",{value:!0}),e);var Q={};H(Q,{vreinResolvers:()=>k,vreinTypeDefs:()=>R});module.exports=D(Q);var $=new Map,_=new Map,L=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,M=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,B=500,j=20,T="1",b=process.env.VREIN_SECRET||"9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3";function N(e,t){let r=e.get(t);return r?Date.now()>r.expiresAt?(e.delete(t),null):r.data:null}function A(e,t,r,n){if(e.size>=B){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(t,{data:r,expiresAt:Date.now()+n})}function F(e,t){let r=[];for(let n=0;n<e.length;n+=t)r.push(e.slice(n,n+t));return r}async function X(e,t){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:d,searchTerm:i,lastProducts:l="",lastSku:g="",lastCategory:c="",cartProducts:u="",queryTerm:a="",zipcode:s=""}=r,p=s?`/${s}`:"";switch(n){case"home":return`/home/1/${c}/${l}/${u}/${a||""}${p}`;case"product":{if(!o)return`/home/1/${c}/${l}/${u}/${a||""}${p}`;let f="",y="",S="",V=l;l&&(V=l.split(",").filter(m=>m!==String(o)).join(","));try{let h=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,m=await fetch(h,{method:"GET",headers:{Accept:"application/json"}});if(m.ok){let C=await m.json();if(C?.[0]?.categoriesIds?.[0]){let E=C[0].categoriesIds[0],I=E.substring(1,E.length-1).split("/");f=I[I.length-1]||"",y=I.length<3?I[0]||"":I[I.length-2]||"",S=I.join(",")}}}catch(h){console.warn("[Vrein Resolver] Failed to fetch product categories:",h)}return`product/${o}/${f}/${y}/${S}/${V}/${g}/${u}${p}`}case"category":return`/category/${d||c}//${l}/${u}${p}`;case"search":return`/search/${i||""}/${c}${p}`;case"searchnoresult":return`/searchnoresult/${i||""}/${c}${p}`;default:return`/home/1/${c}/${l}/${u}/${a||""}${p}`}}function G(e,t){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(t){let u=e.items.find(a=>String(a.itemId)===String(t));u&&(r=u)}else{let u=e.items.find(a=>(a.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);u&&(r=u)}let o=r.sellers?.[0]?.commertialOffer;if(!o)return null;let i=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),g=(e.categories||[])[0]||"",c=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:g,categoryIds:c,image:[{url:i||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(o.Installments)?o.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function q(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],n=t.sellers?.[0]?.commertialOffer,d=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),i=e.categories||[],l=i[0]||"",g=(e.categoriesIds||[])[0]||"",c=g?g.substring(1,g.length-1).replace(/\//g,","):"",u=i.map(a=>a.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:l,categoryIds:c,categoryNames:u,offers:{offers:[{price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(n?.Installments)?n.Installments:[]}]},price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:d,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}async function z(e,t){let r=new Map,n=[];for(let i of e){let l=N(_,i);l?r.set(i,l):n.push(i)}let o=new Map;if(n.length>0){let i=F(n,j),l=await Promise.allSettled(i.map(async g=>{let c=g.map(p=>`fq=productId:${p}`).join("&"),u=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${c}`,a=await fetch(u,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!a.ok)throw new Error(`HTTP ${a.status} for batch of ${g.length} productIds`);let s=await a.json();return{chunk:g,products:s}}));for(let g of l)if(g.status==="fulfilled"){let{chunk:c,products:u}=g.value,a=new Map;for(let s of u)s?.productId&&c.includes(String(s.productId))&&a.set(String(s.productId),s);for(let s of c){let p=a.get(s);if(!p)continue;let f=G(p);f&&(A(_,s,f,M),o.set(s,f))}}else console.warn("[Vrein Resolver] Batch fetch failed:",g.reason?.message||g.reason)}let d=[];for(let i of e){let l=r.get(i)||o.get(i);l&&l.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&d.push(l)}return console.log("[Vrein Resolver] Successfully fetched",d.length,"in-stock products"),d}var k={Query:{vreinProducts:async(e,{sectionId:t,context:r},n)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let d="https://s2.braindw.com/tracking/track",i=process.env.VTEX_ACCOUNT||"brain",l="",g="/";try{let m=JSON.parse(r||"{}");l=m.sessionGuid||"",g=m.path||"/"}catch{}let c=await X(r||"home//",i);console.log("[Vrein Resolver] Built u param:",c);let u=Date.now(),a=`${d}?HASH=${o}&branchOffice=${T}&u=${encodeURIComponent(c)}&hs=${u}&upath=${encodeURIComponent(g)}&sectionId=${encodeURIComponent(t)}`,s=`${o}:${T}:${t}:${c}`,p=N($,s);if(p)console.log("[Vrein Resolver] Vrein API cache HIT for key:",s);else{console.log("[Vrein Resolver] Calling Vrein API:",a);let m=l?` guid=${l}; `:"",C=await fetch(a,{method:"GET",headers:{Accept:"application/json",...b?{bdw_secretcode:b,"bdw-secretcode":b}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!C.ok)return console.error("[Vrein Resolver] Vrein API error:",C.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:a};p=await C.json(),A($,s,p,L)}let f=p,y=t.toLowerCase(),S=f.find(m=>m.Section?.toLowerCase()===y);if(!S||!S.Products||S.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:a};let V=S.Products,h=await z(V,i);return{products:h,totalCount:h.length,title:S.Title||"",endpointName:S.Endpoint||"Contenidos",apiUrl:a}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:t,email:r,categoryId:n,whitelabel:o,sessionGuid:d})=>{try{let i=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!i)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let g=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:i,email:r||"",branchOffice:T,whitelabel:o||"",sectionid:t,idcategory:n||""})}`,c=d?`guid=${d};`:"",u=await fetch(g,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...b?{"bdw-secretcode":b}:{},...c?{Cookie:c}:{}}});if(!u.ok)return console.error("[Vrein Resolver] SmartImage API error:",u.status),{images:[],smartCountdown:null};let a=await u.json();if(!a||a.length===0||!a[0]?.Images)return{images:[],smartCountdown:null};let s=a[0],p=s.Images.map(y=>({title:s.Title||"",image:y.UrlDesktop||"",mobileImage:y.UrlMobile||"",link:y.Link||""})),f=s.SmartCountdown?{dateStart:s.SmartCountdown.DateStart||"",dateEnd:s.SmartCountdown.DateEnd||"",fontSizeDesktop:s.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:s.SmartCountdown.FontSizeMobile||14,positionDesktop:s.SmartCountdown.PositionDesktop||"2.2",positionMobile:s.SmartCountdown.PositionMobile||"2.2",fontColor:s.SmartCountdown.FontColor||"white",enabled:s.SmartCountdown.Enabled||!1,timeZoneOffset:s.SmartCountdown.TimeZoneOffset||0}:null;return{images:p,smartCountdown:f}}catch(i){return console.error("[Vrein Resolver] Error fetching images:",i),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:r})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let d=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!d.ok)return null;let i=await d.json();return!i||i.length===0?null:q(i[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",n=(t||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),d=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,i=await fetch(d,{method:"GET",headers:{Accept:"application/json"}});if(!i.ok)return{categoryId:""};let g=await i.json(),c=null;for(let u of n){if(c=g.find(a=>{let p=(a.url||"").split("/").filter(Boolean).pop()||"";return u.toLowerCase()===p.toLowerCase()}),!c)break;g=c.children||[]}return{categoryId:c?String(c.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}}}};var R=`
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
`;0&&(module.exports={vreinResolvers,vreinTypeDefs});
//# sourceMappingURL=graphql.js.map