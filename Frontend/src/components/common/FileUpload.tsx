import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onUpload?: (files: File[]) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  label?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  label = 'Upload Documents',
  description = 'Drag and drop your files here, or click to browse'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<{ file: File; status: 'uploading' | 'success' | 'error'; id: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: File[] = [];
    const newFileEntries: { file: File; status: 'uploading' | 'success' | 'error'; id: string }[] = [];

    Array.from(newFiles).forEach(file => {
      const isTypeValid = acceptedTypes.includes(file.type);
      const isSizeValid = file.size <= maxSize * 1024 * 1024;

      if (isTypeValid && isSizeValid) {
        const id = Math.random().toString(36).substring(7);
        validFiles.push(file);
        newFileEntries.push({ file, status: 'uploading', id });
        
        // Simulate upload
        setTimeout(() => {
          setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'success' } : f));
        }, 1500);
      } else {
        alert(`Invalid file: ${file.name}. Please check type and size.`);
      }
    });

    setFiles(prev => [...prev, ...newFileEntries]);
    if (onUpload && validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all cursor-pointer text-center ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[0.99]' 
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
          accept={acceptedTypes.join(',')}
        />
        
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            isDragging ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{label}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Max size: {maxSize}MB</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>JPG, PNG, PDF</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Uploaded Files</h4>
            <div className="grid grid-cols-1 gap-3">
              {files.map((fileEntry) => (
                <motion.div
                  key={fileEntry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{fileEntry.file.name}</p>
                    <p className="text-[10px] text-slate-400">{(fileEntry.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {fileEntry.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                    {fileEntry.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {fileEntry.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(fileEntry.id);
                      }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
