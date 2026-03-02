"use strict";var H=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var Z=Object.getOwnPropertyNames;var J=Object.prototype.hasOwnProperty;var K=(e,t)=>{for(var r in t)H(e,r,{get:t[r],enumerable:!0})},x=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of Z(t))!J.call(e,o)&&o!==r&&H(e,o,{get:()=>t[o],enumerable:!(n=q(t,o))||n.enumerable});return e};var W=e=>x(H({},"__esModule",{value:!0}),e);var ie={};K(ie,{createVreinApiHandler:()=>Q,createVreinRouteHandlers:()=>z,vreinResolvers:()=>R,vreinTypeDefs:()=>L});module.exports=W(ie);var F=new Map,M=new Map,Y=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,ee=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,te=500,re=20;function j(e,t){let r=e.get(t);return r?Date.now()>r.expiresAt?(e.delete(t),null):r.data:null}function D(e,t,r,n){if(e.size>=te){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(t,{data:r,expiresAt:Date.now()+n})}function ne(e,t){let r=[];for(let n=0;n<e.length;n+=t)r.push(e.slice(n,n+t));return r}async function oe(e,t){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:c,searchTerm:s,lastProducts:l="",lastSku:p="",lastCategory:a="",cartProducts:u="",queryTerm:d="",zipcode:C=""}=r,g=C?`/${C}`:"";switch(n){case"home":return`/home/1/${a}/${l}/${u}/${d||""}${g}`;case"product":{if(!o)return`/home/1/${a}/${l}/${u}/${d||""}${g}`;let i="",I="",T="",V=l;l&&(V=l.split(",").filter(E=>E!==String(o)).join(","));try{let f=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,E=await fetch(f,{method:"GET",headers:{Accept:"application/json"}});if(E.ok){let N=await E.json();if(N?.[0]?.categoriesIds?.[0]){let v=N[0].categoriesIds[0],h=v.substring(1,v.length-1).split("/");i=h[h.length-1]||"",I=h.length<3?h[0]||"":h[h.length-2]||"",T=h.join(",")}}}catch(f){console.warn("[Vrein Resolver] Failed to fetch product categories:",f)}return`product/${o}/${i}/${I}/${T}/${V}/${p}/${u}${g}`}case"category":return`/category/${c||a}//${l}/${u}${g}`;case"search":return`/search/${s||""}/${a}${g}`;case"searchnoresult":return`/searchnoresult/${s||""}/${a}${g}`;default:return`/home/1/${a}/${l}/${u}/${d||""}${g}`}}function se(e,t){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(t){let u=e.items.find(d=>String(d.itemId)===String(t));u&&(r=u)}let o=r.sellers?.[0]?.commertialOffer;if(!o)return null;let s=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),p=(e.categories||[])[0]||"",a=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca")},categories:p,categoryIds:a,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function ae(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],n=t.sellers?.[0]?.commertialOffer,c=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],l=s[0]||"",p=(e.categoriesIds||[])[0]||"",a=p?p.substring(1,p.length-1).replace(/\//g,","):"",u=s.map(d=>d.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:String(e.brand||""),categories:l,categoryIds:a,categoryNames:u,price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:c,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}var R={Query:{vreinProducts:async(e,{sectionId:t,context:r},n)=>{try{if(!process.env.VREIN_HASH)throw new Error("[Vrein Resolver] VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let o=process.env.VREIN_API_URL||"https://s2.braindw.com/tracking/track",c=process.env.VREIN_HASH,s=process.env.VREIN_BRANCH_OFFICE||"1",l=process.env.VREIN_SECRET||"",p=process.env.VTEX_ACCOUNT||"brain",a="",u="/";try{let m=JSON.parse(r||"{}");a=m.sessionGuid||"",u=m.path||"/"}catch{}let d=await oe(r||"home//",p);console.log("[Vrein Resolver] Built u param:",d);let C=Date.now(),g=`${o}?HASH=${c}&branchOffice=${s}&u=${encodeURIComponent(d)}&hs=${C}&upath=${encodeURIComponent(u)}&sectionId=${encodeURIComponent(t)}`,i=`${c}:${s}:${t}:${d}`,I=j(F,i);if(I)console.log("[Vrein Resolver] Vrein API cache HIT for key:",i);else{console.log("[Vrein Resolver] Calling Vrein API:",g);let m=a?` guid=${a}; `:"",y=await fetch(g,{method:"GET",headers:{Accept:"application/json",...l?{bdw_secretcode:l,"bdw-secretcode":l}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!y.ok)return console.error("[Vrein Resolver] Vrein API error:",y.status),{products:[],totalCount:0,title:""};I=await y.json(),D(F,i,I,Y)}let T=I,V=t.toLowerCase(),f=T.find(m=>m.Section?.toLowerCase()===V);if(!f||!f.Products||f.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:""};let E=f.Products,N=new Map,v=[];for(let m of E){let y=j(M,m);y?N.set(m,y):v.push(m)}let h=new Map;if(v.length>0){let m=ne(v,re),y=await Promise.allSettled(m.map(async b=>{let _=b.map(w=>`fq=skuId:${w}`).join("&"),k=`https://${p}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${_}`,$=await fetch(k,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!$.ok)throw new Error(`HTTP ${$.status} for batch of ${b.length} SKUs`);let S=await $.json();return{chunk:b,products:S}}));for(let b of y)if(b.status==="fulfilled"){let{chunk:_,products:k}=b.value,$=new Map;for(let S of k)if(S?.items)for(let w of S.items)_.includes(String(w.itemId))&&$.set(String(w.itemId),S);for(let S of _){let w=$.get(S);if(!w)continue;let P=se(w,S);P&&(D(M,S,P,ee),h.set(S,P))}}else console.warn("[Vrein Resolver] Batch fetch failed:",b.reason?.message||b.reason)}let A=[];for(let m of E){let y=N.get(m)||h.get(m);y&&A.push(y)}return console.log("[Vrein Resolver] Successfully fetched",A.length,"products"),{products:A,totalCount:A.length,title:f.Title||"",endpointName:f.Endpoint||"Contenidos"}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:""}}},vreinImages:async(e,{sectionId:t,email:r,categoryId:n,whitelabel:o,sessionGuid:c})=>{try{if(!process.env.VREIN_HASH)throw new Error("[Vrein Resolver] VREIN_HASH env var is required but not set.");let s=process.env.VREIN_HASH,l=process.env.VREIN_BRANCH_OFFICE||"1",p=process.env.VREIN_SECRET||"",u=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:r||"",branchOffice:l,whitelabel:o||"",sectionid:t,idcategory:n||""})}`,d=c?`guid=${c};`:"",C=await fetch(u,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...p?{"bdw-secretcode":p}:{},...d?{Cookie:d}:{}}});if(!C.ok)return console.error("[Vrein Resolver] SmartImage API error:",C.status),{images:[],smartCountdown:null};let g=await C.json();if(!g||g.length===0||!g[0]?.Images)return{images:[],smartCountdown:null};let i=g[0],I=i.Images.map(V=>({title:i.Title||"",image:V.UrlDesktop||"",mobileImage:V.UrlMobile||"",link:V.Link||""})),T=i.SmartCountdown?{dateStart:i.SmartCountdown.DateStart||"",dateEnd:i.SmartCountdown.DateEnd||"",fontSizeDesktop:i.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:i.SmartCountdown.FontSizeMobile||14,positionDesktop:i.SmartCountdown.PositionDesktop||"2.2",positionMobile:i.SmartCountdown.PositionMobile||"2.2",fontColor:i.SmartCountdown.FontColor||"white",enabled:i.SmartCountdown.Enabled||!1,timeZoneOffset:i.SmartCountdown.TimeZoneOffset||0}:null;return{images:I,smartCountdown:T}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:r})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let c=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!c.ok)return null;let s=await c.json();return!s||s.length===0?null:ae(s[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",n=(t||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),c=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,s=await fetch(c,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let p=await s.json(),a=null;for(let u of n){if(a=p.find(d=>{let g=(d.url||"").split("/").filter(Boolean).pop()||"";return u.toLowerCase()===g.toLowerCase()}),!a)break;p=a.children||[]}return{categoryId:a?String(a.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}}}};var L=`
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
`;var G={VreinProductsQuery:{resolver:R.Query.vreinProducts,responseField:"vreinProducts"},VreinImagesQuery:{resolver:R.Query.vreinImages,responseField:"vreinImages"},VreinProductDataQuery:{resolver:R.Query.vreinProductData,responseField:"vreinProductData"},VreinCategoryIdQuery:{resolver:R.Query.vreinCategoryId,responseField:"vreinCategoryId"}};async function X(e,t){let r=G[e];if(!r)return{errors:[{message:`[Vrein Handler] Unknown operation: "${e}". Available: ${Object.keys(G).join(", ")}`}]};try{let n=await r.resolver(null,t,{});return{data:{[r.responseField]:n}}}catch(n){return console.error(`[Vrein Handler] Error executing ${e}:`,n),{errors:[{message:n.message||"Internal server error"}]}}}function O(e){try{return JSON.parse(e)}catch{return{}}}var U={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};function Q(){return async(e,t)=>{for(let[s,l]of Object.entries(U))t.setHeader(s,l);if(e.method==="OPTIONS")return t.status(200).end();let r="",n={};if(e.method==="GET")r=e.query?.operationName||"",n=typeof e.query?.variables=="string"?O(e.query.variables):{};else{let s=typeof e.body=="string"?O(e.body):e.body||{};r=s.operationName||"",n=s.variables||{}}let o=await X(r,n),c=o.errors?.length?400:200;return t.status(c).json(o)}}async function B(e){let t="",r={},n=new URL(e.url);if(e.method==="GET"){t=n.searchParams.get("operationName")||"";let s=n.searchParams.get("variables");r=s?O(s):{}}else try{let s=await e.json();t=s.operationName||"",r=s.variables||{}}catch{}let o=await X(t,r),c=o.errors?.length?400:200;return new Response(JSON.stringify(o),{status:c,headers:{"Content-Type":"application/json",...U}})}function z(){return{GET:B,POST:B,OPTIONS:async()=>new Response(null,{status:204,headers:U})}}0&&(module.exports={createVreinApiHandler,createVreinRouteHandlers,vreinResolvers,vreinTypeDefs});
//# sourceMappingURL=graphql.js.map