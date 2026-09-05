# NER Landslide Early Warning System — Prototype (SIH26001, Work B)

Frontend + GIS dashboard prototype. This repo covers **Work B only**
(website + GIS dashboard). Datasets, preprocessing, model training, and the
prediction API are owned by a separate team — this project consumes their
output as JSON, and currently uses dummy JSON in its place.

All data shown is **simulated / prototype data** unless stated otherwise.
No real-time feeds, ML inference, or production backend are implemented here.

## Status: Phase 2 of 12 — Dashboard overview

Phase 1 (done): Vite + React + Tailwind setup, React Router, dark
command-center theme, responsive app shell (sidebar / mobile drawer / header).

Phase 2 (done): Dashboard Overview page —
- Risk summary cards (High/Medium/Low risk locations, Active Warnings, Citizen Reports)
- System Overview strip (monitoring coverage, data status, prediction status, system status)
- Active Alerts preview (dummy alerts with severity, location, description, relative time)
- GIS Risk Map placeholder (abstract, no fake geographic data, no Leaflet yet)
- Rainfall Trend / Environmental Conditions placeholders (no Recharts yet)
- Quick System Summary strip
- Centralized risk styling in `src/utils/riskUtils.js`, dummy numbers in `src/data/dashboardData.js`

Not yet implemented (by design, per phase plan): GIS map, real dummy JSON +
riskApi.js data flow, risk-score visualization, charts, real alerts page,
vulnerable roads/villages, citizen reporting, any backend/API.

## Getting started

This project was built in an offline environment, so dependencies have not
been installed here. On your machine, with internet access:

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/
│   ├── layout/       # Header, Sidebar, MobileDrawer, AppLayout (built)
│   ├── dashboard/     # (Phase 2)
│   ├── map/           # (Phase 3+)
│   ├── district/      # (Phase 5)
│   ├── charts/        # (Phase 7)
│   ├── alerts/        # (Phase 8)
│   └── reports/       # (Phase 10)
├── pages/             # One page per route
├── data/              # dummyData.json arrives Phase 4
├── services/          # riskApi.js arrives Phase 4
├── utils/             # riskUtils.js arrives Phase 6
├── App.jsx            # Route wiring only
├── main.jsx           # React root + Router provider
└── index.css          # Tailwind + shared component classes
```

## Scope boundaries

- No ML model, training, or inference is implemented in this codebase.
- No production backend — citizen reports (Phase 10) will use local
  React state/localStorage only.
- No paid APIs or map tiles — Leaflet + OpenStreetMap (added Phase 3).
- Any demo/prototype geographic or sensor data will be clearly labeled
  as such in the UI once introduced.

See the project's scope documents (Requirements + Exclusions) for the full
authoritative specification.
