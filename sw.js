/* 總入口的離線快取：只處理總入口自己的檔案；/vocab/ /times/ /column/ 交給各自的 Service Worker（或直接走網路） */
const CACHE='hub-v2';
const FILES=["/", "/manifest.webmanifest", "/h/hub-round.woff2", "/h/pixel.woff2", "/h/icon-192.png", "/h/apple-touch-icon.png"];
const MINE=p=>p==='/'||p==='/index.html'||p==='/manifest.webmanifest'||p.startsWith('/h/');
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('hub-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin||!MINE(u.pathname)||u.pathname.endsWith('.cfg'))return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put('/',cp))}return r}).catch(()=>caches.match('/')));return}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(x=>{if(x.ok){const cp=x.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return x})));
});
