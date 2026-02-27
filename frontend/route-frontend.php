<?php
declare(strict_types=1);

// Calcule automatiquement la base URL du front, meme si le projet change de dossier.
$scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/gestion-stock/frontend/index.php');
$frontendMarker = '/frontend';
$markerPos = strpos($scriptName, $frontendMarker);

if ($markerPos !== false) {
    $basePath = substr($scriptName, 0, $markerPos + strlen($frontendMarker));
} else {
    $basePath = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
    if ($basePath === '') {
        $basePath = '/frontend';
    }
}

$projectBase = str_ends_with($basePath, '/frontend')
    ? substr($basePath, 0, -strlen('/frontend'))
    : rtrim($basePath, '/');

$projectBase = rtrim($projectBase, '/');

// L'API publique est exposee uniquement via /backend/public/api/v1.
$apiBasePath = ($projectBase !== '' ? $projectBase : '') . '/backend/public/api/v1';

if (!defined('FRONTEND_BASE_URL')) {
    define('FRONTEND_BASE_URL', $basePath);
}
if (!defined('API_BASE_URL')) {
    define('API_BASE_URL', $apiBasePath);
}
