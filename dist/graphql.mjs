var H=new Map,D=new Map,G=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,X=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,Q=500,J=20;function M(e,n){let t=e.get(n);return t?Date.now()>t.expiresAt?(e.delete(n),null):t.data:null}function j(e,n,t,r){if(e.size>=Q){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(n,{data:t,expiresAt:Date.now()+r})}function z(e,n){let t=[];for(let r=0;r<e.length;r+=n)t.push(e.slice(r,r+n));return t}async function q(e,n){let t;try{t=JSON.parse(e)}catch{return e||"home//"}let{pageType:r,productId:o,categoryId:g,searchTerm:s,lastProducts:u="",lastSku:d="",lastCategory:a="",cartProducts:i="",queryTerm:p="",zipcode:I=""}=t,c=I?`/${I}`:"";switch(r){case"home":return`/home/1/${a}/${u}/${i}/${p||""}${c}`;case"product":{if(!o)return`/home/1/${a}/${u}/${i}/${p||""}${c}`;let l="",C="",w="",V=u;u&&(V=u.split(",").filter(T=>T!==String(o)).join(","));try{let y=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,T=await fetch(y,{method:"GET",headers:{Accept:"application/json"}});if(T.ok){let A=await T.json();if(A?.[0]?.categoriesIds?.[0]){let E=A[0].categoriesIds[0],S=E.substring(1,E.length-1).split("/");l=S[S.length-1]||"",C=S.length<3?S[0]||"":S[S.length-2]||"",w=S.join(",")}}}catch(y){console.warn("[Vrein Resolver] Failed to fetch product categories:",y)}return`product/${o}/${l}/${C}/${w}/${V}/${d}/${i}${c}`}case"category":return`/category/${g||a}//${u}/${i}${c}`;case"search":return`/search/${s||""}/${a}${c}`;case"searchnoresult":return`/searchnoresult/${s||""}/${a}${c}`;default:return`/home/1/${a}/${u}/${i}/${p||""}${c}`}}function Z(e,n){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0];if(n){let i=e.items.find(p=>String(p.itemId)===String(n));i&&(t=i)}else{let i=e.items.find(p=>(p.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);i&&(t=i)}let o=t.sellers?.[0]?.commertialOffer;if(!o)return null;let s=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),d=(e.categories||[])[0]||"",a=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:d,categoryIds:a,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(o.Installments)?o.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(t){return console.error("[Vrein Resolver] Error transforming product:",t),null}}function K(e){try{if(!e||!e.items||e.items.length===0)return null;let n=e.items[0],r=n.sellers?.[0]?.commertialOffer,g=(n.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],u=s[0]||"",d=(e.categoriesIds||[])[0]||"",a=d?d.substring(1,d.length-1).replace(/\//g,","):"",i=s.map(p=>p.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(n.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:u,categoryIds:a,categoryNames:i,offers:{offers:[{price:Number(r?.Price)||0,listPrice:Number(r?.ListPrice||r?.Price)||0,availability:r?.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(r?.Installments)?r.Installments:[]}]},price:Number(r?.Price)||0,listPrice:Number(r?.ListPrice||r?.Price)||0,availability:r?.AvailableQuantity>0?"InStock":"OutOfStock",image:g,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(n){return console.error("[Vrein Resolver] Error transforming full product:",n),null}}var R={Query:{vreinProducts:async(e,{sectionId:n,context:t},r)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",n);let g="https://s2.braindw.com/tracking/track",s="1",u="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",d=process.env.VTEX_ACCOUNT||"brain",a="",i="/";try{let m=JSON.parse(t||"{}");a=m.sessionGuid||"",i=m.path||"/"}catch{}let p=await q(t||"home//",d);console.log("[Vrein Resolver] Built u param:",p);let I=Date.now(),c=`${g}?HASH=${o}&branchOffice=${s}&u=${encodeURIComponent(p)}&hs=${I}&upath=${encodeURIComponent(i)}&sectionId=${encodeURIComponent(n)}`,l=`${o}:${s}:${n}:${p}`,C=M(H,l);if(C)console.log("[Vrein Resolver] Vrein API cache HIT for key:",l);else{console.log("[Vrein Resolver] Calling Vrein API:",c);let m=a?` guid=${a}; `:"",f=await fetch(c,{method:"GET",headers:{Accept:"application/json",...u?{bdw_secretcode:u,"bdw-secretcode":u}:{},bdw_sectionid:n,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!f.ok)return console.error("[Vrein Resolver] Vrein API error:",f.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};C=await f.json(),j(H,l,C,G)}let w=C,V=n.toLowerCase(),y=w.find(m=>m.Section?.toLowerCase()===V);if(!y||!y.Products||y.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",n),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};let T=y.Products,A=new Map,E=[];for(let m of T){let f=M(D,m);f?A.set(m,f):E.push(m)}let S=new Map;if(E.length>0){let m=z(E,J),f=await Promise.allSettled(m.map(async b=>{let N=b.map(_=>`fq=productId:${_}`).join("&"),U=`https://${d}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${N}`,v=await fetch(U,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!v.ok)throw new Error(`HTTP ${v.status} for batch of ${b.length} productIds`);let h=await v.json();return{chunk:b,products:h}}));for(let b of f)if(b.status==="fulfilled"){let{chunk:N,products:U}=b.value,v=new Map;for(let h of U)h?.productId&&N.includes(String(h.productId))&&v.set(String(h.productId),h);for(let h of N){let _=v.get(h);if(!_)continue;let k=Z(_);k&&(j(D,h,k,X),S.set(h,k))}}else console.warn("[Vrein Resolver] Batch fetch failed:",b.reason?.message||b.reason)}let $=[];for(let m of T){let f=A.get(m)||S.get(m);f&&f.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&$.push(f)}return console.log("[Vrein Resolver] Successfully fetched",$.length,"in-stock products"),{products:$,totalCount:$.length,title:y.Title||"",endpointName:y.Endpoint||"Contenidos",apiUrl:c}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:n,email:t,categoryId:r,whitelabel:o,sessionGuid:g})=>{try{let s=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!s)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let u="1",d="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",i=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:t||"",branchOffice:u,whitelabel:o||"",sectionid:n,idcategory:r||""})}`,p=g?`guid=${g};`:"",I=await fetch(i,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...d?{"bdw-secretcode":d}:{},...p?{Cookie:p}:{}}});if(!I.ok)return console.error("[Vrein Resolver] SmartImage API error:",I.status),{images:[],smartCountdown:null};let c=await I.json();if(!c||c.length===0||!c[0]?.Images)return{images:[],smartCountdown:null};let l=c[0],C=l.Images.map(V=>({title:l.Title||"",image:V.UrlDesktop||"",mobileImage:V.UrlMobile||"",link:V.Link||""})),w=l.SmartCountdown?{dateStart:l.SmartCountdown.DateStart||"",dateEnd:l.SmartCountdown.DateEnd||"",fontSizeDesktop:l.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:l.SmartCountdown.FontSizeMobile||14,positionDesktop:l.SmartCountdown.PositionDesktop||"2.2",positionMobile:l.SmartCountdown.PositionMobile||"2.2",fontColor:l.SmartCountdown.FontColor||"white",enabled:l.SmartCountdown.Enabled||!1,timeZoneOffset:l.SmartCountdown.TimeZoneOffset||0}:null;return{images:C,smartCountdown:w}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:n,skuId:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",o="";if(t)o=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${t}`;else if(n)o=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${n}`;else return null;let g=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!g.ok)return null;let s=await g.json();return!s||s.length===0?null:K(s[0])}catch(r){return console.error("[Vrein Resolver] Error fetching product data:",r),null}},vreinCategoryId:async(e,{pathname:n})=>{try{let t=process.env.VTEX_ACCOUNT||"brain",r=(n||"").split("/").filter(Boolean);if(r.length===0)return{categoryId:""};let o=Math.max(r.length,3),g=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,s=await fetch(g,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let d=await s.json(),a=null;for(let i of r){if(a=d.find(p=>{let c=(p.url||"").split("/").filter(Boolean).pop()||"";return i.toLowerCase()===c.toLowerCase()}),!a)break;d=a.children||[]}return{categoryId:a?String(a.id):""}}catch(t){return console.error("[Vrein Resolver] Error resolving categoryId:",t),{categoryId:""}}}}};var W=`
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
`;var F={VreinProductsQuery:{resolver:R.Query.vreinProducts,responseField:"vreinProducts"},VreinImagesQuery:{resolver:R.Query.vreinImages,responseField:"vreinImages"},VreinProductDataQuery:{resolver:R.Query.vreinProductData,responseField:"vreinProductData"},VreinCategoryIdQuery:{resolver:R.Query.vreinCategoryId,responseField:"vreinCategoryId"}};async function B(e,n){let t=F[e];if(!t)return{errors:[{message:`[Vrein Handler] Unknown operation: "${e}". Available: ${Object.keys(F).join(", ")}`}]};try{let r=await t.resolver(null,n,{});return{data:{[t.responseField]:r}}}catch(r){return console.error(`[Vrein Handler] Error executing ${e}:`,r),{errors:[{message:r.message||"Internal server error"}]}}}function O(e){try{return JSON.parse(e)}catch{return{}}}var P={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};function Y(){return async(e,n)=>{for(let[s,u]of Object.entries(P))n.setHeader(s,u);if(e.method==="OPTIONS")return n.status(200).end();let t="",r={};if(e.method==="GET")t=e.query?.operationName||"",r=typeof e.query?.variables=="string"?O(e.query.variables):{};else{let s=typeof e.body=="string"?O(e.body):e.body||{};t=s.operationName||"",r=s.variables||{}}let o=await B(t,r),g=o.errors?.length?400:200;return n.status(g).json(o)}}async function L(e){let n="",t={},r=new URL(e.url);if(e.method==="GET"){n=r.searchParams.get("operationName")||"";let s=r.searchParams.get("variables");t=s?O(s):{}}else try{let s=await e.json();n=s.operationName||"",t=s.variables||{}}catch{}let o=await B(n,t),g=o.errors?.length?400:200;return new Response(JSON.stringify(o),{status:g,headers:{"Content-Type":"application/json",...P}})}function x(){return{GET:L,POST:L,OPTIONS:async()=>new Response(null,{status:204,headers:P})}}export{Y as createVreinApiHandler,x as createVreinRouteHandlers,R as vreinResolvers,W as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map