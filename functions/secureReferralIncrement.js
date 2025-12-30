/**
 * Secure Referral Increment Cloud Function
 * 
 * Bot prevention system for SafeDrive referral program
 * - Server-side validation with rate limiting
 * - Atomic transactions for referral counters
 * - Daily limit enforcement (50 referrals per day)
 * - Winner detection (first 3 to reach 50)
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  DAILY_LIMIT: 50, // Max 50 referrals per day per referrer
  
  // Rate limiting: max requests per fingerprint per time window
  RATE_LIMIT: {
    MAX_REQUESTS: 5, // Max 5 referral increments per minute
    WINDOW_MS: 60000, // 1 minute window
  },
  
  // Request validation
  VALIDATION: {
    MAX_TIMESTAMP_DRIFT_MS: 300000, // 5 minutes max drift
    NONCE_EXPIRY_MS: 300000, // 5 minutes nonce validity
  },
};

// ============================================================================
// IN-MEMORY RATE LIMITER
// ============================================================================

class ReferralRateLimiter {
  constructor() {
    this.buckets = new Map();
    this.cleanupScheduled = false;
  }
  
  scheduleCleanup() {
    if (!this.cleanupScheduled) {
      this.cleanupScheduled = true;
      setInterval(() => this.cleanup(), 300000);
    }
  }
  
  isAllowed(fingerprint) {
    this.scheduleCleanup();
    
    const now = Date.now();
    let bucket = this.buckets.get(fingerprint);
    
    if (!bucket) {
      bucket = {
        tokens: CONFIG.RATE_LIMIT.MAX_REQUESTS,
        lastRefill: now,
        requests: [],
      };
      this.buckets.set(fingerprint, bucket);
    }
    
    // Refill tokens based on time elapsed
    const timeSinceRefill = now - bucket.lastRefill;
    if (timeSinceRefill >= CONFIG.RATE_LIMIT.WINDOW_MS) {
      bucket.tokens = CONFIG.RATE_LIMIT.MAX_REQUESTS;
      bucket.lastRefill = now;
      bucket.requests = [];
    }
    
    if (bucket.tokens <= 0) {
      console.warn(`Referral rate limit exceeded for fingerprint: ${fingerprint.substring(0, 8)}...`);
      return false;
    }
    
    // Check for suspicious rapid-fire requests
    bucket.requests.push(now);
    if (bucket.requests.length >= 2) {
      const lastRequest = bucket.requests[bucket.requests.length - 2];
      const interval = now - lastRequest;
      
      if (interval < 500) { // Less than 500ms between requests
        console.warn(`Suspicious rapid referral requests: ${interval}ms interval`);
        bucket.tokens -= 2; // Penalize
        return false;
      }
    }
    
    bucket.tokens--;
    return true;
  }
  
  cleanup() {
    const now = Date.now();
    const cutoff = now - (CONFIG.RATE_LIMIT.WINDOW_MS * 2);
    
    for (const [fingerprint, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        this.buckets.delete(fingerprint);
      }
    }
    
    // console.log(`Referral rate limiter cleanup: ${this.buckets.size} active fingerprints`);
  }
}

const rateLimiter = new ReferralRateLimiter();

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateTimestamp(timestamp) {
  const now = Date.now();
  const drift = Math.abs(now - timestamp);
  
  if (drift > CONFIG.VALIDATION.MAX_TIMESTAMP_DRIFT_MS) {
    console.warn(`Referral timestamp drift too large: ${drift}ms`);
    return false;
  }
  
  return true;
}

async function validateNonce(nonce) {
  try {
    const nonceRef = db.ref(`security/referralNonces/${nonce}`);
    
    const result = await nonceRef.transaction((current) => {
      if (current !== null) {
        return; // Nonce already used
      }
      return Date.now();
    });
    
    if (!result.committed) {
      console.warn(`Referral nonce already used: ${nonce.substring(0, 8)}...`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Referral nonce validation error:", error);
    return false;
  }
}

// ============================================================================
// MAIN CLOUD FUNCTIONS
// ============================================================================

/**
 * Secure Referral Increment Function
 * 
 * Request body:
 * {
 *   referrerId: string (12-char Base32),
 *   visitorId: string,
 *   fingerprint: string (SHA-256 hash),
 *   timestamp: number,
 *   nonce: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   newDailyCount: number,
 *   newTotalCount: number,
 *   isWinner?: boolean
 * }
 */
exports.secureReferralIncrement = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // ========================================================================
    // 1. VALIDATE REQUEST STRUCTURE
    // ========================================================================
    
    const { referrerId, visitorId, fingerprint, timestamp, nonce } = data;
    
    if (!referrerId || !visitorId || !fingerprint || !timestamp || !nonce) {
      console.warn("Referral: Missing required fields");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }
    
    // Validate referrer ID format (12-char Base32)
    if (!/^[A-Z2-9]{12}$/.test(referrerId)) {
      console.warn(`Referral: Invalid referrer ID format: ${referrerId}`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid referrer ID format"
      );
    }
    
    // Validate visitor ID format
    if (typeof visitorId !== "string" || visitorId.length < 5) {
      console.warn(`Referral: Invalid visitor ID: ${visitorId}`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid visitor ID"
      );
    }
    
    // Validate fingerprint (64-char hex = SHA-256)
    if (!/^[a-f0-9]{64}$/i.test(fingerprint)) {
      console.warn(`Referral: Invalid fingerprint format`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid fingerprint format"
      );
    }
    
    // ========================================================================
    // 2. VALIDATE TIMESTAMP
    // ========================================================================
    
    if (!validateTimestamp(timestamp)) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Request timestamp invalid or expired"
      );
    }
    
    // ========================================================================
    // 3. VALIDATE NONCE
    // ========================================================================
    
    const nonceValid = await validateNonce(nonce);
    if (!nonceValid) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Request nonce invalid or already used"
      );
    }
    
    // ========================================================================
    // 4. RATE LIMITING
    // ========================================================================
    
    if (!rateLimiter.isAllowed(fingerprint)) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Rate limit exceeded. Please try again later."
      );
    }
    
    // ========================================================================
    // 5. GET TODAY'S DATE (KST)
    // ========================================================================
    
    const now = Date.now();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now + kstOffset);
    const today = kstDate.toISOString().split("T")[0].replace(/-/g, "");
    
    // ========================================================================
    // 6. CHECK DAILY LIMIT
    // ========================================================================
    
    const dailyRef = db.ref(`referrals/users/${referrerId}/daily/${today}`);
    const dailySnapshot = await dailyRef.once("value");
    const currentCount = dailySnapshot.val() || 0;
    
    if (currentCount >= CONFIG.DAILY_LIMIT) {
      // console.log(`Referral: Daily limit reached for ${referrerId}`);
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Daily limit reached for this referrer"
      );
    }
    
    // ========================================================================
    // 7. ATOMIC COUNTER INCREMENTS
    // ========================================================================
    
    const userRef = db.ref(`referrals/users/${referrerId}`);
    const leaderboardRef = db.ref(`referrals/leaderboards/daily/${today}/${referrerId}`);
    
    // Increment total count
    const totalResult = await userRef.child("total").transaction((current) => {
      return (current || 0) + 1;
    });
    
    if (!totalResult.committed) {
      console.error("Referral: Total transaction failed");
      throw new functions.https.HttpsError(
        "aborted",
        "Failed to increment referral counter"
      );
    }
    
    // Increment daily count
    const dailyResult = await dailyRef.transaction((current) => {
      return (current || 0) + 1;
    });
    
    if (!dailyResult.committed) {
      console.error("Referral: Daily transaction failed");
      throw new functions.https.HttpsError(
        "aborted",
        "Failed to increment daily counter"
      );
    }
    
    // Increment leaderboard
    await leaderboardRef.transaction((current) => {
      return (current || 0) + 1;
    });
    
    const newDailyCount = dailyResult.snapshot.val();
    const newTotalCount = totalResult.snapshot.val();
    
    // ========================================================================
    // 8. WINNER DETECTION (First 3 to reach 50)
    // ========================================================================
    
    let isWinner = false;
    
    if (newDailyCount === CONFIG.DAILY_LIMIT) {
      const winnersRef = db.ref(`referrals/dailyWinners/${today}`);
      const winnersSnapshot = await winnersRef.once("value");
      const currentWinners = winnersSnapshot.val() || {};
      
      // Only first 3 winners
      if (Object.keys(currentWinners).length < 3) {
        await winnersRef.child(referrerId).set({
          achievedAt: admin.database.ServerValue.TIMESTAMP,
        });
        isWinner = true;
        // console.log(`Referral winner registered: ${referrerId}`);
      }
    }
    
    // ========================================================================
    // 9. RETURN SUCCESS
    // ========================================================================
    
    const duration = Date.now() - startTime;
    // console.log(`Referral increment successful: ${referrerId} = ${newDailyCount}/${CONFIG.DAILY_LIMIT} (${duration}ms)`);
    
    return {
      success: true,
      newDailyCount: newDailyCount,
      newTotalCount: newTotalCount,
      isWinner: isWinner,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof functions.https.HttpsError) {
      console.warn(`Referral request rejected (${duration}ms):`, error.message);
      throw error;
    }
    
    console.error(`Referral unexpected error (${duration}ms):`, error);
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred"
    );
  }
});

/**
 * Create New Referrer
 * Called once when a user first generates their referral ID
 * 
 * Request:
 * {
 *   referrerId: string (12-char Base32)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   exists: boolean
 * }
 */
exports.createReferrer = functions.https.onCall(async (data, context) => {
  try {
    const { referrerId } = data;
    
    if (!referrerId || !/^[A-Z2-9]{12}$/.test(referrerId)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid referrer ID format"
      );
    }
    
    // Check if already exists
    const userRef = db.ref(`referrals/users/${referrerId}`);
    const snapshot = await userRef.once("value");
    
    if (snapshot.exists()) {
      // console.log(`Referrer already exists: ${referrerId}`);
      return { success: true, exists: true };
    }
    
    // Create new referrer
    await userRef.set({
      createdAt: admin.database.ServerValue.TIMESTAMP,
      total: 0,
    });
    
    // console.log(`New referrer created: ${referrerId}`);
    return { success: true, exists: false };
    
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error("Create referrer error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create referrer"
    );
  }
});

/**
 * Cleanup old referral nonces
 * Runs daily at 3:30 AM KST (30 minutes after main cleanup)
 */
exports.cleanupReferralNonces = functions.pubsub
  .schedule("30 3 * * *")
  .timeZone("Asia/Seoul")
  .onRun(async (context) => {
    // console.log("Starting referral nonce cleanup...");
    
    try {
      const now = Date.now();
      const cutoffTime = now - CONFIG.VALIDATION.NONCE_EXPIRY_MS;
      
      const noncesRef = db.ref("security/referralNonces");
      const noncesSnapshot = await noncesRef.once("value");
      
      let noncesDeleted = 0;
      const noncesToDelete = [];
      
      noncesSnapshot.forEach((child) => {
        const timestamp = child.val();
        if (timestamp < cutoffTime) {
          noncesToDelete.push(child.key);
        }
      });
      
      for (const nonce of noncesToDelete) {
        await noncesRef.child(nonce).remove();
        noncesDeleted++;
      }
      
      // console.log(`Deleted ${noncesDeleted} expired referral nonces`);
      return null;
    } catch (error) {
      console.error("Referral nonce cleanup error:", error);
      return null;
    }
  });
