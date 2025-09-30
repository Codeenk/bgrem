import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Package, 
  Image as ImageIcon, 
  Palette, 
  ShoppingBag, 
  Wand2, 
  Eye,
  Brain,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { ImageType, ProcessingMode, ImageAnalysis } from '@/types/engines';

interface ImageTypeDetectorProps {
  imageType: ImageType;
  processingMode: ProcessingMode;
  autoDetectImageType: boolean;
  imageAnalysis?: ImageAnalysis;
  isAnalyzing?: boolean;
  onImageTypeChange: (type: ImageType) => void;
  onProcessingModeChange: (mode: ProcessingMode) => void;
  onAutoDetectChange: (enabled: boolean) => void;
  onAnalyzeImage?: () => void;
}

const ImageTypeDetector: React.FC<ImageTypeDetectorProps> = ({
  imageType,
  processingMode,
  autoDetectImageType,
  imageAnalysis,
  isAnalyzing = false,
  onImageTypeChange,
  onProcessingModeChange,
  onAutoDetectChange,
  onAnalyzeImage
}) => {
  const imageTypeOptions = [
    { value: 'auto', label: 'Auto-Detect', icon: Brain, description: 'Let AI determine the best approach' },
    { value: 'person', label: 'Person/Portrait', icon: User, description: 'Photos of people, faces, portraits' },
    { value: 'object', label: 'Object/Item', icon: Package, description: 'Products, furniture, tools, items' },
    { value: 'graphic', label: 'Logo/Graphic', icon: Palette, description: 'Logos, illustrations, artwork' },
    { value: 'product', label: 'E-commerce Product', icon: ShoppingBag, description: 'Professional product photography' }
  ] as const;

  const processingModeOptions = [
    { value: 'general', label: 'General Purpose', description: 'Balanced for all image types' },
    { value: 'portrait', label: 'Portrait Mode', description: 'Optimized for people and faces' },
    { value: 'object', label: 'Object Mode', description: 'Best for products and items' },
    { value: 'logo', label: 'Logo Mode', description: 'Clean edges for graphics and logos' },
    { value: 'illustration', label: 'Illustration Mode', description: 'Preserves all graphic elements in drawings' },
    { value: 'product', label: 'Product Mode', description: 'Professional e-commerce quality' }
  ] as const;

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="default" className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (confidence >= 0.6) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
    return <Badge variant="outline" className="bg-red-100 text-red-800">Low Confidence</Badge>;
  };

  const getCurrentImageTypeIcon = () => {
    const option = imageTypeOptions.find(opt => opt.value === imageType);
    return option ? option.icon : ImageIcon;
  };

  const Icon = getCurrentImageTypeIcon();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          Image Type Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-detect toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-detect" className="text-sm font-medium">
              Auto-detect image type
            </Label>
            <p className="text-xs text-muted-foreground">
              Let AI analyze and optimize processing automatically
            </p>
          </div>
          <Switch
            id="auto-detect"
            checked={autoDetectImageType}
            onCheckedChange={onAutoDetectChange}
          />
        </div>

        {/* Manual analyze button when auto-detect is off */}
        {!autoDetectImageType && onAnalyzeImage && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyzeImage}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Analyze Image Content
              </>
            )}
          </Button>
        )}

        {/* Analysis Results */}
        {imageAnalysis && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Detection Result</span>
              {getConfidenceBadge(imageAnalysis.confidence)}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                {imageAnalysis.features.hasPerson ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>Person detected</span>
              </div>
              <div className="flex items-center gap-2">
                {imageAnalysis.features.isProduct ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>Product item</span>
              </div>
              <div className="flex items-center gap-2">
                {imageAnalysis.features.isGraphic ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>Graphic/Logo</span>
              </div>
              <div className="flex items-center gap-2">
                {imageAnalysis.features.hasText ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>Contains text</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <strong>Suggested:</strong> {imageAnalysis.suggestedMode} mode with {imageAnalysis.suggestedModel} model
            </div>
          </div>
        )}

        <Separator />

        {/* Manual image type selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Image Type</Label>
          <Select value={imageType} onValueChange={onImageTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {imageTypeOptions.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <OptionIcon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Processing mode selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Processing Mode</Label>
          <Select value={processingMode} onValueChange={onProcessingModeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {processingModeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Smart suggestions */}
        {imageType !== 'auto' && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Wand2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Optimization tip:</strong> {getOptimizationTip(imageType, processingMode)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getOptimizationTip(imageType: ImageType, processingMode: ProcessingMode): string {
  if (imageType === 'person' && processingMode !== 'portrait') {
    return 'For best results with people, try "Portrait Mode" which preserves hair and facial details.';
  }
  if (imageType === 'graphic' && processingMode !== 'logo' && processingMode !== 'illustration') {
    return 'For illustrations/graphics, try "Illustration Mode" to preserve ALL graphic elements like icons and text.';
  }
  if (imageType === 'product' && processingMode !== 'product') {
    return 'Product mode optimizes for e-commerce with professional edge quality and consistent lighting.';
  }
  if (imageType === 'object' && processingMode === 'portrait') {
    return 'Object mode may work better for non-human subjects like furniture, tools, or items.';
  }
  if (processingMode === 'illustration') {
    return 'Illustration mode uses advanced element preservation to keep icons, text, and graphic elements intact.';
  }
  return 'Current settings look good for this image type.';
}

export default ImageTypeDetector;