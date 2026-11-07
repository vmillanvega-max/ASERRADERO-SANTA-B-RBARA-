// v3 premium: primero intenta la red (para recibir cambios), si no hay señal usa lo guardado
const CACHE="aserrio-v3";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function timeout(ms){return new Promise((_,rej)=>setTimeout(()=>rej(new Error("t")),ms))}
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  if(req.mode==="navigate"){
    e.respondWith(Promise.race([fetch(req,{cache:"no-store"}),timeout(3000)]).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("index.html",cp));return res})
      .catch(()=>caches.match("index.html").then(r=>r||caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res})));
});
