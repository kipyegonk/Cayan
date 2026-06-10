// Events: Modal + all bindEvents handlers 

Object.assign(app, {
// Modal helper 
  showModal(title, bodyHtml, onConfirm, confirmLabel = 'Save') {
    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();
    const m = document.createElement('div');
    m.id = 'app-modal';
    m.className = 'modal';
    m.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div id="modal-body">${bodyHtml}</div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
          <button class="button secondary" id="modal-cancel-btn">Cancel</button>
          <button class="button green" id="modal-confirm-btn">${confirmLabel}</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    const close = () => m.remove();
    document.getElementById('modal-close-btn').onclick = close;
    document.getElementById('modal-cancel-btn').onclick = close;
    document.getElementById('modal-confirm-btn').onclick = () => onConfirm(m, close);
    m.addEventListener('click', (e) => { if (e.target === m) close(); });
  },

  bindEvents() {
    // ── Auth ──────────────────────────────────────────────────────────────────
    document.querySelectorAll('.auth-tab, .auth-mode-btn').forEach(b => b.addEventListener('click', (e) => {
      this.state.authMode = e.currentTarget.dataset.mode; this.render();
    }));
    document.getElementById('auth-submit')?.addEventListener('click', async () => {
      const email = document.getElementById('auth-email')?.value;
      const password = document.getElementById('auth-password')?.value;
      if (this.state.authMode === 'login') {
        if (!email || !password) { this.notify('Enter email and password', 'error'); return; }
        await this.handleLogin(email, password);
      } else {
        const name = document.getElementById('reg-name')?.value;
        if (!name || !email || !password) { this.notify('All fields required', 'error'); return; }
        await this.handleRegister(name, email, password);
      }
    });

    // ── Nav ───────────────────────────────────────────────────────────────────
    document.querySelectorAll('.nav-item').forEach(b =>
      b.addEventListener('click', (e) => this.setView(e.currentTarget.dataset.view)));
    document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

    // ── Quote preview buttons ─────────────────────────────────────────────────
    document.querySelectorAll('[data-preview-quote]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.previewQuote;
        const quote = await API.quotes.get(id);
        if (!quote.created_by) quote.created_by = this.state.user?.name || '';
        showQuotePreview(quote, this.state.company);
      });
    });

    // ── New Quote ─────────────────────────────────────────────────────────────
    if (document.getElementById('nq-items-container')) {
      // Single persistent delegated listener on the container for row events
      const nqContainer = document.getElementById('nq-items-container');
      nqContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('nq-remove-row')) {
          e.target.closest('.nq-row')?.remove();
          this.calcNewQuoteTotals();
        }
      });
      nqContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('nq-qty') || e.target.classList.contains('nq-unit-price')) {
          this.calcNewQuoteTotals();
        }
      });
      nqContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('nq-section-type')) {
          const input = e.target.closest('.nq-row')?.querySelector('.nq-section-name');
          if (input) input.style.background = e.target.value === 'subsection' ? '#2c2c2c' : '#8B1A1A';
        }
      });

      document.getElementById('nq-vat')?.addEventListener('input', () => this.calcNewQuoteTotals());

      // ── Catalog search filter ──────────────────────────────────────────────
      document.getElementById('nq-catalog-search')?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const sel = document.getElementById('nq-catalog-select');
        if (!sel) return;
        Array.from(sel.options).forEach(opt => {
          if (opt.value === '') return;
          opt.hidden = !!(q && !opt.text.toLowerCase().includes(q));
        });
        const visible = Array.from(sel.options).filter(o => o.value && !o.hidden);
        if (visible.length === 1) sel.value = visible[0].value;
      });

      // ── Add from catalog ───────────────────────────────────────────────────
      let rowIdx = 1;
      document.getElementById('nq-catalog-add-btn')?.addEventListener('click', () => {
        const sel = document.getElementById('nq-catalog-select');
        const qtyInput = document.getElementById('nq-catalog-qty');
        if (!sel || !sel.value) { app.notify('Pick a catalog item first', 'error'); return; }
        const opt = sel.selectedOptions[0];
        const qty = parseFloat(qtyInput?.value || 1);
        const unitPrice = parseFloat(opt.dataset.price || 0);
        const container = document.getElementById('nq-items-container');
        container.insertAdjacentHTML('beforeend', app.renderNewQuoteItemRow(rowIdx++, 'item', {
          name: opt.dataset.name || opt.text,
          qty,
          price: unitPrice,
        }));
        app.calcNewQuoteTotals();
        sel.value = '';
        if (qtyInput) qtyInput.value = 1;
        const searchEl = document.getElementById('nq-catalog-search');
        if (searchEl) { searchEl.value = ''; }
        Array.from(sel.options).forEach(o => o.hidden = false);
      });

      document.getElementById('nq-add-item')?.addEventListener('click', () => {
        document.getElementById('nq-items-container').insertAdjacentHTML('beforeend', this.renderNewQuoteItemRow(rowIdx++));
      });
      document.getElementById('nq-add-section')?.addEventListener('click', () => {
        document.getElementById('nq-items-container').insertAdjacentHTML('beforeend', this.renderNewQuoteItemRow(rowIdx++, 'section'));
      });
      document.getElementById('nq-client')?.addEventListener('change', (e) => {
        const opt = e.target.selectedOptions[0];
        const cp = document.getElementById('nq-contact');
        if (cp && opt) cp.value = opt.dataset.contact || '';
      });
      document.getElementById('nq-preview-btn')?.addEventListener('click', () => {
        this.calcNewQuoteTotals();
        const data = this.collectNewQuoteData();
        const preview = this.buildPreviewQuote(data);
        preview.number = 'PREVIEW';
        preview.created_by = this.state.user?.name || '';
        showQuotePreview(preview, this.state.company);
      });
      document.getElementById('nq-save-btn')?.addEventListener('click', async () => {
        this.calcNewQuoteTotals();
        const data = this.collectNewQuoteData();
        if (!data.client_id) { this.notify('Please select a client', 'error'); return; }
        const result = await API.quotes.create(data);
        if (result.id || result.success) {
          this.notify('Quote saved!', 'success');
          await this.loadAppData();
          this.state.view = 'quotes';
          this.render();
        } else { this.notify(result.error || 'Failed to save quote', 'error'); }
      });
      this.calcNewQuoteTotals();
    }

    // ── Catalog ───────────────────────────────────────────────────────────────
    const CATEGORIES = ['Tents & Structures','Flowers & Décor','Lighting','Furniture','Catering','Logistics','Audio Visual','Miscellaneous'];
    const UNITS = ['pcs','set','day','hr','table','chair','per person','lot','m²','kg'];

    const calcSell = () => {
      const c = parseFloat(document.getElementById('cat-cost')?.value||0);
      const m = parseFloat(document.getElementById('cat-margin')?.value||0);
      const sp = document.getElementById('cat-sell');
      if (sp) sp.value = (c * (1 + m/100)).toFixed(2);
    };

    const catModalBody = (item={}) => {
      const costVal = item.cost_price||item.amount||'';
      const marginVal = item.margin||'';
      const sellVal = (item.cost_price && item.margin)
        ? (parseFloat(item.cost_price||0)*(1+(parseFloat(item.margin||0)/100))).toFixed(2)
        : (item.unit_price||'');
      return `
      <div class="form-grid">
        <div class="form-group full">
          <label>Item Name</label>
          <input id="cat-name" class="input-field" placeholder="e.g. Floral chandelier" style="margin:0;" value="${item.name||''}">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="cat-category" class="input-field" style="margin:0;">
            <option value="">-- Select Category --</option>
            ${CATEGORIES.map(c => '<option value="'+c+'"'+(item.category===c?' selected':'')+'>'+c+'</option>').join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Unit</label>
          <select id="cat-unit" class="input-field" style="margin:0;">
            <option value="">-- Select Unit --</option>
            ${UNITS.map(u => '<option value="'+u+'"'+(item.unit===u?' selected':'')+'>'+u+'</option>').join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Cost / Amount (KES)</label>
          <input id="cat-cost" type="number" min="0" step="0.01" class="input-field"
            placeholder="0.00" style="margin:0;" value="${costVal}" oninput="calcSell()">
        </div>
        <div class="form-group">
          <label>Margin (%)</label>
          <div style="display:flex;align-items:center;gap:6px;">
            <input id="cat-margin" type="number" min="0" max="1000" step="0.1" class="input-field"
              placeholder="e.g. 30" style="margin:0;flex:1;" value="${marginVal}" oninput="calcSell()">
            <span style="font-size:13px;color:#6B7280;white-space:nowrap;">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>Sell Price (auto-calculated)</label>
          <input id="cat-sell" type="number" min="0" step="0.01" class="input-field"
            placeholder="0.00" style="margin:0;background:#F0FDF4;font-weight:700;" readonly value="${sellVal}">
        </div>
        <div class="form-group full">
          <label>Description (optional)</label>
          <textarea id="cat-desc" class="input-field" rows="2" placeholder="Brief description" style="margin:0;">${item.description||''}</textarea>
        </div>
      </div>`;
    };
    window.calcSell = calcSell;

    const saveCatalogItem = async (close, id=null) => {
      const name = document.getElementById('cat-name')?.value?.trim();
      if (!name) { this.notify('Name is required', 'error'); return; }
      const cost = parseFloat(document.getElementById('cat-cost')?.value||0);
      const margin = parseFloat(document.getElementById('cat-margin')?.value||0);
      const payload = {
        name,
        category: document.getElementById('cat-category')?.value,
        unit: document.getElementById('cat-unit')?.value,
        cost_price: cost,
        margin: margin,
        unit_price: cost > 0 ? parseFloat((cost*(1+margin/100)).toFixed(2)) : 0,
        description: document.getElementById('cat-desc')?.value,
      };
      const result = id ? await API.catalog.update(id, payload) : await API.catalog.create(payload);
      if (result.id || result.success) {
        this.notify(id ? 'Item updated!' : 'Item added!');
        close();
        await this.loadAppData();
        this.state.view = 'catalog';
        this.render();
      } else { this.notify(result.error || 'Failed to save', 'error'); }
    };

    document.getElementById('cat-add-btn')?.addEventListener('click', () => {
      this.showModal('Add Catalog Item', catModalBody(), (modal, close) => saveCatalogItem(close));
    });

    document.querySelectorAll('[data-edit-catalog]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.editCatalog;
        const item = (this.state.catalog||[]).find(i => String(i.id) === String(id));
        if (!item) return;
        this.showModal('Edit Catalog Item', catModalBody(item), (modal, close) => saveCatalogItem(close, id));
      });
    });

    document.querySelectorAll('[data-del-catalog]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.delCatalog;
        if (!confirm('Delete this catalog item?')) return;
        await API.catalog.delete(id);
        this.notify('Item deleted');
        await this.loadAppData();
        this.state.view = 'catalog';
        this.render();
      });
    });

    // ── Clients ───────────────────────────────────────────────────────────────
    const cliModalBody = (c={}) => `
      <div class="form-grid">
        <div class="form-group full">
          <label>Client / Company Name</label>
          <input id="cli-name" class="input-field" placeholder="e.g. Joan Langat" style="margin:0;" value="${c.name||''}">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input id="cli-email" class="input-field" type="email" placeholder="client@email.com" style="margin:0;" value="${c.email||''}">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input id="cli-phone" class="input-field" placeholder="e.g. 0700 000 000" style="margin:0;" value="${c.phone||''}">
        </div>
        <div class="form-group">
          <label>Contact Person</label>
          <input id="cli-contact" class="input-field" placeholder="Contact person name" style="margin:0;" value="${c.contact_person||''}">
        </div>
        <div class="form-group">
          <label>Location / Area</label>
          <input id="cli-location" class="input-field" placeholder="e.g. Nairobi, Karen" style="margin:0;" value="${c.location||''}">
        </div>
        <div class="form-group full">
          <label>Full Address</label>
          <input id="cli-address" class="input-field" placeholder="Street / building / estate" style="margin:0;" value="${c.address||''}">
        </div>
      </div>`;

    const saveClient = async (close, id=null) => {
      const name = document.getElementById('cli-name')?.value?.trim();
      if (!name) { this.notify('Client name is required', 'error'); return; }
      const payload = {
        name,
        email:          document.getElementById('cli-email')?.value,
        phone:          document.getElementById('cli-phone')?.value,
        contact_person: document.getElementById('cli-contact')?.value,
        location:       document.getElementById('cli-location')?.value,
        address:        document.getElementById('cli-address')?.value,
      };
      const result = id ? await API.clients.update(id, payload) : await API.clients.create(payload);
      if (result.id || result.success) {
        this.notify(id ? 'Client updated!' : 'Client added!');
        close();
        await this.loadAppData();
        this.state.view = 'clients';
        this.render();
      } else { this.notify(result.error || 'Failed to save client', 'error'); }
    };

    document.getElementById('cli-add-btn')?.addEventListener('click', () => {
      this.showModal('Add Client', cliModalBody(), (modal, close) => saveClient(close));
    });

    document.querySelectorAll('[data-edit-client]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.editClient;
        const client = (this.state.clients||[]).find(c => String(c.id) === String(id));
        if (!client) return;
        this.showModal('Edit Client', cliModalBody(client), (modal, close) => saveClient(close, id));
      });
    });

    document.querySelectorAll('[data-del-client]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.delClient;
        if (!confirm('Delete this client?')) return;
        await API.clients.delete(id);
        this.notify('Client deleted');
        await this.loadAppData();
        this.state.view = 'clients';
        this.render();
      });
    });

    // ── Users (admin only) ────────────────────────────────────────────────────
    // Change password for any user (admin)
    document.querySelectorAll('[data-change-pwd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid  = e.currentTarget.dataset.changePwd;
        const name = e.currentTarget.dataset.userName;
        this.showModal(`Change Password — ${name}`, `
          <div class="form-grid">
            <div class="form-group full">
              <label>New Password</label>
              <input type="password" id="new-pwd" class="input-field" placeholder="Min. 6 characters" style="margin:0;">
            </div>
            <div class="form-group full">
              <label>Confirm Password</label>
              <input type="password" id="confirm-pwd" class="input-field" placeholder="Repeat new password" style="margin:0;">
            </div>
          </div>`, async (modal, close) => {
          const np = document.getElementById('new-pwd')?.value;
          const cp = document.getElementById('confirm-pwd')?.value;
          if (!np || np.length < 6) { this.notify('Password must be at least 6 characters', 'error'); return; }
          if (np !== cp) { this.notify('Passwords do not match', 'error'); return; }
          const result = await API.users.update(uid, { password: np });
          if (result.success) { this.notify(`Password updated for ${name}!`); close(); }
          else { this.notify(result.error || 'Failed to update password', 'error'); }
        }, '🔑 Update Password');
      });
    });

    document.getElementById('usr-add-btn')?.addEventListener('click', () => {
      this.showModal('Add User', `
        <div class="form-grid">
          <div class="form-group full"><label>Full Name</label><input id="usr-name" class="input-field" placeholder="Full name" style="margin:0;"></div>
          <div class="form-group"><label>Email</label><input id="usr-email" class="input-field" type="email" placeholder="user@email.com" style="margin:0;"></div>
          <div class="form-group"><label>Password</label><input id="usr-pass" class="input-field" type="password" placeholder="Min. 6 characters" style="margin:0;"></div>
          <div class="form-group"><label>Role</label>
            <select id="usr-role" class="input-field" style="margin:0;">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="form-group" style="flex-direction:row;align-items:center;gap:8px;">
            <input type="checkbox" id="usr-verified" style="width:16px;height:16px;">
            <label style="text-transform:none;letter-spacing:0;font-size:13px;margin:0;">Mark as verified</label>
          </div>
        </div>`, async (modal, close) => {
        const name = document.getElementById('usr-name')?.value?.trim();
        const email = document.getElementById('usr-email')?.value?.trim();
        const password = document.getElementById('usr-pass')?.value;
        if (!name || !email || !password) { this.notify('All fields required', 'error'); return; }
        if (password.length < 6) { this.notify('Password must be at least 6 characters', 'error'); return; }
        const result = await API.users.create({
          name, email, password,
          role: document.getElementById('usr-role')?.value || 'user',
          verified: document.getElementById('usr-verified')?.checked ? 1 : 0,
        });
        if (result.id || result.success) {
          this.notify('User created!');
          close();
          const users = await API.users.getAll();
          this.state.users = users || [];
          this.state.view = 'users';
          this.render();
        } else { this.notify(result.error || 'Failed to create user', 'error'); }
      });
    });

    // ── Change own password (Settings page) ──────────────────────────────────
    document.getElementById('change-pwd-btn')?.addEventListener('click', async () => {
      const current = document.getElementById('pwd-current')?.value;
      const np      = document.getElementById('pwd-new')?.value;
      const cp      = document.getElementById('pwd-confirm')?.value;
      if (!current) { this.notify('Enter your current password', 'error'); return; }
      if (!np || np.length < 6) { this.notify('New password must be at least 6 characters', 'error'); return; }
      if (np !== cp) { this.notify('Passwords do not match', 'error'); return; }
      // Verify current password by attempting login first
      const check = await API.auth.login(this.state.user.email, current);
      if (!check.success) { this.notify('Current password is incorrect', 'error'); return; }
      const result = await API.users.update(this.state.user.id, { password: np });
      if (result.success) {
        this.notify('Password updated successfully!');
        document.getElementById('pwd-current').value = '';
        document.getElementById('pwd-new').value = '';
        document.getElementById('pwd-confirm').value = '';
      } else { this.notify(result.error || 'Failed to update password', 'error'); }
    });

    // ── Settings ──────────────────────────────────────────────────────────────
    // ── Signature pad setup ────────────────────────────────────────────────────
    const canvas = document.getElementById('sig-pad');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let drawing = false;
      let lastX = 0, lastY = 0;

      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        return { x: src.clientX - rect.left, y: src.clientY - rect.top };
      };

      canvas.addEventListener('mousedown',  (e) => { drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; });
      canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; });
      canvas.addEventListener('mousemove',  (e) => {
        if (!drawing) return;
        const p = getPos(e);
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
        lastX = p.x; lastY = p.y;
      });
      canvas.addEventListener('touchmove', (e) => {
        if (!drawing) return; e.preventDefault();
        const p = getPos(e);
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
        lastX = p.x; lastY = p.y;
      });
      canvas.addEventListener('mouseup',   () => drawing = false);
      canvas.addEventListener('touchend',  () => drawing = false);
      canvas.addEventListener('mouseleave',() => drawing = false);

      document.getElementById('sig-clear-btn')?.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });

      document.getElementById('sig-use-btn')?.addEventListener('click', () => {
        // Check canvas is not blank
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const isBlank = !data.some(v => v !== 0);
        if (isBlank) { this.notify('Please draw your signature first', 'error'); return; }
        this.state._pendingSignature = canvas.toDataURL('image/png');
        this.notify('Signature ready — click Save All Settings to apply');
      });
    }

    // ── Remove signature ───────────────────────────────────────────────────────
    document.getElementById('sig-remove-btn')?.addEventListener('click', async () => {
      const company = { ...this.state.company, signature: '' };
      const result = await API.company.save(company);
      if (result.success) {
        this.state.company = company;
        this.notify('Signature removed');
        this.render();
      }
    });

    // ── Add new T&C point ──────────────────────────────────────────────────────
    document.getElementById('add-term-btn')?.addEventListener('click', () => {
      const editor = document.getElementById('terms-list-editor');
      const idx = editor.querySelectorAll('.terms-row').length;
      const div = document.createElement('div');
      div.className = 'terms-row';
      div.dataset.idx = idx;
      div.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;';
      div.innerHTML = `
        <span style="font-size:12px;color:#888;padding-top:10px;min-width:18px;">${idx+1}.</span>
        <textarea class="input-field terms-item" rows="2" style="flex:1;margin:0;font-size:12px;resize:vertical;" placeholder="Enter new term..."></textarea>
        <button onclick="this.closest('.terms-row').remove()" style="background:#DC2626;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:12px;margin-top:4px;flex-shrink:0;">✕</button>`;
      editor.appendChild(div);
      div.querySelector('textarea').focus();
    });

    // ── Save all settings ──────────────────────────────────────────────────────
    document.getElementById('set-save-btn')?.addEventListener('click', async () => {
      const logoFile = document.getElementById('set-logo-file')?.files?.[0];
      const sigFile  = document.getElementById('set-sig-file')?.files?.[0];

      // Collect T&C points
      const termItems = [...document.querySelectorAll('.terms-item')]
        .map(t => t.value.trim()).filter(Boolean);

      const readFile = (file) => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.onerror = () => rej();
        r.readAsDataURL(file);
      });

      const saveCompany = async (logoData, sigData) => {
        const company = {
          name:      document.getElementById('set-name')?.value,
          phone:     document.getElementById('set-phone')?.value,
          email:     document.getElementById('set-email')?.value,
          address:   document.getElementById('set-address')?.value,
          currency:  document.getElementById('set-currency')?.value,
          terms:     JSON.stringify(termItems),
          logo:      logoData !== undefined ? logoData : (this.state.company.logo || ''),
          signature: sigData  !== undefined ? sigData  : (this.state.company.signature || ''),
        };
        const result = await API.company.save(company);
        if (result.success) {
          this.state.company = { ...this.state.company, ...company };
          this.state._pendingSignature = null;
          this.notify('Settings saved!');
          this.render();
        } else { this.notify(result.error || 'Failed to save', 'error'); }
      };

      // Resolve logo
      let logoData = undefined;
      if (logoFile) { try { logoData = await readFile(logoFile); } catch(e) {} }

      // Resolve signature — drawn > uploaded > existing
      let sigData = this.state._pendingSignature || undefined;
      if (!sigData && sigFile) { try { sigData = await readFile(sigFile); } catch(e) {} }

      saveCompany(logoData, sigData);
    });
  },

  // kept for compatibility but no longer needed for delegation
  bindNewQuoteRowEvents() {}
});
