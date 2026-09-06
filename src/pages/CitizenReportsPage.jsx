import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, FileText } from "lucide-react";

import CitizenReportCard from "../components/citizen/CitizenReportCard";
import citizenReports from "../data/citizenReports.json";

function CitizenReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports(citizenReports);
  }, []);

  const pending = useMemo(
    () => reports.filter((report) => report.status === "PENDING").length,
    [reports]
  );

  const reviewed = useMemo(
    () => reports.filter((report) => report.status === "REVIEWED").length,
    [reports]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Citizen Reports
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Community-reported observations from monitored areas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={FileText}
          label="Total Reports"
          value={reports.length}
        />

        <SummaryCard
          icon={Clock}
          label="Pending"
          value={pending}
        />

        <SummaryCard
          icon={CheckCircle}
          label="Reviewed"
          value={reviewed}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          Submitted Reports
        </h2>

        <div className="grid gap-4">
          {reports.map((report) => (
            <CitizenReportCard
              key={report.id}
              report={report}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-100">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
          <Icon className="h-5 w-5 text-slate-300" />
        </div>
      </div>
    </div>
  );
}

export default CitizenReportsPage;