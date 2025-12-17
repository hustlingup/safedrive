/**
 * SafeDrive Referral UI Module
 * referral.html 전용 UI 렌더링
 */

const ReferralUI = (function() {
    'use strict';
    
    const KAKAO_REWARD_LINK = 'https://open.kakao.com/o/s9bogn6h';
    
    let myStats = null;
    let isRewardEligible = false;
    
    /**
     * 페이지 초기화
     */
    async function init() {
        console.log('🎨 ReferralUI initializing...');
        
        // ReferralCore 초기화 대기
        if (typeof ReferralCore === 'undefined') {
            console.error('ReferralCore not loaded');
            return;
        }
        
        await ReferralCore.initOnIndexLoad();
        
        // 통계 로드 및 렌더링
        await loadAndRender();
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        console.log('✅ ReferralUI initialized');
    }
    
    /**
     * 통계 로드 및 화면 렌더링
     */
    async function loadAndRender() {
        showLoading(true);
        
        try {
            myStats = await ReferralCore.getMyStats();
            
            if (!myStats) {
                showError('추천인 정보를 불러올 수 없습니다.');
                return;
            }
            
            // 기본 정보 렌더링
            renderMyInfo(myStats);
            
            // 보상 대상 여부 확인
            const rewardRecipients = await ReferralCore.getTodayRewardRecipients();
            isRewardEligible = rewardRecipients.includes(myStats.referrerId);
            
            // TOP3까지 남은 횟수 계산
            const thirdPlaceScore = await ReferralCore.getThirdPlaceScore();
            const toTop3 = Math.max(0, thirdPlaceScore - myStats.todayCount + 1);
            
            renderStats(myStats, toTop3, isRewardEligible);
            
            // 보상 요청 링크 렌더링
            renderRewardSection(isRewardEligible);
            
        } catch (error) {
            console.error('Error loading referral data:', error);
            showError('데이터 로딩 중 오류가 발생했습니다.');
        } finally {
            showLoading(false);
        }
    }

    /**
     * 내 정보 렌더링
     */
    function renderMyInfo(stats) {
        const referralLink = ReferralCore.getReferralLink(stats.referrerId);
        
        // 추천 ID
        const idEl = document.getElementById('myReferrerId');
        if (idEl) idEl.textContent = stats.referrerId;
        
        // 추천 링크
        const linkEl = document.getElementById('myReferralLink');
        if (linkEl) {
            linkEl.value = referralLink;
        }
    }
    
    /**
     * 통계 렌더링
     */
    function renderStats(stats, toTop3, isEligible) {
        // 오늘 성공 횟수
        const todayEl = document.getElementById('todayCount');
        if (todayEl) todayEl.textContent = stats.todayCount;
        
        // 누적 성공 횟수
        const totalEl = document.getElementById('totalCount');
        if (totalEl) totalEl.textContent = stats.totalCount;
        
        // 오늘 남은 횟수
        const remainingEl = document.getElementById('remainingToday');
        if (remainingEl) remainingEl.textContent = stats.remainingToday;
        
        // TOP3까지 남은 횟수
        const toTop3El = document.getElementById('toTop3');
        if (toTop3El) {
            if (isEligible) {
                toTop3El.textContent = '🎉';
                toTop3El.classList.add('eligible');
            } else if (stats.todayCount === 0) {
                toTop3El.textContent = toTop3 > 0 ? toTop3 : '1';
            } else {
                toTop3El.textContent = toTop3 > 0 ? toTop3 : '진입 완료';
            }
        }
    }
    
    /**
     * 보상 섹션 렌더링
     */
    function renderRewardSection(isEligible) {
        const rewardSection = document.getElementById('rewardSection');
        if (!rewardSection) return;
        
        if (isEligible) {
            rewardSection.innerHTML = `
                <div class="reward-eligible">
                    <div class="reward-badge">🎉 축하합니다!</div>
                    <p class="reward-message">오늘 보상 대상 3인에 포함되었습니다!</p>
                    <a href="${KAKAO_REWARD_LINK}" target="_blank" class="reward-claim-btn">
                        💬 카카오톡으로 보상 요청하기
                    </a>
                </div>
            `;
            rewardSection.style.display = 'block';
        } else {
            rewardSection.innerHTML = `
                <div class="reward-info">
                    <p class="reward-notice">
                        보상 대상이 되면 여기 보상요청 버튼이 떠요<br>
                        <small>(추후 보상 증가)</small>
                    </p>
                </div>
            `;
            rewardSection.style.display = 'block';
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    function setupEventListeners() {
        // 링크 복사 버튼
        const copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', copyReferralLink);
        }
        
        // 공유 버튼
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', shareReferralLink);
        }
        
        // 새로고침 버튼
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadAndRender);
        }
    }

    /**
     * 추천 링크 복사
     */
    async function copyReferralLink() {
        const linkEl = document.getElementById('myReferralLink');
        if (!linkEl) return;
        
        try {
            await navigator.clipboard.writeText(linkEl.value);
            showNotification('링크가 복사되었습니다!', 'success');
        } catch (error) {
            // Fallback
            linkEl.select();
            document.execCommand('copy');
            showNotification('링크가 복사되었습니다!', 'success');
        }
    }
    
    /**
     * 추천 링크 공유 (Web Share API)
     */
    async function shareReferralLink() {
        if (!myStats) return;
        
        const referralLink = ReferralCore.getReferralLink(myStats.referrerId);
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SAFE DRIVE - 안전 운전 공유',
                    text: '차량 안전 정보를 확인해보세요!',
                    url: referralLink
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        } else {
            // Web Share API 미지원 시 복사
            await copyReferralLink();
        }
    }
    
    /**
     * 로딩 표시
     */
    function showLoading(show) {
        const loader = document.getElementById('referralLoader');
        const content = document.getElementById('referralContent');
        
        if (loader) loader.style.display = show ? 'flex' : 'none';
        if (content) content.style.display = show ? 'none' : 'block';
    }
    
    /**
     * 에러 표시
     */
    function showError(message) {
        const errorEl = document.getElementById('referralError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }
    
    /**
     * 알림 표시
     */
    function showNotification(message, type = 'info') {
        // 기존 알림 시스템 사용 또는 간단한 알림
        const notification = document.createElement('div');
        notification.className = `referral-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // Public API
    return {
        init,
        loadAndRender,
        copyReferralLink,
        shareReferralLink
    };
})();

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    ReferralUI.init();
});
