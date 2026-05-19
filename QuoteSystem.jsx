import { useState, useEffect, useRef } from "react";

// ─── HELPERS ────────────────────────────────────────────────────────────────
const hashPwd = (s) => [...s].reduce((a, c) => Math.imul(31, a) + c.charCodeAt(0) | 0, 0).toString(36);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const money = (n, sym = "KES") => `${sym} ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fdate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);

const db = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error(e); } },
};

// ─── STYLES ─────────────────────────────────────────────────────────────────
const C = {
  navy: "#1B2F4E", navyLight: "#243d62", blue: "#2563EB", blueHover: "#1D4ED8",
  green: "#059669", red: "#DC2626", amber: "#D97706", gray: "#6B7280",
  border: "#E5E7EB", bg: "#F0F4F8", white: "#FFFFFF",
};
const inp = { width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", color: "#111" };
const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" };
const btn = (bg = C.blue, color = "#fff", extra = {}) => ({ padding: "9px 18px", background: bg, color, border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, ...extra });
const btnSm = (bg = "#EFF6FF", color = C.blue) => ({ padding: "5px 11px", background: bg, color, border: "none", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 });
const card = { background: C.white, borderRadius: 12, boxShadow: "0 1px 5px rgba(0,0,0,0.07)", padding: 24 };

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const SEED_USERS = [{ id: uid(), name: "Administrator", email: "admin@company.com", password: hashPwd("admin123"), role: "admin", verified: true, createdAt: new Date().toISOString() }];
const SEED_CATALOG = [
  { id: uid(), name: "Professional Consultation", category: "Services", desc: "Expert advisory and consultation services", cost: 5000, margin: 30, unit: "hr" },
  { id: uid(), name: "Site Installation", category: "Installation", desc: "On-site equipment installation and setup", cost: 25000, margin: 25, unit: "unit" },
  { id: uid(), name: "Annual Maintenance", category: "Maintenance", desc: "Comprehensive maintenance & support package", cost: 12000, margin: 20, unit: "year" },
];

// ════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function QuoteSystem() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("auth");   // auth | app
  const [view, setView] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [toast, setToast] = useState(null);
  const [previewQuote, setPreviewQuote] = useState(null);

  // Data
  const [appUsers, setAppUsers] = useState([]);
  const [company, setCompany] = useState({ name: "", address: "", phone: "", email: "", logo: null, vat: "", currency: "KES", terms: "Payment is due within 30 days of the quote date.\nAll prices are exclusive of VAT unless stated otherwise.\nThis quotation is valid for the period stated above." });
  const [catalog, setCatalog] = useState([]);
  const [clients, setClients] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [qCounter, setQCounter] = useState(1001);

  const notify = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  useEffect(() => { init(); }, []);
  async function init() {
    const [u, co, cat, cl, q, qc] = await Promise.all([db.get("qs:users"), db.get("qs:co"), db.get("qs:catalog"), db.get("qs:clients"), db.get("qs:quotes"), db.get("qs:qc")]);
    const users = u || SEED_USERS; if (!u) await db.set("qs:users", users);
    const catData = cat || SEED_CATALOG; if (!cat) await db.set("qs:catalog", catData);
    setAppUsers(users); setCompany(co || company); setCatalog(catData);
    setClients(cl || []); setQuotes(q || []); setQCounter(qc || 1001);
    setLoading(false);
  }

  const saveUsers   = async d => { setAppUsers(d); await db.set("qs:users", d); };
  const saveCo      = async d => { setCompany(d); await db.set("qs:co", d); };
  const saveCatalog = async d => { setCatalog(d); await db.set("qs:catalog", d); };
  const saveClients = async d => { setClients(d); await db.set("qs:clients", d); };
  const saveQuotes  = async d => { setQuotes(d); await db.set("qs:quotes", d); };
  const saveQC      = async n => { setQCounter(n); await db.set("qs:qc", n); };

  const handleLogin = (email, password) => {
    const u = appUsers.find(u => u.email === email && u.password === hashPwd(password));
    if (!u) return "Invalid email or password.";
    if (!u.verified) return "Your account is pending verification. Please contact the administrator.";
    setUser(u); setPage("app"); return null;
  };
  const handleRegister = async (name, email, password) => {
    if (appUsers.find(u => u.email === email)) return "This email is already registered.";
    const newUser = { id: uid(), name, email, password: hashPwd(password), role: "user", verified: false, createdAt: new Date().toISOString() };
    await saveUsers([...appUsers, newUser]); return null;
  };
  const handleLogout = () => { setUser(null); setPage("auth"); setView("dashboard"); };

  if (loading) return <Loader />;

  if (previewQuote) return (
    <QuotePreview quote={previewQuote} company={company} clients={clients} onClose={() => setPreviewQuote(null)} />
  );

  if (page === "auth") return (
    <AuthScreen mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onRegister={handleRegister} />
  );

  const navItems = [
    { id: "dashboard", emoji: "⊞", label: "Dashboard" },
    { id: "newquote",  emoji: "📝", label: "New Quote" },
    { id: "quotes",    emoji: "📄", label: "All Quotes" },
    { id: "catalog",   emoji: "📦", label: "Item Catalog" },
    { id: "clients",   emoji: "👥", label: "Clients" },
    ...(user?.role === "admin" ? [{ id: "users", emoji: "🔑", label: "Users" }] : []),
    { id: "settings",  emoji: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.bg, overflow: "hidden" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 220, background: C.navy, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {company.logo
            ? <img src={company.logo} style={{ maxWidth: 120, maxHeight: 40, objectFit: "contain", marginBottom: 10 }} alt="logo" />
            : <div style={{ fontSize: 22, marginBottom: 6 }}>📋</div>}
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{company.name || "QuoteSystem"}</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 6 }}>{user?.name}</div>
          <span style={{ display: "inline-block", background: user?.role === "admin" ? "#2563EB" : "rgba(255,255,255,0.12)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, marginTop: 4, letterSpacing: "0.06em" }}>{user?.role?.toUpperCase()}</span>
        </div>
        <nav style={{ flex: 1, padding: "10px 0" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", border: "none", borderLeft: view === item.id ? "3px solid #60A5FA" : "3px solid transparent", background: view === item.id ? "rgba(255,255,255,0.1)" : "transparent", color: view === item.id ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: view === item.id ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <span style={{ fontSize: 15 }}>{item.emoji}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", borderRadius: 7 }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px 28px 40px" }}>
        {toast && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 22px", borderRadius: 9, background: toast.type === "success" ? C.green : C.red, color: "#fff", fontWeight: 600, fontSize: 13, boxShadow: "0 6px 20px rgba(0,0,0,0.18)" }}>
            {toast.type === "success" ? "✓ " : "⚠ "}{toast.msg}
          </div>
        )}
        {view === "dashboard" && <Dashboard quotes={quotes} clients={clients} catalog={catalog} setView={setView} company={company} />}
        {view === "newquote"  && <NewQuoteView catalog={catalog} clients={clients} company={company} qCounter={qCounter} onSave={async q => { await saveQuotes([...quotes, q]); await saveQC(qCounter + 1); setView("quotes"); notify("Quote saved successfully!"); }} />}
        {view === "quotes"    && <QuotesView quotes={quotes} clients={clients} company={company} onPreview={setPreviewQuote} onUpdateStatus={async (id, status) => { const upd = quotes.map(q => q.id === id ? { ...q, status } : q); await saveQuotes(upd); notify("Status updated"); }} onDelete={async id => { if (!confirm("Delete this quote?")) return; await saveQuotes(quotes.filter(q => q.id !== id)); notify("Quote deleted"); }} />}
        {view === "catalog"   && <CatalogView catalog={catalog} company={company} onSave={async c => { await saveCatalog(c); notify("Catalog saved!"); }} />}
        {view === "clients"   && <ClientsView clients={clients} onSave={async c => { await saveClients(c); notify("Clients saved!"); }} />}
        {view === "users" && user?.role === "admin" && <UsersView users={appUsers} currentUser={user} onSave={async u => { await saveUsers(u); notify("Users updated!"); }} />}
        {view === "settings"  && <SettingsView company={company} onSave={async c => { await saveCo(c); notify("Settings saved!"); }} />}
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  AUTH SCREEN
// ════════════════════════════════════════════════════════════════════════════
function AuthScreen({ mode, setMode, onLogin, onRegister }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");

  const submit = async () => {
    setError(""); setSuccess("");
    if (mode === "login") {
      if (!email || !password) return setError("Please enter your email and password.");
      const err = onLogin(email, password); if (err) setError(err);
    } else {
      if (!name || !email || !password) return setError("All fields are required.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      const err = await onRegister(name, email, password);
      if (err) setError(err); else { setSuccess("Registration submitted! An administrator will verify your account before you can log in."); setMode("login"); setEmail(""); setPassword(""); }
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ flex: 1, background: `linear-gradient(145deg, ${C.navy} 0%, #1e4080 100%)`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
        <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>Quote Management</h1>
        <p style={{ color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 1.7, maxWidth: 300, fontSize: 14 }}>Professional quotations, client management, and item catalog — all in one place.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
          {[["📄", "Create & send professional quotes"], ["📦", "Manage your product/service catalog"], ["👥", "Store and manage client details"], ["💰", "Set profit margins per item"]].map(([e, t]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>{e}</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 440, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 44px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>{mode === "login" ? "Welcome back" : "Create account"}</h2>
        <p style={{ color: C.gray, fontSize: 13, margin: "0 0 28px" }}>{mode === "login" ? "Sign in to your account to continue." : "Register for access — an admin will verify you."}</p>

        <div style={{ display: "flex", background: C.bg, borderRadius: 8, padding: 4, marginBottom: 24 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", background: mode === m ? "#fff" : "transparent", color: mode === m ? C.navy : C.gray, boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" />}
          <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="your@email.com" onEnter={submit} />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" onEnter={submit} />
        </div>

        {error   && <div style={{ marginTop: 14, padding: "10px 14px", background: "#FEF2F2", color: C.red, borderRadius: 7, fontSize: 13, border: "1px solid #FECACA" }}>{error}</div>}
        {success && <div style={{ marginTop: 14, padding: "10px 14px", background: "#ECFDF5", color: C.green, borderRadius: 7, fontSize: 13, border: "1px solid #A7F3D0" }}>{success}</div>}

        <button onClick={submit} style={{ ...btn(C.navy), justifyContent: "center", padding: "12px", marginTop: 20, fontSize: 14 }}>
          {mode === "login" ? "Sign In →" : "Submit Registration"}
        </button>
        {mode === "login" && <p style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", margin: "14px 0 0" }}>Default: admin@company.com / admin123</p>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function Dashboard({ quotes, clients, catalog, setView, company }) {
  const totalVal = quotes.reduce((s, q) => s + (q.total || 0), 0);
  const pending = quotes.filter(q => q.status === "pending").length;
  const accepted = quotes.filter(q => q.status === "accepted").length;
  const recent = [...quotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  return (
    <div style={{ maxWidth: 1100 }}>
      <Hdr title="Dashboard" sub="Overview of your quotation activity" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          ["📄", "Total Quotes", quotes.length, C.blue],
          ["💰", "Total Value", money(totalVal, company.currency), C.green],
          ["⏳", "Pending",  pending, C.amber],
          ["✅", "Accepted", accepted, C.green],
          ["👥", "Clients",  clients.length, "#7C3AED"],
        ].map(([e, label, val, color]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 5px rgba(0,0,0,0.07)", borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{e}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={card}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#111" }}>Recent Quotes</h3>
          {recent.length === 0 ? <p style={{ color: "#9CA3AF", fontSize: 13 }}>No quotes yet. Create your first quote!</p>
            : recent.map(q => (
              <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{q.number}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{q.clientName || "—"} · {fdate(q.date)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{money(q.total, company.currency)}</div>
                  <StatusBadge s={q.status} />
                </div>
              </div>
            ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["📝", "New Quote", "newquote"], ["👥", "Add Client", "clients"], ["📦", "Manage Catalog", "catalog"], ["⚙️", "Company Settings", "settings"]].map(([e, l, v]) => (
            <button key={v} onClick={() => setView(v)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, color: C.navy, transition: "all 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: 18 }}>{e}</span>{l}<span style={{ marginLeft: "auto", color: "#CBD5E1" }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  NEW QUOTE
// ════════════════════════════════════════════════════════════════════════════
function NewQuoteView({ catalog, clients, company, qCounter, onSave }) {
  const t = today();
  const [form, setForm] = useState({ number: `QT-${new Date().getFullYear()}-${qCounter}`, date: t, validDays: 30, validUntil: addDays(t, 30), clientId: "", items: [], notes: "", vatRate: 16, includeVat: true, status: "draft" });
  const [showCat, setShowCat] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const client = clients.find(c => c.id === form.clientId);
  const subtotal = form.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const vatAmt   = form.includeVat ? subtotal * form.vatRate / 100 : 0;
  const total    = subtotal + vatAmt;

  const addFromCatalog = item => {
    const sell = item.cost * (1 + item.margin / 100);
    set("items", [...form.items, { id: uid(), name: item.name, desc: item.desc, qty: 1, unit: item.unit, unitPrice: +sell.toFixed(2), margin: item.margin }]);
    setShowCat(false);
  };
  const addCustom = () => set("items", [...form.items, { id: uid(), name: "Custom Item", desc: "", qty: 1, unit: "unit", unitPrice: 0, margin: 0 }]);
  const updItem = (id, k, v) => set("items", form.items.map(i => i.id === id ? { ...i, [k]: v } : i));
  const remItem = id => set("items", form.items.filter(i => i.id !== id));

  const handleSave = () => {
    const cl = clients.find(c => c.id === form.clientId);
    onSave({ ...form, id: uid(), subtotal, vatAmount: vatAmt, total, clientName: cl?.name || "", clientCompany: cl?.company || "", createdAt: new Date().toISOString() });
  };

  return (
    <div style={{ maxWidth: 960 }}>
      <Hdr title="New Quote" sub="Fill in the details below to create a quotation" />

      {/* Meta */}
      <div style={{ ...card, marginBottom: 14 }}>
        <SectionTitle>Quote Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          <Field label="Quote Number" value={form.number} onChange={() => {}} readOnly />
          <Field label="Date" type="date" value={form.date} onChange={v => { set("date", v); set("validUntil", addDays(v, form.validDays)); }} />
          <Field label="Valid (days)" type="number" value={form.validDays} onChange={v => { set("validDays", +v); set("validUntil", addDays(form.date, +v)); }} />
          <Field label="Valid Until" value={form.validUntil} onChange={() => {}} readOnly />
        </div>
      </div>

      {/* Client */}
      <div style={{ ...card, marginBottom: 14 }}>
        <SectionTitle>Client</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={lbl}>Select Client</label>
            <select style={inp} value={form.clientId} onChange={e => set("clientId", e.target.value)}>
              <option value="">— Choose a client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
            </select>
          </div>
          {client && (
            <div style={{ padding: 14, background: "#EFF6FF", borderRadius: 8, border: `1px solid #BFDBFE`, fontSize: 13, lineHeight: 1.8 }}>
              <strong style={{ color: C.navy }}>{client.name}</strong>
              {client.company && <div style={{ color: C.gray }}>{client.company}</div>}
              {client.email   && <div style={{ color: C.gray }}>✉ {client.email}</div>}
              {client.phone   && <div style={{ color: C.gray }}>📞 {client.phone}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SectionTitle noMargin>Line Items</SectionTitle>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowCat(true)} style={btn("#EFF6FF", C.blue)}>📦 From Catalog</button>
            <button onClick={addCustom} style={btn("#F0FDF4", C.green)}>+ Custom Item</button>
          </div>
        </div>

        {form.items.length > 0 ? (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Item Name & Description", "Qty", "Unit", "Unit Price", "Total", ""].map((h, i) => (
                    <th key={i} style={{ padding: "9px 10px", textAlign: i >= 3 ? "right" : "left", fontWeight: 700, color: "#374151", fontSize: 11, borderBottom: `2px solid ${C.border}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "8px 10px" }}>
                      <input style={{ ...inp, marginBottom: 4, fontWeight: 600 }} value={item.name} onChange={e => updItem(item.id, "name", e.target.value)} placeholder="Item name" />
                      <input style={{ ...inp, fontSize: 12, color: C.gray }} value={item.desc || ""} onChange={e => updItem(item.id, "desc", e.target.value)} placeholder="Short description" />
                    </td>
                    <td style={{ padding: "8px 10px", width: 70 }}><input style={{ ...inp, textAlign: "right" }} type="number" min="0" value={item.qty} onChange={e => updItem(item.id, "qty", +e.target.value)} /></td>
                    <td style={{ padding: "8px 10px", width: 80 }}><input style={inp} value={item.unit} onChange={e => updItem(item.id, "unit", e.target.value)} /></td>
                    <td style={{ padding: "8px 10px", width: 130 }}><input style={{ ...inp, textAlign: "right" }} type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updItem(item.id, "unitPrice", +e.target.value)} /></td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, width: 120, color: C.navy }}>{(item.qty * item.unitPrice).toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "8px 10px", width: 36 }}><button onClick={() => remItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, fontSize: 16, padding: 2 }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TotalBlock subtotal={subtotal} vatAmt={vatAmt} total={total} vatRate={form.vatRate} includeVat={form.includeVat} currency={company.currency} onVatToggle={v => set("includeVat", v)} onVatRate={v => set("vatRate", +v)} />
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF", border: "2px dashed #E5E7EB", borderRadius: 8 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div style={{ fontWeight: 600 }}>No items yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Add from catalog or create custom items</div>
          </div>
        )}
      </div>

      {/* Notes & Status */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
          <div>
            <label style={lbl}>Notes (optional)</label>
            <textarea style={{ ...inp, height: 90, resize: "none" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any additional notes for the client..." />
          </div>
          <div>
            <label style={lbl}>Status</label>
            <select style={{ ...inp, width: 160 }} value={form.status} onChange={e => set("status", e.target.value)}>
              {["draft", "pending", "accepted", "declined"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSave} style={{ ...btn(C.navy), padding: "12px 28px", fontSize: 14 }}>💾 Save Quote</button>
      </div>

      {showCat && (
        <Modal title="Add from Catalog" onClose={() => setShowCat(false)}>
          <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {catalog.map(item => {
              const sell = item.cost * (1 + item.margin / 100);
              return (
                <div key={item.id} onClick={() => addFromCatalog(item)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer", background: "#fff", transition: "all 0.12s" }} onMouseEnter={e => e.currentTarget.style.background = "#EFF6FF"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: C.gray }}>{item.category} · per {item.unit}</div>
                    {item.desc && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{item.desc}</div>}
                  </div>
                  <div style={{ textAlign: "right", marginLeft: 16, flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: C.green, fontSize: 15 }}>{sell.toLocaleString("en", { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{item.margin}% margin</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  QUOTES LIST
// ════════════════════════════════════════════════════════════════════════════
function QuotesView({ quotes, clients, company, onPreview, onUpdateStatus, onDelete }) {
  const [search, setSearch] = useState("");
  const sorted = [...quotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filtered = sorted.filter(q => !search || q.number?.toLowerCase().includes(search.toLowerCase()) || q.clientName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: 1060 }}>
      <Hdr title="All Quotes" sub={`${quotes.length} quote${quotes.length !== 1 ? "s" : ""} total`} />
      <div style={card}>
        <div style={{ marginBottom: 16 }}>
          <input style={inp} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by quote number or client name..." />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Quote #", "Client", "Date", "Valid Until", "Items", "Total", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 11, borderBottom: `2px solid ${C.border}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, i) => (
              <tr key={q.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "11px 12px", fontWeight: 700, color: C.navy }}>{q.number}</td>
                <td style={{ padding: "11px 12px" }}>
                  <div style={{ fontWeight: 600 }}>{q.clientName || "—"}</div>
                  {q.clientCompany && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{q.clientCompany}</div>}
                </td>
                <td style={{ padding: "11px 12px", color: C.gray }}>{fdate(q.date)}</td>
                <td style={{ padding: "11px 12px", color: C.gray }}>{fdate(q.validUntil)}</td>
                <td style={{ padding: "11px 12px", color: C.gray }}>{q.items?.length || 0}</td>
                <td style={{ padding: "11px 12px", fontWeight: 700 }}>{money(q.total, company.currency)}</td>
                <td style={{ padding: "11px 12px" }}>
                  <select value={q.status} onChange={e => onUpdateStatus(q.id, e.target.value)} style={{ padding: "3px 7px", borderRadius: 5, border: `1px solid ${C.border}`, fontSize: 12, background: "#fff", cursor: "pointer" }}>
                    {["draft", "pending", "accepted", "declined"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </td>
                <td style={{ padding: "11px 12px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onPreview(q)} style={btnSm()}>👁 View</button>
                    <button onClick={() => onDelete(q.id)} style={btnSm("#FEF2F2", C.red)}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ textAlign: "center", color: "#9CA3AF", padding: "36px 0", fontSize: 14 }}>No quotes found</p>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  QUOTE PREVIEW (print-ready)
// ════════════════════════════════════════════════════════════════════════════
function QuotePreview({ quote, company, clients, onClose }) {
  const client = clients.find(c => c.id === quote.clientId) || { name: quote.clientName, company: quote.clientCompany };

  return (
    <div style={{ minHeight: "100vh", background: "#E8EDF2", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Controls bar */}
      <div className="no-print" style={{ background: C.navy, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onClose} style={{ ...btn("rgba(255,255,255,0.15)", "#fff"), border: "1px solid rgba(255,255,255,0.25)" }}>← Back</button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{quote.number} — Preview</span>
        <button onClick={() => window.print()} style={btn(C.blue)}>🖨 Print / Export PDF</button>
      </div>

      {/* A4 document */}
      <div style={{ maxWidth: 820, margin: "28px auto 40px", background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.14)" }}>

        {/* ── HEADER ── */}
        <div style={{ padding: "32px 44px 24px", borderBottom: `4px solid ${C.navy}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {company.logo
              ? <img src={company.logo} style={{ maxWidth: 180, maxHeight: 70, objectFit: "contain", marginBottom: 8 }} alt="Logo" />
              : <div style={{ fontSize: 24, fontWeight: 900, color: C.navy, marginBottom: 4 }}>{company.name || "Company Name"}</div>}
            {company.logo && company.name && <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{company.name}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#555", lineHeight: 1.9 }}>
            {company.address && <div style={{ whiteSpace: "pre-line" }}>{company.address}</div>}
            {company.phone   && <div>Tel: {company.phone}</div>}
            {company.email   && <div>{company.email}</div>}
            {company.vat     && <div>VAT No: {company.vat}</div>}
          </div>
        </div>

        {/* ── TITLE BAND ── */}
        <div style={{ padding: "20px 44px", background: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: C.navy, letterSpacing: 2 }}>QUOTATION</h1>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>Thank you for the opportunity. Please find our quotation below.</div>
          </div>
          <div style={{ background: "#fff", padding: "14px 20px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, lineHeight: 2.1, minWidth: 200 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0 16px" }}>
              <span style={{ color: C.gray, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ref No:</span>
              <span style={{ fontWeight: 800, color: C.navy }}>{quote.number}</span>
              <span style={{ color: C.gray, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date:</span>
              <span>{fdate(quote.date)}</span>
              <span style={{ color: C.gray, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Valid Until:</span>
              <span style={{ color: C.amber, fontWeight: 700 }}>{fdate(quote.validUntil)}</span>
            </div>
          </div>
        </div>

        {/* ── BILL TO ── */}
        <div style={{ padding: "20px 44px 16px", display: "flex", gap: 40 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Bill To</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#111", marginBottom: 3 }}>{client?.name || "—"}</div>
            {client?.company && <div style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}>{client.company}</div>}
            {client?.address && <div style={{ fontSize: 12, color: C.gray, whiteSpace: "pre-line", marginBottom: 2 }}>{client.address}</div>}
            {client?.email   && <div style={{ fontSize: 12, color: C.gray }}>✉ {client.email}</div>}
            {client?.phone   && <div style={{ fontSize: 12, color: C.gray }}>📞 {client.phone}</div>}
            {client?.vat     && <div style={{ fontSize: 12, color: C.gray }}>VAT: {client.vat}</div>}
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <div style={{ padding: "0 44px 24px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.navy }}>
                {["#", "Description", "Qty", "Unit", "Unit Price", "Total"].map((h, i) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: i >= 4 ? "right" : i === 2 || i === 3 ? "center" : "left", color: "#fff", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quote.items?.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "10px 12px", color: "#9CA3AF", fontWeight: 600, width: 30 }}>{i + 1}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 700, color: "#111" }}>{item.name}</div>
                    {item.desc && <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{item.desc}</div>}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.qty}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", color: C.gray }}>{item.unit}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>{company.currency} {item.unitPrice.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>{company.currency} {(item.qty * item.unitPrice).toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TOTALS ── */}
        <div style={{ padding: "0 44px 28px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 300 }}>
            <TotRow label="Subtotal" val={money(quote.subtotal, company.currency)} />
            {quote.includeVat && <TotRow label={`VAT (${quote.vatRate}%)`} val={money(quote.vatAmount, company.currency)} />}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 16px", background: C.navy, color: "#fff", borderRadius: 6, marginTop: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>TOTAL</span>
              <span style={{ fontWeight: 800, fontSize: 15 }}>{money(quote.total, company.currency)}</span>
            </div>
          </div>
        </div>

        {/* ── NOTES / TERMS / BANK ── */}
        <div style={{ padding: "20px 44px", borderTop: `1px solid ${C.border}` }}>
          {quote.notes && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Notes</div>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.7 }}>{quote.notes}</div>
            </div>
          )}
          {company.terms && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Terms & Conditions</div>
              <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.8, whiteSpace: "pre-line" }}>{company.terms}</div>
            </div>
          )}
          {company.bankDetails && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Payment Details</div>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>{company.bankDetails}</div>
            </div>
          )}
        </div>

        {/* ── SIGNATURE ── */}
        <div style={{ padding: "16px 44px 36px", display: "flex", gap: 48, borderTop: `1px solid ${C.border}` }}>
          {[["Authorized Signature & Stamp", company.name], ["Client Acceptance Signature", "Date: _______________"]].map(([t, sub]) => (
            <div key={t} style={{ flex: 1 }}>
              <div style={{ height: 56, borderBottom: "1.5px solid #374151", marginBottom: 8 }} />
              <div style={{ fontSize: 11, color: C.gray }}>{t}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ padding: "12px 44px", background: C.navy, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            {[company.name, company.email, company.phone].filter(Boolean).join("  ·  ")}
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } body { margin: 0; background: white; } }`}</style>
    </div>
  );
}

const TotRow = ({ label, val }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", borderTop: `1px solid ${C.border}` }}>
    <span style={{ color: C.gray, fontSize: 13 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  CATALOG VIEW
// ════════════════════════════════════════════════════════════════════════════
function CatalogView({ catalog, company, onSave }) {
  const [items, setItems] = useState(catalog);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  useEffect(() => setItems(catalog), [catalog]);

  const saveItem = async item => {
    const upd = editing ? items.map(i => i.id === item.id ? item : i) : [...items, { ...item, id: uid() }];
    setItems(upd); await onSave(upd); setShowForm(false); setEditing(null);
  };
  const del = async id => {
    if (!confirm("Delete this item?")) return;
    const upd = items.filter(i => i.id !== id); setItems(upd); await onSave(upd);
  };
  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: 960 }}>
      <Hdr title="Item Catalog" sub="Manage your products and services" action={<button onClick={() => { setEditing(null); setShowForm(true); }} style={btn(C.navy)}>+ Add Item</button>} />
      <div style={card}>
        <div style={{ marginBottom: 16 }}>
          <input style={inp} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name or category..." />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Name", "Category", "Cost Price", "Margin", "Sell Price", "Unit", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 11, borderBottom: `2px solid ${C.border}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const sell = item.cost * (1 + item.margin / 100);
              return (
                <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ fontWeight: 700, color: C.navy }}>{item.name}</div>
                    {item.desc && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{item.desc}</div>}
                  </td>
                  <td style={{ padding: "11px 12px" }}><span style={{ background: "#EFF6FF", color: C.blue, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 }}>{item.category}</span></td>
                  <td style={{ padding: "11px 12px" }}>{company.currency} {item.cost?.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: "11px 12px" }}><span style={{ background: "#FEF3C7", color: C.amber, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{item.margin}%</span></td>
                  <td style={{ padding: "11px 12px", fontWeight: 700, color: C.green }}>{company.currency} {sell.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: "11px 12px", color: C.gray }}>{item.unit}</td>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditing(item); setShowForm(true); }} style={btnSm()}>✏ Edit</button>
                      <button onClick={() => del(item.id)} style={btnSm("#FEF2F2", C.red)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ textAlign: "center", color: "#9CA3AF", padding: "36px 0" }}>No items found</p>}
      </div>
      {showForm && <ItemFormModal item={editing} currency={company.currency} onSave={saveItem} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function ItemFormModal({ item, currency, onSave, onClose }) {
  const [f, setF] = useState(item || { name: "", category: "", desc: "", cost: 0, margin: 20, unit: "unit" });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const sell = f.cost * (1 + f.margin / 100);
  return (
    <Modal title={item ? "Edit Item" : "Add New Item"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "1/-1" }}><Field label="Item Name *" value={f.name} onChange={v => s("name", v)} placeholder="e.g. Professional Installation" /></div>
        <Field label="Category" value={f.category} onChange={v => s("category", v)} placeholder="e.g. Services" />
        <div>
          <label style={lbl}>Unit</label>
          <select style={inp} value={f.unit} onChange={e => s("unit", e.target.value)}>
            {["unit", "hr", "day", "week", "month", "year", "m", "m²", "m³", "kg", "lot", "set", "pcs"].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <Field label="Cost Price (before margin)" type="number" value={f.cost} onChange={v => s("cost", +v)} />
        <Field label="Profit Margin (%)" type="number" value={f.margin} onChange={v => s("margin", +v)} />
        <div style={{ gridColumn: "1/-1", padding: "12px 16px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #BBF7D0" }}>
          <span style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>
            Selling Price: {currency} {sell.toLocaleString("en", { minimumFractionDigits: 2 })}
            <span style={{ fontWeight: 400, color: "#15803D" }}> &nbsp;(cost + {f.margin}% = {currency} {(f.cost * f.margin / 100).toLocaleString("en", { minimumFractionDigits: 2 })} profit)</span>
          </span>
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={lbl}>Description</label>
          <textarea style={{ ...inp, height: 72, resize: "none" }} value={f.desc} onChange={e => s("desc", e.target.value)} placeholder="Brief description of this item..." />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
        <button onClick={onClose} style={btn("#F3F4F6", "#374151")}>Cancel</button>
        <button onClick={() => f.name && onSave(f)} style={btn(C.navy)}>Save Item</button>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CLIENTS VIEW
// ════════════════════════════════════════════════════════════════════════════
function ClientsView({ clients, onSave }) {
  const [items, setItems] = useState(clients);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  useEffect(() => setItems(clients), [clients]);

  const saveClient = async c => {
    const upd = editing ? items.map(x => x.id === c.id ? c : x) : [...items, { ...c, id: uid() }];
    setItems(upd); await onSave(upd); setShowForm(false); setEditing(null);
  };
  const del = async id => {
    if (!confirm("Delete this client?")) return;
    const upd = items.filter(c => c.id !== id); setItems(upd); await onSave(upd);
  };
  const filtered = items.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: 960 }}>
      <Hdr title="Clients" sub="Manage your client database" action={<button onClick={() => { setEditing(null); setShowForm(true); }} style={btn(C.navy)}>+ Add Client</button>} />
      <div style={card}>
        <div style={{ marginBottom: 16 }}><input style={inp} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search clients..." /></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, background: "#FAFAFA", transition: "box-shadow 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>{c.name}</div>
                  {c.company && <div style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>{c.company}</div>}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button onClick={() => { setEditing(c); setShowForm(true); }} style={btnSm()}>Edit</button>
                  <button onClick={() => del(c.id)} style={btnSm("#FEF2F2", C.red)}>✕</button>
                </div>
              </div>
              {c.email   && <div style={{ fontSize: 12, color: C.gray, marginBottom: 4 }}>✉ {c.email}</div>}
              {c.phone   && <div style={{ fontSize: 12, color: C.gray, marginBottom: 4 }}>📞 {c.phone}</div>}
              {c.address && <div style={{ fontSize: 12, color: C.gray }}>📍 {c.address}</div>}
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p style={{ textAlign: "center", color: "#9CA3AF", padding: "36px 0" }}>No clients found</p>}
      </div>
      {showForm && <ClientFormModal client={editing} onSave={saveClient} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function ClientFormModal({ client, onSave, onClose }) {
  const [f, setF] = useState(client || { name: "", company: "", email: "", phone: "", address: "", vat: "", contact: "" });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={client ? "Edit Client" : "Add New Client"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Contact Name *" value={f.name} onChange={v => s("name", v)} />
        <Field label="Company Name"   value={f.company} onChange={v => s("company", v)} />
        <Field label="Email"  type="email" value={f.email} onChange={v => s("email", v)} />
        <Field label="Phone"  value={f.phone} onChange={v => s("phone", v)} />
        <div style={{ gridColumn: "1/-1" }}>
          <label style={lbl}>Address</label>
          <textarea style={{ ...inp, height: 68, resize: "none" }} value={f.address} onChange={e => s("address", e.target.value)} placeholder="Street, City, Country" />
        </div>
        <Field label="VAT Number" value={f.vat} onChange={v => s("vat", v)} />
        <Field label="Contact Person" value={f.contact} onChange={v => s("contact", v)} />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
        <button onClick={onClose} style={btn("#F3F4F6", "#374151")}>Cancel</button>
        <button onClick={() => f.name && onSave(f)} style={btn(C.navy)}>Save Client</button>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  USERS VIEW (admin only)
// ════════════════════════════════════════════════════════════════════════════
function UsersView({ users, currentUser, onSave }) {
  const [items, setItems] = useState(users);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  useEffect(() => setItems(users), [users]);

  const saveUser = async u => {
    const upd = editing ? items.map(x => x.id === u.id ? u : x) : [...items, { ...u, id: uid(), createdAt: new Date().toISOString() }];
    setItems(upd); await onSave(upd); setShowForm(false); setEditing(null);
  };
  const verify = async id => {
    const upd = items.map(u => u.id === id ? { ...u, verified: !u.verified } : u);
    setItems(upd); await onSave(upd);
  };
  const del = async id => {
    if (id === currentUser.id) return alert("You cannot delete your own account.");
    if (!confirm("Delete this user?")) return;
    const upd = items.filter(u => u.id !== id); setItems(upd); await onSave(upd);
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Hdr title="User Management" sub="Control who can access the system" action={<button onClick={() => { setEditing(null); setShowForm(true); }} style={btn(C.navy)}>+ Add User</button>} />
      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Name", "Email", "Role", "Status", "Registered", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 11, borderBottom: `2px solid ${C.border}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "11px 12px", fontWeight: 700 }}>{u.name}</td>
                <td style={{ padding: "11px 12px", color: C.gray }}>{u.email}</td>
                <td style={{ padding: "11px 12px" }}><span style={{ background: u.role === "admin" ? "#EDE9FE" : "#F3F4F6", color: u.role === "admin" ? "#6D28D9" : "#374151", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{u.role.toUpperCase()}</span></td>
                <td style={{ padding: "11px 12px" }}><span style={{ background: u.verified ? "#D1FAE5" : "#FEF3C7", color: u.verified ? "#065F46" : "#92400E", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{u.verified ? "✓ VERIFIED" : "⏳ PENDING"}</span></td>
                <td style={{ padding: "11px 12px", color: "#9CA3AF", fontSize: 12 }}>{fdate(u.createdAt)}</td>
                <td style={{ padding: "11px 12px" }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => verify(u.id)} style={btnSm(u.verified ? "#FEF3C7" : "#D1FAE5", u.verified ? C.amber : C.green)}>{u.verified ? "Unverify" : "Verify"}</button>
                    <button onClick={() => { setEditing(u); setShowForm(true); }} style={btnSm()}>Edit</button>
                    {u.id !== currentUser.id && <button onClick={() => del(u.id)} style={btnSm("#FEF2F2", C.red)}>✕</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && <UserFormModal user={editing} onSave={saveUser} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function UserFormModal({ user, onSave, onClose }) {
  const [f, setF] = useState(user || { name: "", email: "", password: "", role: "user", verified: false });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.name || !f.email) return alert("Name and email are required.");
    const pwd = f.password ? hashPwd(f.password) : (user?.password || "");
    onSave({ ...f, password: pwd });
  };
  return (
    <Modal title={user ? "Edit User" : "Add New User"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Full Name *"   value={f.name}  onChange={v => s("name", v)} />
        <Field label="Email *" type="email" value={f.email} onChange={v => s("email", v)} />
        <Field label={user ? "New Password (leave blank to keep)" : "Password *"} type="password" value={f.password || ""} onChange={v => s("password", v)} />
        <div>
          <label style={lbl}>Role</label>
          <select style={inp} value={f.role} onChange={e => s("role", e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#F8FAFC", borderRadius: 8, border: `1px solid ${C.border}` }}>
          <input type="checkbox" id="ver" checked={f.verified} onChange={e => s("verified", e.target.checked)} style={{ width: 16, height: 16 }} />
          <label htmlFor="ver" style={{ fontSize: 13, color: "#374151", cursor: "pointer", fontWeight: 600 }}>Account Verified — user can log in</label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
        <button onClick={onClose} style={btn("#F3F4F6", "#374151")}>Cancel</button>
        <button onClick={submit} style={btn(C.navy)}>Save User</button>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SETTINGS VIEW
// ════════════════════════════════════════════════════════════════════════════
function SettingsView({ company, onSave }) {
  const [f, setF] = useState(company);
  const logoRef = useRef(null);
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleLogo = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => s("logo", ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <Hdr title="Company Settings" sub="Your company details appear on every quote" />
      <div style={card}>
        <SectionTitle>Company Logo</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 110, height: 80, border: "2px dashed #D1D5DB", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#F9FAFB", flexShrink: 0 }}>
            {f.logo ? <img src={f.logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="Logo" /> : <span style={{ fontSize: 30 }}>🏢</span>}
          </div>
          <div>
            <button onClick={() => logoRef.current.click()} style={btn("#F3F4F6", "#374151")}>📁 Upload Logo</button>
            {f.logo && <button onClick={() => s("logo", null)} style={{ ...btn("#FEF2F2", C.red), marginLeft: 8 }}>Remove</button>}
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#9CA3AF" }}>PNG, JPG or SVG. Will appear on all quotes.</p>
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: "none" }} />
          </div>
        </div>

        <SectionTitle>Company Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}><Field label="Company Name" value={f.name} onChange={v => s("name", v)} /></div>
          <Field label="Email" type="email" value={f.email} onChange={v => s("email", v)} />
          <Field label="Phone" value={f.phone} onChange={v => s("phone", v)} />
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Address</label>
            <textarea style={{ ...inp, height: 78, resize: "none" }} value={f.address} onChange={e => s("address", e.target.value)} />
          </div>
          <Field label="VAT / Tax Number" value={f.vat} onChange={v => s("vat", v)} />
          <div>
            <label style={lbl}>Currency</label>
            <select style={inp} value={f.currency} onChange={e => s("currency", e.target.value)}>
              {["KES", "USD", "EUR", "GBP", "AED", "ZAR", "NGN", "GHS", "TZS", "UGX"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Bank / Payment Details</label>
            <textarea style={{ ...inp, height: 72, resize: "none" }} value={f.bankDetails || ""} onChange={e => s("bankDetails", e.target.value)} placeholder="Bank name, account number, SWIFT code, etc." />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Default Terms & Conditions</label>
            <textarea style={{ ...inp, height: 100, resize: "vertical" }} value={f.terms} onChange={e => s("terms", e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => onSave(f)} style={{ ...btn(C.navy), padding: "11px 28px" }}>💾 Save Settings</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SHARED COMPONENTS & UTILS
// ════════════════════════════════════════════════════════════════════════════
const Loader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>
    <div style={{ textAlign: "center", color: C.navy }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>Loading Quote System...</div>
    </div>
  </div>
);

const Hdr = ({ title, sub, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111" }}>{title}</h2>
      {sub && <p style={{ margin: "4px 0 0", color: C.gray, fontSize: 13 }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const SectionTitle = ({ children, noMargin }) => (
  <h3 style={{ margin: noMargin ? 0 : "0 0 16px", fontSize: 13, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>{children}</h3>
);

const Field = ({ label, type = "text", value, onChange, placeholder, readOnly, onEnter }) => (
  <div>
    {label && <label style={lbl}>{label}</label>}
    <input style={{ ...inp, background: readOnly ? "#F9FAFB" : "#fff", color: readOnly ? C.gray : "#111" }} type={type} value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly} onKeyDown={e => e.key === "Enter" && onEnter && onEnter()} />
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
    <div style={{ background: "#fff", borderRadius: 14, padding: 32, width: "100%", maxWidth: 620, maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.navy }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.gray, padding: 4, lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const StatusBadge = ({ s }) => {
  const map = { pending: ["#FEF3C7", "#92400E"], accepted: ["#D1FAE5", "#065F46"], declined: ["#FEE2E2", "#991B1B"], draft: ["#F3F4F6", "#6B7280"] };
  const [bg, color] = map[s] || map.draft;
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, display: "inline-block" }}>{(s || "draft").toUpperCase()}</span>;
};

const TotalBlock = ({ subtotal, vatAmt, total, vatRate, includeVat, currency, onVatToggle, onVatRate }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
    <div style={{ width: 300 }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", borderTop: `1px solid ${C.border}` }}>
        <span style={{ color: C.gray, fontSize: 13 }}>Subtotal</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{money(subtotal, currency)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px", borderTop: `1px solid ${C.border}` }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: C.gray }}>
          <input type="checkbox" checked={includeVat} onChange={e => onVatToggle(e.target.checked)} />
          VAT&nbsp;
          <input type="number" min="0" max="100" value={vatRate} onChange={e => onVatRate(e.target.value)} style={{ width: 48, padding: "2px 6px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12 }} /> %
        </label>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{money(vatAmt, currency)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: C.navy, color: "#fff", borderRadius: 7, marginTop: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>TOTAL</span>
        <span style={{ fontWeight: 800, fontSize: 15 }}>{money(total, currency)}</span>
      </div>
    </div>
  </div>
);
