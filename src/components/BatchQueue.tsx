import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Download, Package, Play, Pause } from 'lucide-react';
import { ProcessingOptions, ProcessingResult } from '@/types/engines';

interface BatchItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: ProcessingResult;
  error?: string;
}

interface BatchQueueProps {
  files: File[];
  options: ProcessingOptions;
  onProcess: (file: File, options: ProcessingOptions) => Promise<ProcessingResult>;
  onClear: () => void;
}

export const BatchQueue = ({ files, options, onProcess, onClear }: BatchQueueProps) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const initializeBatch = useCallback(() => {
    const batchItems: BatchItem[] = files.map((file, index) => ({
      id: `${file.name}-${index}`,
      file,
      status: 'pending',
      progress: 0
    }));
    setItems(batchItems);
    setCurrentIndex(0);
  }, [files]);

  const processBatch = async () => {
    if (items.length === 0) initializeBatch();
    
    setIsProcessing(true);
    
    for (let i = currentIndex; i < items.length; i++) {
      const item = items[i];
      
      if (item.status === 'completed') continue;
      
      // Update status to processing
      setItems(prev => prev.map(it => 
        it.id === item.id ? { ...it, status: 'processing' as const, progress: 0 } : it
      ));
      
      try {
        const result = await onProcess(item.file, options);
        
        // Update with completed result
        setItems(prev => prev.map(it => 
          it.id === item.id 
            ? { ...it, status: 'completed' as const, progress: 100, result }
            : it
        ));
      } catch (error) {
        // Update with error
        setItems(prev => prev.map(it => 
          it.id === item.id 
            ? { 
                ...it, 
                status: 'error' as const, 
                progress: 0, 
                error: error instanceof Error ? error.message : 'Processing failed' 
              }
            : it
        ));
      }
      
      setCurrentIndex(i + 1);
    }
    
    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const completedItems = items.filter(item => item.status === 'completed' && item.result);
    
    if (completedItems.length === 0) return;
    
    // Use JSZip if available, otherwise download individually
    if (completedItems.length === 1) {
      const item = completedItems[0];
      const url = URL.createObjectURL(item.result!.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.file.name.split('.')[0]}-removed.${options.exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For multiple files, create individual downloads
      // In a real implementation, you'd use JSZip here
      completedItems.forEach((item, index) => {
        setTimeout(() => {
          const url = URL.createObjectURL(item.result!.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${item.file.name.split('.')[0]}-removed.${options.exportFormat}`;
          a.click();
          URL.revokeObjectURL(url);
        }, index * 100);
      });
    }
  };

  const completedCount = items.filter(item => item.status === 'completed').length;
  const errorCount = items.filter(item => item.status === 'error').length;
  const overallProgress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Batch Processing
          </div>
          <div className="flex items-center gap-2">
            {!isProcessing ? (
              <Button onClick={processBatch} size="sm" disabled={items.length === 0}>
                <Play className="h-4 w-4 mr-1" />
                Start Batch
              </Button>
            ) : (
              <Button onClick={() => setIsProcessing(false)} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            <Button onClick={onClear} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        {items.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completedCount} / {items.length}</span>
            </div>
            <Progress value={overallProgress} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedCount} completed</span>
              {errorCount > 0 && <span className="text-destructive">{errorCount} errors</span>}
            </div>
          </div>
        )}

        {/* Batch Items */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(item.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    item.status === 'completed' ? 'default' :
                    item.status === 'processing' ? 'secondary' :
                    item.status === 'error' ? 'destructive' : 'outline'
                  }
                  className="text-xs"
                >
                  {item.status}
                </Badge>
                
                {item.status === 'processing' && (
                  <div className="w-12">
                    <Progress value={item.progress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {completedCount > 0 && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {completedCount} image(s) processed
            </span>
            <Button onClick={downloadAll} size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download All
            </Button>
          </div>
        )}

        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Upload images to start batch processing
          </p>
        )}
      </CardContent>
    </Card>
  );
};