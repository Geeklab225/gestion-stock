<?php
declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Shared\Database\Database;
use PDO;

final class AuditRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    public function log(?int $userId, string $action, string $entityType, ?int $entityId, array $payload = [], ?string $ipAddress = null): void
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO audits (user_id, action, entity_type, entity_id, payload_json, ip_address, created_at)
            VALUES (:user_id, :action, :entity_type, :entity_id, :payload_json, :ip_address, NOW())
        ');

        $stmt->execute([
            ':user_id' => $userId,
            ':action' => $action,
            ':entity_type' => $entityType,
            ':entity_id' => $entityId,
            ':payload_json' => $payload !== [] ? json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
            ':ip_address' => $ipAddress,
        ]);
    }
}