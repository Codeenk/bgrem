import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageUploader from "@/components/ImageUploader";
import ImageProcessor from "@/components/ImageProcessor";
import { EngineSelector } from "@/components/EngineSelector";
import { QualityControls } from "@/components/QualityControls";
import { AdvancedControls } from "@/components/AdvancedControls";
import { ExportPanel } from "@/components/ExportPanel";
import { Diagnostics } from "@/components/Diagnostics";
import { Settings } from "@/components/Settings";
import ColorPickerRemoval from "@/components/ColorPickerRemoval";
import AdSlot from "@/components/AdSlot";
import { ProcessingOptions, ProcessingResult, EngineCapabilities } from "@/types/engines";
import { useBackgroundRemoval } from "@/hooks/useBackgroundRemoval";
import { 
  Shield, 
  Zap, 
  Download, 
  Star, 
  Users, 
  Clock,
  Check,
  X,
  Sparkles,
  Globe,
  Heart,
  Settings as SettingsIcon
} from "lucide-react";

const Index = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const [lastResult, setLastResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    isAdvancedMode: false,
    quality: 'balanced',
    acceleration: 'auto',
    fullResolution: false,
    imageType: 'auto',
    processingMode: 'general',
    autoDetectImageType: true,
    refineWithHQSAM: false,
    useTransformersJS: false,
    model: 'rmbg-1.4',
    backgroundType: 'transparent',
    backgroundColor: '#ffffff',
    exportFormat: 'png',
    exportQuality: 90
  });

  const [capabilities, setCapabilities] = useState<EngineCapabilities | null>(null);

  const { getCapabilities } = useBackgroundRemoval();

  const handleImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleAdvancedModeChange = (advanced: boolean) => {
    setIsAdvancedMode(advanced);
    setProcessingOptions(prev => ({ ...prev, isAdvancedMode: advanced }));
  };

  const handleOptionsChange = (options: Partial<ProcessingOptions>) => {
    setProcessingOptions(prev => ({ ...prev, ...options }));
  };

  const handleExport = () => {
    console.log('Export with options:', processingOptions);
  };

  const handleClearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.includes('ai-models'))
          .map(name => caches.delete(name))
      );
      console.log('Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  useEffect(() => {
    // Load capabilities when component mounts
    getCapabilities().then(setCapabilities);
  }, [getCapabilities]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">🔥 #1 Background Remover</h1>
                <p className="text-sm text-muted-foreground">Free • No Watermark • No Signup • AI-Powered</p>
              </div>
            </div>
            <AdSlot slot="header" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="mb-4">
              <Shield className="h-4 w-4 mr-2" />
              100% Browser-Based • No Server Uploads
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              🔥 #1 Free Background Remover
              <br />
              <span className="text-primary">AI-Powered, No Watermark</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Remove backgrounds from any image in seconds! Advanced AI technology with perfect edge detection. 
              No signup, no watermark, unlimited use. The best free background removal tool online.
            </p>

            {/* Upload Section - Always Visible in Hero */}
            <div className="max-w-3xl mx-auto mt-12">
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold mb-2">Start Removing Backgrounds</h3>
                  <p className="text-muted-foreground">
                    Drag & drop your images or click to upload. Supports JPG, PNG, and WEBP formats.
                  </p>
                </div>
                <ImageUploader 
                  onImagesSelected={handleImagesSelected} 
                  isProcessing={isProcessing}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <Card className="text-left">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    100% Private
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All processing happens in your browser. Your images never leave your device.
                    Complete privacy and security for sensitive photos.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-left">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    Lightning Fast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Advanced AI engines deliver professional results in seconds.
                    No waiting, no processing delays.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-left">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="h-5 w-5 text-primary" />
                    No Limits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No subscriptions, no watermarks, no limits. Process unlimited images forever.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Processing Interface */}
      {selectedFiles.length > 0 && (
        <section className="py-12 bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Processing Your Images</h2>
              <p className="text-muted-foreground">
                Your images are being processed with advanced AI. Download results when ready.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Image Preview and Processing */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                      <Button 
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.accept = 'image/*';
                          fileInput.multiple = true;
                          fileInput.onchange = (e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.files) {
                              setSelectedFiles(Array.from(target.files));
                            }
                          };
                          fileInput.click();
                        }}
                        variant="outline"
                        className="mb-4"
                      >
                        Upload New Images
                      </Button>
                      <Button 
                        onClick={() => setSelectedFiles([])}
                        variant="outline"
                        className="mb-4"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  
                  <ImageProcessor 
                    files={selectedFiles} 
                    onClearFiles={() => setSelectedFiles([])}
                    autoStart={true}
                  />
                </div>

                {/* Tools and Settings */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Processing Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <EngineSelector 
                        options={processingOptions}
                        onChange={setProcessingOptions}
                        capabilities={capabilities}
                        isAdvancedMode={isAdvancedMode}
                        onAdvancedModeChange={handleAdvancedModeChange}
                      />
                      
                      <QualityControls
                        options={processingOptions}
                        onChange={setProcessingOptions}
                      />

                      {isAdvancedMode && (
                        <AdvancedControls
                          options={processingOptions}
                          onChange={setProcessingOptions}
                          isVisible={isAdvancedMode}
                        />
                      )}

                      <ExportPanel
                        options={processingOptions}
                        onChange={setProcessingOptions}
                        onExport={handleExport}
                        isProcessed={lastResult !== null}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Color Picker Tool</CardTitle>
                      <CardDescription>
                        Remove specific colors manually
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ColorPickerRemoval 
                        selectedFiles={selectedFiles} 
                        onResultReady={(blob) => {
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'background-removed.png';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      />
                    </CardContent>
                  </Card>

                  {capabilities && (
                    <Diagnostics 
                      capabilities={capabilities}
                      lastResult={lastResult}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Settings Section - Always Visible */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3">Processing Settings</h2>
              <p className="text-muted-foreground">
                Customize AI engine settings and clear cache if needed
              </p>
            </div>
            <Settings
              options={processingOptions}
              onChange={handleOptionsChange}
              onClearCache={handleClearCache}
            />
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">The Ultimate Free Background Remover Tool</h2>
              <p className="text-lg text-muted-foreground">
                Remove backgrounds from any image with our advanced AI-powered background removal tool. 
                Perfect for photos, logos, products, and graphics.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">🎯 Perfect for All Images</h3>
                <p className="text-muted-foreground">
                  Remove backgrounds from photos, product images, logos, portraits, and graphics. 
                  Our AI handles complex edges, hair, and transparent objects with precision.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">⚡ Instant Results</h3>
                <p className="text-muted-foreground">
                  Get professional background removal results in seconds. No waiting, no processing time. 
                  Upload your image and download the result immediately.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">🔒 100% Private</h3>
                <p className="text-muted-foreground">
                  All processing happens in your browser. Your images never leave your device. 
                  Complete privacy and security for sensitive or personal photos.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">💎 No Watermarks</h3>
                <p className="text-muted-foreground">
                  Download high-quality results without any watermarks or logos. 
                  Use your processed images commercially or personally without restrictions.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">🚀 No Signup Required</h3>
                <p className="text-muted-foreground">
                  Start removing backgrounds immediately. No account creation, no email verification. 
                  Just upload your image and get perfect results instantly.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">🎨 Multiple Formats</h3>
                <p className="text-muted-foreground">
                  Support for JPG, PNG, WEBP formats. Export as transparent PNG or with custom backgrounds. 
                  Perfect quality preservation for professional use.
                </p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-8 border">
              <h3 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How does the background remover work?</h4>
                  <p className="text-muted-foreground">
                    Our AI-powered background remover uses advanced machine learning models to automatically detect and remove backgrounds from images. 
                    The entire process happens in your browser for maximum privacy and speed.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is it really free to use?</h4>
                  <p className="text-muted-foreground">
                    Yes! Our background remover is completely free with no hidden costs, subscriptions, or limits. 
                    Process unlimited images without any watermarks or restrictions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What image formats are supported?</h4>
                  <p className="text-muted-foreground">
                    We support JPG, JPEG, PNG, and WEBP formats. You can export your results as high-quality PNG files with transparent backgrounds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>© 2024 Instant BG Remover. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;