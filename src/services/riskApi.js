const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function getRiskData() {
  const response = await fetch(
    `${API_BASE_URL}/risk-locations`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch risk locations: ${response.status}`
    );
  }

  const result = await response.json();

  if (
    !result.success ||
    !Array.isArray(result.data)
  ) {
    throw new Error(
      "Invalid risk locations response from backend"
    );
  }

  return result.data;
}

export async function searchRiskLocations(query) {
  const encodedQuery = encodeURIComponent(query);

  const response = await fetch(
    `${API_BASE_URL}/risk-locations/search?q=${encodedQuery}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to search risk locations: ${response.status}`
    );
  }

  const result = await response.json();

  if (
    !result.success ||
    !Array.isArray(result.data)
  ) {
    throw new Error(
      "Invalid search response from backend"
    );
  }

  return result.data;
}

export async function getRiskLocationEnvironment(
  locationId
) {
  const response = await fetch(
    `${API_BASE_URL}/risk-locations/${locationId}/environment`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch environment data: ${response.status}`
    );
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(
      "Invalid environment response from backend"
    );
  }

  return result.data;
}

export async function getVulnerableRoads(
  locationId
) {
  const response = await fetch(
    `${API_BASE_URL}/risk-locations/${locationId}/vulnerable-roads`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vulnerable roads: ${response.status}`
    );
  }

  const result = await response.json();

  if (
    !result.success ||
    !Array.isArray(result.data)
  ) {
    throw new Error(
      "Invalid vulnerable roads response from backend"
    );
  }

  return result.data;
}

export async function getVulnerableVillages(
  locationId
) {
  const response = await fetch(
    `${API_BASE_URL}/risk-locations/${locationId}/vulnerable-villages`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vulnerable villages: ${response.status}`
    );
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(
      "Invalid vulnerable villages response from backend"
    );
  }

  return result.data;
}

/*
 * Historical GSI landslide inventory.
 *
 * Returns real historical landslide records from
 * the Supabase historical_landslides table.
 *
 * The backend paginates the response so the frontend
 * can request a controlled number of records.
 */
export async function getHistoricalLandslides({
  page = 1,
  limit = 1000,
  state,
  district,
} = {}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (state) {
    params.set("state", state);
  }

  if (district) {
    params.set("district", district);
  }

  const response = await fetch(
    `${API_BASE_URL}/historical-landslides?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch historical landslides: ${response.status}`
    );
  }

  const result = await response.json();

  if (
    !result.success ||
    !Array.isArray(result.data) ||
    !result.pagination
  ) {
    throw new Error(
      "Invalid historical landslides response from backend"
    );
  }

  return result;
}

/*
 * Direct ML inference using explicitly supplied
 * 12-feature JSON.
 */
export async function predictRisk(features) {
  const response = await fetch(
    `${API_BASE_URL}/ml/predictions/predict-risk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(features),
    }
  );

  if (!response.ok) {
    let message =
      `ML prediction failed: ${response.status}`;

    try {
      const result = await response.json();

      if (result?.error) {
        message = result.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  const result = await response.json();

  if (
    !result.success ||
    !result.data
  ) {
    throw new Error(
      "Invalid ML prediction response from backend"
    );
  }

  return result.data;
}

/*
 * Run the actual ML pipeline for an existing
 * dashboard location.
 *
 * The backend resolves the location to a legitimate
 * historical event and supplies the required ML
 * features to the existing Python model.
 */
export async function predictLocationRisk(
  locationId
) {
  const response = await fetch(
    `${API_BASE_URL}/ml/predictions/predict-location/${locationId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    let message =
      `Location ML prediction failed: ${response.status}`;

    try {
      const result = await response.json();

      if (result?.error) {
        message = result.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  const result = await response.json();

  if (
    !result.success ||
    !result.data
  ) {
    throw new Error(
      "Invalid location ML prediction response from backend"
    );
  }

  return result.data;
}