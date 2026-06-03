<?php
require_once __DIR__ . '/../bootstrap.php';

requireAuth();
$db = getDB();
$id = segment(2); // /api/catalog/{id}

// ── GET /api/catalog  or  /api/catalog/{id} ───────────────────────────────────
if (method() === 'GET') {
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM catalog WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) err('Item not found', 404);
        ok($row);
    } else {
        $rows = $db->query("SELECT * FROM catalog ORDER BY category ASC, name ASC")->fetchAll();
        ok($rows);
    }
}

// ── POST /api/catalog ─────────────────────────────────────────────────────────
if (method() === 'POST' && !$id) {
    $b    = body();
    $name = trim($b['name'] ?? '');
    if (!$name) err('Item name is required');

    $cost      = (float)($b['cost_price'] ?? 0);
    $margin    = (float)($b['margin']     ?? 0);
    $unitPrice = $cost > 0 ? round($cost * (1 + $margin / 100), 2)
                           : (float)($b['unit_price'] ?? 0);

    $stmt = $db->prepare("
        INSERT INTO catalog (name, category, unit, cost_price, margin, unit_price, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $name,
        $b['category']    ?? null,
        $b['unit']        ?? null,
        $cost,
        $margin,
        $unitPrice,
        $b['description'] ?? null,
    ]);
    ok(['success' => true, 'id' => $db->lastInsertId()], 201);
}

// ── PUT /api/catalog/{id} ─────────────────────────────────────────────────────
if (method() === 'PUT' && $id) {
    $b    = body();
    $name = trim($b['name'] ?? '');
    if (!$name) err('Item name is required');

    $cost      = (float)($b['cost_price'] ?? 0);
    $margin    = (float)($b['margin']     ?? 0);
    $unitPrice = $cost > 0 ? round($cost * (1 + $margin / 100), 2)
                           : (float)($b['unit_price'] ?? 0);

    $db->prepare("
        UPDATE catalog SET name=?, category=?, unit=?, cost_price=?, margin=?, unit_price=?, description=?
        WHERE id=?
    ")->execute([
        $name,
        $b['category']    ?? null,
        $b['unit']        ?? null,
        $cost,
        $margin,
        $unitPrice,
        $b['description'] ?? null,
        $id,
    ]);
    ok(['success' => true]);
}

// ── DELETE /api/catalog/{id} ──────────────────────────────────────────────────
if (method() === 'DELETE' && $id) {
    $db->prepare("DELETE FROM catalog WHERE id = ?")->execute([$id]);
    ok(['success' => true]);
}

err('Method not allowed', 405);
