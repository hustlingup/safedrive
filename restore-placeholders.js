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
        console.log(`✓ Restored placeholder in ${path.basename(filePath)}`);
    }
    
    // Write back if modified
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
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
        'subscription-manager.js'
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
