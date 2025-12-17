// src/App.jsx
import React from 'react';
import { InfluencerAvatarProvider } from './context/InfluencerAvatarContext';
import StudioAvatarPanel from './Studio/StudioAvatarPanel';

const App = () => (
  <InfluencerAvatarProvider>
    <StudioAvatarPanel />
  </InfluencerAvatarProvider>
);

export default App;
