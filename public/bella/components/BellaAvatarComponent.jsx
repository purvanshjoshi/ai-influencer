import React, { useEffect, useRef, useState, useContext } from 'react';
import { VoiceAgentContext } from '../services/VoiceAgentProvider';

// Bella 3D Avatar Component
// Integrates 3D avatar rendering with voice agent interactions
const BellaAvatarComponent = ({
  avatarModelPath = '/bella/assets/avatar-model.gltf',
  enableLipSync = true,
  enableFacialExpressions = true
}) => {
  const canvasRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const voiceContext = useContext(VoiceAgentContext);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      const canvas = canvasRef.current;
      console.log('Initializing Bella 3D Avatar...');
      setIsLoading(false);
    } catch (err) {
      setError('Failed to initialize avatar: ' + err.message);
      setIsLoading(false);
    }
  }, []);

  const updateLipSync = (audioData) => {
    console.log('Updating lip-sync...');
  };

  const handleAvatarClick = () => {
    if (voiceContext?.startListening) {
      voiceContext.startListening();
    }
  };

  return (
    <div className="bella-avatar-container">
      {isLoading && <p>Loading Bella Avatar...</p>}
      {error && <p>Error: {error}</p>}
      <canvas
        ref={canvasRef}
        onClick={handleAvatarClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
      />
    </div>
  );
};

export default BellaAvatarComponent;
