// simpleBellaAI.js - Lightweight Fallback AI Implementation
// Use this when full model loading fails or as a quick fallback

class SimpleBellaAI {
  constructor() {
    this.responses = [
      "That's interesting! Tell me more about that.",
      "I see. Can you elaborate on that?",
      "That's a great point. What else?",
      "I understand. How can I help you further?",
      "That makes sense. What would you like to know?",
      "Interesting perspective. Any other thoughts?"
    ];
    this.currentMode = 'casual';
  }

  async think(prompt) {
    // Simulate processing delay
    await this._delay(300);
    const response = this._generateResponse(prompt);
    return response;
  }

  _generateResponse(prompt) {
    // Simple pattern matching for common questions
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      return "Hello! I'm Bella, your AI assistant. How can I help you today?";
    }
    
    if (lowerPrompt.includes('who are you')) {
      return "I'm Bella, an AI assistant. How can I assist you?";
    }
    
    if (lowerPrompt.includes('help')) {
      return "I'm here to help! Feel free to ask me questions or chat.";
    }
    
    return this._getRandomResponse();
  }

  _getRandomResponse() {
    const index = Math.floor(Math.random() * this.responses.length);
    return this.responses[index];
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setChatMode(mode) {
    if (['casual', 'assistant', 'creative'].includes(mode)) {
      this.currentMode = mode;
      return true;
    }
    return false;
  }

  getCurrentConfig() {
    return {
      name: 'SimpleBellaAI',
      type: 'Lightweight Fallback',
      mode: this.currentMode,
      status: 'active'
    };
  }
}

export { SimpleBellaAI };
