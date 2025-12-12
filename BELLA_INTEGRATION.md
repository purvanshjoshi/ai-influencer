# Bella LLM Integration Guide

## Overview

This document outlines the complete integration of Bella's LLM technology into the AI Influencer Platform. Bella enables advanced natural language processing and content generation for authentic, personality-driven AI influencers.

## Integration Architecture

### Components

1. **Bella Client** (`src/integrations/bellaClient.js`)
   - Handles all API communication with Bella
   - Manages authentication and request/response handling
   - Provides methods for content generation, profile creation, and metrics

2. **Personality Engine** (`src/integrations/personalityEngine.js`)
   - Manages AI influencer personality traits
   - Supports multiple personality types: trendsetter, thoughtful, entertaining, authentic, luxury
   - Generates personality-specific content and engagement strategies

3. **Bella Routes** (`src/integrations/bellaRoutes.js`)
   - Express.js routes for Bella API endpoints
   - Provides REST API for frontend integration
   - Includes error handling and validation

## Setup Instructions

### Prerequisites

- Node.js 14+
- npm or yarn
- Bella API credentials

### Environment Configuration

Create a `.env` file in the project root:

```bash
BELLA_API_KEY=your_api_key_here
BELLA_API_URL=https://api.bella-ai.com/v1
NODE_ENV=production
```

### Installation

```bash
# Install dependencies
npm install

# Install Bella client (if separate)
npm install @bella-ai/client
```

## API Endpoints

### Content Generation

**POST** `/api/bella/generate`

Generate content using Bella LLM.

```json
{
  "prompt": "Create a trending fashion post",
  "personality": "trendsetter",
  "style": "social_media",
  "maxTokens": 500,
  "temperature": 0.7
}
```

### Influencer Management

**POST** `/api/bella/influencers`

Create a new AI influencer profile.

```json
{
  "name": "Luna",
  "niche": "fashion",
  "personality": "trendsetter",
  "tone": "confident",
  "audience": "Gen Z, fashion enthusiasts"
}
```

**GET** `/api/bella/influencers/:id/metrics`

Retrieve engagement metrics for an influencer.

### Content Optimization

**POST** `/api/bella/optimize`

Optimize content for specific platforms.

```json
{
  "content": "Original content",
  "platform": "instagram",
  "audience": "target_audience",
  "goals": ["engagement", "reach"]
}
```

### Health Check

**GET** `/api/bella/health`

Check Bella integration status.

## Frontend Integration

The Bella UI interface (`public/app.js`) includes:

- Content generation forms
- Personality type selection
- Real-time metrics dashboard
- Influencer profile management

## Error Handling

All API responses include error details:

```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

## Security

- Always store API keys in environment variables
- Use HTTPS for all API communications
- Validate user input on backend
- Rate limit API calls
- Monitor for suspicious activity

## Monitoring and Logging

- Log all API requests and responses
- Monitor Bella API usage and quotas
- Track engagement metrics
- Alert on API failures

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check BELLA_API_KEY environment variable
2. **Connection Timeout**: Verify BELLA_API_URL is correct
3. **Rate Limit Exceeded**: Implement exponential backoff

## Future Enhancements

- Multi-language support
- Advanced personality customization
- Real-time collaboration features
- Advanced analytics dashboard
- A/B testing capabilities

## Support

For issues and support, contact: support@bella-ai.com
