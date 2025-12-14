/**
 * VoiceProfile Model - PHASE 2
 * Extends Influencer with voice AI capabilities
 * Stores voice metadata, assets, and preferences
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voiceProfileSchema = new Schema({
  // Link to parent Influencer
  influencerId: {
    type: Schema.Types.ObjectId,
    ref: 'Influencer',
    required: true,
    unique: true
  },

  // Audio Tour Configuration
  audioTour: {
    enabled: { type: Boolean, default: false },
    locations: [{
      name: String,
      interests: [String],
      duration: { type: Number, enum: [15, 30, 60], default: 30 },
      voice: { type: String, default: 'nova' },
      audioUrl: String,
      generatedAt: Date,
      views: { type: Number, default: 0 }
    }],
    defaultVoice: { type: String, default: 'nova' }
  },

  // Customer Support Configuration
  supportAgent: {
    enabled: { type: Boolean, default: false },
    agentId: String,
    documentationUrl: String,
    voice: { type: String, default: 'nova' },
    documentsProcessed: { type: Number, default: 0 },
    queriesHandled: { type: Number, default: 0 },
    initializationDate: Date,
    lastUpdated: Date
  },

  // Voice RAG Configuration  
  ragSystem: {
    enabled: { type: Boolean, default: false },
    documents: [{
      documentId: String,
      fileName: String,
      name: String,
      chunksCreated: { type: Number, default: 0 },
      uploadedAt: Date,
      queries: { type: Number, default: 0 },
      documentUrl: String
    }],
    voice: { type: String, default: 'nova' },
    totalDocuments: { type: Number, default: 0 }
  },

  // Voice Preferences
  preferences: {
    defaultVoice: { type: String, default: 'nova', enum: ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer', 'verse'] },
    defaultDuration: { type: Number, default: 30 },
    autoGenerateAudio: { type: Boolean, default: false },
    audioQuality: { type: String, enum: ['standard', 'hd'], default: 'standard' },
    enableVoiceInteraction: { type: Boolean, default: true }
  },

  // Voice Assets & URLs
  assets: {
    audioTourUrls: [{
      url: String,
      location: String,
      createdAt: Date,
      duration: Number,
      views: { type: Number, default: 0 }
    }],
    supportResponses: [{
      responseId: String,
      audioUrl: String,
      question: String,
      answer: String,
      createdAt: Date,
      confidence: Number
    }],
    ragResponses: [{
      responseId: String,
      audioUrl: String,
      question: String,
      answer: String,
      documentId: String,
      createdAt: Date,
      similarity: Number
    }]
  },

  // Analytics
  analytics: {
    totalAudioGenerated: { type: Number, default: 0 },
    totalAudioPlays: { type: Number, default: 0 },
    averageEngagementTime: { type: Number, default: 0 },
    userInteractions: { type: Number, default: 0 },
    lastAnalyticsUpdate: Date
  },

  // Service Status
  status: {
    audioTourHealth: { type: String, enum: ['healthy', 'degraded', 'offline'], default: 'offline' },
    supportAgentHealth: { type: String, enum: ['healthy', 'degraded', 'offline'], default: 'offline' },
    ragSystemHealth: { type: String, enum: ['healthy', 'degraded', 'offline'], default: 'offline' }
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
voiceProfileSchema.index({ influencerId: 1 });

// Middleware to update timestamp
voiceProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods
voiceProfileSchema.methods.enableAudioTour = function(location, interests, duration, voice) {
  this.audioTour.enabled = true;
  this.audioTour.locations.push({
    name: location,
    interests: interests || ['history', 'culture'],
    duration: duration || 30,
    voice: voice || this.preferences.defaultVoice
  });
  return this.save();
};

voiceProfileSchema.methods.enableSupportAgent = function(agentId, documentationUrl) {
  this.supportAgent.enabled = true;
  this.supportAgent.agentId = agentId;
  this.supportAgent.documentationUrl = documentationUrl;
  this.supportAgent.initializationDate = Date.now();
  return this.save();
};

voiceProfileSchema.methods.enableRAGSystem = function() {
  this.ragSystem.enabled = true;
  return this.save();
};

voiceProfileSchema.methods.addRAGDocument = function(documentId, fileName, chunksCreated) {
  this.ragSystem.documents.push({
    documentId,
    fileName,
    name: fileName.split('.')[0],
    chunksCreated,
    uploadedAt: Date.now()
  });
  this.ragSystem.totalDocuments = this.ragSystem.documents.length;
  return this.save();
};

voiceProfileSchema.methods.recordAudioPlay = function(assetType) {
  this.analytics.totalAudioPlays += 1;
  if (assetType === 'audioTour') this.audioTour.locations[0].views += 1;
  return this.save();
};

const VoiceProfile = mongoose.model('VoiceProfile', voiceProfileSchema);

module.exports = VoiceProfile;
