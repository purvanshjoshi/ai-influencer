// PerformanceMonitorService.js
// Real-time performance monitoring for avatar rendering and processing

class PerformanceMonitorService {
  constructor() {
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      renderTime: 0,
      updateTime: 0,
      audioProcessingTime: 0,
      gpuLoad: 0,
      cpuLoad: 0,
      memoryUsage: 0,
      videoFrameRate: 30,
      audioLatency: 0
    };
    
    this.history = new Map();
    this.maxHistoryLength = 300; // Keep last 300 frames (5 seconds at 60fps)
    this.isMonitoring = false;
    this.samplingRate = 16; // Sample every 16ms
    this.observers = [];
    
    this.thresholds = {
      minFPS: 30,
      maxFrameTime: 33, // ~30 FPS
      maxGpuLoad: 0.9,
      maxCpuLoad: 0.85,
      maxMemoryUsage: 0.9,
      audioLatencyMax: 50 // ms
    };
    
    // Performance tracking variables
    this.frameStartTime = null;
    this.lastFrameTime = Date.now();
    this.frameCount = 0;
    this.fpsUpdateInterval = 1000; // Update FPS every 1 second
    this.lastFpsUpdate = Date.now();
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameStartTime = performance.now();
    this.lastFpsUpdate = Date.now();
    
    // Use requestAnimationFrame for frame-perfect monitoring
    this.monitoringLoop();
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }

  monitoringLoop() {
    if (!this.isMonitoring) return;
    
    const now = performance.now();
    
    // Calculate frame time
    if (this.frameStartTime !== null) {
      const frameTime = now - this.frameStartTime;
      this.metrics.frameTime = frameTime;
      this.recordMetric('frameTime', frameTime);
    }
    
    this.frameStartTime = now;
    this.frameCount++;
    
    // Update FPS every 1 second
    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.metrics.fps = this.frameCount;
      this.recordMetric('fps', this.frameCount);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      
      // Check thresholds
      this.checkPerformanceThresholds();
    }
    
    // Update system metrics
    this.updateSystemMetrics();
    
    // Notify observers
    this.notifyObservers();
    
    requestAnimationFrame(() => this.monitoringLoop());
  }

  recordMetric(metricName, value) {
    if (!this.history.has(metricName)) {
      this.history.set(metricName, []);
    }
    
    const history = this.history.get(metricName);
    history.push({
      value,
      timestamp: Date.now()
    });
    
    // Keep history size under control
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }
  }

  recordRenderTime(duration) {
    this.metrics.renderTime = duration;
    this.recordMetric('renderTime', duration);
  }

  recordUpdateTime(duration) {
    this.metrics.updateTime = duration;
    this.recordMetric('updateTime', duration);
  }

  recordAudioProcessingTime(duration) {
    this.metrics.audioProcessingTime = duration;
    this.recordMetric('audioProcessingTime', duration);
  }

  recordAudioLatency(latency) {
    this.metrics.audioLatency = latency;
    this.recordMetric('audioLatency', latency);
  }

  recordVideoFrameRate(fps) {
    this.metrics.videoFrameRate = fps;
    this.recordMetric('videoFrameRate', fps);
  }

  updateSystemMetrics() {
    // Estimate GPU and CPU load based on frame time
    const targetFrameTime = 1000 / 60; // 60 FPS target
    const gpuLoadEstimate = Math.min(1, this.metrics.renderTime / targetFrameTime);
    const cpuLoadEstimate = Math.min(1, this.metrics.updateTime / targetFrameTime);
    
    this.metrics.gpuLoad = gpuLoadEstimate;
    this.metrics.cpuLoad = cpuLoadEstimate;
    this.recordMetric('gpuLoad', gpuLoadEstimate);
    this.recordMetric('cpuLoad', cpuLoadEstimate);
    
    // Estimate memory usage (simplified)
    if (performance.memory) {
      const memoryRatio = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
      this.metrics.memoryUsage = memoryRatio;
      this.recordMetric('memoryUsage', memoryRatio);
    }
  }

  checkPerformanceThresholds() {
    const issues = [];
    
    if (this.metrics.fps < this.thresholds.minFPS) {
      issues.push({
        type: 'LOW_FPS',
        value: this.metrics.fps,
        threshold: this.thresholds.minFPS,
        severity: 'high'
      });
    }
    
    if (this.metrics.frameTime > this.thresholds.maxFrameTime) {
      issues.push({
        type: 'HIGH_FRAME_TIME',
        value: this.metrics.frameTime.toFixed(2),
        threshold: this.thresholds.maxFrameTime,
        severity: 'high'
      });
    }
    
    if (this.metrics.gpuLoad > this.thresholds.maxGpuLoad) {
      issues.push({
        type: 'HIGH_GPU_LOAD',
        value: (this.metrics.gpuLoad * 100).toFixed(1),
        threshold: this.thresholds.maxGpuLoad * 100,
        severity: 'medium'
      });
    }
    
    if (this.metrics.cpuLoad > this.thresholds.maxCpuLoad) {
      issues.push({
        type: 'HIGH_CPU_LOAD',
        value: (this.metrics.cpuLoad * 100).toFixed(1),
        threshold: this.thresholds.maxCpuLoad * 100,
        severity: 'medium'
      });
    }
    
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      issues.push({
        type: 'HIGH_MEMORY_USAGE',
        value: (this.metrics.memoryUsage * 100).toFixed(1),
        threshold: this.thresholds.maxMemoryUsage * 100,
        severity: 'warning'
      });
    }
    
    if (this.metrics.audioLatency > this.thresholds.audioLatencyMax) {
      issues.push({
        type: 'HIGH_AUDIO_LATENCY',
        value: this.metrics.audioLatency.toFixed(2),
        threshold: this.thresholds.audioLatencyMax,
        severity: 'medium'
      });
    }
    
    if (issues.length > 0) {
      this.notifyThresholdViolations(issues);
    }
  }

  notifyThresholdViolations(issues) {
    // Emit event for threshold violations
    const event = new CustomEvent('performanceIssues', {
      detail: { issues, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now()
    };
  }

  getMetricHistory(metricName, duration = 5000) {
    const history = this.history.get(metricName) || [];
    const cutoffTime = Date.now() - duration;
    
    return history.filter(entry => entry.timestamp >= cutoffTime);
  }

  getAverageMetric(metricName, duration = 5000) {
    const history = this.getMetricHistory(metricName, duration);
    
    if (history.length === 0) return 0;
    
    const sum = history.reduce((acc, entry) => acc + entry.value, 0);
    return sum / history.length;
  }

  getMaxMetric(metricName, duration = 5000) {
    const history = this.getMetricHistory(metricName, duration);
    
    if (history.length === 0) return 0;
    
    return Math.max(...history.map(entry => entry.value));
  }

  getMinMetric(metricName, duration = 5000) {
    const history = this.getMetricHistory(metricName, duration);
    
    if (history.length === 0) return 0;
    
    return Math.min(...history.map(entry => entry.value));
  }

  getPerformanceScore() {
    // Calculate overall performance score (0-100)
    let score = 100;
    
    // FPS impact
    const fpsScore = Math.max(0, (this.metrics.fps / 60) * 25);
    score -= (25 - fpsScore);
    
    // GPU load impact
    const gpuScore = Math.max(0, (1 - this.metrics.gpuLoad) * 25);
    score -= (25 - gpuScore);
    
    // CPU load impact
    const cpuScore = Math.max(0, (1 - this.metrics.cpuLoad) * 25);
    score -= (25 - cpuScore);
    
    // Memory usage impact
    const memoryScore = Math.max(0, (1 - this.metrics.memoryUsage) * 25);
    score -= (25 - memoryScore);
    
    return Math.max(0, Math.min(100, score));
  }

  subscribe(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
    
    return () => {
      this.observers = this.observers.filter(o => o !== observer);
    };
  }

  notifyObservers() {
    this.observers.forEach(observer => {
      try {
        observer(this.getMetrics());
      } catch (error) {
        console.error('Error notifying observer:', error);
      }
    });
  }

  setThreshold(thresholdName, value) {
    if (this.thresholds.hasOwnProperty(thresholdName)) {
      this.thresholds[thresholdName] = value;
    }
  }

  getPerformanceReport() {
    const durations = [1000, 5000, 30000]; // Last 1s, 5s, 30s
    const report = {
      currentMetrics: this.getMetrics(),
      aggregates: {},
      performanceScore: this.getPerformanceScore(),
      thresholdViolations: []
    };
    
    durations.forEach(duration => {
      const timeLabel = `${duration / 1000}s`;
      report.aggregates[timeLabel] = {
        fps: {
          avg: this.getAverageMetric('fps', duration).toFixed(2),
          max: this.getMaxMetric('fps', duration),
          min: this.getMinMetric('fps', duration)
        },
        frameTime: {
          avg: this.getAverageMetric('frameTime', duration).toFixed(2),
          max: this.getMaxMetric('frameTime', duration).toFixed(2),
          min: this.getMinMetric('frameTime', duration).toFixed(2)
        },
        gpuLoad: {
          avg: (this.getAverageMetric('gpuLoad', duration) * 100).toFixed(1),
          max: (this.getMaxMetric('gpuLoad', duration) * 100).toFixed(1),
          min: (this.getMinMetric('gpuLoad', duration) * 100).toFixed(1)
        },
        cpuLoad: {
          avg: (this.getAverageMetric('cpuLoad', duration) * 100).toFixed(1),
          max: (this.getMaxMetric('cpuLoad', duration) * 100).toFixed(1),
          min: (this.getMinMetric('cpuLoad', duration) * 100).toFixed(1)
        }
      };
    });
    
    return report;
  }

  clearHistory() {
    this.history.clear();
  }

  reset() {
    this.clearHistory();
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      renderTime: 0,
      updateTime: 0,
      audioProcessingTime: 0,
      gpuLoad: 0,
      cpuLoad: 0,
      memoryUsage: 0,
      videoFrameRate: 30,
      audioLatency: 0
    };
    this.frameCount = 0;
  }
}

export default new PerformanceMonitorService();
