<?php
require_once __DIR__ . '/../bootstrap.php';

requireAuth();
$db = getDB();
$id = segment(2); // /api/clients/{id}

// GET /api/clients  or  /api/clients/{id} 
if (method() === 'GET') {
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM clients WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) err('Client not found', 404);
        ok($row);
    } else {
        $rows = $db->query("SELECT * FROM clients ORDER BY name ASC")->fetchAll();
        ok($rows);
    }
}

// POST /api/clients 
if (method() === 'POST' && !$id) {
    $b = body();
    $name = trim($b['name'] ?? '');
    if (!$name) err('Client name is required');

    $stmt = $db->prepare("
        INSERT INTO clients (name, email, phone, contact_person, location, address)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $name,
        $b['email']          ?? null,
        $b['phone']          ?? null,
        $b['contact_person'] ?? null,
        $b['location']       ?? null,
        $b['address']        ?? null,
    ]);
    $newId = $db->lastInsertId();
    $row   = $db->prepare("SELECT * FROM clients WHERE id = ?")->execute([$newId]);
    ok(['success' => true, 'id' => $newId], 201);
}

// PUT /api/clients/{id} 
if (method() === 'PUT' && $id) {
    $b = body();
    $name = trim($b['name'] ?? '');
    if (!$name) err('Client name is required');

    $db->prepare("
        UPDATE clients SET name=?, email=?, phone=?, contact_person=?, location=?, address=?
        WHERE id=?
    ")->execute([
        $name,
        $b['email']          ?? null,
        $b['phone']          ?? null,
        $b['contact_person'] ?? null,
        $b['location']       ?? null,
        $b['address']        ?? null,
        $id,
    ]);
    ok(['success' => true]);
}

// DELETE /api/clients/{id} 
if (method() === 'DELETE' && $id) {
    $db->prepare("DELETE FROM clients WHERE id = ?")->execute([$id]);
    ok(['success' => true]);
}

err('Method not allowed', 405);
