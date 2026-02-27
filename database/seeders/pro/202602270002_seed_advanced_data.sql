SET NAMES utf8mb4;

INSERT INTO roles (code, label) VALUES
('SUPER_ADMIN', 'Super Administrateur'),
('BUYER', 'Acheteur'),
('VIEWER', 'Lecteur')
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO units (code, name, symbol, base_unit, conversion_factor, is_active) VALUES
('PIECE', 'Piece', 'pc', 'PIECE', 1, 1),
('KG', 'Kilogramme', 'kg', 'KG', 1, 1),
('PACK6', 'Pack de 6', 'pack6', 'PIECE', 6, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), symbol = VALUES(symbol), conversion_factor = VALUES(conversion_factor), is_active = VALUES(is_active);

INSERT INTO taxes (code, name, rate, is_default) VALUES
('TVA_0', 'TVA 0%', 0.000, 0),
('TVA_10', 'TVA 10%', 10.000, 0),
('TVA_20', 'TVA 20%', 20.000, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), rate = VALUES(rate), is_default = VALUES(is_default);

INSERT INTO brands (name, description) VALUES
('Generic', 'Marque generique'),
('ProLine', 'Marque professionnelle')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO tags (name, color) VALUES
('critique', '#d64545'),
('rotation-rapide', '#2c7a7b'),
('sensible', '#6b46c1')
ON DUPLICATE KEY UPDATE color = VALUES(color);

INSERT INTO warehouses (name, code, location, is_default, status)
VALUES ('Entrepot Secondaire', 'WH-002', 'Namur', 0, 'ACTIVE')
ON DUPLICATE KEY UPDATE location = VALUES(location), status = VALUES(status);

INSERT INTO warehouse_zones (warehouse_id, code, name)
SELECT w.id, 'A', 'Zone A' FROM warehouses w WHERE w.code = 'WH-001'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO warehouse_zones (warehouse_id, code, name)
SELECT w.id, 'B', 'Zone B' FROM warehouses w WHERE w.code = 'WH-002'
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO warehouse_locations (warehouse_id, zone_id, code, description, capacity, is_active)
SELECT w.id, z.id, 'A1', 'Rayon A1', 500, 1
FROM warehouses w
JOIN warehouse_zones z ON z.warehouse_id = w.id AND z.code = 'A'
WHERE w.code = 'WH-001'
ON DUPLICATE KEY UPDATE description = VALUES(description), capacity = VALUES(capacity), is_active = VALUES(is_active);

INSERT INTO warehouse_locations (warehouse_id, zone_id, code, description, capacity, is_active)
SELECT w.id, z.id, 'B1', 'Rayon B1', 300, 1
FROM warehouses w
JOIN warehouse_zones z ON z.warehouse_id = w.id AND z.code = 'B'
WHERE w.code = 'WH-002'
ON DUPLICATE KEY UPDATE description = VALUES(description), capacity = VALUES(capacity), is_active = VALUES(is_active);

INSERT INTO customers (code, name, email, phone, address, status) VALUES
('CLI-001', 'Client Interne RH', 'rh@societe.local', '0101010101', 'Siege Bruxelles', 'ACTIVE'),
('CLI-002', 'Client Interne IT', 'it@societe.local', '0202020202', 'Site Namur', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), phone = VALUES(phone), address = VALUES(address), status = VALUES(status);

UPDATE suppliers SET lead_time_days = 7, payment_terms = '30 jours fin de mois', status = 'ACTIVE' WHERE status IS NULL OR status = '';

UPDATE warehouses
SET code = CASE WHEN id = 1 THEN 'WH-001' ELSE COALESCE(code, CONCAT('WH-', LPAD(id, 3, '0'))) END,
    status = 'ACTIVE'
WHERE code IS NULL OR code = '';

UPDATE categories
SET default_min_stock = COALESCE(default_min_stock, 10),
    default_max_stock = COALESCE(default_max_stock, 100);

UPDATE products p
LEFT JOIN units u ON u.code = 'PIECE'
LEFT JOIN brands b ON b.name = 'Generic'
LEFT JOIN taxes t ON t.code = 'TVA_20'
SET p.unit_id = COALESCE(p.unit_id, u.id),
    p.brand_id = COALESCE(p.brand_id, b.id),
    p.tax_id = COALESCE(p.tax_id, t.id),
    p.min_stock = COALESCE(p.min_stock, p.reorder_level),
    p.safety_stock = COALESCE(p.safety_stock, 5),
    p.valuation_method = COALESCE(p.valuation_method, 'CUMP'),
    p.is_active = 1;

INSERT INTO document_sequences (document_type, prefix, current_value, year_based) VALUES
('PO', 'PO', 2, 1),
('PR', 'PR', 1, 1),
('INV', 'INV', 1, 1)
ON DUPLICATE KEY UPDATE prefix = VALUES(prefix), year_based = VALUES(year_based);

INSERT INTO app_settings (setting_key, setting_value) VALUES
('default_currency', 'EUR'),
('default_language', 'fr'),
('default_timezone', 'Europe/Paris'),
('default_min_stock', '10'),
('document_number_format', '{PREFIX}-{YEAR}-{SEQ}')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);