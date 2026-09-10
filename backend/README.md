# SIH26001 — Work B Backend (Express + PostgreSQL)

A standalone Node.js/Express + PostgreSQL backend for the **NER Landslide
Early Warning System** (SIH26001, Work B). It sits between the existing
React/Vite frontend and a PostgreSQL database, and is designed so the
independent ML team's real prediction system can plug in later without
changing the frontend or the API's shape.

**This backend is new and separate.** It does not modify, replace, or
depend on the frontend's own `src/services/riskApi.js` — that file can
keep serving dummy JSON to the frontend indefinitely, or be pointed at
this API's `GET /api/risk` endpoint later, entirely at your team's pace.

## 1. What this backend does

- Stores the prototype's monitored locations, environmental readings,
  risk predictions, early warnings, vulnerable roads/villages, and
  citizen reports in PostgreSQL instead of static JSON files.
- Exposes a small REST API over that data.
- Is shaped so a future ML pipeline can `POST` real predictions into
  the same `risk_predictions` table the seed data currently populates.
- Clearly marks the seeded data as simulated (see
  `risk_predictions.is_simulated`) so nobody downstream mistakes it
  for real measurements or real model output.

## 2. Architecture

```
React Frontend  →  Express REST API  →  PostgreSQL

(later)
ML / Prediction Pipeline  →  Express Backend  →  PostgreSQL  →  React Frontend
```

The frontend never talks to PostgreSQL directly — only through this API.

No ORM is used; queries are plain parameterized SQL via the [`pg`](https://node-postgres.com/)
library. For a small, beginner-friendly prototype with a handful of
tables, this keeps every query visible and easy to read/modify without
learning an ORM's query builder or migration system on top of learning
Express and PostgreSQL for the first time. Revisit this choice if the
schema grows significantly more complex.

## 3. PostgreSQL setup

Install PostgreSQL locally (e.g. via your OS package manager, or
[postgresapp.com](https://postgresapp.com/) on macOS, or the official
Windows installer), then create a database:

```bash
createdb sih26001
```

(Or, from `psql`: `CREATE DATABASE sih26001;`)

## 4. Configure `.env`

```bash
cp .env.example .env
```

Then edit `.env` and set `DATABASE_URL` to match your local PostgreSQL
user/password/database, e.g.:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sih26001
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

`FRONTEND_ORIGIN` should match wherever your Vite dev server actually
runs, so CORS allows the frontend to call this API.

## 5. Install dependencies

```bash
npm install
```

This installs `express`, `pg`, `cors`, and `dotenv` — nothing else.

## 6. Create the schema

```bash
npm run db:schema
```

This runs `src/db/schema.sql` against `DATABASE_URL`, creating all
tables, indexes, and the two convenience views
(`latest_risk_predictions`, `latest_environmental_observations`).

## 7. Seed prototype data

```bash
npm run db:seed
```

This runs `src/db/seed.sql`, which **wipes and re-inserts** the
prototype's 8 monitored locations, their environmental readings, risk
predictions, 5 early warnings, and 3 citizen reports — taken directly
from the frontend's `riskData.json`, `warningData.json`, and
`citizenReports.json`.

> **These are simulated prototype values**, not real measurements or
> real ML predictions. Every seeded risk prediction has
> `is_simulated = true` in the database for exactly this reason.

## 8. Start the server

```bash
npm start
```

Or, for auto-restart on file changes during development:

```bash
npm run dev
```

The API listens on `http://localhost:4000` by default (or whatever
`PORT` you set).

## 9. API endpoints

All responses use a consistent envelope:

```json
{ "success": true, "data": ... }
```

or, on error:

```json
{ "success": false, "error": "..." }
```

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Basic liveness check |
| GET | `/api/locations` | All monitored locations + their latest risk. Supports `?riskLevel=HIGH` |
| GET | `/api/locations/search?q=...` | Search locations by name/district/state |
| GET | `/api/locations/:id` | One location + its latest risk |
| GET | `/api/locations/:id/risk` | Latest risk prediction for a location (`?all=true` for full history) |
| GET | `/api/locations/:id/environment` | Latest environmental reading for a location (`?all=true` for full history) |
| GET | `/api/risk` | Latest risk prediction for every location (risk-focused feed) |
| POST | `/api/risk` | Store a new risk prediction (for the future ML system — see below) |
| GET | `/api/warnings` | All early warnings. Supports `?riskLevel=HIGH` and `?status=ACTIVE` |
| GET | `/api/warnings/:id` | One early warning |
| GET | `/api/citizen-reports` | All citizen reports. Supports `?status=PENDING` |
| POST | `/api/citizen-reports` | Submit a new citizen report |
| GET | `/api/citizen-reports/:id` | One citizen report |
| GET | `/api/dashboard/summary` | Counts for the dashboard's summary cards (high/medium/low risk, active warnings, citizen reports, monitored locations) |

## 10. Example requests

```bash
curl http://localhost:4000/api/locations
curl http://localhost:4000/api/locations?riskLevel=HIGH
curl "http://localhost:4000/api/locations/search?q=Shillong"
curl http://localhost:4000/api/locations/1/environment
curl http://localhost:4000/api/dashboard/summary

curl -X POST http://localhost:4000/api/citizen-reports \
  -H "Content-Type: application/json" \
  -d '{
    "location_name": "Haflong",
    "district": "Dima Hasao",
    "state": "Assam",
    "category": "Road Damage",
    "description": "New cracks observed after heavy rain."
  }'

# How the future ML system would submit a real prediction:
curl -X POST http://localhost:4000/api/risk \
  -H "Content-Type: application/json" \
  -d '{
    "location_id": 1,
    "risk_score": 85,
    "risk_level": "HIGH",
    "model_version": "landslide-model-v1.0"
  }'
```

## 11. Example responses

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "state": "Assam",
      "district": "Dima Hasao",
      "location": "Haflong",
      "latitude": "25.150000",
      "longitude": "93.020000",
      "risk_score": "82.00",
      "risk_level": "HIGH",
      "predicted_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

```json
{ "success": false, "error": "No location found with id 999." }
```

## 12. Database relationships

See `DATABASE_DESIGN.md` for the full schema explanation. In short:

```
locations
   ├── environmental_observations   (many per location, latest via view)
   ├── risk_predictions              (many per location, latest via view)
   ├── early_warnings                (references a location + optionally a prediction)
   ├── vulnerable_roads              (many per location)
   ├── vulnerable_villages           (many per location)
   └── citizen_reports               (optional link — see below)
```

## 13. How the React frontend will eventually connect

Today, the frontend's `src/services/riskApi.js` returns dummy JSON
directly. To switch it over later, that file's `getRiskData()` (and
similar functions in `warningApi.js` / `citizenReportApi.js`) would be
changed to call this API instead, e.g.:

```js
export async function getRiskData() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/risk`);
  const { data } = await res.json();
  return data;
}
```

Nothing in this backend requires that change to happen — the frontend
can adopt it whenever your team is ready. **This backend did not touch
any frontend file.**

## 14. How the ML team's predictions integrate later

The ML pipeline can `POST` to `/api/risk` with:

```json
{
  "location_id": 1,
  "risk_score": 82,
  "risk_level": "HIGH",
  "model_version": "landslide-model-v1.0",
  "predicted_at": "2026-03-01T10:00:00Z"
}
```

This inserts a new row into `risk_predictions` with `is_simulated =
false`, and it immediately becomes each endpoint's "latest" answer for
that location (via the `latest_risk_predictions` view) — no other code
changes needed on the backend side.

## 15. Simulated data disclosure

**Every value seeded by `src/db/seed.sql` is simulated prototype data**
copied from the existing frontend's JSON files, for demonstration
purposes only. It does not represent real environmental measurements,
real landslide risk predictions, or real citizen incident reports.
