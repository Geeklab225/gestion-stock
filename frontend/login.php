<?php
declare(strict_types=1);
require_once __DIR__ . '/route-frontend.php';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Connexion | LM-Code Gestion Stock</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= FRONTEND_BASE_URL ?>/assets/css/clean.css">
    <link rel="icon" type="image/svg+xml" href="<?= FRONTEND_BASE_URL ?>/assets/img/brand/lm-code-monogram.svg">
</head>
<body class="login-body">
    <main class="login-shell">
        <section class="login-card">
            <img class="login-logo" src="<?= FRONTEND_BASE_URL ?>/assets/img/brand/lm-code-wordmark.svg" alt="LM-Code">
            <p class="eyebrow">LM-Code Gestion Stock</p>
            <h1>Connexion securisee</h1>
            <p class="muted">Accede au dashboard centralise et a toutes les operations stock.</p>

            <form id="loginForm" class="form-grid">
                <label>
                    <span>Email</span>
                    <input type="email" name="email" placeholder="stock@lm-code.be" required>
                </label>
                <label>
                    <span>Mot de passe</span>
                    <input type="password" name="password" placeholder="********" required>
                </label>
                <button type="submit" class="btn btn-primary">Se connecter</button>
                <p id="loginError" class="error-text" aria-live="polite"></p>
            </form>

            <div class="hint-box">
                <strong>Compte seed:</strong> <code>stock@lm-code.be / lm-code123</code>
            </div>
        </section>
        <footer class="login-footer">
            <a href="https://lm-code.be" target="_blank" rel="noopener noreferrer">Visiter LM-Code</a>
            <a href="https://github.com/LM-Code-Be/" target="_blank" rel="noopener noreferrer">GitHub LM-Code</a>
            <a href="https://lm-code.be/contact/" target="_blank" rel="noopener noreferrer">Formulaire de contact</a>
            <a href="https://github.com/LM-Code-Be/gestion-stock" target="_blank" rel="noopener noreferrer">Code source du projet</a>
        </footer>
    </main>

    <script>
        // Parametres injectes pour le module JS de connexion.
        window.APP_CONFIG = {
            apiBaseUrl: <?= json_encode(API_BASE_URL, JSON_UNESCAPED_SLASHES) ?>,
            frontendBaseUrl: <?= json_encode(FRONTEND_BASE_URL, JSON_UNESCAPED_SLASHES) ?>
        };
    </script>
    <script type="module" src="<?= FRONTEND_BASE_URL ?>/assets/js/login.js"></script>
</body>
</html>
