/**
 * echoPatternDNA.js
 * Generates unique "DNA" signatures for incident patterns
 * Used by Incident Echo system to identify and track similar incidents
 */

export const generatePatternDNA = (incident) => {
  if (!incident) return null;

  const {
    speed = 0,
    acceleration = 0,
    latitude = 0,
    longitude = 0,
    timestamp = new Date(),
    severity = 50,
    weatherCondition = 'clear',
    vehicleType = 'unknown',
    driverBehavior = 'normal',
  } = incident;

  // Create a hash-like string combining all factors
  const speedBucket = Math.floor(speed / 10);
  const accelBucket = Math.floor(Math.abs(acceleration) / 5);
  const timeBucket = new Date(timestamp).getHours();
  const latBucket = Math.floor(latitude * 100);
  const lonBucket = Math.floor(longitude * 100);
  const severityBucket = Math.floor(severity / 10);

  const dnaComponents = [
    `SPD${speedBucket}`,
    `ACC${accelBucket}`,
    `HR${timeBucket}`,
    `LAT${latBucket}`,
    `LON${lonBucket}`,
    `SEV${severityBucket}`,
    `WTH${weatherCondition.charAt(0).toUpperCase()}`,
    `VEH${vehicleType.charAt(0).toUpperCase()}`,
    `DRV${driverBehavior.charAt(0).toUpperCase()}`,
  ];

  const dnaString = dnaComponents.join('-');
  const dnaHash = simpleHash(dnaString);

  return {
    dnaString,
    dnaHash,
    components: {
      speed: speedBucket,
      acceleration: accelBucket,
      hour: timeBucket,
      latitude: latBucket,
      longitude: lonBucket,
      severity: severityBucket,
      weather: weatherCondition,
      vehicleType,
      driverBehavior,
    },
  };
};

export const calculateResonance = (dna1, dna2) => {
  if (!dna1 || !dna2) return 0;

  let matchingComponents = 0;
  const totalComponents = 9;

  const c1 = dna1.components;
  const c2 = dna2.components;

  if (c1.speed === c2.speed) matchingComponents++;
  if (c1.acceleration === c2.acceleration) matchingComponents++;
  if (c1.hour === c2.hour) matchingComponents++;
  if (c1.latitude === c2.latitude) matchingComponents++;
  if (c1.longitude === c2.longitude) matchingComponents++;
  if (c1.severity === c2.severity) matchingComponents++;
  if (c1.weather === c2.weather) matchingComponents++;
  if (c1.vehicleType === c2.vehicleType) matchingComponents++;
  if (c1.driverBehavior === c2.driverBehavior) matchingComponents++;

  return Math.round((matchingComponents / totalComponents) * 100);
};

const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const groupIncidentsByPattern = (incidents) => {
  if (!incidents || incidents.length === 0) return {};

  const grouped = {};

  incidents.forEach((incident) => {
    const dna = generatePatternDNA(incident);
    if (!dna) return;

    const key = dna.dnaHash;
    if (!grouped[key]) {
      grouped[key] = {
        patternDNA: dna.dnaString,
        patternHash: dna.dnaHash,
        incidents: [],
        severity: dna.components.severity,
      };
    }

    grouped[key].incidents.push(incident);
  });

  return grouped;
};
