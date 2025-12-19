// Firebase Configuration is loaded from firebase-config.js
// Initialize Firebase (only if not already initialized)
if (typeof firebaseConfig === 'undefined') {
    console.error('Firebase configuration not found. Please ensure firebase-config.js is loaded.');
} else if (!firebase.apps || firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    // console.log('Firebase initialized for project:', firebaseConfig.projectId);
}

// Use existing database reference or create new one
// Note: If this script is loaded after plate.html's inline script, database may already exist
if (typeof database === 'undefined') {
    var database = firebase.database();
}

// Counter Key Mapping
const COUNTER_KEYS = {
    // AÍ∏??àÏ†Ñ Î©îÏÑ∏ÏßÄ (Car)
    'Í≥ºÏÜç?¥Ï†Ñ': 'speeding',
    'Î¨¥Î¶¨???©Î•ò': 'reckless_merge',
    'Î≥¥Î≥µ?¥Ï†Ñ': 'road_rage',
    'Í∏âÏ†ïÍ±?: 'sudden_stop',
    '?àÏ†ÑÍ±∞Î¶¨ ÎØ∏ÌôïÎ≥?: 'no_safe_distance',
    '?ÑÎ∞©Ï£ºÏãú ?úÎßå': 'not_watching_ahead',
    '?†Îßé?òÏïä': 'halmanghaanj',
    'Î≥¥Ìñâ???ûÏóê???çÎèÑ Ï§ÑÏó¨Ï£ºÏÑ∏??: 'pedestrian_slow_down',
    '?ÅÌñ•???åÎ¨∏???ûÏù¥ ????Î≥¥Ïó¨??: 'high_beam',
    // BÍ∏??àÏ†Ñ Î©îÏÑ∏ÏßÄ (Car)
    'Ï∂úÍµ¨ ?àÏπòÍ∏?: 'exit_cutting',
    'Í∏?Ï∞®ÏÑ†Î≥ÄÍ≤?: 'sudden_lane_change',
    'Ï°∏Ïùå?¥Ï†Ñ': 'drowsy_driving',
    'Î∞©Ìñ•ÏßÄ?úÎì± ÎØ∏Ï†ê??: 'no_blinker',
    'ÏßÄ?ïÏ∞®Î°?ÎØ∏Ï???: 'lane_violation',
    '?µÍ???Î∏åÎ†à?¥ÌÅ¨': 'habitual_brake',
    '?Ä?çÏö¥??: 'slow_driving',
    '?¨Í∏∞???ïÏ∞®/Ï£ºÏ∞®Í∞Ä ?ÑÌóò??Í≥≥Ïù¥?êÏöî': 'dont_park_here',
    // Ï∞®Îüâ?ÅÌÉú Î©îÏÑ∏ÏßÄ (Car)
    '?ºÏù¥??Í≥†Ïû•': 'light_broken',
    '?Ä?¥Ïñ¥ ?ÅÌÉú ?¥ÏÉÅ': 'tire_issue',
    '??Î∞∏Îü∞???¥ÏÉÅ': 'wheel_balance',
    'Î∞∞Í∏∞Í∞Ä???¥ÏÉÅ': 'exhaust_issue',
    '?îÏßÑ ?∞Í∏∞Î∞úÏÉù': 'engine_smoke',
    '?îÏßÑ?§Ïùº ?ÑÏú†': 'oil_leak',
    '?∏Î†Å??Î≥¥Îãõ/?∞Î£åÏ∫??¥Î¶º': 'trunk_open',
    '?ÅÏû¨Î¨ºÏù¥ ?îÎì§?§Ïöî, ?®Ïñ¥Ïß????àÏñ¥??: 'cargo_loose',
    // Ï¢ãÏ? Í∞êÏ†ï Î©îÏÑ∏ÏßÄ (Car)
    'Í≥†Îßô?µÎãà??: 'thank_you',
    '?©ÏÑú?†Í≤å??: 'forgive',
    '?àÎªê??: 'pretty',
    'Î©ãÏ†∏??: 'cool',
    '?¥Ï†Ñ ?òÌï¥??: 'good_driver',
    'Î∂Ä?¨Ïõå??: 'envy',
    'Ï¥àÎ≥¥ ?îÏù¥??!!': 'beginner_fighting',
    // Ï¢ãÏïÑ??
    'Ï¢ãÏïÑ??: 'likes',
    
    // === MOTORBIKE MESSAGES ===
    // ?àÏ†Ñ Î©îÏÑ∏ÏßÄ (Motorbike)
    'Î∞©Í∏à ?ÑÌóò???úÍ∞Ñ???àÏóà?¥Ïöî. Ï°∞Í∏àÎß???Ï°∞Ïã¨??Ï£ºÏÑ∏??': 'mb_dangerous_moment',
    '?¨Í∏∞???§ÌÜ†Î∞îÏù¥ ?∏Ïö∞Í∏??ÑÌóò??Í≥≥Ïù¥?êÏöî.': 'mb_dangerous_parking',
    // Ï∞®Îüâ ?ÅÌÉú (Motorbike)
    '?ºÏù¥???¥ÏÉÅ': 'mb_light_issue',
    'Î∏åÎ†à?¥ÌÅ¨ ?åÎ¶¨ ?¥ÏÉÅ': 'mb_brake_sound',
    '?Ä?¥Ïñ¥ ?¥ÏÉÅ': 'mb_tire_issue',
    'Ï≤¥Ïù∏ ?åÎ¶¨ ?¥ÏÉÅ': 'mb_chain_sound',
    'Î∞∞Îã¨Î∞ïÏä§ Í≥†Ï†ï ?¥ÏÉÅ': 'mb_delivery_box',
    // Ïπ?∞¨ (Motorbike)
    '?†Ìò∏Î•??ùÍπåÏßÄ ÏßÄÏº?Ï£ºÏÖî??Î©ãÏ†∏??': 'mb_signal_respect',
    '?ïÏ?????ÏßÄ?§ÏÖî??Î≥¥Í∏∞ Ï¢ãÏïò?µÎãà??': 'mb_stop_line',
    'Î≥¥Ìñâ??Î®ºÏ? Î∞∞Î†§??Ï£ºÏÖî??Í≥†Îßô?µÎãà??': 'mb_pedestrian_first',
    'Î≥¥Ìò∏?•ÎπÑ ?ÑÎ≤Ω?òÍ≤å Ï∞©Ïö©?òÏã† Î™®Ïäµ???∏ÏÉÅ?ÅÏù¥?àÏñ¥??': 'mb_safety_gear',
    'Î∞∞Î†§ ?¥Ï†Ñ ?ïÎ∂Ñ??Ï£ºÎ????∏Ïïà?àÏñ¥??': 'mb_considerate_driving',
    'Ï∞®ÏÑ† ÏßÄ?§Î©¥???¨Î¶¨??Î™®Ïäµ???ïÎßê Î©ãÏßë?àÎã§.': 'mb_lane_keeping',
    // ?ëÏõê (Motorbike)
    '?†Ïî®?Ä ?ÅÍ??ÜÏù¥ ??Í≥†ÏÉù??ÎßéÏúº??ãà??': 'mb_weather_support',
    '?∏Î©¥??ÎØ∏ÎÅÑ?¨Ïö∏ ???àÏñ¥?? ??ÉÅ ?àÏ†Ñ?¥Ìñâ ?òÏÑ∏??': 'mb_slippery_warning',
    '??ÉÅ ÍººÍºº?òÍ≤å Î∞∞Îã¨??Ï£ºÏÖî??Í∞êÏÇ¨?©Îãà??': 'mb_delivery_thanks'
};

const CATEGORIES = {
    // === CAR CATEGORIES ===
    categoryA: {
        name: 'AÍ∏??àÏ†Ñ Î©îÏÑ∏ÏßÄ',
        keys: ['speeding', 'reckless_merge', 'road_rage', 'sudden_stop', 'no_safe_distance', 'not_watching_ahead', 'halmanghaanj', 'pedestrian_slow_down', 'high_beam'],
        labels: ['Í≥ºÏÜç?¥Ï†Ñ', 'Î¨¥Î¶¨???©Î•ò', 'Î≥¥Î≥µ?¥Ï†Ñ', 'Í∏âÏ†ïÍ±?, '?àÏ†ÑÍ±∞Î¶¨ ÎØ∏ÌôïÎ≥?, '?ÑÎ∞©Ï£ºÏãú ?úÎßå', '?†Îßé?òÏïä', 'Î≥¥Ìñâ???ûÏóê???çÎèÑ Ï§ÑÏó¨Ï£ºÏÑ∏??, '?ÅÌñ•???åÎ¨∏???ûÏù¥ ????Î≥¥Ïó¨??],
        vehicleType: 'car'
    },
    categoryB: {
        name: 'BÍ∏??àÏ†Ñ Î©îÏÑ∏ÏßÄ',
        keys: ['exit_cutting', 'sudden_lane_change', 'drowsy_driving', 'no_blinker', 'lane_violation', 'habitual_brake', 'slow_driving', 'dont_park_here'],
        labels: ['Ï∂úÍµ¨ ?àÏπòÍ∏?, 'Í∏?Ï∞®ÏÑ†Î≥ÄÍ≤?, 'Ï°∏Ïùå?¥Ï†Ñ', 'Î∞©Ìñ•ÏßÄ?úÎì± ÎØ∏Ï†ê??, 'ÏßÄ?ïÏ∞®Î°?ÎØ∏Ï???, '?µÍ???Î∏åÎ†à?¥ÌÅ¨', '?Ä?çÏö¥??, '?¨Í∏∞???ïÏ∞®/Ï£ºÏ∞®Í∞Ä ?ÑÌóò??Í≥≥Ïù¥?êÏöî'],
        vehicleType: 'car'
    },
    categoryC: {
        name: 'Ï∞®Îüâ?ÅÌÉú Î©îÏÑ∏ÏßÄ',
        keys: ['light_broken', 'tire_issue', 'wheel_balance', 'exhaust_issue', 'engine_smoke', 'oil_leak', 'trunk_open', 'cargo_loose'],
        labels: ['?ºÏù¥??Í≥†Ïû•', '?Ä?¥Ïñ¥ ?ÅÌÉú ?¥ÏÉÅ', '??Î∞∏Îü∞???¥ÏÉÅ', 'Î∞∞Í∏∞Í∞Ä???¥ÏÉÅ', '?îÏßÑ ?∞Í∏∞Î∞úÏÉù', '?îÏßÑ?§Ïùº ?ÑÏú†', '?∏Î†Å??Î≥¥Îãõ/?∞Î£åÏ∫??¥Î¶º', '?ÅÏû¨Î¨ºÏù¥ ?îÎì§?§Ïöî, ?®Ïñ¥Ïß????àÏñ¥??],
        vehicleType: 'car'
    },
    categoryD: {
        name: 'Ï¢ãÏ? Í∞êÏ†ï Î©îÏÑ∏ÏßÄ',
        keys: ['thank_you', 'forgive', 'pretty', 'cool', 'good_driver', 'envy', 'beginner_fighting'],
        labels: ['Í≥†Îßô?µÎãà??, '?©ÏÑú?†Í≤å??, '?àÎªê??, 'Î©ãÏ†∏??, '?¥Ï†Ñ ?òÌï¥??, 'Î∂Ä?¨Ïõå??, 'Ï¥àÎ≥¥ ?îÏù¥??!!'],
        vehicleType: 'car'
    },
    likes: {
        name: 'Ï¢ãÏïÑ??,
        keys: ['likes'],
        labels: ['Ï¢ãÏïÑ??],
        vehicleType: 'both'
    },
    
    // === MOTORBIKE CATEGORIES ===
    mbSafety: {
        name: '?àÏ†Ñ Î©îÏÑ∏ÏßÄ',
        keys: ['mb_dangerous_moment', 'mb_dangerous_parking'],
        labels: ['Î∞©Í∏à ?ÑÌóò???úÍ∞Ñ???àÏóà?¥Ïöî. Ï°∞Í∏àÎß???Ï°∞Ïã¨??Ï£ºÏÑ∏??', '?¨Í∏∞???§ÌÜ†Î∞îÏù¥ ?∏Ïö∞Í∏??ÑÌóò??Í≥≥Ïù¥?êÏöî.'],
        vehicleType: 'motorbike'
    },
    mbVehicle: {
        name: 'Ï∞®Îüâ ?ÅÌÉú',
        keys: ['mb_light_issue', 'mb_brake_sound', 'mb_tire_issue', 'mb_chain_sound', 'mb_delivery_box'],
        labels: ['?ºÏù¥???¥ÏÉÅ', 'Î∏åÎ†à?¥ÌÅ¨ ?åÎ¶¨ ?¥ÏÉÅ', '?Ä?¥Ïñ¥ ?¥ÏÉÅ', 'Ï≤¥Ïù∏ ?åÎ¶¨ ?¥ÏÉÅ', 'Î∞∞Îã¨Î∞ïÏä§ Í≥†Ï†ï ?¥ÏÉÅ'],
        vehicleType: 'motorbike'
    },
    mbPraise: {
        name: 'Ïπ?∞¨',
        keys: ['mb_signal_respect', 'mb_stop_line', 'mb_pedestrian_first', 'mb_safety_gear', 'mb_considerate_driving', 'mb_lane_keeping'],
        labels: ['?†Ìò∏Î•??ùÍπåÏßÄ ÏßÄÏº?Ï£ºÏÖî??Î©ãÏ†∏??', '?ïÏ?????ÏßÄ?§ÏÖî??Î≥¥Í∏∞ Ï¢ãÏïò?µÎãà??', 'Î≥¥Ìñâ??Î®ºÏ? Î∞∞Î†§??Ï£ºÏÖî??Í≥†Îßô?µÎãà??', 'Î≥¥Ìò∏?•ÎπÑ ?ÑÎ≤Ω?òÍ≤å Ï∞©Ïö©?òÏã† Î™®Ïäµ???∏ÏÉÅ?ÅÏù¥?àÏñ¥??', 'Î∞∞Î†§ ?¥Ï†Ñ ?ïÎ∂Ñ??Ï£ºÎ????∏Ïïà?àÏñ¥??', 'Ï∞®ÏÑ† ÏßÄ?§Î©¥???¨Î¶¨??Î™®Ïäµ???ïÎßê Î©ãÏßë?àÎã§.'],
        vehicleType: 'motorbike'
    },
    mbSupport: {
        name: '?ëÏõê',
        keys: ['mb_weather_support', 'mb_slippery_warning', 'mb_delivery_thanks'],
        labels: ['?†Ïî®?Ä ?ÅÍ??ÜÏù¥ ??Í≥†ÏÉù??ÎßéÏúº??ãà??', '?∏Î©¥??ÎØ∏ÎÅÑ?¨Ïö∏ ???àÏñ¥?? ??ÉÅ ?àÏ†Ñ?¥Ìñâ ?òÏÑ∏??', '??ÉÅ ÍººÍºº?òÍ≤å Î∞∞Îã¨??Ï£ºÏÖî??Í∞êÏÇ¨?©Îãà??'],
        vehicleType: 'motorbike'
    },
    
    // Grouped categories for leaderboard calculations
    thanks: ['thank_you', 'forgive', 'pretty', 'cool', 'good_driver', 'envy', 'beginner_fighting', 
             'mb_signal_respect', 'mb_stop_line', 'mb_pedestrian_first', 'mb_safety_gear', 'mb_considerate_driving', 'mb_lane_keeping',
             'mb_weather_support', 'mb_slippery_warning', 'mb_delivery_thanks'],
    safety: ['speeding', 'reckless_merge', 'road_rage', 'sudden_stop', 'no_safe_distance', 'not_watching_ahead', 'halmanghaanj', 'pedestrian_slow_down', 'high_beam',
             'exit_cutting', 'sudden_lane_change', 'drowsy_driving', 'no_blinker', 'lane_violation', 'habitual_brake', 'slow_driving', 'dont_park_here',
             'mb_dangerous_moment', 'mb_dangerous_parking']
};

/**
 * Determines if a plate type is a motorbike
 * @param {string} plateType - The plate type from normalizePlate (e.g., 'motorbike-region', 'motorbike-simple')
 * @returns {boolean} - True if motorbike, false otherwise
 */
function isMotorbikePlate(plateType) {
    return plateType === 'motorbike-region' || plateType === 'motorbike-simple';
}

/**
 * Gets the vehicle type for a plate number
 * @param {string} plateNumber - The plate number to check
 * @returns {string} - 'motorbike' or 'car'
 */
function getVehicleType(plateNumber) {
    const normalized = Validator.normalizePlate(plateNumber);
    if (normalized && isMotorbikePlate(normalized.type)) {
        return 'motorbike';
    }
    return 'car';
}

/**
 * Gets the category for a given counter key
 * @param {string} counterKey - The counter key (e.g., 'speeding')
 * @returns {string|null} - The category name ('categoryA', 'categoryB', etc.) or null if not found
 */
function getCategoryForCounter(counterKey) {
    if (!counterKey) {
        return null;
    }
    
    for (const [categoryId, categoryData] of Object.entries(CATEGORIES)) {
        // Skip grouped categories (thanks, safety) which are arrays
        if (Array.isArray(categoryData)) {
            continue;
        }
        
        if (categoryData.keys && categoryData.keys.includes(counterKey)) {
            return categoryId;
        }
    }
    
    return null;
}

/**
 * Gets the Korean label for a given counter key
 * @param {string} counterKey - The counter key (e.g., 'headlight_broken')
 * @returns {string|null} - The Korean label or null if not found
 */
function getKoreanLabelForCounter(counterKey) {
    if (!counterKey) {
        return null;
    }
    
    for (const [koreanLabel, key] of Object.entries(COUNTER_KEYS)) {
        if (key === counterKey) {
            return koreanLabel;
        }
    }
    
    return null;
}

// ============================================================================
// Validator Module
// ============================================================================
const Validator = {
    // Korean plate number regex: 2-3 digits + Korean character + 4 digits
    PLATE_REGEX: /^(\d{2,3}[Í∞Ä-??\d{4})$/,
    
    /**
     * SafeDrive ÏµúÏ¢Ö Î≤àÌò∏???ïÍ∑ú???®Ïàò (2025??ÏµúÏ†Å??Î≤ÑÏ†Ñ)
     * Normalizes Korean plate numbers - handles new, old, and business plates
     * @param {string} input - The plate number to normalize
     * @returns {Object|null} - Normalized plate info or null if invalid
     *   { plate: string, type: string, unique: boolean, possibleRegions?: array }
     */
    normalizePlate(input) {
        const clean = input.trim().replace(/\s+/g, '');
        
        // 1. Í±¥ÏÑ§ Í∏∞Í≥Ñ??Î≤àÌò∏??- Construction machinery plates
        // Examples: ?ÅÍ≤Ω??1Í∞Ä1234, ?ÅÏÑú??2??678
        // Format: ??+ region (2 chars) + 2 digits + Korean char + 4 digits
        const constructionPattern = /^(??Í∞Ä-??{2}\d{2}[Í∞Ä-??\d{4})$/;
        const matchConstruction = clean.match(constructionPattern);
        if (matchConstruction) {
            return { plate: matchConstruction[1], type: 'construction', unique: true };
        }
        
        // 2. ?¥Î•úÏ∞?Î≤àÌò∏??(ÏßÄ??™Ö ?¨Ìï®) - Motorbike plates with region
        // Examples: Î∂Ä?∞ÎÇ®Í∞Ä1234, Í≤ΩÎÇ®Ï∞ΩÏõêÍ∞Ä1234, ?úÏö∏Í∞ïÎÇ®??678, ?úÏö∏?ôÎ?Î¨∏Í?1234
        // Format: region + city/district + Korean char + 4 digits (3-7 Korean chars total before digits)
        const motorbikeRegionPattern = /^([Í∞Ä-??{3,7}\d{4})$/;
        const matchMotorbikeRegion = clean.match(motorbikeRegionPattern);
        if (matchMotorbikeRegion) {
            return { plate: matchMotorbikeRegion[1], type: 'motorbike-region', unique: true };
        }
        
        // 3. ?¥Î•úÏ∞?Î≤àÌò∏??(Í∞ÑÎã®?? - Motorbike plates simple format
        // Examples: 1Í∞Ä21234, 2??4567
        // Format: 1 digit + Korean char + 5 digits
        const motorbikeSimplePattern = /^(\d[Í∞Ä-??\d{5})$/;
        const matchMotorbikeSimple = clean.match(motorbikeSimplePattern);
        if (matchMotorbikeSimple) {
            return { plate: matchMotorbikeSimple[1], type: 'motorbike-simple', unique: true };
        }
        
        // 4. ?†Ìòï Î≤àÌò∏??(Í∞Ä??ÎßéÏùå) - New format plates
        // Examples: 09Î£?363, 123Í∞Ä1234
        const newPattern = /^(\d{2,3}[Í∞Ä-??[Í∞Ä-???\d{4})$/;
        const matchNew = clean.match(newPattern);
        if (matchNew) {
            return { plate: matchNew[1], type: 'new', unique: true };
        }
        
        // 5. ?ÅÏóÖ??(?∏Î??? - Business plates (yellow)
        // Examples: 70Í∞Ä1234, 89??678 (starts with 7, 8, or 9)
        const bizPattern = /^([7-9]\d[Í∞Ä-??\d{4})$/;
        const matchBiz = clean.match(bizPattern);
        if (matchBiz) {
            return { plate: matchBiz[1], type: 'business', unique: true };
        }
        
        // 6. Íµ¨Ìòï ?πÏÉâ Î≤àÌò∏??(ÏßÄ??™Ö ?ùÎûµ??Í≤ΩÏö∞) - Old green plates
        // Examples: ?úÏö∏12Í∞Ä3456, Í≤ΩÍ∏∞34??678, or just 12Í∞Ä3456 (without region)
        const oldPattern = /^(?:([Í∞Ä-??{1,2}) ?)?(\d{2,3}[Í∞Ä-??\d{4})$/;
        const matchOld = clean.match(oldPattern);
        if (matchOld) {
            const region = matchOld[1] || null;  // ?úÏö∏, Í≤ΩÍ∏∞ ??
            const number = matchOld[2];          // 12Í∞Ä3456
            
            if (region) {
                // ÏßÄ??™Ö ?àÏúºÎ©??ïÌôï???òÎÇò - Region specified, unique plate
                return { plate: `${region}${number}`, type: 'old', unique: true };
            } else {
                // ÏßÄ??™Ö ?ÜÏúºÎ©???Î™®Îì† ?úÎèÑ Î≤ÑÏ†Ñ ?àÏö© - No region, ambiguous
                return { 
                    plate: number, 
                    type: 'old-ambiguous', 
                    unique: false, 
                    possibleRegions: [
                        '?úÏö∏', 'Î∂Ä??, '?ÄÍµ?, '?∏Ï≤ú', 'Í¥ëÏ£º', '?Ä??, '?∏ÏÇ∞', '?∏Ï¢Ö',
                        'Í≤ΩÍ∏∞', 'Í∞ïÏõê', 'Ï∂©Î∂Å', 'Ï∂©ÎÇ®', '?ÑÎ∂Å', '?ÑÎÇ®', 'Í≤ΩÎ∂Å', 'Í≤ΩÎÇ®', '?úÏ£º'
                    ]
                };
            }
        }
        
        return null;
    },
    
    /**
     * Validates a plate number against Korean plate formats
     * Supports new, old, and business plate formats
     * @param {string} input - The plate number to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    validatePlateNumber(input) {
        if (!input || typeof input !== 'string') {
            return false;
        }
        const normalized = this.normalizePlate(input);
        return normalized !== null;
    },
    
    /**
     * Sanitizes and normalizes plate number input
     * Removes whitespace and converts to consistent format
     * @param {string} input - The plate number to sanitize
     * @returns {string} - Cleaned plate number
     */
    sanitizePlateNumber(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        // Remove all whitespace
        return input.trim().replace(/\s+/g, '');
    }
};

// ============================================================================
// Vehicle Emoji Helper
// ============================================================================
/**
 * Gets the appropriate vehicle emoji for a plate number
 * @param {string} plateNumber - The plate number to check
 * @returns {string} - Vehicle emoji (?öó, ?öö, ?öå, or ?õµ)
 */
function getVehicleEmoji(plateNumber) {
    if (!plateNumber) {
        return '?öó'; // Default to car
    }
    
    try {
        const clean = plateNumber.trim().replace(/\s+/g, '');
        
        // Normalize the plate
        const normalized = Validator.normalizePlate(clean);
        
        if (!normalized) {
            return '?öó'; // Default to car if normalization fails
        }
        
        // console.log('getVehicleEmoji: plate=', clean, 'type=', normalized.type);
        
        // 1. Check if it's a motorbike (highest priority for motorbike patterns)
        if (normalized.type === 'motorbike-region' || normalized.type === 'motorbike-simple') {
            return '?õµ';
        }
        
        // 2. Check if it's construction machinery
        if (normalized.type === 'construction') {
            return '?öö';
        }
        
        // 3. For car plates, detect bus or truck based on Korean character and leading digits
        // Extract leading digits and middle Korean character
        // Patterns: 
        //   - New/Old: 2-3 digits + Korean char + 4 digits (e.g., 09Î£?363, 70Í∞Ä1234)
        //   - With region: region + 2-3 digits + Korean char + 4 digits (e.g., ?úÏö∏12Í∞Ä3456)
        
        // Try to extract the numeric prefix and Korean character
        // Handle both with and without region prefix
        const withRegionPattern = /^[Í∞Ä-??{1,2}(\d{2,3})([Í∞Ä-??)\d{4}$/;
        const withoutRegionPattern = /^(\d{2,3})([Í∞Ä-??)\d{4}$/;
        
        let leadingDigits = null;
        let koreanChar = null;
        
        const matchWithRegion = clean.match(withRegionPattern);
        const matchWithoutRegion = clean.match(withoutRegionPattern);
        
        if (matchWithRegion) {
            leadingDigits = parseInt(matchWithRegion[1], 10);
            koreanChar = matchWithRegion[2];
        } else if (matchWithoutRegion) {
            leadingDigits = parseInt(matchWithoutRegion[1], 10);
            koreanChar = matchWithoutRegion[2];
        }
        
        if (leadingDigits !== null && koreanChar !== null) {
            // Bus detection: Korean characters commonly used for buses
            // Î∞? ?? ?? ??are typical bus plate characters in Korea
            const busChars = ['Î∞?, '??, '??, '??];
            if (busChars.includes(koreanChar)) {
                return '?öå';
            }
            
            // Truck/cargo/business detection: 
            // Leading digits 70-99 are typically for larger/commercial vehicles
            if (leadingDigits >= 70 && leadingDigits <= 99) {
                return '?öö';
            }
        }
        
        // Default to passenger car
        return '?öó';
        
    } catch (error) {
        console.error('getVehicleEmoji error:', error);
        return '?öó'; // Default to car on error
    }
}

// ============================================================================
// Router Module
// ============================================================================
const Router = {
    /**
     * Parses plate number from URL
     * Supports multiple formats:
     * 1. Path format: /plate.html/09Î£?363
     * 2. Query string format: /plate.html?plate=09Î£?363
     * 3. Hash format: /plate.html#09Î£?363
     * @returns {string|null} - Extracted plate number or null if not found
     */
    parsePlateFromURL() {
        const url = window.location.href;
        const pathname = window.location.pathname;
        const search = window.location.search;
        const hash = window.location.hash;
        
        // Try path format: /plate.html/09Î£?363
        const pathMatch = pathname.match(/\/plate\.html\/([^\/]+)/);
        if (pathMatch && pathMatch[1]) {
            const plate = decodeURIComponent(pathMatch[1]);
            return Validator.sanitizePlateNumber(plate);
        }
        
        // Try query string format: ?plate=09Î£?363
        if (search) {
            const params = new URLSearchParams(search);
            const plate = params.get('plate');
            if (plate) {
                return Validator.sanitizePlateNumber(plate);
            }
        }
        
        // Try hash format: #09Î£?363 (fallback for older browsers)
        if (hash && hash.length > 1) {
            const plate = decodeURIComponent(hash.substring(1)); // Remove the # symbol and decode
            return Validator.sanitizePlateNumber(plate);
        }
        
        return null;
    },
    
    /**
     * Navigates to a plate detail page with clean URL
     * Uses History API if available, falls back to hash-based navigation
     * @param {string} plateNumber - The plate number to navigate to
     */
    navigateToPlate(plateNumber) {
        if (!plateNumber) {
            console.error('Router.navigateToPlate: plateNumber is required');
            return;
        }
        
        const sanitized = Validator.sanitizePlateNumber(plateNumber);
        
        // Validate plate number before navigation
        if (!Validator.validatePlateNumber(sanitized)) {
            console.error('Router.navigateToPlate: Invalid plate number format');
            return;
        }
        
        // Check if we're already on the plate page
        const pathname = window.location.pathname;
        if (pathname.includes('plate.html')) {
            // We're already on plate.html, just update the URL and trigger route change
            if (window.history && window.history.pushState) {
                const cleanURL = `/plate.html?plate=${encodeURIComponent(sanitized)}`;
                window.history.pushState({ plate: sanitized }, '', cleanURL);
                
                // Trigger a custom event for the app to handle the navigation
                window.dispatchEvent(new CustomEvent('routechange', { detail: { plate: sanitized } }));
            } else {
                // Fallback to hash-based navigation for older browsers
                window.location.hash = encodeURIComponent(sanitized);
            }
        } else {
            // Navigate to plate.html with query parameter (works on all servers including localhost)
            window.location.href = `/plate.html?plate=${encodeURIComponent(sanitized)}`;
        }
    },
    
    /**
     * Gets the current plate number from the URL
     * @returns {string|null} - Current plate number or null
     */
    getCurrentPlate() {
        return this.parsePlateFromURL();
    },
    
    /**
     * Initializes the router
     * Sets up event listeners for browser navigation (back/forward buttons)
     */
    initRouter() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            const plate = this.parsePlateFromURL();
            if (plate) {
                // Trigger custom event for the app to handle
                window.dispatchEvent(new CustomEvent('routechange', { detail: { plate: plate } }));
            }
        });
        
        // Handle hash changes (fallback for older browsers)
        window.addEventListener('hashchange', () => {
            const plate = this.parsePlateFromURL();
            if (plate) {
                window.dispatchEvent(new CustomEvent('routechange', { detail: { plate: plate } }));
            }
        });
        
        // console.log('Router initialized');
    }
};

// ============================================================================
// Daily Limit Manager Module
// ============================================================================
const DailyLimitManager = {
    /**
     * Gets the current date in Korea Standard Time (UTC+9)
     * @returns {Date} - Current date in KST
     */
    getKSTDate() {
        // Get current UTC time
        const now = new Date();
        
        // Convert to KST (UTC+9)
        // Get UTC time in milliseconds and add 9 hours
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const kstTime = new Date(utcTime + (9 * 60 * 60 * 1000));
        
        return kstTime;
    },
    
    /**
     * Formats a date to YYYYMMDD string in KST
     * @param {Date} date - Date object to format
     * @returns {string} - Formatted date string (YYYYMMDD)
     */
    formatDateKST(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },
    
    /**
     * Checks if a stored timestamp is from a previous day (based on KST)
     * @param {number} timestamp - Timestamp in milliseconds to check
     * @returns {boolean} - True if timestamp is from a previous day, false if same day
     */
    isNewDay(timestamp) {
        if (!timestamp || typeof timestamp !== 'number') {
            return true; // If no valid timestamp, treat as new day
        }
        
        // Get current date in KST
        const currentKSTDate = this.getKSTDate();
        const currentDateString = this.formatDateKST(currentKSTDate);
        
        // Convert stored timestamp to KST date
        // timestamp is already in UTC milliseconds (from Date.now())
        // We need to add 9 hours to convert to KST
        const storedKST = new Date(timestamp + (9 * 60 * 60 * 1000));
        const storedDateString = this.formatDateKST(storedKST);
        
        // Compare date strings
        return currentDateString !== storedDateString;
    },
    
    /**
     * Generates LocalStorage key for daily limit tracking
     * @param {string} plateNumber - Plate number
     * @param {string} counterKey - Counter key (e.g., 'headlight_broken')
     * @returns {string} - LocalStorage key
     */
    generateKey(plateNumber, counterKey) {
        const kstDate = this.getKSTDate();
        const dateString = this.formatDateKST(kstDate);
        return `safedrive_limit_${plateNumber}_${counterKey}_${dateString}`;
    },
    
    /**
     * Checks if a counter increment is allowed today
     * @param {string} plateNumber - Plate number
     * @param {string} counterKey - Counter key
     * @returns {boolean} - True if increment is allowed, false if daily limit reached
     */
    canIncrement(plateNumber, counterKey) {
        if (!plateNumber || !counterKey) {
            console.error('DailyLimitManager.canIncrement: plateNumber and counterKey are required');
            return false;
        }
        
        try {
            // Generate the key for today
            const key = this.generateKey(plateNumber, counterKey);
            
            // Check if there's a record in LocalStorage
            const storedTimestamp = localStorage.getItem(key);
            
            // If no record exists, increment is allowed
            if (!storedTimestamp) {
                return true;
            }
            
            // Parse the stored timestamp
            const timestamp = parseInt(storedTimestamp, 10);
            
            // Check if it's a new day
            if (this.isNewDay(timestamp)) {
                // It's a new day, so increment is allowed
                // Clean up the old entry
                localStorage.removeItem(key);
                return true;
            }
            
            // Same day, increment not allowed
            return false;
        } catch (error) {
            // If LocalStorage is not available or quota exceeded, allow increment
            console.error('DailyLimitManager.canIncrement error:', error);
            return true;
        }
    },
    
    /**
     * Records an increment in LocalStorage with current timestamp
     * @param {string} plateNumber - Plate number
     * @param {string} counterKey - Counter key
     * @returns {boolean} - True if successfully recorded, false otherwise
     */
    recordIncrement(plateNumber, counterKey) {
        if (!plateNumber || !counterKey) {
            console.error('DailyLimitManager.recordIncrement: plateNumber and counterKey are required');
            return false;
        }
        
        try {
            // Generate the key for today
            const key = this.generateKey(plateNumber, counterKey);
            
            // Store current timestamp
            const timestamp = Date.now();
            localStorage.setItem(key, timestamp.toString());
            
            return true;
        } catch (error) {
            // Handle LocalStorage quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded, attempting to clear old entries');
                this.clearOldEntries();
                
                // Try again after clearing
                try {
                    const key = this.generateKey(plateNumber, counterKey);
                    const timestamp = Date.now();
                    localStorage.setItem(key, timestamp.toString());
                    return true;
                } catch (retryError) {
                    console.error('DailyLimitManager.recordIncrement: Failed after clearing old entries', retryError);
                    return false;
                }
            }
            
            console.error('DailyLimitManager.recordIncrement error:', error);
            return false;
        }
    },
    
    /**
     * Clears LocalStorage entries older than 7 days
     * Used to prevent quota issues
     */
    clearOldEntries() {
        try {
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const keysToRemove = [];
            
            // Find all safedrive_limit_ keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('safedrive_limit_')) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        const timestamp = parseInt(value, 10);
                        if (timestamp < sevenDaysAgo) {
                            keysToRemove.push(key);
                        }
                    }
                }
            }
            
            // Remove old entries
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // console.log(`DailyLimitManager: Cleared ${keysToRemove.length} old entries`);
        } catch (error) {
            console.error('DailyLimitManager.clearOldEntries error:', error);
        }
    }
};

// ============================================================================
// Firebase Client Module
// ============================================================================
const FirebaseClient = {
    // Session cache for plate data to avoid redundant fetches
    // Format: { 'plateNumber': { data: {...}, timestamp: 123456789 } }
    plateDataCache: {},
    
    // Cache TTL in milliseconds (5 minutes)
    CACHE_TTL: 5 * 60 * 1000,
    
    /**
     * Gets the database reference
     * @returns {firebase.database.Reference} - Firebase database reference
     */
    getDatabase() {
        return database;
    },
    
    /**
     * Checks if plate data is cached and still valid
     * @param {string} plateNumber - The plate number
     * @returns {boolean} - True if cached and valid, false otherwise
     */
    isPlateDataCached(plateNumber) {
        const cached = this.plateDataCache[plateNumber];
        if (!cached) {
            return false;
        }
        
        // Check if cache is still valid (within TTL)
        const now = Date.now();
        const age = now - cached.timestamp;
        return age < this.CACHE_TTL;
    },
    
    /**
     * Gets cached plate data
     * @param {string} plateNumber - The plate number
     * @returns {object|null} - Cached data or null if not found/expired
     */
    getCachedPlateData(plateNumber) {
        if (this.isPlateDataCached(plateNumber)) {
            // console.log(`FirebaseClient: Returning cached data for ${plateNumber}`);
            return this.plateDataCache[plateNumber].data;
        }
        return null;
    },
    
    /**
     * Stores plate data in cache
     * @param {string} plateNumber - The plate number
     * @param {object} data - Plate data to cache
     */
    cachePlateData(plateNumber, data) {
        this.plateDataCache[plateNumber] = {
            data: data,
            timestamp: Date.now()
        };
        // console.log(`FirebaseClient: Cached data for ${plateNumber}`);
    },
    
    /**
     * Invalidates cached plate data
     * @param {string} plateNumber - The plate number
     */
    invalidatePlateDataCache(plateNumber) {
        if (this.plateDataCache[plateNumber]) {
            delete this.plateDataCache[plateNumber];
            // console.log(`FirebaseClient: Invalidated cache for ${plateNumber}`);
        }
    },
    
    /**
     * Increments view counters for a plate (fire and forget)
     * @param {string} plateNumber - The plate number
     */
    incrementViewCounters(plateNumber) {
        // Increment plate-specific views counter
        const viewsRef = database.ref(`plates/${plateNumber}/views`);
        viewsRef.transaction((current) => (current || 0) + 1).catch(err => {
            console.warn('Failed to increment views:', err);
        });
        
        // Increment global view counter for all time
        const globalViewsRef = database.ref('global/allTime/totalViews');
        globalViewsRef.transaction((current) => (current || 0) + 1).catch(err => {
            console.warn('Failed to increment global views:', err);
        });
        
        // console.log(`FirebaseClient: Incremented view counters for ${plateNumber}`);
    },
    
    /**
     * Clears all cached plate data
     */
    clearPlateDataCache() {
        this.plateDataCache = {};
        // console.log('FirebaseClient: Cleared all plate data cache');
    },
    
    /**
     * Fetches all counter data for a specific plate number
     * @param {string} plateNumber - The plate number to fetch data for
     * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh data
     * @returns {Promise<object>} - Promise resolving to plate data with counters
     */
    async getPlateData(plateNumber, forceRefresh = false) {
        if (!plateNumber) {
            const error = new Error('FirebaseClient.getPlateData: plateNumber is required');
            console.error('FirebaseClient.getPlateData error:', error);
            throw error;
        }
        
        // Always increment view counters (even if returning cached data)
        // Fire and forget - don't wait for these
        this.incrementViewCounters(plateNumber);
        
        // Check cache first (unless force refresh is requested)
        if (!forceRefresh) {
            const cachedData = this.getCachedPlateData(plateNumber);
            if (cachedData) {
                return cachedData;
            }
        }
        
        try {
            const plateRef = database.ref(`plates/${plateNumber}`);
            const snapshot = await plateRef.once('value');
            
            if (!snapshot.exists()) {
                // Return zero-state data for new plates
                // console.log(`FirebaseClient.getPlateData: No data found for ${plateNumber}, returning zero-state`);
                const zeroData = {
                    plateNumber: plateNumber,
                    counters: this.getZeroCounters(),
                    lastUpdated: null,
                    views: 0
                };
                
                // Cache zero-state data
                this.cachePlateData(plateNumber, zeroData);
                
                return zeroData;
            }
            
            const data = snapshot.val();
            
            // Ensure all counters exist (fill in missing ones with 0)
            const counters = { ...this.getZeroCounters(), ...(data.counters || {}) };
            
            const plateData = {
                plateNumber: plateNumber,
                counters: counters,
                lastUpdated: data.lastUpdated || null,
                views: data.views || 0
            };
            
            // Cache the fetched data
            this.cachePlateData(plateNumber, plateData);
            
            return plateData;
        } catch (error) {
            console.error('FirebaseClient.getPlateData error:', {
                plateNumber: plateNumber,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Check for specific error types
            if (error.code === 'PERMISSION_DENIED') {
                throw new Error('?∞Ïù¥?∞Î≤†?¥Ïä§ ?ëÍ∑º Í∂åÌïú???ÜÏäµ?àÎã§');
            } else if (error.message && error.message.includes('network')) {
                throw new Error('?§Ìä∏?åÌÅ¨ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??);
            } else {
                throw new Error('?∞Ïù¥?∞Î? Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§');
            }
        }
    },
    
    /**
     * Returns an object with all counter keys initialized to 0
     * @returns {object} - Object with all counter keys set to 0
     */
    getZeroCounters() {
        const zeroCounters = {};
        
        // Initialize all counter keys to 0
        Object.values(COUNTER_KEYS).forEach(key => {
            zeroCounters[key] = 0;
        });
        
        return zeroCounters;
    },
    
    /**
     * Increments a counter for a plate using Firebase transaction (atomic)
     * @param {string} plateNumber - The plate number
     * @param {string} counterKey - The counter key to increment
     * @returns {Promise<number>} - Promise resolving to the new counter value
     */
    async incrementCounter(plateNumber, counterKey) {
        if (!plateNumber || !counterKey) {
            const error = new Error('FirebaseClient.incrementCounter: plateNumber and counterKey are required');
            console.error('FirebaseClient.incrementCounter error:', error);
            throw error;
        }
        
        const counterRef = database.ref(`plates/${plateNumber}/counters/${counterKey}`);
        const lastUpdatedRef = database.ref(`plates/${plateNumber}/lastUpdated`);
        
        // Get today's date in KST format (YYYYMMDD)
        const todayStr = DailyLimitManager.formatDateKST(DailyLimitManager.getKSTDate());
        const dailyRef = database.ref(`plates/${plateNumber}/daily/${todayStr}/${counterKey}`);
        
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
            try {
                // console.log(`FirebaseClient.incrementCounter: Attempting increment for ${plateNumber}/${counterKey} (attempt ${retries + 1}/${maxRetries})`);
                
                // Use transaction for atomic increment of main counter
                const result = await counterRef.transaction((currentValue) => {
                    // If null or undefined, initialize to 0 then increment
                    return (currentValue || 0) + 1;
                });
                
                if (!result.committed) {
                    // Transaction was not committed (conflict detected)
                    retries++;
                    console.warn(`FirebaseClient.incrementCounter: Transaction conflict detected (attempt ${retries}/${maxRetries})`);
                    
                    if (retries >= maxRetries) {
                        const error = new Error('?∏Îûú??Öò Ï∂©ÎèåÎ°??∏Ìï¥ Î©îÏÑ∏ÏßÄ ?ÑÏÜ°???§Ìå®?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??);
                        console.error('FirebaseClient.incrementCounter error:', {
                            plateNumber: plateNumber,
                            counterKey: counterKey,
                            reason: 'Transaction failed after maximum retries',
                            retries: retries
                        });
                        throw error;
                    }
                    
                    // Wait a bit before retrying (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 100 * retries));
                    continue;
                }
                
                // console.log(`FirebaseClient.incrementCounter: Transaction committed successfully, new value: ${result.snapshot.val()}`);
                
                // Update daily counter using transaction
                await dailyRef.transaction((currentValue) => {
                    return (currentValue || 0) + 1;
                });
                
                // Update monthly counter using transaction (OPTIMIZATION: pre-aggregated monthly data)
                const kstDate = DailyLimitManager.getKSTDate();
                const monthStr = `${kstDate.getFullYear()}${String(kstDate.getMonth() + 1).padStart(2, '0')}`;
                const monthlyRef = database.ref(`plates/${plateNumber}/monthly/${monthStr}/${counterKey}`);
                await monthlyRef.transaction((currentValue) => {
                    return (currentValue || 0) + 1;
                });
                
                // Update lastUpdated timestamp
                const timestamp = Date.now();
                await lastUpdatedRef.set(timestamp);
                
                // Update global statistics for all time periods
                await this.updateGlobalStats(counterKey);
                
                // Invalidate cache for this plate since data changed
                this.invalidatePlateDataCache(plateNumber);
                
                // Trigger cleanup occasionally (1% chance = ~once per 100 increments)
                if (Math.random() < 0.01) {
                    this.cleanupOldData(plateNumber).catch(err => 
                        console.warn('Background cleanup failed:', err)
                    );
                }
                
                return result.snapshot.val();
            } catch (error) {
                console.error(`FirebaseClient.incrementCounter error (attempt ${retries + 1}/${maxRetries}):`, {
                    plateNumber: plateNumber,
                    counterKey: counterKey,
                    error: error.message,
                    code: error.code,
                    stack: error.stack
                });
                
                retries++;
                
                if (retries >= maxRetries) {
                    // Check for specific error types
                    if (error.code === 'PERMISSION_DENIED') {
                        throw new Error('?∞Ïù¥?∞Î≤†?¥Ïä§ ?ëÍ∑º Í∂åÌïú???ÜÏäµ?àÎã§');
                    } else if (error.message && (error.message.includes('network') || error.message.includes('offline'))) {
                        throw new Error('?§Ìä∏?åÌÅ¨ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??);
                    } else if (error.message && error.message.includes('?∏Îûú??Öò')) {
                        // Already has Korean message
                        throw error;
                    } else {
                        throw new Error('Î©îÏÑ∏ÏßÄ ?ÑÏÜ° Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??);
                    }
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 100 * retries));
            }
        }
    },
    
    /**
     * Fetches global statistics for a specific time period
     * @param {string} period - Time period: 'daily', 'weekly', 'monthly', 'yearly', 'allTime'
     * @returns {Promise<object>} - Promise resolving to global stats object
     */
    async getGlobalStats(period) {
        if (!period) {
            const error = new Error('FirebaseClient.getGlobalStats: period is required');
            console.error('FirebaseClient.getGlobalStats error:', error);
            throw error;
        }
        
        try {
            let path;
            
            if (period === 'allTime') {
                path = 'global/allTime';
            } else {
                // For time-based periods, we need to calculate the current period key
                const periodKey = this.getCurrentPeriodKey(period);
                path = `global/${period}/${periodKey}`;
            }
            
            // console.log(`FirebaseClient.getGlobalStats: Fetching stats for period ${period} at path ${path}`);
            
            const statsRef = database.ref(path);
            const snapshot = await statsRef.once('value');
            
            if (!snapshot.exists()) {
                // Return zero stats if no data exists
                // console.log(`FirebaseClient.getGlobalStats: No data found for period ${period}, returning zero stats`);
                return this.getZeroCounters();
            }
            
            const stats = snapshot.val();
            
            // Ensure all counters exist
            return { ...this.getZeroCounters(), ...stats };
        } catch (error) {
            console.error('FirebaseClient.getGlobalStats error:', {
                period: period,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Check for specific error types
            if (error.code === 'PERMISSION_DENIED') {
                throw new Error('?∞Ïù¥?∞Î≤†?¥Ïä§ ?ëÍ∑º Í∂åÌïú???ÜÏäµ?àÎã§');
            } else if (error.message && error.message.includes('network')) {
                throw new Error('?§Ìä∏?åÌÅ¨ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??);
            } else {
                throw new Error('?µÍ≥ÑÎ•?Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§');
            }
        }
    },
    
    /**
     * Updates global statistics by incrementing counters for all time periods
     * @param {string} counterKey - The counter key to increment
     * @returns {Promise<void>}
     */
    async updateGlobalStats(counterKey) {
        if (!counterKey) {
            const error = new Error('FirebaseClient.updateGlobalStats: counterKey is required');
            console.error('FirebaseClient.updateGlobalStats error:', error);
            throw error;
        }
        
        try {
            // console.log(`FirebaseClient.updateGlobalStats: Updating global stats for ${counterKey}`);
            
            const periods = ['daily', 'weekly', 'monthly', 'yearly', 'allTime'];
            const updatePromises = [];
            
            for (const period of periods) {
                let path;
                
                if (period === 'allTime') {
                    path = `global/allTime/${counterKey}`;
                } else {
                    const periodKey = this.getCurrentPeriodKey(period);
                    path = `global/${period}/${periodKey}/${counterKey}`;
                }
                
                const counterRef = database.ref(path);
                
                // Use transaction for atomic increment
                const promise = counterRef.transaction((currentValue) => {
                    return (currentValue || 0) + 1;
                }).catch(error => {
                    console.error(`FirebaseClient.updateGlobalStats: Failed to update ${period}:`, error);
                    // Don't throw, just log - we want to continue with other periods
                    return null;
                });
                
                updatePromises.push(promise);
            }
            
            // Wait for all updates to complete
            await Promise.all(updatePromises);
            // console.log(`FirebaseClient.updateGlobalStats: Successfully updated global stats for ${counterKey}`);
        } catch (error) {
            console.error('FirebaseClient.updateGlobalStats error:', {
                counterKey: counterKey,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            // Don't throw - global stats update failure shouldn't block the main increment
            console.warn('Global stats update failed, but counter increment succeeded');
        }
    },
    
    /**
     * Fetches real-time active users from Firebase (updated by Cloud Function from GA4)
     * @returns {Promise<object>} - Promise resolving to { activeUsers: number, lastUpdated: timestamp }
     */
    async getActiveUsers() {
        try {
            // console.log('FirebaseClient.getActiveUsers: Fetching active users from Firebase');
            
            const snapshot = await database.ref('analytics/realtime').once('value');
            
            if (!snapshot.exists()) {
                // console.log('FirebaseClient.getActiveUsers: No data found, returning default');
                return { activeUsers: 0, lastUpdated: null };
            }
            
            const data = snapshot.val();
            // console.log('FirebaseClient.getActiveUsers: Got data', data);
            
            return {
                activeUsers: data.activeUsers || 0,
                lastUpdated: data.lastUpdated || null
            };
        } catch (error) {
            console.error('FirebaseClient.getActiveUsers error:', {
                error: error.message,
                code: error.code
            });
            
            // Return default value on error
            return { activeUsers: 0, lastUpdated: null };
        }
    },
    
    /**
     * Sets up a real-time listener for active users
     * @param {function} callback - Callback function to receive updates
     * @returns {function} - Unsubscribe function
     */
    subscribeToActiveUsers(callback) {
        if (typeof callback !== 'function') {
            console.error('FirebaseClient.subscribeToActiveUsers: callback must be a function');
            return () => {};
        }
        
        const ref = database.ref('analytics/realtime');
        
        const listener = ref.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                callback({
                    activeUsers: data.activeUsers || 0,
                    lastUpdated: data.lastUpdated || null
                });
            } else {
                callback({ activeUsers: 0, lastUpdated: null });
            }
        }, (error) => {
            console.error('FirebaseClient.subscribeToActiveUsers error:', error);
            callback({ activeUsers: 0, lastUpdated: null, error: error.message });
        });
        
        // Return unsubscribe function
        return () => ref.off('value', listener);
    },
    
    /**
     * Gets the current period key for a given period type (in KST)
     * @param {string} period - Period type: 'daily', 'weekly', 'monthly', 'yearly'
     * @returns {string} - Period key (e.g., '20240115' for daily, '2024-03' for weekly)
     */
    getCurrentPeriodKey(period) {
        const kstDate = DailyLimitManager.getKSTDate();
        const year = kstDate.getFullYear();
        const month = String(kstDate.getMonth() + 1).padStart(2, '0');
        const day = String(kstDate.getDate()).padStart(2, '0');
        
        switch (period) {
            case 'daily':
                return `${year}${month}${day}`;
            
            case 'weekly':
                // Calculate week number (ISO week)
                const weekNumber = this.getISOWeekNumber(kstDate);
                return `${year}-${String(weekNumber).padStart(2, '0')}`;
            
            case 'monthly':
                return `${year}-${month}`;
            
            case 'yearly':
                return `${year}`;
            
            default:
                throw new Error(`Invalid period: ${period}`);
        }
    },
    
    /**
     * Calculates ISO week number for a date
     * @param {Date} date - Date object
     * @returns {number} - ISO week number (1-53)
     */
    getISOWeekNumber(date) {
        const target = new Date(date.valueOf());
        const dayNumber = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNumber + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    },
    
    /**
     * Fetches leaderboard data with period filtering
     * Delegates to LeaderboardDataManager for computation and caching
     * @param {string} type - Leaderboard type: 'bestDrivers' or 'mostLiked'
     * @param {string} period - Time period: 'today', 'thisWeek', 'thisMonth', 'thisYear', 'allTime'
     * @param {number} limit - Maximum number of entries to return (default: 10)
     * @returns {Promise<array>} - Promise resolving to array of leaderboard entries
     */
    async getLeaderboard(type, period, limit = 10) {
        if (!type || !period) {
            const error = new Error('FirebaseClient.getLeaderboard: type and period are required');
            console.error('FirebaseClient.getLeaderboard error:', error);
            throw error;
        }
        
        try {
            // console.log(`FirebaseClient.getLeaderboard: Delegating to LeaderboardDataManager for ${type}/${period}`);
            
            // Delegate to LeaderboardDataManager which handles computation and caching
            return await LeaderboardDataManager.getLeaderboard(type, period, limit);
        } catch (error) {
            console.error('FirebaseClient.getLeaderboard error:', {
                type: type,
                period: period,
                limit: limit,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Re-throw the error (LeaderboardDataManager already formats it)
            throw error;
        }
    },
    
    /**
     * Gets the time bounds for a period (in KST)
     * @param {string} period - Period: 'today', 'thisWeek', 'thisMonth', 'thisYear', 'allTime'
     * @returns {object} - Object with start and end timestamps
     */
    getPeriodBounds(period) {
        const kstDate = DailyLimitManager.getKSTDate();
        
        switch (period) {
            case 'today': {
                const startOfDay = new Date(kstDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(kstDate);
                endOfDay.setHours(23, 59, 59, 999);
                return { start: startOfDay.getTime(), end: endOfDay.getTime() };
            }
            
            case 'thisWeek': {
                const startOfWeek = new Date(kstDate);
                const dayOfWeek = startOfWeek.getDay();
                const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
                startOfWeek.setDate(startOfWeek.getDate() + diff);
                startOfWeek.setHours(0, 0, 0, 0);
                
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                
                return { start: startOfWeek.getTime(), end: endOfWeek.getTime() };
            }
            
            case 'thisMonth': {
                const startOfMonth = new Date(kstDate.getFullYear(), kstDate.getMonth(), 1, 0, 0, 0, 0);
                const endOfMonth = new Date(kstDate.getFullYear(), kstDate.getMonth() + 1, 0, 23, 59, 59, 999);
                return { start: startOfMonth.getTime(), end: endOfMonth.getTime() };
            }
            
            case 'thisYear': {
                const startOfYear = new Date(kstDate.getFullYear(), 0, 1, 0, 0, 0, 0);
                const endOfYear = new Date(kstDate.getFullYear(), 11, 31, 23, 59, 59, 999);
                return { start: startOfYear.getTime(), end: endOfYear.getTime() };
            }
            
            case 'allTime':
            default:
                return { start: 0, end: Date.now() };
        }
    },
    
    /**
     * Cleans up old data to prevent accumulation
     * Removes daily data older than 7 days and monthly data older than 12 months
     * @param {string} plateNumber - The plate number to clean up
     * @returns {Promise<void>}
     */
    async cleanupOldData(plateNumber) {
        if (!plateNumber) {
            console.warn('FirebaseClient.cleanupOldData: plateNumber is required');
            return;
        }
        
        try {
            // console.log(`FirebaseClient.cleanupOldData: Starting cleanup for ${plateNumber}`);
            const kstDate = DailyLimitManager.getKSTDate();
            
            // Clean daily data older than 7 days
            const sevenDaysAgo = new Date(kstDate);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const cutoffDaily = DailyLimitManager.formatDateKST(sevenDaysAgo);
            
            const dailyRef = database.ref(`plates/${plateNumber}/daily`);
            const dailySnapshot = await dailyRef.once('value');
            const dailyData = dailySnapshot.val() || {};
            
            let dailyDeleted = 0;
            for (const dateStr of Object.keys(dailyData)) {
                if (dateStr < cutoffDaily) {
                    await database.ref(`plates/${plateNumber}/daily/${dateStr}`).remove();
                    dailyDeleted++;
                    // console.log(`FirebaseClient.cleanupOldData: Removed daily data for ${dateStr}`);
                }
            }
            
            // Clean monthly data older than 12 months
            const twelveMonthsAgo = new Date(kstDate);
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
            const cutoffMonthly = `${twelveMonthsAgo.getFullYear()}${String(twelveMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
            
            const monthlyRef = database.ref(`plates/${plateNumber}/monthly`);
            const monthlySnapshot = await monthlyRef.once('value');
            const monthlyData = monthlySnapshot.val() || {};
            
            let monthlyDeleted = 0;
            for (const monthStr of Object.keys(monthlyData)) {
                if (monthStr < cutoffMonthly) {
                    await database.ref(`plates/${plateNumber}/monthly/${monthStr}`).remove();
                    monthlyDeleted++;
                    // console.log(`FirebaseClient.cleanupOldData: Removed monthly data for ${monthStr}`);
                }
            }
            
            // console.log(`FirebaseClient.cleanupOldData: Cleanup completed for ${plateNumber} - removed ${dailyDeleted} daily entries and ${monthlyDeleted} monthly entries`);
        } catch (error) {
            console.error('FirebaseClient.cleanupOldData error:', {
                plateNumber: plateNumber,
                error: error.message,
                stack: error.stack
            });
            // Don't throw - cleanup failure shouldn't block operations
        }
    }
};

// ============================================================================
// Leaderboard Calculator Module
// ============================================================================
const LeaderboardCalculator = {
    /**
     * Calculates the best driver score for a plate
     * Score = sum of thanks category - sum of safety category
     * @param {object} plateData - Plate data object with counters
     * @returns {number} - Best driver score
     */
    calculateBestDriverScore(plateData) {
        if (!plateData || !plateData.counters) {
            return 0;
        }
        
        const counters = plateData.counters;
        
        // Sum all thanks category counters
        const thanksCount = CATEGORIES.thanks.reduce((sum, key) => {
            return sum + (counters[key] || 0);
        }, 0);
        
        // Sum all safety category counters
        const safetyCount = CATEGORIES.safety.reduce((sum, key) => {
            return sum + (counters[key] || 0);
        }, 0);
        
        // Best driver score = thanks - safety
        return thanksCount - safetyCount;
    },
    
    /**
     * Calculates the most liked score for a plate (likes count)
     * @param {object} plateData - Plate data object with counters
     * @returns {number} - Likes count
     */
    calculateMostLikedScore(plateData) {
        if (!plateData || !plateData.counters) {
            return 0;
        }
        
        return plateData.counters.likes || 0;
    },
    
    /**
     * Ranks plates by applying a score function and sorting
     * @param {array} plates - Array of plate data objects
     * @param {function} scoreFunction - Function to calculate score for each plate
     * @returns {array} - Array of ranked plates with rank numbers
     */
    rankPlates(plates, scoreFunction) {
        if (!plates || !Array.isArray(plates)) {
            return [];
        }
        
        if (!scoreFunction || typeof scoreFunction !== 'function') {
            throw new Error('LeaderboardCalculator.rankPlates: scoreFunction must be a function');
        }
        
        // Calculate scores for all plates
        const platesWithScores = plates.map(plate => ({
            ...plate,
            score: scoreFunction(plate)
        }));
        
        // Sort by score in descending order
        platesWithScores.sort((a, b) => b.score - a.score);
        
        // Assign rank numbers
        const rankedPlates = platesWithScores.map((plate, index) => ({
            ...plate,
            rank: index + 1
        }));
        
        return rankedPlates;
    },
    
    /**
     * Filters plates by time period using KST timezone boundaries
     * @param {array} plates - Array of plate data objects
     * @param {string} period - Time period: 'today', 'thisWeek', 'thisMonth', 'thisYear', 'allTime'
     * @returns {array} - Filtered array of plates
     */
    filterByPeriod(plates, period) {
        if (!plates || !Array.isArray(plates)) {
            return [];
        }
        
        if (!period) {
            throw new Error('LeaderboardCalculator.filterByPeriod: period is required');
        }
        
        // Get period boundaries
        const bounds = this.getPeriodBounds(period);
        
        // Filter plates by lastUpdated timestamp
        return plates.filter(plate => {
            if (!plate.lastUpdated) {
                // If no lastUpdated, exclude from time-based periods
                return period === 'allTime';
            }
            
            return plate.lastUpdated >= bounds.start && plate.lastUpdated <= bounds.end;
        });
    },
    
    /**
     * Gets the time bounds for a period in KST timezone
     * @param {string} period - Period: 'today', 'thisWeek', 'thisMonth', 'thisYear', 'allTime'
     * @returns {object} - Object with start and end timestamps
     */
    getPeriodBounds(period) {
        const kstDate = DailyLimitManager.getKSTDate();
        
        switch (period) {
            case 'today':
                return this.getTodayBounds(kstDate);
            
            case 'thisWeek':
                return this.getThisWeekBounds(kstDate);
            
            case 'thisMonth':
                return this.getThisMonthBounds(kstDate);
            
            case 'thisYear':
                return this.getThisYearBounds(kstDate);
            
            case 'allTime':
            default:
                return { start: 0, end: Date.now() };
        }
    },
    
    /**
     * Gets today's bounds (start and end of day in KST)
     * @param {Date} kstDate - Current date in KST
     * @returns {object} - Object with start and end timestamps
     */
    getTodayBounds(kstDate) {
        const startOfDay = new Date(kstDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(kstDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        return {
            start: startOfDay.getTime(),
            end: endOfDay.getTime()
        };
    },
    
    /**
     * Gets this week's bounds (Monday to Sunday in KST)
     * @param {Date} kstDate - Current date in KST
     * @returns {object} - Object with start and end timestamps
     */
    getThisWeekBounds(kstDate) {
        const startOfWeek = new Date(kstDate);
        const dayOfWeek = startOfWeek.getDay();
        
        // Calculate days to subtract to get to Monday (day 1)
        // If Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6); // Add 6 days to get to Sunday
        endOfWeek.setHours(23, 59, 59, 999);
        
        return {
            start: startOfWeek.getTime(),
            end: endOfWeek.getTime()
        };
    },
    
    /**
     * Gets this month's bounds (first to last day in KST)
     * @param {Date} kstDate - Current date in KST
     * @returns {object} - Object with start and end timestamps
     */
    getThisMonthBounds(kstDate) {
        const startOfMonth = new Date(kstDate.getFullYear(), kstDate.getMonth(), 1, 0, 0, 0, 0);
        const endOfMonth = new Date(kstDate.getFullYear(), kstDate.getMonth() + 1, 0, 23, 59, 59, 999);
        
        return {
            start: startOfMonth.getTime(),
            end: endOfMonth.getTime()
        };
    },
    
    /**
     * Gets this year's bounds (Jan 1 to Dec 31 in KST)
     * @param {Date} kstDate - Current date in KST
     * @returns {object} - Object with start and end timestamps
     */
    getThisYearBounds(kstDate) {
        const startOfYear = new Date(kstDate.getFullYear(), 0, 1, 0, 0, 0, 0);
        const endOfYear = new Date(kstDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        
        return {
            start: startOfYear.getTime(),
            end: endOfYear.getTime()
        };
    }
};

// ============================================================================
// Leaderboard Data Manager Module
// ============================================================================
// NOTE: This module implements client-side leaderboard computation for MVP.
// In production, leaderboards should be pre-computed server-side using Firebase Cloud Functions
// to improve performance and reduce client-side data transfer.
// 
// Future enhancement: Implement Cloud Functions to:
// 1. Listen to plate data changes
// 2. Recompute leaderboards incrementally
// 3. Store pre-computed leaderboards in /leaderboards/{type}/{period}
// 4. Update leaderboards on a schedule (e.g., every hour for daily, daily for weekly, etc.)
const LeaderboardDataManager = {
    // Session cache for leaderboard data
    // Format: { 'bestDrivers-allTime': [...], 'mostLiked-today': [...], ... }
    cache: {},
    
    /**
     * Generates cache key for a leaderboard
     * @param {string} type - Leaderboard type: 'bestDrivers' or 'mostLiked'
     * @param {string} period - Time period
     * @returns {string} - Cache key
     */
    getCacheKey(type, period) {
        return `${type}-${period}`;
    },
    
    /**
     * Checks if leaderboard data is cached
     * @param {string} type - Leaderboard type
     * @param {string} period - Time period
     * @returns {boolean} - True if cached, false otherwise
     */
    isCached(type, period) {
        const key = this.getCacheKey(type, period);
        return this.cache.hasOwnProperty(key);
    },
    
    /**
     * Gets cached leaderboard data
     * @param {string} type - Leaderboard type
     * @param {string} period - Time period
     * @returns {array|null} - Cached data or null if not found
     */
    getCached(type, period) {
        const key = this.getCacheKey(type, period);
        return this.cache[key] || null;
    },
    
    /**
     * Stores leaderboard data in cache
     * @param {string} type - Leaderboard type
     * @param {string} period - Time period
     * @param {array} data - Leaderboard data to cache
     */
    setCached(type, period, data) {
        const key = this.getCacheKey(type, period);
        this.cache[key] = data;
        // console.log(`LeaderboardDataManager: Cached ${data.length} entries for ${key}`);
    },
    
    /**
     * Clears all cached leaderboard data
     */
    clearCache() {
        this.cache = {};
        // console.log('LeaderboardDataManager: Cache cleared');
    },
    
    /**
     * Fetches all plates data from Firebase
     * @returns {Promise<array>} - Promise resolving to array of plate objects
     */
    async fetchAllPlates() {
        try {
            // console.log('LeaderboardDataManager: Fetching all plates data');
            
            const platesRef = database.ref('plates');
            const snapshot = await platesRef.once('value');
            
            if (!snapshot.exists()) {
                // console.log('LeaderboardDataManager: No plates data found');
                return [];
            }
            
            const allPlatesData = snapshot.val();
            const plates = [];
            
            // Convert object to array of plate objects
            for (const [plateNumber, plateData] of Object.entries(allPlatesData)) {
                plates.push({
                    plateNumber: plateNumber,
                    counters: plateData.counters || {},
                    lastUpdated: plateData.lastUpdated || null
                });
            }
            
            // console.log(`LeaderboardDataManager: Fetched ${plates.length} plates`);
            return plates;
        } catch (error) {
            console.error('LeaderboardDataManager.fetchAllPlates error:', {
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            throw error;
        }
    },
    
    /**
     * Computes best drivers leaderboard from all plates
     * Best driver score = sum of thanks category - sum of safety category
     * @param {array} plates - Array of plate objects
     * @param {string} period - Time period for filtering
     * @param {number} limit - Maximum number of entries to return
     * @returns {array} - Ranked leaderboard entries
     */
    computeBestDriversLeaderboard(plates, period, limit = 10) {
        if (!plates || !Array.isArray(plates)) {
            return [];
        }
        
        // console.log(`LeaderboardDataManager: Computing best drivers leaderboard for period ${period}`);
        
        // Filter plates by time period
        const filteredPlates = LeaderboardCalculator.filterByPeriod(plates, period);
        // console.log(`LeaderboardDataManager: Filtered to ${filteredPlates.length} plates for period ${period}`);
        
        // Calculate scores for each plate
        const platesWithScores = filteredPlates.map(plate => {
            const counters = plate.counters || {};
            
            // Sum thanks category counters
            const thanksCount = CATEGORIES.thanks.reduce((sum, key) => {
                return sum + (counters[key] || 0);
            }, 0);
            
            // Sum safety category counters
            const safetyCount = CATEGORIES.safety.reduce((sum, key) => {
                return sum + (counters[key] || 0);
            }, 0);
            
            // Calculate best driver score
            const score = thanksCount - safetyCount;
            
            return {
                plateNumber: plate.plateNumber,
                score: score,
                thanksCount: thanksCount,
                safetyCount: safetyCount,
                lastUpdated: plate.lastUpdated
            };
        });
        
        // Sort by score in descending order
        platesWithScores.sort((a, b) => b.score - a.score);
        
        // Limit results and assign ranks
        const rankedEntries = platesWithScores.slice(0, limit).map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));
        
        // console.log(`LeaderboardDataManager: Computed ${rankedEntries.length} best driver entries`);
        return rankedEntries;
    },
    
    /**
     * Computes most liked leaderboard from all plates
     * Most liked score = likes count
     * @param {array} plates - Array of plate objects
     * @param {string} period - Time period for filtering
     * @param {number} limit - Maximum number of entries to return
     * @returns {array} - Ranked leaderboard entries
     */
    computeMostLikedLeaderboard(plates, period, limit = 10) {
        if (!plates || !Array.isArray(plates)) {
            return [];
        }
        
        // console.log(`LeaderboardDataManager: Computing most liked leaderboard for period ${period}`);
        
        // Filter plates by time period
        const filteredPlates = LeaderboardCalculator.filterByPeriod(plates, period);
        // console.log(`LeaderboardDataManager: Filtered to ${filteredPlates.length} plates for period ${period}`);
        
        // Calculate likes count for each plate
        const platesWithLikes = filteredPlates.map(plate => {
            const counters = plate.counters || {};
            const likesCount = counters.likes || 0;
            
            return {
                plateNumber: plate.plateNumber,
                likesCount: likesCount,
                lastUpdated: plate.lastUpdated
            };
        });
        
        // Sort by likes count in descending order
        platesWithLikes.sort((a, b) => b.likesCount - a.likesCount);
        
        // Limit results and assign ranks
        const rankedEntries = platesWithLikes.slice(0, limit).map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));
        
        // console.log(`LeaderboardDataManager: Computed ${rankedEntries.length} most liked entries`);
        return rankedEntries;
    },
    
    /**
     * Gets leaderboard data with caching and throttling
     * OPTIMIZED: Added throttling to prevent excessive fetches
     * Fetches from cache if available, otherwise computes from Firebase data
     * @param {string} type - Leaderboard type: 'bestDrivers' or 'mostLiked'
     * @param {string} period - Time period
     * @param {number} limit - Maximum number of entries to return
     * @returns {Promise<array>} - Promise resolving to leaderboard entries
     */
    async getLeaderboard(type, period, limit = 10) {
        if (!type || !period) {
            throw new Error('LeaderboardDataManager.getLeaderboard: type and period are required');
        }
        
        // console.log(`LeaderboardDataManager: Getting leaderboard for ${type}/${period}`);
        
        // Check cache first
        if (this.isCached(type, period)) {
            // console.log(`LeaderboardDataManager: Returning cached data for ${type}/${period}`);
            const cached = this.getCached(type, period);
            return cached.slice(0, limit); // Return limited results
        }
        
        // Check if we should throttle this fetch
        if (PerformanceOptimizer.shouldThrottleFetch()) {
            // Return empty array or cached data if available
            const cached = this.getCached(type, period);
            if (cached) {
                return cached.slice(0, limit);
            }
            return [];
        }
        
        try {
            // Use Cloud Function to fetch leaderboard (secure - no direct /plates access)
            // console.log('LeaderboardDataManager: Calling Cloud Function getLeaderboardHttp');
            
            const functionUrl = 'https://us-central1-safedrive-fa567.cloudfunctions.net/getLeaderboardHttp';
            const response = await fetch(`${functionUrl}?type=${type}&limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch leaderboard');
            }
            
            // Transform to expected format
            const leaderboardData = result.leaderboard.map(entry => ({
                plateNumber: entry.plateNumber,
                score: entry.score,
                likes: entry.likes,
                rank: entry.rank
            }));
            
            // Store in cache
            this.setCached(type, period, leaderboardData);
            
            // console.log(`LeaderboardDataManager: Received ${leaderboardData.length} entries from Cloud Function`);
            return leaderboardData;
        } catch (error) {
            console.error('LeaderboardDataManager.getLeaderboard error:', {
                type: type,
                period: period,
                limit: limit,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Check for specific error types
            if (error.code === 'PERMISSION_DENIED') {
                throw new Error('?∞Ïù¥?∞Î≤†?¥Ïä§ ?ëÍ∑º Í∂åÌïú???ÜÏäµ?àÎã§');
            } else if (error.message && error.message.includes('network')) {
                throw new Error('?§Ìä∏?åÌÅ¨ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??);
            } else if (error.message && error.message.includes('?∞Ïù¥?∞Î≤†?¥Ïä§')) {
                throw error;
            } else {
                throw new Error('Î¶¨ÎçîÎ≥¥ÎìúÎ•?Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§');
            }
        }
    }
};

// ============================================================================
// Performance Optimization Module
// ============================================================================
const PerformanceOptimizer = {
    lastFetchTime: 0,
    FETCH_THROTTLE: 500, // 500ms cooldown for leaderboard fetches
    lastUpdate: Date.now(),
    isVisible: true,
    globalRef: null,
    
    /**
     * Throttles function calls to prevent excessive operations
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },
    
    /**
     * Debounces function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    /**
     * Checks if leaderboard fetch should be throttled
     * @returns {boolean} - True if should throttle, false if allowed
     */
    shouldThrottleFetch() {
        const now = Date.now();
        if (now - this.lastFetchTime < this.FETCH_THROTTLE) {
            // console.log('?±Ô∏è Throttled fetch - using cached data');
            return true;
        }
        this.lastFetchTime = now;
        return false;
    },
    
    /**
     * Initializes visibility change handler for performance optimization
     */
    initVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            
            if (this.isVisible) {
                // Resume: Fetch fresh data if stale (30s threshold)
                if (Date.now() - this.lastUpdate > 30000) {
                    // console.log('?îÑ Tab visible - refreshing stale data');
                    // Only refresh if on landing page
                    const pathname = window.location.pathname;
                    if (pathname === '/' || pathname === '/index.html' || pathname.endsWith('/')) {
                        initLandingPage();
                    }
                }
            } else {
                // Pause: Disconnect Firebase listeners temporarily
                // console.log('?∏Ô∏è Tab hidden - pausing Firebase listeners');
                if (this.globalRef) {
                    this.globalRef.off();
                }
            }
        });
        
        // console.log('??Performance optimizer initialized');
    }
};

// ============================================================================
// Monthly Trend Tracker Module
// ============================================================================
const MonthlyTrendTracker = {
    /**
     * Gets the current date in KST as YYYY-MM-DD format (no time data)
     * @returns {string} - Date string in YYYY-MM-DD format
     */
    getKSTDateString() {
        const kstDate = DailyLimitManager.getKSTDate();
        const year = kstDate.getFullYear();
        const month = String(kstDate.getMonth() + 1).padStart(2, '0');
        const day = String(kstDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    /**
     * Records a monthly increment by storing the date in Firebase
     * Stores date in YYYY-MM-DD format (no time data)
     * @param {string} plateNumber - The plate number
     * @param {string} counterKey - The counter key
     * @returns {Promise<void>}
     */
    async recordMonthlyIncrement(plateNumber, counterKey) {
        if (!plateNumber || !counterKey) {
            const error = new Error('MonthlyTrendTracker.recordMonthlyIncrement: plateNumber and counterKey are required');
            console.error('MonthlyTrendTracker.recordMonthlyIncrement error:', error);
            throw error;
        }
        
        try {
            // Get current date in KST as YYYY-MM-DD
            const dateString = this.getKSTDateString();
            
            // console.log(`MonthlyTrendTracker.recordMonthlyIncrement: Recording increment for ${plateNumber}/${counterKey} on ${dateString}`);
            
            // Store date in Firebase under /plates/{plateNumber}/monthlyIncrements/{counterKey}/{YYYY-MM-DD}
            const incrementRef = database.ref(`plates/${plateNumber}/monthlyIncrements/${counterKey}/${dateString}`);
            
            // Set to true (we just need to know the date exists)
            await incrementRef.set(true);
            
            // console.log(`MonthlyTrendTracker.recordMonthlyIncrement: Successfully recorded increment`);
        } catch (error) {
            console.error('MonthlyTrendTracker.recordMonthlyIncrement error:', {
                plateNumber: plateNumber,
                counterKey: counterKey,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Don't throw - monthly tracking failure shouldn't block the main increment
            console.warn('Monthly increment tracking failed, but counter increment succeeded');
        }
    },
    
    /**
     * Fetches all increment dates for a plate
     * @param {string} plateNumber - The plate number
     * @returns {Promise<object>} - Promise resolving to object with counterKey -> array of dates
     */
    async getMonthlyTrends(plateNumber) {
        if (!plateNumber) {
            const error = new Error('MonthlyTrendTracker.getMonthlyTrends: plateNumber is required');
            console.error('MonthlyTrendTracker.getMonthlyTrends error:', error);
            throw error;
        }
        
        try {
            // console.log(`MonthlyTrendTracker.getMonthlyTrends: Fetching monthly trends for ${plateNumber}`);
            
            const incrementsRef = database.ref(`plates/${plateNumber}/monthlyIncrements`);
            const snapshot = await incrementsRef.once('value');
            
            if (!snapshot.exists()) {
                // console.log(`MonthlyTrendTracker.getMonthlyTrends: No monthly increment data found for ${plateNumber}`);
                return {};
            }
            
            const incrementsData = snapshot.val();
            const trends = {};
            
            // Convert Firebase data structure to array of dates per counter
            for (const [counterKey, dates] of Object.entries(incrementsData)) {
                trends[counterKey] = Object.keys(dates); // Get all date keys
            }
            
            // console.log(`MonthlyTrendTracker.getMonthlyTrends: Fetched trends for ${Object.keys(trends).length} counters`);
            return trends;
        } catch (error) {
            console.error('MonthlyTrendTracker.getMonthlyTrends error:', {
                plateNumber: plateNumber,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Check for specific error types
            if (error.code === 'PERMISSION_DENIED') {
                throw new Error('?∞Ïù¥?∞Î≤†?¥Ïä§ ?ëÍ∑º Í∂åÌïú???ÜÏäµ?àÎã§');
            } else if (error.message && error.message.includes('network')) {
                throw new Error('?§Ìä∏?åÌÅ¨ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??);
            } else {
                throw new Error('?îÎ≥Ñ Ï∂îÏÑ∏ ?∞Ïù¥?∞Î? Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§');
            }
        }
    },
    
    /**
     * Aggregates increment dates by month and counts occurrences
     * @param {array} incrementDates - Array of date strings in YYYY-MM-DD format
     * @returns {object} - Object with YYYY-MM keys and count values
     */
    aggregateByMonth(incrementDates) {
        if (!incrementDates || !Array.isArray(incrementDates)) {
            return {};
        }
        
        const monthCounts = {};
        
        // Group dates by YYYY-MM format
        for (const dateString of incrementDates) {
            if (!dateString || typeof dateString !== 'string') {
                continue;
            }
            
            // Extract YYYY-MM from YYYY-MM-DD
            const monthKey = dateString.substring(0, 7); // Get first 7 characters (YYYY-MM)
            
            if (monthCounts[monthKey]) {
                monthCounts[monthKey]++;
            } else {
                monthCounts[monthKey] = 1;
            }
        }
        
        return monthCounts;
    },
    
    /**
     * Generates an array of the last 12 month labels in KST
     * Returns months in YYYY-MM format, from 11 months ago to current month
     * @returns {array} - Array of month strings in YYYY-MM format
     */
    getLast12Months() {
        const months = [];
        const kstDate = DailyLimitManager.getKSTDate();
        
        // Start from 11 months ago and go to current month (total 12 months)
        for (let i = 11; i >= 0; i--) {
            const date = new Date(kstDate);
            date.setMonth(date.getMonth() - i);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`;
            
            months.push(monthKey);
        }
        
        return months;
    },
    
    /**
     * Gets aggregated monthly trend data for a plate
     * Returns counts for the last 12 months
     * @param {string} plateNumber - The plate number
     * @returns {Promise<object>} - Promise resolving to object with month labels and counts
     */
    async getAggregatedMonthlyTrends(plateNumber) {
        if (!plateNumber) {
            const error = new Error('MonthlyTrendTracker.getAggregatedMonthlyTrends: plateNumber is required');
            console.error('MonthlyTrendTracker.getAggregatedMonthlyTrends error:', error);
            throw error;
        }
        
        try {
            // console.log(`MonthlyTrendTracker.getAggregatedMonthlyTrends: Getting aggregated trends for ${plateNumber}`);
            
            // Get all increment dates for this plate
            const trends = await this.getMonthlyTrends(plateNumber);
            
            // Combine all dates from all counters
            const allDates = [];
            for (const dates of Object.values(trends)) {
                allDates.push(...dates);
            }
            
            // Aggregate by month
            const monthCounts = this.aggregateByMonth(allDates);
            
            // Get last 12 months
            const last12Months = this.getLast12Months();
            
            // Create result with zero values for months without data
            const result = {
                months: last12Months,
                counts: last12Months.map(month => monthCounts[month] || 0)
            };
            
            // console.log(`MonthlyTrendTracker.getAggregatedMonthlyTrends: Aggregated data for ${last12Months.length} months`);
            return result;
        } catch (error) {
            console.error('MonthlyTrendTracker.getAggregatedMonthlyTrends error:', {
                plateNumber: plateNumber,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Re-throw if it's already a formatted error
            if (error.message && error.message.includes('?∞Ïù¥?∞Î≤†?¥Ïä§')) {
                throw error;
            }
            
            throw new Error('?îÎ≥Ñ Ï∂îÏÑ∏ ?∞Ïù¥?∞Î? Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§');
        }
    },
    
    /**
     * Gets aggregated monthly trend data for specific counter keys (category)
     * Returns counts for the last 12 months for only the specified counter keys
     * @param {string} plateNumber - The plate number
     * @param {array} counterKeys - Array of counter keys to include
     * @returns {Promise<object>} - Promise resolving to object with month labels and counts
     */
    async getAggregatedCategoryTrends(plateNumber, counterKeys) {
        if (!plateNumber) {
            const error = new Error('MonthlyTrendTracker.getAggregatedCategoryTrends: plateNumber is required');
            console.error('MonthlyTrendTracker.getAggregatedCategoryTrends error:', error);
            throw error;
        }
        
        if (!counterKeys || !Array.isArray(counterKeys) || counterKeys.length === 0) {
            const error = new Error('MonthlyTrendTracker.getAggregatedCategoryTrends: counterKeys array is required');
            console.error('MonthlyTrendTracker.getAggregatedCategoryTrends error:', error);
            throw error;
        }
        
        try {
            // console.log(`MonthlyTrendTracker.getAggregatedCategoryTrends: Getting category trends for ${plateNumber} with ${counterKeys.length} keys (OPTIMIZED)`);
            
            // OPTIMIZATION: Read directly from pre-aggregated monthly data
            // Get last 12 months in YYYYMM format
            const last12Months = this.getLast12MonthsYYYYMM();
            const counts = [];
            
            // Fetch monthly data for each month
            for (const monthStr of last12Months) {
                try {
                    const monthRef = database.ref(`plates/${plateNumber}/monthly/${monthStr}`);
                    const snapshot = await monthRef.once('value');
                    const monthData = snapshot.val() || {};
                    
                    // Sum only the counters for this category
                    let monthTotal = 0;
                    counterKeys.forEach(key => {
                        monthTotal += monthData[key] || 0;
                    });
                    counts.push(monthTotal);
                } catch (error) {
                    console.warn(`Failed to fetch data for ${monthStr}:`, error);
                    counts.push(0);
                }
            }
            
            // Convert YYYYMM to YYYY-MM for display
            const displayMonths = last12Months.map(m => `${m.slice(0,4)}-${m.slice(4)}`);
            
            const result = {
                months: displayMonths,
                counts: counts
            };
            
            // console.log(`MonthlyTrendTracker.getAggregatedCategoryTrends: Aggregated data for ${last12Months.length} months (${counts.reduce((a,b) => a+b, 0)} total)`);
            return result;
        } catch (error) {
            console.error('MonthlyTrendTracker.getAggregatedCategoryTrends error:', {
                plateNumber: plateNumber,
                counterKeys: counterKeys,
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Re-throw if it's already a formatted error
            if (error.message && error.message.includes('?∞Ïù¥?∞Î≤†?¥Ïä§')) {
                throw error;
            }
            
            throw new Error('Ïπ¥ÌÖåÍ≥†Î¶¨ ?îÎ≥Ñ Ï∂îÏÑ∏ ?∞Ïù¥?∞Î? Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§');
        }
    },
    
    /**
     * Gets last 12 months in YYYYMM format (for optimized monthly data structure)
     * @returns {array} - Array of month strings in YYYYMM format
     */
    getLast12MonthsYYYYMM() {
        const months = [];
        const kstDate = DailyLimitManager.getKSTDate();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(kstDate);
            date.setMonth(date.getMonth() - i);
            const monthStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push(monthStr);
        }
        
        return months;
    }
};

// ============================================================================
// Chart Manager Module
// ============================================================================
const ChartManager = {
    /**
     * Category colors for the chart
     */
    CATEGORY_COLORS: {
        repair: 'rgba(255, 193, 7, 0.8)',    // Yellow for repairs
        safety: 'rgba(244, 67, 54, 0.8)',    // Red for safety warnings
        thanks: 'rgba(76, 175, 80, 0.8)',    // Green for thanks
        likes: 'rgba(33, 150, 243, 0.8)'     // Blue for likes
    },
    
    CATEGORY_LABELS: {
        repair: 'Í≥†Ïû•?òÎ¶¨',
        safety: '?àÏ†Ñ?¥Ï†Ñ',
        thanks: 'Í∞êÏÇ¨',
        likes: 'Ï¢ãÏïÑ??
    },
    
    /**
     * Transforms counter data into Chart.js dataset format
     * Groups counters by categories and creates datasets
     * @param {object} counters - Counter data object with counter keys and values
     * @returns {object} - Chart.js compatible data object with labels and datasets
     */
    formatChartData(counters) {
        if (!counters || typeof counters !== 'object') {
            counters = {};
        }
        
        // Prepare data grouped by categories
        const categoryData = {
            repair: [],
            safety: [],
            thanks: [],
            likes: []
        };
        
        const categoryLabels = {
            repair: [],
            safety: [],
            thanks: [],
            likes: []
        };
        
        // Group counters by category
        // Map categoryC to 'repair', categoryA+B to 'safety', categoryD to 'thanks', likes to 'likes'
        const categoryMapping = {
            repair: CATEGORIES.categoryC.keys,
            safety: CATEGORIES.safety,
            thanks: CATEGORIES.thanks,
            likes: CATEGORIES.likes.keys
        };
        
        for (const [category, keys] of Object.entries(categoryMapping)) {
            for (const key of keys) {
                const value = counters[key] || 0;
                const label = getKoreanLabelForCounter(key);
                
                if (label) {
                    categoryData[category].push(value);
                    categoryLabels[category].push(label);
                }
            }
        }
        
        // Create datasets for each category
        const datasets = [];
        const labels = [];
        
        // Add each category's data
        for (const category of ['repair', 'safety', 'thanks', 'likes']) {
            if (categoryData[category].length > 0) {
                // Add category label as a separator
                labels.push(this.CATEGORY_LABELS[category]);
                
                // Add individual counter labels
                labels.push(...categoryLabels[category]);
                
                // Create dataset with category color
                const dataset = {
                    label: this.CATEGORY_LABELS[category],
                    data: [null, ...categoryData[category]], // null for category label row
                    backgroundColor: this.CATEGORY_COLORS[category],
                    borderColor: this.CATEGORY_COLORS[category].replace('0.8', '1'),
                    borderWidth: 1
                };
                
                datasets.push(dataset);
            }
        }
        
        return {
            labels: labels,
            datasets: datasets
        };
    },
    
    /**
     * Creates a new Chart.js horizontal bar chart
     * @param {HTMLCanvasElement} canvas - Canvas element to render chart on
     * @param {object} counters - Counter data object
     * @returns {Chart} - Chart.js instance
     */
    createChart(canvas, counters) {
        if (!canvas) {
            const error = new Error('ChartManager.createChart: canvas element is required');
            console.error('ChartManager.createChart error:', error);
            throw error;
        }
        
        if (typeof Chart === 'undefined') {
            const error = new Error('ChartManager.createChart: Chart.js library not loaded');
            console.error('ChartManager.createChart error:', error);
            throw error;
        }
        
        try {
            // console.log('ChartManager.createChart: Creating chart with counters:', counters);
            
            const chartData = this.formatChartData(counters);
            
            const config = {
                type: 'bar',
                data: chartData,
                options: {
                    indexAxis: 'y', // Horizontal bar chart
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 200 // Reduced from 300ms for faster rendering
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            enabled: true,
                            mode: 'nearest',
                            intersect: true,
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.x;
                                    return `${label}: ${value}??;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                maxTicksLimit: 10 // Limit number of ticks for performance
                            },
                            title: {
                                display: true,
                                text: '?üÏàò'
                            }
                        },
                        y: {
                            ticks: {
                                autoSkip: false
                            }
                        }
                    },
                    // Disable unnecessary interactions for better performance
                    interaction: {
                        mode: 'nearest',
                        intersect: true
                    }
                }
            };
            
            const chart = new Chart(canvas, config);
            // console.log('ChartManager.createChart: Chart created successfully');
            return chart;
        } catch (error) {
            console.error('ChartManager.createChart error:', {
                error: error.message,
                stack: error.stack,
                counters: counters
            });
            throw new Error('Ï∞®Ìä∏Î•??ùÏÑ±?????ÜÏäµ?àÎã§');
        }
    },
    
    /**
     * Updates an existing chart with new data without recreating it
     * @param {Chart} chart - Existing Chart.js instance
     * @param {object} counters - New counter data object
     */
    updateChart(chart, counters) {
        if (!chart) {
            const error = new Error('ChartManager.updateChart: chart instance is required');
            console.error('ChartManager.updateChart error:', error);
            throw error;
        }
        
        if (!counters || typeof counters !== 'object') {
            counters = {};
        }
        
        try {
            // console.log('ChartManager.updateChart: Updating chart with new counters:', counters);
            
            // Format new data
            const newData = this.formatChartData(counters);
            
            // Update chart data
            chart.data.labels = newData.labels;
            chart.data.datasets = newData.datasets;
            
            // Trigger chart update with reduced animation for better performance
            chart.update('none'); // Use 'none' mode for instant update without animation
            
            // console.log('ChartManager.updateChart: Chart updated successfully');
        } catch (error) {
            console.error('ChartManager.updateChart error:', {
                error: error.message,
                stack: error.stack,
                counters: counters
            });
            throw new Error('Ï∞®Ìä∏Î•??ÖÎç∞?¥Ìä∏?????ÜÏäµ?àÎã§');
        }
    },
    
    /**
     * Destroys a chart instance and cleans up resources
     * @param {Chart} chart - Chart.js instance to destroy
     */
    destroyChart(chart) {
        if (!chart) {
            console.warn('ChartManager.destroyChart: no chart instance provided');
            return;
        }
        
        try {
            chart.destroy();
        } catch (error) {
            console.error('ChartManager.destroyChart error:', error);
        }
    },
    
    /**
     * Creates a new Chart.js vertical bar chart for monthly trend data
     * @param {HTMLCanvasElement} canvas - Canvas element to render chart on
     * @param {object} trendData - Trend data object with months array and counts array
     * @returns {Chart} - Chart.js instance
     */
    createMonthlyTrendChart(canvas, trendData) {
        if (!canvas) {
            const error = new Error('ChartManager.createMonthlyTrendChart: canvas element is required');
            console.error('ChartManager.createMonthlyTrendChart error:', error);
            throw error;
        }
        
        if (typeof Chart === 'undefined') {
            const error = new Error('ChartManager.createMonthlyTrendChart: Chart.js library not loaded');
            console.error('ChartManager.createMonthlyTrendChart error:', error);
            throw error;
        }
        
        if (!trendData || !trendData.months || !trendData.counts) {
            const error = new Error('ChartManager.createMonthlyTrendChart: trendData must contain months and counts arrays');
            console.error('ChartManager.createMonthlyTrendChart error:', error);
            throw error;
        }
        
        try {
            // console.log('ChartManager.createMonthlyTrendChart: Creating monthly trend chart with data:', trendData);
            
            const config = {
                type: 'bar',
                data: {
                    labels: trendData.months,
                    datasets: [{
                        label: '?îÎ≥Ñ Ï¶ùÍ? ?üÏàò',
                        data: trendData.counts,
                        backgroundColor: 'rgba(37, 99, 235, 0.5)', // Semi-transparent blue
                        borderColor: 'rgba(37, 99, 235, 0.8)',
                        borderWidth: 2,
                        borderRadius: Number.MAX_VALUE, // Fully rounded bars
                        borderSkipped: false // Apply border radius to all corners
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 300 // 300ms animation as specified
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed.y;
                                    return `Ï¶ùÍ? ?üÏàò: ${value}??;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '??
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                maxTicksLimit: 10
                            },
                            title: {
                                display: true,
                                text: 'Ï¶ùÍ? ?üÏàò'
                            }
                        }
                    }
                }
            };
            
            const chart = new Chart(canvas, config);
            // console.log('ChartManager.createMonthlyTrendChart: Monthly trend chart created successfully');
            return chart;
        } catch (error) {
            console.error('ChartManager.createMonthlyTrendChart error:', {
                error: error.message,
                stack: error.stack,
                trendData: trendData
            });
            throw new Error('?îÎ≥Ñ Ï∂îÏÑ∏ Ï∞®Ìä∏Î•??ùÏÑ±?????ÜÏäµ?àÎã§');
        }
    },
    
    /**
     * Creates a line chart for category trend data (without legend)
     * @param {HTMLCanvasElement} canvas - Canvas element to render chart on
     * @param {string} categoryId - Category ID (categoryA, categoryB, etc.)
     * @param {object} trendData - Trend data object with months array and counts array
     * @returns {Chart} - Chart.js instance
     */
    createCategoryTrendChart(canvas, categoryId, trendData) {
        if (!canvas) {
            const error = new Error('ChartManager.createCategoryTrendChart: canvas element is required');
            console.error('ChartManager.createCategoryTrendChart error:', error);
            throw error;
        }
        
        if (typeof Chart === 'undefined') {
            const error = new Error('ChartManager.createCategoryTrendChart: Chart.js library not loaded');
            console.error('ChartManager.createCategoryTrendChart error:', error);
            throw error;
        }
        
        if (!trendData || !trendData.months || !trendData.counts) {
            const error = new Error('ChartManager.createCategoryTrendChart: trendData must contain months and counts arrays');
            console.error('ChartManager.createCategoryTrendChart error:', error);
            throw error;
        }
        
        try {
            // console.log(`ChartManager.createCategoryTrendChart: Creating ${categoryId} trend chart with data:`, trendData);
            
            const config = {
                type: 'line',
                data: {
                    labels: trendData.months,
                    datasets: [{
                        label: '?îÎ≥Ñ Ï¶ùÍ? ?üÏàò',
                        data: trendData.counts,
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4, // Smooth curve
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0 // Disable animation to prevent requestAnimationFrame warnings
                    },
                    plugins: {
                        legend: {
                            display: false // Hide legend as requested
                        },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed.y;
                                    return `Ï¶ùÍ? ?üÏàò: ${value}??;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: false
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                                font: {
                                    size: 10
                                }
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                maxTicksLimit: 6,
                                font: {
                                    size: 10
                                }
                            },
                            title: {
                                display: false
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        }
                    }
                }
            };
            
            const chart = new Chart(canvas, config);
            // console.log(`ChartManager.createCategoryTrendChart: ${categoryId} trend chart created successfully`);
            return chart;
        } catch (error) {
            console.error('ChartManager.createCategoryTrendChart error:', {
                error: error.message,
                stack: error.stack,
                categoryId: categoryId,
                trendData: trendData
            });
            throw new Error('Ïπ¥ÌÖåÍ≥†Î¶¨ Ï∂îÏÑ∏ Ï∞®Ìä∏Î•??ùÏÑ±?????ÜÏäµ?àÎã§');
        }
    },

    /**
     * Updates an existing monthly trend chart with new data
     * @param {Chart} chart - Existing Chart.js instance
     * @param {object} trendData - New trend data object with months array and counts array
     */
    updateMonthlyTrendChart(chart, trendData) {
        if (!chart) {
            const error = new Error('ChartManager.updateMonthlyTrendChart: chart instance is required');
            console.error('ChartManager.updateMonthlyTrendChart error:', error);
            throw error;
        }
        
        if (!trendData || !trendData.months || !trendData.counts) {
            const error = new Error('ChartManager.updateMonthlyTrendChart: trendData must contain months and counts arrays');
            console.error('ChartManager.updateMonthlyTrendChart error:', error);
            throw error;
        }
        
        try {
            // console.log('ChartManager.updateMonthlyTrendChart: Updating monthly trend chart with new data:', trendData);
            
            // Update chart data
            chart.data.labels = trendData.months;
            chart.data.datasets[0].data = trendData.counts;
            
            // Trigger chart update with animation
            chart.update();
            
            // console.log('ChartManager.updateMonthlyTrendChart: Monthly trend chart updated successfully');
        } catch (error) {
            console.error('ChartManager.updateMonthlyTrendChart error:', {
                error: error.message,
                stack: error.stack,
                trendData: trendData
            });
            throw new Error('?îÎ≥Ñ Ï∂îÏÑ∏ Ï∞®Ìä∏Î•??ÖÎç∞?¥Ìä∏?????ÜÏäµ?àÎã§');
        }
    },
    
    /**
     * Creates a category-specific bar chart
     * @param {HTMLCanvasElement} canvas - Canvas element to render chart on
     * @param {string} categoryId - Category ID (categoryA, categoryB, categoryC, categoryD)
     * @param {object} counters - Counter data object
     * @param {string} period - Time period (today, week, month, year, total)
     * @returns {Chart} - Chart.js instance
     */
    createCategoryChart(canvas, categoryId, counters, period = 'total') {
        if (!canvas) {
            throw new Error('ChartManager.createCategoryChart: canvas element is required');
        }
        
        if (!CATEGORIES[categoryId]) {
            throw new Error(`ChartManager.createCategoryChart: Invalid category ID: ${categoryId}`);
        }
        
        const category = CATEGORIES[categoryId];
        const labels = category.labels;
        const keys = category.keys;
        
        // Extract data for this category
        const data = keys.map(key => counters[key] || 0);
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `${category.name} (${this.getPeriodLabel(period)})`,
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.x}??;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        };
        
        return new Chart(canvas, config);
    },
    
    /**
     * Updates a category chart with new data
     * @param {Chart} chart - Existing Chart.js instance
     * @param {string} categoryId - Category ID
     * @param {object} counters - Counter data object
     * @param {string} period - Time period
     */
    updateCategoryChart(chart, categoryId, counters, period = 'total') {
        if (!chart || !CATEGORIES[categoryId]) {
            return;
        }
        
        const category = CATEGORIES[categoryId];
        const keys = category.keys;
        const data = keys.map(key => counters[key] || 0);
        
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].label = `${category.name} (${this.getPeriodLabel(period)})`;
        chart.update();
    },
    
    /**
     * Gets Korean label for period
     * @param {string} period - Period identifier
     * @returns {string} - Korean label
     */
    getPeriodLabel(period) {
        const labels = {
            today: '?§Îäò',
            week: '?¥Î≤àÏ£?,
            month: '?¥Î≤à??,
            year: '?¨Ìï¥',
            total: '???'
        };
        return labels[period] || '???';
    },
    
    /**
     * Creates a doughnut chart for category
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} categoryId - Category ID
     * @param {object} counters - Counter data
     * @param {string} period - Time period
     * @returns {Chart} - Chart.js instance
     */
    createDoughnutChart(canvas, categoryId, counters, period = 'total') {
        if (!canvas || !CATEGORIES[categoryId]) {
            return null;
        }
        
        const category = CATEGORIES[categoryId];
        const labels = category.labels;
        const keys = category.keys;
        const data = keys.map(key => counters[key] || 0);
        
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
            '#9b59b6', '#1abc9c', '#34495e'
        ];
        
        const config = {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.map(c => c + 'DD'),
                    borderColor: '#fff',
                    borderWidth: 3,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { padding: 15, font: { size: 12 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}??;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        };
        
        return new Chart(canvas, config);
    },
    
    /**
     * Creates a Chart.js rounded horizontal bar chart
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} categoryId - Category ID
     * @param {object} counters - Counter data
     * @param {string} period - Time period
     * @returns {Chart} - Chart.js instance
     */
    createRoundedBarChart(canvas, categoryId, counters, period = 'total') {
        if (!canvas || !CATEGORIES[categoryId]) {
            console.error('Canvas or category not found');
            return null;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js library not loaded');
            return null;
        }
        
        const category = CATEGORIES[categoryId];
        const labels = category.labels;
        const keys = category.keys;
        const data = keys.map(key => counters[key] || 0);
        
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
            '#9b59b6', '#1abc9c', '#34495e'
        ];
        
        const ctx = canvas.getContext('2d');
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Î©îÏãúÏßÄ ??,
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1,
                    borderRadius: 10,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.x + '??;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f1f1',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeInOutQuart'
                }
            }
        });
        
        return chart;
    },
    
    /**
     * Toggles between doughnut and bar chart for a category
     * @param {string} categoryId - Category ID
     */
    toggleChartType(categoryId) {
        // console.log('Toggling chart type for:', categoryId);
        
        const canvas = document.getElementById(`${categoryId}Chart`);
        
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }
        
        const chartKey = `${categoryId}ChartInstance`;
        const typeKey = `${categoryId}ChartType`;
        
        // Get current chart type (default is 'doughnut')
        const currentType = window[typeKey] || 'doughnut';
        const newType = currentType === 'doughnut' ? 'bar' : 'doughnut';
        
        // console.log('Current type:', currentType, 'New type:', newType);
        
        // Get counters from cached data
        const counters = window.currentCounters || {};
        
        // console.log('Using counters:', counters);
        
        // Destroy existing Chart.js instance first
        if (window[chartKey]) {
            window[chartKey].destroy();
            window[chartKey] = null;
        }
        
        if (newType === 'bar') {
            // Switch to Chart.js rounded horizontal bar
            // console.log('Switching to bar chart');
            window[chartKey] = this.createRoundedBarChart(canvas, categoryId, counters);
        } else {
            // Switch to Chart.js doughnut
            // console.log('Switching to doughnut chart');
            window[chartKey] = this.createDoughnutChart(canvas, categoryId, counters);
        }
        
        // Store new chart type
        window[typeKey] = newType;
        // console.log('Chart toggle complete');
    }
};

// Make ChartManager globally accessible
window.ChartManager = ChartManager;

// ============================================================================
// UI Controller Module
// ============================================================================
const UIController = {
    // Debounce timer for search input validation
    searchDebounceTimer: null,
    
    /**
     * Shows the loading indicator
     */
    showLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    },
    
    /**
     * Hides the loading indicator
     */
    hideLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    },
    
    /**
     * Shows a toast notification to the user
     * @param {string} message - Message to display
     * @param {string} type - Notification type: 'success', 'error', 'info'
     */
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) {
            console.warn('UIController.showNotification: notification element not found');
            return;
        }
        
        // Set message
        notification.textContent = message;
        
        // Set type class
        notification.className = 'notification';
        notification.classList.add(`notification-${type}`);
        
        // Show notification
        notification.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    },
    
    /**
     * Renders plate results including chart and counter displays
     * @param {string} plateNumber - Plate number to display
     * @param {object} plateData - Plate data object with counters
     * @param {object} monthlyTrendData - Monthly trend data with months and counts arrays
     */
    renderPlateResults(plateNumber, plateData, monthlyTrendData) {
        if (!plateNumber || !plateData) {
            console.error('UIController.renderPlateResults: plateNumber and plateData are required');
            return;
        }
        
        // console.log('UIController.renderPlateResults: Rendering results for', plateNumber);
        
        // Update plate number header
        const plateNumberElement = document.getElementById('plateNumber');
        if (plateNumberElement) {
            plateNumberElement.textContent = plateNumber;
        }
        
        // Update vehicle emoji
        const plateEmojiElement = document.getElementById('plateEmoji');
        // console.log('UIController.renderPlateResults: plateEmojiElement found:', !!plateEmojiElement);
        if (plateEmojiElement) {
            try {
                const emoji = getVehicleEmoji(plateNumber);
                // console.log('UIController.renderPlateResults: Setting emoji', emoji, 'for plate', plateNumber);
                plateEmojiElement.textContent = emoji;
                // console.log('UIController.renderPlateResults: Emoji set successfully, current value:', plateEmojiElement.textContent);
            } catch (emojiError) {
                console.error('UIController.renderPlateResults: Error getting/setting emoji:', emojiError);
                plateEmojiElement.textContent = '?öó'; // Fallback
            }
        } else {
            console.warn('UIController.renderPlateResults: plateEmoji element not found');
        }
        
        // Update stats row (likes, messages, views)
        this.updateStatsRow(plateData);
        
        // Update Care Index (all-time)
        this.updateCareIndex(plateData);
        
        // Render rating badges (90-day data)
        this.renderRatingBadges(plateNumber, plateData);
        
        // Update weekly chart with date-based data
        this.updateWeeklyChart(plateNumber);
        
        // Update all counter displays
        const counters = plateData.counters || {};
        this.updateAllCounterDisplays(counters);
        
        // Create or update chart with graceful degradation
        const canvas = document.getElementById('plateChart');
        if (canvas) {
            try {
                // Check if chart already exists
                if (window.plateChartInstance) {
                    // Update existing chart
                    ChartManager.updateChart(window.plateChartInstance, counters);
                } else {
                    // Create new chart
                    window.plateChartInstance = ChartManager.createChart(canvas, counters);
                }
            } catch (error) {
                console.error('UIController.renderPlateResults: Chart rendering failed:', {
                    error: error.message,
                    stack: error.stack,
                    plateNumber: plateNumber
                });
                
                // Graceful degradation - hide chart canvas and show only counter displays
                canvas.style.display = 'none';
                
                // Show notification to user
                this.showNotification('Ï∞®Ìä∏Î•??úÏãú?????ÜÏäµ?àÎã§. ?´Ïûê ?ïÎ≥¥???ïÏÉÅ?ÅÏúºÎ°??úÏãú?©Îãà??, 'info');
                
                // Ensure counter displays are visible and working
                // console.log('UIController.renderPlateResults: Falling back to counter displays only');
            }
        }
        
        // Create or update monthly trend chart with graceful degradation
        const monthlyCanvas = document.getElementById('monthlyTrendChart');
        if (monthlyCanvas && monthlyTrendData) {
            try {
                // Check if monthly trend chart already exists
                if (window.monthlyTrendChartInstance) {
                    // Update existing chart
                    ChartManager.updateMonthlyTrendChart(window.monthlyTrendChartInstance, monthlyTrendData);
                } else {
                    // Create new chart
                    window.monthlyTrendChartInstance = ChartManager.createMonthlyTrendChart(monthlyCanvas, monthlyTrendData);
                }
                // console.log('UIController.renderPlateResults: Monthly trend chart rendered successfully');
            } catch (error) {
                console.error('UIController.renderPlateResults: Monthly trend chart rendering failed:', {
                    error: error.message,
                    stack: error.stack,
                    plateNumber: plateNumber
                });
                
                // Graceful degradation - hide monthly trend chart canvas
                monthlyCanvas.style.display = 'none';
                
                // Show notification to user
                this.showNotification('?îÎ≥Ñ Ï∂îÏÑ∏ Ï∞®Ìä∏Î•??úÏãú?????ÜÏäµ?àÎã§', 'info');
                
                // console.log('UIController.renderPlateResults: Falling back without monthly trend chart');
            }
        } else if (monthlyCanvas && !monthlyTrendData) {
            // If no monthly trend data provided, create zero-state
            // console.log('UIController.renderPlateResults: No monthly trend data provided, using zero-state');
            try {
                const zeroMonthlyTrend = {
                    months: MonthlyTrendTracker.getLast12Months(),
                    counts: new Array(12).fill(0)
                };
                
                if (window.monthlyTrendChartInstance) {
                    ChartManager.updateMonthlyTrendChart(window.monthlyTrendChartInstance, zeroMonthlyTrend);
                } else {
                    window.monthlyTrendChartInstance = ChartManager.createMonthlyTrendChart(monthlyCanvas, zeroMonthlyTrend);
                }
            } catch (error) {
                console.error('UIController.renderPlateResults: Failed to render zero-state monthly trend chart:', error);
                monthlyCanvas.style.display = 'none';
            }
        }
        
        // Initialize category charts and trend charts
        this.initializeCategoryCharts(counters, plateNumber);
    },
    
    /**
     * Initializes all category charts and trend charts
     * @param {object} counters - Counter data object
     * @param {string} plateNumber - Plate number for fetching trend data
     */
    async initializeCategoryCharts(counters, plateNumber) {
        const categories = ['categoryA', 'categoryB', 'categoryC', 'categoryD'];
        
        // console.log('?é® Initializing category charts for:', categories);
        
        categories.forEach(categoryId => {
            const canvasId = `${categoryId}Chart`;
            const canvas = document.getElementById(canvasId);
            
            // console.log(`Checking ${categoryId}: canvas exists =`, !!canvas);
            
            if (canvas) {
                try {
                    const chartKey = `${categoryId}ChartInstance`;
                    const typeKey = `${categoryId}ChartType`;
                    
                    // Initialize with doughnut chart by default
                    if (!window[typeKey]) {
                        window[typeKey] = 'doughnut';
                    }
                    
                    if (window[chartKey]) {
                        // Update existing chart
                        // console.log(`Updating existing ${categoryId} chart`);
                        ChartManager.updateCategoryChart(window[chartKey], categoryId, counters, 'total');
                    } else {
                        // Create new doughnut chart
                        // console.log(`Creating new ${categoryId} doughnut chart`);
                        window[chartKey] = ChartManager.createDoughnutChart(canvas, categoryId, counters, 'total');
                        // console.log(`??${chartKey} created:`, !!window[chartKey]);
                    }
                    
                    // Store counters for chart toggle
                    window.currentCounters = counters;
                } catch (error) {
                    console.error(`??Failed to render ${categoryId} chart:`, error);
                    canvas.style.display = 'none';
                }
            } else {
                console.warn(`?†Ô∏è Canvas not found for ${categoryId}`);
            }
        });
        
        // Initialize category trend charts
        if (plateNumber) {
            await this.initializeCategoryTrendCharts(plateNumber);
        }
    },

    /**
     * Initializes all category trend charts with monthly data
     * @param {string} plateNumber - Plate number
     */
    async initializeCategoryTrendCharts(plateNumber) {
        const categories = ['categoryA', 'categoryB', 'categoryC', 'categoryD'];
        
        for (const categoryId of categories) {
            const trendCanvasId = `${categoryId}TrendChart`;
            const trendCanvas = document.getElementById(trendCanvasId);
            
            if (trendCanvas) {
                try {
                    // Fetch category-specific trend data
                    const trendData = await this.fetchCategoryTrendData(plateNumber, categoryId);
                    
                    const trendChartKey = `${categoryId}TrendChartInstance`;
                    
                    if (window[trendChartKey]) {
                        // Update existing chart
                        window[trendChartKey].data.labels = trendData.months;
                        window[trendChartKey].data.datasets[0].data = trendData.counts;
                        window[trendChartKey].update();
                    } else {
                        // Create new line chart without legend
                        window[trendChartKey] = ChartManager.createCategoryTrendChart(trendCanvas, categoryId, trendData);
                    }
                    
                    // console.log(`${categoryId} trend chart initialized successfully`);
                } catch (error) {
                    console.error(`Failed to render ${categoryId} trend chart:`, error);
                    trendCanvas.style.display = 'none';
                }
            }
        }
    },

    /**
     * Fetches category-specific monthly trend data from Firebase
     * @param {string} plateNumber - Plate number
     * @param {string} categoryId - Category ID (categoryA, categoryB, etc.)
     * @returns {object} - Trend data with months and counts arrays
     */
    async fetchCategoryTrendData(plateNumber, categoryId) {
        try {
            const category = CATEGORIES[categoryId];
            if (!category || !category.keys) {
                throw new Error(`Invalid category: ${categoryId}`);
            }
            
            // Use MonthlyTrendTracker to get aggregated data for this category's counter keys
            const trendData = await MonthlyTrendTracker.getAggregatedCategoryTrends(plateNumber, category.keys);
            
            return trendData;
        } catch (error) {
            console.error(`Failed to fetch category trend data for ${categoryId}:`, error);
            // Return zero data as fallback
            return {
                months: MonthlyTrendTracker.getLast12Months(),
                counts: new Array(12).fill(0)
            };
        }
    },
    
    /**
     * Updates a specific category chart based on period selection
     * @param {string} categoryId - Category ID (categoryA, categoryB, etc.)
     * @param {string} period - Time period (today, week, month, year, total)
     */
    async updateCategoryChart(categoryId, period) {
        // console.log(`?îÑ UIController.updateCategoryChart called: ${categoryId}, period: ${period}`);
        
        const chartKey = `${categoryId}ChartInstance`;
        // console.log(`Looking for chart instance: ${chartKey}`);
        // console.log(`Chart instance exists:`, !!window[chartKey]);
        
        if (!window[chartKey]) {
            console.error(`??Chart instance not found: ${chartKey}`);
            // console.log('Available window properties:', Object.keys(window).filter(k => k.includes('Chart')));
            return;
        }
        
        // Get current plate number
        const plateNumber = Router.getCurrentPlate();
        if (!plateNumber) {
            console.error('??No plate number found');
            return;
        }
        
        // console.log(`?ìç Plate number: ${plateNumber}`);
        
        try {
            // Fetch period-specific data
            // console.log(`?ì• Fetching data for period: ${period}...`);
            const counters = await this.fetchPeriodData(plateNumber, period);
            // console.log(`?ìä Fetched counters:`, counters);
            
            // Update the chart with new data
            const chart = window[chartKey];
            const category = CATEGORIES[categoryId];
            
            // console.log(`?é® Updating chart with ChartManager...`);
            ChartManager.updateCategoryChart(chart, categoryId, counters, period);
            
            // console.log(`??Chart updated successfully for ${categoryId} - ${period}`);
        } catch (error) {
            console.error(`??Error updating chart for ${categoryId}:`, error);
            console.error('Error stack:', error.stack);
        }
    },
    
    /**
     * Fetches counter data for a specific period
     * @param {string} plateNumber - Plate number
     * @param {string} period - Time period (today, week, month, year, total)
     * @returns {Promise<object>} - Counter data object
     */
    async fetchPeriodData(plateNumber, period) {
        // console.log(`Fetching period data for ${plateNumber}, period: ${period}`);
        
        const kstNow = DailyLimitManager.getKSTDate();
        const counters = {};
        
        // Get all counter keys from all categories
        const allCounterKeys = new Set();
        Object.values(CATEGORIES).forEach(category => {
            // Skip grouped categories (thanks, safety) which are arrays
            if (Array.isArray(category)) {
                return;
            }
            // Use 'keys' property, not 'counters'
            if (category.keys) {
                category.keys.forEach(key => allCounterKeys.add(key));
            }
        });
        
        if (period === 'total') {
            // Fetch total counters
            const snapshot = await firebase.database().ref(`plates/${plateNumber}/counters`).once('value');
            const data = snapshot.val() || {};
            allCounterKeys.forEach(key => {
                counters[key] = data[key] || 0;
            });
        } else if (period === 'today') {
            // Fetch today's data
            const todayStr = this.getDateString(kstNow);
            const snapshot = await firebase.database().ref(`plates/${plateNumber}/daily/${todayStr}`).once('value');
            const data = snapshot.val() || {};
            allCounterKeys.forEach(key => {
                counters[key] = data[key] || 0;
            });
        } else if (period === 'week') {
            // Fetch this week's data (sum last 7 days)
            for (let i = 0; i < 7; i++) {
                const date = new Date(kstNow);
                date.setDate(date.getDate() - i);
                const dateStr = this.getDateString(date);
                const snapshot = await firebase.database().ref(`plates/${plateNumber}/daily/${dateStr}`).once('value');
                const data = snapshot.val() || {};
                allCounterKeys.forEach(key => {
                    counters[key] = (counters[key] || 0) + (data[key] || 0);
                });
            }
        } else if (period === 'month') {
            // Fetch this month's data
            const monthStr = this.getMonthString(kstNow);
            const snapshot = await firebase.database().ref(`plates/${plateNumber}/monthly/${monthStr}`).once('value');
            const data = snapshot.val() || {};
            allCounterKeys.forEach(key => {
                counters[key] = data[key] || 0;
            });
        } else if (period === 'year') {
            // Fetch this year's data (sum all months in current year)
            const year = kstNow.getFullYear();
            for (let month = 1; month <= 12; month++) {
                const monthStr = `${year}${String(month).padStart(2, '0')}`;
                const snapshot = await firebase.database().ref(`plates/${plateNumber}/monthly/${monthStr}`).once('value');
                const data = snapshot.val() || {};
                allCounterKeys.forEach(key => {
                    counters[key] = (counters[key] || 0) + (data[key] || 0);
                });
            }
        }
        
        // console.log(`Fetched counters for ${period}:`, counters);
        return counters;
    },
    
    /**
     * Gets date string in YYYYMMDD format
     * @param {Date} date - Date object
     * @returns {string} - Date string
     */
    getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },
    
    /**
     * Gets month string in YYYYMM format
     * @param {Date} date - Date object
     * @returns {string} - Month string
     */
    getMonthString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}${month}`;
    },
    
    /**
     * Updates stats-row-section values (likes, messages, views)
     * @param {object} plateData - Plate data object containing counters and stats
     */
    updateStatsRow(plateData) {
        if (!plateData) return;
        
        const counters = plateData.counters || {};
        
        // Update like count
        const likeCountElement = document.getElementById('likeCount');
        if (likeCountElement) {
            const likeCount = counters.likes || 0;
            likeCountElement.textContent = likeCount >= 1000 ? (likeCount / 1000).toFixed(1) + 'K' : likeCount;
        }
        
        // Calculate total message count (all categories except likes)
        let totalMessages = 0;
        Object.keys(counters).forEach(key => {
            if (key !== 'likes') {
                totalMessages += counters[key] || 0;
            }
        });
        
        const messageCountElement = document.getElementById('messageCount');
        if (messageCountElement) {
            messageCountElement.textContent = totalMessages >= 1000 ? (totalMessages / 1000).toFixed(1) + 'K' : totalMessages;
        }
        
        // Update view count (always use plateData.views)
        const viewCountElement = document.getElementById('viewCount');
        if (viewCountElement) {
            const viewCount = plateData.views || 0;
            viewCountElement.textContent = viewCount >= 1000 ? (viewCount / 1000).toFixed(1) + 'K' : viewCount;
        }
    },

    /**
     * Updates the Care Index card (all-time data)
     * @param {object} plateData - Plate data object containing counters and views
     */
    updateCareIndex(plateData) {
        if (!plateData) return;
        
        const counters = plateData.counters || {};
        const views = plateData.views || 0;
        
        // Calculate total messages (all categories except likes)
        let totalMessages = 0;
        Object.keys(counters).forEach(key => {
            if (key !== 'likes') {
                totalMessages += counters[key] || 0;
            }
        });
        
        const likes = counters.likes || 0;
        const interactionCount = totalMessages + likes;
        
        // Update Care Index value
        const careIndexValueElement = document.getElementById('careIndexValue');
        const careIndexMetaElement = document.getElementById('careIndexMeta');
        
        if (careIndexValueElement && careIndexMetaElement) {
            if (views < 1 || interactionCount === 0) {
                // Not enough data
                careIndexValueElement.textContent = '-';
                careIndexMetaElement.textContent = '?ÑÏßÅ ?∞Ïù¥?∞Í? Î∂ÄÏ°±Ìï©?àÎã§';
            } else {
                const ratio = interactionCount / views;
                const percent = Math.round(ratio * 100);
                const capped = Math.min(percent, 100); // Cap at 100%
                
                careIndexValueElement.textContent = `${capped}%`;
                careIndexMetaElement.textContent = `Ï°∞Ìöå ${views}??Ï§?${interactionCount}??Î∞òÏùë`;
            }
        }
    },

    /**
     * Fetches 90-day counter data for a plate
     * @param {string} plateNumber - Plate number
     * @returns {Promise<object>} - Object with 90-day counter totals
     */
    async get90DayCounters(plateNumber) {
        if (!plateNumber) {
            console.error('UIController.get90DayCounters: plateNumber is required');
            return {};
        }
        
        try {
            const today = DailyLimitManager.getKSTDate();
            const counters90d = {};
            
            // Initialize all counter keys to 0
            Object.values(COUNTER_KEYS).forEach(key => {
                counters90d[key] = 0;
            });
            
            // Create array of promises for parallel fetching
            const fetchPromises = [];
            
            for (let i = 0; i < 90; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = DailyLimitManager.formatDateKST(date);
                
                // Create promise for this day's data
                const promise = database.ref(`plates/${plateNumber}/daily/${dateStr}`)
                    .once('value')
                    .then(snapshot => {
                        const dailyData = snapshot.val();
                        if (dailyData) {
                            return dailyData;
                        }
                        return null;
                    })
                    .catch(error => {
                        console.warn(`Failed to fetch data for ${dateStr}:`, error);
                        return null;
                    });
                
                fetchPromises.push(promise);
            }
            
            // Fetch all days in parallel
            const results = await Promise.all(fetchPromises);
            
            // Aggregate results
            results.forEach(dailyData => {
                if (dailyData) {
                    Object.keys(dailyData).forEach(key => {
                        counters90d[key] = (counters90d[key] || 0) + (dailyData[key] || 0);
                    });
                }
            });
            
            return counters90d;
        } catch (error) {
            console.error('UIController.get90DayCounters error:', error);
            return {};
        }
    },

    /**
     * Renders rating badges based on last 90 days of data
     * @param {string} plateNumber - Plate number
     * @param {object} plateData - Plate data object (for all-time views)
     */
    async renderRatingBadges(plateNumber, plateData) {
        if (!plateNumber || !plateData) {
            // console.log('renderRatingBadges: Missing plateNumber or plateData');
            return;
        }
        
        const container = document.getElementById('ratingBadges');
        if (!container) {
            console.warn('renderRatingBadges: Container #ratingBadges not found');
            return;
        }
        
        // console.log('renderRatingBadges: Starting for plate', plateNumber);
        
        // Show loading indicator
        container.textContent = '';
        const loadingSpan = document.createElement('span');
        loadingSpan.className = 'pro-badge-pill';
        loadingSpan.style.opacity = '0.6';
        loadingSpan.textContent = '??Î∞∞Ï? Í≥ÑÏÇ∞ Ï§?..';
        container.appendChild(loadingSpan);
        
        try {
            // Get 90-day counters with performance timing
            const startTime = performance.now();
            const counters90d = await this.get90DayCounters(plateNumber);
            const endTime = performance.now();
            // console.log(`renderRatingBadges: Fetched 90-day data in ${Math.round(endTime - startTime)}ms`);
            // console.log('renderRatingBadges: 90-day counters:', counters90d);
            
            // Calculate 90-day totals by category
            let warningCount_90d = 0;
            let conditionCount_90d = 0;
            let thanksCount_90d = 0;
            let likesCount_90d = counters90d.likes || 0;
            let totalMessages_90d = 0;
            
            // Sum up category A + B (warnings)
            if (CATEGORIES.categoryA && CATEGORIES.categoryA.keys) {
                CATEGORIES.categoryA.keys.forEach(key => {
                    warningCount_90d += counters90d[key] || 0;
                });
            }
            if (CATEGORIES.categoryB && CATEGORIES.categoryB.keys) {
                CATEGORIES.categoryB.keys.forEach(key => {
                    warningCount_90d += counters90d[key] || 0;
                });
            }
            
            // Sum up category C (condition)
            if (CATEGORIES.categoryC && CATEGORIES.categoryC.keys) {
                CATEGORIES.categoryC.keys.forEach(key => {
                    conditionCount_90d += counters90d[key] || 0;
                });
            }
            
            // Sum up category D (thanks/praise)
            if (CATEGORIES.categoryD && CATEGORIES.categoryD.keys) {
                CATEGORIES.categoryD.keys.forEach(key => {
                    thanksCount_90d += counters90d[key] || 0;
                });
            }
            
            // Add motorbike categories if applicable
            const vehicleType = getVehicleType(plateNumber);
            if (vehicleType === 'motorbike') {
                // Add motorbike safety to warnings
                if (CATEGORIES.mbSafety && CATEGORIES.mbSafety.keys) {
                    CATEGORIES.mbSafety.keys.forEach(key => {
                        warningCount_90d += counters90d[key] || 0;
                    });
                }
                
                // Add motorbike vehicle to condition
                if (CATEGORIES.mbVehicle && CATEGORIES.mbVehicle.keys) {
                    CATEGORIES.mbVehicle.keys.forEach(key => {
                        conditionCount_90d += counters90d[key] || 0;
                    });
                }
                
                // Add motorbike praise and support to thanks
                if (CATEGORIES.mbPraise && CATEGORIES.mbPraise.keys) {
                    CATEGORIES.mbPraise.keys.forEach(key => {
                        thanksCount_90d += counters90d[key] || 0;
                    });
                }
                if (CATEGORIES.mbSupport && CATEGORIES.mbSupport.keys) {
                    CATEGORIES.mbSupport.keys.forEach(key => {
                        thanksCount_90d += counters90d[key] || 0;
                    });
                }
            }
            
            // Calculate total messages (exclude likes)
            Object.keys(counters90d).forEach(key => {
                if (key !== 'likes') {
                    totalMessages_90d += counters90d[key] || 0;
                }
            });
            
            const interactionCount_90d = totalMessages_90d + likesCount_90d;
            const views = plateData.views || 0; // Use all-time views
            
            // console.log('renderRatingBadges: 90-day stats:', {
                warningCount_90d,
                conditionCount_90d,
                thanksCount_90d,
                likesCount_90d,
                totalMessages_90d,
                interactionCount_90d,
                views
            });
            
            const badges = [];
            
            // Badge 1: High care index (recent focus)
            if (views >= 10 && interactionCount_90d / views >= 0.2) {
                badges.push('?íñ ÎßéÏù¥ ?†Í≤Ω ??Ï§Ä Î≤àÌò∏??);
            }
            
            // Badge 2: Praise-heavy
            if (thanksCount_90d >= 3 && thanksCount_90d >= warningCount_90d) {
                badges.push('‚≠?Ïπ?∞¨??ÎßéÏù¥ ?ìÏù∏ Î≤àÌò∏??);
            }
            
            // Badge 3: Frequent warning
            if (warningCount_90d >= 3) {
                badges.push('?†Ô∏è ?¨Îü¨ Î≤?Í±±Ï†ï??Î≤àÌò∏??);
            }
            
            // Badge 4: Maintenance alert
            if (conditionCount_90d >= 3) {
                badges.push('?îß ?ïÎπÑ ?åÎ¶º???¨Îü¨ Î≤??àÏóà??Î≤àÌò∏??);
            }
            
            // console.log('renderRatingBadges: Badges earned:', badges);
            
            // Clear loading indicator
            container.textContent = '';
            
            // Limit to 3 badges
            badges.slice(0, 3).forEach(label => {
                const span = document.createElement('span');
                span.className = 'pro-badge-pill';
                span.textContent = label;
                container.appendChild(span);
            });
            
            if (badges.length === 0) {
                // console.log('renderRatingBadges: No badges earned (insufficient 90-day data)');
            } else {
                // console.log(`renderRatingBadges: Successfully rendered ${badges.length} badge(s)`);
            }
        } catch (error) {
            console.error('UIController.renderRatingBadges error:', error);
        }
    },

    /**
     * Fetches and updates weekly chart data from Firebase
     * @param {string} plateNumber - Plate number
     */
    async updateWeeklyChart(plateNumber) {
        try {
            // Get the last 7 days in KST
            const today = DailyLimitManager.getKSTDate();
            const currentDay = today.getDay(); // 0=sun, 1=mon, ..., 6=sat
            const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const weeklyCounts = new Array(7).fill(0);
            
            // Fetch daily data for the last 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = DailyLimitManager.formatDateKST(date); // YYYYMMDD format
                
                try {
                    const dailyRef = database.ref(`plates/${plateNumber}/daily/${dateStr}`);
                    const snapshot = await dailyRef.once('value');
                    const dailyData = snapshot.val();
                    
                    if (dailyData) {
                        // Sum all counter values for this day
                        let dayTotal = 0;
                        Object.keys(dailyData).forEach(key => {
                            dayTotal += dailyData[key] || 0;
                        });
                        
                        // Calculate the correct bar index (adjust to mon-sun order)
                        const barIndex = (currentDay - i + 7) % 7;
                        weeklyCounts[barIndex] = dayTotal;
                    }
                } catch (error) {
                    console.warn(`Failed to fetch data for ${dateStr}:`, error);
                }
            }
            
            // Update the chart bars
            const chartBars = document.getElementById('weeklyChartBars');
            if (chartBars) {
                const maxValue = Math.max(...weeklyCounts, 1); // Avoid division by zero
                
                dayNames.forEach((day, index) => {
                    const bar = chartBars.querySelector(`.chart-bar[data-day="${day}"]`);
                    if (bar) {
                        const value = weeklyCounts[index];
                        const percentage = (value / maxValue) * 100;
                        
                        // Update bar height
                        bar.style.height = `${percentage}%`;
                        bar.setAttribute('data-value', value);
                        
                        // Update tooltip
                        bar.title = `${value}Í∞?Î©îÏãúÏßÄ`;
                        
                        // Update value label if it exists
                        const valueLabel = bar.querySelector('.chart-bar-value');
                        if (valueLabel) {
                            valueLabel.textContent = value;
                            valueLabel.style.display = value > 0 ? 'block' : 'none';
                        }
                    }
                });
            }
            
            // console.log('Weekly chart updated:', weeklyCounts);
        } catch (error) {
            console.error('Failed to update weekly chart:', error);
        }
    },

    /**
     * Updates all counter button displays with current values
     * @param {object} counters - Counter data object
     */
    updateAllCounterDisplays(counters) {
        if (!counters || typeof counters !== 'object') {
            counters = {};
        }
        
        // Find all counter buttons
        const counterButtons = document.querySelectorAll('.counter-btn');
        
        counterButtons.forEach(button => {
            const counterKey = button.getAttribute('data-key');
            if (counterKey) {
                const value = counters[counterKey] || 0;
                this.updateCounterDisplay(counterKey, value);
            }
        });
    },
    
    /**
     * Updates a specific counter display value
     * @param {string} counterKey - Counter key to update
     * @param {number} value - New value to display
     */
    updateCounterDisplay(counterKey, value) {
        if (!counterKey) {
            console.error('UIController.updateCounterDisplay: counterKey is required');
            return;
        }
        
        // Find ALL buttons with this counter key (there may be multiple in different sections)
        const buttons = document.querySelectorAll(`.counter-btn[data-key="${counterKey}"]`);
        if (buttons.length === 0) {
            console.warn(`UIController.updateCounterDisplay: button not found for key ${counterKey}`);
            return;
        }
        
        // Update the count span in all matching buttons
        buttons.forEach(button => {
            const countSpan = button.querySelector('.count');
            if (countSpan) {
                countSpan.textContent = value || 0;
            }
        });
    },
    
    /**
     * Renders a leaderboard table
     * @param {string} type - Leaderboard type: 'bestDrivers' or 'mostLiked'
     * @param {string} period - Time period for the leaderboard
     * @param {array} data - Array of leaderboard entries
     */
    renderLeaderboard(type, period, data) {
        if (!type) {
            console.error('UIController.renderLeaderboard: type is required');
            return;
        }
        
        let tableBodyId;
        
        if (type === 'bestDrivers') {
            tableBodyId = 'bestDriverTable';
        } else if (type === 'mostLiked') {
            tableBodyId = 'mostLikedTable';
        } else {
            console.error('UIController.renderLeaderboard: invalid type', type);
            return;
        }
        
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) {
            console.warn(`UIController.renderLeaderboard: table body ${tableBodyId} not found`);
            return;
        }
        
        // Clear existing rows
        tableBody.textContent = '';
        
        // Check if data is empty
        if (!data || !Array.isArray(data) || data.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = type === 'bestDrivers' ? 5 : 3;
            emptyCell.textContent = '?∞Ïù¥?∞Í? ?ÜÏäµ?àÎã§';
            emptyCell.style.textAlign = 'center';
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // Populate table with data
        data.forEach(entry => {
            const row = document.createElement('tr');
            
            if (type === 'bestDrivers') {
                // Best Drivers: rank, plate, score, thanks, safety
                const rankCell = document.createElement('td');
                rankCell.textContent = entry.rank;
                
                const plateCell = document.createElement('td');
                const plateLink = document.createElement('a');
                plateLink.href = `/plate.html/${encodeURIComponent(entry.plateNumber)}`;
                plateLink.className = 'plate-link';
                plateLink.textContent = entry.plateNumber;
                plateCell.appendChild(plateLink);
                
                const scoreCell = document.createElement('td');
                scoreCell.textContent = entry.score;
                
                const thanksCell = document.createElement('td');
                thanksCell.textContent = entry.thanksCount;
                
                const safetyCell = document.createElement('td');
                safetyCell.textContent = entry.safetyCount;
                
                row.appendChild(rankCell);
                row.appendChild(plateCell);
                row.appendChild(scoreCell);
                row.appendChild(thanksCell);
                row.appendChild(safetyCell);
            } else if (type === 'mostLiked') {
                // Most Liked: rank, plate, likes
                // Support both 'likes' (from Cloud Function) and 'likesCount' (legacy)
                const likesValue = entry.likes !== undefined ? entry.likes : (entry.likesCount !== undefined ? entry.likesCount : entry.score);
                
                const rankCell = document.createElement('td');
                rankCell.textContent = entry.rank;
                
                const plateCell = document.createElement('td');
                const plateLink = document.createElement('a');
                plateLink.href = `/plate.html/${encodeURIComponent(entry.plateNumber)}`;
                plateLink.className = 'plate-link';
                plateLink.textContent = entry.plateNumber;
                plateCell.appendChild(plateLink);
                
                const likesCell = document.createElement('td');
                likesCell.textContent = likesValue;
                
                row.appendChild(rankCell);
                row.appendChild(plateCell);
                row.appendChild(likesCell);
            }
            
            tableBody.appendChild(row);
        });
        
        // Apply Anime.js stagger wave animation with IntersectionObserver
        if (typeof anime !== 'undefined') {
            const rows = tableBody.querySelectorAll('tr');
            const leaderboardSection = tableBody.closest('.leaderboard-section');
            
            if (rows.length > 0 && leaderboardSection) {
                // Set initial state
                rows.forEach(row => {
                    row.style.opacity = '0';
                    row.style.transform = 'translateY(20px)';
                });
                
                // Create IntersectionObserver for scroll-triggered animation
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Trigger stagger animation with Anime.js
                            anime({
                                targets: rows,
                                opacity: [0, 1],
                                translateY: [20, 0],
                                duration: 500,
                                delay: anime.stagger(80),
                                easing: 'easeOutQuad'
                            });
                            
                            // Disconnect observer after animation (once: true behavior)
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.2,  // Equivalent to 'start: top 80%'
                    rootMargin: '0px'
                });
                
                // Observe the leaderboard section
                observer.observe(leaderboardSection);
            }
        }
    },
    
    /**
     * Renders global statistics cards
     * @param {object} stats - Global statistics object with counter keys and values
     */
    renderGlobalStats(stats) {
        // Update stat boxes in hero section
        const totalPlateViewsElement = document.getElementById('totalPlateViews');
        const totalMessagesSentElement = document.getElementById('totalMessagesSent');
        const activeUsersElement = document.getElementById('activeUsers');
        
        if (!totalPlateViewsElement || !totalMessagesSentElement) {
            console.warn('UIController.renderGlobalStats: stat box elements not found');
            return;
        }
        
        if (!stats || typeof stats !== 'object') {
            console.warn('UIController.renderGlobalStats: invalid stats object', stats);
            stats = {};
        }
        
        // Get values from the stats object
        const totalPlateViews = parseInt(stats.totalViews) || 0;
        const totalMessages = parseInt(stats.totalTodayMessages) || 0;
        const activeUsers = parseInt(stats.activeUsers) || 0;
        
        // console.log('UIController.renderGlobalStats: totalPlateViews =', totalPlateViews, 'totalMessages =', totalMessages, 'activeUsers =', activeUsers);
        
        // OPTIMIZED: Batch DOM updates with requestAnimationFrame
        requestAnimationFrame(() => {
            // Ensure elements have initial value before animating
            if (!totalPlateViewsElement.textContent || totalPlateViewsElement.textContent.trim() === '') {
                totalPlateViewsElement.textContent = '0';
            }
            if (!totalMessagesSentElement.textContent || totalMessagesSentElement.textContent.trim() === '') {
                totalMessagesSentElement.textContent = '0';
            }
            if (activeUsersElement && (!activeUsersElement.textContent || activeUsersElement.textContent.trim() === '')) {
                activeUsersElement.textContent = '0';
            }
            
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                // Animate counters
                this.animateCounter(totalPlateViewsElement, totalPlateViews);
                this.animateCounter(totalMessagesSentElement, totalMessages);
                if (activeUsersElement && activeUsers > 0) {
                    this.animateCounter(activeUsersElement, activeUsers);
                }
            }, 100);
        });
    },
    
    /**
     * Animates a counter from current value to target value
     * OPTIMIZED: Uses requestAnimationFrame for batched DOM updates (30fps for better performance)
     * @param {HTMLElement} element - Element to animate
     * @param {number} target - Target value
     */
    animateCounter(element, target) {
        // Validate element
        if (!element) {
            console.warn('animateCounter: element is null or undefined');
            return;
        }
        
        // Validate target
        if (typeof target !== 'number' || isNaN(target)) {
            console.warn('animateCounter: invalid target value', target, 'for element', element.id);
            requestAnimationFrame(() => {
                element.textContent = '0';
            });
            return;
        }
        
        // Get current value, handling both plain numbers and formatted strings
        let currentText = (element.textContent || '0').replace(/,/g, '').trim();
        
        // Handle NaN or invalid text
        if (currentText === 'NaN' || currentText === '' || currentText === 'undefined') {
            currentText = '0';
            requestAnimationFrame(() => {
                element.textContent = '0';
            });
        }
        
        const current = parseInt(currentText) || 0;
        
        // console.log('animateCounter:', element.id, 'from', current, 'to', target);
        
        // If target is same as current, no need to animate
        if (current === target) {
            requestAnimationFrame(() => {
                element.textContent = target.toLocaleString();
            });
            return;
        }
        
        const duration = 2000;
        const frameTime = 33; // 30fps instead of 60fps for better performance
        const increment = (target - current) / (duration / frameTime);
        let count = current;
        
        const timer = setInterval(() => {
            count += increment;
            if ((increment > 0 && count >= target) || (increment < 0 && count <= target)) {
                count = target;
                clearInterval(timer);
            }
            // Batch DOM update with RAF
            requestAnimationFrame(() => {
                element.textContent = Math.floor(count).toLocaleString();
            });
        }, frameTime);
    },
    
    /**
     * Formats a number with Korean notation (adds comma separators and optional suffix)
     * @param {number} num - Number to format
     * @param {boolean} addSuffix - Whether to add "?? suffix (default: true)
     * @returns {string} - Formatted string (e.g., "12,345?? or "12,345")
     */
    formatKoreanNumber(num, addSuffix = true) {
        if (typeof num !== 'number') {
            num = parseInt(num, 10) || 0;
        }
        
        // Add comma separators
        const formatted = num.toLocaleString('ko-KR');
        
        // Add "?? (times) suffix if requested
        return addSuffix ? `${formatted}?? : formatted;
    },
    
    /**
     * Attaches event listeners to all interactive elements
     * This should be called once when the page loads
     */
    attachEventListeners() {
        // Search form submission
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }
        
        // Debounced search input validation (300ms delay)
        // Note: index.html has its own inline validation, so skip if on index page
        const plateInput = document.getElementById('plateInput');
        const isIndexPage = window.location.pathname === '/' || 
                           window.location.pathname.endsWith('index.html') ||
                           window.location.pathname === '';
        
        if (plateInput && !isIndexPage) {
            plateInput.addEventListener('input', (e) => {
                // Clear previous timer
                if (this.searchDebounceTimer) {
                    clearTimeout(this.searchDebounceTimer);
                }
                
                // Set new timer for validation feedback
                this.searchDebounceTimer = setTimeout(() => {
                    const input = e.target.value;
                    if (input && input.trim() !== '') {
                        const sanitized = Validator.sanitizePlateNumber(input);
                        const isValid = Validator.validatePlateNumber(sanitized);
                        
                        // Visual feedback for validation with outline effect
                        if (isValid) {
                            e.target.style.setProperty('outline', '3px solid #10b981', 'important');
                            e.target.style.setProperty('outline-offset', '0px', 'important');
                            e.target.style.setProperty('border-color', '#10b981', 'important');
                            e.target.style.setProperty('box-shadow', '0 0 0 3px rgba(16, 185, 129, 0.2)', 'important');
                        } else {
                            e.target.style.setProperty('outline', '3px solid #ef4444', 'important');
                            e.target.style.setProperty('outline-offset', '0px', 'important');
                            e.target.style.setProperty('border-color', '#ef4444', 'important');
                            e.target.style.setProperty('box-shadow', '0 0 0 3px rgba(239, 68, 68, 0.2)', 'important');
                        }
                    } else {
                        // Reset outline and border color
                        e.target.style.removeProperty('outline');
                        e.target.style.removeProperty('outline-offset');
                        e.target.style.removeProperty('border-color');
                        e.target.style.removeProperty('box-shadow');
                    }
                }, 300);
            });
            
            // Reset outline and border color on blur
            plateInput.addEventListener('blur', (e) => {
                e.target.style.removeProperty('outline');
                e.target.style.removeProperty('outline-offset');
                e.target.style.removeProperty('border-color');
                e.target.style.removeProperty('box-shadow');
            });
        }
        
        // Counter button clicks (event delegation)
        // Handle clicks in likes section
        const likesSection = document.querySelector('.likes-section');
        if (likesSection) {
            likesSection.addEventListener('click', (e) => {
                const button = e.target.closest('.counter-btn');
                if (button) {
                    this.handleCounterClick(button);
                }
            });
        }
        
        // Handle clicks in messages section (both old counter-btn and new send-btn)
        const messagesSection = document.querySelector('.messages-section');
        if (messagesSection) {
            messagesSection.addEventListener('click', (e) => {
                // Check for old counter-btn structure
                const counterBtn = e.target.closest('.counter-btn');
                if (counterBtn) {
                    this.handleCounterClick(counterBtn);
                    return;
                }
                
                // Check for new send-btn structure
                const sendBtn = e.target.closest('.send-btn');
                if (sendBtn) {
                    const messageCard = sendBtn.closest('.message-card');
                    if (messageCard) {
                        this.handleMessageCardClick(messageCard, sendBtn);
                    }
                }
            });
        }
        
        // Handle clicks in counters section (for backward compatibility)
        const countersSection = document.querySelector('.counters-section');
        if (countersSection) {
            countersSection.addEventListener('click', (e) => {
                const button = e.target.closest('.counter-btn');
                if (button) {
                    this.handleCounterClick(button);
                }
            });
        }
        
        // Best Drivers leaderboard tabs
        const bestDriverTabs = document.getElementById('bestDriverTabs');
        if (bestDriverTabs) {
            bestDriverTabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab')) {
                    const period = e.target.getAttribute('data-period');
                    this.handleLeaderboardTabChange('bestDrivers', period, bestDriverTabs);
                }
            });
        }
        
        // Most Liked leaderboard tabs
        const mostLikedTabs = document.getElementById('mostLikedTabs');
        if (mostLikedTabs) {
            mostLikedTabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab')) {
                    const period = e.target.getAttribute('data-period');
                    this.handleLeaderboardTabChange('mostLiked', period, mostLikedTabs);
                }
            });
        }
        
        // Share buttons
        const shareButton = document.getElementById('shareButton');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.handleSiteShare();
            });
        }
        
        const sharePlateButton = document.getElementById('sharePlateButton');
        if (sharePlateButton) {
            sharePlateButton.addEventListener('click', () => {
                this.handlePlateShare();
            });
        }
        
        // Good message button - scroll to Ï¢ãÏ? Í∞êÏ†ï Î©îÏÑ∏ÏßÄ section
        const goodMessageButton = document.getElementById('goodMessageButton');
        if (goodMessageButton) {
            goodMessageButton.addEventListener('click', () => {
                const goodMessageSection = document.querySelector('.messages-section .category-group:last-child h3');
                if (goodMessageSection) {
                    goodMessageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
        
        // Plate links in leaderboards (event delegation)
        document.addEventListener('click', (e) => {
            const plateLink = e.target.closest('.plate-link');
            if (plateLink) {
                e.preventDefault();
                const href = plateLink.getAttribute('href');
                if (href) {
                    // Extract plate number from href
                    const match = href.match(/\/plate\.html\/([^\/]+)/);
                    if (match && match[1]) {
                        const plateNumber = decodeURIComponent(match[1]);
                        Router.navigateToPlate(plateNumber);
                    }
                }
            }
        });
        
        // console.log('UIController: Event listeners attached');
    },
    
    /**
     * Handles search form submission
     */
    handleSearch() {
        const plateInput = document.getElementById('plateInput');
        const searchButton = document.querySelector('#searchForm button[type="submit"]');
        
        if (!plateInput) {
            console.error('UIController.handleSearch: plateInput element not found');
            return;
        }
        
        const input = plateInput.value;
        // console.log('UIController.handleSearch: Processing search for input:', input);
        
        // Check for empty input
        if (!input || input.trim() === '') {
            // console.log('UIController.handleSearch: Empty input detected');
            this.showNotification('Î≤àÌò∏?êÏùÑ ?ÖÎ†•??Ï£ºÏÑ∏??, 'error');
            return;
        }
        
        const sanitized = Validator.sanitizePlateNumber(input);
        // console.log('UIController.handleSearch: Sanitized input:', sanitized);
        
        // Validate and normalize plate number
        const normalized = Validator.normalizePlate(sanitized);
        if (!normalized) {
            // console.log('UIController.handleSearch: Invalid plate number format:', sanitized);
            this.showNotification('?¨Î∞îÎ•?Î≤àÌò∏???ïÏãù???ÑÎãô?àÎã§ (?? 09Î£?363, ?úÏö∏12Í∞Ä3456)', 'error');
            return;
        }
        
        // Show helpful message for old plates without region
        if (normalized.type === 'old-ambiguous') {
            // console.log('UIController.handleSearch: Old plate without region detected');
            this.showNotification('Íµ¨Ìòï Î≤àÌò∏?? ÏßÄ???ÜÏù¥??Í≤Ä??Í∞Ä?•Ìï©?àÎã§', 'info');
        }
        
        // Add spinner animation to button
        if (searchButton) {
            searchButton.classList.add('searching');
            const originalText = searchButton.textContent;
            searchButton.textContent = 'Í≤Ä??Ï§?..';
            
            // Remove spinner after navigation (or timeout)
            setTimeout(() => {
                searchButton.classList.remove('searching');
                searchButton.textContent = originalText;
            }, 2000);
        }
        
        // Navigate to plate page
        try {
            Router.navigateToPlate(sanitized);
            // console.log('UIController.handleSearch: Navigation initiated for:', sanitized);
        } catch (error) {
            console.error('UIController.handleSearch: Navigation error:', error);
            this.showNotification('?òÏù¥ÏßÄ ?¥Îèô Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§', 'error');
            
            // Remove spinner on error
            if (searchButton) {
                searchButton.classList.remove('searching');
                searchButton.textContent = 'Ï°∞Ìöå';
            }
        }
    },
    
    /**
     * Handles counter button click
     * Uses secure Cloud Function for bot prevention
     * @param {HTMLElement} button - The clicked counter button
     */
    async handleCounterClick(button) {
        const counterKey = button.getAttribute('data-key');
        const counterLabel = button.getAttribute('data-label');
        
        if (!counterKey) {
            console.error('UIController.handleCounterClick: counterKey not found on button');
            return;
        }
        
        // console.log(`UIController.handleCounterClick: Processing click for ${counterKey} (${counterLabel})`);
        
        // Get current plate number
        const plateNumber = Router.getCurrentPlate();
        if (!plateNumber) {
            console.error('UIController.handleCounterClick: No plate number found in URL');
            this.showNotification('Î≤àÌò∏???ïÎ≥¥Î•?Ï∞æÏùÑ ???ÜÏäµ?àÎã§', 'error');
            return;
        }
        
        // Check daily limit (client-side check for UX, server validates too)
        if (!DailyLimitManager.canIncrement(plateNumber, counterKey)) {
            // console.log(`UIController.handleCounterClick: Daily limit reached for ${plateNumber}/${counterKey}`);
            this.showNotification('?§Îäò?Ä ?¥Î? ????™©??Î©îÏÑ∏ÏßÄÎ•?Î≥¥ÎÉà?µÎãà??, 'info');
            return;
        }
        
        // Disable button temporarily to prevent double-clicks
        button.disabled = true;
        
        try {
            // Use secure increment via Cloud Function (with bot prevention)
            let newValue;
            
            if (typeof SecurityModule !== 'undefined' && SecurityModule.secureIncrementCounter) {
                // Use secure Cloud Function
                // console.log('UIController.handleCounterClick: Using secure increment');
                newValue = await SecurityModule.secureIncrementCounter(plateNumber, counterKey);
            } else {
                // Fallback to direct Firebase increment (if SecurityModule not loaded)
                console.warn('UIController.handleCounterClick: SecurityModule not available, using fallback');
                newValue = await FirebaseClient.incrementCounter(plateNumber, counterKey);
            }
            
            // console.log(`UIController.handleCounterClick: Counter incremented successfully, new value: ${newValue}`);
            
            // Record monthly increment (date-only tracking for trend chart)
            // This is done after successful Firebase increment to ensure consistency
            await MonthlyTrendTracker.recordMonthlyIncrement(plateNumber, counterKey);
            // console.log(`UIController.handleCounterClick: Monthly increment recorded for ${plateNumber}/${counterKey}`);
            
            // Update display
            this.updateCounterDisplay(counterKey, newValue);
            
            // Update chart if it exists
            if (window.plateChartInstance) {
                try {
                    // Fetch data to update chart (will use cache if available)
                    const plateData = await FirebaseClient.getPlateData(plateNumber);
                    ChartManager.updateChart(window.plateChartInstance, plateData.counters);
                } catch (chartError) {
                    console.error('UIController.handleCounterClick: Failed to update chart:', chartError);
                    // Don't show error to user - counter update succeeded, chart is secondary
                }
            }
            
            // Update monthly trend chart if it exists
            if (window.monthlyTrendChartInstance) {
                try {
                    // Fetch updated monthly trend data
                    const monthlyTrendData = await MonthlyTrendTracker.getAggregatedMonthlyTrends(plateNumber);
                    // console.log(`UIController.handleCounterClick: Fetched updated monthly trend data:`, monthlyTrendData);
                    
                    // Update the monthly trend chart
                    ChartManager.updateMonthlyTrendChart(window.monthlyTrendChartInstance, monthlyTrendData);
                    // console.log(`UIController.handleCounterClick: Monthly trend chart updated successfully`);
                } catch (trendError) {
                    console.error('UIController.handleCounterClick: Failed to update monthly trend chart:', trendError);
                    // Don't show error to user - counter update succeeded, trend chart is secondary
                }
            }
            
            // Record increment in LocalStorage
            const recorded = DailyLimitManager.recordIncrement(plateNumber, counterKey);
            if (!recorded) {
                console.warn('UIController.handleCounterClick: Failed to record increment in LocalStorage');
                // Continue anyway - the increment succeeded in Firebase
            }
            
            // Show success message
            this.showNotification(`${counterLabel} Î©îÏÑ∏ÏßÄÎ•?Î≥¥ÎÉà?µÎãà??`, 'success');
        } catch (error) {
            console.error('UIController.handleCounterClick error:', {
                plateNumber: plateNumber,
                counterKey: counterKey,
                counterLabel: counterLabel,
                error: error.message,
                stack: error.stack
            });
            
            // Use the error message if it's already in Korean, otherwise use default
            const errorMessage = error.message || '?§Ìä∏?åÌÅ¨ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??;
            this.showNotification(errorMessage, 'error');
        } finally {
            // Re-enable button
            button.disabled = false;
        }
    },
    
    /**
     * Handles message card click (new design)
     * @param {HTMLElement} messageCard - The clicked message card
     * @param {HTMLElement} sendBtn - The send button that was clicked
     */
    async handleMessageCardClick(messageCard, sendBtn) {
        const counterKey = messageCard.getAttribute('data-key');
        const counterLabel = messageCard.getAttribute('data-label');
        
        if (!counterKey) {
            console.error('UIController.handleMessageCardClick: counterKey not found on message card');
            return;
        }
        
        // console.log(`UIController.handleMessageCardClick: Processing click for ${counterKey} (${counterLabel})`);
        
        // Get current plate number
        const plateNumber = Router.getCurrentPlate();
        if (!plateNumber) {
            console.error('UIController.handleMessageCardClick: No plate number found in URL');
            this.showNotification('Î≤àÌò∏???ïÎ≥¥Î•?Ï∞æÏùÑ ???ÜÏäµ?àÎã§', 'error');
            return;
        }
        
        // Check daily limit
        if (!DailyLimitManager.canIncrement(plateNumber, counterKey)) {
            // console.log(`UIController.handleMessageCardClick: Daily limit reached for ${plateNumber}/${counterKey}`);
            this.showNotification('?§Îäò?Ä ?¥Î? ????™©??Î©îÏÑ∏ÏßÄÎ•?Î≥¥ÎÉà?µÎãà??, 'info');
            return;
        }
        
        // Disable button temporarily to prevent double-clicks
        sendBtn.disabled = true;
        
        try {
            // Create flying envelope animation
            this.createFlyingEnvelope(sendBtn);
            
            // Increment counter in Firebase using secure Cloud Function
            let newValue;
            if (typeof SecurityModule !== 'undefined' && SecurityModule.secureIncrementCounter) {
                newValue = await SecurityModule.secureIncrementCounter(plateNumber, counterKey);
            } else {
                console.warn('UIController.handleMessageCardClick: SecurityModule not available, using fallback');
                newValue = await FirebaseClient.incrementCounter(plateNumber, counterKey);
            }
            // console.log(`UIController.handleMessageCardClick: Counter incremented successfully, new value: ${newValue}`);
            
            // Record monthly increment
            await MonthlyTrendTracker.recordMonthlyIncrement(plateNumber, counterKey);
            // console.log(`UIController.handleMessageCardClick: Monthly increment recorded for ${plateNumber}/${counterKey}`);
            
            // Update the count display in the message card
            const countElement = messageCard.querySelector('.send-count');
            if (countElement) {
                countElement.textContent = `${newValue}??;
            }
            
            // Update other displays
            this.updateCounterDisplay(counterKey, newValue);
            
            // Update chart if it exists
            if (window.plateChartInstance) {
                try {
                    const plateData = await FirebaseClient.getPlateData(plateNumber);
                    ChartManager.updateChart(window.plateChartInstance, plateData.counters);
                } catch (chartError) {
                    console.error('UIController.handleMessageCardClick: Failed to update chart:', chartError);
                }
            }
            
            // Update monthly trend chart if it exists
            if (window.monthlyTrendChartInstance) {
                try {
                    const monthlyTrendData = await MonthlyTrendTracker.getAggregatedMonthlyTrends(plateNumber);
                    ChartManager.updateMonthlyTrendChart(window.monthlyTrendChartInstance, monthlyTrendData);
                } catch (trendError) {
                    console.error('UIController.handleMessageCardClick: Failed to update monthly trend chart:', trendError);
                }
            }
            
            // Record increment in LocalStorage
            DailyLimitManager.recordIncrement(plateNumber, counterKey);
            
            // Show success message
            this.showNotification(`??"${counterLabel}" Î©îÏãúÏßÄÍ∞Ä ?ÑÏÜ°?òÏóà?µÎãà??, 'success');
        } catch (error) {
            console.error('UIController.handleMessageCardClick error:', {
                plateNumber: plateNumber,
                counterKey: counterKey,
                counterLabel: counterLabel,
                error: error.message,
                stack: error.stack
            });
            
            const errorMessage = error.message || '?§Ìä∏?åÌÅ¨ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??;
            this.showNotification(errorMessage, 'error');
        } finally {
            // Re-enable button
            sendBtn.disabled = false;
        }
    },
    
    /**
     * Creates flying envelope animation
     * @param {HTMLElement} button - The button element to animate from
     */
    createFlyingEnvelope(button) {
        const envelope = document.createElement('img');
        envelope.src = 'assets/img/envelope.png';
        envelope.className = 'envelope';
        
        const rect = button.getBoundingClientRect();
        envelope.style.left = rect.left + rect.width / 2 + 'px';
        envelope.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(envelope);
        
        // Trigger animation
        setTimeout(() => {
            envelope.classList.add('flying');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            envelope.remove();
        }, 1500);
    },
    
    /**
     * Handles leaderboard tab change
     * @param {string} type - Leaderboard type: 'bestDrivers' or 'mostLiked'
     * @param {string} period - Selected period
     * @param {HTMLElement} tabContainer - Tab container element
     */
    async handleLeaderboardTabChange(type, period, tabContainer) {
        if (!type || !period) {
            console.error('UIController.handleLeaderboardTabChange: type and period are required');
            return;
        }
        
        // console.log(`UIController.handleLeaderboardTabChange: Changing to ${type}/${period}`);
        
        // Update active tab
        const tabs = tabContainer.querySelectorAll('.tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-period') === period) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Map period to Firebase period format
        const periodMap = {
            'today': 'today',
            'week': 'thisWeek',
            'month': 'thisMonth',
            'year': 'thisYear',
            'allTime': 'allTime'
        };
        
        const firebasePeriod = periodMap[period] || 'allTime';
        
        // Show loading
        this.showLoading();
        
        try {
            // Fetch leaderboard data
            const data = await FirebaseClient.getLeaderboard(type, firebasePeriod, 10);
            
            // Render leaderboard
            this.renderLeaderboard(type, firebasePeriod, data);
            
            // console.log(`UIController.handleLeaderboardTabChange: Successfully loaded ${data.length} entries`);
        } catch (error) {
            console.error('UIController.handleLeaderboardTabChange error:', {
                type: type,
                period: period,
                firebasePeriod: firebasePeriod,
                error: error.message,
                stack: error.stack
            });
            
            // Use the error message if it's already in Korean, otherwise use default
            const errorMessage = error.message || 'Î¶¨ÎçîÎ≥¥ÎìúÎ•?Î∂àÎü¨?????ÜÏäµ?àÎã§';
            this.showNotification(errorMessage, 'error');
            
            // Render empty leaderboard to show user something went wrong
            this.renderLeaderboard(type, firebasePeriod, []);
        } finally {
            this.hideLoading();
        }
    },
    
    /**
     * Handles site share button click
     */
    handleSiteShare() {
        const url = window.location.origin;
        const title = 'SafeDrive - ?µÎ™Ö?ºÎ°ú Ï∞®Îüâ ?àÏ†Ñ??Í≥µÏú†?òÏÑ∏??;
        
        this.shareURL(url, title);
    },
    
    /**
     * Handles plate share button click
     */
    handlePlateShare() {
        const plateNumber = Router.getCurrentPlate();
        if (!plateNumber) {
            this.showNotification('Î≤àÌò∏???ïÎ≥¥Î•?Ï∞æÏùÑ ???ÜÏäµ?àÎã§', 'error');
            return;
        }
        
        const url = `${window.location.origin}/plate.html/${encodeURIComponent(plateNumber)}`;
        const title = `SafeDrive - ${plateNumber} Î≤àÌò∏???ïÎ≥¥`;
        
        this.shareURL(url, title);
    },
    
    /**
     * Shares a URL using Web Share API or clipboard fallback
     * @param {string} url - URL to share
     * @param {string} title - Title for the share
     */
    async shareURL(url, title) {
        // Check for Web Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url
                });
                this.showNotification('Í≥µÏú† ?ÑÎ£å!', 'success');
            } catch (error) {
                // User cancelled or error occurred
                if (error.name !== 'AbortError') {
                    console.error('Share error:', error);
                    // Fallback to clipboard
                    this.copyToClipboard(url);
                }
            }
        } else {
            // Fallback to clipboard
            this.copyToClipboard(url);
        }
    },
    
    /**
     * Copies text to clipboard
     * @param {string} text - Text to copy
     */
    async copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                this.showNotification('ÎßÅÌÅ¨Í∞Ä Î≥µÏÇ¨?òÏóà?µÎãà??, 'success');
            } catch (error) {
                console.error('Clipboard error:', error);
                this.showNotification('ÎßÅÌÅ¨ Î≥µÏÇ¨???§Ìå®?àÏäµ?àÎã§', 'error');
            }
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification('ÎßÅÌÅ¨Í∞Ä Î≥µÏÇ¨?òÏóà?µÎãà??, 'success');
            } catch (error) {
                console.error('Clipboard fallback error:', error);
                this.showNotification('ÎßÅÌÅ¨ Î≥µÏÇ¨???§Ìå®?àÏäµ?àÎã§', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }
};

// Make UIController globally accessible
window.UIController = UIController;

// ============================================================================
// Landing Page Initialization
// ============================================================================

/**
 * Initializes the landing page
 * Fetches and renders global stats and leaderboards
 */
async function initLandingPage() {
    // console.log('initLandingPage: Starting landing page initialization');
    
    try {
        // Show loading indicator
        UIController.showLoading();
        
        // Update last update timestamp
        PerformanceOptimizer.lastUpdate = Date.now();
        
        // Fetch and render global statistics
        try {
            // console.log('initLandingPage: Fetching global statistics');
            
            // Fetch all stats in parallel for better performance
            const [allTimeStats, todayStats, activeUsersData] = await Promise.all([
                FirebaseClient.getGlobalStats('allTime'),
                FirebaseClient.getGlobalStats('daily'),
                FirebaseClient.getActiveUsers()
            ]);
            
            const totalViews = allTimeStats.totalViews || 0;
            const activeUsers = activeUsersData.activeUsers || 0;
            
            // Calculate total messages for today (sum of all counters except totalViews)
            let totalTodayMessages = 0;
            for (const [key, value] of Object.entries(todayStats)) {
                if (key !== 'totalViews') {
                    totalTodayMessages += (parseInt(value) || 0);
                }
            }
            
            // console.log('initLandingPage: totalViews =', totalViews, 'totalTodayMessages =', totalTodayMessages, 'activeUsers =', activeUsers);
            
            // Render stats with all values
            UIController.renderGlobalStats({
                totalViews: totalViews,
                totalTodayMessages: totalTodayMessages,
                activeUsers: activeUsers
            });
            
            // Set up real-time listener for active users updates
            FirebaseClient.subscribeToActiveUsers((data) => {
                const activeUsersElement = document.getElementById('activeUsers');
                if (activeUsersElement && data.activeUsers > 0) {
                    UIController.animateCounter(activeUsersElement, data.activeUsers);
                }
            });
            
            // console.log('initLandingPage: Global stats loaded successfully');
        } catch (error) {
            console.error('initLandingPage: Failed to load global stats:', {
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Use the error message if it's already in Korean, otherwise use default
            const errorMessage = error.message || '?µÍ≥ÑÎ•?Î∂àÎü¨?????ÜÏäµ?àÎã§';
            UIController.showNotification(errorMessage, 'error');
            
            // Render empty stats to show something
            UIController.renderGlobalStats({});
        }
        
        // Fetch and render most liked leaderboard (default to "???" - allTime)
        try {
            // console.log('initLandingPage: Fetching most liked leaderboard');
            const mostLikedData = await FirebaseClient.getLeaderboard('mostLiked', 'allTime', 10);
            UIController.renderLeaderboard('mostLiked', 'allTime', mostLikedData);
            // console.log('initLandingPage: Most liked leaderboard loaded successfully');
        } catch (error) {
            console.error('initLandingPage: Failed to load most liked leaderboard:', {
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Use the error message if it's already in Korean, otherwise use default
            const errorMessage = error.message || '?∏Í∏∞ Î≤àÌò∏??TOP 10??Î∂àÎü¨?????ÜÏäµ?àÎã§';
            UIController.showNotification(errorMessage, 'error');
            
            // Render empty leaderboard
            UIController.renderLeaderboard('mostLiked', 'allTime', []);
        }
        
        // console.log('initLandingPage: Landing page initialization complete');
    } catch (error) {
        console.error('initLandingPage: Critical error during initialization:', {
            error: error.message,
            stack: error.stack
        });
        UIController.showNotification('?òÏù¥ÏßÄÎ•?Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§', 'error');
    } finally {
        // Hide loading indicator
        UIController.hideLoading();
    }
}

// ============================================================================
// Plate Page Initialization
// ============================================================================

/**
 * Initializes the plate page
 * Parses plate number from URL, fetches data, and renders results
 */
async function initPlatePage() {
    // console.log('initPlatePage: Starting plate page initialization');
    
    // Initialize Router
    Router.initRouter();
    
    // Parse plate number from URL
    const plateNumber = Router.parsePlateFromURL();
    // console.log('initPlatePage: Parsed plate number from URL:', plateNumber);
    
    // Validate plate number
    if (!plateNumber || !Validator.validatePlateNumber(plateNumber)) {
        console.error('initPlatePage: Invalid plate number in URL:', plateNumber);
        UIController.showNotification('?¨Î∞îÎ•?Î≤àÌò∏???ïÏãù???ÑÎãô?àÎã§', 'error');
        
        // Redirect to landing page after 2 seconds
        setTimeout(() => {
            // console.log('initPlatePage: Redirecting to landing page due to invalid plate number');
            window.location.href = '/';
        }, 2000);
        return;
    }
    
    // console.log('initPlatePage: Loading plate data for:', plateNumber);
    
    // Set placeholder with current plate number
    const plateInput = document.getElementById('plateInput');
    if (plateInput) {
        plateInput.placeholder = `Î≤àÌò∏??Ï°∞Ìöå ?? ${plateNumber}`;
    } else {
        console.warn('initPlatePage: plateInput element not found');
    }
    
    // Show loading indicator
    UIController.showLoading();
    
    try {
        // Fetch plate data from Firebase
        const plateData = await FirebaseClient.getPlateData(plateNumber);
        
        // console.log('initPlatePage: Plate data loaded:', plateData);
        
        // Fetch monthly trend data
        const monthlyTrendData = await MonthlyTrendTracker.getAggregatedMonthlyTrends(plateNumber);
        
        // console.log('initPlatePage: Monthly trend data loaded:', monthlyTrendData);
        
        // Render plate results (header, chart, counters)
        UIController.renderPlateResults(plateNumber, plateData, monthlyTrendData);
        
        // console.log('initPlatePage: Plate page initialized successfully');
    } catch (error) {
        console.error('initPlatePage: Failed to load plate data:', {
            plateNumber: plateNumber,
            error: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Use the error message if it's already in Korean, otherwise use default
        const errorMessage = error.message || '?∞Ïù¥?∞Î? Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§';
        UIController.showNotification(errorMessage, 'error');
        
        // Display zero-state on error so user can still interact with the page
        try {
            const zeroCounters = FirebaseClient.getZeroCounters();
            const zeroMonthlyTrend = {
                months: MonthlyTrendTracker.getLast12Months(),
                counts: new Array(12).fill(0)
            };
            UIController.renderPlateResults(plateNumber, { 
                plateNumber: plateNumber, 
                counters: zeroCounters,
                lastUpdated: null 
            }, zeroMonthlyTrend);
            // console.log('initPlatePage: Rendered zero-state after error');
        } catch (renderError) {
            console.error('initPlatePage: Failed to render zero-state:', renderError);
        }
    } finally {
        // Hide loading indicator
        UIController.hideLoading();
    }
}

/**
 * Determines which page we're on and initializes accordingly
 */
function initPage() {
    const pathname = window.location.pathname;
    
    // Check if we're on the landing page (index.html or root)
    if (pathname === '/' || pathname === '/index.html' || pathname.endsWith('/')) {
        // Landing page
        initLandingPage();
    } else if (pathname.includes('plate.html')) {
        // Plate page
        initPlatePage();
    }
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise
    });
    
    // Prevent default browser behavior
    event.preventDefault();
    
    // Show user-friendly error message
    if (UIController && UIController.showNotification) {
        UIController.showNotification('?àÏÉÅÏπ?Î™ªÌïú ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§', 'error');
    }
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Show user-friendly error message
    if (UIController && UIController.showNotification) {
        UIController.showNotification('?àÏÉÅÏπ?Î™ªÌïú ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§', 'error');
    }
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // console.log('SafeDrive initialized');
    // console.log('Firebase configured:', firebaseConfig.projectId);
    
    try {
        // Initialize Performance Optimizer
        PerformanceOptimizer.initVisibilityHandler();
        
        // Initialize Router
        Router.initRouter();
        
        // Attach event listeners
        UIController.attachEventListeners();
        
        // Initialize the appropriate page
        initPage();
    } catch (error) {
        console.error('Critical error during app initialization:', {
            error: error.message,
            stack: error.stack
        });
        
        if (UIController && UIController.showNotification) {
            UIController.showNotification('??Ï¥àÍ∏∞??Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§', 'error');
        }
    }
    
    // Handle route changes (for plate page navigation without reload)
    window.addEventListener('routechange', async (event) => {
        const plateNumber = event.detail.plate;
        
        if (!plateNumber) {
            console.error('routechange handler: Route change event missing plate number');
            return;
        }
        
        // console.log('routechange handler: Route changed to plate:', plateNumber);
        
        // Check if we're on the plate page
        const pathname = window.location.pathname;
        if (pathname.includes('plate.html')) {
            // Update the search input placeholder
            const plateInput = document.getElementById('plateInput');
            if (plateInput) {
                plateInput.placeholder = `Î≤àÌò∏??Ï°∞Ìöå ?? ${plateNumber}`;
            } else {
                console.warn('routechange handler: plateInput element not found');
            }
            
            // Show loading
            UIController.showLoading();
            
            try {
                // Fetch and render new plate data
                const plateData = await FirebaseClient.getPlateData(plateNumber);
                
                // Fetch monthly trend data
                const monthlyTrendData = await MonthlyTrendTracker.getAggregatedMonthlyTrends(plateNumber);
                
                UIController.renderPlateResults(plateNumber, plateData, monthlyTrendData);
                // console.log('routechange handler: Successfully loaded and rendered plate data');
            } catch (error) {
                console.error('routechange handler: Failed to load plate data on route change:', {
                    plateNumber: plateNumber,
                    error: error.message,
                    code: error.code,
                    stack: error.stack
                });
                
                // Use the error message if it's already in Korean, otherwise use default
                const errorMessage = error.message || '?∞Ïù¥?∞Î? Î∂àÎü¨?§Îäî Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§';
                UIController.showNotification(errorMessage, 'error');
                
                // Display zero-state on error
                try {
                    const zeroCounters = FirebaseClient.getZeroCounters();
                    const zeroMonthlyTrend = {
                        months: MonthlyTrendTracker.getLast12Months(),
                        counts: new Array(12).fill(0)
                    };
                    UIController.renderPlateResults(plateNumber, { 
                        plateNumber: plateNumber, 
                        counters: zeroCounters,
                        lastUpdated: null 
                    }, zeroMonthlyTrend);
                } catch (renderError) {
                    console.error('routechange handler: Failed to render zero-state:', renderError);
                }
            } finally {
                UIController.hideLoading();
            }
        } else {
            // Navigate to plate page with query parameter
            try {
                window.location.href = `/plate.html?plate=${encodeURIComponent(plateNumber)}`;
            } catch (error) {
                console.error('routechange handler: Failed to navigate to plate page:', error);
                UIController.showNotification('?òÏù¥ÏßÄ ?¥Îèô Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§', 'error');
            }
        }
    });
});


// ============================================================================
// Hero License Plate Animation
// ============================================================================
// ============================================================================
// Heart Button Functionality for Plate Page
// ============================================================================

/**
 * Initialize heart button with like functionality
 */
function initHeartButton() {
    const likeHeart = document.getElementById('likeHeart');
    const likeHeartWrapper = document.getElementById('likeHeartWrapper');
    const likeCountElement = document.getElementById('likeCount');
    
    if (!likeHeart || !likeHeartWrapper || !likeCountElement) {
        return; // Not on plate page or elements not found
    }
    
    let isLiked = false;
    
    /**
     * Create particle burst effect
     */
    function createParticles() {
        const wrapper = likeHeartWrapper;
        const rect = wrapper.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Create 6 particles in different directions
        const angles = [0, 60, 120, 180, 240, 300];
        angles.forEach(angle => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const radian = (angle * Math.PI) / 180;
            const distance = 40;
            const tx = Math.cos(radian) * distance;
            const ty = Math.sin(radian) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            
            wrapper.appendChild(particle);
            
            // Trigger animation
            setTimeout(() => {
                particle.classList.add('animate');
            }, 10);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 600);
        });
    }
    
    /**
     * Handle heart click
     */
    likeHeart.addEventListener('click', async function() {
        const plateNumber = document.getElementById('plateNumber')?.textContent;
        
        if (!plateNumber || plateNumber === '-') {
            UIController.showNotification('Î≤àÌò∏?êÏùÑ Î®ºÏ? Ï°∞Ìöå?¥Ï£º?∏Ïöî', 'error');
            return;
        }
        
        if (!isLiked) {
            // Like action
            isLiked = true;
            this.classList.remove('inactive');
            this.classList.add('active');
            
            // Add burst effect
            likeHeartWrapper.classList.add('burst');
            setTimeout(() => {
                likeHeartWrapper.classList.remove('burst');
            }, 600);
            
            // Create particle burst
            createParticles();
            
            // Increment like in Firebase using secure Cloud Function
            try {
                if (typeof SecurityModule !== 'undefined' && SecurityModule.secureIncrementCounter) {
                    await SecurityModule.secureIncrementCounter(plateNumber, 'likes');
                } else {
                    console.warn('UIController.handleLikeClick: SecurityModule not available, using fallback');
                    await FirebaseClient.incrementCounter(plateNumber, 'likes');
                }
                
                // Update the count display
                const currentCount = parseInt(likeCountElement.textContent) || 0;
                const newCount = currentCount + 1;
                
                if (newCount >= 1000) {
                    likeCountElement.textContent = (newCount / 1000).toFixed(1) + 'K';
                } else {
                    likeCountElement.textContent = newCount;
                }
                
                UIController.showNotification('Ï¢ãÏïÑ??', 'success');
            } catch (error) {
                console.error('Failed to increment like:', error);
                // Revert UI state on error
                isLiked = false;
                this.classList.remove('active');
                this.classList.add('inactive');
                UIController.showNotification('Ï¢ãÏïÑ???§Ìå®. ?§Ïãú ?úÎèÑ?¥Ï£º?∏Ïöî.', 'error');
            }
        }
    });
}

// Initialize heart button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeartButton);
} else {
    initHeartButton();
}

// Re-initialize heart button on route change to plate page
window.addEventListener('routechange', (e) => {
    if (e.detail && e.detail.pathname && e.detail.pathname.includes('plate.html')) {
        setTimeout(initHeartButton, 100);
    }
});


// Plate flip animation on hover
document.addEventListener('DOMContentLoaded', function() {
    const plateContainers = document.querySelectorAll('.plate-flip-container');
    
    plateContainers.forEach(container => {
        container.addEventListener('mouseenter', function() {
            const flipper = this.querySelector('.plate-flipper');
            if (flipper) {
                flipper.style.transform = 'rotateY(180deg)';
            }
        });
        
        container.addEventListener('mouseleave', function() {
            const flipper = this.querySelector('.plate-flipper');
            if (flipper) {
                flipper.style.transform = 'rotateY(0deg)';
            }
        });
    });
});

// ============================================================================
// Subscription Manager Module (PWA Push Notifications)
// ============================================================================
const SubscriptionManager = {
    MAX_SUBSCRIPTIONS: 10,
    deferredPrompt: null,
    messaging: null,
    
    /**
     * Initialize the subscription manager
     */
    init() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    // console.log('Service Worker registered:', registration);
                    
                    // Send Firebase config to service worker
                    if (registration.active && typeof firebaseConfig !== 'undefined') {
                        registration.active.postMessage({
                            type: 'FIREBASE_CONFIG',
                            config: firebaseConfig
                        });
                    }
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
        
        // Initialize Firebase Messaging
        try {
            this.messaging = firebase.messaging();
            // console.log('Firebase Messaging initialized');
        } catch (error) {
            console.error('Firebase Messaging initialization failed:', error);
        }
        
        // Capture beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            // console.log('beforeinstallprompt event captured');
        });
        
        // Setup subscribe button
        this.setupSubscribeButton();
    },
    
    /**
     * Setup subscribe button with hover animation
     */
    setupSubscribeButton() {
        const subscribeBtn = document.getElementById('subscribeBtn');
        if (!subscribeBtn) {
            console.warn('Subscribe button not found');
            return;
        }
        
        // console.log('Subscribe button found, setting up...');
        
        // Update button text based on subscription status
        this.updateSubscribeButtonText();
        
        // Anime.js hover animation
        subscribeBtn.addEventListener('mouseenter', () => {
            anime({ 
                targets: subscribeBtn,
                duration: 300, 
                scale: 1.1, 
                easing: 'easeOutElastic(1, 0.3)' 
            });
        });
        
        subscribeBtn.addEventListener('mouseleave', () => {
            anime({ 
                targets: subscribeBtn,
                duration: 300, 
                scale: 1, 
                easing: 'easeOutQuad' 
            });
        });
        
        // Click handler
        subscribeBtn.addEventListener('click', () => {
            // console.log('Subscribe button clicked');
            this.openSubscribePopup();
        });
    },
    
    /**
     * Update subscribe button text based on subscription status
     */
    updateSubscribeButtonText() {
        const subscribeBtn = document.getElementById('subscribeBtn');
        const currentPlate = document.getElementById('plateNumber')?.textContent;
        
        if (!subscribeBtn || !currentPlate || currentPlate === '-') {
            return;
        }
        
        const subscribed = this.getSubscribedPlates();
        const isSubscribed = subscribed.includes(currentPlate);
        
        if (isSubscribed) {
            subscribeBtn.textContent = '';
            const checkSpan = document.createElement('span');
            checkSpan.textContent = '??;
            subscribeBtn.appendChild(checkSpan);
            subscribeBtn.appendChild(document.createTextNode(' Íµ¨ÎèÖÏ§?));
            subscribeBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        } else {
            subscribeBtn.textContent = '';
            const bellSpan = document.createElement('span');
            bellSpan.textContent = '?îî';
            subscribeBtn.appendChild(bellSpan);
            subscribeBtn.appendChild(document.createTextNode(' Íµ¨ÎèÖ'));
            subscribeBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
        }
    },
    
    /**
     * Open subscribe popup
     */
    openSubscribePopup() {
        const popup = document.getElementById('subscribePopup');
        if (!popup) return;
        
        // Lock body scroll (important for mobile UX)
        document.body.style.overflow = 'hidden';
        
        popup.style.display = 'flex';
        this.renderSubscribedList();
        
        // Setup install button
        const installBtn = document.getElementById('installPushBtn');
        if (installBtn) {
            installBtn.onclick = () => this.handleInstallAndSubscribe();
        }
    },
    
    /**
     * Close subscribe popup
     */
    closeSubscribePopup() {
        const popup = document.getElementById('subscribePopup');
        if (popup) {
            popup.style.display = 'none';
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    },
    
    /**
     * Get subscribed plates from LocalStorage
     */
    getSubscribedPlates() {
        try {
            const stored = localStorage.getItem('subscribedPlates');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading subscribed plates:', error);
            return [];
        }
    },
    
    /**
     * Save subscribed plates to LocalStorage
     */
    saveSubscribedPlates(plates) {
        try {
            localStorage.setItem('subscribedPlates', JSON.stringify(plates));
            return true;
        } catch (error) {
            console.error('Error saving subscribed plates:', error);
            return false;
        }
    },
    
    /**
     * Render subscribed plates list
     */
    renderSubscribedList() {
        const listEl = document.getElementById('subscribedList');
        const countEl = document.getElementById('subscribeCount');
        if (!listEl) return;
        
        const subscribed = this.getSubscribedPlates();
        
        // Update count
        if (countEl) {
            countEl.textContent = subscribed.length;
        }
        
        // Clear list
        listEl.textContent = '';
        
        if (subscribed.length === 0) {
            const noSubsMsg = document.createElement('p');
            noSubsMsg.className = 'no-subscriptions';
            noSubsMsg.textContent = 'Íµ¨ÎèÖ ??Î≤àÌò∏ ?ÜÏùå';
            listEl.appendChild(noSubsMsg);
            this.updateSubscribeButtonText();
            return;
        }
        
        // Render each subscribed plate
        subscribed.forEach(plate => {
            const item = document.createElement('div');
            item.className = 'subscribed-item';
            
            const plateSpan = document.createElement('span');
            plateSpan.className = 'subscribed-item-plate';
            plateSpan.textContent = plate;
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'subscribed-item-cancel';
            cancelBtn.textContent = 'Ï∑®ÏÜå';
            cancelBtn.onclick = () => SubscriptionManager.cancelSubscription(plate);
            
            item.appendChild(plateSpan);
            item.appendChild(cancelBtn);
            listEl.appendChild(item);
        });
        
        // Update button text after rendering list
        this.updateSubscribeButtonText();
    },
    
    /**
     * Cancel subscription for a plate
     */
    async cancelSubscription(plate) {
        let subscribed = this.getSubscribedPlates();
        subscribed = subscribed.filter(p => p !== plate);
        
        if (this.saveSubscribedPlates(subscribed)) {
            this.renderSubscribedList();
            
            // Update Firebase
            try {
                const token = await this.getFCMToken();
                if (token) {
                    await firebase.database().ref(`subscriptions/${token}/plates/${plate}`).remove();
                    // console.log(`Removed subscription for ${plate}`);
                }
            } catch (error) {
                console.error('Error removing subscription from Firebase:', error);
            }
            
            this.showToast('Íµ¨ÎèÖ??Ï∑®ÏÜå?òÏóà?µÎãà??, 'success');
        }
    },
    
    /**
     * Handle PWA installation and push subscription
     */
    async handleInstallAndSubscribe() {
        const currentPlate = document.getElementById('plateNumber')?.textContent;
        if (!currentPlate || currentPlate === '-') {
            this.showToast('Î≤àÌò∏???ïÎ≥¥Î•?Î∂àÎü¨?????ÜÏäµ?àÎã§', 'error');
            return;
        }
        
        // Check subscription limit
        let subscribed = this.getSubscribedPlates();
        if (subscribed.length >= this.MAX_SUBSCRIPTIONS && !subscribed.includes(currentPlate)) {
            this.showToast('ÏµúÎ? 10Í∞?Î≤àÌò∏?êÎßå Íµ¨ÎèÖ Í∞Ä?•Ìï©?àÎã§', 'error');
            return;
        }
        
        // Add current plate to subscriptions if not already subscribed
        if (!subscribed.includes(currentPlate)) {
            subscribed.push(currentPlate);
            this.saveSubscribedPlates(subscribed);
            this.updateSubscribeButtonText();
        }
        
        // Try PWA installation
        await this.installPWA();
        
        // Request notification permission
        await this.requestNotificationPermission();
    },
    
    /**
     * Install PWA
     */
    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                // console.log('PWA installed');
                this.showToast('?±Ïù¥ ?§Ïπò?òÏóà?µÎãà??, 'success');
            } else {
                // console.log('PWA installation declined');
            }
            
            this.deferredPrompt = null;
        } else {
            // Check if already installed
            if (window.matchMedia('(display-mode: standalone)').matches) {
                this.showToast('?¥Î? ?§Ïπò?òÏñ¥ ?àÏäµ?àÎã§', 'info');
            } else {
                // Show manual installation guide
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isAndroid = /Android/.test(navigator.userAgent);
                
                if (isIOS) {
                    this.showToast('Safari?êÏÑú Í≥µÏú† Î≤ÑÌäº ?????îÎ©¥??Ï∂îÍ?Î•??†ÌÉù?òÏÑ∏??, 'info');
                } else if (isAndroid) {
                    this.showToast('Î∏åÎùº?∞Ï? Î©îÎâ¥?êÏÑú "???îÎ©¥??Ï∂îÍ?"Î•??†ÌÉù?òÏÑ∏??, 'info');
                } else {
                    this.showToast('Î™®Î∞î??Î∏åÎùº?∞Ï??êÏÑú ???îÎ©¥??Ï∂îÍ??¥Ï£º?∏Ïöî', 'info');
                }
            }
        }
    },
    
    /**
     * Request notification permission and get FCM token
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            this.showToast('??Î∏åÎùº?∞Ï????åÎ¶º??ÏßÄ?êÌïòÏßÄ ?äÏäµ?àÎã§', 'error');
            return;
        }
        
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                // console.log('Notification permission granted');
                
                // Get FCM token
                const token = await this.getFCMToken();
                
                if (token) {
                    // Save subscriptions to Firebase
                    await this.syncSubscriptionsToFirebase(token);
                    this.showToast('?åÎ¶º Íµ¨ÎèÖ???ÑÎ£å?òÏóà?µÎãà??, 'success');
                    this.renderSubscribedList();
                }
            } else if (permission === 'denied') {
                // Show sequential alerts for denied permission
                alert('?åÎ¶º Í∂åÌïú???àÏö©?òÏ? ?äÏúºÎ©??åÎ¶º??Î∞õÏùÑ ???ÜÏäµ?àÎã§.');
                alert('?åÎ¶º??Î∞õÏúº?§Î©¥ ?§Ï†ï?êÏÑú Í∂åÌïú ?àÏö© ???§Ïãú Íµ¨ÎèÖ?¥Ï£º?∏Ïöî.');
                this.showToast('?åÎ¶º Í∂åÌïú??Í±∞Î??òÏóà?µÎãà??, 'error');
            } else {
                this.showToast('?åÎ¶º Í∂åÌïú???ÑÏöî?©Îãà??, 'info');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            this.showToast('?åÎ¶º ?§Ï†ï Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§', 'error');
        }
    },
    
    /**
     * Get FCM token
     */
    async getFCMToken() {
        if (!this.messaging) {
            console.error('Firebase Messaging not initialized');
            return null;
        }
        
        try {
            // VAPID key - injected during build from .env file
            const vapidKey = '__VAPID_KEY__';
            
            const token = await this.messaging.getToken({ 
                vapidKey: vapidKey,
                serviceWorkerRegistration: await navigator.serviceWorker.ready
            });
            
            if (token) {
                // console.log('FCM Token:', token);
                return token;
            } else {
                // console.log('No FCM token available');
                return null;
            }
        } catch (error) {
            console.error('Error getting FCM token:', error);
            
            // If VAPID key is not set, show helpful message
            if (error.code === 'messaging/invalid-vapid-key') {
                console.error('Please set your VAPID key in SubscriptionManager.getFCMToken()');
            }
            
            return null;
        }
    },
    
    /**
     * Sync subscriptions to Firebase
     */
    async syncSubscriptionsToFirebase(token) {
        const subscribed = this.getSubscribedPlates();
        
        try {
            const subscriptionData = {
                plates: subscribed,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            await firebase.database().ref(`subscriptions/${token}`).set(subscriptionData);
            // console.log('Subscriptions synced to Firebase');
        } catch (error) {
            console.error('Error syncing subscriptions to Firebase:', error);
        }
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `notification ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
};

// Global function for closing popup (called from HTML onclick)
function closeSubscribePopup() {
    SubscriptionManager.closeSubscribePopup();
}

// Note: SubscriptionManager.init() should be called manually from the page that uses it
// (e.g., plate.html calls it in its DOMContentLoaded event)

// ============================================================================
// FINAL KOREAN PLATE VOICE RECOGNITION (2025 ÏµúÏ†Å??Î≤ÑÏ†Ñ)
// ============================================================================

const AMBIGUOUS_HANGUL_TO_DIGIT = {
    '??:'1','??:'2','??:'3','??:'4','??:'5',
    '??:'6','Ïπ?:'7','??:'8','Íµ?:'9'
};

const VALID_PLATE_CHARS = 'Í∞Ä?òÎã§?ºÎßàÍ±∞ÎÑà?îÎü¨Î®∏Î≤Ñ?úÏñ¥?ÄÍ≥†ÎÖ∏?ÑÎ°úÎ™®Î≥¥?åÏò§Ï°∞Íµ¨?ÑÎëêÎ£®Î¨¥Î∂Ä?òÏö∞Ï£ºÏïÑÎ∞îÏÇ¨?êÌïò?àÌò∏Î∞?.split('');

const SPOKEN_NUMBER_MAP = {
    '??:'0','Í≥?:'0','?úÎ°ú':'0',
    '??:'1','?òÎÇò':'1','??:'2','??:'2','??:'3','??:'3',
    '??:'4','??:'4','??:'5','?§ÏÑØ':'5',
    '??:'6','Î•?:'6','?¨ÏÑØ':'6','Ïπ?:'7','?ºÍ≥±':'7',
    '??:'8','?¨Îçü':'8','Íµ?:'9','?ÑÌôâ':'9',
    '??:'10','??ùº':'11','??ù¥':'12','??Çº':'13','??Ç¨':'14',
    '??ò§':'15','??ú°':'16','??π†':'17','??åî':'18','??µ¨':'19'
};

const SPOKEN_KEYS = Object.keys(SPOKEN_NUMBER_MAP).sort((a,b)=>b.length-a.length);

// Korean spoken number to digit mapping (for pre-plate-letter positions)
const KOREAN_NUMBER_WORDS = {
    '??: '0', 'Í≥?: '0', '?úÎ°ú': '0', 'Îπ?: '0',
    '??: '1', '?òÎÇò': '1',
    '??: '2', '??: '2',
    '??: '3', '??: '3',
    '??: '4', '??: '4',
    '??: '5', '?§ÏÑØ': '5',
    '??: '6', 'Î•?: '6', '?¨ÏÑØ': '6',
    'Ïπ?: '7', '?ºÍ≥±': '7',
    '??: '8', '?¨Îçü': '8',
    'Íµ?: '9', '?ÑÌôâ': '9'
};

// Sort by length descending for proper replacement order
const KOREAN_NUMBER_KEYS = Object.keys(KOREAN_NUMBER_WORDS).sort((a, b) => b.length - a.length);

/**
 * Convert Korean number words to digits in positions before the plate letter
 * Handles cases like "Í≥µÍµ¨Î£?363" ??"09Î£?363", "?ÅÍµ¨Î£?363" ??"09Î£?363"
 * @param {string} transcript - Raw transcript
 * @returns {string} - Transcript with number words converted to digits before plate letter
 */
function convertKoreanNumbersBeforePlateLetter(transcript) {
    // Find the position of the plate letter (Í∞Ä?òÎã§?ºÎßàÍ±∞ÎÑà?îÎü¨Î®∏Î≤Ñ?úÏñ¥?ÄÍµ¨ÎàÑ?êÎ£®Î¨¥Î??òÏö∞Ï£ºÏïÑÎ∞îÏÇ¨?êÌïò?àÌò∏Î∞?
    const plateLetterMatch = transcript.match(/[Í∞Ä?òÎã§?ºÎßàÍ±∞ÎÑà?îÎü¨Î®∏Î≤Ñ?úÏñ¥?ÄÍµ¨ÎàÑ?êÎ£®Î¨¥Î??òÏö∞Ï£ºÏïÑÎ∞îÏÇ¨?êÌïò?àÌò∏Î∞?/);
    
    if (!plateLetterMatch) {
        return transcript; // No plate letter found, return as-is
    }
    
    const plateLetterIndex = transcript.indexOf(plateLetterMatch[0]);
    const beforeLetter = transcript.substring(0, plateLetterIndex);
    const afterLetter = transcript.substring(plateLetterIndex);
    
    // Convert Korean number words to digits in the part before the plate letter
    let converted = beforeLetter;
    for (const word of KOREAN_NUMBER_KEYS) {
        converted = converted.replace(new RegExp(word, 'g'), KOREAN_NUMBER_WORDS[word]);
    }
    
    return converted + afterLetter;
}

/**
 * Convert Korean number words to digits in positions after the plate letter
 * Handles cases like "12Í∞Ä?ºÏÇ¨?§Ïú°" ??"12Í∞Ä3456"
 * @param {string} transcript - Transcript (may have numbers before letter already converted)
 * @returns {string} - Transcript with number words converted to digits after plate letter
 */
function convertKoreanNumbersAfterPlateLetter(transcript) {
    // Find the position of the plate letter
    const plateLetterMatch = transcript.match(/[Í∞Ä?òÎã§?ºÎßàÍ±∞ÎÑà?îÎü¨Î®∏Î≤Ñ?úÏñ¥?ÄÍµ¨ÎàÑ?êÎ£®Î¨¥Î??òÏö∞Ï£ºÏïÑÎ∞îÏÇ¨?êÌïò?àÌò∏Î∞?/);
    
    if (!plateLetterMatch) {
        return transcript;
    }
    
    const plateLetterIndex = transcript.indexOf(plateLetterMatch[0]);
    const beforeAndLetter = transcript.substring(0, plateLetterIndex + 1);
    const afterLetter = transcript.substring(plateLetterIndex + 1);
    
    // Convert Korean number words to digits in the part after the plate letter
    let converted = afterLetter;
    for (const word of KOREAN_NUMBER_KEYS) {
        converted = converted.replace(new RegExp(word, 'g'), KOREAN_NUMBER_WORDS[word]);
    }
    
    return beforeAndLetter + converted;
}

// 1. DO NOT convert spoken numbers to digits in normalizeSpokenPlate()
// ??Keep Hangul as-is for ambiguity detection!
function normalizeSpokenPlate(transcript) {
    transcript = transcript.trim().replace(/\s+/g, '');  // Keep spaces removed only
    
    // Remove dashes only
    transcript = transcript.replace(/-/g, '');
    
    // IMPORTANT: Convert Korean number words (Í≥? ?? Íµ? etc.) to digits
    // This handles misrecognition like "Í≥µÍµ¨Î£?363" ??"09Î£?363"
    transcript = convertKoreanNumbersBeforePlateLetter(transcript);
    transcript = convertKoreanNumbersAfterPlateLetter(transcript);
    
    // Critical misrecognition fixes (these are NOT ambiguous ??always wrong)
    transcript = transcript
        .replace(/Î°?g, 'Î£?)
        .replace(/Î≥?g, 'Î≤?)
        .replace(/??g, '??)
        .replace(/??g, '??)
        .replace(/Í≥?g, 'Í±?)
        .replace(/??g, '??)
        .replace(/Î™?g, 'Î®?);
    
    // DO NOT TOUCH ????????????Ïπ???Íµ?here anymore!
    return transcript; // ??Return raw Hangul version
}

// 2. Update generateVoiceCandidates() ??now works perfectly
function generateVoiceCandidates(rawTranscript) {
    const raw = normalizeSpokenPlate(rawTranscript);  // ??now contains Hangul preserved
    const candidates = new Set();
    
    // Always try the version with ALL ambiguous Hangul ??digits
    let allDigits = raw;
    Object.entries(AMBIGUOUS_HANGUL_TO_DIGIT).forEach(([h, d]) => {
        allDigits = allDigits.replace(new RegExp(h, 'g'), d);
    });
    const allDigitsNorm = Validator.normalizePlate(allDigits);
    if (allDigitsNorm?.plate) candidates.add(allDigitsNorm.plate);
    
    // Always try keeping ALL ambiguous Hangul as letters
    const allHangulNorm = Validator.normalizePlate(raw);
    if (allHangulNorm?.plate) candidates.add(allHangulNorm.plate);
    
    // Generate mixed variants (smart: only up to 3 ambiguities to avoid explosion)
    const positions = [];
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (AMBIGUOUS_HANGUL_TO_DIGIT[ch]) {
            positions.push({i, hangul: ch, digit: AMBIGUOUS_HANGUL_TO_DIGIT[ch]});
            if (positions.length >= 3) break; // limit for performance
        }
    }
    
    const max = 1 << positions.length;
    for (let mask = 0; mask < max; mask++) {
        let variant = raw.split('');
        for (let b = 0; b < positions.length; b++) {
            variant[positions[b].i] = (mask & (1 << b)) ? positions[b].digit : positions[b].hangul;
        }
        const str = variant.join('');
        const norm = Validator.normalizePlate(str);
        if (norm?.plate) candidates.add(norm.plate);
    }
    
    // Final safety filters + smart Hangul fallback
    let list = Array.from(candidates);
    
    // Must have at least one Hangul letter
    list = list.filter(p => /[Í∞Ä-??/.test(p));
    
    // No dash allowed
    list = list.filter(p => !p.includes('-'));
    
    // KEY FIX: If pure digits detected (no Hangul), generate candidates with common letter substitutions
    // Common misrecognitions: 5?îÏò§, 4?îÏÇ¨ (these sound similar in Korean)
    if (list.length === 0) {
        const pureDigits = raw.replace(/[^0-9]/g, '');  // Extract only digits
        const cleanRaw = rawTranscript.trim().replace(/\s+/g, '').replace(/-/g, '');
        
        // If input looks like pure digits, try substituting 5?íÏò§ and 4?íÏÇ¨
        if (/^\d+$/.test(cleanRaw) || /^\d+$/.test(pureDigits)) {
            const digitStr = cleanRaw.replace(/[^0-9]/g, '') || pureDigits;
            
            // Common digit?íletter substitutions for Korean plates
            const DIGIT_TO_HANGUL = {'5': '??, '4': '??, '0': 'Í≥?};
            
            // Find positions where substitution makes sense (5, 4, 0)
            const subPositions = [];
            for (let i = 0; i < digitStr.length; i++) {
                if (DIGIT_TO_HANGUL[digitStr[i]]) {
                    subPositions.push({i, digit: digitStr[i], hangul: DIGIT_TO_HANGUL[digitStr[i]]});
                }
            }
            
            // Generate variants with letter substitutions (limit to first 3 for performance)
            const limitedPos = subPositions.slice(0, 3);
            const maxSub = 1 << limitedPos.length;
            for (let mask = 1; mask < maxSub; mask++) {  // Start from 1 (skip all-digits)
                let variant = digitStr.split('');
                for (let b = 0; b < limitedPos.length; b++) {
                    if (mask & (1 << b)) {
                        variant[limitedPos[b].i] = limitedPos[b].hangul;
                    }
                }
                const str = variant.join('');
                const norm = Validator.normalizePlate(str);
                if (norm?.plate && /[Í∞Ä-??/.test(norm.plate)) {
                    list.push(norm.plate);
                }
            }
        }
        
        // If still no candidates, try original raw with misrecognition fixes
        if (list.length === 0) {
            const fallbackRaw = rawTranscript.trim().replace(/\s+/g, '')
                .replace(/-/g, '')
                .replace(/Î°?g, 'Î£?)
                .replace(/Î≥?g, 'Î≤?)
                .replace(/??g, '??)
                .replace(/??g, '??)
                .replace(/Í≥?g, 'Í±?)
                .replace(/??g, '??)
                .replace(/Î™?g, 'Î®?);
            
            const fallbackNorm = Validator.normalizePlate(fallbackRaw);
            if (fallbackNorm?.plate && /[Í∞Ä-??/.test(fallbackNorm.plate)) {
                list = [fallbackNorm.plate];
            } else {
                // Last resort: show the digit string with possible letter positions marked
                list = [fallbackRaw || digitStr];
            }
        }
    }
    
    // Dedupe and limit
    list = [...new Set(list)].slice(0, 5);
    
    return list;
}

// 3. VoiceInput Í∞ùÏ≤¥ (Í∏∞Ï°¥ Í≤??ÑÏ†Ñ ÍµêÏ≤¥)
const VoiceInput = {
    recognition: null,
    activeInput: null,
    
    init() {
        document.getElementById('heroMicBtn')?.addEventListener('click', () => this.open(document.getElementById('plateInput')));
        document.getElementById('navbarMicBtn')?.addEventListener('click', () => this.open(document.getElementById('plateInput')));
    },
    
    open(input) {
        this.activeInput = input;
        const modal = document.getElementById('voiceInputModal');
        modal.classList.add('active');
        document.getElementById('voiceStep1').style.display = 'block';
        document.getElementById('voiceStep2').style.display = 'none';
        document.getElementById('voiceGuideText').style.display = 'block';
        document.getElementById('voiceListeningText').style.display = 'none';
        setTimeout(() => this.startRecognition(), 600);
    },
    
    close() {
        const modal = document.getElementById('voiceInputModal');
        modal.classList.remove('active');
        if (this.recognition) this.recognition.stop();
    },
    
    startRecognition() {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) return alert('Î∏åÎùº?∞Ï?Í∞Ä ?åÏÑ± ?∏Ïãù??ÏßÄ?êÌïòÏßÄ ?äÏäµ?àÎã§');
        
        this.recognition = new Recognition();
        this.recognition.lang = 'ko-KR';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        
        // Keep guide text visible, just show listening status below it
        document.getElementById('voiceGuideText').style.display = 'block';
        document.getElementById('voiceListeningText').style.display = 'block';
        
        let transcript = '';
        this.recognition.onresult = e => {
            transcript = Array.from(e.results)
                .filter(r => r.isFinal)
                .map(r => r[0].transcript)
                .join('');
        };
        
        this.recognition.onend = () => {
            if (!transcript) return alert('?åÏÑ±??Í∞êÏ??òÏ? ?äÏïò?µÎãà??), this.close();
            const candidates = generateVoiceCandidates(transcript);
            this.showCandidates(candidates);
        };
        
        this.recognition.onerror = () => this.close();
        this.recognition.start();
    },
    
    showCandidates(candidates) {
        document.getElementById('voiceStep1').style.display = 'none';
        document.getElementById('voiceStep2').style.display = 'block';
        const container = document.getElementById('voiceCandidates');
        container.textContent = '';
        
        candidates.forEach((plate, i) => {
            const el = document.createElement('div');
            el.className = 'voice-candidate';  // ??Removed ' best' entirely
            el.textContent = plate;
            el.onclick = () => this.selectCandidate(plate);
            container.appendChild(el);
        });
    },
    
    /**
     * Select a candidate and fill input
     * @param {string} plate - Selected plate number
     */
    selectCandidate(plate) {
        if (!this.activeInput) {
            console.error('No active input element');
            return;
        }
        
        // console.log('Selected candidate:', plate);
        
        // Fill input with selected plate
        this.activeInput.value = plate;
        
        // Trigger input event for validation
        const inputEvent = new Event('input', { bubbles: true });
        this.activeInput.dispatchEvent(inputEvent);
        
        // Close modal
        this.close();
    },
    
    /**
     * Restart voice recognition (go back to step 1)
     */
    restart() {
        const step1 = document.getElementById('voiceStep1');
        const step2 = document.getElementById('voiceStep2');
        const guideText = document.getElementById('voiceGuideText');
        const listeningText = document.getElementById('voiceListeningText');
        
        if (!step1 || !step2) {
            console.error('Voice step elements not found');
            return;
        }
        
        // Reset to step 1
        step1.style.display = 'block';
        step2.style.display = 'none';
        
        // Reset guide and listening text
        if (guideText) guideText.style.display = 'block';
        if (listeningText) listeningText.style.display = 'none';
        
        // Clear candidates
        this.candidates = [];
        
        // Restart recognition
        setTimeout(() => this.startRecognition(), 600);
        
        // console.log('Voice recognition restarted');
    }
};

// Initialize VoiceInput when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VoiceInput.init();
    });
} else {
    // DOM is already ready
    VoiceInput.init();
}


// ============================================================================
// UPDATE CHECK FUNCTIONALITY
// ============================================================================

/**
 * Update Check Manager
 * Clears cache and reloads the page to get the latest deployed version
 */
const UpdateChecker = {
    /**
     * Initialize update check button
     */
    init() {
        const updateBtn = document.getElementById('updateCheckBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.checkForUpdates());
        }
    },

    /**
     * Check for updates and reload
     */
    async checkForUpdates() {
        const updateBtn = document.getElementById('updateCheckBtn');
        if (!updateBtn) return;

        try {
            // Add checking animation
            updateBtn.classList.add('checking');
            
            // Clear all caches
            await this.clearAllCaches();
            
            // Unregister service worker if exists
            await this.unregisterServiceWorker();
            
            // Show success message
            this.showUpdateMessage('?ÖÎç∞?¥Ìä∏ ?ÑÎ£å! ?òÏù¥ÏßÄÎ•??àÎ°úÍ≥†Ïπ®?©Îãà??..');
            
            // Reload page after short delay
            setTimeout(() => {
                window.location.reload(true);
            }, 1000);
            
        } catch (error) {
            console.error('Update check failed:', error);
            updateBtn.classList.remove('checking');
            this.showUpdateMessage('?ÖÎç∞?¥Ìä∏ ?ïÏù∏ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.', true);
        }
    },

    /**
     * Clear all browser caches
     */
    async clearAllCaches() {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        // console.log('Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
                // console.log('All caches cleared');
            } catch (error) {
                console.error('Error clearing caches:', error);
            }
        }
    },

    /**
     * Unregister service worker
     */
    async unregisterServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(
                    registrations.map(registration => {
                        // console.log('Unregistering service worker');
                        return registration.unregister();
                    })
                );
                // console.log('Service worker unregistered');
            } catch (error) {
                console.error('Error unregistering service worker:', error);
            }
        }
    },

    /**
     * Show update message to user
     */
    showUpdateMessage(message, isError = false) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${isError ? '#ef4444' : '#22c55e'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: 'GmarketSans', sans-serif;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize UpdateChecker when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UpdateChecker.init();
    });
} else {
    UpdateChecker.init();
}
