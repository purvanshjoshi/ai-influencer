/**
 * Voice Generation Service - PHASE 2
 * Handles creating and managing voice assets for influencer posts
 * Orchestrates calls to Flask Python services
 */

const axios = require('axios');
const VoiceProfile = require('../models/VoiceProfile');
const logger = require('../utils/logger');

const VOICE_API_BASE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:5000';

class VoiceGenerationService {
  /**
   * Generate audio tour for influencer's post
   */
  static async generateAudioTour(influencerId, location, interests, duration, voice) {
    try {
      // Get or create voice profile
      let voiceProfile = await VoiceProfile.findOne({ influencerId });
      if (!voiceProfile) {
        voiceProfile = new VoiceProfile({ influencerId });
      }

      // Call Flask audio tour service
      const response = await axios.post(
        `${VOICE_API_BASE_URL}/api/voice/audio-tour/generate`,
        {
          location,
          interests: interests || ['history', 'culture'],
          duration: duration || 30,
          voice: voice || 'nova'
        },
        { timeout: 60000 }
      );

      // Store audio asset in voice profile
      const audioAsset = {
        url: response.data.audioUrl,
        location: location,
        createdAt: new Date(),
        duration: response.data.estimatedDuration,
        views: 0
      };

      voiceProfile.assets.audioTourUrls.push(audioAsset);
      await voiceProfile.enableAudioTour(location, interests, duration, voice);

      logger.info(`Audio tour generated for influencer ${influencerId} at ${location}`);
      return { success: true, data: response.data, assetId: audioAsset._id };

    } catch (error) {
      logger.error(`Audio tour generation failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize customer support agent for influencer
   */
  static async initializeSupportAgent(influencerId, documentationUrl, voice) {
    try {
      let voiceProfile = await VoiceProfile.findOne({ influencerId });
      if (!voiceProfile) {
        voiceProfile = new VoiceProfile({ influencerId });
      }

      // Call Flask support service
      const response = await axios.post(
        `${VOICE_API_BASE_URL}/api/voice/customer-support/initialize`,
        {
          documentationUrl,
          voice: voice || 'nova'
        },
        { timeout: 120000 }
      );

      // Update voice profile
      await voiceProfile.enableSupportAgent(response.data.agentId, documentationUrl);
      voiceProfile.supportAgent.voice = voice || 'nova';
      voiceProfile.supportAgent.documentsProcessed = response.data.documentsProcessed || 0;
      await voiceProfile.save();

      logger.info(`Support agent initialized for influencer ${influencerId}`);
      return { success: true, data: response.data };

    } catch (error) {
      logger.error(`Support agent initialization failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process support query and get voice response
   */
  static async querySupport(influencerId, question, voice) {
    try {
      const voiceProfile = await VoiceProfile.findOne({ influencerId });
      if (!voiceProfile?.supportAgent.enabled) {
        return { success: false, error: 'Support agent not initialized' };
      }

      // Call Flask support service
      const response = await axios.post(
        `${VOICE_API_BASE_URL}/api/voice/customer-support/query`,
        {
          question,
          agentId: voiceProfile.supportAgent.agentId,
          voice: voice || voiceProfile.preferences.defaultVoice
        },
        { timeout: 30000 }
      );

      // Store response
      const supportResponse = {
        responseId: response.data.queryId,
        audioUrl: response.data.audioUrl,
        question,
        answer: response.data.answer,
        createdAt: new Date(),
        confidence: response.data.confidence
      };

      voiceProfile.assets.supportResponses.push(supportResponse);
      voiceProfile.supportAgent.queriesHandled += 1;
      await voiceProfile.save();

      logger.info(`Support query processed for influencer ${influencerId}`);
      return { success: true, data: { ...response.data, storedResponseId: supportResponse.responseId } };

    } catch (error) {
      logger.error(`Support query failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload document for RAG system
   */
  static async uploadRAGDocument(influencerId, fileBuffer, fileName, voice) {
    try {
      let voiceProfile = await VoiceProfile.findOne({ influencerId });
      if (!voiceProfile) {
        voiceProfile = new VoiceProfile({ influencerId });
      }

      if (!voiceProfile.ragSystem.enabled) {
        await voiceProfile.enableRAGSystem();
      }

      // Call Flask RAG service
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), fileName);
      formData.append('documentName', fileName.split('.')[0]);

      const response = await axios.post(
        `${VOICE_API_BASE_URL}/api/voice/rag/upload`,
        formData,
        { timeout: 60000 }
      );

      // Add document to voice profile
      await voiceProfile.addRAGDocument(
        response.data.documentId,
        fileName,
        response.data.chunksCreated
      );

      logger.info(`RAG document uploaded for influencer ${influencerId}`);
      return { success: true, data: response.data };

    } catch (error) {
      logger.error(`RAG document upload failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Query RAG system for voice response
   */
  static async queryRAG(influencerId, question, documentId, voice) {
    try {
      const voiceProfile = await VoiceProfile.findOne({ influencerId });
      if (!voiceProfile?.ragSystem.enabled) {
        return { success: false, error: 'RAG system not initialized' };
      }

      const response = await axios.post(
        `${VOICE_API_BASE_URL}/api/voice/rag/query`,
        {
          question,
          documentId,
          voice: voice || voiceProfile.preferences.defaultVoice
        },
        { timeout: 30000 }
      );

      // Store response
      const ragResponse = {
        responseId: response.data.queryId,
        audioUrl: response.data.audioUrl,
        question,
        answer: response.data.answer,
        documentId,
        createdAt: new Date(),
        similarity: response.data.similarity
      };

      voiceProfile.assets.ragResponses.push(ragResponse);
      await voiceProfile.save();

      logger.info(`RAG query processed for influencer ${influencerId}`);
      return { success: true, data: { ...response.data, storedResponseId: ragResponse.responseId } };

    } catch (error) {
      logger.error(`RAG query failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get voice profile analytics
   */
  static async getAnalytics(influencerId) {
    try {
      const voiceProfile = await VoiceProfile.findOne({ influencerId });
      if (!voiceProfile) {
        return { success: false, error: 'Voice profile not found' };
      }

      return {
        success: true,
        data: {
          audioTours: voiceProfile.audioTour.locations.length,
          totalAudioPlays: voiceProfile.analytics.totalAudioPlays,
          supportQueries: voiceProfile.supportAgent.queriesHandled,
          ragDocuments: voiceProfile.ragSystem.totalDocuments,
          serviceStatus: voiceProfile.status,
          preferences: voiceProfile.preferences
        }
      };
    } catch (error) {
      logger.error(`Analytics retrieval failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = VoiceGenerationService;
