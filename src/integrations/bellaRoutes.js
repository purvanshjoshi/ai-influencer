/**
 * Bella API Routes
 * Express routes for Bella LLM integration and AI influencer operations
 */

const express = require('express');
const router = express.Router();
const bellaClient = require('./bellaClient');
const PersonalityEngine = require('./personalityEngine');

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/bella/generate
 * Generate content using Bella LLM
 */
router.post('/generate', asyncHandler(async (req, res) => {
  const { prompt, personality, style, maxTokens, temperature } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const result = await bellaClient.generateContent({
    prompt,
    personality: personality || 'authentic',
    style: style || 'social_media',
    maxTokens,
    temperature
  });

  res.json({ success: true, data: result });
}));

/**
 * POST /api/bella/influencers
 * Create new AI influencer profile
 */
router.post('/influencers', asyncHandler(async (req, res) => {
  const { name, niche, personality, tone, audience } = req.body;
  
  if (!name || !niche) {
    return res.status(400).json({ error: 'Name and niche are required' });
  }

  const personalityEngine = new PersonalityEngine(personality || 'authentic');
  const profile = await bellaClient.createInfluencerProfile({
    name,
    niche,
    personality: personalityEngine.getProfile(),
    tone,
    audience
  });

  res.json({ success: true, influencer: profile });
}));

/**
 * GET /api/bella/influencers/:id/metrics
 * Get engagement metrics for an influencer
 */
router.get('/influencers/:id/metrics', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const metrics = await bellaClient.getEngagementMetrics(id);
  res.json({ success: true, metrics });
}));

/**
 * POST /api/bella/optimize
 * Optimize content for specific platform
 */
router.post('/optimize', asyncHandler(async (req, res) => {
  const { content, platform, audience, goals } = req.body;
  
  if (!content || !platform) {
    return res.status(400).json({ error: 'Content and platform are required' });
  }

  const optimized = await bellaClient.optimizeContent({
    content,
    platform,
    audience,
    goals
  });

  res.json({ success: true, optimized });
}));

/**
 * POST /api/bella/health
 * Check Bella API health status
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    // Simple health check
    res.json({ status: 'healthy', service: 'bella-integration', version: '1.0.0' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
}));

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Bella API error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error : undefined
  });
});

module.exports = router;
