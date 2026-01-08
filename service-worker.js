// service-worker.js
const CACHE_NAME = 'usdt-thb-payment-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시에 파일 추가 중...');
        return cache.addAll(urlsToCache);
      })
  );
});

// 요청 가로채기
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }
        // 없으면 네트워크 요청
        return fetch(event.request);
      })
  );
});

// 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
