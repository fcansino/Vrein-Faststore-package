var D=new Map,M=new Map,B=new Map,G=new Map,F=new Map,Q=Number(process.env.VREIN_CACHE_TTL_MS)||6e4,Z=Number(process.env.VTEX_CACHE_TTL_MS)||3e5,W=Number(process.env.VREIN_POPUP_CONFIG_TTL_MS)||12e4,j=Number(process.env.VREIN_POPUP_CONTENT_TTL_MS)||3e5,Y=500,x=20,P="1",w=process.env.VREIN_SECRET||"9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3",R=process.env.NEXT_PUBLIC_VREIN_POPUP_URL||process.env.VREIN_POPUP_URL||"https://script-qa.vrein.ai";function v(e,t){let n=e.get(t);return n?Date.now()>n.expiresAt?(e.delete(t),null):n.data:null}function N(e,t,n,o){if(e.size>=Y){let r=e.keys().next().value;r!==void 0&&e.delete(r)}e.set(t,{data:n,expiresAt:Date.now()+o})}function ee(e,t){let n=[];for(let o=0;o<e.length;o+=t)n.push(e.slice(o,o+t));return n}async function X(e,t){let n;try{n=JSON.parse(e)}catch{return e||"home//"}let{pageType:o,productId:r,categoryId:d,searchTerm:a,lastProducts:p="",lastSku:g="",lastCategory:c="",cartProducts:m="",queryTerm:l="",zipcode:s=""}=n,i=s?`/${s}`:"";switch(o){case"home":return`/home/1/${c}/${p}/${m}/${l||""}${i}`;case"product":{if(!r)return`/home/1/${c}/${p}/${m}/${l||""}${i}`;let f="",C="",h="",I=p;p&&(I=p.split(",").filter(y=>y!==String(r)).join(","));try{let T=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${r}`,y=await fetch(T,{method:"GET",headers:{Accept:"application/json"}});if(y.ok){let u=await y.json();if(u?.[0]?.categoriesIds?.[0]){let k=u[0].categoriesIds[0],V=k.substring(1,k.length-1).split("/");f=V[V.length-1]||"",C=V.length<3?V[0]||"":V[V.length-2]||"",h=V.join(",")}}}catch(T){console.warn("[Vrein Resolver] Failed to fetch product categories:",T)}return`product/${r}/${f}/${C}/${h}/${I}/${g}/${m}${i}`}case"category":return`/category/${d||c}//${p}/${m}${i}`;case"search":return`/search/${a||""}/${c}${i}`;case"searchnoresult":return`/searchnoresult/${a||""}/${c}${i}`;default:return`/home/1/${c}/${p}/${m}/${l||""}${i}`}}function te(e,t){try{if(!e||!e.items||e.items.length===0)return null;let n=e.items[0];if(t){let m=e.items.find(l=>String(l.itemId)===String(t));m&&(n=m)}else{let m=e.items.find(l=>(l.sellers?.[0]?.commertialOffer?.AvailableQuantity||0)>0);m&&(n=m)}let r=n.sellers?.[0]?.commertialOffer;if(!r)return null;let a=(n.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),g=(e.categories||[])[0]||"",c=(e.categoriesIds||[]).join(",");return{id:String(e.productId||""),sku:String(n.itemId||""),slug:String(e.linkText||e.productId||""),name:String(e.productName||"Producto sin nombre"),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:g,categoryIds:c,image:[{url:a||"https://via.placeholder.com/300x300",alternateName:String(e.productName||"Producto")}],offers:{offers:[{price:Number(r.Price)||0,listPrice:Number(r.ListPrice||r.Price)||0,availability:r.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(r.Installments)?r.Installments:[]}]},isVariantOf:{productGroupID:String(e.productId||""),name:String(e.productName||"Producto sin nombre")}}}catch(n){return console.error("[Vrein Resolver] Error transforming product:",n),null}}function re(e){try{if(!e||!e.items||e.items.length===0)return null;let t=e.items[0],o=t.sellers?.[0]?.commertialOffer,d=(t.images?.[0]?.imageUrl||"").replace(/-55-55/g,"-300-300"),a=e.categories||[],p=a[0]||"",g=(e.categoriesIds||[])[0]||"",c=g?g.substring(1,g.length-1).replace(/\//g,","):"",m=a.map(l=>l.replace(/^\//,"").replace(/\/$/,"")).join(" > ");return{id:String(e.productId||""),sku:String(t.itemId||""),slug:String(e.linkText||""),name:String(e.productName||""),description:String(e.description||""),brand:{name:String(e.brand||"Sin marca"),id:String(e.brandId||""),imageUrl:String(e.brandImageUrl||"")},categories:p,categoryIds:c,categoryNames:m,offers:{offers:[{price:Number(o?.Price)||0,listPrice:Number(o?.ListPrice||o?.Price)||0,availability:o?.AvailableQuantity>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",installments:Array.isArray(o?.Installments)?o.Installments:[]}]},price:Number(o?.Price)||0,listPrice:Number(o?.ListPrice||o?.Price)||0,availability:o?.AvailableQuantity>0?"InStock":"OutOfStock",image:d,url:`/${e.linkText}/p`,clusterHighlights:e.clusterHighlights||{},productClusters:e.productClusters||{},allSpecifications:e.allSpecifications||[],allSpecificationsGroups:e.allSpecificationsGroups||[]}}catch(t){return console.error("[Vrein Resolver] Error transforming full product:",t),null}}async function q(e,t){let n=new Map,o=[];for(let a of e){let p=v(M,a);p?n.set(a,p):o.push(a)}let r=new Map;if(o.length>0){let a=ee(o,x),p=await Promise.allSettled(a.map(async g=>{let c=g.map(i=>`fq=productId:${i}`).join("&"),m=`https://${t}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${c}`,l=await fetch(m,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!l.ok)throw new Error(`HTTP ${l.status} for batch of ${g.length} productIds`);let s=await l.json();return{chunk:g,products:s}}));for(let g of p)if(g.status==="fulfilled"){let{chunk:c,products:m}=g.value,l=new Map;for(let s of m)s?.productId&&c.includes(String(s.productId))&&l.set(String(s.productId),s);for(let s of c){let i=l.get(s);if(!i)continue;let f=te(i);f&&(N(M,s,f,Z),r.set(s,f))}}else console.warn("[Vrein Resolver] Batch fetch failed:",g.reason?.message||g.reason)}let d=[];for(let a of e){let p=n.get(a)||r.get(a);p&&p.offers?.offers?.[0]?.availability==="https://schema.org/InStock"&&d.push(p)}return console.log("[Vrein Resolver] Successfully fetched",d.length,"in-stock products"),d}function z(e){return String(e??"").trim().toLowerCase()==="true"}function ne(e,t){if(!z(e.Expiration))return!0;let n=e.AvailableFrom?Date.parse(String(e.AvailableFrom)):NaN;if(!Number.isNaN(n)&&t<n)return!1;let o=e.AvailableTo?Date.parse(String(e.AvailableTo)):NaN;return!(!Number.isNaN(o)&&t>o)}function $(e){return Array.isArray(e)?e.length>0?e[0]:null:e&&typeof e=="object"?e:null}var oe=/IMAGES/i;function ae(e){return oe.test(e)}var se={Query:{vreinProducts:async(e,{sectionId:t,context:n},o)=>{try{let r=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!r)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");console.log("[Vrein Resolver] Fetching recommendations for section:",t);let d="https://s2.braindw.com/tracking/track",a=process.env.VTEX_ACCOUNT||"brain",p="",g="/";try{let y=JSON.parse(n||"{}");p=y.sessionGuid||"",g=y.path||"/"}catch{}let c=await X(n||"home//",a);console.log("[Vrein Resolver] Built u param:",c);let m=Date.now(),l=`${d}?HASH=${r}&branchOffice=${P}&u=${encodeURIComponent(c)}&hs=${m}&upath=${encodeURIComponent(g)}&sectionId=${encodeURIComponent(t)}`,s=`${r}:${P}:${t}:${c}`,i=v(D,s);if(i)console.log("[Vrein Resolver] Vrein API cache HIT for key:",s);else{console.log("[Vrein Resolver] Calling Vrein API:",l);let y=p?` guid=${p}; `:"",u=await fetch(l,{method:"GET",headers:{Accept:"application/json",...w?{bdw_secretcode:w,"bdw-secretcode":w}:{},bdw_sectionid:t,"X-VTEX-Use-Https":"true",...y?{Cookie:y}:{}}});if(!u.ok)return console.error("[Vrein Resolver] Vrein API error:",u.status),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:l};i=await u.json(),N(D,s,i,Q)}let f=i,C=t.toLowerCase(),h=f.find(y=>y.Section?.toLowerCase()===C);if(!h||!h.Products||h.Products.length===0)return console.warn("[Vrein Resolver] Section not found or empty:",t),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:l};let I=h.Products,T=await q(I,a);return{products:T,totalCount:T.length,title:h.Title||"",endpointName:h.Endpoint||"Contenidos",apiUrl:l}}catch(r){return console.error("[Vrein Resolver] Error:",r),{products:[],totalCount:0,title:"",endpointName:"",apiUrl:""}}},vreinImages:async(e,{sectionId:t,email:n,categoryId:o,whitelabel:r,sessionGuid:d})=>{try{let a=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!a)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let g=`https://s2.braindw.com/tracking/SmartImage?${new URLSearchParams({HASH:a,email:n||"",branchOffice:P,whitelabel:r||"",sectionid:t,idcategory:o||""})}`,c=d?`guid=${d};`:"",m=await fetch(g,{method:"GET",headers:{Accept:"application/json","X-VTEX-Use-Https":"true","Cache-Control":"no-store",...w?{"bdw-secretcode":w}:{},...c?{Cookie:c}:{}}});if(!m.ok)return console.error("[Vrein Resolver] SmartImage API error:",m.status),{images:[],smartCountdown:null};let l=await m.json();if(!l||l.length===0||!l[0]?.Images)return{images:[],smartCountdown:null};let s=l[0],i=s.Images.map(C=>({title:s.Title||"",image:C.UrlDesktop||"",mobileImage:C.UrlMobile||"",link:C.Link||""})),f=s.SmartCountdown?{dateStart:s.SmartCountdown.DateStart||"",dateEnd:s.SmartCountdown.DateEnd||"",fontSizeDesktop:s.SmartCountdown.FontSizeDesktop||20,fontSizeMobile:s.SmartCountdown.FontSizeMobile||14,positionDesktop:s.SmartCountdown.PositionDesktop||"2.2",positionMobile:s.SmartCountdown.PositionMobile||"2.2",fontColor:s.SmartCountdown.FontColor||"white",enabled:s.SmartCountdown.Enabled||!1,timeZoneOffset:s.SmartCountdown.TimeZoneOffset||0}:null;return{images:i,smartCountdown:f}}catch(a){return console.error("[Vrein Resolver] Error fetching images:",a),{images:[],smartCountdown:null}}},vreinProductData:async(e,{productId:t,skuId:n})=>{try{let o=process.env.VTEX_ACCOUNT||"brain",r="";if(n)r=`https://${o}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${n}`;else if(t)r=`https://${o}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${t}`;else return null;let d=await fetch(r,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json"}});if(!d.ok)return null;let a=await d.json();return!a||a.length===0?null:re(a[0])}catch(o){return console.error("[Vrein Resolver] Error fetching product data:",o),null}},vreinCategoryId:async(e,{pathname:t})=>{try{let n=process.env.VTEX_ACCOUNT||"brain",o=(t||"").split("/").filter(Boolean);if(o.length===0)return{categoryId:""};let r=Math.max(o.length,3),d=`https://${n}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${r}`,a=await fetch(d,{method:"GET",headers:{Accept:"application/json"}});if(!a.ok)return{categoryId:""};let g=await a.json(),c=null;for(let m of o){if(c=g.find(l=>{let i=(l.url||"").split("/").filter(Boolean).pop()||"";return m.toLowerCase()===i.toLowerCase()}),!c)break;g=c.children||[]}return{categoryId:c?String(c.id):""}}catch(n){return console.error("[Vrein Resolver] Error resolving categoryId:",n),{categoryId:""}}},vreinPopup:async(e,{section:t,context:n,email:o})=>{try{let r=process.env.NEXT_PUBLIC_VREIN_HASH||process.env.VREIN_HASH;if(!r)throw new Error("[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.");let d=process.env.VTEX_ACCOUNT||"brain",a=o||"",p="";try{p=JSON.parse(n||"{}").sessionGuid||""}catch{}let g=p?`guid=${p};`:"",c={Accept:"application/json",...w?{bdw_secretcode:w,"bdw-secretcode":w}:{},"X-VTEX-Use-Https":"true",...g?{Cookie:g}:{}},m=new URLSearchParams({HASH:r,email:a,branchOffice:P,whitelabel:"",sectionid:t.toLowerCase()}),l=`${R}/tracking/modalblock?${m}`,s=`${r}:${P}:${t}:${a}`,i=v(B,s);if(!i){let u=await fetch(l,{method:"GET",headers:c});if(!u.ok)return console.warn("[Vrein Resolver] Popup modalblock API error:",u.status),null;i=$(await u.json()),N(B,s,i,W)}if(!i)return console.warn("[Vrein Resolver] Popup no modalblock config for section:",t),null;let f=typeof i.Type=="string"?i.Type:"";if(f!=="modal"&&f!=="slider")return console.warn("[Vrein Resolver] Popup invalid or unrecognized type:",i.Type),null;if(!ne(i,Date.now()))return null;let C=f==="modal"&&z(i.ShowOnce),h=[i.Block1,i.Block2].filter(u=>typeof u=="string"&&u.trim()!=="");if(h.length===0)return console.warn("[Vrein Resolver] Popup no blocks configured for section:",t),null;let I=await X(n||"home//",d);I||(I="home//");let T=await Promise.allSettled(h.map(async u=>{if(ae(u)){let _=new URLSearchParams({HASH:r,email:a,branchOffice:P,whitelabel:"",sectionId:u,u:I}),A=`${R}/tracking/smartimage?${_}`,H=`${r}:${u}:${t}:${a}:${I}`,S=v(F,H);if(!S){let E=await fetch(A,{method:"GET",headers:c});if(!E.ok)return console.warn("[Vrein Resolver] Popup smartimage API error for block:",u,E.status),null;let J=await E.json();S=$(J),N(F,H,S,j)}if(!S)return null;if(S.Type&&S.Type!=="images")return console.warn("[Vrein Resolver] Popup smartimage block returned unexpected Type:",u,S.Type),null;let L=(Array.isArray(S.Images)?S.Images:[]).map(E=>({link:String(E?.Link||""),urlDesktop:String(E?.UrlDesktop||""),urlMobile:String(E?.UrlMobile||"")})).filter(E=>E.urlDesktop||E.urlMobile);return L.length===0?null:{blockId:u,title:S.Title||"",link:S.Link||"",gaEventAction:S.GaEventAction||"",gaEventCategory:S.GaEventCategory||"",gaEventLabel:S.GaEventLabel||"",blockType:"images",products:[],images:L}}let k=new URLSearchParams({HASH:r,email:a,branchOffice:P,whitelabel:"",sectionId:u,u:I}),V=`${R}/tracking/track?${k}`,U=`${r}:${u}:${t}:${a}:${I}`,b=v(G,U);if(!b){let _=await fetch(V,{method:"GET",headers:c});if(!_.ok)return console.warn("[Vrein Resolver] Popup track API error for block:",u,_.status),null;let A=await _.json();b=$(A),N(G,U,b,j)}if(!b)return null;let K=Array.isArray(b.Products)?b.Products:[],O=await q(K,d);return O.length===0?null:{blockId:u,title:b.Title||"",link:b.Link||"",gaEventAction:b.GaEventAction||"",gaEventCategory:b.GaEventCategory||"",gaEventLabel:b.GaEventLabel||"",blockType:"products",products:O,images:[]}})),y=[];for(let u of T)u.status==="fulfilled"&&u.value!==null?y.push(u.value):u.status==="rejected"&&console.warn("[Vrein Resolver] Popup block resolution failed:",u.reason?.message||u.reason);return y.length===0?(console.warn("[Vrein Resolver] Popup all blocks empty or failed for section:",t),null):{section:t,type:f,showOnce:C,blocks:y,apiUrl:l}}catch(r){return console.error("[Vrein Resolver] Error resolving popup:",r),null}}}};var ie=`
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

type VreinPopupImage {
  link: String!
  urlDesktop: String!
  urlMobile: String!
}

type VreinPopupBlock {
  blockId: String!
  title: String!
  link: String!
  gaEventAction: String!
  gaEventCategory: String!
  gaEventLabel: String!
  blockType: String!
  products: [VreinProduct!]!
  images: [VreinPopupImage!]!
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
`;export{se as vreinResolvers,ie as vreinTypeDefs};
//# sourceMappingURL=graphql.mjs.map