#!/usr/bin/env node
// Verification script for SafeDrive build
// Checks if source files have placeholders and dist has real values

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function checkFile(filePath, patterns) {
    if (!fs.existsSync(filePath)) {
        return { exists: false };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const found = [];
    
    for (const pattern of patterns) {
        if (content.includes(pattern)) {
            found.push(pattern);
        }
    }
    
    return { exists: true, found };
}

function verify() {
    console.log(`${colors.blue}🔍 Verifying SafeDrive Build Status...${colors.reset}\n`);
    
    const placeholders = [
        '__FIREBASE_API_KEY__',
        '__FIREBASE_AUTH_DOMAIN__',
        '__FIREBASE_DATABASE_URL__',
        '__FIREBASE_PROJECT_ID__',
        '__VAPID_KEY__'
    ];
    
    const realValues = [
        'AIzaSyDIdD',
        'safedrive-fa567.firebaseapp.com',
        'BBPwhFN3K4dlsDZXul31'
    ];
    
    // Check source files for placeholders
    console.log('📁 Source Files (should have placeholders):');
    const sourceFiles = [
        'script.js',
        'subscription-manager.js',
        'firebase-config.js',
        'sw.js',
        'public/firebase-config.js'
    ];
    
    let sourceOk = true;
    for (const file of sourceFiles) {
        const result = checkFile(file, placeholders);
        if (!result.exists) {
            console.log(`  ${colors.yellow}⚠️  ${file} - Not found${colors.reset}`);
        } else if (result.found.length > 0) {
            console.log(`  ${colors.green}✓ ${file} - Has placeholders${colors.reset}`);
        } else {
            // Check if it has real values (bad)
            const realCheck = checkFile(file, realValues);
            if (realCheck.found.length > 0) {
                console.log(`  ${colors.red}✗ ${file} - Has hardcoded values!${colors.reset}`);
                sourceOk = false;
            } else {
                console.log(`  ${colors.yellow}? ${file} - No placeholders found${colors.reset}`);
            }
        }
    }
    
    // Check dist files for real values
    console.log('\n📦 Built Files (dist/ - should have real values):');
    const distFiles = [
        'dist/script.js',
        'dist/subscription-manager.js',
        'dist/firebase-config.js',
        'dist/sw.js',
        'dist/public/firebase-config.js'
    ];
    
    let distExists = fs.existsSync('dist');
    let distOk = true;
    
    if (!distExists) {
        console.log(`  ${colors.yellow}⚠️  dist/ folder not found - run "node build.js" first${colors.reset}`);
        distOk = false;
    } else {
        for (const file of distFiles) {
            const result = checkFile(file, realValues);
            if (!result.exists) {
                console.log(`  ${colors.yellow}⚠️  ${file} - Not found${colors.reset}`);
            } else if (result.found.length > 0) {
                console.log(`  ${colors.green}✓ ${file} - Has real values${colors.reset}`);
            } else {
                // Check if it still has placeholders (bad)
                const placeholderCheck = checkFile(file, placeholders);
                if (placeholderCheck.found.length > 0) {
                    console.log(`  ${colors.red}✗ ${file} - Still has placeholders!${colors.reset}`);
                    distOk = false;
                } else {
                    console.log(`  ${colors.yellow}? ${file} - Unknown state${colors.reset}`);
                }
            }
        }
    }
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    
    if (sourceOk && distOk && distExists) {
        console.log(`\n${colors.green}✅ Everything looks good!${colors.reset}`);
        console.log(`\n${colors.blue}Source files:${colors.reset} Have placeholders (safe to commit)`);
        console.log(`${colors.blue}Dist files:${colors.reset} Have real values (ready to deploy)`);
        console.log(`\n${colors.yellow}Deploy with:${colors.reset} firebase deploy --only hosting`);
    } else if (sourceOk && !distExists) {
        console.log(`\n${colors.yellow}⚠️  Source files are ready, but dist/ not built${colors.reset}`);
        console.log(`\n${colors.blue}Run:${colors.reset} node build.js`);
    } else if (!sourceOk) {
        console.log(`\n${colors.red}❌ Source files have hardcoded values!${colors.reset}`);
        console.log(`\nReplace hardcoded values with placeholders in source files.`);
    } else {
        console.log(`\n${colors.yellow}⚠️  Build may need attention${colors.reset}`);
        console.log(`\n${colors.blue}Run:${colors.reset} node build.js`);
    }
    
    console.log('');
}

verify();
