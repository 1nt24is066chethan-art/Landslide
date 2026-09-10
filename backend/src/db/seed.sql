-- ============================================================
-- SIH26001 — Prototype seed data
-- ============================================================
-- Every value below comes directly from the existing frontend's
-- prototype JSON files (riskData.json, warningData.json,
-- citizenReports.json). These are SIMULATED PROTOTYPE VALUES for
-- demonstration only:
--   - NOT real environmental measurements
--   - NOT real ML-generated predictions
--   - NOT real citizen incident reports
--
-- This script is for local development only. It wipes and re-seeds
-- the tables below (TRUNCATE ... RESTART IDENTITY) so running it
-- repeatedly always produces the same, predictable dataset.
-- ============================================================

BEGIN;

TRUNCATE
  citizen_reports,
  vulnerable_villages,
  vulnerable_roads,
  early_warnings,
  risk_predictions,
  environmental_observations,
  locations
RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------
-- 8 monitored locations (from riskData.json)
-- ------------------------------------------------------------
INSERT INTO locations (state, district, name, latitude, longitude) VALUES
  ('Assam',              'Dima Hasao',        'Haflong',        25.15, 93.02),  -- id 1
  ('Meghalaya',          'East Khasi Hills',  'Shillong',       25.58, 91.89),  -- id 2
  ('Sikkim',             'East Sikkim',       'Gangtok',        27.33, 88.61),  -- id 3
  ('Arunachal Pradesh',  'Tawang',            'Tawang',         27.59, 91.87),  -- id 4
  ('Nagaland',           'Kohima',            'Kohima',         25.67, 94.11),  -- id 5
  ('Manipur',            'Churachandpur',     'Churachandpur',  24.33, 93.67),  -- id 6
  ('Mizoram',            'Aizawl',            'Aizawl',         23.73, 92.72),  -- id 7
  ('Tripura',            'West Tripura',      'Agartala',       23.83, 91.28);  -- id 8

-- ------------------------------------------------------------
-- One environmental observation per location (from riskData.json)
-- ------------------------------------------------------------
INSERT INTO environmental_observations
  (location_id, rainfall_mm, soil_moisture_percent, slope_degrees, temperature_celsius) VALUES
  (1, 186, 78, 34, 24),
  (2, 214, 81, 38, 21),
  (3, 142, 69, 42, 18),
  (4, 165, 74, 46, 12),
  (5, 118, 61, 31, 22),
  (6,  86, 48, 24, 25),
  (7, 133, 66, 39, 23),
  (8,  72, 42, 18, 27);

-- ------------------------------------------------------------
-- One risk prediction per location (from riskData.json).
-- is_simulated = true: these are NOT real ML output.
-- ------------------------------------------------------------
INSERT INTO risk_predictions (location_id, risk_score, risk_level, model_version, is_simulated) VALUES
  (1, 82, 'HIGH',   'prototype-simulated-v1', true),
  (2, 71, 'HIGH',   'prototype-simulated-v1', true),
  (3, 64, 'MEDIUM', 'prototype-simulated-v1', true),
  (4, 76, 'HIGH',   'prototype-simulated-v1', true),
  (5, 48, 'MEDIUM', 'prototype-simulated-v1', true),
  (6, 37, 'LOW',    'prototype-simulated-v1', true),
  (7, 58, 'MEDIUM', 'prototype-simulated-v1', true),
  (8, 29, 'LOW',    'prototype-simulated-v1', true);

-- ------------------------------------------------------------
-- Vulnerable roads / villages: riskData.json only ever gave a COUNT
-- per location, never real names. We insert that many generic
-- placeholder rows per location so COUNT(*) matches the original
-- prototype numbers exactly, without inventing real infrastructure.
-- Replace these with real records whenever that data exists.
-- ------------------------------------------------------------
INSERT INTO vulnerable_roads (location_id, name, risk_level, notes)
SELECT
  loc.id,
  'Unnamed road segment #' || gs,
  rp.risk_level,
  'Placeholder record — prototype only tracked a count, not a named road.'
FROM (VALUES (1,4), (2,5), (3,3), (4,6), (5,2), (6,1), (7,3), (8,1))
  AS v(location_id, road_count)
JOIN locations loc ON loc.id = v.location_id
JOIN risk_predictions rp ON rp.location_id = loc.id
CROSS JOIN LATERAL generate_series(1, v.road_count) AS gs;

INSERT INTO vulnerable_villages (location_id, name, risk_level, notes)
SELECT
  loc.id,
  'Unnamed village #' || gs,
  rp.risk_level,
  'Placeholder record — prototype only tracked a count, not a named village.'
FROM (VALUES (1,7), (2,9), (3,5), (4,8), (5,4), (6,2), (7,6), (8,2))
  AS v(location_id, village_count)
JOIN locations loc ON loc.id = v.location_id
JOIN risk_predictions rp ON rp.location_id = loc.id
CROSS JOIN LATERAL generate_series(1, v.village_count) AS gs;

-- ------------------------------------------------------------
-- Early warnings (from warningData.json), linked to the matching
-- location and the risk_predictions row just inserted for it.
-- ------------------------------------------------------------
INSERT INTO early_warnings (location_id, risk_prediction_id, message, status)
SELECT loc.id, rp.id, w.message, w.status
FROM (VALUES
  (1, 'Elevated landslide risk conditions detected.', 'ACTIVE'),
  (2, 'High-risk environmental conditions require attention.', 'ACTIVE'),
  (4, 'Elevated risk conditions detected in the monitored area.', 'ACTIVE'),
  (3, 'Moderate risk conditions are being monitored.', 'ACTIVE'),
  (7, 'Moderate environmental risk requires continued monitoring.', 'ACTIVE')
) AS w(location_id, message, status)
JOIN locations loc ON loc.id = w.location_id
JOIN risk_predictions rp ON rp.location_id = loc.id;

-- ------------------------------------------------------------
-- Citizen reports (from citizenReports.json). All three happen to
-- reference existing monitored locations here, so location_id is
-- populated — but the schema keeps it nullable for reports about
-- places outside the monitored set.
-- ------------------------------------------------------------
INSERT INTO citizen_reports
  (location_id, location_name, district, state, category, description, status) VALUES
  (1, 'Haflong',  'Dima Hasao',        'Assam',             'Road Damage',
   'Cracks and minor debris observed along the roadside.', 'REVIEWED'),
  (2, 'Shillong', 'East Khasi Hills',  'Meghalaya',         'Slope Movement',
   'Small soil movement reported near a hillside settlement.', 'PENDING'),
  (4, 'Tawang',   'Tawang',            'Arunachal Pradesh', 'Rockfall',
   'Loose rocks reported near a mountain road.', 'PENDING');

COMMIT;
