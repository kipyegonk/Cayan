<?php
// AUTHENTICATION CLASS

class Auth {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    // Generate UUID
    public static function generateId() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    // Hash password
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    // Verify password
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    // Generate JWT Token
    public static function generateToken($userId, $email, $role) {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        $payload = [
            'iat' => time(),
            'exp' => time() + (7 * 24 * 60 * 60), // 7 days
            'iss' => 'QuoteSystem',
            'user_id' => $userId,
            'email' => $email,
            'role' => $role
        ];

        $header_encoded = base64_encode(json_encode($header));
        $payload_encoded = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", JWT_SECRET, true);
        $signature_encoded = base64_encode($signature);

        return "$header_encoded.$payload_encoded.$signature_encoded";
    }

    // Verify JWT Token
    public static function verifyToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        list($header_encoded, $payload_encoded, $signature_encoded) = $parts;

        $signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", JWT_SECRET, true);
        $signature_check = base64_encode($signature);

        if ($signature_encoded !== $signature_check) {
            return null;
        }

        $payload = json_decode(base64_decode($payload_encoded), true);

        if ($payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    // Register user
    public function register($name, $email, $password) {
        if (empty($name) || empty($email) || empty($password)) {
            return ['success' => false, 'error' => 'All fields are required'];
        }

        if (strlen($password) < 6) {
            return ['success' => false, 'error' => 'Password must be at least 6 characters'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'error' => 'Invalid email address'];
        }

        $existing = $this->db->getRow("SELECT id FROM users WHERE email = ?", [$email]);
        if ($existing) {
            return ['success' => false, 'error' => 'This email is already registered'];
        }

        $userId = self::generateId();
        $hashedPassword = self::hashPassword($password);

        $result = $this->db->insert('users', [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'password' => $hashedPassword,
            'role' => 'user',
            'verified' => 0
        ]);

        if ($result) {
            return ['success' => true, 'message' => 'Registration successful! An administrator will verify your account'];
        }

        return ['success' => false, 'error' => 'Registration failed'];
    }

    // Login user
    public function login($email, $password) {
        if (empty($email) || empty($password)) {
            return ['success' => false, 'error' => 'Email and password are required'];
        }

        $user = $this->db->getRow("SELECT * FROM users WHERE email = ?", [$email]);

        if (!$user) {
            return ['success' => false, 'error' => 'Invalid email or password'];
        }

        if (!$user['verified']) {
            return ['success' => false, 'error' => 'Your account is pending verification. Please contact the administrator'];
        }

        if (!self::verifyPassword($password, $user['password'])) {
            return ['success' => false, 'error' => 'Invalid email or password'];
        }

        $token = self::generateToken($user['id'], $user['email'], $user['role']);

        return [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ];
    }

    // Get current user from token
    public static function getCurrentUser() {
        $headers = getallheaders();
        $auth_header = $headers['Authorization'] ?? '';

        if (empty($auth_header)) {
            return null;
        }

        if (strpos($auth_header, 'Bearer ') === 0) {
            $token = substr($auth_header, 7);
        } else {
            $token = $auth_header;
        }

        return self::verifyToken($token);
    }

    // Require authentication
    public static function requireAuth() {
        $user = self::getCurrentUser();
        if (!$user) {
            http_response_code(401);
            die(json_encode(['error' => 'Unauthorized']));
        }
        return $user;
    }

    // Require admin role
    public static function requireAdmin() {
        $user = self::requireAuth();
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            die(json_encode(['error' => 'Forbidden. Admin access required']));
        }
        return $user;
    }
}
