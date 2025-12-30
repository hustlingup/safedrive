// ============================================================================
// Subscription Manager Module (PWA Push Notifications)
// Standalone file for use in pages that have their own inline scripts
// ============================================================================

// Only define if not already defined
if (typeof SubscriptionManager === 'undefined') {
    var SubscriptionManager = {
        MAX_SUBSCRIPTIONS: 10,
        deferredPrompt: null,
        messaging: null,
        
        /**
         * Initialize the subscription manager
         */
        init() {
            // Register service worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('Service Worker registered:', registration);
                        
                        // Send Firebase config to service worker
                        if (registration.active && typeof firebaseConfig !== 'undefined') {
                            registration.active.postMessage({
                                type: 'FIREBASE_CONFIG',
                                config: firebaseConfig
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Service Worker registration failed:', error);
                    });
            }
            
            // Initialize Firebase Messaging
            try {
                this.messaging = firebase.messaging();
                console.log('Firebase Messaging initialized');
            } catch (error) {
                console.error('Firebase Messaging initialization failed:', error);
            }
            
            // Capture beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredPrompt = e;
                console.log('beforeinstallprompt event captured');
            });
            
            // Setup subscribe button
            this.setupSubscribeButton();
        },

        /**
         * Setup subscribe button with hover animation
         */
        setupSubscribeButton() {
            const subscribeBtn = document.getElementById('subscribeBtn');
            if (!subscribeBtn) {
                console.warn('Subscribe button not found');
                return;
            }
            
            console.log('Subscribe button found, setting up...');
            
            // Update button text based on subscription status
            this.updateSubscribeButtonText();
            
            // Anime.js hover animation
            subscribeBtn.addEventListener('mouseenter', () => {
                anime({ 
                    targets: subscribeBtn,
                    duration: 300, 
                    scale: 1.1, 
                    easing: 'easeOutElastic(1, 0.3)' 
                });
            });
            
            subscribeBtn.addEventListener('mouseleave', () => {
                anime({ 
                    targets: subscribeBtn,
                    duration: 300, 
                    scale: 1, 
                    easing: 'easeOutQuad' 
                });
            });
            
            // Click handler
            subscribeBtn.addEventListener('click', () => {
                console.log('Subscribe button clicked');
                this.openSubscribePopup();
            });
        },
        
        /**
         * Update subscribe button text based on subscription status
         */
        updateSubscribeButtonText() {
            const subscribeBtn = document.getElementById('subscribeBtn');
            const currentPlate = document.getElementById('plateNumber')?.textContent;
            
            if (!subscribeBtn || !currentPlate || currentPlate === '-') {
                return;
            }
            
            const subscribed = this.getSubscribedPlates();
            const isSubscribed = subscribed.includes(currentPlate);
            
            if (isSubscribed) {
                subscribeBtn.innerHTML = '<span>✓</span> 구독중';
                subscribeBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            } else {
                subscribeBtn.innerHTML = '<span>🔔</span> 구독';
                subscribeBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            }
        },
        
        /**
         * Check if app is already installed (standalone mode or has install prompt used)
         */
        isAppInstalled() {
            return window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone === true;
        },

        /**
         * Open subscribe popup
         */
        openSubscribePopup() {
            const popup = document.getElementById('subscribePopup');
            if (!popup) return;
            
            // Lock body scroll (important for mobile UX)
            document.body.style.overflow = 'hidden';
            
            popup.style.display = 'flex';
            
            // Display current plate number
            const currentPlate = document.getElementById('plateNumber')?.textContent;
            const currentPlateDisplay = document.getElementById('currentPlateDisplay');
            if (currentPlateDisplay && currentPlate) {
                currentPlateDisplay.textContent = currentPlate;
            }
            
            // Update current plate notification toggle
            this.updateCurrentPlateNotificationToggle();
            
            this.renderSubscribedList();
            
            // Setup buttons based on install state
            const installBtn = document.getElementById('installPushBtn');
            const subscribeOnlyBtn = document.getElementById('subscribeOnlyBtn');
            
            if (this.isAppInstalled()) {
                // App already installed - hide install button, show subscribe only
                if (installBtn) installBtn.style.display = 'none';
                if (subscribeOnlyBtn) {
                    subscribeOnlyBtn.style.display = 'block';
                    subscribeOnlyBtn.onclick = () => this.handleSubscribeOnly();
                }
            } else {
                // App not installed - show both buttons
                if (installBtn) {
                    installBtn.style.display = 'block';
                    installBtn.onclick = () => this.handleInstallAndSubscribe();
                }
                if (subscribeOnlyBtn) {
                    subscribeOnlyBtn.style.display = 'block';
                    subscribeOnlyBtn.onclick = () => this.handleSubscribeOnly();
                }
            }
        },
        
        /**
         * Get notification settings from LocalStorage
         * Returns object: { "plateNumber": true/false, ... }
         */
        getNotificationSettings() {
            try {
                const stored = localStorage.getItem('notificationSettings');
                return stored ? JSON.parse(stored) : {};
            } catch (error) {
                console.error('Error reading notification settings:', error);
                return {};
            }
        },
        
        /**
         * Save notification settings to LocalStorage
         */
        saveNotificationSettings(settings) {
            try {
                localStorage.setItem('notificationSettings', JSON.stringify(settings));
                return true;
            } catch (error) {
                console.error('Error saving notification settings:', error);
                return false;
            }
        },
        
        /**
         * Check if notifications are enabled for a plate
         */
        isNotificationEnabled(plate) {
            const settings = this.getNotificationSettings();
            // Default to true if not set
            return settings[plate] !== false;
        },
        
        /**
         * Toggle notification for a specific plate
         */
        toggleNotification(plate) {
            const settings = this.getNotificationSettings();
            const currentState = settings[plate] !== false; // Default true
            settings[plate] = !currentState;
            this.saveNotificationSettings(settings);
            this.renderSubscribedList();
            this.updateCurrentPlateNotificationToggle();
            this.syncNotificationSettingsToFirebase();
            
            const status = settings[plate] ? 'ON' : 'OFF';
            this.showToast(`${plate} 알림 ${status}`, 'info');
        },
        
        /**
         * Toggle notification for current plate
         */
        toggleCurrentPlateNotification() {
            const currentPlate = document.getElementById('plateNumber')?.textContent;
            if (currentPlate && currentPlate !== '-') {
                this.toggleNotification(currentPlate);
            }
        },
        
        /**
         * Update current plate notification toggle UI
         */
        updateCurrentPlateNotificationToggle() {
            const currentPlate = document.getElementById('plateNumber')?.textContent;
            const toggleSection = document.getElementById('currentPlateNotificationToggle');
            const toggleBtn = document.getElementById('currentPlateNotificationBtn');
            
            if (!toggleSection || !toggleBtn || !currentPlate || currentPlate === '-') {
                if (toggleSection) toggleSection.style.display = 'none';
                return;
            }
            
            const subscribed = this.getSubscribedPlates();
            const isSubscribed = subscribed.includes(currentPlate);
            
            if (isSubscribed) {
                toggleSection.style.display = 'flex';
                const isEnabled = this.isNotificationEnabled(currentPlate);
                toggleBtn.textContent = isEnabled ? 'ON' : 'OFF';
                toggleBtn.className = `notification-toggle-btn ${isEnabled ? 'on' : 'off'}`;
            } else {
                toggleSection.style.display = 'none';
            }
        },
        
        /**
         * Sync notification settings to Firebase via Cloud Function
         */
        async syncNotificationSettingsToFirebase() {
            try {
                const token = await this.getFCMToken();
                if (!token) return;
                
                const subscribed = this.getSubscribedPlates();
                
                // Only include plates with notifications enabled
                const enabledPlates = subscribed.filter(plate => this.isNotificationEnabled(plate));
                
                // Use Cloud Function for secure subscription sync
                const syncSubscriptions = firebase.functions().httpsCallable('syncSubscriptions');
                const result = await syncSubscriptions({
                    token: token,
                    plates: enabledPlates
                });
                
                if (result.data && result.data.success) {
                    console.log('Notification settings synced to Firebase via Cloud Function');
                } else {
                    console.error('Sync failed:', result.data);
                }
            } catch (error) {
                console.error('Error syncing notification settings:', error);
            }
        },
        
        /**
         * Close subscribe popup
         */
        closeSubscribePopup() {
            const popup = document.getElementById('subscribePopup');
            if (popup) {
                popup.style.display = 'none';
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
        },
        
        /**
         * Get subscribed plates from LocalStorage
         */
        getSubscribedPlates() {
            try {
                const stored = localStorage.getItem('subscribedPlates');
                return stored ? JSON.parse(stored) : [];
            } catch (error) {
                console.error('Error reading subscribed plates:', error);
                return [];
            }
        },
        
        /**
         * Save subscribed plates to LocalStorage
         */
        saveSubscribedPlates(plates) {
            try {
                localStorage.setItem('subscribedPlates', JSON.stringify(plates));
                return true;
            } catch (error) {
                console.error('Error saving subscribed plates:', error);
                return false;
            }
        },
        
        /**
         * Render subscribed plates list
         */
        renderSubscribedList(showLoading = false) {
            const listEl = document.getElementById('subscribedList');
            const countEl = document.getElementById('subscribeCount');
            if (!listEl) return;
            
            // Show loading state if requested
            if (showLoading) {
                listEl.innerHTML = '<p class="subscription-loading">구독 설정 저장 중...</p>';
                return;
            }
            
            const subscribed = this.getSubscribedPlates();
            
            // Update count
            if (countEl) {
                countEl.textContent = subscribed.length;
            }
            
            // Clear list
            listEl.innerHTML = '';
            
            if (subscribed.length === 0) {
                listEl.innerHTML = '<p class="no-subscriptions">구독 된 번호 없음</p>';
                this.updateSubscribeButtonText();
                this.updateCurrentPlateNotificationToggle();
                return;
            }
            
            // Render each subscribed plate with notification toggle
            subscribed.forEach(plate => {
                const isNotificationOn = this.isNotificationEnabled(plate);
                const item = document.createElement('div');
                item.className = 'subscribed-item';
                
                const plateSpan = document.createElement('span');
                plateSpan.className = 'subscribed-item-plate';
                plateSpan.textContent = plate;
                
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'subscribed-item-actions';
                
                const toggleWrapper = document.createElement('div');
                toggleWrapper.className = 'notification-toggle-wrapper';
                
                const notifLabel = document.createElement('span');
                notifLabel.className = 'notification-label';
                notifLabel.textContent = '알림';
                
                const toggleBtn = document.createElement('button');
                toggleBtn.className = `toggle-switch ${isNotificationOn ? 'on' : 'off'}`;
                toggleBtn.onclick = () => SubscriptionManager.toggleNotification(plate);
                toggleBtn.title = `알림 ${isNotificationOn ? 'ON' : 'OFF'}`;
                
                const toggleSlider = document.createElement('span');
                toggleSlider.className = 'toggle-slider';
                
                const toggleText = document.createElement('span');
                toggleText.className = 'toggle-text';
                toggleText.textContent = isNotificationOn ? 'ON' : 'OFF';
                
                toggleBtn.appendChild(toggleSlider);
                toggleBtn.appendChild(toggleText);
                
                toggleWrapper.appendChild(notifLabel);
                toggleWrapper.appendChild(toggleBtn);
                
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'subscribed-item-cancel';
                cancelBtn.textContent = '구독취소';
                cancelBtn.onclick = () => SubscriptionManager.cancelSubscription(plate);
                
                actionsDiv.appendChild(toggleWrapper);
                actionsDiv.appendChild(cancelBtn);
                
                item.appendChild(plateSpan);
                item.appendChild(actionsDiv);
                listEl.appendChild(item);
            });
            
            // Update button text after rendering list
            this.updateSubscribeButtonText();
            this.updateCurrentPlateNotificationToggle();
        },

        /**
         * Cancel subscription for a plate
         */
        async cancelSubscription(plate) {
            let subscribed = this.getSubscribedPlates();
            subscribed = subscribed.filter(p => p !== plate);
            
            if (this.saveSubscribedPlates(subscribed)) {
                this.renderSubscribedList();
                
                // Update Firebase via Cloud Function
                try {
                    const token = await this.getFCMToken();
                    if (token) {
                        const manageSubscription = firebase.functions().httpsCallable('manageSubscription');
                        await manageSubscription({
                            token: token,
                            plateNumber: plate,
                            action: 'unsubscribe'
                        });
                        console.log(`Removed subscription for ${plate}`);
                    }
                } catch (error) {
                    console.error('Error removing subscription from Firebase:', error);
                }
                
                this.showToast('구독이 취소되었습니다', 'success');
            }
        },
        
        /**
         * Handle subscribe only (without PWA installation)
         */
        async handleSubscribeOnly() {
            const currentPlate = document.getElementById('plateNumber')?.textContent;
            if (!currentPlate || currentPlate === '-') {
                this.showToast('번호판 정보를 불러올 수 없습니다', 'error');
                return;
            }
            
            // Check subscription limit
            let subscribed = this.getSubscribedPlates();
            if (subscribed.length >= this.MAX_SUBSCRIPTIONS && !subscribed.includes(currentPlate)) {
                this.showToast('최대 10개 번호판만 구독 가능합니다', 'error');
                return;
            }
            
            // Show loading state
            this.renderSubscribedList(true);
            
            // Add current plate to subscriptions FIRST (local storage)
            if (!subscribed.includes(currentPlate)) {
                subscribed.push(currentPlate);
                this.saveSubscribedPlates(subscribed);
                this.updateSubscribeButtonText();
            }
            
            // Then request notification permission and sync to Firebase
            await this.requestAndSyncNotifications();
            
            // Update list (remove loading state)
            this.renderSubscribedList();
        },

        /**
         * Handle PWA installation and push subscription
         */
        async handleInstallAndSubscribe() {
            const currentPlate = document.getElementById('plateNumber')?.textContent;
            if (!currentPlate || currentPlate === '-') {
                this.showToast('번호판 정보를 불러올 수 없습니다', 'error');
                return;
            }
            
            // Check subscription limit
            let subscribed = this.getSubscribedPlates();
            if (subscribed.length >= this.MAX_SUBSCRIPTIONS && !subscribed.includes(currentPlate)) {
                this.showToast('최대 10개 번호판만 구독 가능합니다', 'error');
                return;
            }
            
            // Show loading state
            this.renderSubscribedList(true);
            
            // Add current plate to subscriptions FIRST (local storage)
            if (!subscribed.includes(currentPlate)) {
                subscribed.push(currentPlate);
                this.saveSubscribedPlates(subscribed);
                this.updateSubscribeButtonText();
            }
            
            // Try PWA installation
            await this.installPWA();
            
            // Then request notification permission and sync to Firebase
            await this.requestAndSyncNotifications();
            
            // Update list (remove loading state)
            this.renderSubscribedList();
        },
        
        /**
         * Request notification permission and sync to Firebase
         * This is the main function that handles the permission flow
         */
        async requestAndSyncNotifications() {
            // Check push support first
            const support = this.checkPushSupport();
            if (!support.supported) {
                console.warn('Push not supported:', support.reason);
                this.showToast(support.message, 'info');
                // Still save locally, just can't get push notifications
                this.showToast('구독이 저장되었습니다 (알림은 지원되지 않음)', 'info');
                return;
            }
            
            // Check current permission state
            const currentPermission = Notification.permission;
            console.log('Current notification permission:', currentPermission);
            
            // If already denied, inform user but still save subscription locally
            if (currentPermission === 'denied') {
                this.showToast('알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.', 'info');
                this.showToast('구독이 저장되었습니다', 'success');
                return;
            }
            
            // Request permission if not granted yet
            if (currentPermission !== 'granted') {
                try {
                    console.log('Requesting notification permission...');
                    const permission = await Notification.requestPermission();
                    console.log('Permission result:', permission);
                    
                    if (permission === 'denied') {
                        this.showToast('알림 권한이 거부되었습니다. 설정에서 허용해주세요.', 'info');
                        this.showToast('구독이 저장되었습니다', 'success');
                        return;
                    } else if (permission !== 'granted') {
                        // User dismissed or 'default' - still save subscription
                        this.showToast('구독이 저장되었습니다. 알림을 받으려면 권한을 허용해주세요.', 'info');
                        return;
                    }
                } catch (error) {
                    console.error('Error requesting notification permission:', error);
                    this.showToast('구독이 저장되었습니다', 'success');
                    return;
                }
            }
            
            // Permission granted - get FCM token and sync to Firebase
            try {
                const token = await this.getFCMToken();
                if (token) {
                    await this.syncSubscriptionsToFirebase(token);
                    this.showToast('알림 구독이 완료되었습니다', 'success');
                } else {
                    this.showToast('구독이 저장되었습니다', 'success');
                }
            } catch (error) {
                console.error('Error during subscription sync:', error);
                this.showToast('구독이 저장되었습니다', 'success');
            }
        },
        
        /**
         * Install PWA
         */
        async installPWA() {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
            
            // Check if already installed
            if (isStandalone) {
                this.showToast('이미 설치되어 있습니다 ✓', 'success');
                return;
            }
            
            // Try native install prompt (works on Android Chrome, Edge, etc.)
            if (this.deferredPrompt) {
                try {
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        console.log('PWA installed');
                        this.showToast('앱이 설치되었습니다! 🎉', 'success');
                    } else {
                        console.log('PWA installation declined');
                        this.showToast('설치가 취소되었습니다', 'info');
                    }
                    
                    this.deferredPrompt = null;
                    return;
                } catch (error) {
                    console.error('Error during PWA install prompt:', error);
                }
            }
            
            // Show manual installation guide for devices without native prompt
            if (isIOS) {
                // iOS requires Safari and manual add to home screen
                this.showInstallGuideModal('ios');
            } else if (isAndroid) {
                // Android without beforeinstallprompt (Samsung Internet, Firefox, etc.)
                this.showInstallGuideModal('android');
            } else {
                // Desktop or other
                this.showInstallGuideModal('desktop');
            }
        },
        
        /**
         * Show installation guide modal for manual PWA installation
         */
        showInstallGuideModal(platform) {
            let title, steps;
            
            if (platform === 'ios') {
                title = 'iOS에서 앱 설치하기';
                steps = [
                    '1. Safari 브라우저 하단의 <strong>공유 버튼</strong> (□↑) 탭',
                    '2. 메뉴에서 <strong>"홈 화면에 추가"</strong> 선택',
                    '3. 오른쪽 상단 <strong>"추가"</strong> 탭'
                ];
            } else if (platform === 'android') {
                title = 'Android에서 앱 설치하기';
                steps = [
                    '1. 브라우저 우측 상단 <strong>메뉴 (⋮)</strong> 탭',
                    '2. <strong>"홈 화면에 추가"</strong> 또는 <strong>"앱 설치"</strong> 선택',
                    '3. <strong>"설치"</strong> 또는 <strong>"추가"</strong> 탭'
                ];
            } else {
                title = '앱 설치하기';
                steps = [
                    '1. 브라우저 주소창 오른쪽의 <strong>설치 아이콘</strong> 클릭',
                    '2. 또는 브라우저 메뉴에서 <strong>"앱 설치"</strong> 선택',
                    '3. <strong>"설치"</strong> 클릭'
                ];
            }
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'install-guide-modal';
            modal.innerHTML = `
                <div class="install-guide-overlay" onclick="this.parentElement.remove()"></div>
                <div class="install-guide-content">
                    <button class="install-guide-close" onclick="this.parentElement.parentElement.remove()">✕</button>
                    <h3>${title}</h3>
                    <div class="install-guide-steps">
                        ${steps.map(step => `<p>${step}</p>`).join('')}
                    </div>
                    <button class="install-guide-ok" onclick="this.parentElement.parentElement.remove()">확인</button>
                </div>
            `;
            
            // Add styles if not already added
            if (!document.getElementById('install-guide-styles')) {
                const style = document.createElement('style');
                style.id = 'install-guide-styles';
                style.textContent = `
                    .install-guide-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 10001;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                    }
                    .install-guide-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.6);
                    }
                    .install-guide-content {
                        position: relative;
                        background: white;
                        border-radius: 16px;
                        padding: 24px;
                        max-width: 340px;
                        width: 100%;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        animation: slideUp 0.3s ease;
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .install-guide-close {
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        width: 28px;
                        height: 28px;
                        border: none;
                        background: #f3f4f6;
                        border-radius: 50%;
                        font-size: 16px;
                        cursor: pointer;
                    }
                    .install-guide-content h3 {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #1f2937;
                        margin-bottom: 16px;
                        text-align: center;
                    }
                    .install-guide-steps {
                        background: #f9fafb;
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 20px;
                    }
                    .install-guide-steps p {
                        font-size: 0.9rem;
                        color: #374151;
                        margin-bottom: 12px;
                        line-height: 1.5;
                    }
                    .install-guide-steps p:last-child {
                        margin-bottom: 0;
                    }
                    .install-guide-steps strong {
                        color: #2563eb;
                    }
                    .install-guide-ok {
                        width: 100%;
                        padding: 14px;
                        font-size: 1rem;
                        font-weight: 600;
                        color: white;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                    }
                    [data-theme="dark"] .install-guide-content {
                        background: #1f2937;
                    }
                    [data-theme="dark"] .install-guide-content h3 {
                        color: #f9fafb;
                    }
                    [data-theme="dark"] .install-guide-steps {
                        background: #374151;
                    }
                    [data-theme="dark"] .install-guide-steps p {
                        color: #e5e7eb;
                    }
                    [data-theme="dark"] .install-guide-close {
                        background: #374151;
                        color: #e5e7eb;
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(modal);
        },
        
        /**
         * Check if push notifications are supported on this device/browser
         */
        checkPushSupport() {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
            
            // iOS Safari only supports push in PWA mode (iOS 16.4+)
            if (isIOS && !isStandalone) {
                return {
                    supported: false,
                    reason: 'ios-not-pwa',
                    message: 'iOS에서 알림을 받으려면 먼저 홈 화면에 추가해주세요. (공유 버튼 → 홈 화면에 추가)'
                };
            }
            
            // Check basic support
            if (!('Notification' in window)) {
                return {
                    supported: false,
                    reason: 'no-notification-api',
                    message: '이 브라우저는 알림을 지원하지 않습니다'
                };
            }
            
            if (!('serviceWorker' in navigator)) {
                return {
                    supported: false,
                    reason: 'no-service-worker',
                    message: '이 브라우저는 서비스 워커를 지원하지 않습니다'
                };
            }
            
            if (!('PushManager' in window)) {
                return {
                    supported: false,
                    reason: 'no-push-manager',
                    message: '이 브라우저는 푸시 알림을 지원하지 않습니다'
                };
            }
            
            return { supported: true };
        },
        
        /**
         * Request notification permission immediately (returns true/false)
         * Shows permission modal right away without alerts
         */
        async requestNotificationPermissionImmediate() {
            // Check push support first
            const support = this.checkPushSupport();
            if (!support.supported) {
                console.warn('Push not supported:', support.reason);
                this.showToast(support.message, 'error');
                return false;
            }
            
            // Check current permission state
            const currentPermission = Notification.permission;
            console.log('Current notification permission:', currentPermission);
            
            if (currentPermission === 'granted') {
                console.log('Notification permission already granted');
                return true;
            }
            
            if (currentPermission === 'denied') {
                this.showToast('알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.', 'error');
                return false;
            }
            
            // Permission is 'default' - need to request
            try {
                console.log('Requesting notification permission...');
                const permission = await Notification.requestPermission();
                console.log('Permission result:', permission);
                
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                    return true;
                } else if (permission === 'denied') {
                    this.showToast('알림 권한이 거부되었습니다. 설정에서 허용해주세요.', 'error');
                    return false;
                } else {
                    this.showToast('알림 권한이 필요합니다', 'info');
                    return false;
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                this.showToast('알림 설정 중 오류가 발생했습니다: ' + error.message, 'error');
                return false;
            }
        },
        
        /**
         * Request notification permission and get FCM token
         */
        async requestNotificationPermission() {
            // Check push support first
            const support = this.checkPushSupport();
            if (!support.supported) {
                console.warn('Push not supported:', support.reason);
                this.showToast(support.message, 'error');
                return;
            }
            
            try {
                console.log('Requesting notification permission...');
                const permission = await Notification.requestPermission();
                console.log('Permission result:', permission);
                
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                    
                    // Get FCM token
                    const token = await this.getFCMToken();
                    
                    if (token) {
                        // Save subscriptions to Firebase
                        await this.syncSubscriptionsToFirebase(token);
                        this.showToast('알림 구독이 완료되었습니다', 'success');
                        this.renderSubscribedList();
                    }
                } else if (permission === 'denied') {
                    this.showToast('알림 권한이 거부되었습니다. 설정에서 허용해주세요.', 'error');
                } else {
                    this.showToast('알림 권한이 필요합니다', 'info');
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                this.showToast('알림 설정 중 오류가 발생했습니다: ' + error.message, 'error');
            }
        },

        /**
         * Get FCM token
         */
        async getFCMToken() {
            if (!this.messaging) {
                console.error('Firebase Messaging not initialized');
                return null;
            }
            
            try {
                // VAPID key - injected during build from .env file
                const vapidKey = '__VAPID_KEY__';
                
                const token = await this.messaging.getToken({ 
                    vapidKey: vapidKey,
                    serviceWorkerRegistration: await navigator.serviceWorker.ready
                });
                
                if (token) {
                    console.log('FCM Token:', token);
                    return token;
                } else {
                    console.log('No FCM token available');
                    return null;
                }
            } catch (error) {
                console.error('Error getting FCM token:', error);
                
                // If VAPID key is not set, show helpful message
                if (error.code === 'messaging/invalid-vapid-key') {
                    console.error('Please set your VAPID key in SubscriptionManager.getFCMToken()');
                }
                
                return null;
            }
        },
        
        /**
         * Sync subscriptions to Firebase via Cloud Function
         */
        async syncSubscriptionsToFirebase(token) {
            const subscribed = this.getSubscribedPlates();
            
            try {
                // Only include plates with notifications enabled
                const enabledPlates = subscribed.filter(plate => this.isNotificationEnabled(plate));
                
                // Use Cloud Function for secure subscription sync
                const syncSubscriptions = firebase.functions().httpsCallable('syncSubscriptions');
                const result = await syncSubscriptions({
                    token: token,
                    plates: enabledPlates
                });
                
                if (result.data && result.data.success) {
                    console.log('Subscriptions synced to Firebase via Cloud Function (enabled:', enabledPlates.length, '/ total:', subscribed.length, ')');
                } else {
                    console.error('Sync failed:', result.data);
                }
            } catch (error) {
                console.error('Error syncing subscriptions to Firebase:', error);
            }
        },
        
        /**
         * Show toast notification
         */
        showToast(message, type = 'info') {
            // Create toast element
            const toast = document.createElement('div');
            toast.className = `notification ${type}`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            // Remove after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }
    };
}

// Global function for closing popup (called from HTML onclick)
function closeSubscribePopup() {
    SubscriptionManager.closeSubscribePopup();
}
