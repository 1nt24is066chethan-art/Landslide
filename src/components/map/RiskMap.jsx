import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import L from "leaflet";

import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  getRiskData,
  getRiskLocationEnvironment,
  getVulnerableRoads,
  getVulnerableVillages,
  predictLocationRisk,
} from "../../services/riskApi";

import {
  getRiskLabel,
  getToneClasses,
} from "../../utils/riskUtils";


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

    html: `
      <div
        style="
          width:20px;
          height:20px;
          border-radius:9999px;
          background:${color};
          border:3px solid white;
          box-shadow:
            0 0 0 3px ${color}55,
            0 2px 6px rgba(0,0,0,0.35);
        "
      ></div>
    `,

    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}


/*
 * Automatically moves the map to the selected location.
 */
function MapLocationController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo(
      [location.lat, location.lon],
      9,
      {
        duration: 1.2,
      }
    );
  }, [location, map]);

  return null;
}


/*
 * Custom popup.
 *
 * We intentionally keep this outside Leaflet's Popup
 * component so the popup remains inside the visible
 * map area.
 */
function RiskPopup({
  location,
  environment,
  environmentLoading,
  environmentError,
  roadsLoading,
  roadsError,
  villagesLoading,
  villagesError,
  mlPrediction,
  mlLoading,
  mlError,
  onClose,
}) {
  const map = useMap();

  const popupRef = useRef(null);

  const [position, setPosition] =
    useState({
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

      const mapContainer =
        map.getContainer();

      const popupElement =
        popupRef.current;

      const markerPoint =
        map.latLngToContainerPoint([
          location.lat,
          location.lon,
        ]);

      const mapWidth =
        mapContainer.clientWidth;

      const mapHeight =
        mapContainer.clientHeight;

      const popupWidth =
        popupElement.offsetWidth;

      const popupHeight =
        popupElement.offsetHeight;

      const padding = 12;
      const gap = 14;

      let top =
        markerPoint.y -
        popupHeight -
        gap;

      if (top < padding) {
        top =
          markerPoint.y +
          gap;
      }

      top = Math.max(
        padding,
        Math.min(
          top,
          mapHeight -
            popupHeight -
            padding
        )
      );

      let left =
        markerPoint.x -
        popupWidth / 2;

      left = Math.max(
        padding,
        Math.min(
          left,
          mapWidth -
            popupWidth -
            padding
        )
      );

      setPosition({
        left,
        top,
      });
    }

    const frame =
      requestAnimationFrame(
        updatePosition
      );

    map.on(
      "move",
      updatePosition
    );

    map.on(
      "zoom",
      updatePosition
    );

    map.on(
      "resize",
      updatePosition
    );

    return () => {
      cancelAnimationFrame(frame);

      map.off(
        "move",
        updatePosition
      );

      map.off(
        "zoom",
        updatePosition
      );

      map.off(
        "resize",
        updatePosition
      );
    };
  }, [location, map]);


  if (!location) {
    return null;
  }


  const tone =
    location.riskLevel?.toLowerCase();

  const toneClasses =
    getToneClasses(tone);


  return (
    <div
      ref={popupRef}
      className="
        absolute
        z-[2000]
        w-[330px]
        max-w-[calc(100%-24px)]
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-2xl
      "
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">

        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {location.location}
          </h3>

          <p className="text-xs text-slate-500">
            {location.district},{" "}
            {location.state}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-full
            text-lg
            leading-none
            text-slate-500
            transition
            hover:bg-slate-100
            hover:text-slate-900
          "
          aria-label="Close location details"
        >
          ×
        </button>
      </div>


      {/* Current ML risk */}
      <div className="flex items-center justify-between gap-3">

        <span className="text-sm font-medium text-slate-700">
          ML Risk Score
        </span>

        {mlLoading ? (
          <span className="text-sm font-semibold text-slate-500 animate-pulse">
            Running model...
          </span>
        ) : mlPrediction ? (
          <span className="text-lg font-bold text-slate-900">
            {mlPrediction.riskScorePercent}%
          </span>
        ) : (
          <span className="text-lg font-bold text-slate-900">
            {location.riskScore}
          </span>
        )}

      </div>


      <div className="mt-3 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-700">
          Risk Level
        </span>

        <span
          className={`
            rounded-full
            px-2
            py-1
            text-xs
            font-semibold
            ${toneClasses.badge}
          `}
        >
          {getRiskLabel(tone)}
        </span>

      </div>


      {/* ML model details */}
      {mlLoading && (
        <div className="
          mt-4
          rounded-lg
          border
          border-sky-200
          bg-sky-50
          p-3
        ">
          <p className="text-xs font-semibold text-sky-800">
            ML INFERENCE
          </p>

          <p className="mt-1 text-xs text-sky-700">
            Running the landslide risk model...
          </p>
        </div>
      )}


      {mlError && !mlLoading && (
        <div className="
          mt-4
          rounded-lg
          border
          border-red-200
          bg-red-50
          p-3
        ">
          <p className="text-xs font-semibold text-red-800">
            ML INFERENCE UNAVAILABLE
          </p>

          <p className="mt-1 text-xs text-red-700">
            {mlError}
          </p>
        </div>
      )}


      {mlPrediction && !mlLoading && (
        <div className="
          mt-4
          rounded-lg
          border
          border-slate-200
          bg-slate-50
          p-3
        ">

          <div className="flex items-center justify-between">

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-600
            ">
              ML Inference
            </p>

            <span className="
              rounded-full
              bg-slate-200
              px-2
              py-1
              text-[10px]
              font-semibold
              text-slate-600
            ">
              HISTORICAL SNAPSHOT
            </span>

          </div>


          <div className="
            mt-3
            grid
            grid-cols-2
            gap-3
            text-xs
          ">

            <div>
              <p className="text-slate-500">
                Susceptibility
              </p>

              <p className="font-semibold text-slate-800">
                {(
                  mlPrediction
                    .susceptibilityProbability *
                  100
                ).toFixed(2)}
                %
              </p>
            </div>


            <div>
              <p className="text-slate-500">
                Rainfall Trigger
              </p>

              <p className="font-semibold text-slate-800">
                {(
                  mlPrediction
                    .rainfallProbability *
                  100
                ).toFixed(2)}
                %
              </p>
            </div>

          </div>


          {mlPrediction.source && (
            <div className="
              mt-3
              border-t
              border-slate-200
              pt-3
              text-xs
            ">

              <p className="font-medium text-slate-700">
                Historical source
              </p>

              <p className="mt-1 text-slate-500">
                Event:{" "}
                {mlPrediction.source.sourceEventDate ||
                  "Unavailable"}
              </p>

              <p className="text-slate-500">
                Distance:{" "}
                {mlPrediction.source.sourceDistanceKm} km
              </p>

              <p className="text-slate-500">
                Record:{" "}
                {mlPrediction.source.sourceSlNo}
              </p>

            </div>
          )}


          <p className="
            mt-3
            text-[10px]
            leading-relaxed
            text-slate-400
          ">
            Prediction uses a historical event snapshot
            from the processed dataset. It is not a
            live rainfall or sensor reading.
          </p>

        </div>
      )}


      {/* Environment */}
      <div className="
        mt-3
        grid
        grid-cols-2
        gap-x-4
        gap-y-3
        border-t
        border-slate-200
        pt-3
        text-xs
      ">

        <div>
          <p className="text-slate-500">
            Rainfall
          </p>

          {environmentLoading ? (
            <p className="
              font-semibold
              text-slate-800
              animate-pulse
            ">
              <span className="
                inline-block
                h-4
                w-12
                rounded
                bg-slate-200
              " />
            </p>
          ) : environmentError ? (
            <p className="
              text-xs
              font-semibold
              text-red-500
            ">
              Unavailable
            </p>
          ) : (
            <p className="font-semibold text-slate-800">
              {environment?.rainfallMm ??
                location.rainfall}{" "}
              mm
            </p>
          )}
        </div>


        <div>
          <p className="text-slate-500">
            Soil Moisture
          </p>

          {environmentLoading ? (
            <p className="
              font-semibold
              text-slate-800
              animate-pulse
            ">
              <span className="
                inline-block
                h-4
                w-12
                rounded
                bg-slate-200
              " />
            </p>
          ) : environmentError ? (
            <p className="
              text-xs
              font-semibold
              text-red-500
            ">
              Unavailable
            </p>
          ) : (
            <p className="font-semibold text-slate-800">
              {environment?.soilMoisturePercent ??
                location.soilMoisture}%
            </p>
          )}
        </div>


        <div>
          <p className="text-slate-500">
            Slope
          </p>

          {environmentLoading ? (
            <p className="
              font-semibold
              text-slate-800
              animate-pulse
            ">
              <span className="
                inline-block
                h-4
                w-12
                rounded
                bg-slate-200
              " />
            </p>
          ) : environmentError ? (
            <p className="
              text-xs
              font-semibold
              text-red-500
            ">
              Unavailable
            </p>
          ) : (
            <p className="font-semibold text-slate-800">
              {environment?.slopeDegrees ??
                location.slope}°
            </p>
          )}
        </div>


        <div>
          <p className="text-slate-500">
            Temperature
          </p>

          {environmentLoading ? (
            <p className="
              font-semibold
              text-slate-800
              animate-pulse
            ">
              <span className="
                inline-block
                h-4
                w-12
                rounded
                bg-slate-200
              " />
            </p>
          ) : environmentError ? (
            <p className="
              text-xs
              font-semibold
              text-red-500
            ">
              Unavailable
            </p>
          ) : (
            <p className="font-semibold text-slate-800">
              {environment?.temperatureCelsius ??
                location.temperature}°C
            </p>
          )}
        </div>


        <div>
          <p className="text-slate-500">
            Vulnerable Roads
          </p>

          {roadsLoading ? (
            <p className="
              font-semibold
              text-slate-800
              animate-pulse
            ">
              <span className="
                inline-block
                h-4
                w-12
                rounded
                bg-slate-200
              " />
            </p>
          ) : roadsError ? (
            <p className="
              text-xs
              font-semibold
              text-red-500
            ">
              Unavailable
            </p>
          ) : (
            <p className="font-semibold text-slate-800">
              {location.vulnerableRoads}
            </p>
          )}
        </div>


        <div>
          <p className="text-slate-500">
            Vulnerable Villages
          </p>

          {villagesLoading ? (
            <p className="
              font-semibold
              text-slate-800
              animate-pulse
            ">
              <span className="
                inline-block
                h-4
                w-12
                rounded
                bg-slate-200
              " />
            </p>
          ) : villagesError ? (
            <p className="
              text-xs
              font-semibold
              text-red-500
            ">
              Unavailable
            </p>
          ) : (
            <p className="font-semibold text-slate-800">
              {location.vulnerableVillages}
            </p>
          )}
        </div>

      </div>

    </div>
  );
}


function mergeEnvironmentData(
  location,
  environment
) {
  if (!environment) {
    return location;
  }

  return {
    ...location,

    rainfall:
      environment.rainfallMm,

    soilMoisture:
      environment.soilMoisturePercent,

    slope:
      environment.slopeDegrees,

    temperature:
      environment.temperatureCelsius,
  };
}


function mergeInfrastructureData(
  location,
  roads,
  villages
) {
  /*
   * roads/villages:
   *
   * undefined = loading/not requested
   * null = error
   * array = loaded
   */

  const vulnerableRoads =
    roads === undefined
      ? undefined
      : roads === null
        ? null
        : roads.length;

  const vulnerableVillages =
    villages === undefined
      ? undefined
      : villages === null
        ? null
        : villages.length;

  return {
    ...location,

    vulnerableRoads,

    vulnerableVillages,

    vulnerableRoadDetails:
      roads === undefined ||
      roads === null
        ? undefined
        : roads,

    vulnerableVillageDetails:
      villages === undefined ||
      villages === null
        ? undefined
        : villages,
  };
}


function mergeMlPrediction(
  location,
  prediction
) {
  if (!prediction) {
    return location;
  }

  return {
    ...location,

    riskScore:
      prediction.riskScorePercent,

    riskLevel:
      prediction.riskLevel,

    mlPrediction: prediction,

    mlPredictionSource:
      prediction.source,

    mlPredictionInput:
      prediction.inputFeatures,

    mlPredictionType:
      prediction.predictionType,

    mlModelVersion:
      prediction.modelVersion,
  };
}


function RiskMap({
  onLocationSelect,
  initialLocationId,
}) {
  const [locations, setLocations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [indiaGeoJson, setIndiaGeoJson] =
    useState(null);

  const [selectedPopup, setSelectedPopup] =
    useState(null);

  const [riskFilter, setRiskFilter] =
    useState("ALL");


  const [environmentData, setEnvironmentData] =
    useState({});

  const [environmentLoading, setEnvironmentLoading] =
    useState(null);

  const [environmentError, setEnvironmentError] =
    useState(null);


  const [roadsData, setRoadsData] =
    useState({});

  const [roadsLoading, setRoadsLoading] =
    useState(null);

  const [roadsError, setRoadsError] =
    useState(null);


  const [villagesData, setVillagesData] =
    useState({});

  const [villagesLoading, setVillagesLoading] =
    useState(null);

  const [villagesError, setVillagesError] =
    useState(null);


  /*
   * ML state
   */
  const [mlData, setMlData] =
    useState({});

  const [mlLoading, setMlLoading] =
    useState(null);

  const [mlError, setMlError] =
    useState(null);


  /*
   * Load dashboard locations.
   */
  useEffect(() => {
    async function loadRiskData() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getRiskData();

        setLocations(data);
      } catch (err) {
        console.error(
          "Failed to load risk data:",
          err
        );

        setError(
          "Unable to load risk location data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRiskData();
  }, []);


  /*
   * Load India GeoJSON.
   */
  useEffect(() => {
    async function loadIndiaGeoJson() {
      try {
        const response =
          await fetch(
            "/data/india_states.geojson"
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load India GeoJSON"
          );
        }

        const data =
          await response.json();

        setIndiaGeoJson(data);
      } catch (err) {
        console.error(
          "Failed to load India GeoJSON:",
          err
        );
      }
    }

    loadIndiaGeoJson();
  }, []);


  /*
   * Select location when passed from
   * Check a Place search.
   */
  useEffect(() => {
    if (
      !initialLocationId ||
      locations.length === 0
    ) {
      return;
    }

    const location =
      locations.find(
        (item) =>
          item.id ===
          initialLocationId
      );

    if (!location) {
      return;
    }

    setSelectedPopup(location);

    fetchAllData(location.id);

    runMlPrediction(location);

  }, [
    initialLocationId,
    locations,
  ]);


  /*
   * Environment API.
   */
  const fetchEnvironmentData =
    useCallback(
      async (locationId) => {
        if (
          environmentData[locationId]
        ) {
          return;
        }

        setEnvironmentLoading(
          locationId
        );

        setEnvironmentError(null);

        try {
          const data =
            await getRiskLocationEnvironment(
              locationId
            );

          setEnvironmentData(
            (prev) => ({
              ...prev,
              [locationId]: data,
            })
          );
        } catch (err) {
          console.error(
            "Failed to load environment data:",
            err
          );

          setEnvironmentError(
            err.message
          );
        } finally {
          setEnvironmentLoading(null);
        }
      },
      [environmentData]
    );


  /*
   * Vulnerable roads API.
   */
  const fetchRoadsData =
    useCallback(
      async (locationId) => {
        if (
          roadsData[locationId] !==
          undefined
        ) {
          return;
        }

        setRoadsLoading(
          locationId
        );

        setRoadsError(null);

        try {
          const data =
            await getVulnerableRoads(
              locationId
            );

          setRoadsData(
            (prev) => ({
              ...prev,
              [locationId]: data,
            })
          );
        } catch (err) {
          console.error(
            "Failed to load vulnerable roads:",
            err
          );

          setRoadsError(
            err.message
          );

          setRoadsData(
            (prev) => ({
              ...prev,
              [locationId]: null,
            })
          );
        } finally {
          setRoadsLoading(null);
        }
      },
      [roadsData]
    );


  /*
   * Vulnerable villages API.
   */
  const fetchVillagesData =
    useCallback(
      async (locationId) => {
        if (
          villagesData[locationId] !==
          undefined
        ) {
          return;
        }

        setVillagesLoading(
          locationId
        );

        setVillagesError(null);

        try {
          const data =
            await getVulnerableVillages(
              locationId
            );

          setVillagesData(
            (prev) => ({
              ...prev,
              [locationId]: data,
            })
          );
        } catch (err) {
          console.error(
            "Failed to load vulnerable villages:",
            err
          );

          setVillagesError(
            err.message
          );

          setVillagesData(
            (prev) => ({
              ...prev,
              [locationId]: null,
            })
          );
        } finally {
          setVillagesLoading(null);
        }
      },
      [villagesData]
    );


  /*
   * Existing supporting-data requests.
   */
  const fetchAllData =
    useCallback(
      (locationId) => {
        fetchEnvironmentData(
          locationId
        );

        fetchRoadsData(
          locationId
        );

        fetchVillagesData(
          locationId
        );
      },
      [
        fetchEnvironmentData,
        fetchRoadsData,
        fetchVillagesData,
      ]
    );


  /*
   * Actual ML inference.
   */
  const runMlPrediction =
    useCallback(
      async (location) => {
        if (!location?.id) {
          return;
        }

        /*
         * Do not repeatedly run the same
         * prediction during the current page
         * session.
         */
        if (
          mlData[location.id]
        ) {
          return;
        }

        setMlLoading(
          location.id
        );

        setMlError(null);

        try {
          const result =
            await predictLocationRisk(
              location.id
            );

          const prediction =
            result.prediction;

          setMlData(
            (prev) => ({
              ...prev,
              [location.id]: {
                ...result,

                prediction,
              },
            })
          );

          /*
           * Update the risk shown by the
           * marker and popup.
           */
          setLocations(
            (prev) =>
              prev.map(
                (item) => {
                  if (
                    item.id !==
                    location.id
                  ) {
                    return item;
                  }

                  return mergeMlPrediction(
                    item,
                    prediction
                  );
                }
              )
          );

          /*
           * Update selected popup immediately
           * if this is still the selected location.
           */
          setSelectedPopup(
            (prev) => {
              if (
                !prev ||
                prev.id !==
                  location.id
              ) {
                return prev;
              }

              return mergeMlPrediction(
                prev,
                prediction
              );
            }
          );

        } catch (err) {
          console.error(
            "Failed to run ML prediction:",
            err
          );

          setMlError(
            err.message
          );
        } finally {
          setMlLoading(null);
        }
      },
      [mlData]
    );


  /*
   * Marker/location click.
   */
  function handleLocationClick(
    location
  ) {
    setSelectedPopup(
      location
    );

    fetchAllData(
      location.id
    );

    runMlPrediction(
      location
    );
  }


  /*
   * Close selected location if the
   * active risk filter excludes it.
   */
  useEffect(() => {
    if (
      selectedPopup &&
      riskFilter !== "ALL" &&
      selectedPopup.riskLevel
        ?.toUpperCase() !==
        riskFilter
    ) {
      setSelectedPopup(null);

      onLocationSelect?.(
        null
      );
    }
  }, [
    riskFilter,
    selectedPopup,
    onLocationSelect,
  ]);


  /*
   * Merge environment data into selected
   * location.
   */
  const selectedLocationWithEnvironment =
    useMemo(() => {
      if (!selectedPopup) {
        return null;
      }

      const env =
        environmentData[
          selectedPopup.id
        ];

      return mergeEnvironmentData(
        selectedPopup,
        env
      );
    }, [
      selectedPopup,
      environmentData,
    ]);


  /*
   * Merge infrastructure data.
   */
  const selectedLocationWithInfrastructure =
    useMemo(() => {
      if (!selectedPopup) {
        return null;
      }

      const env =
        environmentData[
          selectedPopup.id
        ];

      const roads =
        roadsData[
          selectedPopup.id
        ];

      const villages =
        villagesData[
          selectedPopup.id
        ];

      const withEnv =
        mergeEnvironmentData(
          selectedPopup,
          env
        );

      return mergeInfrastructureData(
        withEnv,
        roads,
        villages
      );
    }, [
      selectedPopup,
      environmentData,
      roadsData,
      villagesData,
    ]);


  /*
   * Add ML data to selected location
   * before sending it to the district panel.
   */
  const selectedLocationComplete =
    useMemo(() => {
      if (
        !selectedLocationWithInfrastructure
      ) {
        return null;
      }

      const predictionData =
        mlData[
          selectedLocationWithInfrastructure
            .id
        ];

      if (!predictionData) {
        return selectedLocationWithInfrastructure;
      }

      return {
        ...selectedLocationWithInfrastructure,

        ...mergeMlPrediction(
          selectedLocationWithInfrastructure,
          predictionData.prediction
        ),
      };
    }, [
      selectedLocationWithInfrastructure,
      mlData,
    ]);


  const currentEnvironment =
    selectedPopup
      ? environmentData[
          selectedPopup.id
        ]
      : null;

  const isEnvironmentLoading =
    environmentLoading ===
    selectedPopup?.id;

  const currentEnvironmentError =
    isEnvironmentLoading
      ? environmentError
      : null;


  const currentRoads =
    selectedPopup
      ? roadsData[
          selectedPopup.id
        ]
      : null;

  const isRoadsLoading =
    roadsLoading ===
    selectedPopup?.id;

  const currentRoadsError =
    isRoadsLoading
      ? roadsError
      : null;


  const currentVillages =
    selectedPopup
      ? villagesData[
          selectedPopup.id
        ]
      : null;

  const isVillagesLoading =
    villagesLoading ===
    selectedPopup?.id;

  const currentVillagesError =
    isVillagesLoading
      ? villagesError
      : null;


  const currentMl =
    selectedPopup
      ? mlData[
          selectedPopup.id
        ]
      : null;

  const isMlLoading =
    mlLoading ===
    selectedPopup?.id;

  const currentMlError =
    isMlLoading
      ? mlError
      : null;


  /*
   * Notify parent with the complete
   * selected location.
   */
  useEffect(() => {
    onLocationSelect?.(
      selectedLocationComplete
    );
  }, [
    selectedLocationComplete,
    onLocationSelect,
  ]);


  return (
    <div className="
      relative
      h-[650px]
      w-full
      overflow-hidden
      rounded-xl
      border
      border-slate-700
    ">

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

        <MapLocationController
          location={selectedPopup}
        />


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
            if (
              riskFilter ===
              "ALL"
            ) {
              return true;
            }

            return (
              location.riskLevel
                ?.toUpperCase() ===
              riskFilter
            );
          })
          .map((location) => (
            <Marker
              key={location.id}
              position={[
                location.lat,
                location.lon,
              ]}
              icon={createRiskIcon(
                location.riskLevel
              )}
              eventHandlers={{
                click: () =>
                  handleLocationClick(
                    location
                  ),
              }}
            />
          ))}


        {selectedPopup && (
          <RiskPopup
            location={selectedPopup}
            environment={
              currentEnvironment
            }
            environmentLoading={
              isEnvironmentLoading
            }
            environmentError={
              currentEnvironmentError
            }
            roadsLoading={
              isRoadsLoading
            }
            roadsError={
              currentRoadsError
            }
            villagesLoading={
              isVillagesLoading
            }
            villagesError={
              currentVillagesError
            }
            mlPrediction={
              currentMl?.prediction ??
              null
            }
            mlLoading={
              isMlLoading
            }
            mlError={
              currentMlError
            }
            onClose={() => {
              setSelectedPopup(
                null
              );

              onLocationSelect?.(
                null
              );
            }}
          />
        )}

      </MapContainer>


      {loading && (
        <div className="
          absolute
          left-4
          top-4
          z-[1000]
          rounded-lg
          border
          border-slate-200
          bg-white
          px-4
          py-2
          text-sm
          text-slate-700
          shadow
        ">
          Loading risk locations...
        </div>
      )}


      {error && (
        <div className="
          absolute
          left-4
          top-4
          z-[1000]
          rounded-lg
          border
          border-red-200
          bg-white
          px-4
          py-2
          text-sm
          text-red-600
          shadow
        ">
          {error}
        </div>
      )}


      <div className="
        absolute
        right-4
        top-4
        z-[1000]
        flex
        flex-wrap
        gap-2
      ">

        {[
          "ALL",
          "HIGH",
          "MEDIUM",
          "LOW",
        ].map((level) => {

          const count =
            level === "ALL"
              ? locations.length
              : locations.filter(
                  (location) =>
                    location.riskLevel
                      ?.toUpperCase() ===
                    level
                ).length;

          return (
            <button
              key={level}
              type="button"
              onClick={() =>
                setRiskFilter(
                  level
                )
              }
              className={`
                rounded-lg
                border
                px-3
                py-2
                text-xs
                font-semibold
                shadow
                transition
                ${
                  riskFilter ===
                  level
                    ? "border-sky-400 bg-sky-500 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              {level ===
              "ALL"
                ? "ALL"
                : `${level} RISK`}{" "}
              {count}
            </button>
          );
        })}

      </div>


      <div className="
        absolute
        bottom-4
        right-4
        z-[1000]
        rounded-lg
        border
        border-slate-200
        bg-white
        p-3
        shadow
      ">

        <p className="
          mb-2
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-600
        ">
          Risk Level
        </p>


        <div className="
          space-y-2
          text-xs
          text-slate-700
        ">

          <div className="flex items-center gap-2">
            <span className="
              h-3
              w-3
              rounded-full
              bg-red-500
            " />

            HIGH
          </div>


          <div className="flex items-center gap-2">
            <span className="
              h-3
              w-3
              rounded-full
              bg-amber-500
            " />

            MEDIUM
          </div>


          <div className="flex items-center gap-2">
            <span className="
              h-3
              w-3
              rounded-full
              bg-green-500
            " />

            LOW
          </div>

        </div>

      </div>

    </div>
  );
}


export default RiskMap;