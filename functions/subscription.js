/**
 * Subscription Management Cloud Functions
 * 
 * Secure subscription management for push notifications
 * - Manages FCM token subscriptions
 * - Maintains plate-specific subscriber lists for scalability
 * - Handles subscription limits
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();

// Configuration
const CONFIG = {
  MAX_SUBSCRIPTIONS_PER_TOKEN: 10,
  MAX_TOKENS_PER_PLATE: 10000, // For scalability
};

/**
 * Subscribe to a plate's notifications
 * 
 * Request:
 * {
 *   token: string (FCM token),
 *   plateNumber: string,
 *   action: 'subscribe' | 'unsubscribe'
 * }
 */
exports.manageSubscription = functions.https.onCall(async (data, context) => {
  const { token, plateNumber, action } = data;
  
  // Validate input
  if (!token || typeof token !== 'string' || token.length < 20) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid FCM token');
  }
  
  if (!plateNumber || typeof plateNumber !== 'string' || plateNumber.length < 4) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid plate number');
  }
  
  if (!['subscribe', 'unsubscribe'].includes(action)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid action');
  }
  
  try {
    const tokenRef = db.ref(`subscriptions/${token}`);
    const plateSubscribersRef = db.ref(`plateSubscribers/${plateNumber}/${token}`);
    
    if (action === 'subscribe') {
      // Check subscription limit
      const tokenSnapshot = await tokenRef.once('value');
      const currentData = tokenSnapshot.val() || {};
      const currentPlates = currentData.plates || [];
      
      if (!currentPlates.includes(plateNumber)) {
        if (currentPlates.length >= CONFIG.MAX_SUBSCRIPTIONS_PER_TOKEN) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            `ìµœë? ${CONFIG.MAX_SUBSCRIPTIONS_PER_TOKEN}ê°?ë²ˆí˜¸?ë§Œ êµ¬ë… ê°€?¥í•©?ˆë‹¤`
          );
        }
        
        // Add plate to token's subscription list
        const updatedPlates = [...currentPlates, plateNumber];
        await tokenRef.update({
          plates: updatedPlates,
          updatedAt: admin.database.ServerValue.TIMESTAMP
        });
        
        // Add token to plate's subscriber list (for scalable notifications)
        await plateSubscribersRef.set({
          subscribedAt: admin.database.ServerValue.TIMESTAMP
        });
        
        // console.log(`Subscribed ${token.substring(0, 20)}... to ${plateNumber}`);
      }
      
      return { success: true, action: 'subscribed', plateNumber };
      
    } else if (action === 'unsubscribe') {
      // Remove plate from token's subscription list
      const tokenSnapshot = await tokenRef.once('value');
      const currentData = tokenSnapshot.val() || {};
      const currentPlates = currentData.plates || [];
      
      const updatedPlates = currentPlates.filter(p => p !== plateNumber);
      
      if (updatedPlates.length === 0) {
        // No more subscriptions, remove the token entry entirely
        await tokenRef.remove();
      } else {
        await tokenRef.update({
          plates: updatedPlates,
          updatedAt: admin.database.ServerValue.TIMESTAMP
        });
      }
      
      // Remove token from plate's subscriber list
      await plateSubscribersRef.remove();
      
      // console.log(`Unsubscribed ${token.substring(0, 20)}... from ${plateNumber}`);
      
      return { success: true, action: 'unsubscribed', plateNumber };
    }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error('Subscription error:', error);
    throw new functions.https.HttpsError('internal', 'Subscription failed');
  }
});

/**
 * Sync all subscriptions for a token
 * Used when user has multiple plates to subscribe
 * 
 * Request:
 * {
 *   token: string (FCM token),
 *   plates: string[] (array of plate numbers to subscribe)
 * }
 */
exports.syncSubscriptions = functions.https.onCall(async (data, context) => {
  const { token, plates } = data;
  
  // Validate input
  if (!token || typeof token !== 'string' || token.length < 20) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid FCM token');
  }
  
  if (!Array.isArray(plates)) {
    throw new functions.https.HttpsError('invalid-argument', 'Plates must be an array');
  }
  
  // Validate and limit plates
  const validPlates = plates
    .filter(p => typeof p === 'string' && p.length >= 4 && p.length <= 20)
    .slice(0, CONFIG.MAX_SUBSCRIPTIONS_PER_TOKEN);
  
  try {
    const tokenRef = db.ref(`subscriptions/${token}`);
    
    // Get current subscriptions
    const tokenSnapshot = await tokenRef.once('value');
    const currentData = tokenSnapshot.val() || {};
    const currentPlates = currentData.plates || [];
    
    // Find plates to add and remove
    const platesToAdd = validPlates.filter(p => !currentPlates.includes(p));
    const platesToRemove = currentPlates.filter(p => !validPlates.includes(p));
    
    // Update token's subscription list
    await tokenRef.set({
      plates: validPlates,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });
    
    // Update plate subscriber lists
    const updates = {};
    
    // Add new subscriptions
    for (const plate of platesToAdd) {
      updates[`plateSubscribers/${plate}/${token}`] = {
        subscribedAt: admin.database.ServerValue.TIMESTAMP
      };
    }
    
    // Remove old subscriptions
    for (const plate of platesToRemove) {
      updates[`plateSubscribers/${plate}/${token}`] = null;
    }
    
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
    }
    
    // console.log(`Synced subscriptions for ${token.substring(0, 20)}...: ${validPlates.length} plates`);
    
    return { 
      success: true, 
      plates: validPlates,
      added: platesToAdd.length,
      removed: platesToRemove.length
    };
  } catch (error) {
    console.error('Sync subscriptions error:', error);
    throw new functions.https.HttpsError('internal', 'Sync failed');
  }
});

/**
 * Get subscription status for a token
 */
exports.getSubscriptions = functions.https.onCall(async (data, context) => {
  const { token } = data;
  
  if (!token || typeof token !== 'string' || token.length < 20) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid FCM token');
  }
  
  try {
    const tokenSnapshot = await db.ref(`subscriptions/${token}`).once('value');
    const subscriptionData = tokenSnapshot.val();
    
    if (!subscriptionData) {
      return { success: true, plates: [], count: 0 };
    }
    
    return {
      success: true,
      plates: subscriptionData.plates || [],
      count: (subscriptionData.plates || []).length
    };
  } catch (error) {
    console.error('Get subscriptions error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get subscriptions');
  }
});
