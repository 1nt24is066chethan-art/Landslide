import { useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  FileText,
  Plus,
} from "lucide-react";

import CitizenReportCard from "../components/citizen/CitizenReportCard";
import CitizenReportForm from "../components/citizen/CitizenReportForm";
import citizenReportsData from "../data/citizenReports.json";

function CitizenReportsPage() {
  const [reports, setReports] = useState(citizenReportsData);
  const [showForm, setShowForm] = useState(false);

  const pending = useMemo(
    () =>
      reports.filter(
        (report) => report.status === "PENDING"
      ).length,
    [reports]
  );

  const reviewed = useMemo(
    () =>
      reports.filter(
        (report) => report.status === "REVIEWED"
      ).length,
    [reports]
  );

  function handleSubmit(newReport) {
    setReports((current) => [newReport, ...current]);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Citizen Reports
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Community-reported observations from monitored areas.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            <Plus className="h-4 w-4" />
            Submit Report
          </button>
        )}
      </div>

      {showForm && (
        <CitizenReportForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

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