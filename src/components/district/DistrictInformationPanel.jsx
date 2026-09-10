import {
  MapPin,
  CloudRain,
  Droplets,
  Mountain,
  Thermometer,
  Route,
  Home,
  Loader2,
} from "lucide-react";

import { getRiskLabel, getToneClasses } from "../../utils/riskUtils";
import RiskScoreIndicator from "../risks/RiskScoreIndicator";
import EnvironmentalChart from "../charts/EnvironmentalChart";

function DistrictInformationPanel({ location }) {
  if (!location) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <div className="flex min-h-[300px] items-center justify-center text-center">
          <div>
            <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-500" />

            <h2 className="text-lg font-semibold text-slate-200">
              No Location Selected
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a risk location on the map to view its details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tone = location.riskLevel?.toLowerCase();
  const toneClasses = getToneClasses(tone);

  const roadsLoading = location.vulnerableRoads === undefined;
  const villagesLoading = location.vulnerableVillages === undefined;
  const roadsError = location.vulnerableRoads === null;
  const villagesError = location.vulnerableVillages === null;
  const envLoading = location.rainfall === undefined || location.soilMoisture === undefined;
  const envError = location.rainfall === null || location.soilMoisture === null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      {/* Location Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-slate-400" />

            <h2 className="text-xl font-semibold text-slate-100">
              {location.location}
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            {location.district}, {location.state}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses.badge}`}
        >
          {getRiskLabel(tone)}
        </span>
      </div>

      {/* Risk Score + Location */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Risk Score
          </p>

          <div className="mt-3 flex items-center justify-center">
            <RiskScoreIndicator
              score={location.riskScore}
              riskLevel={location.riskLevel}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Location
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-200">
            {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Environmental Conditions
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            icon={CloudRain}
            label="Rainfall"
            value={envLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : envError ? "Unavailable" : `${location.rainfall ?? location.rainfallMm} mm`}
          />

          <InfoItem
            icon={Droplets}
            label="Soil Moisture"
            value={envLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : envError ? "Unavailable" : `${location.soilMoisture ?? location.soilMoisturePercent}%`}
          />

          <InfoItem
            icon={Mountain}
            label="Slope"
            value={envLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : envError ? "Unavailable" : `${location.slope ?? location.slopeDegrees}°`}
          />

          <InfoItem
            icon={Thermometer}
            label="Temperature"
            value={envLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : envError ? "Unavailable" : `${location.temperature ?? location.temperatureCelsius}°C`}
          />
        </div>
        <div className="mt-5">
          <EnvironmentalChart location={location} />
        </div>
      </div>

      {/* Vulnerable Infrastructure */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Vulnerable Infrastructure
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfrastructureItem
            icon={Route}
            label="Vulnerable Roads"
            value={roadsLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : roadsError ? "Unavailable" : location.vulnerableRoads}
            unit="roads requiring monitoring"
            tone="medium"
            loading={roadsLoading}
            error={roadsError}
          />

          <InfrastructureItem
            icon={Home}
            label="Vulnerable Villages"
            value={villagesLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : villagesError ? "Unavailable" : location.vulnerableVillages}
            unit="villages requiring monitoring"
            tone="high"
            loading={villagesLoading}
            error={villagesError}
          />
        </div>

        {/* Optional: Show details if available */}
        {(location.vulnerableRoadDetails?.length > 0 || location.vulnerableVillageDetails?.length > 0) && (
          <div className="mt-4 space-y-3">
            {location.vulnerableRoadDetails?.length > 0 && (
              <details className="rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                <summary className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <Route className="h-3.5 w-3.5 text-slate-400" />
                  <span>Vulnerable Roads Details</span>
                  <span className="ml-auto text-[10px] text-slate-500">{location.vulnerableRoadDetails.length} items</span>
                </summary>
                <ul className="mt-2 space-y-1 text-xs text-slate-400">
                  {location.vulnerableRoadDetails.map((road) => (
                    <li key={road.id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      {road.name && !road.name.startsWith("Unnamed") ? road.name : `Road Segment ${road.id}`}
                      {road.riskLevel && (
                        <span className="ml-2 px-1.5 py-0.5 text-[9px] rounded bg-slate-700">
                          {road.riskLevel}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {location.vulnerableVillageDetails?.length > 0 && (
              <details className="rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                <summary className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <Home className="h-3.5 w-3.5 text-slate-400" />
                  <span>Vulnerable Villages Details</span>
                  <span className="ml-auto text-[10px] text-slate-500">{location.vulnerableVillageDetails.length} items</span>
                </summary>
                <ul className="mt-2 space-y-1 text-xs text-slate-400">
                  {location.vulnerableVillageDetails.map((village) => (
                    <li key={village.id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      {village.name && !village.name.startsWith("Unnamed") ? village.name : `Village ${village.id}`}
                      {village.riskLevel && (
                        <span className="ml-2 px-1.5 py-0.5 text-[9px] rounded bg-slate-700">
                          {village.riskLevel}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />

        <p className="text-xs text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function InfrastructureItem({
  icon: Icon,
  label,
  value,
  unit,
  tone,
  loading,
  error,
}) {
  const toneClasses = getToneClasses(tone);

  const displayValue = loading
    ? <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    : error
    ? <span className="text-red-400">Unavailable</span>
    : <span className={`text-2xl font-bold ${toneClasses.text}`}>{value}</span>;

  return (
    <div
      className={`rounded-lg border ${toneClasses.border} ${toneClasses.bg} p-4`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${toneClasses.iconText}`} />

          <p className="text-xs text-slate-400">
            {label}
          </p>
        </div>

        <div className="flex flex-col items-end">
          {displayValue}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {unit}
      </p>
    </div>
  );
}

export default DistrictInformationPanel;