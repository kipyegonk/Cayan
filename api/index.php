<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/Auth.php';

$db = new Database();
$auth = new Auth($db);

// Database 
define('DB_PATH', __DIR__ . '/../database.db');

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec('PRAGMA foreign_keys=ON');
    setup_schema($pdo);
    return $pdo;
}

function setup_schema(PDO $pdo): void {
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT    NOT NULL,
        email        TEXT    NOT NULL UNIQUE,
        password     TEXT    NOT NULL,
        role         TEXT    NOT NULL DEFAULT 'user',
        verified     INTEGER NOT NULL DEFAULT 0,
        created_at   TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS company (
        id       INTEGER PRIMARY KEY CHECK (id = 1),
        name     TEXT,
        phone    TEXT,
        email    TEXT,
        address  TEXT,
        currency TEXT DEFAULT 'KES',
        terms    TEXT,
        logo     TEXT
    );

    CREATE TABLE IF NOT EXISTS catalog (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT    NOT NULL,
        category     TEXT,
        unit         TEXT,
        description  TEXT,
        cost_price   REAL    DEFAULT 0,
        margin       REAL    DEFAULT 0,
        unit_price   REAL    DEFAULT 0,
        created_at   TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        name           TEXT    NOT NULL,
        email          TEXT,
        phone          TEXT,
        contact_person TEXT,
        location       TEXT,
        address        TEXT,
        created_at     TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quotes (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        number         TEXT    NOT NULL UNIQUE,
        client_id      INTEGER REFERENCES clients(id),
        client_name    TEXT,
        contact_person TEXT,
        venue          TEXT,
        no_of_guests   TEXT,
        quote_date     TEXT,
        valid_until    TEXT,
        status         TEXT    DEFAULT 'pending',
        subtotal       REAL    DEFAULT 0,
        vat_rate       REAL    DEFAULT 16,
        vat_amount     REAL    DEFAULT 0,
        total          REAL    DEFAULT 0,
        notes          TEXT,
        created_by     TEXT,
        created_at     TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quote_items (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id    INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
        type        TEXT    NOT NULL DEFAULT 'item',
        section     TEXT,
        subsection  TEXT,
        name        TEXT,
        qty         REAL    DEFAULT 0,
        unit_price  REAL    DEFAULT 0,
        price       REAL    DEFAULT 0,
        sort_order  INTEGER DEFAULT 0
    );
    ");

    // Seed default admin if no users exist
    $count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($count == 0) {
        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $pdo->exec("INSERT INTO users (name,email,password,role,verified)
                    VALUES ('Admin','admin@company.com','$hash','admin',1)");
    }

    // Seed default company row
    $comp = $pdo->query("SELECT COUNT(*) FROM company")->fetchColumn();
    if ($comp == 0) {
        $pdo->exec("INSERT INTO company (id,name,phone,email,address,currency)
                    VALUES (1,'Cayan Events Ke.','0737 611 658',
                    'cayaneventsanddecor@gmail.com','Mokoyeti West Road, Karen','KES')");
    }
}

// Auth helpers 
function generate_token(array $user): string {
    $payload = base64_encode(json_encode([
        'id'    => $user['id'],
        'email' => $user['email'],
        'role'  => $user['role'],
        'exp'   => time() + 86400 * 30,
    ]));
    $secret = 'cayan_secret_2024';
    $sig    = base64_encode(hash_hmac('sha256', $payload, $secret, true));
    return $payload . '.' . $sig;
}

function verify_token(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;
    $secret = 'cayan_secret_2024';
    $sig    = base64_encode(hash_hmac('sha256', $parts[0], $secret, true));
    if (!hash_equals($sig, $parts[1])) return null;
    $data = json_decode(base64_decode($parts[0]), true);
    if (!$data || $data['exp'] < time()) return null;
    return $data;
}

function auth_user(): ?array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header  = $headers['Authorization'] ?? '';
    }
    if (!$header) return null;
    $token = str_replace('Bearer ', '', $header);
    return verify_token($token);
}

function require_auth(): array {
    $user = auth_user();
    if (!$user) { json_out(['error' => 'Unauthorized'], 401); exit; }
    return $user;
}

function require_admin(): array {
    $user = require_auth();
    if ($user['role'] !== 'admin') { json_out(['error' => 'Forbidden'], 403); exit; }
    return $user;
}

// Helpers 
function json_out(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function next_quote_number(): string {
    $pdo  = db();
    $last = $pdo->query("SELECT number FROM quotes ORDER BY id DESC LIMIT 1")->fetchColumn();
    if (!$last) return 'SN 001';
    preg_match('/(\d+)$/', $last, $m);
    $n = isset($m[1]) ? intval($m[1]) + 1 : 1;
    return 'SN ' . str_pad($n, 3, '0', STR_PAD_LEFT);
}

// Router 
$method = $_SERVER['REQUEST_METHOD'];

// Support both Apache mod_rewrite and PHP built-in server router
$uri = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = trim($uri, '/');

// Strip leading 'api/' if present (Apache mod_rewrite path)
if (preg_match('#^api/(.*)#', $uri, $m)) $uri = $m[1];
// If uri is just 'api' with no sub-path
if ($uri === 'api') $uri = '';

$parts = explode('/', $uri);
$resource = $parts[0] ?? '';
$id       = $parts[1] ?? null;
$sub      = $parts[2] ?? null;

db(); // ensure schema exists

match(true) {

    // AUTH 
    $resource === 'auth' && $id === 'login'    => auth_login(),
    $resource === 'auth' && $id === 'register' => auth_register(),
    $resource === 'auth' && $id === 'verify'   => auth_verify(),

    // COMPANY 
    $resource === 'company' && $method === 'GET'  => company_get(),
    $resource === 'company' && $method === 'POST' => company_save(),

    // CATALOG 
    $resource === 'catalog' && $method === 'GET'    && !$id => catalog_list(),
    $resource === 'catalog' && $method === 'GET'    &&  $id => catalog_get($id),
    $resource === 'catalog' && $method === 'POST'           => catalog_create(),
    $resource === 'catalog' && $method === 'PUT'    &&  $id => catalog_update($id),
    $resource === 'catalog' && $method === 'DELETE' &&  $id => catalog_delete($id),

    // CLIENTS 
    $resource === 'clients' && $method === 'GET'    && !$id => clients_list(),
    $resource === 'clients' && $method === 'GET'    &&  $id => clients_get($id),
    $resource === 'clients' && $method === 'POST'           => clients_create(),
    $resource === 'clients' && $method === 'PUT'    &&  $id => clients_update($id),
    $resource === 'clients' && $method === 'DELETE' &&  $id => clients_delete($id),

    // QUOTES 
    $resource === 'quotes'  && $method === 'GET'    && !$id => quotes_list(),
    $resource === 'quotes'  && $method === 'GET'    &&  $id => quotes_get($id),
    $resource === 'quotes'  && $method === 'POST'           => quotes_create(),
    $resource === 'quotes'  && $method === 'PUT'    &&  $id => quotes_update($id),
    $resource === 'quotes'  && $method === 'DELETE' &&  $id => quotes_delete($id),

    // USERS 
    $resource === 'users'   && $method === 'GET'            => users_list(),
    $resource === 'users'   && $method === 'POST'           => users_create(),
    $resource === 'users'   && $method === 'PUT'   &&  $id  => users_update($id),
    $resource === 'users'   && $method === 'DELETE'&&  $id  => users_delete($id),

    // STATS 
    $resource === 'stats'                                   => stats_get(),

    default => json_out(['error' => 'Not found'], 404),
};


//  AUTH
function auth_login(): void {
    $b = body();
    $pdo = db();
    $user = $pdo->prepare("SELECT * FROM users WHERE email=? AND verified=1");
    $user->execute([$b['email'] ?? '']);
    $user = $user->fetch();
    if (!$user || !password_verify($b['password'] ?? '', $user['password'])) {
        json_out(['error' => 'Invalid email or password'], 401); return;
    }
    unset($user['password']);
    json_out(['success' => true, 'token' => generate_token($user), 'user' => $user]);
}

function auth_register(): void {
    $b   = body();
    $pdo = db();
    $name  = trim($b['name']  ?? '');
    $email = trim($b['email'] ?? '');
    $pass  = $b['password']   ?? '';
    if (!$name || !$email || !$pass) { json_out(['error' => 'All fields required'], 400); return; }
    if (strlen($pass) < 6)           { json_out(['error' => 'Password too short'],  400); return; }
    $exists = $pdo->prepare("SELECT id FROM users WHERE email=?");
    $exists->execute([$email]);
    if ($exists->fetch()) { json_out(['error' => 'Email already registered'], 409); return; }
    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name,email,password,role,verified) VALUES (?,?,?,'user',0)");
    $stmt->execute([$name, $email, $hash]);
    json_out(['success' => true, 'message' => 'Registration submitted. An admin will verify your account.']);
}

function auth_verify(): void {
    $user = auth_user();
    if (!$user) { json_out(['valid' => false]); return; }
    $pdo  = db();
    $row  = $pdo->prepare("SELECT id,name,email,role,verified FROM users WHERE id=?");
    $row->execute([$user['id']]);
    $row = $row->fetch();
    if (!$row) { json_out(['valid' => false]); return; }
    json_out(['valid' => true, 'user' => $row]);
}


//  COMPANY
function company_get(): void {
    require_auth();
    $row = db()->query("SELECT * FROM company WHERE id=1")->fetch();
    json_out($row ?: (object)[]);
}

function company_save(): void {
    require_auth();
    $b   = body();
    $pdo = db();
    $pdo->prepare("INSERT INTO company (id,name,phone,email,address,currency,terms,logo)
                   VALUES (1,?,?,?,?,?,?,?)
                   ON CONFLICT(id) DO UPDATE SET
                     name=excluded.name, phone=excluded.phone, email=excluded.email,
                     address=excluded.address, currency=excluded.currency,
                     terms=excluded.terms, logo=excluded.logo")
        ->execute([
            $b['name'] ?? '', $b['phone'] ?? '', $b['email'] ?? '',
            $b['address'] ?? '', $b['currency'] ?? 'KES',
            $b['terms'] ?? '', $b['logo'] ?? '',
        ]);
    json_out(['success' => true]);
}


//  CATALOG
function catalog_list(): void {
    require_auth();
    $rows = db()->query("SELECT * FROM catalog ORDER BY category, name")->fetchAll();
    json_out($rows);
}

function catalog_get(string $id): void {
    require_auth();
    $row = db()->prepare("SELECT * FROM catalog WHERE id=?");
    $row->execute([$id]);
    $row = $row->fetch();
    if (!$row) { json_out(['error' => 'Not found'], 404); return; }
    json_out($row);
}

function catalog_create(): void {
    require_auth();
    $b   = body();
    $pdo = db();
    if (!trim($b['name'] ?? '')) { json_out(['error' => 'Name required'], 400); return; }
    $stmt = $pdo->prepare("INSERT INTO catalog (name,category,unit,description,cost_price,margin,unit_price)
                           VALUES (?,?,?,?,?,?,?)");
    $stmt->execute([
        trim($b['name']), $b['category'] ?? '', $b['unit'] ?? '',
        $b['description'] ?? '', $b['cost_price'] ?? 0,
        $b['margin'] ?? 0, $b['unit_price'] ?? 0,
    ]);
    json_out(['success' => true, 'id' => $pdo->lastInsertId()]);
}

function catalog_update(string $id): void {
    require_auth();
    $b   = body();
    $pdo = db();
    $pdo->prepare("UPDATE catalog SET name=?,category=?,unit=?,description=?,
                   cost_price=?,margin=?,unit_price=? WHERE id=?")
        ->execute([
            trim($b['name'] ?? ''), $b['category'] ?? '', $b['unit'] ?? '',
            $b['description'] ?? '', $b['cost_price'] ?? 0,
            $b['margin'] ?? 0, $b['unit_price'] ?? 0, $id,
        ]);
    json_out(['success' => true]);
}

function catalog_delete(string $id): void {
    require_auth();
    db()->prepare("DELETE FROM catalog WHERE id=?")->execute([$id]);
    json_out(['success' => true]);
}


//  CLIENTS
function clients_list(): void {
    require_auth();
    $rows = db()->query("SELECT * FROM clients ORDER BY name")->fetchAll();
    json_out($rows);
}

function clients_get(string $id): void {
    require_auth();
    $stmt = db()->prepare("SELECT * FROM clients WHERE id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { json_out(['error' => 'Not found'], 404); return; }
    json_out($row);
}

function clients_create(): void {
    require_auth();
    $b   = body();
    $pdo = db();
    if (!trim($b['name'] ?? '')) { json_out(['error' => 'Name required'], 400); return; }
    $stmt = $pdo->prepare("INSERT INTO clients (name,email,phone,contact_person,location,address)
                           VALUES (?,?,?,?,?,?)");
    $stmt->execute([
        trim($b['name']), $b['email'] ?? '', $b['phone'] ?? '',
        $b['contact_person'] ?? '', $b['location'] ?? '', $b['address'] ?? '',
    ]);
    json_out(['success' => true, 'id' => $pdo->lastInsertId()]);
}

function clients_update(string $id): void {
    require_auth();
    $b   = body();
    db()->prepare("UPDATE clients SET name=?,email=?,phone=?,contact_person=?,location=?,address=? WHERE id=?")
        ->execute([
            trim($b['name'] ?? ''), $b['email'] ?? '', $b['phone'] ?? '',
            $b['contact_person'] ?? '', $b['location'] ?? '', $b['address'] ?? '', $id,
        ]);
    json_out(['success' => true]);
}

function clients_delete(string $id): void {
    require_auth();
    db()->prepare("DELETE FROM clients WHERE id=?")->execute([$id]);
    json_out(['success' => true]);
}


//  QUOTES
function quotes_list(): void {
    require_auth();
    $rows = db()->query("SELECT * FROM quotes ORDER BY id DESC")->fetchAll();
    json_out($rows);
}

function quotes_get(string $id): void {
    require_auth();
    $pdo  = db();
    $quote = $pdo->prepare("SELECT * FROM quotes WHERE id=?");
    $quote->execute([$id]);
    $quote = $quote->fetch();
    if (!$quote) { json_out(['error' => 'Not found'], 404); return; }
    $items = $pdo->prepare("SELECT * FROM quote_items WHERE quote_id=? ORDER BY sort_order");
    $items->execute([$id]);
    $quote['items'] = $items->fetchAll();
    json_out($quote);
}

function quotes_create(): void {
    $authUser = require_auth();
    $b   = body();
    $pdo = db();
    $number = next_quote_number();
    $stmt = $pdo->prepare("INSERT INTO quotes
        (number,client_id,client_name,contact_person,venue,no_of_guests,
         quote_date,valid_until,status,subtotal,vat_rate,vat_amount,total,notes,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
        $number,
        $b['client_id']      ?? null,
        $b['client_name']    ?? '',
        $b['contact_person'] ?? '',
        $b['venue']          ?? '',
        $b['no_of_guests']   ?? '',
        $b['quote_date']     ?? date('Y-m-d'),
        $b['valid_until']    ?? '',
        $b['status']         ?? 'pending',
        $b['subtotal']       ?? 0,
        $b['vat_rate']       ?? 16,
        $b['vat_amount']     ?? 0,
        $b['total']          ?? 0,
        $b['notes']          ?? '',
        $authUser['name']    ?? '',
    ]);
    $quoteId = $pdo->lastInsertId();

    // Save line items
    $itemStmt = $pdo->prepare("INSERT INTO quote_items
        (quote_id,type,section,subsection,name,qty,unit_price,price,sort_order)
        VALUES (?,?,?,?,?,?,?,?,?)");
    foreach (($b['items'] ?? []) as $i => $item) {
        if (isset($item['section'])) {
            $itemStmt->execute([$quoteId,'section',$item['section'],null,null,0,0,0,$i]);
        } elseif (isset($item['subsection'])) {
            $itemStmt->execute([$quoteId,'subsection',null,$item['subsection'],null,0,0,0,$i]);
        } else {
            $itemStmt->execute([
                $quoteId, 'item', null, null,
                $item['name']       ?? '',
                $item['qty']        ?? 0,
                $item['unit_price'] ?? 0,
                $item['price']      ?? 0,
                $i,
            ]);
        }
    }
    json_out(['success' => true, 'id' => $quoteId, 'number' => $number]);
}

function quotes_update(string $id): void {
    require_auth();
    $b   = body();
    $pdo = db();
    $pdo->prepare("UPDATE quotes SET
        client_id=?,client_name=?,contact_person=?,venue=?,no_of_guests=?,
        quote_date=?,valid_until=?,status=?,subtotal=?,vat_rate=?,vat_amount=?,total=?,notes=?
        WHERE id=?")
        ->execute([
            $b['client_id']      ?? null,
            $b['client_name']    ?? '',
            $b['contact_person'] ?? '',
            $b['venue']          ?? '',
            $b['no_of_guests']   ?? '',
            $b['quote_date']     ?? date('Y-m-d'),
            $b['valid_until']    ?? '',
            $b['status']         ?? 'pending',
            $b['subtotal']       ?? 0,
            $b['vat_rate']       ?? 16,
            $b['vat_amount']     ?? 0,
            $b['total']          ?? 0,
            $b['notes']          ?? '',
            $id,
        ]);

    // Replace items
    $pdo->prepare("DELETE FROM quote_items WHERE quote_id=?")->execute([$id]);
    $itemStmt = $pdo->prepare("INSERT INTO quote_items
        (quote_id,type,section,subsection,name,qty,unit_price,price,sort_order)
        VALUES (?,?,?,?,?,?,?,?,?)");
    foreach (($b['items'] ?? []) as $i => $item) {
        if (isset($item['section'])) {
            $itemStmt->execute([$id,'section',$item['section'],null,null,0,0,0,$i]);
        } elseif (isset($item['subsection'])) {
            $itemStmt->execute([$id,'subsection',null,$item['subsection'],null,0,0,0,$i]);
        } else {
            $itemStmt->execute([
                $id, 'item', null, null,
                $item['name'] ?? '', $item['qty'] ?? 0,
                $item['unit_price'] ?? 0, $item['price'] ?? 0, $i,
            ]);
        }
    }
    json_out(['success' => true]);
}

function quotes_delete(string $id): void {
    require_auth();
    db()->prepare("DELETE FROM quotes WHERE id=?")->execute([$id]);
    json_out(['success' => true]);
}


//  USERS
function users_list(): void {
    require_admin();
    $rows = db()->query("SELECT id,name,email,role,verified,created_at FROM users ORDER BY id")->fetchAll();
    json_out($rows);
}

function users_create(): void {
    require_admin();
    $b   = body();
    $pdo = db();
    $name  = trim($b['name']  ?? '');
    $email = trim($b['email'] ?? '');
    $pass  = $b['password']   ?? '';
    if (!$name || !$email || !$pass) { json_out(['error' => 'All fields required'], 400); return; }
    if (strlen($pass) < 6) { json_out(['error' => 'Password too short'], 400); return; }
    $exists = $pdo->prepare("SELECT id FROM users WHERE email=?");
    $exists->execute([$email]);
    if ($exists->fetch()) { json_out(['error' => 'Email already exists'], 409); return; }
    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name,email,password,role,verified) VALUES (?,?,?,?,?)");
    $stmt->execute([$name, $email, $hash, $b['role'] ?? 'user', $b['verified'] ?? 0]);
    json_out(['success' => true, 'id' => $pdo->lastInsertId()]);
}

function users_update(string $id): void {
    require_admin();
    $b   = body();
    $pdo = db();
    if (!empty($b['password']) && strlen($b['password']) >= 6) {
        $pdo->prepare("UPDATE users SET name=?,email=?,role=?,verified=?,password=? WHERE id=?")
            ->execute([$b['name']??'',$b['email']??'',$b['role']??'user',$b['verified']??0,
                       password_hash($b['password'], PASSWORD_DEFAULT), $id]);
    } else {
        $pdo->prepare("UPDATE users SET name=?,email=?,role=?,verified=? WHERE id=?")
            ->execute([$b['name']??'',$b['email']??'',$b['role']??'user',$b['verified']??0,$id]);
    }
    json_out(['success' => true]);
}

function users_delete(string $id): void {
    $auth = require_admin();
    if ($auth['id'] == $id) { json_out(['error' => 'Cannot delete yourself'], 400); return; }
    db()->prepare("DELETE FROM users WHERE id=?")->execute([$id]);
    json_out(['success' => true]);
}


//  STATS
function stats_get(): void {
    require_auth();
    $pdo = db();
    $total_quotes  = $pdo->query("SELECT COUNT(*) FROM quotes")->fetchColumn();
    $total_value   = $pdo->query("SELECT COALESCE(SUM(total),0) FROM quotes")->fetchColumn();
    $pending       = $pdo->query("SELECT COUNT(*) FROM quotes WHERE status='pending'")->fetchColumn();
    $accepted      = $pdo->query("SELECT COUNT(*) FROM quotes WHERE status='accepted'")->fetchColumn();
    $clients       = $pdo->query("SELECT COUNT(*) FROM clients")->fetchColumn();
    $catalog_items = $pdo->query("SELECT COUNT(*) FROM catalog")->fetchColumn();
    json_out(compact('total_quotes','total_value','pending','accepted','clients','catalog_items'));
}
