<?php
declare(strict_types=1);

namespace App\Shared\Security;

final class PasswordService
{
    public function hash(string $plain): string
    {
        return password_hash($plain, PASSWORD_ARGON2ID);
    }

    public function verify(string $plain, string $hashed): bool
    {
        return password_verify($plain, $hashed);
    }
}