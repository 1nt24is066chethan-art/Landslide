import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, ShieldAlert } from "lucide-react";

import WarningCard from "../components/warning/WarningCard";
import warningData from "../data/warningData.json";

function EarlyWarningsPage() {
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    setWarnings(warningData);
  }, []);

  const summary = useMemo(() => {
    return {
      active: warnings.filter((item) => item.status === "ACTIVE").length,
      high: warnings.filter((item) => item.riskLevel === "HIGH").length,
      medium: warnings.filter((item) => item.riskLevel === "MEDIUM").length,
    };
  }, [warnings]);

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

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Active Warning Alerts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Simulated warning notifications for the prototype.
          </p>
        </div>

        <div className="grid gap-4">
          {warnings.map((warning) => (
            <WarningCard
              key={warning.id}
              warning={warning}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, description }) {
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