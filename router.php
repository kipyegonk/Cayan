<?php
// Simple router for PHP built-in server
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . $uri;

// Serve existing files directly
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    return false;
}

// Explicitly serve index.html for root
if ($uri === '/' || $uri === '') {
    echo file_get_contents(__DIR__ . '/index.html');
    return true;
}

// Route API requests to api/index.php
if (strpos($uri, '/api/') === 0 || strpos($uri, '/q/api/') === 0) {
    require __DIR__ . '/api/index.php';
    return true;
}

return false;
