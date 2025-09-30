import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings2, Brain, Wand2, Info } from 'lucide-react';
import { ProcessingOptions, ModelType } from '@/types/engines';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdvancedControlsProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  isVisible: boolean;
}

export const AdvancedControls = ({ options, onChange, isVisible }: AdvancedControlsProps) => {
  const updateOptions = (updates: Partial<ProcessingOptions>) => {
    onChange({ ...options, ...updates });
  };

  const getModelDescription = (model: ModelType): string => {
    switch (model) {
      case 'rmbg-1.4': return 'General purpose, robust background removal (BRIA AI)';
      case 'u2net': return 'U²-Net full model, good for detailed objects';
      case 'u2netp': return 'U²-Net lightweight, faster processing';
      case 'modnet': return 'MODNet, optimized for human portraits';
    }
  };

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5" />
          Advanced Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="model-select" className="text-sm font-medium">
              AI Model
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Different models excel at different types of images</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={options.model} onValueChange={(value: ModelType) => updateOptions({ model: value })}>
            <SelectTrigger id="model-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rmbg-1.4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>RMBG-1.4 (General)</span>
                </div>
              </SelectItem>
              <SelectItem value="u2net">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-1 py-0 text-xs">Full</Badge>
                  <span>U²-Net</span>
                </div>
              </SelectItem>
              <SelectItem value="u2netp">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-1 py-0 text-xs">Lite</Badge>
                  <span>U²-Net Portable</span>
                </div>
              </SelectItem>
              <SelectItem value="modnet">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="px-1 py-0 text-xs">Human</Badge>
                  <span>MODNet</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getModelDescription(options.model)}
          </p>
        </div>

        {/* HQ-SAM Refinement */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="hq-sam" className="text-sm font-medium">
                Refine with HQ-SAM
              </Label>
              <Badge variant="secondary" className="px-1 py-0 text-xs">Beta</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              High-quality segmentation for complex edges (hair, fur, etc.)
            </p>
          </div>
          <Switch
            id="hq-sam"
            checked={options.refineWithHQSAM}
            onCheckedChange={(checked) => updateOptions({ refineWithHQSAM: checked })}
          />
        </div>

        {/* Transformers.js Option */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="transformers-js" className="text-sm font-medium">
                Use Transformers.js
              </Label>
              <Badge variant="outline" className="px-1 py-0 text-xs">Fallback</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Alternative JavaScript engine for broader device compatibility
            </p>
          </div>
          <Switch
            id="transformers-js"
            checked={options.useTransformersJS}
            onCheckedChange={(checked) => updateOptions({ useTransformersJS: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};