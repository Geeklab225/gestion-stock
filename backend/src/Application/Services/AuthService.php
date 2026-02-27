<?php
declare(strict_types=1);

namespace App\Application\Services;

use App\Domain\Contracts\AuthTokenRepositoryInterface;
use App\Domain\Contracts\UserRepositoryInterface;
use App\Infrastructure\Persistence\AuditRepository;
use App\Shared\Http\HttpException;
use App\Shared\Security\PasswordService;
use App\Shared\Security\TokenService;

final class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly AuthTokenRepositoryInterface $tokenRepository,
        private readonly PasswordService $passwordService,
        private readonly TokenService $tokenService,
        private readonly AuditRepository $auditRepository
    ) {
    }

    public function login(string $email, string $password, ?string $ipAddress): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !$this->passwordService->verify($password, $user['password_hash'])) {
            throw new HttpException('Invalid credentials', 401);
        }

        if (!(bool)$user['is_active']) {
            throw new HttpException('Inactive account', 403);
        }

        $plainToken = $this->tokenService->generatePlainToken();
        $tokenHash = $this->tokenService->hash($plainToken);
        $this->tokenRepository->create((int)$user['id'], $tokenHash);

        $this->auditRepository->log((int)$user['id'], 'LOGIN', 'auth', (int)$user['id'], [], $ipAddress);

        return [
            'token' => $plainToken,
            'user' => [
                'id' => (int)$user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'role' => $user['role_code'],
            ],
        ];
    }

    public function me(string $token): array
    {
        $user = $this->resolveUserByToken($token);

        return [
            'id' => (int)$user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role_code'],
        ];
    }

    public function logout(string $token, ?string $ipAddress): void
    {
        $user = $this->resolveUserByToken($token);
        $tokenHash = $this->tokenService->hash($token);
        $this->tokenRepository->revokeByHash($tokenHash);

        $this->auditRepository->log((int)$user['id'], 'LOGOUT', 'auth', (int)$user['id'], [], $ipAddress);
    }

    public function resolveUserByToken(string $token): array
    {
        $tokenHash = $this->tokenService->hash($token);
        $user = $this->userRepository->findByTokenHash($tokenHash);

        if (!$user || !(bool)$user['is_active']) {
            throw new HttpException('Unauthorized', 401);
        }

        if (isset($user['token_id'])) {
            $this->tokenRepository->touch((int)$user['token_id']);
        }

        return $user;
    }
}