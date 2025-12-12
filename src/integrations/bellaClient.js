/**
 * Bella LLM Client
 * Handles all communication with Bella API for AI influencer generation
 */

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

class BellaClient {
  constructor() {
    this.apiKey = process.env.BELLA_API_KEY;
    this.apiUrl = process.env.BELLA_API_URL || 'https://api.bella-ai.com/v1';
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generate content using Bella LLM
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generated content
   */
  async generateContent(params) {
    try {
      const response = await this.client.post('/generate', {
        prompt: params.prompt,
        personality: params.personality,
        style: params.style,
        maxTokens: params.maxTokens || 500,
        temperature: params.temperature || 0.7
      });
      return response.data;
    } catch (error) {
      console.error('Bella generation error:', error.message);
      throw error;
    }
  }

  /**
   * Create AI influencer profile
   * @param {Object} profileData - Influencer profile information
   * @returns {Promise<Object>} Created profile
   */
  async createInfluencerProfile(profileData) {
    try {
      const response = await this.client.post('/influencers', {
        name: profileData.name,
        niche: profileData.niche,
        personality: profileData.personality,
        tone: profileData.tone,
        audience: profileData.audience
      });
      return response.data;
    } catch (error) {
      console.error('Profile creation error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze engagement metrics
   * @param {string} influencerId - Influencer ID
   * @returns {Promise<Object>} Engagement metrics
   */
  async getEngagementMetrics(influencerId) {
    try {
      const response = await this.client.get(`/influencers/${influencerId}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Metrics fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Optimize content for platform
   * @param {Object} contentData - Content and platform info
   * @returns {Promise<Object>} Optimized content
   */
  async optimizeContent(contentData) {
    try {
      const response = await this.client.post('/optimize', {
        content: contentData.content,
        platform: contentData.platform,
        audience: contentData.audience,
        goals: contentData.goals
      });
      return response.data;
    } catch (error) {
      console.error('Content optimization error:', error.message);
      throw error;
    }
  }
}

module.exports = new BellaClient();
