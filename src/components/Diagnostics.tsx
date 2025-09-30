import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Zap, Clock, MemoryStick } from 'lucide-react';
import { EngineCapabilities, ProcessingResult } from '@/types/engines';

interface DiagnosticsProps {
  capabilities: EngineCapabilities | null;
  lastResult: ProcessingResult | null;
}

export const Diagnostics = ({ capabilities, lastResult }: DiagnosticsProps) => {
  const formatMemory = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Monitor className="h-5 w-5" />
          System Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Capabilities */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Device Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            {capabilities?.webgpu && (
              <Badge variant="default" className="gap-1">
                <Zap className="h-3 w-3" />
                WebGPU
              </Badge>
            )}
            {capabilities?.webgl && (
              <Badge variant="secondary" className="gap-1">
                <Monitor className="h-3 w-3" />
                WebGL
              </Badge>
            )}
            {capabilities?.wasm && (
              <Badge variant="outline" className="gap-1">
                <MemoryStick className="h-3 w-3" />
                WebAssembly
              </Badge>
            )}
          </div>
          {capabilities && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Max Resolution: {capabilities.maxResolution}px</p>
              <p>Available Memory: {formatMemory(capabilities.estimatedMemory)}</p>
              {capabilities.threadsAvailable > 0 && (
                <p>CPU Threads: {capabilities.threadsAvailable}</p>
              )}
              <p>Offline Ready: {capabilities.isOfflineReady ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>

        {/* Last Processing Stats */}
        {lastResult && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Last Processing</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Engine: {lastResult.engineUsed}</p>
              <p>Model: {lastResult.modelUsed}</p>
              {lastResult.executionProvider && (
                <p>Provider: {lastResult.executionProvider}</p>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Time: {formatTime(lastResult.processingTime)}</span>
              </div>
              <p>Resolution: {lastResult.resolution.width}×{lastResult.resolution.height}</p>
              {lastResult.memoryUsed && (
                <p>Memory Used: {formatMemory(lastResult.memoryUsed)}</p>
              )}
              {lastResult.refinementApplied && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  HQ-SAM Applied
                </Badge>
              )}
            </div>
          </div>
        )}

        {!capabilities && !lastResult && (
          <p className="text-sm text-muted-foreground">
            Start processing to see diagnostics information
          </p>
        )}
      </CardContent>
    </Card>
  );
};