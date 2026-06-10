<?php
require_once __DIR__ . '/../bootstrap.php';

$action = segment(1); // auth/login → login

switch ($action) {

    // POST /api/auth/login 
    case 'login':
        if (method() !== 'POST') err('Method not allowed', 405);
        $b = body();
        $email    = trim($b['email'] ?? '');
        $password = $b['password'] ?? '';
        if (!$email || !$password) err('Email and password required');

        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password']))
            err('Invalid email or password', 401);

        if (!$user['verified'])
            err('Account not verified. Please contact admin.', 403);

        // Issue / refresh token
        $token = generateToken();
        $db->prepare("UPDATE users SET token = ? WHERE id = ?")
           ->execute([$token, $user['id']]);

        ok([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ],
        ]);

    // POST /api/auth/register 
    case 'register':
        if (method() !== 'POST') err('Method not allowed', 405);
        $b    = body();
        $name = trim($b['name'] ?? '');
        $email    = trim($b['email'] ?? '');
        $password = $b['password'] ?? '';

        if (!$name || !$email || !$password) err('All fields required');
        if (strlen($password) < 6) err('Password must be at least 6 characters');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) err('Invalid email address');

        $db = getDB();
        $exists = $db->prepare("SELECT id FROM users WHERE email = ?");
        $exists->execute([$email]);
        if ($exists->fetch()) err('Email already registered');

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $db->prepare("INSERT INTO users (name, email, password, role, verified) VALUES (?, ?, ?, 'user', 0)")
           ->execute([$name, $email, $hash]);

        ok(['success' => true, 'message' => 'Registration submitted. Await admin approval.']);

    // GET /api/auth/verify 
    case 'verify':
        if (method() !== 'GET') err('Method not allowed', 405);
        $user = requireAuth();
        ok([
            'valid' => true,
            'user'  => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ],
        ]);

    default:
        err('Not found', 404);
}
