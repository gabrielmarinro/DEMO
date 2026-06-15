/**
 * useIncidentEcho.js
 * React Hook for managing Incident Echo state and operations
 * Handles incident data, waves, and real-time echo generation
 */

import { useState, useEffect, useCallback } from 'react';
import { generatePatternDNA, groupIncidentsByPattern } from '../utils/echoPatternDNA';
import { predictNextResonance, calculateRiskZones } from '../utils/echoPredictor';

export const useIncidentEcho = (initialIncidents = []) => {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [echoWaves, setEchoWaves] = useState([]);
  const [patterns, setPatterns] = useState({});
  const [predictions, setPredictions] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [isEchoActive, setIsEchoActive] = useState(true);
  const [selectedWave, setSelectedWave] = useState(null);
  const [echoHistory, setEchoHistory] = useState([]);

  // Analyze incidents and generate patterns
  useEffect(() => {
    if (incidents.length === 0) {
      setPatterns({});
      setPredictions([]);
      setRiskZones([]);
      return;
    }

    const analyzedPatterns = groupIncidentsByPattern(incidents);
    setPatterns(analyzedPatterns);

    const predictedPatterns = predictNextResonance(incidents, analyzedPatterns);
    setPredictions(predictedPatterns);

    const riskyZones = calculateRiskZones(incidents);
    setRiskZones(riskyZones);
  }, [incidents]);

  // Generate echo waves from incidents
  const generateEchoWaves = useCallback(() => {
    if (!isEchoActive || incidents.length === 0) return;

    const newWaves = incidents.map((incident) => ({
      id: `wave-${incident.id}-${Date.now()}`,
      incidentId: incident.id,
      x: incident.latitude,
      y: incident.longitude,
      severity: incident.severity || 50,
      timestamp: new Date(incident.timestamp),
      vehicleId: incident.vehicleId,
      createdAt: Date.now(),
      isActive: true,
      expandedRadius: 0,
    }));

    setEchoWaves((prevWaves) => [...prevWaves, ...newWaves]);

    // Add to history
    setEchoHistory((prev) => [...prev, ...newWaves]);
  }, [incidents, isEchoActive]);

  // Update wave expansion over time
  useEffect(() => {
    if (!isEchoActive) return;

    const interval = setInterval(() => {
      setEchoWaves((prevWaves) =>
        prevWaves
          .map((wave) => {
            const elapsed = Date.now() - wave.createdAt;
            const maxDuration = 8000;
            const progress = Math.min(elapsed / maxDuration, 1);

            return {
              ...wave,
              expandedRadius: progress * 150,
              isActive: progress < 1,
              opacity: 1 - progress,
            };
          })
          .filter((wave) => wave.isActive)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isEchoActive]);

  // Add new incident and trigger echo
  const addIncident = useCallback((incident) => {
    const enhancedIncident = {
      ...incident,
      id: incident.id || `incident-${Date.now()}`,
      timestamp: incident.timestamp || new Date(),
    };

    setIncidents((prev) => [...prev, enhancedIncident]);
  }, []);

  // Remove incident
  const removeIncident = useCallback((incidentId) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== incidentId));
  }, []);

  // Clear all waves
  const clearWaves = useCallback(() => {
    setEchoWaves([]);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setEchoHistory([]);
  }, []);

  // Toggle echo system on/off
  const toggleEcho = useCallback(() => {
    setIsEchoActive((prev) => !prev);
  }, []);

  // Get incident details
  const getIncidentDetail = useCallback(
    (incidentId) => {
      return incidents.find((inc) => inc.id === incidentId);
    },
    [incidents]
  );

  // Get pattern details
  const getPatternDetail = useCallback(
    (patternHash) => {
      return patterns[patternHash] || null;
    },
    [patterns]
  );

  // Get resonance between two patterns
  const getResonanceBetweenPatterns = useCallback(
    (patternHash1, patternHash2) => {
      const pattern1 = patterns[patternHash1];
      const pattern2 = patterns[patternHash2];

      if (!pattern1 || !pattern2) return 0;

      const dna1 = generatePatternDNA(pattern1.incidents[0]);
      const dna2 = generatePatternDNA(pattern2.incidents[0]);

      if (!dna1 || !dna2) return 0;

      const { calculateResonance } = require('../utils/echoPatternDNA');
      return calculateResonance(dna1, dna2);
    },
    [patterns]
  );

  // Get affected vehicles for a pattern
  const getAffectedVehicles = useCallback(
    (patternHash) => {
      const pattern = patterns[patternHash];
      if (!pattern) return [];

      return [...new Set(pattern.incidents.map((inc) => inc.vehicleId))];
    },
    [patterns]
  );

  // Get statistics
  const getEchoStats = useCallback(() => {
    return {
      totalIncidents: incidents.length,
      totalPatterns: Object.keys(patterns).length,
      totalPredictions: predictions.length,
      totalRiskZones: riskZones.length,
      activeWaves: echoWaves.filter((w) => w.isActive).length,
      totalWaves: echoWaves.length,
      historySize: echoHistory.length,
    };
  }, [incidents, patterns, predictions, riskZones, echoWaves, echoHistory]);

  return {
    // State
    incidents,
    echoWaves,
    patterns,
    predictions,
    riskZones,
    isEchoActive,
    selectedWave,
    echoHistory,

    // Actions
    addIncident,
    removeIncident,
    setIncidents,
    setSelectedWave,
    generateEchoWaves,
    clearWaves,
    clearHistory,
    toggleEcho,

    // Queries
    getIncidentDetail,
    getPatternDetail,
    getResonanceBetweenPatterns,
    getAffectedVehicles,
    getEchoStats,
  };
};

export default useIncidentEcho;
