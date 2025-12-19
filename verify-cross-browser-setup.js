/**
 * Cross-Browser Testing Setup Verification Script
 * 
 * This script verifies that all necessary files and dependencies
 * are in place for cross-browser testing.
 * 
 * Run with: node verify-cross-browser-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Cross-Browser Testing Setup...\n');

// Required files
const requiredFiles = [
    'test-cross-browser.html',
    'CROSS_BROWSER_TESTING_GUIDE.md',
    'TESTING_QUICK_REFERENCE.md',
    'TESTING_README.md',
    'CHROME_TEST_RESULTS.md',
    'FIREFOX_TEST_RESULTS.md',
    'SAFARI_TEST_RESULTS.md',
    'EDGE_TEST_RESULTS.md',
    'CROSS_BROWSER_TESTING_SUMMARY.md',
    'js/animation-utils.js',
    'index.html',
    'plate.html'
];

// Check files
let allFilesPresent = true;
let missingFiles = [];

console.log('📁 Checking Required Files:\n');

requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    
    if (!exists) {
        allFilesPresent = false;
        missingFiles.push(file);
    }
});

console.log('\n');

// Check test page content
console.log('🧪 Checking Test Page Content:\n');

if (fs.existsSync('test-cross-browser.html')) {
    const testPageContent = fs.readFileSync('test-cross-browser.html', 'utf8');
    
    const checks = [
        { name: 'Anime.js CDN link', pattern: /animejs.*\.min\.js/ },
        { name: 'Animation utils import', pattern: /animation-utils\.js/ },
        { name: 'Browser detection', pattern: /detectBrowser/ },
        { name: 'Hover test', pattern: /hover-button/ },
        { name: 'Timeline test', pattern: /timeline-box/ },
        { name: 'Scroll test', pattern: /scroll-item/ },
        { name: 'Loop test', pattern: /loop-element/ },
        { name: 'Stagger test', pattern: /stagger-box/ },
        { name: 'Run all tests button', pattern: /runAllTests/ },
        { name: 'Console output', pattern: /consoleOutput/ }
    ];
    
    checks.forEach(check => {
        const found = check.pattern.test(testPageContent);
        const status = found ? '✅' : '❌';
        console.log(`${status} ${check.name}`);
    });
} else {
    console.log('❌ test-cross-browser.html not found');
}

console.log('\n');

// Check animation utils
console.log('🎨 Checking Animation Utilities:\n');

if (fs.existsSync('js/animation-utils.js')) {
    const utilsContent = fs.readFileSync('js/animation-utils.js', 'utf8');
    
    const utilChecks = [
        { name: 'scrollTriggerAnimation function', pattern: /function scrollTriggerAnimation/ },
        { name: 'hoverAnimation function', pattern: /function hoverAnimation/ },
        { name: 'animateOnce function', pattern: /function animateOnce/ },
        { name: 'createTimeline function', pattern: /function createTimeline/ },
        { name: 'IntersectionObserver check', pattern: /IntersectionObserver.*in.*window/ },
        { name: 'WeakSet for tracking', pattern: /WeakSet/ }
    ];
    
    utilChecks.forEach(check => {
        const found = check.pattern.test(utilsContent);
        const status = found ? '✅' : '❌';
        console.log(`${status} ${check.name}`);
    });
} else {
    console.log('❌ js/animation-utils.js not found');
}

console.log('\n');

// Check documentation completeness
console.log('📚 Checking Documentation:\n');

const docFiles = [
    'CROSS_BROWSER_TESTING_GUIDE.md',
    'TESTING_QUICK_REFERENCE.md',
    'TESTING_README.md'
];

docFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const wordCount = content.split(/\s+/).length;
        const hasContent = wordCount > 100;
        const status = hasContent ? '✅' : '⚠️';
        console.log(`${status} ${file} (${wordCount} words)`);
    } else {
        console.log(`❌ ${file} not found`);
    }
});

console.log('\n');

// Check result templates
console.log('📋 Checking Result Templates:\n');

const resultFiles = [
    'CHROME_TEST_RESULTS.md',
    'FIREFOX_TEST_RESULTS.md',
    'SAFARI_TEST_RESULTS.md',
    'EDGE_TEST_RESULTS.md'
];

resultFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hasChecklist = content.includes('- [ ]');
        const hasInstructions = content.includes('Testing Instructions');
        const status = (hasChecklist && hasInstructions) ? '✅' : '⚠️';
        console.log(`${status} ${file}`);
    } else {
        console.log(`❌ ${file} not found`);
    }
});

console.log('\n');

// Summary
console.log('═══════════════════════════════════════════════════════\n');

if (allFilesPresent) {
    console.log('✅ All required files are present!\n');
    console.log('🚀 You can now start cross-browser testing:\n');
    console.log('   1. Start a local server:');
    console.log('      python -m http.server 8000\n');
    console.log('   2. Open test page:');
    console.log('      http://localhost:8000/test-cross-browser.html\n');
    console.log('   3. Follow the testing guide:');
    console.log('      CROSS_BROWSER_TESTING_GUIDE.md\n');
    console.log('   4. Use quick reference:');
    console.log('      TESTING_QUICK_REFERENCE.md\n');
} else {
    console.log('❌ Some files are missing:\n');
    missingFiles.forEach(file => {
        console.log(`   - ${file}`);
    });
    console.log('\n⚠️  Please ensure all files are created before testing.\n');
}

console.log('═══════════════════════════════════════════════════════\n');

// Exit with appropriate code
process.exit(allFilesPresent ? 0 : 1);
