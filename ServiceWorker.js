const cacheName = "DefaultCompany-WhatQuizSDK-1.0";
const contentToCache = [
    "Build/1692f329179f3ecc6009a8e54032a3ce.loader.js",
    "Build/f394e63246013e652bf828d84265e182.framework.js.br",
    "Build/fdfd7f8b27196d952b6b1d1cf91a1e82.data.br",
    "Build/7567b7a87ef1ae0dc7e51bdd867e9e68.wasm.br",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
