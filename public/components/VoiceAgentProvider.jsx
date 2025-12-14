import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import useVoiceAgentAdvanced from './useVoiceAgentAdvanced';

// Create Voice Agent Context
const VoiceAgentContext = createContext(null);

/**
 * VoiceAgentProvider - Wraps application with voice agent functionality
 * Provides unified access to all voice agents across the component tree
 */
export const VoiceAgentProvider = ({ children, defaultAgent = 'audioTour' }) => {
  const voiceAgent = useVoiceAgentAdvanced(defaultAgent);
  const [isInitialized, setIsInitialized] = useState(false);
  const [agents, setAgents] = useState({
    audioTour: { status: 'ready', name: 'AI Audio Tour Agent' },
    customerSupport: { status: 'ready', name: 'Customer Support Agent' },
    voiceRAG: { status: 'ready', name: 'Voice RAG Agent' }
  });

  // Initialize on mount
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        // Check if API is available
        const response = await fetch('/api/voice-agents/health', {
          method: 'GET'
        }).catch(() => null);

        setIsInitialized(true);
      } catch (error) {
        console.warn('Voice agents initialization warning:', error);
        setIsInitialized(true);
      }
    };

    initializeAgents();
  }, []);

  // Get agent status
  const getAgentStatus = useCallback((agentType) => {
    return agents[agentType]?.status || 'unknown';
  }, [agents]);

  // Check if agent is healthy
  const isAgentHealthy = useCallback((agentType) => {
    return getAgentStatus(agentType) === 'ready';
  }, [getAgentStatus]);

  // Get all available agents
  const getAvailableAgents = useCallback(() => {
    return Object.keys(agents).filter(agent => isAgentHealthy(agent));
  }, [agents, isAgentHealthy]);

  const value = {
    // Hook APIs
    ...voiceAgent,
    
    // Provider-specific APIs
    isInitialized,
    agents,
    getAgentStatus,
    isAgentHealthy,
    getAvailableAgents,
    
    // Voice configuration presets
    voicePresets: {
      narrator: { voice: 'nova', speed: 0.95, pitch: 0 },
      assistant: { voice: 'alloy', speed: 1.0, pitch: 0 },
      professional: { voice: 'onyx', speed: 1.1, pitch: 0.5 },
      friendly: { voice: 'shimmer', speed: 1.05, pitch: 0.3 },
      formal: { voice: 'echo', speed: 0.9, pitch: -0.2 }
    }
  };

  return (
    <VoiceAgentContext.Provider value={value}>
      {children}
    </VoiceAgentContext.Provider>
  );
};

/**
 * useVoiceAgent - Hook to access voice agent functionality
 * Must be used within VoiceAgentProvider
 */
export const useVoiceAgent = () => {
  const context = useContext(VoiceAgentContext);
  
  if (!context) {
    throw new Error(
      'useVoiceAgent must be used within a VoiceAgentProvider. ' +
      'Wrap your component tree with <VoiceAgentProvider>'
    );
  }
  
  return context;
};

/**
 * withVoiceAgent - Higher-Order Component for class components
 */
export const withVoiceAgent = (Component) => {
  return (props) => {
    const voiceAgent = useVoiceAgent();
    return <Component {...props} voiceAgent={voiceAgent} />;
  };
};

export default VoiceAgentProvider;
