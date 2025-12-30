// Firebase Messaging Service Worker
// This file is required by Firebase Cloud Messaging for background notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config - values are injected during build from .env file
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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
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

// Handle notification clicks
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
