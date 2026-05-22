export async function generateQuotePDF(quote, company, helpers) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Header
    doc.setFontSize(22);
    doc.text("Cayan Events", margin, 20);
    
    doc.setFontSize(11);
    doc.text(company.name || "Cayan Events", margin, 28);
    doc.text(company.phone || "", margin, 33);
    doc.text(company.email || "", margin, 38);

    doc.setFontSize(16);
    doc.text(`Quotation #${quote.number}`, pageWidth - margin, 20, { align: "right" });

    // Client
    doc.text("To:", margin, 55);
    doc.text(quote.client_name || "Client Name", margin + 5, 62);

    let y = 80;

    // Group by sections
    const sections = {};
    quote.items.forEach(item => {
        if (!sections[item.category]) sections[item.category] = [];
        sections[item.category].push(item);
    });

    for (const [section, items] of Object.entries(sections)) {
        if (y > 220) { doc.addPage(); y = 30; }

        doc.setFontSize(13);
        doc.text(section.toUpperCase(), margin, y);
        y += 8;

        items.forEach(item => {
            const total = item.quantity * item.unit_price;
            doc.setFontSize(10);
            doc.text(item.name, margin, y);
            doc.text(item.quantity.toString(), margin + 100, y);
            doc.text(helpers.formatMoney(item.unit_price), margin + 130, y);
            doc.text(helpers.formatMoney(total), margin + 170, y);
            y += 7;
        });

        y += 10;
    }

    // Grand Total
    const grandTotal = quote.total || 0;
    doc.setFontSize(14);
    doc.text("GRAND TOTAL", margin, y + 10);
    doc.text(helpers.formatMoney(grandTotal), pageWidth - margin, y + 10, { align: "right" });

    doc.save(`Quote_${quote.number || Date.now()}.pdf`);
}