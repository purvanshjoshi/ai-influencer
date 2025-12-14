// cloudVoiceAPI.js - Unified Voice Agents Integration Service
// Integrates AI Audio Tour, Customer Support Voice, and RAG Voice agents
// Supports multi-provider voice agent orchestration (OpenAI, Anthropic, etc.)

class CloudVoiceAPIService {
  constructor() {
    // Voice agent types configuration
    this.voiceAgents = {
      audioTour: {
        name: 'AI Audio Tour Agent',
        endpoint: '/api/voice-agents/audio-tour',
        description: 'Self-guided audio tour with Architecture, History, Culture, Culinary specialists',
        capabilities: ['multi-agent-orchestration', 'location-aware', 'interest-based-content'],
        configured: false
      },
      customerSupport: {
        name: 'Customer Support Voice Agent',
        endpoint: '/api/voice-agents/customer-support',
        description: 'OpenAI SDK powered voice agent for knowledge base Q&A',
        capabilities: ['knowledge-base-search', 'voice-response', 'document-processing'],
        configured: false
      },
      voiceRAG: {
        name: 'Voice RAG with OpenAI SDK',
        endpoint: '/api/voice-agents/voice-rag',
        description: 'Retrieval-Augmented Generation voice system for PDF Q&A',
        capabilities: ['pdf-processing', 'semantic-search', 'voice-responses'],
        configured: false
      }
    };

    this.currentAgent = 'audioTour';
    this.conversationHistory = [];
    this.maxHistoryLength = 20;
    this.voiceSettings = {
      voice: 'alloy',
      speed: 1.0,
      pitch: 1.0
    };
  }
    };
  }

  setAgentConfig(agentType, config) {
    if (!this.voiceAgents[agentType]) {
      throw new Error(`Unknown voice agent type: ${agentType}`);
    }
    this.voiceAgents[agentType] = {
      ...this.voiceAgents[agentType],
      ...config,
      configured: true
    };
    console.log(`Configured ${this.voiceAgents[agentType].name}`);
    return true;
  }

  isVoiceAgentConfigured(agentType) {
    if (!this.voiceAgents[agentType]) return false;
    return this.voiceAgents[agentType].configured;
  }

  getAllVoiceAgents() {
    return this.voiceAgents;
  }

  getVoiceAgent(agentType) {
    if (!this.voiceAgents[agentType]) {
      throw new Error(`Unknown voice agent type: ${agentType}`);
    }
    return this.voiceAgents[agentType];
  }

  switchVoiceAgent(agentType) {
    if (!this.voiceAgents[agentType]) {
      console.error(`Unknown voice agent: ${agentType}`);
      return false;
    }
    if (!this.isVoiceAgentConfigured(agentType)) {
      console.warn(`Voice agent ${agentType} is not configured`);
      return false;
    }
    this.currentAgent = agentType;
    this.conversationHistory = [];
    console.log(`Switched to ${this.voiceAgents[agentType].name}`);
    return true;
  }

  getCurrentVoiceAgent() {
    return this.voiceAgents[this.currentAgent];
  }

  setVoiceSettings(settings) {
    this.voiceSettings = { ...this.voiceSettings, ...settings };
    return this.voiceSettings;
  }

  getVoiceSettings() {
    return this.voiceSettings;
  }

  async audioTourQuery(location, interests, duration) {
    if (!this.isVoiceAgentConfigured('audioTour')) {
      throw new Error('Audio Tour Agent not configured');
    }
    try {
      const response = await fetch(this.voiceAgents.audioTour.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location, interests, duration,
          voiceSettings: this.voiceSettings
        })
      });
      const data = await response.json();
      this.addToHistory({ type: 'audioTour', location, interests, response: data });
      return data;
    } catch (error) {
      console.error('Audio Tour error:', error);
      throw error;
    }
  }

  async customerSupportQuery(question, knowledgeBase) {
    if (!this.isVoiceAgentConfigured('customerSupport')) {
      throw new Error('Customer Support Agent not configured');
    }
    try {
      const response = await fetch(this.voiceAgents.customerSupport.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question, knowledgeBase,
          voiceSettings: this.voiceSettings,
          conversationHistory: this.conversationHistory
        })
      });
      const data = await response.json();
      this.addToHistory({ type: 'customerSupport', question, response: data });
      return data;
    } catch (error) {
      console.error('Customer Support error:', error);
      throw error;
    }
  }

  async voiceRAGQuery(question, documentPath) {
    if (!this.isVoiceAgentConfigured('voiceRAG')) {
      throw new Error('Voice RAG Agent not configured');
    }
    try {
      const response = await fetch(this.voiceAgents.voiceRAG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question, documentPath,
          voiceSettings: this.voiceSettings,
          conversationHistory: this.conversationHistory
        })
      });
      const data = await response.json();
      this.addToHistory({ type: 'voiceRAG', question, response: data });
      return data;
    } catch (error) {
      console.error('Voice RAG error:', error);
      throw error;
    }
  }

  async voiceQuery(agentType, params) {
    switch (agentType) {
      case 'audioTour':
        return this.audioTourQuery(params.location, params.interests, params.duration);
      case 'customerSupport':
        return this.customerSupportQuery(params.question, params.knowledgeBase);
      case 'voiceRAG':
        return this.voiceRAGQuery(params.question, params.documentPath);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  addToHistory(entry) {
    this.conversationHistory.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearConversationHistory() {
    this.conversationHistory = [];
  }
}

const cloudVoiceAPI = new CloudVoiceAPIService();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = cloudVoiceAPI;
}

if (typeof window !== 'undefined') {
  window.cloudVoiceAPI = cloudVoiceAPI;
}
