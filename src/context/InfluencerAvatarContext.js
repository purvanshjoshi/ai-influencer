// src/context/InfluencerAvatarContext.js

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const InfluencerAvatarContext = createContext(null);

export const InfluencerAvatarProvider = ({ children }) => {
  const [currentPersona, setCurrentPersona] = useState(null);
  const [emotion, setEmotion] = useState('neutral');
  const [mode, setMode] = useState('hybrid');
  const [voiceState, setVoiceState] = useState('idle');     // 'idle' | 'speaking' | 'thinking'
  const [llmState, setLlmState] = useState('idle');         // 'idle' | 'streaming' | 'error'
  const [scriptText, setScriptText] = useState('');

  const handleUserSpeakStart = useCallback(() => {
    setVoiceState('speaking');
    setLlmState('thinking');
    setEmotion('thinking');
  }, []);

  const handleUserSpeakEnd = useCallback(() => {
    setVoiceState('idle');
  }, []);

  const handleLlmReplyStart = useCallback((text) => {
    setLlmState('streaming');
    setScriptText(text || '');
    setEmotion('neutral');
  }, []);

  const handleLlmReplyEnd = useCallback((finalText, sentiment) => {
    setLlmState('idle');
    setScriptText(finalText || '');

    // Basic sentiment → emotion mapping
    if (sentiment === 'positive') setEmotion('happy');
    else if (sentiment === 'negative') setEmotion('sad');
    else if (sentiment === 'angry') setEmotion('angry');
    else setEmotion('neutral');
  }, []);

  const value = useMemo(
    () => ({
      currentPersona,
      setCurrentPersona,
      emotion,
      setEmotion,
      mode,
      setMode,
      voiceState,
      setVoiceState,
      llmState,
      setLlmState,
      scriptText,
      setScriptText,
      handleUserSpeakStart,
      handleUserSpeakEnd,
      handleLlmReplyStart,
      handleLlmReplyEnd
    }),
    [
      currentPersona,
      emotion,
      mode,
      voiceState,
      llmState,
      scriptText,
      handleUserSpeakStart,
      handleUserSpeakEnd,
      handleLlmReplyStart,
      handleLlmReplyEnd
    ]
  );

  return (
    <InfluencerAvatarContext.Provider value={value}>
      {children}
    </InfluencerAvatarContext.Provider>
  );
};

export const useInfluencerAvatar = () => {
  const ctx = useContext(InfluencerAvatarContext);
  if (!ctx) {
    throw new Error('useInfluencerAvatar must be used within InfluencerAvatarProvider');
  }
  return ctx;
};
