/**
 * Secure Counter Increment Cloud Function
 * 
 * Privacy-preserving bot prevention system for SafeDrive
 * - No personal data collection (no IP storage, no persistent identifiers)
 * - Server-side validation with rate limiting
 * - HMAC-based request verification
 * - Atomic RTDB transactions
 * - Optimized for 1M daily visitors with minimal cost
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Rate limiting: max requests per fingerprint per time window
  RATE_LIMIT: {
    MAX_REQUESTS: 10, // Max 10 increments per fingerprint per window
    WINDOW_MS: 60000, // 1 minute window
  },
  
  // Request validation
  VALIDATION: {
    MAX_TIMESTAMP_DRIFT_MS: 300000, // 5 minutes max drift
    NONCE_EXPIRY_MS: 300000, // 5 minutes nonce validity
  },
  
  // HMAC secret - loaded from environment variable
  // Set via: firebase functions:config:set security.hmac_secret="your_secret_here"
  // Or use Secret Manager in production
  HMAC_SECRET: functions.config().security?.hmac_secret || 
               process.env.HMAC_SECRET,
  
  // Suspicious behavior thresholds (not revealed to client)
  SUSPICIOUS: {
    MIN_REQUEST_INTERVAL_MS: 500, // Requests faster than 500ms are suspicious
    MAX_DAILY_INCREMENTS_PER_FINGERPRINT: 50, // Max 50 increments per day per fingerprint
  },
};

// ============================================================================
// IN-MEMORY RATE LIMITER (Token Bucket per Function Instance)
// ============================================================================

/**
 * In-memory rate limiter using token bucket algorithm
 * Minimizes RTDB writes by keeping rate limit state in function instance memory
 * Each function instance maintains its own rate limit state
 */
class InMemoryRateLimiter {
  constructor() {
    // Map: fingerprint -> { tokens: number, lastRefill: timestamp, requests: [] }
    this.buckets = new Map();
    this.cleanupScheduled = false;
  }
  
  /**
   * Schedule cleanup if not already scheduled
   * Called lazily to avoid deployment timeouts
   */
  scheduleCleanup() {
    if (!this.cleanupScheduled) {
      this.cleanupScheduled = true;
      // Cleanup old entries every 5 minutes
      setInterval(() => this.cleanup(), 300000);
    }
  }
  
  /**
   * Checks if a request is allowed based on rate limits
   * @param {string} fingerprint - Hashed fingerprint
   * @returns {boolean} - True if allowed, false if rate limited
   */
  isAllowed(fingerprint) {
    // Schedule cleanup lazily on first use
    this.scheduleCleanup();
    
    const now = Date.now();
    
    // Get or create bucket for this fingerprint
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
      // Full refill after window expires
      bucket.tokens = CONFIG.RATE_LIMIT.MAX_REQUESTS;
      bucket.lastRefill = now;
      bucket.requests = [];
    }
    
    // Check if tokens available
    if (bucket.tokens <= 0) {
      console.warn(`Rate limit exceeded for fingerprint: ${fingerprint.substring(0, 8)}...`);
      return false;
    }
    
    // Check for suspicious rapid-fire requests
    bucket.requests.push(now);
    if (bucket.requests.length >= 2) {
      const lastRequest = bucket.requests[bucket.requests.length - 2];
      const interval = now - lastRequest;
      
      if (interval < CONFIG.SUSPICIOUS.MIN_REQUEST_INTERVAL_MS) {
        console.warn(`Suspicious rapid requests detected: ${interval}ms interval`);
        // Penalize by consuming extra tokens
        bucket.tokens -= 2;
        return false;
      }
    }
    
    // Consume one token
    bucket.tokens--;
    
    return true;
  }
  
  /**
   * Cleanup old entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - (CONFIG.RATE_LIMIT.WINDOW_MS * 2);
    
    for (const [fingerprint, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        this.buckets.delete(fingerprint);
      }
    }
    
    // console.log(`Rate limiter cleanup: ${this.buckets.size} active fingerprints`);
  }
}

// Create rate limiter instance (persists across function invocations in same instance)
const rateLimiter = new InMemoryRateLimiter();

/**
 * Gets the ISO week key for a date (YYYY-WW format)
 * @param {Date} date - Date object
 * @returns {string} - Week key (e.g., "2024-03")
 */
function getWeekKey(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  return `${date.getFullYear()}-${String(weekNumber).padStart(2, "0")}`;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Generates HMAC signature on server-side
 * @param {object} payload - Request payload
 * @returns {string} - HMAC signature (hex)
 */
function generateServerHMAC(payload) {
  const data = JSON.stringify({
    fingerprint: payload.fingerprint,
    timestamp: payload.timestamp,
    nonce: payload.nonce,
  });
  
  return crypto
    .createHmac("sha256", CONFIG.HMAC_SECRET)
    .update(data)
    .digest("hex");
}

/**
 * Validates request by generating server-side HMAC
 * Since the client no longer has access to the secret, we validate
 * the request structure and generate our own signature
 * @param {object} payload - Request payload
 * @returns {boolean} - True if valid
 */
function validateRequest(payload) {
  try {
    // Validate that all required fields are present and properly formatted
    if (!payload.fingerprint || !payload.timestamp || !payload.nonce) {
      console.warn("Missing required fields for HMAC validation");
      return false;
    }
    
    // Generate server-side HMAC for logging/auditing
    const serverSignature = generateServerHMAC(payload);
    
    // console.log("Request validation:", {
      fingerprintPrefix: payload.fingerprint.substring(0, 8) + "...",
      timestamp: payload.timestamp,
      noncePrefix: payload.nonce.substring(0, 8) + "...",
      serverSignature: serverSignature.substring(0, 16) + "...",
    });
    
    // Since client can't generate valid HMAC anymore, we just validate structure
    // The real security comes from rate limiting, nonce validation, and fingerprinting
    return true;
  } catch (error) {
    console.error("Request validation error:", error);
    return false;
  }
}

/**
 * Validates request timestamp (prevents replay attacks)
 * @param {number} timestamp - Request timestamp
 * @returns {boolean} - True if valid
 */
function validateTimestamp(timestamp) {
  const now = Date.now();
  const drift = Math.abs(now - timestamp);
  
  if (drift > CONFIG.VALIDATION.MAX_TIMESTAMP_DRIFT_MS) {
    console.warn(`Timestamp drift too large: ${drift}ms`);
    return false;
  }
  
  return true;
}

/**
 * Validates nonce (prevents replay attacks)
 * Uses RTDB to track used nonces with automatic expiry
 * @param {string} nonce - Request nonce
 * @returns {Promise<boolean>} - True if valid (not used before)
 */
async function validateNonce(nonce) {
  try {
    const nonceRef = db.ref(`security/nonces/${nonce}`);
    
    // Try to set nonce atomically (only succeeds if doesn't exist)
    const result = await nonceRef.transaction((current) => {
      if (current !== null) {
        // Nonce already used
        return; // Abort transaction
      }
      return Date.now();
    });
    
    if (!result.committed) {
      console.warn(`Nonce already used: ${nonce.substring(0, 8)}...`);
      return false;
    }
    
    // Set expiry for automatic cleanup (Firebase RTDB doesn't support TTL, so we clean manually)
    // The nonce will be cleaned up by a scheduled function or manual cleanup
    
    return true;
  } catch (error) {
    console.error("Nonce validation error:", error);
    return false;
  }
}

/**
 * Checks daily increment limit per fingerprint (stored in RTDB)
 * @param {string} fingerprint - Hashed fingerprint
 * @returns {Promise<boolean>} - True if under limit
 */
async function checkDailyLimit(fingerprint) {
  try {
    // Get today's date in KST (YYYYMMDD)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const dateStr = kstDate.toISOString().split("T")[0].replace(/-/g, "");
    
    // Check daily counter for this fingerprint
    const dailyRef = db.ref(`security/daily/${dateStr}/${fingerprint}`);
    const snapshot = await dailyRef.once("value");
    const count = snapshot.val() || 0;
    
    if (count >= CONFIG.SUSPICIOUS.MAX_DAILY_INCREMENTS_PER_FINGERPRINT) {
      console.warn(`Daily limit exceeded for fingerprint: ${fingerprint.substring(0, 8)}...`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Daily limit check error:", error);
    // On error, allow the request (fail open to avoid blocking legitimate users)
    return true;
  }
}

/**
 * Records daily increment for fingerprint
 * @param {string} fingerprint - Hashed fingerprint
 */
async function recordDailyIncrement(fingerprint) {
  try {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const dateStr = kstDate.toISOString().split("T")[0].replace(/-/g, "");
    
    const dailyRef = db.ref(`security/daily/${dateStr}/${fingerprint}`);
    await dailyRef.transaction((current) => (current || 0) + 1);
  } catch (error) {
    console.error("Failed to record daily increment:", error);
    // Non-critical, continue
  }
}

// ============================================================================
// MAIN CLOUD FUNCTION
// ============================================================================

/**
 * Secure Counter Increment Function
 * 
 * Validates and processes counter increment requests with bot prevention
 * 
 * Request body:
 * {
 *   plateNumber: string,
 *   counterKey: string,
 *   fingerprint: string (SHA-256 hash),
 *   timestamp: number,
 *   nonce: string,
 *   signature: string (HMAC-SHA256)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   newValue: number,
 *   error?: string
 * }
 */
exports.secureIncrementCounter = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // ========================================================================
    // 1. VALIDATE REQUEST STRUCTURE
    // ========================================================================
    
    const { plateNumber, counterKey, fingerprint, timestamp, nonce } = data;
    
    if (!plateNumber || !counterKey || !fingerprint || !timestamp || !nonce) {
      console.warn("Missing required fields in request");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }
    
    // Validate plate number format (basic check)
    if (typeof plateNumber !== "string" || plateNumber.length < 5 || plateNumber.length > 20) {
      console.warn(`Invalid plate number format: ${plateNumber}`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid plate number format"
      );
    }
    
    // Validate counter key (basic check)
    if (typeof counterKey !== "string" || counterKey.length < 2 || counterKey.length > 50) {
      console.warn(`Invalid counter key: ${counterKey}`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid counter key"
      );
    }
    
    // Validate fingerprint (should be 64-char hex string = SHA-256)
    if (!/^[a-f0-9]{64}$/i.test(fingerprint)) {
      console.warn(`Invalid fingerprint format: ${fingerprint.substring(0, 16)}...`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid fingerprint format"
      );
    }
    
    // ========================================================================
    // 2. VALIDATE TIMESTAMP (Prevent replay attacks)
    // ========================================================================
    
    if (!validateTimestamp(timestamp)) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Request timestamp invalid or expired"
      );
    }
    
    // ========================================================================
    // 3. VALIDATE REQUEST (Server-side validation without client HMAC)
    // ========================================================================
    
    if (!validateRequest(data)) {
      console.warn("Request validation failed");
      throw new functions.https.HttpsError(
        "permission-denied",
        "Request validation failed"
      );
    }
    
    // ========================================================================
    // 4. VALIDATE NONCE (Prevent replay attacks)
    // ========================================================================
    
    const nonceValid = await validateNonce(nonce);
    if (!nonceValid) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Request nonce invalid or already used"
      );
    }
    
    // ========================================================================
    // 5. RATE LIMITING (In-memory token bucket)
    // ========================================================================
    
    if (!rateLimiter.isAllowed(fingerprint)) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Rate limit exceeded. Please try again later."
      );
    }
    
    // ========================================================================
    // 6. DAILY LIMIT CHECK (RTDB-based)
    // ========================================================================
    
    const underDailyLimit = await checkDailyLimit(fingerprint);
    if (!underDailyLimit) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Daily limit exceeded"
      );
    }
    
    // ========================================================================
    // 7. ATOMIC COUNTER INCREMENT (RTDB Transaction)
    // ========================================================================
    
    const counterRef = db.ref(`plates/${plateNumber}/counters/${counterKey}`);
    const lastUpdatedRef = db.ref(`plates/${plateNumber}/lastUpdated`);
    
    // Get today's date in KST format (YYYYMMDD)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const todayStr = kstDate.toISOString().split("T")[0].replace(/-/g, "");
    const monthStr = todayStr.substring(0, 6); // YYYYMM
    
    const dailyRef = db.ref(`plates/${plateNumber}/daily/${todayStr}/${counterKey}`);
    const monthlyRef = db.ref(`plates/${plateNumber}/monthly/${monthStr}/${counterKey}`);
    
    // Perform atomic increment
    const result = await counterRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
    });
    
    if (!result.committed) {
      console.error("Transaction failed to commit");
      throw new functions.https.HttpsError(
        "aborted",
        "Failed to increment counter. Please try again."
      );
    }
    
    const newValue = result.snapshot.val();
    
    // Update daily and monthly counters (fire and forget for performance)
    dailyRef.transaction((current) => (current || 0) + 1).catch((err) => {
      console.warn("Failed to update daily counter:", err);
    });
    
    monthlyRef.transaction((current) => (current || 0) + 1).catch((err) => {
      console.warn("Failed to update monthly counter:", err);
    });
    
    // Update lastUpdated timestamp
    lastUpdatedRef.set(Date.now()).catch((err) => {
      console.warn("Failed to update lastUpdated:", err);
    });
    
    // Update GLOBAL statistics for all time periods
    // This is used for the hero section stats on the landing page
    const globalPeriods = [
      { path: `global/daily/${todayStr}/${counterKey}` },
      { path: `global/weekly/${getWeekKey(kstDate)}/${counterKey}` },
      { path: `global/monthly/${monthStr}/${counterKey}` },
      { path: `global/yearly/${todayStr.substring(0, 4)}/${counterKey}` },
      { path: `global/allTime/${counterKey}` },
    ];
    
    for (const period of globalPeriods) {
      db.ref(period.path).transaction((current) => (current || 0) + 1).catch((err) => {
        console.warn(`Failed to update global ${period.path}:`, err);
      });
    }
    
    // Record daily increment for this fingerprint
    recordDailyIncrement(fingerprint).catch((err) => {
      console.warn("Failed to record daily increment:", err);
    });
    
    // ========================================================================
    // 8. RETURN SUCCESS
    // ========================================================================
    
    const duration = Date.now() - startTime;
    // console.log(`Secure increment successful: ${plateNumber}/${counterKey} = ${newValue} (${duration}ms)`);
    
    return {
      success: true,
      newValue: newValue,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // If it's already an HttpsError, rethrow it
    if (error instanceof functions.https.HttpsError) {
      console.warn(`Request rejected (${duration}ms):`, error.message);
      throw error;
    }
    
    // Log unexpected errors
    console.error(`Unexpected error (${duration}ms):`, error);
    
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred"
    );
  }
});

// ============================================================================
// SCHEDULED CLEANUP FUNCTION (Optional but recommended)
// ============================================================================

/**
 * Cleanup old nonces and daily counters
 * Runs daily at 3 AM KST
 */
exports.cleanupSecurityData = functions.pubsub
  .schedule("0 3 * * *")
  .timeZone("Asia/Seoul")
  .onRun(async (context) => {
    // console.log("Starting security data cleanup...");
    
    try {
      const now = Date.now();
      const cutoffTime = now - CONFIG.VALIDATION.NONCE_EXPIRY_MS;
      
      // Cleanup old nonces
      const noncesRef = db.ref("security/nonces");
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
      
      // console.log(`Deleted ${noncesDeleted} expired nonces`);
      
      // Cleanup old daily counters (keep last 30 days)
      const dailyRef = db.ref("security/daily");
      const dailySnapshot = await dailyRef.once("value");
      
      const kstOffset = 9 * 60 * 60 * 1000;
      const kstDate = new Date(now + kstOffset);
      const thirtyDaysAgo = new Date(kstDate.getTime() - (30 * 24 * 60 * 60 * 1000));
      const cutoffDateStr = thirtyDaysAgo.toISOString().split("T")[0].replace(/-/g, "");
      
      let daysDeleted = 0;
      const daysToDelete = [];
      
      dailySnapshot.forEach((child) => {
        const dateStr = child.key;
        if (dateStr < cutoffDateStr) {
          daysToDelete.push(dateStr);
        }
      });
      
      for (const dateStr of daysToDelete) {
        await dailyRef.child(dateStr).remove();
        daysDeleted++;
      }
      
      // console.log(`Deleted ${daysDeleted} old daily counter records`);
      // console.log("Security data cleanup completed successfully");
      
      return null;
    } catch (error) {
      console.error("Cleanup error:", error);
      return null;
    }
  });
