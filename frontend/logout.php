<?php
declare(strict_types=1);
require_once __DIR__ . '/route-frontend.php';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0;url=<?= FRONTEND_BASE_URL ?>/login.php">
    <script>
        try { localStorage.removeItem('gs_token'); } catch (_) {}
        try { localStorage.removeItem('gs_user'); } catch (_) {}
        try { sessionStorage.removeItem('gs_token'); } catch (_) {}
        try { sessionStorage.removeItem('gs_user'); } catch (_) {}
        window.location.href = <?= json_encode(FRONTEND_BASE_URL . '/login.php', JSON_UNESCAPED_SLASHES) ?>;
    </script>
</head>
<body></body>
</html>
