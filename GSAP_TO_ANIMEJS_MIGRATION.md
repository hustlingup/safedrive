# GSAP to Anime.js Migration - Project Overview

## Summary

This document provides a complete overview of the migration from GSAP to Anime.js for the SafeDrive web application. The migration maintains identical user experience while reducing bundle size by ~66%.

## Spec Location

All specification documents are located in `.kiro/specs/gsap-to-animejs-migration/`:
- `requirements.md` - Complete requirements with acceptance criteria
- `design.md` - Technical design, architecture, and implementation details
- `tasks.md` - Step-by-step implementation plan

## Animations to Migrate

### 1. QR Code Animations (index.html)
- **Sliding Puzzle Timeline**: Complex tile movements with GSAP timeline
- **Color Cycling**: Infinite color transitions for tiles and frame
- **Location**: Inline script around line 2628-2686
- **Complexity**: High (timeline with multiple steps + stagger)

### 2. Announcement Banner (index.html)
- **Sliding Animation**: Horizontal scroll effect
- **Blinking Animation**: Opacity fade loop
- **Location**: Inline script around line 2822-2843
- **Complexity**: Medium (two separate infinite loops)

### 3. Quote Character Animations (index.html)
- **Character Reveal**: Stagger opacity animation for text
- **Location**: Inline script around line 3148
- **Complexity**: Low (simple stagger)

### 4. Leaderboard Stagger (script.js)
- **ScrollTrigger Animation**: Rows fade in with stagger on scroll
- **Location**: script.js lines 4115-4137
- **Complexity**: High (requires IntersectionObserver replacement)

### 5. Subscribe Button Hover (multiple files)
- **Scale Effect**: Button scales on hover
- **Locations**: 
  - script.js lines 5590-5603
  - plate.html (inline)
  - subscription-manager.js lines 72-84
- **Complexity**: Low (simple hover effect)

## Code to Delete

### Unused Hero Animation (script.js)
- **Functions**: `initHeroPlateAnimation()`, `playHeroAnimation()`, `loopHeroAnimation()`
- **Location**: script.js lines ~5280-5365
- **Reason**: References HTML elements (heroPlate, heroLaser, heroEnvelope, heroCheckmark) that don't exist in current HTML
- **Action**: Delete entire function block

## Migration Strategy

### Phase 1: Setup
1. Add Anime.js library (17KB vs GSAP 50KB)
2. Create utility functions for common patterns
3. Keep GSAP temporarily for comparison

### Phase 2: Simple Animations
1. Migrate hover animations (subscribe buttons)
2. Test and verify

### Phase 3: Timeline Animations
1. Delete unused hero animation code
2. Migrate QR animations
3. Migrate announcement banner
4. Migrate quote animations
5. Test and verify

### Phase 4: Scroll-Triggered Animations
1. Implement IntersectionObserver utilities
2. Migrate leaderboard stagger
3. Test and verify

### Phase 5: Cleanup
1. Remove GSAP and ScrollTrigger
2. Final testing
3. Performance validation

## Key Technical Mappings

### Duration Conversion
- GSAP: seconds (0.3)
- Anime.js: milliseconds (300)

### Easing Functions
| GSAP | Anime.js |
|------|----------|
| `power2.out` | `easeOutQuad` |
| `power3.out` | `easeOutCubic` |
| `power1.inOut` | `easeInOutQuad` |
| `back.out` | `easeOutBack` |

### Timeline Offsets
| GSAP | Anime.js |
|------|----------|
| `"-=0.4"` | `"-=400"` |
| `"+=0.2"` | `"+=200"` |

### Stagger
- GSAP: `stagger: 0.08` (seconds)
- Anime.js: `delay: anime.stagger(80)` (milliseconds)

### Infinite Loop
- GSAP: `repeat: -1`
- Anime.js: `loop: true`

## ScrollTrigger to IntersectionObserver

### GSAP ScrollTrigger
```javascript
scrollTrigger: {
    trigger: element,
    start: 'top 80%',
    once: true
}
```

### IntersectionObserver Equivalent
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            anime({ targets: entry.target, ... });
            if (once) observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
```

## Expected Benefits

### Bundle Size Reduction
- **Before**: GSAP (30KB) + ScrollTrigger (20KB) = 50KB
- **After**: Anime.js = 17KB
- **Savings**: 33KB (~66% reduction)

### Performance
- Target: 60fps for all animations
- Anime.js is lightweight and performant
- Native IntersectionObserver is more efficient than ScrollTrigger

### Maintainability
- Fewer external dependencies
- Simpler API for basic animations
- Utility functions for common patterns

## Testing Approach

### Unit Tests (Optional)
- Test utility functions
- Test configuration mappings
- Test error handling

### Property-Based Tests (Optional)
- Duration conversion property
- Easing mapping property
- Stagger calculation property
- Once-only animation property

### Integration Tests
- QR animation sequence
- Scroll-triggered leaderboard
- Hover interactions
- Announcement banner loop

### Visual Regression
- Compare animation frames between GSAP and Anime.js
- Verify visual differences < 1%

### Cross-Browser Testing
- Chrome, Firefox, Safari, Edge
- Verify IntersectionObserver support
- Verify animation consistency

## Implementation Notes

### Files to Modify
1. `index.html` - QR, announcement, quote animations + add Anime.js CDN
2. `script.js` - Delete hero animation, migrate leaderboard + subscribe button
3. `plate.html` - Migrate subscribe button + add Anime.js CDN
4. `subscription-manager.js` - Migrate subscribe button

### Files to Create
- Animation utilities (can be inline or separate file)

### Dependencies to Add
```html
<script src="https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js"></script>
```

### Dependencies to Remove
```html
<!-- Remove these -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

## Next Steps

To begin implementation:
1. Open `.kiro/specs/gsap-to-animejs-migration/tasks.md`
2. Click "Start task" next to task 1
3. Follow the implementation plan step by step
4. Test after each checkpoint

## Rollback Plan

If issues arise:
1. **Immediate**: Revert via Git to GSAP version
2. **Partial**: Keep Anime.js for simple animations, revert complex ones
3. **Feature Flag**: Toggle between GSAP and Anime.js

## Documentation Updates Needed

After migration:
1. Update README.md with new animation library
2. Document Anime.js usage patterns
3. Create guide for adding new animations
4. Document lessons learned

---

**Created**: December 19, 2025
**Status**: Specification Complete - Ready for Implementation
**Estimated Effort**: 2-3 days for core migration + testing
