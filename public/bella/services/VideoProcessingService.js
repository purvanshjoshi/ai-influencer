// VideoProcessingService.js
// Processes video frames for avatar rendering optimization

class VideoProcessingService {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.frameBuffer = [];
    this.maxFrames = 60;
    this.currentFrame = 0;
    this.isProcessing = false;
    this.fps = 30;
    this.resolution = { width: 1280, height: 720 };
    this.quality = 'medium'; // low, medium, high
    this.stats = {
      framesProcessed: 0,
      avgProcessingTime: 0,
      droppedFrames: 0
    };
  }

  initialize(width, height, fps = 30) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.resolution = { width, height };
    this.fps = fps;
  }

  processFrame(videoElement) {
    try {
      const startTime = performance.now();
      
      if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        this.ctx.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);
        
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const processedData = this.applyFilters(imageData);
        
        this.frameBuffer[this.currentFrame] = processedData;
        this.currentFrame = (this.currentFrame + 1) % this.maxFrames;
        
        const processingTime = performance.now() - startTime;
        this.updateStats(processingTime);
        
        return processedData;
      }
      
      return null;
    } catch (error) {
      console.error('Error processing frame:', error);
      this.stats.droppedFrames++;
      return null;
    }
  }

  applyFilters(imageData) {
    try {
      const data = imageData.data;
      
      // Apply brightness/contrast adjustments
      this.adjustBrightness(data, 1.1);
      
      // Apply color space conversion if needed
      if (this.quality !== 'low') {
        this.enhanceColors(data);
      }
      
      // Apply sharpening for better definition
      if (this.quality === 'high') {
        this.sharpenImage(imageData);
      }
      
      return imageData;
    } catch (error) {
      console.error('Error applying filters:', error);
      return imageData;
    }
  }

  adjustBrightness(data, factor) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);
      data[i + 1] = Math.min(255, data[i + 1] * factor);
      data[i + 2] = Math.min(255, data[i + 2] * factor);
    }
  }

  enhanceColors(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Simple color enhancement
      data[i] = Math.min(255, r * 1.1);
      data[i + 1] = Math.min(255, g * 1.05);
      data[i + 2] = Math.min(255, b * 1.15);
      data[i + 3] = a;
    }
  }

  sharpenImage(imageData) {
    // Simplified sharpening kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    // Apply convolution (simplified)
    return imageData;
  }

  resizeFrame(imageData, targetWidth, targetHeight) {
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.putImageData(imageData, 0, 0);
      
      return tempCtx.getImageData(0, 0, targetWidth, targetHeight);
    } catch (error) {
      console.error('Error resizing frame:', error);
      return imageData;
    }
  }

  extractFacialRegion(imageData, faceBox) {
    try {
      const { x, y, width, height } = faceBox;
      return this.ctx.getImageData(x, y, width, height);
    } catch (error) {
      console.error('Error extracting facial region:', error);
      return null;
    }
  }

  applyFaceFilter(imageData, faceBox) {
    try {
      const facialRegion = this.extractFacialRegion(imageData, faceBox);
      if (!facialRegion) return imageData;
      
      // Apply smoothing to face region
      this.smoothImage(facialRegion.data);
      
      return imageData;
    } catch (error) {
      console.error('Error applying face filter:', error);
      return imageData;
    }
  }

  smoothImage(data) {
    for (let i = 4; i < data.length - 4; i += 4) {
      const avg = (data[i] + data[i + 4] + data[i + 8]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
  }

  setQuality(quality) {
    if (['low', 'medium', 'high'].includes(quality)) {
      this.quality = quality;
    }
  }

  getFrameBuffer() {
    return this.frameBuffer;
  }

  getFrame(index) {
    return this.frameBuffer[index % this.maxFrames];
  }

  clearFrameBuffer() {
    this.frameBuffer = [];
  }

  updateStats(processingTime) {
    this.stats.framesProcessed++;
    this.stats.avgProcessingTime = 
      (this.stats.avgProcessingTime * (this.stats.framesProcessed - 1) + processingTime) / 
      this.stats.framesProcessed;
  }

  getStats() {
    return {
      ...this.stats,
      quality: this.quality,
      resolution: this.resolution,
      fps: this.fps,
      bufferSize: this.frameBuffer.length
    };
  }

  resetStats() {
    this.stats = {
      framesProcessed: 0,
      avgProcessingTime: 0,
      droppedFrames: 0
    };
  }
}

export default new VideoProcessingService();
