import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { getToneClasses, getRiskLabel } from "../../utils/riskUtils";
import { dashboardAlerts } from "../../data/dashboardData";

function AlertItem({ alert }) {
  const classes = getToneClasses(alert.severity);

  return (
    <li
      className={`rounded-lg border ${classes.border} ${classes.bg} p-3 md:p-4`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${classes.iconBg} ${classes.iconText}`}
        >
          <AlertTriangle size={16} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${classes.badge}`}
            >
              {getRiskLabel(alert.severity)}
            </span>

            <h3 className="text-sm font-medium text-slate-100">
              {alert.title}
            </h3>
          </div>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={12} aria-hidden="true" />
            <span>{alert.location}</span>
          </p>

          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            {alert.description}
          </p>

          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
            <Clock size={11} aria-hidden="true" />
            <span>{alert.relativeTime}</span>
          </p>
        </div>
      </div>
    </li>
  );
}

export default function AlertPanel() {
  return (
    <section
      className="panel"
      aria-labelledby="active-alerts-heading"
    >
      <div className="panel-header">
        <h2
          id="active-alerts-heading"
          className="text-sm font-semibold text-slate-100"
        >
          Active Alerts
        </h2>

        <span className="rounded-full border border-surface-border bg-surface-700/60 px-2 py-0.5 text-[11px] text-slate-400">
          Prototype · Simulated
        </span>
      </div>

      {dashboardAlerts.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          No active warnings.
        </p>
      ) : (
        <ul className="space-y-2.5 p-3 md:p-4">
          {dashboardAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </ul>
      )}
    </section>
  );
}