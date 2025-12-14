# Voice Agents Integration Guide

Comprehensive guide for integrating three voice AI agents into the AI Influencer platform using Bella LLM framework.

## Overview

This integration brings three specialized voice agents into your application:

### 1. AI Audio Tour Agent
**Location**: `src/voice_ai_agents/ai_audio_tour_agent/`
**Purpose**: Self-guided audio tours with multi-specialist system
**Features**:
- Architecture specialist for building descriptions
- History specialist for historical context
- Culture specialist for cultural insights
- Culinary specialist for food experiences
- Planner agent for time allocation
- Orchestrator for tour assembly

**Usage**:
```javascript
const { audioTourQuery } = useVoiceAgentAdvanced();
const tour = await audioTourQuery(
  'Paris, France',
  { architecture: 10, history: 8, culture: 9, culinary: 7 },
  30 // duration in minutes
);
```

### 2. Customer Support Voice Agent
**Location**: `src/voice_ai_agents/customer_support_voice_agent/`
**Purpose**: Voice-enabled customer support with knowledge base
**Features**:
- Qdrant vector database integration
- FastEmbed for semantic search
- Firecrawl for web document processing
- OpenAI voice API integration
- Streamlit UI (optional)

**Usage**:
```javascript
const { customerSupportQuery } = useVoiceAgentAdvanced();
const response = await customerSupportQuery(
  'How do I reset my password?',
  'kb_documents'
);
```

### 3. Voice RAG Agent
**Location**: `src/voice_ai_agents/voice_rag_openaisdk/`
**Purpose**: Retrieval-Augmented Generation for document Q&A
**Features**:
- PDF document processing
- Semantic search with embeddings
- Voice response generation
- Conversation context management

**Usage**:
```javascript
const { voiceRAGQuery } = useVoiceAgentAdvanced();
const answer = await voiceRAGQuery(
  'What is discussed on page 5?',
  '/documents/whitepaper.pdf'
);
```

## Integration Architecture

### Frontend Components

#### 1. cloudVoiceAPI.js
**Location**: `public/bella/services/cloudVoiceAPI.js`

Unified service layer for all voice agents:
```javascript
import cloudVoiceAPI from './services/cloudVoiceAPI';

// Configure agent
cloudVoiceAPI.setAgentConfig('audioTour', {
  apiKey: process.env.REACT_APP_OPENAI_KEY
});

// Switch agent
cloudVoiceAPI.switchVoiceAgent('customerSupport');

// Execute query
const result = await cloudVoiceAPI.voiceQuery('audioTour', {
  location: 'London',
  interests: { history: 10 },
  duration: 45
});
```

#### 2. useVoiceAgentAdvanced Hook
**Location**: `public/components/useVoiceAgentAdvanced.js`

React hook for component integration:
```javascript
import useVoiceAgentAdvanced from './useVoiceAgentAdvanced';

function MyComponent() {
  const {
    audioTourQuery,
    customerSupportQuery,
    voiceRAGQuery,
    isLoading,
    error,
    voiceSettings,
    updateVoiceSettings
  } = useVoiceAgentAdvanced();

  const handleTourQuery = async () => {
    const result = await audioTourQuery('Paris', interests, 30);
    // Handle result
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleTourQuery}>Generate Tour</button>
    </div>
  );
}
```

### Backend Routes

**Location**: `src/api/voice-routes.js`

#### Audio Tour Endpoint
```
POST /api/voice-agents/audio-tour
Body: {
  location: string,
  interests: { architecture, history, culture, culinary },
  duration: number (15, 30, or 60),
  voiceSettings: { voice, speed, pitch }
}
Response: {
  introduction: string,
  architecture: string,
  history: string,
  culture: string,
  culinary: string,
  conclusion: string,
  duration: number
}
```

#### Customer Support Endpoint
```
POST /api/voice-agents/customer-support
Body: {
  question: string,
  knowledgeBase: string,
  voiceSettings: { voice, speed, pitch },
  conversationHistory: Array
}
Response: {
  answer: string,
  audioPath: string,
  sources: Array
}
```

#### Voice RAG Endpoint
```
POST /api/voice-agents/voice-rag
Body: {
  question: string,
  documentPath: string,
  voiceSettings: { voice, speed, pitch },
  conversationHistory: Array
}
Response: {
  answer: string,
  audioPath: string,
  relevantSections: Array
}
```

## Setup Instructions

### 1. Environment Variables

Create `.env` file:
```bash
# OpenAI
REACT_APP_OPENAI_API_KEY=sk_...

# Firecrawl (for Customer Support)
FIRECRAWL_API_KEY=fc_...

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=...

# Anthropic (optional)
ANTHROPIC_API_KEY=...

# Google Gemini (optional)
GEMINI_API_KEY=...
```

### 2. Install Dependencies

Python backend:
```bash
cd src/voice_ai_agents/ai_audio_tour_agent
pip install -r requirements.txt

cd ../customer_support_voice_agent
pip install -r requirements.txt

cd ../voice_rag_openaisdk
pip install -r requirements.txt
```

Node.js frontend:
```bash
cd public
npm install
```

### 3. Start Services

Qdrant Vector DB (for Voice agents):
```bash
docker run -p 6333:6333 qdrant/qdrant:latest
```

Python API server:
```bash
python src/api/voice-routes.py
```

React frontend:
```bash
cd public
npm start
```

## Voice Settings Configuration

### Available Voices
- `alloy` (default)
- `echo`
- `fable`
- `onyx`
- `nova`
- `shimmer`

### Voice Settings Object
```javascript
{
  voice: 'alloy',     // Voice variant
  speed: 1.0,         // 0.25 to 4.0
  pitch: 1.0          // -20.0 to 20.0
}
```

## Common Patterns

### Pattern 1: Tour Generation with Custom Settings
```javascript
const { audioTourQuery, updateVoiceSettings } = useVoiceAgentAdvanced();

updateVoiceSettings({ voice: 'nova', speed: 1.2 });
const tour = await audioTourQuery('Rome', interests, 60);
```

### Pattern 2: Multi-turn Conversations
```javascript
const { customerSupportQuery, conversationHistory } = useVoiceAgentAdvanced();

const response1 = await customerSupportQuery('What is your return policy?', 'faq');
const response2 = await customerSupportQuery(
  'How long do returns take?',
  'faq'
  // Conversation history automatically included
);
```

### Pattern 3: Document Q&A with Context
```javascript
const { voiceRAGQuery, conversationHistory, clearHistory } = 
  useVoiceAgentAdvanced();

// Ask multiple questions about same document
const q1 = await voiceRAGQuery('What is this document about?', 'doc.pdf');
const q2 = await voiceRAGQuery('Who is the author?', 'doc.pdf');

// Clear history for new document
clearHistory();
const q3 = await voiceRAGQuery('...', 'other_doc.pdf');
```

## Error Handling

```javascript
const { audioTourQuery, error, isLoading } = useVoiceAgentAdvanced();

try {
  const result = await audioTourQuery(...);
} catch (err) {
  console.error('Voice Agent Error:', err);
  // Handle specific error types
  if (err.message.includes('not configured')) {
    // Configure the agent
  } else if (err.message.includes('rate limit')) {
    // Implement backoff
  }
}
```

## Performance Optimization

1. **Conversation History Limit**: Default 20 entries, adjustable
2. **Caching**: Implement for frequently asked questions
3. **Streaming Responses**: Use cloudVoiceAPI.streamVoiceResponse() for large outputs
4. **Batch Processing**: Process multiple queries in parallel

## Troubleshooting

### Agent Not Responding
- Verify API keys in environment
- Check network connectivity
- Review server logs for errors

### Poor Audio Quality
- Adjust voice speed (slower is clearer)
- Try different voice variants
- Check text generation quality

### High Latency
- Use streaming endpoints
- Implement caching
- Consider serverless backends

## Future Enhancements

- Real-time streaming audio
- Multi-language support
- Custom voice training
- Offline mode with local models
- Advanced caching strategies
- Load balancing for multiple agents

## Support & References

- OpenAI API: https://platform.openai.com
- Agents Framework: https://github.com/autonomousagents/agents
- Qdrant: https://qdrant.tech
- FastEmbed: https://github.com/qdrant/fastembed
