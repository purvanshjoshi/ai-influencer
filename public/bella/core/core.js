// core.js - Bella's Brain (v3)
// Bella's core AI logic, supporting a hybrid architecture of local models and cloud APIs

import { pipeline, env, AutoTokenizer, AutoModelForSpeechSeq2Seq } from './vendor/transformers.js';
import CloudAPIService from './cloudAPI.js';

// Local model configuration
env.allowLocalModels = true;
env.useBrowserCache = false;
env.allowRemoteModels = false;
env.backends.onnx.logLevel = 'verbose';
env.localModelPath = './models/';

class BellaAI {
  static instance = null;

  static async getInstance() {
    if (this.instance === null) {
      this.instance = new BellaAI();
      await this.instance.init();
    }
    return this.instance;
  }

  constructor() {
    this.cloudAPI = new CloudAPIService();
    this.useCloudAPI = false; // Default to using local model
    this.currentMode = 'casual'; // Chat modes: casual, assistant, creative
  }

  async init() {
    console.log('Initializing Bella\'s core AI...');

    // Priority loading of LLM model (chat functionality)
    try {
      console.log('Loading LLM model...');
      this.llm = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M');
      console.log('LLM model loaded successfully.');
    } catch (error) {
      console.error('Failed to load LLM model:', error);
      // LLM loading failure doesn't block initialization
    }

    // Attempt to load ASR model (voice recognition)
    try {
      console.log('Loading ASR model...');
      const modelPath = 'Xenova/whisper-asr';
      const tokenizer = await AutoTokenizer.from_pretrained(modelPath);
      const model = await AutoModelForSpeechSeq2Seq.from_pretrained(modelPath);
      this.asr = await pipeline('automatic-speech-recognition', model, { tokenizer });
      console.log('ASR model loaded successfully.');
    } catch (error) {
      console.warn('ASR model failed to load, voice recognition will be disabled:', error);
      // ASR loading failure doesn't affect chat functionality
      this.asr = null;
    }

    console.log('Bella\'s core AI initialized successfully.');
  }

  async think(prompt) {
    try {
      // If cloud API is enabled and configured, use it as priority
      if (this.useCloudAPI && this.cloudAPI.isConfigured()) {
        return await this.thinkWithCloudAPI(prompt);
      }
      // Otherwise use local model
      return await this.thinkWithLocalModel(prompt);
    } catch (error) {
      console.error('Error during thinking process:', error);
      // If cloud API fails, try falling back to local model
      if (this.useCloudAPI) {
        console.log('Cloud API failed, falling back to local model...');
        try {
          return await this.thinkWithLocalModel(prompt);
        } catch (localError) {
          console.error('Local model also failed:', localError);
        }
      }
      return this.getErrorResponse();
    }
  }

  // Think using cloud API
  async thinkWithCloudAPI(prompt) {
    const enhancedPrompt = this.enhancePromptForMode(prompt);
    return await this.cloudAPI.chat(enhancedPrompt);
  }

  // Think using local model
  async thinkWithLocalModel(prompt) {
    if (!this.llm) {
      return "I'm still learning how to think. Please wait a moment...";
    }
    const bellaPrompt = this.enhancePromptForMode(prompt, true);
    const result = await this.llm(bellaPrompt, {
      max_new_tokens: 180,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.92,
      do_sample: true,
      repetition_penalty: 1.2,
    });

    let response = result[0].generated_text;
    if (response.includes(bellaPrompt)) {
      response = response.replace(bellaPrompt, '').trim();
    }
    response = response.replace(/^(Bella's response:|Bella:)/i, '').trim();

    if (!response || response.length < 2) {
      const backupResponses = [
        "That's an interesting question. Let me think about it for a moment...",
        "Good question! I need to organize my thoughts...",
        "I have some ideas, but let me put them together more coherently..."
      ];
      return backupResponses[Math.floor(Math.random() * backupResponses.length)];
    }
    return response;
  }

  enhancePromptForMode(prompt, isLocal = false) {
    const modePrompts = {
      casual: isLocal
        ? `As Bella, a friendly AI assistant, respond conversationally:\n${prompt}\nBella's response:`
        : `You are Bella, an AI assistant. Respond helpfully and conversationally:\n${prompt}\nBella's response:`,
      assistant: isLocal
        ? `As Bella, provide accurate information:\n${prompt}\nBella's response:`
        : `You are Bella. Provide accurate, helpful information:\n${prompt}\nBella's response:`,
      creative: isLocal
        ? `As Bella, use creativity and imagination:\n${prompt}\nBella's creative response:`
        : `You are Bella. Provide creative, interesting responses:\n${prompt}\nBella's response:`
    };
    return modePrompts[this.currentMode] || modePrompts.casual;
  }

  getErrorResponse() {
    const errorResponses = [
      "I'm sorry, I'm having trouble processing that right now.",
      "Hmm... I need to think about this a bit more. Please wait a moment.",
      "I seem to be having a bit of trouble with that. Give me a second to sort things out."
    ];
    return errorResponses[Math.floor(Math.random() * errorResponses.length)];
  }

  setChatMode(mode) {
    if (['casual', 'assistant', 'creative'].includes(mode)) {
      this.currentMode = mode;
      return true;
    }
    return false;
  }

  switchProvider(provider) {
    if (provider === 'local') {
      this.useCloudAPI = false;
      return true;
    } else {
      const success = this.cloudAPI.switchProvider(provider);
      if (success) {
        this.useCloudAPI = true;
      }
      return success;
    }
  }

  setAPIKey(provider, apiKey) {
    return this.cloudAPI.setAPIKey(provider, apiKey);
  }

  clearHistory() {
    this.cloudAPI.clearHistory();
  }

  getCurrentConfig() {
    return {
      useCloudAPI: this.useCloudAPI,
      provider: this.useCloudAPI ? this.cloudAPI.getCurrentProvider() : { name: 'local', model: 'LaMini-Flan-T5-77M' },
      mode: this.currentMode,
      isConfigured: this.useCloudAPI ? this.cloudAPI.isConfigured() : true
    };
  }

  async listen(audioData) {
    if (!this.asr) {
      throw new Error('Speech recognition model not initialized');
    }
    const result = await this.asr(audioData);
    return result.text;
  }
}

export { BellaAI };
