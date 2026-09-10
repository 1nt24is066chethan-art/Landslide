const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function getCitizenReports() {
  const response = await fetch(`${API_BASE_URL}/citizen-reports`);

  if (!response.ok) {
    throw new Error(`Failed to fetch citizen reports: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid citizen reports response from backend");
  }

  return result.data;
}

export async function createCitizenReport(report) {
  const payload = {
    location_name: report.location,
    district: report.district,
    state: report.state,
    category: report.category,
    description: report.description,
  };

  if (report.locationId) {
    payload.location_id = report.locationId;
  }

  const response = await fetch(`${API_BASE_URL}/citizen-reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create report: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error("Invalid response from backend when creating report");
  }

  return result.data;
}