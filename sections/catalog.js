export function renderCatalog(state, helpers) {
    const items = state.catalog || [];
    if (!items.length) {
        return `
            <div style="max-width: 1100px;">
                <div class="page-header">
                    <div>
                        <h2 class="page-title">Catalog</h2>
                        <p class="page-subtitle">Your product and service catalogue is empty.</p>
                    </div>
                </div>
                <div class="card">
                    <p style="color: #374151;">No catalog items are available yet. Add items through the API or seed the database, then reload this page.</p>
                </div>
            </div>
        `;
    }

    return `
        <div style="max-width: 1100px;">
            <div class="page-header">
                <div>
                    <h2 class="page-title">Catalog</h2>
                    <p class="page-subtitle">Browse your products and services ready for quoting.</p>
                </div>
            </div>
            <div class="card">
                <div style="overflow-x:auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Cost</th>
                                <th>Margin</th>
                                <th>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>${item.name || '—'}</td>
                                    <td>${item.category || '—'}</td>
                                    <td>${item.description ? item.description.replace(/\s+/g, ' ').trim().slice(0, 80) + (item.description.length > 80 ? '…' : '') : '—'}</td>
                                    <td>${helpers.formatMoney(item.cost_price, state.company.currency)}</td>
                                    <td>${item.margin ? item.margin + '%' : '—'}</td>
                                    <td>${item.unit || '—'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}
