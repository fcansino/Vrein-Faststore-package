var R=new Map,A=new Map,$=new Map,U=new Map,F=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,j=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,G=Number(process.env.VREIN_POPUP_CONFIG_TTL_MS)||12e4,X=Number(process.env.VREIN_POPUP_CONTENT_TTL_MS)||3e5,q=500,z=20,T="1",E=process.env.VREIN_SECRET||"9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",O=process.env.NEXT_PUBLIC_VREIN_POPUP_URL||process.env.VREIN_POPUP_URL||"https://script-qa.vrein.ai";function _(e,t){let r=e.get(t);return r?Date.now()>r.expiresAt?(e.delete(t),null):r.data:null}function P(e,t,r,n){if(e.size>=q){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(t,{data:r,expiresAt:Date.now()+n})}function J(e,t){let r=[];for(let n=0;n<e.length;n+=t)r.push(e.slice(n,n+t));return r}async function H(e,t){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:m,searchTerm:s,lastProducts:u="",lastSku:p="",lastCategory:l="",cartProducts:g="",queryTerm:c="",zipcode:a=""}=r,i=a?`/${a}`:"";switch(n){case"home":return`/home/1/${l}/${u}/${g}/${c||""}${i}`;case"product":{if(!o)return`/home/1/${l}/${u}/${g}/${c||""}${i}`;let f="",I="",S="",b=u;u&&(b=u.split(",").filter(y=>y!==String(o)).join(","));try{let C=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,y=await fetch(C,{method:"GET",headers:{Accept:"application/json"}});if(y.ok){let d=await y.json();if(d?.[0]?.categoriesIds?.[0]){let w=d[0].categoriesIds[0],V=w.substring(1,w.length-1).split("/");f=V[V.length-1]||"",I=V.length<3?V[0]||"":V[V.length-2]||"",S=V.join(",")}}}catch(C){console.warn("[Vrein Resolver] Failed to fetch product categories:",C)}return`product/${o}/${f}/${I}/${S}/${b}/${p}/${g}${i}`}case"category":return`/category/${m||l}//${u}/${g}${i}`;case"search":return`/search/${s||""}/${l}${i}`;case"searchnoresult":return`/searchnoresult/${s||""}/${l}${i}`;default:return`/home/1/${l}/${u}/${g}/${c||""}${i}`}}function Q(e,t){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(t){let g=e.items.find(c=>String(c.itemId)===String(t));g&&(r=g)}else{let g=e.items.find(c=>(c.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);g&&(r=g)}let o=r.sellers?.[0]?.commertialOffer;if(!o)return null;let s=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),p=(e.categories||[])[0]||"",l=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:p,categoryIds:l,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(o.Installments)?o.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function K(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],n=t.sellers?.[0]?.commertialOffer,m=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],u=s[0]||"",p=(e.categoriesIds||[])[0]||"",l=p?p.substring(1,p.length-1).replace(/\//g,","):"",g=s.map(c=>c.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:u,categoryIds:l,categoryNames:g,offers:{offers:[{price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(n?.Installments)?n.Installments:[]}]},price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:m,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}async function L(e,t){let r=new Map,n=[];for(let s of e){let u=_(A,s);u?r.set(s,u):n.push(s)}let o=new Map;if(n.length>0){let s=J(n,z),u=await Promise.allSettled(s.map(async p=>{let l=p.map(i=>`fq=productId:${i}`).join("&"),g=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${l}`,c=await fetch(g,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!c.ok)throw new Error(`HTTP ${c.status} for batch of ${p.length} productIds`);let a=await c.json();return{chunk:p,products:a}}));for(let p of u)if(p.status==="fulfilled"){let{chunk:l,products:g}=p.value,c=new Map;for(let a of g)a?.productId&&l.includes(String(a.productId))&&c.set(String(a.productId),a);for(let a of l){let i=c.get(a);if(!i)continue;let f=Q(i);f&&(P(A,a,f,j),o.set(a,f))}}else console.warn("[Vrein Resolver] Batch fetch failed:",p.reason?.message||p.reason)}let m=[];for(let s of e){let u=r.get(s)||o.get(s);u&&u.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&m.push(u)}return console.log("[Vrein Resolver] Successfully fetched",m.length,"in-stock products"),m}function D(e){return String(e??"").trim().toLowerCase()==="true"}function Z(e,t){if(!D(e.Expiration))return!0;let r=e.AvailableFrom?Date.parse(String(e.AvailableFrom)):NaN;if(!Number.isNaN(r)&&t<r)return!1;let n=e.AvailableTo?Date.parse(String(e.AvailableTo)):NaN;return!(!Number.isNaN(n)&&t>n)}function W(e){return Array.isArray(e)?e.length>0?e[0]:null:e&&typeof e=="object"?e:null}var Y={Query:{vreinProducts:async(e,{sectionId:t,context:r},n)=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let m="https://s2.braindw.com/tracking/track",s=process.env.VTEX_ACCOUNT||"brain",u="",p="/";try{let y=JSON.parse(r||"{}");u=y.sessionGuid||"",p=y.path||"/"}catch{}let l=await H(r||"home//",s);console.log("[Vrein Resolver] Built u param:",l);let g=Date.now(),c=`${m}?HASH=${o}&branchOffice=${T}&u=${encodeURIComponent(l)}&hs=${g}&upath=${encodeURIComponent(p)}&sectionId=${encodeURIComponent(t)}`,a=`${o}:${T}:${t}:${l}`,i=_(R,a);if(i)console.log("[Vrein Resolver] Vrein API cache HIT for key:",a);else{console.log("[Vrein Resolver] Calling Vrein API:",c);let y=u?` guid=${u}; `:"",d=await fetch(c,{method:"GET",headers:{Accept:"application/json",...E?{bdw_secretcode:E,"bdw-secretcode":E}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...y?{Cookie:y}:{}}});if(!d.ok)return console.error("[Vrein Resolver] Vrein API error:",d.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};i=await d.json(),P(R,a,i,F)}let f=i,I=t.toLowerCase(),S=f.find(y=>y.Section?.toLowerCase()===I);if(!S||!S.Products||S.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:c};let b=S.Products,C=await L(b,s);return{products:C,totalCount:C.length,title:S.Title||"",endpointName:S.Endpoint||"Contenidos",apiUrl:c}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:t,email:r,categoryId:n,whitelabel:o,sessionGuid:m})=>{try{let s=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!s)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let p=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:r||"",branchOffice:T,whitelabel:o||"",sectionid:t,idcategory:n||""})}`,l=m?`guid=${m};`:"",g=await fetch(p,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...E?{"bdw-secretcode":E}:{},...l?{Cookie:l}:{}}});if(!g.ok)return console.error("[Vrein Resolver] SmartImage API error:",g.status),{images:[],smartCountdown:null};let c=await g.json();if(!c||c.length===0||!c[0]?.Images)return{images:[],smartCountdown:null};let a=c[0],i=a.Images.map(I=>({title:a.Title||"",image:I.UrlDesktop||"",mobileImage:I.UrlMobile||"",link:I.Link||""})),f=a.SmartCountdown?{dateStart:a.SmartCountdown.DateStart||"",dateEnd:a.SmartCountdown.DateEnd||"",fontSizeDesktop:a.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:a.SmartCountdown.FontSizeMobile||14,positionDesktop:a.SmartCountdown.PositionDesktop||"2.2",positionMobile:a.SmartCountdown.PositionMobile||"2.2",fontColor:a.SmartCountdown.FontColor||"white",enabled:a.SmartCountdown.Enabled||!1,timeZoneOffset:a.SmartCountdown.TimeZoneOffset||0}:null;return{images:i,smartCountdown:f}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:r})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let m=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!m.ok)return null;let s=await m.json();return!s||s.length===0?null:K(s[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",n=(t||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),m=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,s=await fetch(m,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let p=await s.json(),l=null;for(let g of n){if(l=p.find(c=>{let i=(c.url||"").split("/").filter(Boolean).pop()||"";return g.toLowerCase()===i.toLowerCase()}),!l)break;p=l.children||[]}return{categoryId:l?String(l.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}},vreinPopup:async(e,{section:t,context:r,email:n})=>{try{let o=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!o)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let m=process.env.VTEX_ACCOUNT||"brain",s=n||"",u="";try{u=JSON.parse(r||"{}").sessionGuid||""}catch{}let p=u?`guid=${u};`:"",l={Accept:"application/json",...E?{bdw_secretcode:E,"bdw-secretcode":E}:{},"X-VTEX-Use-Https":"true",...p?{Cookie:p}:{}},g=new URLSearchParams({HASH:o,email:s,branchOffice:T,whitelabel:"",sectionid:t.toLowerCase()}),c=`${O}/tracking/modalblock?${g}`,a=`${o}:${T}:${t}:${s}`,i=_($,a);if(!i){let d=await fetch(c,{method:"GET",headers:l});if(!d.ok)return console.warn("[Vrein Resolver] Popup modalblock API error:",d.status),null;i=await d.json(),P($,a,i,G)}if(!i)return console.warn("[Vrein Resolver] Popup no modalblock config for section:",t),null;let f=typeof i.Type=="string"?i.Type:"";if(f!=="modal"&&f!=="slider")return console.warn("[Vrein Resolver] Popup invalid or unrecognized type:",i.Type),null;if(!Z(i,Date.now()))return null;let I=f==="modal"&&D(i.ShowOnce),S=[i.Block1,i.Block2].filter(d=>typeof d=="string"&&d.trim()!=="");if(S.length===0)return console.warn("[Vrein Resolver] Popup no blocks configured for section:",t),null;let b=await H(r||"home//",m);b||(b="home//");let C=await Promise.allSettled(S.map(async d=>{let w=new URLSearchParams({HASH:o,email:s,branchOffice:T,whitelabel:"",sectionId:d,u:b}),V=`${O}/tracking/track?${w}`,N=`${o}:${d}:${t}:${s}:${b}`,h=_(U,N);if(!h){let v=await fetch(V,{method:"GET",headers:l});if(!v.ok)return console.warn("[Vrein Resolver] Popup track API error for block:",d,v.status),null;let M=await v.json();h=W(M),P(U,N,h,X)}if(!h)return null;let B=Array.isArray(h.Products)?h.Products:[],k=await L(B,m);return k.length===0?null:{blockId:d,title:h.Title||"",link:h.Link||"",gaEventAction:h.GaEventAction||"",gaEventCategory:h.GaEventCategory||"",gaEventLabel:h.GaEventLabel||"",products:k}})),y=[];for(let d of C)d.status==="fulfilled"&&d.value!==null?y.push(d.value):d.status==="rejected"&&console.warn("[Vrein Resolver] Popup block resolution failed:",d.reason?.message||d.reason);return y.length===0?(console.warn("[Vrein Resolver] Popup all blocks empty or failed for section:",t),null):{section:t,type:f,showOnce:I,blocks:y,apiUrl:c}}catch(o){return console.error("[Vrein Resolver] Error resolving popup:",o),null}}}};var x=`
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
`;export{Y as vreinResolvers,x as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map