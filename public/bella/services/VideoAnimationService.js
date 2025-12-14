/**
 * VideoAnimationService.js
 * Handles video-based avatar animation playback with cross-fading
 * Bella's approach: Pre-recorded video animations with smooth transitions
 */

class VideoAnimationService {
  constructor(containerSelector = '#bella-video-container') {
    this.container = document.querySelector(containerSelector);
    this.currentVideo = null;
    this.nextVideo = null;
    this.isTransitioning = false;
    this.transitionDuration = 300; // Cross-fade duration in ms
    this.animationQueue = [];
    this.isPlaying = false;
    
    // Animation mapping from intent/emotion to video files
    this.animationMap = {
      idle: '/bella/videos/standard_主体形象是一个数字人_说话中.mp4',
      greeting: '/bella/videos/jimeng-2025-07-21-8544-打招呼.mp4',
      thinking: '/bella/videos/jimeng-2025-07-17-2665-若有所思，手扶下巴.mp4',
      happy: '/bella/videos/jimeng-2025-07-23-4616-主体形象是一个数字人，开心大笑的样子，保持优雅.mp4',
      nodding: '/bella/videos/jimeng-2025-07-23-3856-主体形象是一个数字人，确认，优雅的小幅度点头.mp4',
      encouraging: '/bella/videos/jimeng-2025-07-23-7205-主体形象是一个数字人，对用户表现、成就给予肯定和鼓励时用，保持优雅.mp4',
      sad: '/bella/videos/jimeng-2025-07-21-2297-悲伤.mp4',
      waving: '/bella/videos/jimeng-2025-07-17-1871-优雅的摇晃身体 微笑.mp4',
      peace: '/bella/videos/jimeng-2025-07-16-4437-比耶，然后微笑着优雅的左右摇晃.mp4',
      elegant_sway: '/bella/videos/jimeng-2025-07-16-1043-笑着优雅的左右摇晃，过一会儿手扶着下巴，保持微笑.mp4'
    };
    
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.warn('VideoAnimationService: Container not found');
      return;
    }
    
    // Create video elements
    this.createVideoElements();
    console.log('VideoAnimationService initialized');
  }
  
  createVideoElements() {
    // Create main video element
    this.currentVideo = document.createElement('video');
    this.currentVideo.className = 'bella-video-main';
    this.currentVideo.style.width = '100%';
    this.currentVideo.style.height = '100%';
    this.currentVideo.style.objectFit = 'cover';
    this.currentVideo.autoplay = false;
    this.currentVideo.loop = false;
    this.container.appendChild(this.currentVideo);
    
    // Create next video element for cross-fading
    this.nextVideo = document.createElement('video');
    this.nextVideo.className = 'bella-video-next';
    this.nextVideo.style.width = '100%';
    this.nextVideo.style.height = '100%';
    this.nextVideo.style.objectFit = 'cover';
    this.nextVideo.style.position = 'absolute';
    this.nextVideo.style.top = '0';
    this.nextVideo.style.left = '0';
    this.nextVideo.style.opacity = '0';
    this.nextVideo.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
    this.nextVideo.autoplay = false;
    this.nextVideo.loop = false;
    this.container.appendChild(this.nextVideo);
    
    // Ensure container is positioned for absolute positioning
    this.container.style.position = 'relative';
  }
  
  /**
   * Play animation by name or with custom video path
   * @param {string} animationName - Animation name from animationMap or custom video path
   * @param {boolean} loop - Whether to loop the video
   * @param {function} onComplete - Callback when animation ends
   */
  async playAnimation(animationName, loop = false, onComplete = null) {
    const videoPath = this.animationMap[animationName] || animationName;
    
    if (!videoPath) {
      console.error('Unknown animation:', animationName);
      return;
    }
    
    // Add to queue if already playing
    if (this.isPlaying && this.isTransitioning) {
      this.animationQueue.push({ videoPath, loop, onComplete });
      return;
    }
    
    await this.performCrossFade(videoPath, loop, onComplete);
  }
  
  /**
   * Perform cross-fade transition between videos
   */
  async performCrossFade(videoPath, loop, onComplete) {
    this.isTransitioning = true;
    
    // Load next video
    this.nextVideo.src = videoPath;
    this.nextVideo.loop = loop;
    this.nextVideo.load();
    
    return new Promise((resolve) => {
      this.nextVideo.oncanplay = async () => {
        // Start playing next video
        this.nextVideo.play();
        
        // Animate opacity
        this.nextVideo.style.opacity = '1';
        
        // Wait for transition to complete
        setTimeout(() => {
          // Swap videos
          const temp = this.currentVideo;
          this.currentVideo = this.nextVideo;
          this.nextVideo = temp;
          
          // Reset next video
          this.nextVideo.style.opacity = '0';
          this.nextVideo.src = '';
          
          this.isTransitioning = false;
          this.isPlaying = !loop ? true : true;
          
          // Handle video end
          this.currentVideo.onended = () => {
            this.isPlaying = false;
            if (onComplete) onComplete();
            this.processQueue();
          };
          
          if (loop) {
            this.currentVideo.loop = true;
          }
          
          resolve();
        }, this.transitionDuration);
      };
    });
  }
  
  /**
   * Play next animation in queue
   */
  processQueue() {
    if (this.animationQueue.length > 0) {
      const { videoPath, loop, onComplete } = this.animationQueue.shift();
      this.performCrossFade(videoPath, loop, onComplete);
    }
  }
  
  /**
   * Stop current animation
   */
  stop() {
    if (this.currentVideo) {
      this.currentVideo.pause();
      this.isPlaying = false;
    }
  }
  
  /**
   * Pause current animation
   */
  pause() {
    if (this.currentVideo) {
      this.currentVideo.pause();
    }
  }
  
  /**
   * Resume paused animation
   */
  resume() {
    if (this.currentVideo) {
      this.currentVideo.play();
    }
  }
  
  /**
   * Set transition duration
   */
  setTransitionDuration(duration) {
    this.transitionDuration = duration;
    this.nextVideo.style.transition = `opacity ${duration}ms ease-in-out`;
  }
  
  /**
   * Register custom animation
   */
  registerAnimation(name, videoPath) {
    this.animationMap[name] = videoPath;
  }
  
  /**
   * Get current animation info
   */
  getCurrentAnimation() {
    return {
      isPlaying: this.isPlaying,
      isTransitioning: this.isTransitioning,
      queueLength: this.animationQueue.length
    };
  }
}

export default VideoAnimationService;
