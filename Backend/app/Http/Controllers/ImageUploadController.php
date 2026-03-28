<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload an image to the server.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB Max
            'folder' => 'nullable|string'
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $folder = $request->input('folder', 'uploads');
            
            // Generate a unique name
            $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
            
            // Store the file
            $path = $file->storeAs($folder, $filename, 'public');
            
            // Generate the full URL
            $url = asset('storage/' . $path);

            return response()->json([
                'success' => true,
                'path' => $path,
                'url' => $url,
                'message' => 'Image uploaded successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image provided'
        ], 400);
    }
}
