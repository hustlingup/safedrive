/**
 * SAFE DRIVE Cookie Consent Manager - Compact Version
 * Simplified version with layout options
 */

class CookieConsentCompact {
    constructor(options = {}) {
        this.CONSENT_KEY = 'safedrive_cookie_consent';
        this.CONSENT_VERSION = '1.0';
        this.layout = options.layout || 'default'; // default, corner, toast, side, top, modal
        this.consent = this.loadConsent();
    }

    loadConsent() {
        try {
            const stored = localStorage.getItem(this.CONSENT_KEY);
            if (stored) {
                const consent = JSON.parse(stored);
                if (consent.version === this.CONSENT_VERSION) {
                    return consent;
                }
            }
        } catch (e) {
            console.error('Failed to load consent:', e);
        }
        return null;
    }

    saveConsent(preferences) {
        const consent = {
            version: this.CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            preferences: preferences
        };
        localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consent));
        this.consent = consent;
        this.applyConsent(preferences);
    }

    applyConsent(preferences) {
        // Google Analytics
        if (preferences.analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }

        // Google AdSense
        if (preferences.advertising) {
            this.enableAdvertising();
        } else {
            this.disableAdvertising();
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
            detail: preferences 
        }));
    }

    enableAnalytics() {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    disableAnalytics() {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    }

    enableAdvertising() {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        }
    }

    disableAdvertising() {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
            });
        }
    }

    hasConsent() {
        return this.consent !== null;
    }

    getPreferences() {
        return this.consent?.preferences || null;
    }

    resetConsent() {
        localStorage.removeItem(this.CONSENT_KEY);
        this.consent = null;
    }

    showBanner() {
        if (this.hasConsent()) {
            return;
        }

        const banner = this.createBanner();
        document.body.appendChild(banner);
        
        setTimeout(() => banner.classList.add('show'), 100);
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = `cookie-consent-banner layout-${this.layout}`;
        
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-header"></div>
                <div class="cookie-consent-body">
                    <p>
                        🍪 SAFE DRIVE는 서비스 품질 개선을 위해 쿠키를 사용합니다. 
                        <a href="/privacy.html" target="_blank">자세히 보기</a>
                    </p>
                </div>
                <div class="cookie-consent-actions">
                    <button id="cookie-settings-btn" class="btn-secondary">설정</button>
                    <button id="cookie-accept-btn" class="btn-primary">동의</button>
                </div>
            </div>
        `;

        this.attachBannerEvents(banner);
        return banner;
    }

    attachBannerEvents(banner) {
        banner.querySelector('#cookie-accept-btn').addEventListener('click', () => {
            this.saveConsent({
                essential: true,
                analytics: true,
                advertising: true
            });
            this.hideBanner(banner);
        });

        banner.querySelector('#cookie-settings-btn').addEventListener('click', () => {
            this.hideBanner(banner);
            this.showSettings();
        });
    }

    hideBanner(banner) {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 300);
    }

    showSettings() {
        // Use the full settings modal from cookie-consent.js
        if (window.cookieConsent && window.cookieConsent.showSettings) {
            window.cookieConsent.showSettings();
        } else {
            // Fallback: simple settings
            const accept = confirm('쿠키 사용에 동의하시겠습니까?\n\n확인: 모두 동의\n취소: 필수만 허용');
            if (accept) {
                this.saveConsent({
                    essential: true,
                    analytics: true,
                    advertising: true
                });
            } else {
                this.saveConsent({
                    essential: true,
                    analytics: false,
                    advertising: false
                });
            }
        }
    }
}

// Initialize with layout option
// Options: 'default', 'corner', 'toast', 'side', 'top', 'modal'
const cookieConsentCompact = new CookieConsentCompact({
    layout: 'default' // Change this to switch layouts
});

// Show banner on page load if no consent
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cookieConsentCompact.showBanner();
    });
} else {
    cookieConsentCompact.showBanner();
}

// Apply existing consent immediately
if (cookieConsentCompact.hasConsent()) {
    cookieConsentCompact.applyConsent(cookieConsentCompact.getPreferences());
}

// Global function to open settings
window.openCookieSettings = () => {
    cookieConsentCompact.showSettings();
};

// Export for use in other scripts
window.cookieConsentCompact = cookieConsentCompact;
