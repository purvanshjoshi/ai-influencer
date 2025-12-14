# Voice AI Agents - Complete Setup & Integration Guide

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/purvanshjoshi/ai-influencer.git
cd ai-influencer
npm install
pip install -r src/voice_ai_agents/requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Run Services
```bash
# Start backend
cd src/voice_ai_agents
flask run

# Start frontend (in another terminal)
cd public
npm start
```

## Architecture Overview

```
┌─────────────────────────────────────┐
│   React Frontend (public/)          │
│  - VoicePlayer                      │
│  - VoiceCustomizer                  │
│  - useVoiceAgent Hook               │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               ▼
┌─────────────────────────────────────┐
│   Flask Backend (src/voice_ai_agents)│
│  - Audio Tour Agent                 │
│  - Customer Support Voice Agent     │
│  - Voice RAG OpenAI SDK Agent       │
└──────────────┬──────────────────────┘
               │ Database
               ▼
┌─────────────────────────────────────┐
│   PostgreSQL + Redis Cache          │
│  - Voice profiles                   │
│  - Generation history               │
│  - Preset configurations            │
└─────────────────────────────────────┘
```

## Component Usage Examples

### VoicePlayer
```jsx
import VoicePlayer from './components/VoicePlayer';

<VoicePlayer
  agentId="tour_001"
  influencerId="user_123"
  voiceUrl="/api/voice/generate"
/>
```

### VoiceCustomizer
```jsx
import VoiceCustomizer from './components/VoiceCustomizer';

const [config, setConfig] = useState({});

<VoiceCustomizer
  initialConfig={config}
  onConfigChange={setConfig}
/>
```

### useVoiceAgent Hook
```jsx
import { useVoiceAgent } from './components/useVoiceAgent';

const { generateVoice, isLoading, error } = useVoiceAgent('audio_tour');

await generateVoice('Hello!', 'agent_001', { voice: 'nova', speed: 1.0 });
```

## Docker Deployment

```bash
# Build & run with Docker Compose
docker-compose up -d

# Check service health
curl http://localhost:5000/health

# View logs
docker-compose logs -f voice-ai-agents
```

## Environment Variables

```
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/creds.json
DATABASE_URL=postgresql://user:pass@localhost/voice_ai
REDIS_URL=redis://localhost:6379
FLASK_ENV=production
REACT_APP_API_URL=http://localhost:5000
```

## API Endpoints

```
POST /api/voice/{agent_type}        - Generate voice
GET  /api/voice/presets             - List presets
POST /api/voice/presets             - Save preset
GET  /api/voice/history             - Generation history
GET  /health                        - Health check
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Audio not playing | Check CORS headers, verify audio URL |
| API 401 errors | Validate API keys in .env |
| Database errors | Ensure Postgres is running |
| Port already in use | Change port in config or kill process |

## Support & Resources

- Backend Docs: `src/voice_ai_agents/PHASE_3_IMPLEMENTATION_GUIDE.md`
- GitHub: https://github.com/purvanshjoshi/ai-influencer
- Issues: Create a GitHub issue for support
