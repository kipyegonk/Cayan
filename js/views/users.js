// ── Views: Users ─────────────────────────────────────────────────────────

Object.assign(app, {
renderUsers() {
    const users = this.state.users || [];
    return `<div style="max-width:900px;">
      <div class="page-header">
        <div><h2 class="page-title">Users</h2></div>
        <button class="button" id="usr-add-btn">+ Add User</button>
      </div>
      <div class="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${users.length ? users.map(u => `<tr>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td><span style="background:${u.role==='admin'?'#760014':'#374151'};color:#D0A95E;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">${u.role.toUpperCase()}</span></td>
            <td>${u.verified?'✅ Verified':'⏳ Pending'}</td>
            <td style="white-space:nowrap;">
              <button class="button secondary" style="padding:4px 10px;font-size:11px;margin-right:4px;" data-change-pwd="${u.id}" data-user-name="${u.name}">🔑 Password</button>
            </td>
          </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:20px;">No users.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
  }
});
