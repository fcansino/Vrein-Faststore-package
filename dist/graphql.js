"use strict";var H=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var q=Object.getOwnPropertyNames;var K=Object.prototype.hasOwnProperty;var Z=(e,t)=>{for(var r in t)H(e,r,{get:t[r],enumerable:!0})},x=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of q(t))!K.call(e,o)&&o!==r&&H(e,o,{get:()=>t[o],enumerable:!(n=z(t,o))||n.enumerable});return e};var W=e=>x(H({},"__esModule",{value:!0}),e);var ie={};Z(ie,{createVreinApiHandler:()=>Q,createVreinRouteHandlers:()=>J,vreinResolvers:()=>E,vreinTypeDefs:()=>L});module.exports=W(ie);var U=new Map,M=new Map,Y=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,ee=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,te=500,re=20;function j(e,t){let r=e.get(t);return r?Date.now()>r.expiresAt?(e.delete(t),null):r.data:null}function F(e,t,r,n){if(e.size>=te){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(t,{data:r,expiresAt:Date.now()+n})}function ne(e,t){let r=[];for(let n=0;n<e.length;n+=t)r.push(e.slice(n,n+t));return r}async function oe(e,t){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:l,searchTerm:s,lastProducts:c="",lastSku:p="",lastCategory:a="",cartProducts:u="",queryTerm:d="",zipcode:C=""}=r,g=C?`/${C}`:"";switch(n){case"home":return`/home/1/${a}/${c}/${u}/${d||""}${g}`;case"product":{if(!o)return`/home/1/${a}/${c}/${u}/${d||""}${g}`;let i="",I="",v="",b=c;c&&(b=c.split(",").filter(T=>T!==String(o)).join(","));try{let f=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,T=await fetch(f,{method:"GET",headers:{Accept:"application/json"}});if(T.ok){let A=await T.json();if(A?.[0]?.categoriesIds?.[0]){let R=A[0].categoriesIds[0],S=R.substring(1,R.length-1).split("/");i=S[S.length-1]||"",I=S.length<3?S[0]||"":S[S.length-2]||"",v=S.join(",")}}}catch(f){console.warn("[Vrein Resolver] Failed to fetch product categories:",f)}return`product/${o}/${i}/${I}/${v}/${b}/${p}/${u}${g}`}case"category":return`/category/${l||a}//${c}/${u}${g}`;case"search":return`/search/${s||""}/${a}${g}`;case"searchnoresult":return`/searchnoresult/${s||""}/${a}${g}`;default:return`/home/1/${a}/${c}/${u}/${d||""}${g}`}}function se(e,t){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(t){let u=e.items.find(d=>String(d.itemId)===String(t));u&&(r=u)}let o=r.sellers?.[0]?.commertialOffer;if(!o)return null;let s=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),p=(e.categories||[])[0]||"",a=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca")},categories:p,categoryIds:a,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function ae(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],n=t.sellers?.[0]?.commertialOffer,l=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],c=s[0]||"",p=(e.categoriesIds||[])[0]||"",a=p?p.substring(1,p.length-1).replace(/\//g,","):"",u=s.map(d=>d.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:String(e.brand||""),categories:c,categoryIds:a,categoryNames:u,price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:l,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}var E={Query:{vreinProducts:async(e,{sectionId:t,context:r},n)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let l="https://s2.braindw.com/tracking/track",s="1",c="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",p=process.env.VTEX_ACCOUNT||"brain",a="",u="/";try{let m=JSON.parse(r||"{}");a=m.sessionGuid||"",u=m.path||"/"}catch{}let d=await oe(r||"home//",p);console.log("[Vrein Resolver] Built u param:",d);let C=Date.now(),g=`${l}?HASH=${o}&branchOffice=${s}&u=${encodeURIComponent(d)}&hs=${C}&upath=${encodeURIComponent(u)}&sectionId=${encodeURIComponent(t)}`,i=`${o}:${s}:${t}:${d}`,I=j(U,i);if(I)console.log("[Vrein Resolver] Vrein API cache HIT for key:",i);else{console.log("[Vrein Resolver] Calling Vrein API:",g);let m=a?` guid=${a}; `:"",y=await fetch(g,{method:"GET",headers:{Accept:"application/json",...c?{bdw_secretcode:c,"bdw-secretcode":c}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!y.ok)return console.error("[Vrein Resolver] Vrein API error:",y.status),{products:[],totalCount:0,title:""};I=await y.json(),F(U,i,I,Y)}let v=I,b=t.toLowerCase(),f=v.find(m=>m.Section?.toLowerCase()===b);if(!f||!f.Products||f.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:""};let T=f.Products,A=new Map,R=[];for(let m of T){let y=j(M,m);y?A.set(m,y):R.push(m)}let S=new Map;if(R.length>0){let m=ne(R,re),y=await Promise.allSettled(m.map(async V=>{let N=V.map(w=>`fq=skuId:${w}`).join("&"),k=`https://${p}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${N}`,$=await fetch(k,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!$.ok)throw new Error(`HTTP ${$.status} for batch of ${V.length} SKUs`);let h=await $.json();return{chunk:V,products:h}}));for(let V of y)if(V.status==="fulfilled"){let{chunk:N,products:k}=V.value,$=new Map;for(let h of k)if(h?.items)for(let w of h.items)N.includes(String(w.itemId))&&$.set(String(w.itemId),h);for(let h of N){let w=$.get(h);if(!w)continue;let P=se(w,h);P&&(F(M,h,P,ee),S.set(h,P))}}else console.warn("[Vrein Resolver] Batch fetch failed:",V.reason?.message||V.reason)}let _=[];for(let m of T){let y=A.get(m)||S.get(m);y&&_.push(y)}return console.log("[Vrein Resolver] Successfully fetched",_.length,"products"),{products:_,totalCount:_.length,title:f.Title||"",endpointName:f.Endpoint||"Contenidos"}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:""}}},vreinImages:async(e,{sectionId:t,email:r,categoryId:n,whitelabel:o,sessionGuid:l})=>{try{let s=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!s)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let c="1",p="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",u=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:r||"",branchOffice:c,whitelabel:o||"",sectionid:t,idcategory:n||""})}`,d=l?`guid=${l};`:"",C=await fetch(u,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...p?{"bdw-secretcode":p}:{},...d?{Cookie:d}:{}}});if(!C.ok)return console.error("[Vrein Resolver] SmartImage API error:",C.status),{images:[],smartCountdown:null};let g=await C.json();if(!g||g.length===0||!g[0]?.Images)return{images:[],smartCountdown:null};let i=g[0],I=i.Images.map(b=>({title:i.Title||"",image:b.UrlDesktop||"",mobileImage:b.UrlMobile||"",link:b.Link||""})),v=i.SmartCountdown?{dateStart:i.SmartCountdown.DateStart||"",dateEnd:i.SmartCountdown.DateEnd||"",fontSizeDesktop:i.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:i.SmartCountdown.FontSizeMobile||14,positionDesktop:i.SmartCountdown.PositionDesktop||"2.2",positionMobile:i.SmartCountdown.PositionMobile||"2.2",fontColor:i.SmartCountdown.FontColor||"white",enabled:i.SmartCountdown.Enabled||!1,timeZoneOffset:i.SmartCountdown.TimeZoneOffset||0}:null;return{images:I,smartCountdown:v}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:r})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let l=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!l.ok)return null;let s=await l.json();return!s||s.length===0?null:ae(s[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",n=(t||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),l=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,s=await fetch(l,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let p=await s.json(),a=null;for(let u of n){if(a=p.find(d=>{let g=(d.url||"").split("/").filter(Boolean).pop()||"";return u.toLowerCase()===g.toLowerCase()}),!a)break;p=a.children||[]}return{categoryId:a?String(a.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}}}};var L=`
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
`;var B={VreinProductsQuery:{resolver:E.Query.vreinProducts,responseField:"vreinProducts"},VreinImagesQuery:{resolver:E.Query.vreinImages,responseField:"vreinImages"},VreinProductDataQuery:{resolver:E.Query.vreinProductData,responseField:"vreinProductData"},VreinCategoryIdQuery:{resolver:E.Query.vreinCategoryId,responseField:"vreinCategoryId"}};async function X(e,t){let r=B[e];if(!r)return{errors:[{message:`[Vrein Handler] Unknown operation: "${e}". Available: ${Object.keys(B).join(", ")}`}]};try{let n=await r.resolver(null,t,{});return{data:{[r.responseField]:n}}}catch(n){return console.error(`[Vrein Handler] Error executing ${e}:`,n),{errors:[{message:n.message||"Internal server error"}]}}}function O(e){try{return JSON.parse(e)}catch{return{}}}var D={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};function Q(){return async(e,t)=>{for(let[s,c]of Object.entries(D))t.setHeader(s,c);if(e.method==="OPTIONS")return t.status(200).end();let r="",n={};if(e.method==="GET")r=e.query?.operationName||"",n=typeof e.query?.variables=="string"?O(e.query.variables):{};else{let s=typeof e.body=="string"?O(e.body):e.body||{};r=s.operationName||"",n=s.variables||{}}let o=await X(r,n),l=o.errors?.length?400:200;return t.status(l).json(o)}}async function G(e){let t="",r={},n=new URL(e.url);if(e.method==="GET"){t=n.searchParams.get("operationName")||"";let s=n.searchParams.get("variables");r=s?O(s):{}}else try{let s=await e.json();t=s.operationName||"",r=s.variables||{}}catch{}let o=await X(t,r),l=o.errors?.length?400:200;return new Response(JSON.stringify(o),{status:l,headers:{"Content-Type":"application/json",...D}})}function J(){return{GET:G,POST:G,OPTIONS:async()=>new Response(null,{status:204,headers:D})}}0&&(module.exports={createVreinApiHandler,createVreinRouteHandlers,vreinResolvers,vreinTypeDefs});
//# sourceMappingURL=graphql.js.map