#!/usr/bin/env node
// Build script for SafeDrive
// Copies files to dist/ folder and injects environment variables
// Source files remain unchanged with placeholders

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

// Ensure directory exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Process a file - replace placeholders with env values
function processFile(srcPath, destPath, env) {
    if (!fs.existsSync(srcPath)) {
        console.error(`✗ Source file not found: ${srcPath}`);
        return false;
    }
    
    let content = fs.readFileSync(srcPath, 'utf8');
    let modified = false;
    
    // Replace __VAPID_KEY__ placeholder
    if (content.includes('__VAPID_KEY__')) {
        const vapidKey = env.VAPID_KEY || process.env.VAPID_KEY;
        
        if (!vapidKey) {
            console.error(`✗ VAPID_KEY not found in .env file`);
            return false;
        }
        
        content = content.replace(/__VAPID_KEY__/g, vapidKey);
        modified = true;
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
    
    for (const [placeholder, envKey] of Object.entries(firebaseVars)) {
        if (content.includes(placeholder)) {
            const value = env[envKey] || process.env[envKey];
            
            if (!value) {
                console.error(`✗ ${envKey} not found in .env file`);
                return false;
            }
            
            content = content.replace(new RegExp(placeholder, 'g'), value);
            modified = true;
        }
    }
    
    // Ensure destination directory exists
    ensureDir(path.dirname(destPath));
    
    // Write to destination
    fs.writeFileSync(destPath, content, 'utf8');
    
    const fileName = path.basename(srcPath);
    if (modified) {
        console.log(`✓ Built ${fileName} (credentials injected)`);
    } else {
        console.log(`✓ Copied ${fileName} (no placeholders)`);
    }
    
    return true;
}

// Copy file without processing
function copyFile(srcPath, destPath) {
    if (!fs.existsSync(srcPath)) {
        return false;
    }
    
    ensureDir(path.dirname(destPath));
    fs.copyFileSync(srcPath, destPath);
    return true;
}

// Copy directory recursively
function copyDir(srcDir, destDir, exclude = []) {
    if (!fs.existsSync(srcDir)) {
        return;
    }
    
    ensureDir(destDir);
    
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        
        if (exclude.includes(entry.name)) {
            continue;
        }
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, exclude);
        } else {
            copyFile(srcPath, destPath);
        }
    }
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
    
    const distDir = 'dist';
    
    // Clean dist directory
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true });
        console.log('🧹 Cleaned dist/ directory\n');
    }
    
    ensureDir(distDir);
    
    // Files that need placeholder replacement
    const filesToProcess = [
        { src: 'script.js', dest: 'dist/script.js' },
        { src: 'subscription-manager.js', dest: 'dist/subscription-manager.js' },
        { src: 'firebase-config.js', dest: 'dist/firebase-config.js' },
        { src: 'sw.js', dest: 'dist/sw.js' },
        { src: 'public/firebase-config.js', dest: 'dist/public/firebase-config.js' }
    ];
    
    let hasErrors = false;
    
    console.log('📦 Processing files with credentials...');
    for (const file of filesToProcess) {
        const result = processFile(file.src, file.dest, env);
        if (!result) {
            hasErrors = true;
        }
    }
    
    if (hasErrors) {
        console.error('\n❌ Build failed. Please fix the errors above.');
        process.exit(1);
    }
    
    // Copy other files to dist
    console.log('\n📁 Copying other files...');
    
    const filesToCopy = [
        'index.html',
        'plate.html',
        'contact.html',
        'faq.html',
        'legal.html',
        'terms.html',
        'privacy.html',
        'other.html',
        'referral.html',
        'qr-generator.html',
        'styles.css',
        'security.js',
        'manifest.json',
        'favicon.ico'
    ];
    
    for (const file of filesToCopy) {
        if (fs.existsSync(file)) {
            copyFile(file, path.join(distDir, file));
            console.log(`  ✓ ${file}`);
        }
    }
    
    // Copy directories
    const dirsToCopy = ['assets', 'js'];
    for (const dir of dirsToCopy) {
        if (fs.existsSync(dir)) {
            copyDir(dir, path.join(distDir, dir));
            console.log(`  ✓ ${dir}/`);
        }
    }
    
    console.log('\n✅ Build completed successfully!');
    console.log('\n📂 Output: dist/');
    console.log('\n📝 Deploy the dist/ folder to your hosting service.');
    console.log('   Example: firebase deploy --only hosting');
    console.log('\n💡 Source files remain unchanged with placeholders.');
}

// Run build
build();
