/**
 * SafeDrive Referral Stats Module
 * referral-stats.html 전용 - 관리자 통계 페이지
 */

const ReferralStats = (function() {
    'use strict';
    
    // Admin key는 URL 파라미터로 검증
    // 실제 환경에서는 서버사이드나 환경변수에서 관리 권장
    const ADMIN_KEY_PARAM = 'key';
    
    // 환경변수에서 admin key 로드 (빌드 시 주입하거나 config에서 로드)
    // 클라이언트 사이드에서는 Firebase에서 검증하는 방식 권장
    let validAdminKey = null;
    
    /**
     * Admin key 검증
     */
    async function validateAdminKey() {
        const urlParams = new URLSearchParams(window.location.search);
        const providedKey = urlParams.get(ADMIN_KEY_PARAM);
        
        if (!providedKey) {
            showAccessDenied('접근 키가 필요합니다.');
            return false;
        }
        
        // Firebase에서 admin key 검증
        try {
            const db = firebase.database();
            const snapshot = await db.ref('referrals/config/adminKey').once('value');
            validAdminKey = snapshot.val();
            
            if (!validAdminKey || providedKey !== validAdminKey) {
                showAccessDenied('유효하지 않은 접근 시도입니다.');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Admin key validation error:', error);
            showAccessDenied('인증 오류가 발생했습니다.');
            return false;
        }
    }
    
    /**
     * 접근 거부 표시
     */
    function showAccessDenied(message) {
        const container = document.getElementById('statsContainer');
        if (container) {
            container.textContent = '';
            
            const deniedDiv = document.createElement('div');
            deniedDiv.className = 'access-denied';
            
            const icon = document.createElement('div');
            icon.className = 'denied-icon';
            icon.textContent = '🚫';
            
            const heading = document.createElement('h2');
            heading.textContent = '접근 거부';
            
            const para = document.createElement('p');
            para.textContent = message;
            
            deniedDiv.appendChild(icon);
            deniedDiv.appendChild(heading);
            deniedDiv.appendChild(para);
            container.appendChild(deniedDiv);
        }
    }


    /**
     * 페이지 초기화
     */
    async function init() {
        // Admin key 검증
        const isValid = await validateAdminKey();
        if (!isValid) return;
        
        // 통계 로드
        await loadStats();
        
        // 이벤트 리스너
        setupEventListeners();
    }
    
    /**
     * 통계 로드 및 렌더링
     */
    async function loadStats() {
        showLoading(true);
        
        try {
            const today = ReferralCore.getTodayString();
            const db = firebase.database();
            
            // 오늘 리더보드 가져오기
            const leaderboardSnapshot = await db.ref(`referrals/leaderboards/daily/${today}`)
                .orderByValue()
                .once('value');
            
            const leaderboardData = leaderboardSnapshot.val() || {};
            
            // 정렬 (내림차순)
            const sortedData = Object.entries(leaderboardData)
                .map(([id, count]) => ({ id, count }))
                .sort((a, b) => b.count - a.count);
            
            // 오늘 winners 가져오기
            const winners = await ReferralCore.getDailyWinners();
            const winnerIds = new Set(winners.map(w => w.id));
            
            // 테이블 렌더링
            renderLeaderboard(sortedData, winnerIds);
            
            // 요약 통계
            renderSummary(sortedData, winners);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            showError('통계 로딩 중 오류가 발생했습니다.');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * 리더보드 테이블 렌더링
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
            cell.textContent = '오늘 데이터가 없습니다.';
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }
        
        data.forEach((entry, index) => {
            const rank = index + 1;
            const isWinner = winnerIds.has(entry.id);
            const rankBadge = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : String(rank);
            
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
                winnerBadge.textContent = '🏆 50달성';
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
     * 요약 통계 렌더링
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
        label1.textContent = '참여자 수';
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
        label2.textContent = '총 추천 수';
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
        label3.textContent = '50달성 Winners';
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
            alert('내보낼 데이터가 없습니다.');
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
        
        // 다운로드
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `referral_ranking_${today}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    /**
     * 이벤트 리스너 설정
     */
    function setupEventListeners() {
        // CSV Export 버튼
        const exportBtn = document.getElementById('exportCsvBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportToCSV);
        }
        
        // 새로고침 버튼
        const refreshBtn = document.getElementById('refreshStatsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadStats);
        }
    }
    
    /**
     * 로딩 표시
     */
    function showLoading(show) {
        const loader = document.getElementById('statsLoader');
        const content = document.getElementById('statsContent');
        
        if (loader) loader.style.display = show ? 'flex' : 'none';
        if (content) content.style.display = show ? 'none' : 'block';
    }
    
    /**
     * 에러 표시
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

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    ReferralStats.init();
});
