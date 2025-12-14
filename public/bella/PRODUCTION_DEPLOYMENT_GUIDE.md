# Production Deployment Guide - Phase 5 Bella 3D Avatar

## Pre-Deployment Checklist

### 1. Asset Preparation
- [ ] Obtain glTF 3D avatar model files
- [ ] Verify model has morph targets defined
- [ ] Optimize textures for web (512-2048px)
- [ ] Convert models to glTF 2.0 format
- [ ] Test model file sizes (<5MB recommended)

### 2. Audio Context Setup
- [ ] Configure browser audio permissions
- [ ] Test Web Audio API support
- [ ] Set up audio encoding formats (WAV/MP3)
- [ ] Configure microphone permissions
- [ ] Test on target browsers

### 3. Performance Setup
- [ ] Set up CDN for static assets
- [ ] Configure gzip compression
- [ ] Enable browser caching headers
- [ ] Set up performance monitoring
- [ ] Configure error logging

### 4. Security Setup
- [ ] Enable HTTPS/TLS
- [ ] Set up CORS headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Enable rate limiting
- [ ] Set up DDoS protection

## Step-by-Step Deployment Process

### Step 1: Add glTF Models

```bash
# Create assets directory
mkdir -p public/bella/assets/models

# Add your glTF models
cp /path/to/bella-avatar.gltf public/bella/assets/models/
cp /path/to/bella-avatar.bin public/bella/assets/models/
cp /path/to/textures/ public/bella/assets/models/
```

### Step 2: Configure Audio Permissions

**In your main app.js or index.html:**

```javascript
// Request microphone permission
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone access granted');
    // Initialize audio context
    initializeAudioContext(stream);
  })
  .catch(err => {
    console.error('Microphone access denied:', err);
    // Show fallback UI
  });
```

### Step 3: Initialize Services

```javascript
import ThreeJsSceneService from './services/ThreeJsSceneService.js';
import FFTAudioAnalyzer from './services/FFTAudioAnalyzer.js';
import FacialExpressionSystem from './services/FacialExpressionSystem.js';
import PerformanceOptimizer from './services/PerformanceOptimizer.js';

// Initialize in order
const canvas = document.getElementById('avatar-canvas');
const sceneService = new ThreeJsSceneService(canvas);
await sceneService.initialize();
await sceneService.loadGLTFModel('/bella/assets/models/bella-avatar.gltf');

const analyzer = new FFTAudioAnalyzer();
const faceSystem = new FacialExpressionSystem(sceneService.getAvatarModel());
const optimizer = new PerformanceOptimizer(sceneService.getRenderer(), sceneService.getScene());

sceneService.animate();
optimizer.enableAdaptiveRendering();
```

### Step 4: Environment Configuration

**Create .env.production:**

```env
REACT_APP_AVATAR_MODEL_PATH=/bella/assets/models/bella-avatar.gltf
REACT_APP_AUDIO_SAMPLE_RATE=44100
REACT_APP_PERFORMANCE_TARGET_FPS=60
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_LOG_LEVEL=info
```

### Step 5: Build and Deploy

```bash
# Build production version
npm run build

# Test locally
npm run serve

# Deploy to server
git push origin main

# Or deploy to cloud
# Vercel
vercel deploy --prod

# AWS
aws s3 sync dist/ s3://your-bucket/ --delete

# Azure
az staticwebapp update -n your-app --source-path dist
```

## Cross-Browser Testing

### Desktop Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✓ Full Support | Best performance |
| Firefox | 88+ | ✓ Full Support | Slightly lower GPU performance |
| Safari | 14+ | ✓ Full Support | Enable WebGL in settings |
| Edge | 90+ | ✓ Full Support | Chromium-based, same as Chrome |

### Mobile Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome Mobile | 90+ | ✓ Supported | Requires high-end device |
| Safari iOS | 14+ | ⚠ Limited | Audio limitations on iOS |
| Firefox Mobile | 88+ | ✓ Supported | Good performance |
| Samsung Internet | 14+ | ✓ Supported | Excellent on Samsung devices |

## Performance Monitoring

### Setup Google Analytics

```javascript
// Track avatar rendering performance
gtag('event', 'avatar_fps', {
  'value': currentFPS,
  'device': device_type,
  'browser': browser_name
});

// Track audio analysis latency
gtag('event', 'audio_latency', {
  'value': latencyMs,
  'sample_rate': sampleRate
});
```

### Setup Error Tracking (Sentry)

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project",
  environment: "production",
  tracesSampleRate: 1.0,
});

// Automatic error catching
try {
  sceneService.loadGLTFModel(modelPath);
} catch (error) {
  Sentry.captureException(error);
}
```

## Model-Specific Morph Target Mapping

**Create MorphTargetMapper.js:**

```javascript
class MorphTargetMapper {
  constructor(model) {
    this.model = model;
    this.mappings = {};
    this.detectMorphTargets();
  }
  
  detectMorphTargets() {
    this.model.traverse(node => {
      if (node.morphTargetInfluences) {
        node.morphTargetDictionary.forEach((name, index) => {
          this.mappings[name] = index;
        });
      }
    });
    console.log('Detected morph targets:', this.mappings);
  }
  
  applyMorphTarget(name, value) {
    if (this.mappings[name] !== undefined) {
      this.model.morphTargetInfluences[this.mappings[name]] = value;
    }
  }
}
```

## Mobile Touch Interactions

**Create TouchController.js:**

```javascript
class TouchController {
  constructor(canvas) {
    this.canvas = canvas;
    this.setupTouchHandlers();
  }
  
  setupTouchHandlers() {
    this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
  }
  
  onTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  }
  
  onTouchMove(e) {
    const deltaX = e.touches[0].clientX - this.startX;
    const deltaY = e.touches[0].clientY - this.startY;
    // Update camera rotation
  }
  
  onTouchEnd(e) {
    // Reset
  }
}
```

## Audio Context Manager

**Create AudioContextManager.js:**

```javascript
class AudioContextManager {
  constructor() {
    this.audioContext = null;
    this.microphone Stream = null;
  }
  
  async initialize() {
    // Support both AudioContext and webkitAudioContext
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Request microphone access
    this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return this.audioContext.createMediaStreamSource(this.microphoneStream);
  }
  
  resume() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
```

## Load Testing Checklist

- [ ] Test with 100+ concurrent users
- [ ] Monitor CPU/GPU usage
- [ ] Track memory leaks
- [ ] Test network throttling (3G/4G)
- [ ] Verify cache hit rates
- [ ] Test with large model files
- [ ] Stress test audio processing

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or use blue-green deployment
vercel alias set [old-deployment] production
```

## Monitoring Metrics

**Key metrics to track:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Avatar FPS (target: 60)
- Audio latency (<50ms)
- Error rate (<0.1%)

## Support & Documentation

- User guide: `/docs/USER_GUIDE.md`
- API documentation: `/docs/API_REFERENCE.md`
- Troubleshooting: `/docs/TROUBLESHOOTING.md`
- FAQ: `/docs/FAQ.md`
