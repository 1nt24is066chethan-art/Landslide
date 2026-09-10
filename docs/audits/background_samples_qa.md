A3.7 — QA REPORT: FINAL BACKGROUND SAMPLES
============================================================

Total generated background samples: 11020
Target total: 11020
Random seed: 42
CRS used: EPSG:3573 (EPSG:3573, Albers Equal Area)

Per-state counts:
  ARUNACHAL PRADESH: 1220 generated (target: 1220)
  ASSAM: 856 generated (target: 856)
  MANIPUR: 1631 generated (target: 1631)
  MEGHALAYA: 1051 generated (target: 1051)
  MIZORAM: 3486 generated (target: 3486)
  NAGALAND: 1902 generated (target: 1902)
  SIKKIM: 777 generated (target: 777)
  TRIPURA: 97 generated (target: 97)

Duplicate background points: 0

Points outside assigned NER state polygon: 0

Minimum distance to positive landslide: inf m
Points violating 5 km rule: 0

Points overlapping positive coordinates: 0

Artificial placeholder boundary: NEVER USED (only ner_states_real.geojson)

Source files:
  - data/processed/ner_landslides.csv (positive inventory)
  - data/raw/boundaries/ner_states_real.geojson (real NER boundaries)
  - feasibility_point_level.py (feasible region geometry)
  - generate_background_samples.py (this script)

Confirmation statements:
  - Anomalous coordinate (-23.736217, 92.796936) excluded from spatial calculations, retained in inventory
  - No background-to-background 5 km exclusion applied
  - 5 km restriction applies only between background and positive landslide coordinates
  - CRS used for all distance calculations: EPSG:3573 (meters)
  - Random seed: 42 (deterministic)