import { AlertTriangle, MapPin, Clock } from 'lucide-react'
import { getToneClasses, getRiskLabel } from '../../utils/riskUtils'
import { dashboardAlerts } from '../../data/dashboardData'

function AlertItem({ alert }) {
  const classes = getToneClasses(alert.severity)

  return (
    <li className={`rounded-lg border ${classes.border} ${classes.bg} p-3 md:p-4`}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${classes.iconBg} ${classes.iconText}`}>
          <AlertTriangle size={16} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded ${classes.badge}`}>
              {getRiskLabel(alert.severity)}
            </span>
            <h3 className="text-sm font-medium text-slate-100">{alert.title}</h3>
          </div>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin size={12} aria-hidden="true" />
            <span>{alert.location}</span>
          </p>

          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{alert.description}</p>

          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <Clock size={11} aria-hidden="true" />
            <span>{alert.relativeTime}</span>
          </p>
        </div>
      </div>
    </li>
  )
}

/**
 * Preview of active alerts on the dashboard. The full alerts experience
 * (filtering, status changes, "view location" wiring) arrives in Phase 8 —
 * this is a read-only preview of simulated alert data.
 */
export default function AlertPanel() {
  return (
    <section className="panel" aria-labelledby="active-alerts-heading">
      <div className="panel-header">
        <h2 id="active-alerts-heading" className="text-sm font-semibold text-slate-100">
          Active Alerts
        </h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-700/60 text-slate-400 border border-surface-border">
          Prototype · Simulated
        </span>
      </div>

      {dashboardAlerts.length === 0 ? (
        <p className="px-4 py-8 text-sm text-slate-500 text-center">No active high-risk warnings.</p>
      ) : (
        <ul className="p-3 md:p-4 space-y-2.5">
          {dashboardAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </ul>
      )}
    </section>
  )
}
