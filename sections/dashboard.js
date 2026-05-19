export function renderDashboard(state, helpers) {
    const stats = state.stats || {};
    return `
        <div style="max-width: 1100px;">
            <div class="page-header">
                <div>
                    <h2 class="page-title">Dashboard</h2>
                    <p class="page-subtitle">Overview of your quotation activity</p>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📄</div>
                    <div class="stat-label">Total Quotes</div>
                    <div class="stat-value">${stats.total_quotes || 0}</div>
                </div>
                <div class="stat-card" style="border-top-color: var(--green);">
                    <div class="stat-icon">💰</div>
                    <div class="stat-label">Total Value</div>
                    <div class="stat-value">${helpers.formatMoney(stats.total_value, state.company.currency)}</div>
                </div>
                <div class="stat-card" style="border-top-color: var(--amber);">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-label">Pending</div>
                    <div class="stat-value">${stats.pending || 0}</div>
                </div>
                <div class="stat-card" style="border-top-color: var(--green);">
                    <div class="stat-icon">✅</div>
                    <div class="stat-label">Accepted</div>
                    <div class="stat-value">${stats.accepted || 0}</div>
                </div>
                <div class="stat-card" style="border-top-color: #7C3AED;">
                    <div class="stat-icon">👥</div>
                    <div class="stat-label">Clients</div>
                    <div class="stat-value">${stats.clients || 0}</div>
                </div>
            </div>
        </div>
    `;
}
