export function renderClients(state, helpers) {
    const clients = state.clients || [];

    return `
        <div style="max-width: 1100px;">
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; gap:18px; margin-bottom: 18px;">
                <div>
                    <h2 class="page-title">Clients</h2>
                    <p class="page-subtitle">Manage client contacts and billing information for quotes.</p>
                </div>
                <button class="button green clients-add-btn">+ Add Client</button>
            </div>

            ${clients.length === 0 ? `
                <div class="card">
                    <p style="color: #374151;">No clients found yet. Add a client to begin creating quotes with contact details.</p>
                </div>
            ` : `
                <div class="card">
                    <div style="overflow-x:auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Company</th>
                                    <th>Contact Person</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>VAT</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${clients.map(client => `
                                    <tr>
                                        <td>${client.name || '—'}</td>
                                        <td>${client.company || '—'}</td>
                                        <td>${client.contact_person || '—'}</td>
                                        <td>${client.email || '—'}</td>
                                        <td>${client.phone || '—'}</td>
                                        <td>${client.address ? client.address.replace(/\s+/g, ' ').trim().slice(0, 100) + (client.address.length > 100 ? '…' : '') : '—'}</td>
                                        <td>${client.vat || '—'}</td>
                                        <td style="white-space: nowrap; display: flex; gap: 6px; flex-wrap: wrap;">
                                            <button class="button secondary client-edit-btn" data-id="${client.id}">Edit</button>
                                            <button class="button red client-delete-btn" data-id="${client.id}">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `}
        </div>
    `;
}
