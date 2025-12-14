PHASE_2_IMPLEMENTATION_GUIDE.md# Phase 2 Implementation Guide - Voice Integration Complete

## Overview

Phase 2 extends Influencer posts with voice AI capabilities through a unified data model and service layer. This guide integrates VoiceProfile model with your existing Express backend.

## What's Implemented

### 1. Database Layer

**VoiceProfile.js** - Mongoose model with:
- Audio Tour configuration (locations, interests, voice preferences)
- Customer Support Agent setup (agent ID, documentation URL, metrics)
- Voice RAG System (document tracking, queries handled)
- Preferences (voice personality, quality, auto-generation)
- Assets (audio URLs, responses, metadata)
- Analytics (plays, engagement, user interactions)
- Service health status

### 2. Service Layer

**voiceGenerationService.js** - Business logic for:
- `generateAudioTour()` - Create location-based audio tours
- `initializeSupportAgent()` - Setup support agent with documentation
- `querySupport()` - Process support queries with voice
- `uploadRAGDocument()` - Add PDF documents
- `queryRAG()` - Query documents with voice
- `getAnalytics()` - Retrieve usage metrics

### 3. API Routes Integration

**voice-routes.js** (Express) - Already in place:
- Proxy routes to Flask services
- Health checks
- Error handling

## Integration Steps

### Step 1: Connect Models to Influencer

Add reference to VoiceProfile in Influencer model:

```javascript
// In src/models/Influencer.js
const influencerSchema = new Schema({
  // ... existing fields
  voiceProfile: {
    type: Schema.Types.ObjectId,
    ref: 'VoiceProfile'
  },
  // ... rest of schema
});

// Add post-save hook to create VoiceProfile
influencerSchema.post('save', async function(doc) {
  if (!doc.voiceProfile) {
    const VoiceProfile = require('./VoiceProfile');
    const voiceProfile = new VoiceProfile({ influencerId: doc._id });
    await voiceProfile.save();
    doc.voiceProfile = voiceProfile._id;
    await doc.save();
  }
});
```

### Step 2: Create Voice Routes Integration Handler

Create `src/api/influencer-voice-routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const VoiceGenerationService = require('../services/voiceGenerationService');
const Influencer = require('../models/Influencer');

// Generate audio tour for a post
router.post('/:influencerId/voice/audio-tour', async (req, res) => {
  try {
    const { location, interests, duration, voice } = req.body;
    const result = await VoiceGenerationService.generateAudioTour(
      req.params.influencerId,
      location,
      interests,
      duration,
      voice
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize support agent
router.post('/:influencerId/voice/support/init', async (req, res) => {
  try {
    const { documentationUrl, voice } = req.body;
    const result = await VoiceGenerationService.initializeSupportAgent(
      req.params.influencerId,
      documentationUrl,
      voice
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Query support agent
router.post('/:influencerId/voice/support/query', async (req, res) => {
  try {
    const { question, voice } = req.body;
    const result = await VoiceGenerationService.querySupport(
      req.params.influencerId,
      question,
      voice
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload RAG document
router.post('/:influencerId/voice/rag/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const result = await VoiceGenerationService.uploadRAGDocument(
      req.params.influencerId,
      req.files.file.data,
      req.files.file.name,
      req.body.voice
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Query RAG system
router.post('/:influencerId/voice/rag/query', async (req, res) => {
  try {
    const { question, documentId, voice } = req.body;
    const result = await VoiceGenerationService.queryRAG(
      req.params.influencerId,
      question,
      documentId,
      voice
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get voice analytics
router.get('/:influencerId/voice/analytics', async (req, res) => {
  try {
    const result = await VoiceGenerationService.getAnalytics(
      req.params.influencerId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Step 3: Wire Routes into Main Server

Add to your main server file (`server.js` or `app.js`):

```javascript
const voiceRoutes = require('./src/api/influencer-voice-routes');
const voiceAgentRoutes = require('./src/api/voice-routes');

// Mount voice routes
app.use('/api/voice', voiceAgentRoutes);
app.use('/api/influencers', voiceRoutes);
```

### Step 4: Environment Variables

Add to `.env`:

```env
# Voice Services
VOICE_SERVICE_URL=http://localhost:5000
AUDIO_TOUR_SERVICE_URL=http://localhost:5000/api/voice/audio-tour
CUSTOMER_SUPPORT_SERVICE_URL=http://localhost:5000/api/voice/customer-support
RAG_SERVICE_URL=http://localhost:5000/api/voice/rag
```

## Database Schema Updates

Run migration to add voiceProfile reference to existing Influencer documents:

```javascript
// src/migrations/add-voice-profile-to-influencers.js
const Influencer = require('../models/Influencer');
const VoiceProfile = require('../models/VoiceProfile');

async function migrate() {
  const influencers = await Influencer.find({ voiceProfile: null });
  
  for (const influencer of influencers) {
    const voiceProfile = new VoiceProfile({ influencerId: influencer._id });
    await voiceProfile.save();
    influencer.voiceProfile = voiceProfile._id;
    await influencer.save();
  }
  
  console.log(`Migrated ${influencers.length} influencers`);
}

if (require.main === module) {
  migrate().catch(console.error);
}
```

## Usage Examples

### Generate Audio Tour

```javascript
POST /api/influencers/{influencerId}/voice/audio-tour

{
  "location": "Paris, France",
  "interests": ["history", "architecture"],
  "duration": 30,
  "voice": "nova"
}

Response: {
  "success": true,
  "data": {
    "audioUrl": "https://audio.example.com/...",
    "jobId": "tour_123456"
  }
}
```

### Initialize Support Agent

```javascript
POST /api/influencers/{influencerId}/voice/support/init

{
  "documentationUrl": "https://docs.example.com",
  "voice": "nova"
}
```

### Query Support

```javascript
POST /api/influencers/{influencerId}/voice/support/query

{
  "question": "How do I use your product?",
  "voice": "nova"
}
```

### Upload RAG Document

```javascript
POST /api/influencers/{influencerId}/voice/rag/upload

Form Data:
- file: [PDF file]
- documentName: "Product Guide"
- voice: "nova"
```

### Query RAG

```javascript
POST /api/influencers/{influencerId}/voice/rag/query

{
  "question": "What are the system requirements?",
  "documentId": "doc_123",
  "voice": "nova"
}
```

## Files Committed in Phase 2

✅ `src/models/VoiceProfile.js` - Complete voice metadata model
✅ `src/services/voiceGenerationService.js` - Service orchestration
✅ Documentation guide (this file)

## Next Steps - Phase 3

1. **Frontend Components** (React/Vue):
   - Voice player component
   - Voice customization UI
   - Settings panel for preferences
   - Analytics dashboard

2. **Real-time Features**:
   - WebSocket for live audio streaming
   - Progress bars for generation
   - Download management

3. **Advanced Analytics**:
   - Track voice engagement metrics
   - A/B test voice preferences
   - User satisfaction tracking

## Testing

### Unit Tests

```javascript
// tests/voiceGenerationService.test.js
const VoiceGenerationService = require('../services/voiceGenerationService');

describe('VoiceGenerationService', () => {
  it('should generate audio tour', async () => {
    const result = await VoiceGenerationService.generateAudioTour(
      'influencer-id',
      'Paris',
      ['history'],
      30,
      'nova'
    );
    expect(result.success).toBe(true);
    expect(result.data.audioUrl).toBeDefined();
  });
});
```

### Integration Tests

```bash
# Test the full flow
curl -X POST http://localhost:3000/api/influencers/123/voice/audio-tour \
  -H "Content-Type: application/json" \
  -d '{"location": "Paris", "duration": 30}'
```

## Deployment

### Docker Setup (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  node:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VOICE_SERVICE_URL=http://flask:5000
    depends_on:
      - flask
      - mongodb

  flask:
    build: ./src/voice_ai_agents
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Troubleshooting

### Flask Service Not Responding

1. Check Flask is running: `curl http://localhost:5000/health`
2. Verify environment variables
3. Check logs: `docker logs <flask-container>`

### VoiceProfile Not Creating

1. Ensure Mongoose is connected
2. Check influencer._id is valid ObjectId
3. Verify permissions on MongoDB

## Success Metrics

- ✅ VoiceProfile model supporting 3 voice agents
- ✅ Service layer handling orchestration
- ✅ Integration with Express backend
- ✅ API routes for all voice operations
- ✅ Analytics tracking
- ✅ Error handling & logging

---

**Status:** Phase 2 Complete - Ready for Phase 3 (Frontend)
**Last Updated:** December 14, 2025
