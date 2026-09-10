import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  Filter,
} from "lucide-react";

import WarningCard from "../components/warning/WarningCard";
import { getWarningData } from "../services/warningApi";

function EarlyWarningsPage() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [riskFilter, setRiskFilter] = useState("ALL");

  useEffect(() => {
    async function loadWarnings() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWarningData({ status: statusFilter === "ALL" ? undefined : statusFilter });
        setWarnings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadWarnings();
  }, [statusFilter]);

  const summary = useMemo(() => {
    return {
      active: warnings.filter(
        (item) => item.status?.toUpperCase() === "ACTIVE"
      ).length,

      high: warnings.filter(
        (item) => item.riskLevel?.toUpperCase() === "HIGH"
      ).length,

      medium: warnings.filter(
        (item) => item.riskLevel?.toUpperCase() === "MEDIUM"
      ).length,
    };
  }, [warnings]);

  const filteredWarnings = useMemo(() => {
    let result = warnings;

    if (riskFilter !== "ALL") {
      result = result.filter(
        (warning) => warning.riskLevel?.toUpperCase() === riskFilter
      );
    }

    return result;
  }, [warnings, riskFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Early Warnings
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Monitor locations with elevated landslide risk conditions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>

        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <WarningCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Early Warnings
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Monitor locations with elevated landslide risk conditions.
          </p>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">Failed to load warnings</p>
              <p className="mt-1 text-sm text-slate-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Early Warnings
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Monitor locations with elevated landslide risk conditions.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Bell}
          label="Active Warnings"
          value={summary.active}
          description="Currently active"
        />

        <SummaryCard
          icon={ShieldAlert}
          label="High Risk"
          value={summary.high}
          description="Require attention"
        />

        <SummaryCard
          icon={AlertTriangle}
          label="Medium Risk"
          value={summary.medium}
          description="Under monitoring"
        />
      </div>

      {/* Warning list */}
      <div>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Warning Alerts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Simulated warning notifications for the prototype.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="mr-1 h-4 w-4 text-slate-500" />

            {/* Status filter */}
            {["ACTIVE", "ALL"].map((status) => {
              const count =
                status === "ALL"
                  ? warnings.length
                  : warnings.filter(
                      (warning) => warning.status?.toUpperCase() === "ACTIVE"
                    ).length;

              return (
                <button
                  key={`status-${status}`}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    statusFilter === status
                      ? "border-sky-400 bg-sky-500 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {status === "ALL" ? "ALL" : "ACTIVE"}{" "}
                  {count}
                </button>
              );
            })}

            {/* Risk level filter */}
            {["HIGH", "MEDIUM"].map((level) => {
              const count = warnings.filter(
                (warning) => warning.riskLevel?.toUpperCase() === level
              ).length;

              return (
                <button
                  key={`risk-${level}`}
                  type="button"
                  onClick={() => setRiskFilter(riskFilter === level ? "ALL" : level)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    riskFilter === level
                      ? "border-sky-400 bg-sky-500 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {level} RISK {count}
                </button>
              );
            })}
          </div>
        </div>

        {filteredWarnings.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-slate-600" />

            <p className="mt-3 text-sm text-slate-400">
              No warnings match the selected filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWarnings.map((warning) => (
              <WarningCard
                key={warning.id}
                warning={warning}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}) {
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

          <p className="mt-1 text-xs text-slate-500">
            {description}
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
          <div className="mt-2 h-3 w-20 bg-slate-800 rounded" />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800" />
      </div>
    </div>
  );
}

function WarningCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="h-5 w-32 bg-slate-800 rounded" />
              <div className="mt-2 h-3 w-40 bg-slate-800 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
          </div>
          <div className="mt-4 h-4 w-3/4 bg-slate-800 rounded" />
          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
            <div className="h-3 w-20 bg-slate-800 rounded" />
            <div className="h-6 w-16 bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EarlyWarningsPage;