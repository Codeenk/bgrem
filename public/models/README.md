# AI Models Directory

This directory contains ONNX models for advanced background removal processing.

## Required Models (to be downloaded)

### General Purpose Models
- **rmbg-1.4.onnx** - BRIA AI's robust general background removal model (Apache 2.0)
- **u2net.onnx** - U²-Net full model for detailed object segmentation (Apache 2.0)
- **u2netp.onnx** - U²-Net portable model for faster processing (Apache 2.0)
- **modnet.onnx** - MODNet optimized for human portrait processing (Apache 2.0)

### Advanced Refinement (Optional)
- **hq-sam.onnx** - High-Quality Segment Anything Model for edge refinement (Apache 2.0)

## Model Sources

You can download these models from:
1. **ONNX Model Zoo**: https://github.com/onnx/models
2. **Hugging Face**: https://huggingface.co/models (converted ONNX versions)
3. **Official repositories** of each model

## Usage Notes

- Models are loaded on-demand when selected in Advanced mode
- Models are cached by the Service Worker for offline use
- All models use permissive licenses (Apache 2.0/MIT compatible)
- Place model files directly in this directory with the exact names shown above

## Size Considerations

- rmbg-1.4.onnx: ~176 MB
- u2net.onnx: ~176 MB  
- u2netp.onnx: ~4.7 MB
- modnet.onnx: ~25 MB
- hq-sam.onnx: ~2.6 GB (large model, optional)

Total storage for all models: ~2.9 GB