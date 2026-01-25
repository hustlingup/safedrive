/**
 * QuizCounter - Firebase-based real-time quiz statistics
 * 
 * Handles Firebase Realtime Database integration for tracking quiz statistics.
 * Provides real-time updates, counter increments, and offline handling.
 */
const QuizCounter = {
    // Internal state
    _db: null,
    _listeners: {},
    _isOnline: true,
    _pendingOperations: [],
    _initialized: false,

    /**
     * Initialize Firebase connection
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Check if Firebase is available
            if (typeof firebase === 'undefined' || !firebase.database) {
                console.warn('QuizCounter: Firebase not available, running in offline mode');
                this._isOnline = false;
                return;
            }

            // Get database reference
            this._db = firebase.database();
            this._initialized = true;

            // Set up connection state listener
            const connectedRef = this._db.ref('.info/connected');
            connectedRef.on('value', (snapshot) => {
                this._isOnline = snapshot.val() === true;
                
                if (this._isOnline) {
                    // Process any pending operations when back online
                    this._processPendingOperations();
                }
            });

        } catch (error) {
            console.error('QuizCounter: Failed to initialize Firebase', error);
            this._isOnline = false;
        }
    },

    /**
     * Get current statistics with real-time listener
     * @param {string} quizId - 'quiz1' or 'quiz2'
     * @param {function} callback - Called with stats object on updates
     * @returns {function} Unsubscribe function
     */
    subscribe(quizId, callback) {
        // Return default stats if offline or not initialized
        if (!this._db || !this._initialized) {
            // Provide fallback data for offline mode
            const fallbackStats = {
                totalCompletions: 0,
                results: {},
                isOffline: true
            };
            callback(fallbackStats);
            
            // Return no-op unsubscribe function
            return () => {};
        }

        const statsRef = this._db.ref(`quizStats/${quizId}`);
        
        // Set up real-time listener
        const onValue = (snapshot) => {
            const data = snapshot.val();
            
            if (data) {
                callback({
                    totalCompletions: data.totalCompletions || 0,
                    results: data.results || {},
                    isOffline: false
                });
            } else {
                // No data exists yet, return defaults
                callback({
                    totalCompletions: 0,
                    results: {},
                    isOffline: false
                });
            }
        };

        const onError = (error) => {
            console.error('QuizCounter: Error subscribing to stats', error);
            callback({
                totalCompletions: 0,
                results: {},
                isOffline: true,
                error: error.message
            });
        };

        statsRef.on('value', onValue, onError);

        // Store listener reference for cleanup
        this._listeners[quizId] = { ref: statsRef, callback: onValue };

        // Return unsubscribe function
        return () => {
            statsRef.off('value', onValue);
            delete this._listeners[quizId];
        };
    },

    /**
     * Increment total completion count
     * @param {string} quizId - 'quiz1' or 'quiz2'
     * @returns {Promise<void>}
     */
    async incrementTotal(quizId) {
        const operation = {
            type: 'incrementTotal',
            quizId: quizId,
            timestamp: Date.now()
        };

        if (!this._db || !this._isOnline) {
            // Queue operation for later if offline
            this._queueOperation(operation);
            return;
        }

        try {
            const totalRef = this._db.ref(`quizStats/${quizId}/totalCompletions`);
            await totalRef.transaction((currentValue) => {
                return (currentValue || 0) + 1;
            });
        } catch (error) {
            console.error('QuizCounter: Failed to increment total', error);
            // Queue for retry
            this._queueOperation(operation);
        }
    },

    /**
     * Increment result type count
     * @param {string} quizId - 'quiz1' or 'quiz2'
     * @param {string} resultType - Result type code (e.g., 'SFE', 'A')
     * @returns {Promise<void>}
     */
    async incrementResult(quizId, resultType) {
        const operation = {
            type: 'incrementResult',
            quizId: quizId,
            resultType: resultType,
            timestamp: Date.now()
        };

        if (!this._db || !this._isOnline) {
            // Queue operation for later if offline
            this._queueOperation(operation);
            return;
        }

        try {
            const resultRef = this._db.ref(`quizStats/${quizId}/results/${resultType}`);
            await resultRef.transaction((currentValue) => {
                return (currentValue || 0) + 1;
            });
        } catch (error) {
            console.error('QuizCounter: Failed to increment result', error);
            // Queue for retry
            this._queueOperation(operation);
        }
    },

    /**
     * Get the most popular result type
     * @param {string} quizId - 'quiz1' or 'quiz2'
     * @returns {Promise<{type: string, count: number}|null>}
     */
    async getMostPopular(quizId) {
        if (!this._db || !this._isOnline) {
            // Return null for offline mode
            return null;
        }

        try {
            const resultsRef = this._db.ref(`quizStats/${quizId}/results`);
            const snapshot = await resultsRef.once('value');
            const results = snapshot.val();

            if (!results) {
                return null;
            }

            // Find the result type with the highest count
            let mostPopular = null;
            let highestCount = 0;

            for (const [type, count] of Object.entries(results)) {
                if (count > highestCount) {
                    highestCount = count;
                    mostPopular = type;
                }
            }

            if (mostPopular) {
                return {
                    type: mostPopular,
                    count: highestCount
                };
            }

            return null;
        } catch (error) {
            console.error('QuizCounter: Failed to get most popular result', error);
            return null;
        }
    },

    /**
     * Queue an operation for later execution (offline support)
     * @private
     * @param {Object} operation - Operation to queue
     */
    _queueOperation(operation) {
        this._pendingOperations.push(operation);
        
        // Also persist to localStorage for page refresh recovery
        try {
            const stored = localStorage.getItem('quizCounter_pendingOps');
            const pending = stored ? JSON.parse(stored) : [];
            pending.push(operation);
            localStorage.setItem('quizCounter_pendingOps', JSON.stringify(pending));
        } catch (e) {
            console.warn('QuizCounter: Could not persist pending operation', e);
        }
    },

    /**
     * Process pending operations when back online
     * @private
     */
    async _processPendingOperations() {
        // Load any persisted operations
        try {
            const stored = localStorage.getItem('quizCounter_pendingOps');
            if (stored) {
                const persisted = JSON.parse(stored);
                this._pendingOperations = [...this._pendingOperations, ...persisted];
                localStorage.removeItem('quizCounter_pendingOps');
            }
        } catch (e) {
            console.warn('QuizCounter: Could not load persisted operations', e);
        }

        // Process all pending operations
        const operations = [...this._pendingOperations];
        this._pendingOperations = [];

        for (const op of operations) {
            try {
                if (op.type === 'incrementTotal') {
                    await this.incrementTotal(op.quizId);
                } else if (op.type === 'incrementResult') {
                    await this.incrementResult(op.quizId, op.resultType);
                }
            } catch (error) {
                console.error('QuizCounter: Failed to process pending operation', error);
            }
        }
    },

    /**
     * Check if the counter is online
     * @returns {boolean}
     */
    isOnline() {
        return this._isOnline && this._initialized;
    },

    /**
     * Cleanup all listeners
     */
    destroy() {
        // Remove all active listeners
        for (const [quizId, listener] of Object.entries(this._listeners)) {
            if (listener.ref && listener.callback) {
                listener.ref.off('value', listener.callback);
            }
        }
        this._listeners = {};
        this._initialized = false;
    }
};

// Export for module systems (if available)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizCounter;
}
