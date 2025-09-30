import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Pipette, 
  Download, 
  RotateCcw,
  Eye,
  EyeOff,
  Palette,
  Target,
  Zap
} from 'lucide-react';

interface ColorPickerRemovalProps {
  selectedFiles: File[];
  onResultReady: (blob: Blob) => void;
}

interface SelectedColor {
  r: number;
  g: number;
  b: number;
  x: number;
  y: number;
}

const ColorPickerRemoval: React.FC<ColorPickerRemovalProps> = ({
  selectedFiles,
  onResultReady
}) => {
  const [isPickerMode, setIsPickerMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState<SelectedColor | null>(null);
  const [tolerance, setTolerance] = useState([10]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [processedResult, setProcessedResult] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const loadImage = useCallback(() => {
    if (selectedFiles.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Resize canvas to fit image while maintaining aspect ratio
      const maxWidth = 600;
      const maxHeight = 400;
      
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      originalImageRef.current = img;
    };
    
    img.src = URL.createObjectURL(selectedFiles[0]);
  }, [selectedFiles]);

  React.useEffect(() => {
    loadImage();
  }, [loadImage]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Canvas clicked! Picker mode:', isPickerMode);
    
    if (!isPickerMode) {
      console.log('Not in picker mode - ignoring click');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('No canvas context');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((event.clientY - rect.top) * (canvas.height / rect.height));

    console.log('Click coordinates:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });

    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;

    const pickedColor: SelectedColor = {
      r: data[0],
      g: data[1], 
      b: data[2],
      x,
      y
    };

    console.log('Picked color:', pickedColor);
    setSelectedColor(pickedColor);
    setIsPickerMode(false);
    
    // Show immediate preview if enabled
    if (previewMode) {
      console.log('Showing preview...');
      processColorRemoval(pickedColor, tolerance[0], true);
    }
  };

  const processColorRemoval = async (
    targetColor: SelectedColor, 
    toleranceValue: number, 
    isPreview: boolean = false
  ) => {
    const canvas = canvasRef.current;
    const originalImage = originalImageRef.current;
    if (!canvas || !originalImage) return;

    if (!isPreview) {
      setIsProcessing(true);
    }

    try {
      // Create a new canvas for processing at full resolution
      const processCanvas = document.createElement('canvas');
      const processCtx = processCanvas.getContext('2d')!;
      
      processCanvas.width = originalImage.width;
      processCanvas.height = originalImage.height;
      processCtx.drawImage(originalImage, 0, 0);

      const imageData = processCtx.getImageData(0, 0, processCanvas.width, processCanvas.height);
      const data = imageData.data;

      let removedPixels = 0;

      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate color distance
        const distance = Math.sqrt(
          Math.pow(r - targetColor.r, 2) +
          Math.pow(g - targetColor.g, 2) +
          Math.pow(b - targetColor.b, 2)
        );
        
        // If color is within tolerance, make it transparent
        if (distance <= toleranceValue) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
          removedPixels++;
        }
      }

      processCtx.putImageData(imageData, 0, 0);

      if (isPreview) {
        // Update preview canvas
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(processCanvas, 0, 0, canvas.width, canvas.height);
      } else {
        // Generate final result
        processCanvas.toBlob((blob) => {
          if (blob) {
            onResultReady(blob);
            setProcessedResult(URL.createObjectURL(blob));
          }
        }, 'image/png');
      }

      console.log(`Removed ${removedPixels} pixels matching the selected color`);
    } catch (error) {
      console.error('Color removal failed:', error);
    } finally {
      if (!isPreview) {
        setIsProcessing(false);
      }
    }
  };

  const handleProcess = () => {
    if (!selectedColor) return;
    processColorRemoval(selectedColor, tolerance[0], false);
  };

  const handleReset = () => {
    setSelectedColor(null);
    setProcessedResult(null);
    loadImage();
  };

  const handleDownload = () => {
    if (!processedResult) return;
    
    const link = document.createElement('a');
    link.download = `color-removed-${Date.now()}.png`;
    link.href = processedResult;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToleranceChange = (newTolerance: number[]) => {
    setTolerance(newTolerance);
    
    // Auto-preview if color is selected and preview mode is on
    if (selectedColor && previewMode) {
      processColorRemoval(selectedColor, newTolerance[0], true);
    }
  };

  const getColorHex = (color: SelectedColor) => {
    return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pipette className="h-5 w-5" />
          Color Picker Removal
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on any color in the image to make it transparent throughout the entire image
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {selectedFiles.length > 0 ? (
          <>
            {/* Canvas for image display and color picking */}
            <div className={`relative border-2 rounded-lg overflow-hidden ${isPickerMode ? 'border-blue-500 shadow-lg' : 'border-gray-300'}`}>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseMove={(e) => {
                  if (isPickerMode) {
                    e.currentTarget.style.cursor = 'crosshair';
                  }
                }}
                className={`w-full h-auto block ${isPickerMode ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{ 
                  imageRendering: 'auto',
                  background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #f5f5f5 0% 50%) 50% / 20px 20px',
                  minHeight: '200px'
                }}
              />
              
              {isPickerMode && (
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
                  <div className="bg-white rounded-lg p-4 shadow-xl border-2 border-blue-500 animate-pulse">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                      <Target className="h-5 w-5 text-blue-600" />
                      🎯 Click on any color to select it for removal
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Color Picker Button */}
              <Button
                variant={isPickerMode ? "destructive" : "default"}
                onClick={() => setIsPickerMode(!isPickerMode)}
                className={`w-full ${isPickerMode ? 'bg-blue-600 hover:bg-blue-700 animate-pulse border-2 border-blue-300' : ''}`}
                disabled={isProcessing}
              >
                <Pipette className="h-4 w-4 mr-2" />
                {isPickerMode ? '✋ Cancel Color Picking' : '🎯 Pick Color to Remove'}
              </Button>

              {/* Preview Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="preview-mode" className="text-sm font-medium">
                  Live Preview
                </Label>
                <Switch
                  id="preview-mode"
                  checked={previewMode}
                  onCheckedChange={setPreviewMode}
                  disabled={!selectedColor}
                />
              </div>
            </div>

            {/* Selected Color Display */}
            {selectedColor && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div 
                  className="w-8 h-8 rounded border-2 border-white shadow-sm"
                  style={{ backgroundColor: getColorHex(selectedColor) }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Selected Color</div>
                  <div className="text-xs text-muted-foreground">
                    RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b}) • {getColorHex(selectedColor)}
                  </div>
                </div>
                <Badge variant="secondary">
                  Position: {selectedColor.x}, {selectedColor.y}
                </Badge>
              </div>
            )}

            {/* Tolerance Slider */}
            {selectedColor && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Color Tolerance
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {tolerance[0]}
                  </span>
                </div>
                <Slider
                  value={tolerance}
                  onValueChange={handleToleranceChange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Exact match</span>
                  <span>Include similar colors</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleProcess}
                disabled={!selectedColor || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Remove Selected Color
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isProcessing}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Download Button - Show when processed result exists */}
            {processedResult && (
              <>
                <Separator />
                <Button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Transparent PNG
                </Button>
              </>
            )}

            {/* Instructions */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="font-medium">Instructions:</div>
              <div>1. Click "Pick Color to Remove" and then click on any color in the image</div>
              <div>2. Adjust tolerance to include similar colors (higher = more colors removed)</div>
              <div>3. Enable "Live Preview" to see changes in real-time</div>
              <div>4. Click "Remove Selected Color" to process the full-resolution image</div>
              <div>5. Click "Download Transparent PNG" to save your processed image 🎉</div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Upload an image to start using the color picker removal tool</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorPickerRemoval;