/**
 * echoPredictor.js
 * Predicts future incident resonance patterns
 * Analyzes historical data to forecast where next incidents may occur
 */

export const predictNextResonance = (incidents, patterns) => {
  if (!incidents || incidents.length === 0) return [];

  // Get all unique pattern hashes
  const patternKeys = Object.keys(patterns);
  if (patternKeys.length === 0) return [];

  const predictions = [];

  patternKeys.forEach((patternHash) => {
    const pattern = patterns[patternHash];
    const patternIncidents = pattern.incidents || [];

    if (patternIncidents.length < 2) return;

    // Calculate average time between incidents
    const sortedByTime = patternIncidents.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    let totalInterval = 0;
    let intervals = 0;

    for (let i = 1; i < sortedByTime.length; i++) {
      const timeA = new Date(sortedByTime[i - 1].timestamp).getTime();
      const timeB = new Date(sortedByTime[i].timestamp).getTime();
      const interval = timeB - timeA;
      totalInterval += interval;
      intervals++;
    }

    if (intervals === 0) return;

    const avgInterval = totalInterval / intervals;
    const lastIncidentTime = new Date(
      sortedByTime[sortedByTime.length - 1].timestamp
    ).getTime();
    const predictedTime = new Date(lastIncidentTime + avgInterval);

    // Calculate probability based on frequency and severity
    const frequency = patternIncidents.length;
    const avgSeverity = Math.round(
      patternIncidents.reduce((sum, inc) => sum + (inc.severity || 50), 0) /
        frequency
    );
    const probability = Math.min(
      100,
      Math.round(frequency * 10 + avgSeverity * 0.5)
    );

    // Identify vehicles likely to be affected
    const affectedVehicles = [...new Set(patternIncidents.map((inc) => inc.vehicleId))];

    predictions.push({
      patternHash,
      patternDNA: pattern.patternDNA,
      predictedTime,
      probability,
      frequency: patternIncidents.length,
      avgSeverity,
      affectedVehicles,
      nextLikelyVehicle: affectedVehicles[0],
    });
  });

  // Sort by probability (highest first)
  return predictions.sort((a, b) => b.probability - a.probability);
};

export const calculateRiskZones = (incidents) => {
  if (!incidents || incidents.length === 0) return [];

  // Group by location
  const zones = {};

  incidents.forEach((incident) => {
    const latBucket = Math.floor(incident.latitude * 100) / 100;
    const lonBucket = Math.floor(incident.longitude * 100) / 100;
    const key = `${latBucket},${lonBucket}`;

    if (!zones[key]) {
      zones[key] = {
        latitude: latBucket,
        longitude: lonBucket,
        incidents: [],
        riskLevel: 0,
      };
    }

    zones[key].incidents.push(incident);
  });

  // Calculate risk level for each zone
  Object.values(zones).forEach((zone) => {
    const totalSeverity = zone.incidents.reduce((sum, inc) => sum + (inc.severity || 50), 0);
    const avgSeverity = totalSeverity / zone.incidents.length;
    const frequency = zone.incidents.length;

    zone.riskLevel = Math.round(
      Math.min(100, avgSeverity * 0.8 + frequency * 5)
    );
  });

  return Object.values(zones).sort((a, b) => b.riskLevel - a.riskLevel);
};

export const forecastIncidentWave = (incidents, timeWindowHours = 24) => {
  if (!incidents || incidents.length === 0) return null;

  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindowHours * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + timeWindowHours * 60 * 60 * 1000);

  const recentIncidents = incidents.filter((inc) => {
    const incTime = new Date(inc.timestamp);
    return incTime >= windowStart && incTime <= windowEnd;
  });

  if (recentIncidents.length === 0) {
    return {
      forecast: 'LOW',
      confidence: 0.3,
      expectedIncidents: 0,
      message: 'No incidents in analysis window',
    };
  }

  // Analyze trend
  const pastIncidents = recentIncidents.filter((inc) => {
    const incTime = new Date(inc.timestamp);
    return incTime < now;
  });

  const futureIncidents = recentIncidents.filter((inc) => {
    const incTime = new Date(inc.timestamp);
    return incTime >= now;
  });

  const avgSeverity =
    pastIncidents.length > 0
      ? Math.round(
          pastIncidents.reduce((sum, inc) => sum + (inc.severity || 50), 0) /
            pastIncidents.length
        )
      : 50;

  let forecast = 'LOW';
  let confidence = 0.3;

  if (pastIncidents.length > 5) {
    forecast = 'HIGH';
    confidence = 0.9;
  } else if (pastIncidents.length > 2) {
    forecast = 'MEDIUM';
    confidence = 0.6;
  }

  return {
    forecast,
    confidence,
    expectedIncidents: Math.round(
      (pastIncidents.length / timeWindowHours) * 24
    ),
    avgSeverity,
    pastIncidents: pastIncidents.length,
    futureIncidents: futureIncidents.length,
    message: `Predicted ${forecast} incident wave in next ${timeWindowHours} hours`,
  };
};

export const detectAnomalyPattern = (incident, historicalIncidents) => {
  if (!incident || !historicalIncidents || historicalIncidents.length === 0) {
    return { isAnomaly: false, confidence: 0 };
  }

  // Calculate distance from historical average
  const avgSpeed =
    historicalIncidents.reduce((sum, inc) => sum + (inc.speed || 0), 0) /
    historicalIncidents.length;
  const avgAcceleration =
    historicalIncidents.reduce((sum, inc) => sum + (inc.acceleration || 0), 0) /
    historicalIncidents.length;
  const avgSeverity =
    historicalIncidents.reduce((sum, inc) => sum + (inc.severity || 50), 0) /
    historicalIncidents.length;

  const speedDeviation = Math.abs(
    (incident.speed || 0) - avgSpeed
  ) / Math.max(avgSpeed, 1);
  const accelDeviation = Math.abs(
    (incident.acceleration || 0) - avgAcceleration
  ) / Math.max(Math.abs(avgAcceleration), 1);
  const severityDeviation = Math.abs(
    (incident.severity || 50) - avgSeverity
  ) / avgSeverity;

  const avgDeviation = (speedDeviation + accelDeviation + severityDeviation) / 3;
  const isAnomaly = avgDeviation > 0.5;
  const confidence = Math.min(1, avgDeviation);

  return {
    isAnomaly,
    confidence: Math.round(confidence * 100),
    deviationScore: Math.round(avgDeviation * 100),
  };
};
