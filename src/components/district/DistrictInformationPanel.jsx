
import {
  MapPin,
  CloudRain,
  Droplets,
  Mountain,
  Thermometer,
  Route,
  Home,
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
        <div
          className={`rounded-lg border ${toneClasses.border} ${toneClasses.bg} p-4`}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Risk Score
          </p>

          <RiskScoreIndicator
            score={location.riskScore}
            riskLevel={location.riskLevel}
          />
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
            value={`${location.rainfall} mm`}
          />

          <InfoItem
            icon={Droplets}
            label="Soil Moisture"
            value={`${location.soilMoisture}%`}
          />

          <InfoItem
            icon={Mountain}
            label="Slope"
            value={`${location.slope}°`}
          />

          <InfoItem
            icon={Thermometer}
            label="Temperature"
            value={`${location.temperature}°C`}
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
          <InfoItem
            icon={Route}
            label="Vulnerable Roads"
            value={location.vulnerableRoads}
          />

          <InfoItem
            icon={Home}
            label="Vulnerable Villages"
            value={location.vulnerableVillages}
          />
        </div>
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

export default DistrictInformationPanel;