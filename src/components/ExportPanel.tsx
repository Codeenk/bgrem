import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Download, Image } from 'lucide-react';
import { ProcessingOptions, BackgroundType } from '@/types/engines';

interface ExportPanelProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  onExport: () => void;
  isProcessed: boolean;
}

export const ExportPanel = ({ options, onChange, onExport, isProcessed }: ExportPanelProps) => {
  const updateOptions = (updates: Partial<ProcessingOptions>) => {
    onChange({ ...options, ...updates });
  };

  const backgroundOptions: { value: BackgroundType; label: string; description: string }[] = [
    { value: 'transparent', label: 'Transparent', description: 'No background (PNG only)' },
    { value: 'color', label: 'Solid Color', description: 'Single color background' },
    { value: 'gradient', label: 'Gradient', description: 'Gradient background' },
    { value: 'blur', label: 'Blurred Original', description: 'Blurred version of original' },
    { value: 'image', label: 'Custom Image', description: 'Upload your own background' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Image className="h-5 w-5" />
          Background & Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Type */}
        <div className="space-y-2">
          <Label htmlFor="background-type" className="text-sm font-medium">
            Background Type
          </Label>
          <Select 
            value={options.backgroundType} 
            onValueChange={(value: BackgroundType) => updateOptions({ backgroundType: value })}
          >
            <SelectTrigger id="background-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {backgroundOptions.map(({ value, label, description }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex flex-col">
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Background Color Picker */}
        {options.backgroundType === 'color' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Background Color</Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: options.backgroundColor || '#ffffff' }}
              />
              <input
                type="color"
                value={options.backgroundColor || '#ffffff'}
                onChange={(e) => updateOptions({ backgroundColor: e.target.value })}
                className="w-full h-8 rounded border bg-transparent"
              />
            </div>
          </div>
        )}

        {/* Gradient Controls */}
        {options.backgroundType === 'gradient' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Gradient Colors</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={options.backgroundGradient?.start || '#ff0000'}
                onChange={(e) => updateOptions({ 
                  backgroundGradient: { 
                    ...options.backgroundGradient, 
                    start: e.target.value,
                    end: options.backgroundGradient?.end || '#0000ff',
                    direction: options.backgroundGradient?.direction || 45
                  }
                })}
                className="w-12 h-8 rounded border"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input
                type="color"
                value={options.backgroundGradient?.end || '#0000ff'}
                onChange={(e) => updateOptions({ 
                  backgroundGradient: { 
                    ...options.backgroundGradient, 
                    start: options.backgroundGradient?.start || '#ff0000',
                    end: e.target.value,
                    direction: options.backgroundGradient?.direction || 45
                  }
                })}
                className="w-12 h-8 rounded border"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Direction: {options.backgroundGradient?.direction || 45}°</Label>
              <Slider
                value={[options.backgroundGradient?.direction || 45]}
                onValueChange={([value]) => updateOptions({ 
                  backgroundGradient: { 
                    ...options.backgroundGradient, 
                    start: options.backgroundGradient?.start || '#ff0000',
                    end: options.backgroundGradient?.end || '#0000ff',
                    direction: value
                  }
                })}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Background Image Upload */}
        {options.backgroundType === 'image' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Background Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  updateOptions({ backgroundImage: file });
                }
              }}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
        )}

        {/* Export Format */}
        <div className="space-y-2">
          <Label htmlFor="export-format" className="text-sm font-medium">
            Export Format
          </Label>
          <Select 
            value={options.exportFormat} 
            onValueChange={(value: 'png' | 'webp' | 'jpeg') => updateOptions({ exportFormat: value })}
          >
            <SelectTrigger id="export-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG (Best for transparency)</SelectItem>
              <SelectItem value="webp">WebP (Smaller file size)</SelectItem>
              <SelectItem value="jpeg">JPEG (Solid backgrounds only)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quality Slider */}
        {(options.exportFormat === 'webp' || options.exportFormat === 'jpeg') && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Export Quality: {options.exportQuality}%
            </Label>
            <Slider
              value={[options.exportQuality]}
              onValueChange={([value]) => updateOptions({ exportQuality: value })}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {/* Export Button */}
        <Button 
          onClick={onExport}
          disabled={!isProcessed}
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Image
        </Button>
      </CardContent>
    </Card>
  );
};