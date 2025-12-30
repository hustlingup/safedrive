const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

admin.initializeApp();

// Import secure increment function
const { secureIncrementCounter, cleanupSecurityData } = require("./secureIncrement");

// Import secure referral functions
const { secureReferralIncrement, createReferrer, cleanupReferralNonces } = require("./secureReferralIncrement");

// Import leaderboard functions
const { getLeaderboard, getLeaderboardHttp } = require("./leaderboard");

// Import subscription management functions
const { manageSubscription, syncSubscriptions, getSubscriptions } = require("./subscription");

// Import scalable notification function
const { sendPlateNotificationV2, migrateSubscribersToPlateIndex } = require("./notification");

// Export secure increment functions
exports.secureIncrementCounter = secureIncrementCounter;
exports.cleanupSecurityData = cleanupSecurityData;

// Export secure referral functions
exports.secureReferralIncrement = secureReferralIncrement;
exports.createReferrer = createReferrer;
exports.cleanupReferralNonces = cleanupReferralNonces;

// Export leaderboard functions
exports.getLeaderboard = getLeaderboard;
exports.getLeaderboardHttp = getLeaderboardHttp;

// Export subscription management functions
exports.manageSubscription = manageSubscription;
exports.syncSubscriptions = syncSubscriptions;
exports.getSubscriptions = getSubscriptions;

// Export scalable notification function (V2)
exports.sendPlateNotificationV2 = sendPlateNotificationV2;
exports.migrateSubscribersToPlateIndex = migrateSubscribersToPlateIndex;

// =============================
// Google Analytics Real-time Active Users
// =============================

// GA4 Property ID (from your GA4 property settings)
// To find this: GA4 Admin > Property Settings > Property ID
// Your GA4 Property ID: 514303182 (from analytics.google.com URL)
// Set via: firebase functions:config:set ga4.property_id="514303182"
const GA4_PROPERTY_ID = functions.config().ga4?.property_id ||
    process.env.GA4_PROPERTY_ID ||
    "514303182"; // Fallback to your actual property ID

/**
 * Scheduled function to fetch GA4 real-time active users every 5 minutes
 * and store in Firebase Realtime Database
 */
exports.updateActiveUsers = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async () => {
      // console.log(`Starting updateActiveUsers with Property ID: ${GA4_PROPERTY_ID}`);

      try {
        // Initialize the Analytics Data API client
        // Uses Application Default Credentials (ADC) from Firebase
        const analyticsDataClient = new BetaAnalyticsDataClient();

        // console.log("Calling GA4 runRealtimeReport...");

        // Run the real-time report
        const [response] = await analyticsDataClient.runRealtimeReport({
          property: `properties/${GA4_PROPERTY_ID}`,
          metrics: [{ name: "activeUsers" }],
        });

        // console.log("GA4 API Response:", JSON.stringify(response));

        let activeUsers = 0;

        if (response.rows && response.rows.length > 0) {
          activeUsers = parseInt(response.rows[0].metricValues[0].value, 10) || 0;
        }

        // console.log(`GA4 Real-time Active Users: ${activeUsers}`);

        // Store in Firebase Realtime Database
        // console.log("Writing to Firebase RTDB...");
        await admin.database().ref("analytics/realtime").set({
          activeUsers: activeUsers,
          lastUpdated: admin.database.ServerValue.TIMESTAMP,
        });

        // console.log("Active users updated in Firebase successfully");
        return null;
      } catch (error) {
        console.error("Error in updateActiveUsers:", error.message);
        console.error("Error code:", error.code);
        console.error("Error details:", error.details || "N/A");

        // If GA4 API fails, don't crash - just log the error
        // The client will use cached data or fallback
        return null;
      }
    });

/**
 * HTTP endpoint to manually trigger active users update (for testing)
 * Call: https://us-central1-safedrive-fa567.cloudfunctions.net/triggerActiveUsersUpdate
 */
exports.triggerActiveUsersUpdate = functions.https.onRequest(async (req, res) => {
  // console.log(`Manual trigger: Starting updateActiveUsers with Property ID: ${GA4_PROPERTY_ID}`);

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient();

    // console.log("Calling GA4 runRealtimeReport...");

    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      metrics: [{ name: "activeUsers" }],
    });

    // console.log("GA4 API Response:", JSON.stringify(response));

    let activeUsers = 0;

    if (response.rows && response.rows.length > 0) {
      activeUsers = parseInt(response.rows[0].metricValues[0].value, 10) || 0;
    }

    // console.log(`GA4 Real-time Active Users: ${activeUsers}`);

    await admin.database().ref("analytics/realtime").set({
      activeUsers: activeUsers,
      lastUpdated: admin.database.ServerValue.TIMESTAMP,
    });

    // console.log("Active users updated in Firebase successfully");

    res.json({
      success: true,
      activeUsers: activeUsers,
      propertyId: GA4_PROPERTY_ID,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      propertyId: GA4_PROPERTY_ID,
    });
  }
});

/**
 * HTTP callable function to get current active users
 * Can be called directly from the client for immediate updates
 */
exports.getActiveUsers = functions.https.onCall(async () => {
  try {
    // First try to get cached value from Firebase
    const snapshot = await admin.database().ref("analytics/realtime").once("value");
    const cached = snapshot.val();

    if (cached && cached.activeUsers !== undefined) {
      return {
        activeUsers: cached.activeUsers,
        lastUpdated: cached.lastUpdated,
        source: "cache",
      };
    }

    // If no cache, try to fetch from GA4 directly
    const analyticsDataClient = new BetaAnalyticsDataClient();

    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      metrics: [{ name: "activeUsers" }],
    });

    let activeUsers = 0;

    if (response.rows && response.rows.length > 0) {
      activeUsers = parseInt(response.rows[0].metricValues[0].value, 10) || 0;
    }

    // Update cache
    await admin.database().ref("analytics/realtime").set({
      activeUsers: activeUsers,
      lastUpdated: admin.database.ServerValue.TIMESTAMP,
    });

    return {
      activeUsers: activeUsers,
      lastUpdated: Date.now(),
      source: "ga4",
    };
  } catch (error) {
    console.error("Error in getActiveUsers:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch active users");
  }
});

// =============================
// Push Notification Function (DEPRECATED)
// =============================
// NOTE: sendPlateNotification is DEPRECATED and replaced by sendPlateNotificationV2
// which uses plate-specific subscriber index for O(1) lookup instead of O(n) scan.
// The V2 function is exported from notification.js
// DO NOT re-enable this function - it will cause duplicate notifications!
// 
// The old sendPlateNotification has been REMOVED to prevent duplicate notifications.
// Use sendPlateNotificationV2 instead (exported from notification.js)
