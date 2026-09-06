import {
  CloudRain,
  Droplets,
  Mountain,
  Thermometer,
} from "lucide-react";

function EnvironmentalChart({ location }) {
  if (!location) {
    return null;
  }

  const metrics = [
    {
      label: "Rainfall",
      value: location.rainfall,
      unit: "mm",
      icon: CloudRain,
      max: 300,
    },
    {
      label: "Soil Moisture",
      value: location.soilMoisture,
      unit: "%",
      icon: Droplets,
      max: 100,
    },
    {
      label: "Slope",
      value: location.slope,
      unit: "°",
      icon: Mountain,
      max: 60,
    },
    {
      label: "Temperature",
      value: location.temperature,
      unit: "°C",
      icon: Thermometer,
      max: 40,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Environmental Analytics
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Current environmental conditions for the selected location
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          const percentage = Math.min(
            100,
            Math.max(0, (metric.value / metric.max) * 100)
          );

          return (
            <div
              key={metric.label}
              className="rounded-lg border border-slate-700 bg-slate-800/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-400" />

                  <span className="text-xs font-medium text-slate-400">
                    {metric.label}
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-200">
                  {metric.value}
                  {metric.unit}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EnvironmentalChart;