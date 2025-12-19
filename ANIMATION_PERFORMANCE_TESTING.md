# Animation Performance Testing Guide

## Overview

This guide explains how to measure and validate the performance of animations after the GSAP to Anime.js migration. The goal is to verify that all animations maintain smooth 60fps performance.

## Quick Start

### Method 1: Automated Testing (Recommended)

1. Open `test-animation-performance.html` in your browser
2. Click "🚀 Open index.html with Auto-Measure"
3. Check the browser console in the new tab for results
4. Wait ~10-15 seconds for all measurements to complete

### Method 2: Manual Console Testing

1. Open `index.html` in your browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Run the following command:

```javascript
const script = document.createElement('script');
script.src = 'measure-animation-performance.js';
script.onload = () => measureAllAnimations();
document.head.appendChild(script);
```

5. Wait for measurements to complete and review results

### Method 3: Direct URL Parameter

Open `index.html?measure=true` in your browser. The performance test will automatically run after page load.

## What Gets Measured

The performance measurement tool tests two key animations:

### 1. QR Animation
- **Type**: Timeline animation with infinite loop
- **Components**: Sliding puzzle + color cycling
- **Duration**: 3 seconds of measurement
- **Location**: `#qr-generator-intro` section

### 2. Leaderboard Stagger
- **Type**: Scroll-triggered stagger animation
- **Components**: Table rows with IntersectionObserver
- **Duration**: 2 seconds of measurement
- **Location**: `#mostLikedSection` section

## Performance Metrics

For each animation, the tool measures:

- **Average FPS**: Mean frames per second across the measurement period
- **Min FPS**: Lowest FPS recorded
- **Max FPS**: Highest FPS recorded
- **Total Frames**: Number of frames rendered
- **Dropped Frames**: Frames below 55fps threshold
- **Dropped Frame %**: Percentage of dropped frames

## Success Criteria

✅ **PASS**: Animation meets performance target
- Average FPS >= 57 (95% of 60fps target)
- Dropped frame percentage < 10%

❌ **FAIL**: Animation needs optimization
- Average FPS < 57
- Dropped frame percentage >= 10%

## Sample Output

```
================================================================================
📈 ANIMATION PERFORMANCE REPORT
================================================================================
Target FPS: 60
Acceptable Range: 57.0 - 60 FPS
================================================================================

QR Animation:
  Type: QR Sliding Puzzle + Color Cycling
  Description: Timeline animation with infinite loop
  Average FPS: 59.87 ✅
  Min FPS: 58.23
  Max FPS: 60.00
  Total Frames: 180
  Dropped Frames: 0 (0.00%)
  Duration: 3000ms
  Status: PASS ✅

Leaderboard Stagger:
  Type: Leaderboard Stagger
  Description: IntersectionObserver-triggered stagger animation with 80ms delay
  Average FPS: 59.92 ✅
  Min FPS: 59.12
  Max FPS: 60.00
  Total Frames: 120
  Dropped Frames: 0 (0.00%)
  Duration: 2000ms
  Status: PASS ✅

================================================================================
OVERALL STATUS: ALL ANIMATIONS PASS ✅
================================================================================
```

## Troubleshooting

### Issue: "Animation section not found"
**Solution**: Ensure you're running the test on `index.html` with all animations present.

### Issue: Low FPS readings
**Possible causes**:
- Browser DevTools open (can impact performance)
- Other tabs consuming resources
- Hardware acceleration disabled
- Running on low-end hardware

**Solutions**:
- Close DevTools after starting the test
- Close other browser tabs
- Enable hardware acceleration in browser settings
- Test on different hardware

### Issue: Script not loading
**Solution**: Ensure `measure-animation-performance.js` is in the same directory as `index.html`.

## Comparing with GSAP Baseline

If you have GSAP performance data from before the migration:

1. Run the same measurements on the GSAP version
2. Compare average FPS values
3. Verify Anime.js performance is equal or better
4. Document any differences

Expected outcome: Anime.js should match or exceed GSAP performance while reducing bundle size by ~33KB.

## Advanced Usage

### Measure Individual Animations

```javascript
const measurer = new AnimationPerformanceMeasurer();

// Measure only QR animation
await measurer.measureQRAnimation();

// Measure only leaderboard
await measurer.measureLeaderboardStagger();

// Generate report
measurer.generateReport();
```

### Export Results as JSON

```javascript
const measurer = new AnimationPerformanceMeasurer();
await measurer.measureAll();
const jsonReport = measurer.exportJSON();

// Copy to clipboard or save to file
console.log(JSON.stringify(jsonReport, null, 2));
```

### Custom Measurement Duration

```javascript
const measurer = new AnimationPerformanceMeasurer();

// Measure for 5 seconds instead of default
const metrics = await measurer.measureFPS(5000);
console.log(metrics);
```

## Integration with CI/CD

For automated testing in CI/CD pipelines, you can use headless browser testing:

```javascript
// Example using Puppeteer
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000/index.html?measure=true');
  
  // Wait for measurements to complete
  await page.waitForTimeout(15000);
  
  // Extract results from console
  const logs = await page.evaluate(() => {
    return window.performanceResults;
  });
  
  console.log(logs);
  await browser.close();
})();
```

## Requirements Validation

This performance testing validates **Requirement 9.5**:

> WHEN any animation plays THEN the performance SHALL be equal to or better than the GSAP implementation

The tool verifies:
- ✅ All animations maintain 60fps target
- ✅ Frame drops are minimal (< 10%)
- ✅ Performance is consistent across animation types
- ✅ Scroll-triggered animations don't cause jank

## Next Steps

After running performance tests:

1. ✅ Verify all animations pass (>= 57 avg FPS)
2. ✅ Document results in migration report
3. ✅ Compare with GSAP baseline (if available)
4. ✅ Test on multiple browsers (Chrome, Firefox, Safari, Edge)
5. ✅ Test on different devices (desktop, mobile, tablet)
6. ✅ Mark task 13.1 as complete

## Files

- `measure-animation-performance.js` - Core measurement script
- `test-animation-performance.html` - Interactive test interface
- `ANIMATION_PERFORMANCE_TESTING.md` - This documentation

## Support

If you encounter issues or have questions about performance testing, refer to:
- Design document: `.kiro/specs/gsap-to-animejs-migration/design.md`
- Requirements: `.kiro/specs/gsap-to-animejs-migration/requirements.md`
- Tasks: `.kiro/specs/gsap-to-animejs-migration/tasks.md`
