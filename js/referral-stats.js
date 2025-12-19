/**
 * SafeDrive Referral Stats Module
 * referral-stats.html ?„ìš© - ê´€ë¦¬ì ?µê³„ ?˜ì´ì§€
 */

const ReferralStats = (function() {
    'use strict';
    
    // Admin key??URL ?Œë¼ë¯¸í„°ë¡?ê²€ì¦?
    // ?¤ì œ ?¤ëŠ” ?œë²„?¬ì´?œë‚˜ ?˜ê²½ë³€?˜ì—??ê´€ë¦?ê¶Œì¥
    const ADMIN_KEY_PARAM = 'key';
    
    // ?˜ê²½ë³€?˜ì—??admin key ë¡œë“œ (ë¹Œë“œ ??ì£¼ì…?˜ê±°??config?ì„œ ë¡œë“œ)
    // ?´ë¼?´ì–¸???¬ì´?œì—?œëŠ” Firebase?ì„œ ê²€ì¦í•˜??ë°©ì‹ ê¶Œì¥
    let validAdminKey = null;
    
    /**
     * Admin key ê²€ì¦?
     */
    async function validateAdminKey() {
        const urlParams = new URLSearchParams(window.location.search);
        const providedKey = urlParams.get(ADMIN_KEY_PARAM);
        
        if (!providedKey) {
            showAccessDenied('?‘ê·¼ ?¤ê? ?„ìš”?©ë‹ˆ??');
            return false;
        }
        
        // Firebase?ì„œ admin key ê²€ì¦?
        try {
            const db = firebase.database();
            const snapshot = await db.ref('referrals/config/adminKey').once('value');
            validAdminKey = snapshot.val();
            
            if (!validAdminKey || providedKey !== validAdminKey) {
                showAccessDenied('? íš¨?˜ì? ?Šì? ?‘ê·¼ ?¤ì…?ˆë‹¤.');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Admin key validation error:', error);
            showAccessDenied('?¸ì¦ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.');
            return false;
        }
    }
    
    /**
     * ?‘ê·¼ ê±°ë? ?œì‹œ
     */
    function showAccessDenied(message) {
        const container = document.getElementById('statsContainer');
        if (container) {
            container.textContent = '';
            
            const deniedDiv = document.createElement('div');
            deniedDiv.className = 'access-denied';
            
            const icon = document.createElement('div');
            icon.className = 'denied-icon';
            icon.textContent = '?”’';
            
            const heading = document.createElement('h2');
            heading.textContent = '?‘ê·¼ ê±°ë?';
            
            const para = document.createElement('p');
            para.textContent = message;
            
            deniedDiv.appendChild(icon);
            deniedDiv.appendChild(heading);
            deniedDiv.appendChild(para);
            container.appendChild(deniedDiv);
        }
    }

    /**
     * ?˜ì´ì§€ ì´ˆê¸°??
     */
    async function init() {
        // console.log('?“Š ReferralStats initializing...');
        
        // Admin key ê²€ì¦?
        const isValid = await validateAdminKey();
        if (!isValid) return;
        
        // ?µê³„ ë¡œë“œ
        await loadStats();
        
        // ?´ë²¤??ë¦¬ìŠ¤??
        setupEventListeners();
        
        // console.log('??ReferralStats initialized');
    }
    
    /**
     * ?µê³„ ë¡œë“œ ë°??Œë”ë§?
     */
    async function loadStats() {
        showLoading(true);
        
        try {
            const today = ReferralCore.getTodayString();
            const db = firebase.database();
            
            // ?¤ëŠ˜ ë¦¬ë”ë³´ë“œ ê°€?¸ì˜¤ê¸?
            const leaderboardSnapshot = await db.ref(`referrals/leaderboards/daily/${today}`)
                .orderByValue()
                .once('value');
            
            const leaderboardData = leaderboardSnapshot.val() || {};
            
            // ?•ë ¬ (?´ë¦¼ì°¨ìˆœ)
            const sortedData = Object.entries(leaderboardData)
                .map(([id, count]) => ({ id, count }))
                .sort((a, b) => b.count - a.count);
            
            // ?¤ëŠ˜ winners ê°€?¸ì˜¤ê¸?
            const winners = await ReferralCore.getDailyWinners();
            const winnerIds = new Set(winners.map(w => w.id));
            
            // ?Œì´ë¸??Œë”ë§?
            renderLeaderboard(sortedData, winnerIds);
            
            // ?”ì•½ ?µê³„
            renderSummary(sortedData, winners);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            showError('?µê³„ ë¡œë”© ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * ë¦¬ë”ë³´ë“œ ?Œì´ë¸??Œë”ë§?
     */
    function renderLeaderboard(data, winnerIds) {
        const tbody = document.getElementById('leaderboardBody');
        if (!tbody) return;
        
        tbody.textContent = '';
        
        if (data.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.className = 'no-data';
            cell.textContent = '?¤ëŠ˜ ?°ì´?°ê? ?†ìŠµ?ˆë‹¤.';
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }
        
        data.forEach((entry, index) => {
            const rank = index + 1;
            const isWinner = winnerIds.has(entry.id);
            const rankBadge = rank <= 3 ? ['?¥‡', '?¥ˆ', '?¥‰'][rank - 1] : String(rank);
            
            const row = document.createElement('tr');
            if (isWinner) row.className = 'winner-row';
            
            const rankCell = document.createElement('td');
            rankCell.className = 'rank-cell';
            rankCell.textContent = rankBadge;
            
            const idCell = document.createElement('td');
            idCell.className = 'id-cell';
            idCell.textContent = entry.id;
            
            const countCell = document.createElement('td');
            countCell.className = 'count-cell';
            countCell.textContent = entry.count;
            
            const statusCell = document.createElement('td');
            statusCell.className = 'status-cell';
            
            if (isWinner) {
                const winnerBadge = document.createElement('span');
                winnerBadge.className = 'winner-badge';
                winnerBadge.textContent = '?† 50?¬ì„±';
                statusCell.appendChild(winnerBadge);
            }
            
            if (rank <= 3) {
                const top3Badge = document.createElement('span');
                top3Badge.className = 'top3-badge';
                top3Badge.textContent = 'TOP3';
                statusCell.appendChild(top3Badge);
            }
            
            row.appendChild(rankCell);
            row.appendChild(idCell);
            row.appendChild(countCell);
            row.appendChild(statusCell);
            tbody.appendChild(row);
        });
    }
    
    /**
     * ?”ì•½ ?µê³„ ?Œë”ë§?
     */
    function renderSummary(data, winners) {
        const summaryEl = document.getElementById('statsSummary');
        if (!summaryEl) return;
        
        const totalReferrals = data.reduce((sum, entry) => sum + entry.count, 0);
        const totalParticipants = data.length;
        const winnersCount = winners.length;
        
        summaryEl.textContent = '';
        
        // Participants card
        const card1 = document.createElement('div');
        card1.className = 'summary-card';
        const value1 = document.createElement('div');
        value1.className = 'summary-value';
        value1.textContent = totalParticipants;
        const label1 = document.createElement('div');
        label1.className = 'summary-label';
        label1.textContent = 'ì°¸ì—¬????;
        card1.appendChild(value1);
        card1.appendChild(label1);
        
        // Total referrals card
        const card2 = document.createElement('div');
        card2.className = 'summary-card';
        const value2 = document.createElement('div');
        value2.className = 'summary-value';
        value2.textContent = totalReferrals;
        const label2 = document.createElement('div');
        label2.className = 'summary-label';
        label2.textContent = 'ì´?ì¶”ì²œ ??;
        card2.appendChild(value2);
        card2.appendChild(label2);
        
        // Winners card
        const card3 = document.createElement('div');
        card3.className = 'summary-card';
        const value3 = document.createElement('div');
        value3.className = 'summary-value';
        value3.textContent = `${winnersCount}/3`;
        const label3 = document.createElement('div');
        label3.className = 'summary-label';
        label3.textContent = '50?¬ì„± Winners';
        card3.appendChild(value3);
        card3.appendChild(label3);
        
        summaryEl.appendChild(card1);
        summaryEl.appendChild(card2);
        summaryEl.appendChild(card3);
    }

    /**
     * CSV Export
     */
    function exportToCSV() {
        const tbody = document.getElementById('leaderboardBody');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        if (rows.length === 0) {
            alert('?´ë³´???°ì´?°ê? ?†ìŠµ?ˆë‹¤.');
            return;
        }
        
        const today = ReferralCore.getTodayString();
        let csv = 'Rank,Referrer ID,Count,Status\n';
        
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const rank = index + 1;
                const id = cells[1].textContent.trim();
                const count = cells[2].textContent.trim();
                const status = cells[3]?.textContent.trim().replace(/\s+/g, ' ') || '';
                csv += `${rank},"${id}",${count},"${status}"\n`;
            }
        });
        
        // ?¤ìš´ë¡œë“œ
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `referral_ranking_${today}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    /**
     * ?´ë²¤??ë¦¬ìŠ¤???¤ì •
     */
    function setupEventListeners() {
        // CSV Export ë²„íŠ¼
        const exportBtn = document.getElementById('exportCsvBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportToCSV);
        }
        
        // ?ˆë¡œê³ ì¹¨ ë²„íŠ¼
        const refreshBtn = document.getElementById('refreshStatsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadStats);
        }
    }
    
    /**
     * ë¡œë”© ?œì‹œ
     */
    function showLoading(show) {
        const loader = document.getElementById('statsLoader');
        const content = document.getElementById('statsContent');
        
        if (loader) loader.style.display = show ? 'flex' : 'none';
        if (content) content.style.display = show ? 'none' : 'block';
    }
    
    /**
     * ?ëŸ¬ ?œì‹œ
     */
    function showError(message) {
        const errorEl = document.getElementById('statsError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }
    
    // Public API
    return {
        init,
        loadStats,
        exportToCSV
    };
})();

// DOM ë¡œë“œ ??ì´ˆê¸°??
document.addEventListener('DOMContentLoaded', () => {
    ReferralStats.init();
});
