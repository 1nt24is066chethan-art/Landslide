const pool = require('../config/database');

async function checkLocationExists(locationId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM locations WHERE id = $1',
    [locationId]
  );
  return rows.length > 0;
}

async function getVulnerableRoadsForLocation(locationId) {
  const exists = await checkLocationExists(locationId);
  if (!exists) return null;

  const { rows } = await pool.query(
    `SELECT id, location_id, name, risk_level, notes, created_at
     FROM vulnerable_roads
     WHERE location_id = $1
     ORDER BY created_at`,
    [locationId]
  );
  return rows;
}

async function getVulnerableVillagesForLocation(locationId) {
  const exists = await checkLocationExists(locationId);
  if (!exists) return null;

  const { rows } = await pool.query(
    `SELECT id, location_id, name, risk_level, notes, created_at
     FROM vulnerable_villages
     WHERE location_id = $1
     ORDER BY created_at`,
    [locationId]
  );
  return rows;
}

module.exports = {
  getVulnerableRoadsForLocation,
  getVulnerableVillagesForLocation,
};