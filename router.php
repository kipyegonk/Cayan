<?php
// Router for PHP built-in server: php -S localhost:8000 router.php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve real static files as-is (html, js, css, images etc.)
if ($uri !== '/' && file_exists(__DIR__ . $uri) && !is_dir(__DIR__ . $uri)) {
    return false;
}

// Route ALL /api/* requests to api/index.php
if (preg_match('#^/api(/.*)?$#', $uri, $m)) {
    $pathInfo = $m[1] ?? '/';
    $_SERVER['PATH_INFO']   = $pathInfo;
    $_SERVER['REQUEST_URI'] = $uri . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : '');
    require __DIR__ . '/api/index.php';
    exit;
}

// Everything else → serve index.html
readfile(__DIR__ . '/index.html'); 