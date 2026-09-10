import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  FileText,
  Plus,
} from "lucide-react";

import CitizenReportCard from "../components/citizen/CitizenReportCard";
import CitizenReportForm from "../components/citizen/CitizenReportForm";
import { getCitizenReports, createCitizenReport } from "../services/citizenReportApi";

function CitizenReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCitizenReports();
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

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

  async function handleSubmit(newReport) {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const createdReport = await createCitizenReport(newReport);
      setReports((current) => [createdReport, ...current]);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
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
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>

        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <CitizenReportCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
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
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 shrink-0 text-red-400">!</div>
            <div>
              <p className="font-semibold text-red-300">Failed to load reports</p>
              <p className="mt-1 text-sm text-slate-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
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
          onCancel={() => {
            setShowForm(false);
            setSubmitError(null);
          }}
          submitting={submitting}
          submitError={submitError}
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
          {reports.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-600" />

              <p className="mt-3 text-sm text-slate-400">
                No citizen reports have been submitted yet.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <CitizenReportCard
                key={report.id}
                report={report}
              />
            ))
          )}
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

function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-24 bg-slate-800 rounded" />
          <div className="mt-4 h-8 w-16 bg-slate-800 rounded" />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800" />
      </div>
    </div>
  );
}

function CitizenReportCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="h-5 w-32 bg-slate-800 rounded" />
              <div className="mt-2 h-3 w-48 bg-slate-800 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
          </div>
          <div className="mt-4 h-4 w-3/4 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export default CitizenReportsPage;