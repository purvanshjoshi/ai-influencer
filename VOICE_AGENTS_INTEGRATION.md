# Voice AI Agents Integration Guide

## Overview

This document provides a comprehensive analysis and integration plan for the three voice AI agents in your `src/voice_ai_agents` directory:

1. **AI Audio Tour Agent** (`ai_audio_tour_agent/`) - Python-based
2. **Customer Support Voice Agent** (`customer_support_voice_agent/`) - Python-based
3. **Voice RAG Agent** (`voice_rag_openaisdk/`) - Python-based

## Architecture Analysis

### 1. AI Audio Tour Agent
**Type:** Location-aware, multi-agent voice tour system
**Tech Stack:** Python, OpenAI Agents SDK, FastEmbed, Web Search
**Key Files:**
- `ai_audio_tour_agent.py` - Main Streamlit application
- `agent.py` - Agent logic
- `manager.py` - Tour management
- `printer.py` - Output formatting

**Features:**
- Multi-agent architecture (Orchestrator, History, Architecture, Culture, Culinary agents)
- Location-based content generation
- Customizable tour duration (15, 30, 60 minutes)
- Real-time web search integration
- Expressive TTS using GPT-4o Mini Audio
- User interest-based filtering

**Integration Point:**
```
Influencer Post -> Audio Tour of Featured Location
```

### 2. Customer Support Voice Agent
**Type:** Knowledge base-powered, voice-enabled support system
**Tech Stack:** Python, OpenAI SDK, Firecrawl, Qdrant, FastEmbed
**Key Files:**
- `customer_support_voice_agent.py` - Main Streamlit app
- `requirements.txt` - Dependencies (Firecrawl, Qdrant, FastEmbed, OpenAI)

**Features:**
- Knowledge base creation from documentation crawling
- Vector embeddings and semantic search via Qdrant
- AI Agent Team (Documentation Processor, TTS Agent)
- Multiple OpenAI TTS voices (alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer, verse)
- Clean Streamlit UI with real-time processing
- Audio download capability

**Integration Point:**
```
Influencer FAQ/Help Topics -> Voice-powered Support Responses
```

### 3. Voice RAG Agent
**Type:** PDF-powered, voice-enabled retrieval system
**Tech Stack:** Python, OpenAI SDK, Qdrant, LangChain, FastEmbed
**Key Files:**
- `rag_voice.py` - Main Streamlit application
- `requirements.txt` - Dependencies

**Features:**
- PDF document processing and chunking
- Vector storage in Qdrant
- Semantic search for document retrieval
- Real-time text-to-speech with multiple voices
- User-friendly interface with progress tracking
- Audio download capability
- Multiple document upload support

**Integration Point:**
```
Influencer Content/Documentation -> Voice Q&A System
```

## Current JS Integration Layer

### Files Already in Place

**voiceService.js** - TTS Abstraction Layer
```javascript
class VoiceService {
  - textToSpeech(text, voiceId) // Converts text to audio
  - _generateWithOpenAI(text, voiceId) // OpenAI TTS implementation
  - _generateStub(text) // Fallback for development
}
```

**index.js** - Module Entry Point
```javascript
Exports:
  - VoiceService
  - AudioTourAgent
  - VoiceRAGAgent
  - CustomerSupportAgent
  - initializeAgents(config) // Factory function
```

**audioTourAgent.js** - Placeholder for JS bridge
**audioTourAgent.js** - Reference implementation

## Integration Strategy

### Phase 1: Bridge Python Agents to Node.js

1. **Create Flask/FastAPI wrappers** for each Python agent
   - `/api/voice/audio-tour` - Audio tour generation
   - `/api/voice/customer-support` - Support agent queries
   - `/api/voice/rag-query` - RAG-based Q&A

2. **Expose as REST endpoints** in Express
   - Proxy Python services through Node.js backend
   - Handle auth, rate limiting, error handling

3. **Client-side integration**
   - Add voice agent UI components
   - Integrate with existing Bella influencer system
   - Add "Listen" buttons to posts

### Phase 2: Direct Integration with Influencer System

1. **Extend Influencer Model** to include voice metadata
   ```javascript
   {
     postId: String,
     content: String,
     voiceProfile: {
       audioTourLocation: String,
       supportTopics: [String],
       ragDocuments: [String]
     }
   }
   ```

2. **Create Voice Post Generator**
   - Auto-generate audio tours for location-tagged posts
   - Create voice support docs from influencer FAQs
   - Build RAG systems from uploaded content

3. **Database Schema Updates**
   - Store voice asset URLs
   - Track voice generation jobs
   - Cache audio files

### Phase 3: Frontend Voice Experience

1. **Voice Player Component**
   - Unified player for all voice agent outputs
   - Multiple voice options
   - Download capability
   - Analytics tracking

2. **Voice Customization UI**
   - Select tour type (audio tour, FAQ, RAG)
   - Choose voice personality
   - Set response length
   - Configure interests/topics

## Required Dependencies

### Python (for Python agents)
```
openai
streamlit
qdrant-client
fastembed
firecrawl (for customer support)
langchain
python-dotenv
axios
```

### Node.js (for integration layer)
```
axios
dotenv
express
mongodb
```

## Environment Variables Needed

```env
# OpenAI
OPENAI_API_KEY=sk_...

# Qdrant (for RAG and Customer Support)
QDRANT_URL=https://...
QDRANT_API_KEY=...

# Firecrawl (for Customer Support)
FIRECRAWL_API_KEY=...

# Python Service URLs (for integration)
PYTHON_SERVICE_URL=http://localhost:8000
AUDIO_TOUR_SERVICE_URL=http://localhost:8001
CUSTOMER_SUPPORT_SERVICE_URL=http://localhost:8002
RAG_SERVICE_URL=http://localhost:8003
```

## Recommended Next Steps

1. **Immediate (Week 1):**
   - [ ] Create Flask wrappers for each Python agent
   - [ ] Set up Docker containers for Python services
   - [ ] Create `/api/voice/*` routes in Express
   - [ ] Test agent endpoints individually

2. **Short-term (Week 2-3):**
   - [ ] Extend Influencer model with voice metadata
   - [ ] Create voice post generation logic
   - [ ] Build voice player UI component
   - [ ] Implement basic voice customization

3. **Medium-term (Week 4-6):**
   - [ ] Auto-generation of audio tours from posts
   - [ ] Batch voice processing for multiple posts
   - [ ] Analytics dashboard for voice engagement
   - [ ] Voice quality metrics and A/B testing

4. **Long-term (Ongoing):**
   - [ ] Multi-language voice support
   - [ ] Advanced speaker diarization
   - [ ] Emotion-based voice modulation
   - [ ] Real-time voice streaming

## Testing Strategy

1. **Unit Tests**
   - Test each agent independently
   - Mock OpenAI and Qdrant responses
   - Verify error handling

2. **Integration Tests**
   - Test Flask/Express bridge
   - Verify end-to-end voice generation
   - Test database schema updates

3. **Performance Tests**
   - Measure TTS latency
   - Test concurrent requests
   - Monitor memory usage

## Deployment Considerations

1. **Containerization**
   - Separate containers for each Python service
   - Shared Node.js Express container
   - Docker Compose orchestration

2. **Scalability**
   - Queue-based voice processing (Bull/BullMQ)
   - Redis caching for generated audio
   - Load balancing for Python services

3. **Monitoring**
   - Log voice generation events
   - Track API latency
   - Monitor TTS costs
   - Alert on failures

## Cost Optimization

- OpenAI TTS: $15 per 1M characters
- Qdrant Cloud: Based on storage/usage
- Firecrawl: API rate limits

**Recommendations:**
1. Cache generated audio files
2. Batch process voice requests
3. Use lower-quality TTS for non-critical content
4. Implement audio compression

## Security Notes

1. Never expose OpenAI API keys in client
2. Implement rate limiting on voice endpoints
3. Validate user inputs before processing
4. Encrypt stored audio files
5. Audit voice generation logs

## Success Metrics

1. Voice feature adoption rate
2. Audio player engagement time
3. Voice agent query success rate
4. User preference data (voice type, duration)
5. Cost per voice generation
6. Customer support ticket reduction (via voice agent)

---

**Status:** Integration analysis complete. Ready for Phase 1 implementation.
**Last Updated:** December 2024
