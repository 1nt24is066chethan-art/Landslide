# Database Design — SIH26001 Work B

This document explains the PostgreSQL schema in `src/db/schema.sql`:
what each table is for, how tables relate, and why a few specific
design choices were made. It's written for teammates who haven't
designed a relational schema before.

## Entity overview

```
locations
   │
   ├──< environmental_observations   (many readings over time)
   ├──< risk_predictions              (many predictions over time)
   ├──< early_warnings                (references a location, optionally a prediction)
   ├──< vulnerable_roads              (many placeholder/real road records)
   ├──< vulnerable_villages           (many placeholder/real village records)
   └──< citizen_reports               (optional link — see below)
```

`──<` means "one location has many of these."

## Tables

### `locations`

The monitored places (Haflong, Shillong, Gangtok, etc.) — the anchor
that almost everything else hangs off of.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `state` | TEXT | |
| `district` | TEXT | |
| `name` | TEXT | matches the frontend's `location` field |
| `latitude`, `longitude` | NUMERIC(9,6) | for the GIS map |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

A `UNIQUE (state, district, name)` constraint prevents accidentally
seeding the same place twice.

### `environmental_observations`

One row per environmental reading for a location (rainfall, soil
moisture, slope, temperature). Modeled as a history table — even
though the prototype only ever has one reading per location today —
so it's ready for repeated real sensor/API readings later without a
schema change.

The `latest_environmental_observations` **view** (`DISTINCT ON
(location_id) ... ORDER BY observed_at DESC`) gives you the single
most recent reading per location in one query, which is what the API
and dashboard actually need most of the time.

### `risk_predictions`

One row per risk prediction for a location (`risk_score` 0–100,
`risk_level` LOW/MEDIUM/HIGH). Also a history table, for the same
reason as observations: real ML predictions will arrive repeatedly
over time, not just once.

Two columns exist specifically to keep prototype and real data
honestly separated:

- `is_simulated` (boolean) — `true` for every row inserted by
  `seed.sql`, `false` for anything inserted via `POST /api/risk`
  (i.e. a real future prediction).
- `model_version` — defaults to `'prototype-simulated-v1'` for seeded
  rows; the ML team would pass their own version string when POSTing.

Like observations, `latest_risk_predictions` is a view giving the
single most recent prediction per location — this is what
`GET /api/risk`, `GET /api/locations`, and the dashboard summary all
read from.

**Why a `risk_score` CHECK constraint (0–100)?** So a bad insert (from
either the seed script or a future API caller) can't silently corrupt
the data — the database itself enforces the valid range, not just
the application code.

### `early_warnings`

A warning tied to a location. Notably, this table does **not** store
its own `risk_score`/`risk_level` columns — those are read via a join
to the location's latest prediction (optionally pinned to the exact
prediction that triggered it, via the nullable `risk_prediction_id`
foreign key). Storing the score/level again here would let the two
copies drift out of sync over time; reading through the relationship
instead means there's exactly one place that ever holds the "current"
risk value for a location.

### `vulnerable_roads` / `vulnerable_villages`

The frontend's prototype data only ever has a **count** per location
(`vulnerableRoads: 4`, `vulnerableVillages: 7`). Rather than storing
that count as a bare integer column on `locations` (which can't grow
into anything more detailed), each table stores individual child
records per location. `COUNT(*) WHERE location_id = ...` reproduces
the original count, and the design has room to grow into real named
roads/villages with their own risk levels and notes whenever that data
exists — without another schema migration.

The seed script fills these with generic placeholder rows (e.g.
"Unnamed road segment #1") explicitly labeled as placeholders in their
`notes` column, specifically so nobody mistakes them for real surveyed
infrastructure.

### `citizen_reports`

Field reports submitted by citizens. `location_id` is a **nullable**
foreign key — deliberately, because a citizen might report a place
that isn't one of the system's monitored locations, and report intake
shouldn't fail just because there's no match. To support that case
without forcing every report through a location lookup, the table
also stores `location_name`/`district`/`state` directly as text. This
is a small, intentional amount of denormalization for a genuine
reason, not an oversight — the alternative (a required foreign key)
would mean rejecting valid reports about unmonitored places.

## Indexes

- `locations (state)`, `locations (district)` — for filtering/search.
- `environmental_observations (location_id, observed_at DESC)` and
  `risk_predictions (location_id, predicted_at DESC)` — support both
  the "latest reading" views and any future "history for this
  location" queries efficiently.
- `early_warnings (status)`, `early_warnings (location_id)` — for
  filtering active warnings and joining to a location.
- `vulnerable_roads (location_id)`, `vulnerable_villages
  (location_id)` — for counting/listing per location.
- `citizen_reports (status)` — for filtering pending vs. reviewed
  reports.

## Versioning/timestamping risk predictions

Every prediction row keeps its own `predicted_at` timestamp, so the
table naturally accumulates a full history per location rather than
overwriting a single "current risk" value. "What is the current risk
right now" is answered by the `latest_risk_predictions` view
(effectively `ORDER BY predicted_at DESC LIMIT 1` per location); "what
has the risk looked like over time for this location" is answered by
querying `risk_predictions` directly (exposed via
`GET /api/locations/:id/risk?all=true`). This is exactly the shape a
real ML pipeline needs: it can push a new prediction on whatever
cadence it runs (hourly, daily, on-demand) and nothing else in the
schema or API changes.

## Why not put GeoJSON in PostgreSQL?

The India state boundary GeoJSON used by the map is static reference
data for rendering, not something the application reads/writes
per-request or needs to query relationally. It stays as a frontend
static asset (as it already is), per the project brief — there's no
architectural benefit to moving it into the database for this
prototype.

## A note on normalization

The schema avoids storing the same fact in two places (e.g. warnings
don't duplicate risk data; locations aren't repeated across tables
beyond their foreign key). At the same time, it isn't maximally
normalized everywhere — `citizen_reports` intentionally keeps freeform
location text alongside an optional foreign key, because full
normalization there would make the API and validation logic more
complicated for no real benefit at this scale. The goal throughout was
a practical, readable design a small team can maintain, not a
textbook-perfect one.
