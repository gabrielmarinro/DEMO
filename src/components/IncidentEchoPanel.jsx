/**
 * IncidentEchoPanel.jsx
 * Control panel for Incident Echo system
 * Manages incident addition, filtering, and echo wave controls
 */

import React, { useState } from 'react';
import useIncidentEcho from '../hooks/useIncidentEcho';

const IncidentEchoPanel = ({ onIncidentsChange = () => {} }) => {
  const echo = useIncidentEcho();
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    severity: 50,
    vehicleId: '',
    description: '',
  });
  const [filterSeverity, setFilterSeverity] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleAddIncident = (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert('Latitude and Longitude are required');
      return;
    }

    const newIncident = {
      id: `incident-${Date.now()}`,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      severity: parseInt(formData.severity),
      vehicleId: formData.vehicleId || `vehicle-${Math.random().toString(36).substr(2, 9)}`,
      description: formData.description,
      timestamp: new Date(),
    };

    echo.addIncident(newIncident);
    onIncidentsChange(echo.incidents);

    // Reset form
    setFormData({
      latitude: '',
      longitude: '',
      severity: 50,
      vehicleId: '',
      description: '',
    });
  };

  const handleGenerateWaves = () => {
    echo.generateEchoWaves();
  };

  const handleClearWaves = () => {
    echo.clearWaves();
  };

  const handleToggleEcho = () => {
    echo.toggleEcho();
  };

  const filteredIncidents = echo.incidents.filter(
    (inc) => inc.severity >= filterSeverity
  );

  const stats = echo.getEchoStats();

  return (
    <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-lg shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">🌊 Incident Echo</h2>
            <p className="text-xs text-gray-400 mt-1">Real-time incident resonance system</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${echo.isEchoActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-2 p-3 border-b border-white/10 bg-black/50">
        <div className="text-center p-2 bg-blue-900/20 rounded border border-blue-500/20">
          <div className="text-xs text-gray-400">Incidents</div>
          <div className="text-lg font-bold text-blue-400">{stats.totalIncidents}</div>
        </div>
        <div className="text-center p-2 bg-purple-900/20 rounded border border-purple-500/20">
          <div className="text-xs text-gray-400">Patterns</div>
          <div className="text-lg font-bold text-purple-400">{stats.totalPatterns}</div>
        </div>
        <div className="text-center p-2 bg-orange-900/20 rounded border border-orange-500/20">
          <div className="text-xs text-gray-400">Active Waves</div>
          <div className="text-lg font-bold text-orange-400">{stats.activeWaves}</div>
        </div>
        <div className="text-center p-2 bg-green-900/20 rounded border border-green-500/20">
          <div className="text-xs text-gray-400">Predictions</div>
          <div className="text-lg font-bold text-green-400">{stats.totalPredictions}</div>
        </div>
      </div>

      {/* Add Incident Form */}
      <form onSubmit={handleAddIncident} className="p-4 border-b border-white/10 space-y-3">
        <h3 className="text-sm font-semibold text-white">New Incident</h3>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            step="0.001"
            className="px-2 py-1 text-sm bg-gray-800 border border-white/10 rounded text-white placeholder-gray-500"
          />
          <input
            type="number"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            step="0.001"
            className="px-2 py-1 text-sm bg-gray-800 border border-white/10 rounded text-white placeholder-gray-500"
          />
        </div>

        <input
          type="text"
          name="vehicleId"
          placeholder="Vehicle ID (optional)"
          value={formData.vehicleId}
          onChange={handleInputChange}
          className="w-full px-2 py-1 text-sm bg-gray-800 border border-white/10 rounded text-white placeholder-gray-500"
        />

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Severity: {formData.severity}</label>
          <input
            type="range"
            name="severity"
            min="0"
            max="100"
            value={formData.severity}
            onChange={handleInputChange}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleInputChange}
          rows="2"
          className="w-full px-2 py-1 text-sm bg-gray-800 border border-white/10 rounded text-white placeholder-gray-500"
        />

        <button
          type="submit"
          className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded hover:from-blue-500 hover:to-blue-600 transition-all"
        >
          Add Incident
        </button>
      </form>

      {/* Control Panel */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <h3 className="text-sm font-semibold text-white">Controls</h3>

        <div className="flex gap-2">
          <button
            onClick={handleGenerateWaves}
            className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition-all"
          >
            🌊 Generate Waves
          </button>
          <button
            onClick={handleClearWaves}
            className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded transition-all"
          >
            Clear Waves
          </button>
        </div>

        <button
          onClick={handleToggleEcho}
          className={`w-full py-2 px-3 text-white text-xs font-semibold rounded transition-all ${
            echo.isEchoActive
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {echo.isEchoActive ? '✓ Echo Active' : '✗ Echo Inactive'}
        </button>
      </div>

      {/* Incident List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Incidents</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showAdvanced ? '▼' : '▶'} Advanced
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-1 p-2 bg-gray-800/50 rounded border border-white/5">
            <label className="text-xs text-gray-400">Filter by Severity: {filterSeverity}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg"
            />
          </div>
        )}

        <div className="max-h-48 overflow-y-auto space-y-1">
          {filteredIncidents.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No incidents</p>
          ) : (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-2 bg-gray-800/50 rounded border border-white/5 text-xs text-gray-300"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono">{incident.vehicleId}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      incident.severity >= 75
                        ? 'bg-red-900/50 text-red-300'
                        : incident.severity >= 50
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-green-900/50 text-green-300'
                    }`}
                  >
                    {incident.severity}
                  </span>
                </div>
                <div className="text-gray-500 mt-1">
                  📍 {incident.latitude.toFixed(3)}, {incident.longitude.toFixed(3)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentEchoPanel;
