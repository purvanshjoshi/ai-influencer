// cloudAPI.js - Cloud LLM Integration Service
// Supports multiple cloud providers: OpenAI, Anthropic, Google Gemini, AWS Bedrock

class CloudAPIService {
  constructor() {
    this.providers = {
      openai: {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        apiKey: null,
        configured: false
      },
      anthropic: {
        name: 'Anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229',
        apiKey: null,
        configured: false
      },
      gemini: {
        name: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro',
        apiKey: null,
        configured: false
      }
    };
    
    this.currentProvider = 'openai';
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
  }

  setAPIKey(provider, apiKey) {
    if (!this.providers[provider]) {
      console.error(`Unknown provider: ${provider}`);
      return false;
    }
    
    this.providers[provider].apiKey = apiKey;
    this.providers[provider].configured = true;
    console.log(`API key set for ${provider}`);
    return true;
  }

  isConfigured() {
    const provider = this.providers[this.currentProvider];
    return provider && provider.configured && provider.apiKey !== null;
  }

  switchProvider(provider) {
    if (!this.providers[provider]) {
      console.error(`Unknown provider: ${provider}`);
      return false;
    }
    
    if (!this.providers[provider].configured) {
      console.warn(`Provider ${provider} not configured with API key`);
      return false;
    }
    
    this.currentProvider = provider;
    console.log(`Switched to ${provider} provider`);
    return true;
  }

  getCurrentProvider() {
    const provider = this.providers[this.currentProvider];
    return {
      name: provider.name,
      model: provider.model,
      provider: this.currentProvider
    };
  }

  async chat(message) {
    if (!this.isConfigured()) {
      throw new Error(`Cloud API not configured for ${this.currentProvider}`);
    }

    const provider = this.providers[this.currentProvider];
    
    try {
      let response;
      
      switch (this.currentProvider) {
        case 'openai':
          response = await this._callOpenAI(message, provider);
          break;
        case 'anthropic':
          response = await this._callAnthropic(message, provider);
          break;
        case 'gemini':
          response = await this._callGemini(message, provider);
          break;
        default:
          throw new Error(`Unknown provider: ${this.currentProvider}`);
      }
      
      this._addToHistory(message, response);
      return response;
    } catch (error) {
      console.error(`Cloud API error (${this.currentProvider}):`, error);
      throw error;
    }
  }

  async _callOpenAI(message, provider) {
    const payload = {
      model: provider.model,
      messages: [
        ...this.conversationHistory.map(h => ({
          role: h.role,
          content: h.content
        })),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async _callAnthropic(message, provider) {
    const payload = {
      model: provider.model,
      max_tokens: 500,
      system: 'You are Bella, a helpful AI assistant.',
      messages: [
        ...this.conversationHistory.map(h => ({
          role: h.role,
          content: h.content
        })),
        { role: 'user', content: message }
      ]
    };

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async _callGemini(message, provider) {
    const url = `${provider.endpoint}?key=${provider.apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: message }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  _addToHistory(message, response) {
    this.conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    );
    
    // Maintain conversation history within max length
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  clearHistory() {
    this.conversationHistory = [];
    console.log('Conversation history cleared');
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  getProviders() {
    return Object.keys(this.providers).map(key => ({
      id: key,
      name: this.providers[key].name,
      configured: this.providers[key].configured
    }));
  }
}

export default CloudAPIService;
