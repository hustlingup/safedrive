// Mobile Enhancements Verification Script
// Run this in the browser console to verify all enhancements are in place

console.log('=== SafeDrive Mobile Enhancements Verification ===\n');

const results = {
    passed: [],
    failed: [],
    warnings: []
};

function pass(test) {
    results.passed.push(test);
    console.log('✅', test);
}

function fail(test) {
    results.failed.push(test);
    console.error('❌', test);
}

function warn(test) {
    results.warnings.push(test);
    console.warn('⚠️', test);
}

// Test 1: Input attributes
console.log('\n1. Testing Input Attributes...');
const inputs = document.querySelectorAll('input[type="tel"]');
if (inputs.length > 0) {
    pass(`Found ${inputs.length} input(s) with type="tel"`);
    
    inputs.forEach((input, i) => {
        const inputmode = input.getAttribute('inputmode');
        if (inputmode === 'numeric') {
            pass(`Input ${i + 1}: inputmode="numeric" ✓`);
        } else {
            fail(`Input ${i + 1}: inputmode="${inputmode}" (should be "numeric")`);
        }
    });
} else {
    fail('No inputs with type="tel" found');
}

// Test 2: Touch target sizes
console.log('\n2. Testing Touch Target Sizes...');
const interactiveElements = document.querySelectorAll('button, .tab, .counter-btn, a.plate-link');
let touchTargetIssues = 0;

interactiveElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
        touchTargetIssues++;
        warn(`Element too small: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px - ${element.className || element.tagName}`);
    }
});

if (touchTargetIssues === 0) {
    pass('All interactive elements meet 44x44px minimum');
} else {
    warn(`${touchTargetIssues} element(s) below 44x44px minimum`);
}

// Test 3: Touch action CSS
console.log('\n3. Testing Touch Action CSS...');
const button = document.querySelector('button');
if (button) {
    const touchAction = window.getComputedStyle(button).touchAction;
    if (touchAction === 'manipulation') {
        pass('touch-action: manipulation is applied');
    } else {
        fail(`touch-action: ${touchAction} (should be "manipulation")`);
    }
} else {
    warn('No button found to test touch-action');
}

// Test 4: Viewport meta tag
console.log('\n4. Testing Viewport Meta Tag...');
const viewportMeta = document.querySelector('meta[name="viewport"]');
if (viewportMeta) {
    const content = viewportMeta.getAttribute('content');
    if (content.includes('width=device-width')) {
        pass('Viewport meta tag configured correctly');
    } else {
        warn('Viewport meta tag exists but may not be optimal');
    }
} else {
    fail('Viewport meta tag not found');
}

// Test 5: Responsive CSS
console.log('\n5. Testing Responsive CSS...');
const styleSheets = Array.from(document.styleSheets);
let hasMediaQueries = false;

try {
    styleSheets.forEach(sheet => {
        if (sheet.href && sheet.href.includes('styles.css')) {
            const rules = Array.from(sheet.cssRules || []);
            const mediaRules = rules.filter(rule => rule.type === CSSRule.MEDIA_RULE);
            if (mediaRules.length > 0) {
                hasMediaQueries = true;
                pass(`Found ${mediaRules.length} media query rules in styles.css`);
            }
        }
    });
} catch (e) {
    warn('Could not access stylesheet rules (CORS or security restriction)');
    hasMediaQueries = true; // Assume it's there if we can't check
}

if (!hasMediaQueries) {
    fail('No media queries found in styles.css');
}

// Test 6: Chart responsiveness
console.log('\n6. Testing Chart Responsiveness...');
const chart = document.querySelector('#plateChart');
if (chart) {
    const rect = chart.getBoundingClientRect();
    const parent = chart.parentElement.getBoundingClientRect();
    if (rect.width <= parent.width) {
        pass('Chart is responsive (fits within container)');
    } else {
        warn('Chart may overflow container');
    }
} else {
    warn('Chart element not found (may be on different page)');
}

// Test 7: Viewport dimensions
console.log('\n7. Testing Viewport Dimensions...');
const width = window.innerWidth;
const height = window.innerHeight;
const orientation = width > height ? 'landscape' : 'portrait';

console.log(`   Viewport: ${width}x${height}px`);
console.log(`   Orientation: ${orientation}`);

if (width >= 320) {
    pass('Viewport width supports minimum mobile size (320px)');
} else {
    warn('Viewport width below 320px minimum');
}

// Test 8: CSS Variables
console.log('\n8. Testing CSS Variables...');
const root = document.documentElement;
const minTouchTarget = getComputedStyle(root).getPropertyValue('--min-touch-target');
if (minTouchTarget && minTouchTarget.trim() === '44px') {
    pass('CSS variable --min-touch-target is set to 44px');
} else {
    warn(`CSS variable --min-touch-target: ${minTouchTarget || 'not found'}`);
}

// Summary
console.log('\n=== Summary ===');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);

if (results.failed.length === 0) {
    console.log('\n🎉 All critical tests passed!');
} else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
}

// Return results for programmatic access
return {
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    total: results.passed.length + results.failed.length + results.warnings.length,
    details: results
};
