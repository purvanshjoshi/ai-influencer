// VoiceEmotionMappingService.js
// Maps voice features to emotional states for avatar expression

import AdvancedSentimentAnalysisService from './AdvancedSentimentAnalysisService';
import EmotionDetectionService from './EmotionDetectionService';

class VoiceEmotionMappingService {
  constructor() {
    this.sentimentService = new AdvancedSentimentAnalysisService();
    this.emotionService = new EmotionDetectionService();
    
    // Emotion intensity mapping curves
    this.emotionIntensityMap = {
      joy: { min: 0.6, max: 1.0, falloff: 0.8 },
      sadness: { min: 0.5, max: 1.0, falloff: 0.9 },
      anger: { min: 0.7, max: 1.0, falloff: 0.85 },
      surprise: { min: 0.5, max: 0.95, falloff: 0.7 },
      fear: { min: 0.6, max: 0.95, falloff: 0.88 },
      disgust: { min: 0.55, max: 1.0, falloff: 0.87 },
      neutral: { min: 0.0, max: 0.4, falloff: 0.6 }
    };
    
    // Voice feature thresholds
    this.voiceFeatureThresholds = {
      pitchVariance: { low: 0.5, high: 0.8 },
      energy: { low: 0.4, high: 0.9 },
      speechRate: { slow: 0.5, fast: 0.8 },
      voiceQuality: { clear: 0.7, strained: 0.3 }
    };
  }

  async analyzeVoiceFeatures(audioData) {
    try {
      // Extract voice features from audio
      const features = this.extractVoiceFeatures(audioData);
      
      // Analyze sentiment from audio
      const sentiment = await this.sentimentService.analyzeSentiment(audioData);
      
      // Detect emotions from voice
      const detectedEmotions = await this.emotionService.detectEmotions(audioData);
      
      return {
        features,
        sentiment,
        emotions: detectedEmotions
      };
    } catch (error) {
      console.error('Error analyzing voice features:', error);
      return null;
    }
  }

  extractVoiceFeatures(audioData) {
    // Calculate pitch variance
    const pitchVariance = this.calculatePitchVariance(audioData);
    
    // Calculate energy level
    const energy = this.calculateEnergy(audioData);
    
    // Calculate speech rate
    const speechRate = this.calculateSpeechRate(audioData);
    
    // Assess voice quality
    const voiceQuality = this.assessVoiceQuality(audioData);
    
    // Calculate vibrato and tremolo
    const vibrato = this.detectVibrato(audioData);
    
    return {
      pitchVariance,
      energy,
      speechRate,
      voiceQuality,
      vibrato,
      timestamp: Date.now()
    };
  }

  calculatePitchVariance(audioData) {
    // Simplified pitch variance calculation
    // In production, use FFT and autocorrelation for accuracy
    const fft = this.performFFT(audioData);
    const frequencies = this.extractFrequencies(fft);
    
    if (frequencies.length < 2) return 0;
    
    const mean = frequencies.reduce((a, b) => a + b) / frequencies.length;
    const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / frequencies.length;
    
    return Math.sqrt(variance) / mean; // Normalized variance
  }

  calculateEnergy(audioData) {
    // RMS energy calculation
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    return Math.min(1, rms * 10); // Normalize to 0-1 range
  }

  calculateSpeechRate(audioData) {
    // Detect zero-crossings to estimate speech rate
    let crossings = 0;
    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] >= 0 && audioData[i - 1] < 0) ||
          (audioData[i] < 0 && audioData[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    // Normalize: typical speech rate is 150-300 words per minute
    const samplingRate = 44100; // Hz
    const speechRateHz = (crossings / audioData.length) * samplingRate;
    
    return Math.min(1, speechRateHz / 1000); // Normalize
  }

  assessVoiceQuality(audioData) {
    // Analyze harmonic structure and noise floor
    const harmonic = this.analyzeHarmonics(audioData);
    const noiseRatio = this.calculateNoiseRatio(audioData);
    
    const quality = (harmonic - noiseRatio) / 2;
    return Math.max(0, Math.min(1, quality));
  }

  detectVibrato(audioData) {
    // Detect modulation in amplitude
    const envelope = this.extractEnvelope(audioData);
    const modulation = this.analyzeModulation(envelope);
    
    return {
      present: modulation > 0.3,
      rate: modulation,
      depth: this.estimateVibratoDepth(audioData)
    };
  }

  mapVoiceToEmotion(voiceFeatures, sentiment) {
    const emotionScores = {};
    
    // Positive sentiment indicators
    if (sentiment.score > 0.5) {
      emotionScores.joy = Math.min(1, (voiceFeatures.energy * 0.5) + (sentiment.score * 0.5));
    }
    
    // Negative sentiment with high energy = anger
    if (sentiment.score < -0.5 && voiceFeatures.energy > 0.6) {
      emotionScores.anger = Math.min(1, Math.abs(sentiment.score) * 0.7 + voiceFeatures.energy * 0.3);
    }
    
    // Negative sentiment with low energy = sadness
    if (sentiment.score < -0.3 && voiceFeatures.energy < 0.5) {
      emotionScores.sadness = Math.min(1, Math.abs(sentiment.score) * 0.8 + (1 - voiceFeatures.energy) * 0.2);
    }
    
    // High pitch variance + low energy = surprise or fear
    if (voiceFeatures.pitchVariance > 0.7 && voiceFeatures.energy < 0.6) {
      emotionScores.surprise = Math.min(1, voiceFeatures.pitchVariance * 0.6 + 0.3);
    }
    
    // Low pitch variance + stable = neutral
    if (voiceFeatures.pitchVariance < 0.3 && Math.abs(sentiment.score) < 0.2) {
      emotionScores.neutral = 0.9;
    }
    
    // Normalize scores
    const total = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(emotionScores).forEach(emotion => {
        emotionScores[emotion] /= total;
      });
    } else {
      emotionScores.neutral = 1;
    }
    
    return emotionScores;
  }

  getEmotionIntensity(emotion, confidence) {
    const mapping = this.emotionIntensityMap[emotion] || this.emotionIntensityMap.neutral;
    
    if (confidence < 0.3) return mapping.min;
    if (confidence > 0.8) return mapping.max;
    
    // Smooth interpolation
    const t = (confidence - 0.3) / 0.5;
    return mapping.min + (mapping.max - mapping.min) * Math.pow(t, mapping.falloff);
  }

  // Helper methods for audio analysis
  performFFT(audioData) {
    // Placeholder for FFT implementation
    // In production, use Web Audio API or a library like Essentia.js
    return audioData; // Simplified
  }

  extractFrequencies(fft) {
    // Extract dominant frequencies from FFT
    return [];
  }

  analyzeHarmonics(audioData) {
    // Analyze harmonic content
    return 0.7; // Placeholder
  }

  calculateNoiseRatio(audioData) {
    // Calculate noise floor ratio
    return 0.2; // Placeholder
  }

  extractEnvelope(audioData) {
    // Extract amplitude envelope
    return audioData;
  }

  analyzeModulation(envelope) {
    // Analyze amplitude modulation
    return 0.5; // Placeholder
  }

  estimateVibratoDepth(audioData) {
    // Estimate vibrato depth in cents
    return 50; // Placeholder: 50 cents
  }

  async processRealTimeAudio(audioStream) {
    try {
      const features = this.extractVoiceFeatures(audioStream);
      const sentiment = await this.sentimentService.analyzeSentiment(audioStream);
      const emotionScores = this.mapVoiceToEmotion(features, sentiment);
      
      // Get dominant emotion
      const dominantEmotion = Object.keys(emotionScores).reduce((a, b) => 
        emotionScores[a] > emotionScores[b] ? a : b
      );
      
      const intensity = this.getEmotionIntensity(dominantEmotion, emotionScores[dominantEmotion]);
      
      return {
        primaryEmotion: dominantEmotion,
        confidence: emotionScores[dominantEmotion],
        intensity,
        allEmotions: emotionScores,
        voiceFeatures: features,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error processing real-time audio:', error);
      return null;
    }
  }
}

export default new VoiceEmotionMappingService();
