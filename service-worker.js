// 간단한 Service Worker - 오프라인 지원
const CACHE_NAME = 'payment-system-v1';
const urlsToCache = [
  '/',
  '/index.html',
  './manifest.json'
];

// 설치 이벤트
self.addEventListener('install', event => {
  console.log('Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('필요한 파일들을 캐시에 추가 중...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('모든 파일 캐시 완료');
        return self.skipWaiting();
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  console.log('Service Worker 활성화됨');
  
  // 오래된 캐시 삭제
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
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// fetch 이벤트
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // 네비게이션 요청은 항상 네트워크 먼저 시도
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
  } else {
    // 다른 요청들은 캐시 먼저
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});
