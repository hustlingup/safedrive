/**
 * Animation Utilities for Anime.js
 * 
 * This file provides reusable animation functions for the SafeDrive application.
 * It serves as a central location for common animation patterns.
 */

/**
 * WeakSet to track elements that have been animated by scrollTriggerAnimation
 * Prevents duplicate animations when once: true is specified
 */
const scrollAnimatedElements = new WeakSet();

/**
 * Scroll-triggered animation utility using IntersectionObserver
 * 
 * @param {string} selector - CSS selector for elements to animate
 * @param {Object} animationConfig - Anime.js animation configuration
 * @param {Object} options - Observer options
 * @param {number} options.threshold - Intersection threshold (0-1), default 0.2 (equivalent to 'top 80%')
 * @param {boolean} options.once - Whether to animate only once, default true
 * @param {string} options.rootMargin - Root margin for observer, default '0px'
 * @returns {IntersectionObserver|null} The created observer or null if not supported
 */
function scrollTriggerAnimation(selector, animationConfig, options = {}) {
    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported, running animation immediately');
        anime({
            targets: selector,
            ...animationConfig
        });
        return null;
    }

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
        console.warn(`No elements found for selector: ${selector}`);
        return null;
    }

    const {
        threshold = 0.2,  // Equivalent to 'start: top 80%'
        once = true,
        rootMargin = '0px'
    } = options;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Check if element has already been animated (when once is true)
                if (once && scrollAnimatedElements.has(entry.target)) {
                    return;
                }

                // Trigger animation
                anime({
                    targets: entry.target,
                    ...animationConfig
                });

                // Track animated element if once is true
                if (once) {
                    scrollAnimatedElements.add(entry.target);
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold, rootMargin });

    elements.forEach(el => observer.observe(el));
    
    return observer;
}

/**
 * Hover animation utility
 * 
 * @param {Element|string} element - Element or selector to attach hover animations
 * @param {Object} hoverConfig - Anime.js config for mouseenter
 * @param {Object} leaveConfig - Anime.js config for mouseleave
 */
function hoverAnimation(element, hoverConfig, leaveConfig) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!el) {
        console.warn('Element not found for hover animation');
        return;
    }

    el.addEventListener('mouseenter', () => {
        anime({
            targets: el,
            ...hoverConfig
        });
    });
    
    el.addEventListener('mouseleave', () => {
        anime({
            targets: el,
            ...leaveConfig
        });
    });
}

/**
 * Animate once utility - prevents duplicate animations
 * Uses WeakSet to track animated elements without memory leaks
 */
const animatedElements = new WeakSet();

function animateOnce(element, config) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!el) {
        console.warn('Element not found for animateOnce');
        return null;
    }
    
    if (animatedElements.has(el)) {
        return null;
    }
    
    animatedElements.add(el);
    return anime({
        targets: el,
        ...config
    });
}

/**
 * Create timeline utility
 * 
 * @param {Array<Object>} animations - Array of animation objects with config and offset
 * @param {Object} timelineDefaults - Default timeline configuration
 * @returns {anime.timeline} Anime.js timeline instance
 */
function createTimeline(animations = [], timelineDefaults = {}) {
    const tl = anime.timeline({
        easing: 'easeOutExpo',
        duration: 750,
        ...timelineDefaults
    });
    
    animations.forEach(anim => {
        tl.add(anim.config, anim.offset || '+=0');
    });
    
    return tl;
}

/**
 * Safe animation wrapper with error handling
 * 
 * @param {Object} config - Anime.js configuration
 * @returns {anime.AnimeInstance|null} Animation instance or null on error
 */
function safeAnimate(config) {
    if (typeof anime === 'undefined') {
        console.error('Anime.js library not loaded');
        return null;
    }
    
    try {
        return anime(config);
    } catch (error) {
        console.error('Animation error:', error);
        return null;
    }
}

/**
 * Validate animation configuration
 * 
 * @param {Object} config - Animation configuration to validate
 * @returns {Object} Validated configuration
 * @throws {Error} If required properties are missing
 */
function validateAnimationConfig(config) {
    const required = ['targets'];
    const missing = required.filter(key => !(key in config));
    
    if (missing.length > 0) {
        throw new Error(`Missing required animation properties: ${missing.join(', ')}`);
    }
    
    if (config.duration && config.duration < 0) {
        console.warn('Negative duration detected, using absolute value');
        config.duration = Math.abs(config.duration);
    }
    
    return config;
}

/**
 * Convert duration from seconds to milliseconds for Anime.js
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {number} Duration in milliseconds
 */
function secondsToMilliseconds(seconds) {
    return seconds * 1000;
}

/**
 * Easing function mapping for common animation easing names
 */
const easingMap = {
    'power1.in': 'easeInQuad',
    'power1.out': 'easeOutQuad',
    'power1.inOut': 'easeInOutQuad',
    'power2.in': 'easeInQuad',
    'power2.out': 'easeOutQuad',
    'power2.inOut': 'easeInOutQuad',
    'power3.in': 'easeInCubic',
    'power3.out': 'easeOutCubic',
    'power3.inOut': 'easeInOutCubic',
    'power4.in': 'easeInQuart',
    'power4.out': 'easeOutQuart',
    'power4.inOut': 'easeInOutQuart',
    'back.in': 'easeInBack',
    'back.out': 'easeOutBack',
    'back.inOut': 'easeInOutBack',
    'elastic.in': 'easeInElastic',
    'elastic.out': 'easeOutElastic',
    'elastic.inOut': 'easeInOutElastic',
    'bounce.in': 'easeInBounce',
    'bounce.out': 'easeOutBounce',
    'bounce.inOut': 'easeInOutBounce'
};

/**
 * Get Anime.js easing equivalent for common easing names
 * 
 * @param {string} easingName - Easing function name
 * @returns {string} Anime.js easing function name
 */
function getAnimeEasing(easingName) {
    return easingMap[easingName] || easingName;
}
