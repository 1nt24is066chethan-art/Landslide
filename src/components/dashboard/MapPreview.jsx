import { Map, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { riskSummaryStats } from '../../data/dashboardData'

/**
 * Dashboard GIS summary.
 * Provides a quick overview of monitored risk locations.
 * Clicking the card opens the full GIS Risk Map.
 */
export default function MapPreview() {
  return (
    <section
      className="panel overflow-hidden"
      aria-labelledby="gis-preview-heading"
    >
      <div className="panel-header">
        <h2
          id="gis-preview-heading"
          className="text-sm font-semibold text-slate-100"
        >
          GIS Risk Map
        </h2>

        <Link
          to="/gis-map"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 transition hover:text-sky-300"
        >
          Open full map
          <ArrowRight size={13} />
        </Link>
      </div>

      <Link
        to="/gis-map"
        className="block"
        aria-label="Open full GIS Risk Map"
      >
        <div className="relative p-4 md:p-5 transition hover:bg-slate-800/20">
          {/* Map-style visual area */}
          <div
            className="relative h-36 overflow-hidden rounded-lg border border-slate-700"
            style={{
              backgroundImage:
                'radial-gradient(circle, #26304a 1px, transparent 1px)',
              backgroundSize: '18px 18px',
              backgroundColor: '#0f1420',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-400">
                <Map size={22} aria-hidden="true" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 rounded-md border border-slate-700 bg-slate-900/90 px-3 py-1.5">
              <p className="text-[11px] font-medium text-slate-300">
                North Eastern Region
              </p>
            </div>

            <div className="absolute right-3 top-3 rounded-md border border-slate-700 bg-slate-900/90 px-3 py-1.5">
              <p className="text-[11px] text-slate-400">
                {riskSummaryStats.highRisk +
                  riskSummaryStats.mediumRisk +
                  riskSummaryStats.lowRisk}{' '}
                monitored locations
              </p>
            </div>
          </div>

          {/* Risk summary */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <RiskStat
              icon={AlertTriangle}
              label="High"
              value={riskSummaryStats.highRisk}
              tone="text-risk-high"
            />

            <RiskStat
              icon={AlertTriangle}
              label="Medium"
              value={riskSummaryStats.mediumRisk}
              tone="text-risk-medium"
            />

            <RiskStat
              icon={ShieldCheck}
              label="Low"
              value={riskSummaryStats.lowRisk}
              tone="text-risk-low"
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
            <div>
              <p className="text-xs font-medium text-slate-300">
                Landslide Risk Monitoring
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Simulated prototype data
              </p>
            </div>

            <span className="text-[11px] font-medium text-sky-400">
              View map →
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}

function RiskStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className={tone}
          aria-hidden="true"
        />

        <span className="text-[11px] text-slate-500">
          {label}
        </span>
      </div>

      <p className={`mt-1 text-xl font-bold ${tone}`}>
        {value}
      </p>
    </div>
  )
}