/**
 * SafeDrive Referral UI Module
 * referral.html ?„ìš© UI ?Œë”ë§?
 */

const ReferralUI = (function() {
    'use strict';
    
    const KAKAO_REWARD_LINK = 'https://open.kakao.com/o/s9bogn6h';
    
    let myStats = null;
    let isRewardEligible = false;
    
    /**
     * ?˜ì´ì§€ ì´ˆê¸°??
     */
    async function init() {
        // console.log('?Ž¨ ReferralUI initializing...');
        
        // ReferralCore ì´ˆê¸°???€ê¸?
        if (typeof ReferralCore === 'undefined') {
            console.error('ReferralCore not loaded');
            return;
        }
        
        await ReferralCore.initOnIndexLoad();
        
        // ?µê³„ ë¡œë“œ ë°??Œë”ë§?
        await loadAndRender();
        
        // ?´ë²¤??ë¦¬ìŠ¤???¤ì •
        setupEventListeners();
        
        // console.log('??ReferralUI initialized');
    }
    
    /**
     * ?µê³„ ë¡œë“œ ë°??”ë©´ ?Œë”ë§?
     */
    async function loadAndRender() {
        showLoading(true);
        
        try {
            myStats = await ReferralCore.getMyStats();
            
            if (!myStats) {
                showError('ì¶”ì²œ???•ë³´ë¥?ë¶ˆëŸ¬?????†ìŠµ?ˆë‹¤.');
                return;
            }
            
            // ê¸°ë³¸ ?•ë³´ ?Œë”ë§?
            renderMyInfo(myStats);
            
            // ë³´ìƒ ?€???¬ë? ?•ì¸
            const rewardRecipients = await ReferralCore.getTodayRewardRecipients();
            isRewardEligible = rewardRecipients.includes(myStats.referrerId);
            
            // TOP3ê¹Œì? ?¨ì? ?Ÿìˆ˜ ê³„ì‚°
            const thirdPlaceScore = await ReferralCore.getThirdPlaceScore();
            const toTop3 = Math.max(0, thirdPlaceScore - myStats.todayCount + 1);
            
            renderStats(myStats, toTop3, isRewardEligible);
            
            // ë³´ìƒ ?”ì²­ ë§í¬ ?Œë”ë§?
            renderRewardSection(isRewardEligible);
            
        } catch (error) {
            console.error('Error loading referral data:', error);
            showError('?°ì´??ë¡œë”© ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.');
        } finally {
            showLoading(false);
        }
    }

    /**
     * ???•ë³´ ?Œë”ë§?
     */
    function renderMyInfo(stats) {
        const referralLink = ReferralCore.getReferralLink(stats.referrerId);
        
        // ì¶”ì²œ ID
        const idEl = document.getElementById('myReferrerId');
        if (idEl) idEl.textContent = stats.referrerId;
        
        // ì¶”ì²œ ë§í¬
        const linkEl = document.getElementById('myReferralLink');
        if (linkEl) {
            linkEl.value = referralLink;
        }
    }
    
    /**
     * ?µê³„ ?Œë”ë§?
     */
    function renderStats(stats, toTop3, isEligible) {
        // ?¤ëŠ˜ ?±ê³µ ?Ÿìˆ˜
        const todayEl = document.getElementById('todayCount');
        if (todayEl) todayEl.textContent = stats.todayCount;
        
        // ?„ì  ?±ê³µ ?Ÿìˆ˜
        const totalEl = document.getElementById('totalCount');
        if (totalEl) totalEl.textContent = stats.totalCount;
        
        // ?¤ëŠ˜ ?¨ì? ?Ÿìˆ˜
        const remainingEl = document.getElementById('remainingToday');
        if (remainingEl) remainingEl.textContent = stats.remainingToday;
        
        // TOP3ê¹Œì? ?¨ì? ?Ÿìˆ˜
        const toTop3El = document.getElementById('toTop3');
        if (toTop3El) {
            if (isEligible) {
                toTop3El.textContent = '?Ž‰';
                toTop3El.classList.add('eligible');
            } else if (stats.todayCount === 0) {
                toTop3El.textContent = toTop3 > 0 ? toTop3 : '1';
            } else {
                toTop3El.textContent = toTop3 > 0 ? toTop3 : 'ì§„ìž… ?„ë£Œ';
            }
        }
    }
    
    /**
     * ë³´ìƒ ?¹ì…˜ ?Œë”ë§?
     */
    function renderRewardSection(isEligible) {
        const rewardSection = document.getElementById('rewardSection');
        if (!rewardSection) return;
        
        rewardSection.textContent = '';
        
        if (isEligible) {
            const eligibleDiv = document.createElement('div');
            eligibleDiv.className = 'reward-eligible';
            
            const badge = document.createElement('div');
            badge.className = 'reward-badge';
            badge.textContent = '?Ž‰ ì¶•í•˜?©ë‹ˆ??';
            
            const message = document.createElement('p');
            message.className = 'reward-message';
            message.textContent = '?¤ëŠ˜ ë³´ìƒ ?€??3?¸ì— ?¬í•¨?˜ì—ˆ?µë‹ˆ??';
            
            const link = document.createElement('a');
            link.href = KAKAO_REWARD_LINK;
            link.target = '_blank';
            link.className = 'reward-claim-btn';
            link.textContent = '?’¬ ì¹´ì¹´?¤í†¡?¼ë¡œ ë³´ìƒ ?”ì²­?˜ê¸°';
            
            eligibleDiv.appendChild(badge);
            eligibleDiv.appendChild(message);
            eligibleDiv.appendChild(link);
            rewardSection.appendChild(eligibleDiv);
            rewardSection.style.display = 'block';
        } else {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'reward-info';
            
            const notice = document.createElement('p');
            notice.className = 'reward-notice';
            notice.textContent = 'ë³´ìƒ ?€?ì´ ?˜ë©´ ?¬ê¸° ë³´ìƒ?”ì²­ ë²„íŠ¼??? ìš”';
            
            const br = document.createElement('br');
            notice.appendChild(br);
            
            const small = document.createElement('small');
            small.textContent = '(ì¶”í›„ ë³´ìƒ ì¦ê?)';
            notice.appendChild(small);
            
            infoDiv.appendChild(notice);
            rewardSection.appendChild(infoDiv);
            rewardSection.style.display = 'block';
        }
    }
    
    /**
     * ?´ë²¤??ë¦¬ìŠ¤???¤ì •
     */
    function setupEventListeners() {
        // ë§í¬ ë³µì‚¬ ë²„íŠ¼
        const copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', copyReferralLink);
        }
        
        // ê³µìœ  ë²„íŠ¼
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', shareReferralLink);
        }
        
        // ?ˆë¡œê³ ì¹¨ ë²„íŠ¼
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadAndRender);
        }
    }

    /**
     * ì¶”ì²œ ë§í¬ ë³µì‚¬
     */
    async function copyReferralLink() {
        const linkEl = document.getElementById('myReferralLink');
        if (!linkEl) return;
        
        try {
            await navigator.clipboard.writeText(linkEl.value);
            showNotification('ë§í¬ê°€ ë³µì‚¬?˜ì—ˆ?µë‹ˆ??', 'success');
        } catch (error) {
            // Fallback
            linkEl.select();
            document.execCommand('copy');
            showNotification('ë§í¬ê°€ ë³µì‚¬?˜ì—ˆ?µë‹ˆ??', 'success');
        }
    }
    
    /**
     * ì¶”ì²œ ë§í¬ ê³µìœ  (Web Share API)
     */
    async function shareReferralLink() {
        if (!myStats) return;
        
        const referralLink = ReferralCore.getReferralLink(myStats.referrerId);
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SAFE DRIVE - ?ˆì „ ?´ì „ ê³µìœ ',
                    text: 'ì°¨ëŸ‰ ?ˆì „ ?•ë³´ë¥??•ì¸?´ë³´?¸ìš”!',
                    url: referralLink
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        } else {
            // Web Share API ë¯¸ì?????ë³µì‚¬
            await copyReferralLink();
        }
    }
    
    /**
     * ë¡œë”© ?œì‹œ
     */
    function showLoading(show) {
        const loader = document.getElementById('referralLoader');
        const content = document.getElementById('referralContent');
        
        if (loader) loader.style.display = show ? 'flex' : 'none';
        if (content) content.style.display = show ? 'none' : 'block';
    }
    
    /**
     * ?ëŸ¬ ?œì‹œ
     */
    function showError(message) {
        const errorEl = document.getElementById('referralError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }
    
    /**
     * ?Œë¦¼ ?œì‹œ
     */
    function showNotification(message, type = 'info') {
        // ê¸°ì¡´ ?Œë¦¼ ?œìŠ¤???¬ìš© ?ëŠ” ê°„ë‹¨???Œë¦¼
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

// DOM ë¡œë“œ ??ì´ˆê¸°??
document.addEventListener('DOMContentLoaded', () => {
    ReferralUI.init();
});
