// Service Worker for SafeDrive PWA
// Values are injected during build from .env file

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "__FIREBASE_AUTH_DOMAIN__",
    databaseURL: "__FIREBASE_DATABASE_URL__",
    projectId: "__FIREBASE_PROJECT_ID__",
    storageBucket: "__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__FIREBASE_APP_ID__",
    measurementId: "__FIREBASE_MEASUREMENT_ID__"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// console.log('[SW] Firebase initialized in Service Worker');

messaging.onBackgroundMessage((payload) => {
    // console.log('[SW] Received background message:', payload);
    
    const notificationTitle = payload.notification?.title || 'SafeDrive ?�림';
    const notificationOptions = {
        body: payload.notification?.body || '?�로??메시지가 ?�습?�다',
        icon: '/assets/img/icon-192.png',
        badge: '/assets/img/icon-192.png',
        tag: 'safedrive-notification-' + Date.now(),
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: payload.data || {}
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('push', (event) => {
    if (event.data) {
        try {
            const payload = event.data.json();
            const notificationTitle = payload.notification?.title || payload.data?.title || 'SafeDrive ?�림';
            const notificationBody = payload.notification?.body || payload.data?.body || '?�로??메시지가 ?�습?�다';
            
            event.waitUntil(
                self.registration.showNotification(notificationTitle, {
                    body: notificationBody,
                    icon: '/assets/img/icon-192.png',
                    badge: '/assets/img/icon-192.png',
                    tag: 'safedrive-push-' + Date.now(),
                    requireInteraction: true,
                    vibrate: [200, 100, 200],
                    data: payload.data || {}
                })
            );
        } catch (e) {
            event.waitUntil(
                self.registration.showNotification('SafeDrive ?�림', {
                    body: '?�로??메시지가 ?�습?�다',
                    icon: '/assets/img/icon-192.png'
                })
            );
        }
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const plateNumber = event.notification.data?.plateNumber;
    const url = plateNumber ? `/plate.html?plate=${encodeURIComponent(plateNumber)}` : '/index.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus().then(() => {
                        if (client.url !== url) return client.navigate(url);
                    });
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});

const CACHE_VERSION = 'v2.1';
const CACHE_NAME = `safedrive-${CACHE_VERSION}`;
const urlsToCache = ['/', '/index.html', '/plate.html', '/styles.css', '/firebase-config.js', '/subscription-manager.js', '/script.js'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => cacheName !== CACHE_NAME ? caches.delete(cacheName) : null)
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
