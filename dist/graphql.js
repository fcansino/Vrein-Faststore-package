"use strict";var N=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var q=Object.getOwnPropertyNames;var z=Object.prototype.hasOwnProperty;var J=(e,t)=>{for(var n in t)N(e,n,{get:t[n],enumerable:!0})},Q=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of q(t))!z.call(e,r)&&r!==n&&N(e,r,{get:()=>t[r],enumerable:!(o=X(t,r))||o.enumerable});return e};var K=e=>Q(N({},"__esModule",{value:!0}),e);var ie={};J(ie,{vreinResolvers:()=>M,vreinTypeDefs:()=>F});module.exports=K(ie);var A=new Map,$=new Map,U=new Map,O=new Map,Z=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,W=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,Y=Number(process.env.VREIN_POPUP_CONFIG_TTL_MS)||12e4,x=Number(process.env.VREIN_POPUP_CONTENT_TTL_MS)||3e5,ee=500,te=20,T="1",E=process.env.VREIN_SECRET||"9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",H=process.env.NEXT_PUBLIC_VREIN_POPUP_URL||process.env.VREIN_POPUP_URL||"https://script-qa.vrein.ai";function _(e,t){let n=e.get(t);return n?Date.now()>n.expiresAt?(e.delete(t),null):n.data:null}function P(e,t,n,o){if(e.size>=ee){let r=e.keys().next().value;r!==void 0&&e.delete(r)}e.set(t,{data:n,expiresAt:Date.now()+o})}function re(e,t){let n=[];for(let o=0;o<e.length;o+=t)n.push(e.slice(o,o+t));return n}async function L(e,t){let n;try{n=JSON.parse(e)}catch{return e||"home//"}let{pageType:o,productId:r,categoryId:m,searchTerm:s,lastProducts:u="",lastSku:p="",lastCategory:l="",cartProducts:g="",queryTerm:c="",zipcode:a=""}=n,i=a?`/${a}`:"";switch(o){case"home":return`/home/1/${l}/${u}/${g}/${c||""}${i}`;case"product":{if(!r)return`/home/1/${l}/${u}/${g}/${c||""}${i}`;let f="",I="",S="",b=u;u&&(b=u.split(",").filter(y=>y!==String(r)).join(","));try{let C=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${r}`,y=await fetch(C,{method:"GET",headers:{Accept:"application/json"}});if(y.ok){let d=await y.json();if(d?.[0]?.categoriesIds?.[0]){let w=d[0].categoriesIds[0],V=w.substring(1,w.length-1).split("/");f=V[V.length-1]||"",I=V.length<3?V[0]||"":V[V.length-2]||"",S=V.join(",")}}}catch(C){console.warn("[Vrein Resolver] Failed to fetch product categories:",C)}return`product/${r}/${f}/${I}/${S}/${b}/${p}/${g}${i}`}case"category":return`/category/${m||l}//${u}/${g}${i}`;case"search":return`/search/${s||""}/${l}${i}`;case"searchnoresult":return`/searchnoresult/${s||""}/${l}${i}`;default:return`/home/1/${l}/${u}/${g}/${c||""}${i}`}}function ne(e,t){try{if(!e||!e.items||e.items.length===0)return null;let n=e.items[0];if(t){let g=e.items.find(c=>String(c.itemId)===String(t));g&&(n=g)}else{let g=e.items.find(c=>(c.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);g&&(n=g)}let r=n.sellers?.[0]?.commertialOffer;if(!r)return null;let s=(n.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),p=(e.categories||[])[0]||"",l=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(n.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:p,categoryIds:l,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(r.Price)||0,listPrice:Number(r.ListPrice||r.Price)||0,availability:r.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(r.Installments)?r.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(n){return console.error("[Vrein Resolver] Error transforming product:",n),null}}function oe(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],o=t.sellers?.[0]?.commertialOffer,m=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],u=s[0]||"",p=(e.categoriesIds||[])[0]||"",l=p?p.substring(1,p.length-1).replace(/\//g,","):"",g=s.map(c=>c.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:u,categoryIds:l,categoryNames:g,offers:{offers:[{price:Number(o?.Price)||0,listPrice:Number(o?.ListPrice||o?.Price)||0,availability:o?.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(o?.Installments)?o.Installments:[]}]},price:Number(o?.Price)||0,listPrice:Number(o?.ListPrice||o?.Price)||0,availability:o?.AvailableQuantity>0?"InStock":"OutOfStock",image:m,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}async function D(e,t){let n=new Map,o=[];for(let s of e){let u=_($,s);u?n.set(s,u):o.push(s)}let r=new Map;if(o.length>0){let s=re(o,te),u=await Promise.allSettled(s.map(async p=>{let l=p.map(i=>`fq=productId:${i}`).join("&"),g=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${l}`,c=await fetch(g,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!c.ok)throw new Error(`HTTP ${c.status} for batch of ${p.length} productIds`);let a=await c.json();return{chunk:p,products:a}}));for(let p of u)if(p.status==="fulfilled"){let{chunk:l,products:g}=p.value,c=new Map;for(let a of g)a?.productId&&l.includes(String(a.productId))&&c.set(String(a.productId),a);for(let a of l){let i=c.get(a);if(!i)continue;let f=ne(i);f&&(P($,a,f,W),r.set(a,f))}}else console.warn("[Vrein Resolver] Batch fetch failed:",p.reason?.message||p.reason)}let m=[];for(let s of e){let u=n.get(s)||r.get(s);u&&u.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&m.push(u)}return console.log("[Vrein Resolver] Successfully fetched",m.length,"in-stock products"),m}function B(e){return String(e??"").trim().toLowerCase()==="true"}function se(e,t){if(!B(e.Expiration))return!0;let n=e.AvailableFrom?Date.parse(String(e.AvailableFrom)):NaN;if(!Number.isNaN(n)&&t<n)return!1;let o=e.AvailableTo?Date.parse(String(e.AvailableTo)):NaN;return!(!Number.isNaN(o)&&t>o)}function ae(e){return Array.isArray(e)?e.length>0?e[0]:null:e&&typeof e=="object"?e:null}var M={Query:{vreinProducts:async(e,{sectionId:t,context:n},o)=>{try{let r=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!r)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let m="https://s2.braindw.com/tracking/track",s=process.env.VTEX_ACCOUNT||"brain",u="",p="/";try{let y=JSON.parse(n||"{}");u=y.sessionGuid||"",p=y.path||"/"}catch{}let l=await L(n||"home//",s);console.log("[Vrein Resolver] Built u param:",l);let g=Date.now(),c=`${m}?HASH=${r}&branchOffice=${T}&u=${encodeURIComponent(l)}&hs=${g}&upath=${encodeURIComponent(p)}&sectionId=${encodeURIComponent(t)}`,a=`${r}:${T}:${t}:${l}`,i=_(A,a);if(i)console.log("[Vrein Resolver] Vrein API cache HIT for key:",a);else{console.log("[Vrein Resolver] Calling Vrein API:",c);let y=u?` guid=${u}; `:"",d=await fetch(c,{method:"GET",headers:{Accept:"application/json",...E?{bdw_secretcode:E,"bdw-secretcode":E}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...y?{Cookie:y}:{}}});if(!d.ok)return console.error("[Vrein Resolver] Vrein API error:",d.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};i=await d.json(),P(A,a,i,Z)}let f=i,I=t.toLowerCase(),S=f.find(y=>y.Section?.toLowerCase()===I);if(!S||!S.Products||S.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};let b=S.Products,C=await D(b,s);return{products:C,totalCount:C.length,title:S.Title||"",endpointName:S.Endpoint||"Contenidos",apiUrl:c}}catch(r){return console.error("[Vrein Resolver] Error:",r),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:t,email:n,categoryId:o,whitelabel:r,sessionGuid:m})=>{try{let s=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!s)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let p=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:n||"",branchOffice:T,whitelabel:r||"",sectionid:t,idcategory:o||""})}`,l=m?`guid=${m};`:"",g=await fetch(p,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...E?{"bdw-secretcode":E}:{},...l?{Cookie:l}:{}}});if(!g.ok)return console.error("[Vrein Resolver] SmartImage API error:",g.status),{images:[],smartCountdown:null};let c=await g.json();if(!c||c.length===0||!c[0]?.Images)return{images:[],smartCountdown:null};let a=c[0],i=a.Images.map(I=>({title:a.Title||"",image:I.UrlDesktop||"",mobileImage:I.UrlMobile||"",link:I.Link||""})),f=a.SmartCountdown?{dateStart:a.SmartCountdown.DateStart||"",dateEnd:a.SmartCountdown.DateEnd||"",fontSizeDesktop:a.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:a.SmartCountdown.FontSizeMobile||14,positionDesktop:a.SmartCountdown.PositionDesktop||"2.2",positionMobile:a.SmartCountdown.PositionMobile||"2.2",fontColor:a.SmartCountdown.FontColor||"white",enabled:a.SmartCountdown.Enabled||!1,timeZoneOffset:a.SmartCountdown.TimeZoneOffset||0}:null;return{images:i,smartCountdown:f}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:n})=>{try{let o=process.env.VTEX_ACCOUNT||"brain",r="";if(n)r=`https://${o}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${n}`;else if(t)r=`https://${o}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let m=await fetch(r,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!m.ok)return null;let s=await m.json();return!s||s.length===0?null:oe(s[0])}catch(o){return console.error("[Vrein Resolver] Error fetching product data:",o),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o=(t||"").split("/").filter(Boolean);if(o.length===0)return{categoryId:""};let r=Math.max(o.length,3),m=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${r}`,s=await fetch(m,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let p=await s.json(),l=null;for(let g of o){if(l=p.find(c=>{let i=(c.url||"").split("/").filter(Boolean).pop()||"";return g.toLowerCase()===i.toLowerCase()}),!l)break;p=l.children||[]}return{categoryId:l?String(l.id):""}}catch(n){return console.error("[Vrein Resolver] Error resolving categoryId:",n),{categoryId:""}}},vreinPopup:async(e,{section:t,context:n,email:o})=>{try{let r=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!r)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let m=process.env.VTEX_ACCOUNT||"brain",s=o||"",u="";try{u=JSON.parse(n||"{}").sessionGuid||""}catch{}let p=u?`guid=${u};`:"",l={Accept:"application/json",...E?{bdw_secretcode:E,"bdw-secretcode":E}:{},"X-VTEX-Use-Https":"true",...p?{Cookie:p}:{}},g=new URLSearchParams({HASH:r,email:s,branchOffice:T,whitelabel:"",sectionid:t.toLowerCase()}),c=`${H}/tracking/modalblock?${g}`,a=`${r}:${T}:${t}:${s}`,i=_(U,a);if(!i){let d=await fetch(c,{method:"GET",headers:l});if(!d.ok)return console.warn("[Vrein Resolver] Popup modalblock API error:",d.status),null;i=await d.json(),P(U,a,i,Y)}if(!i)return console.warn("[Vrein Resolver] Popup no modalblock config for section:",t),null;let f=typeof i.Type=="string"?i.Type:"";if(f!=="modal"&&f!=="slider")return console.warn("[Vrein Resolver] Popup invalid or unrecognized type:",i.Type),null;if(!se(i,Date.now()))return null;let I=f==="modal"&&B(i.ShowOnce),S=[i.Block1,i.Block2].filter(d=>typeof d=="string"&&d.trim()!=="");if(S.length===0)return console.warn("[Vrein Resolver] Popup no blocks configured for section:",t),null;let b=await L(n||"home//",m);b||(b="home//");let C=await Promise.allSettled(S.map(async d=>{let w=new URLSearchParams({HASH:r,email:s,branchOffice:T,whitelabel:"",sectionId:d,u:b}),V=`${H}/tracking/track?${w}`,k=`${r}:${d}:${t}:${s}:${b}`,h=_(O,k);if(!h){let v=await fetch(V,{method:"GET",headers:l});if(!v.ok)return console.warn("[Vrein Resolver] Popup track API error for block:",d,v.status),null;let G=await v.json();h=ae(G),P(O,k,h,x)}if(!h)return null;let j=Array.isArray(h.Products)?h.Products:[],R=await D(j,m);return R.length===0?null:{blockId:d,title:h.Title||"",link:h.Link||"",gaEventAction:h.GaEventAction||"",gaEventCategory:h.GaEventCategory||"",gaEventLabel:h.GaEventLabel||"",products:R}})),y=[];for(let d of C)d.status==="fulfilled"&&d.value!==null?y.push(d.value):d.status==="rejected"&&console.warn("[Vrein Resolver] Popup block resolution failed:",d.reason?.message||d.reason);return y.length===0?(console.warn("[Vrein Resolver] Popup all blocks empty or failed for section:",t),null):{section:t,type:f,showOnce:I,blocks:y,apiUrl:c}}catch(r){return console.error("[Vrein Resolver] Error resolving popup:",r),null}}}};var F=`
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