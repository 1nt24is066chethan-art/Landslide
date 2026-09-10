const pool = require('../config/database');

/**
 * One round trip that returns everything the dashboard's summary cards
 * need (see the frontend's src/data/dashboardData.js for the shape
 * this mirrors: highRisk/mediumRisk/lowRisk/activeWarnings/citizenReports).
 */
async function getDashboardSummary() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM latest_risk_predictions WHERE risk_level = 'HIGH')   AS high_risk,
      (SELECT COUNT(*) FROM latest_risk_predictions WHERE risk_level = 'MEDIUM') AS medium_risk,
      (SELECT COUNT(*) FROM latest_risk_predictions WHERE risk_level = 'LOW')    AS low_risk,
      (SELECT COUNT(*) FROM early_warnings WHERE status = 'ACTIVE')              AS active_warnings,
      (SELECT COUNT(*) FROM citizen_reports)                                    AS citizen_reports,
      (SELECT COUNT(*) FROM locations)                                          AS monitored_locations
  `);

  return rows[0];
}

module.exports = { getDashboardSummary };
