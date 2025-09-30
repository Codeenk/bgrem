import { removeBackground } from '@imgly/background-removal';
import { InferenceSession, Tensor } from 'onnxruntime-web';
import type { ImageAnalysis, ImageType, ProcessingMode, ModelType } from '../types/engines';

// Configure ONNX Runtime
const configureONNX = () => {
  // ONNX configuration will be handled per-session
};

configureONNX();

export interface WorkerMessage {
  id: string;
  type: 'process' | 'initialize' | 'cleanup' | 'capabilities' | 'analyze';
  payload: any;
}

export interface WorkerResponse {
  id: string;
  type: 'result' | 'error' | 'progress' | 'capabilities';
  payload: any;
}

class BackgroundRemovalWorker {
  private models: Map<string, InferenceSession> = new Map();
  private initialized = false;

  async initialize(engine: string, options: any) {
    try {
      if (engine === 'baseline') {
        // ImgLY background-removal initialization happens automatically
        this.initialized = true;
        return { success: true };
      } else if (engine === 'onnx') {
        // Load ONNX model based on options
        const modelPath = this.getModelPath(options.model || 'rmbg-1.4');
        const session = await InferenceSession.create(modelPath, {
          executionProviders: this.getExecutionProviders(options.acceleration),
        });
        this.models.set(engine, session);
        this.initialized = true;
        return { success: true };
      }
    } catch (error) {
      throw new Error(`Failed to initialize ${engine} engine: ${error}`);
    }
  }

  private getModelPath(model: string): string {
    const modelPaths = {
      'rmbg-1.4': '/models/rmbg-1.4.onnx',
      'u2net': '/models/u2net.onnx', 
      'u2netp': '/models/u2netp.onnx',
      'modnet': '/models/modnet.onnx',
      'hq-sam': '/models/hq-sam.onnx'
    };
    return modelPaths[model as keyof typeof modelPaths] || modelPaths['rmbg-1.4'];
  }

  private getExecutionProviders(acceleration: string): string[] {
    switch (acceleration) {
      case 'webgpu':
        return ['webgpu', 'webgl', 'wasm'];
      case 'webgl':
        return ['webgl', 'wasm'];
      case 'wasm':
        return ['wasm'];
      default:
        return ['webgpu', 'webgl', 'wasm'];
    }
  }

  async analyzeImage(imageData: ImageData): Promise<ImageAnalysis> {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    // Basic image analysis using computer vision techniques
    const analysis = await this.performImageAnalysis(imageData);
    
    return analysis;
  }

  private async performImageAnalysis(imageData: ImageData): Promise<ImageAnalysis> {
    const { width, height, data } = imageData;
    
    // Analyze color distribution and patterns
    const colorAnalysis = this.analyzeColors(data, width, height);
    
    // Edge detection for complexity
    const edgeAnalysis = this.detectEdges(data, width, height);
    
    // Pattern recognition
    const patternAnalysis = this.analyzePatterns(data, width, height);
    
    // Determine image type based on analysis
    let detectedType: ImageType = 'auto';
    let confidence = 0.5;
    let suggestedMode: ProcessingMode = 'general';
    let suggestedModel: ModelType = 'rmbg-1.4';
    
    // Enhanced illustration/graphic detection (higher priority for vector-like images)
    if (colorAnalysis.limitedColors && edgeAnalysis.sharpEdges > 0.3) {
      detectedType = 'graphic';
      suggestedMode = 'illustration'; // Use new illustration mode for better element preservation
      suggestedModel = 'u2net';
      confidence = Math.min(0.95, 0.7 + (edgeAnalysis.sharpEdges * 0.3));
    }
    // Person detection heuristics (only if clear skin tones present)
    else if (colorAnalysis.hasSkinTones && colorAnalysis.skinToneConfidence > 0.3 && edgeAnalysis.organicShapes > 0.2) {
      detectedType = 'person';
      confidence = Math.min(0.9, colorAnalysis.skinToneConfidence + edgeAnalysis.organicShapes);
      suggestedMode = 'portrait';
      suggestedModel = 'rmbg-1.4'; // Best for people
    }
    // Mixed illustration with person (common in cartoons/illustrations) - lower threshold
    else if (colorAnalysis.hasSkinTones && (colorAnalysis.limitedColors || edgeAnalysis.sharpEdges > 0.2)) {
      detectedType = 'graphic';
      suggestedMode = 'illustration'; // Better for preserving all elements in illustrations
      suggestedModel = 'u2net';
      confidence = 0.9; // Higher confidence for mixed illustrations
    }
    // Product/object detection
    else if (edgeAnalysis.sharpEdges > 0.6 && colorAnalysis.uniformRegions > 0.4) {
      if (patternAnalysis.isSymmetric && edgeAnalysis.geometricShapes > 0.5) {
        detectedType = 'product';
        suggestedMode = 'product';
        suggestedModel = 'u2net';
        confidence = 0.8;
      } else {
        detectedType = 'object';
        suggestedMode = 'object';
        suggestedModel = 'u2netp';
        confidence = 0.7;
      }
    }

    return {
      detectedType,
      confidence,
      suggestedMode,
      suggestedModel,
      features: {
        hasPerson: colorAnalysis.hasSkinTones && edgeAnalysis.organicShapes > 0.2,
        hasMultiplePeople: colorAnalysis.multipleSkinRegions,
        hasText: patternAnalysis.hasText,
        isGraphic: edgeAnalysis.sharpEdges > 0.6 && colorAnalysis.limitedColors,
        isProduct: edgeAnalysis.geometricShapes > 0.4 && colorAnalysis.uniformRegions > 0.3,
        complexity: edgeAnalysis.complexity
      }
    };
  }

  private analyzeColors(data: Uint8ClampedArray, width: number, height: number) {
    const pixels = data.length / 4;
    let skinTonePixels = 0;
    const colorHistogram = new Map<string, number>();
    let uniformRegions = 0;
    let skinRegions = 0;
    let lastSkinRegion = false;
    
    for (let i = 0; i < pixels; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      
      // Skin tone detection (basic heuristic)
      if (this.isSkinTone(r, g, b)) {
        skinTonePixels++;
        if (!lastSkinRegion) skinRegions++;
        lastSkinRegion = true;
      } else {
        lastSkinRegion = false;
      }
      
      // Color histogram
      const colorKey = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;
      colorHistogram.set(colorKey, (colorHistogram.get(colorKey) || 0) + 1);
    }
    
    const skinToneRatio = skinTonePixels / pixels;
    const uniqueColors = colorHistogram.size;
    const dominantColors = Array.from(colorHistogram.values())
      .sort((a, b) => b - a)
      .slice(0, 5)
      .reduce((sum, count) => sum + count, 0) / pixels;
    
    return {
      hasSkinTones: skinToneRatio > 0.05,
      skinToneConfidence: Math.min(1, skinToneRatio * 10),
      multipleSkinRegions: skinRegions > 2,
      limitedColors: uniqueColors < pixels / 50, // More sensitive for illustrations
      uniformRegions: dominantColors,
      isVectorLike: uniqueColors < pixels / 200 && dominantColors > 0.6 // Very few colors, high uniformity
    };
  }

  private isSkinTone(r: number, g: number, b: number): boolean {
    // Basic skin tone detection using RGB values
    return (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      r - g > 15 && r - b > 15
    ) || (
      r > 220 && g > 210 && b > 170 &&
      Math.abs(r - g) <= 15 && r >= b && g >= b
    );
  }

  private detectEdges(data: Uint8ClampedArray, width: number, height: number) {
    // Simple edge detection using Sobel operator
    const edges = new Array(width * height).fill(0);
    let sharpEdgeCount = 0;
    let organicEdgeCount = 0;
    let geometricCount = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const gx = this.getGradientX(data, x, y, width);
        const gy = this.getGradientY(data, x, y, width);
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        edges[idx] = magnitude;
        
        if (magnitude > 100) {
          sharpEdgeCount++;
          
          // Check if edge is geometric (straight) or organic (curved)
          const angle = Math.atan2(gy, gx);
          const isHorizontal = Math.abs(angle) < 0.1 || Math.abs(angle - Math.PI) < 0.1;
          const isVertical = Math.abs(angle - Math.PI/2) < 0.1 || Math.abs(angle + Math.PI/2) < 0.1;
          
          if (isHorizontal || isVertical) {
            geometricCount++;
          } else {
            organicEdgeCount++;
          }
        }
      }
    }
    
    const totalPixels = width * height;
    const totalEdges = sharpEdgeCount + organicEdgeCount;
    
    return {
      sharpEdges: sharpEdgeCount / totalPixels,
      organicShapes: organicEdgeCount / totalPixels,
      geometricShapes: geometricCount / totalPixels,
      complexity: totalEdges < totalPixels * 0.1 ? 'simple' : 
                  totalEdges < totalPixels * 0.3 ? 'moderate' : 'complex' as 'simple' | 'moderate' | 'complex'
    };
  }

  private getGradientX(data: Uint8ClampedArray, x: number, y: number, width: number): number {
    const getGray = (px: number, py: number) => {
      const idx = (py * width + px) * 4;
      return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    };
    
    return (-1 * getGray(x - 1, y - 1)) + (1 * getGray(x + 1, y - 1)) +
           (-2 * getGray(x - 1, y)) + (2 * getGray(x + 1, y)) +
           (-1 * getGray(x - 1, y + 1)) + (1 * getGray(x + 1, y + 1));
  }

  private getGradientY(data: Uint8ClampedArray, x: number, y: number, width: number): number {
    const getGray = (px: number, py: number) => {
      const idx = (py * width + px) * 4;
      return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    };
    
    return (-1 * getGray(x - 1, y - 1)) + (-2 * getGray(x, y - 1)) + (-1 * getGray(x + 1, y - 1)) +
           (1 * getGray(x - 1, y + 1)) + (2 * getGray(x, y + 1)) + (1 * getGray(x + 1, y + 1));
  }

  private analyzePatterns(data: Uint8ClampedArray, width: number, height: number) {
    // Simple pattern analysis
    let textLikeRegions = 0;
    let symmetryScore = 0;
    
    // Check for text-like patterns (high contrast small regions)
    for (let y = 0; y < height - 10; y += 10) {
      for (let x = 0; x < width - 10; x += 10) {
        const region = this.getRegionVariance(data, x, y, 10, 10, width);
        if (region.hasHighContrast && region.hasSmallFeatures) {
          textLikeRegions++;
        }
      }
    }
    
    // Basic symmetry check
    const centerX = Math.floor(width / 2);
    let symmetricPixels = 0;
    const sampleRate = 10;
    
    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < centerX; x += sampleRate) {
        const leftIdx = (y * width + x) * 4;
        const rightIdx = (y * width + (width - x - 1)) * 4;
        
        const leftGray = 0.299 * data[leftIdx] + 0.587 * data[leftIdx + 1] + 0.114 * data[leftIdx + 2];
        const rightGray = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
        
        if (Math.abs(leftGray - rightGray) < 30) {
          symmetricPixels++;
        }
      }
    }
    
    const totalSamples = Math.floor(height / sampleRate) * Math.floor(centerX / sampleRate);
    symmetryScore = symmetricPixels / totalSamples;
    
    return {
      hasText: textLikeRegions > (width * height) / 10000,
      isSymmetric: symmetryScore > 0.7
    };
  }

  private getRegionVariance(data: Uint8ClampedArray, startX: number, startY: number, 
                           regionWidth: number, regionHeight: number, imageWidth: number) {
    let minGray = 255;
    let maxGray = 0;
    let smallFeatureCount = 0;
    
    for (let y = startY; y < Math.min(startY + regionHeight, startY + regionHeight); y++) {
      for (let x = startX; x < Math.min(startX + regionWidth, startX + regionWidth); x++) {
        const idx = (y * imageWidth + x) * 4;
        const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        
        minGray = Math.min(minGray, gray);
        maxGray = Math.max(maxGray, gray);
        
        // Check for small features (high frequency changes)
        if (x > startX && y > startY) {
          const prevIdx = (y * imageWidth + (x - 1)) * 4;
          const prevGray = 0.299 * data[prevIdx] + 0.587 * data[prevIdx + 1] + 0.114 * data[prevIdx + 2];
          if (Math.abs(gray - prevGray) > 50) {
            smallFeatureCount++;
          }
        }
      }
    }
    
    return {
      hasHighContrast: (maxGray - minGray) > 100,
      hasSmallFeatures: smallFeatureCount > regionWidth * regionHeight * 0.3
    };
  }

  private async postProcessGraphics(processedBlob: Blob, originalImageData: ImageData): Promise<Blob> {
    // Create canvases for processing
    const originalCanvas = new OffscreenCanvas(originalImageData.width, originalImageData.height);
    const originalCtx = originalCanvas.getContext('2d')!;
    originalCtx.putImageData(originalImageData, 0, 0);

    const processedCanvas = new OffscreenCanvas(originalImageData.width, originalImageData.height);
    const processedCtx = processedCanvas.getContext('2d')!;
    
    // Load processed image
    const processedImg = await createImageBitmap(processedBlob);
    processedCtx.drawImage(processedImg, 0, 0);

    const processedData = processedCtx.getImageData(0, 0, originalImageData.width, originalImageData.height);
    const originalData = originalImageData;

    // Analyze what was removed and restore important graphic elements
    const restoredData = this.restoreGraphicElements(processedData, originalData);
    
    // Put the restored data back
    processedCtx.putImageData(restoredData, 0, 0);
    
    return await processedCanvas.convertToBlob({ type: 'image/png' });
  }

  private restoreGraphicElements(processedData: ImageData, originalData: ImageData): ImageData {
    const processed = processedData.data;
    const original = originalData.data;
    const width = processedData.width;
    const height = processedData.height;
    
    console.log('Starting element restoration for illustration...');
    
    // Create a copy of processed data
    const restored = new ImageData(new Uint8ClampedArray(processed), width, height);
    const restoredPixels = restored.data;

    // Analyze colors in the original image to identify important graphic elements
    const importantColors = this.identifyImportantColors(original, width, height);
    console.log('Identified', importantColors.length, 'important colors for preservation');

    let restoredPixelCount = 0;

    for (let i = 0; i < processed.length; i += 4) {
      const originalR = original[i];
      const originalG = original[i + 1];
      const originalB = original[i + 2];
      const originalA = original[i + 3];
      const processedAlpha = processed[i + 3];

      // Skip if original pixel was already transparent
      if (originalA < 100) continue;

      // If the pixel was made transparent or semi-transparent
      if (processedAlpha < 128) { // More lenient threshold
        const isImportantColor = this.isImportantGraphicColor(originalR, originalG, originalB, importantColors);
        
        // Also check if it's likely a graphic element based on surrounding context
        const isGraphicElement = this.isLikelyGraphicElement(original, i, width, height);
        
        if (isImportantColor || isGraphicElement) {
          // Restore this pixel
          restoredPixels[i] = originalR;     // R
          restoredPixels[i + 1] = originalG; // G
          restoredPixels[i + 2] = originalB; // B
          restoredPixels[i + 3] = originalA; // Restore original alpha
          restoredPixelCount++;
        }
      }
    }

    console.log('Restored', restoredPixelCount, 'pixels for graphic element preservation');
    return restored;
  }

  private identifyImportantColors(data: Uint8ClampedArray, width: number, height: number) {
    const colorCounts = new Map<string, number>();
    const blueColors = new Map<string, number>();
    const pixels = data.length / 4;

    // Count all colors and specifically track blue colors
    for (let i = 0; i < pixels; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      
      // Skip near-white colors (likely background) and very dark colors
      if ((r > 240 && g > 240 && b > 240) || (r < 20 && g < 20 && b < 20)) continue;
      
      const colorKey = `${Math.floor(r / 8)}-${Math.floor(g / 8)}-${Math.floor(b / 8)}`;
      colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
      
      // Specifically track blue colors (like your icons)
      if (b > r + 20 && b > g + 20 && b > 80) {
        blueColors.set(colorKey, (blueColors.get(colorKey) || 0) + 1);
      }
    }

    // Get all blue colors (high priority for preservation)
    const importantBlues = Array.from(blueColors.entries())
      .filter(([_, count]) => count > 5) // Even small blue elements are important
      .map(([colorKey, _]) => {
        const parts = colorKey.split('-').map(Number);
        return {
          r: parts[0] * 8,
          g: parts[1] * 8, 
          b: parts[2] * 8
        };
      });

    // Get other prominent non-background colors
    const otherColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15) // More colors
      .filter(([_, count]) => count > pixels * 0.002) // Lower threshold for illustrations
      .map(([colorKey, _]) => {
        const parts = colorKey.split('-').map(Number);
        return {
          r: parts[0] * 8,
          g: parts[1] * 8, 
          b: parts[2] * 8
        };
      });

    // Combine blue colors with other important colors, prioritizing blues
    return [...importantBlues, ...otherColors];
  }

  private isImportantGraphicColor(r: number, g: number, b: number, importantColors: Array<{r: number, g: number, b: number}>): boolean {
    // Check if this color matches any important colors (with tolerance)
    for (const color of importantColors) {
      const rDiff = Math.abs(r - color.r);
      const gDiff = Math.abs(g - color.g);
      const bDiff = Math.abs(b - color.b);
      
      // Allow some tolerance for similar colors
      if (rDiff < 32 && gDiff < 32 && bDiff < 32) {
        return true;
      }
    }

    // Also preserve high-contrast colors (likely text or important graphics)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const isHighContrast = luminance < 50 || luminance > 200;
    const isSaturatedColor = Math.max(r, g, b) - Math.min(r, g, b) > 50;
    
    return isHighContrast || isSaturatedColor;
  }

  private isLikelyGraphicElement(data: Uint8ClampedArray, pixelIndex: number, width: number, height: number): boolean {
    const x = (pixelIndex / 4) % width;
    const y = Math.floor((pixelIndex / 4) / width);
    
    // Skip edge pixels to avoid boundary issues
    if (x < 2 || x >= width - 2 || y < 2 || y >= height - 2) return false;
    
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];
    
    // Check if this is a blue color (like your icons)
    const isBlueish = b > r + 30 && b > g + 30 && b > 100;
    
    // Check if it's a high-contrast color
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const isHighContrast = luminance < 80 || luminance > 180;
    
    // Check if it's part of a solid color region (typical of vector graphics)
    let similarNeighbors = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighborIndex = (ny * width + nx) * 4;
          const nr = data[neighborIndex];
          const ng = data[neighborIndex + 1];
          const nb = data[neighborIndex + 2];
          
          // Check if neighbor has similar color
          if (Math.abs(r - nr) < 20 && Math.abs(g - ng) < 20 && Math.abs(b - nb) < 20) {
            similarNeighbors++;
          }
        }
      }
    }
    
    // If it's blue, high contrast, or part of a solid region, it's likely a graphic element
    return isBlueish || (isHighContrast && similarNeighbors >= 3);
  }

  async processImage(engine: string, imageData: ImageData, options: any, onProgress?: (progress: number) => void) {
    const startTime = performance.now();

    try {
      if (engine === 'baseline') {
        return await this.processWithImgLY(imageData, options, onProgress);
      } else if (engine === 'onnx') {
        return await this.processWithONNX(imageData, options, onProgress);
      } else if (engine === 'transformers') {
        return await this.processWithTransformers(imageData, options, onProgress);
      }
    } catch (error) {
      throw new Error(`Processing failed with ${engine} engine: ${error}`);
    }
  }

  private async processWithImgLY(imageData: ImageData, options: any, onProgress?: (progress: number) => void) {
    onProgress?.(10);
    
    // Convert ImageData to Blob
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    const blob = await canvas.convertToBlob();

    onProgress?.(30);

    // For illustrations/graphics, we'll use a different strategy
    // The @imgly/background-removal library doesn't support all the options we want
    let result;
    
    if (options.processingMode === 'illustration' || options.imageType === 'graphic') {
      // For illustrations, we'll process with default and then do aggressive post-processing
      console.log('Processing illustration with enhanced element preservation...');
      result = await removeBackground(blob);
    } else {
      // For other types, use default processing  
      result = await removeBackground(blob);
    }

    onProgress?.(80);

    // Post-process for graphics to preserve important elements
    let finalResult = result;
    if (options.processingMode === 'logo' || options.processingMode === 'illustration' || options.imageType === 'graphic') {
      finalResult = await this.postProcessGraphics(result, imageData);
    }

    onProgress?.(100);

    return {
      blob: finalResult,
      processingTime: performance.now() - Date.now(),
      engineUsed: `ImgLY Background Removal (${options.processingMode} mode)`,
      resolution: { width: imageData.width, height: imageData.height }
    };
  }

  private async processWithONNX(imageData: ImageData, options: any, onProgress?: (progress: number) => void) {
    const startTime = performance.now();
    const session = this.models.get('onnx');
    if (!session) throw new Error('ONNX session not initialized');

    onProgress?.(20);

    // Preprocess image for ONNX model
    const tensor = await this.preprocessImage(imageData);
    onProgress?.(40);

    // Run inference
    const feeds = { input: tensor };
    const results = await session.run(feeds);
    onProgress?.(70);

    // Apply HQ-SAM refinement if enabled
    let refinedResults = results;
    if (options.refineWithHQSAM) {
      onProgress?.(75);
      refinedResults = await this.applyHQSAMRefinement(results, imageData);
      onProgress?.(85);
    }

    // Postprocess results
    const outputBlob = await this.postprocessONNXResults(refinedResults, imageData, options);
    onProgress?.(100);

    return {
      blob: outputBlob,
      processingTime: performance.now() - startTime,
      engineUsed: 'ONNX Runtime',
      modelUsed: options.model || 'rmbg-1.4',
      executionProvider: this.getActiveExecutionProvider(),
      refinementApplied: options.refineWithHQSAM,
      resolution: { width: imageData.width, height: imageData.height }
    };
  }

  private async processWithTransformers(imageData: ImageData, options: any, onProgress?: (progress: number) => void) {
    // Import transformers dynamically
    const { pipeline, env } = await import('@huggingface/transformers');
    
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    onProgress?.(20);

    const segmenter = await pipeline('image-segmentation', 'Xenova/modnet');
    onProgress?.(50);

    // Convert ImageData to canvas and then to base64
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    const dataURL = await canvas.convertToBlob().then(blob => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    });

    onProgress?.(70);

    const result = await segmenter(dataURL);
    onProgress?.(90);

    // Apply mask
    const outputCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const outputCtx = outputCanvas.getContext('2d')!;
    outputCtx.putImageData(imageData, 0, 0);

    const outputImageData = outputCtx.getImageData(0, 0, imageData.width, imageData.height);
    const data = outputImageData.data;

    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round(result[0].mask.data[i] * 255);
      data[i * 4 + 3] = alpha;
    }

    outputCtx.putImageData(outputImageData, 0, 0);
    const outputBlob = await outputCanvas.convertToBlob({ type: 'image/png' });

    onProgress?.(100);

    return {
      blob: outputBlob,
      processingTime: performance.now() - Date.now(),
      engineUsed: 'Transformers.js (MODNet)',
      resolution: { width: imageData.width, height: imageData.height }
    };
  }

  private async preprocessImage(imageData: ImageData): Promise<Tensor> {
    // Resize and normalize for ONNX model (usually 320x320 or 512x512)
    const size = 320;
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d')!;
    
    // Create temporary canvas with original image
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Resize to model input size
    ctx.drawImage(tempCanvas, 0, 0, size, size);
    const resizedImageData = ctx.getImageData(0, 0, size, size);
    
    // Convert to tensor format [1, 3, H, W] with normalized values
    const tensorData = new Float32Array(3 * size * size);
    const data = resizedImageData.data;
    
    for (let i = 0; i < size * size; i++) {
      const pixelIndex = i * 4;
      // Normalize to [-1, 1] and reorder to CHW format
      tensorData[i] = (data[pixelIndex] / 255.0) * 2.0 - 1.0; // R
      tensorData[size * size + i] = (data[pixelIndex + 1] / 255.0) * 2.0 - 1.0; // G
      tensorData[size * size * 2 + i] = (data[pixelIndex + 2] / 255.0) * 2.0 - 1.0; // B
    }
    
    return new Tensor('float32', tensorData, [1, 3, size, size]);
  }

  private async applyHQSAMRefinement(results: any, imageData: ImageData): Promise<any> {
    // This would implement HQ-SAM refinement logic
    // For now, return original results as refinement is complex
    // In a full implementation, this would:
    // 1. Load HQ-SAM model if not loaded
    // 2. Generate high-quality mask for complex edges
    // 3. Combine with original mask for better edge quality
    console.log('HQ-SAM refinement requested but not fully implemented');
    return results;
  }

  private getActiveExecutionProvider(): string {
    // This would track which execution provider is actually being used
    // Return based on successful initialization
    return 'webgpu'; // Placeholder - would be dynamically determined
  }

  private async postprocessONNXResults(results: any, originalImageData: ImageData, options?: any): Promise<Blob> {
    // Get the mask output (assumes single output tensor)
    const outputTensor = Object.values(results)[0] as Tensor;
    const maskData = outputTensor.data as Float32Array;
    
    // Resize mask back to original image size
    const maskSize = Math.sqrt(maskData.length);
    const canvas = new OffscreenCanvas(originalImageData.width, originalImageData.height);
    const ctx = canvas.getContext('2d')!;
    
    // Create mask canvas
    const maskCanvas = new OffscreenCanvas(maskSize, maskSize);
    const maskCtx = maskCanvas.getContext('2d')!;
    const maskImageData = new ImageData(maskSize, maskSize);
    
    // Convert mask to ImageData
    for (let i = 0; i < maskData.length; i++) {
      const alpha = Math.round(Math.max(0, Math.min(1, maskData[i])) * 255);
      const pixelIndex = i * 4;
      maskImageData.data[pixelIndex] = alpha;     // R
      maskImageData.data[pixelIndex + 1] = alpha; // G
      maskImageData.data[pixelIndex + 2] = alpha; // B
      maskImageData.data[pixelIndex + 3] = 255;   // A
    }
    
    maskCtx.putImageData(maskImageData, 0, 0);
    
    // Draw original image
    ctx.putImageData(originalImageData, 0, 0);
    
    // Apply mask
    const finalImageData = ctx.getImageData(0, 0, originalImageData.width, originalImageData.height);
    const data = finalImageData.data;
    
    // Resize mask to match original image and apply
    const resizedMaskCanvas = new OffscreenCanvas(originalImageData.width, originalImageData.height);
    const resizedMaskCtx = resizedMaskCanvas.getContext('2d')!;
    resizedMaskCtx.drawImage(maskCanvas, 0, 0, originalImageData.width, originalImageData.height);
    const resizedMaskData = resizedMaskCtx.getImageData(0, 0, originalImageData.width, originalImageData.height);
    
    for (let i = 0; i < data.length; i += 4) {
      const maskAlpha = resizedMaskData.data[i] / 255; // Use R channel as alpha
      data[i + 3] = Math.round(maskAlpha * 255);
    }
    
    ctx.putImageData(finalImageData, 0, 0);
    
    // Apply background if specified
    if (options?.backgroundType && options.backgroundType !== 'transparent') {
      await this.applyBackground(canvas, ctx, options);
    }
    
    // Export with specified format and quality
    const format = options?.exportFormat || 'png';
    const quality = (options?.exportQuality || 90) / 100;
    
    const mimeType = format === 'png' ? 'image/png' : 
                    format === 'webp' ? 'image/webp' : 'image/jpeg';
    
    return await canvas.convertToBlob({ 
      type: mimeType, 
      quality: format !== 'png' ? quality : undefined 
    });
  }

  async getCapabilities() {
    const capabilities = {
      webgpu: false,
      webgl: false,
      wasm: true,
      maxResolution: 4096,
      estimatedMemory: 0,
      supportedModels: ['rmbg-1.4', 'u2net', 'u2netp', 'modnet'] as const,
      threadsAvailable: navigator.hardwareConcurrency || 1,
      isOfflineReady: false
    };

    // Check WebGPU support
    if ('gpu' in navigator) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (adapter) {
          capabilities.webgpu = true;
          // Check WebGPU features
          const device = await adapter.requestDevice();
          device.destroy();
        }
      } catch (e) {
        console.log('WebGPU not available:', e);
      }
    }

    // Check WebGL support
    try {
      const canvas = new OffscreenCanvas(1, 1);
      const gl2 = canvas.getContext('webgl2');
      const gl = canvas.getContext('webgl');
      capabilities.webgl = !!(gl2 || gl);
      
      // Log GPU info for diagnostics
      if (gl2 || gl) {
        const ctx = gl2 || gl;
        const debugInfo = ctx!.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          console.log('GPU:', ctx!.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        }
      }
    } catch (e) {
      console.log('WebGL not available:', e);
    }

    // Check if models are cached (offline ready)
    try {
      const cache = await caches.open('ai-models-v1');
      const cachedUrls = await cache.keys();
      capabilities.isOfflineReady = cachedUrls.length > 0;
    } catch (e) {
      console.log('Cache API not available:', e);
    }

    // Estimate available memory
    if ('memory' in performance) {
      capabilities.estimatedMemory = (performance as any).memory.usedJSHeapSize;
    }

    return capabilities;
  }

  private async applyBackground(canvas: OffscreenCanvas, ctx: OffscreenCanvasRenderingContext2D, options: any): Promise<void> {
    const { width, height } = canvas;
    const bgCanvas = new OffscreenCanvas(width, height);
    const bgCtx = bgCanvas.getContext('2d')!;
    
    switch (options.backgroundType) {
      case 'color':
        bgCtx.fillStyle = options.backgroundColor || '#ffffff';
        bgCtx.fillRect(0, 0, width, height);
        break;
        
      case 'gradient':
        const gradient = bgCtx.createLinearGradient(
          0, 0, 
          Math.cos(options.backgroundGradient?.direction * Math.PI / 180) * width,
          Math.sin(options.backgroundGradient?.direction * Math.PI / 180) * height
        );
        gradient.addColorStop(0, options.backgroundGradient?.start || '#ff0000');
        gradient.addColorStop(1, options.backgroundGradient?.end || '#0000ff');
        bgCtx.fillStyle = gradient;
        bgCtx.fillRect(0, 0, width, height);
        break;
        
      case 'blur':
        // Create blurred version of original image
        bgCtx.filter = 'blur(20px)';
        bgCtx.drawImage(canvas, 0, 0);
        bgCtx.filter = 'none';
        break;
        
      case 'image':
        // This would require loading the background image
        // For now, fall back to white
        bgCtx.fillStyle = '#ffffff';
        bgCtx.fillRect(0, 0, width, height);
        break;
    }
    
    // Composite background behind the subject
    bgCtx.globalCompositeOperation = 'destination-over';
    bgCtx.drawImage(canvas, 0, 0);
    
    // Copy back to main canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bgCanvas, 0, 0);
  }

  cleanup() {
    this.models.forEach(session => session.release());
    this.models.clear();
    this.initialized = false;
  }
}

const worker = new BackgroundRemovalWorker();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  try {
    let result;

    switch (type) {
      case 'initialize':
        result = await worker.initialize(payload.engine, payload.options);
        break;
      case 'process':
        result = await worker.processImage(
          payload.engine,
          payload.imageData,
          payload.options,
          (progress) => {
            self.postMessage({
              id,
              type: 'progress',
              payload: { progress }
            } as WorkerResponse);
          }
        );
        break;
      case 'analyze':
        result = await worker.analyzeImage(payload.imageData);
        break;
      case 'capabilities':
        result = await worker.getCapabilities();
        break;
      case 'cleanup':
        worker.cleanup();
        result = { success: true };
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    self.postMessage({
      id,
      type: type === 'capabilities' ? 'capabilities' : 'result',
      payload: result
    } as WorkerResponse);
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      payload: { error: error instanceof Error ? error.message : String(error) }
    } as WorkerResponse);
  }
};