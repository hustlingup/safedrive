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

// =============================
// 📊 Google Analytics Real-time Active Users
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
      console.log(`Starting updateActiveUsers with Property ID: ${GA4_PROPERTY_ID}`);

      try {
        // Initialize the Analytics Data API client
        // Uses Application Default Credentials (ADC) from Firebase
        const analyticsDataClient = new BetaAnalyticsDataClient();

        console.log("Calling GA4 runRealtimeReport...");

        // Run the real-time report
        const [response] = await analyticsDataClient.runRealtimeReport({
          property: `properties/${GA4_PROPERTY_ID}`,
          metrics: [{ name: "activeUsers" }],
        });

        console.log("GA4 API Response:", JSON.stringify(response));

        let activeUsers = 0;

        if (response.rows && response.rows.length > 0) {
          activeUsers = parseInt(response.rows[0].metricValues[0].value, 10) || 0;
        }

        console.log(`GA4 Real-time Active Users: ${activeUsers}`);

        // Store in Firebase Realtime Database
        console.log("Writing to Firebase RTDB...");
        await admin.database().ref("analytics/realtime").set({
          activeUsers: activeUsers,
          lastUpdated: admin.database.ServerValue.TIMESTAMP,
        });

        console.log("✅ Active users updated in Firebase successfully");
        return null;
      } catch (error) {
        console.error("❌ Error in updateActiveUsers:", error.message);
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
  console.log(`Manual trigger: Starting updateActiveUsers with Property ID: ${GA4_PROPERTY_ID}`);

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient();

    console.log("Calling GA4 runRealtimeReport...");

    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      metrics: [{ name: "activeUsers" }],
    });

    console.log("GA4 API Response:", JSON.stringify(response));

    let activeUsers = 0;

    if (response.rows && response.rows.length > 0) {
      activeUsers = parseInt(response.rows[0].metricValues[0].value, 10) || 0;
    }

    console.log(`GA4 Real-time Active Users: ${activeUsers}`);

    await admin.database().ref("analytics/realtime").set({
      activeUsers: activeUsers,
      lastUpdated: admin.database.ServerValue.TIMESTAMP,
    });

    console.log("✅ Active users updated in Firebase successfully");

    res.json({
      success: true,
      activeUsers: activeUsers,
      propertyId: GA4_PROPERTY_ID,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
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
// 📌 Push Notification Function
// =============================

exports.sendPlateNotification = functions.database
    .ref("/plates/{plateNumber}/counters/{counterKey}")
    .onWrite(async (change, context) => {
      // Skip if data was deleted
      if (!change.after.exists()) {
        return null;
      }
      const plateNumber = context.params.plateNumber;
      const counterKey = context.params.counterKey;

      console.log(`Counter updated for plate ${plateNumber}: ${counterKey}`);

      // Get subscriptions for this plate
      const subscriptionsSnapshot = await admin
          .database()
          .ref("subscriptions")
          .once("value");

      console.log(`Total subscriptions in DB: ${subscriptionsSnapshot.numChildren()}`);

      const tokens = [];
      subscriptionsSnapshot.forEach((child) => {
        const subscription = child.val();
        const token = child.key;

        console.log(`Checking token ${token.substring(0, 20)}..., data:`, JSON.stringify(subscription));

        // Handle both array format and object format for plates
        let plates = [];
        if (subscription.plates) {
          if (Array.isArray(subscription.plates)) {
            plates = subscription.plates;
          } else if (typeof subscription.plates === "object") {
            plates = Object.keys(subscription.plates);
          }
        }

        console.log(`Plates for this token:`, plates);

        if (plates.includes(plateNumber)) {
          tokens.push(token);
          console.log(`✓ Token found for plate ${plateNumber}`);
        }
      });

      if (tokens.length === 0) {
        console.log(`No subscribers for plate ${plateNumber}`);
        return null;
      }

      console.log(`Found ${tokens.length} subscribers for plate ${plateNumber}`);

      const message = {
        notification: {
          title: `🚗 ${plateNumber}`,
          body: "새로운 메시지가 등록되었습니다",
        },
        data: {
          plateNumber: plateNumber,
          counterKey: counterKey,
          timestamp: Date.now().toString(),
        },
        tokens: tokens,
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} messages`);

        // Log and clean up failed tokens
        if (response.failureCount > 0) {
          console.log(`Failed to send ${response.failureCount} messages`);

          const tokensToRemove = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errorCode = resp.error?.code;
              console.log(`Failed token ${idx}: ${errorCode} - ${resp.error?.message}`);

              // Remove invalid tokens
              if (errorCode === "messaging/invalid-registration-token" ||
                  errorCode === "messaging/registration-token-not-registered") {
                tokensToRemove.push(tokens[idx]);
              }
            }
          });

          // Clean up invalid tokens from database
          if (tokensToRemove.length > 0) {
            console.log(`Removing ${tokensToRemove.length} invalid tokens`);
            const removePromises = tokensToRemove.map((token) =>
              admin.database().ref(`subscriptions/${token}`).remove()
            );
            await Promise.all(removePromises);
            console.log("Invalid tokens removed");
          }
        }

        return response;
      } catch (error) {
        console.error("Error sending messages:", error);
        return null;
      }
    });
