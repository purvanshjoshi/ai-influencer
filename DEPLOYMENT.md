# AI Influencer Platform - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [AWS EC2 Deployment](#aws-ec2-deployment)
5. [Heroku Deployment](#heroku-deployment)
6. [Production Checklist](#production-checklist)

---

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB 7.0+
- Git
- AWS Account (for cloud deployment)

---

## Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/purvanshjoshi/ai-influencer.git
cd ai-influencer

# Copy environment template
cp .env.example .env

# Edit .env with your local settings
nano .env

# Install dependencies
npm install
```

### Running Locally

```bash
# Start MongoDB locally
mongod --dbpath ./data/db

# In another terminal, start the app
npm run dev

# Server runs on http://localhost:5000
```

---

## Docker Deployment

### Single Container

```bash
# Build Docker image
docker build -t ai-influencer:1.0.0 .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/ai-influencer \
  -e BELLA_API_KEY=your_key \
  ai-influencer:1.0.0
```

### Docker Compose (Recommended)

```bash
# Copy environment file
cp .env.example .env

# Edit .env with production credentials
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

**Services Started:**
- Express App (port 5000)
- MongoDB (port 27017)
- Mongo Express UI (port 8081) - dev only

---

## AWS EC2 Deployment

### 1. Launch EC2 Instance

```bash
# Use Ubuntu 22.04 LTS AMI
# Instance Type: t3.medium or higher
# Storage: 30GB EBS
# Security Group: Allow ports 22, 80, 443, 5000
```

### 2. Install Docker

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker ubuntu

# Verify installation
docker --version
```

### 3. Deploy Application

```bash
# Clone repository
git clone https://github.com/purvanshjoshi/ai-influencer.git
cd ai-influencer

# Copy and edit environment
cp .env.example .env
sudo nano .env  # Add AWS RDS credentials

# Start with Docker Compose
sudo docker-compose up -d

# Setup Nginx reverse proxy
sudo apt-get install -y nginx
```

### 4. Configure Nginx

```nginx
# /etc/nginx/sites-enabled/ai-influencer
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Enable HTTPS

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 6. Setup AWS RDS MongoDB (Optional)

- Create RDS Instance with MongoDB 7.0
- Update MONGODB_URI in .env
- Add RDS security group to EC2

---

## Heroku Deployment

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create Heroku app
heroku create ai-influencer-app

# Add MongoDB Atlas add-on
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set BELLA_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## Production Checklist

- [ ] Environment variables configured securely
- [ ] Database backups automated
- [ ] SSL/TLS certificates installed
- [ ] Monitoring & logging setup (CloudWatch/DataDog)
- [ ] Auto-scaling configured
- [ ] Database connection pooling enabled
- [ ] Cache layer (Redis) configured
- [ ] API rate limiting enabled
- [ ] Security headers configured
- [ ] CI/CD pipeline running
- [ ] Performance testing completed
- [ ] Load testing performed
- [ ] Disaster recovery plan documented
- [ ] Team access/permissions configured

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check application health
curl http://localhost:5000/api/health

# Response:
{
  "status": "AI Influencer Platform is running",
  "timestamp": "2025-12-12T00:00:00Z"
}
```

### Database Maintenance

```bash
# Access MongoDB shell
mongosh mongodb://localhost:27017/ai-influencer

# View indexes
db.influencers.getIndexes()

# Backup database
mongodump --uri="mongodb://localhost:27017/ai-influencer"
```

### Log Analysis

```bash
# Docker logs
docker logs ai-influencer-app

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Issue: MongoDB Connection Failed

```bash
# Verify MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### Issue: Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Issue: Docker Image Build Failed

```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker build --no-cache -t ai-influencer:1.0.0 .
```

---

## Support & Contact

For issues and questions, please:
1. Check GitHub Issues: https://github.com/purvanshjoshi/ai-influencer/issues
2. Open a new Issue with detailed logs
3. Contact: purvanshjoshi7534@gmail.com

---

**Last Updated:** December 12, 2025
**Version:** 1.0.0
