import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Download, Eye, EyeOff } from 'lucide-react';
import { ProcessingProgress, ProcessingResult } from '@/types/engines';

interface ProcessingPanelProps {
  originalImage: HTMLImageElement | null;
  processedResult: ProcessingResult | null;
  isProcessing: boolean;
  progress: ProcessingProgress | null;
  onDownload: (blob: Blob, filename: string) => void;
}

export const ProcessingPanel = ({
  originalImage,
  processedResult,
  isProcessing,
  progress,
  onDownload
}: ProcessingPanelProps) => {
  const [showComparison, setShowComparison] = useState(true);

  const handleDownload = () => {
    if (processedResult) {
      const filename = `bg-removed-${Date.now()}.png`;
      onDownload(processedResult.blob, filename);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Processing Results
          {processedResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className="ml-auto"
            >
              {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showComparison ? 'Hide' : 'Show'} Original
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        {isProcessing && progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress.stage}</span>
              <span>{Math.round(progress.progress)}%</span>
            </div>
            <Progress value={progress.progress} />
            {progress.message && (
              <p className="text-sm text-muted-foreground">{progress.message}</p>
            )}
          </div>
        )}

        {/* Results */}
        {processedResult && (
          <div className="space-y-4">
            {/* Image Display */}
            <div className="grid gap-4" style={{ gridTemplateColumns: showComparison ? '1fr 1fr' : '1fr' }}>
              {showComparison && originalImage && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Original</h4>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={originalImage.src}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Processed</h4>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%23000'%3e%3crect width='10' height='10'/%3e%3crect x='10' y='10' width='10' height='10'/%3e%3c/g%3e%3c/svg%3e")`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                  <img
                    src={URL.createObjectURL(processedResult.blob)}
                    alt="Processed"
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {processedResult.engineUsed}
                </Badge>
                <Badge variant="outline">
                  {processedResult.processingTime.toFixed(0)}ms
                </Badge>
                <Badge variant="outline">
                  {processedResult.resolution.width}×{processedResult.resolution.height}
                </Badge>
                <Badge variant="outline">
                  {(processedResult.blob.size / 1024 / 1024).toFixed(2)}MB
                </Badge>
              </div>
            </div>

            {/* Download Button */}
            <Button onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isProcessing && !processedResult && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Upload an image to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};