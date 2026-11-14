const C = 'enfoque-v5';
const F = ['./', './index.html', './manifest.json', './icon.svg'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(F.map(u => new Request(u, { cache: 'reload' }))))); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())
));
// Red primero y sin usar la caché del navegador (siempre la versión más nueva); si no hay internet, usa la copia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(new Request(e.request, { cache: 'no-store' }))
      .then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request))
  );
});
// Al tocar un aviso de recordatorio: abre Enfoque y muestra esa tarea.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const id = e.notification.data && e.notification.data.id;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if ('focus' in c) { if (id) c.postMessage({ open: id }); return c.focus(); }
    }
    return clients.openWindow('./index.html' + (id ? '?task=' + encodeURIComponent(id) : ''));
  }));
});
