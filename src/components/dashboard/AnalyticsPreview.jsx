import { CloudRain, Activity } from 'lucide-react'

function PlaceholderChartPanel({ icon: Icon, title }) {
  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="h-40 flex flex-col items-center justify-center gap-2 text-center px-4">
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-700/50 text-slate-500">
          <Icon size={18} aria-hidden="true" />
        </div>
        <p className="text-xs text-slate-500 max-w-[220px]">
          Analytics visualization will be connected in a later phase.
        </p>
      </div>
    </div>
  )
}

/**
 * Placeholders for the future Rainfall Trend and Environmental Conditions
 * charts (Phase 7). No Recharts dependency and no chart data yet — these
 * are intentionally non-committal so they can't be mistaken for real values.
 */
export default function AnalyticsPreview() {
  return (
    <section aria-label="Analytics previews" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PlaceholderChartPanel icon={CloudRain} title="Rainfall Trend" />
      <PlaceholderChartPanel icon={Activity} title="Environmental Conditions" />
    </section>
  )
}
