const pool = require('../config/database');

/**
 * Fetch real historical GSI landslide inventory records.
 *
 * Supports pagination so the frontend does not need to request
 * all 8,780 records in a single response.
 */
async function getHistoricalLandslides({
  page = 1,
  limit = 500,
  state,
  district,
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    1000,
    Math.max(1, Number(limit) || 500)
  );

  const offset = (safePage - 1) * safeLimit;

  const params = [];
  const conditions = [];

  if (state) {
    params.push(state);
    conditions.push(`state = $${params.length}`);
  }

  if (district) {
    params.push(district);
    conditions.push(`district = $${params.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const countResult = await pool.query(
    `
    SELECT COUNT(*)::INTEGER AS total
    FROM historical_landslides
    ${whereClause}
    `,
    params
  );

  const total = countResult.rows[0].total;

  params.push(safeLimit);
  params.push(offset);

  const { rows } = await pool.query(
    `
    SELECT
      id,
      source_sl_no,
      slide_no,
      state,
      district,
      slide_name,
      nh_sh_location,
      latitude,
      longitude,
      material_involved,
      movement_type,
      history,
      elevation_m,
      slope_deg,
      aspect_deg,
      lulc_class,
      clay_surface_pct,
      nearest_road_type,
      nearest_road_name,
      nearest_road_ref,
      road_distance_m,
      nearest_settlement_type,
      nearest_settlement_population,
      nearest_settlement_name,
      settlement_distance_m,
      event_date,
      rainfall_mm
    FROM historical_landslides
    ${whereClause}
    ORDER BY id
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
    `,
    params
  );

  return {
    records: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

module.exports = {
  getHistoricalLandslides,
};