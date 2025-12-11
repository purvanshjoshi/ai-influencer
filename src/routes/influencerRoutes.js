const express = require('express');
const router = express.Router();
const InfluencerPersonality = require('../core/personality');

// Store influencers in memory (in production, use MongoDB)
let influencers = {};

// Create a new influencer
router.post('/create', async (req, res) => {
  try {
    const { name, personality, tone, audience, niche } = req.body;
    
    const newInfluencer = new InfluencerPersonality({
      name,
      personality,
      tone,
      audience,
      niche
    });
    
    await newInfluencer.initialize();
    
    const influencerId = Date.now().toString();
    influencers[influencerId] = newInfluencer;
    
    res.status(201).json({
      success: true,
      influencerId,
      profile: newInfluencer.getPersonalityProfile()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get influencer profile
router.get('/:id', (req, res) => {
  try {
    const influencer = influencers[req.params.id];
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }
    res.json(influencer.getPersonalityProfile());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all influencers
router.get('/', (req, res) => {
  try {
    const influencersList = Object.entries(influencers).map(([id, inf]) => ({
      id,
      ...inf.getPersonalityProfile()
    }));
    res.json(influencersList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update influencer personality
router.put('/:id', (req, res) => {
  try {
    const influencer = influencers[req.params.id];
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }
    influencer.updatePersonality(req.body);
    res.json({ success: true, profile: influencer.getPersonalityProfile() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete influencer
router.delete('/:id', (req, res) => {
  try {
    if (influencers[req.params.id]) {
      delete influencers[req.params.id];
      res.json({ success: true, message: 'Influencer deleted' });
    } else {
      res.status(404).json({ error: 'Influencer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
