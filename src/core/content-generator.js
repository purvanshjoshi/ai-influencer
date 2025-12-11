const axios = require('axios');

class ContentGenerator {
  constructor(influencerPersonality) {
    this.personality = influencerPersonality;
    this.templates = {};
  }

  async generateContent(topic, contentType = 'post') {
    try {
      const prompt = this.buildContentPrompt(topic, contentType);
      const response = await axios.post('/api/generate', {
        prompt: prompt,
        maxTokens: 280,
        temperature: 0.8
      });
      return this.formatContent(response.data.text, contentType);
    } catch (error) {
      console.error('Content generation failed:', error);
      throw error;
    }
  }

  buildContentPrompt(topic, contentType) {
    return `Generate ${contentType} content about ${topic} for an AI influencer with ${this.personality.personality} personality`;
  }

  formatContent(text, contentType) {
    return {
      type: contentType,
      content: text,
      timestamp: new Date(),
      engagementScore: 0,
      likes: 0,
      comments: 0
    };
  }

  async generateMultipleVariations(topic, count = 3) {
    const variations = [];
    for (let i = 0; i < count; i++) {
      const content = await this.generateContent(topic);
      variations.push(content);
    }
    return variations;
  }
}

module.exports = ContentGenerator;
