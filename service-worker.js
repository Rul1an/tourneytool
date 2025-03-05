// service-worker.js - Service Worker voor offline functionaliteit

const CACHE_NAME = 'voetbal-toernooi-cache-v1';
const RUNTIME_CACHE = 'voetbal-toernooi-runtime-v1';

// Bestanden die vooraf in de cache moeten worden opgeslagen
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/modules/data.js',
    '/js/modules/schedule.js',
    '/js/modules/playerOverview.js',
    '/js/modules/utils.js',
    '/js/modules/state.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installatie-event: cache alle statische bestanden
self.addEventListener('install', event => {
    console.log('[Service Worker] Installeren...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Cache openen en bestanden opslaan');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activatie-event: opschonen van oude caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activeren...');

    const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('[Service Worker] Oude cache verwijderen:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch-event: reageren op netwerkverzoeken
self.addEventListener('fetch', event => {
    // Skip cross-origin verzoeken zoals CDN's
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Netwerkverzoeken afhandelen met cache-first strategie
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // We hebben een cache-hit - return het gecachte bestand
                    return cachedResponse;
                }

                // Geen cache-hit - doe een netwerkverzoek
                return caches.open(RUNTIME_CACHE)
                    .then(cache => {
                        return fetch(event.request)
                            .then(response => {
                                // Cache het opgehaalde bestand als het een geldige respons is
                                if (response.status === 200) {
                                    cache.put(event.request, response.clone());
                                }
                                return response;
                            })
                            .catch(error => {
                                console.error('[Service Worker] Fetch mislukt:', error);
                                // Hier zou je een fallback pagina kunnen tonen
                            });
                    });
            })
    );
});
