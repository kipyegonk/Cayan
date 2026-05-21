<?php
//  DATABASE & APP CONFIGURATION

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'quote_user');
define('DB_PASS', 'password123');
define('DB_NAME', 'quote_system');

// App Configuration
define('APP_NAME', 'QuoteSystem');
define('APP_VERSION', '1.0.0');
define('SECRET_KEY', 'your-secret-key-here-change-this');
define('JWT_SECRET', 'your-jwt-secret-key-here-change-this');

// Security
define('HASH_ALGO', 'bcrypt');
define('SESSION_TIMEOUT', 3600); 

// File Uploads
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'pdf']);

// API Response Headers
if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');

// Create logs directory if not exists
if (!is_dir(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
