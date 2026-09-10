const pool = require('../config/database');

async function getLatestEnvironmentForLocation(locationId) {
  const { rows } = await pool.query(
    'SELECT * FROM latest_environmental_observations WHERE location_id = $1',
    [locationId]
  );
  return rows[0] || null;
}

async function getEnvironmentHistoryForLocation(locationId) {
  const { rows } = await pool.query(
    'SELECT * FROM environmental_observations WHERE location_id = $1 ORDER BY observed_at DESC',
    [locationId]
  );
  return rows;
}

module.exports = { getLatestEnvironmentForLocation, getEnvironmentHistoryForLocation };
