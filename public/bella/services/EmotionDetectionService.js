/**
 * EmotionDetectionService.js
 * Handles sentiment analysis and emotion detection for Bella avatar
 * Maps text/voice input to emotional states and corresponding animations
 */

class EmotionDetectionService {
  constructor(config = {}) {
    this.config = {
      sentimentThreshold: 0.5,
      enableLogging: false,
      emotionScale: 'quinenary', // fine-grained emotion scale
      ...config
    };

    // Emotion intensity levels
    this.emotionLevels = {
      neutral: 0,
      slight: 0.2,
      moderate: 0.5,
      strong: 0.8,
      extreme: 1.0
    };

    // Comprehensive emotion keywords mapping
    this.emotionKeywords = {
      happy: [
        'happy', 'joy', 'joyful', 'cheerful', 'great', 'wonderful', 'amazing',
        'fantastic', 'excellent', 'love', 'blessed', 'grateful', 'proud',
        'excited', 'thrilled', 'delighted', 'pleased', 'satisfied'
      ],
      sad: [
        'sad', 'unhappy', 'depressed', 'disappointed', 'sorrowful', 'grief',
        'sorry', 'regret', 'miss', 'lonely', 'heartbroken', 'devastated',
        'miserable', 'awful', 'terrible', 'worse', 'lost', 'troubled'
      ],
      angry: [
        'angry', 'furious', 'rage', 'mad', 'irritated', 'frustrated',
        'annoyed', 'enraged', 'livid', 'upset', 'aggravated', 'bitter',
        'resentful', 'disgusted', 'hateful', 'hostile'
      ],
      surprised: [
        'surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'wow',
        'unexpected', 'unbelievable', 'incredible', 'surprising',
        'startled', 'astounded'
      ],
      confused: [
        'confused', 'bewildered', 'perplexed', 'puzzled', 'uncertain',
        'unsure', 'unclear', 'unclear', 'lost', 'questioning',
        'disoriented', 'foggy', 'hazy', 'ambiguous'
      ],
      afraid: [
        'afraid', 'scared', 'terrified', 'frightened', 'fear', 'anxious',
        'nervous', 'worried', 'panic', 'dread', 'uneasy', 'apprehensive',
        'intimidated', 'startled'
      ],
      calm: [
        'calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'cool',
        'composed', 'patient', 'understanding', 'thoughtful', 'mindful'
      ]
    };

    // Negation words (modify sentiment)
    this.negationWords = [
      'not', 'no', 'never', 'nor', 'neither', 'none', 'nothing',
      'nowhere', "isn't", "doesn't", "didn't", "won't", "can't"
    ];

    // Intensifiers
    this.intensifiers = {
      very: 1.2,
      so: 1.2,
      extremely: 1.4,
      incredibly: 1.4,
      absolutely: 1.5,
      really: 1.1,
      quite: 1.1,
      rather: 1.1,
      somewhat: 0.8,
      a_bit: 0.7,
      slightly: 0.7
    };
  }

  /**
   * Detect emotion from text
   * Returns emotion object with type, confidence, and intensity
   */
  detectEmotion(text) {
    if (!text || typeof text !== 'string') {
      return this.createEmotionResult('neutral', 0.5, 0);
    }

    const cleanText = text.toLowerCase().trim();
    const words = cleanText.split(/\s+/);
    
    // Score each emotion category
    const emotionScores = {};
    
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      emotionScores[emotion] = this.calculateEmotionScore(words, keywords);
    }

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionScores).reduce(
      (max, [emotion, score]) => score > max.score ? { emotion, score } : max,
      { emotion: 'neutral', score: 0 }
    );

    // Calculate intensity based on word strength and repetition
    const intensity = this.calculateIntensity(words, dominantEmotion.emotion);
    const confidence = Math.min(dominantEmotion.score, 1.0);

    return this.createEmotionResult(
      dominantEmotion.emotion,
      confidence,
      intensity
    );
  }

  /**
   * Calculate emotion score based on keyword matches
   */
  calculateEmotionScore(words, keywords) {
    let score = 0;
    let negationActive = false;
    let intensifierMultiplier = 1.0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check for intensifiers
      if (this.intensifiers[word]) {
        intensifierMultiplier = this.intensifiers[word];
        continue;
      }

      // Check for negation
      if (this.negationWords.includes(word)) {
        negationActive = true;
        intensifierMultiplier = 1.0;
        continue;
      }

      // Check if word matches emotion keywords
      if (keywords.includes(word)) {
        let wordScore = 1.0 * intensifierMultiplier;
        if (negationActive) {
          wordScore *= -0.5; // Negation reduces emotion score
          negationActive = false;
        }
        score += wordScore;
        intensifierMultiplier = 1.0;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Calculate intensity level (0-1) based on emotional signals
   */
  calculateIntensity(words, emotion) {
    let intensity = 0.5; // Default moderate intensity
    let exclamationCount = 0;
    let capsCount = 0;
    let emotionKeywordCount = 0;

    const keywords = this.emotionKeywords[emotion] || [];
    const rawText = words.join(' ');

    // Punctuation analysis
    exclamationCount = (rawText.match(/!/g) || []).length;
    const questionCount = (rawText.match(/\?/g) || []).length;
    capsCount = (rawText.match(/[A-Z]/g) || []).length;

    // Keyword count
    for (const word of words) {
      if (keywords.includes(word)) {
        emotionKeywordCount++;
      }
    }

    // Calculate intensity
    intensity = Math.min(1.0, (
      (emotionKeywordCount * 0.3) +
      (exclamationCount * 0.2) +
      (questionCount * 0.1) +
      (capsCount / words.length * 0.2) +
      0.2
    ));

    return Math.max(0, Math.min(1.0, intensity));
  }

  /**
   * Create standardized emotion result object
   */
  createEmotionResult(emotion, confidence, intensity) {
    return {
      emotion,
      confidence: Math.max(0, Math.min(1.0, confidence)),
      intensity: Math.max(0, Math.min(1.0, intensity)),
      timestamp: Date.now(),
      label: this.getEmotionLabel(emotion, intensity)
    };
  }

  /**
   * Get human-readable emotion label with intensity
   */
  getEmotionLabel(emotion, intensity) {
    let prefix = '';
    if (intensity < 0.3) prefix = 'Slightly ';
    else if (intensity < 0.6) prefix = 'Moderately ';
    else if (intensity < 0.85) prefix = 'Very ';
    else prefix = 'Extremely ';

    return prefix + emotion.charAt(0).toUpperCase() + emotion.slice(1);
  }

  /**
   * Map detected emotion to animation name from config
   */
  mapEmotionToAnimation(emotion, animationMap = {}) {
    const defaultMap = {
      happy: 'happy',
      sad: 'sad',
      angry: 'sad', // Use sad for angry expressions
      surprised: 'happy',
      confused: 'thinking',
      afraid: 'sad',
      calm: 'idle',
      neutral: 'idle'
    };

    const finalMap = { ...defaultMap, ...animationMap };
    return finalMap[emotion] || 'idle';
  }

  /**
   * Batch process multiple text inputs
   */
  analyzeMultiple(textArray) {
    return textArray.map(text => this.detectEmotion(text));
  }

  /**
   * Get emotion trends over time
   */
  analyzeEmotionTrend(textArray) {
    const emotions = this.analyzeMultiple(textArray);
    const emotionCounts = {};
    let averageIntensity = 0;

    emotions.forEach(result => {
      emotionCounts[result.emotion] = (emotionCounts[result.emotion] || 0) + 1;
      averageIntensity += result.intensity;
    });

    averageIntensity /= emotions.length;

    return {
      dominantEmotion: Object.entries(emotionCounts).reduce(
        (max, [emotion, count]) => count > max.count ? { emotion, count } : max,
        { emotion: 'neutral', count: 0 }
      ).emotion,
      emotionDistribution: emotionCounts,
      averageIntensity,
      emotionSequence: emotions.map(e => e.emotion)
    };
  }
}

export default EmotionDetectionService;
