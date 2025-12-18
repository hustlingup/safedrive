const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Ensure admin is initialized (may already be initialized in index.js)
if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Get leaderboard data - callable function
 * This allows clients to fetch leaderboard without direct /plates access
 */
exports.getLeaderboard = functions.https.onCall(async (data, context) => {
    const { type = 'mostLiked', limit = 10 } = data;
    
    try {
        // Fetch all plates data (server-side has full access)
        const platesSnapshot = await admin.database().ref('plates').once('value');
        
        if (!platesSnapshot.exists()) {
            return { success: true, leaderboard: [] };
        }
        
        const allPlates = platesSnapshot.val();
        const plates = [];
        
        // Convert to array with computed scores
        for (const [plateNumber, plateData] of Object.entries(allPlates)) {
            const counters = plateData.counters || {};
            
            // Calculate likes (for mostLiked leaderboard)
            const likes = counters.likes || 0;
            
            // Calculate thanks score (positive messages)
            const thanksKeys = ['thank_you', 'forgive', 'pretty', 'cool', 'good_driver', 'envy', 'beginner_fighting',
                               'mb_signal_respect', 'mb_stop_line', 'mb_pedestrian_first', 'mb_safety_gear', 
                               'mb_considerate_driving', 'mb_lane_keeping', 'mb_weather_support', 
                               'mb_slippery_warning', 'mb_delivery_thanks'];
            const thanksScore = thanksKeys.reduce((sum, key) => sum + (counters[key] || 0), 0);
            
            // Calculate safety warnings (negative messages)
            const safetyKeys = ['speeding', 'reckless_merge', 'road_rage', 'sudden_stop', 'no_safe_distance',
                               'not_watching_ahead', 'halmanghaanj', 'pedestrian_slow_down', 'high_beam',
                               'exit_cutting', 'sudden_lane_change', 'drowsy_driving', 'no_blinker',
                               'lane_violation', 'habitual_brake', 'slow_driving', 'dont_park_here',
                               'mb_dangerous_moment', 'mb_dangerous_parking'];
            const safetyScore = safetyKeys.reduce((sum, key) => sum + (counters[key] || 0), 0);
            
            // Best driver score = thanks - safety
            const bestDriverScore = thanksScore - safetyScore;
            
            plates.push({
                plateNumber,
                likes,
                thanksScore,
                safetyScore,
                bestDriverScore,
                lastUpdated: plateData.lastUpdated || null
            });
        }
        
        // Sort based on type
        let sorted;
        if (type === 'mostLiked') {
            sorted = plates.filter(p => p.likes > 0).sort((a, b) => b.likes - a.likes);
        } else if (type === 'bestDriver') {
            sorted = plates.filter(p => p.bestDriverScore > 0).sort((a, b) => b.bestDriverScore - a.bestDriverScore);
        } else {
            sorted = plates.sort((a, b) => b.likes - a.likes);
        }
        
        // Limit results
        const leaderboard = sorted.slice(0, limit).map((plate, index) => ({
            rank: index + 1,
            plateNumber: plate.plateNumber,
            score: type === 'mostLiked' ? plate.likes : plate.bestDriverScore,
            likes: plate.likes,
            thanksScore: plate.thanksScore,
            safetyScore: plate.safetyScore
        }));
        
        return { success: true, leaderboard, type, limit };
        
    } catch (error) {
        console.error('getLeaderboard error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch leaderboard');
    }
});

/**
 * HTTP endpoint for leaderboard (for non-authenticated access)
 */
exports.getLeaderboardHttp = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    
    const type = req.query.type || 'mostLiked';
    const limit = parseInt(req.query.limit) || 10;
    
    try {
        const platesSnapshot = await admin.database().ref('plates').once('value');
        
        if (!platesSnapshot.exists()) {
            res.json({ success: true, leaderboard: [] });
            return;
        }
        
        const allPlates = platesSnapshot.val();
        const plates = [];
        
        for (const [plateNumber, plateData] of Object.entries(allPlates)) {
            const counters = plateData.counters || {};
            const likes = counters.likes || 0;
            
            const thanksKeys = ['thank_you', 'forgive', 'pretty', 'cool', 'good_driver', 'envy', 'beginner_fighting',
                               'mb_signal_respect', 'mb_stop_line', 'mb_pedestrian_first', 'mb_safety_gear', 
                               'mb_considerate_driving', 'mb_lane_keeping', 'mb_weather_support', 
                               'mb_slippery_warning', 'mb_delivery_thanks'];
            const thanksScore = thanksKeys.reduce((sum, key) => sum + (counters[key] || 0), 0);
            
            const safetyKeys = ['speeding', 'reckless_merge', 'road_rage', 'sudden_stop', 'no_safe_distance',
                               'not_watching_ahead', 'halmanghaanj', 'pedestrian_slow_down', 'high_beam',
                               'exit_cutting', 'sudden_lane_change', 'drowsy_driving', 'no_blinker',
                               'lane_violation', 'habitual_brake', 'slow_driving', 'dont_park_here',
                               'mb_dangerous_moment', 'mb_dangerous_parking'];
            const safetyScore = safetyKeys.reduce((sum, key) => sum + (counters[key] || 0), 0);
            
            const bestDriverScore = thanksScore - safetyScore;
            
            plates.push({ plateNumber, likes, thanksScore, safetyScore, bestDriverScore });
        }
        
        let sorted;
        if (type === 'mostLiked') {
            sorted = plates.filter(p => p.likes > 0).sort((a, b) => b.likes - a.likes);
        } else if (type === 'bestDriver') {
            sorted = plates.filter(p => p.bestDriverScore > 0).sort((a, b) => b.bestDriverScore - a.bestDriverScore);
        } else {
            sorted = plates.sort((a, b) => b.likes - a.likes);
        }
        
        const leaderboard = sorted.slice(0, limit).map((plate, index) => ({
            rank: index + 1,
            plateNumber: plate.plateNumber,
            score: type === 'mostLiked' ? plate.likes : plate.bestDriverScore,
            likes: plate.likes
        }));
        
        res.json({ success: true, leaderboard, type, limit });
        
    } catch (error) {
        console.error('getLeaderboardHttp error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
