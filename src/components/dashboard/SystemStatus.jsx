import { MapPinned, Database, Activity, Radio } from 'lucide-react'
import { systemOverview } from '../../data/dashboardData'

const ITEMS = [
  {
    key: 'monitoringCoverage',
    icon: MapPinned,
    label: 'Monitoring Coverage',
  },
  {
    key: 'dataStatus',
    icon: Database,
    label: 'Data Status',
  },
  {
    key: 'predictionStatus',
    icon: Activity,
    label: 'Prediction Status',
  },
  {
    key: 'systemStatus',
    icon: Radio,
    label: 'System Status',
  },
]

/**
 * Compact system-overview strip: coverage area, data source status,
 * prediction mode, and overall system status. All values are static
 * prototype labels — no live system is actually being polled.
 */
export default function SystemStatus() {
  return (
    <section className="panel" aria-labelledby="system-overview-heading">
      <div className="panel-header">
        <h2 id="system-overview-heading" className="text-sm font-semibold text-slate-100">
          System Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
        {ITEMS.map(({ key, icon: Icon, label }) => (
          <div key={key} className="flex items-center gap-2.5 rounded-lg border border-surface-border bg-surface-700/30 px-3 py-2.5">
            <div className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center bg-accent/10 text-accent-soft">
              <Icon size={16} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 truncate">{label}</p>
              <p className="text-xs font-medium text-slate-200 truncate">{systemOverview[key]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
