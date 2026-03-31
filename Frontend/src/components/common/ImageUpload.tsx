import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/imageService';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onUploadSuccess: (url: string, path: string) => void;
  folder?: string;
  label?: string;
  currentImage?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  folder = 'uploads',
  label = 'Upload Image',
  currentImage,
  className = '',
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const response = await uploadImage(file, folder);
      if (response.success) {
        toast.success('Image uploaded successfully');
        onUploadSuccess(response.url, response.path);
      } else {
        toast.error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        {preview ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isUploading ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            ) : (
              <button
                onClick={removeImage}
                type="button"
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
          >
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-blue-600" />
              )}
            </div>
            <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              PNG, JPG or GIF (max. 5MB)
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
