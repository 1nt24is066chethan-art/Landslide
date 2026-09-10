const pool = require('../config/database');
const ApiError = require('../utils/ApiError');

/**
 * Risk-centric feed of every monitored location's latest prediction.
 * Used by the frontend's map/dashboard for a lightweight risk-only view
 * (getAllLocations already returns a similar shape, but embedded in
 * full location records — this is the dedicated /api/risk endpoint).
 */
async function getLatestRiskForAllLocations() {
  const { rows } = await pool.query(`
    SELECT
      l.id AS location_id,
      l.state,
      l.district,
      l.name AS location,
      lr.risk_score,
      lr.risk_level,
      lr.predicted_at,
      lr.model_version,
      lr.is_simulated
    FROM locations l
    JOIN latest_risk_predictions lr ON lr.location_id = l.id
    ORDER BY lr.risk_score DESC
  `);

  return rows;
}

/**
 * Either the single latest prediction for a location (default), or its
 * full prediction history when { all: true } is passed
 * (GET /api/locations/:id/risk?all=true).
 */
async function getRiskHistoryForLocation(locationId, { all = false } = {}) {
  if (all) {
    const { rows } = await pool.query(
      'SELECT * FROM risk_predictions WHERE location_id = $1 ORDER BY predicted_at DESC',
      [locationId]
    );
    return rows;
  }

  const { rows } = await pool.query(
    'SELECT * FROM latest_risk_predictions WHERE location_id = $1',
    [locationId]
  );
  return rows[0] || null;
}

/**
 * Stores a new risk prediction — this is the endpoint the future ML
 * system would call. Rows created here are marked is_simulated = false,
 * distinguishing them from the seeded prototype data.
 */
async function createRiskPrediction({ location_id, risk_score, risk_level, model_version, predicted_at }) {
  const locationCheck = await pool.query('SELECT id FROM locations WHERE id = $1', [location_id]);
  if (locationCheck.rows.length === 0) {
    throw new ApiError(404, `No location found with id ${location_id}.`);
  }

  const { rows } = await pool.query(
    `
    INSERT INTO risk_predictions (location_id, risk_score, risk_level, model_version, predicted_at, is_simulated)
    VALUES ($1, $2, $3, COALESCE($4, 'unspecified'), COALESCE($5, now()), false)
    RETURNING *
    `,
    [location_id, risk_score, String(risk_level).toUpperCase(), model_version || null, predicted_at || null]
  );

  return rows[0];
}

module.exports = { getLatestRiskForAllLocations, getRiskHistoryForLocation, createRiskPrediction };
