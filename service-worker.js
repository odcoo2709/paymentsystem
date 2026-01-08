// service-worker.js
const CACHE_NAME = 'usdt-thb-payment-v1.0';
const urlsToCache = [
  '.',  // 현재 디렉토리
  './', // 현재 디렉토리 (다른 브라우저 호환성)
  'index.html',
  'manifest.json'
];

// 설치 이벤트
self.addEventListener('install', event => {
  console.log('Service Worker 설치 시작...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시에 파일 추가 중:', urlsToCache);
        return cache.addAll(urllsToCache)
          .then(() => {
            console.log('모든 파일 캐시 완료');
          })
          .catch(error => {
            console.error('캐시 추가 실패:', error);
          });
      })
      .then(() => self.skipWaiting())
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  console.log('Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log('캐시 목록:', cacheNames);
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker 활성화 완료');
      return self.clients.claim();
    })
  );
});

// 요청 가로채기
self.addEventListener('fetch', event => {
  // GitHub Pages API 및 외부 API는 캐시하지 않음
  if (event.request.url.includes('github.io/api') || 
      event.request.url.includes('frankfurter.app') ||
      event.request.url.includes('api.exchangerate-api.com')) {
    return;
  }
  
  // 같은 출처의 요청만 처리
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          console.log('캐시에서 제공:', event.request.url);
          return response;
        }
        
        // 캐시에 없으면 네트워크 요청
        console.log('네트워크에서 요청:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // 응답이 유효한지 확인
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // 응답 복제
            const responseToCache = networkResponse.clone();
            
            // 캐시에 저장
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('새로 캐시에 저장:', event.request.url);
              });
            
            return networkResponse;
          })
          .catch(error => {
            console.error('네트워크 요청 실패:', error);
            // 오류 페이지나 기본 응답 반환
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// 메시지 처리 (선택사항)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
