# Phase 6: Voice Integration Handler

**Complete guide for integrating Bella video avatar with voice agents**

---

## Quick Integration (Copy & Paste)

Add this to your main voice handler component:

```jsx
import React, { useRef, useState } from 'react';
import BellaVideoAvatarComponent from '../public/bella/components/BellaVideoAvatarComponent.jsx';
import AvatarTestHelper from '../public/bella/core/AvatarTestHelper.js';
import videoConfig from '../public/bella/video-config.json';
import { cloudVoiceAPI } from '../services/cloudVoiceAPI';
import { cloudAPI } from '../services/cloudAPI';

function VoiceAvatarIntegration() {
  const avatarRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  // Step 1: User starts speaking
  const handleVoiceStart = () => {
    setIsListening(true);
    avatarRef.current?.playAnimation('thinking', false);
    console.log('🎤 Listening...');
  };

  // Step 2: User finishes speaking
  const handleVoiceEnd = async (audioBlob) => {
    try {
      // Transcribe audio
      const text = await cloudVoiceAPI.transcribeAudio(audioBlob);
      setTranscript(text);
      console.log('Transcribed:', text);

      // Send to LLM
      const llmResponse = await cloudAPI.chat(text);
      setResponse(llmResponse);

      // Analyze sentiment and play animation
      const sentiment = AvatarTestHelper.analyzeSentimentLocal(llmResponse);
      const emotion = mapSentimentToEmotion(sentiment);
      avatarRef.current?.playEmotionAnimation(emotion);

      // Synthesize speech
      await speakResponse(llmResponse);

      // Return to idle
      setIsListening(false);
      avatarRef.current?.playAnimation('idle', true);
    } catch (error) {
      console.error('Error:', error);
      avatarRef.current?.playAnimation('sad');
      setIsListening(false);
    }
  };

  const mapSentimentToEmotion = (sentiment) => {
    const map = {
      'positive': 'happy',
      'negative': 'sad',
      'neutral': 'idle',
      'contemplative': 'thinking'
    };
    return map[sentiment] || 'idle';
  };

  const speakResponse = async (text) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = resolve;
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  };

  return (
    <div className="voice-avatar-container">
      <div className="avatar-section">
        <BellaVideoAvatarComponent
          ref={avatarRef}
          autoPlayIdle={true}
          emotionMap={videoConfig.emotions}
          onAnimationStart={(anim) => console.log('Animation:', anim)}
        />
      </div>
      <div className="controls">
        <button onClick={handleVoiceStart}>🎤 Start Listening</button>
        <button onClick={() => handleVoiceEnd(null)}>Stop</button>
        <p>Transcript: {transcript}</p>
        <p>Response: {response}</p>
      </div>
    </div>
  );
}

export default VoiceAvatarIntegration;
```

---

## Sentiment Analysis

Use the built-in sentiment analyzer:

```javascript
import AvatarTestHelper from '../core/AvatarTestHelper.js';

const sentiment = AvatarTestHelper.analyzeSentimentLocal('Great! I love this!');
console.log(sentiment); // 'positive'

const emotion = mapSentimentToEmotion(sentiment);
avatarRef.current?.playEmotionAnimation(emotion);
```

**Sentiment Types:**
- `positive` → happy
- `negative` → sad
- `contemplative` → thinking
- `neutral` → idle

---

## Connection Points with Voice Agents

### From Phase 1: Voice Recognition

```javascript
// When voice is detected
onVoiceDetected: () => {
  avatarRef.current?.playAnimation('thinking', false);
}
```

### From Phase 2: LLM Response

```javascript
// When LLM returns response
onLLMResponse: (response) => {
  const sentiment = AvatarTestHelper.analyzeSentimentLocal(response);
  const emotion = mapSentimentToEmotion(sentiment);
  avatarRef.current?.playEmotionAnimation(emotion);
}
```

### From Phase 3: Text-to-Speech

```javascript
// During speech synthesis
onSpeechStart: () => {
  // Keep current animation (happy, sad, etc.)
}

onSpeechEnd: () => {
  avatarRef.current?.playAnimation('idle', true);
}
```

---

## Complete Voice Flow

```
┌─────────────────────────────────────┐
│   User Speaks (Audio Input)         │
└──────────────┬──────────────────────┘
               ↓
     ┌─────────────────────┐
     │ Show 'thinking'     │
     │ Animation           │
     └──────────┬──────────┘
                ↓
     ┌─────────────────────────────┐
     │ Transcribe Audio            │
     │ (cloudVoiceAPI)             │
     └──────────┬──────────────────┘
                ↓
     ┌─────────────────────────────┐
     │ Send to LLM                 │
     │ (cloudAPI.chat)             │
     └──────────┬──────────────────┘
                ↓
     ┌─────────────────────────────┐
     │ Analyze Sentiment           │
     │ Get Emotion Type            │
     └──────────┬──────────────────┘
                ↓
     ┌─────────────────────────────┐
     │ Play Emotion Animation      │
     │ (happy/sad/etc)             │
     └──────────┬──────────────────┘
                ↓
     ┌─────────────────────────────┐
     │ Synthesize & Play Speech    │
     │ Keep Avatar Animating       │
     └──────────┬──────────────────┘
                ↓
     ┌─────────────────────────────┐
     │ Return to Idle Loop         │
     │ Ready for Next Input        │
     └─────────────────────────────┘
```

---

## Testing Voice Integration

### Test All Animations

```javascript
import AvatarTestHelper from '../core/AvatarTestHelper.js';

// Test all 10 emotions
AvatarTestHelper.testAllAnimations(avatarRef);
```

### Simulate Voice Flow

```javascript
// Simulate user input → LLM response → avatar animation
AvatarTestHelper.simulateVoiceFlow(
  avatarRef,
  'Hello, how are you?',
  'I am doing great! Thanks for asking.'
);
```

### Test Voice Integration

```javascript
// Test complete voice scenarios
AvatarTestHelper.testVoiceIntegration(avatarRef);
```

### Run Full Test Suite

```javascript
// Run all tests including performance
AvatarTestHelper.runFullTestSuite(avatarRef);
```

---

## Emotion Mapping

Default emotion to animation mapping:

| Sentiment | Animation | Use Case |
|-----------|-----------|----------|
| positive | happy | Positive responses, praise |
| negative | sad | Empathetic responses |
| contemplative | thinking | Processing, considering |
| neutral | idle | Default, standby |
| greeting | greeting | Initial greetings |
| affirmative | nodding | Agreement, confirmation |
| encouraging | encouraging | Support, praise |

---

## Custom Emotion Mapping

Override default emotions:

```jsx
const customEmotionMap = {
  'custom_emotion_1': 'happy',
  'custom_emotion_2': 'thinking'
};

<BellaVideoAvatarComponent
  ref={avatarRef}
  emotionMap={customEmotionMap}
/>
```

---

## Performance Optimization

### Lazy Loading Videos

```javascript
// Preload videos on component mount
useEffect(() => {
  // Videos are preloaded in VideoAnimationService
  // by default, so no action needed
}, []);
```

### Cache Sentiment Analysis

```javascript
const sentimentCache = new Map();

const getCachedSentiment = (text) => {
  if (sentimentCache.has(text)) {
    return sentimentCache.get(text);
  }
  const sentiment = AvatarTestHelper.analyzeSentimentLocal(text);
  sentimentCache.set(text, sentiment);
  return sentiment;
};
```

---

## Error Handling

```javascript
const handleVoiceError = (error) => {
  console.error('Voice error:', error);
  
  if (error.type === 'no-speech') {
    avatarRef.current?.playAnimation('thinking', false);
  } else if (error.type === 'network-error') {
    avatarRef.current?.playAnimation('sad');
  } else {
    avatarRef.current?.playAnimation('idle', true);
  }
};
```

---

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Test Speech Synthesis Support:

```javascript
if ('speechSynthesis' in window) {
  console.log('Speech synthesis supported');
} else {
  console.warn('Speech synthesis not supported');
}
```

---

## Mobile Considerations

```css
@media (max-width: 768px) {
  .avatar-section {
    min-height: 300px;
  }
  
  .controls {
    padding: 10px;
  }
}
```

---

## Debugging

### Enable Debug Logs

```javascript
const DEBUG = true;

if (DEBUG) {
  avatarRef.current?.playAnimation('idle');
  console.log('Avatar initialized');
}
```

### Check Animation State

```javascript
const state = avatarRef.current?.getState?.();
console.log('Current animation:', state?.currentAnimation);
console.log('Is loading:', state?.isLoading);
console.log('Is initialized:', state?.isInitialized);
```

---

## Next Steps

1. ✅ Implement voice recognition (Phase 1)
2. ✅ Connect to LLM (Phase 2)
3. ✅ Add text-to-speech (Phase 3)
4. ✅ Integrate video avatar (Phase 6)
5. 🔄 Test complete pipeline
6. 🚀 Deploy to production
7. 📊 Monitor performance
8. 🎯 Collect user feedback

---

## Support

**Documentation:**
- PHASE_6_NEXT_STEPS.md - Implementation guide
- AvatarTestHelper.js - Testing utilities
- PHASE_6_BELLA_VIDEO_INTEGRATION_GUIDE.md - Full integration details

**Example Code:**
- See `AvatarTestHelper.simulateVoiceFlow()` for voice flow simulation
- See `BellaVideoAvatarComponent.jsx` for component props

**Common Issues:**
- Videos not playing? Check browser console for 404 errors
- Avatar not responding? Verify `video-config.json` paths
- Sentiment analysis wrong? Customize with your own analyzer

---

**Ready to integrate! Follow PHASE_6_NEXT_STEPS.md for step-by-step instructions.**
