import { useState, useEffect } from 'react';
import { Download, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { removeBackground, loadImage, downloadBlob, formatFileSize } from '@/lib/background-removal';
import { useToast } from '@/hooks/use-toast';

interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedBlob?: Blob;
  processedUrl?: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface ImageProcessorProps {
  files: File[];
  onClearFiles: () => void;
  autoStart?: boolean;
}

const ImageProcessor = ({ files, onClearFiles, autoStart = false }: ImageProcessorProps) => {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const { toast } = useToast();

  // Initialize processed images when files change
  useEffect(() => {
    if (files.length > 0 && processedImages.length === 0) {
      const initialImages: ProcessedImage[] = files.map((file, index) => ({
        id: `${file.name}-${index}`,
        originalFile: file,
        originalUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'pending',
      }));
      setProcessedImages(initialImages);
    }
  }, [files.length]);

  const processImages = async () => {
    setIsProcessing(true);

    // Process each image
    for (let i = 0; i < processedImages.length; i++) {
      const imageData = processedImages[i];
      
      try {
        // Update status to processing
        setProcessedImages(prev => 
          prev.map(img => 
            img.id === imageData.id 
              ? { ...img, status: 'processing' as const }
              : img
          )
        );

        // Load image and remove background
        const imageElement = await loadImage(imageData.originalFile);
        
        const processedBlob = await removeBackground(imageElement, (progress) => {
          setProcessedImages(prev => 
            prev.map(img => 
              img.id === imageData.id 
                ? { ...img, progress }
                : img
            )
          );
        });

        // Update with completed result
        setProcessedImages(prev => 
          prev.map(img => 
            img.id === imageData.id 
              ? { 
                  ...img, 
                  processedBlob,
                  processedUrl: URL.createObjectURL(processedBlob),
                  progress: 100,
                  status: 'completed' as const 
                }
              : img
          )
        );

        toast({
          title: "Background removed!",
          description: `Successfully processed ${imageData.originalFile.name}`,
        });

      } catch (error) {
        console.error('Error processing image:', error);
        
        setProcessedImages(prev => 
          prev.map(img => 
            img.id === imageData.id 
              ? { 
                  ...img, 
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              : img
          )
        );

        toast({
          title: "Processing failed",
          description: `Failed to process ${imageData.originalFile.name}`,
          variant: "destructive",
        });
      }
    }
    
    setIsProcessing(false);
  };

  const downloadImage = (image: ProcessedImage) => {
    if (!image.processedBlob) return;
    
    const filename = image.originalFile.name.replace(/\.[^/.]+$/, '') + '_no_bg.png';
    downloadBlob(image.processedBlob, filename);
  };

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    processedImages
      .filter(img => img.processedBlob)
      .forEach((img, index) => {
        const filename = img.originalFile.name.replace(/\.[^/.]+$/, '') + '_no_bg.png';
        zip.file(filename, img.processedBlob!);
      });
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'background_removed_images.zip');
  };

  const completedImages = processedImages.filter(img => img.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={processImages}
            disabled={isProcessing || completedImages.length > 0}
            variant="ai"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Remove Backgrounds'
            )}
          </Button>
          
          <Button
            onClick={onClearFiles}
            variant="outline"
            disabled={isProcessing}
          >
            Clear All
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {completedImages.length > 1 && (
            <Button
              onClick={downloadAll}
              variant="success"
              disabled={isProcessing}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All ({completedImages.length})
            </Button>
          )}
          
          <Button
            onClick={() => setShowComparison(!showComparison)}
            variant="ghost"
            size="sm"
          >
            {showComparison ? (
              <><EyeOff className="mr-2 h-4 w-4" /> Hide Original</>
            ) : (
              <><Eye className="mr-2 h-4 w-4" /> Show Original</>
            )}
          </Button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid gap-6">
        {processedImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{image.originalFile.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    image.status === 'completed' ? 'default' :
                    image.status === 'processing' ? 'secondary' :
                    image.status === 'error' ? 'destructive' : 'outline'
                  }>
                    {image.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(image.originalFile.size)}
                  </span>
                </div>
              </div>
              
              {image.status === 'processing' && (
                <Progress value={image.progress} className="mt-2" />
              )}
            </CardHeader>
            
            <CardContent>
              <div className={`grid gap-4 ${showComparison ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Original Image */}
                {showComparison && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Original</h4>
                    <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={image.originalUrl}
                        alt="Original"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                )}
                
                {/* Processed Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Background Removed
                    </h4>
                    {image.status === 'completed' && (
                      <Button
                        onClick={() => downloadImage(image)}
                        variant="ai-outline"
                        size="sm"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    )}
                  </div>
                  
                  <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                    {image.status === 'processing' && (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    
                    {image.status === 'error' && (
                      <div className="flex items-center justify-center h-full text-center p-4">
                        <div className="space-y-2">
                          <p className="text-destructive font-medium">Processing failed</p>
                          {image.error && (
                            <p className="text-sm text-muted-foreground">{image.error}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {image.processedUrl && (
                      <div className="relative h-full w-full">
                        {/* Checkered background to show transparency */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[length:20px_20px] bg-[0_0,0_10px,10px_-10px,-10px_0px]" />
                        <img
                          src={image.processedUrl}
                          alt="Background removed"
                          className="relative h-full w-full object-contain"
                        />
                      </div>
                    )}
                    
                    {image.status === 'pending' && (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Click "Remove Backgrounds" to start
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageProcessor;