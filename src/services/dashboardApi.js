const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function getDashboardSummary() {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`);

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard summary: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error("Invalid dashboard summary response from backend");
  }

  return result.data;
}