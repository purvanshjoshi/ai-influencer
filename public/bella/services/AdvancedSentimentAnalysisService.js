/**
 * AdvancedSentimentAnalysisService.js
 * Real-time sentiment analysis for avatar emotional responses
 */

class AdvancedSentimentAnalysisService {
  constructor() {
    this.emotionBuffer = [];
    this.bufferSize = 5;
    this.confidenceThreshold = 0.6;
    this.lastEmotion = null;
    this.emotionCallbacks = [];
    
    this.emotionKeywords = {
      joy: ['happy', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'excited'],
      sadness: ['sad', 'unhappy', 'depressed', 'down', 'miserable', 'lonely', 'awful'],
      anger: ['angry', 'furious', 'mad', 'hate', 'terrible', 'disgusting', 'annoyed'],
      fear: ['afraid', 'scared', 'terrified', 'worried', 'anxious', 'nervous'],
      surprise: ['wow', 'amazing', 'shocked', 'surprised', 'unexpected', 'interesting'],
      neutral: []
    };
  }

  /**
   * Analyze text sentiment and return emotion data
   * @param {string} text - Text to analyze
   * @returns {Object} Emotion analysis result
   */
  async analyze(text) {
    if (!text || text.trim().length === 0) {
      return this._createEmotionResult('neutral', 0.5);
    }

    const lowerText = text.toLowerCase();
    const emotions = this._detectEmotions(lowerText);
    const dominantEmotion = this._findDominantEmotion(emotions);
    const confidence = this._calculateConfidence(emotions, dominantEmotion);

    const result = this._createEmotionResult(dominantEmotion, confidence);
    this._bufferEmotion(result);
    
    return result;
  }

  /**
   * Detect emotions from text keywords
   * @private
   */
  _detectEmotions(text) {
    const emotions = {};
    
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 1;
        }
      });
      emotions[emotion] = score;
    });
    
    return emotions;
  }

  /**
   * Find dominant emotion from detection scores
   * @private
   */
  _findDominantEmotion(emotions) {
    const maxEmotion = Object.entries(emotions).reduce(
      ([maxEmotion, maxScore], [emotion, score]) => 
        score > maxScore ? [emotion, score] : [maxEmotion, maxScore],
      ['neutral', 0]
    );
    return maxEmotion[0];
  }

  /**
   * Calculate confidence score for emotion detection
   * @private
   */
  _calculateConfidence(emotions, dominantEmotion) {
    const totalScore = Object.values(emotions).reduce((a, b) => a + b, 0);
    if (totalScore === 0) return 0.5;
    
    const dominantScore = emotions[dominantEmotion];
    return Math.min(1, dominantScore / (totalScore * 0.5));
  }

  /**
   * Create emotion result object
   * @private
   */
  _createEmotionResult(emotion, confidence) {
    return {
      emotion,
      confidence: Math.min(1, Math.max(0, confidence)),
      intensity: confidence,
      timestamp: Date.now(),
      subEmotions: this._getSubEmotions(emotion)
    };
  }

  /**
   * Get sub-emotions based on primary emotion
   * @private
   */
  _getSubEmotions(emotion) {
    const emotionRelations = {
      joy: { happiness: 0.9, excitement: 0.7 },
      sadness: { loneliness: 0.8, depression: 0.6 },
      anger: { frustration: 0.8, irritation: 0.9 },
      fear: { anxiety: 0.85, worry: 0.8 },
      surprise: { amazement: 0.8, wonder: 0.7 },
      neutral: { calm: 0.8, reserved: 0.6 }
    };
    return emotionRelations[emotion] || {};
  }

  /**
   * Buffer emotion for smoothing
   * @private
   */
  _bufferEmotion(result) {
    this.emotionBuffer.push(result);
    if (this.emotionBuffer.length > this.bufferSize) {
      this.emotionBuffer.shift();
    }
    this._notifyCallbacks(result);
  }

  /**
   * Get smoothed emotion from buffer
   */
  getSmoothedEmotion() {
    if (this.emotionBuffer.length === 0) {
      return this._createEmotionResult('neutral', 0.5);
    }

    const emotionScores = {};
    this.emotionBuffer.forEach(item => {
      emotionScores[item.emotion] = (emotionScores[item.emotion] || 0) + item.confidence;
    });

    const dominantEmotion = Object.keys(emotionScores).reduce((a, b) => 
      emotionScores[a] > emotionScores[b] ? a : b
    );

    const avgConfidence = emotionScores[dominantEmotion] / this.emotionBuffer.length;
    return this._createEmotionResult(dominantEmotion, avgConfidence);
  }

  /**
   * Analyze sentiment intensity (0-1 scale)
   */
  getSentimentIntensity() {
    if (this.emotionBuffer.length === 0) return 0.5;
    
    const avgIntensity = this.emotionBuffer.reduce(
      (sum, item) => sum + item.intensity, 0
    ) / this.emotionBuffer.length;
    
    return avgIntensity;
  }

  /**
   * Register callback for emotion changes
   */
  onEmotionChange(callback) {
    this.emotionCallbacks.push(callback);
  }

  /**
   * Notify all callbacks of emotion change
   * @private
   */
  _notifyCallbacks(result) {
    if (result.emotion !== this.lastEmotion) {
      this.lastEmotion = result.emotion;
      this.emotionCallbacks.forEach(callback => callback(result));
    }
  }

  /**
   * Reset service state
   */
  reset() {
    this.emotionBuffer = [];
    this.lastEmotion = null;
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.emotionBuffer = [];
    this.emotionCallbacks = [];
    this.lastEmotion = null;
  }
}

export default AdvancedSentimentAnalysisService;
