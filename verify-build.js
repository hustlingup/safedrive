#!/usr/bin/env node
// Verification script for SafeDrive build
// Checks if files are properly built or have placeholders

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function checkFile(filePath, placeholders) {
    if (!fs.existsSync(filePath)) {
        console.log(`${colors.red}✗ File not found: ${filePath}${colors.reset}`);
        return { found: false };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const foundPlaceholders = [];
    
    for (const placeholder of placeholders) {
        if (content.includes(placeholder)) {
            foundPlaceholders.push(placeholder);
        }
    }
    
    return {
        found: true,
        hasPlaceholders: foundPlaceholders.length > 0,
        placeholders: foundPlaceholders
    };
}

function verify() {
    console.log(`${colors.blue}🔍 Verifying SafeDrive Build Status...${colors.reset}\n`);
    
    const filesToCheck = [
        {
            path: 'script.js',
            placeholders: ['__VAPID_KEY__']
        },
        {
            path: 'subscription-manager.js',
            placeholders: ['__VAPID_KEY__']
        },
        {
            path: 'firebase-config.js',
            placeholders: [
                '__FIREBASE_API_KEY__',
                '__FIREBASE_AUTH_DOMAIN__',
                '__FIREBASE_DATABASE_URL__',
                '__FIREBASE_PROJECT_ID__',
                '__FIREBASE_STORAGE_BUCKET__',
                '__FIREBASE_MESSAGING_SENDER_ID__',
                '__FIREBASE_APP_ID__',
                '__FIREBASE_MEASUREMENT_ID__'
            ]
        },
        {
            path: 'sw.js',
            placeholders: [
                '__FIREBASE_API_KEY__',
                '__FIREBASE_AUTH_DOMAIN__',
                '__FIREBASE_DATABASE_URL__',
                '__FIREBASE_PROJECT_ID__',
                '__FIREBASE_STORAGE_BUCKET__',
                '__FIREBASE_MESSAGING_SENDER_ID__',
                '__FIREBASE_APP_ID__',
                '__FIREBASE_MEASUREMENT_ID__'
            ]
        }
    ];
    
    let allBuilt = true;
    let allPlaceholders = true;
    
    for (const file of filesToCheck) {
        const result = checkFile(file.path, file.placeholders);
        
        if (!result.found) {
            allBuilt = false;
            allPlaceholders = false;
            continue;
        }
        
        if (result.hasPlaceholders) {
            console.log(`${colors.yellow}⚠️  ${file.path}${colors.reset}`);
            console.log(`   Status: Has placeholders (not built)`);
            console.log(`   Found: ${result.placeholders.join(', ')}`);
            allBuilt = false;
        } else {
            console.log(`${colors.green}✓ ${file.path}${colors.reset}`);
            console.log(`   Status: Built (credentials injected)`);
            allPlaceholders = false;
        }
        console.log('');
    }
    
    console.log('═'.repeat(60));
    
    if (allBuilt) {
        console.log(`\n${colors.green}✅ All files are BUILT and ready to deploy!${colors.reset}`);
        console.log(`\n${colors.blue}Next steps:${colors.reset}`);
        console.log('  1. Deploy to production: firebase deploy --only hosting');
        console.log('  2. Test the application');
        console.log(`\n${colors.yellow}⚠️  Remember: Run "node restore-placeholders.js" before committing to Git${colors.reset}`);
    } else if (allPlaceholders) {
        console.log(`\n${colors.yellow}⚠️  All files have PLACEHOLDERS (not built)${colors.reset}`);
        console.log(`\n${colors.blue}Next steps:${colors.reset}`);
        console.log('  1. Run: node build.js');
        console.log('  2. Deploy to production');
        console.log(`\n${colors.green}✓ Files are safe to commit to Git${colors.reset}`);
    } else {
        console.log(`\n${colors.red}❌ Mixed state detected!${colors.reset}`);
        console.log(`\n${colors.blue}Recommended actions:${colors.reset}`);
        console.log('  - To build for deployment: node build.js');
        console.log('  - To restore for Git commit: node restore-placeholders.js');
    }
    
    console.log('');
}

// Run verification
verify();
