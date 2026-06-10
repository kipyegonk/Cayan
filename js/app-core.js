// App Core  state, auth, routing, render shell 
// App State 
const app = {
  state: {
    page: 'auth', authMode: 'login',
    user: JSON.parse(localStorage.getItem('user')) || null,
    view: 'dashboard', loading: true, toast: null,
    company: {}, catalog: [], clients: [], quotes: [], users: [],
    editQuote: null,
  },

  notify(msg, type = 'success') {
    this.state.toast = { msg, type };
    this.render();
    setTimeout(() => { this.state.toast = null; this.render(); }, 3200);
  },
  setView(view) { this.state.view = view; this.render(); },

  async handleLogin(email, password) {
    const result = await API.auth.login(email, password);
    if (result.success) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('cayan_current_user', JSON.stringify(result.user));
      localStorage.setItem('login_time', Date.now().toString());
      this.state.user = result.user;
      this.state.page = 'app';
      this.loadAppData();
      this.render();
    } else { this.notify(result.error || 'Invalid email or password', 'error'); }
  },

  async handleRegister(name, email, password) {
    const result = await API.auth.register(name, email, password);
    if (result.success) {
      this.notify(result.message, 'success');
      this.state.authMode = 'login';
      this.render();
    } else { this.notify(result.error, 'error'); }
  },

  handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.state.user = null;
    this.state.page = 'auth';
    this.state.view = 'dashboard';
    this.render();
  },

  async loadAppData() {
    const [company, catalog, clients, quotes, stats] = await Promise.all([
      API.company.get(), API.catalog.getAll(), API.clients.getAll(),
      API.quotes.getAll(), API.stats.get(),
    ]);
    this.state.company = company || {};
    this.state.catalog = catalog || [];
    this.state.clients = clients || [];
    this.state.quotes = quotes || [];
    this.state.stats = stats || {};
    this.state.loading = false;
    this.render();
  },

  render() {
    const el = document.getElementById('app');
    if (this.state.loading) {
      el.innerHTML = `<div class="loader"><div class="loader-content"><div class="loader-icon">📋</div><div class="loader-text">Loading QuoteSystem...</div></div></div>`;
      return;
    }
    if (this.state.page === 'auth') {
      el.innerHTML = this.renderAuth();
    } else {
      el.innerHTML = this.renderAppShell();
    }
    if (this.state.toast) {
      const t = document.createElement('div');
      t.className = `toast ${this.state.toast.type}`;
      t.innerHTML = `${this.state.toast.type === 'success' ? '✓' : '⚠'} ${this.state.toast.msg}`;
      el.appendChild(t);
    }
    this.bindEvents();
  }
};