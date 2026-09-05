import { quickSummary } from '../../data/dashboardData'

const ROWS = [
  { key: 'region', label: 'Region' },
  { key: 'monitoring', label: 'Monitoring' },
  { key: 'dataMode', label: 'Data Mode' },
  { key: 'lastUpdated', label: 'Last Updated' },
]

/**
 * Compact strip of session-level facts shown at the bottom of the dashboard.
 * "Last Updated" intentionally reads "Prototype session" rather than a
 * timestamp, since no real update cycle exists yet.
 */
export default function QuickSummary() {
  return (
    <section
      className="panel px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 items-center"
      aria-label="Quick system summary"
    >
      {ROWS.map(({ key, label }) => (
        <div key={key} className="flex items-baseline gap-1.5">
          <span className="text-[11px] text-slate-500">{label}:</span>
          <span className="text-xs font-medium text-slate-300">{quickSummary[key]}</span>
        </div>
      ))}
    </section>
  )
}
