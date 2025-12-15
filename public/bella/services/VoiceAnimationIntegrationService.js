/**
 * VoiceAnimationIntegrationService.js
 * Integrates voice agents (Phase 1-3) with Bella video animations
 * Orchestrates emotion detection, animation triggers, and voice synthesis
 */

import EmotionDetectionService from './EmotionDetectionService.js';

class VoiceAnimationIntegrationService {
  constructor(videoAvatarRef, config = {}) {
    this.videoAvatarRef = videoAvatarRef;
    this.config = {
      enableEmotionDetection: true,
      animationOnListening: 'thinking',
      animationOnProcessing: 'thinking',
      animationOnResponse: 'idle',
      emotionAnimationDuration: 2000,
      transitionSmoothing: true,
      ...config
    };

    this.emotionService = new EmotionDetectionService();
    this.voiceState = 'idle'; // idle, listening, processing, speaking
    this.currentEmotion = 'neutral';
    this.animationQueue = [];
    this.isProcessing = false;
  }

  /**
   * Trigger animation when user starts speaking (listening state)
   */
  onVoiceListeningStart() {
    this.voiceState = 'listening';
    if (this.videoAvatarRef?.playAnimation) {
      this.queueAnimation(this.config.animationOnListening, false);
    }
  }

  /**
   * Trigger animation when voice is being processed
   */
  onVoiceProcessing(transcript) {
    this.voiceState = 'processing';
    
    // Detect emotion from the transcript
    if (this.config.enableEmotionDetection && transcript) {
      const emotionResult = this.emotionService.detectEmotion(transcript);
      this.currentEmotion = emotionResult.emotion;
      
      // Play emotion-based animation
      const animationName = this.emotionService.mapEmotionToAnimation(
        emotionResult.emotion,
        this.config.emotionMap
      );
      
      this.queueAnimation(animationName, false, emotionResult.intensity);
    } else {
      // Fallback to processing animation
      this.queueAnimation(this.config.animationOnProcessing, false);
    }
  }

  /**
   * Trigger animation when playing response audio
   * Synchronize animation with speech synthesis duration
   */
  onVoiceResponse(responseText, audioDuration = null) {
    this.voiceState = 'speaking';
    
    // Detect emotion from response text
    const emotionResult = this.emotionService.detectEmotion(responseText);
    const animationName = this.emotionService.mapEmotionToAnimation(
      emotionResult.emotion,
      this.config.emotionMap
    );

    // Play animation synchronized with audio
    if (this.videoAvatarRef?.playAnimation) {
      if (audioDuration) {
        // Set animation duration to match audio
        this.queueAnimation(animationName, true, 1.0, audioDuration);
      } else {
        // Default emotion-based animation
        this.queueAnimation(animationName, false, emotionResult.intensity);
      }
    }
  }

  /**
   * Handle completion of voice interaction
   */
  onVoiceComplete() {
    this.voiceState = 'idle';
    this.animationQueue = [];
    
    // Return to idle animation
    if (this.videoAvatarRef?.playAnimation) {
      this.videoAvatarRef.playAnimation('idle', true).catch(err => {
        console.warn('Failed to return to idle animation:', err);
      });
    }
  }

  /**
   * Queue animation with priority handling
   */
  queueAnimation(animationName, loop = false, intensity = 1.0, duration = null) {
    const animationItem = {
      name: animationName,
      loop,
      intensity,
      duration,
      timestamp: Date.now()
    };

    this.animationQueue.push(animationItem);
    this.processAnimationQueue();
  }

  /**
   * Process animation queue and execute animations sequentially
   */
  async processAnimationQueue() {
    if (this.isProcessing || !this.animationQueue.length) {
      return;
    }

    this.isProcessing = true;

    while (this.animationQueue.length > 0) {
      const animation = this.animationQueue.shift();
      
      try {
        if (this.videoAvatarRef?.playAnimation) {
          await this.videoAvatarRef.playAnimation(animation.name, animation.loop);
          
          // If duration specified, wait for it
          if (animation.duration) {
            await new Promise(resolve => setTimeout(resolve, animation.duration));
          }
        }
      } catch (error) {
        console.error('Animation playback error:', error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Directly trigger emotion-based animation
   */
  triggerEmotionAnimation(emotion, intensity = 0.5) {
    this.currentEmotion = emotion;
    const animationName = this.emotionService.mapEmotionToAnimation(
      emotion,
      this.config.emotionMap
    );
    this.queueAnimation(animationName, false, intensity);
  }

  /**
   * Get current voice and animation state
   */
  getState() {
    return {
      voiceState: this.voiceState,
      currentEmotion: this.currentEmotion,
      queueLength: this.animationQueue.length,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Analyze sentiment trend in conversation
   */
  analyzeSentimentTrend(conversationHistory) {
    if (!Array.isArray(conversationHistory)) {
      return null;
    }

    const emotionTrend = this.emotionService.analyzeEmotionTrend(
      conversationHistory
    );

    return {
      dominantEmotion: emotionTrend.dominantEmotion,
      emotionDistribution: emotionTrend.emotionDistribution,
      averageIntensity: emotionTrend.averageIntensity,
      trend: this.calculateTrend(emotionTrend.emotionSequence)
    };
  }

  /**
   * Calculate emotion trend direction (improving, declining, stable)
   */
  calculateTrend(emotionSequence) {
    if (emotionSequence.length < 2) return 'stable';

    const positiveEmotions = ['happy', 'calm', 'surprised'];
    const negativeEmotions = ['sad', 'angry', 'afraid'];

    const firstHalf = emotionSequence.slice(0, Math.ceil(emotionSequence.length / 2));
    const secondHalf = emotionSequence.slice(Math.ceil(emotionSequence.length / 2));

    const firstHalfPositiveCount = firstHalf.filter(e => positiveEmotions.includes(e)).length;
    const secondHalfPositiveCount = secondHalf.filter(e => positiveEmotions.includes(e)).length;

    if (secondHalfPositiveCount > firstHalfPositiveCount) {
      return 'improving';
    } else if (secondHalfPositiveCount < firstHalfPositiveCount) {
      return 'declining';
    }
    return 'stable';
  }

  /**
   * Reset service state
   */
  reset() {
    this.voiceState = 'idle';
    this.currentEmotion = 'neutral';
    this.animationQueue = [];
    this.isProcessing = false;
  }
}

export default VoiceAnimationIntegrationService;
