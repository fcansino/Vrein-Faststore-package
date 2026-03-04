var O=new Map,D=new Map,G=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,X=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,Q=500,J=20;function M(e,r){let t=e.get(r);return t?Date.now()>t.expiresAt?(e.delete(r),null):t.data:null}function j(e,r,t,n){if(e.size>=Q){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(r,{data:t,expiresAt:Date.now()+n})}function z(e,r){let t=[];for(let n=0;n<e.length;n+=r)t.push(e.slice(n,n+r));return t}async function q(e,r){let t;try{t=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:u,searchTerm:s,lastProducts:l="",lastSku:p="",lastCategory:a="",cartProducts:g="",queryTerm:d="",zipcode:C=""}=t,i=C?`/${C}`:"";switch(n){case"home":return`/home/1/${a}/${l}/${g}/${d||""}${i}`;case"product":{if(!o)return`/home/1/${a}/${l}/${g}/${d||""}${i}`;let c="",I="",E="",b=l;l&&(b=l.split(",").filter(T=>T!==String(o)).join(","));try{let f=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,T=await fetch(f,{method:"GET",headers:{Accept:"application/json"}});if(T.ok){let A=await T.json();if(A?.[0]?.categoriesIds?.[0]){let v=A[0].categoriesIds[0],S=v.substring(1,v.length-1).split("/");c=S[S.length-1]||"",I=S.length<3?S[0]||"":S[S.length-2]||"",E=S.join(",")}}}catch(f){console.warn("[Vrein Resolver] Failed to fetch product categories:",f)}return`product/${o}/${c}/${I}/${E}/${b}/${p}/${g}${i}`}case"category":return`/category/${u||a}//${l}/${g}${i}`;case"search":return`/search/${s||""}/${a}${i}`;case"searchnoresult":return`/searchnoresult/${s||""}/${a}${i}`;default:return`/home/1/${a}/${l}/${g}/${d||""}${i}`}}function K(e,r){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0];if(r){let g=e.items.find(d=>String(d.itemId)===String(r));g&&(t=g)}let o=t.sellers?.[0]?.commertialOffer;if(!o)return null;let s=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),p=(e.categories||[])[0]||"",a=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca")},categories:p,categoryIds:a,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(t){return console.error("[Vrein Resolver] Error transforming product:",t),null}}function Z(e){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0],n=r.sellers?.[0]?.commertialOffer,u=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],l=s[0]||"",p=(e.categoriesIds||[])[0]||"",a=p?p.substring(1,p.length-1).replace(/\//g,","):"",g=s.map(d=>d.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:String(e.brand||""),categories:l,categoryIds:a,categoryNames:g,price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:u,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(r){return console.error("[Vrein Resolver] Error transforming full product:",r),null}}var $={Query:{vreinProducts:async(e,{sectionId:r,context:t},n)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",r);let u="https://s2.braindw.com/tracking/track",s="1",l="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",p=process.env.VTEX_ACCOUNT||"brain",a="",g="/";try{let m=JSON.parse(t||"{}");a=m.sessionGuid||"",g=m.path||"/"}catch{}let d=await q(t||"home//",p);console.log("[Vrein Resolver] Built u param:",d);let C=Date.now(),i=`${u}?HASH=${o}&branchOffice=${s}&u=${encodeURIComponent(d)}&hs=${C}&upath=${encodeURIComponent(g)}&sectionId=${encodeURIComponent(r)}`,c=`${o}:${s}:${r}:${d}`,I=M(O,c);if(I)console.log("[Vrein Resolver] Vrein API cache HIT for key:",c);else{console.log("[Vrein Resolver] Calling Vrein API:",i);let m=a?` guid=${a}; `:"",y=await fetch(i,{method:"GET",headers:{Accept:"application/json",...l?{bdw_secretcode:l,"bdw-secretcode":l}:{},bdw_sectionid:r,"X-VTEX-Use-Https":"true",...m?{Cookie:m}:{}}});if(!y.ok)return console.error("[Vrein Resolver] Vrein API error:",y.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:i};I=await y.json(),j(O,c,I,G)}let E=I,b=r.toLowerCase(),f=E.find(m=>m.Section?.toLowerCase()===b);if(!f||!f.Products||f.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",r),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:i};let T=f.Products,A=new Map,v=[];for(let m of T){let y=M(D,m);y?A.set(m,y):v.push(m)}let S=new Map;if(v.length>0){let m=z(v,J),y=await Promise.allSettled(m.map(async V=>{let _=V.map(w=>`fq=skuId:${w}`).join("&"),k=`https://${p}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${_}`,R=await fetch(k,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!R.ok)throw new Error(`HTTP ${R.status} for batch of ${V.length} SKUs`);let h=await R.json();return{chunk:V,products:h}}));for(let V of y)if(V.status==="fulfilled"){let{chunk:_,products:k}=V.value,R=new Map;for(let h of k)if(h?.items)for(let w of h.items)_.includes(String(w.itemId))&&R.set(String(w.itemId),h);for(let h of _){let w=R.get(h);if(!w)continue;let P=K(w,h);P&&(j(D,h,P,X),S.set(h,P))}}else console.warn("[Vrein Resolver] Batch fetch failed:",V.reason?.message||V.reason)}let N=[];for(let m of T){let y=A.get(m)||S.get(m);y&&N.push(y)}return console.log("[Vrein Resolver] Successfully fetched",N.length,"products"),{products:N,totalCount:N.length,title:f.Title||"",endpointName:f.Endpoint||"Contenidos",apiUrl:i}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:r,email:t,categoryId:n,whitelabel:o,sessionGuid:u})=>{try{let s=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!s)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let l="1",p="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",g=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:t||"",branchOffice:l,whitelabel:o||"",sectionid:r,idcategory:n||""})}`,d=u?`guid=${u};`:"",C=await fetch(g,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...p?{"bdw-secretcode":p}:{},...d?{Cookie:d}:{}}});if(!C.ok)return console.error("[Vrein Resolver] SmartImage API error:",C.status),{images:[],smartCountdown:null};let i=await C.json();if(!i||i.length===0||!i[0]?.Images)return{images:[],smartCountdown:null};let c=i[0],I=c.Images.map(b=>({title:c.Title||"",image:b.UrlDesktop||"",mobileImage:b.UrlMobile||"",link:b.Link||""})),E=c.SmartCountdown?{dateStart:c.SmartCountdown.DateStart||"",dateEnd:c.SmartCountdown.DateEnd||"",fontSizeDesktop:c.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:c.SmartCountdown.FontSizeMobile||14,positionDesktop:c.SmartCountdown.PositionDesktop||"2.2",positionMobile:c.SmartCountdown.PositionMobile||"2.2",fontColor:c.SmartCountdown.FontColor||"white",enabled:c.SmartCountdown.Enabled||!1,timeZoneOffset:c.SmartCountdown.TimeZoneOffset||0}:null;return{images:I,smartCountdown:E}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:r,skuId:t})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${t}`;else if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${r}`;else return null;let u=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!u.ok)return null;let s=await u.json();return!s||s.length===0?null:Z(s[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:r})=>{try{let t=process.env.VTEX_ACCOUNT||"brain",n=(r||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),u=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,s=await fetch(u,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let p=await s.json(),a=null;for(let g of n){if(a=p.find(d=>{let i=(d.url||"").split("/").filter(Boolean).pop()||"";return g.toLowerCase()===i.toLowerCase()}),!a)break;p=a.children||[]}return{categoryId:a?String(a.id):""}}catch(t){return console.error("[Vrein Resolver] Error resolving categoryId:",t),{categoryId:""}}}}};var x=`
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
`;var F={VreinProductsQuery:{resolver:$.Query.vreinProducts,responseField:"vreinProducts"},VreinImagesQuery:{resolver:$.Query.vreinImages,responseField:"vreinImages"},VreinProductDataQuery:{resolver:$.Query.vreinProductData,responseField:"vreinProductData"},VreinCategoryIdQuery:{resolver:$.Query.vreinCategoryId,responseField:"vreinCategoryId"}};async function B(e,r){let t=F[e];if(!t)return{errors:[{message:`[Vrein Handler] Unknown operation: "${e}". Available: ${Object.keys(F).join(", ")}`}]};try{let n=await t.resolver(null,r,{});return{data:{[t.responseField]:n}}}catch(n){return console.error(`[Vrein Handler] Error executing ${e}:`,n),{errors:[{message:n.message||"Internal server error"}]}}}function U(e){try{return JSON.parse(e)}catch{return{}}}var H={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};function W(){return async(e,r)=>{for(let[s,l]of Object.entries(H))r.setHeader(s,l);if(e.method==="OPTIONS")return r.status(200).end();let t="",n={};if(e.method==="GET")t=e.query?.operationName||"",n=typeof e.query?.variables=="string"?U(e.query.variables):{};else{let s=typeof e.body=="string"?U(e.body):e.body||{};t=s.operationName||"",n=s.variables||{}}let o=await B(t,n),u=o.errors?.length?400:200;return r.status(u).json(o)}}async function L(e){let r="",t={},n=new URL(e.url);if(e.method==="GET"){r=n.searchParams.get("operationName")||"";let s=n.searchParams.get("variables");t=s?U(s):{}}else try{let s=await e.json();r=s.operationName||"",t=s.variables||{}}catch{}let o=await B(r,t),u=o.errors?.length?400:200;return new Response(JSON.stringify(o),{status:u,headers:{"Content-Type":"application/json",...H}})}function Y(){return{GET:L,POST:L,OPTIONS:async()=>new Response(null,{status:204,headers:H})}}export{W as createVreinApiHandler,Y as createVreinRouteHandlers,$ as vreinResolvers,x as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map