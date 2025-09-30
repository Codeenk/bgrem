# ONNX Runtime Web Assets

This directory contains ONNX Runtime Web WASM files for client-side AI inference.

## Files

These files are automatically managed by ONNX Runtime Web:

- **ort-wasm.wasm** - Basic WebAssembly runtime
- **ort-wasm-simd.wasm** - SIMD-optimized runtime
- **ort-wasm-threaded.wasm** - Multi-threaded runtime
- **ort-wasm-simd-threaded.wasm** - SIMD + Threading (best performance)

## Usage

These files are loaded automatically based on browser capabilities:
1. **Chrome/Edge with SharedArrayBuffer** → simd-threaded
2. **Modern browsers with SIMD** → simd
3. **Fallback browsers** → basic wasm

## Cross-Origin Headers

These files require proper CORS headers for SharedArrayBuffer support:
- Cross-Origin-Embedder-Policy: require-corp
- Cross-Origin-Opener-Policy: same-origin

The Vercel configuration handles this automatically.