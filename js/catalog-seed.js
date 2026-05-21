(async function seedCatalog() {

    // Guard: must be logged in 
    const token = localStorage.getItem('auth_token');
    if (!token) {
        console.error('[CatalogSeed] Not logged in. Please log in first.');
        return;
    }

    // Catalog items
    const ITEMS = [

        // CHURCH SETUP
        {
            name: 'Entrance Floral Arc',
            category: 'Church Setup',
            description: 'Decorative floral arch at the church entrance',
            cost_price: 35000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Podium',
            category: 'Church Setup',
            description: 'Ceremony podium for officiants and speakers',
            cost_price: 10000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Pergola Tent (Church)',
            category: 'Church Setup',
            description: 'Outdoor pergola tent for church setup area',
            cost_price: 15000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Church Backdrop',
            category: 'Church Setup',
            description: '3 arc / flowers backdrop, 4 m × 4 m boards',
            cost_price: 50000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Church Pew',
            category: 'Church Setup',
            description: 'Decorated church pew / bench seating',
            cost_price: 1000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Welcome Signage',
            category: 'Church Setup',
            description: 'Custom welcome sign — cost varies with design complexity',
            cost_price: 15000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Signing Table Dressed with Flowers',
            category: 'Church Setup',
            description: 'Registry / signing table with floral dressing',
            cost_price: 2500,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Foldable Chair',
            category: 'Church Setup',
            description: 'White foldable chair for church ceremony seating',
            cost_price: 150,
            margin: 0,
            unit: 'unit',
        },

        // TENT & DÉCOR
        {
            name: 'A-Frame Tent (9 sections)',
            category: 'Tent & Décor',
            description: 'Large A-frame reception tent, 9-section configuration',
            cost_price: 35000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Floral Chandelier with Lights',
            category: 'Tent & Décor',
            description: 'Hanging floral chandelier fitted with decorative lights',
            cost_price: 70000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Tent Lighting – Spotlights & Fairy Lights',
            category: 'Tent & Décor',
            description: 'Full tent lighting package: spotlights and fairy lights',
            cost_price: 60000,
            margin: 0,
            unit: 'lot',
        },
        {
            name: '60-Bulb Chandelier',
            category: 'Tent & Décor',
            description: 'Decorative 60-bulb chandelier for reception tent',
            cost_price: 20000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: '42-Bulb Chandelier',
            category: 'Tent & Décor',
            description: 'Decorative 42-bulb chandelier for reception tent',
            cost_price: 15000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'High Table Backdrop',
            category: 'Tent & Décor',
            description: 'Decorated backdrop behind the bridal high table',
            cost_price: 40000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Customized High Table (Seats 4)',
            category: 'Tent & Décor',
            description: 'Bespoke decorated high table for 4 people',
            cost_price: 20000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'High Table Seat',
            category: 'Tent & Décor',
            description: 'Decorated seat for the bridal high table',
            cost_price: 2000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Stage for High Table',
            category: 'Tent & Décor',
            description: 'Raised stage platform for the bridal high table area',
            cost_price: 40000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Rectangular Table (Bridal Party)',
            category: 'Tent & Décor',
            description: 'Dressed rectangular table for bridal party seating',
            cost_price: 1200,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Glass Cake Table',
            category: 'Tent & Décor',
            description: 'Glass display table for the wedding cake',
            cost_price: 10000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Bline Tent – Buffet',
            category: 'Tent & Décor',
            description: 'Additional tent structure to cover the buffet area',
            cost_price: 35000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Branded Dance Floor (Monogram Details)',
            category: 'Tent & Décor',
            description: 'Custom branded dance floor with monogram / couple details',
            cost_price: 45000,
            margin: 0,
            unit: 'lot',
        },
        {
            name: 'Photobooth',
            category: 'Tent & Décor',
            description: 'Styled photobooth setup with props and backdrop',
            cost_price: 65000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Chiavari Chair',
            category: 'Tent & Décor',
            description: 'Elegant Chiavari chair for reception seating',
            cost_price: 150,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Charger Plate & Napkin Set',
            category: 'Tent & Décor',
            description: 'Decorative charger plate paired with a dressed napkin',
            cost_price: 200,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Table Number',
            category: 'Tent & Décor',
            description: 'Decorative table number stand / card',
            cost_price: 100,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Round Table Dressed (Jute Cloth, 9 pax)',
            category: 'Tent & Décor',
            description: 'Round reception table dressed in jute cloth — seats 9 guests',
            cost_price: 1000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'High-Peak Tent (Clearance / Kitchen)',
            category: 'Tent & Décor',
            description: 'High-clearance peak tent for kitchen or back-of-house use',
            cost_price: 3500,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Buffet & Dessert Table Dressed',
            category: 'Tent & Décor',
            description: 'Fully dressed buffet or dessert station table',
            cost_price: 700,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Undressed Rectangular Table (Kitchen)',
            category: 'Tent & Décor',
            description: 'Plain rectangular table for kitchen / service use',
            cost_price: 0,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'PA Rectangular Table Dressed',
            category: 'Tent & Décor',
            description: 'Dressed rectangular table for PA / sound equipment',
            cost_price: 700,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Cocktail Table',
            category: 'Tent & Décor',
            description: 'Standing cocktail / high-boy table',
            cost_price: 1000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Entrance Signage',
            category: 'Tent & Décor',
            description: 'Decorative entrance signage board for the venue',
            cost_price: 20000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Pyro-Technic Lighting & Fog (4 Pyros + 1 Fog)',
            category: 'Tent & Décor',
            description: 'Pyrotechnic cold-spark machines (4) plus fog machine (1)',
            cost_price: 45000,
            margin: 0,
            unit: 'lot',
        },
        {
            name: 'Handwash Station',
            category: 'Tent & Décor',
            description: 'Portable handwash station with soap and water',
            cost_price: 8000,
            margin: 0,
            unit: 'unit',
        },

        // ── FLOWERS ───────────────────────────────────────────
        {
            name: 'Reception Entrance Florals',
            category: 'Flowers',
            description: 'Floral arrangement and dressing for the reception entrance',
            cost_price: 40000,
            margin: 0,
            unit: 'lot',
        },
        {
            name: 'Floral Centerpiece',
            category: 'Flowers',
            description: 'Fresh floral centerpiece per reception table',
            cost_price: 2500,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'High Table & Bridesmaid Table Florals',
            category: 'Flowers',
            description: 'Floral arrangement for high table or bridesmaid table',
            cost_price: 3000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Bridal Car Floral Dressing',
            category: 'Flowers',
            description: 'Fresh flower arrangement on the bridal car bonnet and doors',
            cost_price: 8000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Guest / Entourage Car Floral Dressing',
            category: 'Flowers',
            description: 'Floral dressing per car in the wedding entourage line-up',
            cost_price: 3000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Bridal Bouquet',
            category: 'Flowers',
            description: 'Fresh flower bridal bouquet',
            cost_price: 2000,
            margin: 0,
            unit: 'unit',
        },
        {
            name: 'Bridesmaid Bouquet',
            category: 'Flowers',
            description: 'Fresh flower bouquet per bridesmaid',
            cost_price: 1000,
            margin: 0,
            unit: 'unit',
        },

        // ── LOGISTICS ─────────────────────────────────────────
        {
            name: 'Florist Labour & Transport',
            category: 'Logistics',
            description: 'Florist team labour cost including transport for the day',
            cost_price: 50000,
            margin: 0,
            unit: 'lot',
        },
        {
            name: 'Set-Up & Set-Down Labour',
            category: 'Logistics',
            description: 'Full crew labour for venue set-up and post-event tear-down',
            cost_price: 40000,
            margin: 0,
            unit: 'lot',
        },
        {
            name: 'Transport (To & Fro) within Nairobi',
            category: 'Logistics',
            description: 'Return vehicle transport for equipment within Nairobi',
            cost_price: 60000,
            margin: 0,
            unit: 'lot',
        },
    ];

    // ── Existing items: skip duplicates by name + category ──
    let existing = [];
    try {
        const catalogRes = await fetch('./api/catalog', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        existing = await catalogRes.json();
    } catch (err) {
        console.warn('[CatalogSeed] Could not load existing catalog items:', err.message);
    }

    const existingSet = new Set((existing || []).map(item => `${item.name}:::${item.category}`));

    console.log(`[CatalogSeed] Starting — ${ITEMS.length} items to load…`);

    let created = 0;
    let skipped = 0;
    let failed  = 0;

    for (const item of ITEMS) {
        const key = `${item.name}:::${item.category}`;
        if (existingSet.has(key)) {
            console.log(`  → Skipped duplicate: ${item.category} › ${item.name}`);
            skipped++;
            continue;
        }

        try {
            const res = await fetch('./api/catalog', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(item),
            });

            const result = await res.json();

            if (result.success || result.item) {
                console.log(`  ✓  ${item.category} › ${item.name}`);
                created++;
            } else {
                console.warn(`  ✗  ${item.name}: ${result.error}`);
                failed++;
            }
        } catch (err) {
            console.error(`  ✗  ${item.name}: Network error —`, err.message);
            failed++;
        }
    }

    console.log(`[CatalogSeed] Done — ${created} created, ${skipped} skipped, ${failed} failed.`);

    // Refresh the catalog view if the app is running
    if (typeof app !== 'undefined') {
        await CatalogModule.loadItems();
        console.log('[CatalogSeed] Catalog view refreshed.');
    }

})();
