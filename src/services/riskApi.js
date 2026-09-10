const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function getRiskData() {
  const response = await fetch(`${API_BASE_URL}/risk-locations`);

  if (!response.ok) {
    throw new Error(`Failed to fetch risk locations: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid risk locations response from backend");
  }

  return result.data;
}

export async function searchRiskLocations(query) {
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(`${API_BASE_URL}/risk-locations/search?q=${encodedQuery}`);

  if (!response.ok) {
    throw new Error(`Failed to search risk locations: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid search response from backend");
  }

  return result.data;
}

export async function getRiskLocationEnvironment(locationId) {
  const response = await fetch(`${API_BASE_URL}/risk-locations/${locationId}/environment`);

  if (!response.ok) {
    throw new Error(`Failed to fetch environment data: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error("Invalid environment response from backend");
  }

  return result.data;
}

export async function getVulnerableRoads(locationId) {
  const response = await fetch(`${API_BASE_URL}/risk-locations/${locationId}/vulnerable-roads`);

  if (!response.ok) {
    throw new Error(`Failed to fetch vulnerable roads: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid vulnerable roads response from backend");
  }

  return result.data;
}

export async function getVulnerableVillages(locationId) {
  const response = await fetch(`${API_BASE_URL}/risk-locations/${locationId}/vulnerable-villages`);

  if (!response.ok) {
    throw new Error(`Failed to fetch vulnerable villages: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid vulnerable villages response from backend");
  }

  return result.data;
}