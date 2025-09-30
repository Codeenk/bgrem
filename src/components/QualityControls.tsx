import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gauge, Zap, Info } from 'lucide-react';
import { ProcessingOptions, QualityPreset, AccelerationType } from '@/types/engines';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QualityControlsProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
}

export const QualityControls = ({ options, onChange }: QualityControlsProps) => {
  const updateOptions = (updates: Partial<ProcessingOptions>) => {
    onChange({ ...options, ...updates });
  };

  const getQualityDescription = (quality: QualityPreset): string => {
    switch (quality) {
      case 'fast': return 'Reduced resolution for speed (~1024px max)';
      case 'balanced': return 'Good quality and performance (~2048px max)';
      case 'high': return 'Best quality, slower processing (~4096px max)';
    }
  };

  const getAccelerationDescription = (acceleration: AccelerationType): string => {
    switch (acceleration) {
      case 'auto': return 'Automatically select best available (WebGPU > WebGL > WASM)';
      case 'webgpu': return 'Force WebGPU (fastest, modern browsers only)';
      case 'webgl': return 'Force WebGL (good compatibility and speed)';
      case 'wasm': return 'Force WebAssembly (slowest, best compatibility)';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gauge className="h-5 w-5" />
          Quality & Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quality Preset */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="quality-select" className="text-sm font-medium">
              Quality Preset
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Higher quality uses more processing time and memory</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={options.quality} onValueChange={(value: QualityPreset) => updateOptions({ quality: value })}>
            <SelectTrigger id="quality-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fast">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Fast</span>
                </div>
              </SelectItem>
              <SelectItem value="balanced">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  <span>Balanced</span>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-1 py-0 text-xs">HQ</Badge>
                  <span>High Quality</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getQualityDescription(options.quality)}
          </p>
        </div>

        {/* GPU Acceleration */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="acceleration-select" className="text-sm font-medium">
              GPU Acceleration
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>GPU acceleration can significantly improve processing speed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={options.acceleration} onValueChange={(value: AccelerationType) => updateOptions({ acceleration: value })}>
            <SelectTrigger id="acceleration-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Recommended)</SelectItem>
              <SelectItem value="webgpu">Force WebGPU</SelectItem>
              <SelectItem value="webgl">Force WebGL</SelectItem>
              <SelectItem value="wasm">Force WebAssembly</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getAccelerationDescription(options.acceleration)}
          </p>
        </div>

        {/* Full Resolution Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="full-resolution" className="text-sm font-medium">
              Process at Full Resolution
            </Label>
            <p className="text-xs text-muted-foreground">
              Process images at original size (may use significant memory)
            </p>
          </div>
          <Switch
            id="full-resolution"
            checked={options.fullResolution}
            onCheckedChange={(checked) => updateOptions({ fullResolution: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};