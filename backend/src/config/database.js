const { Pool, types } = require('pg');

// Parse NUMERIC as float — safe for this prototype's bounded values
// (risk scores 0–100, coordinates, rainfall, soil moisture, slope, temperature).
types.setTypeParser(1700, 'text', parseFloat);

// Parse TIMESTAMPTZ (1184) and TIMESTAMP (1114) as ISO strings
types.setTypeParser(1114, 'text', (val) => val); // TIMESTAMP
types.setTypeParser(1184, 'text', (val) => val); // TIMESTAMPTZ

// Single shared connection pool for the whole app. Uses DATABASE_URL
// from environment variables — never hardcode credentials here.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// An idle client erroring out shouldn't crash the whole process.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

module.exports = pool;