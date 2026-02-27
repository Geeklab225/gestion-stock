<?php
declare(strict_types=1);

namespace App\Application\Services;

use RuntimeException;

final class FileStorageService
{
    public function __construct(
        private readonly string $basePath
    ) {
    }

    public function storeUploadedFile(array $file, string $category): array
    {
        $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($error !== UPLOAD_ERR_OK) {
            throw new RuntimeException('File upload failed');
        }

        $tmpName = (string)($file['tmp_name'] ?? '');
        $originalName = (string)($file['name'] ?? 'upload.bin');
        $mimeType = (string)($file['type'] ?? 'application/octet-stream');
        $size = (int)($file['size'] ?? 0);

        if ($tmpName === '' || !is_file($tmpName)) {
            throw new RuntimeException('Uploaded file is missing');
        }

        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $safeCategory = preg_replace('/[^a-zA-Z0-9_-]/', '-', $category) ?: 'misc';
        $relativeDir = $safeCategory . '/' . date('Y/m');
        $targetDir = rtrim($this->basePath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativeDir);

        if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
            throw new RuntimeException('Cannot create upload directory');
        }

        $unique = bin2hex(random_bytes(8));
        $fileName = $unique . ($extension !== '' ? '.' . $extension : '');
        $targetPath = $targetDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($tmpName, $targetPath)) {
            if (!rename($tmpName, $targetPath)) {
                throw new RuntimeException('Cannot persist uploaded file');
            }
        }

        return [
            'original_name' => $originalName,
            'stored_name' => $fileName,
            'mime_type' => $mimeType,
            'size' => $size,
            'relative_path' => $relativeDir . '/' . $fileName,
            'absolute_path' => $targetPath,
        ];
    }
}
