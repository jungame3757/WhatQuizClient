const cacheName = "DefaultCompany-WhatQuizSDK-1.0";
const contentToCache = [
    "Build/45055b2323e89121d0bef4d6af88f0c6.loader.js",
    "Build/63dd1ebc8409d9b2729a27ab8e73dd2a.framework.js",
    "Build/4f129742e03a15674fd12a80c26c9739.data",
    "Build/dd7f42fdd62183227fdad7be6b87173a.wasm",
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
