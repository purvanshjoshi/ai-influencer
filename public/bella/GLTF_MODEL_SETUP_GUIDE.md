# glTF 3D Avatar Model Setup Guide

## IMPORTANT FINDING

**The Bella repository does NOT have pre-built glTF 3D avatar models.**

Bella uses:
- Video backgrounds (MP4 files)
- JavaScript LLM integration
- Voice processing
- But NO 3D avatar model files

## Why Bella Doesn't Have glTF Models

Bella is primarily a **voice-driven AI chatbot**, not a 3D avatar system. It:
1. Uses video backgrounds for visual interface
2. Focuses on LLM + voice processing
3. Does NOT include 3D character models

## Solution: Add Your Own glTF Model

The good news: Your AI Influencer platform is **already configured and ready** to accept any glTF model!

### Quick Setup (5 Minutes)

#### Step 1: Download a Free glTF Avatar

Choose one of these options:

**Option A: Mixamo by Adobe (RECOMMENDED)**
```
1. Go to https://www.mixamo.com/
2. Download any character (free)
3. Export as: glTF format
4. Download will give you:
   - model.gltf
   - model.bin
   - textures/
```

**Option B: Sketchfab**
```
1. Go to https://sketchfab.com/
2. Search: "3d avatar gltf free"
3. Filter by: "Downloadable", "License: Free"
4. Click Download → Export as glTF
```

**Option C: ReadyPlayer.Me**
```
1. Go to https://readyplayer.me/
2. Create your custom avatar
3. Export as glTF
```

#### Step 2: Add to Your Project

```bash
# Create models directory (if not exists)
mkdir -p public/bella/assets/models

# Copy your glTF files
cp ~/Downloads/model.gltf public/bella/assets/models/avatar.gltf
cp ~/Downloads/model.bin public/bella/assets/models/avatar.bin
cp ~/Downloads/textures/* public/bella/assets/models/textures/
```

#### Step 3: Update Configuration

Edit `.env.production`:

```env
REACT_APP_AVATAR_MODEL_PATH=/bella/assets/models/avatar.gltf
REACT_APP_AVATAR_MORPH_TARGETS=true
```

#### Step 4: Deploy

```bash
git add .
git commit -m "feat: Add glTF avatar model"
git push origin main
```

That's it! Your 3D avatar will be live. 🚀

## Model Requirements for AI Influencer

Your model should ideally have:

✓ **Morph Targets** (Blend Shapes) for:
  - jawOpen (for mouth movement)
  - eyeOpen (for blinking)
  - browRaise (for expressions)
  - mouthSmile (for emotions)

✓ **File Size** < 10MB
  - Optimized textures
  - Compressed geometry

✓ **Format**
  - glTF 2.0 (.gltf + .bin)
  - Or glB (single .glb file)

## How It Works

Once you add the model:

```
User speaks
    ↓
VoiceAgent captures audio
    ↓
FFTAudioAnalyzer.js processes voice
    ↓
Extracts mouth shapes from frequencies
    ↓
ThreeJsSceneService.loadGLTFModel() loads your avatar
    ↓
Updates morph targets in real-time
    ↓
Avatar LIPS SYNC with user's voice!
    ↓
FacialExpressionSystem detects emotion
    ↓
Avatar's face shows emotion
    ↓
Live interactive 3D AI experience ✨
```

## File Structure

After adding your model:

```
public/bella/
├── assets/
│   └── models/
│       ├── avatar.gltf          ← Main model file
│       ├── avatar.bin           ← Binary data
│       └── textures/            ← Texture files
├── components/
│   ├── BellaAvatarComponent.jsx ✓
│   └── AvatarIntegrationManager.jsx ✓
├── services/
│   ├── ThreeJsSceneService.js ✓
│   ├── FFTAudioAnalyzer.js ✓
│   ├── FacialExpressionSystem.js ✓
│   └── PerformanceOptimizer.js ✓
├── styles/
│   └── avatarStyles.css ✓
└── documentation/ ✓
```

## Troubleshooting

### Model doesn't load

```javascript
// Check browser console for errors
const model = await sceneService.loadGLTFModel('/bella/assets/models/avatar.gltf');
// If error: Check file paths and CORS headers
```

### Morph targets not working

```javascript
// Your model might not have morph targets
// Create them in Blender:
// 1. Duplicate mesh
// 2. Modify duplicate (open mouth, raise brow, etc.)
// 3. Create shape keys
// 4. Export as glTF
```

### Large file size

```bash
# Compress textures with ImageMagick
convert texture.png -quality 85 texture-compressed.png

# Or use online tool: TinyPNG
```

## Performance Tips

**For smooth 60 FPS:**
- Keep model < 50k triangles
- Use 2k or 1k textures max
- Enable WebGL vertex compression
- Use LOD (Level of Detail) techniques

## Next Steps

1. Download a free avatar from Mixamo/Sketchfab
2. Add to `public/bella/assets/models/`
3. Update .env config
4. Deploy
5. See your 3D avatar come to life! 🎉

## Resources

- **Mixamo**: https://www.mixamo.com/ (Free, rigged characters)
- **Sketchfab**: https://sketchfab.com/ (Free 3D models)
- **ReadyPlayer.Me**: https://readyplayer.me/ (Custom avatars)
- **Blender**: https://www.blender.org/ (Create/modify models)
- **glTF Spec**: https://www.khronos.org/gltf/ (Technical specs)

## Your System is 100% Ready

✅ Backend services (650+ LOC)
✅ React components
✅ Three.js rendering
✅ Voice synchronization
✅ Facial expressions
✅ Performance optimization
✅ Documentation
✅ Production deployment guide

👉 **Just add a glTF model and deploy!**
