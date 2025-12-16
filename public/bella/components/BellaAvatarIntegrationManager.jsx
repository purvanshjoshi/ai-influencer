// BellaAvatarIntegrationManager.jsx
// Central manager component for coordinating Bella avatar video with 3D avatar, emotions, and gestures

import React, { useState, useEffect, useRef } from 'react';
import Avatar3DIntegrationService from '../services/Avatar3DIntegrationService';
import VoiceEmotionMappingService from '../services/VoiceEmotionMappingService';
import GestureGenerationService from '../services/GestureGenerationService';
import useAvatarState from './useAvatarState';

const BellaAvatarIntegrationManager = ({
  videoSource,
  audioStream,
  enableVideo = true,
  enable3D = true,
  enableGestures = true,
  containerClassName = ''
}) => {
  const videoContainerRef = useRef(null);
  const avatar3DContainerRef = useRef(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(0.5);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    emotion,
    metrics,
    animation,
    speaking,
    updateEmotion,
    updateMetrics
  } = useAvatarState();
  
  // Initialize all services on mount
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setIsProcessing(true);
        
        // Initialize 3D avatar if enabled
        if (enable3D && avatar3DContainerRef.current) {
          const initialized = await Avatar3DIntegrationService.initialize(
            avatar3DContainerRef.current,
            {
              scale: 1.5,
              position: { x: 0, y: 0, z: 0 }
            }
          );
          
          if (!initialized) {
            console.warn('Failed to initialize 3D avatar');
          }
        }
        
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Error initializing services:', err);
        setError(err.message);
        setIsInitialized(false);
      } finally {
        setIsProcessing(false);
      }
    };
    
    initializeServices();
    
    return () => {
      // Cleanup on unmount
      if (Avatar3DIntegrationService.dispose) {
        Avatar3DIntegrationService.dispose();
      }
    };
  }, [enable3D]);
  
  // Process audio and generate emotions/gestures
  useEffect(() => {
    if (!isInitialized || !audioStream) return;
    
    const processAudio = async () => {
      try {
        // Analyze voice for emotion
        const voiceAnalysis = await VoiceEmotionMappingService.processRealTimeAudio(
          audioStream
        );
        
        if (voiceAnalysis) {
          setCurrentEmotion(voiceAnalysis.primaryEmotion);
          setEmotionIntensity(voiceAnalysis.intensity);
          updateEmotion(voiceAnalysis.primaryEmotion, voiceAnalysis.confidence);
          updateMetrics({
            emotion: voiceAnalysis.primaryEmotion,
            confidence: voiceAnalysis.confidence,
            voiceFeatures: voiceAnalysis.voiceFeatures
          });
          
          // Update 3D avatar expression
          if (enable3D && Avatar3DIntegrationService.updateAvatarExpression) {
            Avatar3DIntegrationService.updateAvatarExpression(
              voiceAnalysis.primaryEmotion,
              voiceAnalysis.intensity
            );
          }
          
          // Generate gestures based on emotion
          if (enableGestures) {
            const gesture = GestureGenerationService.generateGesture(
              voiceAnalysis.primaryEmotion,
              voiceAnalysis.intensity
            );
            
            if (gesture && Avatar3DIntegrationService.updateAvatarGesture) {
              setCurrentGesture(gesture);
              Avatar3DIntegrationService.updateAvatarGesture(
                gesture.name,
                gesture.duration
              );
            }
          }
        }
      } catch (err) {
        console.error('Error processing audio:', err);
      }
    };
    
    // Set up audio processing interval (every 500ms)
    const audioInterval = setInterval(processAudio, 500);
    
    return () => clearInterval(audioInterval);
  }, [isInitialized, audioStream, enable3D, enableGestures, updateEmotion, updateMetrics]);
  
  // Update video element source
  useEffect(() => {
    if (!enableVideo || !videoContainerRef.current) return;
    
    const videoElement = videoContainerRef.current.querySelector('video');
    if (videoElement && videoSource) {
      videoElement.src = videoSource;
      videoElement.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [videoSource, enableVideo]);
  
  const handleCameraToggle = () => {
    if (videoContainerRef.current) {
      const videoElement = videoContainerRef.current.querySelector('video');
      if (videoElement) {
        if (videoElement.paused) {
          videoElement.play();
        } else {
          videoElement.pause();
        }
      }
    }
  };
  
  const handleGestureManually = (gestureName) => {
    if (Avatar3DIntegrationService.updateAvatarGesture) {
      Avatar3DIntegrationService.updateAvatarGesture(gestureName, 2);
      const gesture = GestureGenerationService.gestures?.get(gestureName);
      setCurrentGesture({ name: gestureName, ...gesture });
    }
  };
  
  return (
    <div className={`bella-avatar-integration-manager ${containerClassName}`}>
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      {isProcessing && (
        <div className="loading-indicator">
          <p>Initializing Bella Avatar...</p>
        </div>
      )}
      
      <div className="avatar-display-container">
        {/* Bella Video Avatar */}
        {enableVideo && (
          <div className="video-avatar-section" ref={videoContainerRef}>
            <video
              className="bella-video"
              autoPlay
              playsInline
              muted
              controls
            />
            <div className="video-controls">
              <button onClick={handleCameraToggle} className="control-btn">
                Play/Pause
              </button>
            </div>
          </div>
        )}
        
        {/* 3D Avatar */}
        {enable3D && (
          <div className="avatar-3d-section" ref={avatar3DContainerRef}>
            <div className="emotion-status">
              <span className="emotion-label">Emotion:</span>
              <span className="emotion-value">{currentEmotion}</span>
              <span className="intensity-value">
                {(emotionIntensity * 100).toFixed(0)}%
              </span>
            </div>
            
            {currentGesture && (
              <div className="gesture-status">
                <span className="gesture-label">Gesture:</span>
                <span className="gesture-value">{currentGesture.name}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Gesture Controls */}
      {enableGestures && (
        <div className="gesture-controls">
          <h3>Manual Gestures</h3>
          <div className="gesture-buttons">
            {['wave', 'nod', 'point', 'thumbsUp', 'shrug', 'thinking'].map(
              (gesture) => (
                <button
                  key={gesture}
                  onClick={() => handleGestureManually(gesture)}
                  className="gesture-btn"
                >
                  {gesture.charAt(0).toUpperCase() + gesture.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      )}
      
      {/* Debug Metrics */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h3>Avatar State</h3>
          <pre>
            {JSON.stringify(
              {
                emotion,
                emotionIntensity,
                currentGesture: currentGesture?.name,
                speaking,
                metrics
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
      
      <style jsx>{`
        .bella-avatar-integration-manager {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 12px;
          color: #eee;
        }
        
        .error-message {
          padding: 15px;
          background: #d32f2f;
          border-radius: 8px;
          color: white;
        }
        
        .loading-indicator {
          padding: 15px;
          background: #1976d2;
          border-radius: 8px;
          text-align: center;
        }
        
        .avatar-display-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          min-height: 500px;
        }
        
        .video-avatar-section,
        .avatar-3d-section {
          background: #0f3460;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        
        .bella-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .emotion-status,
        .gesture-status {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .gesture-controls {
          padding: 20px;
          background: #0f3460;
          border-radius: 8px;
        }
        
        .gesture-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        
        .gesture-btn {
          padding: 8px 16px;
          background: #e94560;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
        }
        
        .gesture-btn:hover {
          background: #d63447;
        }
        
        .debug-panel {
          padding: 15px;
          background: #1a1a2e;
          border-radius: 8px;
          border: 1px solid #e94560;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .debug-panel pre {
          margin: 0;
          font-size: 12px;
          color: #64b5f6;
        }
        
        @media (max-width: 768px) {
          .avatar-display-container {
            grid-template-columns: 1fr;
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default BellaAvatarIntegrationManager;
