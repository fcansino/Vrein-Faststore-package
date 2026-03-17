var H=new Map,D=new Map,G=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,X=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,Q=500,J=20;function M(e,r){let t=e.get(r);return t?Date.now()>t.expiresAt?(e.delete(r),null):t.data:null}function j(e,r,t,n){if(e.size>=Q){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(r,{data:t,expiresAt:Date.now()+n})}function z(e,r){let t=[];for(let n=0;n<e.length;n+=r)t.push(e.slice(n,n+r));return t}async function q(e,r){let t;try{t=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:g,searchTerm:s,lastProducts:u="",lastSku:d="",lastCategory:a="",cartProducts:i="",queryTerm:p="",zipcode:I=""}=t,c=I?`/${I}`:"";switch(n){case"home":return`/home/1/${a}/${u}/${i}/${p||""}${c}`;case"product":{if(!o)return`/home/1/${a}/${u}/${i}/${p||""}${c}`;let l="",C="",w="",V=u;u&&(V=u.split(",").filter(T=>T!==String(o)).join(","));try{let y=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,T=await fetch(y,{method:"GET",headers:{Accept:"application/json"}});if(T.ok){let $=await T.json();if($?.[0]?.categoriesIds?.[0]){let E=$[0].categoriesIds[0],S=E.substring(1,E.length-1).split("/");l=S[S.length-1]||"",C=S.length<3?S[0]||"":S[S.length-2]||"",w=S.join(",")}}}catch(y){console.warn("[Vrein Resolver] Failed to fetch product categories:",y)}return`product/${o}/${l}/${C}/${w}/${V}/${d}/${i}${c}`}case"category":return`/category/${g||a}//${u}/${i}${c}`;case"search":return`/search/${s||""}/${a}${c}`;case"searchnoresult":return`/searchnoresult/${s||""}/${a}${c}`;default:return`/home/1/${a}/${u}/${i}/${p||""}${c}`}}function Z(e,r){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0];if(r){let i=e.items.find(p=>String(p.itemId)===String(r));i&&(t=i)}else{let i=e.items.find(p=>(p.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);i&&(t=i)}let o=t.sellers?.[0]?.commertialOffer;if(!o)return null;let s=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),d=(e.categories||[])[0]||"",a=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca")},categories:d,categoryIds:a,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(o.Installments)?o.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(t){return console.error("[Vrein Resolver] Error transforming product:",t),null}}function K(e){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0],n=r.sellers?.[0]?.commertialOffer,g=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],u=s[0]||"",d=(e.categoriesIds||[])[0]||"",a=d?d.substring(1,d.length-1).replace(/\//g,","):"",i=s.map(p=>p.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:String(e.brand||""),categories:u,categoryIds:a,categoryNames:i,price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:g,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(r){return console.error("[Vrein Resolver] Error transforming full product:",r),null}}var R={Query:{vreinProducts:async(e,{sectionId:r,context:t},n)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",r);let g="https://s2.braindw.com/tracking/track",s="1",u="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",d=process.env.VTEX_ACCOUNT||"brain",a="",i="/";try{let m=JSON.parse(t||"{}");a=m.sessionGuid||"",i=m.path||"/"}catch{}let p=await q(t||"home//",d);console.log("[Vrein Resolver] Built u param:",p);let I=Date.now(),c=`${g}?HASH=${o}&branchOffice=${s}&u=${encodeURIComponent(p)}&hs=${I}&upath=${encodeURIComponent(i)}&sectionId=${encodeURIComponent(r)}`,l=`${o}:${s}:${r}:${p}`,C=M(H,l);if(C)console.log("[Vrein Resolver] Vrein API cache HIT for key:",l);else{console.log("[Vrein Resolver] Calling Vrein API:",c);let m=a?` guid=${a}; `:"",f=await fetch(c,{method:"GET",headers:{Accept:"application/json",...u?{bdw_secretcode:u,"bdw-secretcode":u}:{},bdw_sectionid:r,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!f.ok)return console.error("[Vrein Resolver] Vrein API error:",f.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};C=await f.json(),j(H,l,C,G)}let w=C,V=r.toLowerCase(),y=w.find(m=>m.Section?.toLowerCase()===V);if(!y||!y.Products||y.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",r),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};let T=y.Products,$=new Map,E=[];for(let m of T){let f=M(D,m);f?$.set(m,f):E.push(m)}let S=new Map;if(E.length>0){let m=z(E,J),f=await Promise.allSettled(m.map(async b=>{let N=b.map(_=>`fq=productId:${_}`).join("&"),P=`https://${d}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${N}`,v=await fetch(P,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!v.ok)throw new Error(`HTTP ${v.status} for batch of ${b.length} productIds`);let h=await v.json();return{chunk:b,products:h}}));for(let b of f)if(b.status==="fulfilled"){let{chunk:N,products:P}=b.value,v=new Map;for(let h of P)h?.productId&&N.includes(String(h.productId))&&v.set(String(h.productId),h);for(let h of N){let _=v.get(h);if(!_)continue;let k=Z(_);k&&(j(D,h,k,X),S.set(h,k))}}else console.warn("[Vrein Resolver] Batch fetch failed:",b.reason?.message||b.reason)}let A=[];for(let m of T){let f=$.get(m)||S.get(m);f&&f.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&A.push(f)}return console.log("[Vrein Resolver] Successfully fetched",A.length,"in-stock products"),{products:A,totalCount:A.length,title:y.Title||"",endpointName:y.Endpoint||"Contenidos",apiUrl:c}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:r,email:t,categoryId:n,whitelabel:o,sessionGuid:g})=>{try{let s=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!s)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let u="1",d="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",i=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:t||"",branchOffice:u,whitelabel:o||"",sectionid:r,idcategory:n||""})}`,p=g?`guid=${g};`:"",I=await fetch(i,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...d?{"bdw-secretcode":d}:{},...p?{Cookie:p}:{}}});if(!I.ok)return console.error("[Vrein Resolver] SmartImage API error:",I.status),{images:[],smartCountdown:null};let c=await I.json();if(!c||c.length===0||!c[0]?.Images)return{images:[],smartCountdown:null};let l=c[0],C=l.Images.map(V=>({title:l.Title||"",image:V.UrlDesktop||"",mobileImage:V.UrlMobile||"",link:V.Link||""})),w=l.SmartCountdown?{dateStart:l.SmartCountdown.DateStart||"",dateEnd:l.SmartCountdown.DateEnd||"",fontSizeDesktop:l.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:l.SmartCountdown.FontSizeMobile||14,positionDesktop:l.SmartCountdown.PositionDesktop||"2.2",positionMobile:l.SmartCountdown.PositionMobile||"2.2",fontColor:l.SmartCountdown.FontColor||"white",enabled:l.SmartCountdown.Enabled||!1,timeZoneOffset:l.SmartCountdown.TimeZoneOffset||0}:null;return{images:C,smartCountdown:w}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:r,skuId:t})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${t}`;else if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${r}`;else return null;let g=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!g.ok)return null;let s=await g.json();return!s||s.length===0?null:K(s[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:r})=>{try{let t=process.env.VTEX_ACCOUNT||"brain",n=(r||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),g=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,s=await fetch(g,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let d=await s.json(),a=null;for(let i of n){if(a=d.find(p=>{let c=(p.url||"").split("/").filter(Boolean).pop()||"";return i.toLowerCase()===c.toLowerCase()}),!a)break;d=a.children||[]}return{categoryId:a?String(a.id):""}}catch(t){return console.error("[Vrein Resolver] Error resolving categoryId:",t),{categoryId:""}}}}};var W=`
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
`;var F={VreinProductsQuery:{resolver:R.Query.vreinProducts,responseField:"vreinProducts"},VreinImagesQuery:{resolver:R.Query.vreinImages,responseField:"vreinImages"},VreinProductDataQuery:{resolver:R.Query.vreinProductData,responseField:"vreinProductData"},VreinCategoryIdQuery:{resolver:R.Query.vreinCategoryId,responseField:"vreinCategoryId"}};async function B(e,r){let t=F[e];if(!t)return{errors:[{message:`[Vrein Handler] Unknown operation: "${e}". Available: ${Object.keys(F).join(", ")}`}]};try{let n=await t.resolver(null,r,{});return{data:{[t.responseField]:n}}}catch(n){return console.error(`[Vrein Handler] Error executing ${e}:`,n),{errors:[{message:n.message||"Internal server error"}]}}}function O(e){try{return JSON.parse(e)}catch{return{}}}var U={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};function Y(){return async(e,r)=>{for(let[s,u]of Object.entries(U))r.setHeader(s,u);if(e.method==="OPTIONS")return r.status(200).end();let t="",n={};if(e.method==="GET")t=e.query?.operationName||"",n=typeof e.query?.variables=="string"?O(e.query.variables):{};else{let s=typeof e.body=="string"?O(e.body):e.body||{};t=s.operationName||"",n=s.variables||{}}let o=await B(t,n),g=o.errors?.length?400:200;return r.status(g).json(o)}}async function L(e){let r="",t={},n=new URL(e.url);if(e.method==="GET"){r=n.searchParams.get("operationName")||"";let s=n.searchParams.get("variables");t=s?O(s):{}}else try{let s=await e.json();r=s.operationName||"",t=s.variables||{}}catch{}let o=await B(r,t),g=o.errors?.length?400:200;return new Response(JSON.stringify(o),{status:g,headers:{"Content-Type":"application/json",...U}})}function x(){return{GET:L,POST:L,OPTIONS:async()=>new Response(null,{status:204,headers:U})}}export{Y as createVreinApiHandler,x as createVreinRouteHandlers,R as vreinResolvers,W as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map