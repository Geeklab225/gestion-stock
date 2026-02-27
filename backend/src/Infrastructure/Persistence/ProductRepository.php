<?php
declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use PDO;

final class ProductRepository extends PdoCrudRepository
{
    /** @var array<string, bool> */
    private static array $columnExistsCache = [];

    protected string $table = 'products';
    protected array $fillable = [
        'sku',
        'barcode',
        'name',
        'description',
        'category_id',
        'supplier_id',
        'unit_id',
        'brand_id',
        'tax_id',
        'pack_size',
        'weight_kg',
        'width_cm',
        'height_cm',
        'depth_cm',
        'unit_price',
        'cost_price',
        'reorder_level',
        'min_stock',
        'max_stock',
        'safety_stock',
        'valuation_method',
        'status',
        'is_active',
    ];
    protected array $filterable = ['category_id', 'supplier_id', 'status', 'is_active', 'brand_id', 'unit_id'];

    public function paginate(int $page, int $perPage, array $filters = []): array
    {
        $page = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $offset = ($page - 1) * $perPage;

        [$whereSql, $params] = $this->buildWhere($filters);

        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM products p {$whereSql}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "
            SELECT
                p.*,
                c.name AS category_name,
                s.name AS supplier_name,
                u.code AS unit_code,
                b.name AS brand_name,
                t.rate AS tax_rate,
                COALESCE(SUM(sl.quantity), 0) AS stock_total
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            LEFT JOIN units u ON u.id = p.unit_id
            LEFT JOIN brands b ON b.id = p.brand_id
            LEFT JOIN taxes t ON t.id = p.tax_id
            LEFT JOIN stock_levels sl ON sl.product_id = p.id
            {$whereSql}
            GROUP BY p.id
            ORDER BY p.id DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data' => $stmt->fetchAll(),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int)max(1, ceil($total / $perPage)),
            ],
        ];
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('
            SELECT p.*, c.name AS category_name, s.name AS supplier_name, u.code AS unit_code,
                   b.name AS brand_name, t.rate AS tax_rate,
                   COALESCE(SUM(sl.quantity), 0) AS stock_total
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            LEFT JOIN units u ON u.id = p.unit_id
            LEFT JOIN brands b ON b.id = p.brand_id
            LEFT JOIN taxes t ON t.id = p.tax_id
            LEFT JOIN stock_levels sl ON sl.product_id = p.id
            WHERE p.id = :id
            GROUP BY p.id
            LIMIT 1
        ');
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();

        if (!$result) {
            return null;
        }

        $mediaStmt = $this->pdo->prepare('SELECT * FROM product_media WHERE product_id = :id ORDER BY id DESC');
        $mediaStmt->execute([':id' => $id]);
        $result['media'] = $mediaStmt->fetchAll();

        $whStmt = $this->pdo->prepare('
            SELECT sl.warehouse_id, w.code AS warehouse_code, w.name AS warehouse_name, sl.quantity, sl.reserved_quantity
            FROM stock_levels sl
            INNER JOIN warehouses w ON w.id = sl.warehouse_id
            WHERE sl.product_id = :id
            ORDER BY w.name ASC
        ');
        $whStmt->execute([':id' => $id]);
        $result['stock_by_warehouse'] = $whStmt->fetchAll();

        return $result;
    }

    public function lowStock(): array
    {
        // Requete compatible MySQL/MariaDB avec GROUP BY (MAX dans HAVING).
        $hasMinStock = $this->columnExists('products', 'min_stock');
        $hasIsActive = $this->columnExists('products', 'is_active');

        $where = $hasIsActive ? 'WHERE p.is_active = 1' : '';
        $having = $hasMinStock
            ? 'HAVING stock_total <= GREATEST(MAX(COALESCE(p.min_stock, 0)), MAX(COALESCE(p.reorder_level, 0)))'
            : 'HAVING stock_total <= MAX(COALESCE(p.reorder_level, 0))';

        $sql = "
            SELECT p.id, p.sku, p.name,
                   " . ($hasMinStock ? "MAX(COALESCE(p.min_stock, 0))" : "0") . " AS min_stock,
                   MAX(COALESCE(p.reorder_level, 0)) AS reorder_level,
                   COALESCE(SUM(sl.quantity), 0) AS stock_total
            FROM products p
            LEFT JOIN stock_levels sl ON sl.product_id = p.id
            {$where}
            GROUP BY p.id
            {$having}
            ORDER BY stock_total ASC
        ";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function stockLevel(int $productId, int $warehouseId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT warehouse_id, quantity FROM stock_levels WHERE product_id = :product_id AND warehouse_id = :warehouse_id LIMIT 1');
        $stmt->execute([':product_id' => $productId, ':warehouse_id' => $warehouseId]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return ['warehouse_id' => (int)$row['warehouse_id'], 'quantity' => (int)$row['quantity']];
    }

    public function upsertStockLevel(int $productId, int $warehouseId, int $quantity): void
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO stock_levels (product_id, warehouse_id, quantity, updated_at)
            VALUES (:product_id, :warehouse_id, :quantity, NOW())
            ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = NOW()
        ');
        $stmt->execute([
            ':product_id' => $productId,
            ':warehouse_id' => $warehouseId,
            ':quantity' => $quantity,
        ]);
    }

    protected function buildWhere(array $filters): array
    {
        $clauses = [];
        $params = [];

        foreach ($filters as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            if ($key === 'q') {
                $clauses[] = '(p.sku LIKE :f_q OR p.barcode LIKE :f_q OR p.name LIKE :f_q OR p.description LIKE :f_q)';
                $params[':f_q'] = '%' . $value . '%';
                continue;
            }

            if (!in_array($key, $this->filterable, true)) {
                continue;
            }

            $token = ':f_' . $key;
            $clauses[] = 'p.' . $key . ' = ' . $token;
            $params[$token] = $value;
        }

        return [$clauses !== [] ? 'WHERE ' . implode(' AND ', $clauses) : '', $params];
    }

    private function columnExists(string $table, string $column): bool
    {
        // Petit cache local pour accelerer les appels repetes.
        $cacheKey = $table . '.' . $column;
        if (array_key_exists($cacheKey, self::$columnExistsCache)) {
            return self::$columnExistsCache[$cacheKey];
        }

        $stmt = $this->pdo->prepare('
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_schema = DATABASE()
              AND table_name = :table_name
              AND column_name = :column_name
        ');
        $stmt->execute([
            ':table_name' => $table,
            ':column_name' => $column,
        ]);

        $exists = (int)$stmt->fetchColumn() > 0;
        self::$columnExistsCache[$cacheKey] = $exists;
        return $exists;
    }
}
