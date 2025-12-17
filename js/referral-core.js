/**
 * SafeDrive Referral Core Module
 * 추천인 시스템 핵심 로직
 */

const ReferralCore = (function() {
    'use strict';
    
    // Constants
    const REFERRAL_ID_LENGTH = 12;
    const DAILY_LIMIT = 50;
    const BASE32_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동 방지: I, O, 0, 1 제외
    const STORAGE_KEYS = {
        REFERRER_ID: 'sd_referrer_id',
        VISITOR_ID: 'sd_visitor_id',
        INCOMING_REF: 'sd_incoming_ref'
    };
    
    // Firebase Database Reference
    let db = null;
    
    /**
     * Firebase 초기화 확인
     */
    function ensureFirebase() {
        if (!db && typeof firebase !== 'undefined' && firebase.database) {
            db = firebase.database();
        }
        return db;
    }
    
    /**
     * 오늘 날짜 문자열 (YYYYMMDD)
     */
    function getTodayString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
    
    /**
     * In-app 브라우저 감지
     * @returns {boolean} in-app 브라우저이면 true
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
                console.log('🚫 In-app browser detected:', ua);
                return true;
            }
        }
        
        // Additional check: if it's a webview without standalone mode
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        const isWebView = !isStandalone && /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
        
        if (isWebView && (ua.includes('wv') || ua.includes('Version/'))) {
            console.log('🚫 WebView detected:', ua);
            return true;
        }
        
        return false;
    }
    
    /**
     * 12자 Base32 추천인 ID 생성
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
     * 추천인 ID 존재 여부 확인 (RTDB)
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
     * 고유한 추천인 ID 생성 (중복 확인 포함)
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
     * 방문자 ID 생성/저장
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
     * 내 추천인 ID 가져오기 (없으면 생성)
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
                    console.log('✅ Referrer created via Cloud Function:', referrerId);
                } catch (error) {
                    console.error('Error creating referrer:', error);
                }
            }
        }
        
        return referrerId;
    }
    
    /**
     * URL에서 ?ref= 파라미터 감지 및 저장
     */
    function captureIncomingRef() {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        
        if (ref && ref.length === REFERRAL_ID_LENGTH) {
            // 유효한 추천 코드인 경우 저장
            localStorage.setItem(STORAGE_KEYS.INCOMING_REF, ref);
            console.log('📥 Referral code captured:', ref);
            return ref;
        }
        
        return localStorage.getItem(STORAGE_KEYS.INCOMING_REF);
    }
    
    /**
     * 저장된 incoming ref 가져오기
     */
    function getIncomingRef() {
        return localStorage.getItem(STORAGE_KEYS.INCOMING_REF);
    }
    
    /**
     * 추천인의 오늘 카운트 가져오기
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
     * 오늘 50회 달성 선착순 winners 확인
     */
    async function getDailyWinners() {
        const database = ensureFirebase();
        if (!database) return [];
        
        const today = getTodayString();
        try {
            const snapshot = await database.ref(`referrals/dailyWinners/${today}`).once('value');
            const data = snapshot.val() || {};
            // achievedAt 기준 정렬
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
     * 오늘 리더보드 TOP3 가져오기
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
     * 오늘 보상 대상 3인 계산 (Hybrid 로직)
     * - 기본: 50회 달성 선착순 3명
     * - 백업: winners가 3명 미만이면 TOP3로 부족분 채움
     */
    async function getTodayRewardRecipients() {
        const winners = await getDailyWinners();
        const winnerIds = new Set(winners.map(w => w.id));
        
        // winners가 3명이면 그대로 반환
        if (winners.length >= 3) {
            return winners.slice(0, 3).map(w => w.id);
        }
        
        // 부족분을 TOP3에서 채움
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
     * 오늘 3등 점수 가져오기
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
     * plate.html 진입 시 referral 성공 처리
     * @param {string} plateNumber - 유효한 번호판 번호
     */
    async function onPlateView(plateNumber) {
        if (!plateNumber) return { success: false, reason: 'no_plate' };
        
        const incomingRef = getIncomingRef();
        if (!incomingRef) return { success: false, reason: 'no_referral' };
        
        const myReferrerId = localStorage.getItem(STORAGE_KEYS.REFERRER_ID);
        const visitorId = ensureVisitorId();
        const today = getTodayString();
        
        // 1. Self-referral 금지
        if (incomingRef === myReferrerId) {
            console.log('❌ Self-referral blocked');
            return { success: false, reason: 'self_referral' };
        }
        
        // 2. 방문자→추천인 조합 하루 1회 제한
        const usedKey = `sd_ref_used_${incomingRef}_${visitorId}_${today}`;
        if (localStorage.getItem(usedKey)) {
            console.log('❌ Already used today for this referrer');
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
                
                console.log('✅ Referral success! New count:', result.data.newDailyCount);
                
                if (result.data.isWinner) {
                    console.log('🏆 Winner! Reached 50 referrals!');
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
     * 내 추천 통계 가져오기
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
     * 추천 링크 생성
     */
    function getReferralLink(referrerId) {
        const baseUrl = window.location.origin;
        return `${baseUrl}/?ref=${referrerId}`;
    }
    
    /**
     * index.html 로드 시 초기화
     */
    async function initOnIndexLoad() {
        console.log('🚀 ReferralCore initializing on index...');
        
        // In-app 브라우저 체크
        if (isInAppBrowser()) {
            console.log('⚠️ In-app browser detected. Skipping UUID generation.');
            console.log('💡 Please open in Chrome or Safari for full referral features.');
            
            // URL에서 ref 파라미터만 캡처 (UUID 생성 안 함)
            captureIncomingRef();
            
            return;
        }
        
        // 일반 브라우저에서만 UUID 생성
        console.log('✅ Standard browser detected. Generating UUIDs...');
        
        // 방문자 ID 확보
        ensureVisitorId();
        
        // URL에서 ref 파라미터 캡처
        captureIncomingRef();
        
        // 내 추천인 ID 확보 (없으면 생성)
        await getOrCreateReferrerId();
        
        console.log('✅ ReferralCore initialized');
    }
    
    /**
     * plate.html 로드 시 초기화
     * @param {string} plateNumber - 유효한 번호판 번호
     */
    async function initOnPlateLoad(plateNumber) {
        console.log('🚀 ReferralCore initializing on plate...');
        
        // In-app 브라우저 체크
        if (isInAppBrowser()) {
            console.log('⚠️ In-app browser detected. Skipping referral processing.');
            return { success: false, reason: 'in_app_browser' };
        }
        
        // 방문자 ID 확보
        ensureVisitorId();
        
        // referral 성공 처리
        const result = await onPlateView(plateNumber);
        
        console.log('✅ ReferralCore plate init result:', result);
        return result;
    }
    
    // Public API
    return {
        // 초기화
        initOnIndexLoad,
        initOnPlateLoad,
        onPlateView,
        
        // ID 관리
        ensureVisitorId,
        getOrCreateReferrerId,
        captureIncomingRef,
        getIncomingRef,
        
        // 유틸리티
        isInAppBrowser,
        
        // 통계
        getMyStats,
        getReferrerDailyCount,
        getDailyWinners,
        getDailyTop3,
        getTodayRewardRecipients,
        getThirdPlaceScore,
        
        // 유틸
        getReferralLink,
        getTodayString,
        
        // 상수
        DAILY_LIMIT,
        STORAGE_KEYS
    };
})();

// 전역 노출
if (typeof window !== 'undefined') {
    window.ReferralCore = ReferralCore;
}
