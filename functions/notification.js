/**
 * Scalable Push Notification Cloud Function
 * 
 * Optimized for high volume:
 * - Uses plate-specific subscriber lists instead of scanning all subscriptions
 * - Handles FCM's 500 token limit per batch
 * - Cleans up invalid tokens automatically
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();

// FCM batch limit
const FCM_BATCH_SIZE = 500;

/**
 * Send notification when a plate counter is updated
 * Uses plate-specific subscriber list for O(1) lookup instead of O(n) scan
 */
exports.sendPlateNotificationV2 = functions.database
  .ref("/plates/{plateNumber}/counters/{counterKey}")
  .onWrite(async (change, context) => {
    // Skip if data was deleted
    if (!change.after.exists()) {
      return null;
    }
    
    const plateNumber = context.params.plateNumber;
    const counterKey = context.params.counterKey;
    
    // console.log(`Counter updated for plate ${plateNumber}: ${counterKey}`);
    
    try {
      // Get subscribers for this specific plate (O(1) lookup)
      const subscribersSnapshot = await db
        .ref(`plateSubscribers/${plateNumber}`)
        .once("value");
      
      if (!subscribersSnapshot.exists()) {
        // console.log(`No subscribers for plate ${plateNumber}`);
        return null;
      }
      
      // Collect all tokens
      const tokens = [];
      subscribersSnapshot.forEach((child) => {
        tokens.push(child.key);
      });
      
      if (tokens.length === 0) {
        // console.log(`No subscribers for plate ${plateNumber}`);
        return null;
      }
      
      // console.log(`Found ${tokens.length} subscribers for plate ${plateNumber}`);
      
      // Prepare notification message
      const notification = {
        title: `?š— ${plateNumber}`,
        body: "?ˆë¡œ??ë©”ì‹œì§€ê°€ ?±ë¡?˜ì—ˆ?µë‹ˆ??,
      };
      
      const data = {
        plateNumber: plateNumber,
        counterKey: counterKey,
        timestamp: Date.now().toString(),
      };
      
      // Send in batches of 500 (FCM limit)
      const batches = [];
      for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
        batches.push(tokens.slice(i, i + FCM_BATCH_SIZE));
      }
      
      // console.log(`Sending ${batches.length} batch(es) of notifications`);
      
      let totalSuccess = 0;
      let totalFailure = 0;
      const tokensToRemove = [];
      
      for (const batch of batches) {
        const message = {
          notification,
          data,
          tokens: batch,
        };
        
        try {
          const response = await admin.messaging().sendEachForMulticast(message);
          totalSuccess += response.successCount;
          totalFailure += response.failureCount;
          
          // Collect invalid tokens for cleanup
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errorCode = resp.error?.code;
              if (errorCode === "messaging/invalid-registration-token" ||
                  errorCode === "messaging/registration-token-not-registered") {
                tokensToRemove.push(batch[idx]);
              }
            }
          });
        } catch (batchError) {
          console.error(`Batch send error:`, batchError);
          totalFailure += batch.length;
        }
      }
      
      // console.log(`Sent ${totalSuccess} messages, ${totalFailure} failed`);
      
      // Clean up invalid tokens
      if (tokensToRemove.length > 0) {
        // console.log(`Removing ${tokensToRemove.length} invalid tokens`);
        await cleanupInvalidTokens(tokensToRemove, plateNumber);
      }
      
      return { success: totalSuccess, failure: totalFailure };
      
    } catch (error) {
      console.error("Notification error:", error);
      return null;
    }
  });

/**
 * Clean up invalid tokens from both subscription lists
 */
async function cleanupInvalidTokens(tokens, plateNumber) {
  const updates = {};
  
  for (const token of tokens) {
    // Remove from plate subscribers
    updates[`plateSubscribers/${plateNumber}/${token}`] = null;
    
    // Remove plate from token's subscription list
    try {
      const tokenRef = db.ref(`subscriptions/${token}`);
      const snapshot = await tokenRef.once("value");
      const data = snapshot.val();
      
      if (data && data.plates) {
        const updatedPlates = data.plates.filter(p => p !== plateNumber);
        if (updatedPlates.length === 0) {
          updates[`subscriptions/${token}`] = null;
        } else {
          updates[`subscriptions/${token}/plates`] = updatedPlates;
        }
      }
    } catch (err) {
      console.warn(`Error cleaning up token ${token.substring(0, 20)}...:`, err);
    }
  }
  
  if (Object.keys(updates).length > 0) {
    await db.ref().update(updates);
    // console.log(`Cleaned up ${tokens.length} invalid tokens`);
  }
}

/**
 * Migration function to populate plateSubscribers from existing subscriptions
 * Run once to migrate existing data
 */
exports.migrateSubscribersToPlateIndex = functions.https.onRequest(async (req, res) => {
  // Simple auth check - require admin key in query
  const adminKey = req.query.adminKey;
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'rsang1021') {
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }
  
  try {
    // console.log('Starting migration of subscribers to plate index...');
    
    const subscriptionsSnapshot = await db.ref('subscriptions').once('value');
    
    if (!subscriptionsSnapshot.exists()) {
      res.json({ success: true, message: 'No subscriptions to migrate' });
      return;
    }
    
    const updates = {};
    let tokenCount = 0;
    let plateSubscriptionCount = 0;
    
    subscriptionsSnapshot.forEach((tokenSnapshot) => {
      const token = tokenSnapshot.key;
      const data = tokenSnapshot.val();
      
      if (data && data.plates && Array.isArray(data.plates)) {
        tokenCount++;
        
        for (const plate of data.plates) {
          updates[`plateSubscribers/${plate}/${token}`] = {
            subscribedAt: data.updatedAt || admin.database.ServerValue.TIMESTAMP
          };
          plateSubscriptionCount++;
        }
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
    }
    
    // console.log(`Migration complete: ${tokenCount} tokens, ${plateSubscriptionCount} plate subscriptions`);
    
    res.json({
      success: true,
      tokensProcessed: tokenCount,
      plateSubscriptionsCreated: plateSubscriptionCount
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message });
  }
});
