<?php
declare(strict_types=1);

namespace App\Application\Services;

use App\Infrastructure\Persistence\AuditRepository;
use App\Infrastructure\Persistence\RoleRepository;
use App\Infrastructure\Persistence\UserRepository;
use App\Shared\Http\HttpException;
use App\Shared\Security\PasswordService;

final class UserService
{
    public function __construct(
        private readonly UserRepository $repository,
        private readonly RoleRepository $roleRepository,
        private readonly PasswordService $passwordService,
        private readonly AuditRepository $auditRepository
    ) {
    }

    public function paginate(int $page, int $perPage, array $filters = []): array
    {
        return $this->repository->paginate($page, $perPage, $filters);
    }

    public function findById(int $id): array
    {
        $user = $this->repository->findById($id);
        if (!$user) {
            throw new HttpException('User not found', 404);
        }

        unset($user['password_hash']);
        return $user;
    }

    public function create(array $payload, int $actorId, ?string $ip): int
    {
        foreach (['full_name', 'email', 'password', 'role'] as $field) {
            if (empty($payload[$field])) {
                throw new HttpException("Field '{$field}' is required", 422);
            }
        }

        $roleId = $this->roleRepository->idByCode((string)$payload['role']);
        if (!$roleId) {
            throw new HttpException('Unknown role', 422);
        }

        $id = $this->repository->create([
            'full_name' => $payload['full_name'],
            'email' => strtolower((string)$payload['email']),
            'password_hash' => $this->passwordService->hash((string)$payload['password']),
            'role_id' => $roleId,
            'is_active' => (int)($payload['is_active'] ?? 1),
        ]);

        $this->auditRepository->log($actorId, 'CREATE', 'user', $id, ['email' => $payload['email'], 'role' => strtoupper((string)$payload['role'])], $ip);

        return $id;
    }

    public function update(int $id, array $payload, int $actorId, ?string $ip): void
    {
        $user = $this->repository->findById($id);
        if (!$user) {
            throw new HttpException('User not found', 404);
        }

        $update = [];

        if (isset($payload['full_name'])) {
            $update['full_name'] = $payload['full_name'];
        }

        if (isset($payload['email'])) {
            $update['email'] = strtolower((string)$payload['email']);
        }

        if (isset($payload['is_active'])) {
            $update['is_active'] = (int)$payload['is_active'];
        }

        if (!empty($payload['role'])) {
            $roleId = $this->roleRepository->idByCode((string)$payload['role']);
            if (!$roleId) {
                throw new HttpException('Unknown role', 422);
            }
            $update['role_id'] = $roleId;
        }

        if (!empty($payload['password'])) {
            $update['password_hash'] = $this->passwordService->hash((string)$payload['password']);
        }

        if ($update === []) {
            throw new HttpException('No data to update', 422);
        }

        $this->repository->update($id, $update);
        $this->auditRepository->log($actorId, 'UPDATE', 'user', $id, array_keys($update), $ip);
    }

    public function delete(int $id, int $actorId, ?string $ip): void
    {
        if (!$this->repository->findById($id)) {
            throw new HttpException('User not found', 404);
        }

        $this->repository->delete($id);
        $this->auditRepository->log($actorId, 'DELETE', 'user', $id, [], $ip);
    }
}