-- ============================================================
-- SIH26001 — NER Landslide Early Warning System
-- PostgreSQL schema
-- ============================================================
-- Every value inserted by db/seed.sql is SIMULATED PROTOTYPE DATA
-- taken directly from the existing frontend's JSON files — not real
-- environmental measurements and not real ML predictions.
-- risk_predictions.is_simulated is how the database itself tracks
-- that distinction going forward.
-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
  id            SERIAL PRIMARY KEY,
  state         TEXT NOT NULL,
  district      TEXT NOT NULL,
  name          TEXT NOT NULL,           -- matches the frontend's `location` field
  latitude      NUMERIC(9,6) NOT NULL,
  longitude     NUMERIC(9,6) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (state, district, name)
);

CREATE INDEX IF NOT EXISTS idx_locations_state ON locations (state);
CREATE INDEX IF NOT EXISTS idx_locations_district ON locations (district);

-- ------------------------------------------------------------
-- Environmental observations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS environmental_observations (
  id                      SERIAL PRIMARY KEY,
  location_id             INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  rainfall_mm             NUMERIC(6,2),
  soil_moisture_percent   NUMERIC(5,2),
  slope_degrees           NUMERIC(5,2),
  temperature_celsius     NUMERIC(5,2),
  observed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_env_obs_location_time
  ON environmental_observations (location_id, observed_at DESC);

-- One-row-per-location "latest reading" view, used everywhere the API
-- and dashboard need current conditions instead of full history.
CREATE OR REPLACE VIEW latest_environmental_observations AS
SELECT DISTINCT ON (location_id) *
FROM environmental_observations
ORDER BY location_id, observed_at DESC;

-- ------------------------------------------------------------
-- Risk predictions
-- ------------------------------------------------------------
-- Deliberately generic: this table stores prototype (simulated) rows
-- today, but its shape is exactly what the independent ML team's
-- output would need to look like ({ location_id, risk_score,
-- risk_level, predicted_at, model_version }), so no schema change is
-- needed when real predictions start arriving.
CREATE TABLE IF NOT EXISTS risk_predictions (
  id             SERIAL PRIMARY KEY,
  location_id    INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  risk_score     NUMERIC(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level     TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  model_version  TEXT NOT NULL DEFAULT 'prototype-simulated-v1',
  is_simulated   BOOLEAN NOT NULL DEFAULT true,
  predicted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_pred_location_time
  ON risk_predictions (location_id, predicted_at DESC);

-- Convenience view: the single most recent prediction per location.
-- Used by the GIS map, dashboard summary, and early warnings instead
-- of repeating "ORDER BY predicted_at DESC LIMIT 1" everywhere.
CREATE OR REPLACE VIEW latest_risk_predictions AS
SELECT DISTINCT ON (location_id) *
FROM risk_predictions
ORDER BY location_id, predicted_at DESC;

-- ------------------------------------------------------------
-- Early warnings
-- ------------------------------------------------------------
-- No duplicated risk_score/risk_level columns here on purpose — a
-- warning's risk info is always read via its location's latest
-- prediction (optionally pinned to the exact prediction that
-- triggered it via risk_prediction_id) instead of being copied.
CREATE TABLE IF NOT EXISTS early_warnings (
  id                  SERIAL PRIMARY KEY,
  location_id         INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  risk_prediction_id  INTEGER REFERENCES risk_predictions(id) ON DELETE SET NULL,
  message             TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warnings_status ON early_warnings (status);
CREATE INDEX IF NOT EXISTS idx_warnings_location ON early_warnings (location_id);

-- ------------------------------------------------------------
-- Vulnerable roads / villages
-- ------------------------------------------------------------
-- The current prototype only has a COUNT per location (e.g.
-- vulnerableRoads: 4). Rather than storing that as a bare integer,
-- these are modeled as individual child records so the system can
-- grow into real named/surveyed roads and villages later without a
-- schema change — for now, seed.sql inserts that many generic
-- placeholder rows per location so COUNT(*) matches the prototype
-- numbers exactly.
CREATE TABLE IF NOT EXISTS vulnerable_roads (
  id           SERIAL PRIMARY KEY,
  location_id  INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name         TEXT,
  risk_level   TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vuln_roads_location ON vulnerable_roads (location_id);

CREATE TABLE IF NOT EXISTS vulnerable_villages (
  id           SERIAL PRIMARY KEY,
  location_id  INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name         TEXT,
  risk_level   TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vuln_villages_location ON vulnerable_villages (location_id);

-- ------------------------------------------------------------
-- Citizen reports
-- ------------------------------------------------------------
-- location_id is a NULLABLE foreign key on purpose: a citizen may
-- report a place that isn't one of our monitored locations, so we
-- don't want intake to fail just because there's no match. The
-- freeform location_name/district/state columns are a deliberate,
-- small amount of denormalization to support that case cleanly.
CREATE TABLE IF NOT EXISTS citizen_reports (
  id             SERIAL PRIMARY KEY,
  location_id    INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  location_name  TEXT NOT NULL,
  district       TEXT NOT NULL,
  state          TEXT NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON citizen_reports (status);
