var H=new Map,U=new Map,F=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,M=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,j=500,D=20;function P(e,t){let r=e.get(t);return r?Date.now()>r.expiresAt?(e.delete(t),null):r.data:null}function O(e,t,r,n){if(e.size>=j){let o=e.keys().next().value;o!==void 0&&e.delete(o)}e.set(t,{data:r,expiresAt:Date.now()+n})}function L(e,t){let r=[];for(let n=0;n<e.length;n+=t)r.push(e.slice(n,n+t));return r}async function B(e,t){let r;try{r=JSON.parse(e)}catch{return e||"home//"}let{pageType:n,productId:o,categoryId:m,searchTerm:s,lastProducts:c="",lastSku:u="",lastCategory:i="",cartProducts:l="",queryTerm:p="",zipcode:C=""}=r,g=C?`/${C}`:"";switch(n){case"home":return`/home/1/${i}/${c}/${l}/${p||""}${g}`;case"product":{if(!o)return`/home/1/${i}/${c}/${l}/${p||""}${g}`;let a="",I="",T="",V=c;c&&(V=c.split(",").filter(b=>b!==String(o)).join(","));try{let f=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${o}`,b=await fetch(f,{method:"GET",headers:{Accept:"application/json"}});if(b.ok){let _=await b.json();if(_?.[0]?.categoriesIds?.[0]){let $=_[0].categoriesIds[0],h=$.substring(1,$.length-1).split("/");a=h[h.length-1]||"",I=h.length<3?h[0]||"":h[h.length-2]||"",T=h.join(",")}}}catch(f){console.warn("[Vrein Resolver] Failed to fetch product categories:",f)}return`product/${o}/${a}/${I}/${T}/${V}/${u}/${l}${g}`}case"category":return`/category/${m||i}//${c}/${l}${g}`;case"search":return`/search/${s||""}/${i}${g}`;case"searchnoresult":return`/searchnoresult/${s||""}/${i}${g}`;default:return`/home/1/${i}/${c}/${l}/${p||""}${g}`}}function G(e,t){try{if(!e||!e.items||e.items.length===0)return null;let r=e.items[0];if(t){let l=e.items.find(p=>String(p.itemId)===String(t));l&&(r=l)}let o=r.sellers?.[0]?.commertialOffer;if(!o)return null;let s=(r.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),u=(e.categories||[])[0]||"",i=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(r.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca")},categories:u,categoryIds:i,image:[{url:s||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(o.Price)||0,listPrice:Number(o.ListPrice||o.Price)||0,availability:o.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(r){return console.error("[Vrein Resolver] Error transforming product:",r),null}}function X(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],n=t.sellers?.[0]?.commertialOffer,m=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),s=e.categories||[],c=s[0]||"",u=(e.categoriesIds||[])[0]||"",i=u?u.substring(1,u.length-1).replace(/\//g,","):"",l=s.map(p=>p.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:String(e.brand||""),categories:c,categoryIds:i,categoryNames:l,price:Number(n?.Price)||0,listPrice:Number(n?.ListPrice||n?.Price)||0,availability:n?.AvailableQuantity>0?"InStock":"OutOfStock",image:m,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}var q={Query:{vreinProducts:async(e,{sectionId:t,context:r},n)=>{try{if(!process.env.VREIN_HASH)throw new Error("[Vrein Resolver] VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let o=process.env.VREIN_API_URL||"https://s2.braindw.com/tracking/track",m=process.env.VREIN_HASH,s=process.env.VREIN_BRANCH_OFFICE||"1",c=process.env.VREIN_SECRET||"",u=process.env.VTEX_ACCOUNT||"brain",i="",l="/";try{let d=JSON.parse(r||"{}");i=d.sessionGuid||"",l=d.path||"/"}catch{}let p=await B(r||"home//",u);console.log("[Vrein Resolver] Built u param:",p);let C=Date.now(),g=`${o}?HASH=${m}&branchOffice=${s}&u=${encodeURIComponent(p)}&hs=${C}&upath=${encodeURIComponent(l)}&sectionId=${encodeURIComponent(t)}`,a=`${m}:${s}:${t}:${p}`,I=P(H,a);if(I)console.log("[Vrein Resolver] Vrein API cache HIT for key:",a);else{console.log("[Vrein Resolver] Calling Vrein API:",g);let d=i?` guid=${i}; `:"",S=await fetch(g,{method:"GET",headers:{Accept:"application/json",...c?{bdw_secretcode:c,"bdw-secretcode":c}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...d?{Cookie:d}:{}}});if(!S.ok)return console.error("[Vrein Resolver] Vrein API error:",S.status),{products:[],totalCount:0,title:""};I=await S.json(),O(H,a,I,F)}let T=I,V=t.toLowerCase(),f=T.find(d=>d.Section?.toLowerCase()===V);if(!f||!f.Products||f.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:""};let b=f.Products,_=new Map,$=[];for(let d of b){let S=P(U,d);S?_.set(d,S):$.push(d)}let h=new Map;if($.length>0){let d=L($,D),S=await Promise.allSettled(d.map(async E=>{let A=E.map(w=>`fq=skuId:${w}`).join("&"),k=`https://${u}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${A}`,R=await fetch(k,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!R.ok)throw new Error(`HTTP ${R.status} for batch of ${E.length} SKUs`);let y=await R.json();return{chunk:E,products:y}}));for(let E of S)if(E.status==="fulfilled"){let{chunk:A,products:k}=E.value,R=new Map;for(let y of k)if(y?.items)for(let w of y.items)A.includes(String(w.itemId))&&R.set(String(w.itemId),y);for(let y of A){let w=R.get(y);if(!w)continue;let v=G(w,y);v&&(O(U,y,v,M),h.set(y,v))}}else console.warn("[Vrein Resolver] Batch fetch failed:",E.reason?.message||E.reason)}let N=[];for(let d of b){let S=_.get(d)||h.get(d);S&&N.push(S)}return console.log("[Vrein Resolver] Successfully fetched",N.length,"products"),{products:N,totalCount:N.length,title:f.Title||"",endpointName:f.Endpoint||"Contenidos"}}catch(o){return console.error("[Vrein Resolver] Error:",o),{products:[],totalCount:0,title:"",endpointName:""}}},vreinImages:async(e,{sectionId:t,email:r,categoryId:n,whitelabel:o,sessionGuid:m})=>{try{if(!process.env.VREIN_HASH)throw new Error("[Vrein Resolver] VREIN_HASH env var is required but not set.");let s=process.env.VREIN_HASH,c=process.env.VREIN_BRANCH_OFFICE||"1",u=process.env.VREIN_SECRET||"",l=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:s,email:r||"",branchOffice:c,whitelabel:o||"",sectionid:t,idcategory:n||""})}`,p=m?`guid=${m};`:"",C=await fetch(l,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...u?{"bdw-secretcode":u}:{},...p?{Cookie:p}:{}}});if(!C.ok)return console.error("[Vrein Resolver] SmartImage API error:",C.status),{images:[],smartCountdown:null};let g=await C.json();if(!g||g.length===0||!g[0]?.Images)return{images:[],smartCountdown:null};let a=g[0],I=a.Images.map(V=>({title:a.Title||"",image:V.UrlDesktop||"",mobileImage:V.UrlMobile||"",link:V.Link||""})),T=a.SmartCountdown?{dateStart:a.SmartCountdown.DateStart||"",dateEnd:a.SmartCountdown.DateEnd||"",fontSizeDesktop:a.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:a.SmartCountdown.FontSizeMobile||14,positionDesktop:a.SmartCountdown.PositionDesktop||"2.2",positionMobile:a.SmartCountdown.PositionMobile||"2.2",fontColor:a.SmartCountdown.FontColor||"white",enabled:a.SmartCountdown.Enabled||!1,timeZoneOffset:a.SmartCountdown.TimeZoneOffset||0}:null;return{images:I,smartCountdown:T}}catch(s){return console.error("[Vrein Resolver] Error fetching images:",s),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:r})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o="";if(r)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${r}`;else if(t)o=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let m=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!m.ok)return null;let s=await m.json();return!s||s.length===0?null:X(s[0])}catch(n){return console.error("[Vrein Resolver] Error fetching product data:",n),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let r=process.env.VTEX_ACCOUNT||"brain",n=(t||"").split("/").filter(Boolean);if(n.length===0)return{categoryId:""};let o=Math.max(n.length,3),m=`https://${r}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${o}`,s=await fetch(m,{method:"GET",headers:{Accept:"application/json"}});if(!s.ok)return{categoryId:""};let u=await s.json(),i=null;for(let l of n){if(i=u.find(p=>{let g=(p.url||"").split("/").filter(Boolean).pop()||"";return l.toLowerCase()===g.toLowerCase()}),!i)break;u=i.children||[]}return{categoryId:i?String(i.id):""}}catch(r){return console.error("[Vrein Resolver] Error resolving categoryId:",r),{categoryId:""}}}}};var z=`
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
`;export{q as vreinResolvers,z as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map