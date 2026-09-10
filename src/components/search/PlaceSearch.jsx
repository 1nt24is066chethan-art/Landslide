import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  CloudRain,
  Droplets,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

import { searchRiskLocations } from "../../services/riskApi";
import { getRiskLabel, getToneClasses } from "../../utils/riskUtils";

function PlaceSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async (searchQuery) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setShowEmptyState(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await searchRiskLocations(trimmed);
      setResults(data);
      setShowEmptyState(data.length === 0);
    } catch (err) {
      setError(err.message);
      setResults([]);
      setShowEmptyState(false);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleQueryChange(event) {
    const value = event.target.value;
    setQuery(value);
    setError(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setShowEmptyState(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Check a Place
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Check landslide risk before travelling.
        </p>
      </div>

      {/* Search Box */}
      <div className="relative mt-4">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />

        <input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search place, district or state..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-sky-400"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <PlaceResultSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-red-400" />
          <p className="mt-2 text-sm text-red-300">Search failed</p>
          <p className="mt-1 text-xs text-slate-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {query.trim() && !loading && !error && (
        <div className="mt-4 space-y-3">
          {results.length === 0 ? (
            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-6 text-center">
              <MapPin className="mx-auto h-7 w-7 text-slate-600" />

              <p className="mt-2 text-sm font-medium text-slate-300">
                No monitored location found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Try searching for a monitored location, district, or state.
              </p>
            </div>
          ) : (
            results.map((location) => (
              <PlaceResult
                key={location.id}
                location={location}
                onViewMap={() =>
                  navigate("/gis-map", {
                    state: {
                      locationId: location.id,
                    },
                  })
                }
              />
            ))
          )}
        </div>
      )}

      {/* Empty state before searching */}
      {!query.trim() && !loading && !error && (
        <div className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-800/20 p-5 text-center">
          <Search className="mx-auto h-6 w-6 text-slate-600" />

          <p className="mt-2 text-xs text-slate-500">
            Search for a place such as Shillong, Gangtok, Tawang or Assam.
          </p>
        </div>
      )}
    </section>
  );
}

function PlaceResult({ location, onViewMap }) {
  const tone = location.riskLevel?.toLowerCase();
  const toneClasses = getToneClasses(tone);

  const warning = location.warningId ? {
    id: location.warningId,
    message: location.warningMessage,
    status: location.warningStatus,
  } : null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
      {/* Location + Risk */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />

            <h3 className="font-semibold text-slate-100">
              {location.location}
            </h3>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {location.district}, {location.state}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses.badge}`}
          >
            {getRiskLabel(tone)}
          </span>

          <span className="text-lg font-bold text-slate-100">
            {location.riskScore}
            <span className="ml-1 text-xs font-normal text-slate-500">
              /100
            </span>
          </span>
        </div>
      </div>

      {/* Environmental information */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          icon={CloudRain}
          label="Rainfall"
          value={`${location.rainfallMm ?? location.rainfall} mm`}
        />

        <Metric
          icon={Droplets}
          label="Soil Moisture"
          value={`${location.soilMoisturePercent ?? location.soilMoisture}%`}
        />

        <Metric
          icon={MapPin}
          label="Slope"
          value={`${location.slopeDegrees ?? location.slope}°`}
        />

        <Metric
          icon={AlertTriangle}
          label="Warnings"
          value={location.warning?.status === "ACTIVE" ? "Active" : location.warning?.status === "ACKNOWLEDGED" ? "Acknowledged" : "None"}
        />
      </div>

      {/* Warning */}
      {location.warning && (
        <div
          className={`mt-4 rounded-lg border ${toneClasses.border} ${toneClasses.bg} p-3`}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className={`mt-0.5 h-4 w-4 shrink-0 ${toneClasses.iconText}`}
            />

            <div>
              <p
                className={`text-xs font-semibold ${toneClasses.text}`}
              >
                {location.warning.status === "ACTIVE" ? "Active Warning" :
                 location.warning.status === "ACKNOWLEDGED" ? "Acknowledged Warning" :
                 location.warning.status === "RESOLVED" ? "Resolved Warning" : "Warning"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {location.warning.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GIS button */}
      <div className="mt-4 flex justify-end border-t border-slate-700 pt-3">
        <button
          type="button"
          onClick={onViewMap}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-sky-400 transition hover:bg-slate-800 hover:text-sky-300"
        >
          View on GIS Map
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-3 text-[10px] text-slate-600">
        Prototype information based on simulated monitoring data.
      </p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-slate-500" />

        <span className="text-[10px] text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function PlaceResultSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 animate-pulse">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="h-5 w-32 bg-slate-700 rounded" />
          <div className="mt-2 h-3 w-40 bg-slate-700 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-slate-700 rounded-full" />
          <div className="h-6 w-16 bg-slate-700 rounded" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <div className="h-3 w-16 bg-slate-700 rounded" />
            <div className="mt-1 h-4 w-20 bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      <div className="mt-4 h-16 bg-slate-700/30 rounded-lg" />
      <div className="mt-4 flex justify-end">
        <div className="h-8 w-24 bg-slate-700 rounded-lg" />
      </div>
    </div>
  );
}

export default PlaceSearch;