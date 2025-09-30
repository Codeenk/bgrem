export type EngineType = 'baseline' | 'onnx' | 'transformers';

export type QualityPreset = 'fast' | 'balanced' | 'high';

export type AccelerationType = 'auto' | 'webgpu' | 'webgl' | 'wasm';

export type ModelType = 'rmbg-1.4' | 'u2net' | 'u2netp' | 'modnet';

export type ImageType = 'auto' | 'person' | 'object' | 'graphic' | 'product';

export type ProcessingMode = 'general' | 'portrait' | 'object' | 'logo' | 'product' | 'illustration';

export type BackgroundType = 'transparent' | 'color' | 'gradient' | 'blur' | 'image';

export interface ProcessingOptions {
  // Mode controls
  isAdvancedMode: boolean;
  
  // Quality and performance
  quality: QualityPreset;
  acceleration: AccelerationType;
  fullResolution: boolean;
  
  // Image type and processing mode
  imageType: ImageType;
  processingMode: ProcessingMode;
  autoDetectImageType: boolean;
  
  // Advanced options
  refineWithHQSAM: boolean;
  useTransformersJS: boolean;
  model: ModelType;
  
  // Background options
  backgroundType: BackgroundType;
  backgroundColor?: string;
  backgroundGradient?: { start: string; end: string; direction: number };
  backgroundImage?: File;
  
  // Export options
  exportFormat: 'png' | 'webp' | 'jpeg';
  exportQuality: number; // 0-100
}

export interface EngineCapabilities {
  webgpu: boolean;
  webgl: boolean;
  wasm: boolean;
  maxResolution: number;
  estimatedMemory: number;
  supportedModels: ModelType[];
  threadsAvailable: number;
  isOfflineReady: boolean;
}

export interface ImageAnalysis {
  detectedType: ImageType;
  confidence: number;
  suggestedMode: ProcessingMode;
  suggestedModel: ModelType;
  features: {
    hasPerson: boolean;
    hasMultiplePeople: boolean;
    hasText: boolean;
    isGraphic: boolean;
    isProduct: boolean;
    complexity: 'simple' | 'moderate' | 'complex';
  };
}

export interface ProcessingResult {
  blob: Blob;
  processingTime: number;
  engineUsed: string;
  modelUsed: string;
  resolution: { width: number; height: number };
  memoryUsed?: number;
  executionProvider?: string;
  refinementApplied?: boolean;
  imageAnalysis?: ImageAnalysis;
}

export interface ProcessingProgress {
  stage: string;
  progress: number;
  message?: string;
}

export abstract class BackgroundRemovalEngine {
  abstract name: string;
  abstract initialize(options: ProcessingOptions): Promise<void>;
  abstract processImage(
    imageElement: HTMLImageElement,
    options: ProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<ProcessingResult>;
  abstract cleanup(): Promise<void>;
  abstract getCapabilities(): Promise<EngineCapabilities>;
}