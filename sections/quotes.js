export function renderQuotesList(state, helpers) {
    const rows = (state.quotes || []).map(quote => `
        <tr>
            <td>${quote.number || 'N/A'}</td>
            <td>${quote.client_name || 'N/A'}</td>
            <td>${helpers.formatDate(quote.quote_date)}</td>
            <td>${helpers.formatMoney(quote.total, state.company.currency)}</td>
            <td>${quote.status || 'draft'}</td>
        </tr>
    `).join('');

    return `
        <div style="max-width: 1100px;">
            <div class="page-header">
                <div>
                    <h2 class="page-title">All Quotes</h2>
                    <p class="page-subtitle">Review saved quotes and track status.</p>
                </div>
            </div>

            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Quote #</th>
                            <th>Client</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="5" class="text-center">No quotes have been created yet.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
