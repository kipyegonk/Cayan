function createDefaultDraft(state, helpers) {
    const today = helpers.today();
    const validDays = 30;
    const defaultUnit = state.dropdowns?.units?.[0] || 'unit';

    return {
        id: helpers.generateId(),
        client_id: '',
        client_name: '',
        client_company: '',
        title: '',
        venue: '',
        guests: '',
        contact_person: '',
        quote_date: today,
        valid_days: validDays,
        valid_until: helpers.addDays(today, validDays),
        include_vat: true,
        vat_rate: 16,
        subtotal: '0.00',
        vat_amount: '0.00',
        total: '0.00',
        status: 'draft',
        notes: '',
        number: '',
        items: [
            {
                id: helpers.generateId(),
                name: '',
                description: '',
                category: state.dropdowns?.categories?.[0] || 'General',
                quantity: 1,
                unit: defaultUnit,
                unit_price: '0.00',
                margin: 20,
            }
        ]
    };
}

function renderClientOptions(clients, quote) {
    const options = [`<option value="">Select client</option>`];
    if (Array.isArray(clients)) {
        options.push(...clients.map(client => `
            <option value="${client.id}" ${client.id === quote.client_id ? 'selected' : ''}>
                ${client.name} ${client.company ? `(${client.company})` : ''}
            </option>
        `));
    }
    return options.join('');
}

function renderQuoteItems(quote, units, categories) {
    return quote.items.map(item => `
        <tr class="quote-item-row">
            <td>
                <select data-item-id="${item.id}" data-quote-item-field="category" class="input-field">
                    ${categories.map(category => `<option value="${category}" ${category === item.category ? 'selected' : ''}>${category}</option>`).join('')}
                </select>
            </td>
            <td><input data-item-id="${item.id}" data-quote-item-field="name" class="input-field" type="text" value="${item.name}" placeholder="Item name"></td>
            <td><input data-item-id="${item.id}" data-quote-item-field="description" class="input-field" type="text" value="${item.description}" placeholder="Description"></td>
            <td><input data-item-id="${item.id}" data-quote-item-field="quantity" class="input-field" type="number" min="1" value="${item.quantity}"></td>
            <td>
                <select data-item-id="${item.id}" data-quote-item-field="unit" class="input-field">
                    ${units.map(unit => `<option value="${unit}" ${unit === item.unit ? 'selected' : ''}>${unit}</option>`).join('')}
                </select>
            </td>
            <td><input data-item-id="${item.id}" data-quote-item-field="unit_price" class="input-field" type="number" min="0" step="0.01" value="${item.unit_price}"></td>
            <td><input data-item-id="${item.id}" data-quote-item-field="margin" class="input-field" type="number" min="0" max="100" value="${item.margin}"></td>
            <td class="text-center">
                <button type="button" class="button secondary quote-item-remove-btn" data-item-id="${item.id}">Remove</button>
            </td>
        </tr>
    `).join('');
}

function renderQuotePreview(quote, company, helpers) {
    const currency = company.currency || 'KES';
    const companyName = company.name || 'Your Company';
    const companyEmail = company.email || 'email@company.com';
    const companyPhone = company.phone || '+254 700 000 000';
    const companyAddress = company.address || 'Company address';
    const paymentTerms = company.terms || 'Payment due within 30 days from invoice date.';

    const groupedItems = (quote.items || []).reduce((groups, item) => {
        const category = item.category || 'General';
        if (!groups[category]) groups[category] = [];
        groups[category].push(item);
        return groups;
    }, {});

    const itemRows = Object.keys(groupedItems).map(category => `
        <tr class="quote-table-section-row">
            <td colspan="4">${category}</td>
        </tr>
        ${groupedItems[category].map(item => {
            const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
            return `
                <tr>
                    <td>${item.quantity || 0}</td>
                    <td>${item.name || '—'}${item.description ? `<div style="font-size:12px; color:#4B5563; margin-top:4px;">${item.description}</div>` : ''}</td>
                    <td>${helpers.formatMoney(item.unit_price, currency)}</td>
                    <td>${helpers.formatMoney(lineTotal, currency)}</td>
                </tr>
            `;
        }).join('')}
    `).join('');

    return `
        <div class="quote-preview" id="quote-preview">
            <div class="quote-header">
                <div class="quote-branding">
                    <div class="quote-logo">${companyName.charAt(0) || 'Q'}</div>
                    <div>
                        <div style="font-size: 16px; font-weight: 700; letter-spacing: 0.08em;">${companyName}</div>
                        <div style="font-size: 13px; color: #4B5563; margin-top: 6px;">${companyAddress}</div>
                    </div>
                </div>
                <div class="quote-contact">
                    <div><strong>Phone:</strong> ${companyPhone}</div>
                    <div><strong>Email:</strong> ${companyEmail}</div>
                    <div><strong>Address:</strong> ${companyAddress}</div>
                </div>
            </div>

            <div class="quote-top-details">
                <div>
                    <div><strong>Statement No:</strong> ${quote.number || 'Draft'}</div>
                    <div><strong>Title:</strong> ${quote.title || '-'}</div>
                </div>
                <div>
                    <div><strong>Date:</strong> ${helpers.formatDate(quote.quote_date)}</div>
                    <div><strong>Venue:</strong> ${quote.venue || '-'}</div>
                </div>
                <div>
                    <div><strong>No of Guests:</strong> ${quote.guests || '-'}</div>
                    <div><strong>Contact Person:</strong> ${quote.contact_person || (quote.client_name || '-')}</div>
                </div>
            </div>

            <table class="quote-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">Qty</th>
                        <th>Description</th>
                        <th style="width: 140px;">Unit Price</th>
                        <th style="width: 140px;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows || '<tr><td colspan="4" style="padding: 20px; text-align:center;">No quote items added yet.</td></tr>'}
                </tbody>
            </table>

            <div class="quote-summary">
                <div>
                    <div class="quote-terms-title">Terms and Conditions</div>
                    <ul style="margin-top: 8px; padding-left: 18px; color: #4B5563; font-size: 12px; line-height: 1.65;">
                        <li>Payment before delivery.</li>
                        <li>The client is responsible for supplying and arranging the above facilities.</li>
                        <li>All cancellations are subject to company cancellation terms.</li>
                    </ul>
                </div>
                <div class="quote-total">
                    <div><span>TOTAL</span><strong>${helpers.formatMoney(quote.subtotal, currency)}</strong></div>
                    <div><span>VAT ${quote.vat_rate}%</span><strong>${helpers.formatMoney(quote.vat_amount, currency)}</strong></div>
                    <div style="margin-top: 10px; font-size: 16px; font-weight: 700; border-top: 1px solid var(--border); padding-top: 10px;"><span>TOTAL VAT INC.</span><strong>${helpers.formatMoney(quote.total, currency)}</strong></div>
                </div>
            </div>

            <div class="quote-footer">
                <div>Regards,</div>
                <div style="margin-top: 18px; font-weight: 700;">${quote.contact_person || quote.client_name || 'Contact Name'}</div>
                <div style="margin-top: 6px; font-size: 12px; color: #4B5563;">Date: ${helpers.formatDate(quote.quote_date)}</div>
            </div>

            <div class="quote-actions">
                <button type="button" id="quote-print-btn" class="button secondary">Print Preview</button>
                <button type="button" id="quote-save-btn" class="button green">Save Quote</button>
            </div>
        </div>
    `;
}

export function renderNewQuote(state, helpers) {
    if (!state.quoteDraft) {
        state.quoteDraft = createDefaultDraft(state, helpers);
    }

    const quote = state.quoteDraft;
    const units = state.dropdowns?.units || ['unit', 'hr', 'lot', 'project', 'year'];

    return `
        <div style="max-width: 1200px;">
            <div class="page-header">
                <div>
                    <h2 class="page-title">New Quote</h2>
                    <p class="page-subtitle">Build a quote and preview the final output before saving.</p>
                </div>
            </div>

            <div class="quote-layout">
                <div class="quote-card quote-section">
                    <div class="page-subtitle" style="font-weight: 700; margin-bottom: 12px;">Quote details</div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Client</label>
                            <select id="quote-client-select" class="input-field">
                                ${renderClientOptions(state.clients, quote)}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Quote date</label>
                            <input id="quote-date" data-quote-field="quote_date" class="input-field" type="date" value="${quote.quote_date}">
                        </div>
                        <div class="form-group">
                            <label>Valid days</label>
                            <input id="quote-valid-days" data-quote-field="valid_days" class="input-field" type="number" min="1" value="${quote.valid_days}">
                        </div>
                        <div class="form-group">
                            <label>Valid until</label>
                            <input id="quote-valid-until" class="input-field" type="date" value="${quote.valid_until}" disabled>
                        </div>
                        <div class="form-group full">
                            <label>Client name</label>
                            <input id="quote-client-name" data-quote-field="client_name" class="input-field" type="text" value="${quote.client_name}" placeholder="Client full name">
                        </div>
                        <div class="form-group full">
                            <label>Client company</label>
                            <input id="quote-client-company" data-quote-field="client_company" class="input-field" type="text" value="${quote.client_company}" placeholder="Company name">
                        </div>
                        <div class="form-group">
                            <label>VAT included</label>
                            <select id="quote-include-vat" data-quote-field="include_vat" class="input-field">
                                <option value="true" ${quote.include_vat ? 'selected' : ''}>Yes</option>
                                <option value="false" ${!quote.include_vat ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>VAT rate</label>
                            <input id="quote-vat-rate" data-quote-field="vat_rate" class="input-field" type="number" min="0" max="100" value="${quote.vat_rate}">
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="quote-status" data-quote-field="status" class="input-field">
                                <option value="draft" ${quote.status === 'draft' ? 'selected' : ''}>Draft</option>
                                <option value="pending" ${quote.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="accepted" ${quote.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                                <option value="declined" ${quote.status === 'declined' ? 'selected' : ''}>Declined</option>
                            </select>
                        </div>
                        <div class="form-group full">
                            <label>Notes</label>
                            <textarea id="quote-notes" data-quote-field="notes" class="input-field" rows="4" placeholder="Enter special instructions or payment notes">${quote.notes}</textarea>
                        </div>
                    </div>

                    <div class="page-subtitle" style="font-weight: 700; margin-top: 16px;">Quote items</div>
                    <div style="overflow-x: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Qty</th>
                                    <th>Unit</th>
                                    <th>Unit Price</th>
                                    <th>Margin</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${renderQuoteItems(quote, units)}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" id="quote-add-item" class="button secondary" style="width: fit-content; margin-top: 14px;">+ Add item</button>
                </div>

                <div class="quote-section">
                    ${renderQuotePreview(quote, state.company, helpers)}
                </div>
            </div>
        </div>
    `;
}
