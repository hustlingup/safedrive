#!/usr/bin/env node
// Build script for SafeDrive
// Copies files to dist/ folder and injects environment variables
// Source files remain unchanged with placeholders

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found!');
        console.error('   Create .env file with your credentials.');
        process.exit(1);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
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
        console.error(`❌ File not found: ${srcPath}`);
        return false;
    }
    
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Replace VAPID key placeholder
    if (content.includes('__VAPID_KEY__')) {
        if (!env.VAPID_KEY) {
            console.error('❌ VAPID_KEY not found in .env');
            return false;
        }
        content = content.replace(/__VAPID_KEY__/g, env.VAPID_KEY);
    }
    
    // Replace Firebase config placeholders
    const replacements = {
        '__FIREBASE_API_KEY__': env.FIREBASE_API_KEY,
        '__FIREBASE_AUTH_DOMAIN__': env.FIREBASE_AUTH_DOMAIN,
        '__FIREBASE_DATABASE_URL__': env.FIREBASE_DATABASE_URL,
        '__FIREBASE_PROJECT_ID__': env.FIREBASE_PROJECT_ID,
        '__FIREBASE_STORAGE_BUCKET__': env.FIREBASE_STORAGE_BUCKET,
        '__FIREBASE_MESSAGING_SENDER_ID__': env.FIREBASE_MESSAGING_SENDER_ID,
        '__FIREBASE_APP_ID__': env.FIREBASE_APP_ID,
        '__FIREBASE_MEASUREMENT_ID__': env.FIREBASE_MEASUREMENT_ID
    };
    
    for (const [placeholder, value] of Object.entries(replacements)) {
        if (content.includes(placeholder)) {
            if (!value) {
                console.error(`❌ ${placeholder.replace(/__/g, '')} not found in .env`);
                return false;
            }
            content = content.replace(new RegExp(placeholder, 'g'), value);
        }
    }
    
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, content, 'utf8');
    return true;
}

// Copy file without processing
function copyFile(srcPath, destPath) {
    if (!fs.existsSync(srcPath)) return false;
    ensureDir(path.dirname(destPath));
    fs.copyFileSync(srcPath, destPath);
    return true;
}

// Copy directory recursively
function copyDir(srcDir, destDir, exclude = []) {
    if (!fs.existsSync(srcDir)) return;
    ensureDir(destDir);
    
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        if (exclude.includes(entry.name)) continue;
        
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, exclude);
        } else {
            copyFile(srcPath, destPath);
        }
    }
}

// Main build
function build() {
    console.log('🔨 Building SafeDrive...\\n');
    
    const env = loadEnv();
    const distDir = 'dist';
    
    // Clean dist
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true });
    }
    ensureDir(distDir);
    
    // Process files with placeholders
    console.log('📦 Processing files with credentials...');
    const filesToProcess = [
        { src: 'script.js', dest: 'dist/script.js' },
        { src: 'subscription-manager.js', dest: 'dist/subscription-manager.js' },
        { src: 'firebase-config.js', dest: 'dist/firebase-config.js' },
        { src: 'sw.js', dest: 'dist/sw.js' },
        { src: 'public/firebase-config.js', dest: 'dist/public/firebase-config.js' }
    ];
    
    for (const file of filesToProcess) {
        if (processFile(file.src, file.dest, env)) {
            console.log(`   ✓ ${file.src}`);
        } else {
            console.error(`\\n❌ Build failed!`);
            process.exit(1);
        }
    }
    
    // Copy other files
    console.log('\\n📁 Copying other files...');
    const filesToCopy = [
        'index.html', 'plate.html', 'contact.html', 'faq.html',
        'legal.html', 'terms.html', 'privacy.html', 'other.html',
        'referral.html', 'qr-generator.html', 'styles.css',
        'security.js', 'manifest.json', 'favicon.ico',
        'animated-qr.html', 'generate-favicon.html',
        'referral-design-options.html', 'referral-layout-options.html',
        'referral-stats.html', 'test-referral.html',
        'test-voice-pronunciation.html'
    ];
    
    for (const file of filesToCopy) {
        if (copyFile(file, path.join(distDir, file))) {
            console.log(`   ✓ ${file}`);
        }
    }
    
    // Copy directories
    const dirsToCopy = ['assets', 'js', 'public'];
    for (const dir of dirsToCopy) {
        if (fs.existsSync(dir)) {
            // For public dir, skip firebase-config.js (already processed)
            if (dir === 'public') {
                const publicFiles = fs.readdirSync(dir);
                for (const file of publicFiles) {
                    if (file !== 'firebase-config.js') {
                        copyFile(path.join(dir, file), path.join(distDir, dir, file));
                    }
                }
            } else {
                copyDir(dir, path.join(distDir, dir));
            }
            console.log(`   ✓ ${dir}/`);
        }
    }
    
    console.log('\\n✅ Build completed!');
    console.log('\\n📂 Output: dist/');
    console.log('\\n🚀 Deploy: firebase deploy --only hosting');
}

build();
