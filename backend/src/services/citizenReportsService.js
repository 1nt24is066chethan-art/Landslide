const pool = require('../config/database');
const ApiError = require('../utils/ApiError');

async function getAllCitizenReports({ status } = {}) {
  const params = [];
  let where = '';

  if (status) {
    params.push(status.toUpperCase());
    where = 'WHERE status = $1';
  }

  const { rows } = await pool.query(
    `SELECT * FROM citizen_reports ${where} ORDER BY created_at DESC`,
    params
  );
  return rows;
}

async function getCitizenReportById(id) {
  const { rows } = await pool.query('SELECT * FROM citizen_reports WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * location_id is optional: a citizen may report a place we don't
 * monitor. If the frontend already knows the matching location's id
 * (e.g. the report was made from a monitored location's page), it can
 * be passed through and stored; otherwise it's left null.
 */
async function createCitizenReport({ location_id, location_name, district, state, category, description }) {
  const { rows } = await pool.query(
    `
    INSERT INTO citizen_reports (location_id, location_name, district, state, category, description, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
    RETURNING *
    `,
    [location_id || null, location_name, district, state, category, description]
  );
  return rows[0];
}

async function updateCitizenReportStatus(id, status) {
  const { rows } = await pool.query(
    `
    UPDATE citizen_reports
    SET status = $1, updated_at = now()
    WHERE id = $2
    RETURNING *
    `,
    [status.toUpperCase(), id]
  );

  if (rows.length === 0) {
    throw new ApiError(404, `No citizen report found with id ${id}.`);
  }

  return rows[0];
}

module.exports = {
  getAllCitizenReports,
  getCitizenReportById,
  createCitizenReport,
  updateCitizenReportStatus,
};
