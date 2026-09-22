var v=new Map,D=new Map,O=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,L=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,M=500,B=20;function P(e,t){let r=e.get(t);return r?Date.now()>r.expiresAt?(e.delete(t),null):r.data:null}function H(e,t,r,n){if(e.size>=M){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(t,{data:r,expiresAt:Date.now()+n})}function F(e,t){let r=[];for(let n=0;n<e.length;n+=t)r.push(e.slice(n,n+t));return r}async function j(e,t){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:m,searchTerm:i,lastProducts:u="",lastSku:p="",lastCategory:s="",cartProducts:a="",queryTerm:g="",zipcode:I=""}=r,c=I?`/${I}`:"";switch(n){case"home":return`/home/1/${s}/${u}/${a}/${g||""}${c}`;case"product":{if(!o)return`/home/1/${s}/${u}/${a}/${g||""}${c}`;let l="",C="",T="",V=u;u&&(V=u.split(",").filter(E=>E!==String(o)).join(","));try{let S=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,E=await fetch(S,{method:"GET",headers:{Accept:"application/json"}});if(E.ok){let _=await E.json();if(_?.[0]?.categoriesIds?.[0]){let w=_[0].categoriesIds[0],y=w.substring(1,w.length-1).split("/");l=y[y.length-1]||"",C=y.length<3?y[0]||"":y[y.length-2]||"",T=y.join(",")}}}catch(S){console.warn("[Vrein Resolver] Failed to fetch product categories:",S)}return`product/${o}/${l}/${C}/${T}/${V}/${p}/${a}${c}`}case"category":return`/category/${m||s}//${u}/${a}${c}`;case"search":return`/search/${i||""}/${s}${c}`;case"searchnoresult":return`/searchnoresult/${i||""}/${s}${c}`;default:return`/home/1/${s}/${u}/${a}/${g||""}${c}`}}function X(e,t){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(t){let a=e.items.find(g=>String(g.itemId)===String(t));a&&(r=a)}else{let a=e.items.find(g=>(g.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);a&&(r=a)}let o=r.sellers?.[0]?.commertialOffer;if(!o)return null;let i=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),p=(e.categories||[])[0]||"",s=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:p,categoryIds:s,image:[{url:i||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(o.Installments)?o.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function G(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],n=t.sellers?.[0]?.commertialOffer,m=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),i=e.categories||[],u=i[0]||"",p=(e.categoriesIds||[])[0]||"",s=p?p.substring(1,p.length-1).replace(/\//g,","):"",a=i.map(g=>g.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:u,categoryIds:s,categoryNames:a,offers:{offers:[{price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(n?.Installments)?n.Installments:[]}]},price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:m,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}var q={Query:{vreinProducts:async(e,{sectionId:t,context:r},n)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let m="https://s2.braindw.com/tracking/track",i="1",u="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",p=process.env.VTEX_ACCOUNT||"brain",s="",a="/";try{let d=JSON.parse(r||"{}");s=d.sessionGuid||"",a=d.path||"/"}catch{}let g=await j(r||"home//",p);console.log("[Vrein Resolver] Built u param:",g);let I=Date.now(),c=`${m}?HASH=${o}&branchOffice=${i}&u=${encodeURIComponent(g)}&hs=${I}&upath=${encodeURIComponent(a)}&sectionId=${encodeURIComponent(t)}`,l=`${o}:${i}:${t}:${g}`,C=P(v,l);if(C)console.log("[Vrein Resolver] Vrein API cache HIT for key:",l);else{console.log("[Vrein Resolver] Calling Vrein API:",c);let d=s?` guid=${s}; `:"",f=await fetch(c,{method:"GET",headers:{Accept:"application/json",...u?{bdw_secretcode:u,"bdw-secretcode":u}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...d?{Cookie:d}:{}}});if(!f.ok)return console.error("[Vrein Resolver] Vrein API error:",f.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};C=await f.json(),H(v,l,C,O)}let T=C,V=t.toLowerCase(),S=T.find(d=>d.Section?.toLowerCase()===V);if(!S||!S.Products||S.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};let E=S.Products,_=new Map,w=[];for(let d of E){let f=P(D,d);f?_.set(d,f):w.push(d)}let y=new Map;if(w.length>0){let d=F(w,B),f=await Promise.allSettled(d.map(async b=>{let A=b.map(R=>`fq=productId:${R}`).join("&"),k=`https://${p}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${A}`,$=await fetch(k,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!$.ok)throw new Error(`HTTP ${$.status} for batch of ${b.length} productIds`);let h=await $.json();return{chunk:b,products:h}}));for(let b of f)if(b.status==="fulfilled"){let{chunk:A,products:k}=b.value,$=new Map;for(let h of k)h?.productId&&A.includes(String(h.productId))&&$.set(String(h.productId),h);for(let h of A){let R=$.get(h);if(!R)continue;let U=X(R);U&&(H(D,h,U,L),y.set(h,U))}}else console.warn("[Vrein Resolver] Batch fetch failed:",b.reason?.message||b.reason)}let N=[];for(let d of E){let f=_.get(d)||y.get(d);f&&f.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&N.push(f)}return console.log("[Vrein Resolver] Successfully fetched",N.length,"in-stock products"),{products:N,totalCount:N.length,title:S.Title||"",endpointName:S.Endpoint||"Contenidos",apiUrl:c}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:t,email:r,categoryId:n,whitelabel:o,sessionGuid:m})=>{try{let i=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!i)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let u="1",p="9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",a=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:i,email:r||"",branchOffice:u,whitelabel:o||"",sectionid:t,idcategory:n||""})}`,g=m?`guid=${m};`:"",I=await fetch(a,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...p?{"bdw-secretcode":p}:{},...g?{Cookie:g}:{}}});if(!I.ok)return console.error("[Vrein Resolver] SmartImage API error:",I.status),{images:[],smartCountdown:null};let c=await I.json();if(!c||c.length===0||!c[0]?.Images)return{images:[],smartCountdown:null};let l=c[0],C=l.Images.map(V=>({title:l.Title||"",image:V.UrlDesktop||"",mobileImage:V.UrlMobile||"",link:V.Link||""})),T=l.SmartCountdown?{dateStart:l.SmartCountdown.DateStart||"",dateEnd:l.SmartCountdown.DateEnd||"",fontSizeDesktop:l.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:l.SmartCountdown.FontSizeMobile||14,positionDesktop:l.SmartCountdown.PositionDesktop||"2.2",positionMobile:l.SmartCountdown.PositionMobile||"2.2",fontColor:l.SmartCountdown.FontColor||"white",enabled:l.SmartCountdown.Enabled||!1,timeZoneOffset:l.SmartCountdown.TimeZoneOffset||0}:null;return{images:C,smartCountdown:T}}catch(i){return console.error("[Vrein Resolver] Error fetching images:",i),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:r})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let m=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!m.ok)return null;let i=await m.json();return!i||i.length===0?null:G(i[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",n=(t||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),m=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,i=await fetch(m,{method:"GET",headers:{Accept:"application/json"}});if(!i.ok)return{categoryId:""};let p=await i.json(),s=null;for(let a of n){if(s=p.find(g=>{let c=(g.url||"").split("/").filter(Boolean).pop()||"";return a.toLowerCase()===c.toLowerCase()}),!s)break;p=s.children||[]}return{categoryId:s?String(s.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}}}};var z=`
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
`;export{q as vreinResolvers,z as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map