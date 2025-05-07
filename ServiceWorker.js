// WebGL 모바일 호환성 개선 서비스 워커
const cacheName = 'whatquiz-cache-v1';
const contentToCache = [];

// 앱 셸 즉시 설치
self.addEventListener('install', function(e) {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[Service Worker] Caching app shell and content');
      return cache.addAll(contentToCache);
    })
  );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener('activate', function(e) {
  console.log('[Service Worker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 네트워크 요청 처리
self.addEventListener('fetch', function(e) {
  const url = new URL(e.request.url);
  
  // WebAssembly 파일(.wasm)에 대한 특별 처리
  if (e.request.url.endsWith('.wasm')) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        // 네트워크 응답 캐싱
        return caches.open(cacheName).then(function(cache) {
          cache.put(e.request, response.clone());
          return response;
        });
      }).catch(function() {
        // 오프라인 상태에서 캐시된 응답 제공
        return caches.match(e.request);
      })
    );
    return;
  }

  // Unity로딩 변수로 시작하는 경우 캐싱하지 않음
  if (url.pathname.includes('UnityLoader') || 
      url.pathname.includes('Build/') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.data')) {
    // 네트워크 우선, 실패할 경우 캐시 사용
    e.respondWith(
      fetch(e.request)
        .then(response => {
          return caches.open(cacheName).then(cache => {
            cache.put(e.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
  } else {
    // 기본 네트워크 요청은 그대로 진행
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
