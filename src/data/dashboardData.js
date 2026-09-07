import riskData from "./riskData.json";
import warningData from "./warningData.json";
import citizenReports from "./citizenReports.json";

export const riskSummaryStats = {
  highRisk: riskData.filter(
    (location) => location.riskLevel?.toUpperCase() === "HIGH"
  ).length,

  mediumRisk: riskData.filter(
    (location) => location.riskLevel?.toUpperCase() === "MEDIUM"
  ).length,

  lowRisk: riskData.filter(
    (location) => location.riskLevel?.toUpperCase() === "LOW"
  ).length,

  activeWarnings: warningData.filter(
    (warning) => warning.status?.toUpperCase() === "ACTIVE"
  ).length,

  citizenReports: citizenReports.length,
};

export const systemOverview = {
  monitoringCoverage: "North Eastern Region",
  dataStatus: "Simulated Dataset",
  predictionStatus: "Prototype Mode",
  systemStatus: "Operational",
};

export const quickSummary = {
  region: "North Eastern Region",
  monitoring: "Landslide Risk",
  dataMode: "Simulated / Prototype",
  lastUpdated: "Prototype session",
};

export const dashboardAlerts = warningData.map((warning) => ({
  id: warning.id,
  severity: warning.riskLevel?.toLowerCase(),
  title: warning.message,
  location: `${warning.location}, ${warning.state}`,
  description: `${warning.district} is currently classified as ${warning.riskLevel} risk in the simulated prototype dataset.`,
  relativeTime: "Simulated",
}));