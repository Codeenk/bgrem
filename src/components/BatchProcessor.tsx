import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Download, PackageOpen } from 'lucide-react';
import { ProcessingOptions, ProcessingResult } from '@/types/engines';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';
import { loadImage, downloadBlob } from '@/lib/background-removal';
import JSZip from 'jszip';

interface BatchItem {
  id: string;
  file: File;
  image?: HTMLImageElement;
  result?: ProcessingResult;
  error?: string;
  isProcessing: boolean;
}

interface BatchProcessorProps {
  files: File[];
  options: ProcessingOptions;
  onClearFiles: () => void;
}

export const BatchProcessor = ({ files, options, onClearFiles }: BatchProcessorProps) => {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { processImage } = useBackgroundRemoval();

  // Initialize batch items from files
const initializeBatch = useCallback(async () => {
    const items: BatchItem[] = await Promise.all(
      files.map(async (file, index) => {
        try {
          const image = await loadImage(file);
          return {
            id: `${index}-${file.name}`,
            file,
            image,
            isProcessing: false
          };
        } catch (error) {
          return {
            id: `${index}-${file.name}`,
            file,
            error: 'Failed to load image',
            isProcessing: false
          };
        }
      })
    );
    setBatchItems(items);
  }, [files]);

  // Process all items in batch
  const processBatch = useCallback(async () => {
    if (batchItems.length === 0) {
      await initializeBatch();
      return;
    }

    setIsProcessing(true);
    setOverallProgress(0);

    const itemsToProcess = batchItems.filter(item => item.image && !item.result && !item.error);
    
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      
      setBatchItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { ...prevItem, isProcessing: true }
          : prevItem
      ));

      try {
        const result = await processImage(item.image!, options);
        
        setBatchItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { ...prevItem, result, isProcessing: false }
            : prevItem
        ));
      } catch (error) {
        setBatchItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { ...prevItem, error: error instanceof Error ? error.message : 'Processing failed', isProcessing: false }
            : prevItem
        ));
      }

      setOverallProgress(((i + 1) / itemsToProcess.length) * 100);
    }

    setIsProcessing(false);
  }, [batchItems, initializeBatch, processImage, options]);

  // Download single item
  const downloadItem = useCallback((item: BatchItem) => {
    if (item.result) {
      const filename = `${item.file.name.split('.')[0]}-bg-removed.png`;
      downloadBlob(item.result.blob, filename);
    }
  }, []);

  // Download all as ZIP
  const downloadAll = useCallback(async () => {
    const processedItems = batchItems.filter(item => item.result);
    
    if (processedItems.length === 0) return;

    const zip = new JSZip();
    
    for (const item of processedItems) {
      const filename = `${item.file.name.split('.')[0]}-bg-removed.png`;
      zip.file(filename, item.result!.blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `bg-removed-batch-${Date.now()}.zip`);
  }, [batchItems]);

  // Remove item from batch
  const removeItem = useCallback((itemId: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Initialize batch on mount
  useState(() => {
    if (files.length > 0 && batchItems.length === 0) {
      initializeBatch();
    }
  });

  const completedCount = batchItems.filter(item => item.result).length;
  const errorCount = batchItems.filter(item => item.error).length;
  const processingCount = batchItems.filter(item => item.isProcessing).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PackageOpen className="h-5 w-5" />
            Batch Processing ({batchItems.length} items)
          </span>
          <div className="flex gap-2">
            {completedCount > 0 && (
              <Button variant="outline" size="sm" onClick={downloadAll}>
                <Download className="h-4 w-4 mr-2" />
                Download All ({completedCount})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClearFiles}>
              Clear All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing batch...</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} />
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-2">
          <Badge variant="secondary">{completedCount} completed</Badge>
          {processingCount > 0 && <Badge variant="outline">{processingCount} processing</Badge>}
          {errorCount > 0 && <Badge variant="destructive">{errorCount} failed</Badge>}
        </div>

        {/* Batch Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={processBatch}
            disabled={isProcessing || batchItems.length === 0}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : 'Process All Images'}
          </Button>
        </div>

        {/* Item List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {batchItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              {/* Thumbnail */}
              <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                {item.image && (
                  <img 
                    src={item.image.src} 
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(item.file.size / 1024 / 1024).toFixed(2)}MB</span>
                  {item.result && (
                    <>
                      <span>•</span>
                      <span>{item.result.processingTime.toFixed(0)}ms</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {item.isProcessing && (
                  <Badge variant="outline">Processing...</Badge>
                )}
                {item.result && (
                  <>
                    <Badge variant="secondary">Complete</Badge>
                    <Button size="sm" variant="outline" onClick={() => downloadItem(item)}>
                      <Download className="h-3 w-3" />
                    </Button>
                  </>
                )}
                {item.error && (
                  <Badge variant="destructive" title={item.error}>Error</Badge>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};