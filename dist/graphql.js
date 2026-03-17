"use strict";var O=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var q=Object.getOwnPropertyNames;var Z=Object.prototype.hasOwnProperty;var K=(e,t)=>{for(var r in t)O(e,r,{get:t[r],enumerable:!0})},W=(e,t,r,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of q(t))!Z.call(e,n)&&n!==r&&O(e,n,{get:()=>t[n],enumerable:!(o=z(t,n))||o.enumerable});return e};var Y=e=>W(O({},"__esModule",{value:!0}),e);var ie={};K(ie,{createVreinApiHandler:()=>Q,createVreinRouteHandlers:()=>J,vreinResolvers:()=>w,vreinTypeDefs:()=>L});module.exports=Y(ie);var D=new Map,M=new Map,x=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,ee=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,te=500,re=20;function j(e,t){let r=e.get(t);return r?Date.now()>r.expiresAt?(e.delete(t),null):r.data:null}function F(e,t,r,o){if(e.size>=te){let n=e.keys().next().value;n!==void 0&&e.delete(n)}e.set(t,{data:r,expiresAt:Date.now()+o})}function ne(e,t){let r=[];for(let o=0;o<e.length;o+=t)r.push(e.slice(o,o+t));return r}async function oe(e,t){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:o,productId:n,categoryId:g,searchTerm:s,lastProducts:u="",lastSku:d="",lastCategory:a="",cartProducts:i="",queryTerm:p="",zipcode:I=""}=r,c=I?`/${I}`:"";switch(o){case"home":return`/home/1/${a}/${u}/${i}/${p||""}${c}`;case"product":{if(!n)return`/home/1/${a}/${u}/${i}/${p||""}${c}`;let l="",C="",E="",V=u;u&&(V=u.split(",").filter(T=>T!==String(n)).join(","));try{let y=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${n}`,T=await fetch(y,{method:"GET",headers:{Accept:"application/json"}});if(T.ok){let $=await T.json();if($?.[0]?.categoriesIds?.[0]){let v=$[0].categoriesIds[0],S=v.substring(1,v.length-1).split("/");l=S[S.length-1]||"",C=S.length<3?S[0]||"":S[S.length-2]||"",E=S.join(",")}}}catch(y){console.warn("[Vrein Resolver] Failed to fetch product categories:",y)}return`product/${n}/${l}/${C}/${E}/${V}/${d}/${i}${c}`}case"category":return`/category/${g||a}//${u}/${i}${c}`;case"search":return`/search/${s||""}/${a}${c}`;case"searchnoresult":return`/searchnoresult/${s||""}/${a}${c}`;default:return`/home/1/${a}/${u}/${i}/${p||""}${c}`}}function se(e,t){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(t){let i=e.items.find(p=>String(p.itemId)===String(t));i&&(r=i)}else{let i=e.items.find(p=>(p.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);i&&(r=i)}let n=r.sellers?.[0]?.commertialOffer;if(!n)return null;let s=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),d=(e.categories||[])[0]||"",a=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca")},categories:d,categoryIds:a,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(n.Price)||0,listPrice:Number(n.ListPrice||n.Price)||0,availability:n.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(n.Installments)?n.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function ae(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],o=t.sellers?.[0]?.commertialOffer,g=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],u=s[0]||"",d=(e.categoriesIds||[])[0]||"",a=d?d.substring(1,d.length-1).replace(/\//g,","):"",i=s.map(p=>p.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:String(e.brand||""),categories:u,categoryIds:a,categoryNames:i,price:Number(o?.Price)||0,listPrice:Number(o?.ListPrice||o?.Price)||0,availability:o?.AvailableQuantity>0?"InStock":"OutOfStock",image:g,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}var w={Query:{vreinProducts:async(e,{sectionId:t,context:r},o)=>{try{let n=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!n)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let g="https://s2.braindw.com/tracking/track",s="1",u="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",d=process.env.VTEX_ACCOUNT||"brain",a="",i="/";try{let m=JSON.parse(r||"{}");a=m.sessionGuid||"",i=m.path||"/"}catch{}let p=await oe(r||"home//",d);console.log("[Vrein Resolver] Built u param:",p);let I=Date.now(),c=`${g}?HASH=${n}&branchOffice=${s}&u=${encodeURIComponent(p)}&hs=${I}&upath=${encodeURIComponent(i)}&sectionId=${encodeURIComponent(t)}`,l=`${n}:${s}:${t}:${p}`,C=j(D,l);if(C)console.log("[Vrein Resolver] Vrein API cache HIT for key:",l);else{console.log("[Vrein Resolver] Calling Vrein API:",c);let m=a?` guid=${a}; `:"",f=await fetch(c,{method:"GET",headers:{Accept:"application/json",...u?{bdw_secretcode:u,"bdw-secretcode":u}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!f.ok)return console.error("[Vrein Resolver] Vrein API error:",f.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};C=await f.json(),F(D,l,C,x)}let E=C,V=t.toLowerCase(),y=E.find(m=>m.Section?.toLowerCase()===V);if(!y||!y.Products||y.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};let T=y.Products,$=new Map,v=[];for(let m of T){let f=j(M,m);f?$.set(m,f):v.push(m)}let S=new Map;if(v.length>0){let m=ne(v,re),f=await Promise.allSettled(m.map(async b=>{let N=b.map(_=>`fq=productId:${_}`).join("&"),P=`https://${d}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${N}`,R=await fetch(P,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!R.ok)throw new Error(`HTTP ${R.status} for batch of ${b.length} productIds`);let h=await R.json();return{chunk:b,products:h}}));for(let b of f)if(b.status==="fulfilled"){let{chunk:N,products:P}=b.value,R=new Map;for(let h of P)h?.productId&&N.includes(String(h.productId))&&R.set(String(h.productId),h);for(let h of N){let _=R.get(h);if(!_)continue;let k=se(_);k&&(F(M,h,k,ee),S.set(h,k))}}else console.warn("[Vrein Resolver] Batch fetch failed:",b.reason?.message||b.reason)}let A=[];for(let m of T){let f=$.get(m)||S.get(m);f&&f.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&A.push(f)}return console.log("[Vrein Resolver] Successfully fetched",A.length,"in-stock products"),{products:A,totalCount:A.length,title:y.Title||"",endpointName:y.Endpoint||"Contenidos",apiUrl:c}}catch(n){return console.error("[Vrein Resolver] Error:",n),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:t,email:r,categoryId:o,whitelabel:n,sessionGuid:g})=>{try{let s=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!s)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let u="1",d="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",i=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:r||"",branchOffice:u,whitelabel:n||"",sectionid:t,idcategory:o||""})}`,p=g?`guid=${g};`:"",I=await fetch(i,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...d?{"bdw-secretcode":d}:{},...p?{Cookie:p}:{}}});if(!I.ok)return console.error("[Vrein Resolver] SmartImage API error:",I.status),{images:[],smartCountdown:null};let c=await I.json();if(!c||c.length===0||!c[0]?.Images)return{images:[],smartCountdown:null};let l=c[0],C=l.Images.map(V=>({title:l.Title||"",image:V.UrlDesktop||"",mobileImage:V.UrlMobile||"",link:V.Link||""})),E=l.SmartCountdown?{dateStart:l.SmartCountdown.DateStart||"",dateEnd:l.SmartCountdown.DateEnd||"",fontSizeDesktop:l.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:l.SmartCountdown.FontSizeMobile||14,positionDesktop:l.SmartCountdown.PositionDesktop||"2.2",positionMobile:l.SmartCountdown.PositionMobile||"2.2",fontColor:l.SmartCountdown.FontColor||"white",enabled:l.SmartCountdown.Enabled||!1,timeZoneOffset:l.SmartCountdown.TimeZoneOffset||0}:null;return{images:C,smartCountdown:E}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:r})=>{try{let o=process.env.VTEX_ACCOUNT||"brain",n="";if(r)n=`https://${o}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(t)n=`https://${o}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let g=await fetch(n,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!g.ok)return null;let s=await g.json();return!s||s.length===0?null:ae(s[0])}catch(o){return console.error("[Vrein Resolver] Error fetching product data:",o),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",o=(t||"").split("/").filter(Boolean);if(o.length===0)return{categoryId:""};let n=Math.max(o.length,3),g=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${n}`,s=await fetch(g,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let d=await s.json(),a=null;for(let i of o){if(a=d.find(p=>{let c=(p.url||"").split("/").filter(Boolean).pop()||"";return i.toLowerCase()===c.toLowerCase()}),!a)break;d=a.children||[]}return{categoryId:a?String(a.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}}}};var L=`
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

type VreinOffer {
  price: Float!
  listPrice: Float!
  availability: String!
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

extend type Query {
  vreinProducts(sectionId: String!, context: String): VreinProductConnection!
  vreinProductData(productId: String, skuId: String): VreinFullProduct
  vreinImages(sectionId: String!, email: String, categoryId: String, whitelabel: String, sessionGuid: String): VreinImageBannerConnection!
  vreinCategoryId(pathname: String!): VreinCategoryResult!
}
`;var B={VreinProductsQuery:{resolver:w.Query.vreinProducts,responseField:"vreinProducts"},VreinImagesQuery:{resolver:w.Query.vreinImages,responseField:"vreinImages"},VreinProductDataQuery:{resolver:w.Query.vreinProductData,responseField:"vreinProductData"},VreinCategoryIdQuery:{resolver:w.Query.vreinCategoryId,responseField:"vreinCategoryId"}};async function X(e,t){let r=B[e];if(!r)return{errors:[{message:`[Vrein Handler] Unknown operation: "${e}". Available: ${Object.keys(B).join(", ")}`}]};try{let o=await r.resolver(null,t,{});return{data:{[r.responseField]:o}}}catch(o){return console.error(`[Vrein Handler] Error executing ${e}:`,o),{errors:[{message:o.message||"Internal server error"}]}}}function U(e){try{return JSON.parse(e)}catch{return{}}}var H={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};function Q(){return async(e,t)=>{for(let[s,u]of Object.entries(H))t.setHeader(s,u);if(e.method==="OPTIONS")return t.status(200).end();let r="",o={};if(e.method==="GET")r=e.query?.operationName||"",o=typeof e.query?.variables=="string"?U(e.query.variables):{};else{let s=typeof e.body=="string"?U(e.body):e.body||{};r=s.operationName||"",o=s.variables||{}}let n=await X(r,o),g=n.errors?.length?400:200;return t.status(g).json(n)}}async function G(e){let t="",r={},o=new URL(e.url);if(e.method==="GET"){t=o.searchParams.get("operationName")||"";let s=o.searchParams.get("variables");r=s?U(s):{}}else try{let s=await e.json();t=s.operationName||"",r=s.variables||{}}catch{}let n=await X(t,r),g=n.errors?.length?400:200;return new Response(JSON.stringify(n),{status:g,headers:{"Content-Type":"application/json",...H}})}function J(){return{GET:G,POST:G,OPTIONS:async()=>new Response(null,{status:204,headers:H})}}0&&(module.exports={createVreinApiHandler,createVreinRouteHandlers,vreinResolvers,vreinTypeDefs});
//# sourceMappingURL=graphql.js.map