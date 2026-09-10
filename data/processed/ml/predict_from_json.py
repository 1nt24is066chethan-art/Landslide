import sys
import json
from predict_risk import predict_risk

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())

    result = predict_risk(
        state=input_data["state"],
        elevation_m=input_data["elevation_m"],
        slope_deg=input_data["slope_deg"],
        aspect_deg=input_data["aspect_deg"],
        lulc_class=input_data["lulc_class"],
        clay_surface_pct=input_data["clay_surface_pct"],
        road_distance_m=input_data["road_distance_m"],
        settlement_distance_m=input_data["settlement_distance_m"],
        rainfall_24h_mm=input_data["rainfall_24h_mm"],
        rainfall_72h_mm=input_data["rainfall_72h_mm"],
        rainfall_7d_mm=input_data["rainfall_7d_mm"],
        rainfall_15d_mm=input_data["rainfall_15d_mm"]
    )

    print(json.dumps(result, indent=2))
