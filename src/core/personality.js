const axios = require('axios');

class InfluencerPersonality {
  constructor(config) {
    this.name = config.name;
    this.personality = config.personality || 'neutral';
    this.tone = config.tone || 'professional';
    this.audience = config.audience || 'general';
    this.niche = config.niche || 'lifestyle';
  }

  async initialize() {
    this.systemPrompt = this.buildSystemPrompt();
    return true;
  }

  buildSystemPrompt() {
    return `You are ${this.name}, an AI influencer with a ${this.personality} personality. Tone: ${this.tone}`;
  }

  async generatePersonalityResponse(input) {
    try {
      const response = await axios.post('/api/generate', {
        prompt: input,
        systemPrompt: this.systemPrompt,
        temperature: 0.7
      });
      return response.data.text;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  getPersonalityProfile() {
    return {
      name: this.name,
      personality: this.personality,
      tone: this.tone,
      audience: this.audience
    };
  }
}

module.exports = InfluencerPersonality;
