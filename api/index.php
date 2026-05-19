<?php
//  API ROUTER & HANDLERS

require_once 'config.php';
require_once 'classes/Database.php';
require_once 'classes/Auth.php';

$db = new Database();
$auth = new Auth($db);

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/q/api/|^/api/#', '', $path);
$parts = explode('/', trim($path, '/'));
$endpoint = $parts[0] ?? '';
$action = $parts[1] ?? '';

// Initialize database tables
if (!file_exists(__DIR__ . '/db_initialized.flag')) {
    $db->createTables();
    touch(__DIR__ . '/db_initialized.flag');
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

// AUTH ENDPOINTS

if ($endpoint === 'auth') {
    if ($action === 'login' && $method === 'POST') {
        $result = $auth->login($data['email'] ?? '', $data['password'] ?? '');
        http_response_code($result['success'] ? 200 : 401);
        echo json_encode($result);
        exit;
    }

    if ($action === 'register' && $method === 'POST') {
        $result = $auth->register($data['name'] ?? '', $data['email'] ?? '', $data['password'] ?? '');
        http_response_code($result['success'] ? 201 : 400);
        echo json_encode($result);
        exit;
    }

    if ($action === 'verify' && $method === 'GET') {
        $user = Auth::getCurrentUser();
        if ($user) {
            http_response_code(200);
            echo json_encode(['valid' => true, 'user' => $user]);
        } else {
            http_response_code(401);
            echo json_encode(['valid' => false]);
        }
        exit;
    }
}

// USERS ENDPOINTS

if ($endpoint === 'users') {
    Auth::requireAdmin();

    if ($method === 'GET') {
        $users = $db->getRows("SELECT id, name, email, role, verified, created_at FROM users ORDER BY created_at DESC");
        echo json_encode($users);
        exit;
    }

    if ($method === 'POST') {
        $userId = Auth::generateId();
        $hashedPassword = Auth::hashPassword($data['password'] ?? 'temp123');
        
        $result = $db->insert('users', [
            'id' => $userId,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $hashedPassword,
            'role' => $data['role'] ?? 'user',
            'verified' => $data['verified'] ?? 0
        ]);

        if ($result) {
            http_response_code(201);
            echo json_encode(['success' => true, 'id' => $userId]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to create user']);
        }
        exit;
    }

    if ($method === 'PUT' && !empty($action)) {
        $updates = [];
        if (isset($data['name'])) $updates['name'] = $data['name'];
        if (isset($data['email'])) $updates['email'] = $data['email'];
        if (isset($data['password'])) $updates['password'] = Auth::hashPassword($data['password']);
        if (isset($data['role'])) $updates['role'] = $data['role'];
        if (isset($data['verified'])) $updates['verified'] = $data['verified'];

        $db->update('users', $updates, 'id = ?', [$action]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE' && !empty($action)) {
        $db->delete('users', 'id = ?', [$action]);
        echo json_encode(['success' => true]);
        exit;
    }
}

// COMPANY SETTINGS ENDPOINTS
if ($endpoint === 'company') {
    Auth::requireAuth();

    if ($method === 'GET') {
        $company = $db->getRow("SELECT * FROM company WHERE id = 1");
        if (!$company) {
            $company = [
                'id' => 1,
                'name' => 'Company Name',
                'email' => '',
                'phone' => '',
                'address' => '',
                'vat' => '',
                'currency' => 'KES',
                'logo' => null,
                'terms' => 'Payment is due within 30 days of the quote date.',
                'bank_details' => ''
            ];
        }
        echo json_encode($company);
        exit;
    }

    if ($method === 'POST' || $method === 'PUT') {
        Auth::requireAdmin();
        
        $existing = $db->getRow("SELECT id FROM company WHERE id = 1");
        
        if ($existing) {
            $db->update('company', [
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'address' => $data['address'],
                'vat' => $data['vat'],
                'currency' => $data['currency'],
                'logo' => $data['logo'] ?? null,
                'terms' => $data['terms'],
                'bank_details' => $data['bank_details']
            ], 'id = ?', [1]);
        } else {
            $db->insert('company', [
                'id' => 1,
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'address' => $data['address'],
                'vat' => $data['vat'],
                'currency' => $data['currency'],
                'logo' => $data['logo'] ?? null,
                'terms' => $data['terms'],
                'bank_details' => $data['bank_details']
            ]);
        }

        echo json_encode(['success' => true]);
        exit;
    }
}

// CATALOG ENDPOINTS

if ($endpoint === 'catalog') {
    Auth::requireAuth();

    if ($method === 'GET') {
        if (!empty($action)) {
            $item = $db->getRow("SELECT * FROM catalog WHERE id = ?", [$action]);
            echo json_encode($item);
        } else {
            $items = $db->getRows("SELECT * FROM catalog ORDER BY name");
            echo json_encode($items);
        }
        exit;
    }

    if ($method === 'POST') {
        Auth::requireAdmin();
        
        $itemId = Auth::generateId();
        $db->insert('catalog', [
            'id' => $itemId,
            'name' => $data['name'],
            'category' => $data['category'],
            'description' => $data['description'],
            'cost_price' => $data['cost_price'],
            'margin' => $data['margin'],
            'unit' => $data['unit']
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $itemId]);
        exit;
    }

    if ($method === 'PUT' && !empty($action)) {
        Auth::requireAdmin();
        
        $db->update('catalog', [
            'name' => $data['name'],
            'category' => $data['category'],
            'description' => $data['description'],
            'cost_price' => $data['cost_price'],
            'margin' => $data['margin'],
            'unit' => $data['unit']
        ], 'id = ?', [$action]);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE' && !empty($action)) {
        Auth::requireAdmin();
        
        $db->delete('catalog', 'id = ?', [$action]);
        echo json_encode(['success' => true]);
        exit;
    }
}

// CLIENTS ENDPOINTS

if ($endpoint === 'clients') {
    Auth::requireAuth();

    if ($method === 'GET') {
        if (!empty($action)) {
            $client = $db->getRow("SELECT * FROM clients WHERE id = ?", [$action]);
            echo json_encode($client);
        } else {
            $clients = $db->getRows("SELECT * FROM clients ORDER BY name");
            echo json_encode($clients);
        }
        exit;
    }

    if ($method === 'POST') {
        $clientId = Auth::generateId();
        $db->insert('clients', [
            'id' => $clientId,
            'name' => $data['name'],
            'company' => $data['company'] ?? '',
            'email' => $data['email'] ?? '',
            'phone' => $data['phone'] ?? '',
            'address' => $data['address'] ?? '',
            'vat' => $data['vat'] ?? '',
            'contact_person' => $data['contact_person'] ?? ''
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $clientId]);
        exit;
    }

    if ($method === 'PUT' && !empty($action)) {
        $db->update('clients', [
            'name' => $data['name'],
            'company' => $data['company'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'address' => $data['address'],
            'vat' => $data['vat'],
            'contact_person' => $data['contact_person']
        ], 'id = ?', [$action]);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE' && !empty($action)) {
        $db->delete('clients', 'id = ?', [$action]);
        echo json_encode(['success' => true]);
        exit;
    }
}

// QUOTES ENDPOINTS

if ($endpoint === 'quotes') {
    Auth::requireAuth();

    if ($method === 'GET') {
        if (!empty($action)) {
            $quote = $db->getRow("SELECT * FROM quotes WHERE id = ?", [$action]);
            $items = $db->getRows("SELECT * FROM quote_items WHERE quote_id = ?", [$action]);
            $quote['items'] = $items;
            echo json_encode($quote);
        } else {
            $quotes = $db->getRows("SELECT * FROM quotes ORDER BY created_at DESC");
            echo json_encode($quotes);
        }
        exit;
    }

    if ($method === 'POST') {
        // Get next quote number
        $counter = $db->getRow("SELECT current_value FROM quote_counter WHERE id = 1");
        $quoteNumber = "QT-" . date('Y') . "-" . $counter['current_value'];
        $db->update('quote_counter', ['current_value' => $counter['current_value'] + 1], 'id = ?', [1]);

        $quoteId = Auth::generateId();
        $db->insert('quotes', [
            'id' => $quoteId,
            'number' => $quoteNumber,
            'client_id' => $data['client_id'],
            'client_name' => $data['client_name'],
            'client_company' => $data['client_company'],
            'quote_date' => $data['quote_date'],
            'valid_days' => $data['valid_days'],
            'valid_until' => $data['valid_until'],
            'subtotal' => $data['subtotal'],
            'vat_rate' => $data['vat_rate'],
            'vat_amount' => $data['vat_amount'],
            'total' => $data['total'],
            'include_vat' => $data['include_vat'],
            'status' => $data['status'],
            'notes' => $data['notes']
        ]);

        // Insert quote items
        foreach ($data['items'] as $item) {
            $itemId = Auth::generateId();
            $db->insert('quote_items', [
                'id' => $itemId,
                'quote_id' => $quoteId,
                'name' => $item['name'],
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit' => $item['unit'],
                'unit_price' => $item['unit_price'],
                'margin' => $item['margin']
            ]);
        }

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $quoteId, 'number' => $quoteNumber]);
        exit;
    }

    if ($method === 'PUT' && !empty($action)) {
        $db->update('quotes', [
            'client_id' => $data['client_id'],
            'client_name' => $data['client_name'],
            'client_company' => $data['client_company'],
            'quote_date' => $data['quote_date'],
            'valid_days' => $data['valid_days'],
            'valid_until' => $data['valid_until'],
            'subtotal' => $data['subtotal'],
            'vat_rate' => $data['vat_rate'],
            'vat_amount' => $data['vat_amount'],
            'total' => $data['total'],
            'include_vat' => $data['include_vat'],
            'status' => $data['status'],
            'notes' => $data['notes']
        ], 'id = ?', [$action]);

        // Update quote items (delete old and insert new)
        $db->delete('quote_items', 'quote_id = ?', [$action]);
        foreach ($data['items'] as $item) {
            $itemId = Auth::generateId();
            $db->insert('quote_items', [
                'id' => $itemId,
                'quote_id' => $action,
                'name' => $item['name'],
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit' => $item['unit'],
                'unit_price' => $item['unit_price'],
                'margin' => $item['margin']
            ]);
        }

        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE' && !empty($action)) {
        $db->delete('quote_items', 'quote_id = ?', [$action]);
        $db->delete('quotes', 'id = ?', [$action]);
        echo json_encode(['success' => true]);
        exit;
    }
}

// STATISTICS ENDPOINTS

if ($endpoint === 'stats') {
    Auth::requireAuth();

    $totalQuotes = $db->getRow("SELECT COUNT(*) as count FROM quotes");
    $totalValue = $db->getRow("SELECT COALESCE(SUM(total), 0) as total FROM quotes");
    $pending = $db->getRow("SELECT COUNT(*) as count FROM quotes WHERE status = 'pending'");
    $accepted = $db->getRow("SELECT COUNT(*) as count FROM quotes WHERE status = 'accepted'");
    $clients = $db->getRow("SELECT COUNT(*) as count FROM clients");

    echo json_encode([
        'total_quotes' => $totalQuotes['count'],
        'total_value' => floatval($totalValue['total']),
        'pending' => $pending['count'],
        'accepted' => $accepted['count'],
        'clients' => $clients['count']
    ]);
    exit;
}

// DEFAULT RESPONSE

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
