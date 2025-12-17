// public/bella/components/BellaAvatarContainer.jsx

import React, { useRef, useEffect } from 'react';
import BellaVideoAvatarComponent from './BellaVideoAvatarComponent';
import Avatar3DComponent from './Avatar3DComponent';

/**
 * Single source of truth container for Bella's video + 3D avatars.
 *
 * Props:
 *  - emotion: string
 *  - scriptText: string
 *  - voiceState: 'idle' | 'speaking' | 'thinking' | ...
 *  - llmState: 'idle' | 'streaming' | 'error' | ...
 *  - mode: 'video' | '3d' | 'hybrid'
 *  - forcedMode: optional override: 'video' | '3d' | 'hybrid' | null
 *  - onModeChange?: (mode) => void
 */
const BellaAvatarContainer = ({
  emotion,
  scriptText,
  voiceState,
  llmState,
  mode,
  forcedMode = null,
  onModeChange
}) => {
  const videoRef = useRef(null);
  const avatar3DRef = useRef(null);

  const effectiveMode = forcedMode || mode || 'hybrid';

  useEffect(() => {
    // Forward emotion and state updates to both underlying avatar implementations
    if (videoRef.current && typeof videoRef.current.updateEmotion === 'function') {
      videoRef.current.updateEmotion(emotion, { voiceState, llmState, scriptText });
    }

    if (avatar3DRef.current && typeof avatar3DRef.current.updateEmotion === 'function') {
      avatar3DRef.current.updateEmotion(emotion, { voiceState, llmState, scriptText });
    }
  }, [emotion, voiceState, llmState, scriptText]);

  useEffect(() => {
    if (typeof onModeChange === 'function') {
      onModeChange(effectiveMode);
    }
  }, [effectiveMode, onModeChange]);

  return (
    <div className="bella-avatar-container">
      {(effectiveMode === 'video' || effectiveMode === 'hybrid') && (
        <div className="bella-avatar-video-wrapper">
          <BellaVideoAvatarComponent
            ref={videoRef}
            emotion={emotion}
            scriptText={scriptText}
            voiceState={voiceState}
            llmState={llmState}
          />
        </div>
      )}

      {(effectiveMode === '3d' || effectiveMode === 'hybrid') && (
        <div className="bella-avatar-3d-wrapper">
          <Avatar3DComponent
            ref={avatar3DRef}
            emotion={emotion}
            voiceState={voiceState}
            llmState={llmState}
          />
        </div>
      )}
    </div>
  );
};

export default BellaAvatarContainer;
