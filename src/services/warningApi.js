const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function getWarningData({ status, riskLevel } = {}) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (riskLevel) params.append("riskLevel", riskLevel);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/warnings${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch warnings: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid warnings response from backend");
  }

  return result.data;
}