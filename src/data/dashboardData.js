// Dummy data for the Dashboard Overview (Phase 2).
//
// This is intentionally simple, local, and hardcoded — it is NOT the final
// data architecture. Phase 4 introduces src/data/dummyData.json plus
// src/services/riskApi.js as the real data flow (ML/backend -> API -> UI).
// Everything here is clearly prototype/simulated, never presented as live.

export const riskSummaryStats = {
  highRisk: 8,
  mediumRisk: 17,
  lowRisk: 31,
  activeWarnings: 5,
  citizenReports: 24,
}

export const systemOverview = {
  monitoringCoverage: 'North Eastern Region',
  dataStatus: 'Simulated Dataset',
  predictionStatus: 'Prototype Mode',
  systemStatus: 'Operational',
}

export const quickSummary = {
  region: 'North Eastern Region',
  monitoring: 'Landslide Risk',
  dataMode: 'Simulated / Prototype',
  lastUpdated: 'Prototype session',
}

// Relative timestamps are static strings for this prototype — no real
// clock-driven "live" behavior is implied.
export const dashboardAlerts = [
  {
    id: 'alert-1',
    severity: 'high',
    title: 'Elevated landslide risk detected',
    location: 'Example District, Assam',
    description:
      'Simulated model output indicates a sharp rise in slope instability risk following prototype rainfall input.',
    relativeTime: '12 min ago (simulated)',
  },
  {
    id: 'alert-2',
    severity: 'high',
    title: 'Heavy rainfall risk condition',
    location: 'Example District, Meghalaya',
    description:
      'Prototype rainfall values exceed the demo threshold used for this dashboard build.',
    relativeTime: '48 min ago (simulated)',
  },
  {
    id: 'alert-3',
    severity: 'medium',
    title: 'Increased slope instability',
    location: 'Example District, Sikkim',
    description:
      'Simulated soil-moisture and slope inputs show a moderate upward trend in this prototype scenario.',
    relativeTime: '2 hr ago (simulated)',
  },
  {
    id: 'alert-4',
    severity: 'medium',
    title: 'Soil saturation approaching threshold',
    location: 'Example District, Arunachal Pradesh',
    description:
      'Demo data suggests saturated soil conditions are developing in this prototype scenario.',
    relativeTime: '3 hr ago (simulated)',
  },
]
