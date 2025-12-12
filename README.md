# AI Influencer Platform

An advanced AI-powered influencer creation and engagement system. Leverages **Bella's Enhanced LLM technology** to create authentic, personality-driven AI influencers for content creation and social media marketing.

## 📊 Project Status

**Current Version:** 1.0.0  
**Completion Level:** 85% ✅

### ✅ Completed Features
- Core platform architecture and API structure
- Bella LLM integration and dialogue system
- Basic personality engine implementation
- Content generation module
- Social media API integrations (Instagram, Twitter, TikTok, LinkedIn)
- Engagement analytics foundation
- Docker containerization and deployment setup
- GitHub Actions CI/CD pipeline with automated testing
- Comprehensive documentation

### 🚀 In Progress / Planned
- Advanced personality learning algorithms
- Real-time social media publishing
- Enhanced analytics dashboard
- Multi-modal content generation (images, videos)
- Advanced ML models for trend prediction

## 🏗️ Bella Integration Architecture

This project seamlessly integrates **Bella's Enhanced LLM Dialogue System** for creating human-like AI influencers. Bella provides:

### Core Components
```
Bella LLM Engine
    ├── Dialogue System: Natural conversation generation
    ├── Personality Model: Character trait customization
    ├── Context Awareness: Conversation memory & context
    └── Response Generation: Human-like text responses
```

### Integration Points

**1. LLM Service Layer** (`src/models/llm-service.js`)
   - Communicates with Bella API endpoints
   - Manages conversation sessions
   - Handles prompt engineering for personality consistency
   - Processes LLM responses and caches results

**2. Bella API Routes** (`src/api/bella-routes.js`)
   - `POST /api/bella/chat` - Send messages and receive AI responses
   - `POST /api/bella/personality` - Generate or customize personalities
   - `GET /api/bella/personality/:id` - Retrieve personality profiles
   - WebSocket support for real-time dialogue

**3. Personality Engine** (`src/core/personality.js`)
   - Integrates Bella's personality models
   - Customizes tone, style, and communication patterns
   - Manages influencer-specific traits and behaviors

### Setup Instructions

To use Bella with this project:

```bash
# 1. Clone both repositories
git clone https://github.com/purvanshjoshi/ai-influencer.git
git clone https://github.com/GRISHM7890/Bella.git

# 2. Navigate to Bella and install dependencies
cd Bella
npm install
npm run download  # Download required models
npm start         # Start Bella on port 8081

# 3. In a new terminal, set up AI Influencer
cd ../ai-influencer
npm install

# 4. Configure environment
cp .env.example .env
# Update BELLA_API_URL in .env
echo "BELLA_API_URL=http://localhost:8081" >> .env

# 5. Start the application
npm start
```

**Docker Setup:**
```bash
# Start both services with Docker Compose
docker-compose up
```

Bella will run on `http://localhost:8081`  
AI Influencer platform will run on `http://localhost:3000`

## 📋 Features

- **Personality Engine**: AI-powered personality generation with customizable traits and characteristics
- **Content Generation**: Automatic content creation based on influencer style and audience preferences
- **Social Media Integration**: Direct integration with major social platforms (Instagram, TikTok, Twitter, LinkedIn)
- **Engagement Analytics**: Real-time analytics and performance tracking for AI influencers
- **Multi-Modal Learning**: Leverages Bella's advanced LLM capabilities for human-like interactions
- **Customizable Voice**: Create influencers with unique communication styles and tones
- **Bella LLM Integration**: Uses Bella's Enhanced Dialogue System for natural conversations

## 🏛️ Project Structure

```
ai-influencer/
├── src/
│   ├── core/
│   │   ├── personality.js        # Influencer personality engine
│   │   ├── content-generator.js  # Content generation module
│   │   └── engagement.js         # Engagement tracking
│   ├── api/
│   │   ├── bella-routes.js       # Bella LLM API endpoints
│   │   ├── influencer-routes.js  # Influencer management
│   │   └── analytics-routes.js   # Analytics endpoints
│   ├── integrations/
│   │   ├── social-media.js       # Social platform APIs
│   │   ├── instagram-adapter.js  # Instagram integration
│   │   └── twitter-adapter.js    # Twitter integration
│   ├── models/
│   │   ├── llm-service.js        # Bella LLM service client
│   │   ├── influencer.js         # Influencer data model
│   │   └── analytics.js          # Analytics data model
│   └── utils/
│       ├── config.js             # Configuration management
│       └── logger.js             # Logging utilities
├── public/
│   ├── index.html                # Main HTML
│   └── app.js                    # Frontend Bella UI integration
├── config/
│   └── personalities.json        # Personality templates
├── .github/workflows/
│   └── deploy.yml               # GitHub Actions CI/CD pipeline
├── BELLA_INTEGRATION.md          # Bella integration guide
├── DEPLOYMENT.md                # Deployment instructions
├── TESTING_CHECKLIST.md         # Testing procedures
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Docker build configuration
├── package.json                 # Project dependencies
└── README.md                    # This file
```

## 🚈 Bella Setup

# Clone the project
git clone https://github.com/GRISHM7890/Bella.git
cd Bella

# Install dependencies
npm install

# Download AI models
npm run download-models

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Docker (for containerized deployment)
- Bella LLM service running

### Installation

```bash
git clone https://github.com/purvanshjoshi/ai-influencer.git
cd ai-influencer
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Update the following variables:
- `BELLA_API_URL`: Bella service endpoint (default: http://localhost:8081)
- `DATABASE_URL`: MongoDB connection string
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Running the Application

```bash
# Development
npm run dev

# Production
npm start

# With Docker
docker-compose up
```

### Usage

```javascript
const AIInfluencer = require('./src/core/personality');

const influencer = new AIInfluencer({
  name: 'Luna',
  personality: 'tech-enthusiast',
  platform: 'instagram',
  audience: 'tech-savvy millennials'
});

// Generate content using Bella
const post = await influencer.generateContent('morning-motivation');
await influencer.publishToSocial(post);
```

## 🛠️ Technology Stack

- **Backend**: Node.js with Express
- **LLM**: Bella's Enhanced LLM Dialogue System
- **Database**: MongoDB
- **APIs**: REST + WebSocket
- **Deployment**: Docker + Cloud platforms (AWS, Azure, GCP)
- **CI/CD**: GitHub Actions
- **Frontend**: HTML5, CSS, Vanilla JavaScript

## 📈 Recent Updates (December 2025)

### Infrastructure & DevOps
- ✅ Fixed GitHub Actions CI/CD workflow YAML syntax
- ✅ Removed problematic npm cache requirement for missing lock files
- ✅ Updated npm configuration from `npm ci` to `npm install`
- ✅ Added comprehensive Docker Compose setup for Bella + AI Influencer

### Dependencies & Configuration
- ✅ Removed invalid `transformers@^2.6.0` dependency
- ✅ Fixed JSON syntax error in package.json (trailing comma)
- ✅ Validated all npm dependencies against npm registry
- ✅ Verified package.json structure and format

### Documentation
- ✅ Added comprehensive Bella integration guide (BELLA_INTEGRATION.md)
- ✅ Created deployment instructions with multiple platform support
- ✅ Added testing checklist for deployment verification
- ✅ Documented health monitoring and observability setup

### Workflow Status
- ✅ **Build Job**: Passing (npm install successful)
- ✅ **Code Quality**: Passing (SonarCloud scanning)
- ✅ **Security**: Passing (Snyk security scanning)
- ⚠️ **Linting**: Requires ESLint configuration (`.eslintrc`)

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive testing procedures.

## 📚 Documentation

- [Bella Integration Guide](./BELLA_INTEGRATION.md) - Detailed Bella setup and integration
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to AWS, Azure, GCP
- [Deployment Automation](./DEPLOYMENT_AUTOMATION.md) - CI/CD pipelines and automation
- [Health Monitoring](./HEALTH_MONITORING.md) - Observability and monitoring setup
- [Production Readiness](./PRODUCTION_READINESS.md) - Deployment checklist
- [Features Status](./FEATURES_STATUS.md) - Feature implementation status

## 🤝 Contributing

Contributions are welcome! Please follow our development guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with meaningful messages
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to the `development` branch

For major changes, please open an issue first to discuss proposed changes.

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

## 👨‍💻 Author

**Purvansh Joshi**  
- GitHub: [@purvanshjoshi](https://github.com/purvanshjoshi)
- LinkedIn: [Purvansh Joshi](https://linkedin.com/in/purvansh-joshi)
- Email: purvanshj.dev@gmail.com

## 🙏 Acknowledgments

- Bella LLM Team for the powerful dialogue system
- Community contributors and open-source libraries
- AWS, Azure, and Google Cloud for infrastructure support

## 📞 Support

For issues, questions, or feature requests:
1. Check existing [Issues](../../issues)
2. Create a new issue with detailed information
3. Join our community discussions

---

**Last Updated:** December 13, 2025  
**Version:** 1.0.0  
**Status:** In Active Development ✨
