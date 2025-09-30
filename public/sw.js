const CACHE_NAME = 'ai-bg-remover-v3';
const MODEL_CACHE_NAME = 'ai-models-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  // Core assets will be cached by build system
];

// AI Model URLs (will be cached on-demand)
const modelUrls = {
  'rmbg-1.4': '/models/rmbg-1.4.onnx',
  'u2net': '/models/u2net.onnx',
  'u2netp': '/models/u2netp.onnx',
  'modnet': '/models/modnet.onnx',
  'hq-sam': '/models/hq-sam.onnx'
};

// ONNX Runtime Web files
const onnxUrls = [
  '/onnx/ort-wasm.wasm',
  '/onnx/ort-wasm-simd.wasm', 
  '/onnx/ort-wasm-threaded.wasm',
  '/onnx/ort-wasm-simd-threaded.wasm'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
      // Pre-cache ONNX runtime files (smaller, essential)
      caches.open(MODEL_CACHE_NAME).then((cache) => cache.addAll(onnxUrls))
    ])
  );
  self.skipWaiting(); // Immediately activate new SW
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle model files with special caching
  if (url.pathname.startsWith('/models/') || url.pathname.startsWith('/onnx/')) {
    event.respondWith(
      caches.open(MODEL_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response;
          }
          
          // Fetch and cache model files
          return fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // Default caching strategy for other resources
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response;
      }
      
      return fetch(event.request).then(networkResponse => {
        // Cache successful responses
        if (networkResponse.ok && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME && cacheName !== MODEL_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});

// Handle model preloading and cache management messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_MODEL') {
    const modelName = event.data.model;
    const modelUrl = modelUrls[modelName];
    
    if (modelUrl) {
      event.waitUntil(
        caches.open(MODEL_CACHE_NAME).then(cache => {
          return cache.add(modelUrl).then(() => {
            event.ports[0].postMessage({ 
              success: true, 
              message: `Model ${modelName} preloaded successfully` 
            });
          });
        }).catch(error => {
          event.ports[0].postMessage({ 
            success: false, 
            error: error.message 
          });
        })
      );
    }
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.open(MODEL_CACHE_NAME).then(async cache => {
        const requests = await cache.keys();
        let totalSize = 0;
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
        
        event.ports[0].postMessage({ 
          cacheSize: totalSize 
        });
      })
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_MODEL_CACHE') {
    event.waitUntil(
      caches.delete(MODEL_CACHE_NAME).then(() => {
        // Recreate empty cache
        return caches.open(MODEL_CACHE_NAME);
      }).then(() => {
        event.ports[0].postMessage({ 
          success: true,
          message: 'Model cache cleared successfully'
        });
      })
    );
  }
});