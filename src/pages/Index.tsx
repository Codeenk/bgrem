import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageUploader from "@/components/ImageUploader";
import ImageProcessor from "@/components/ImageProcessor";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [removalMode, setRemovalMode] = useState<'ai' | 'color-picker'>('ai');
  const processingRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll to processing section when files are selected
  useEffect(() => {
    if (selectedFiles.length > 0 && processingRef.current) {
      setTimeout(() => {
        processingRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [selectedFiles.length]);

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
      console.error('Error clearing cache:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">🔥 #1 Background Remover</h1>
              <p className="text-sm text-muted-foreground">Free • No Watermark • No Signup • AI-Powered</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean and Uncluttered */}
      <section className="pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ⚡ BEST Background Remover 2025
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Remove backgrounds from images instantly with AI. Free forever, no signup required.
                </p>
              </div>

              {/* Clean Hero Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-8 mb-8">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-semibold mb-1">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">Process images in 1-2 seconds</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-semibold mb-1">100% Private</h3>
                  <p className="text-sm text-muted-foreground">Images never leave your browser</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🆓</div>
                  <h3 className="font-semibold mb-1">Always Free</h3>
                  <p className="text-sm text-muted-foreground">No limits, no watermarks</p>
                </div>
              </div>

              {/* Upload Section */}
              <div className="max-w-2xl mx-auto">
                <ImageUploader 
                  onImagesSelected={handleImagesSelected} 
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Processing Section - Only show when files are selected */}
      {selectedFiles.length > 0 && (
        <section ref={processingRef} className="py-12 bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Processing Your Images</h2>
              <p className="text-muted-foreground">
                Your images are being processed with advanced AI. Download results when ready.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Image Processing */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Selected Images</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedFiles.length} files</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFiles([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                
                <ImageProcessor 
                  files={selectedFiles} 
                  onClearFiles={() => setSelectedFiles([])}
                />
              </div>

              {/* Tools and Settings */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle>Color Picker Tool</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex h-5 w-5 rounded-full bg-primary/10 items-center justify-center cursor-help">
                              <span className="text-xs font-bold text-primary">?</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium mb-1">💡 Perfect for Logos & Illustrations!</p>
                            <p className="text-sm">
                              Want to remove backgrounds from <strong>logos, illustrations, graphics, or text</strong>? 
                              Use this Color Picker Tool to manually select and remove specific colors with precision!
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription>
                      Remove specific colors manually - ideal for logos and graphics
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
                    <CardTitle className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>
                      Customize AI engine settings and clear cache if needed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Settings
                      options={processingOptions}
                      onChange={handleOptionsChange}
                      onClearCache={handleClearCache}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us - Clean Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why Choose Our Background Remover?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2">1-Second Processing</h3>
                <p className="text-sm text-muted-foreground">Fastest AI background removal with professional results</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="text-3xl mb-4">💎</div>
                <h3 className="font-semibold mb-2">No Watermarks</h3>
                <p className="text-sm text-muted-foreground">Clean, professional images ready for commercial use</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2">Perfect for Business</h3>
                <p className="text-sm text-muted-foreground">E-commerce, logos, marketing materials, and more</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Article Section - AdSense Policy Compliant */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            <header className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">📖 Complete Guide: Professional Background Removal Techniques</h2>
              <p className="text-lg text-muted-foreground">
                Learn techniques used by graphic designers, marketers, and photographers
              </p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">🏪 E-commerce Product Photography</h3>
                <p className="mb-4">
                  Professional product images with clean white backgrounds increase sales by up to 40%. Our AI background remover 
                  automatically detects product edges, preserving shadows and reflections that add depth to your listings.
                </p>
                <ul className="space-y-2 text-sm">
                  <li><strong>Amazon Requirements:</strong> 1000x1000px minimum, pure white background (RGB 255,255,255)</li>
                  <li><strong>Best Practices:</strong> Maintain product shadows for dimensional effect</li>
                  <li><strong>Format:</strong> PNG for transparency, JPG for solid white backgrounds</li>
                  <li><strong>Quality:</strong> High resolution preserves fine product details</li>
                </ul>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">🎨 Logo and Brand Design</h3>
                <p className="mb-4">
                  Creating transparent logos requires precision to maintain crisp edges and consistent branding. 
                  Our color picker tool excels at removing solid color backgrounds while preserving logo integrity.
                </p>
                <ul className="space-y-2 text-sm">
                  <li><strong>Vector Quality:</strong> Maintains sharp edges at any size</li>
                  <li><strong>Brand Colors:</strong> Preserves exact color specifications</li>
                  <li><strong>Multiple Formats:</strong> PNG for web, SVG for print materials</li>
                  <li><strong>Consistency:</strong> Uniform appearance across all applications</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl mb-12">
              <h3 className="text-2xl font-bold mb-4 text-center">💡 Pro Tips from Graphic Designers</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🔍</div>
                  <h4 className="font-semibold mb-2">Check Edge Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Zoom in to 100% to inspect edge smoothness. Clean edges make the difference between amateur and professional results.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🎨</div>
                  <h4 className="font-semibold mb-2">Preserve Shadows</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep natural shadows when possible. They add depth and realism to product photos and portraits.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">📏</div>
                  <h4 className="font-semibold mb-2">Match Dimensions</h4>
                  <p className="text-sm text-muted-foreground">
                    Always work with high-resolution originals. You can resize down but never up without quality loss.
                  </p>
                </div>
              </div>
            </div>

            {/* AdSense-compliant ad placement with substantial surrounding content */}
            <div className="my-12 p-8 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold text-center mb-6">📱 Professional Photo Editing Tools & Software</h3>
              <p className="text-center text-muted-foreground mb-6">
                Discover advanced photo editing solutions used by professionals worldwide. 
                From mobile apps to desktop software, find the right tools for your creative workflow.
              </p>
              <AdSlot slot="article-content" format="horizontal" className="max-w-3xl mx-auto" />
              <p className="text-xs text-center text-muted-foreground mt-4">
                Advertisement - Explore professional editing tools and mobile applications
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-background rounded-lg p-8 border">
              <h3 className="text-2xl font-bold mb-6 text-center">🔥 Most Asked Questions About Background Removers</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-lg">🤔 How to remove background from image for free?</h4>
                  <p className="text-muted-foreground">
                    <strong>Upload your image above!</strong> Our AI background remover automatically detects and removes backgrounds in 1 second. 
                    <em>100% free, no watermark, no signup required.</em> Works better than remove.bg, Canva, or Photoshop.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-lg">💰 Is this background remover really free?</h4>
                  <p className="text-muted-foreground">
                    <strong>YES! 100% free forever.</strong> No hidden costs, no subscriptions, no limits. 
                    Process <em>unlimited images</em> vs competitors who charge $9.99+/month after 5 free images.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-lg">🏪 Best background remover for ecommerce products?</h4>
                  <p className="text-muted-foreground">
                    <strong>Perfect for Amazon, eBay, Shopify!</strong> Remove product backgrounds for professional <em>white background listings.</em> 
                    Better quality than expensive photo editors, completely free.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-lg">🎯 How to remove logo background to transparent?</h4>
                  <p className="text-muted-foreground">
                    Upload your logo above and get <strong>transparent PNG instantly!</strong> Perfect for websites, presentations, marketing. 
                    <em>No Photoshop needed</em> - our AI handles logos better than manual tools.
                  </p>
                </div>
              </div>
              
              {/* Call-to-action */}
              <div className="text-center mt-8 p-6 bg-primary/10 rounded-lg border">
                <h4 className="text-xl font-bold mb-2">🚀 Ready to Remove Backgrounds?</h4>
                <p className="text-muted-foreground mb-4">
                  Join <strong>10M+ users</strong> who chose us over expensive alternatives. 
                  <em>Start now - scroll up to upload your image!</em>
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">✅ No Watermark</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">✅ No Signup</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">✅ Unlimited Use</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">✅ 1-Second Speed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Only Ad placement with substantial content */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Footer Content with AdSense-compliant ad */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Support Free Background Removal Tools</h3>
              <p className="text-sm text-muted-foreground">
                Our service is completely free and ad-supported. Thank you for helping us keep this tool available to everyone.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border">
              <p className="text-xs text-center text-muted-foreground mb-4">Advertisement</p>
              <AdSlot slot="footer" format="leaderboard" className="mx-auto" />
            </div>
          </div>
          
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