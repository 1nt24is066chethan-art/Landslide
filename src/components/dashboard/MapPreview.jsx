import { Map } from 'lucide-react'

/**
 * Placeholder for the future GIS Risk Map (Phase 3).
 * Deliberately abstract — a dotted grid suggests "map" without drawing any
 * real or invented geographic boundaries, roads, or district shapes.
 * No Leaflet/GeoJSON dependency is introduced here.
 */
export default function MapPreview() {
  return (
    <section className="panel overflow-hidden" aria-labelledby="gis-preview-heading">
      <div className="panel-header">
        <h2 id="gis-preview-heading" className="text-sm font-semibold text-slate-100">
          GIS Risk Map
        </h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-700/60 text-slate-400 border border-surface-border">
          Coming in Phase 3
        </span>
      </div>

      <div
        className="relative h-56 md:h-64 flex flex-col items-center justify-center gap-2 text-center"
        style={{
          backgroundImage: 'radial-gradient(circle, #26304a 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          backgroundColor: '#0f1420',
        }}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center bg-surface-800 border border-surface-border text-accent-soft">
          <Map size={20} aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-slate-300">Interactive regional risk map</p>
        <p className="text-xs text-slate-500 max-w-xs px-4">
          will appear here in Phase 3, showing risk markers across the North Eastern Region.
        </p>
      </div>
    </section>
  )
}
