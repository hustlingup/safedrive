/**
 * SAFE DRIVE Cookie Consent Manager
 * 쿠키 동의 관리 시스템
 */

class CookieConsent {
    constructor() {
        this.CONSENT_KEY = 'safedrive_cookie_consent';
        this.CONSENT_VERSION = '1.0';
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

        // Dispatch event for other scripts
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
        
        // Fade in animation
        setTimeout(() => banner.classList.add('show'), 100);
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner cookie-consent-compact';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-body">
                    <p>🍪 SAFE DRIVE는 서비스 품질 개선을 위해 쿠키를 사용합니다. <a href="/privacy.html" target="_blank">자세히 보기</a></p>
                </div>
                <div class="cookie-consent-actions">
                    <button id="cookie-settings-btn" class="btn-secondary">설정</button>
                    <button id="cookie-accept-all" class="btn-primary">동의</button>
                </div>
            </div>
        `;

        this.attachBannerEvents(banner);
        return banner;
    }

    attachBannerEvents(banner) {
        banner.querySelector('#cookie-accept-all').addEventListener('click', () => {
            this.saveConsent({
                essential: true,
                analytics: true,
                advertising: true
            });
            this.hideBanner(banner);
        });

        const settingsBtn = banner.querySelector('#cookie-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.hideBanner(banner);
                this.showSettings();
            });
        }
    }

    hideBanner(banner) {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 300);
    }

    showSettings() {
        const modal = this.createSettingsModal();
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }

    createSettingsModal() {
        const currentPrefs = this.getPreferences() || {
            essential: true,
            analytics: false,
            advertising: false
        };

        const modal = document.createElement('div');
        modal.id = 'cookie-settings-modal';
        modal.className = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="cookie-settings-overlay"></div>
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h2>쿠키 설정 관리</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="cookie-settings-body">
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label>
                                <input type="checkbox" id="settings-essential" checked disabled>
                                <strong>필수 쿠키 (기능성)</strong>
                            </label>
                        </div>
                        <p>사이트가 정상적으로 동작하는 데 필요한 최소한의 정보를 저장합니다. 현재 SAFE DRIVE는 별도의 필수 쿠키를 저장하지 않습니다.</p>
                    </div>

                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label>
                                <input type="checkbox" id="settings-analytics" ${currentPrefs.analytics ? 'checked' : ''}>
                                <strong>분석 쿠키</strong>
                            </label>
                        </div>
                        <p>Google Analytics를 통해 방문자 수, 페이지 방문 빈도, 사용자의 이동 경로 등을 익명으로 수집하여 서비스 품질 개선에 활용합니다. 이 쿠키는 사용자 개인을 식별하지 않으며, 집계 통계 데이터만 수집합니다.</p>
                    </div>

                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label>
                                <input type="checkbox" id="settings-advertising" ${currentPrefs.advertising ? 'checked' : ''}>
                                <strong>광고 쿠키 (선택적)</strong>
                            </label>
                        </div>
                        <p>Google AdSense를 통해 광고를 제공하는 경우, 광고 노출 및 클릭 기록을 기반으로 맞춤형 광고를 제공할 수 있습니다. 광고 쿠키 수집에 동의하지 않으시면 맞춤형 광고는 제공되지 않습니다.</p>
                        
                        <div class="cookie-subcategory">
                            <h4>제휴 링크 (Coupang Partners) 관련 쿠키 안내</h4>
                            <p>본 사이트는 쿠팡 파트너스 프로그램에 참여하고 있습니다. QR 생성 페이지에서 제공되는 일부 상품 링크는 쿠팡 파트너스 제휴 링크이며, 해당 링크를 클릭할 경우 다음과 같은 사항이 적용될 수 있습니다.</p>
                            <ul>
                                <li><strong>추적 쿠키 부여:</strong> 쿠팡은 제휴 프로그램 운영을 위해 쿠키를 사용하여 추천 링크를 통해 유입된 사용자와 구매를 추적합니다.</li>
                                <li><strong>수집 정보:</strong> 쿠키에는 사용자 개인 정보가 포함되지 않으며, 추천 코드, 방문 시간, 구매 여부 등의 정보가 저장될 수 있습니다.</li>
                                <li><strong>목적:</strong> 추천 링크를 통한 판매가 발생했을 때 운영자가 소정의 수수료를 받을 수 있도록 하기 위한 것입니다.</li>
                            </ul>
                        </div>
                    </div>

                    <div class="cookie-management-info">
                        <h3>쿠키 설정 변경 방법</h3>
                        <ul>
                            <li>브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다.</li>
                            <li><a href="https://adssettings.google.com" target="_blank">Google 광고 설정 페이지</a>에서 맞춤형 광고 수신 여부를 조정할 수 있습니다.</li>
                            <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank">Google Analytics 차단 브라우저 애드온</a>을 설치해 분석 쿠키 사용을 비활성화할 수 있습니다.</li>
                        </ul>

                        <h3>동의 철회</h3>
                        <p>쿠키 동의를 철회하고 싶으신 경우, 본 페이지 하단의 쿠키 설정 관리 버튼을 통해 언제든지 선호도를 변경하실 수 있습니다.</p>
                        
                        <p class="cookie-notice">쿠키 사용에 관한 더 자세한 내용은 <a href="/privacy.html" target="_blank">개인정보처리방침</a>을 참고하시기 바랍니다. 이용자가 쿠키 사용에 동의하지 않을 경우 일부 기능이 제한될 수 있습니다.</p>
                    </div>
                </div>
                <div class="cookie-settings-actions">
                    <button id="settings-save" class="btn-primary">설정 저장</button>
                    <button id="settings-cancel" class="btn-secondary">취소</button>
                </div>
            </div>
        `;

        this.attachSettingsEvents(modal);
        return modal;
    }

    attachSettingsEvents(modal) {
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.close-btn').addEventListener('click', closeModal);
        modal.querySelector('.cookie-settings-overlay').addEventListener('click', closeModal);
        
        modal.querySelector('#settings-cancel').addEventListener('click', closeModal);

        modal.querySelector('#settings-save').addEventListener('click', () => {
            this.saveConsent({
                essential: true,
                analytics: modal.querySelector('#settings-analytics').checked,
                advertising: modal.querySelector('#settings-advertising').checked
            });
            closeModal();
        });
    }
}

// Initialize
const cookieConsent = new CookieConsent();

// Show banner on page load if no consent
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cookieConsent.showBanner();
    });
} else {
    cookieConsent.showBanner();
}

// Apply existing consent immediately
if (cookieConsent.hasConsent()) {
    cookieConsent.applyConsent(cookieConsent.getPreferences());
}

// Global function to open settings
window.openCookieSettings = () => {
    cookieConsent.showSettings();
};

// Export for use in other scripts
window.cookieConsent = cookieConsent;
