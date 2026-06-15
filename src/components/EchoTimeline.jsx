/**
 * EchoTimeline.jsx
 * Displays temporal visualization of incident echoes
 * Shows incident history and pattern evolution over time
 */

import React, { useState, useMemo } from 'react';
import { getWaveColor } from '../utils/echoAnimations';

const EchoTimeline = ({ incidents = [], patterns = {} }) => {
  const [timelineGranularity, setTimelineGranularity] = useState('hour'); // 'hour', 'day', 'week'
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  // Group incidents by time
  const timelineData = useMemo(() => {
    if (incidents.length === 0) return [];

    const grouped = {};
    const now = new Date();

    incidents.forEach((incident) => {
      const incidentTime = new Date(incident.timestamp);
      let timeKey;

      if (timelineGranularity === 'hour') {
        timeKey = incidentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (timelineGranularity === 'day') {
        timeKey = incidentTime.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      } else {
        timeKey = `Week ${Math.ceil(incidentTime.getDate() / 7)}`;
      }

      if (!grouped[timeKey]) {
        grouped[timeKey] = [];
      }
      grouped[timeKey].push(incident);
    });

    return Object.entries(grouped)
      .map(([timeKey, incidents]) => ({
        timeKey,
        incidents,
        count: incidents.length,
        avgSeverity: Math.round(
          incidents.reduce((sum, inc) => sum + inc.severity, 0) / incidents.length
        ),
        maxSeverity: Math.max(...incidents.map((inc) => inc.severity)),
      }))
      .sort((a, b) => {
        // Sort chronologically
        const aTime = new Date(a.timeKey);
        const bTime = new Date(b.timeKey);
        return aTime - bTime;
      });
  }, [incidents, timelineGranularity]);

  const maxCount = Math.max(...timelineData.map((d) => d.count), 1);

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-lg shadow-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">📊 Echo Timeline</h2>
        <div className="flex gap-2">
          {['hour', 'day', 'week'].map((granularity) => (
            <button
              key={granularity}
              onClick={() => setTimelineGranularity(granularity)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                timelineGranularity === granularity
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {granularity.charAt(0).toUpperCase() + granularity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      {timelineData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No incidents recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {timelineData.map((timeData, index) => (
            <div
              key={timeData.timeKey}
              className="group cursor-pointer"
              onClick={() => setSelectedTimeRange(selectedTimeRange === index ? null : index)}
            >
              {/* Timeline Entry */}
              <div className="flex items-end gap-3 mb-2">
                {/* Time Label */}
                <div className="w-20 text-right flex-shrink-0">
                  <span className="text-xs font-mono text-gray-400 group-hover:text-gray-300 transition-colors">
                    {timeData.timeKey}
                  </span>
                </div>

                {/* Bar Chart */}
                <div className="flex-1 flex items-end gap-1 h-12">
                  {/* Incident Count Bar */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all group-hover:from-blue-500 group-hover:to-blue-300"
                      style={{
                        height: `${(timeData.count / maxCount) * 100}%`,
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-xs text-blue-400 font-semibold">
                      {timeData.count}
                    </span>
                  </div>

                  {/* Severity Indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 rounded-t transition-all"
                      style={{
                        height: `${(timeData.avgSeverity / 100) * 100}%`,
                        backgroundColor: getWaveColor(timeData.avgSeverity),
                        minHeight: '4px',
                      }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: getWaveColor(timeData.avgSeverity) }}
                    >
                      {timeData.avgSeverity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTimeRange === index && (
                <div className="ml-24 mt-3 p-3 bg-gray-800/50 rounded border border-white/10 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-blue-900/20 rounded border border-blue-500/20">
                      <div className="text-gray-400">Total</div>
                      <div className="text-blue-400 font-bold">{timeData.count}</div>
                    </div>
                    <div className="p-2 bg-yellow-900/20 rounded border border-yellow-500/20">
                      <div className="text-gray-400">Average</div>
                      <div className="text-yellow-400 font-bold">{timeData.avgSeverity}</div>
                    </div>
                    <div className="p-2 bg-red-900/20 rounded border border-red-500/20">
                      <div className="text-gray-400">Peak</div>
                      <div className="text-red-400 font-bold">{timeData.maxSeverity}</div>
                    </div>
                  </div>

                  {/* Incidents List */}
                  <div className="space-y-1">
                    {timeData.incidents.slice(0, 3).map((incident) => (
                      <div
                        key={incident.id}
                        className="text-xs p-1 bg-gray-700/50 rounded flex justify-between items-center"
                      >
                        <span className="text-gray-300 font-mono">
                          {incident.vehicleId}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded font-semibold text-white"
                          style={{ backgroundColor: getWaveColor(incident.severity) }}
                        >
                          {incident.severity}
                        </span>
                      </div>
                    ))}
                    {timeData.incidents.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        +{timeData.incidents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      {timelineData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-lg font-bold text-blue-400">
              {incidents.length}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <div className="text-xs text-gray-400">Average</div>
            <div className="text-lg font-bold text-yellow-400">
              {Math.round(
                incidents.reduce((sum, inc) => sum + inc.severity, 0) /
                  incidents.length
              )}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <div className="text-xs text-gray-400">Peak</div>
            <div className="text-lg font-bold text-red-400">
              {Math.max(...incidents.map((inc) => inc.severity))}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <div className="text-xs text-gray-400">Time Span</div>
            <div className="text-lg font-bold text-purple-400">
              {timelineData.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EchoTimeline;

/**
 * Mini Timeline - Compact version for sidebars
 */
export const MiniEchoTimeline = ({ incidents = [] }) => {
  const recentIncidents = incidents.slice(-10);

  return (
    <div className="w-full bg-gray-800/50 border border-white/10 rounded p-3">
      <h3 className="text-xs font-semibold text-white mb-2">Recent Activity</h3>
      <div className="space-y-1">
        {recentIncidents.length === 0 ? (
          <p className="text-xs text-gray-500">No activity</p>
        ) : (
          recentIncidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-center gap-2 text-xs"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getWaveColor(incident.severity) }}
              />
              <span className="text-gray-400 flex-1 truncate">
                {incident.vehicleId}
              </span>
              <span
                className="font-semibold"
                style={{ color: getWaveColor(incident.severity) }}
              >
                {incident.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
