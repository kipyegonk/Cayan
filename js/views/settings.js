// ── Views: Settings ─────────────────────────────────────────────────────────

Object.assign(app, {
renderSettings() {
    const c = this.state.company || {};
    // Parse saved terms — stored as JSON array or default list
    let termsList = [];
    try { termsList = JSON.parse(c.terms || '[]'); } catch(e) { termsList = []; }
    if (!termsList.length) termsList = [
      'Full payment before delivery.',
      'The client by signing of this agreement, authorizes the company the sole responsibility of supplying and arranging the above facilities.',
      'The client agrees to forfeit the full deposit paid upon booking of the items against cancellation of an order, as this hinder the company against confirming other orders.',
      'It is understood and agreed that the company has no obligation to deliver or provide the required equipment until the full payment has been made not withstanding a booking having been confirmed.',
      'The client agrees to safe guard the equipment and be solely responsible for any loss or damage of the same, that may occur while under the Clients responsibility or in their premises.',
      'The client, by signature of this agreement, indemnifies the company its owners, successors or assignees from all and any claims arising out of loss, injury, damage or any claim by use of this equipment, and further indemnifies the company from any claim which may arise as result of this agreement.'
    ];
    const termsRows = termsList.map((t,i) => `
      <div class="terms-row" data-idx="${i}" style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;">
        <span style="font-size:12px;color:#888;padding-top:10px;min-width:18px;">${i+1}.</span>
        <textarea class="input-field terms-item" rows="2" style="flex:1;margin:0;font-size:12px;resize:vertical;">${t}</textarea>
        <button onclick="this.closest('.terms-row').remove()" style="background:#DC2626;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:12px;margin-top:4px;flex-shrink:0;">✕</button>
      </div>`).join('');

    return `<div style="max-width:780px;">
      <div class="page-header">
        <div><h2 class="page-title">Company Settings</h2></div>
      </div>

      <!-- Company Info -->
      <div class="card" style="margin-bottom:14px;">
        <h3 style="font-size:14px;font-weight:800;margin-bottom:16px;color:var(--navy);">🏢 Company Information</h3>
        <div class="form-grid">
          <div class="form-group full"><label>Company Name</label><input type="text" id="set-name" class="input-field" value="${c.name||''}" placeholder="Cayan Events Ke."></div>
          <div class="form-group"><label>Phone</label><input type="text" id="set-phone" class="input-field" value="${c.phone||''}" placeholder="0737 611 658"></div>
          <div class="form-group"><label>Email</label><input type="email" id="set-email" class="input-field" value="${c.email||''}" placeholder="info@example.com"></div>
          <div class="form-group full"><label>Address</label><input type="text" id="set-address" class="input-field" value="${c.address||''}" placeholder="Mokoyeti West Road, Karen"></div>
          <div class="form-group"><label>Currency</label><input type="text" id="set-currency" class="input-field" value="${c.currency||'KES'}" placeholder="KES"></div>
          <div class="form-group full">
            <label>Company Logo (JPEG / PNG)</label>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
              <input type="file" id="set-logo-file" accept="image/jpeg,image/png,image/gif,image/webp"
                style="flex:1;padding:7px 10px;border:1px solid var(--border);border-radius:7px;font-size:13px;background:#fff;cursor:pointer;">
              ${c.logo ? '<img src="' + c.logo + '" alt="Current logo" style="height:60px;width:auto;border:1px solid var(--border);border-radius:6px;padding:4px;object-fit:contain;">' : '<span style="color:var(--gray);font-size:12px;">No logo uploaded yet</span>'}
            </div>
            <p style="font-size:11px;color:var(--gray);margin:4px 0 0;">Upload a JPEG or PNG. Recommended: transparent background, square crop.</p>
          </div>
        </div>
      </div>

      <!-- Terms & Conditions -->
      <div class="card" style="margin-bottom:14px;">
        <h3 style="font-size:14px;font-weight:800;margin-bottom:4px;color:var(--navy);">📋 Terms &amp; Conditions</h3>
        <p style="font-size:12px;color:var(--gray);margin-bottom:14px;">Each point appears as a bullet on every quote. Edit, remove or add points.</p>
        <div id="terms-list-editor">${termsRows}</div>
        <button id="add-term-btn" class="button secondary" style="margin-top:4px;font-size:12px;">+ Add Point</button>
      </div>

      <!-- Digital Signature -->
      <div class="card" style="margin-bottom:14px;">
        <h3 style="font-size:14px;font-weight:800;margin-bottom:4px;color:var(--navy);">✍️ Company Signature</h3>
        <p style="font-size:12px;color:var(--gray);margin-bottom:14px;">Draw your signature or upload an image. It will appear on every quote.</p>
        <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start;">
          <!-- Draw pad -->
          <div>
            <p style="font-size:12px;font-weight:700;margin-bottom:6px;">Draw Signature:</p>
            <canvas id="sig-pad" width="340" height="120"
              style="border:2px solid var(--border);border-radius:8px;cursor:crosshair;background:#fff;touch-action:none;display:block;"></canvas>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button id="sig-clear-btn" class="button secondary" style="font-size:12px;padding:6px 12px;">🗑 Clear</button>
              <button id="sig-use-btn" class="button green" style="font-size:12px;padding:6px 12px;">✓ Use This</button>
            </div>
          </div>
          <!-- Upload or current -->
          <div>
            <p style="font-size:12px;font-weight:700;margin-bottom:6px;">Or Upload Signature Image:</p>
            <input type="file" id="set-sig-file" accept="image/*"
              style="padding:7px 10px;border:1px solid var(--border);border-radius:7px;font-size:12px;background:#fff;cursor:pointer;display:block;margin-bottom:10px;">
            ${c.signature ? `
              <p style="font-size:11px;color:var(--gray);margin-bottom:4px;">Current signature:</p>
              <img src="${c.signature}" style="max-height:80px;max-width:240px;border:1px solid var(--border);border-radius:6px;padding:4px;object-fit:contain;display:block;">
              <button id="sig-remove-btn" class="button red" style="font-size:11px;padding:4px 10px;margin-top:6px;">Remove</button>
            ` : '<p style="font-size:11px;color:var(--gray);">No signature saved yet.</p>'}
          </div>
        </div>
      </div>

      <!-- Change My Password -->
      <div class="card" style="margin-bottom:14px;">
        <h3 style="font-size:14px;font-weight:800;margin-bottom:4px;color:var(--navy);">🔑 Change My Password</h3>
        <p style="font-size:12px;color:var(--gray);margin-bottom:14px;">Update your own login password.</p>
        <div class="form-grid">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" id="pwd-current" class="input-field" placeholder="Enter current password">
          </div>
          <div class="form-group"></div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="pwd-new" class="input-field" placeholder="Min. 6 characters">
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" id="pwd-confirm" class="input-field" placeholder="Repeat new password">
          </div>
        </div>
        <button class="button" id="change-pwd-btn" style="background:#760014;">🔑 Update Password</button>
      </div>

      <button class="button green" id="set-save-btn" style="padding:12px 28px;font-size:14px;">💾 Save All Settings</button>
    </div>`;
  }
});
