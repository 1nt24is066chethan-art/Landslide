import RiskSummary from '../components/dashboard/RiskSummary'
import SystemStatus from '../components/dashboard/SystemStatus'
import AlertPanel from '../components/dashboard/AlertPanel'
import MapPreview from '../components/dashboard/MapPreview'
import AnalyticsPreview from '../components/dashboard/AnalyticsPreview'
import QuickSummary from '../components/dashboard/QuickSummary'

/**
 * Dashboard Overview (Phase 2).
 * Purely a composition of dashboard/* components — no data fetching or
 * business logic lives here. All numbers/text come from
 * src/data/dashboardData.js until the real API arrives in Phase 4.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-100">Dashboard Overview</h1>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-700/60 text-slate-400 border border-surface-border">
            Prototype • Simulated Data
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Regional landslide risk monitoring and early warning summary
        </p>
      </div>

      <RiskSummary />

      <SystemStatus />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
        <MapPreview />
        <AlertPanel />
      </div>

      <AnalyticsPreview />

      <QuickSummary />
    </div>
  )
}
