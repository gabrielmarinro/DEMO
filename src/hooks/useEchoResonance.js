/**
 * useEchoResonance.js
 * React Hook for calculating and managing resonance between incident patterns
 * Tracks pattern similarities and their propagation
 */

import { useState, useCallback, useMemo } from 'react';
import { generatePatternDNA, calculateResonance } from '../utils/echoPatternDNA';

export const useEchoResonance = (patterns = {}) => {
  const [resonanceMatrix, setResonanceMatrix] = useState({});
  const [dominantPatterns, setDominantPatterns] = useState([]);
  const [resonanceChains, setResonanceChains] = useState([]);

  // Calculate resonance between all patterns
  const calculateFullResonanceMatrix = useCallback(() => {
    if (Object.keys(patterns).length === 0) {
      setResonanceMatrix({});
      return;
    }

    const patternKeys = Object.keys(patterns);
    const matrix = {};

    patternKeys.forEach((key1) => {
      matrix[key1] = {};

      patternKeys.forEach((key2) => {
        if (key1 === key2) {
          matrix[key1][key2] = 100;
          return;
        }

        const pattern1 = patterns[key1];
        const pattern2 = patterns[key2];

        if (!pattern1.incidents || !pattern2.incidents || pattern1.incidents.length === 0 || pattern2.incidents.length === 0) {
          matrix[key1][key2] = 0;
          return;
        }

        const dna1 = generatePatternDNA(pattern1.incidents[0]);
        const dna2 = generatePatternDNA(pattern2.incidents[0]);

        if (!dna1 || !dna2) {
          matrix[key1][key2] = 0;
          return;
        }

        const resonanceScore = calculateResonance(dna1, dna2);
        matrix[key1][key2] = resonanceScore;
      });
    });

    setResonanceMatrix(matrix);
  }, [patterns]);

  // Identify dominant patterns (those with highest resonance)
  const identifyDominantPatterns = useCallback(() => {
    if (Object.keys(patterns).length === 0) {
      setDominantPatterns([]);
      return;
    }

    const patternArray = Object.entries(patterns).map(([hash, pattern]) => {
      const dna = pattern.incidents && pattern.incidents.length > 0 
        ? generatePatternDNA(pattern.incidents[0])
        : null;

      const totalResonance = Object.values(resonanceMatrix[hash] || {}).reduce(
        (sum, score) => sum + (score || 0),
        0
      );

      return {
        patternHash: hash,
        patternDNA: pattern.patternDNA,
        incidentCount: pattern.incidents ? pattern.incidents.length : 0,
        severity: pattern.severity || 50,
        totalResonance,
        avgResonance: totalResonance / Math.max(Object.keys(patterns).length, 1),
      };
    });

    const sorted = patternArray.sort(
      (a, b) => b.totalResonance - a.totalResonance
    );

    setDominantPatterns(sorted.slice(0, 5)); // Top 5 dominant patterns
  }, [patterns, resonanceMatrix]);

  // Build resonance chains (cascading patterns)
  const buildResonanceChains = useCallback(() => {
    if (Object.keys(resonanceMatrix).length === 0) {
      setResonanceChains([]);
      return;
    }

    const chains = [];
    const visited = new Set();

    Object.keys(resonanceMatrix).forEach((startKey) => {
      if (visited.has(startKey)) return;

      const chain = [startKey];
      let current = startKey;
      let iterations = 0;
      const maxIterations = 10;

      while (iterations < maxIterations) {
        const resonances = resonanceMatrix[current];
        if (!resonances) break;

        let nextKey = null;
        let maxResonance = 0;

        Object.entries(resonances).forEach(([key, score]) => {
          if (!visited.has(key) && score > maxResonance && score > 50) {
            maxResonance = score;
            nextKey = key;
          }
        });

        if (!nextKey) break;

        chain.push(nextKey);
        visited.add(nextKey);
        current = nextKey;
        iterations++;
      }

      if (chain.length > 1) {
        chains.push({
          id: `chain-${Date.now()}-${Math.random()}`,
          patterns: chain,
          length: chain.length,
          strength: chain.length * 20,
        });
      }

      visited.add(startKey);
    });

    setResonanceChains(chains);
  }, [resonanceMatrix]);

  // Get resonance score between two specific patterns
  const getResonanceScore = useCallback(
    (patternHash1, patternHash2) => {
      return resonanceMatrix[patternHash1]?.[patternHash2] || 0;
    },
    [resonanceMatrix]
  );

  // Get all patterns resonating with a specific pattern
  const getResonatingPatterns = useCallback(
    (patternHash, minResonance = 50) => {
      const resonances = resonanceMatrix[patternHash];
      if (!resonances) return [];

      return Object.entries(resonances)
        .filter(([, score]) => score >= minResonance && score < 100)
        .sort(([, a], [, b]) => b - a)
        .map(([hash, score]) => ({
          patternHash: hash,
          resonanceScore: score,
          pattern: patterns[hash],
        }));
    },
    [resonanceMatrix, patterns]
  );

  // Calculate resonance propagation strength
  const getResonancePropagationStrength = useCallback(
    (patternHash) => {
      const dominantCount = dominantPatterns.filter(
        (p) => getResonanceScore(patternHash, p.patternHash) > 60
      ).length;

      const resonatingPatterns = getResonatingPatterns(patternHash, 60);

      return Math.round((dominantCount * 20 + resonatingPatterns.length * 10) / 3);
    },
    [dominantPatterns, getResonanceScore, getResonatingPatterns]
  );

  // Get resonance statistics
  const getResonanceStats = useMemo(() => {
    const allScores = Object.values(resonanceMatrix).flatMap((row) =>
      Object.values(row)
    );

    if (allScores.length === 0) {
      return {
        avgResonance: 0,
        maxResonance: 0,
        minResonance: 0,
        totalPairs: 0,
        strongResonances: 0,
      };
    }

    const strongResonances = allScores.filter((s) => s > 70).length;

    return {
      avgResonance: Math.round(
        allScores.reduce((a, b) => a + b, 0) / allScores.length
      ),
      maxResonance: Math.max(...allScores),
      minResonance: Math.min(...allScores),
      totalPairs: allScores.length,
      strongResonances,
    };
  }, [resonanceMatrix]);

  // Update calculations when patterns change
  const recalculateResonance = useCallback(() => {
    calculateFullResonanceMatrix();
    identifyDominantPatterns();
    buildResonanceChains();
  }, [calculateFullResonanceMatrix, identifyDominantPatterns, buildResonanceChains]);

  return {
    // State
    resonanceMatrix,
    dominantPatterns,
    resonanceChains,
    resonanceStats: getResonanceStats,

    // Actions
    recalculateResonance,

    // Queries
    getResonanceScore,
    getResonatingPatterns,
    getResonancePropagationStrength,
  };
};

export default useEchoResonance;
