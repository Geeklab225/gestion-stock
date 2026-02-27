SET NAMES utf8mb4;

CREATE TEMPORARY TABLE tmp_numbers (
    n INT PRIMARY KEY
) ENGINE=Memory;

INSERT INTO tmp_numbers (n) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
(11),(12),(13),(14),(15),(16),(17),(18),(19),(20);

SET @admin_id := (
    SELECT id
    FROM users
    WHERE email = 'stock@lm-code.be'
    LIMIT 1
);

SET @default_warehouse_id := (
    SELECT id
    FROM warehouses
    ORDER BY is_default DESC, id ASC
    LIMIT 1
);

INSERT INTO categories (name, description, created_at, updated_at)
SELECT
    CONCAT('Categorie Test ', LPAD(t.n, 2, '0')),
    CONCAT('Categorie de test ', t.n),
    NOW(),
    NOW()
FROM tmp_numbers t
WHERE NOT EXISTS (
    SELECT 1
    FROM categories c
    WHERE c.name = CONCAT('Categorie Test ', LPAD(t.n, 2, '0'))
);

INSERT INTO suppliers (name, contact_name, phone, email, address, created_at, updated_at)
SELECT
    CONCAT('Fournisseur Test ', LPAD(t.n, 2, '0')),
    CONCAT('Contact ', LPAD(t.n, 2, '0')),
    CONCAT('060000', LPAD(t.n, 4, '0')),
    CONCAT('fournisseur', LPAD(t.n, 2, '0'), '@test.local'),
    CONCAT('Adresse test ', t.n),
    NOW(),
    NOW()
FROM tmp_numbers t
WHERE NOT EXISTS (
    SELECT 1
    FROM suppliers s
    WHERE s.name = CONCAT('Fournisseur Test ', LPAD(t.n, 2, '0'))
);

INSERT INTO customers (code, name, email, phone, address, status, created_at, updated_at)
SELECT
    CONCAT('CLI-TST-', LPAD(t.n, 4, '0')),
    CONCAT('Client Test ', LPAD(t.n, 2, '0')),
    CONCAT('client', LPAD(t.n, 2, '0'), '@test.local'),
    CONCAT('070000', LPAD(t.n, 4, '0')),
    CONCAT('Adresse client test ', t.n),
    'ACTIVE',
    NOW(),
    NOW()
FROM tmp_numbers t
WHERE NOT EXISTS (
    SELECT 1
    FROM customers c
    WHERE c.code = CONCAT('CLI-TST-', LPAD(t.n, 4, '0'))
);

INSERT INTO brands (name, description, created_at, updated_at)
SELECT
    CONCAT('Marque Test ', LPAD(t.n, 2, '0')),
    CONCAT('Marque de test ', t.n),
    NOW(),
    NOW()
FROM tmp_numbers t
WHERE NOT EXISTS (
    SELECT 1
    FROM brands b
    WHERE b.name = CONCAT('Marque Test ', LPAD(t.n, 2, '0'))
);

INSERT INTO tags (name, color, created_at)
SELECT
    CONCAT('tag-test-', LPAD(t.n, 2, '0')),
    CONCAT('#', LPAD(CONV(t.n * 1267, 10, 16), 6, '0')),
    NOW()
FROM tmp_numbers t
WHERE NOT EXISTS (
    SELECT 1
    FROM tags g
    WHERE g.name = CONCAT('tag-test-', LPAD(t.n, 2, '0'))
);

INSERT INTO products (sku, barcode, name, description, category_id, supplier_id, unit_price, cost_price, reorder_level, status, created_at, updated_at)
SELECT
    CONCAT('SKU-TST-', LPAD(t.n, 4, '0')),
    CONCAT('3270000000', LPAD(t.n, 3, '0')),
    CONCAT('Produit Test ', LPAD(t.n, 2, '0')),
    CONCAT('Produit de demonstration ', t.n),
    c.id,
    s.id,
    15 + t.n,
    8 + t.n,
    5 + (t.n % 4),
    'ACTIVE',
    NOW(),
    NOW()
FROM tmp_numbers t
INNER JOIN categories c ON c.name = CONCAT('Categorie Test ', LPAD(t.n, 2, '0'))
INNER JOIN suppliers s ON s.name = CONCAT('Fournisseur Test ', LPAD(t.n, 2, '0'))
WHERE NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.sku = CONCAT('SKU-TST-', LPAD(t.n, 4, '0'))
);

INSERT INTO stock_levels (product_id, warehouse_id, quantity, reserved_quantity, updated_at)
SELECT
    p.id,
    @default_warehouse_id,
    20 + (t.n * 3),
    0,
    NOW()
FROM tmp_numbers t
INNER JOIN products p ON p.sku = CONCAT('SKU-TST-', LPAD(t.n, 4, '0'))
WHERE @default_warehouse_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM stock_levels sl
      WHERE sl.product_id = p.id AND sl.warehouse_id = @default_warehouse_id
  );

INSERT INTO stock_movements (
    product_id, warehouse_id, type, quantity, balance_after, reference_type, reference_id, notes, moved_by, created_at
)
SELECT
    p.id,
    @default_warehouse_id,
    'IN',
    20 + (t.n * 3),
    20 + (t.n * 3),
    'SEED',
    t.n,
    CONCAT('Mouvement seed test ', t.n),
    @admin_id,
    NOW()
FROM tmp_numbers t
INNER JOIN products p ON p.sku = CONCAT('SKU-TST-', LPAD(t.n, 4, '0'))
WHERE @default_warehouse_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM stock_movements sm
      WHERE sm.reference_type = 'SEED'
        AND sm.reference_id = t.n
        AND sm.product_id = p.id
  );

INSERT INTO purchase_orders (
    order_number, supplier_id, warehouse_id, status, ordered_by, ordered_at, expected_at, total_amount, notes, created_at, updated_at
)
SELECT
    CONCAT('PO-TST-2026-', LPAD(t.n, 4, '0')),
    s.id,
    @default_warehouse_id,
    'PENDING',
    @admin_id,
    NOW(),
    DATE_ADD(NOW(), INTERVAL t.n DAY),
    (20 + t.n) * (7 + t.n),
    CONCAT('Commande test ', t.n),
    NOW(),
    NOW()
FROM tmp_numbers t
INNER JOIN suppliers s ON s.name = CONCAT('Fournisseur Test ', LPAD(t.n, 2, '0'))
WHERE @default_warehouse_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM purchase_orders po
      WHERE po.order_number = CONCAT('PO-TST-2026-', LPAD(t.n, 4, '0'))
  );

INSERT INTO purchase_order_items (
    purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, line_total
)
SELECT
    po.id,
    p.id,
    20 + t.n,
    0,
    7 + t.n,
    (20 + t.n) * (7 + t.n)
FROM tmp_numbers t
INNER JOIN purchase_orders po ON po.order_number = CONCAT('PO-TST-2026-', LPAD(t.n, 4, '0'))
INNER JOIN products p ON p.sku = CONCAT('SKU-TST-', LPAD(t.n, 4, '0'))
WHERE NOT EXISTS (
    SELECT 1
    FROM purchase_order_items poi
    WHERE poi.purchase_order_id = po.id AND poi.product_id = p.id
);

INSERT INTO purchase_requests (
    request_number, requester_id, warehouse_id, status, requested_at, needed_at, notes, created_at, updated_at
)
SELECT
    CONCAT('PR-TST-2026-', LPAD(t.n, 4, '0')),
    @admin_id,
    @default_warehouse_id,
    'SUBMITTED',
    NOW(),
    DATE_ADD(NOW(), INTERVAL (t.n + 3) DAY),
    CONCAT('Demande test ', t.n),
    NOW(),
    NOW()
FROM tmp_numbers t
WHERE @default_warehouse_id IS NOT NULL
  AND @admin_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM purchase_requests pr
      WHERE pr.request_number = CONCAT('PR-TST-2026-', LPAD(t.n, 4, '0'))
  );

INSERT INTO purchase_request_items (
    purchase_request_id, product_id, quantity_requested, preferred_unit_cost, notes
)
SELECT
    pr.id,
    p.id,
    5 + t.n,
    7 + t.n,
    CONCAT('Ligne demande test ', t.n)
FROM tmp_numbers t
INNER JOIN purchase_requests pr ON pr.request_number = CONCAT('PR-TST-2026-', LPAD(t.n, 4, '0'))
INNER JOIN products p ON p.sku = CONCAT('SKU-TST-', LPAD(t.n, 4, '0'))
WHERE NOT EXISTS (
    SELECT 1
    FROM purchase_request_items pri
    WHERE pri.purchase_request_id = pr.id AND pri.product_id = p.id
);

INSERT INTO inventory_sessions (
    code, warehouse_id, status, counting_mode, started_at, ended_at, created_by, notes, created_at, updated_at
)
SELECT
    CONCAT('INV-TST-2026-', LPAD(t.n, 4, '0')),
    @default_warehouse_id,
    'COMPLETED',
    'GLOBAL',
    DATE_SUB(NOW(), INTERVAL t.n DAY),
    DATE_SUB(NOW(), INTERVAL (t.n - 1) DAY),
    @admin_id,
    CONCAT('Session inventaire test ', t.n),
    NOW(),
    NOW()
FROM tmp_numbers t
WHERE @default_warehouse_id IS NOT NULL
  AND @admin_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM inventory_sessions i
      WHERE i.code = CONCAT('INV-TST-2026-', LPAD(t.n, 4, '0'))
  );

INSERT INTO inventory_session_items (
    session_id, product_id, expected_qty, counted_qty, difference_qty, location_id, counted_by, counted_at, notes
)
SELECT
    i.id,
    p.id,
    20 + (t.n * 3),
    19 + (t.n * 3),
    -1,
    NULL,
    @admin_id,
    NOW(),
    CONCAT('Ligne inventaire test ', t.n)
FROM tmp_numbers t
INNER JOIN inventory_sessions i ON i.code = CONCAT('INV-TST-2026-', LPAD(t.n, 4, '0'))
INNER JOIN products p ON p.sku = CONCAT('SKU-TST-', LPAD(t.n, 4, '0'))
WHERE NOT EXISTS (
    SELECT 1
    FROM inventory_session_items isi
    WHERE isi.session_id = i.id AND isi.product_id = p.id
);

INSERT INTO stock_alerts (
    alert_type, severity, product_id, purchase_order_id, warehouse_id, message, status, created_at
)
SELECT
    'LOW_STOCK',
    'WARNING',
    p.id,
    po.id,
    @default_warehouse_id,
    CONCAT('Alerte test ', t.n),
    'OPEN',
    NOW()
FROM tmp_numbers t
INNER JOIN products p ON p.sku = CONCAT('SKU-TST-', LPAD(t.n, 4, '0'))
INNER JOIN purchase_orders po ON po.order_number = CONCAT('PO-TST-2026-', LPAD(t.n, 4, '0'))
WHERE NOT EXISTS (
    SELECT 1
    FROM stock_alerts sa
    WHERE sa.message = CONCAT('Alerte test ', t.n)
);

INSERT INTO import_jobs (
    entity_type, file_name, status, total_rows, success_rows, failed_rows, error_log, started_by, created_at, updated_at
)
SELECT
    'products',
    CONCAT('import-test-', LPAD(t.n, 2, '0'), '.csv'),
    'DONE',
    20,
    20,
    0,
    NULL,
    @admin_id,
    NOW(),
    NOW()
FROM tmp_numbers t
WHERE @admin_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM import_jobs j
      WHERE j.file_name = CONCAT('import-test-', LPAD(t.n, 2, '0'), '.csv')
  );

DROP TEMPORARY TABLE IF EXISTS tmp_numbers;
