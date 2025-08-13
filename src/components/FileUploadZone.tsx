'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, Video, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  title: string;
  description: string;
  acceptedTypes: string;
  onUpload: (file: File) => void;
  className?: string;
  maxSize?: number; // in MB
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  title,
  description,
  acceptedTypes,
  onUpload,
  className,
  maxSize = 50, // 50MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    const acceptedExtensions = acceptedTypes.split(',').map((type) => type.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!acceptedExtensions.includes(fileExtension)) {
      setError(`File type must be one of: ${acceptedTypes}`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onUpload(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const getIcon = () => {
    if (acceptedTypes.includes('.mp4') || acceptedTypes.includes('.mov')) {
      return Video;
    }
    if (acceptedTypes.includes('.pdf') || acceptedTypes.includes('.doc')) {
      return FileText;
    }
    return Upload;
  };

  const IconComponent = getIcon();

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors',
          'bg-gray-700/50 border-gray-600',
          isDragOver && 'border-blue-400 bg-blue-900/20',
          'hover:border-gray-500 hover:bg-gray-700/70',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-gray-600/50">
            <IconComponent className="w-8 h-8 text-gray-300" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400 max-w-sm">{description}</p>
          </div>

          <div className="space-y-2">
            <Button variant="default" className="gap-2" size="sm">
              <Plus className="w-4 h-4" />
              Choose File
            </Button>
            <input
              type="file"
              accept={acceptedTypes}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
