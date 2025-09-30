import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatFileSize } from '@/lib/background-removal';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
  isProcessing: boolean;
  maxFiles?: number;
}

const ACCEPTED_FILE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ImageUploader = ({ onImagesSelected, isProcessing, maxFiles = 10 }: ImageUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles);
    }
    
    if (acceptedFiles.length > 0) {
      onImagesSelected(acceptedFiles);
    }
  }, [onImagesSelected]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    disabled: isProcessing,
  });

  const hasRejectedFiles = fileRejections.length > 0;

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`
          relative cursor-pointer border-2 border-dashed transition-all duration-300 p-12
          ${isDragActive 
            ? 'border-primary bg-gradient-ai-secondary shadow-ai' 
            : 'border-muted hover:border-primary hover:bg-gradient-ai-secondary'
          }
          ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-gradient-ai p-3">
            {isDragActive ? (
              <Upload className="h-8 w-8 text-white" />
            ) : (
              <Image className="h-8 w-8 text-white" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragActive 
                ? 'Drop your images here' 
                : 'Upload Images to Remove Background'
              }
            </h3>
            <p className="text-muted-foreground">
              Drag & drop images here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PNG, JPG, JPEG, WEBP • Max {formatFileSize(MAX_FILE_SIZE)} per file
            </p>
          </div>

          {!isDragActive && (
            <Button 
              variant="ai" 
              size="lg" 
              disabled={isProcessing}
              className="pointer-events-none"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          )}
        </div>
      </Card>

      {hasRejectedFiles && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some files were rejected:
            <ul className="mt-1 list-disc list-inside">
              {fileRejections.map((rejection, index) => (
                <li key={index} className="text-sm">
                  {rejection.file.name}: {rejection.errors[0]?.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageUploader;