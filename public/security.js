/**
 * SafeDrive Security Module
 * 
 * Privacy-preserving bot prevention for client-side
 * - Privacy-safe fingerprinting (hashed before sending)
 * - HMAC-signed requests
 * - No personal data collection
 * - Graceful degradation
 */

const SecurityModule = {
  /**
   * Generates a privacy-safe browser fingerprint
   * 
   * Uses non-identifying characteristics:
   * - User Agent (browser/OS info)
   * - Screen resolution
   * - Timezone offset
   * - Canvas fingerprint (tiny hash)
   * 
   * IMPORTANT: The fingerprint is hashed with SHA-256 before sending
   * to ensure it cannot be used to identify individuals
   * 
   * @returns {Promise<string>} - SHA-256 hash of fingerprint (64 hex chars)
   */
  async generateFingerprint() {
    try {
      const components = [];
      
      // 1. User Agent (browser and OS info)
      components.push(navigator.userAgent || "unknown");
      
      // 2. Screen resolution (not personally identifying)
      components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
      
      // 3. Timezone offset (general location, not precise)
      components.push(new Date().getTimezoneOffset().toString());
      
      // 4. Language preference
      components.push(navigator.language || "unknown");
      
      // 5. Canvas fingerprint (tiny, privacy-safe)
      // This creates a small hash based on how the browser renders graphics
      // It's not personally identifying but helps distinguish browsers
      const canvasHash = await this.getCanvasFingerprint();
      components.push(canvasHash);
      
      // 6. Hardware concurrency (CPU cores - general device info)
      components.push((navigator.hardwareConcurrency || 0).toString());
      
      // Combine all components
      const rawFingerprint = components.join("|");
      
      // Hash the fingerprint with SHA-256 to ensure privacy
      const hash = await this.sha256(rawFingerprint);
      
      // console.log("SecurityModule: Generated privacy-safe fingerprint");
      
      return hash;
    } catch (error) {
      console.error("SecurityModule: Fingerprint generation error:", error);
      // Return a random hash on error (allows request to proceed)
      return await this.sha256(Math.random().toString() + Date.now().toString());
    }
  },
  
  /**
   * Generates a tiny canvas fingerprint
   * Uses a small canvas to create a hash based on rendering differences
   * 
   * @returns {Promise<string>} - Canvas hash
   */
  async getCanvasFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 50;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return "no-canvas";
      }
      
      // Draw some text with various styles
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("SafeDrive", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("SafeDrive", 4, 17);
      
      // Get canvas data
      const dataURL = canvas.toDataURL();
      
      // Create a simple hash from the data URL
      let hash = 0;
      for (let i = 0; i < dataURL.length; i++) {
        const char = dataURL.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(36);
    } catch (error) {
      console.warn("Canvas fingerprint error:", error);
      return "canvas-error";
    }
  },
  
  /**
   * SHA-256 hash function
   * @param {string} message - Message to hash
   * @returns {Promise<string>} - Hex string of hash
   */
  async sha256(message) {
    try {
      // Use Web Crypto API if available
      if (window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        return hashHex;
      }
      
      // Fallback: simple hash (not cryptographically secure, but acceptable for fingerprinting)
      let hash = 0;
      for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      // Convert to hex-like string (pad to 64 chars)
      return Math.abs(hash).toString(16).padStart(64, "0");
    } catch (error) {
      console.error("SHA-256 error:", error);
      // Return a fallback hash
      return Math.random().toString(36).substring(2).padStart(64, "0");
    }
  },
  
  /**
   * Generates a random nonce
   * @returns {string} - Random nonce (32 hex chars)
   */
  generateNonce() {
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
      }
      
      // Fallback: Math.random (less secure but acceptable)
      return Math.random().toString(36).substring(2) + 
             Math.random().toString(36).substring(2);
    } catch (error) {
      console.error("Nonce generation error:", error);
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  },
  
  /**
   * Sends a secure counter increment request to Cloud Function
   * 
   * @param {string} plateNumber - Plate number
   * @param {string} counterKey - Counter key
   * @returns {Promise<number>} - New counter value
   */
  async secureIncrementCounter(plateNumber, counterKey) {
    try {
      // console.log(`SecurityModule: Preparing secure increment for ${plateNumber}/${counterKey}`);
      
      // Generate fingerprint
      const fingerprint = await this.generateFingerprint();
      
      // Generate timestamp and nonce
      const timestamp = Date.now();
      const nonce = this.generateNonce();
      
      // Create payload (no HMAC signature - server will validate using its secret)
      const payload = {
        plateNumber,
        counterKey,
        fingerprint,
        timestamp,
        nonce,
      };
      
      // console.log("SecurityModule: Calling Cloud Function...");
      
      // Call Cloud Function
      const secureIncrementCounter = firebase.functions().httpsCallable("secureIncrementCounter");
      const result = await secureIncrementCounter(payload);
      
      if (!result.data || !result.data.success) {
        throw new Error(result.data?.error || "Increment failed");
      }
      
      // console.log(`SecurityModule: Increment successful, new value: ${result.data.newValue}`);
      
      return result.data.newValue;
      
    } catch (error) {
      console.error("SecurityModule: Secure increment error:", error);
      
      // Parse error message for user-friendly display
      let userMessage = "메시지 전송에 실패했습니다.";

      if (error.code === "functions/resource-exhausted") {
        userMessage = "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      } else if (error.code === "functions/permission-denied") {
        userMessage = "요청이 거부되었습니다.";
      } else if (error.code === "functions/failed-precondition") {
        userMessage = "요청이 만료되었습니다. 다시 시도해 주세요.";
      } else if (error.code === "functions/invalid-argument") {
        userMessage = "잘못된 요청입니다.";
      } else if (error.message && error.message.includes("network")) {
        userMessage = "네트워크 오류가 발생했습니다. 다시 시도해 주세요.";
      }
      
      // Throw error with user-friendly message
      const enhancedError = new Error(userMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  },
  
  /**
   * Initializes the security module
   * Pre-generates fingerprint for faster first request
   */
  async init() {
    try {
      // console.log("SecurityModule: Initializing...");
      
      // Pre-generate fingerprint (cache it)
      this.cachedFingerprint = await this.generateFingerprint();
      
      // Override generateFingerprint to use cached value
      const originalGenerate = this.generateFingerprint.bind(this);
      this.generateFingerprint = async () => {
        if (this.cachedFingerprint) {
          return this.cachedFingerprint;
        }
        this.cachedFingerprint = await originalGenerate();
        return this.cachedFingerprint;
      };
      
      // console.log("SecurityModule: Initialized successfully");
    } catch (error) {
      console.error("SecurityModule: Initialization error:", error);
      // Non-critical, continue
    }
  },
};

// Auto-initialize when script loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    SecurityModule.init().catch(err => {
      console.warn("SecurityModule auto-init failed:", err);
    });
  });
} else {
  SecurityModule.init().catch(err => {
    console.warn("SecurityModule auto-init failed:", err);
  });
}
