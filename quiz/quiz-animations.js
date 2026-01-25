/**
 * quiz-animations.js
 * SVG animation utilities using anime.js for quiz hero sections
 * 
 * Provides engaging animations for quiz landing pages:
 * - Quiz1: Driving theme with road, car, speedometer, and personality icons
 * - Quiz2: Emergency theme with warning signs, flashing lights, and danger icons
 * 
 * Includes performance optimizations:
 * - Reduced motion support for accessibility
 * - Visibility-based pausing (Intersection Observer)
 * - Mobile device optimizations
 */

const QuizAnimations = (function() {
    // Private state
    let animations = [];
    let isInitialized = false;
    let isPaused = false;
    let intersectionObserver = null;
    let currentContainer = null;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check if device is mobile (for performance optimizations)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth < 768;
    
    /**
     * Setup Intersection Observer for visibility-based pausing
     * @param {HTMLElement} container - Container to observe
     */
    function setupVisibilityObserver(container) {
        if (!('IntersectionObserver' in window)) {
            return;
        }
        
        // Cleanup existing observer
        if (intersectionObserver) {
            intersectionObserver.disconnect();
        }
        
        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    QuizAnimations.resume();
                } else {
                    QuizAnimations.pause();
                }
            });
        }, {
            threshold: 0.1
        });
        
        intersectionObserver.observe(container);
    }
    
    /**
     * Get animation duration multiplier based on device
     * @returns {number} Duration multiplier
     */
    function getDurationMultiplier() {
        return isMobile ? 1.5 : 1; // Slower animations on mobile for better performance
    }
    
    /**
     * Create Quiz1 SVG content (driving theme)
     * @returns {string} SVG markup
     */
    function createQuiz1SVG() {
        return `
            <svg class="quiz-hero-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <defs>
                    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#E0F6FF;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#4a4a4a;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <!-- Background sky -->
                <rect class="hero-background" x="0" y="0" width="400" height="300" fill="url(#skyGradient)"/>
                
                <!-- Clouds -->
                <g class="clouds">
                    <ellipse class="cloud cloud-1" cx="80" cy="50" rx="40" ry="20" fill="white" opacity="0.8"/>
                    <ellipse class="cloud cloud-2" cx="300" cy="70" rx="50" ry="25" fill="white" opacity="0.7"/>
                    <ellipse class="cloud cloud-3" cx="200" cy="40" rx="35" ry="18" fill="white" opacity="0.9"/>
                </g>
                
                <!-- Road -->
                <polygon class="road" points="120,300 280,300 230,150 170,150" fill="url(#roadGradient)"/>
                
                <!-- Road lines container -->
                <g class="road-lines-container" clip-path="url(#roadClip)">
                    <defs>
                        <clipPath id="roadClip">
                            <polygon points="120,300 280,300 230,150 170,150"/>
                        </clipPath>
                    </defs>
                    <rect class="road-line road-line-1" x="196" y="150" width="8" height="30" fill="#FFD700"/>
                    <rect class="road-line road-line-2" x="196" y="200" width="8" height="30" fill="#FFD700"/>
                    <rect class="road-line road-line-3" x="196" y="250" width="8" height="30" fill="#FFD700"/>
                </g>
                
                <!-- Car -->
                <g class="hero-car" transform="translate(170, 200)">
                    <!-- Car body -->
                    <rect x="10" y="20" width="60" height="25" rx="5" fill="#3498db"/>
                    <rect x="20" y="8" width="40" height="18" rx="4" fill="#2980b9"/>
                    <!-- Windows -->
                    <rect x="24" y="11" width="14" height="12" rx="2" fill="#87CEEB" opacity="0.8"/>
                    <rect x="42" y="11" width="14" height="12" rx="2" fill="#87CEEB" opacity="0.8"/>
                    <!-- Wheels -->
                    <circle cx="25" cy="45" r="8" fill="#333"/>
                    <circle cx="55" cy="45" r="8" fill="#333"/>
                    <circle cx="25" cy="45" r="4" fill="#666"/>
                    <circle cx="55" cy="45" r="4" fill="#666"/>
                    <!-- Headlights -->
                    <rect x="65" y="28" width="6" height="8" rx="1" fill="#FFD700" opacity="0.9"/>
                </g>
                
                <!-- Speedometer -->
                <g class="speedometer" transform="translate(320, 220)">
                    <circle cx="30" cy="30" r="28" fill="#2c3e50" stroke="#34495e" stroke-width="3"/>
                    <circle cx="30" cy="30" r="22" fill="#1a252f"/>
                    <!-- Speed marks -->
                    <line x1="30" y1="12" x2="30" y2="16" stroke="#ecf0f1" stroke-width="2"/>
                    <line x1="14" y1="30" x2="18" y2="30" stroke="#ecf0f1" stroke-width="2"/>
                    <line x1="46" y1="30" x2="42" y2="30" stroke="#ecf0f1" stroke-width="2"/>
                    <!-- Needle -->
                    <line class="speedometer-needle" x1="30" y1="30" x2="30" y2="14" stroke="#e74c3c" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="30" cy="30" r="4" fill="#e74c3c"/>
                </g>
                
                <!-- Personality icons -->
                <g class="personality-icons">
                    <g class="personality-icon icon-1" transform="translate(30, 100)">
                        <circle cx="15" cy="15" r="15" fill="#e74c3c" opacity="0.9"/>
                        <text x="15" y="20" text-anchor="middle" fill="white" font-size="14">🏎️</text>
                    </g>
                    <g class="personality-icon icon-2" transform="translate(60, 60)">
                        <circle cx="15" cy="15" r="15" fill="#3498db" opacity="0.9"/>
                        <text x="15" y="20" text-anchor="middle" fill="white" font-size="14">🛡️</text>
                    </g>
                    <g class="personality-icon icon-3" transform="translate(310, 80)">
                        <circle cx="15" cy="15" r="15" fill="#2ecc71" opacity="0.9"/>
                        <text x="15" y="20" text-anchor="middle" fill="white" font-size="14">🎯</text>
                    </g>
                    <g class="personality-icon icon-4" transform="translate(340, 130)">
                        <circle cx="15" cy="15" r="15" fill="#9b59b6" opacity="0.9"/>
                        <text x="15" y="20" text-anchor="middle" fill="white" font-size="14">💡</text>
                    </g>
                </g>
            </svg>
        `;
    }
    
    /**
     * Create Quiz2 SVG content (emergency theme)
     * @returns {string} SVG markup
     */
    function createQuiz2SVG() {
        return `
            <svg class="quiz-hero-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <defs>
                    <linearGradient id="darkSkyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#1e272e;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2d3436;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="emergencyRoadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#2d2d2d;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <!-- Background -->
                <rect class="hero-background quiz2-bg" x="0" y="0" width="400" height="300" fill="url(#darkSkyGradient)"/>
                
                <!-- Road -->
                <polygon class="road" points="100,300 300,300 240,120 160,120" fill="url(#emergencyRoadGradient)"/>
                
                <!-- Road hazard stripes -->
                <g class="hazard-stripes">
                    <rect class="hazard-stripe stripe-1" x="110" y="280" width="20" height="10" fill="#f1c40f" transform="skewX(-20)"/>
                    <rect class="hazard-stripe stripe-2" x="140" y="280" width="20" height="10" fill="#2d2d2d" transform="skewX(-20)"/>
                    <rect class="hazard-stripe stripe-3" x="170" y="280" width="20" height="10" fill="#f1c40f" transform="skewX(-20)"/>
                    <rect class="hazard-stripe stripe-4" x="200" y="280" width="20" height="10" fill="#2d2d2d" transform="skewX(-20)"/>
                    <rect class="hazard-stripe stripe-5" x="230" y="280" width="20" height="10" fill="#f1c40f" transform="skewX(-20)"/>
                    <rect class="hazard-stripe stripe-6" x="260" y="280" width="20" height="10" fill="#2d2d2d" transform="skewX(-20)"/>
                </g>
                
                <!-- Warning Triangle -->
                <g class="warning-triangle" transform="translate(160, 80)">
                    <polygon points="40,0 80,70 0,70" fill="#f1c40f" stroke="#e67e22" stroke-width="3"/>
                    <text x="40" y="55" text-anchor="middle" fill="#2d2d2d" font-size="36" font-weight="bold">!</text>
                </g>
                
                <!-- Emergency Lights -->
                <g class="emergency-lights">
                    <circle class="emergency-light-left" cx="60" cy="60" r="20" fill="#e74c3c" filter="url(#glow)" opacity="1"/>
                    <circle class="emergency-light-right" cx="340" cy="60" r="20" fill="#3498db" filter="url(#glow)" opacity="0"/>
                </g>
                
                <!-- Danger Icons -->
                <g class="danger-icons">
                    <g class="danger-icon icon-1" transform="translate(30, 150)">
                        <circle cx="20" cy="20" r="18" fill="#c0392b" opacity="0.9"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="18">⚠️</text>
                    </g>
                    <g class="danger-icon icon-2" transform="translate(330, 150)">
                        <circle cx="20" cy="20" r="18" fill="#8e44ad" opacity="0.9"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="18">🚨</text>
                    </g>
                    <g class="danger-icon icon-3" transform="translate(50, 220)">
                        <circle cx="20" cy="20" r="18" fill="#d35400" opacity="0.9"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="18">⛔</text>
                    </g>
                    <g class="danger-icon icon-4" transform="translate(310, 220)">
                        <circle cx="20" cy="20" r="18" fill="#16a085" opacity="0.9"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="18">🆘</text>
                    </g>
                </g>
                
                <!-- Lightning bolts for dramatic effect -->
                <g class="lightning-effects">
                    <path class="lightning lightning-1" d="M100,20 L110,50 L105,50 L115,80" stroke="#f1c40f" stroke-width="2" fill="none" opacity="0"/>
                    <path class="lightning lightning-2" d="M300,30 L290,55 L295,55 L285,85" stroke="#f1c40f" stroke-width="2" fill="none" opacity="0"/>
                </g>
            </svg>
        `;
    }

    return {
        /**
         * Initialize Quiz1 hero animation (driving theme)
         * @param {HTMLElement} container - Container element for animation
         */
        initQuiz1Hero: function(container) {
            if (!container) {
                console.error('QuizAnimations: Container element is required');
                return;
            }
            
            // Cleanup any existing animations
            this.destroy();
            
            currentContainer = container;
            
            // Insert SVG content
            container.innerHTML = createQuiz1SVG();
            
            // Skip animations if user prefers reduced motion
            if (prefersReducedMotion) {
                isInitialized = true;
                return;
            }
            
            // Check if anime.js is available
            if (typeof anime === 'undefined') {
                console.warn('QuizAnimations: anime.js not loaded, animations disabled');
                isInitialized = true;
                return;
            }
            
            const durationMult = getDurationMultiplier();
            
            // Road lines moving animation (infinite scroll effect)
            animations.push(anime({
                targets: container.querySelectorAll('.road-line'),
                translateY: [0, 60],
                opacity: [1, 0],
                duration: 2000 * durationMult,
                loop: true,
                easing: 'linear',
                delay: anime.stagger(600)
            }));
            
            // Car gentle bounce
            animations.push(anime({
                targets: container.querySelector('.hero-car'),
                translateY: [-3, 3],
                duration: 1500 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            }));
            
            // Speedometer needle oscillation
            animations.push(anime({
                targets: container.querySelector('.speedometer-needle'),
                rotate: [-25, 25],
                transformOrigin: '30px 30px',
                duration: 3000 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutQuad'
            }));
            
            // Personality icons floating
            animations.push(anime({
                targets: container.querySelectorAll('.personality-icon'),
                translateY: [-8, 8],
                opacity: [0.7, 1],
                delay: anime.stagger(200),
                duration: 2000 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            }));
            
            // Clouds drifting (only on non-mobile for performance)
            if (!isMobile) {
                animations.push(anime({
                    targets: container.querySelectorAll('.cloud'),
                    translateX: [0, 20],
                    duration: 8000 * durationMult,
                    direction: 'alternate',
                    loop: true,
                    easing: 'easeInOutSine',
                    delay: anime.stagger(1000)
                }));
            }
            
            // Setup visibility observer for performance
            setupVisibilityObserver(container);
            
            isInitialized = true;
            isPaused = false;
        },
        
        /**
         * Initialize Quiz2 hero animation (emergency theme)
         * @param {HTMLElement} container - Container element for animation
         */
        initQuiz2Hero: function(container) {
            if (!container) {
                console.error('QuizAnimations: Container element is required');
                return;
            }
            
            // Cleanup any existing animations
            this.destroy();
            
            currentContainer = container;
            
            // Insert SVG content
            container.innerHTML = createQuiz2SVG();
            
            // Skip animations if user prefers reduced motion
            if (prefersReducedMotion) {
                isInitialized = true;
                return;
            }
            
            // Check if anime.js is available
            if (typeof anime === 'undefined') {
                console.warn('QuizAnimations: anime.js not loaded, animations disabled');
                isInitialized = true;
                return;
            }
            
            const durationMult = getDurationMultiplier();
            
            // Warning triangle pulse
            animations.push(anime({
                targets: container.querySelector('.warning-triangle'),
                scale: [1, 1.08],
                duration: 800 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutQuad'
            }));
            
            // Emergency lights flash - left (red)
            animations.push(anime({
                targets: container.querySelector('.emergency-light-left'),
                opacity: [1, 0.2],
                duration: 500 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'steps(1)'
            }));
            
            // Emergency lights flash - right (blue) - offset timing
            animations.push(anime({
                targets: container.querySelector('.emergency-light-right'),
                opacity: [0.2, 1],
                duration: 500 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'steps(1)'
            }));
            
            // Danger icons rotation
            animations.push(anime({
                targets: container.querySelectorAll('.danger-icon'),
                rotate: function(el, i) {
                    return i % 2 === 0 ? 360 : -360;
                },
                duration: 6000 * durationMult,
                loop: true,
                easing: 'linear'
            }));
            
            // Danger icons floating
            animations.push(anime({
                targets: container.querySelectorAll('.danger-icon'),
                translateY: [-5, 5],
                duration: 2000 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine',
                delay: anime.stagger(150)
            }));
            
            // Background color pulse (subtle)
            animations.push(anime({
                targets: container.querySelector('.quiz2-bg'),
                fill: ['url(#darkSkyGradient)', '#2d1f1f'],
                duration: 2000 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            }));
            
            // Lightning flash effect (only on non-mobile)
            if (!isMobile) {
                animations.push(anime({
                    targets: container.querySelectorAll('.lightning'),
                    opacity: [0, 1, 0],
                    duration: 200,
                    delay: function(el, i) {
                        return 3000 + (i * 5000); // Stagger lightning strikes
                    },
                    loop: true,
                    easing: 'easeInOutQuad'
                }));
            }
            
            // Hazard stripes shimmer
            animations.push(anime({
                targets: container.querySelectorAll('.hazard-stripe'),
                opacity: [0.8, 1],
                duration: 1000 * durationMult,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine',
                delay: anime.stagger(100)
            }));
            
            // Setup visibility observer for performance
            setupVisibilityObserver(container);
            
            isInitialized = true;
            isPaused = false;
        },
        
        /**
         * Pause all animations (for performance)
         */
        pause: function() {
            if (!isInitialized || isPaused) {
                return;
            }
            
            animations.forEach(anim => {
                if (anim && typeof anim.pause === 'function') {
                    anim.pause();
                }
            });
            
            isPaused = true;
        },
        
        /**
         * Resume animations
         */
        resume: function() {
            if (!isInitialized || !isPaused) {
                return;
            }
            
            // Don't resume if user prefers reduced motion
            if (prefersReducedMotion) {
                return;
            }
            
            animations.forEach(anim => {
                if (anim && typeof anim.play === 'function') {
                    anim.play();
                }
            });
            
            isPaused = false;
        },
        
        /**
         * Cleanup animations on page unload
         */
        destroy: function() {
            // Remove all animations
            animations.forEach(anim => {
                if (anim && typeof anim.pause === 'function') {
                    anim.pause();
                }
            });
            animations = [];
            
            // Disconnect intersection observer
            if (intersectionObserver) {
                intersectionObserver.disconnect();
                intersectionObserver = null;
            }
            
            // Clear container content
            if (currentContainer) {
                currentContainer.innerHTML = '';
                currentContainer = null;
            }
            
            isInitialized = false;
            isPaused = false;
        },
        
        /**
         * Check if animations are currently paused
         * @returns {boolean}
         */
        isPaused: function() {
            return isPaused;
        },
        
        /**
         * Check if animations are initialized
         * @returns {boolean}
         */
        isInitialized: function() {
            return isInitialized;
        },
        
        /**
         * Check if reduced motion is preferred
         * @returns {boolean}
         */
        prefersReducedMotion: function() {
            return prefersReducedMotion;
        }
    };
})();

// Export for module systems (if available)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizAnimations;
}
