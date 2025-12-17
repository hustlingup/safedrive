/**
 * SafeDrive Referral Stats Module
 * referral-stats.html 전용 - 관리자 통계 페이지
 */

const ReferralStats = (function() {
    'use strict';
    
    // Admin key는 URL 파라미터로 검증
    // 실제 키는 서버사이드나 환경변수에서 관리 권장
    const ADMIN_KEY_PARAM = 'key';
    
    // 환경변수에서 admin key 로드 (빌드 시 주입되거나 config에서 로드)
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
                showAccessDenied('유효하지 않은 접근 키입니다.');
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
            container.innerHTML = `
                <div class="access-denied">
                    <div class="denied-icon">🔒</div>
                    <h2>접근 거부</h2>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * 페이지 초기화
     */
    async function init() {
        console.log('📊 ReferralStats initializing...');
        
        // Admin key 검증
        const isValid = await validateAdminKey();
        if (!isValid) return;
        
        // 통계 로드
        await loadStats();
        
        // 이벤트 리스너
        setupEventListeners();
        
        console.log('✅ ReferralStats initialized');
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
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">오늘 데이터가 없습니다.</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map((entry, index) => {
            const rank = index + 1;
            const isWinner = winnerIds.has(entry.id);
            const rankBadge = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank;
            
            return `
                <tr class="${isWinner ? 'winner-row' : ''}">
                    <td class="rank-cell">${rankBadge}</td>
                    <td class="id-cell">${entry.id}</td>
                    <td class="count-cell">${entry.count}</td>
                    <td class="status-cell">
                        ${isWinner ? '<span class="winner-badge">🏆 50달성</span>' : ''}
                        ${rank <= 3 ? '<span class="top3-badge">TOP3</span>' : ''}
                    </td>
                </tr>
            `;
        }).join('');
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
        
        summaryEl.innerHTML = `
            <div class="summary-card">
                <div class="summary-value">${totalParticipants}</div>
                <div class="summary-label">참여자 수</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${totalReferrals}</div>
                <div class="summary-label">총 추천 수</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${winnersCount}/3</div>
                <div class="summary-label">50달성 Winners</div>
            </div>
        `;
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

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    ReferralStats.init();
});
