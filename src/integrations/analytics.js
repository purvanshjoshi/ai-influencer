class EngagementAnalytics {
  constructor() {
    this.metrics = {};
    this.trackingEvents = [];
  }

  trackEngagement(contentId, engagementType, metadata = {}) {
    const event = {
      contentId,
      engagementType,
      timestamp: new Date(),
      metadata
    };
    this.trackingEvents.push(event);
    this.updateMetrics(contentId, engagementType);
    return event;
  }

  updateMetrics(contentId, engagementType) {
    if (!this.metrics[contentId]) {
      this.metrics[contentId] = {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        engagement_score: 0
      };
    }
    
    const weights = {
      'like': 1,
      'comment': 3,
      'share': 5,
      'view': 0.5
    };
    
    this.metrics[contentId][engagementType]++;
    this.metrics[contentId].engagement_score += weights[engagementType] || 0;
  }

  getContentAnalytics(contentId) {
    return this.metrics[contentId] || null;
  }

  getInfluencerAnalytics() {
    const summary = {
      totalEngagements: this.trackingEvents.length,
      totalEngagementScore: 0,
      contentAnalysis: {}
    };
    
    for (const [contentId, metrics] of Object.entries(this.metrics)) {
      summary.contentAnalysis[contentId] = metrics;
      summary.totalEngagementScore += metrics.engagement_score;
    }
    
    return summary;
  }

  getEngagementTrend(timeRange = 'week') {
    const now = new Date();
    const timeMs = timeRange === 'week' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    return this.trackingEvents.filter(event => 
      (now - event.timestamp) < timeMs
    );
  }
}

module.exports = EngagementAnalytics;
