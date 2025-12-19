/**
 * Animation Performance Measurement Tool
 * Measures frame rates for QR animations, leaderboard stagger, and announcement banner
 * 
 * Usage: Run this script in the browser console on index.html
 * Or include it as a script tag and call measureAllAnimations()
 */

class AnimationPerformanceMeasurer {
    constructor() {
        this.measurements = {
            qrAnimation: null,
            leaderboardStagger: null
        };
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS; // ~16.67ms per frame
    }

    /**
     * Measure FPS for a given duration
     * @param {number} duration - Duration to measure in milliseconds
     * @returns {Promise<Object>} Performance metrics
     */
    measureFPS(duration = 2000) {
        return new Promise((resolve) => {
            const frames = [];
            let lastTime = performance.now();
            let startTime = lastTime;
            let frameCount = 0;
            let minFPS = Infinity;
            let maxFPS = 0;

            const measureFrame = (currentTime) => {
                const deltaTime = currentTime - lastTime;
                frameCount++;

                if (deltaTime > 0) {
                    const fps = 1000 / deltaTime;
                    frames.push(fps);
                    minFPS = Math.min(minFPS, fps);
                    maxFPS = Math.max(maxFPS, fps);
                }

                lastTime = currentTime;

                if (currentTime - startTime < duration) {
                    requestAnimationFrame(measureFrame);
                } else {
                    // Calculate statistics
                    const avgFPS = frames.reduce((a, b) => a + b, 0) / frames.length;
                    const droppedFrames = frames.filter(fps => fps < 55).length;
                    const droppedFramePercentage = (droppedFrames / frames.length) * 100;

                    resolve({
                        averageFPS: avgFPS.toFixed(2),
                        minFPS: minFPS.toFixed(2),
                        maxFPS: maxFPS.toFixed(2),
                        totalFrames: frameCount,
                        droppedFrames: droppedFrames,
                        droppedFramePercentage: droppedFramePercentage.toFixed(2),
                        duration: duration,
                        meetsTarget: avgFPS >= this.targetFPS * 0.95 // Allow 5% tolerance
                    });
                }
            };

            requestAnimationFrame(measureFrame);
        });
    }

    /**
     * Measure QR animation performance
     * Measures the sliding puzzle timeline and color cycling
     */
    async measureQRAnimation() {
        console.log('📊 Measuring QR Animation Performance...');
        
        // Scroll to QR section
        const qrSection = document.querySelector('#qr-generator-intro');
        if (!qrSection) {
            console.error('QR section not found');
            return null;
        }

        qrSection.scrollIntoView({ behavior: 'smooth' });
        
        // Wait for scroll to complete
        await this.sleep(1000);

        // Measure for 3 seconds to capture multiple animation cycles
        const metrics = await this.measureFPS(3000);
        
        this.measurements.qrAnimation = {
            ...metrics,
            animationType: 'QR Sliding Puzzle + Color Cycling',
            description: 'Timeline animation with infinite loop'
        };

        console.log('✅ QR Animation Results:', this.measurements.qrAnimation);
        return this.measurements.qrAnimation;
    }

    /**
     * Measure leaderboard stagger animation performance
     * Measures the scroll-triggered stagger animation for table rows
     */
    async measureLeaderboardStagger() {
        console.log('📊 Measuring Leaderboard Stagger Performance...');
        
        // Find leaderboard section - try multiple selectors
        const leaderboardSection = document.querySelector('#mostLikedSection') || 
                                   document.querySelector('.leaderboard-section') ||
                                   document.querySelector('#leaderboard');
        if (!leaderboardSection) {
            console.error('Leaderboard section not found');
            return null;
        }

        // Scroll away first to reset the animation
        window.scrollTo({ top: 0, behavior: 'instant' });
        await this.sleep(500);

        // Start measuring before scrolling
        const measurementPromise = this.measureFPS(2000);
        
        // Scroll to leaderboard to trigger animation
        leaderboardSection.scrollIntoView({ behavior: 'smooth' });
        
        const metrics = await measurementPromise;
        
        this.measurements.leaderboardStagger = {
            ...metrics,
            animationType: 'Leaderboard Stagger',
            description: 'IntersectionObserver-triggered stagger animation with 80ms delay'
        };

        console.log('✅ Leaderboard Stagger Results:', this.measurements.leaderboardStagger);
        return this.measurements.leaderboardStagger;
    }



    /**
     * Helper function to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate a comprehensive report
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📈 ANIMATION PERFORMANCE REPORT');
        console.log('='.repeat(80));
        console.log(`Target FPS: ${this.targetFPS}`);
        console.log(`Acceptable Range: ${(this.targetFPS * 0.95).toFixed(1)} - ${this.targetFPS} FPS`);
        console.log('='.repeat(80));

        const animations = [
            { name: 'QR Animation', data: this.measurements.qrAnimation },
            { name: 'Leaderboard Stagger', data: this.measurements.leaderboardStagger }
        ];

        animations.forEach(({ name, data }) => {
            if (data) {
                console.log(`\n${name}:`);
                console.log(`  Type: ${data.animationType}`);
                console.log(`  Description: ${data.description}`);
                console.log(`  Average FPS: ${data.averageFPS} ${data.meetsTarget ? '✅' : '❌'}`);
                console.log(`  Min FPS: ${data.minFPS}`);
                console.log(`  Max FPS: ${data.maxFPS}`);
                console.log(`  Total Frames: ${data.totalFrames}`);
                console.log(`  Dropped Frames: ${data.droppedFrames} (${data.droppedFramePercentage}%)`);
                console.log(`  Duration: ${data.duration}ms`);
                console.log(`  Status: ${data.meetsTarget ? 'PASS ✅' : 'FAIL ❌'}`);
            } else {
                console.log(`\n${name}: NOT MEASURED`);
            }
        });

        console.log('\n' + '='.repeat(80));
        
        // Overall summary
        const allMeasured = animations.every(({ data }) => data !== null);
        const allPass = animations.every(({ data }) => data && data.meetsTarget);
        
        if (allMeasured) {
            console.log('OVERALL STATUS:', allPass ? 'ALL ANIMATIONS PASS ✅' : 'SOME ANIMATIONS NEED OPTIMIZATION ⚠️');
        } else {
            console.log('OVERALL STATUS: INCOMPLETE - Not all animations measured');
        }
        
        console.log('='.repeat(80) + '\n');

        return {
            measurements: this.measurements,
            allPass,
            allMeasured
        };
    }

    /**
     * Export results as JSON
     */
    exportJSON() {
        const report = {
            timestamp: new Date().toISOString(),
            targetFPS: this.targetFPS,
            measurements: this.measurements,
            summary: {
                allPass: Object.values(this.measurements).every(m => m && m.meetsTarget),
                allMeasured: Object.values(this.measurements).every(m => m !== null)
            }
        };

        console.log('\n📄 JSON Export:');
        console.log(JSON.stringify(report, null, 2));
        
        return report;
    }

    /**
     * Measure all animations sequentially
     */
    async measureAll() {
        console.log('🚀 Starting comprehensive animation performance measurement...\n');
        
        try {
            // Measure each animation
            await this.measureQRAnimation();
            await this.sleep(1000); // Pause between measurements
            
            await this.measureLeaderboardStagger();
            await this.sleep(500);
            
            // Generate report
            const report = this.generateReport();
            
            // Export JSON
            this.exportJSON();
            
            return report;
        } catch (error) {
            console.error('❌ Error during measurement:', error);
            throw error;
        }
    }
}

// Global function for easy access
window.measureAllAnimations = async function() {
    const measurer = new AnimationPerformanceMeasurer();
    return await measurer.measureAll();
}

// Also expose the class globally
window.AnimationPerformanceMeasurer = AnimationPerformanceMeasurer;

// Auto-run if script is loaded with ?measure=true
if (typeof window !== 'undefined' && window.location.search.includes('measure=true')) {
    window.addEventListener('load', () => {
        console.log('Auto-running performance measurement...');
        setTimeout(window.measureAllAnimations, 2000); // Wait 2s for page to fully load
    });
}

// Export for use in other scripts (Node.js compatibility)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationPerformanceMeasurer, measureAllAnimations: window.measureAllAnimations };
}
