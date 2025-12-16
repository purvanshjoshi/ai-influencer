// StateSyncService.js
// Synchronizes avatar state across all services and components

class StateSyncService {
  constructor() {
    this.avatarState = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      emotion: 'neutral',
      emotionIntensity: 0,
      expression: {},
      gesture: null,
      isVisible: true,
      animation: null,
      lastUpdate: Date.now()
    };
    
    this.subscribers = new Map();
    this.stateHistory = [];
    this.maxHistoryLength = 100;
    this.syncInterval = 16; // ~60 FPS
    this.isDirty = false;
    this.syncCallbacks = [];
  }

  updatePosition(x, y, z) {
    this.avatarState.position = { x, y, z };
    this.avatarState.lastUpdate = Date.now();
    this.isDirty = true;
    this.recordHistory();
    this.notifySubscribers('position');
  }

  updateRotation(x, y, z) {
    this.avatarState.rotation = { x, y, z };
    this.avatarState.lastUpdate = Date.now();
    this.isDirty = true;
    this.recordHistory();
    this.notifySubscribers('rotation');
  }

  updateScale(x, y, z) {
    this.avatarState.scale = { x, y, z };
    this.avatarState.lastUpdate = Date.now();
    this.isDirty = true;
    this.recordHistory();
    this.notifySubscribers('scale');
  }

  setEmotion(emotion, intensity = 1) {
    this.avatarState.emotion = emotion;
    this.avatarState.emotionIntensity = intensity;
    this.avatarState.lastUpdate = Date.now();
    this.isDirty = true;
    this.recordHistory();
    this.notifySubscribers('emotion');
  }

  setExpression(expression) {
    this.avatarState.expression = expression;
    this.avatarState.lastUpdate = Date.now();
    this.isDirty = true;
    this.notifySubscribers('expression');
  }

  setGesture(gesture) {
    this.avatarState.gesture = gesture;
    this.avatarState.lastUpdate = Date.now();
    this.isDirty = true;
    this.recordHistory();
    this.notifySubscribers('gesture');
  }

  setAnimation(animation) {
    this.avatarState.animation = animation;
    this.avatarState.lastUpdate = Date.now();
    this.isDirty = true;
    this.notifySubscribers('animation');
  }

  setVisibility(visible) {
    this.avatarState.isVisible = visible;
    this.avatarState.lastUpdate = Date.now();
    this.isDirty = true;
    this.notifySubscribers('visibility');
  }

  getState() {
    return { ...this.avatarState };
  }

  subscribe(component, callback) {
    if (!this.subscribers.has(component)) {
      this.subscribers.set(component, []);
    }
    
    this.subscribers.get(component).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(component);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  notifySubscribers(field) {
    this.subscribers.forEach((callbacks, component) => {
      callbacks.forEach(callback => {
        try {
          callback({
            field,
            value: this.avatarState[field],
            state: this.avatarState
          });
        } catch (error) {
          console.error('Error notifying subscriber:', error);
        }
      });
    });
    
    // Call sync callbacks
    this.syncCallbacks.forEach(callback => {
      try {
        callback(this.avatarState);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  onSync(callback) {
    this.syncCallbacks.push(callback);
    
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  recordHistory() {
    this.stateHistory.push({
      state: JSON.parse(JSON.stringify(this.avatarState)),
      timestamp: Date.now()
    });
    
    if (this.stateHistory.length > this.maxHistoryLength) {
      this.stateHistory.shift();
    }
  }

  getHistory(duration = 5000) {
    const cutoffTime = Date.now() - duration;
    return this.stateHistory.filter(entry => entry.timestamp >= cutoffTime);
  }

  revertToState(timestamp) {
    const entry = this.stateHistory.find(h => h.timestamp <= timestamp);
    if (entry) {
      this.avatarState = JSON.parse(JSON.stringify(entry.state));
      this.isDirty = true;
      this.notifySubscribers('state');
      return true;
    }
    return false;
  }

  reset() {
    this.avatarState = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      emotion: 'neutral',
      emotionIntensity: 0,
      expression: {},
      gesture: null,
      isVisible: true,
      animation: null,
      lastUpdate: Date.now()
    };
    this.isDirty = true;
    this.notifySubscribers('reset');
  }

  clearHistory() {
    this.stateHistory = [];
  }

  getStateChanges(startTime, endTime) {
    return this.stateHistory.filter(
      entry => entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  interpolateState(fromTime, toTime, progress) {
    const fromState = this.stateHistory.find(h => h.timestamp <= fromTime);
    const toState = this.stateHistory.find(h => h.timestamp >= toTime);
    
    if (!fromState || !toState) return this.avatarState;
    
    return {
      position: {
        x: fromState.state.position.x + (toState.state.position.x - fromState.state.position.x) * progress,
        y: fromState.state.position.y + (toState.state.position.y - fromState.state.position.y) * progress,
        z: fromState.state.position.z + (toState.state.position.z - fromState.state.position.z) * progress
      },
      rotation: fromState.state.rotation,
      scale: fromState.state.scale,
      emotion: toState.state.emotion,
      emotionIntensity: fromState.state.emotionIntensity + (toState.state.emotionIntensity - fromState.state.emotionIntensity) * progress,
      expression: toState.state.expression,
      gesture: toState.state.gesture,
      isVisible: toState.state.isVisible,
      animation: toState.state.animation,
      lastUpdate: Date.now()
    };
  }

  getAvatarSnapshot() {
    return {
      state: JSON.parse(JSON.stringify(this.avatarState)),
      timestamp: Date.now(),
      historySize: this.stateHistory.length
    };
  }

  loadSnapshot(snapshot) {
    if (snapshot && snapshot.state) {
      this.avatarState = JSON.parse(JSON.stringify(snapshot.state));
      this.isDirty = true;
      this.notifySubscribers('snapshot');
      return true;
    }
    return false;
  }

  getSubscriberCount() {
    let total = 0;
    this.subscribers.forEach(callbacks => {
      total += callbacks.length;
    });
    return total;
  }

  getStatistics() {
    return {
      currentState: this.avatarState,
      historyLength: this.stateHistory.length,
      subscriberCount: this.getSubscriberCount(),
      isDirty: this.isDirty,
      lastUpdate: new Date(this.avatarState.lastUpdate).toISOString()
    };
  }
}

export default new StateSyncService();
