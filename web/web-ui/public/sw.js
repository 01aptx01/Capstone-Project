// public/sw.js
// ─── SERVICE WORKER - MOD PAO WEB UI ─────────────────────────────────────────
// ไฟล์นี้ทำหน้าที่เป็น Service Worker ในการจัดการ Cache เพื่อการใช้งานแบบออฟไลน์
// และช่วยให้เว็บสามารถโหลดหน้าต่าง ๆ ได้รวดเร็วยิ่งขึ้น (PWA Support)
//
// หมายเหตุ: Service Worker นี้จะทำงานเฉพาะในโหมด Production เท่านั้น
// ในโหมด Development จะไม่มีการแคชใดๆ เพื่อป้องกันปัญหา HMR และ CSS ไม่โหลด

const CACHE_VERSION = 'v1';
const STATIC_CACHE_NAME = `modpao-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `modpao-dynamic-${CACHE_VERSION}`;

// รายการไฟล์ที่จะทำการ Pre-cache (แคชไว้ล่วงหน้าทันทีที่ติดตั้ง Service Worker)
const PRECACHE_ASSETS = [
  '/favicon.ico',
  '/logo.svg',
  '/MODPAO.svg',
];

// ตรวจสอบว่าอยู่ในโหมด Development หรือไม่
// หากเป็น localhost หรือ 127.0.0.1 จะถือว่าเป็น Development
function isDevMode() {
  return (
    self.location.hostname === 'localhost' ||
    self.location.hostname === '127.0.0.1' ||
    self.location.hostname === '0.0.0.0' ||
    self.location.port === '3000'
  );
}

// 1. Install Event: ทำการติดตั้ง Service Worker และ Pre-cache ไฟล์ที่จำเป็น
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  // ในโหมด Dev ข้าม Pre-cache เพื่อไม่ให้ขัดกับ HMR
  if (isDevMode()) {
    console.log('[Service Worker] Dev mode detected — skipping precache');
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // สั่งให้ Service Worker ตัวใหม่เข้าทำงานทันที (Skip Waiting)
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: ทำความสะอาดแคชเก่าที่ไม่ได้ใช้งานแล้วเมื่ออัปเกรดเวอร์ชัน
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // หากชื่อแคชไม่ตรงกับเวอร์ชันปัจจุบัน ให้ลบทิ้ง
          if (cache !== STATIC_CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // ยึดการควบคุม client ทั้งหมดทันที (Clients Claim)
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: ดักจับ HTTP Request เพื่อจัดการ Caching
self.addEventListener('fetch', (event) => {
  // ─── ข้ามทุก Request ในโหมด Development ─────────────────────────────────
  if (isDevMode()) {
    return; // ปล่อยให้ Request ไปตามปกติโดยไม่แทรกแซง
  }

  // ข้ามการแคชสำหรับ protocol อื่นที่ไม่ใช่ http/https
  if (!event.request.url.startsWith('http')) return;

  // ข้ามการดักจับสำหรับ non-GET requests
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  // ข้ามสำหรับ Webpack HMR
  if (requestUrl.pathname.includes('/_next/webpack-hmr')) return;

  // ข้ามสำหรับ Next.js internal routes ที่ไม่ควรแคช
  if (requestUrl.pathname.startsWith('/_next/data')) return;

  // ─── API Requests & Dynamic Content (Network-First) ─────────────────────
  // สำหรับการเรียกข้อมูล API ให้ลองโหลดจากอินเทอร์เน็ตก่อน
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.origin !== self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // หากออฟไลน์ ให้ดึงข้อมูลจากแคชแทน
          return caches.match(event.request);
        })
    );
    return;
  }

  // ─── Static Assets (Stale-While-Revalidate) ─────────────────────────────
  // สำหรับไฟล์ CSS, JS, รูปภาพ, และฟอนต์
  // ส่งผลลัพธ์จากแคชทันที แล้วอัปเดตเบื้องหลัง
  if (
    requestUrl.pathname.startsWith('/_next/static') ||
    requestUrl.pathname.match(/\.(js|css|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // ─── HTML Pages (Network-First) ─────────────────────────────────────────
  // สำหรับหน้า HTML ใช้ Network-First เพื่อให้ได้เนื้อหาล่าสุดเสมอ
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
});
