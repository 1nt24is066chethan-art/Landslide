const pool = require('../config/database');
const ApiError = require('../utils/ApiError');

async function getAllWarnings({ riskLevel, status } = {}) {
  const conditions = [];
  const params = [];

  if (riskLevel) {
    params.push(riskLevel.toUpperCase());
    conditions.push(`lr.risk_level = $${params.length}`);
  }
  if (status) {
    params.push(status.toUpperCase());
    conditions.push(`w.status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `
    SELECT
      w.id,
      w.message,
      w.status,
      w.created_at,
      w.updated_at,
      l.id AS location_id,
      l.name AS location,
      l.district,
      l.state,
      lr.risk_score,
      lr.risk_level
    FROM early_warnings w
    JOIN locations l ON l.id = w.location_id
    LEFT JOIN latest_risk_predictions lr ON lr.location_id = l.id
    ${where}
    ORDER BY w.created_at DESC
    `,
    params
  );

  return rows;
}

async function getWarningById(id) {
  const { rows } = await pool.query(
    `
    SELECT
      w.id,
      w.message,
      w.status,
      w.created_at,
      w.updated_at,
      l.id AS location_id,
      l.name AS location,
      l.district,
      l.state,
      lr.risk_score,
      lr.risk_level
    FROM early_warnings w
    JOIN locations l ON l.id = w.location_id
    LEFT JOIN latest_risk_predictions lr ON lr.location_id = l.id
    WHERE w.id = $1
    `,
    [id]
  );

  return rows[0] || null;
}

async function updateWarningStatus(id, status) {
  const { rows } = await pool.query(
    `
    UPDATE early_warnings
    SET status = $1, updated_at = now()
    WHERE id = $2
    RETURNING *
    `,
    [status.toUpperCase(), id]
  );

  if (rows.length === 0) {
    throw new ApiError(404, `No warning found with id ${id}.`);
  }

  return rows[0];
}

module.exports = { getAllWarnings, getWarningById, updateWarningStatus };
