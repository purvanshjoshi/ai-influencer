/**
 * Voice AI Agents Integration Routes - PHASE 1 & 2
 * Express routes that proxy to Flask Python voice services
 * Bridges Node.js backend with Python AI agents
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();
const logger = require('../utils/logger'); // Your logging utility

// Flask service URLs (from environment variables)
const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:5000';
const AUDIO_TOUR_SERVICE_URL = process.env.AUDIO_TOUR_SERVICE_URL || `${VOICE_SERVICE_URL}/api/voice/audio-tour`;
const CUSTOMER_SUPPORT_SERVICE_URL = process.env.CUSTOMER_SUPPORT_SERVICE_URL || `${VOICE_SERVICE_URL}/api/voice/customer-support`;
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || `${VOICE_SERVICE_URL}/api/voice/rag`;

// Health check for voice services
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${VOICE_SERVICE_URL}/health`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    logger.error('Voice service health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      message: 'Voice services unavailable',
      details: error.message
    });
  }
});

// ============ AUDIO TOUR ROUTES ============
router.post('/audio-tour/generate', async (req, res) => {
  try {
    const { location, interests, duration, voice } = req.body;
    
    if (!location) {
      return res.status(400).json({ status: 'error', message: 'Location is required' });
    }
    
    const response = await axios.post(`${AUDIO_TOUR_SERVICE_URL}/generate`, {
      location,
      interests: interests || ['history', 'culture'],
      duration: duration || 30,
      voice: voice || 'nova'
    });
    
    // TODO: Save to Influencer model with voiceProfile metadata
    logger.info(`Audio tour generated for ${location}`);
    res.json(response.data);
  } catch (error) {
    logger.error('Audio tour generation failed:', error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to generate audio tour',
      details: error.message
    });
  }
});

router.get('/audio-tour/interests', async (req, res) => {
  try {
    const response = await axios.get(`${AUDIO_TOUR_SERVICE_URL}/interests`);
    res.json(response.data);
  } catch (error) {
    logger.error('Failed to fetch interests:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch interests' });
  }
});

// ============ CUSTOMER SUPPORT ROUTES ============
router.post('/customer-support/initialize', async (req, res) => {
  try {
    const { documentationUrl, voice } = req.body;
    
    if (!documentationUrl) {
      return res.status(400).json({ status: 'error', message: 'Documentation URL is required' });
    }
    
    const response = await axios.post(`${CUSTOMER_SUPPORT_SERVICE_URL}/initialize`, {
      documentationUrl,
      voice: voice || 'nova'
    });
    
    logger.info(`Support agent initialized for ${documentationUrl}`);
    res.json(response.data);
  } catch (error) {
    logger.error('Support agent initialization failed:', error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to initialize support agent',
      details: error.message
    });
  }
});

router.post('/customer-support/query', async (req, res) => {
  try {
    const { question, agentId, voice } = req.body;
    
    if (!question) {
      return res.status(400).json({ status: 'error', message: 'Question is required' });
    }
    
    const response = await axios.post(`${CUSTOMER_SUPPORT_SERVICE_URL}/query`, {
      question,
      agentId,
      voice: voice || 'nova'
    });
    
    logger.info(`Support query processed: ${question.substring(0, 50)}`);
    res.json(response.data);
  } catch (error) {
    logger.error('Support query failed:', error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to process support query',
      details: error.message
    });
  }
});

router.get('/customer-support/voices', async (req, res) => {
  try {
    const response = await axios.get(`${CUSTOMER_SUPPORT_SERVICE_URL}/voices`);
    res.json(response.data);
  } catch (error) {
    logger.error('Failed to fetch voices:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch voices' });
  }
});

// ============ VOICE RAG ROUTES ============
router.post('/rag/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ status: 'error', message: 'No file provided' });
    }
    
    const formData = new FormData();
    const file = req.files.file;
    formData.append('file', file.data, file.name);
    formData.append('documentName', req.body.documentName || file.name);
    
    const response = await axios.post(`${RAG_SERVICE_URL}/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    logger.info(`Document uploaded: ${file.name}`);
    res.json(response.data);
  } catch (error) {
    logger.error('Document upload failed:', error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to upload document',
      details: error.message
    });
  }
});

router.post('/rag/query', async (req, res) => {
  try {
    const { question, documentId, voice } = req.body;
    
    if (!question) {
      return res.status(400).json({ status: 'error', message: 'Question is required' });
    }
    
    const response = await axios.post(`${RAG_SERVICE_URL}/query`, {
      question,
      documentId,
      voice: voice || 'nova'
    });
    
    logger.info(`RAG query processed: ${question.substring(0, 50)}`);
    res.json(response.data);
  } catch (error) {
    logger.error('RAG query failed:', error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to process RAG query',
      details: error.message
    });
  }
});

router.get('/rag/documents', async (req, res) => {
  try {
    const response = await axios.get(`${RAG_SERVICE_URL}/documents`);
    res.json(response.data);
  } catch (error) {
    logger.error('Failed to fetch documents:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch documents' });
  }
});

module.exports = router;
