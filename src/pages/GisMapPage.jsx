import RiskMap from "../components/map/RiskMap";

export default function GisMapPage() {
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
        <RiskMap />
      </div>
    </div>
  );
}
