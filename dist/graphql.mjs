var k=new Map,D=new Map,G=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,X=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,Q=500,J=20;function M(e,r){let t=e.get(r);return t?Date.now()>t.expiresAt?(e.delete(r),null):t.data:null}function j(e,r,t,n){if(e.size>=Q){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(r,{data:t,expiresAt:Date.now()+n})}function z(e,r){let t=[];for(let n=0;n<e.length;n+=r)t.push(e.slice(n,n+r));return t}async function q(e,r){let t;try{t=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:u,searchTerm:s,lastProducts:l="",lastSku:p="",lastCategory:a="",cartProducts:g="",queryTerm:d="",zipcode:I=""}=t,i=I?`/${I}`:"";switch(n){case"home":return`/home/1/${a}/${l}/${g}/${d||""}${i}`;case"product":{if(!o)return`/home/1/${a}/${l}/${g}/${d||""}${i}`;let c="",C="",w="",b=l;l&&(b=l.split(",").filter(T=>T!==String(o)).join(","));try{let f=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,T=await fetch(f,{method:"GET",headers:{Accept:"application/json"}});if(T.ok){let $=await T.json();if($?.[0]?.categoriesIds?.[0]){let E=$[0].categoriesIds[0],S=E.substring(1,E.length-1).split("/");c=S[S.length-1]||"",C=S.length<3?S[0]||"":S[S.length-2]||"",w=S.join(",")}}}catch(f){console.warn("[Vrein Resolver] Failed to fetch product categories:",f)}return`product/${o}/${c}/${C}/${w}/${b}/${p}/${g}${i}`}case"category":return`/category/${u||a}//${l}/${g}${i}`;case"search":return`/search/${s||""}/${a}${i}`;case"searchnoresult":return`/searchnoresult/${s||""}/${a}${i}`;default:return`/home/1/${a}/${l}/${g}/${d||""}${i}`}}function Z(e,r){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0];if(r){let g=e.items.find(d=>String(d.itemId)===String(r));g&&(t=g)}let o=t.sellers?.[0]?.commertialOffer;if(!o)return null;let s=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),p=(e.categories||[])[0]||"",a=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca")},categories:p,categoryIds:a,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(t){return console.error("[Vrein Resolver] Error transforming product:",t),null}}function K(e){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0],n=r.sellers?.[0]?.commertialOffer,u=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],l=s[0]||"",p=(e.categoriesIds||[])[0]||"",a=p?p.substring(1,p.length-1).replace(/\//g,","):"",g=s.map(d=>d.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:String(e.brand||""),categories:l,categoryIds:a,categoryNames:g,price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:u,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(r){return console.error("[Vrein Resolver] Error transforming full product:",r),null}}var R={Query:{vreinProducts:async(e,{sectionId:r,context:t},n)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",r);let u="https://s2.braindw.com/tracking/track",s="1",l="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",p=process.env.VTEX_ACCOUNT||"brain",a="",g="/";try{let m=JSON.parse(t||"{}");a=m.sessionGuid||"",g=m.path||"/"}catch{}let d=await q(t||"home//",p);console.log("[Vrein Resolver] Built u param:",d);let I=Date.now(),i=`${u}?HASH=${o}&branchOffice=${s}&u=${encodeURIComponent(d)}&hs=${I}&upath=${encodeURIComponent(g)}&sectionId=${encodeURIComponent(r)}`,c=`${o}:${s}:${r}:${d}`,C=M(k,c);if(C)console.log("[Vrein Resolver] Vrein API cache HIT for key:",c);else{console.log("[Vrein Resolver] Calling Vrein API:",i);let m=a?` guid=${a}; `:"",y=await fetch(i,{method:"GET",headers:{Accept:"application/json",...l?{bdw_secretcode:l,"bdw-secretcode":l}:{},bdw_sectionid:r,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!y.ok)return console.error("[Vrein Resolver] Vrein API error:",y.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:i};C=await y.json(),j(k,c,C,G)}let w=C,b=r.toLowerCase(),f=w.find(m=>m.Section?.toLowerCase()===b);if(!f||!f.Products||f.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",r),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:i};let T=f.Products,$=new Map,E=[];for(let m of T){let y=M(D,m);y?$.set(m,y):E.push(m)}let S=new Map;if(E.length>0){let m=z(E,J),y=await Promise.allSettled(m.map(async V=>{let N=V.map(_=>`fq=productId:${_}`).join("&"),P=`https://${p}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${N}`,v=await fetch(P,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!v.ok)throw new Error(`HTTP ${v.status} for batch of ${V.length} productIds`);let h=await v.json();return{chunk:V,products:h}}));for(let V of y)if(V.status==="fulfilled"){let{chunk:N,products:P}=V.value,v=new Map;for(let h of P)h?.productId&&N.includes(String(h.productId))&&v.set(String(h.productId),h);for(let h of N){let _=v.get(h);if(!_)continue;let U=Z(_);U&&(j(D,h,U,X),S.set(h,U))}}else console.warn("[Vrein Resolver] Batch fetch failed:",V.reason?.message||V.reason)}let A=[];for(let m of T){let y=$.get(m)||S.get(m);y&&A.push(y)}return console.log("[Vrein Resolver] Successfully fetched",A.length,"products"),{products:A,totalCount:A.length,title:f.Title||"",endpointName:f.Endpoint||"Contenidos",apiUrl:i}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:r,email:t,categoryId:n,whitelabel:o,sessionGuid:u})=>{try{let s=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!s)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let l="1",p="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",g=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:t||"",branchOffice:l,whitelabel:o||"",sectionid:r,idcategory:n||""})}`,d=u?`guid=${u};`:"",I=await fetch(g,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...p?{"bdw-secretcode":p}:{},...d?{Cookie:d}:{}}});if(!I.ok)return console.error("[Vrein Resolver] SmartImage API error:",I.status),{images:[],smartCountdown:null};let i=await I.json();if(!i||i.length===0||!i[0]?.Images)return{images:[],smartCountdown:null};let c=i[0],C=c.Images.map(b=>({title:c.Title||"",image:b.UrlDesktop||"",mobileImage:b.UrlMobile||"",link:b.Link||""})),w=c.SmartCountdown?{dateStart:c.SmartCountdown.DateStart||"",dateEnd:c.SmartCountdown.DateEnd||"",fontSizeDesktop:c.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:c.SmartCountdown.FontSizeMobile||14,positionDesktop:c.SmartCountdown.PositionDesktop||"2.2",positionMobile:c.SmartCountdown.PositionMobile||"2.2",fontColor:c.SmartCountdown.FontColor||"white",enabled:c.SmartCountdown.Enabled||!1,timeZoneOffset:c.SmartCountdown.TimeZoneOffset||0}:null;return{images:C,smartCountdown:w}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:r,skuId:t})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${t}`;else if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${r}`;else return null;let u=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!u.ok)return null;let s=await u.json();return!s||s.length===0?null:K(s[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:r})=>{try{let t=process.env.VTEX_ACCOUNT||"brain",n=(r||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),u=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,s=await fetch(u,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let p=await s.json(),a=null;for(let g of n){if(a=p.find(d=>{let i=(d.url||"").split("/").filter(Boolean).pop()||"";return g.toLowerCase()===i.toLowerCase()}),!a)break;p=a.children||[]}return{categoryId:a?String(a.id):""}}catch(t){return console.error("[Vrein Resolver] Error resolving categoryId:",t),{categoryId:""}}}}};var x=`
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
`;var F={VreinProductsQuery:{resolver:R.Query.vreinProducts,responseField:"vreinProducts"},VreinImagesQuery:{resolver:R.Query.vreinImages,responseField:"vreinImages"},VreinProductDataQuery:{resolver:R.Query.vreinProductData,responseField:"vreinProductData"},VreinCategoryIdQuery:{resolver:R.Query.vreinCategoryId,responseField:"vreinCategoryId"}};async function B(e,r){let t=F[e];if(!t)return{errors:[{message:`[Vrein Handler] Unknown operation: "${e}". Available: ${Object.keys(F).join(", ")}`}]};try{let n=await t.resolver(null,r,{});return{data:{[t.responseField]:n}}}catch(n){return console.error(`[Vrein Handler] Error executing ${e}:`,n),{errors:[{message:n.message||"Internal server error"}]}}}function H(e){try{return JSON.parse(e)}catch{return{}}}var O={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};function W(){return async(e,r)=>{for(let[s,l]of Object.entries(O))r.setHeader(s,l);if(e.method==="OPTIONS")return r.status(200).end();let t="",n={};if(e.method==="GET")t=e.query?.operationName||"",n=typeof e.query?.variables=="string"?H(e.query.variables):{};else{let s=typeof e.body=="string"?H(e.body):e.body||{};t=s.operationName||"",n=s.variables||{}}let o=await B(t,n),u=o.errors?.length?400:200;return r.status(u).json(o)}}async function L(e){let r="",t={},n=new URL(e.url);if(e.method==="GET"){r=n.searchParams.get("operationName")||"";let s=n.searchParams.get("variables");t=s?H(s):{}}else try{let s=await e.json();r=s.operationName||"",t=s.variables||{}}catch{}let o=await B(r,t),u=o.errors?.length?400:200;return new Response(JSON.stringify(o),{status:u,headers:{"Content-Type":"application/json",...O}})}function Y(){return{GET:L,POST:L,OPTIONS:async()=>new Response(null,{status:204,headers:O})}}export{W as createVreinApiHandler,Y as createVreinRouteHandlers,R as vreinResolvers,x as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map