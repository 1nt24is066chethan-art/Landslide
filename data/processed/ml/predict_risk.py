import json
import joblib
import pandas as pd


BASE = "data/processed/ml"


# -----------------------------
# Load trained artifacts
# -----------------------------
static_artifact = joblib.load(
    f"{BASE}/static_susceptibility_model.joblib"
)

rain_artifact = joblib.load(
    f"{BASE}/rainfall_model.joblib"
)

with open(f"{BASE}/risk_config.json") as f:
    risk_config = json.load(f)


static_model = static_artifact["model"]
static_features = static_artifact["features"]

rain_model = rain_artifact["model"]
rain_cols = rain_artifact["rainfall_columns"]
relative_cols = rain_artifact["relative_columns"]
state_medians = rain_artifact["state_medians"]


# -----------------------------
# Prediction function
# -----------------------------
def predict_risk(
    state,
    elevation_m,
    slope_deg,
    aspect_deg,
    lulc_class,
    clay_surface_pct,
    road_distance_m,
    settlement_distance_m,
    rainfall_24h_mm,
    rainfall_72h_mm,
    rainfall_7d_mm,
    rainfall_15d_mm
):

    # -------------------------
    # Static susceptibility
    # -------------------------
    static_input = pd.DataFrame([{
        "elevation_m": elevation_m,
        "slope_deg": slope_deg,
        "aspect_deg": aspect_deg,
        "lulc_class": lulc_class,
        "clay_surface_pct": clay_surface_pct,
        "road_distance_m": road_distance_m,
        "settlement_distance_m": settlement_distance_m
    }])

    static_input["clay_surface_pct"] = (
        static_input["clay_surface_pct"]
        .fillna(
            static_input["clay_surface_pct"].median()
        )
    )

    susceptibility_probability = (
        static_model
        .predict_proba(static_input[static_features])[:, 1][0]
    )


    # -------------------------
    # Rainfall trigger
    # -------------------------
    rainfall_input = pd.DataFrame([{
        "State": state,
        "rainfall_24h_mm": rainfall_24h_mm,
        "rainfall_72h_mm": rainfall_72h_mm,
        "rainfall_7d_mm": rainfall_7d_mm,
        "rainfall_15d_mm": rainfall_15d_mm
    }])

    for col in rain_cols:
        median = state_medians[col][state]
        rainfall_input[col + "_relative"] = (
            rainfall_input[col] / median
        )

    rainfall_probability = (
        rain_model
        .predict_proba(
            rainfall_input[relative_cols]
        )[:, 1][0]
    )


    # -------------------------
    # Final risk
    # -------------------------
    risk_score = (
        susceptibility_probability *
        rainfall_probability
    )


    # -------------------------
    # Risk classification
    # -------------------------
    low_max = risk_config["thresholds"]["low_max"]
    medium_max = risk_config["thresholds"]["medium_max"]

    if risk_score < low_max:
        risk_level = "Low"
    elif risk_score < medium_max:
        risk_level = "Medium"
    else:
        risk_level = "High"


    return {
        "susceptibility_probability":
            round(float(susceptibility_probability), 4),

        "rainfall_probability":
            round(float(rainfall_probability), 4),

        "risk_score":
            round(float(risk_score), 4),

        "risk_level":
            risk_level
    }


# -----------------------------
# Test prediction
# -----------------------------
if __name__ == "__main__":

    result = predict_risk(
        state="Arunachal Pradesh",

        elevation_m=605,
        slope_deg=37,
        aspect_deg=188,
        lulc_class=50,
        clay_surface_pct=25.0,

        road_distance_m=7.347575,
        settlement_distance_m=450.36478,

        rainfall_24h_mm=23.919999,
        rainfall_72h_mm=50.974999,
        rainfall_7d_mm=73.819998,
        rainfall_15d_mm=103.739998
    )

    print()
    print("LANDSLIDE RISK PREDICTION")
    print("=" * 40)

    for key, value in result.items():
        print(f"{key}: {value}")
