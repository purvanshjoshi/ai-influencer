/**
 * Personality Engine for Bella AI Influencers
 * Manages personality traits, voice, and communication styles
 */

const personalityTypes = {
  trendsetter: {
    tone: 'confident, innovative, forward-thinking',
    vocabulary: 'modern, trendy, aspirational',
    postingStyle: 'frequent, engaging, trend-focused',
    temperament: 'enthusiastic, bold, experimental'
  },
  thoughtful: {
    tone: 'introspective, intellectual, analytical',
    vocabulary: 'sophisticated, nuanced, thoughtful',
    postingStyle: 'less frequent, deep content, educational',
    temperament: 'calm, measured, philosophical'
  },
  entertaining: {
    tone: 'humorous, lighthearted, energetic',
    vocabulary: 'casual, playful, witty',
    postingStyle: 'frequent, meme-heavy, comedic',
    temperament: 'fun-loving, spontaneous, witty'
  },
  authentic: {
    tone: 'genuine, relatable, honest',
    vocabulary: 'conversational, real-world, sincere',
    postingStyle: 'consistent, personal, genuine',
    temperament: 'empathetic, transparent, grounded'
  },
  luxury: {
    tone: 'sophisticated, exclusive, aspirational',
    vocabulary: 'premium, refined, elegant',
    postingStyle: 'curated, high-quality, selective',
    temperament: 'refined, discerning, elegant'
  }
};

class PersonalityEngine {
  constructor(personalityType = 'authentic') {
    this.personalityType = personalityType;
    this.profile = personalityTypes[personalityType] || personalityTypes.authentic;
    this.traits = this.initializeTraits();
  }

  initializeTraits() {
    return {
      type: this.personalityType,
      tone: this.profile.tone,
      vocabulary: this.profile.vocabulary,
      postingStyle: this.profile.postingStyle,
      temperament: this.profile.temperament
    };
  }

  generateHashtagStyle() {
    const styles = {
      trendsetter: ['#trending', '#innovative', '#future'],
      thoughtful: ['#mindful', '#philosophy', '#thoughts'],
      entertaining: ['#funny', '#hilarious', '#funnyvideos'],
      authentic: ['#real', '#authentic', '#genuine'],
      luxury: ['#luxury', '#exclusive', '#premium']
    };
    return styles[this.personalityType] || styles.authentic;
  }

  getEngagementStrategy() {
    return {
      responseTime: this.personalityType === 'trendsetter' ? 'immediate' : 'thoughtful',
      interactionFrequency: this.personalityType === 'entertaining' ? 'high' : 'moderate'
    };
  }

  adaptToFeedback(feedback) {
    if (feedback.engagementRate > 0.15) {
      // Keep current personality
      return;
    } else if (feedback.controversyRatio > 0.3) {
      // Tone down
      this.personalityType = 'thoughtful';
      this.profile = personalityTypes.thoughtful;
    }
  }

  getProfile() {
    return this.traits;
  }
}

module.exports = PersonalityEngine;
