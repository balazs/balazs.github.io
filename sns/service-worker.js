/**
 * Service worker for PWA
 */
const CACHE = 'samsung-news-pwa';

const filesToCache = [
    '/css/styles.min.css',
    '/js/scripts.min.js',
    '/img/baseline-close-24px.svg',
    '/img/ic-arrow-back-black-24-px.svg',
    '/img/ic_chevron_right_black_48px.svg',
    '/img/internet_no_item.png',
    '/img/logo.png',
    '/img/settings.svg',
    '/img/check-24px.svg',
    '/img/ic_cancel_black_48px.svg',
    '/img/ic_chevron_right_white_24px.svg',
    '/img/logo_144.png',
    '/img/menu-24px.svg',
    '/img/si.svg',
    '/img/clear-24px.svg',
    '/img/ic_cancel_white_48px.svg',
    '/img/ic_menu_black_48px.svg',
    '/img/logo_192.png',
    '/img/settings_36dp.png',
    '/img/sns-logotext.svg',
    '/img/expand_more-24px.svg',
    '/img/ic_chevron_right_black_24px.svg',
    '/img/ic_menu_white_48px.svg',
    '/img/logo_orig.png',
    '/img/settings_48dp.png'
];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function(event) {
  event.waitUntil(precache().then(function() {
    return self.skipWaiting();
  }))
});


//allow sw to control of current page
self.addEventListener('activate', function(event) {
  caches.delete(CACHE);
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if ( !(event.request.url).includes(location.origin) ||
    (event.request.url) == (location.origin + '/') ||
    (event.request.url) == (location.origin + '/index.html')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(CACHE)
                .then(function(cache) {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function(err) {
              console.log(err);
            });
        }
      })
  );
  event.waitUntil(update(event.request));
});

self.addEventListener('push', function(event) {
    console.log(event.data);
  const text = event.data.text();
  console.log('[Service Worker] Push Received.');
  console.log('[Service Worker] Push had this data: ' + text);

  const title = 'News from Samsung';
  const options = {
    body: text,
    icon: '/img/logo.png',
    badge: '/img/logo.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  const link = event.data.text();
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(link)
  );
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(filesToCache.map(function(filesToCache) {
        return new Request(filesToCache, {mode:'no-cors'});
    })).then(function() {
    });
  }).catch(function(error){
    console.error('Pre-fetching failed:', error);
  });
}

function fromCache(request) {
  //we pull files from the cache first thing so we can show them fast
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

function update(request) {
  //this is where we call the server to get the newest version of the 
  //file to use the next time we show view
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}

function fromServer(request){
  //this is the fallback if it is not in the cache to go to the server and get it
  return fetch(request).then(function(response){ return response});
}