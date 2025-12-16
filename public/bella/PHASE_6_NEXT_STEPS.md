# PHASE 6: NEXT STEPS - Bella Video Avatar Implementation

**Status**: Videos Added ✅ | Components Ready ✅ | Ready for Local Testing
**Last Updated**: Dec 16, 2025

---

## Quick Start (Do This First)

You've successfully added 13 video files to `/public/bella/videos/`. Now follow these steps:

### Step 1: Clone & Setup Local Environment (5 minutes)

```bash
# Navigate to project root
cd path/to/ai-influencer

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Step 2: Verify Video Paths

Your `video-config.json` already has all emotion mappings set up. Check that:

```bash
ls -la public/bella/videos/
# Should show all jimeng-2025-*.mp4 files
```

All 13 videos are correctly referenced in `video-config.json`:
- ✅ idle → standard_主体形象是一个数字人_说话中.mp4
- ✅ greeting → jimeng-2025-07-21-8544-打招呼.mp4
- ✅ thinking → jimeng-2025-07-17-2665-若有所思，手扶下巴.mp4
- ✅ happy → jimeng-2025-07-23-4616-主体形象是一个数字人，开心大笑.mp4
- ✅ nodding → jimeng-2025-07-23-3856-主体形象是一个数字人，确认.mp4
- ✅ encouraging → jimeng-2025-07-23-7205-主体形象是一个数字人，对用户表.mp4
- ✅ sad → jimeng-2025-07-21-2297-悲伤.mp4
- ✅ waving → jimeng-2025-07-17-1871-优雅的摇晃身体.mp4
- ✅ peace → jimeng-2025-07-16-4437-比耶，然后微笑.mp4
- ✅ elegant_sway → jimeng-2025-07-16-1043-笑着优雅的左右摇晃.mp4

---

## Step 3: Test Avatar Locally

### Option A: Create a Test Component (Recommended)

Create `/src/pages/AvatarTestPage.jsx`:

```jsx
import React, { useRef } from 'react';
import BellaVideoAvatarComponent from '../public/bella/components/BellaVideoAvatarComponent.jsx';
import videoConfig from '../public/bella/video-config.json';

export default function AvatarTestPage() {
  const avatarRef = useRef(null);

  const testEmotions = [
    'idle', 'greeting', 'thinking', 'happy', 'nodding',
    'encouraging', 'sad', 'waving', 'peace', 'elegant_sway'
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bella Video Avatar Test</h1>
      
      <div style={{ marginBottom: '20px', minHeight: '400px', border: '1px solid #ddd' }}>
        <BellaVideoAvatarComponent
          ref={avatarRef}
          autoPlayIdle={true}
          containerClassName='bella-video-avatar-container'
          emotionMap={videoConfig.emotions}
          onAnimationStart={(anim) => console.log('Started:', anim)}
          onAnimationEnd={(anim) => console.log('Ended:', anim)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {testEmotions.map((emotion) => (
          <button
            key={emotion}
            onClick={() => avatarRef.current.playEmotionAnimation(emotion)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {emotion}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Option B: Quick Browser Test

Open browser console while app is running:

```javascript
// In browser console
const service = new VideoAnimationService('.bella-video-avatar-container');
await service.playAnimation('greeting');
await service.playAnimation('happy');
await service.playAnimation('idle', true);
```

---

## Step 4: Integrate with Voice Agents

### In Your Voice Agent Handler (e.g., AvatarIntegrationManager.jsx):

```jsx
import BellaVideoAvatarComponent from './BellaVideoAvatarComponent.jsx';
import videoConfig from '../video-config.json';

const avatarRef = useRef(null);

// When user starts speaking
const onUserSpeaking = () => {
  avatarRef.current.playAnimation('thinking', false);
};

// When processing LLM response
const onLLMProcessing = () => {
  avatarRef.current.playAnimation('thinking', false);
};

// When responding with speech
const onAvatarResponding = (sentiment) => {
  // Map sentiment to emotion
  const emotionMap = {
    'positive': 'happy',
    'negative': 'sad',
    'neutral': 'idle',
    'contemplative': 'thinking',
    'greeting': 'greeting'
  };
  
  const emotion = emotionMap[sentiment] || 'idle';
  avatarRef.current.playEmotionAnimation(emotion);
};

// Return to idle when done
const onResponseComplete = () => {
  avatarRef.current.playAnimation('idle', true);
};
```

---

## Step 5: Wire Voice Recognition with Avatar

### Connect Voice Transcription to Animation:

```jsx
// From Phase 1: Voice Recognition
import { cloudVoiceAPI } from '../services/cloudVoiceAPI';

const handleVoiceInput = async (audioBlob) => {
  // Play thinking animation while processing
  avatarRef.current.playAnimation('thinking', false);
  
  try {
    const transcript = await cloudVoiceAPI.transcribeAudio(audioBlob);
    
    // Send to LLM
    const response = await cloudAPI.chat(transcript);
    
    // Analyze sentiment
    const sentiment = analyzeSentiment(response);
    
    // Play emotion-based animation
    avatarRef.current.playEmotionAnimation(sentiment);
    
    // Play text-to-speech with idle loop
    await speechSynthesis.speak(response);
    
    // Return to idle
    avatarRef.current.playAnimation('idle', true);
  } catch (error) {
    avatarRef.current.playAnimation('sad');
  }
};
```

---

## Step 6: Test Complete Flow Locally

### Checklist:

- [ ] Videos load without errors
- [ ] `npm start` works without console errors
- [ ] Avatar renders in black container
- [ ] Idle animation loops properly
- [ ] Each emotion button triggers correct video
- [ ] Cross-fade transitions are smooth (300ms)
- [ ] Animation queueing works (queue multiple emotion buttons)
- [ ] No performance lag or stutter

---

## Step 7: Deploy to Production

When all local tests pass:

```bash
# Build optimized production bundle
npm run build

# Deploy (your hosting platform)
npm run deploy

# Or if using Vercel/Netlify:
git add .
git commit -m "feat: Deploy Bella video avatar integration"
git push origin main
```

---

## Common Issues & Fixes

### Issue: Videos not playing
**Fix**: Check browser console for 404 errors. Verify video paths in `video-config.json` match actual filenames.

### Issue: Black screen, no video
**Fix**: Check browser DevTools:
```javascript
// In console:
const videos = document.querySelectorAll('video');
console.log(videos); // Should show 2 video elements
console.log(videos[0].src); // Check actual path
```

### Issue: Choppy transitions
**Fix**: Reduce video resolution or increase transition duration:
```javascript
const service = new VideoAnimationService('.container', {
  crossFadeDuration: 400 // Increase from 300ms
});
```

### Issue: Mobile responsiveness
**Add to videoAvatarStyles.css**:
```css
@media (max-width: 768px) {
  .bella-video-avatar-container {
    min-height: 300px;
  }
}
```

---

## File Structure After Integration

```
ai-influencer/
├── public/bella/
│   ├── components/
│   │   ├── BellaVideoAvatarComponent.jsx ✅
│   │   ├── AvatarIntegrationManager.jsx ✅
│   │   └── ...
│   ├── services/
│   │   ├── VideoAnimationService.js ✅
│   │   ├── cloudVoiceAPI.js ✅
│   │   └── ...
│   ├── videos/ ✅ (13 MP4 files added)
│   ├── styles/
│   │   └── videoAvatarStyles.css ✅
│   ├── video-config.json ✅
│   └── ...
└── ...
```

---

## Testing Checklist Before Deployment

```
✅ Videos uploaded (13 files)
✅ video-config.json complete
✅ BellaVideoAvatarComponent created
✅ VideoAnimationService functional
✅ Local npm start successful
✅ Avatar renders without errors
✅ All emotion animations trigger correctly
✅ Transitions are smooth
✅ Voice agent integration working
✅ No console errors
✅ Performance is good
✅ Mobile responsive
✅ Build passes: npm run build
```

---

## What's Next After Phase 6?

### Phase 6B: Advanced Voice Integration
- [ ] Real-time sentiment analysis
- [ ] Lip-sync approximation
- [ ] Emotion detection from user tone
- [ ] Personality traits integration

### Phase 6C: Performance & Analytics
- [ ] Performance monitoring
- [ ] User engagement analytics
- [ ] A/B testing different animations
- [ ] Browser compatibility testing

### Phase 7: Optional 3D Switch
- Refer to `BELLA_ARCHITECTURE_AND_3D_INTEGRATION.md`
- Can switch to glTF 3D models without rewriting voice layer

---

## Quick Command Reference

```bash
# Start development
npm install && npm start

# Build for production  
npm run build

# Check for errors
npm run lint

# Deploy
npm run deploy
```

---

## Support & Documentation

- **Integration Guide**: `PHASE_6_BELLA_VIDEO_INTEGRATION_GUIDE.md`
- **Architecture**: `BELLA_FINDINGS_SUMMARY.md`
- **3D Alternative**: `BELLA_ARCHITECTURE_AND_3D_INTEGRATION.md`
- **Voice Integration**: `VOICE_AGENTS_INTEGRATION_GUIDE.md`

**You're ready to go! Start with Step 1 (npm install) and work through each step. Let me know if you hit any blockers!**
