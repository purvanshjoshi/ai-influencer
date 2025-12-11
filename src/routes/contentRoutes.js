const express = require('express');
const router = express.Router();
const ContentGenerator = require('../core/content-generator');

let contentLibrary = {};

// Generate new content
router.post('/generate', async (req, res) => {
  try {
    const { influencerId, topic, contentType = 'post' } = req.body;
    
    const generator = new ContentGenerator({ personality: 'engaging' });
    const content = await generator.generateContent(topic, contentType);
    
    const contentId = Date.now().toString();
    contentLibrary[contentId] = {
      influencerId,
      ...content
    };
    
    res.status(201).json({
      success: true,
      contentId,
      content
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get content by ID
router.get('/:id', (req, res) => {
  try {
    const content = contentLibrary[req.params.id];
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all content
router.get('/', (req, res) => {
  try {
    const contentList = Object.entries(contentLibrary).map(([id, content]) => ({
      id,
      ...content
    }));
    res.json(contentList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update content
router.put('/:id', (req, res) => {
  try {
    if (contentLibrary[req.params.id]) {
      contentLibrary[req.params.id] = {
        ...contentLibrary[req.params.id],
        ...req.body
      };
      res.json({ success: true, content: contentLibrary[req.params.id] });
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete content
router.delete('/:id', (req, res) => {
  try {
    if (contentLibrary[req.params.id]) {
      delete contentLibrary[req.params.id];
      res.json({ success: true, message: 'Content deleted' });
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
