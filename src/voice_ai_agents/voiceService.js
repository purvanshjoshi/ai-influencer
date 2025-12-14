/**
 * Voice Service - Text-to-Speech Integration Layer
 * Handles conversion of influencer posts to audio URLs using OpenAI TTS
 * Fallback to stub generation for development
 */

const axios = require('axios');

class VoiceService {
  constructor(provider = 'openai-tts') {
    this.provider = provider;
    this.apiKey = process.env.OPENAI_API_KEY || null;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Convert text to speech
   * @param {string} text - Text to convert
   * @param {string} voiceId - OpenAI voice: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
   * @returns {Promise<{audioUrl: string, duration: number}>}
   */
  async textToSpeech(text, voiceId = 'alloy') {
    try {
      if (this.provider === 'openai-tts' && this.apiKey) {
        return await this._generateWithOpenAI(text, voiceId);
      }
      return this._generateStub(text);
    } catch (error) {
      console.error('Voice Service Error:', error.message);
      return this._generateStub(text);
    }
  }

  async _generateWithOpenAI(text, voiceId) {
    const response = await axios.post(
      `${this.baseUrl}/audio/speech`,
      {
        model: 'tts-1-hd',
        input: text.substring(0, 4096),
        voice: voiceId
      },
      { headers: { Authorization: `Bearer ${this.apiKey}` }, responseType: 'arraybuffer' }
    );
    const base64 = Buffer.from(response.data).toString('base64');
    return {
      audioUrl: `data:audio/mp3;base64,${base64}`,
      duration: Math.ceil(text.split(' ').length / 3),
      provider: 'openai-tts'
    };
  }

  _generateStub(text) {
    const duration = Math.ceil(text.split(' ').length / 3);
    return {
      audioUrl: `https://audio.example.com/stub/${Date.now()}.mp3`,
      duration,
      provider: 'stub'
    };
  }
}

module.exports = VoiceService;
