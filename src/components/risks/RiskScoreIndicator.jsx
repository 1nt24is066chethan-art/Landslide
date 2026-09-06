import { getRiskLabel, getToneClasses } from "../../utils/riskUtils";

function RiskScoreIndicator({ score, riskLevel }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const tone = riskLevel?.toLowerCase();
  const toneClasses = getToneClasses(tone);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (safeScore / 100) * circumference;

  const strokeColors = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#ef4444",
  };

  const strokeColor = strokeColors[tone] ?? "#38bdf8";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-36 w-36">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 128 128"
          aria-label={`Risk score ${safeScore} out of 100`}
        >
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-700"
          />

          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${toneClasses.text}`}>
            {safeScore}
          </span>

          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            / 100
          </span>
        </div>
      </div>

      <span
        className={`mt-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses.badge}`}
      >
        {getRiskLabel(tone)}
      </span>

      <p className="mt-2 text-center text-[11px] text-slate-500">
        Simulated prototype score
      </p>
    </div>
  );
}

export default RiskScoreIndicator;