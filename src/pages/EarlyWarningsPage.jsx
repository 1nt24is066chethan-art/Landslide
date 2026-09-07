import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  Filter,
} from "lucide-react";

import WarningCard from "../components/warning/WarningCard";
import warningData from "../data/warningData.json";

function EarlyWarningsPage() {
  const [warnings] = useState(warningData);
  const [filter, setFilter] = useState("ALL");

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
    if (filter === "ALL") {
      return warnings;
    }

    return warnings.filter(
      (warning) =>
        warning.riskLevel?.toUpperCase() === filter
    );
  }, [warnings, filter]);

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

            {["ALL", "HIGH", "MEDIUM"].map((level) => {
              const count =
                level === "ALL"
                  ? warnings.length
                  : warnings.filter(
                      (warning) =>
                        warning.riskLevel?.toUpperCase() === level
                    ).length;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFilter(level)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    filter === level
                      ? "border-sky-400 bg-sky-500 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {level === "ALL"
                    ? "ALL"
                    : `${level} RISK`}{" "}
                  {count}
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

export default EarlyWarningsPage;