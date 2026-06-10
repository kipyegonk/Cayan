// Views: Auth, Dashboard, Quotes List 

Object.assign(app, {
renderAuth() {
    const m    = this.state.authMode;
    const logo = this.state.company?.logo || '';
    return `<div class="auth-screen">

      <!-- Left panel — branding -->
      <div class="auth-left">
        <div class="auth-brand">
          ${logo
            ? '<img src="' + logo + '" alt="Logo" style="width:140px;height:auto;object-fit:contain;margin-bottom:18px;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.3));">'
            : '<div style="font-size:72px;margin-bottom:18px;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.3));">🏕</div>'
          }
          <h1 class="auth-brand-name">${this.state.company?.name || 'Cayan Events Ke.'}</h1>
          <div class="auth-divider"></div>
          <p class="auth-brand-tagline">Professional Quote Management</p>
          <div class="auth-features">
            <div class="auth-feature">📄 Professional Quotations</div>
            <div class="auth-feature">👥 Client Management</div>
            <div class="auth-feature">📦 Item Catalog</div>
            <div class="auth-feature">🖨 Print & Export PDF</div>
          </div>
        </div>
      </div>

      <!-- Right panel — form -->
      <div class="auth-right">
        <div class="auth-form-wrap">
          <!-- Mobile logo -->
          <div class="auth-mobile-logo">
            ${logo
              ? '<img src="' + logo + '" alt="Logo" style="width:80px;height:auto;object-fit:contain;">'
              : '<div style="font-size:40px;">🏕</div>'
            }
            <div style="font-size:16px;font-weight:800;color:#760014;margin-top:6px;">${this.state.company?.name || 'Cayan Events Ke.'}</div>
          </div>

          <h2 class="auth-title">${m === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p class="auth-subtitle">${m === 'login' ? 'Sign in to your account to continue.' : 'Register to request access.'}</p>

          <!-- Mode tabs -->
          <div class="auth-tabs">
            <button class="auth-tab ${m==='login'?'active':''}" data-mode="login">Sign In</button>
            <button class="auth-tab ${m==='register'?'active':''}" data-mode="register">Register</button>
          </div>

          <!-- Form fields -->
          <div class="auth-fields">
            ${m === 'register' ? `
            <div class="auth-field-group">
              <label class="auth-label">Full Name</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">👤</span>
                <input type="text" id="reg-name" class="auth-input" placeholder="Your full name" autocomplete="name">
              </div>
            </div>` : ''}
            <div class="auth-field-group">
              <label class="auth-label">Email Address</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">✉️</span>
                <input type="email" id="auth-email" class="auth-input" placeholder="your@email.com" autocomplete="email">
              </div>
            </div>
            <div class="auth-field-group">
              <label class="auth-label">Password</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">🔒</span>
                <input type="password" id="auth-password" class="auth-input" placeholder="Enter your password" autocomplete="current-password">
                <button type="button" class="auth-eye-btn" onclick="
                  const inp = document.getElementById('auth-password');
                  inp.type = inp.type==='password' ? 'text' : 'password';
                  this.textContent = inp.type==='password' ? '👁' : '🙈';
                ">👁</button>
              </div>
            </div>
          </div>

          <button id="auth-submit" class="auth-submit-btn">
            ${m === 'login' ? 'Sign In' : 'Submit Registration'}
            <span style="margin-left:6px;">→</span>
          </button>

          ${m === 'login' ? `
          <div class="auth-hint">
            <span>🔑</span> Default: <strong>admin@company.com</strong> / <strong>admin123</strong>
          </div>` : `
          <div class="auth-hint">
            <span>ℹ️</span> Your account needs admin approval before you can log in.
          </div>`}
        </div>
      </div>

    </div>`;
  },

  renderAppShell() {
    const navItems = [
      { id: 'dashboard', emoji: '⊞', label: 'Dashboard' },
      { id: 'newquote',  emoji: '📝', label: 'New Quote' },
      { id: 'quotes',    emoji: '📄', label: 'All Quotes' },
      { id: 'catalog',   emoji: '📦', label: 'Catalog' },
      { id: 'clients',   emoji: '👥', label: 'Clients' },
      ...(this.state.user?.role === 'admin' ? [{ id: 'users', emoji: '🔑', label: 'Users' }] : []),
      { id: 'settings',  emoji: '⚙️', label: 'Settings' },
    ];
    return `<div class="container">
      <aside class="sidebar">
        <div class="sidebar-header">
          ${this.state.company.logo
            ? '<img src="' + this.state.company.logo + '" alt="Logo" style="width:80px;height:auto;object-fit:contain;display:block;margin-bottom:6px;border-radius:4px;">'
            : '<div class="logo">📋</div>'
          }
          <div class="company-name">${this.state.company.name || 'QuoteSystem'}</div>
          <div class="user-name">${this.state.user?.name || ''}</div>
          <div class="role-badge">${(this.state.user?.role || '').toUpperCase()}</div>
          ${OFFLINE ? '<div style="background:#D97706;color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:10px;margin-top:6px;text-align:center;">⚡ OFFLINE MODE</div>' : ''}
        </div>
        <nav>${navItems.map(i => `<button class="nav-item ${this.state.view === i.id ? 'active' : ''}" data-view="${i.id}"><span>${i.emoji}</span>${i.label}</button>`).join('')}</nav>
        <div class="sidebar-footer"><button id="logout-btn" class="logout-btn">🚪 Sign Out</button></div>
      </aside>
      <main class="main">${this.renderViewContent()}</main>
    </div>`;
  },

  renderViewContent() {
    switch (this.state.view) {
      case 'dashboard': return this.renderDashboard();
      case 'newquote':  return this.renderNewQuote();
      case 'quotes':    return this.renderQuotesList();
      case 'catalog':   return this.renderCatalog();
      case 'clients':   return this.renderClients();
      case 'users':     return this.renderUsers();
      case 'settings':  return this.renderSettings();
      default: return '';
    }
  },

  renderDashboard() {
    const s = this.state.stats || {};
    return `<div style="max-width:1100px;">
      <div class="page-header">
        <div><h2 class="page-title">Dashboard</h2><p class="page-subtitle">Overview of your quotation activity</p></div>
        <button class="button" onclick="app.setView('newquote')">+ New Quote</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">📄</div><div class="stat-label">Total Quotes</div><div class="stat-value">${s.total_quotes || 0}</div></div>
        <div class="stat-card" style="border-top-color:var(--green);"><div class="stat-icon">💰</div><div class="stat-label">Total Value</div><div class="stat-value" style="font-size:15px;">${helpers.formatMoney(s.total_value, this.state.company.currency)}</div></div>
        <div class="stat-card" style="border-top-color:var(--amber);"><div class="stat-icon">⏳</div><div class="stat-label">Pending</div><div class="stat-value">${s.pending || 0}</div></div>
        <div class="stat-card" style="border-top-color:var(--green);"><div class="stat-icon">✅</div><div class="stat-label">Accepted</div><div class="stat-value">${s.accepted || 0}</div></div>
        <div class="stat-card" style="border-top-color:#7C3AED;"><div class="stat-icon">👥</div><div class="stat-label">Clients</div><div class="stat-value">${s.clients || 0}</div></div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:14px;font-size:15px;font-weight:800;">Recent Quotes</h3>
        ${this.renderQuotesTable(this.state.quotes.slice(0, 5))}
      </div>
    </div>`;
  },

  renderQuotesList() {
    return `<div style="max-width:1100px;">
      <div class="page-header">
        <div><h2 class="page-title">All Quotes</h2><p class="page-subtitle">${this.state.quotes.length} total quotes</p></div>
        <button class="button" onclick="app.setView('newquote')">+ New Quote</button>
      </div>
      <div class="card">${this.renderQuotesTable(this.state.quotes)}</div>
    </div>`;
  },

  renderQuotesTable(quotes) {
    if (!quotes || quotes.length === 0) {
      return `<p style="text-align:center;color:var(--gray);padding:30px;">No quotes yet. <a href="#" onclick="app.setView('newquote')" style="color:var(--blue);">Create your first quote</a>.</p>`;
    }
    const statusColor = { draft: '#6B7280', pending: '#D97706', accepted: '#059669', declined: '#DC2626' };
    return `<table>
      <thead><tr>
        <th>Quote #</th><th>Client</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>${quotes.map(q => `
        <tr>
          <td><strong>${q.number || ''}</strong></td>
          <td>${q.client_name || ''}</td>
          <td>${helpers.formatDate(q.quote_date)}</td>
          <td><strong>${helpers.formatMoney(q.total, this.state.company.currency || 'KES')}</strong></td>
          <td><span style="background:${statusColor[q.status]||'#6B7280'}22;color:${statusColor[q.status]||'#6B7280'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;">${q.status || 'draft'}</span></td>
          <td>
            <button class="button secondary" style="padding:5px 10px;font-size:12px;" data-preview-quote="${q.id}">👁 Preview</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  },

  // ── NEW QUOTE FORM ──────────────────────────────────────────────────────────
});
