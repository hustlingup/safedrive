// Firebase Configuration
// This file contains your Firebase project credentials
// Note: These credentials are safe to expose in client-side code
// Security is enforced through Firebase Security Rules, not by hiding the config
// Configuration values are injected during build from environment variables

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

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} else {
    console.log('Firebase already initialized');
}
