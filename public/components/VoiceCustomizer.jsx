import React, { useState, useCallback } from 'react';
import './VoiceCustomizer.css';

const VoiceCustomizer = ({ onConfigChange, initialConfig = {} }) => {
  const [config, setConfig] = useState({
    voice: initialConfig.voice || 'nova',
    speed: initialConfig.speed || 1.0,
    pitch: initialConfig.pitch || 1.0,
    volume: initialConfig.volume || 1.0,
    language: initialConfig.language || 'en-US',
    emotionalTone: initialConfig.emotionalTone || 'neutral',
    ...initialConfig,
  });

  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState(
    JSON.parse(localStorage.getItem('voicePresets') || '[]')
  );

  const handleConfigChange = useCallback((key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [config, onConfigChange]);

  const savePreset = useCallback(() => {
    if (!presetName.trim()) return;
    const updatedPresets = [
      ...savedPresets,
      { name: presetName, config },
    ];
    setSavedPresets(updatedPresets);
    localStorage.setItem('voicePresets', JSON.stringify(updatedPresets));
    setPresetName('');
  }, [presetName, config, savedPresets]);

  const loadPreset = useCallback((preset) => {
    setConfig(preset.config);
    onConfigChange?.(preset.config);
  }, [onConfigChange]);

  const deletePreset = useCallback((index) => {
    const updated = savedPresets.filter((_, i) => i !== index);
    setSavedPresets(updated);
    localStorage.setItem('voicePresets', JSON.stringify(updated));
  }, [savedPresets]);

  const resetToDefaults = useCallback(() => {
    const defaults = {
      voice: 'nova',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      language: 'en-US',
      emotionalTone: 'neutral',
    };
    setConfig(defaults);
    onConfigChange?.(defaults);
  }, [onConfigChange]);

  return (
    <div className="voice-customizer">
      <h3>Voice Settings</h3>

      <div className="settings-grid">
        <div className="setting-group">
          <label htmlFor="voice">Voice:</label>
          <select
            id="voice"
            value={config.voice}
            onChange={(e) => handleConfigChange('voice', e.target.value)}
          >
            <option value="nova">Nova</option>
            <option value="alloy">Alloy</option>
            <option value="echo">Echo</option>
            <option value="fable">Fable</option>
            <option value="onyx">Onyx</option>
            <option value="shimmer">Shimmer</option>
          </select>
        </div>

        <div className="setting-group">
          <label htmlFor="speed">
            Speed: <span className="value">{config.speed.toFixed(1)}x</span>
          </label>
          <input
            id="speed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={config.speed}
            onChange={(e) => handleConfigChange('speed', parseFloat(e.target.value))}
          />
        </div>

        <div className="setting-group">
          <label htmlFor="pitch">
            Pitch: <span className="value">{config.pitch.toFixed(1)}</span>
          </label>
          <input
            id="pitch"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={config.pitch}
            onChange={(e) => handleConfigChange('pitch', parseFloat(e.target.value))}
          />
        </div>

        <div className="setting-group">
          <label htmlFor="volume">
            Volume: <span className="value">{Math.round(config.volume * 100)}%</span>
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.volume}
            onChange={(e) => handleConfigChange('volume', parseFloat(e.target.value))}
          />
        </div>

        <div className="setting-group">
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={config.language}
            onChange={(e) => handleConfigChange('language', e.target.value)}
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="it-IT">Italian</option>
          </select>
        </div>

        <div className="setting-group">
          <label htmlFor="tone">Tone:</label>
          <select
            id="tone"
            value={config.emotionalTone}
            onChange={(e) => handleConfigChange('emotionalTone', e.target.value)}
          >
            <option value="neutral">Neutral</option>
            <option value="cheerful">Cheerful</option>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="authoritative">Authoritative</option>
          </select>
        </div>
      </div>

      <div className="preset-section">
        <h4>Voice Presets</h4>
        <div className="preset-input">
          <input
            type="text"
            placeholder="Enter preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <button onClick={savePreset} disabled={!presetName.trim()}>
            Save Preset
          </button>
        </div>

        {savedPresets.length > 0 && (
          <div className="saved-presets">
            {savedPresets.map((preset, index) => (
              <div key={index} className="preset-item">
                <button
                  className="preset-load"
                  onClick={() => loadPreset(preset)}
                >
                  {preset.name}
                </button>
                <button
                  className="preset-delete"
                  onClick={() => deletePreset(index)}
                  title="Delete preset"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="button-group">
        <button className="reset-btn" onClick={resetToDefaults}>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default VoiceCustomizer;
