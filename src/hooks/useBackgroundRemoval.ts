import { useState, useRef, useCallback } from 'react';
import { ProcessingOptions, ProcessingResult, ProcessingProgress, EngineCapabilities, ImageAnalysis } from '@/types/engines';

interface UseBackgroundRemovalReturn {
  processImage: (image: HTMLImageElement, options: ProcessingOptions) => Promise<ProcessingResult>;
  analyzeImage: (image: HTMLImageElement) => Promise<ImageAnalysis>;
  isProcessing: boolean;
  isAnalyzing: boolean;
  progress: ProcessingProgress | null;
  capabilities: EngineCapabilities | null;
  getCapabilities: () => Promise<EngineCapabilities | null>;
  initializeEngine: (engine: string, options: any) => Promise<void>;
  cleanup: () => void;
}

export const useBackgroundRemoval = (): UseBackgroundRemovalReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [capabilities, setCapabilities] = useState<EngineCapabilities | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const messageIdRef = useRef(0);
  const pendingRequests = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());

  const initializeWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/bg-removal-worker.ts', import.meta.url), { 
        type: 'module' 
      });

      workerRef.current.onmessage = (event) => {
        const { id, type, payload } = event.data;
        const request = pendingRequests.current.get(id);

        if (!request) return;

        switch (type) {
          case 'result':
            pendingRequests.current.delete(id);
            request.resolve(payload);
            break;
          case 'error':
            pendingRequests.current.delete(id);
            request.reject(new Error(payload.error));
            break;
          case 'progress':
            setProgress({
              stage: 'Processing',
              progress: payload.progress,
              message: `${Math.round(payload.progress)}% complete`
            });
            break;
          case 'capabilities':
            setCapabilities(payload);
            pendingRequests.current.delete(id);
            request.resolve(payload);
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        // Reject all pending requests
        pendingRequests.current.forEach(({ reject }) => {
          reject(new Error('Worker error occurred'));
        });
        pendingRequests.current.clear();
      };

      // Get initial capabilities
      getCapabilities();
    }
  }, []);

  const postMessage = useCallback((type: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        initializeWorker();
      }

      const id = (++messageIdRef.current).toString();
      pendingRequests.current.set(id, { resolve, reject });

      workerRef.current!.postMessage({
        id,
        type,
        payload
      });
    });
  }, [initializeWorker]);

  const getCapabilities = useCallback(async () => {
    try {
      const caps = await postMessage('capabilities', {});
      setCapabilities(caps);
      return caps;
    } catch (error) {
      console.error('Failed to get capabilities:', error);
      return null;
    }
  }, [postMessage]);

  const initializeEngine = useCallback(async (engine: string, options: any) => {
    initializeWorker();
    await postMessage('initialize', { engine, options });
  }, [postMessage]);

  const processImage = useCallback(async (
    image: HTMLImageElement,
    options: ProcessingOptions
  ): Promise<ProcessingResult> => {
    setIsProcessing(true);
    setProgress({ stage: 'Preparing', progress: 0 });

    try {
      // Convert image to ImageData
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Handle resolution limits
      let { width, height } = image;
      const maxDimension = options.fullResolution ? 4096 : (options.quality === 'fast' ? 1024 : 2048);
      
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);

      // Select engine based on options
      let engine = 'baseline';
      if (options.useTransformersJS) {
        engine = 'transformers';
      } else if (options.refineWithHQSAM || options.acceleration !== 'auto') {
        engine = 'onnx';
      }

      // Initialize engine if needed
      await initializeEngine(engine, {
        model: options.model || (options.refineWithHQSAM ? 'rmbg-1.4' : 'u2netp'),
        acceleration: options.acceleration,
        quality: options.quality,
        refineWithHQSAM: options.refineWithHQSAM
      });

      // Process image
      const result = await postMessage('process', {
        engine,
        imageData,
        options
      });

      return result;
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [postMessage, initializeEngine]);

  const analyzeImage = useCallback(async (image: HTMLImageElement): Promise<ImageAnalysis> => {
    setIsAnalyzing(true);

    try {
      // Convert image to ImageData
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);

      // Analyze image
      const analysis = await postMessage('analyze', { imageData });
      return analysis;
    } finally {
      setIsAnalyzing(false);
    }
  }, [postMessage]);

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      postMessage('cleanup', {}).catch(console.error);
      workerRef.current.terminate();
      workerRef.current = null;
    }
    pendingRequests.current.clear();
    setProgress(null);
    setIsProcessing(false);
  }, [postMessage]);

  return {
    processImage,
    analyzeImage,
    isProcessing,
    isAnalyzing,
    progress,
    capabilities,
    getCapabilities,
    initializeEngine,
    cleanup
  };
};