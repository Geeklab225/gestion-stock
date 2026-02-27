import { apiRequest, clearAuth, getToken, uploadRequest } from './http-client.js';

const state = {
    user: null,
    lookups: null,
    module: 'dashboard',
    globalQuery: '',
    activeProductId: null,
};

const dashboardCharts = {
    movementTrend: null,
    outgoing: null,
};

const moduleTitles = {
    dashboard: 'Tableau de bord',
    products: 'Produits',
    categories: 'Categories',
    brands: 'Marques',
    units: 'Unites',
    taxes: 'Taxes',
    tags: 'Tags',
    suppliers: 'Fournisseurs',
    customers: 'Clients',
    warehouses: 'Entrepots',
    'warehouse-zones': 'Zones',
    'warehouse-locations': 'Emplacements',
    users: 'Utilisateurs',
    movements: 'Mouvements',
    inventories: 'Inventaires',
    alerts: 'Alertes',
    'purchase-requests': 'Demandes achat',
    'purchase-orders': 'Commandes achat',
    settings: 'Parametres',
    imports: 'Importations CSV',
    reports: 'Rapports',
};

const crudModules = {
    categories: {
        endpoint: '/categories',
        label: 'categorie',
        fields: [
            { key: 'parent_id', label: 'Categorie parent', type: 'select', optionsFrom: 'categories', optionLabel: 'name' },
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'default_min_stock', label: 'Seuil mini defaut', type: 'number' },
            { key: 'default_max_stock', label: 'Seuil maxi defaut', type: 'number' },
            { key: 'default_tax_id', label: 'Taxe defaut', type: 'select', optionsFrom: 'taxes', optionLabel: 'name' },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nom' },
            { key: 'parent_id', label: 'Parent' },
            { key: 'default_min_stock', label: 'Min' },
            { key: 'default_max_stock', label: 'Max' },
            { key: 'updated_at', label: 'Maj' },
        ],
    },
    brands: {
        endpoint: '/brands',
        label: 'marque',
        fields: [
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nom' },
            { key: 'description', label: 'Description' },
        ],
    },
    units: {
        endpoint: '/units',
        label: 'unite',
        fields: [
            { key: 'code', label: 'Code', type: 'text', required: true },
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'symbol', label: 'Symbole', type: 'text' },
            { key: 'base_unit', label: 'Unite base', type: 'text' },
            { key: 'conversion_factor', label: 'Conversion', type: 'number', step: '0.000001' },
            { key: 'is_active', label: 'Actif', type: 'select', options: [
                { value: '1', label: 'Oui' },
                { value: '0', label: 'Non' },
            ] },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Nom' },
            { key: 'symbol', label: 'Symbole' },
            { key: 'conversion_factor', label: 'Conversion' },
        ],
    },
    taxes: {
        endpoint: '/taxes',
        label: 'taxe',
        fields: [
            { key: 'code', label: 'Code', type: 'text', required: true },
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'rate', label: 'Taux', type: 'number', step: '0.001', required: true },
            { key: 'is_default', label: 'Par defaut', type: 'select', options: [
                { value: '1', label: 'Oui' },
                { value: '0', label: 'Non' },
            ] },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Nom' },
            { key: 'rate', label: 'Taux' },
            { key: 'is_default', label: 'Defaut', format: (v) => (Number(v) === 1 ? 'Oui' : 'Non') },
        ],
    },
    tags: {
        endpoint: '/tags',
        label: 'tag',
        fields: [
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'color', label: 'Couleur', type: 'text' },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nom' },
            { key: 'color', label: 'Couleur' },
        ],
    },
    suppliers: {
        endpoint: '/suppliers',
        label: 'fournisseur',
        fields: [
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'contact_name', label: 'Contact', type: 'text' },
            { key: 'phone', label: 'Telephone', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'address', label: 'Adresse', type: 'textarea' },
            { key: 'lead_time_days', label: 'Delai jours', type: 'number' },
            { key: 'payment_terms', label: 'Conditions', type: 'text' },
            { key: 'website', label: 'Site web', type: 'text' },
            { key: 'status', label: 'Statut', type: 'select', options: [
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
            ] },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nom' },
            { key: 'contact_name', label: 'Contact' },
            { key: 'phone', label: 'Telephone' },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Statut' },
        ],
    },
    products: {
        endpoint: '/products',
        label: 'produit',
        fields: [
            { key: 'sku', label: 'SKU', type: 'text', required: true },
            { key: 'barcode', label: 'Code barre', type: 'text' },
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'category_id', label: 'Categorie', type: 'select', optionsFrom: 'categories', optionLabel: 'name', required: true },
            { key: 'supplier_id', label: 'Fournisseur', type: 'select', optionsFrom: 'suppliers', optionLabel: 'name' },
            { key: 'unit_id', label: 'Unite', type: 'select', optionsFrom: 'units', optionLabel: 'code' },
            { key: 'brand_id', label: 'Marque', type: 'select', optionsFrom: 'brands', optionLabel: 'name' },
            { key: 'tax_id', label: 'Taxe', type: 'select', optionsFrom: 'taxes', optionLabel: 'name' },
            { key: 'pack_size', label: 'Conditionnement', type: 'text' },
            { key: 'weight_kg', label: 'Poids kg', type: 'number', step: '0.001' },
            { key: 'width_cm', label: 'Largeur cm', type: 'number', step: '0.01' },
            { key: 'height_cm', label: 'Hauteur cm', type: 'number', step: '0.01' },
            { key: 'depth_cm', label: 'Profondeur cm', type: 'number', step: '0.01' },
            { key: 'unit_price', label: 'Prix vente', type: 'number', step: '0.01' },
            { key: 'cost_price', label: 'Prix achat', type: 'number', step: '0.01' },
            { key: 'reorder_level', label: 'Seuil alerte', type: 'number' },
            { key: 'min_stock', label: 'Stock mini', type: 'number' },
            { key: 'max_stock', label: 'Stock maxi', type: 'number' },
            { key: 'safety_stock', label: 'Stock securite', type: 'number' },
            { key: 'valuation_method', label: 'Valorisation', type: 'select', options: [
                { value: 'CUMP', label: 'CUMP' },
                { value: 'FIFO', label: 'FIFO' },
            ] },
            { key: 'status', label: 'Statut', type: 'select', options: [
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
            ] },
            { key: 'is_active', label: 'Actif', type: 'select', options: [
                { value: '1', label: 'Oui' },
                { value: '0', label: 'Non' },
            ] },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'sku', label: 'SKU' },
            { key: 'barcode', label: 'Code barre' },
            { key: 'name', label: 'Nom' },
            { key: 'category_name', label: 'Categorie' },
            { key: 'brand_name', label: 'Marque' },
            { key: 'unit_code', label: 'Unite' },
            { key: 'supplier_name', label: 'Fournisseur' },
            { key: 'stock_total', label: 'Stock' },
            { key: 'unit_price', label: 'Prix', format: (value) => formatMoney(value) },
            { key: 'valuation_method', label: 'Valorisation' },
        ],
    },
    customers: {
        endpoint: '/customers',
        label: 'client',
        fields: [
            { key: 'code', label: 'Code', type: 'text' },
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Telephone', type: 'text' },
            { key: 'address', label: 'Adresse', type: 'textarea' },
            { key: 'status', label: 'Statut', type: 'select', options: [
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
            ] },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Nom' },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Statut' },
        ],
    },
    warehouses: {
        endpoint: '/warehouses',
        label: 'entrepot',
        fields: [
            { key: 'code', label: 'Code', type: 'text', required: true },
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'location', label: 'Localisation', type: 'text' },
            { key: 'is_default', label: 'Par defaut', type: 'select', options: [
                { value: '1', label: 'Oui' },
                { value: '0', label: 'Non' },
            ] },
            { key: 'status', label: 'Statut', type: 'select', options: [
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
            ] },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Nom' },
            { key: 'location', label: 'Localisation' },
            { key: 'status', label: 'Statut' },
        ],
    },
    'warehouse-zones': {
        endpoint: '/warehouse-zones',
        label: 'zone',
        fields: [
            { key: 'warehouse_id', label: 'Entrepot', type: 'select', optionsFrom: 'warehouses', optionLabel: 'name', required: true },
            { key: 'code', label: 'Code', type: 'text', required: true },
            { key: 'name', label: 'Nom', type: 'text', required: true },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'warehouse_id', label: 'Entrepot' },
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Nom' },
        ],
    },
    'warehouse-locations': {
        endpoint: '/warehouse-locations',
        label: 'emplacement',
        fields: [
            { key: 'warehouse_id', label: 'Entrepot', type: 'select', optionsFrom: 'warehouses', optionLabel: 'name', required: true },
            { key: 'zone_id', label: 'Zone', type: 'select', optionsFrom: 'warehouse_zones', optionLabel: 'name' },
            { key: 'code', label: 'Code', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'text' },
            { key: 'capacity', label: 'Capacite', type: 'number', step: '0.01' },
            { key: 'is_active', label: 'Actif', type: 'select', options: [
                { value: '1', label: 'Oui' },
                { value: '0', label: 'Non' },
            ] },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'warehouse_id', label: 'Entrepot' },
            { key: 'zone_id', label: 'Zone' },
            { key: 'code', label: 'Code' },
            { key: 'capacity', label: 'Capacite' },
        ],
    },
    users: {
        endpoint: '/users',
        label: 'utilisateur',
        fields: [
            { key: 'full_name', label: 'Nom complet', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'password', label: 'Mot de passe', type: 'password', requiredOnCreate: true },
            { key: 'role', label: 'Profil', type: 'select', optionsFrom: 'roles', optionValue: 'code', optionLabel: 'code', required: true },
            { key: 'is_active', label: 'Actif', type: 'select', options: [
                { value: '1', label: 'Oui' },
                { value: '0', label: 'Non' },
            ] },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'full_name', label: 'Nom' },
            { key: 'email', label: 'Email' },
            { key: 'role_code', label: 'Profil' },
            { key: 'is_active', label: 'Actif', format: (v) => (Number(v) === 1 ? 'Oui' : 'Non') },
            { key: 'created_at', label: 'Creation' },
        ],
    },
    settings: {
        endpoint: '/settings',
        label: 'parametre',
        fields: [
            { key: 'setting_key', label: 'Cle', type: 'text', required: true },
            { key: 'setting_value', label: 'Valeur', type: 'textarea', required: true },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'setting_key', label: 'Cle' },
            { key: 'setting_value', label: 'Valeur' },
            { key: 'updated_at', label: 'Maj' },
        ],
    },
};

boot().catch((error) => {
    console.error(error);
    const root = document.getElementById('appContent');
    if (root) {
        root.innerHTML = `
            <section class="panel">
                <h4>Erreur de chargement</h4>
                <p class="muted">Le dashboard n'a pas pu etre charge. Verifie l'API et la base de donnees, puis recharge la page.</p>
                <p class="feedback is-error">${sanitize(error?.message ?? 'Erreur inconnue')}</p>
                <div class="panel-actions">
                    <button class="btn btn-primary" id="retryBoot">Recharger</button>
                    <button class="btn btn-soft" id="forceLogout">Se reconnecter</button>
                </div>
            </section>
        `;

        document.getElementById('retryBoot')?.addEventListener('click', () => {
            window.location.reload();
        });
        document.getElementById('forceLogout')?.addEventListener('click', () => {
            clearAuth();
            window.location.replace(`${window.APP_CONFIG.frontendBaseUrl}/login.php`);
        });
        return;
    }

    clearAuth();
    window.location.replace(`${window.APP_CONFIG.frontendBaseUrl}/login.php`);
});

async function boot() {
    if (!getToken()) {
        window.location.replace(`${window.APP_CONFIG.frontendBaseUrl}/login.php`);
        return;
    }

    const [meResponse, lookupResponse] = await Promise.all([
        apiRequest('/auth/me'),
        apiRequest('/lookups/options'),
    ]);

    state.user = meResponse.data;
    state.lookups = lookupResponse.data;

    const userPill = document.getElementById('userPill');
    userPill.textContent = `${state.user.full_name} | ${state.user.role}`;

    setupNavigation();
    applyNavAccess();
    setupGlobalSearch();
    const params = new URLSearchParams(window.location.search);
    const requestedModule = params.get('module') ?? 'dashboard';
    const initialModule = normalizeModule(requestedModule);
    setActiveNav(initialModule);
    await renderModule(initialModule, false);
}

function applyNavAccess() {
    const isAdmin = canWrite('users');
    if (isAdmin) {
        return;
    }

    const hiddenModules = ['users', 'settings', 'imports'];
    hiddenModules.forEach((module) => {
        const btn = document.querySelector(`[data-module="${module}"]`);
        btn?.remove();
    });
}

function setupNavigation() {
    const nav = document.getElementById('mainNav');
    nav?.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-module]');
        if (!button) {
            return;
        }

        const module = button.getAttribute('data-module');
        if (!module || module === state.module) {
            return;
        }

        setActiveNav(module);
        await renderModule(module);
    });
}

function setupGlobalSearch() {
    const input = document.getElementById('globalSearch');
    input?.addEventListener('keydown', async (event) => {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        state.globalQuery = String(input.value ?? '').trim();
        setActiveNav('products');
        await renderModule('products');
    });
}

function canWrite(module) {
    const role = String(state.user?.role ?? '').toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        return true;
    }

    const matrix = {
        BUYER: ['suppliers', 'customers', 'purchase-requests', 'purchase-orders'],
        STOREKEEPER: ['movements', 'inventories', 'alerts'],
        MANAGER: ['movements', 'inventories', 'alerts', 'purchase-requests', 'purchase-orders', 'suppliers'],
    };

    return Boolean(matrix[role]?.includes(module));
}

function setActiveNav(module) {
    const nav = document.getElementById('mainNav');
    if (!nav) {
        return;
    }

    for (const item of nav.querySelectorAll('.nav-item')) {
        item.classList.remove('is-active');
    }

    const target = nav.querySelector(`[data-module="${module}"]`);
    if (target) {
        target.classList.add('is-active');
    }
}

function normalizeModule(module) {
    if (moduleTitles[module]) {
        return module;
    }

    return 'dashboard';
}

function syncUrlModule(module) {
    const url = new URL(window.location.href);
    url.searchParams.set('module', module);
    window.history.replaceState({}, '', url);
}

async function renderModule(module, updateUrl = true) {
    // On normalise toujours le module pour eviter les routes UI invalides.
    const normalized = normalizeModule(module);
    state.module = normalized;

    if (updateUrl) {
        syncUrlModule(normalized);
    }

    document.getElementById('pageTitle').textContent = moduleTitles[normalized] ?? normalized;

    if (normalized === 'dashboard') {
        await renderDashboard();
        return;
    }

    if (normalized === 'movements') {
        await renderMovements();
        return;
    }

    if (normalized === 'inventories') {
        await renderInventories();
        return;
    }

    if (normalized === 'alerts') {
        await renderAlerts();
        return;
    }

    if (normalized === 'purchase-requests') {
        await renderPurchaseRequests();
        return;
    }

    if (normalized === 'purchase-orders') {
        await renderPurchaseOrders();
        return;
    }

    if (normalized === 'reports') {
        await renderReports();
        return;
    }

    if (normalized === 'imports') {
        await renderImports();
        return;
    }

    if (crudModules[normalized]) {
        await renderCrud(normalized);
    }
}

async function renderDashboard() {
    // Vue d'ensemble: KPIs + graphiques + dernieres activites.
    const root = document.getElementById('appContent');
    const response = await apiRequest('/dashboard/stats');
    const data = response.data;

    const kpis = [
        { label: 'Valeur stock', value: formatMoney(data.totals.stock_value), icon: 'bi-cash-stack', theme: 'kpi-teal' },
        { label: 'Produits', value: data.totals.products, icon: 'bi-box-seam', theme: 'kpi-blue' },
        { label: 'Ruptures', value: data.totals.out_of_stock, icon: 'bi-exclamation-triangle', theme: 'kpi-red' },
        { label: 'Stock bas', value: data.totals.low_stock, icon: 'bi-thermometer-half', theme: 'kpi-orange' },
        { label: 'PO en retard', value: data.totals.delayed_po, icon: 'bi-clock-history', theme: 'kpi-violet' },
        { label: 'PO ouvertes', value: data.totals.purchase_orders_pending, icon: 'bi-cart-check', theme: 'kpi-cyan' },
        { label: 'Demandes achat', value: data.totals.purchase_requests_open, icon: 'bi-file-earmark-text', theme: 'kpi-slate' },
        { label: 'Entrepots', value: data.totals.warehouses, icon: 'bi-building', theme: 'kpi-gold' },
    ];

    root.innerHTML = `
        <div class="kpi-grid">
            ${kpis.map((item) => `
                <article class="kpi-card ${item.theme}">
                    <div class="kpi-head"><strong>${item.label}</strong><i class="bi ${item.icon}"></i></div>
                    <p class="kpi-value">${sanitize(item.value)}</p>
                    <p class="kpi-label">Mise a jour temps reel</p>
                </article>
            `).join('')}
        </div>

        <div class="chart-grid">
            <section class="panel">
                <h4>Tendance des mouvements</h4>
                <p class="dashboard-subtitle">Volumes de mouvements recents</p>
                <div class="chart-canvas-wrap"><canvas id="movementTrendChart"></canvas></div>
            </section>
            <section class="panel">
                <h4>Top sorties</h4>
                <p class="dashboard-subtitle">Produits les plus sortants</p>
                <div class="chart-canvas-wrap"><canvas id="topOutgoingChart"></canvas></div>
            </section>
        </div>

        <div class="panel-grid">
            <section class="panel">
                <h4>Derniers mouvements</h4>
                ${renderSimpleTable(data.recent_movements, [
                    ['created_at', 'Date'],
                    ['type', 'Type'],
                    ['sku', 'SKU'],
                    ['product_name', 'Produit'],
                    ['quantity', 'Quantite'],
                    ['warehouse_code', 'Source'],
                    ['destination_warehouse_code', 'Destination'],
                ])}
            </section>

            <section class="panel">
                <h4>Top sorties/transferts</h4>
                ${renderSimpleTable(data.top_outgoing, [
                    ['sku', 'SKU'],
                    ['name', 'Produit'], 
                    ['qty_out', 'Quantite'],
                ])}
            </section>
        </div>
    `;

    renderDashboardCharts(data);
}

function renderDashboardCharts(data) {
    // Si Chart.js n'est pas charge, on garde une page stable sans casser l'UI.
    if (typeof window.Chart === 'undefined') {
        return;
    }

    destroyDashboardCharts();

    const recent = Array.isArray(data.recent_movements) ? [...data.recent_movements].reverse() : [];
    const labels = recent.map((row) => String(row.created_at ?? '').slice(0, 16).replace('T', ' '));
    const quantities = recent.map((row) => Math.abs(Number(row.quantity ?? 0)));

    const trendCanvas = document.getElementById('movementTrendChart');
    if (trendCanvas) {
        dashboardCharts.movementTrend = new window.Chart(trendCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Quantite',
                    data: quantities,
                    borderColor: '#0f8f74',
                    backgroundColor: 'rgba(15, 143, 116, 0.16)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 3,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(16,34,45,0.08)' } },
                    y: { beginAtZero: true, grid: { color: 'rgba(16,34,45,0.08)' } },
                },
            },
        });
    }

    const top = Array.isArray(data.top_outgoing) ? data.top_outgoing.slice(0, 8) : [];
    const outCanvas = document.getElementById('topOutgoingChart');
    if (outCanvas) {
        dashboardCharts.outgoing = new window.Chart(outCanvas, {
            type: 'bar',
            data: {
                labels: top.map((row) => row.sku ?? '-'),
                datasets: [{
                    label: 'Sorties',
                    data: top.map((row) => Number(row.qty_out ?? 0)),
                    backgroundColor: ['#186bb2', '#0ea88a', '#f78c35', '#6a59e6', '#df4d5c', '#1f9fb0', '#cc9b24', '#374b60'],
                    borderRadius: 8,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, grid: { color: 'rgba(16,34,45,0.08)' } },
                },
            },
        });
    }
}

function destroyDashboardCharts() {
    if (dashboardCharts.movementTrend) {
        dashboardCharts.movementTrend.destroy();
        dashboardCharts.movementTrend = null;
    }
    if (dashboardCharts.outgoing) {
        dashboardCharts.outgoing.destroy();
        dashboardCharts.outgoing = null;
    }
}

async function renderCrud(module) {
    // Ecran standard CRUD pour tous les referentiels.
    const config = crudModules[module];
    const root = document.getElementById('appContent');
    const writable = canWrite(module);

    const query = {};
    if (module === 'products' && state.globalQuery !== '') {
        query.q = state.globalQuery;
    }
    const response = await apiRequest(config.endpoint + toQueryString(query));
    const rows = normalizeRows(response);

    root.innerHTML = `
        <section class="panel">
            <div class="panel-head">
                <h4>Gestion ${config.label}</h4>
                <div class="panel-actions">
                    ${module === 'products' ? '<button class="btn btn-soft" id="clearProductSearch">Effacer filtre</button>' : ''}
                    ${writable ? '<button class="btn btn-primary" id="createBtn">Nouveau</button>' : ''}
                </div>
            </div>

            <form id="crudForm" class="form-grid hidden"></form>
            <div id="crudFeedback" class="feedback"></div>

            ${renderCrudTable(config, rows, writable, module)}
        </section>
        ${module === 'products' ? '<section class="panel" id="productDetailPane"><h4>Fiche produit</h4><p class="muted">Selectionne un produit pour afficher sa fiche detaillee.</p></section>' : ''}
    `;

    const form = document.getElementById('crudForm');
    const feedback = document.getElementById('crudFeedback');
    let editId = null;

    if (module === 'products') {
        document.getElementById('clearProductSearch')?.addEventListener('click', async () => {
            state.globalQuery = '';
            const input = document.getElementById('globalSearch');
            if (input) {
                input.value = '';
            }
            await renderCrud('products');
        });
    }

    if (writable) {
        const createBtn = document.getElementById('createBtn');

        createBtn?.addEventListener('click', () => {
            editId = null;
            feedback.textContent = '';
            form.classList.remove('hidden');
            form.innerHTML = buildFormFields(config.fields, null, false) + formActions();
        });

        root.addEventListener('click', async (event) => {
            const editBtn = event.target.closest('[data-action="edit"]');
            const viewBtn = event.target.closest('[data-action="view"]');
            if (viewBtn) {
                const id = Number(viewBtn.dataset.id);
                state.activeProductId = id;
                await renderProductDetail(id);
                return;
            }

            if (editBtn) {
                const id = Number(editBtn.dataset.id);
                const itemResponse = await apiRequest(`${config.endpoint}/${id}`);
                const item = itemResponse.data;

                editId = id;
                feedback.textContent = '';
                form.classList.remove('hidden');
                form.innerHTML = buildFormFields(config.fields, item, true) + formActions();
                return;
            }

            const deleteBtn = event.target.closest('[data-action="delete"]');
            if (deleteBtn) {
                const id = Number(deleteBtn.dataset.id);
                if (!window.confirm('Confirmer la suppression ?')) {
                    return;
                }

                await apiRequest(`${config.endpoint}/${id}`, { method: 'DELETE' });
                await refreshLookups();
                await renderCrud(module);
            }
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const payload = collectFormPayload(config.fields, form, editId !== null);
            if (module === 'users' && editId !== null && !payload.password) {
                delete payload.password;
            }

            const path = editId === null ? config.endpoint : `${config.endpoint}/${editId}`;
            const method = editId === null ? 'POST' : 'PUT';

            try {
                await apiRequest(path, { method, body: payload });
                await refreshLookups();
                await renderCrud(module);
            } catch (error) {
                feedback.textContent = error.message;
                feedback.classList.add('is-error');
            }
        });

        form.addEventListener('click', (event) => {
            const cancelBtn = event.target.closest('[data-action="cancel"]');
            if (!cancelBtn) {
                return;
            }

            form.classList.add('hidden');
            form.innerHTML = '';
            editId = null;
        });
    }

    if (module === 'products' && state.activeProductId) {
        await renderProductDetail(state.activeProductId);
    }
}

async function renderMovements() {
    // Journal des mouvements + creation rapide.
    const root = document.getElementById('appContent');

    const [listResponse] = await Promise.all([
        apiRequest('/stock/movements'),
        refreshLookups(),
    ]);

    const rows = normalizeRows(listResponse);
    const writable = canWrite('movements');

    root.innerHTML = `
        <section class="panel">
            <div class="panel-head">
                <h4>Nouveau mouvement de stock</h4>
            </div>
            ${writable ? `
            <form id="movementForm" class="form-grid">
                ${selectField('product_id', 'Produit', state.lookups.products, 'id', 'name', true)}
                ${selectField('warehouse_id', 'Entrepot source', state.lookups.warehouses, 'id', 'name', true)}
                ${selectField('destination_warehouse_id', 'Entrepot destination', state.lookups.warehouses, 'id', 'name', false)}
                <label><span>Type</span><select name="type" required>
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                    <option value="TRANSFER">TRANSFER</option>
                </select></label>
                <label><span>Quantite</span><input type="number" name="quantity" min="1" required></label>
                <label><span>Code motif</span><input type="text" name="reason_code"></label>
                <label class="full"><span>Note</span><textarea name="notes"></textarea></label>
                <button type="submit" class="btn btn-primary">Enregistrer mouvement</button>
                <p id="movementFeedback" class="feedback"></p>
            </form>
            ` : '<p class="muted">Acces en lecture seule sur ce module.</p>'}
        </section>

        <section class="panel">
            <h4>Historique mouvements</h4>
            ${renderSimpleTable(rows, [
                ['created_at', 'Date'],
                ['type', 'Type'],
                ['product_name', 'Produit'],
                ['quantity', 'Quantite'],
                ['balance_after', 'Stock apres'],
                ['warehouse_name', 'Source'],
                ['destination_warehouse_name', 'Destination'],
                ['reason_code', 'Motif'],
                ['moved_by_name', 'Operateur'],
            ])}
        </section>
    `;

    const form = document.getElementById('movementForm');
    const feedback = document.getElementById('movementFeedback');

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedback.textContent = '';

        const data = new FormData(form);
        const payload = {
            product_id: Number(data.get('product_id')),
            warehouse_id: Number(data.get('warehouse_id')),
            destination_warehouse_id: data.get('destination_warehouse_id') ? Number(data.get('destination_warehouse_id')) : null,
            type: String(data.get('type')),
            quantity: Number(data.get('quantity')),
            reason_code: String(data.get('reason_code') ?? ''),
            notes: String(data.get('notes') ?? ''),
        };

        try {
            await apiRequest('/stock/movements', { method: 'POST', body: payload });
            await renderMovements();
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });
}

async function renderAlerts() {
    // Alertes calculees + alertes persistantes.
    const root = document.getElementById('appContent');
    const [computed, persistentResponse] = await Promise.all([
        apiRequest('/stock/alerts'),
        apiRequest('/alerts'),
    ]);
    const persistentRows = normalizeRows(persistentResponse);

    root.innerHTML = `
        <section class="panel">
            <h4>Stock bas / rupture</h4>
            ${renderSimpleTable(computed.data.low_stock ?? [], [
                ['sku', 'SKU'],
                ['name', 'Produit'],
                ['stock_total', 'Stock'],
                ['min_stock', 'Min'],
                ['reorder_level', 'Seuil'],
            ])}
        </section>
        <section class="panel">
            <h4>PO en retard</h4>
            ${renderSimpleTable(computed.data.delayed_po ?? [], [
                ['order_number', 'PO'],
                ['supplier_name', 'Fournisseur'],
                ['expected_at', 'Date attendue'],
            ])}
        </section>
        <section class="panel">
            <h4>Alertes persistantes</h4>
            ${renderSimpleTable(persistentRows, [
                ['id', 'ID'],
                ['alert_type', 'Type'],
                ['severity', 'Severite'],
                ['message', 'Message'],
                ['status', 'Statut'],
                ['created_at', 'Date'],
            ])}
        </section>
    `;
}

async function renderInventories() {
    // Sessions inventaire + saisie comptage + finalisation.
    const root = document.getElementById('appContent');
    await refreshLookups();

    const sessionsResponse = await apiRequest('/inventories');
    const sessions = normalizeRows(sessionsResponse);
    const writable = canWrite('inventories');

    root.innerHTML = `
        <section class="panel">
            <div class="panel-head"><h4>Session inventaire</h4></div>
            ${writable ? `
            <form id="inventorySessionForm" class="form-grid">
                ${selectField('warehouse_id', 'Entrepot', state.lookups.warehouses, 'id', 'name', true)}
                <label><span>Mode</span><select name="counting_mode"><option value="GLOBAL">GLOBAL</option><option value="CYCLE">CYCLE</option></select></label>
                <label class="full"><span>Notes</span><textarea name="notes"></textarea></label>
                <button type="submit" class="btn btn-primary">Creer une session</button>
                <p id="inventorySessionFeedback" class="feedback"></p>
            </form>
            <hr>
            <form id="inventoryCountForm" class="form-grid">
                ${selectField('session_id', 'Session', sessions, 'id', 'code', true)}
                ${selectField('product_id', 'Produit', state.lookups.products, 'id', 'name', true)}
                <label><span>Quantite comptee</span><input type="number" name="counted_qty" min="0" required></label>
                ${selectField('location_id', 'Emplacement', state.lookups.warehouse_locations, 'id', 'code', false)}
                <label class="full"><span>Notes</span><textarea name="notes"></textarea></label>
                <button type="submit" class="btn btn-primary">Ajouter comptage</button>
                <button type="button" id="inventoryFinalizeBtn" class="btn btn-soft">Finaliser session</button>
                <p id="inventoryCountFeedback" class="feedback"></p>
            </form>` : '<p class="muted">Acces en lecture seule sur ce module.</p>'}
        </section>
        <section class="panel">
            <h4>Sessions</h4>
            ${renderSimpleTable(sessions, [
                ['id', 'ID'],
                ['code', 'Code'],
                ['warehouse_name', 'Entrepot'],
                ['status', 'Statut'],
                ['counting_mode', 'Mode'],
                ['started_at', 'Debut'],
                ['ended_at', 'Fin'],
            ])}
        </section>
    `;

    const sessionForm = document.getElementById('inventorySessionForm');
    const countForm = document.getElementById('inventoryCountForm');

    sessionForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('inventorySessionFeedback');
        feedback.textContent = '';
        const data = new FormData(sessionForm);

        try {
            await apiRequest('/inventories', {
                method: 'POST',
                body: {
                    warehouse_id: Number(data.get('warehouse_id')),
                    counting_mode: String(data.get('counting_mode') ?? 'GLOBAL'),
                    notes: String(data.get('notes') ?? ''),
                },
            });
            await renderInventories();
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });

    countForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('inventoryCountFeedback');
        feedback.textContent = '';
        const data = new FormData(countForm);
        const sessionId = Number(data.get('session_id'));

        try {
            await apiRequest(`/inventories/${sessionId}/counts`, {
                method: 'POST',
                body: {
                    product_id: Number(data.get('product_id')),
                    counted_qty: Number(data.get('counted_qty')),
                    location_id: data.get('location_id') ? Number(data.get('location_id')) : null,
                    notes: String(data.get('notes') ?? ''),
                },
            });
            await renderInventories();
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });

    document.getElementById('inventoryFinalizeBtn')?.addEventListener('click', async () => {
        const data = new FormData(countForm);
        const sessionId = Number(data.get('session_id'));
        if (!sessionId) {
            window.alert('Selectionne une session');
            return;
        }

        await apiRequest(`/inventories/${sessionId}/finalize`, { method: 'POST' });
        await renderInventories();
    });
}

async function renderPurchaseRequests() {
    // Demandes d'achat: creation et suivi.
    const root = document.getElementById('appContent');
    await refreshLookups();

    const response = await apiRequest('/purchase-requests');
    const rows = normalizeRows(response);
    const writable = canWrite('purchase-requests');

    root.innerHTML = `
        <section class="panel">
            <div class="panel-head"><h4>Nouvelle demande achat</h4></div>
            ${writable ? `
            <form id="requestForm" class="form-grid">
                ${selectField('warehouse_id', 'Entrepot', state.lookups.warehouses, 'id', 'name', true)}
                ${selectField('product_id', 'Produit', state.lookups.products, 'id', 'name', true)}
                <label><span>Quantite demandee</span><input type="number" name="quantity_requested" min="1" required></label>
                <label><span>Cout prefere</span><input type="number" name="preferred_unit_cost" min="0" step="0.01"></label>
                <label><span>Date besoin</span><input type="datetime-local" name="needed_at"></label>
                <label class="full"><span>Notes</span><textarea name="notes"></textarea></label>
                <button type="submit" class="btn btn-primary">Creer la demande</button>
                <p id="requestFeedback" class="feedback"></p>
            </form>` : '<p class="muted">Acces en lecture seule sur ce module.</p>'}
        </section>
        <section class="panel">
            <h4>Demandes achat</h4>
            ${renderSimpleTable(rows, [
                ['request_number', 'Numero'],
                ['status', 'Statut'],
                ['warehouse_name', 'Entrepot'],
                ['requester_name', 'Demandeur'],
                ['requested_at', 'Date'],
            ])}
        </section>
    `;

    const form = document.getElementById('requestForm');
    const feedback = document.getElementById('requestFeedback');

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedback.textContent = '';

        const data = new FormData(form);

        try {
            await apiRequest('/purchase-requests', {
                method: 'POST',
                body: {
                    warehouse_id: Number(data.get('warehouse_id')),
                    needed_at: data.get('needed_at') ? String(data.get('needed_at')).replace('T', ' ') + ':00' : null,
                    notes: String(data.get('notes') ?? ''),
                    items: [
                        {
                            product_id: Number(data.get('product_id')),
                            quantity_requested: Number(data.get('quantity_requested')),
                            preferred_unit_cost: data.get('preferred_unit_cost') ? Number(data.get('preferred_unit_cost')) : null,
                        },
                    ],
                },
            });

            await renderPurchaseRequests();
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });
}

async function renderPurchaseOrders() {
    // Commandes d'achat: creation, statut, reception.
    const root = document.getElementById('appContent');
    await refreshLookups();

    const listResponse = await apiRequest('/purchase-orders');
    const rows = normalizeRows(listResponse);
    const writable = canWrite('purchase-orders');
    const orderOptions = rows.map((row) => `<option value="${row.id}">${sanitize(row.order_number)} | ${sanitize(row.status)}</option>`).join('');

    root.innerHTML = `
        <section class="panel">
            <div class="panel-head"><h4>Nouvelle commande achat</h4></div>
            ${writable ? `
            <form id="orderForm" class="form-grid">
                ${selectField('supplier_id', 'Fournisseur', state.lookups.suppliers, 'id', 'name', true)}
                ${selectField('warehouse_id', 'Entrepot', state.lookups.warehouses, 'id', 'name', true)}
                ${selectField('product_id', 'Produit', state.lookups.products, 'id', 'name', true)}
                <label><span>Quantite</span><input type="number" name="quantity_ordered" min="1" required></label>
                <label><span>Prix unitaire</span><input type="number" name="unit_cost" min="0" step="0.01" required></label>
                <label><span>Date attendue</span><input type="datetime-local" name="expected_at"></label>
                <label class="full"><span>Notes</span><textarea name="notes"></textarea></label>
                <button type="submit" class="btn btn-primary">Creer une commande</button>
                <p id="orderFeedback" class="feedback"></p>
            </form>
            <hr>
            <form id="orderStatusForm" class="form-grid">
                <label><span>Commande</span><select name="purchase_order_id" required><option value="">Choisir</option>${orderOptions}</select></label>
                <label><span>Nouveau statut</span><select name="status" required>
                    <option value="PENDING">PENDING</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="RECEIVED">RECEIVED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select></label>
                <button type="submit" class="btn btn-soft">Mettre a jour statut</button>
                <p id="orderStatusFeedback" class="feedback"></p>
            </form>
            <hr>
            <form id="poReceiptForm" class="form-grid">
                <label><span>Commande</span><select name="purchase_order_id" id="receiptOrderId" required><option value="">Choisir</option>${orderOptions}</select></label>
                <label><span>Ligne</span><select name="item_id" id="receiptItemId" required><option value="">Choisir une commande</option></select></label>
                <label><span>Quantite recue</span><input type="number" name="quantity_received" min="1" required></label>
                <button type="submit" class="btn btn-primary">Receptionner</button>
                <p id="poReceiptFeedback" class="feedback"></p>
            </form>
            ` : '<p class="muted">Acces en lecture seule sur ce module.</p>'}
        </section>

        <section class="panel">
            <h4>Commandes achat</h4>
            ${renderSimpleTable(rows, [
                ['order_number', 'Numero'],
                ['status', 'Statut'],
                ['supplier_name', 'Fournisseur'],
                ['warehouse_name', 'Entrepot'],
                ['total_amount', 'Montant', (value) => formatMoney(value)],
                ['ordered_at', 'Date'],
            ])}
        </section>
    `;

    const form = document.getElementById('orderForm');
    const feedback = document.getElementById('orderFeedback');

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedback.textContent = '';

        const data = new FormData(form);
        const payload = {
            supplier_id: Number(data.get('supplier_id')),
            warehouse_id: Number(data.get('warehouse_id')),
            expected_at: data.get('expected_at') ? String(data.get('expected_at')).replace('T', ' ') + ':00' : null,
            notes: String(data.get('notes') ?? ''),
            items: [
                {
                    product_id: Number(data.get('product_id')),
                    quantity_ordered: Number(data.get('quantity_ordered')),
                    unit_cost: Number(data.get('unit_cost')),
                },
            ],
        };

        try {
            await apiRequest('/purchase-orders', { method: 'POST', body: payload });
            await renderPurchaseOrders();
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });

    const statusForm = document.getElementById('orderStatusForm');
    const statusFeedback = document.getElementById('orderStatusFeedback');
    statusForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        statusFeedback.textContent = '';

        const data = new FormData(statusForm);
        const orderId = Number(data.get('purchase_order_id'));
        const status = String(data.get('status') ?? '');

        try {
            await apiRequest(`/purchase-orders/${orderId}/status`, {
                method: 'POST',
                body: { status },
            });
            await renderPurchaseOrders();
        } catch (error) {
            statusFeedback.textContent = error.message;
            statusFeedback.classList.add('is-error');
        }
    });

    const receiptForm = document.getElementById('poReceiptForm');
    const receiptFeedback = document.getElementById('poReceiptFeedback');
    const receiptOrderSelect = document.getElementById('receiptOrderId');
    const receiptItemSelect = document.getElementById('receiptItemId');

    const loadReceiptItems = async (orderId) => {
        if (!orderId) {
            receiptItemSelect.innerHTML = '<option value="">Choisir une commande</option>';
            return;
        }

        const orderResponse = await apiRequest(`/purchase-orders/${orderId}`);
        const order = orderResponse.data ?? {};
        const options = (order.items ?? []).map((item) => {
            const ordered = Number(item.quantity_ordered ?? 0);
            const received = Number(item.quantity_received ?? 0);
            const remaining = ordered - received;
            if (remaining <= 0) {
                return '';
            }
            const label = `${sanitize(item.product_name)} (${remaining} restant)`;
            return `<option value="${item.id}">${label}</option>`;
        }).filter(Boolean).join('');

        receiptItemSelect.innerHTML = `<option value="">Choisir</option>${options}`;
    };

    receiptOrderSelect?.addEventListener('change', async () => {
        await loadReceiptItems(Number(receiptOrderSelect.value));
    });

    receiptForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        receiptFeedback.textContent = '';

        const data = new FormData(receiptForm);
        const orderId = Number(data.get('purchase_order_id'));
        const itemId = Number(data.get('item_id'));
        const quantityReceived = Number(data.get('quantity_received'));

        try {
            await apiRequest(`/purchase-orders/${orderId}/receive`, {
                method: 'POST',
                body: {
                    items: [
                        {
                            item_id: itemId,
                            quantity_received: quantityReceived,
                        },
                    ],
                },
            });
            await renderPurchaseOrders();
        } catch (error) {
            receiptFeedback.textContent = error.message;
            receiptFeedback.classList.add('is-error');
        }
    });
}

async function renderReports() {
    // Exports rapides en CSV pour exploitation externe.
    const root = document.getElementById('appContent');

    root.innerHTML = `
        <section class="panel">
            <h4>Exports CSV</h4>
            <div class="panel-actions">
                <button class="btn btn-primary" data-report="/reports/stock.csv" data-name="stock-report.csv">Export stock</button>
                <button class="btn btn-primary" data-report="/reports/movements.csv" data-name="movements-report.csv">Export mouvements</button>
                <button class="btn btn-primary" data-report="/reports/purchases.csv" data-name="purchases-report.csv">Export achats</button>
            </div>
        </section>
    `;

    root.querySelectorAll('[data-report]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            await downloadCsv(btn.getAttribute('data-report'), btn.getAttribute('data-name') ?? 'report.csv');
        });
    });
}

async function renderImports() {
    // Import CSV guide pour charger vite les donnees.
    const root = document.getElementById('appContent');
    const writable = canWrite('imports');
    if (!writable) {
        root.innerHTML = '<section class="panel"><h4>Importations CSV</h4><p class="muted">Acces reserve aux administrateurs.</p></section>';
        return;
    }

    const jobsResponse = await apiRequest('/import-jobs');
    const jobs = normalizeRows(jobsResponse);

    root.innerHTML = `
        <section class="panel">
            <h4>Importations CSV multi-entites</h4>
            ${writable ? `
            <form id="importForm" class="form-grid">
                <label><span>Entite</span><select name="entity" required>
                    <option value="products">Produits</option>
                    <option value="suppliers">Fournisseurs</option>
                    <option value="customers">Clients</option>
                    <option value="initial-stocks">Stocks initiaux</option>
                </select></label>
                <label><span>Fichier CSV</span><input type="file" name="file" accept=".csv,text/csv" required></label>
                <button type="submit" class="btn btn-primary">Importer</button>
                <p id="importFeedback" class="feedback"></p>
            </form>
            <p class="muted">Headers recommandes: products(sku,name,category_name,supplier_name,unit_price,cost_price,reorder_level,status,barcode), suppliers(name,contact_name,phone,email,address), customers(code,name,email,phone,address,status), initial-stocks(sku,warehouse_code,quantity).</p>
            ` : '<p class="muted">Acces en lecture seule sur ce module.</p>'}
        </section>
        <section class="panel">
            <h4>Historique imports</h4>
            ${renderSimpleTable(jobs, [
                ['id', 'ID'],
                ['entity_type', 'Entite'],
                ['file_name', 'Fichier'],
                ['status', 'Statut'],
                ['total_rows', 'Total'],
                ['success_rows', 'OK'],
                ['failed_rows', 'KO'],
                ['created_at', 'Date'],
            ])}
        </section>
    `;

    const form = document.getElementById('importForm');
    const feedback = document.getElementById('importFeedback');
    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        feedback.textContent = '';

        const data = new FormData(form);
        const entity = String(data.get('entity') ?? '');
        const file = data.get('file');
        if (!(file instanceof File) || !file.name) {
            feedback.textContent = 'Choisis un fichier CSV';
            feedback.classList.add('is-error');
            return;
        }

        const payload = new FormData();
        payload.append('file', file);

        try {
            const response = await uploadRequest(`/imports/${entity}`, payload);
            const summary = response.data ?? {};
            feedback.classList.remove('is-error');
            feedback.textContent = `Import termine: ${summary.success_rows ?? 0} OK / ${summary.failed_rows ?? 0} KO`;
            await renderImports();
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });
}

async function renderProductDetail(productId) {
    // Fiche produit multi-onglets (stock, media, pieces jointes, etiquette).
    const pane = document.getElementById('productDetailPane');
    if (!pane) {
        return;
    }

    const [productResponse, movementResponse, attachmentResponse] = await Promise.all([
        apiRequest(`/products/${productId}`),
        apiRequest(`/stock/movements?product_id=${productId}&per_page=20`),
        apiRequest(`/attachments?entity_type=product&entity_id=${productId}`),
    ]);

    const product = productResponse.data;
    const movements = normalizeRows(movementResponse);
    const attachments = normalizeRows(attachmentResponse);
    const media = Array.isArray(product?.media) ? product.media : [];
    const stockRows = Array.isArray(product?.stock_by_warehouse) ? product.stock_by_warehouse : [];
    const canManageProduct = canWrite('products');
    const canMoveStock = canWrite('movements');

    pane.innerHTML = `
        <div class="panel-head">
            <h4>Fiche produit: ${sanitize(product.name)} (${sanitize(product.sku)})</h4>
        </div>
        <div class="tabs" id="productTabs">
            <button class="btn btn-soft is-tab-active" data-tab="info">Infos</button>
            <button class="btn btn-soft" data-tab="stock">Stock</button>
            <button class="btn btn-soft" data-tab="moves">Mouvements</button>
            <button class="btn btn-soft" data-tab="media">Media</button>
            <button class="btn btn-soft" data-tab="attachments">Pieces jointes</button>
            <button class="btn btn-soft" data-tab="label">Etiquette</button>
        </div>
        <div class="tab-panel" data-tab-panel="info">
            <div class="cards-grid">
                <article class="metric-card"><p>Categorie</p><h3>${sanitize(product.category_name)}</h3></article>
                <article class="metric-card"><p>Fournisseur</p><h3>${sanitize(product.supplier_name)}</h3></article>
                <article class="metric-card"><p>Stock total</p><h3>${sanitize(product.stock_total)}</h3></article>
                <article class="metric-card"><p>Prix vente</p><h3>${formatMoney(product.unit_price)}</h3></article>
                <article class="metric-card"><p>Prix achat</p><h3>${formatMoney(product.cost_price)}</h3></article>
                <article class="metric-card"><p>Code-barres</p><h3>${sanitize(product.barcode || '-')}</h3></article>
            </div>
            <p class="muted">${sanitize(product.description)}</p>
        </div>
        <div class="tab-panel hidden" data-tab-panel="stock">
            ${renderSimpleTable(stockRows, [
                ['warehouse_code', 'Code'],
                ['warehouse_name', 'Entrepot'],
                ['quantity', 'Quantite'],
                ['reserved_quantity', 'Reserve'],
            ])}
            ${canMoveStock ? `
            <form id="productMoveForm" class="form-grid">
                ${selectField('warehouse_id', 'Entrepot source', state.lookups.warehouses, 'id', 'name', true)}
                ${selectField('destination_warehouse_id', 'Entrepot destination', state.lookups.warehouses, 'id', 'name', false)}
                <label><span>Type</span><select name="type" required>
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                    <option value="TRANSFER">TRANSFER</option>
                </select></label>
                <label><span>Quantite</span><input type="number" min="1" name="quantity" required></label>
                <label><span>Motif</span><input type="text" name="reason_code" placeholder="INVENTORY/PO_RECEIPT/etc"></label>
                <button type="submit" class="btn btn-primary">Creer mouvement</button>
                <p class="feedback" id="productMoveFeedback"></p>
            </form>` : '<p class="muted">Pas de droit ecriture mouvement.</p>'}
        </div>
        <div class="tab-panel hidden" data-tab-panel="moves">
            ${renderSimpleTable(movements, [
                ['created_at', 'Date'],
                ['type', 'Type'],
                ['quantity', 'Quantite'],
                ['warehouse_name', 'Source'],
                ['destination_warehouse_name', 'Destination'],
                ['reason_code', 'Motif'],
                ['moved_by_name', 'Par'],
            ])}
        </div>
        <div class="tab-panel hidden" data-tab-panel="media">
            ${canManageProduct ? `
            <form id="productMediaUploadForm" class="form-grid">
                <label><span>Type media</span><select name="media_type"><option value="IMAGE">IMAGE</option><option value="DOCUMENT">DOCUMENT</option></select></label>
                <label><span>Fichier</span><input type="file" name="file" required></label>
                <button type="submit" class="btn btn-primary">Televerser un media</button>
                <p class="feedback" id="mediaUploadFeedback"></p>
            </form>` : '<p class="muted">Pas de droit upload media.</p>'}
            ${renderDownloadTable(media, 'media')}
        </div>
        <div class="tab-panel hidden" data-tab-panel="attachments">
            <form id="attachmentUploadForm" class="form-grid">
                <label><span>Fichier</span><input type="file" name="file" required></label>
                <button type="submit" class="btn btn-primary">Televerser une piece jointe</button>
                <p class="feedback" id="attachmentUploadFeedback"></p>
            </form>
            ${renderDownloadTable(attachments, 'attachment')}
        </div>
        <div class="tab-panel hidden" data-tab-panel="label">
            <div id="barcodePreview" class="label-preview muted">Chargement etiquette...</div>
            <div class="panel-actions">
                <button class="btn btn-soft" id="refreshLabelBtn">Regenerer</button>
                <button class="btn btn-primary" id="printLabelBtn">Imprimer</button>
            </div>
        </div>
    `;

    pane.querySelectorAll('#productTabs [data-tab]').forEach((button) => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            pane.querySelectorAll('#productTabs [data-tab]').forEach((btn) => btn.classList.remove('is-tab-active'));
            button.classList.add('is-tab-active');
            pane.querySelectorAll('[data-tab-panel]').forEach((panel) => {
                panel.classList.toggle('hidden', panel.getAttribute('data-tab-panel') !== tab);
            });
        });
    });

    const moveForm = document.getElementById('productMoveForm');
    moveForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('productMoveFeedback');
        feedback.textContent = '';
        const data = new FormData(moveForm);

        try {
            await apiRequest('/stock/movements', {
                method: 'POST',
                body: {
                    product_id: productId,
                    warehouse_id: Number(data.get('warehouse_id')),
                    destination_warehouse_id: data.get('destination_warehouse_id') ? Number(data.get('destination_warehouse_id')) : null,
                    type: String(data.get('type') ?? 'IN'),
                    quantity: Number(data.get('quantity')),
                    reason_code: String(data.get('reason_code') ?? ''),
                },
            });
            await renderProductDetail(productId);
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });

    const mediaForm = document.getElementById('productMediaUploadForm');
    mediaForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('mediaUploadFeedback');
        feedback.textContent = '';
        const data = new FormData(mediaForm);

        try {
            const payload = new FormData();
            payload.append('media_type', String(data.get('media_type') ?? 'IMAGE'));
            payload.append('file', data.get('file'));
            await uploadRequest(`/products/${productId}/media/upload`, payload);
            await renderProductDetail(productId);
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });

    const attachmentForm = document.getElementById('attachmentUploadForm');
    attachmentForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const feedback = document.getElementById('attachmentUploadFeedback');
        feedback.textContent = '';
        const data = new FormData(attachmentForm);

        try {
            const payload = new FormData();
            payload.append('entity_type', 'product');
            payload.append('entity_id', String(productId));
            payload.append('file', data.get('file'));
            await uploadRequest('/attachments/upload', payload);
            await renderProductDetail(productId);
        } catch (error) {
            feedback.textContent = error.message;
            feedback.classList.add('is-error');
        }
    });

    pane.querySelectorAll('[data-download-type]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const kind = btn.getAttribute('data-download-type');
            const id = Number(btn.getAttribute('data-download-id'));
            const name = btn.getAttribute('data-download-name') ?? 'file.bin';
            const path = kind === 'media' ? `/product-media/${id}/download` : `/attachments/${id}/download`;
            await authenticatedDownload(path, name);
        });
    });

    const refreshLabelBtn = document.getElementById('refreshLabelBtn');
    refreshLabelBtn?.addEventListener('click', async () => {
        await loadLabelPreview(productId);
    });

    const printLabelBtn = document.getElementById('printLabelBtn');
    printLabelBtn?.addEventListener('click', async () => {
        const blob = await fetchAuthenticatedBlob(`/products/${productId}/label.svg`);
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
            win.addEventListener('load', () => win.print(), { once: true });
        }
    });

    await loadLabelPreview(productId);
}

function renderDownloadTable(rows, type) {
    const body = rows.map((row) => `
        <tr>
            <td>${sanitize(row.id)}</td>
            <td>${sanitize(row.file_name)}</td>
            <td>${sanitize(row.mime_type ?? '')}</td>
            <td>${sanitize(row.created_at ?? '')}</td>
            <td class="actions"><button class="btn btn-soft" data-download-type="${type}" data-download-id="${row.id}" data-download-name="${sanitize(row.file_name ?? 'file.bin')}">Telecharger le fichier</button></td>
        </tr>
    `).join('');

    return `
        <div class="table-wrap">
            <table class="data-table">
                <thead><tr><th>ID</th><th>Fichier</th><th>Type</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>${body || '<tr><td colspan="5">Aucune donnee</td></tr>'}</tbody>
            </table>
        </div>
    `;
}

async function loadLabelPreview(productId) {
    const target = document.getElementById('barcodePreview');
    if (!target) {
        return;
    }

    try {
        const blob = await fetchAuthenticatedBlob(`/products/${productId}/label.svg`);
        const url = URL.createObjectURL(blob);
        target.innerHTML = `<img src="${url}" alt="Label produit" style="max-width:100%;height:auto;">`;
    } catch (error) {
        target.innerHTML = `<p class="feedback is-error">${sanitize(error.message)}</p>`;
    }
}

async function authenticatedDownload(path, fileName) {
    const blob = await fetchAuthenticatedBlob(path);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

async function fetchAuthenticatedBlob(path) {
    const token = getToken();
    const response = await fetch(`${window.APP_CONFIG.apiBaseUrl}${path}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Telechargement impossible');
    }

    return response.blob();
}

async function downloadCsv(path, fileName) {
    const token = getToken();
    const response = await fetch(`${window.APP_CONFIG.apiBaseUrl}${path}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Export impossible');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

function renderCrudTable(config, rows, canWrite, module = '') {
    // Tableau principal avec actions selon les droits.
    const headerCells = config.columns.map((column) => `<th>${column.label}</th>`).join('');

    const rowCells = rows.map((row) => {
        const cells = config.columns.map((column) => {
            const value = row[column.key];
            const display = column.format ? column.format(value, row) : sanitize(localizeValue(value));
            return `<td>${display}</td>`;
        }).join('');

        let actions = '';
        if (canWrite) {
            actions += `<button data-action="edit" data-id="${row.id}" class="btn btn-soft">Editer</button>`;
            actions += `<button data-action="delete" data-id="${row.id}" class="btn btn-danger">Supprimer</button>`;
        }
        if (module === 'products') {
            actions = `<button data-action="view" data-id="${row.id}" class="btn btn-primary">Fiche</button>` + actions;
        }

        const actionCell = actions !== '' ? `<td class="actions">${actions}</td>` : '';

        return `<tr>${cells}${actionCell}</tr>`;
    }).join('');

    return `
        <div class="table-wrap">
            <table class="data-table">
                <thead><tr>${headerCells}${(canWrite || module === 'products') ? '<th>Actions</th>' : ''}</tr></thead>
                <tbody>${rowCells || `<tr><td colspan="${config.columns.length + ((canWrite || module === 'products') ? 1 : 0)}">Aucune donnee</td></tr>`}</tbody>
            </table>
        </div>
    `;
}

function buildFormFields(fields, item = null, editing = false) {
    return fields.map((field) => {
        const value = item && item[field.key] !== undefined && item[field.key] !== null ? String(item[field.key]) : '';
        const required = field.required || (field.requiredOnCreate && !editing);

        if (field.type === 'textarea') {
            return `<label class="full"><span>${field.label}</span><textarea name="${field.key}" ${required ? 'required' : ''}>${sanitize(value)}</textarea></label>`;
        }

        if (field.type === 'select') {
            return selectField(field.key, field.label, resolveOptions(field), field.optionValue ?? 'id', field.optionLabel ?? 'label', required, value);
        }

        return `<label><span>${field.label}</span><input type="${field.type}" name="${field.key}" value="${sanitize(value)}" ${field.step ? `step="${field.step}"` : ''} ${required ? 'required' : ''}></label>`;
    }).join('');
}

function collectFormPayload(fields, form, editing) {
    const payload = {};

    for (const field of fields) {
        const input = form.elements[field.key];
        if (!input) {
            continue;
        }

        let value = String(input.value ?? '').trim();

        if (field.type === 'number') {
            value = value === '' ? '' : Number(value);
        }

        if (field.type === 'select' && ['category_id', 'supplier_id', 'unit_id', 'brand_id', 'tax_id', 'role_id', 'warehouse_id', 'product_id', 'is_active', 'is_default', 'zone_id', 'location_id', 'parent_id', 'default_tax_id'].includes(field.key)) {
            if (field.key === 'is_active' || field.key === 'is_default') {
                value = Number(value || 0);
            } else if (value !== '') {
                value = Number(value);
            }
        }

        if (editing && field.key === 'password' && value === '') {
            continue;
        }

        payload[field.key] = value;
    }

    return payload;
}

function formActions() {
    return `<div class="full form-actions"><button type="submit" class="btn btn-primary">Enregistrer</button><button type="button" data-action="cancel" class="btn btn-soft">Annuler</button></div>`;
}

function normalizeRows(response) {
    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }

    return [];
}

function resolveOptions(field) {
    if (field.options) {
        return field.options;
    }

    return (state.lookups?.[field.optionsFrom] ?? []);
}

function selectField(name, label, options, optionValue, optionLabel, required = false, selectedValue = '') {
    const opts = options.map((option) => {
        const value = String(option[optionValue]);
        const text = sanitize(option[optionLabel] ?? option.label ?? option.code ?? value);
        const selected = selectedValue !== '' && value === String(selectedValue) ? 'selected' : '';
        return `<option value="${sanitize(value)}" ${selected}>${text}</option>`;
    }).join('');

    return `
        <label>
            <span>${label}</span>
            <select name="${name}" ${required ? 'required' : ''}>
                <option value="">Choisir</option>
                ${opts}
            </select>
        </label>
    `;
}

function renderSimpleTable(rows, columns) {
    // Petit tableau reutilisable pour toutes les sections.
    const headers = columns.map(([, label]) => `<th>${label}</th>`).join('');

    const body = rows.map((row) => {
        const cells = columns.map(([key, , formatter]) => {
            const value = row[key];
            const display = formatter ? formatter(value, row) : sanitize(localizeValue(value));
            return `<td>${display}</td>`;
        }).join('');

        return `<tr>${cells}</tr>`;
    }).join('');

    return `
        <div class="table-wrap">
            <table class="data-table">
                <thead><tr>${headers}</tr></thead>
                <tbody>${body || `<tr><td colspan="${columns.length}">Aucune donnee</td></tr>`}</tbody>
            </table>
        </div>
    `;
}

async function refreshLookups() {
    const lookupResponse = await apiRequest('/lookups/options');
    state.lookups = lookupResponse.data;
}

function toQueryString(params) {
    const entries = Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined);
    if (entries.length === 0) {
        return '';
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of entries) {
        searchParams.set(key, String(value));
    }

    return `?${searchParams.toString()}`;
}

function sanitize(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatMoney(value) {
    const amount = Number(value ?? 0);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

function localizeValue(value) {
    // Traduction simple des statuts techniques vers des libelles lisibles.
    const v = String(value ?? '');
    const map = {
        ACTIVE: 'Actif',
        INACTIVE: 'Inactif',
        PENDING: 'En attente',
        PARTIAL: 'Partielle',
        RECEIVED: 'Recue',
        CANCELLED: 'Annulee',
        DRAFT: 'Brouillon',
        SUBMITTED: 'Soumise',
        APPROVED: 'Approuvee',
        REJECTED: 'Rejetee',
        CONVERTED: 'Convertie',
        COMPLETED: 'Terminee',
        OPEN: 'Ouverte',
        ACKNOWLEDGED: 'Accusee',
        RESOLVED: 'Resolue',
        WARNING: 'Avertissement',
        CRITICAL: 'Critique',
        INFO: 'Information',
    };

    return map[v] ?? value;
}
