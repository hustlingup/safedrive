// Service Worker for SafeDrive PWA
// Handles push notifications and offline caching

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - must match firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDIdD_L-FHumeBjvAzB-2e1iLv8dpAak7w",
    authDomain: "safedrive-fa567.firebaseapp.com",
    databaseURL: "https://safedrive-fa567-default-rtdb.firebaseio.com",
    projectId: "safedrive-fa567",
    storageBucket: "safedrive-fa567.firebasestorage.app",
    messagingSenderId: "637630322258",
    appId: "1:637630322258:web:407f2f745f51aa3d58b18b",
    measurementId: "G-9R8RZYZC7X"
};

// Initialize Firebase immediately
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('[SW] Firebase initialized in Service Worker');

// Handle background messages from Firebase
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message via FCM:', payload);
    
    const notificationTitle = payload.notification?.title || 'SafeDrive 알림';
    const notificationOptions = {
        body: payload.notification?.body || '새로운 메시지가 있습니다',
        icon: '/assets/img/icon-192.png',
        badge: '/assets/img/icon-192.png',
        tag: 'safedrive-notification-' + Date.now(),
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: payload.data || {}
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Fallback: Handle raw push events (in case FCM doesn't trigger onBackgroundMessage)
self.addEventListener('push', (event) => {
    console.log('[SW] Push event received:', event);
    
    if (event.data) {
        try {
            const payload = event.data.json();
            console.log('[SW] Push payload:', payload);
            
            // Check if this is an FCM message (has notification or data)
            const notificationTitle = payload.notification?.title || 
                                     payload.data?.title || 
                                     'SafeDrive 알림';
            const notificationBody = payload.notification?.body || 
                                    payload.data?.body || 
                                    '새로운 메시지가 있습니다';
            
            const notificationOptions = {
                body: notificationBody,
                icon: '/assets/img/icon-192.png',
                badge: '/assets/img/icon-192.png',
                tag: 'safedrive-push-' + Date.now(),
                requireInteraction: true,
                vibrate: [200, 100, 200],
                data: payload.data || {}
            };
            
            event.waitUntil(
                self.registration.showNotification(notificationTitle, notificationOptions)
            );
        } catch (e) {
            console.error('[SW] Error parsing push data:', e);
            // Show generic notification
            event.waitUntil(
                self.registration.showNotification('SafeDrive 알림', {
                    body: '새로운 메시지가 있습니다',
                    icon: '/assets/img/icon-192.png'
                })
            );
        }
    }
});


// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);
    event.notification.close();
    
    const plateNumber = event.notification.data?.plateNumber;
    const url = plateNumber 
        ? `/plate.html?plate=${encodeURIComponent(plateNumber)}` 
        : '/index.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus().then(() => {
                        if (client.url !== url) {
                            return client.navigate(url);
                        }
                    });
                }
            }
            // Open new window if none found
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Cache strategy for offline support
// Increment version number when deploying updates
const CACHE_VERSION = 'v2.1';
const CACHE_NAME = `safedrive-${CACHE_VERSION}`;
const urlsToCache = [
    '/',
    '/index.html',
    '/plate.html',
    '/styles.css',
    '/firebase-config.js',
    '/subscription-manager.js',
    '/script.js'
];

self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).catch((err) => {
                console.warn('[SW] Cache addAll failed:', err);
            });
        })
    );
    // Force the waiting service worker to become active
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Log when SW is ready
console.log('[SW] Service Worker script loaded');
