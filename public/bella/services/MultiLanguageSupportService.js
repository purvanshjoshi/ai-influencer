/**
 * MultiLanguageSupportService.js
 * Handles multi-language support for voice and text processing
 */

class MultiLanguageSupportService {
  constructor() {
    this.supportedLanguages = {
      'en': { name: 'English', code: 'en-US', phonemeSet: 'english' },
      'es': { name: 'Spanish', code: 'es-ES', phonemeSet: 'spanish' },
      'fr': { name: 'French', code: 'fr-FR', phonemeSet: 'french' },
      'de': { name: 'German', code: 'de-DE', phonemeSet: 'german' },
      'it': { name: 'Italian', code: 'it-IT', phonemeSet: 'italian' },
      'pt': { name: 'Portuguese', code: 'pt-BR', phonemeSet: 'portuguese' },
      'ja': { name: 'Japanese', code: 'ja-JP', phonemeSet: 'japanese' },
      'zh': { name: 'Mandarin', code: 'zh-CN', phonemeSet: 'mandarin' }
    };
    
    this.currentLanguage = 'en';
    this.languageChangeCallbacks = [];
    this.phonemeMaps = {};
    this._initializePhonemes();
  }

  /**
   * Initialize phoneme mappings for supported languages
   * @private
   */
  _initializePhonemes() {
    this.phonemeMaps = {
      'english': this._getEnglishPhonemes(),
      'spanish': this._getSpanishPhonemes(),
      'french': this._getFrenchPhonemes(),
      'german': this._getGermanPhonemes(),
      'italian': this._getItalianPhonemes(),
      'portuguese': this._getPortuguesePhonemes(),
      'japanese': this._getJapanesePhonemes(),
      'mandarin': this._getMandarinPhonemes()
    };
  }

  /**
   * Detect language from text
   * @param {string} text - Text to detect language from
   * @returns {string} Detected language code
   */
  detectLanguage(text) {
    if (!text) return this.currentLanguage;
    
    // Simple detection based on common words and patterns
    const lowerText = text.toLowerCase();
    
    const languagePatterns = {
      'en': ['the', 'and', 'is', 'a', 'to', 'in'],
      'es': ['el', 'la', 'de', 'que', 'es', 'y'],
      'fr': ['le', 'de', 'un', 'est', 'et', 'à'],
      'de': ['der', 'die', 'und', 'in', 'den', 'von'],
      'it': ['il', 'di', 'e', 'che', 'da', 'un'],
      'pt': ['o', 'de', 'que', 'e', 'do', 'a'],
      'ja': ['は', 'を', 'に', 'が', 'と', 'で'],
      'zh': ['的', '一', '是', '在', '不', '了']
    };
    
    let highestScore = 0;
    let detectedLang = this.currentLanguage;
    
    Object.entries(languagePatterns).forEach(([lang, patterns]) => {
      let score = 0;
      patterns.forEach(pattern => {
        if (lowerText.includes(pattern)) score++;
      });
      if (score > highestScore) {
        highestScore = score;
        detectedLang = lang;
      }
    });
    
    return detectedLang;
  }

  /**
   * Set current language
   * @param {string} languageCode - Language code (e.g., 'en', 'es')
   */
  setLanguage(languageCode) {
    if (this.supportedLanguages[languageCode]) {
      const oldLanguage = this.currentLanguage;
      this.currentLanguage = languageCode;
      this._notifyLanguageChange(languageCode, oldLanguage);
    }
  }

  /**
   * Get phonemes for current language
   * @returns {Object} Phoneme map for current language
   */
  getPhonemeMap() {
    const langConfig = this.supportedLanguages[this.currentLanguage];
    return this.phonemeMaps[langConfig.phonemeSet] || this.phonemeMaps['english'];
  }

  /**
   * Convert text to phonemes based on language
   * @param {string} text - Text to convert
   * @returns {Array} Phoneme array
   */
  textToPhonemes(text) {
    const phonemeMap = this.getPhonemeMap();
    const phonemes = [];
    
    for (const char of text.toLowerCase()) {
      if (phonemeMap[char]) {
        phonemes.push(phonemeMap[char]);
      }
    }
    
    return phonemes;
  }

  /**
   * Get TTS voice configuration for language
   * @returns {Object} Voice configuration
   */
  getTTSVoiceConfig() {
    const langConfig = this.supportedLanguages[this.currentLanguage];
    return {
      lang: langConfig.code,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    };
  }

  /**
   * English phonemes
   * @private
   */
  _getEnglishPhonemes() {
    return {
      'a': 'ae', 'e': 'eh', 'i': 'ih', 'o': 'oh', 'u': 'uh',
      'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
      'h': 'h', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'r': 'r', 's': 's', 't': 't'
    };
  }

  /**
   * Spanish phonemes
   * @private
   */
  _getSpanishPhonemes() {
    return {
      'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'b': 'b', 'c': 'θ', 'd': 'd', 'f': 'f', 'g': 'x',
      'h': 'silent', 'j': 'x', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'r': 'ɾ', 's': 's', 't': 't'
    };
  }

  /**
   * French phonemes
   * @private
   */
  _getFrenchPhonemes() {
    return {
      'a': 'a', 'e': 'ə', 'i': 'i', 'o': 'o', 'u': 'y',
      'á': 'a', 'é': 'e', 'è': 'ɛ', 'ê': 'ɛ', 'ë': 'ə',
      'b': 'b', 'c': 's', 'd': 'd', 'f': 'f', 'g': 'ʒ',
      'h': 'silent', 'j': 'ʒ', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'r': 'ʁ', 's': 's', 't': 't'
    };
  }

  /**
   * German phonemes
   * @private
   */
  _getGermanPhonemes() {
    return {
      'a': 'a', 'e': 'ə', 'i': 'i', 'o': 'o', 'u': 'u',
      'ä': 'ɛ', 'ö': 'ø', 'ü': 'y',
      'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
      'h': 'h', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'r': 'ʁ', 's': 'z', 't': 't'
    };
  }

  /**
   * Italian phonemes
   * @private
   */
  _getItalianPhonemes() {
    return {
      'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
      'b': 'b', 'c': 'tʃ', 'd': 'd', 'f': 'f', 'g': 'dʒ',
      'h': 'silent', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'r': 'r', 's': 's', 't': 't'
    };
  }

  /**
   * Portuguese phonemes
   * @private
   */
  _getPortuguesePhonemes() {
    return {
      'a': 'a', 'e': 'ə', 'i': 'i', 'o': 'o', 'u': 'u',
      'ã': 'ɐ̃', 'õ': 'õ',
      'b': 'b', 'c': 's', 'd': 'd', 'f': 'f', 'g': 'ɡ',
      'h': 'silent', 'j': 'ʒ', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'r': 'ʁ', 's': 's', 't': 't'
    };
  }

  /**
   * Japanese phonemes
   * @private
   */
  _getJapanesePhonemes() {
    return {
      'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
      'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
      'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
      'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to'
    };
  }

  /**
   * Mandarin phonemes
   * @private
   */
  _getMandarinPhonemes() {
    return {
      '啊': 'a', '哦': 'o', '呜': 'u', '鹅': 'e',
      '八': 'ba', '比': 'bi', '布': 'bu', '波': 'bo',
      '妈': 'ma', '美': 'mei', '木': 'mu', '摩': 'mo'
    };
  }

  /**
   * Register language change callback
   */
  onLanguageChange(callback) {
    this.languageChangeCallbacks.push(callback);
  }

  /**
   * Notify language change
   * @private
   */
  _notifyLanguageChange(newLanguage, oldLanguage) {
    this.languageChangeCallbacks.forEach(callback => 
      callback({ new: newLanguage, old: oldLanguage })
    );
  }

  /**
   * Get all supported languages
   * @returns {Object} Supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Get current language info
   * @returns {Object} Current language configuration
   */
  getCurrentLanguageInfo() {
    return {
      code: this.currentLanguage,
      ...this.supportedLanguages[this.currentLanguage]
    };
  }

  /**
   * Dispose
   */
  dispose() {
    this.languageChangeCallbacks = [];
    this.phonemeMaps = {};
  }
}

export default MultiLanguageSupportService;
