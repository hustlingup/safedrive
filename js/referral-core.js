/**
 * SafeDrive Referral Core Module
 * Ï∂îÏ≤ú???úÏä§???µÏã¨ Î°úÏßÅ
 */

const ReferralCore = (function() {
    'use strict';
    
    // Constants
    const REFERRAL_ID_LENGTH = 12;
    const DAILY_LIMIT = 50;
    const BASE32_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ?ºÎèô Î∞©Ï?: I, O, 0, 1 ?úÏô∏
    const STORAGE_KEYS = {
        REFERRER_ID: 'sd_referrer_id',
        VISITOR_ID: 'sd_visitor_id',
        INCOMING_REF: 'sd_incoming_ref'
    };
    
    // Firebase Database Reference
    let db = null;
    
    /**
     * Firebase Ï¥àÍ∏∞???ïÏù∏
     */
    function ensureFirebase() {
        if (!db && typeof firebase !== 'undefined' && firebase.database) {
            db = firebase.database();
        }
        return db;
    }
    
    /**
     * ?§Îäò ?†Ïßú Î¨∏Ïûê??(YYYYMMDD)
     */
    function getTodayString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
    
    /**
     * In-app Î∏åÎùº?∞Ï? Í∞êÏ?
     * @returns {boolean} in-app Î∏åÎùº?∞Ï??¥Î©¥ true
     */
    function isInAppBrowser() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        
        // Common in-app browser patterns
        const inAppPatterns = [
            /FBAN|FBAV/i,           // Facebook
            /Instagram/i,            // Instagram
            /Line\//i,               // Line
            /KAKAOTALK/i,            // KakaoTalk
            /Snapchat/i,             // Snapchat
            /Twitter/i,              // Twitter
            /WhatsApp/i,             // WhatsApp
            /LinkedIn/i,             // LinkedIn
            /Telegram/i,             // Telegram
            /WeChat/i,               // WeChat
            /Weibo/i,                // Weibo
            /Puffin/i,               // Puffin
            /SamsungBrowser.*SAMSUNG/i, // Samsung Internet in-app
            /Naver/i,                // Naver
            /Daum/i,                 // Daum
            /Band/i,                 // Band
            /KakaoStory/i,           // KakaoStory
            /everytimeApp/i,         // Everytime
            /Blind/i                 // Blind
        ];
        
        // Check if any pattern matches
        for (const pattern of inAppPatterns) {
            if (pattern.test(ua)) {
                // console.log('?ö´ In-app browser detected:', ua);
                return true;
            }
        }
        
        // Additional check: if it's a webview without standalone mode
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        const isWebView = !isStandalone && /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
        
        if (isWebView && (ua.includes('wv') || ua.includes('Version/'))) {
            // console.log('?ö´ WebView detected:', ua);
            return true;
        }
        
        return false;
    }
    
    /**
     * 12??Base32 Ï∂îÏ≤ú??ID ?ùÏÑ±
     */
    function generateReferrerId() {
        let id = '';
        const array = new Uint8Array(REFERRAL_ID_LENGTH);
        crypto.getRandomValues(array);
        for (let i = 0; i < REFERRAL_ID_LENGTH; i++) {
            id += BASE32_CHARS[array[i] % BASE32_CHARS.length];
        }
        return id;
    }
    
    /**
     * Ï∂îÏ≤ú??ID Ï°¥Ïû¨ ?¨Î? ?ïÏù∏ (RTDB)
     */
    async function checkReferrerIdExists(id) {
        const database = ensureFirebase();
        if (!database) return false;
        
        try {
            const snapshot = await database.ref(`referrals/users/${id}`).once('value');
            return snapshot.exists();
        } catch (error) {
            console.error('Error checking referrer ID:', error);
            return false;
        }
    }

    /**
     * Í≥†Ïú†??Ï∂îÏ≤ú??ID ?ùÏÑ± (Ï§ëÎ≥µ ?ïÏù∏ ?¨Ìï®)
     */
    async function createUniqueReferrerId() {
        let id = generateReferrerId();
        let attempts = 0;
        const maxAttempts = 10;
        
        while (await checkReferrerIdExists(id) && attempts < maxAttempts) {
            id = generateReferrerId();
            attempts++;
        }
        
        return id;
    }
    
    /**
     * Î∞©Î¨∏??ID ?ùÏÑ±/?Ä??
     */
    function ensureVisitorId() {
        let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
        if (!visitorId) {
            visitorId = 'v_' + generateReferrerId();
            localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId);
        }
        return visitorId;
    }
    
    /**
     * ??Ï∂îÏ≤ú??ID Í∞Ä?∏Ïò§Í∏?(?ÜÏúºÎ©??ùÏÑ±)
     */
    async function getOrCreateReferrerId() {
        let referrerId = localStorage.getItem(STORAGE_KEYS.REFERRER_ID);
        
        if (!referrerId) {
            referrerId = await createUniqueReferrerId();
            localStorage.setItem(STORAGE_KEYS.REFERRER_ID, referrerId);
            
            // Use Cloud Function to create referrer
            if (typeof firebase !== 'undefined' && firebase.functions) {
                try {
                    const createReferrer = firebase.functions().httpsCallable('createReferrer');
                    await createReferrer({ referrerId });
                    // console.log('??Referrer created via Cloud Function:', referrerId);
                } catch (error) {
                    console.error('Error creating referrer:', error);
                }
            }
        }
        
        return referrerId;
    }
    
    /**
     * URL?êÏÑú ?ref= ?åÎùºÎØ∏ÌÑ∞ Í∞êÏ? Î∞??Ä??
     */
    function captureIncomingRef() {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        
        if (ref && ref.length === REFERRAL_ID_LENGTH) {
            // ?†Ìö®??Ï∂îÏ≤ú ÏΩîÎìú??Í≤ΩÏö∞ ?Ä??
            localStorage.setItem(STORAGE_KEYS.INCOMING_REF, ref);
            // console.log('?ì• Referral code captured:', ref);
            return ref;
        }
        
        return localStorage.getItem(STORAGE_KEYS.INCOMING_REF);
    }
    
    /**
     * ?Ä?•Îêú incoming ref Í∞Ä?∏Ïò§Í∏?
     */
    function getIncomingRef() {
        return localStorage.getItem(STORAGE_KEYS.INCOMING_REF);
    }
    
    /**
     * Ï∂îÏ≤ú?∏Ïùò ?§Îäò Ïπ¥Ïö¥??Í∞Ä?∏Ïò§Í∏?
     */
    async function getReferrerDailyCount(referrerId) {
        const database = ensureFirebase();
        if (!database) return 0;
        
        const today = getTodayString();
        try {
            const snapshot = await database.ref(`referrals/users/${referrerId}/daily/${today}`).once('value');
            return snapshot.val() || 0;
        } catch (error) {
            console.error('Error getting daily count:', error);
            return 0;
        }
    }

    /**
     * ?§Îäò 50???¨ÏÑ± ?†Ï∞©??winners ?ïÏù∏
     */
    async function getDailyWinners() {
        const database = ensureFirebase();
        if (!database) return [];
        
        const today = getTodayString();
        try {
            const snapshot = await database.ref(`referrals/dailyWinners/${today}`).once('value');
            const data = snapshot.val() || {};
            // achievedAt Í∏∞Ï? ?ïÎ†¨
            return Object.entries(data)
                .map(([id, info]) => ({ id, achievedAt: info.achievedAt || info }))
                .sort((a, b) => a.achievedAt - b.achievedAt)
                .slice(0, 3);
        } catch (error) {
            console.error('Error getting daily winners:', error);
            return [];
        }
    }
    
    /**
     * ?§Îäò Î¶¨ÎçîÎ≥¥Îìú TOP3 Í∞Ä?∏Ïò§Í∏?
     */
    async function getDailyTop3() {
        const database = ensureFirebase();
        if (!database) return [];
        
        const today = getTodayString();
        try {
            const snapshot = await database.ref(`referrals/leaderboards/daily/${today}`)
                .orderByValue()
                .limitToLast(10)
                .once('value');
            
            const data = snapshot.val() || {};
            return Object.entries(data)
                .map(([id, count]) => ({ id, count }))
                .sort((a, b) => b.count - a.count);
        } catch (error) {
            console.error('Error getting daily top:', error);
            return [];
        }
    }
    
    /**
     * ?§Îäò Î≥¥ÏÉÅ ?Ä??3??Í≥ÑÏÇ∞ (Hybrid Î°úÏßÅ)
     * - Í∏∞Î≥∏: 50???¨ÏÑ± ?†Ï∞©??3Î™?
     * - Î∞±ÏóÖ: winnersÍ∞Ä 3Î™?ÎØ∏Îßå?¥Î©¥ TOP3Î°?Î∂ÄÏ°±Î∂Ñ Ï±ÑÏ?
     */
    async function getTodayRewardRecipients() {
        const winners = await getDailyWinners();
        const winnerIds = new Set(winners.map(w => w.id));
        
        // winnersÍ∞Ä 3Î™ÖÏù¥Î©?Í∑∏Î?Î°?Î∞òÌôò
        if (winners.length >= 3) {
            return winners.slice(0, 3).map(w => w.id);
        }
        
        // Î∂ÄÏ°±Î∂Ñ??TOP3?êÏÑú Ï±ÑÏ?
        const top = await getDailyTop3();
        const result = [...winners.map(w => w.id)];
        
        for (const entry of top) {
            if (result.length >= 3) break;
            if (!winnerIds.has(entry.id) && !result.includes(entry.id)) {
                result.push(entry.id);
            }
        }
        
        return result;
    }
    
    /**
     * ?§Îäò 3???êÏàò Í∞Ä?∏Ïò§Í∏?
     */
    async function getThirdPlaceScore() {
        const top = await getDailyTop3();
        if (top.length >= 3) {
            return top[2].count;
        }
        return top.length > 0 ? top[top.length - 1].count : 0;
    }

    /**
     * Generate browser fingerprint for bot prevention
     */
    async function generateFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.platform
        ];
        
        const data = components.join('|');
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * plate.html ÏßÑÏûÖ ??referral ?±Í≥µ Ï≤òÎ¶¨
     * @param {string} plateNumber - ?†Ìö®??Î≤àÌò∏??Î≤àÌò∏
     */
    async function onPlateView(plateNumber) {
        if (!plateNumber) return { success: false, reason: 'no_plate' };
        
        const incomingRef = getIncomingRef();
        if (!incomingRef) return { success: false, reason: 'no_referral' };
        
        const myReferrerId = localStorage.getItem(STORAGE_KEYS.REFERRER_ID);
        const visitorId = ensureVisitorId();
        const today = getTodayString();
        
        // 1. Self-referral Í∏àÏ?
        if (incomingRef === myReferrerId) {
            // console.log('??Self-referral blocked');
            return { success: false, reason: 'self_referral' };
        }
        
        // 2. Î∞©Î¨∏?ê‚ÜíÏ∂îÏ≤ú??Ï°∞Ìï© ?òÎ£® 1???úÌïú
        const usedKey = `sd_ref_used_${incomingRef}_${visitorId}_${today}`;
        if (localStorage.getItem(usedKey)) {
            // console.log('??Already used today for this referrer');
            return { success: false, reason: 'already_used_today' };
        }
        
        // 3. Use Cloud Function for secure increment with bot prevention
        try {
            if (typeof firebase === 'undefined' || !firebase.functions) {
                throw new Error('Firebase Functions not available');
            }
            
            // Generate fingerprint for bot prevention
            const fingerprint = await generateFingerprint();
            
            // Generate nonce for replay prevention
            const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            // Call Cloud Function
            const secureReferralIncrement = firebase.functions().httpsCallable('secureReferralIncrement');
            const result = await secureReferralIncrement({
                referrerId: incomingRef,
                visitorId: visitorId,
                fingerprint: fingerprint,
                timestamp: Date.now(),
                nonce: nonce
            });
            
            if (result.data.success) {
                // Mark as used
                localStorage.setItem(usedKey, '1');
                
                // console.log('??Referral success! New count:', result.data.newDailyCount);
                
                if (result.data.isWinner) {
                    // console.log('?èÜ Winner! Reached 50 referrals!');
                }
                
                return {
                    success: true,
                    newCount: result.data.newDailyCount,
                    totalCount: result.data.newTotalCount,
                    isWinner: result.data.isWinner
                };
            }
            
            return { success: false, reason: 'cloud_function_failed' };
            
        } catch (error) {
            console.error('Error processing referral:', error);
            
            // Parse error message for better user feedback
            if (error.code === 'resource-exhausted') {
                return { success: false, reason: 'rate_limit_or_daily_limit' };
            } else if (error.code === 'failed-precondition') {
                return { success: false, reason: 'invalid_request' };
            }
            
            return { success: false, reason: 'transaction_error' };
        }
    }

    /**
     * ??Ï∂îÏ≤ú ?µÍ≥Ñ Í∞Ä?∏Ïò§Í∏?
     */
    async function getMyStats() {
        const referrerId = localStorage.getItem(STORAGE_KEYS.REFERRER_ID);
        if (!referrerId) return null;
        
        const database = ensureFirebase();
        if (!database) return null;
        
        const today = getTodayString();
        
        try {
            const userSnapshot = await database.ref(`referrals/users/${referrerId}`).once('value');
            const userData = userSnapshot.val() || {};
            
            const todayCount = userData.daily?.[today] || 0;
            const totalCount = userData.total || 0;
            
            return {
                referrerId,
                todayCount,
                totalCount,
                remainingToday: Math.max(0, DAILY_LIMIT - todayCount)
            };
        } catch (error) {
            console.error('Error getting my stats:', error);
            return null;
        }
    }
    
    /**
     * Ï∂îÏ≤ú ÎßÅÌÅ¨ ?ùÏÑ±
     */
    function getReferralLink(referrerId) {
        const baseUrl = window.location.origin;
        return `${baseUrl}/?ref=${referrerId}`;
    }
    
    /**
     * index.html Î°úÎìú ??Ï¥àÍ∏∞??
     */
    async function initOnIndexLoad() {
        // console.log('?? ReferralCore initializing on index...');
        
        // In-app Î∏åÎùº?∞Ï? Ï≤¥ÌÅ¨
        if (isInAppBrowser()) {
            // console.log('?†Ô∏è In-app browser detected. Skipping UUID generation.');
            // console.log('?í° Please open in Chrome or Safari for full referral features.');
            
            // URL?êÏÑú ref ?åÎùºÎØ∏ÌÑ∞Îß?Ï∫°Ï≤ò (UUID ?ùÏÑ± ????
            captureIncomingRef();
            
            return;
        }
        
        // ?ºÎ∞ò Î∏åÎùº?∞Ï??êÏÑúÎß?UUID ?ùÏÑ±
        // console.log('??Standard browser detected. Generating UUIDs...');
        
        // Î∞©Î¨∏??ID ?ïÎ≥¥
        ensureVisitorId();
        
        // URL?êÏÑú ref ?åÎùºÎØ∏ÌÑ∞ Ï∫°Ï≤ò
        captureIncomingRef();
        
        // ??Ï∂îÏ≤ú??ID ?ïÎ≥¥ (?ÜÏúºÎ©??ùÏÑ±)
        await getOrCreateReferrerId();
        
        // console.log('??ReferralCore initialized');
    }
    
    /**
     * plate.html Î°úÎìú ??Ï¥àÍ∏∞??
     * @param {string} plateNumber - ?†Ìö®??Î≤àÌò∏??Î≤àÌò∏
     */
    async function initOnPlateLoad(plateNumber) {
        // console.log('?? ReferralCore initializing on plate...');
        
        // In-app Î∏åÎùº?∞Ï? Ï≤¥ÌÅ¨
        if (isInAppBrowser()) {
            // console.log('?†Ô∏è In-app browser detected. Skipping referral processing.');
            return { success: false, reason: 'in_app_browser' };
        }
        
        // Î∞©Î¨∏??ID ?ïÎ≥¥
        ensureVisitorId();
        
        // referral ?±Í≥µ Ï≤òÎ¶¨
        const result = await onPlateView(plateNumber);
        
        // console.log('??ReferralCore plate init result:', result);
        return result;
    }
    
    // Public API
    return {
        // Ï¥àÍ∏∞??
        initOnIndexLoad,
        initOnPlateLoad,
        onPlateView,
        
        // ID Í¥ÄÎ¶?
        ensureVisitorId,
        getOrCreateReferrerId,
        captureIncomingRef,
        getIncomingRef,
        
        // ?†Ìã∏Î¶¨Ìã∞
        isInAppBrowser,
        
        // ?µÍ≥Ñ
        getMyStats,
        getReferrerDailyCount,
        getDailyWinners,
        getDailyTop3,
        getTodayRewardRecipients,
        getThirdPlaceScore,
        
        // ?†Ìã∏
        getReferralLink,
        getTodayString,
        
        // ?ÅÏàò
        DAILY_LIMIT,
        STORAGE_KEYS
    };
})();

// ?ÑÏó≠ ?∏Ï∂ú
if (typeof window !== 'undefined') {
    window.ReferralCore = ReferralCore;
}
