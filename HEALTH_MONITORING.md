# AI Influencer Platform - Health Monitoring & Observability

## Overview
Comprehensive health monitoring and observability setup for production deployment of the AI Influencer Platform.

## Health Check Endpoint

### Current Implementation

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "AI Influencer Platform is running",
  "timestamp": "2025-12-12T00:00:00Z"
}
```

### Enhanced Health Check Implementation

**File**: `src/routes/healthRoutes.js` (add/update)

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../config/logger');

let serverStartTime = Date.now();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseHealth();
    const memoryUsage = process.memoryUsage();
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
    
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      database: {
        healthy: dbHealthy,
        responseTime: 'calculating...'
      },
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
        memory: memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9 ? 'healthy' : 'warning'
      }
    };
    
    if (!dbHealthy) {
      response.status = 'degraded';
    }
    
    res.status(response.status === 'healthy' ? 200 : 503).json(response);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    await db.collection('influencers').findOne({});
    const responseTime = Date.now() - startTime;
    return responseTime < 5000; // Fail if takes >5s
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
}

module.exports = router;
```

## Monitoring Stack

### AWS CloudWatch Setup

**Metrics to Monitor**:
1. Application Metrics
   - Request count
   - Request latency (p50, p95, p99)
   - Error rate
   - Cache hit rate

2. Infrastructure Metrics
   - CPU Utilization
   - Memory Usage
   - Disk I/O
   - Network Traffic
   - Network Errors

3. Database Metrics
   - Query execution time
   - Connection count
   - Slow queries
   - Replication lag (if applicable)

### CloudWatch Dashboard

```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name ai-influencer-dashboard \
  --dashboard-body file://dashboard-config.json
```

**dashboard-config.json**:
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/EC2", "CPUUtilization", {"stat": "Average"}],
          ["AWS/EC2", "NetworkIn"],
          ["AWS/EC2", "NetworkOut"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "EC2 Metrics"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/RDS", "DatabaseConnections"],
          ["AWS/RDS", "CPUUtilization"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "RDS Metrics"
      }
    }
  ]
}
```

## Logging Strategy

### Application Logging

**File**: `src/config/logger.js`

```javascript
const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { 
    service: 'ai-influencer',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      )
    }),
    
    // File logs
    new winston.transports.File({
      filename: '/var/log/ai-influencer/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: '/var/log/ai-influencer/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    }),
    
    // CloudWatch logs
    new CloudWatchTransport({
      logGroupName: '/aws/lambda/ai-influencer',
      logStreamName: 'application',
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      messageFormatter: ({ level, message, meta }) => 
        `[${level}] ${message} ${JSON.stringify(meta)}`
    })
  ]
});

module.exports = logger;
```

### Log Levels

- **ERROR**: Critical issues requiring immediate attention
- **WARN**: Potential issues that should be investigated
- **INFO**: Informational messages about application state
- **DEBUG**: Detailed diagnostic information
- **TRACE**: Very detailed diagnostic information

## Alerting Strategy

### Alert Rules

```bash
# High CPU Utilization
aws cloudwatch put-metric-alarm \
  --alarm-name ai-influencer-high-cpu \
  --alarm-description "Alert when CPU >80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:alerts

# High Memory Usage
aws cloudwatch put-metric-alarm \
  --alarm-name ai-influencer-high-memory \
  --alarm-description "Alert when memory >85%" \
  --metric-name MemoryUtilization \
  --namespace CustomMetrics \
  --statistic Average \
  --period 300 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:alerts

# Application Error Rate
aws cloudwatch put-metric-alarm \
  --alarm-name ai-influencer-high-error-rate \
  --alarm-description "Alert when error rate >5%" \
  --metric-name ErrorRate \
  --namespace AI-Influencer \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:alerts
```

## Distributed Tracing

### AWS X-Ray Integration

**Installation**:
```bash
npm install aws-xray-sdk-core
```

**Implementation**:
```javascript
const AWSXRay = require('aws-xray-sdk-core');
const express = require('express');
const app = express();

// Patch AWS SDK
AWSXRay.config([AWSXRay.plugins.ECSPlugin]);

// Add X-Ray middleware
app.use(AWSXRay.express.openSegment('ai-influencer'));

// Your routes here

app.use(AWSXRay.express.closeSegment());
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

1. **Response Time**
   - Target: <500ms (p95)
   - Monitor: API latency
   - Alert: If >1000ms

2. **Error Rate**
   - Target: <0.1%
   - Monitor: 5xx errors
   - Alert: If >1%

3. **Throughput**
   - Monitor: Requests per second
   - Alert: If <expected baseline

4. **Availability**
   - Target: 99.9% (Four 9s)
   - Monitor: Uptime percentage
   - Alert: If <99%

### Custom Metrics

```javascript
const cloudwatch = new AWS.CloudWatch();

// Push custom metric
function pushMetric(metricName, value, unit = 'Count') {
  const params = {
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
        Namespace: 'AI-Influencer'
      }
    ]
  };
  
  cloudwatch.putMetricData(params, (err) => {
    if (err) logger.error('Failed to push metric', err);
  });
}

// Usage
pushMetric('ContentGenerated', 1, 'Count');
pushMetric('APILatency', responseTime, 'Milliseconds');
pushMetric('EngagementScore', engagementScore, 'Count');
```

## Runbooks

### Issue: High CPU Usage

1. Check current CPU usage: `top` or CloudWatch
2. Identify resource-heavy processes
3. Review application logs for errors
4. Check for slow database queries
5. Scale horizontally if necessary
6. If spike is temporary, monitor and document

### Issue: High Memory Usage

1. Check memory usage: `free -h` or CloudWatch
2. Check for memory leaks in application
3. Review Node.js heap snapshots
4. Check for large cache accumulation
5. Restart application if memory usage >90%
6. Investigate root cause

### Issue: Database Connection Errors

1. Check database connectivity
2. Verify security group rules
3. Check database logs for errors
4. Verify connection string in .env
5. Check connection pool limits
6. Restart database service if needed

## Testing Monitoring

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 100 http://localhost:5000/api/health

# Using Artillery
npm install -g artillery
artillery quick --count 100 --num 1000 http://localhost:5000/api

# Using k6
k6 run load-test.js
```

### Health Check Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health | jq .

# Check response time
time curl http://localhost:5000/api/health
```

## Documentation

- **Created**: December 13, 2025
- **Version**: 1.0.0
- **Status**: Production Ready
