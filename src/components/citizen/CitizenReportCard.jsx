import { MapPin, MessageSquare } from "lucide-react";

function CitizenReportCard({ report }) {
  const isPending = report.status === "PENDING";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800">
          <MessageSquare className="h-5 w-5 text-slate-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-100">
                {report.category}
              </h3>

              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {report.location}, {report.district}, {report.state}
              </div>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                isPending
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                  : "border-green-400/30 bg-green-400/10 text-green-300"
              }`}
            >
              {report.status}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            {report.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CitizenReportCard;