import csv
import json
import math
import sys
from pathlib import Path

from predict_risk import predict_risk


# predict_location_from_json.py is located at:
#
# Landslide/
# └── data/
#     └── processed/
#         └── ml/
#             └── predict_location_from_json.py
#
# Therefore:
# parents[0] = ml
# parents[1] = processed
# parents[2] = data
# parents[3] = Landslide
PROJECT_ROOT = Path(__file__).resolve().parents[3]

MASTER_DATASET = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "master"
    / "ner_landslide_master.csv"
)

RAINFALL_DATASET = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "ml"
    / "rainfall_ml_dataset.csv"
)


def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Calculate approximate distance between two coordinates."""

    radius_km = 6371.0

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)

    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad)
        * math.cos(lat2_rad)
        * math.sin(delta_lon / 2) ** 2
    )

    return 2 * radius_km * math.asin(math.sqrt(a))


def load_master_records():
    with MASTER_DATASET.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:
        return list(csv.DictReader(file))


def load_rainfall_records():
    with RAINFALL_DATASET.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:
        return list(csv.DictReader(file))


def find_nearest_rainfall_event(
    target_lat,
    target_lon,
    target_state=None,
    target_district=None
):
    records = load_rainfall_records()

    candidates = []

    # Prefer records from the same state.
    for record in records:
        try:
            latitude = float(record["Latitude"])
            longitude = float(record["Longitude"])
        except (TypeError, ValueError):
            continue

        if target_state:
            if (
                record.get("State", "").strip().lower()
                != target_state.strip().lower()
            ):
                continue

        distance = haversine_distance_km(
            target_lat,
            target_lon,
            latitude,
            longitude
        )

        candidates.append(
            {
                "record": record,
                "distance_km": distance,
            }
        )

    # If no same-state rainfall records exist,
    # fall back to district matching.
    if not candidates and target_district:
        for record in records:
            if (
                record.get("District", "").strip().lower()
                != target_district.strip().lower()
            ):
                continue

            try:
                latitude = float(record["Latitude"])
                longitude = float(record["Longitude"])
            except (TypeError, ValueError):
                continue

            distance = haversine_distance_km(
                target_lat,
                target_lon,
                latitude,
                longitude
            )

            candidates.append(
                {
                    "record": record,
                    "distance_km": distance,
                }
            )

    if not candidates:
        raise ValueError(
            "No rainfall event could be found for the requested location."
        )

    candidates.sort(
        key=lambda item: item["distance_km"]
    )

    return candidates[0]


def find_master_record(sl_no):
    records = load_master_records()

    for record in records:
        if (
            record.get("SlNo", "").strip()
            == str(sl_no).strip()
        ):
            return record

    raise ValueError(
        f"No master record found for SlNo={sl_no}."
    )


def build_prediction_input(location):
    target_lat = float(location["latitude"])
    target_lon = float(location["longitude"])

    rainfall_match = find_nearest_rainfall_event(
        target_lat=target_lat,
        target_lon=target_lon,
        target_state=location.get("state"),
        target_district=location.get("district"),
    )

    rainfall_record = rainfall_match["record"]

    sl_no = rainfall_record["SlNo"]

    # Use the exact same SlNo to retrieve the
    # corresponding static features from master.
    master_record = find_master_record(sl_no)

    required_static_fields = [
        "elevation_m",
        "slope_deg",
        "aspect_deg",
        "lulc_class",
        "clay_surface_pct",
        "road_distance_m",
        "settlement_distance_m",
    ]

    for field in required_static_fields:
        value = master_record.get(field)

        if value is None or value == "":
            raise ValueError(
                f"Master record {sl_no} is missing {field}."
            )

    prediction_input = {
        "state": master_record["State"],

        "elevation_m": float(
            master_record["elevation_m"]
        ),

        "slope_deg": float(
            master_record["slope_deg"]
        ),

        "aspect_deg": float(
            master_record["aspect_deg"]
        ),

        "lulc_class": float(
            master_record["lulc_class"]
        ),

        "clay_surface_pct": float(
            master_record["clay_surface_pct"]
        ),

        "road_distance_m": float(
            master_record["road_distance_m"]
        ),

        "settlement_distance_m": float(
            master_record["settlement_distance_m"]
        ),

        "rainfall_24h_mm": float(
            rainfall_record["rainfall_24h_mm"]
        ),

        "rainfall_72h_mm": float(
            rainfall_record["rainfall_72h_mm"]
        ),

        "rainfall_7d_mm": float(
            rainfall_record["rainfall_7d_mm"]
        ),

        "rainfall_15d_mm": float(
            rainfall_record["rainfall_15d_mm"]
        ),
    }

    metadata = {
        "sourceSlNo": sl_no,

        "sourceEventDate":
            rainfall_record.get("event_date"),

        "sourceLatitude":
            float(rainfall_record["Latitude"]),

        "sourceLongitude":
            float(rainfall_record["Longitude"]),

        "sourceDistanceKm":
            round(
                rainfall_match["distance_km"],
                3
            ),
    }

    return prediction_input, metadata


def main():
    input_data = json.loads(
        sys.stdin.read()
    )

    prediction_input, metadata = (
        build_prediction_input(input_data)
    )

    result = predict_risk(
        **prediction_input
    )

    output = {
        **result,

        "input_features":
            prediction_input,

        "source":
            metadata,
    }

    print(
        json.dumps(output)
    )


if __name__ == "__main__":
    main()