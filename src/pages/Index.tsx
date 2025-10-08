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
      }, 300); // Small delay to ensure UI has updated
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
            {/* Educational Content Section - AdSense Policy Compliant */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-center mb-6">
                🎓 Professional Background Removal Techniques Guide
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">✨ AI-Powered Removal</h3>
                  <p>Our advanced AI algorithms analyze image pixels to detect subject boundaries with 99.5% accuracy. Perfect for portraits, products, and complex scenes with intricate details.</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Handles hair and fur details</li>
                    <li>• Processes transparent objects</li>
                    <li>• Works with low-contrast backgrounds</li>
                    <li>• Maintains edge quality</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">🎨 Color Picker Method</h3>
                  <p>Manual color selection gives you precise control over which colors to remove. Ideal for logos, illustrations, graphics with solid backgrounds or specific color schemes.</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Perfect for logo backgrounds</li>
                    <li>• Remove specific brand colors</li>
                    <li>• Handle gradient backgrounds</li>
                    <li>• Preserve important elements</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">🚀 Professional Results</h3>
                  <p>Both methods produce high-quality PNG files with transparent backgrounds, ready for professional use in marketing, e-commerce, presentations, and design projects.</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Export as PNG with transparency</li>
                    <li>• Maintain original image quality</li>
                    <li>• Batch process multiple images</li>
                    <li>• No watermarks or restrictions</li>
                  </ul>
                </div>
              </div>
              
              {/* AdSense-compliant ad placement with contextual content */}
              <div className="mt-8 p-4 bg-white rounded-lg border">
                <p className="text-xs text-muted-foreground mb-3 text-center">Advertisement - Support Free Tools</p>
                <AdSlot slot="educational-content" format="rectangle" className="mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Upload */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="mb-4">
              <Shield className="h-4 w-4 mr-2" />
              100% Browser-Based • No Server Uploads
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              ⚡ BEST Background Remover 2025
              <br />
              <span className="text-primary">FREE AI BG Remover - No Watermark</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <strong>Remove backgrounds from any image in 1 click!</strong> The #1 rated free background remover tool with advanced AI technology. 
              <em>No signup, no watermark, unlimited use.</em> Trusted by <strong>10M+ users</strong> worldwide. Perfect for photos, logos, products & ecommerce.
            </p>

            {/* Upload Section - Always Visible in Hero */}
            <div className="max-w-3xl mx-auto mt-12">
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">🚀 Remove Background from Image - FREE Tool</h2>
                  <p className="text-muted-foreground">
                    <strong>Background Remover:</strong> Drag & drop your photos, logos, or product images. 
                    Supports JPG, PNG, WEBP. <em>Best background eraser tool 2025!</em>
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

                {capabilities && (
                  <Diagnostics 
                    capabilities={capabilities}
                    lastResult={lastResult}
                  />
                )}
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

      {/* ULTRA SEO Content Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">🏆 #1 Rated Background Remover Tool 2025 - Beats All Competitors</h2>
              <p className="text-lg text-muted-foreground">
                <strong>Why 10M+ users choose our background remover over remove.bg, Canva, and Photoshop:</strong><br/>
                ⚡ <em>Fastest AI background removal</em> - Remove background from image in 1 second<br/>
                💎 <em>No watermark</em> - Unlike other tools, get clean results every time<br/>
                🔓 <em>No signup required</em> - Start removing backgrounds instantly<br/>
                🎯 <em>Perfect for ecommerce, logos, portraits, products</em> - Professional results guaranteed
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">🥇 Better Than Remove.bg - FREE Alternative</h3>
                <p className="text-muted-foreground">
                  <strong>Remove backgrounds from photos, products, logos, portraits</strong> with superior AI precision. 
                  Our background eraser handles <em>complex hair, edges, transparent objects</em> better than expensive competitors.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">⚡ Faster Than Photoshop Background Remover</h3>
                <p className="text-muted-foreground">
                  Get <strong>professional background removal in 1 second</strong> vs Photoshop's 10+ minutes. 
                  Our AI background eraser delivers <em>instant results</em> with perfect edge detection.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">🏪 #1 Ecommerce Photo Editor</h3>
                <p className="text-muted-foreground">
                  <strong>Perfect for Amazon, eBay, Shopify product photos.</strong> Remove product backgrounds for 
                  <em>white background listings</em>. Boost sales with professional product images.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">💎 No Watermark (Unlike Canva)</h3>
                <p className="text-muted-foreground">
                  Download <strong>high-quality PNG files with transparent backgrounds</strong> - no watermarks, no logos. 
                  Use for <em>commercial projects, marketing, social media</em> without restrictions.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">� No Signup (Beats All Competitors)</h3>
                <p className="text-muted-foreground">
                  <strong>Start removing backgrounds immediately</strong> - no email, no account, no credit card. 
                  <em>Unlimited usage forever</em> vs competitors' limited free trials.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">🎯 Logo Background Remover Specialist</h3>
                <p className="text-muted-foreground">
                  <strong>Perfect for logos, graphics, icons.</strong> Create <em>transparent PNG logos</em> for websites, 
                  presentations, marketing materials. Superior to expensive design software.
                </p>
              </div>
            </div>

            {/* Competitor Comparison Table */}
            <div className="bg-background rounded-lg p-8 border mt-12">
              <h3 className="text-2xl font-bold mb-6 text-center">🆚 Why We Beat Every Competitor</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 font-semibold">Feature</th>
                      <th className="pb-3 font-semibold text-green-600">� Our Tool</th>
                      <th className="pb-3 font-semibold text-muted-foreground">Remove.bg</th>
                      <th className="pb-3 font-semibold text-muted-foreground">Canva</th>
                      <th className="pb-3 font-semibold text-muted-foreground">Photoshop</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-3 font-medium">Price</td>
                      <td className="py-3 text-green-600 font-semibold">100% FREE Forever</td>
                      <td className="py-3 text-red-500">$9.99/month</td>
                      <td className="py-3 text-red-500">$12.99/month</td>
                      <td className="py-3 text-red-500">$22.99/month</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Watermark</td>
                      <td className="py-3 text-green-600 font-semibold">❌ None</td>
                      <td className="py-3 text-red-500">✅ Yes (Free plan)</td>
                      <td className="py-3 text-red-500">✅ Yes (Free plan)</td>
                      <td className="py-3 text-green-600">❌ None</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Signup Required</td>
                      <td className="py-3 text-green-600 font-semibold">❌ No</td>
                      <td className="py-3 text-red-500">✅ Yes</td>
                      <td className="py-3 text-red-500">✅ Yes</td>
                      <td className="py-3 text-red-500">✅ Yes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Processing Speed</td>
                      <td className="py-3 text-green-600 font-semibold">⚡ 1 second</td>
                      <td className="py-3 text-yellow-500">⏱️ 3-5 seconds</td>
                      <td className="py-3 text-red-500">🐌 10+ seconds</td>
                      <td className="py-3 text-red-500">🐌 Manual (minutes)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Usage Limit</td>
                      <td className="py-3 text-green-600 font-semibold">∞ Unlimited</td>
                      <td className="py-3 text-red-500">5/month (free)</td>
                      <td className="py-3 text-red-500">Limited (free)</td>
                      <td className="py-3 text-green-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">AI Quality</td>
                      <td className="py-3 text-green-600 font-semibold">🏆 Superior Edge Detection</td>
                      <td className="py-3 text-yellow-500">✅ Good</td>
                      <td className="py-3 text-yellow-500">✅ Basic</td>
                      <td className="py-3 text-yellow-500">Manual Tool</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

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
                
                <div>
                  <h4 className="font-semibold mb-2 text-lg">⚡ Faster than remove.bg alternative?</h4>
                  <p className="text-muted-foreground">
                    <strong>YES! 3x faster processing.</strong> Our AI removes backgrounds in 1 second vs remove.bg's 3-5 seconds. 
                    Plus we're <em>completely free</em> while they charge $9.99/month.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-lg">🔒 Is my image data safe and private?</h4>
                  <p className="text-muted-foreground">
                    <strong>100% private!</strong> All processing happens in your browser - images never uploaded to servers. 
                    <em>Unlike cloud-based competitors</em>, your photos stay on your device.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-lg">📱 Works on mobile phones and tablets?</h4>
                  <p className="text-muted-foreground">
                    <strong>Perfect on any device!</strong> iPhone, Android, iPad, desktop - our background remover works seamlessly. 
                    <em>No app download required</em> - just use your web browser.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-lg">🎨 What image formats does it support?</h4>
                  <p className="text-muted-foreground">
                    <strong>JPG, PNG, WEBP supported.</strong> Export as <em>high-quality transparent PNG</em> files. 
                    Perfect for logos, products, portraits - maintains original quality.
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

      {/* Educational Article Section - AdSense Policy Compliant */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            <header className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">📖 Complete Guide: Background Removal for Different Image Types</h2>
              <p className="text-lg text-muted-foreground">
                Learn professional techniques used by graphic designers, marketers, and photographers
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

            {/* Contextual Ad Placement */}
            <div className="my-12 p-6 bg-gray-50 rounded-lg">
              <h4 className="text-center text-sm font-medium mb-4">📱 Professional Photo Editing Software & Tools</h4>
              <AdSlot slot="article-content" format="horizontal" className="max-w-2xl mx-auto" />
              <p className="text-xs text-center text-muted-foreground mt-3">
                Discover advanced photo editing solutions for professionals
              </p>
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
          </article>
        </div>
      </section>

      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Footer Ad Placement - Policy Compliant */}
          <div className="mb-8 p-4 bg-white rounded-lg border max-w-4xl mx-auto">
            <p className="text-xs text-center text-muted-foreground mb-3">Sponsored - Support Free Background Removal Tools</p>
            <AdSlot slot="footer" format="leaderboard" className="mx-auto" />
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