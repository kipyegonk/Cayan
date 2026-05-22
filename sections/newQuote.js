export function generateQuotePreview(quoteData, company, helpers) {
    const sections = {};
    let subtotal = 0;

    quoteData.items.forEach(item => {
        if (!sections[item.category]) sections[item.category] = [];
        sections[item.category].push(item);
        subtotal += item.quantity * item.unit_price;
    });

    let html = `
        <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 20px auto; padding: 30px; border: 1px solid #ddd;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0;">Cayan Events</h1>
                <p>Quotation for ${quoteData.client_name}</p>
            </div>

            ${Object.keys(sections).map(section => {
                const items = sections[section];
                const sectionTotal = items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
                
                return `
                    <div style="margin-bottom: 25px;">
                        <h3 style="background:#f8f9fa; padding:8px 12px; margin:0;">${section}</h3>
                        <table style="width:100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background:#f1f1f1;">
                                    <th style="text-align:left; padding:8px;">Description</th>
                                    <th style="text-align:right; padding:8px;">Qty</th>
                                    <th style="text-align:right; padding:8px;">Unit Price</th>
                                    <th style="text-align:right; padding:8px;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr>
                                        <td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td>
                                        <td style="text-align:right; padding:8px;">${item.quantity}</td>
                                        <td style="text-align:right; padding:8px;">${helpers.formatMoney(item.unit_price)}</td>
                                        <td style="text-align:right; padding:8px;">${helpers.formatMoney(item.quantity * item.unit_price)}</td>
                                    </tr>
                                `).join('')}
                                <tr style="font-weight:bold; background:#f9f9f9;">
                                    <td colspan="3" style="text-align:right; padding:8px;">Section Total:</td>
                                    <td style="text-align:right; padding:8px;">${helpers.formatMoney(sectionTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }).join('')}

            <div style="text-align:right; margin-top:20px; font-size:1.1em;">
                <strong>Grand Total: ${helpers.formatMoney(subtotal)}</strong>
            </div>

            <div style="margin-top:40px; font-size:0.9em; color:#555;">
                <strong>Terms & Conditions:</strong><br>
                ${company.terms || 'Payment due within 30 days.'}
            </div>
        </div>
    `;

    return html;
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
            <div class="quote-builder" style="display: grid; grid-template-columns: 1fr 1.4fr; gap: 18px;">
                <div class="catalog-panel card" style="padding: 20px;">
                    <h3 style="margin-top:0;">Select Items</h3>
                    ${Object.keys(grouped).map(cat => `
                        <div style="margin-bottom: 20px;">
                            <h4 style="margin: 0 0 10px;">${cat}</h4>
                            <div style="display:grid; gap:10px;">
                                ${grouped[cat].map(item => `
                                    <div class="catalog-item" style="padding:12px; border:1px solid #e5e7eb; border-radius:8px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                                        <div>
                                            <strong>${item.name}</strong><br>
                                            <small>${helpers.formatMoney(item.cost_price)}</small>
                                        </div>
                                        <button class="button secondary" data-id="${item.id}">Add</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="quote-preview-panel card" style="padding: 20px;">
                    <h3 style="margin-top:0;">Quote Preview</h3>
                    <div id="live-quote-preview" style="min-height: 300px; color: #374151;">Select items to build your quote.</div>
                </div>
            </div>
        </div>
    `;
}
