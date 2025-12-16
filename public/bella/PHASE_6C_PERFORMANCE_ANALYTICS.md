/**
 * PerformanceAnalyticsService.js
 * Monitors, analyzes, and optimizes avatar performance metrics
 */

class PerformanceAnalyticsService {
  constructor() {
    this.metrics = {
      frameRate: [],
      renderTime: [],
      memoryUsage: [],
      audioLatency: [],
      apiResponseTime: []
    };
    this.thresholds = {
      minFrameRate: 30,
      maxRenderTime: 33,
      maxMemoryUsage: 250,
      maxAudioLatency: 100,
      maxApiResponseTime: 500
    };
    this.performanceObserver = null;
    this.analyticsBuffer = [];
    this.bufferSize = 1000;
    this.sessionStartTime = Date.now();
  }

  /**
   * Initialize performance monitoring
   * @param {Object} options - Configuration options
   */
  initialize(options = {}) {
    this.thresholds = { ...this.thresholds, ...options };
    this._setupPerformanceObserver();
    this._startMemoryMonitoring();
    return this;
  }

  /**
   * Setup Performance Observer for paint and measure events
   * @private
   */
  _setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            this._recordPaintMetric(entry);
          } else if (entry.entryType === 'measure') {
            this._recordMeasurement(entry);
          }
        }
      });

      this.performanceObserver.observe({
        entryTypes: ['paint', 'measure', 'navigation']
      });
    } catch (error) {
      console.warn('PerformanceObserver not fully supported:', error.message);
    }
  }

  /**
   * Start memory monitoring interval
   * @private
   */
  _startMemoryMonitoring() {
    if (!performance.memory) return;

    setInterval(() => {
      const memoryUsed = performance.memory.usedJSHeapSize / 1048576; // Convert to MB
      this.metrics.memoryUsage.push({
        value: memoryUsed,
        timestamp: Date.now(),
        healthy: memoryUsed < this.thresholds.maxMemoryUsage
      });
      this._cleanupOldMetrics('memoryUsage');
    }, 1000);
  }

  /**
   * Record frame rate measurement
   * @param {number} fps - Current frames per second
   */
  recordFrameRate(fps) {
    const healthy = fps >= this.thresholds.minFrameRate;
    this.metrics.frameRate.push({
      value: fps,
      timestamp: Date.now(),
      healthy
    });
    this._cleanupOldMetrics('frameRate');
    return this._checkThreshold('frameRate', fps, this.thresholds.minFrameRate, 'above');
  }

  /**
   * Record render time
   * @param {number} ms - Render time in milliseconds
   */
  recordRenderTime(ms) {
    const healthy = ms <= this.thresholds.maxRenderTime;
    this.metrics.renderTime.push({
      value: ms,
      timestamp: Date.now(),
      healthy
    });
    this._cleanupOldMetrics('renderTime');
    return this._checkThreshold('renderTime', ms, this.thresholds.maxRenderTime, 'below');
  }

  /**
   * Record audio latency
   * @param {number} ms - Audio latency in milliseconds
   */
  recordAudioLatency(ms) {
    const healthy = ms <= this.thresholds.maxAudioLatency;
    this.metrics.audioLatency.push({
      value: ms,
      timestamp: Date.now(),
      healthy
    });
    this._cleanupOldMetrics('audioLatency');
    return this._checkThreshold('audioLatency', ms, this.thresholds.maxAudioLatency, 'below');
  }

  /**
   * Record API response time
   * @param {number} ms - API response time in milliseconds
   */
  recordApiResponseTime(ms) {
    const healthy = ms <= this.thresholds.maxApiResponseTime;
    this.metrics.apiResponseTime.push({
      value: ms,
      timestamp: Date.now(),
      healthy
    });
    this._cleanupOldMetrics('apiResponseTime');
    return this._checkThreshold('apiResponseTime', ms, this.thresholds.maxApiResponseTime, 'below');
  }

  /**
   * Record paint timing
   * @private
   */
  _recordPaintMetric(entry) {
    console.debug(`Paint timing: ${entry.name} - ${entry.startTime.toFixed(2)}ms`);
  }

  /**
   * Record custom measurement
   * @private
   */
  _recordMeasurement(entry) {
    console.debug(`Measurement: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
  }

  /**
   * Check if metric exceeds threshold
   * @private
   */
  _checkThreshold(metric, value, threshold, direction) {
    const isHealthy = direction === 'above' ? value >= threshold : value <= threshold;
    if (!isHealthy) {
      this._recordAlert(metric, value, threshold, direction);
    }
    return isHealthy;
  }

  /**
   * Record performance alert
   * @private
   */
  _recordAlert(metric, value, threshold, direction) {
    const alert = {
      metric,
      value,
      threshold,
      direction,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime
    };
    this.analyticsBuffer.push(alert);
    this._cleanupAnalyticsBuffer();
  }

  /**
   * Clean up old metrics to prevent memory bloat
   * @private
   */
  _cleanupOldMetrics(metricType) {
    const maxMetrics = 500;
    if (this.metrics[metricType].length > maxMetrics) {
      this.metrics[metricType] = this.metrics[metricType].slice(-maxMetrics);
    }
  }

  /**
   * Clean up old analytics alerts
   * @private
   */
  _cleanupAnalyticsBuffer() {
    if (this.analyticsBuffer.length > this.bufferSize) {
      this.analyticsBuffer = this.analyticsBuffer.slice(-this.bufferSize);
    }
  }

  /**
   * Get performance summary
   * @returns {Object} Summary of all metrics
   */
  getPerformanceSummary() {
    return {
      frameRate: this._calculateStats(this.metrics.frameRate),
      renderTime: this._calculateStats(this.metrics.renderTime),
      memoryUsage: this._calculateStats(this.metrics.memoryUsage),
      audioLatency: this._calculateStats(this.metrics.audioLatency),
      apiResponseTime: this._calculateStats(this.metrics.apiResponseTime),
      overallHealth: this._calculateOverallHealth(),
      sessionDuration: Date.now() - this.sessionStartTime,
      alerts: this.analyticsBuffer
    };
  }

  /**
   * Calculate statistics for a metric
   * @private
   */
  _calculateStats(metricArray) {
    if (metricArray.length === 0) {
      return { avg: 0, min: 0, max: 0, current: 0, healthy: true };
    }

    const values = metricArray.map(m => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[values.length - 1];
    const healthyCount = metricArray.filter(m => m.healthy).length;
    const healthy = (healthyCount / metricArray.length) > 0.9; // 90% healthy threshold

    return { avg: Math.round(avg * 100) / 100, min, max, current, healthy };
  }

  /**
   * Calculate overall performance health score
   * @private
   */
  _calculateOverallHealth() {
    const scores = [
      this._calculateStats(this.metrics.frameRate).healthy,
      this._calculateStats(this.metrics.renderTime).healthy,
      this._calculateStats(this.metrics.memoryUsage).healthy,
      this._calculateStats(this.metrics.audioLatency).healthy,
      this._calculateStats(this.metrics.apiResponseTime).healthy
    ].filter(Boolean);

    return {
      score: Math.round((scores.length / 5) * 100),
      status: scores.length === 5 ? 'excellent' : scores.length >= 3 ? 'good' : 'needs improvement'
    };
  }

  /**
   * Export metrics for analysis
   * @returns {Object} All collected metrics
   */
  exportMetrics() {
    return {
      metrics: this.metrics,
      summary: this.getPerformanceSummary(),
      exportTime: new Date().toISOString()
    };
  }

  /**
   * Send metrics to analytics backend
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   */
  async sendMetricsToBackend(endpoint, options = {}) {
    try {
      const payload = {
        metrics: this.getPerformanceSummary(),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        ...options
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send metrics:', error);
      throw error;
    }
  }

  /**
   * Get specific metric history
   * @param {string} metricType - Type of metric
   * @param {number} limit - Maximum number of records
   */
  getMetricHistory(metricType, limit = 100) {
    const metric = this.metrics[metricType] || [];
    return metric.slice(-limit);
  }

  /**
   * Reset all metrics
   */
  reset() {
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = [];
    });
    this.analyticsBuffer = [];
    this.sessionStartTime = Date.now();
  }

  /**
   * Cleanup and dispose
   */
  dispose() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.metrics = {};
    this.analyticsBuffer = [];
  }
}

export default PerformanceAnalyticsService;
