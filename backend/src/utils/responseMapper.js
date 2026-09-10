const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const mapKeys = (obj, keyMap = {}) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(item => mapKeys(item, keyMap));
  if (typeof obj !== 'object') return obj;

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = keyMap[key] || snakeToCamel(key);
    result[newKey] = mapKeys(value, keyMap);
  }
  return result;
};

const locationResponseMap = {
  risk_score: 'riskScore',
  risk_level: 'riskLevel',
  latitude: 'lat',
  longitude: 'lon',
  predicted_at: 'predictedAt',
};

const riskPredictionResponseMap = {
  location_id: 'locationId',
  risk_score: 'riskScore',
  risk_level: 'riskLevel',
  predicted_at: 'predictedAt',
  model_version: 'modelVersion',
  is_simulated: 'isSimulated',
  created_at: 'createdAt',
};

const warningResponseMap = {
  location_id: 'locationId',
  risk_prediction_id: 'riskPredictionId',
  risk_score: 'riskScore',
  risk_level: 'riskLevel',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

const citizenReportResponseMap = {
  location_id: 'locationId',
  location_name: 'locationName',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

const dashboardSummaryResponseMap = {
  high_risk: 'highRisk',
  medium_risk: 'mediumRisk',
  low_risk: 'lowRisk',
  active_warnings: 'activeWarnings',
  citizen_reports: 'citizenReports',
  monitored_locations: 'monitoredLocations',
};

const environmentResponseMap = {
  location_id: 'locationId',
  rainfall_mm: 'rainfallMm',
  soil_moisture_percent: 'soilMoisturePercent',
  slope_degrees: 'slopeDegrees',
  temperature_celsius: 'temperatureCelsius',
  observed_at: 'observedAt',
  created_at: 'createdAt',
};

const searchLocationResponseMap = {
  risk_score: 'riskScore',
  risk_level: 'riskLevel',
  latitude: 'lat',
  longitude: 'lon',
  rainfall_mm: 'rainfallMm',
  soil_moisture_percent: 'soilMoisturePercent',
  slope_degrees: 'slopeDegrees',
  temperature_celsius: 'temperatureCelsius',
  warning_id: 'warningId',
  warning_message: 'warningMessage',
  warning_status: 'warningStatus',
};

const vulnerableRoadResponseMap = {
  location_id: 'locationId',
  risk_level: 'riskLevel',
  created_at: 'createdAt',
};

const vulnerableVillageResponseMap = {
  location_id: 'locationId',
  risk_level: 'riskLevel',
  created_at: 'createdAt',
};

function mapLocationResponse(data) {
  return mapKeys(data, locationResponseMap);
}

function mapRiskPredictionResponse(data) {
  return mapKeys(data, riskPredictionResponseMap);
}

function mapWarningResponse(data) {
  return mapKeys(data, warningResponseMap);
}

function mapCitizenReportResponse(data) {
  return mapKeys(data, citizenReportResponseMap);
}

function mapDashboardSummaryResponse(data) {
  return mapKeys(data, dashboardSummaryResponseMap);
}

function mapEnvironmentResponse(data) {
  return mapKeys(data, environmentResponseMap);
}

function mapSearchLocationResponse(data) {
  return mapKeys(data, searchLocationResponseMap);
}

function mapVulnerableRoadResponse(data) {
  return mapKeys(data, vulnerableRoadResponseMap);
}

function mapVulnerableVillageResponse(data) {
  return mapKeys(data, vulnerableVillageResponseMap);
}

module.exports = {
  mapKeys,
  mapLocationResponse,
  mapRiskPredictionResponse,
  mapWarningResponse,
  mapCitizenReportResponse,
  mapDashboardSummaryResponse,
  mapEnvironmentResponse,
  mapSearchLocationResponse,
  mapVulnerableRoadResponse,
  mapVulnerableVillageResponse,
};