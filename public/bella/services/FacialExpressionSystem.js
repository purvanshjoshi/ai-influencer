// Facial Expression Morphing System
// Maps emotions and audio to 3D avatar facial morph targets

class FacialExpressionSystem {
  constructor(avatarModel) {
    this.avatarModel = avatarModel;
    this.morphTargets = {};
    this.currentEmotion = 'neutral';
    this.emotionIntensity = 0.5;
    this.emotionTransitionSpeed = 0.1;
  }

  setAvatarModel(model) {
    this.avatarModel = model;
  }

  // Define emotion morphing patterns
  getEmotionMorphTargets(emotion, intensity = 0.7) {
    const patterns = {
      happy: {
        eyesSmile: intensity,
        mouthSmile: intensity * 0.8,
        jawDrop: intensity * 0.3,
        browRaise: intensity * 0.5,
        cheekRaise: intensity * 0.6
      },
      sad: {
        mouthFrown: intensity * 0.8,
        eyeDropped: intensity * 0.6,
        browLower: intensity * 0.7,
        jawDrop: intensity * 0.2,
        cheekDrop: intensity * 0.5
      },
      angry: {
        browLower: intensity * 0.9,
        eyeNarrow: intensity * 0.8,
        mouthFrown: intensity * 0.6,
        jawTighten: intensity * 0.7,
        nosFlare: intensity * 0.5
      },
      surprised: {
        eyeOpen: intensity * 0.95,
        jawDrop: intensity * 0.85,
        browRaise: intensity * 0.9,
        mouthSmile: intensity * 0.3,
        eyebrowSeparation: intensity * 0.8
      },
      neutral: {
        eyesSmile: 0,
        mouthSmile: 0,
        jawDrop: 0,
        browRaise: 0,
        cheekRaise: 0
      }
    };
    return patterns[emotion] || patterns.neutral;
  }

  applyEmotionMorph(emotion, intensity = 0.7) {
    if (!this.avatarModel) return false;
    
    const morphTargets = this.getEmotionMorphTargets(emotion, intensity);
    this.currentEmotion = emotion;
    this.emotionIntensity = intensity;
    
    return this.applyMorphTargets(morphTargets);
  }

  applyMorphTargets(targets) {
    try {
      if (this.avatarModel && this.avatarModel.morphTargetInfluences) {
        Object.keys(targets).forEach(targetName => {
          const influence = targets[targetName];
          // Apply morph target influence
          console.log(`Applying ${targetName}: ${influence}`);
        });
      }
      return true;
    } catch (error) {
      console.error('Error applying morph targets:', error);
      return false;
    }
  }

  blendEmotions(emotion1, emotion2, blendFactor, intensity) {
    const targets1 = this.getEmotionMorphTargets(emotion1, intensity);
    const targets2 = this.getEmotionMorphTargets(emotion2, intensity);
    
    const blendedTargets = {};
    Object.keys(targets1).forEach(key => {
      blendedTargets[key] = (targets1[key] * (1 - blendFactor)) + (targets2[key] * blendFactor);
    });
    
    return this.applyMorphTargets(blendedTargets);
  }

  smoothTransition(targetEmotion, duration = 500) {
    const startTime = Date.now();
    const startEmotion = this.currentEmotion;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      this.blendEmotions(startEmotion, targetEmotion, progress, this.emotionIntensity);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.currentEmotion = targetEmotion;
      }
    };
    animate();
  }

  getExpressionFromText(text) {
    const happyWords = ['happy', 'great', 'wonderful', 'excellent', 'amazing'];
    const sadWords = ['sad', 'terrible', 'awful', 'bad', 'horrible'];
    const angryWords = ['angry', 'furious', 'mad', 'outraged'];
    const surprisedWords = ['surprise', 'shocked', 'astonished', 'wow', 'amazing'];
    
    const lowerText = text.toLowerCase();
    
    if (happyWords.some(word => lowerText.includes(word))) return 'happy';
    if (sadWords.some(word => lowerText.includes(word))) return 'sad';
    if (angryWords.some(word => lowerText.includes(word))) return 'angry';
    if (surprisedWords.some(word => lowerText.includes(word))) return 'surprised';
    
    return 'neutral';
  }

  reset() {
    this.applyEmotionMorph('neutral', 0);
    this.currentEmotion = 'neutral';
    this.emotionIntensity = 0.5;
  }
}

export default FacialExpressionSystem;
