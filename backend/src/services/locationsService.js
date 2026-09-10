const pool = require('../config/database');

/**
 * Every query here joins to latest_risk_predictions so results already
 * include lat/lon + current risk in one shape — convenient for both the
 * GIS map and general location listings.
 */

async function getAllLocations({ riskLevel } = {}) {
  const params = [];
  let where = '';

  if (riskLevel) {
    params.push(riskLevel.toUpperCase());
    where = 'WHERE lr.risk_level = $1';
  }

  const { rows } = await pool.query(
    `
    SELECT
      l.id,
      l.state,
      l.district,
      l.name AS location,
      l.latitude,
      l.longitude,
      lr.risk_score,
      lr.risk_level,
      lr.predicted_at
    FROM locations l
    LEFT JOIN latest_risk_predictions lr ON lr.location_id = l.id
    ${where}
    ORDER BY l.state, l.district, l.name
    `,
    params
  );

  return rows;
}

async function getLocationById(id) {
  const { rows } = await pool.query(
    `
    SELECT
      l.id,
      l.state,
      l.district,
      l.name AS location,
      l.latitude,
      l.longitude,
      lr.risk_score,
      lr.risk_level,
      lr.predicted_at
    FROM locations l
    LEFT JOIN latest_risk_predictions lr ON lr.location_id = l.id
    WHERE l.id = $1
    `,
    [id]
  );

  return rows[0] || null;
}

async function searchLocations(query) {
  const { rows } = await pool.query(
    `
    SELECT
      l.id,
      l.state,
      l.district,
      l.name AS location,
      l.latitude,
      l.longitude,
      lr.risk_score,
      lr.risk_level,
      leo.rainfall_mm,
      leo.soil_moisture_percent,
      leo.slope_degrees,
      leo.temperature_celsius,
      w.id AS warning_id,
      w.message AS warning_message,
      w.status AS warning_status
    FROM locations l
    LEFT JOIN latest_risk_predictions lr ON lr.location_id = l.id
    LEFT JOIN latest_environmental_observations leo ON leo.location_id = l.id
    LEFT JOIN early_warnings w ON w.location_id = l.id
    WHERE l.name ILIKE $1 OR l.district ILIKE $1 OR l.state ILIKE $1
    ORDER BY l.name
    `,
    [`%${query}%`]
  );

  return rows;
}

module.exports = { getAllLocations, getLocationById, searchLocations };