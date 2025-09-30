import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Settings, Gauge } from 'lucide-react';
import { ProcessingOptions, EngineCapabilities, QualityPreset, AccelerationType } from '@/types/engines';

interface EngineSelectorProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  capabilities: EngineCapabilities | null;
  isAdvancedMode: boolean;
  onAdvancedModeChange: (advanced: boolean) => void;
}

export const EngineSelector = ({ 
  options, 
  onChange, 
  capabilities, 
  isAdvancedMode, 
  onAdvancedModeChange 
}: EngineSelectorProps) => {
  const updateOptions = (updates: Partial<ProcessingOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <div className="space-y-4">
      {/* Mode Switch */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Processing Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="advanced-mode" className="text-sm font-medium">
                Advanced Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                {isAdvancedMode 
                  ? 'Access ONNX models, HQ-SAM refinement, and detailed controls'
                  : 'Simple, fast background removal with optimized defaults'
                }
              </p>
            </div>
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={onAdvancedModeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality & Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gauge className="h-5 w-5" />
            Quality & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quality Preset</Label>
            <Select
              value={options.quality}
              onValueChange={(value: QualityPreset) => updateOptions({ quality: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">
                  Fast - Reduced resolution for speed
                </SelectItem>
                <SelectItem value="balanced">
                  Balanced - Good quality and speed
                </SelectItem>
                <SelectItem value="high">
                  High - Maximum quality
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="full-res" className="text-sm font-medium">
                Full Resolution Processing
              </Label>
              <p className="text-sm text-muted-foreground">
                Process at original resolution (may use more memory)
              </p>
            </div>
            <Switch
              id="full-res"
              checked={options.fullResolution}
              onCheckedChange={(checked) => updateOptions({ fullResolution: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* GPU Acceleration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            Acceleration
            {capabilities && (
              <div className="flex gap-1 ml-auto">
                {capabilities.webgpu && <Badge variant="secondary">WebGPU</Badge>}
                {capabilities.webgl && <Badge variant="secondary">WebGL</Badge>}
                {capabilities.wasm && <Badge variant="secondary">WASM</Badge>}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Acceleration Mode</Label>
            <Select
              value={options.acceleration}
              onValueChange={(value: AccelerationType) => updateOptions({ acceleration: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  Auto - Best available
                </SelectItem>
                <SelectItem value="webgpu" disabled={!capabilities?.webgpu}>
                  Force WebGPU {!capabilities?.webgpu && '(Not available)'}
                </SelectItem>
                <SelectItem value="webgl" disabled={!capabilities?.webgl}>
                  Force WebGL {!capabilities?.webgl && '(Not available)'}
                </SelectItem>
                <SelectItem value="wasm">
                  Force WASM
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Controls */}
      {isAdvancedMode && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="h-5 w-5" />
              Advanced Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="hq-sam" className="text-sm font-medium">
                  Refine with HQ-SAM
                </Label>
                <p className="text-sm text-muted-foreground">
                  High-quality refinement for complex edges (slower)
                </p>
              </div>
              <Switch
                id="hq-sam"
                checked={options.refineWithHQSAM}
                onCheckedChange={(checked) => updateOptions({ refineWithHQSAM: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="transformers" className="text-sm font-medium">
                  Use Transformers.js
                </Label>
                <p className="text-sm text-muted-foreground">
                  Alternative engine for broader device support
                </p>
              </div>
              <Switch
                id="transformers"
                checked={options.useTransformersJS}
                onCheckedChange={(checked) => updateOptions({ useTransformersJS: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnostics */}
      {capabilities && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Device Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Max Resolution:</span>
                <span>{capabilities.maxResolution}px</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Estimate:</span>
                <span>{Math.round(capabilities.estimatedMemory / 1024 / 1024)}MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};