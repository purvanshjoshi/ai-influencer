// useVoiceAgentAdvanced.js - Custom React hook for voice agents integration
import { useState, useCallback, useEffect } from 'react';

// Hook for managing voice agent interactions
export const useVoiceAgentAdvanced = (initialAgent = 'audioTour') => {
  const [currentAgent, setCurrentAgent] = useState(initialAgent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'alloy',
    speed: 1.0,
    pitch: 1.0
  });
  const [conversationHistory, setConversationHistory] = useState([]);

  // Audio Tour Query
  const audioTourQuery = useCallback(async (location, interests, duration) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/voice-agents/audio-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, interests, duration, voiceSettings })
      });
      const data = await res.json();
      setResponse(data);
      setConversationHistory(prev => [...prev, { type: 'audioTour', data }]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [voiceSettings]);

  // Customer Support Query
  const customerSupportQuery = useCallback(async (question, knowledgeBase) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/voice-agents/customer-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          knowledgeBase,
          voiceSettings,
          conversationHistory
        })
      });
      const data = await res.json();
      setResponse(data);
      setConversationHistory(prev => [...prev, { type: 'customerSupport', data }]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [voiceSettings, conversationHistory]);

  // Voice RAG Query
  const voiceRAGQuery = useCallback(async (question, documentPath) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/voice-agents/voice-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          documentPath,
          voiceSettings,
          conversationHistory
        })
      });
      const data = await res.json();
      setResponse(data);
      setConversationHistory(prev => [...prev, { type: 'voiceRAG', data }]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [voiceSettings, conversationHistory]);

  // Update voice settings
  const updateVoiceSettings = useCallback((newSettings) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setResponse(null);
  }, []);

  // Switch agent
  const switchAgent = useCallback((agentType) => {
    setCurrentAgent(agentType);
    setConversationHistory([]);
  }, []);

  return {
    currentAgent,
    switchAgent,
    audioTourQuery,
    customerSupportQuery,
    voiceRAGQuery,
    isLoading,
    error,
    response,
    voiceSettings,
    updateVoiceSettings,
    conversationHistory,
    clearHistory
  };
};

export default useVoiceAgentAdvanced;
