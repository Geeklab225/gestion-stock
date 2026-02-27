<?php
declare(strict_types=1);
require_once __DIR__ . '/route-frontend.php';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tableau de bord | LM-Code Gestion Stock</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="<?= FRONTEND_BASE_URL ?>/assets/css/clean.css">
    <link rel="icon" type="image/svg+xml" href="<?= FRONTEND_BASE_URL ?>/assets/img/brand/lm-code-monogram.svg">
</head>
<body class="app-body">
    <div class="app-layout">
        <aside class="sidebar">
            <div class="brand">
                <img class="brand-mark" src="<?= FRONTEND_BASE_URL ?>/assets/img/brand/lm-code-monogram.svg" alt="LM-Code">
                <div>
                    <img class="brand-wordmark" src="<?= FRONTEND_BASE_URL ?>/assets/img/brand/lm-code-wordmark.svg" alt="LM-CODE">
                    <p>Pilotage des flux et des stocks</p>
                </div>
            </div>

            <nav id="mainNav" class="nav-list">
                <button data-module="dashboard" class="nav-item is-active"><i class="bi bi-grid-1x2-fill"></i><span>Tableau de bord</span></button>

                <p class="nav-section">Referentiels</p>
                <button data-module="products" class="nav-item"><i class="bi bi-box-seam"></i><span>Produits</span></button>
                <button data-module="categories" class="nav-item"><i class="bi bi-diagram-3"></i><span>Categories</span></button>
                <button data-module="brands" class="nav-item"><i class="bi bi-award"></i><span>Marques</span></button>
                <button data-module="units" class="nav-item"><i class="bi bi-rulers"></i><span>Unites</span></button>
                <button data-module="taxes" class="nav-item"><i class="bi bi-percent"></i><span>Taxes</span></button>
                <button data-module="tags" class="nav-item"><i class="bi bi-tags"></i><span>Tags</span></button>
                <button data-module="suppliers" class="nav-item"><i class="bi bi-truck"></i><span>Fournisseurs</span></button>
                <button data-module="customers" class="nav-item"><i class="bi bi-people"></i><span>Clients</span></button>

                <p class="nav-section">Logistique</p>
                <button data-module="warehouses" class="nav-item"><i class="bi bi-building"></i><span>Entrepots</span></button>
                <button data-module="warehouse-zones" class="nav-item"><i class="bi bi-grid-3x3-gap"></i><span>Zones</span></button>
                <button data-module="warehouse-locations" class="nav-item"><i class="bi bi-geo-alt"></i><span>Emplacements</span></button>
                <button data-module="movements" class="nav-item"><i class="bi bi-arrow-left-right"></i><span>Mouvements</span></button>
                <button data-module="inventories" class="nav-item"><i class="bi bi-clipboard-data"></i><span>Inventaires</span></button>
                <button data-module="alerts" class="nav-item"><i class="bi bi-bell"></i><span>Alertes</span></button>

                <p class="nav-section">Achats</p>
                <button data-module="purchase-requests" class="nav-item"><i class="bi bi-file-earmark-text"></i><span>Demandes achat</span></button>
                <button data-module="purchase-orders" class="nav-item"><i class="bi bi-cart-check"></i><span>Commandes achat</span></button>

                <p class="nav-section">Admin</p>
                <button data-module="users" class="nav-item"><i class="bi bi-person-gear"></i><span>Utilisateurs</span></button>
                <button data-module="settings" class="nav-item"><i class="bi bi-sliders2"></i><span>Parametres</span></button>
                <button data-module="imports" class="nav-item"><i class="bi bi-upload"></i><span>Importations CSV</span></button>
                <button data-module="reports" class="nav-item"><i class="bi bi-graph-up-arrow"></i><span>Rapports</span></button>
            </nav>

            <a class="logout-link" href="<?= FRONTEND_BASE_URL ?>/logout.php">Deconnexion</a>
        </aside>

        <main class="workspace">
            <header class="workspace-header">
                <div>
                    <p class="eyebrow">Centre de pilotage LM-Code</p>
                    <h2 id="pageTitle">Tableau de bord</h2>
                </div>
                <div class="header-actions">
                    <input id="globalSearch" class="global-search" type="search" placeholder="Recherche globale produit, SKU, fournisseur...">
                    <div class="user-pill" id="userPill">Chargement...</div>
                </div>
            </header>

            <section id="appContent" class="content-panel"></section>
            <footer class="app-footer">
                <span>LM-Code Gestion Stock - Developpe par Michael (LM-Code)</span>
                <a href="https://lm-code.be" target="_blank" rel="noopener noreferrer">Site LM-Code</a>
                <a href="https://github.com/LM-Code-Be/" target="_blank" rel="noopener noreferrer">GitHub LM-Code</a>
                <a href="https://lm-code.be/contact/" target="_blank" rel="noopener noreferrer">Contact</a>
                <a href="https://github.com/LM-Code-Be/gestion-stock" target="_blank" rel="noopener noreferrer">Code source</a>
            </footer>
        </main>
    </div>

    <script>
        // Parametres injectes pour que le front appelle la bonne API.
        window.APP_CONFIG = {
            apiBaseUrl: <?= json_encode(API_BASE_URL, JSON_UNESCAPED_SLASHES) ?>,
            frontendBaseUrl: <?= json_encode(FRONTEND_BASE_URL, JSON_UNESCAPED_SLASHES) ?>
        };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
    <script type="module" src="<?= FRONTEND_BASE_URL ?>/assets/js/app-clean.js"></script>
</body>
</html>
