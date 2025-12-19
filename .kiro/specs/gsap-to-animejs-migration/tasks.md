# Implementation Plan

- [x] 1. Project setup and dependency management





  - Add Anime.js library to all HTML files that use animations
  - Create a central animation utilities file for reusable functions
  - Keep GSAP temporarily for side-by-side comparison during migration
  - _Requirements: 7.3_

- [x] 2. Create animation utility functions







- [x] 2.1 Implement scrollTriggerAnimation utility




  - Write function that accepts selector, animation config, and options
  - Set up IntersectionObserver with configurable threshold
  - Implement once-only animation tracking using WeakSet
  - Handle viewport entry/exit with proper callbacks
  - _Requirements: 8.1, 8.2, 8.4_

- [ ]* 2.2 Write property test for scrollTriggerAnimation
  - **Property 15: Utility function interface**
  - **Property 16: Utility observer creation**
  - **Property 18: Animation state tracking**
  - **Validates: Requirements 8.1, 8.2, 8.4**


- [x] 2.3 Implement hoverAnimation utility




  - Write function that accepts element and hover/leave configs
  - Attach mouseenter and mouseleave event listeners
  - Trigger Anime.js animations on hover events
  - _Requirements: 3.1, 3.2_

- [ ]* 2.4 Write property test for hover animation interruption
  - **Property 5: Hover animation interruption handling**

  - **Validates: Requirements 3.4**

- [x] 2.5 Implement animateOnce utility




  - Create WeakSet for tracking animated elements
  - Write function that checks if element was already animated

  - Prevent duplicate animations
  - _Requirements: 8.4_

- [x] 2.6 Implement createTimeline utility






  - Write function that creates Anime.js timeline
  - Support timeline offset syntax
  - Handle sequential animation chaining
  - _Requirements: 2.3_

- [ ]* 2.7 Write property test for timeline offset preservation
  - **Property 3: Timeline offset preservation**
  - **Validates: Requirements 2.3**

- [x] 3. Migrate hover animations (subscribe buttons)






- [x] 3.1 Replace GSAP hover in script.js

  - Locate subscribe button hover animations in script.js
  - Replace gsap.to calls with anime() calls
  - Convert duration from seconds to milliseconds (0.3s → 300ms)
  - Map scale property and easing
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.2 Replace GSAP hover in plate.html


  - Locate subscribe button hover animations in plate.html
  - Replace gsap.to calls with anime() calls
  - Ensure consistent behavior with script.js implementation
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 3.3 Write property test for easing equivalence
  - **Property 4: Easing function equivalence**
  - **Validates: Requirements 2.5, 3.3**

- [ ]* 3.4 Write unit tests for hover animations
  - Test mouseenter triggers scale to 1.1
  - Test mouseleave triggers scale to 1.0
  - Test duration is 300ms
  - Verify easing function is applied
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4. Checkpoint - Verify hover animations work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Remove unused hero animation code






- [x] 5.1 Delete unused hero animation functions from script.js

  - Remove initHeroPlateAnimation() function (lines ~5280-5365)
  - Remove playHeroAnimation() function
  - Remove loopHeroAnimation() function
  - These reference HTML elements (heroPlate, heroLaser, heroEnvelope, heroCheckmark) that don't exist
  - _Requirements: 7.4_

- [x] 6. Migrate announcement banner animation





- [x] 6.1 Replace GSAP announcement banner in index.html


  - Locate gsap.fromTo and gsap.to calls for announcementText
  - Convert sliding animation to Anime.js
  - Convert blinking animation to Anime.js with loop
  - Preserve infinite repeat behavior
  - _Requirements: 6.3_

- [ ]* 6.2 Write property test for infinite loop behavior
  - **Property 14: Infinite loop behavior**
  - **Validates: Requirements 6.3**

- [x] 7. Migrate QR code animations in index.html





- [x] 7.1 Replace QR sliding puzzle timeline


  - Convert gsap.timeline() for QR tiles to anime.timeline()
  - Map all tile movement animations (translateX, translateY)
  - Preserve stagger timing and repeat behavior
  - _Requirements: 6.1, 6.3_



- [x] 7.2 Replace QR color cycling animations

  - Convert gsap.to() calls for fill color changes
  - Preserve 0.4 second duration for color transitions
  - Maintain stagger of 0.01 seconds for tiles
  - _Requirements: 6.2, 6.4_

- [ ]* 7.3 Write property test for color transition timing
  - **Property 13: Color transition timing**
  - **Validates: Requirements 6.2**

- [ ]* 7.4 Write unit tests for QR animations
  - Test sliding puzzle movements
  - Test color cycling with correct duration
  - Test infinite loop behavior
  - Test stagger timing for tiles
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 8. Checkpoint - Verify timeline animations work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Migrate scroll-triggered leaderboard animation




- [x] 9.1 Replace ScrollTrigger with IntersectionObserver


  - Remove gsap.registerPlugin(ScrollTrigger) call
  - Remove gsap.set() for initial row state
  - Remove gsap.to() with scrollTrigger configuration
  - Implement IntersectionObserver for leaderboard section
  - Map threshold: 'top 80%' → threshold: 0.2
  - Implement once: true behavior
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 9.2 Implement stagger animation with Anime.js


  - Create Anime.js animation for table rows
  - Set initial state: opacity: 0, translateY: 20
  - Animate to: opacity: 1, translateY: 0
  - Apply stagger delay: anime.stagger(80) for 0.08s
  - Set duration: 500ms
  - Apply easing: easeOutQuad
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 9.3 Write property test for IntersectionObserver setup
  - **Property 6: IntersectionObserver setup**
  - **Validates: Requirements 4.1**

- [ ]* 9.4 Write property test for scroll threshold accuracy
  - **Property 7: Scroll threshold accuracy**
  - **Property 19: Scroll trigger position preservation**
  - **Validates: Requirements 4.3, 9.2**

- [ ]* 9.5 Write property test for once-only behavior
  - **Property 8: Once-only animation behavior**
  - **Validates: Requirements 4.4**

- [ ]* 9.6 Write property test for observer-animation connection
  - **Property 9: Observer-animation connection**
  - **Validates: Requirements 4.5**

- [ ]* 9.7 Write property test for stagger properties
  - **Property 10: Stagger property values**
  - **Property 11: Stagger duration consistency**
  - **Property 12: Stagger easing application**
  - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ]* 9.8 Write unit test for leaderboard animation
  - Test IntersectionObserver triggers on scroll
  - Test rows animate with correct stagger
  - Test animation plays only once
  - Test opacity and translateY values
  - _Requirements: 4.2, 5.1_

- [x] 10. Migrate quote character animations




- [x] 10.1 Replace GSAP quote animations in index.html


  - Locate gsap.to() calls for quote span children (around line 3148)
  - Convert to Anime.js with stagger
  - Preserve opacity animation (0 → 1) and duration (0.03s → 30ms)
  - _Requirements: 2.1, 2.2_

- [ ]* 10.2 Write property test for timeline animations
  - **Property 1: Timeline duration preservation**
  - **Property 2: Property mapping correctness**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 11. Checkpoint - Verify scroll-triggered animations work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Remove GSAP dependencies






- [x] 12.1 Remove GSAP script tags from index.html

  - Remove GSAP library script tag
  - Remove ScrollTrigger plugin script tag
  - Verify no GSAP references remain in HTML
  - _Requirements: 7.1, 7.2_



- [x] 12.2 Remove GSAP script tags from plate.html
  - Remove GSAP library script tag
  - Verify no GSAP references remain in HTML
  - _Requirements: 7.1_


- [x] 12.3 Remove GSAP code from script.js

  - Remove all gsap.* function calls
  - Remove ScrollTrigger references
  - Remove any GSAP-specific comments
  - _Requirements: 7.4_


- [x] 12.4 Verify no GSAP loading attempts

  - Check network tab for GSAP CDN requests
  - Verify console has no GSAP-related errors
  - Confirm application loads without GSAP
  - _Requirements: 7.4_

- [ ]* 12.5 Write unit tests for dependency cleanup
  - Test HTML files don't contain GSAP script tags
  - Test HTML files don't contain ScrollTrigger script tags
  - Test HTML files contain Anime.js script tag
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 13. Performance validation and optimization
- [x] 13.1 Measure animation performance








  - Measure frame rates during QR animations
  - Measure frame rates during leaderboard stagger
  - Measure frame rates during announcement banner
  - Compare with GSAP baseline (if available)
  - Verify 60fps target is met
  - _Requirements: 9.5_

- [ ]* 13.2 Write property test for animation performance
  - **Property 20: Animation performance**
  - **Validates: Requirements 9.5**

- [x] 13.3 Measure bundle size reduction





  - Calculate original bundle size with GSAP + ScrollTrigger
  - Calculate new bundle size with Anime.js
  - Document size reduction achieved
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 14. Cross-browser testing





- [x] 14.1 Test in Chrome

  - Verify all animations work correctly
  - Verify IntersectionObserver functions properly
  - Check console for errors
  - _Requirements: 10.5_

- [x] 14.2 Test in Firefox

  - Verify all animations work correctly
  - Verify IntersectionObserver functions properly
  - Check console for errors
  - _Requirements: 10.5_

- [x] 14.3 Test in Safari

  - Verify all animations work correctly
  - Verify IntersectionObserver functions properly
  - Check console for errors
  - _Requirements: 10.5_

- [x] 14.4 Test in Edge

  - Verify all animations work correctly
  - Verify IntersectionObserver functions properly
  - Check console for errors
  - _Requirements: 10.5_

- [x] 15. Final checkpoint - Complete migration verification





  - Ensure all tests pass, ask the user if questions arise.
