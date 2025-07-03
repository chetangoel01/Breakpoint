# ML Model Integration Guide

## Overview

This guide explains the ML model integration implemented in the Breakpoint Electron app. The system uses a local Python script to run drowsiness detection without requiring Flask or external APIs.

## Architecture

```
Frontend (React) → Electron IPC → Python Script → ML Model → JSON Response
```

### Flow:
1. **Frontend**: Captures webcam frames and converts to base64
2. **Electron Main Process**: Receives base64 image via IPC
3. **Python Script**: Processes image with MediaPipe and ML model
4. **Response**: Returns prediction as JSON

## Files Modified/Created

### 1. `model/predict.py` ✅
- **Status**: Already implemented and working
- **Function**: Loads ML model, processes base64 images, returns predictions
- **Dependencies**: opencv-python, mediapipe, scikit-learn, joblib, numpy

### 2. `breakpoint/electron.js` ✅
- **Added**: IPC handler for `predict-image`
- **Function**: Spawns Python process, sends base64 data, returns results
- **Change**: Uses `python` command (conda environment)

### 3. `breakpoint/preload.js` ✅
- **Status**: Already had the correct setup
- **Function**: Exposes `window.drowsiness.predictFromBase64()` to renderer

### 4. `breakpoint/components/fatigue-detector.tsx` ✅
- **Complete rewrite**: Removed frontend MediaPipe, added backend communication
- **Function**: Captures frames every 2 seconds, sends to ML backend
- **Features**: Throttling, error handling, canvas-based frame capture

### 5. `breakpoint/package.json` ✅
- **Added**: Electron build configuration
- **Function**: Includes model files in packaged app via `extraFiles`
- **Added scripts**: `electron:build` and `electron:dist`

## Setup Instructions

### Prerequisites
1. **Python Environment**: Ensure you have conda or a Python environment with these packages:
   ```bash
   pip install opencv-python mediapipe scikit-learn joblib numpy
   ```

2. **Model Files**: Ensure these files exist in `model/` directory:
   - `rf_drowsiness_model.pkl`
   - `rf_scaler.pkl` 
   - `rf_label_encoder.pkl`
   - `predict.py`

### Development Setup
1. **Start Development Server**:
   ```bash
   cd breakpoint
   npm run dev
   ```

2. **Test ML Integration**: The fatigue detector will automatically:
   - Capture webcam frames every 2 seconds
   - Send frames to Python ML model
   - Display predictions in console
   - Update UI based on results

### Production Build
1. **Build for Distribution**:
   ```bash
   cd breakpoint
   npm run electron:dist
   ```

2. **The build will include**:
   - Next.js frontend
   - Electron main process
   - Model files in `resources/model/`
   - All dependencies

## API Reference

### Frontend API
```typescript
// Available in renderer process
window.drowsiness.predictFromBase64(base64Image: string): Promise<{
  status: string,      // "alert", "drowsy", or "no_face"
  confidence: number   // Prediction confidence (0-1)
}>
```

### Python Script Input/Output
```json
// Input (via stdin)
{
  "image": "base64_encoded_jpeg_string"
}

// Output (via stdout)
{
  "status": "alert" | "drowsy" | "no_face",
  "confidence": 0.85
}
```

## Troubleshooting

### Common Issues

1. **"ModuleNotFoundError: No module named 'cv2'"**
   - Install dependencies: `pip install opencv-python mediapipe scikit-learn joblib numpy`
   - Ensure correct Python environment is being used

2. **"Python script failed"**
   - Check if model files exist in `model/` directory
   - Verify Python executable path in `electron.js`
   - Check console for detailed error messages

3. **"No face detected"**
   - Ensure webcam permissions are granted
   - Check lighting conditions
   - Verify camera is working properly

### Debug Mode
Add console logging to see prediction results:
```javascript
// In fatigue-detector.tsx
console.log('Prediction result:', result)
```

## Performance Notes

- **Prediction Frequency**: Currently set to every 2 seconds to avoid overwhelming the Python process
- **Image Size**: Frames are resized to 640x480 for optimal performance
- **Memory Usage**: Python process is spawned for each prediction (stateless)

## Future Improvements

1. **PyInstaller Integration**: Bundle Python script as executable to avoid dependency issues
2. **Persistent Python Process**: Keep Python process running to reduce startup overhead
3. **Error Recovery**: Better handling of Python process failures
4. **Model Updates**: Hot-swapping of ML models without restart

## Testing

The integration has been tested with:
- ✅ Synthetic face images
- ✅ IPC communication
- ✅ JSON parsing
- ✅ Error handling
- ✅ Build configuration

For real webcam testing, run the development server and check browser console for prediction logs. 