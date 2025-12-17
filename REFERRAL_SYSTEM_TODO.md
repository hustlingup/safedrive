# Referral System - Cloud Function Implementation Guide

## 🎯 Current Issue

The referral system in `js/referral-core.js` writes directly to Firebase RTDB:

```javascript
// ❌ Direct write - will fail with new security rules
await database.ref(`referrals/users/${referrerId}`).set({
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    total: 0
});

// ❌ Direct transaction - will fail with new security rules
await userRef.child('total').transaction(current => (current || 0) + 1);
await dailyRef.transaction(current => (current || 0) + 1);
await leaderboardRef.transaction(current => (current || 0) + 1);
```

## 🔒 Required Solution

Create a Cloud Function similar to `secureIncrementCounter` but for referrals.

---

## 📝 Implementation Steps

### Step 1: Create Cloud Function

Create `functions/secureReferralIncrement.js`:

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();

// Configuration
const CONFIG = {
  DAILY_LIMIT: 50,
  RATE_LIMIT: {
    MAX_REQUESTS: 5,  // 5 referrals per minute
    WINDOW_MS: 60000
  }
};

// In-memory rate limiter (same as secureIncrement.js)
class ReferralRateLimiter {
  constructor() {
    this.buckets = new Map();
  }
  
  isAllowed(fingerprint) {
    const now = Date.now();
    let bucket = this.buckets.get(fingerprint);
    
    if (!bucket) {
      bucket = {
        tokens: CONFIG.RATE_LIMIT.MAX_REQUESTS,
        lastRefill: now
      };
      this.buckets.set(fingerprint, bucket);
    }
    
    const timeSinceRefill = now - bucket.lastRefill;
    if (timeSinceRefill >= CONFIG.RATE_LIMIT.WINDOW_MS) {
      bucket.tokens = CONFIG.RATE_LIMIT.MAX_REQUESTS;
      bucket.lastRefill = now;
    }
    
    if (bucket.tokens <= 0) return false;
    
    bucket.tokens--;
    return true;
  }
}

const rateLimiter = new ReferralRateLimiter();

/**
 * Secure Referral Increment Cloud Function
 * 
 * Request:
 * {
 *   referrerId: string,
 *   visitorId: string,
 *   fingerprint: string (SHA-256),
 *   timestamp: number,
 *   nonce: string
 * }
 */
exports.secureReferralIncrement = functions.https.onCall(async (data, context) => {
  try {
    const { referrerId, visitorId, fingerprint, timestamp, nonce } = data;
    
    // 1. Validate required fields
    if (!referrerId || !visitorId || !fingerprint || !timestamp || !nonce) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }
    
    // 2. Validate referrer ID format (12 chars)
    if (!/^[A-Z2-9]{12}$/.test(referrerId)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid referrer ID format"
      );
    }
    
    // 3. Validate timestamp (5 minutes max drift)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 300000) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Request timestamp invalid or expired"
      );
    }
    
    // 4. Validate nonce (prevent replay)
    const nonceRef = db.ref(`security/referralNonces/${nonce}`);
    const nonceResult = await nonceRef.transaction((current) => {
      if (current !== null) return; // Already used
      return Date.now();
    });
    
    if (!nonceResult.committed) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Request nonce invalid or already used"
      );
    }
    
    // 5. Rate limiting
    if (!rateLimiter.isAllowed(fingerprint)) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Rate limit exceeded"
      );
    }
    
    // 6. Get today's date (KST)
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now + kstOffset);
    const today = kstDate.toISOString().split('T')[0].replace(/-/g, '');
    
    // 7. Check daily limit for referrer
    const dailyRef = db.ref(`referrals/users/${referrerId}/daily/${today}`);
    const dailySnapshot = await dailyRef.once('value');
    const currentCount = dailySnapshot.val() || 0;
    
    if (currentCount >= CONFIG.DAILY_LIMIT) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Daily limit reached for this referrer"
      );
    }
    
    // 8. Increment counters atomically
    const userRef = db.ref(`referrals/users/${referrerId}`);
    const leaderboardRef = db.ref(`referrals/leaderboards/daily/${today}/${referrerId}`);
    
    // Increment total
    const totalResult = await userRef.child('total').transaction(
      (current) => (current || 0) + 1
    );
    
    // Increment daily
    const dailyResult = await dailyRef.transaction(
      (current) => (current || 0) + 1
    );
    
    // Increment leaderboard
    await leaderboardRef.transaction(
      (current) => (current || 0) + 1
    );
    
    const newDailyCount = dailyResult.snapshot.val();
    
    // 9. Check if reached 50 (winner)
    if (newDailyCount === CONFIG.DAILY_LIMIT) {
      const winnersRef = db.ref(`referrals/dailyWinners/${today}`);
      const winnersSnapshot = await winnersRef.once('value');
      const currentWinners = winnersSnapshot.val() || {};
      
      // Only first 3 winners
      if (Object.keys(currentWinners).length < 3) {
        await winnersRef.child(referrerId).set({
          achievedAt: admin.database.ServerValue.TIMESTAMP
        });
      }
    }
    
    // 10. Return success
    return {
      success: true,
      newDailyCount: newDailyCount,
      newTotalCount: totalResult.snapshot.val()
    };
    
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error("Unexpected error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred"
    );
  }
});

/**
 * Create new referrer (called once per user)
 */
exports.createReferrer = functions.https.onCall(async (data, context) => {
  try {
    const { referrerId } = data;
    
    if (!referrerId || !/^[A-Z2-9]{12}$/.test(referrerId)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid referrer ID"
      );
    }
    
    // Check if already exists
    const userRef = db.ref(`referrals/users/${referrerId}`);
    const snapshot = await userRef.once('value');
    
    if (snapshot.exists()) {
      return { success: true, exists: true };
    }
    
    // Create new referrer
    await userRef.set({
      createdAt: admin.database.ServerValue.TIMESTAMP,
      total: 0
    });
    
    return { success: true, exists: false };
    
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error("Unexpected error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred"
    );
  }
});
```

### Step 2: Export Functions

Update `functions/index.js`:

```javascript
// Add at the top
const { secureReferralIncrement, createReferrer } = require("./secureReferralIncrement");

// Add exports
exports.secureReferralIncrement = secureReferralIncrement;
exports.createReferrer = createReferrer;
```

### Step 3: Update Client Code

Update `js/referral-core.js`:

```javascript
// Replace getOrCreateReferrerId function
async function getOrCreateReferrerId() {
    let referrerId = localStorage.getItem(STORAGE_KEYS.REFERRER_ID);
    
    if (!referrerId) {
        referrerId = await createUniqueReferrerId();
        localStorage.setItem(STORAGE_KEYS.REFERRER_ID, referrerId);
        
        // Use Cloud Function to create referrer
        const database = ensureFirebase();
        if (database && typeof firebase !== 'undefined' && firebase.functions) {
            try {
                const createReferrer = firebase.functions().httpsCallable('createReferrer');
                await createReferrer({ referrerId });
            } catch (error) {
                console.error('Error creating referrer:', error);
            }
        }
    }
    
    return referrerId;
}

// Replace onPlateView function
async function onPlateView(plateNumber) {
    if (!plateNumber) return { success: false, reason: 'no_plate' };
    
    const database = ensureFirebase();
    if (!database) return { success: false, reason: 'no_firebase' };
    
    const incomingRef = getIncomingRef();
    if (!incomingRef) return { success: false, reason: 'no_referral' };
    
    const myReferrerId = localStorage.getItem(STORAGE_KEYS.REFERRER_ID);
    const visitorId = ensureVisitorId();
    const today = getTodayString();
    
    // 1. Self-referral check
    if (incomingRef === myReferrerId) {
        return { success: false, reason: 'self_referral' };
    }
    
    // 2. Already used today check
    const usedKey = `sd_ref_used_${incomingRef}_${visitorId}_${today}`;
    if (localStorage.getItem(usedKey)) {
        return { success: false, reason: 'already_used_today' };
    }
    
    // 3. Use Cloud Function for secure increment
    try {
        if (typeof firebase === 'undefined' || !firebase.functions) {
            throw new Error('Firebase Functions not available');
        }
        
        // Generate fingerprint
        const fingerprint = await generateFingerprint();
        
        // Generate nonce
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
            
            return {
                success: true,
                newCount: result.data.newDailyCount
            };
        }
        
        return { success: false, reason: 'cloud_function_failed' };
        
    } catch (error) {
        console.error('Error processing referral:', error);
        return { success: false, reason: 'transaction_error' };
    }
}

// Add fingerprint generation (similar to security.js)
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
```

### Step 4: Deploy

```bash
# 1. Deploy functions
firebase deploy --only functions

# 2. Deploy hosting (updated client code)
firebase deploy --only hosting

# 3. Deploy complete security rules
cp firebase-security-rules.json database.rules.json
firebase deploy --only database
```

---

## 🧪 Testing

### Test Referral Creation
```javascript
// In browser console
const createReferrer = firebase.functions().httpsCallable('createReferrer');
const result = await createReferrer({ referrerId: 'ABC123DEF456' });
console.log(result);
```

### Test Referral Increment
```javascript
// Visit with referral code
https://your-project.web.app/?ref=ABC123DEF456

// Navigate to plate page
// Check console for success message
```

### Check Logs
```bash
firebase functions:log --only secureReferralIncrement
```

---

## 📊 Benefits

### Before (Direct Write)
- ❌ No rate limiting
- ❌ No bot prevention
- ❌ Easy to abuse
- ❌ Can exceed daily limits

### After (Cloud Function)
- ✅ Rate limiting (5 referrals/minute)
- ✅ Nonce validation
- ✅ Timestamp validation
- ✅ Enforced daily limits
- ✅ Atomic transactions
- ✅ Winner detection

---

## 📝 Summary

1. **Create** `functions/secureReferralIncrement.js`
2. **Update** `functions/index.js` to export new functions
3. **Update** `js/referral-core.js` to use Cloud Functions
4. **Deploy** functions, hosting, and rules
5. **Test** referral system thoroughly

**Estimated Time:** 2-3 hours
**Complexity:** Medium (similar to existing secureIncrement)
**Priority:** Medium (can deploy plates first, referrals later)

---

**Status:** 📋 TODO
**Blocker:** No (can deploy plates without this)
**Recommendation:** Deploy plates first, then implement this
