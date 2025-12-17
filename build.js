#!/usr/bin/env node
// Build script for SafeDrive
// Injects environment variables into client-side code

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
        console.warn('⚠️  Warning: .env file not found. Using .env.example as reference.');
        console.warn('   Create a .env file with your actual values before deploying.');
        return {};
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
        line = line.trim();
        
        // Skip empty lines and comments
        if (!line || line.startsWith('#')) {
            return;
        }
        
        // Parse KEY=VALUE
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            env[key] = value;
        }
    });
    
    return env;
}

// Replace placeholders in a file
function injectEnvVariables(filePath, env) {
    if (!fs.existsSync(filePath)) {
        console.error(`✗ File not found: ${filePath}`);
        return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace __VAPID_KEY__ placeholder
    if (content.includes('__VAPID_KEY__')) {
        const vapidKey = env.VAPID_KEY || process.env.VAPID_KEY;
        
        if (!vapidKey) {
            console.error(`✗ VAPID_KEY not found in .env file or environment variables`);
            console.error(`  Please add VAPID_KEY to your .env file`);
            return false;
        }
        
        content = content.replace(/__VAPID_KEY__/g, vapidKey);
        modified = true;
        console.log(`✓ Injected VAPID_KEY into ${path.basename(filePath)}`);
    }
    
    // Replace Firebase config placeholders
    const firebaseVars = {
        '__FIREBASE_API_KEY__': 'FIREBASE_API_KEY',
        '__FIREBASE_AUTH_DOMAIN__': 'FIREBASE_AUTH_DOMAIN',
        '__FIREBASE_DATABASE_URL__': 'FIREBASE_DATABASE_URL',
        '__FIREBASE_PROJECT_ID__': 'FIREBASE_PROJECT_ID',
        '__FIREBASE_STORAGE_BUCKET__': 'FIREBASE_STORAGE_BUCKET',
        '__FIREBASE_MESSAGING_SENDER_ID__': 'FIREBASE_MESSAGING_SENDER_ID',
        '__FIREBASE_APP_ID__': 'FIREBASE_APP_ID',
        '__FIREBASE_MEASUREMENT_ID__': 'FIREBASE_MEASUREMENT_ID'
    };
    
    let firebaseModified = false;
    for (const [placeholder, envKey] of Object.entries(firebaseVars)) {
        if (content.includes(placeholder)) {
            const value = env[envKey] || process.env[envKey];
            
            if (!value) {
                console.error(`✗ ${envKey} not found in .env file or environment variables`);
                console.error(`  Please add ${envKey} to your .env file`);
                return false;
            }
            
            content = content.replace(new RegExp(placeholder, 'g'), value);
            firebaseModified = true;
        }
    }
    
    if (firebaseModified) {
        modified = true;
        console.log(`✓ Injected Firebase config into ${path.basename(filePath)}`);
    }
    
    // Write back if modified
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    
    return false;
}

// Main build process
function build() {
    console.log('🔨 Building SafeDrive...\n');
    
    // Load environment variables
    const env = loadEnv();
    
    // Check for required environment variables
    const requiredVars = [
        'VAPID_KEY',
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_DATABASE_URL',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID',
        'FIREBASE_MEASUREMENT_ID'
    ];
    const missing = requiredVars.filter(key => !env[key] && !process.env[key]);
    
    if (missing.length > 0) {
        console.error('✗ Missing required environment variables:');
        missing.forEach(key => console.error(`  - ${key}`));
        console.error('\nPlease add these to your .env file before building.');
        process.exit(1);
    }
    
    // Files to process
    const filesToProcess = [
        'script.js',
        'subscription-manager.js',
        'firebase-config.js',
        'sw.js'
    ];
    
    let success = true;
    
    filesToProcess.forEach(file => {
        const result = injectEnvVariables(file, env);
        if (!result) {
            success = false;
        }
    });
    
    if (success) {
        console.log('\n✅ Build completed successfully!');
        console.log('\n📝 Note: The modified files now contain your VAPID key.');
        console.log('   Make sure to run this build script before deploying.');
    } else {
        console.error('\n❌ Build failed. Please fix the errors above.');
        process.exit(1);
    }
}

// Run build
build();
