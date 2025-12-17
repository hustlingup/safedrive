// Firebase Configuration
// This file contains your Firebase project credentials
// Note: These credentials are safe to expose in client-side code
// Security is enforced through Firebase Security Rules, not by hiding the config

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

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} else {
    console.log('ℹ️ Firebase already initialized');
}
