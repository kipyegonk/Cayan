// ── Views: Clients ─────────────────────────────────────────────────────────

Object.assign(app, {
renderClients() {
    const clients = this.state.clients || [];
    return `<div style="max-width:1000px;">
      <div class="page-header">
        <div><h2 class="page-title">Clients</h2><p class="page-subtitle">${clients.length} clients</p></div>
        <button class="button" id="cli-add-btn">+ Add Client</button>
      </div>
      <div class="card" style="overflow-x:auto;">
        <table>
          <thead><tr>
            <th>Name</th><th>Email</th><th>Phone</th>
            <th>Contact Person</th><th>Location</th><th>Address</th>
            <th style="text-align:center;">Actions</th>
          </tr></thead>
          <tbody>${clients.length ? clients.map(c => `<tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.email||'—'}</td>
            <td>${c.phone||'—'}</td>
            <td>${c.contact_person||'—'}</td>
            <td>${c.location||'—'}</td>
            <td>${c.address||'—'}</td>
            <td style="text-align:center;white-space:nowrap;">
              <button class="button secondary" style="padding:4px 10px;font-size:11px;margin-right:4px;" data-edit-client="${c.id}">✏ Edit</button>
              <button class="button red" style="padding:4px 10px;font-size:11px;" data-del-client="${c.id}">🗑 Delete</button>
            </td>
          </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--gray);padding:24px;">No clients yet. Click "+ Add Client" to start.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
  }
});
