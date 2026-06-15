/**
 * IncidentEchoVisualization.jsx
 * Renders animated ripple waves for Incident Echo system
 * Displays incident resonance as expanding circles on map/canvas
 */

import React, { useEffect, useRef } from 'react';
import { getWaveColor, getWaveColorRGB } from '../utils/echoAnimations';

const IncidentEchoVisualization = ({ waves = [], containerWidth = 800, containerHeight = 600 }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw each wave
      waves.forEach((wave) => {
        if (!wave.isActive) return;

        const color = getWaveColor(wave.severity);
        const radius = wave.expandedRadius || 0;
        const opacity = wave.opacity || 1;

        // Draw outer circle (main wave)
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity * 0.8;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw secondary wave rings
        ctx.globalAlpha = opacity * 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = opacity * 0.3;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, radius * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        // Draw center pulse
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Set canvas size
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [waves, containerWidth, containerHeight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }}
    />
  );
};

export default IncidentEchoVisualization;

/**
 * SVG-based alternative visualization component
 */
export const IncidentEchoVisualizationSVG = ({ waves = [], containerWidth = 800, containerHeight = 600, onWaveClick = () => {} }) => {
  return (
    <svg
      width={containerWidth}
      height={containerHeight}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    >
      <defs>
        <style>{`
          @keyframes waveExpand {
            0% {
              r: 0;
              stroke-width: 3;
              opacity: 0.8;
            }
            50% {
              stroke-width: 2;
              opacity: 0.5;
            }
            100% {
              stroke-width: 1;
              opacity: 0;
            }
          }
          
          @keyframes wavePulse {
            0%, 100% {
              r: 5;
              opacity: 1;
            }
            50% {
              r: 8;
              opacity: 0.7;
            }
          }
          
          .echo-wave {
            cursor: pointer;
            filter: drop-shadow(0 0 4px currentColor);
          }
          
          .echo-wave:hover {
            filter: drop-shadow(0 0 8px currentColor);
          }
        `}</style>
      </defs>

      {waves.map((wave) => {
        if (!wave.isActive) return null;

        const color = getWaveColor(wave.severity);
        const radius = wave.expandedRadius || 0;
        const opacity = (wave.opacity || 1) * 100;

        return (
          <g
            key={wave.id}
            className="echo-wave"
            onClick={() => onWaveClick(wave)}
            style={{ color }}
          >
            {/* Outer expanding ring */}
            <circle
              cx={wave.x}
              cy={wave.y}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="3"
              opacity={opacity / 100}
              style={{
                animation: `waveExpand ${8}s ease-out forwards`,
              }}
            />

            {/* Secondary ring */}
            <circle
              cx={wave.x}
              cy={wave.y}
              r={radius * 0.7}
              fill="none"
              stroke={color}
              strokeWidth="2"
              opacity={(opacity / 100) * 0.6}
              style={{
                animation: `waveExpand ${8}s ease-out ${0.2}s forwards`,
              }}
            />

            {/* Tertiary ring */}
            <circle
              cx={wave.x}
              cy={wave.y}
              r={radius * 0.4}
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity={(opacity / 100) * 0.3}
              style={{
                animation: `waveExpand ${8}s ease-out ${0.4}s forwards`,
              }}
            />

            {/* Center pulse */}
            <circle
              cx={wave.x}
              cy={wave.y}
              r="5"
              fill={color}
              opacity={opacity / 100}
              style={{
                animation: `wavePulse 0.8s ease-in-out infinite`,
              }}
            />

            {/* Severity indicator label */}
            <text
              x={wave.x}
              y={wave.y - radius - 10}
              textAnchor="middle"
              fill={color}
              fontSize="12"
              fontWeight="bold"
              opacity={(opacity / 100) * 0.8}
              pointerEvents="none"
            >
              {wave.severity}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/**
 * Compact wave indicator showing current active waves
 */
export const EchoWaveIndicator = ({ waves = [], maxDisplay = 10 }) => {
  const activeWaves = waves.filter((w) => w.isActive).slice(0, maxDisplay);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-white/10">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      <span className="text-xs text-gray-400 font-mono">
        🌊 {activeWaves.length} active wave{activeWaves.length !== 1 ? 's' : ''}
      </span>
      <div className="flex gap-1 ml-2">
        {activeWaves.slice(0, 3).map((wave) => (
          <div
            key={wave.id}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: getWaveColor(wave.severity),
              opacity: wave.opacity || 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
};
