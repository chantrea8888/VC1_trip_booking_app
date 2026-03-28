<?php

$defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

$allowedOrigins = array_filter(
    array_map('trim', explode(',', env('FRONTEND_URLS', implode(',', $defaultOrigins))))
);

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,
    // Allow any localhost port during local development.
    'allowed_origins_patterns' => ['#^https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?$#'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
    // Allow local dev on localhost, loopback, and LAN IPs (Vite default port 5173).
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://[::1]:5173'],
    'allowed_origins_patterns' => ['/^http:\\/\\/\\d{1,3}(?:\\.\\d{1,3}){3}:5173$/'],
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'], // Your React app URL
    'allowed_origins_patterns' => [
        '/^http:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$/',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // CHANGE THIS TO true for authentication
];
?>
