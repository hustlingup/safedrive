#!/usr/bin/env node
// Restore script for SafeDrive
// Restores environment variable placeholders in source files
// Use this before committing to version control

const fs = require('fs');
const path = require('path');

// Restore placeholders in a file
function restorePlaceholders(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`✗ File not found: ${filePath}`);
        return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace VAPID key with placeholder
    // Match the VAPID key pattern (starts with B, 87 characters long)
    const vapidKeyPattern = /const vapidKey = '[A-Za-z0-9_-]{87}';/g;
    
    if (vapidKeyPattern.test(content)) {
        content = content.replace(vapidKeyPattern, "const vapidKey = '__VAPID_KEY__';");
        modified = true;
    }
    
    // Replace Firebase config values with placeholders
    const firebaseReplacements = [
        { pattern: /apiKey: "AIza[A-Za-z0-9_-]+"/g, replacement: 'apiKey: "__FIREBASE_API_KEY__"' },
        { pattern: /authDomain: "[a-z0-9-]+\.firebaseapp\.com"/g, replacement: 'authDomain: "__FIREBASE_AUTH_DOMAIN__"' },
        { pattern: /databaseURL: "https:\/\/[a-z0-9-]+-default-rtdb\.firebaseio\.com"/g, replacement: 'databaseURL: "__FIREBASE_DATABASE_URL__"' },
        { pattern: /projectId: "[a-z0-9-]+"/g, replacement: 'projectId: "__FIREBASE_PROJECT_ID__"' },
        { pattern: /storageBucket: "[a-z0-9-]+\.firebasestorage\.app"/g, replacement: 'storageBucket: "__FIREBASE_STORAGE_BUCKET__"' },
        { pattern: /messagingSenderId: "\d+"/g, replacement: 'messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__"' },
        { pattern: /appId: "1:\d+:web:[a-z0-9]+"/g, replacement: 'appId: "__FIREBASE_APP_ID__"' },
        { pattern: /measurementId: "G-[A-Z0-9]+"/g, replacement: 'measurementId: "__FIREBASE_MEASUREMENT_ID__"' }
    ];
    
    for (const { pattern, replacement } of firebaseReplacements) {
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            modified = true;
        }
    }
    
    // Write back if modified
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Restored placeholders in ${path.basename(filePath)}`);
        return true;
    } else {
        console.log(`  No changes needed in ${path.basename(filePath)}`);
        return false;
    }
}

// Main restore process
function restore() {
    console.log('🔄 Restoring placeholders in SafeDrive source files...\n');
    
    // Files to process
    const filesToProcess = [
        'script.js',
        'subscription-manager.js',
        'firebase-config.js',
        'sw.js'
    ];
    
    let anyModified = false;
    
    filesToProcess.forEach(file => {
        const result = restorePlaceholders(file);
        if (result) {
            anyModified = true;
        }
    });
    
    if (anyModified) {
        console.log('\n✅ Placeholders restored successfully!');
        console.log('   Files are now safe to commit to version control.');
    } else {
        console.log('\n✅ All files already have placeholders.');
    }
}

// Run restore
restore();
