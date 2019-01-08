/**
 * Service worker for PWA
 */
const CACHE = 'samsung-uhp';

const filesToCache = [
  'qa.html',
  'img/qa/btn_setting.png',
  'img/qa/btn_setting2.png',
  'img/qa/internet_ic_next.png',
  'img/qa/internet_multi_cp_settings_ic_add_category.png',
  'img/qa/cancel2.png',
  'img/qa/internet_multi_cp_home_ic_play.png',
  'img/qa/internet_multi_cp_settings_ic_reorder.png',
  'img/qa/cancel.png',
  'img/qa/internet_multi_cp_home-page_category_tab_ic_refresh.png',
  'img/qa/internet_multi_cp_web_view_list_loading_border_1.png',
  'img/qa/dislike.png',
  'img/qa/internet_multi_cp_home-page_category_tab_ic_setting.png',
  'img/qa/internet_multi_cp_home-page_category_tab_ic_setting2.png',
  'img/qa/internet_multi_cp_web_view_list_loading_border_2.png',
  'img/qa/favicon.ico',
  'img/qa/internet_ic_back.png',
  'img/qa/internet_multi_cp_home-page_dismiss_icon.png',
  'img/qa/internet_multi_cp_web_view_list_loading_default_image.png',
  'img/qa/go_to_top_mtrl.png',
  'img/qa/internet_multi_cp_home-page_help_overaly_swipe_left.png',
  'img/qa/internet_no_item.png',
  'img/qa/gps.png',
  'img/qa/internet_multi_cp_home-page_help_overaly_swipe.png',
  'img/qa/loading_1.png',
  'img/qa/icon_video1_play.png',
  'img/qa/internet_multi_cp_home-page_ic_dismiss.png',
  'img/qa/loading_2.png',
  'img/qa/icon_video2_play.png',
  'img/qa/internet_multi_cp_home-page_logo_dailyhunt.png',
  'img/qa/loading_item.png',
  'img/qa/image_cover.png',
  'img/qa/internet_multi_cp_settings_btn_check.png',
  'img/qa/internet_all_btn_check.png',
  'img/qa/internet_multi_cp_settings_btn_radio_close.png',
  'img/qa/refresh.png',
  'img/qa/refresh2.png',
  'img/qa/internet_all_btn_uncheck.png',
  'img/qa/internet_multi_cp_settings_btn_radio_off.png',
  'img/qa/remove_icon.png',
  'img/qa/internet_edit_btn_check.png',
  'img/qa/internet_multi_cp_settings_btn_radio_on.png',
  'img/qa/search.png',
  'img/qa/internet_edit_btn_uncheck.png',
  'img/qa/internet_multi_cp_settings_btn_radio_open.png',
  'img/qa/touch-icon.png',
  'img/qa/internet_ic_add.png',
  'img/qa/internet_multi_cp_settings_btn_uncheck.png',
  'img/qa/quick_access_icons/add.png',
  'img/qa/quick_access_icons/edit_icon.png'
]

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function(evt) {
  evt.waitUntil(precache().then(function() {
    return self.skipWaiting();
  }))
});


//allow sw to control of current page
self.addEventListener('activate', function(event) {
  return self.clients.claim();
});

self.addEventListener('fetch', function(evt) {
  evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
  evt.waitUntil(update(evt.request));
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