# AI Influencer Platform - Deployment Automation Guide

## Overview
Comprehensive guide for automating deployment workflows, monitoring, and scaling of the AI Influencer Platform across multiple cloud platforms.

## Table of Contents
1. [CI/CD Pipeline Optimization](#cicd-pipeline-optimization)
2. [Docker Hub Integration](#docker-hub-integration)
3. [AWS Deployment Automation](#aws-deployment-automation)
4. [Monitoring & Observability](#monitoring--observability)
5. [Auto-Scaling Setup](#auto-scaling-setup)
6. [Health Checks & Alerts](#health-checks--alerts)
7. [Rollback & Recovery](#rollback--recovery)
8. [Production Best Practices](#production-best-practices)

## CI/CD Pipeline Optimization

### GitHub Actions Enhanced Workflow

**Location**: `.github/workflows/deploy.yml`

**Current Capabilities**:
- Automated testing on push/PR
- Node.js matrix testing (18.x, 20.x, 22.x)
- Linting verification
- NPM audit for security
- Docker image building
- Docker Hub push automation
- AWS EC2 deployment support
- SonarCloud code quality scanning
- Snyk security scanning

**Optimization Steps**:

### 1. Add Artifact Caching
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 2. Parallel Job Execution
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
  security:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
  build:
    needs: [test, lint, security]
    runs-on: ubuntu-latest
    timeout-minutes: 20
```

### 3. Conditional Deployment
```yaml
deploy:
  needs: build
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  runs-on: ubuntu-latest
```

## Docker Hub Integration

### Repository Setup

1. **Create Docker Hub Account** (if not exists)
   - Go to https://hub.docker.com/
   - Sign up for free tier
   - Create public repository: `purvanshjoshi/ai-influencer`

2. **GitHub Secrets Configuration**
   - Go to: Repository Settings > Secrets and Variables > Actions
   - Add these secrets:
     ```
     DOCKER_HUB_USERNAME: your_docker_username
     DOCKER_HUB_TOKEN: your_docker_hub_token
     DOCKER_HUB_REPOSITORY: purvanshjoshi/ai-influencer
     ```

3. **Generate Docker Hub Token**
   - Log in to Docker Hub
   - Account Settings > Security
   - Create New Access Token
   - Copy token and add to GitHub Secrets

### Automated Docker Build & Push

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKER_HUB_USERNAME }}
    password: ${{ secrets.DOCKER_HUB_TOKEN }}

- name: Build and push Docker image
  uses: docker/build-push-action@v4
  with:
    context: .
    push: true
    tags: |
      ${{ secrets.DOCKER_HUB_REPOSITORY }}:latest
      ${{ secrets.DOCKER_HUB_REPOSITORY }}:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## AWS Deployment Automation

### Prerequisites
- AWS Account with EC2, RDS, and IAM permissions
- AWS CLI configured with credentials
- SSH key pair created in AWS

### Automated EC2 Deployment Script

**File**: `scripts/deploy-aws.sh`

```bash
#!/bin/bash

set -e

echo "🚀 Starting AI Influencer Platform AWS Deployment..."

# Variables
INSTANCE_ID=${1:-"i-0123456789abcdef0"}
REGION="us-east-1"
APP_NAME="ai-influencer"
DOCKER_IMAGE="purvanshjoshi/ai-influencer:latest"
APP_PORT=5000

# SSH Connection
echo "📍 Connecting to EC2 instance: $INSTANCE_ID"
instances=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --region $REGION --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo "🔄 Pulling latest Docker image..."
ssh -i ~/.ssh/ai-influencer-key.pem ubuntu@$instances "docker pull $DOCKER_IMAGE"

echo "⏹️  Stopping existing container..."
ssh -i ~/.ssh/ai-influencer-key.pem ubuntu@$instances "docker stop $APP_NAME || true"
ssh -i ~/.ssh/ai-influencer-key.pem ubuntu@$instances "docker rm $APP_NAME || true"

echo "🚀 Starting new container..."
ssh -i ~/.ssh/ai-influencer-key.pem ubuntu@$instances "\
  docker run -d \
    --name $APP_NAME \
    -p $APP_PORT:$APP_PORT \
    --restart unless-stopped \
    --env-file /app/.env \
    -v /app/logs:/app/logs \
    $DOCKER_IMAGE
"

echo "✅ Deployment successful!"
echo "🌐 Application available at: http://$instances:$APP_PORT"
```

### Execute Deployment

```bash
# Make script executable
chmod +x scripts/deploy-aws.sh

# Run deployment
./scripts/deploy-aws.sh i-0123456789abcdef0
```

## Monitoring & Observability

### AWS CloudWatch Integration

**File**: `.env.example` additions
```
CLOUDWATCH_ENABLED=true
CLOUDWATCH_REGION=us-east-1
CLOUDWATCH_NAMESPACE=AIInfluencer
CLOUDWATCH_LOG_GROUP=/aws/ec2/ai-influencer
```

### Application-Level Logging

**File**: `src/config/logger.js` (add/update)

```javascript
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'ai-influencer' },
  transports: [
    // File logs
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_DIR || './logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_DIR || './logs', 'combined.log') 
    }),
    // Console logs
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

### DataDog Integration (Optional)

```bash
# Add DataDog Agent
docker run -d \
  --name=datadog-agent \
  -e DD_API_KEY=your_datadog_api_key \
  -e DD_TAGS=env:prod,app:ai-influencer \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  datadog/agent:latest
```

## Auto-Scaling Setup

### AWS Auto Scaling Group Configuration

**File**: `infrastructure/asg-config.json`

```json
{
  "AutoScalingGroupName": "ai-influencer-asg",
  "MinSize": 2,
  "MaxSize": 10,
  "DesiredCapacity": 3,
  "HealthCheckType": "ELB",
  "HealthCheckGracePeriod": 300,
  "LaunchTemplateSpecification": {
    "LaunchTemplateId": "lt-0123456789abcdef0",
    "Version": "$Latest"
  },
  "TargetGroupARNs": [
    "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/ai-influencer/1234567890abcdef"
  ],
  "Tags": [
    {
      "Key": "Name",
      "Value": "ai-influencer-instance",
      "PropagateAtLaunch": true
    }
  ]
}
```

### Scaling Policies

**CPU-Based Scaling**:
```bash
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name ai-influencer-asg \
  --policy-name scale-up-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "ScaleOutCooldown": 300,
    "ScaleInCooldown": 600
  }'
```

## Health Checks & Alerts

### Endpoint Health Check

**Existing**: `/api/health` endpoint

**Enhanced Response**:
```json
{
  "status": "AI Influencer Platform is running",
  "timestamp": "2025-12-12T00:00:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "database": "connected",
  "memory_usage": "45%",
  "cpu_usage": "20%",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "api": "healthy"
  }
}
```

### AWS SNS Alerts

```bash
# Create SNS Topic
aws sns create-topic --name ai-influencer-alerts

# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789012:ai-influencer-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

### CloudWatch Alarms

```bash
# CPU Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ai-influencer-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:ai-influencer-alerts
```

## Rollback & Recovery

### Docker Container Rollback

```bash
#!/bin/bash
# Rollback to previous image version

CURRENT_IMAGE="purvanshjoshi/ai-influencer:latest"
PREVIOUS_IMAGE="purvanshjoshi/ai-influencer:v1.0.0"

echo "Stopping current deployment..."
docker stop ai-influencer || true
docker rm ai-influencer || true

echo "Deploying previous version..."
docker run -d \
  --name ai-influencer \
  -p 5000:5000 \
  --restart unless-stopped \
  --env-file .env \
  $PREVIOUS_IMAGE

echo "Rollback complete"
```

### Database Backup & Recovery

```bash
# Backup MongoDB
mongodump --uri="mongodb://user:pass@host:27017/ai-influencer" \
  --out=/backups/$(date +%Y%m%d_%H%M%S)

# Restore from backup
mongorestore --uri="mongodb://user:pass@host:27017" \
  /backups/20250101_120000
```

## Production Best Practices

### Security Checklist
- [ ] All environment variables configured securely
- [ ] API keys rotated regularly
- [ ] SSL/TLS certificates valid (30+ days)
- [ ] Security group rules restricted
- [ ] Database backups encrypted
- [ ] Logs rotated (>30 days deleted)
- [ ] DDoS protection enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers set (CSP, X-Frame-Options, etc.)

### Performance Optimization
- [ ] Database connection pooling enabled
- [ ] Redis cache configured
- [ ] CDN setup for static assets
- [ ] Compression enabled (gzip)
- [ ] Database indexes optimized
- [ ] Query optimization completed
- [ ] Load testing passed (100+ concurrent users)
- [ ] Response time <500ms (p95)

### Operational Best Practices
- [ ] Automated backups running daily
- [ ] Monitoring dashboard setup
- [ ] Alerting configured
- [ ] Disaster recovery plan documented
- [ ] Runbooks created for common issues
- [ ] On-call rotation established
- [ ] Deployment process documented
- [ ] Version tagging consistent

**Last Updated**: December 13, 2025
**Version**: 1.0.0
