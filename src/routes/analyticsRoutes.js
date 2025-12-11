const express = require('express');
const router = express.Router();
const EngagementAnalytics = require('../integrations/analytics');

const analytics = new EngagementAnalytics();

// Track engagement event
router.post('/track', (req, res) => {
  try {
    const { contentId, engagementType, metadata } = req.body;
    const event = analytics.trackEngagement(contentId, engagementType, metadata);
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get analytics for specific content
router.get('/content/:id', (req, res) => {
  try {
    const contentAnalytics = analytics.getContentAnalytics(req.params.id);
    if (!contentAnalytics) {
      return res.status(404).json({ error: 'No analytics found for this content' });
    }
    res.json(contentAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overall influencer analytics
router.get('/influencer/summary', (req, res) => {
  try {
    const summary = analytics.getInfluencerAnalytics();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get engagement trends
router.get('/trends/:timeRange', (req, res) => {
  try {
    const { timeRange } = req.params;
    const trends = analytics.getEngagementTrend(timeRange);
    res.json({
      timeRange,
      count: trends.length,
      trends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', (req, res) => {
  try {
    const summary = analytics.getInfluencerAnalytics();
    const weekTrends = analytics.getEngagementTrend('week');
    
    res.json({
      totalEngagements: summary.totalEngagements,
      totalEngagementScore: summary.totalEngagementScore,
      weeklyEngagements: weekTrends.length,
      contentCount: Object.keys(summary.contentAnalysis).length,
      averageEngagementScore: summary.totalEngagementScore / Math.max(Object.keys(summary.contentAnalysis).length, 1)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
