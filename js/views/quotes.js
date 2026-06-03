// ── Views: New Quote form ─────────────────────────────────────────────────────────

Object.assign(app, {
renderNewQuote() {
    const clients = this.state.clients || [];
    const catalog = this.state.catalog || [];
    const catalogOpts = catalog.map(i =>
      `<option value="${i.id}" data-name="${i.name}" data-price="${i.cost_price||0}" data-unit="${i.unit||''}">${i.name}${i.category?' ('+i.category+')':''}</option>`
    ).join('');

    return `<div style="max-width:960px;">
      <div class="page-header">
        <div><h2 class="page-title">New Quote</h2><p class="page-subtitle">Create a professional quotation</p></div>
      </div>
      <div class="card">
        <div class="form-grid" style="margin-bottom:16px;">
          <div class="form-group">
            <label>Client</label>
            <select id="nq-client" class="input-field" style="margin-bottom:0;">
              <option value="">-- Select Client --</option>
              ${clients.map(c => `<option value="${c.id}" data-name="${c.name}" data-contact="${c.contact_person||c.name}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Contact Person</label>
            <input type="text" id="nq-contact" class="input-field" placeholder="Contact name" style="margin-bottom:0;">
          </div>
          <div class="form-group">
            <label>Venue</label>
            <input type="text" id="nq-venue" class="input-field" placeholder="e.g. NAIROBI" style="margin-bottom:0;">
          </div>
          <div class="form-group">
            <label>No. of Guests</label>
            <input type="text" id="nq-guests" class="input-field" placeholder="e.g. 500PAX" style="margin-bottom:0;">
          </div>
          <div class="form-group">
            <label>Quote Date</label>
            <input type="date" id="nq-date" class="input-field" value="${helpers.today()}" style="margin-bottom:0;">
          </div>
          <div class="form-group">
            <label>VAT Rate (%)</label>
            <input type="number" id="nq-vat" class="input-field" value="16" min="0" max="100" style="margin-bottom:0;">
          </div>
        </div>

        <!-- Catalog search row -->
        <div style="background:#f0f4f8;border-radius:8px;padding:12px 14px;margin-bottom:14px;">
          <label style="margin-bottom:6px;">Search &amp; Add from Catalog</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="text" id="nq-catalog-search" class="input-field"
              placeholder="Type to filter catalog items…"
              style="flex:1;margin:0;" autocomplete="off">
            <select id="nq-catalog-select" class="input-field" style="flex:2;margin:0;">
              <option value="">-- pick an item --</option>
              ${catalogOpts}
            </select>
            <input type="number" id="nq-catalog-qty" class="input-field"
              placeholder="Qty" style="width:70px;margin:0;" min="1" value="1">
            <button class="button" id="nq-catalog-add-btn" style="white-space:nowrap;">+ Add</button>
          </div>
        </div>

        <!-- Line items -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h3 style="font-size:14px;font-weight:800;margin:0;">Line Items</h3>
          <div style="display:flex;gap:8px;">
            <button class="button secondary" style="font-size:12px;padding:6px 12px;" id="nq-add-item">+ Custom Item</button>
            <button class="button secondary" style="font-size:12px;padding:6px 12px;" id="nq-add-section">+ Section Header</button>
          </div>
        </div>

        <!-- Column labels -->
        <div style="display:flex;gap:6px;padding:4px 0;margin-bottom:2px;">
          <div style="width:70px;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;">Qty</div>
          <div style="flex:1;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;">Description</div>
          <div style="width:130px;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;">Unit Price</div>
          <div style="width:130px;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;">Amount</div>
          <div style="width:36px;"></div>
        </div>

        <div id="nq-items-container">
          ${this.renderNewQuoteItemRow(0)}
        </div>

        <!-- Totals preview -->
        <div style="margin-top:16px;text-align:right;border-top:2px solid #e5e7eb;padding-top:12px;">
          <div style="font-size:13px;margin-bottom:4px;">Subtotal: <strong id="nq-subtotal">KES 0.00</strong></div>
          <div style="font-size:13px;margin-bottom:4px;">VAT (<span id="nq-vat-pct">16</span>%): <strong id="nq-vat-amt">KES 0.00</strong></div>
          <div style="font-size:16px;font-weight:900;color:var(--navy);">Total: <span id="nq-total">KES 0.00</span></div>
        </div>

        <div style="display:flex;gap:12px;margin-top:20px;justify-content:flex-end;">
          <button class="button secondary" id="nq-preview-btn">👁 Preview</button>
          <button class="button green" id="nq-save-btn">💾 Save Quote</button>
        </div>
      </div>
    </div>`;
  },

  renderNewQuoteItemRow(idx, type = 'item', prefill = {}) {
    if (type === 'section') {
      // Section header: white bg + bold dark-maroon text (matches PDF exactly)
      return `<div class="nq-row" data-type="section" data-idx="${idx}"
          style="display:flex;gap:8px;margin-bottom:6px;align-items:center;">
        <input type="text" class="nq-section-name input-field"
          placeholder="Section header name (e.g. CHURCH SETUP)"
          style="flex:1;margin:0;font-weight:700;color:#5a1010;border:2px solid #8B1A2E;">
        <button class="nq-remove-row button red" style="padding:6px 10px;" title="Remove">✕</button>
      </div>`;
    }
    const qty = prefill.qty || '';
    const name = prefill.name || '';
    const price = prefill.price || '';
    return `<div class="nq-row" data-type="item" data-idx="${idx}"
        style="display:flex;gap:6px;margin-bottom:5px;align-items:center;">
      <input type="number" class="nq-qty input-field" placeholder="Qty"
        style="width:70px;margin:0;" min="0" value="${qty}">
      <input type="text" class="nq-name input-field" placeholder="Description"
        style="flex:1;margin:0;" value="${name}">
      <input type="number" class="nq-unit-price input-field" placeholder="Unit Price"
        style="width:130px;margin:0;" min="0" step="0.01" value="${price}">
      <input type="text" class="nq-price-display input-field" placeholder="Amount"
        style="width:130px;margin:0;background:#f9f9f9;" readonly>
      <button class="nq-remove-row button red" style="padding:6px 10px;" title="Remove">✕</button>
    </div>`;
  },

  calcNewQuoteTotals() {
    const vatRate = parseFloat(document.getElementById('nq-vat')?.value || 16) / 100;
    let subtotal = 0;
    document.querySelectorAll('.nq-row[data-type="item"]').forEach(row => {
      const qty = parseFloat(row.querySelector('.nq-qty')?.value || 0);
      const up = parseFloat(row.querySelector('.nq-unit-price')?.value || 0);
      const amount = qty * up;
      const priceDisplay = row.querySelector('.nq-price-display');
      if (priceDisplay) priceDisplay.value = amount > 0 ? amount.toFixed(2) : '';
      subtotal += amount;
    });
    const vatAmt = subtotal * vatRate;
    const total = subtotal + vatAmt;
    const curr = this.state.company.currency || 'KES';
    const el = (id) => document.getElementById(id);
    if (el('nq-subtotal')) el('nq-subtotal').textContent = helpers.formatMoney(subtotal, curr);
    if (el('nq-vat-pct')) el('nq-vat-pct').textContent = (vatRate * 100).toFixed(0);
    if (el('nq-vat-amt')) el('nq-vat-amt').textContent = helpers.formatMoney(vatAmt, curr);
    if (el('nq-total')) el('nq-total').textContent = helpers.formatMoney(total, curr);
    return { subtotal, vatRate: vatRate * 100, vatAmount: vatAmt, total };
  },

  collectNewQuoteData() {
    const clientSel = document.getElementById('nq-client');
    const clientOpt = clientSel?.selectedOptions[0];
    const clientId = clientSel?.value;
    const clientName = clientOpt?.dataset.name || '';
    const contactPerson = document.getElementById('nq-contact')?.value || clientOpt?.dataset.contact || clientName;
    const venue = document.getElementById('nq-venue')?.value || '';
    const noOfGuests = document.getElementById('nq-guests')?.value || '';
    const quoteDate = document.getElementById('nq-date')?.value || helpers.today();
    const { subtotal, vatRate, vatAmount, total } = this.calcNewQuoteTotals();

    const items = [];
    document.querySelectorAll('.nq-row').forEach(row => {
      const type = row.dataset.type;
      if (type === 'section') {
        const sectionType = row.querySelector('.nq-section-type')?.value || 'section';
        const label = row.querySelector('.nq-section-name')?.value || '';
        items.push({ [sectionType]: label });
      } else {
        const qty = parseFloat(row.querySelector('.nq-qty')?.value || 0);
        const name = row.querySelector('.nq-name')?.value || '';
        const unit_price = parseFloat(row.querySelector('.nq-unit-price')?.value || 0);
        const price = qty * unit_price;
        if (name || qty) items.push({ name, qty, unit_price, price });
      }
    });

    return {
      client_id: clientId,
      client_name: clientName,
      venue, no_of_guests: noOfGuests,
      contact_person: contactPerson,
      quote_date: quoteDate,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      subtotal, total,
      items,
    };
  },

  buildPreviewQuote(data) {
    // Convert flat items array (with section/subsection keys) to the groups format
    const previewItems = [];
    for (const it of (data.items || [])) {
      if (it.section) { previewItems.push({ section: it.section }); }
      else if (it.subsection) { previewItems.push({ subsection: it.subsection }); }
      else { previewItems.push(it); }
    }
    return { ...data, items: previewItems };
  }
});
