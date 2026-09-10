import { AlertTriangle, MapPin, BadgeCheck } from "lucide-react";
import { getRiskLabel, getToneClasses } from "../../utils/riskUtils";

function WarningCard({ warning }) {
  const tone = warning.riskLevel?.toLowerCase();
  const toneClasses = getToneClasses(tone);
  const isAcknowledged = warning.status?.toUpperCase() === "ACKNOWLEDGED";

  return (
    <div
      className={`rounded-xl border ${toneClasses.border} bg-slate-900 p-5`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses.iconBg}`}
        >
          <AlertTriangle
            className={`h-5 w-5 ${toneClasses.iconText}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {warning.location}
              </h3>

              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {warning.district}, {warning.state}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses.badge}`}
              >
                {getRiskLabel(tone)}
              </span>

              {isAcknowledged && (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-300"
                >
                  <BadgeCheck className="h-3 w-3" />
                  ACKNOWLEDGED
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            {warning.message}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
            <span className="text-xs text-slate-500">
              Risk Score
            </span>

            <span className={`text-lg font-bold ${toneClasses.text}`}>
              {warning.riskScore}
              <span className="ml-1 text-xs font-normal text-slate-500">
                / 100
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WarningCard;