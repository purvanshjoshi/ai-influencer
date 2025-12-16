// GestureGenerationService.js
// Generates realistic body and hand gestures based on emotional context and speech

class GestureGenerationService {
  constructor() {
    this.gestures = new Map();
    this.emotionGestureMap = new Map();
    this.speechGestureMap = new Map();
    this.isPlaying = false;
    this.currentGesture = null;
    this.gestureQueue = [];
    
    this.initializeGestures();
  }

  initializeGestures() {
    // Hand gestures
    this.gestures.set('wave', {
      duration: 1.5,
      intensity: 0.6,
      bodyParts: ['leftArm', 'leftHand']
    });
    
    this.gestures.set('point', {
      duration: 0.8,
      intensity: 0.7,
      bodyParts: ['rightArm', 'rightHand']
    });
    
    this.gestures.set('thumbsUp', {
      duration: 1.0,
      intensity: 0.5,
      bodyParts: ['rightArm', 'rightHand']
    });
    
    this.gestures.set('handsClapTogether', {
      duration: 0.6,
      intensity: 0.8,
      bodyParts: ['leftArm', 'rightArm', 'hands']
    });
    
    this.gestures.set('shrug', {
      duration: 0.8,
      intensity: 0.6,
      bodyParts: ['shoulders', 'arms']
    });
    
    this.gestures.set('nod', {
      duration: 0.6,
      intensity: 0.5,
      bodyParts: ['head']
    });
    
    this.gestures.set('headShake', {
      duration: 0.8,
      intensity: 0.6,
      bodyParts: ['head']
    });
    
    this.gestures.set('thinking', {
      duration: 1.5,
      intensity: 0.4,
      bodyParts: ['hand', 'chin']
    });
    
    this.gestures.set('handToFace', {
      duration: 1.0,
      intensity: 0.5,
      bodyParts: ['rightHand', 'face']
    });
    
    this.gestures.set('openPalms', {
      duration: 0.8,
      intensity: 0.7,
      bodyParts: ['bothArms', 'bothHands']
    });
    
    // Setup emotion-gesture mappings
    this.emotionGestureMap.set('joy', ['wave', 'thumbsUp', 'handsClapTogether']);
    this.emotionGestureMap.set('sadness', ['headShake', 'thinking']);
    this.emotionGestureMap.set('anger', ['point', 'openPalms']);
    this.emotionGestureMap.set('surprise', ['openPalms', 'handToFace']);
    this.emotionGestureMap.set('fear', ['shrug', 'thinking']);
    this.emotionGestureMap.set('disgust', ['headShake', 'shrug']);
    this.emotionGestureMap.set('neutral', ['nod']);
    
    // Setup speech-gesture mappings
    this.speechGestureMap.set('emphasis', ['point', 'openPalms']);
    this.speechGestureMap.set('question', ['nod', 'thinking']);
    this.speechGestureMap.set('confirmation', ['thumbsUp', 'nod']);
    this.speechGestureMap.set('denial', ['headShake', 'shrug']);
    this.speechGestureMap.set('greeting', ['wave']);
  }

  generateGesture(emotion, intensity = 0.5) {
    try {
      const possibleGestures = this.emotionGestureMap.get(emotion) || [];
      if (possibleGestures.length === 0) return null;
      
      // Select random gesture from emotion mapping
      const selectedGesture = possibleGestures[
        Math.floor(Math.random() * possibleGestures.length)
      ];
      
      const gestureData = this.gestures.get(selectedGesture);
      if (!gestureData) return null;
      
      return {
        name: selectedGesture,
        ...gestureData,
        intensity: Math.min(1, intensity * (1 + Math.random() * 0.3)),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error generating gesture:', error);
      return null;
    }
  }

  generateGestureFromSpeech(speechContext) {
    try {
      const { text = '', sentiment = 'neutral', isSpeaking = false } = speechContext;
      
      if (!isSpeaking) return null;
      
      // Analyze text for gesture keywords
      let contextType = 'neutral';
      
      if (text.includes('?')) {
        contextType = 'question';
      } else if (text.includes('!')) {
        contextType = 'emphasis';
      } else if (
        text.toLowerCase().includes('yes') ||
        text.toLowerCase().includes('definitely') ||
        text.toLowerCase().includes('agree')
      ) {
        contextType = 'confirmation';
      } else if (
        text.toLowerCase().includes('no') ||
        text.toLowerCase().includes('not') ||
        text.toLowerCase().includes('disagree')
      ) {
        contextType = 'denial';
      } else if (
        text.toLowerCase().includes('hello') ||
        text.toLowerCase().includes('hi') ||
        text.toLowerCase().includes('welcome')
      ) {
        contextType = 'greeting';
      }
      
      const possibleGestures = this.speechGestureMap.get(contextType) || ['nod'];
      const selectedGesture = possibleGestures[
        Math.floor(Math.random() * possibleGestures.length)
      ];
      
      const gestureData = this.gestures.get(selectedGesture);
      if (!gestureData) return null;
      
      return {
        name: selectedGesture,
        ...gestureData,
        context: contextType,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error generating gesture from speech:', error);
      return null;
    }
  }

  generateNaturalMovement(duration = 3) {
    try {
      const movements = [];
      const startTime = Date.now();
      
      // Generate a sequence of natural idle movements
      const idleGestures = ['nod', 'thinking', 'shrug'];
      
      while (Date.now() - startTime < duration * 1000) {
        const gesture = idleGestures[
          Math.floor(Math.random() * idleGestures.length)
        ];
        const gestureData = this.gestures.get(gesture);
        
        if (gestureData) {
          movements.push({
            name: gesture,
            ...gestureData,
            delay: Math.random() * 0.5,
            intensity: 0.3 + Math.random() * 0.3
          });
        }
      }
      
      return movements;
    } catch (error) {
      console.error('Error generating natural movement:', error);
      return [];
    }
  }

  blendGestures(gesture1, gesture2, blendFactor = 0.5) {
    try {
      if (!gesture1 || !gesture2) return gesture1 || gesture2;
      
      return {
        name: `${gesture1.name}-${gesture2.name}-blend`,
        duration: (gesture1.duration + gesture2.duration) / 2,
        intensity: (
          gesture1.intensity * blendFactor +
          gesture2.intensity * (1 - blendFactor)
        ),
        bodyParts: [
          ...new Set([
            ...(gesture1.bodyParts || []),
            ...(gesture2.bodyParts || [])
          ])
        ],
        blended: true,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error blending gestures:', error);
      return gesture1;
    }
  }

  queueGesture(gesture) {
    try {
      if (gesture) {
        this.gestureQueue.push(gesture);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error queuing gesture:', error);
      return false;
    }
  }

  getNextQueuedGesture() {
    return this.gestureQueue.shift() || null;
  }

  clearGestureQueue() {
    this.gestureQueue = [];
  }

  modifyGestureIntensity(gesture, intensityFactor) {
    try {
      if (!gesture) return null;
      
      return {
        ...gesture,
        intensity: Math.min(1, gesture.intensity * intensityFactor)
      };
    } catch (error) {
      console.error('Error modifying gesture intensity:', error);
      return gesture;
    }
  }

  getGestureAnimation(gestureName) {
    try {
      const gesture = this.gestures.get(gestureName);
      if (!gesture) {
        console.warn(`Gesture '${gestureName}' not found`);
        return null;
      }
      
      return {
        ...gesture,
        name: gestureName,
        animation: this.generateAnimationSequence(gestureName, gesture)
      };
    } catch (error) {
      console.error('Error getting gesture animation:', error);
      return null;
    }
  }

  generateAnimationSequence(gestureName, gestureData) {
    try {
      const sequence = {
        phases: [],
        totalDuration: gestureData.duration
      };
      
      // Intro phase (20% of duration)
      sequence.phases.push({
        type: 'intro',
        duration: gestureData.duration * 0.2,
        easing: 'easeIn',
        intensity: gestureData.intensity * 0.3
      });
      
      // Main phase (60% of duration)
      sequence.phases.push({
        type: 'main',
        duration: gestureData.duration * 0.6,
        easing: 'easeInOut',
        intensity: gestureData.intensity
      });
      
      // Outro phase (20% of duration)
      sequence.phases.push({
        type: 'outro',
        duration: gestureData.duration * 0.2,
        easing: 'easeOut',
        intensity: gestureData.intensity * 0.3
      });
      
      return sequence;
    } catch (error) {
      console.error('Error generating animation sequence:', error);
      return null;
    }
  }

  isGestureCompatible(gesture1, gesture2) {
    try {
      if (!gesture1 || !gesture2) return false;
      
      const parts1 = new Set(gesture1.bodyParts || []);
      const parts2 = new Set(gesture2.bodyParts || []);
      
      // Check if gestures share body parts
      const intersection = [...parts1].filter(part => parts2.has(part));
      
      // Incompatible if they share critical body parts
      const criticalParts = ['head', 'torso', 'bothArms'];
      const hasCriticalConflict = intersection.some(part =>
        criticalParts.includes(part)
      );
      
      return !hasCriticalConflict;
    } catch (error) {
      console.error('Error checking gesture compatibility:', error);
      return false;
    }
  }

  getGestureDescription(gestureName) {
    const descriptions = {
      wave: "Friendly wave with hand",
      point: "Pointing gesture",
      thumbsUp: "Thumbs up approval",
      handsClapTogether: "Clapping hands",
      shrug: "Shoulder shrug",
      nod: "Head nodding",
      headShake: "Head shaking (no)",
      thinking: "Thoughtful pose",
      handToFace: "Hand to face",
      openPalms: "Open palms gesture"
    };
    
    return descriptions[gestureName] || "Unknown gesture";
  }
}

export default new GestureGenerationService();
