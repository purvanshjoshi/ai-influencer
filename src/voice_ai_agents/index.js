/**
 * Voice AI Agents Module - Main entry point
 * Coordinates text-to-speech, voice RAG, and customer support agents
 */

const VoiceService = require('./voiceService');
const AudioTourAgent = require('./audioTourAgent');
const VoiceRAGAgent = require('./voiceRAGAgent');
const CustomerSupportAgent = require('./customerSupportAgent');

module.exports = {
  VoiceService,
  AudioTourAgent,
  VoiceRAGAgent,
  CustomerSupportAgent,
  
  /**
   * Initialize all voice AI agents with config
   */
  initializeAgents: (config = {}) => {
    return {
      voiceService: new VoiceService(config.ttsProvider || 'openai-tts'),
      audioTour: new AudioTourAgent(config),
      voiceRAG: new VoiceRAGAgent(config),
      supportAgent: new CustomerSupportAgent(config)
    };
  }
};
