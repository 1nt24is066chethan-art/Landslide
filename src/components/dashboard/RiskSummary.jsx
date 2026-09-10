import { useEffect, useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Bell,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import RiskCard from "./RiskCard";
import { getDashboardSummary } from "../../services/dashboardApi";

export default function RiskSummary() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardSummary();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <section aria-label="Risk summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 md:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <RiskCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section aria-label="Risk summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 md:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <RiskCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-4 text-center text-sm text-red-400">
          Failed to load dashboard summary: {error}
        </div>
      </section>
    );
  }

  const cards = [
    {
      icon: AlertTriangle,
      title: "High Risk Locations",
      value: stats.highRisk,
      label: "Require close monitoring",
      tone: "high",
    },
    {
      icon: AlertCircle,
      title: "Medium Risk Locations",
      value: stats.mediumRisk,
      label: "Elevated conditions",
      tone: "medium",
    },
    {
      icon: ShieldCheck,
      title: "Low Risk Locations",
      value: stats.lowRisk,
      label: "Stable conditions",
      tone: "low",
    },
    {
      icon: Bell,
      title: "Active Warnings",
      value: stats.activeWarnings,
      label: "Currently in effect",
      tone: "medium",
    },
    {
      icon: ClipboardList,
      title: "Citizen Reports",
      value: stats.citizenReports,
      label: "Total submitted",
      tone: "info",
      link: "/citizen-reports",
    },
  ];

  return (
    <section aria-label="Risk summary">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 md:gap-4">
        {cards.map((card) => {
          const cardContent = <RiskCard key={card.title} {...card} />;

          if (card.link) {
            return (
              <Link
                key={card.title}
                to={card.link}
                className="block rounded-xl transition hover:ring-2 hover:ring-sky-400/40"
              >
                {cardContent}
              </Link>
            );
          }

          return cardContent;
        })}
      </div>
    </section>
  );
}

function RiskCardSkeleton() {
  return (
    <div className="panel overflow-hidden animate-pulse">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-700/50" />
          <div className="h-4 w-24 bg-slate-700 rounded" />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Simulated</span>
      </div>
      <div className="h-48 px-2 pb-2 flex items-center justify-center">
        <div className="h-10 w-20 bg-slate-700 rounded" />
      </div>
    </div>
  );
}