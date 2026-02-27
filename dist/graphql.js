"use strict";var H=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var L=Object.getOwnPropertyNames;var B=Object.prototype.hasOwnProperty;var G=(e,t)=>{for(var r in t)H(e,r,{get:t[r],enumerable:!0})},X=(e,t,r,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of L(t))!B.call(e,n)&&n!==r&&H(e,n,{get:()=>t[n],enumerable:!(o=D(t,n))||o.enumerable});return e};var q=e=>X(H({},"__esModule",{value:!0}),e);var ee={};G(ee,{vreinResolvers:()=>M,vreinTypeDefs:()=>j});module.exports=q(ee);var U=new Map,P=new Map,z=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,Z=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,Q=500,K=20;function O(e,t){let r=e.get(t);return r?Date.now()>r.expiresAt?(e.delete(t),null):r.data:null}function F(e,t,r,o){if(e.size>=Q){let n=e.keys().next().value;n!==void 0&&e.delete(n)}e.set(t,{data:r,expiresAt:Date.now()+o})}function J(e,t){let r=[];for(let o=0;o<e.length;o+=t)r.push(e.slice(o,o+t));return r}async function W(e,t){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:o,productId:n,categoryId:m,searchTerm:s,lastProducts:c="",lastSku:u="",lastCategory:i="",cartProducts:l="",queryTerm:p="",zipcode:C=""}=r,g=C?`/${C}`:"";switch(o){case"home":return`/home/1/${i}/${c}/${l}/${p||""}${g}`;case"product":{if(!n)return`/home/1/${i}/${c}/${l}/${p||""}${g}`;let a="",I="",T="",V=c;c&&(V=c.split(",").filter(b=>b!==String(n)).join(","));try{let f=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${n}`,b=await fetch(f,{method:"GET",headers:{Accept:"application/json"}});if(b.ok){let _=await b.json();if(_?.[0]?.categoriesIds?.[0]){let $=_[0].categoriesIds[0],h=$.substring(1,$.length-1).split("/");a=h[h.length-1]||"",I=h.length<3?h[0]||"":h[h.length-2]||"",T=h.join(",")}}}catch(f){console.warn("[Vrein Resolver] Failed to fetch product categories:",f)}return`product/${n}/${a}/${I}/${T}/${V}/${u}/${l}${g}`}case"category":return`/category/${m||i}//${c}/${l}${g}`;case"search":return`/search/${s||""}/${i}${g}`;case"searchnoresult":return`/searchnoresult/${s||""}/${i}${g}`;default:return`/home/1/${i}/${c}/${l}/${p||""}${g}`}}function Y(e,t){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(t){let l=e.items.find(p=>String(p.itemId)===String(t));l&&(r=l)}let n=r.sellers?.[0]?.commertialOffer;if(!n)return null;let s=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),u=(e.categories||[])[0]||"",i=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca")},categories:u,categoryIds:i,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(n.Price)||0,listPrice:Number(n.ListPrice||n.Price)||0,availability:n.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function x(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],o=t.sellers?.[0]?.commertialOffer,m=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],c=s[0]||"",u=(e.categoriesIds||[])[0]||"",i=u?u.substring(1,u.length-1).replace(/\//g,","):"",l=s.map(p=>p.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:String(e.brand||""),categories:c,categoryIds:i,categoryNames:l,price:Number(o?.Price)||0,listPrice:Number(o?.ListPrice||o?.Price)||0,availability:o?.AvailableQuantity>0?"InStock":"OutOfStock",image:m,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}var M={Query:{vreinProducts:async(e,{sectionId:t,context:r},o)=>{try{if(!process.env.VREIN_HASH)throw new Error("[Vrein Resolver] VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let n=process.env.VREIN_API_URL||"https://s2.braindw.com/tracking/track",m=process.env.VREIN_HASH,s=process.env.VREIN_BRANCH_OFFICE||"1",c=process.env.VREIN_SECRET||"",u=process.env.VTEX_ACCOUNT||"brain",i="",l="/";try{let d=JSON.parse(r||"{}");i=d.sessionGuid||"",l=d.path||"/"}catch{}let p=await W(r||"home//",u);console.log("[Vrein Resolver] Built u param:",p);let C=Date.now(),g=`${n}?HASH=${m}&branchOffice=${s}&u=${encodeURIComponent(p)}&hs=${C}&upath=${encodeURIComponent(l)}&sectionId=${encodeURIComponent(t)}`,a=`${m}:${s}:${t}:${p}`,I=O(U,a);if(I)console.log("[Vrein Resolver] Vrein API cache HIT for key:",a);else{console.log("[Vrein Resolver] Calling Vrein API:",g);let d=i?` guid=${i}; `:"",S=await fetch(g,{method:"GET",headers:{Accept:"application/json",...c?{bdw_secretcode:c,"bdw-secretcode":c}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...d?{Cookie:d}:{}}});if(!S.ok)return console.error("[Vrein Resolver] Vrein API error:",S.status),{products:[],totalCount:0,title:""};I=await S.json(),F(U,a,I,z)}let T=I,V=t.toLowerCase(),f=T.find(d=>d.Section?.toLowerCase()===V);if(!f||!f.Products||f.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:""};let b=f.Products,_=new Map,$=[];for(let d of b){let S=O(P,d);S?_.set(d,S):$.push(d)}let h=new Map;if($.length>0){let d=J($,K),S=await Promise.allSettled(d.map(async E=>{let A=E.map(w=>`fq=skuId:${w}`).join("&"),k=`https://${u}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${A}`,R=await fetch(k,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!R.ok)throw new Error(`HTTP ${R.status} for batch of ${E.length} SKUs`);let y=await R.json();return{chunk:E,products:y}}));for(let E of S)if(E.status==="fulfilled"){let{chunk:A,products:k}=E.value,R=new Map;for(let y of k)if(y?.items)for(let w of y.items)A.includes(String(w.itemId))&&R.set(String(w.itemId),y);for(let y of A){let w=R.get(y);if(!w)continue;let v=Y(w,y);v&&(F(P,y,v,Z),h.set(y,v))}}else console.warn("[Vrein Resolver] Batch fetch failed:",E.reason?.message||E.reason)}let N=[];for(let d of b){let S=_.get(d)||h.get(d);S&&N.push(S)}return console.log("[Vrein Resolver] Successfully fetched",N.length,"products"),{products:N,totalCount:N.length,title:f.Title||"",endpointName:f.Endpoint||"Contenidos"}}catch(n){return console.error("[Vrein Resolver] Error:",n),{products:[],totalCount:0,title:"",endpointName:""}}},vreinImages:async(e,{sectionId:t,email:r,categoryId:o,whitelabel:n,sessionGuid:m})=>{try{if(!process.env.VREIN_HASH)throw new Error("[Vrein Resolver] VREIN_HASH env var is required but not set.");let s=process.env.VREIN_HASH,c=process.env.VREIN_BRANCH_OFFICE||"1",u=process.env.VREIN_SECRET||"",l=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:r||"",branchOffice:c,whitelabel:n||"",sectionid:t,idcategory:o||""})}`,p=m?`guid=${m};`:"",C=await fetch(l,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...u?{"bdw-secretcode":u}:{},...p?{Cookie:p}:{}}});if(!C.ok)return console.error("[Vrein Resolver] SmartImage API error:",C.status),{images:[],smartCountdown:null};let g=await C.json();if(!g||g.length===0||!g[0]?.Images)return{images:[],smartCountdown:null};let a=g[0],I=a.Images.map(V=>({title:a.Title||"",image:V.UrlDesktop||"",mobileImage:V.UrlMobile||"",link:V.Link||""})),T=a.SmartCountdown?{dateStart:a.SmartCountdown.DateStart||"",dateEnd:a.SmartCountdown.DateEnd||"",fontSizeDesktop:a.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:a.SmartCountdown.FontSizeMobile||14,positionDesktop:a.SmartCountdown.PositionDesktop||"2.2",positionMobile:a.SmartCountdown.PositionMobile||"2.2",fontColor:a.SmartCountdown.FontColor||"white",enabled:a.SmartCountdown.Enabled||!1,timeZoneOffset:a.SmartCountdown.TimeZoneOffset||0}:null;return{images:I,smartCountdown:T}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:r})=>{try{let o=process.env.VTEX_ACCOUNT||"brain",n="";if(r)n=`https://${o}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(t)n=`https://${o}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let m=await fetch(n,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!m.ok)return null;let s=await m.json();return!s||s.length===0?null:x(s[0])}catch(o){return console.error("[Vrein Resolver] Error fetching product data:",o),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",o=(t||"").split("/").filter(Boolean);if(o.length===0)return{categoryId:""};let n=Math.max(o.length,3),m=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${n}`,s=await fetch(m,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let u=await s.json(),i=null;for(let l of o){if(i=u.find(p=>{let g=(p.url||"").split("/").filter(Boolean).pop()||"";return l.toLowerCase()===g.toLowerCase()}),!i)break;u=i.children||[]}return{categoryId:i?String(i.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}}}};var j=`
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
`;0&&(module.exports={vreinResolvers,vreinTypeDefs});
//# sourceMappingURL=graphql.js.map