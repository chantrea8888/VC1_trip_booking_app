<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicFileController extends Controller

{
    public function show(string $path): Response
    {
        $normalized = str_replace('\\', '/', trim($path));
        $normalized = ltrim($normalized, '/');

        if ($normalized === '' || Str::contains($normalized, ['..', './', '.\\'])) {
            abort(404);
        }

        $disk = Storage::disk('public');

        if (!$disk->exists($normalized)) {
            abort(404);
        }

        $fullPath = $disk->path($normalized);
        $mimeType = $disk->mimeType($normalized) ?: 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }
}

