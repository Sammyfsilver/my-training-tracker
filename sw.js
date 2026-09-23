const CACHE='mtt-v6';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./','./index.html','./manifest.webmanifest']))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));

self.addEventListener('push', event => {
  let payload={title:'My Training Tracker',body:'You have a reminder.',url:'/'};
  try { payload=event.data ? {...payload,...event.data.json()} : payload; } catch {}
  event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body,tag:'mtt-reminder',renotify:false,data:{url:payload.url||'/'}}));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url=new URL(event.notification.data?.url||'/',self.location.origin).href;
  event.waitUntil((async()=>{
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      if('focus' in client){await client.focus(); if('navigate' in client) await client.navigate(url); return;}
    }
    if(self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
