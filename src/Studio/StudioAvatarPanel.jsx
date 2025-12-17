// src/pages/Studio/StudioAvatarPanel.jsx

import React, { useState } from 'react';
import { useInfluencerAvatar } from '../../context/InfluencerAvatarContext';
import BellaAvatarContainer from '../../../public/bella/components/BellaAvatarContainer';
import useAdaptiveAvatarMode from '../../../public/bella/hooks/useAdaptiveAvatarMode';
import PerformanceMonitorService from '../../../public/bella/services/PerformanceMonitorService';
import NetworkAdaptationService from '../../../public/bella/services/NetworkAdaptationService';

// Instantiate services once for the studio panel scope
const performanceService = new PerformanceMonitorService();
const networkService = new NetworkAdaptationService({
  pingEndpoint: '/api/bella/health'
});

const StudioAvatarPanel = () => {
  const {
    emotion,
    setEmotion,
    mode: contextMode,
    setMode: setContextMode,
    voiceState,
    llmState,
    scriptText,
    handleLlmReplyStart,
    handleLlmReplyEnd
  } = useInfluencerAvatar();

  const [forcedMode, setForcedMode] = useState(null);

  const { mode: adaptiveMode, perfProfile, networkProfile } = useAdaptiveAvatarMode(
    performanceService,
    networkService,
    forcedMode
  );

  const effectiveMode = forcedMode || contextMode || adaptiveMode;

  const handleEmotionPreview = (emo) => {
    setEmotion(emo);
  };

  const handleRunDemoScript = () => {
    const demoText = 'Hey, this is your AI influencer Bella running a live demo script.';
    handleLlmReplyStart(demoText);

    setTimeout(() => {
      handleLlmReplyEnd(demoText, 'positive');
    }, 1500);
  };

  const handleToggleHybrid = () => {
    if (effectiveMode === 'hybrid') {
      setForcedMode('video');
      setContextMode('video');
    } else {
      setForcedMode('hybrid');
      setContextMode('hybrid');
    }
  };

  return (
    <div className="studio-avatar-panel">
      <div className="studio-avatar-header">
        <h2>Studio Avatar Panel</h2>
        <div className="studio-avatar-status">
          <span>Mode: {effectiveMode}</span>
          <span>Perf: {perfProfile}</span>
          <span>Network: {networkProfile}</span>
        </div>
      </div>

      <div className="studio-avatar-main">
        <BellaAvatarContainer
          emotion={emotion}
          scriptText={scriptText}
          voiceState={voiceState}
          llmState={llmState}
          mode={adaptiveMode}
          forcedMode={forcedMode}
          onModeChange={(m) => setContextMode(m)}
        />
      </div>

      <div className="studio-avatar-controls">
        <h3>Emotion Preview</h3>
        <div className="emotion-buttons">
          <button type="button" onClick={() => handleEmotionPreview('happy')}>
            Happy
          </button>
          <button type="button" onClick={() => handleEmotionPreview('sad')}>
            Sad
          </button>
          <button type="button" onClick={() => handleEmotionPreview('angry')}>
            Angry
          </button>
          <button type="button" onClick={() => handleEmotionPreview('surprised')}>
            Surprised
          </button>
          <button type="button" onClick={() => handleEmotionPreview('neutral')}>
            Neutral
          </button>
        </div>

        <h3>Actions</h3>
        <div className="action-buttons">
          <button type="button" onClick={handleRunDemoScript}>
            Run demo script
          </button>
          <button type="button" onClick={handleToggleHybrid}>
            Toggle hybrid mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioAvatarPanel;
