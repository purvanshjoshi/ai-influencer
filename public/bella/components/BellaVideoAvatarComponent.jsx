/**
 * BellaVideoAvatarComponent.jsx
 * React component for Bella video-based avatar with emotion-driven animations
 * Integrates with voice AI agents for intelligent avatar behavior
 */

import React, { useEffect, useRef, useState } from 'react';
import VideoAnimationService from '../services/VideoAnimationService.js';
import '../styles/videoAvatarStyles.css';

const BellaVideoAvatarComponent = ({
  containerClassName = 'bella-video-avatar-container',
  autoPlayIdle = true,
  onAnimationStart = null,
  onAnimationEnd = null,
  emotionMap = {},
}) => {
  const containerRef = useRef(null);
  const videoServiceRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Default emotion to animation mapping
  const defaultEmotionMap = {
    neutral: 'idle',
    happy: 'happy',
    sad: 'sad',
    thinking: 'thinking',
    greeting: 'greeting',
    excited: 'happy',
    confused: 'thinking',
    affirmative: 'nodding',
    appreciation: 'encouraging',
    negative: 'sad',
    ...emotionMap,
  };

  // Initialize VideoAnimationService
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      videoServiceRef.current = new VideoAnimationService(
        `.${containerClassName}`
      );
      setIsInitialized(true);
      setIsLoading(false);

      // Auto-play idle animation if enabled
      if (autoPlayIdle && videoServiceRef.current) {
        videoServiceRef.current.playAnimation('idle', true).catch((err) => {
          console.warn('Failed to auto-play idle animation:', err);
        });
      }
    } catch (error) {
      console.error('Failed to initialize VideoAnimationService:', error);
      setIsLoading(false);
    }

    return () => {
      if (videoServiceRef.current) {
        videoServiceRef.current.stop();
      }
    };
  }, [autoPlayIdle, containerClassName]);

  /**
   * Play animation by emotion or animation name
   */
  const playEmotionAnimation = async (emotion, duration = null) => {
    if (!videoServiceRef.current) {
      console.error('VideoAnimationService not initialized');
      return;
    }

    const animationName = defaultEmotionMap[emotion] || emotion;

    if (onAnimationStart) {
      onAnimationStart(animationName);
    }

    try {
      const onComplete = () => {
        setCurrentAnimation('idle');
        if (onAnimationEnd) {
          onAnimationEnd(animationName);
        }
        // Return to idle after animation
        if (autoPlayIdle) {
          videoServiceRef.current.playAnimation('idle', true);
        }
      };

      setCurrentAnimation(animationName);
      await videoServiceRef.current.playAnimation(
        animationName,
        false,
        onComplete
      );
    } catch (error) {
      console.error(`Failed to play animation: ${animationName}`, error);
    }
  };

  /**
   * Play animation directly by name
   */
  const playAnimation = async (animationName, loop = false) => {
    if (!videoServiceRef.current) {
      console.error('VideoAnimationService not initialized');
      return;
    }

    if (onAnimationStart) {
      onAnimationStart(animationName);
    }

    try {
      setCurrentAnimation(animationName);
      await videoServiceRef.current.playAnimation(animationName, loop);
    } catch (error) {
      console.error(`Failed to play animation: ${animationName}`, error);
    }
  };

  /**
   * Stop current animation
   */
  const stop = () => {
    if (videoServiceRef.current) {
      videoServiceRef.current.stop();
      setCurrentAnimation('idle');
    }
  };

  /**
   * Get current state
   */
  const getState = () => {
    return {
      isInitialized,
      isLoading,
      currentAnimation,
      videoServiceState: videoServiceRef.current?.getCurrentAnimation() || null,
    };
  };

  // Expose methods via ref
  React.useImperativeHandle = React.useImperativeHandle || (() => {});

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        position: 'relative',
        backgroundColor: '#000',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            zIndex: 100,
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '10px' }}>Loading Bella...</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Current animation: {currentAnimation}
          </div>
        </div>
      )}
    </div>
  );
};

// Expose methods for parent components
BellaVideoAvatarComponent.displayName = 'BellaVideoAvatarComponent';

export { BellaVideoAvatarComponent };
export default BellaVideoAvatarComponent;

/**
 * Usage Example:
 *
 * import BellaVideoAvatarComponent from './components/BellaVideoAvatarComponent.jsx';
 *
 * // In your parent component:
 * const avatarRef = useRef(null);
 *
 * // Play emotion animation
 * <BellaVideoAvatarComponent
 *   ref={avatarRef}
 *   autoPlayIdle={true}
 *   onAnimationStart={(anim) => console.log('Started:', anim)}
 *   onAnimationEnd={(anim) => console.log('Ended:', anim)}
 *   emotionMap={{
 *     custom_emotion: 'happy',
 *     another_emotion: 'sad'
 *   }}
 * />
 *
 * // Then in event handlers:
 * avatarRef.current.playEmotionAnimation('happy');
 * avatarRef.current.playAnimation('idle', true);
 * avatarRef.current.stop();
 * console.log(avatarRef.current.getState());
 */
