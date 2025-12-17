// public/bella/hooks/useAdaptiveAvatarMode.js

import { useState, useEffect, useRef } from 'react';

/**
 * Centralized adaptive mode hook.
 *
 * Expects:
 *  - performanceService: instance of PerformanceMonitorService
 *  - networkService: instance of NetworkAdaptationService
 *  - forcedMode: optional override from UI
 *
 * Returns:
 *  {
 *    mode,               // 'video' | '3d' | 'hybrid'
 *    perfProfile,        // 'low' | 'medium' | 'high' | 'ultra'
 *    networkProfile,     // 'excellent' | 'good' | 'poor' | 'critical'
 *    setForcedMode       // function(newMode | null)
 *  }
 */
const useAdaptiveAvatarMode = (performanceService, networkService, forcedModeProp = null) => {
  const [mode, setMode] = useState('hybrid');
  const [perfProfile, setPerfProfile] = useState('high');
  const [networkProfile, setNetworkProfile] = useState('good');
  const [forcedMode, setForcedMode] = useState(forcedModeProp);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setForcedMode(forcedModeProp);
  }, [forcedModeProp]);

  useEffect(() => {
    const handlePerfDrop = (payload) => {
      if (!mountedRef.current) return;
      const profile = payload?.profile || 'medium';
      setPerfProfile(profile);
      recalcMode(profile, networkProfile, forcedMode);
    };

    const handlePerfRecovered = (payload) => {
      if (!mountedRef.current) return;
      const profile = payload?.profile || 'high';
      setPerfProfile(profile);
      recalcMode(profile, networkProfile, forcedMode);
    };

    const handleNetworkProfileChanged = (payload) => {
      if (!mountedRef.current) return;
      const profile = payload?.profile || 'good';
      setNetworkProfile(profile);
      recalcMode(perfProfile, profile, forcedMode);
    };

    if (performanceService && typeof performanceService.on === 'function') {
      performanceService.on('performance:drop', handlePerfDrop);
      performanceService.on('performance:recovered', handlePerfRecovered);
    }

    if (networkService && typeof networkService.on === 'function') {
      networkService.on('network:profileChanged', handleNetworkProfileChanged);
    }

    return () => {
      if (performanceService && typeof performanceService.off === 'function') {
        performanceService.off('performance:drop', handlePerfDrop);
        performanceService.off('performance:recovered', handlePerfRecovered);
      }
      if (networkService && typeof networkService.off === 'function') {
        networkService.off('network:profileChanged', handleNetworkProfileChanged);
      }
    };
  }, [performanceService, networkService, perfProfile, networkProfile, forcedMode]);

  const recalcMode = (perf, network, forced) => {
    if (!mountedRef.current) return;

    if (forced) {
      setMode(forced);
      return;
    }

    let nextMode = 'hybrid';

    // Network-critical: prefer video with shorter / cached responses
    if (network === 'critical') {
      nextMode = 'video';
    } else if (perf === 'low') {
      // Low FPS: avoid hybrid; pick cheaper path
      nextMode = network === 'excellent' || network === 'good' ? 'video' : '3d';
    } else if (perf === 'medium') {
      nextMode = 'video'; // safe default
    } else if (perf === 'high' || perf === 'ultra') {
      if (network === 'poor') {
        nextMode = '3d';
      } else {
        nextMode = 'hybrid';
      }
    }

    setMode(nextMode);
  };

  return {
    mode,
    perfProfile,
    networkProfile,
    setForcedMode
  };
};

export default useAdaptiveAvatarMode;
