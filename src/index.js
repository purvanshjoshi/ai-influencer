// src/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-influencer';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Import routes
const influencerRoutes = require('./routes/influencerRoutes');
const contentRoutes = require('./routes/contentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Voice AI agent routes (RAG / audio tour / support)
// Adjust the path if your routes file is named differently.
const voiceAgentRoutes = require('./voice_ai_agents/routes');

// API Routes
app.use('/api/influencers', influencerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Mount voice AI agents under /api/voice
app.use('/api/voice', voiceAgentRoutes);

// Health check endpoint (used by NetworkAdaptationService)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'AI Influencer Platform is running',
    timestamp: new Date()
  });
});

// Serve static files (public assets, including Bella public/bella/*)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Example: if you later build a React frontend into /client/build,
// you can serve it here (uncomment when that exists):
// const frontendPath = path.join(__dirname, '..', 'client', 'build');
// app.use(express.static(frontendPath));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`AI Influencer Platform server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
