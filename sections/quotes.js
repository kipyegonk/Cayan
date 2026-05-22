export function renderQuotesList(state, helpers) {
    return `
        <div style="max-width: 1100px;">
            <div class="page-header">
                <div>
                    <h2 class="page-title">Quotations</h2>
                    <p class="page-subtitle">Manage all client quotations</p>
                </div>
                <button class="button green" onclick="app.navigateTo('new-quote')">+ New Quote</button>
            </div>
            <div class="card">
                <p>Quotes list coming soon with status tracking...</p>
            </div>
        </div>
    `;
}

export function renderNewQuote(state, helpers) {
    const catalog = state.catalog || [];
    const grouped = {};

    catalog.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    return `
        <div style="max-width: 1200px; margin: 0 auto;">
            <div class="page-header">
                <h2 class="page-title">Create New Quotation</h2>
            </div>
            
            <div class="quote-builder">
                <div class="catalog-panel">
                    <h3>Select Items</h3>
                    ${Object.keys(grouped).map(cat => `
                        <div class="category-group">
                            <h4>${cat}</h4>
                            <div class="items-grid">
                                ${grouped[cat].map(item => `
                                    <div class="catalog-item" data-id="${item.id}">
                                        <strong>${item.name}</strong><br>
                                        <small>${helpers.formatMoney(item.cost_price)}</small>
                                        <button class="add-item-btn" data-id="${item.id}">Add</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="quote-preview-panel">
                    <h3>Quote Preview</h3>
                    <div id="live-quote-preview">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </div>
        </div>
    `;
}