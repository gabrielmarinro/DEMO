/**
 * echoAnimations.js
 * Animation utilities for Incident Echo ripple effects
 * Handles wave generation, expansion, and color transitions
 */

export const generateWaveAnimation = (incidentId, severity) => {
  const maxDuration = 8000; // 8 seconds for wave to fully expand
  const duration = Math.max(3000, maxDuration - severity * 10);

  return {
    id: `wave-${incidentId}`,
    duration,
    delay: 0,
    keyframes: [
      { offset: 0, opacity: 0.8, radius: 0 },
      { offset: 0.5, opacity: 0.5, radius: 50 },
      { offset: 1, opacity: 0, radius: 150 },
    ],
  };
};

export const getWaveColor = (severity) => {
  // Severity 0-100 scale
  if (severity >= 90) return '#dc2626'; // Red - Critical
  if (severity >= 75) return '#ea580c'; // Orange - High
  if (severity >= 60) return '#eab308'; // Yellow - Medium
  if (severity >= 45) return '#3b82f6'; // Blue - Moderate
  return '#22c55e'; // Green - Low
};

export const getWaveColorRGB = (severity) => {
  if (severity >= 90) return 'rgb(220, 38, 38)'; // Red
  if (severity >= 75) return 'rgb(234, 88, 12)'; // Orange
  if (severity >= 60) return 'rgb(234, 179, 8)'; // Yellow
  if (severity >= 45) return 'rgb(59, 130, 246)'; // Blue
  return 'rgb(34, 197, 94)'; // Green
};

export const pulseAnimation = (severity) => {
  const frequency = Math.max(0.5, 2 - severity / 50); // Faster pulse for higher severity

  return {
    keyframes: [
      { offset: 0, scale: 1, opacity: 1 },
      { offset: 0.5, scale: 1.1, opacity: 0.8 },
      { offset: 1, scale: 1, opacity: 1 },
    ],
    duration: 1000 / frequency,
    iterationCount: 'infinite',
  };
};

export const echoWaveExpansion = (maxRadius = 150) => {
  return {
    keyframes: [
      { offset: 0, r: 0, 'stroke-width': 3, opacity: 0.8 },
      { offset: 0.3, r: maxRadius * 0.3, 'stroke-width': 2.5, opacity: 0.6 },
      { offset: 0.7, r: maxRadius * 0.7, 'stroke-width': 2, opacity: 0.3 },
      { offset: 1, r: maxRadius, 'stroke-width': 1, opacity: 0 },
    ],
    duration: 3000,
  };
};

export const calculateWavePosition = (centerLat, centerLon, mapWidth, mapHeight, minLat, maxLat, minLon, maxLon) => {
  // Convert geographic coordinates to pixel coordinates
  const x = ((centerLon - minLon) / (maxLon - minLon)) * mapWidth;
  const y = ((maxLat - centerLat) / (maxLat - minLat)) * mapHeight;

  return { x, y };
};

export const resonanceGlowAnimation = (resonanceStrength) => {
  // resonanceStrength: 0-100
  const glowIntensity = resonanceStrength / 100;
  const shadowBlur = 5 + glowIntensity * 20;
  const shadowOpacity = 0.3 + glowIntensity * 0.5;

  return {
    boxShadow: `0 0 ${shadowBlur}px rgba(${getWaveColorRGB(resonanceStrength)}, ${shadowOpacity})`,
    animation: `resonanceGlow ${1000 + resonanceStrength * 10}ms infinite`,
  };
};

export const timelineAnimationSequence = (incidents) => {
  // Generate staggered animations for timeline events
  return incidents.map((incident, index) => ({
    incidentId: incident.id,
    delay: index * 200, // 200ms stagger between items
    duration: 1000,
    animation: 'slideInUp',
  }));
};

export const waveCollision = (wave1, wave2) => {
  // Calculate if two waves collide and return interference pattern
  const dx = wave2.x - wave1.x;
  const dy = wave2.y - wave1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const collision = distance < wave1.radius + wave2.radius;

  if (collision) {
    // Interference pattern: both waves amplify or cancel
    const avgSeverity = (wave1.severity + wave2.severity) / 2;
    const constructive = Math.abs(wave1.severity - wave2.severity) < 20;

    return {
      collides: true,
      distance,
      interference: constructive ? 'constructive' : 'destructive',
      resultingSeverity: constructive ? Math.min(100, avgSeverity * 1.2) : avgSeverity * 0.8,
      x: (wave1.x + wave2.x) / 2,
      y: (wave1.y + wave2.y) / 2,
    };
  }

  return { collides: false };
};

export const createStaggeredEntrance = (itemCount, totalDuration = 1000) => {
  const itemDuration = totalDuration / itemCount;

  return Array.from({ length: itemCount }, (_, i) => ({
    delay: i * itemDuration,
    duration: itemDuration,
  }));
};

export const fadeInScale = (duration = 500, fromScale = 0.8, toScale = 1) => {
  return {
    keyframes: [
      { offset: 0, opacity: 0, transform: `scale(${fromScale})` },
      { offset: 1, opacity: 1, transform: `scale(${toScale})` },
    ],
    duration,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  };
};

export const resonanceFlicker = (baseColor, highlightColor) => {
  return {
    keyframes: [
      { offset: 0, fill: baseColor, opacity: 0.6 },
      { offset: 0.5, fill: highlightColor, opacity: 1 },
      { offset: 1, fill: baseColor, opacity: 0.6 },
    ],
    duration: 600,
    iterationCount: 'infinite',
  };
};

export const waveDispersion = (waveId, maxDistance = 300) => {
  // Animation for wave dispersing/fading as it expands
  return {
    keyframes: [
      { offset: 0, opacity: 1, filter: 'blur(0px)' },
      { offset: 0.5, opacity: 0.7, filter: 'blur(1px)' },
      { offset: 1, opacity: 0, filter: 'blur(3px)' },
    ],
    duration: 4000,
  };
};

export const buildCSSKeyframes = (animationName, keyframes) => {
  // Build CSS @keyframes string from keyframe objects
  const frameStrings = keyframes.map((frame) => {
    const offset = Math.round(frame.offset * 100);
    const properties = Object.entries(frame)
      .filter(([key]) => key !== 'offset')
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');

    return `${offset}% { ${properties} }`;
  });

  return `@keyframes ${animationName} { ${frameStrings.join(' ')} }`;
};

export const easeOutExpo = (t) => {
  // Easing function: ease out exponential
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const easeInOutQuad = (t) => {
  // Easing function: ease in-out quadratic
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};
