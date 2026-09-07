import { useLocation } from "react-router-dom";
import { useState } from "react";

import RiskMap from "../components/map/RiskMap";
import DistrictInformationPanel from "../components/district/DistrictInformationPanel";

export default function GisMapPage() {
  const routerLocation = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);

  const initialLocationId =
    routerLocation.state?.locationId ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          GIS Risk Map
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Interactive Northeast India landslide risk monitoring map
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <RiskMap
          onLocationSelect={setSelectedLocation}
          initialLocationId={initialLocationId}
        />
      </div>

      <DistrictInformationPanel
        location={selectedLocation}
      />
    </div>
  );
}
