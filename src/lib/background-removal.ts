import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

// Smooth mask edges to reduce artifacts
function smoothMask(maskData: Uint8Array | Uint8ClampedArray | Float32Array, width: number, height: number): Float32Array {
  const smoothed = new Float32Array(maskData.length);
  const kernelSize = 3;
  const halfKernel = Math.floor(kernelSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      
      // Apply Gaussian-like smoothing kernel
      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const ny = y + ky;
          const nx = x + kx;
          
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const idx = ny * width + nx;
            // Normalize values to 0-1 range
            const value = maskData[idx] / (maskData instanceof Float32Array ? 1 : 255);
            sum += value;
            count++;
          }
        }
      }
      
      const idx = y * width + x;
      smoothed[idx] = sum / count;
    }
  }
  
  return smoothed;
}

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    onProgress?.(10);
    
    console.log('Creating portrait matting pipeline with MODNet (optimized for people)...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/modnet');
    console.log('MODNet pipeline created successfully - optimized for human subjects');
    
    onProgress?.(40);
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    onProgress?.(50);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    onProgress?.(60);
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    onProgress?.(80);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Smooth the mask to reduce artifacts
    console.log('Smoothing mask for better edge quality...');
    const smoothedMask = smoothMask(result[0].mask.data, canvas.width, canvas.height);
    
    // Apply the smoothed mask with better thresholding
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply mask with improved alpha blending and edge feathering
    for (let i = 0; i < smoothedMask.length; i++) {
      // Use smoothed mask value directly (MODNet outputs alpha values, not inverted)
      let alpha = Math.round(smoothedMask[i] * 255);
      
      // Apply soft thresholding for cleaner edges
      if (alpha < 10) alpha = 0; // Remove low-confidence pixels
      if (alpha > 245) alpha = 255; // Keep high-confidence pixels
      
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    onProgress?.(90);
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            onProgress?.(100);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
