import { getToneClasses } from '../../utils/riskUtils'

/**
 * A single summary stat card (e.g. "High Risk Locations: 8").
 * Purely presentational — icon, tone, title, value, and label are all
 * passed in by RiskSummary so this stays reusable for any future metric.
 */
export default function RiskCard({ icon: Icon, title, value, label, tone = 'info' }) {
  const classes = getToneClasses(tone)

  return (
    <div className="panel p-4 flex items-start gap-3">
      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${classes.iconBg} ${classes.iconText}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 truncate">{title}</p>
        <p className="text-2xl font-semibold text-slate-100 leading-tight mt-0.5">{value}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  )
}
