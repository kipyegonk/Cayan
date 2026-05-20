export function renderSettings(state, helpers) {
    const dropdowns = state.dropdowns || {
        categories: ['General', 'Maintenance', 'Development', 'Services', 'Installation'],
        margins: [10, 15, 20, 25, 30, 35, 40],
        units: ['unit', 'hr', 'project', 'year']
    };

    const renderTable = (type, label, values) => `
        <div class="card" style="margin-bottom: 18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; gap: 12px;">
                <div>
                    <h3 style="margin: 0 0 6px;">${label}</h3>
                    <p style="margin: 0; color: #6B7280; font-size: 13px;">Manage items shown in the catalog dropdown for ${label.toLowerCase()}.</p>
                </div>
                <button class="button green dropdown-add-btn" data-type="${type}">Add ${label.slice(0, -1)}</button>
            </div>
            <div style="overflow-x:auto;">
                <table>
                    <thead>
                        <tr>
                            <th>${label}</th>
                            <th style="width: 180px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${values.map(value => `
                            <tr>
                                <td>${value}</td>
                                <td>
                                    <button class="button secondary dropdown-edit-btn" data-type="${type}" data-value="${value}">Edit</button>
                                    <button class="button red dropdown-delete-btn" data-type="${type}" data-value="${value}">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return `
        <div style="max-width: 1100px;">
            <div class="page-header">
                <div>
                    <h2 class="page-title">Dropdown settings</h2>
                    <p class="page-subtitle">Edit the category, margin, and unit items available when creating catalog entries.</p>
                </div>
            </div>
            ${renderTable('categories', 'Categories', dropdowns.categories)}
            ${renderTable('margins', 'Margins', dropdowns.margins)}
            ${renderTable('units', 'Units', dropdowns.units)}
        </div>
    `;
}
