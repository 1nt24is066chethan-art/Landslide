import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { getRiskData } from "../../services/riskApi";
import { getRiskLabel, getToneClasses } from "../../utils/riskUtils";

const NER_CENTER = [25.8, 93.5];

const INDIA_BOUNDS = [
  [6.0, 68.0],
  [37.0, 98.0],
];

function createRiskIcon(riskLevel) {
  const level = riskLevel?.toLowerCase();

  const colors = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e",
  };

  const color = colors[level] ?? "#38bdf8";

  return L.divIcon({
    className: "risk-marker",
    html: `<div style="width:20px;height:20px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 0 0 3px ${color}55,0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

/*
 * Automatically moves the map to the selected location.
 *
 * This is used when a place is selected from
 * the "Check a Place" search feature.
 */
function MapLocationController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo([location.lat, location.lon], 9, {
      duration: 1.2,
    });
  }, [location, map]);

  return null;
}

/*
 * Custom popup.
 *
 * We are intentionally not using Leaflet's Popup component.
 * This lets us keep the popup completely inside the visible map area.
 */
function RiskPopup({ location, onClose }) {
  const map = useMap();
  const popupRef = useRef(null);

  const [position, setPosition] = useState({
    left: 0,
    top: 0,
  });

  useEffect(() => {
    if (!location) {
      return;
    }

    function updatePosition() {
      if (!popupRef.current) {
        return;
      }

      const mapContainer = map.getContainer();
      const popupElement = popupRef.current;

      const markerPoint = map.latLngToContainerPoint([
        location.lat,
        location.lon,
      ]);

      const mapWidth = mapContainer.clientWidth;
      const mapHeight = mapContainer.clientHeight;

      const popupWidth = popupElement.offsetWidth;
      const popupHeight = popupElement.offsetHeight;

      const padding = 12;
      const gap = 14;

      /*
       * Prefer opening above the marker.
       * If there isn't enough room, open below it.
       */
      let top = markerPoint.y - popupHeight - gap;

      if (top < padding) {
        top = markerPoint.y + gap;
      }

      /*
       * Keep the popup vertically inside the map.
       */
      top = Math.max(
        padding,
        Math.min(top, mapHeight - popupHeight - padding)
      );

      /*
       * Center popup horizontally around marker.
       */
      let left = markerPoint.x - popupWidth / 2;

      /*
       * Keep popup horizontally inside the map.
       */
      left = Math.max(
        padding,
        Math.min(left, mapWidth - popupWidth - padding)
      );

      setPosition({
        left,
        top,
      });
    }

    /*
     * Wait until the popup has been rendered so that
     * offsetWidth/offsetHeight are available.
     */
    const frame = requestAnimationFrame(updatePosition);

    map.on("move", updatePosition);
    map.on("zoom", updatePosition);
    map.on("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frame);

      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
      map.off("resize", updatePosition);
    };
  }, [location, map]);

  if (!location) {
    return null;
  }

  const tone = location.riskLevel?.toLowerCase();
  const toneClasses = getToneClasses(tone);

  return (
    <div
      ref={popupRef}
      className="absolute z-[2000] w-[300px] max-w-[calc(100%-24px)] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {location.location}
          </h3>

          <p className="text-xs text-slate-500">
            {location.district}, {location.state}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close location details"
        >
          ×
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">
          Risk Score
        </span>

        <span className="text-lg font-bold text-slate-900">
          {location.riskScore}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Risk Level
        </span>

        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${toneClasses.badge}`}
        >
          {getRiskLabel(tone)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200 pt-3 text-xs">
        <div>
          <p className="text-slate-500">Rainfall</p>
          <p className="font-semibold text-slate-800">
            {location.rainfall} mm
          </p>
        </div>

        <div>
          <p className="text-slate-500">Soil Moisture</p>
          <p className="font-semibold text-slate-800">
            {location.soilMoisture}%
          </p>
        </div>

        <div>
          <p className="text-slate-500">Slope</p>
          <p className="font-semibold text-slate-800">
            {location.slope}°
          </p>
        </div>

        <div>
          <p className="text-slate-500">Temperature</p>
          <p className="font-semibold text-slate-800">
            {location.temperature}°C
          </p>
        </div>

        <div>
          <p className="text-slate-500">Vulnerable Roads</p>
          <p className="font-semibold text-slate-800">
            {location.vulnerableRoads}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Vulnerable Villages</p>
          <p className="font-semibold text-slate-800">
            {location.vulnerableVillages}
          </p>
        </div>
      </div>
    </div>
  );
}

function RiskMap({ onLocationSelect, initialLocationId }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [indiaGeoJson, setIndiaGeoJson] = useState(null);
  const [selectedPopup, setSelectedPopup] = useState(null);
  const [riskFilter, setRiskFilter] = useState("ALL");

  useEffect(() => {
    async function loadRiskData() {
      try {
        setLoading(true);
        setError("");

        const data = await getRiskData();
        setLocations(data);
      } catch (err) {
        console.error("Failed to load risk data:", err);
        setError("Unable to load risk location data.");
      } finally {
        setLoading(false);
      }
    }

    loadRiskData();
  }, []);

  useEffect(() => {
    async function loadIndiaGeoJson() {
      try {
        const response = await fetch("/data/india_states.geojson");

        if (!response.ok) {
          throw new Error("Failed to load India GeoJSON");
        }

        const data = await response.json();
        setIndiaGeoJson(data);
      } catch (err) {
        console.error("Failed to load India GeoJSON:", err);
      }
    }

    loadIndiaGeoJson();
  }, []);

  /*
   * Select a location when it is passed from
   * the Check a Place search feature.
   */
  useEffect(() => {
    if (!initialLocationId || locations.length === 0) {
      return;
    }

    const location = locations.find(
      (item) => item.id === initialLocationId
    );

    if (!location) {
      return;
    }

    setSelectedPopup(location);
    onLocationSelect?.(location);
  }, [initialLocationId, locations, onLocationSelect]);

  function handleLocationClick(location) {
    setSelectedPopup(location);
    onLocationSelect?.(location);
  }

  useEffect(() => {
    if (
      selectedPopup &&
      riskFilter !== "ALL" &&
      selectedPopup.riskLevel?.toUpperCase() !== riskFilter
    ) {
      setSelectedPopup(null);
      onLocationSelect?.(null);
    }
  }, [riskFilter, selectedPopup, onLocationSelect]);

  return (
    <div className="relative h-[650px] w-full overflow-hidden rounded-xl border border-slate-700">
      <MapContainer
        center={NER_CENTER}
        zoom={6}
        minZoom={5}
        maxZoom={10}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Automatically fly to the selected/search location */}
        <MapLocationController location={selectedPopup} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {indiaGeoJson && (
          <GeoJSON
            data={indiaGeoJson}
            style={{
              color: "#38bdf8",
              weight: 1.5,
              fillColor: "#0f172a",
              fillOpacity: 0.08,
            }}
          />
        )}

        {locations
          .filter((location) => {
            if (riskFilter === "ALL") {
              return true;
            }

            return (
              location.riskLevel?.toUpperCase() === riskFilter
            );
          })
          .map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lon]}
              icon={createRiskIcon(location.riskLevel)}
              eventHandlers={{
                click: () => handleLocationClick(location),
              }}
            />
          ))}

        {selectedPopup && (
          <RiskPopup
            location={selectedPopup}
            onClose={() => {
              setSelectedPopup(null);
              onLocationSelect?.(null);
            }}
          />
        )}
      </MapContainer>

      {loading && (
        <div className="absolute left-4 top-4 z-[1000] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow">
          Loading risk locations...
        </div>
      )}

      {error && (
        <div className="absolute left-4 top-4 z-[1000] rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-600 shadow">
          {error}
        </div>
      )}

      <div className="absolute right-4 top-4 z-[1000] flex flex-wrap gap-2">
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => {
          const count =
            level === "ALL"
              ? locations.length
              : locations.filter(
                  (location) =>
                    location.riskLevel?.toUpperCase() === level
                ).length;

          return (
            <button
              key={level}
              type="button"
              onClick={() => setRiskFilter(level)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold shadow transition ${
                riskFilter === level
                  ? "border-sky-400 bg-sky-500 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {level === "ALL" ? "ALL" : `${level} RISK`} {count}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-slate-200 bg-white p-3 shadow">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Risk Level
        </p>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            HIGH
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            MEDIUM
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            LOW
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskMap;