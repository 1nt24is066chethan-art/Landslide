import { useEffect, useState } from "react";

import {
  CircleMarker,
  Popup,
} from "react-leaflet";

import {
  getHistoricalLandslides,
} from "../../services/riskApi";


const PAGE_LIMIT = 1000;


function HistoricalLandslidePopup({
  record,
}) {
  return (
    <div className="min-w-[230px] max-w-[280px]">

      <p className="
        text-[10px]
        font-semibold
        uppercase
        tracking-wide
        text-slate-500
      ">
        Historical GSI Landslide
      </p>

      <h3 className="
        mt-1
        text-sm
        font-semibold
        text-slate-900
      ">
        {record.slide_name ||
          "Unnamed landslide"}
      </h3>

      <p className="text-xs text-slate-500">
        {record.district
          ? `${record.district}, `
          : ""}
        {record.state}
      </p>

      <div className="
        mt-3
        grid
        grid-cols-2
        gap-x-4
        gap-y-2
        border-t
        border-slate-200
        pt-3
        text-xs
      ">

        <div>
          <p className="text-slate-400">
            Slide No.
          </p>

          <p className="font-medium text-slate-700">
            {record.slide_no ||
              "Unavailable"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">
            History
          </p>

          <p className="font-medium text-slate-700">
            {record.history ||
              "Unavailable"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">
            Elevation
          </p>

          <p className="font-medium text-slate-700">
            {record.elevation_m != null
              ? `${record.elevation_m} m`
              : "Unavailable"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">
            Slope
          </p>

          <p className="font-medium text-slate-700">
            {record.slope_deg != null
              ? `${record.slope_deg}°`
              : "Unavailable"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">
            Land Cover
          </p>

          <p className="font-medium text-slate-700">
            {record.lulc_class != null
              ? record.lulc_class
              : "Unavailable"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">
            Road Distance
          </p>

          <p className="font-medium text-slate-700">
            {record.road_distance_m != null
              ? `${Number(
                  record.road_distance_m
                ).toFixed(1)} m`
              : "Unavailable"}
          </p>
        </div>

      </div>

      <p className="
        mt-3
        border-t
        border-slate-200
        pt-2
        text-[10px]
        leading-relaxed
        text-slate-400
      ">
        Source: GSI historical landslide
        inventory. This point represents a
        historical recorded landslide and is
        not a live prediction.
      </p>

    </div>
  );
}


export default function HistoricalLandslideLayer({
  visible = true,
  onLoadingChange,
  onErrorChange,
  onCountChange,
}) {
  const [
    historicalLandslides,
    setHistoricalLandslides,
  ] = useState([]);


  useEffect(() => {
    let cancelled = false;


    async function loadHistoricalLandslides() {
      try {
        onLoadingChange?.(true);
        onErrorChange?.("");


        const firstPage =
          await getHistoricalLandslides({
            page: 1,
            limit: PAGE_LIMIT,
          });


        if (cancelled) {
          return;
        }


        const totalPages =
          firstPage.pagination.totalPages;


        const allRecords = [
          ...firstPage.data,
        ];


        if (totalPages > 1) {
          const remainingPages =
            await Promise.all(
              Array.from(
                {
                  length:
                    totalPages - 1,
                },
                (_, index) =>
                  getHistoricalLandslides({
                    page: index + 2,
                    limit: PAGE_LIMIT,
                  })
              )
            );


          if (cancelled) {
            return;
          }


          remainingPages.forEach(
            (page) => {
              allRecords.push(
                ...page.data
              );
            }
          );
        }


        setHistoricalLandslides(
          allRecords
        );

        onCountChange?.(
          allRecords.length
        );

        console.log(
          `Loaded ${allRecords.length} historical GSI landslide records.`
        );

      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load historical landslides:",
          error
        );

        onErrorChange?.(
          "Unable to load historical landslide inventory."
        );

      } finally {
        if (!cancelled) {
          onLoadingChange?.(false);
        }
      }
    }


    loadHistoricalLandslides();


    return () => {
      cancelled = true;
    };
  }, [
    onLoadingChange,
    onErrorChange,
    onCountChange,
  ]);


  if (!visible) {
    return null;
  }


  return (
    <>
      {historicalLandslides.map(
        (record) => {

          const latitude =
            Number(record.latitude);

          const longitude =
            Number(record.longitude);


          if (
            !Number.isFinite(
              latitude
            ) ||
            !Number.isFinite(
              longitude
            )
          ) {
            return null;
          }


          return (
            <CircleMarker
              key={`historical-${record.id}`}
              center={[
                latitude,
                longitude,
              ]}
              radius={4}
              pathOptions={{
                color: "#7c3aed",
                fillColor: "#8b5cf6",
                fillOpacity: 0.65,
                weight: 1,
              }}
            >
              <Popup>
                <HistoricalLandslidePopup
                  record={record}
                />
              </Popup>
            </CircleMarker>
          );
        }
      )}
    </>
  );
}