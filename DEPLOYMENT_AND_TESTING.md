# Deployment and Testing Guide

## Quick Start - Local Development

### Prerequisites
- Node.js 14+ and npm
- Docker and Docker Compose
- Git
- Bella API credentials

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/purvanshjoshi/ai-influencer.git
cd ai-influencer

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` file with your credentials:

```bash
# Bella LLM Configuration
BELLA_API_KEY=your_bella_api_key_here
BELLA_API_URL=https://api.bella-ai.com/v1

# Application Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-influencer
DB_NAME=ai_influencer

# AWS Configuration (if deploying to AWS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### Step 3: Run Locally

```bash
# Start the development server
npm start

# Server runs on http://localhost:3000
```

## API Testing

### Test Health Check

```bash
curl -X GET http://localhost:3000/api/bella/health
```

Expected Response:
```json
{
  "status": "healthy",
  "service": "bella-integration",
  "version": "1.0.0"
}
```

### Test Content Generation

```bash
curl -X POST http://localhost:3000/api/bella/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a trendy fashion post about summer outfits",
    "personality": "trendsetter",
    "style": "social_media",
    "maxTokens": 500,
    "temperature": 0.7
  }'
```

### Test Influencer Profile Creation

```bash
curl -X POST http://localhost:3000/api/bella/influencers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luna",
    "niche": "fashion",
    "personality": "trendsetter",
    "tone": "confident",
    "audience": "Gen Z, fashion enthusiasts"
  }'
```

### Test Content Optimization

```bash
curl -X POST http://localhost:3000/api/bella/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out my new summer collection!",
    "platform": "instagram",
    "audience": "Gen Z",
    "goals": ["engagement", "reach"]
  }'
```

## Docker Deployment

### Build Docker Image

```bash
# Build the Docker image
docker build -t ai-influencer:latest .

# Or use Docker Compose
docker-compose build
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Testing Scenarios

### Unit Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### Integration Testing

```bash
# Test Bella client integration
npm run test:integration
```

### End-to-End Testing

```bash
# Run E2E tests
npm run test:e2e

# With specific test file
npm run test:e2e -- tests/e2e/bella-workflow.test.js
```

## Testing Bella Integration

### Frontend Testing

1. Navigate to http://localhost:3000
2. Select personality type (trendsetter, thoughtful, entertaining, authentic, luxury)
3. Enter a prompt for content generation
4. Click "Generate" button
5. Verify response appears in UI

### API Testing with Postman

1. Import collection: `postman/AI-Influencer.postman_collection.json`
2. Set environment variables in Postman
3. Run requests in order:
   - Health Check
   - Create Influencer
   - Generate Content
   - Get Metrics
   - Optimize Content

## Deployment to Cloud

### AWS Deployment

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t ai-influencer:latest .
docker tag ai-influencer:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-influencer:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-influencer:latest
```

### Deploy to ECS/Fargate

```bash
# Update ECS task definition with new image
aws ecs update-service \
  --cluster ai-influencer-cluster \
  --service ai-influencer-service \
  --force-new-deployment
```

## Monitoring and Logging

### View Application Logs

```bash
# Docker logs
docker-compose logs -f app

# AWS CloudWatch
aws logs tail /ecs/ai-influencer --follow
```

### Health Monitoring

- API Health: GET `/api/bella/health`
- Database Connection: Checked in startup
- Bella API Status: Monitored in middleware

## Common Issues and Solutions

### Issue: "401 Unauthorized" from Bella API
**Solution**: Verify BELLA_API_KEY in .env file and ensure it's valid

### Issue: Connection refused on localhost:3000
**Solution**: Ensure PORT is not in use: `lsof -i :3000` and kill if needed

### Issue: MongoDB connection error
**Solution**: Verify MongoDB is running: `docker-compose up -d mongodb`

### Issue: Docker image build fails
**Solution**: Check Node.js version compatibility and clear Docker cache: `docker system prune`

## Performance Testing

### Load Testing with Apache JMeter

```bash
# Install JMeter
brew install jmeter

# Run load test
jmeter -n -t tests/load/api-load-test.jmx -l results.jtl -j jmeter.log
```

## Continuous Integration

GitHub Actions workflow in `.github/workflows/ci.yml`:

1. Run unit tests
2. Build Docker image
3. Push to registry
4. Deploy to staging
5. Run E2E tests
6. Deploy to production

## Rollback Procedures

### Docker Rollback

```bash
# Revert to previous image tag
docker-compose up -d --build
```

### ECS Rollback

```bash
aws ecs update-service \
  --cluster ai-influencer-cluster \
  --service ai-influencer-service \
  --task-definition ai-influencer:previous-version
```

## Production Checklist

- [ ] All environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring and alerts configured
- [ ] Rate limiting enabled
- [ ] CORS policies configured
- [ ] API keys secured
- [ ] Logging enabled
- [ ] Health checks configured
- [ ] Load balancer configured

## Support

For deployment issues: support@ai-influencer.dev
