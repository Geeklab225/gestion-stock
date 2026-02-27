SET NAMES utf8mb4;

INSERT INTO roles (code, label) VALUES
('ADMIN', 'Administrateur'),
('MANAGER', 'Responsable stock'),
('STOREKEEPER', 'Magasinier'),
('EMPLOYEE', 'Employe')
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO warehouses (name, location, is_default)
VALUES ('Entrepot Principal', 'Bruxelles', 1)
ON DUPLICATE KEY UPDATE location = VALUES(location), is_default = VALUES(is_default);

-- Migration douce: si l ancien compte seed existe deja, on le remplace.
UPDATE users
SET
    email = 'stock@lm-code.be',
    password_hash = '$argon2id$v=19$m=65536,t=4,p=1$a2hzYjdmVVY3QnRJLk4wSg$D3SxoMQRuNVjBTeTX09vH+36SsynHB+4EIypVijoRXs',
    is_active = 1
WHERE email = 'admin@stock.local';

INSERT INTO users (full_name, email, password_hash, role_id, is_active)
SELECT 'Admin Principal', 'stock@lm-code.be', '$argon2id$v=19$m=65536,t=4,p=1$a2hzYjdmVVY3QnRJLk4wSg$D3SxoMQRuNVjBTeTX09vH+36SsynHB+4EIypVijoRXs', r.id, 1
FROM roles r
WHERE r.code = 'ADMIN'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role_id = VALUES(role_id), is_active = VALUES(is_active);

INSERT INTO categories (name, description) VALUES
('Informatique', 'Materiel informatique et accessoires'),
('Bureau', 'Fournitures de bureau et consommables'),
('Entretien', 'Produits d entretien et maintenance')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES
('OfficePro', 'Jean Martin', '0123456789', 'contact@officepro.com', 'Rue du Bureau 10, Bruxelles'),
('TechSupply', 'Laura Dupont', '0234567890', 'laura@techsupply.com', 'Rue du Circuit 22, Namur')
ON DUPLICATE KEY UPDATE contact_name = VALUES(contact_name), phone = VALUES(phone), email = VALUES(email), address = VALUES(address);

INSERT INTO products (sku, name, description, category_id, supplier_id, unit_price, cost_price, reorder_level, status)
SELECT 'SKU-USB32', 'Cle USB 32Go', 'Stockage USB haute vitesse', c.id, s.id, 12.90, 8.40, 15, 'ACTIVE'
FROM categories c
JOIN suppliers s ON s.name = 'TechSupply'
WHERE c.name = 'Informatique'
ON DUPLICATE KEY UPDATE name = VALUES(name), unit_price = VALUES(unit_price), cost_price = VALUES(cost_price), reorder_level = VALUES(reorder_level);

INSERT INTO products (sku, name, description, category_id, supplier_id, unit_price, cost_price, reorder_level, status)
SELECT 'SKU-TONER', 'Toner Laser XL', 'Toner noir imprimante laser', c.id, s.id, 79.00, 52.00, 6, 'ACTIVE'
FROM categories c
JOIN suppliers s ON s.name = 'OfficePro'
WHERE c.name = 'Bureau'
ON DUPLICATE KEY UPDATE name = VALUES(name), unit_price = VALUES(unit_price), cost_price = VALUES(cost_price), reorder_level = VALUES(reorder_level);

INSERT INTO stock_levels (product_id, warehouse_id, quantity, reserved_quantity)
SELECT p.id, w.id, 120, 0
FROM products p
JOIN warehouses w ON w.is_default = 1
WHERE p.sku = 'SKU-USB32'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity);

INSERT INTO stock_levels (product_id, warehouse_id, quantity, reserved_quantity)
SELECT p.id, w.id, 8, 0
FROM products p
JOIN warehouses w ON w.is_default = 1
WHERE p.sku = 'SKU-TONER'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity);
