// Views: Catalog 

Object.assign(app, {
renderCatalog() {
    const items = this.state.catalog || [];
    const CATEGORIES = ['Tents & Structures','Flowers & Décor','Lighting','Furniture','Catering','Logistics','Audio Visual','Miscellaneous'];
    const UNITS = ['pcs','set','day','hr','table','chair','per person','lot','m²','kg'];
    return `<div style="max-width:1000px;">
      <div class="page-header">
        <div><h2 class="page-title">Catalog</h2><p class="page-subtitle">${items.length} items</p></div>
        <button class="button" id="cat-add-btn">+ Add Item</button>
      </div>
      <div class="card" style="overflow-x:auto;">
        <table>
          <thead><tr>
            <th>Name</th><th>Category</th><th>Unit</th>
            <th style="text-align:right;">Cost Price</th>
            <th style="text-align:right;">Margin %</th>
            <th style="text-align:right;">Sell Price</th>
            <th style="text-align:center;">Actions</th>
          </tr></thead>
          <tbody>${items.length ? items.map(i => {
            const cost = parseFloat(i.cost_price||i.amount||0);
            const margin = parseFloat(i.margin||0);
            const sell = cost > 0 ? (cost * (1 + margin/100)) : parseFloat(i.unit_price||0);
            return `<tr>
              <td><strong>${i.name}</strong>${i.description ? '<br><span style="font-size:11px;color:#6B7280;">'+i.description+'</span>' : ''}</td>
              <td><span style="background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;">${i.category||'—'}</span></td>
              <td>${i.unit||'—'}</td>
              <td style="text-align:right;">${cost>0 ? helpers.fmt(cost) : '—'}</td>
              <td style="text-align:right;">${margin>0 ? margin+'%' : '—'}</td>
              <td style="text-align:right;font-weight:700;">${sell>0 ? helpers.fmt(sell) : '—'}</td>
              <td style="text-align:center;white-space:nowrap;">
                <button class="button secondary" style="padding:4px 10px;font-size:11px;margin-right:4px;" data-edit-catalog="${i.id}">✏ Edit</button>
                <button class="button red" style="padding:4px 10px;font-size:11px;" data-del-catalog="${i.id}">🗑 Delete</button>
              </td>
            </tr>`;
          }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--gray);padding:24px;">No catalog items yet. Click "+ Add Item" to start.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
  }
});
