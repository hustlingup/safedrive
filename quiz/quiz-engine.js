/**
 * quiz-engine.js
 * Quiz flow management module with sessionStorage persistence
 * 
 * Handles quiz state, navigation, and result calculation.
 * State is persisted to sessionStorage for refresh recovery.
 */

const QuizEngine = (function() {
    // Private state
    let config = null;
    let state = null;
    
    // SessionStorage key prefix
    const STORAGE_KEY = 'quizEngineState';
    
    /**
     * Get the storage key for a specific quiz
     * @param {string} quizId - Quiz identifier
     * @returns {string} Storage key
     */
    function getStorageKey(quizId) {
        return `${STORAGE_KEY}_${quizId}`;
    }
    
    /**
     * Save current state to sessionStorage
     */
    function saveState() {
        if (!state || !config) return;
        
        try {
            const storageKey = getStorageKey(config.quizId);
            sessionStorage.setItem(storageKey, JSON.stringify(state));
        } catch (e) {
            // SessionStorage may be unavailable (private browsing, etc.)
            console.warn('QuizEngine: Unable to save state to sessionStorage', e);
        }
    }
    
    /**
     * Load state from sessionStorage
     * @param {string} quizId - Quiz identifier
     * @returns {Object|null} Saved state or null
     */
    function loadState(quizId) {
        try {
            const storageKey = getStorageKey(quizId);
            const saved = sessionStorage.getItem(storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('QuizEngine: Unable to load state from sessionStorage', e);
        }
        return null;
    }
    
    /**
     * Clear state from sessionStorage
     * @param {string} quizId - Quiz identifier
     */
    function clearState(quizId) {
        try {
            const storageKey = getStorageKey(quizId);
            sessionStorage.removeItem(storageKey);
        } catch (e) {
            console.warn('QuizEngine: Unable to clear state from sessionStorage', e);
        }
    }
    
    /**
     * Create a fresh state object
     * @param {string} quizId - Quiz identifier
     * @returns {Object} New state object
     */
    function createFreshState(quizId) {
        return {
            quizId: quizId,
            currentIndex: 0,
            answers: [],
            startTime: Date.now(),
            isComplete: false
        };
    }
    
    return {
        /**
         * Initialize quiz with questions data and configuration
         * @param {Object} initConfig - Quiz configuration
         * @param {string} initConfig.quizId - Unique quiz identifier ('quiz1' or 'quiz2')
         * @param {Array} initConfig.questions - Questions array from JSON
         * @param {function} initConfig.calculateResult - Result calculation function
         * @param {string} initConfig.resultPageUrl - URL to redirect after completion
         * @param {boolean} [initConfig.resumeFromStorage=true] - Whether to resume from saved state
         */
        init: function(initConfig) {
            // Validate required config
            if (!initConfig || !initConfig.quizId) {
                throw new Error('QuizEngine: quizId is required');
            }
            if (!initConfig.questions || !Array.isArray(initConfig.questions)) {
                throw new Error('QuizEngine: questions array is required');
            }
            if (typeof initConfig.calculateResult !== 'function') {
                throw new Error('QuizEngine: calculateResult function is required');
            }
            
            config = {
                quizId: initConfig.quizId,
                questions: initConfig.questions,
                calculateResult: initConfig.calculateResult,
                resultPageUrl: initConfig.resultPageUrl || 'result.html'
            };
            
            // Try to resume from saved state if enabled (default: true)
            const resumeFromStorage = initConfig.resumeFromStorage !== false;
            const savedState = resumeFromStorage ? loadState(config.quizId) : null;
            
            if (savedState && !savedState.isComplete) {
                // Resume from saved state
                state = savedState;
            } else {
                // Start fresh
                state = createFreshState(config.quizId);
                saveState();
            }
        },
        
        /**
         * Get current question object
         * @returns {Object|null} Current question or null if quiz not initialized or complete
         */
        getCurrentQuestion: function() {
            if (!config || !state) {
                console.warn('QuizEngine: Not initialized');
                return null;
            }
            
            if (state.isComplete) {
                return null;
            }
            
            if (state.currentIndex >= config.questions.length) {
                return null;
            }
            
            return config.questions[state.currentIndex];
        },
        
        /**
         * Get progress information
         * @returns {{current: number, total: number, percentage: number}} Progress object
         */
        getProgress: function() {
            if (!config || !state) {
                return { current: 0, total: 0, percentage: 0 };
            }
            
            const total = config.questions.length;
            const current = state.currentIndex + 1; // 1-based for display
            const percentage = total > 0 ? Math.round((state.currentIndex / total) * 100) : 0;
            
            return {
                current: current,
                total: total,
                percentage: percentage
            };
        },
        
        /**
         * Record answer and advance to next question
         * @param {string} answer - Selected answer value
         * @returns {boolean} True if quiz completed, false otherwise
         */
        submitAnswer: function(answer) {
            if (!config || !state) {
                console.warn('QuizEngine: Not initialized');
                return false;
            }
            
            if (state.isComplete) {
                console.warn('QuizEngine: Quiz already complete');
                return true;
            }
            
            // Record the answer
            // If going back and re-answering, replace the existing answer
            if (state.currentIndex < state.answers.length) {
                state.answers[state.currentIndex] = answer;
            } else {
                state.answers.push(answer);
            }
            
            // Advance to next question
            state.currentIndex++;
            
            // Check if quiz is complete
            if (state.currentIndex >= config.questions.length) {
                state.isComplete = true;
                saveState();
                return true;
            }
            
            saveState();
            return false;
        },
        
        /**
         * Go back to previous question
         * @returns {boolean} True if successful, false if already at first question
         */
        goBack: function() {
            if (!config || !state) {
                console.warn('QuizEngine: Not initialized');
                return false;
            }
            
            if (state.currentIndex <= 0) {
                return false;
            }
            
            state.currentIndex--;
            
            // If quiz was marked complete, unmark it
            if (state.isComplete) {
                state.isComplete = false;
            }
            
            saveState();
            return true;
        },
        
        /**
         * Reset quiz to beginning
         */
        restart: function() {
            if (!config) {
                console.warn('QuizEngine: Not initialized');
                return;
            }
            
            state = createFreshState(config.quizId);
            saveState();
        },
        
        /**
         * Get all recorded answers
         * @returns {Array<string>} Array of answer values
         */
        getAnswers: function() {
            if (!state) {
                return [];
            }
            return state.answers.slice(); // Return a copy
        },
        
        /**
         * Calculate and return final result
         * @returns {string|null} Result type code or null if not complete
         */
        getResult: function() {
            if (!config || !state) {
                console.warn('QuizEngine: Not initialized');
                return null;
            }
            
            if (!state.isComplete && state.answers.length < config.questions.length) {
                console.warn('QuizEngine: Quiz not complete');
                return null;
            }
            
            try {
                return config.calculateResult(state.answers);
            } catch (e) {
                console.error('QuizEngine: Error calculating result', e);
                return null;
            }
        },
        
        /**
         * Get the current state (for debugging or external use)
         * @returns {Object|null} Current state object or null
         */
        getState: function() {
            if (!state) {
                return null;
            }
            // Return a copy to prevent external modification
            return {
                quizId: state.quizId,
                currentIndex: state.currentIndex,
                answers: state.answers.slice(),
                startTime: state.startTime,
                isComplete: state.isComplete
            };
        },
        
        /**
         * Check if quiz is initialized
         * @returns {boolean} True if initialized
         */
        isInitialized: function() {
            return config !== null && state !== null;
        },
        
        /**
         * Check if quiz is complete
         * @returns {boolean} True if complete
         */
        isComplete: function() {
            return state ? state.isComplete : false;
        },
        
        /**
         * Clear saved state for a quiz (useful for cleanup)
         * @param {string} quizId - Quiz identifier
         */
        clearSavedState: function(quizId) {
            clearState(quizId);
        },
        
        /**
         * Get the result page URL with result type parameter
         * @returns {string|null} Result page URL or null if not complete
         */
        getResultUrl: function() {
            if (!config || !state) {
                return null;
            }
            
            const result = this.getResult();
            if (!result) {
                return null;
            }
            
            // Append result type as URL parameter
            const url = new URL(config.resultPageUrl, window.location.href);
            url.searchParams.set('type', result);
            return url.toString();
        }
    };
})();

// Export for module systems (if available)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
}
