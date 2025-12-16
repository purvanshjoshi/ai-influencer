/**
 * LipSyncService.js
 * Phoneme-based lip-sync animation service
 */

class LipSyncService {
  constructor() {
    this.visemeMap = {
      'p': 'closed', 'b': 'closed', 'm': 'closed',
      'f': 'teeth', 'v': 'teeth',
      't': 'teeth', 'd': 'teeth', 's': 'teeth', 'z': 'teeth',
      'n': 'teeth', 'l': 'teeth',
      'a': 'open', 'e': 'open', 'i': 'open', 'o': 'open', 'u': 'open',
      'r': 'rounded', 'w': 'rounded',
      'j': 'open', 'y': 'open'
    };
    
    this.phonemeFrames = {};
    this.frameRate = 25; // ms per frame
    this.currentViseme = 'neutral';
    this.visemeCallbacks = [];
  }

  /**
   * Generate lip-sync frames from text
   * @param {string} text - Text to animate
   * @param {number} duration - Total duration in milliseconds
   */
  generateFrames(text, duration) {
    const phonemes = this._textToPhonemes(text);
    const totalFrames = Math.ceil(duration / this.frameRate);
    const framesPerPhoneme = Math.max(1, Math.floor(totalFrames / phonemes.length));
    
    const frames = [];
    let frameIndex = 0;
    
    phonemes.forEach((phoneme, index) => {
      const viseme = this._phonemeToViseme(phoneme);
      const transitionFrames = index === 0 ? framesPerPhoneme : Math.ceil(framesPerPhoneme * 0.7);
      
      for (let i = 0; i < transitionFrames && frameIndex < totalFrames; i++) {
        frames.push({
          frameIndex,
          viseme,
          shape: this._getVisemeShape(viseme),
          intensity: Math.min(1, (i + 1) / transitionFrames),
          timestamp: frameIndex * this.frameRate
        });
        frameIndex++;
      }
    });
    
    // Fill remaining frames with neutral
    while (frameIndex < totalFrames) {
      frames.push({
        frameIndex,
        viseme: 'neutral',
        shape: this._getVisemeShape('neutral'),
        intensity: 0.5,
        timestamp: frameIndex * this.frameRate
      });
      frameIndex++;
    }
    
    return frames;
  }

  /**
   * Convert text to phoneme array
   * @private
   */
  _textToPhonemes(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .split('')
      .filter(char => char !== ' ');
  }

  /**
   * Map phoneme to viseme (mouth shape)
   * @private
   */
  _phonemeToViseme(phoneme) {
    return this.visemeMap[phoneme] || 'neutral';
  }

  /**
   * Get mouth shape configuration for viseme
   * @private
   */
  _getVisemeShape(viseme) {
    const shapes = {
      'closed': { scaleY: 0.3, scaleX: 0.8 },
      'open': { scaleY: 0.8, scaleX: 0.9 },
      'teeth': { scaleY: 0.5, scaleX: 0.7 },
      'rounded': { scaleY: 0.6, scaleX: 0.5 },
      'neutral': { scaleY: 0.4, scaleX: 0.8 }
    };
    return shapes[viseme] || shapes['neutral'];
  }

  /**
   * Sync animation with audio timing
   * @param {AudioBuffer} audioBuffer - Audio data
   * @param {Array} frames - Animation frames
   */
  syncWithAudio(audioBuffer, frames) {
    if (!audioBuffer || !frames) return frames;
    
    const audioFrames = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const msPerSample = 1000 / sampleRate;
    
    return frames.map(frame => ({
      ...frame,
      audioLevel: this._getAudioLevelAtTime(audioFrames, frame.timestamp, msPerSample)
    }));
  }

  /**
   * Get audio level at specific timestamp
   * @private
   */
  _getAudioLevelAtTime(audioData, timestamp, msPerSample) {
    const sampleIndex = Math.floor(timestamp / msPerSample);
    if (sampleIndex < 0 || sampleIndex >= audioData.length) return 0;
    return Math.abs(audioData[sampleIndex]);
  }

  /**
   * Blend between two visemes
   * @param {string} startViseme - Starting viseme
   * @param {string} endViseme - Ending viseme
   * @param {number} blendFactor - Blend factor (0-1)
   */
  blendVisemes(startViseme, endViseme, blendFactor) {
    const startShape = this._getVisemeShape(startViseme);
    const endShape = this._getVisemeShape(endViseme);
    
    return {
      scaleX: startShape.scaleX + (endShape.scaleX - startShape.scaleX) * blendFactor,
      scaleY: startShape.scaleY + (endShape.scaleY - startShape.scaleY) * blendFactor
    };
  }

  /**
   * Register callback for viseme changes
   */
  onVisemeChange(callback) {
    this.visemeCallbacks.push(callback);
  }

  /**
   * Notify viseme change
   */
  _notifyVisemeChange(viseme, shape) {
    this.currentViseme = viseme;
    this.visemeCallbacks.forEach(cb => cb({ viseme, shape }));
  }

  /**
   * Validate frame sequence
   */
  validateFrames(frames) {
    if (!Array.isArray(frames) || frames.length === 0) {
      return { valid: false, errors: ['No frames provided'] };
    }
    
    const errors = [];
    frames.forEach((frame, index) => {
      if (!frame.viseme) errors.push(`Frame ${index}: missing viseme`);
      if (!frame.shape) errors.push(`Frame ${index}: missing shape`);
      if (frame.intensity < 0 || frame.intensity > 1) {
        errors.push(`Frame ${index}: invalid intensity`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Reset service
   */
  reset() {
    this.currentViseme = 'neutral';
    this.visemeCallbacks = [];
  }

  /**
   * Dispose
   */
  dispose() {
    this.visemeCallbacks = [];
    this.currentViseme = 'neutral';
  }
}

export default LipSyncService;
