import { useRef, useCallback } from 'react';
import { ProcessingOptions, ProcessingResult, ProcessingProgress, EngineCapabilities } from '@/types/engines';

export interface WorkerBridgeAPI {
  processImage: (imageData: ImageData, options: ProcessingOptions) => Promise<ProcessingResult>;
  getCapabilities: () => Promise<EngineCapabilities>;
  preloadModel: (model: string) => Promise<void>;
  cleanup: () => void;
}

interface WorkerBridgeProps {
  onProgress?: (progress: ProcessingProgress) => void;
  children: (api: WorkerBridgeAPI) => React.ReactNode;
}

export const WorkerBridge = ({ onProgress, children }: WorkerBridgeProps) => {
  const workerRef = useRef<Worker | null>(null);
  const messageIdRef = useRef(0);
  const pendingRequests = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());

  const initializeWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/bg-removal-worker.ts', import.meta.url), 
        { type: 'module' }
      );

      workerRef.current.onmessage = (event) => {
        const { id, type, payload } = event.data;
        
        if (type === 'progress' && onProgress) {
          onProgress(payload);
          return;
        }

        const request = pendingRequests.current.get(id);
        if (!request) return;

        pendingRequests.current.delete(id);

        if (type === 'error') {
          request.reject(new Error(payload.error));
        } else {
          request.resolve(payload);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        // Reject all pending requests
        pendingRequests.current.forEach(({ reject }) => {
          reject(new Error('Worker error'));
        });
        pendingRequests.current.clear();
      };
    }
  }, [onProgress]);

  const postMessage = useCallback((type: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        initializeWorker();
      }

      const id = (++messageIdRef.current).toString();
      pendingRequests.current.set(id, { resolve, reject });

      workerRef.current!.postMessage({ id, type, payload });
    });
  }, [initializeWorker]);

  const api: WorkerBridgeAPI = {
    processImage: useCallback(async (imageData: ImageData, options: ProcessingOptions) => {
      // Select engine based on options
      let engine = 'baseline';
      if (options.useTransformersJS) {
        engine = 'transformers';
      } else if (options.isAdvancedMode || options.refineWithHQSAM) {
        engine = 'onnx';
      }

      // Initialize engine if needed
      await postMessage('initialize', { engine, options });

      // Process image
      const result = await postMessage('process', {
        engine,
        imageData,
        options
      });

      return result;
    }, [postMessage]),

    getCapabilities: useCallback(async () => {
      try {
        return await postMessage('capabilities', {});
      } catch (error) {
        console.error('Failed to get capabilities:', error);
        return null;
      }
    }, [postMessage]),

    preloadModel: useCallback(async (model: string) => {
      await postMessage('preload', { model });
    }, [postMessage]),

    cleanup: useCallback(() => {
      if (workerRef.current) {
        postMessage('cleanup', {}).catch(console.error);
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingRequests.current.clear();
    }, [postMessage])
  };

  return <>{children(api)}</>;
};