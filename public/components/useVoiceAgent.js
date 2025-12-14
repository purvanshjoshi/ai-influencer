import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useVoiceAgent = (agentType) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [history, setHistory] = useState([]);
  const abortControllerRef = useRef(null);

  const generateVoice = useCallback(async (text, agentId, config = {}) => {
    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/api/voice/${agentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          agent_id: agentId,
          config,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setVoiceData(data);
      setHistory(prev => [...prev, { text, timestamp: new Date(), data }]);
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Voice generation error:', err);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [agentType]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    generateVoice,
    cancelGeneration,
    clearHistory,
    clearError,
    isLoading,
    error,
    voiceData,
    history,
  };
};

export default useVoiceAgent;
