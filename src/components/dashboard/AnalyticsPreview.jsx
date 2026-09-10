import { useEffect, useState } from 'react'
import { CloudRain, Activity, Loader2, Droplets, Mountain, Thermometer } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-slate-700 bg-surface-900 px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-slate-200">{label}</p>
      <p className="mt-1 text-xs text-slate-400">
        {payload[0].name}: {payload[0].value}
        {payload[0].unit}
      </p>
    </div>
  )
}

function ChartPanel({ icon: Icon, title, children, loading, error }) {
  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent-soft">
            <Icon size={15} aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        </div>

        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          Simulated
        </span>
      </div>

      <div className="h-48 px-2 pb-2">
        {loading ? (
          <div className="h-full flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 size={15} className="animate-spin" />
            Loading analytics...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-center px-4">
            <p className="text-xs text-risk-high">
              Unable to load environmental data.
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function MetricBarChart({ icon: Icon, title, data, color, unit, maxValue }) {
  return (
    <ChartPanel icon={Icon} title={title} loading={false} error={false}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148,163,184,0.12)"
          />

          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={45}
          />

          <YAxis
            tick={{ fill: '#64748b', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxValue]}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: 'rgba(148,163,184,0.06)' }}
          />

          <Bar
            dataKey="value"
            name={title}
            fill={color}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  )
}

export default function AnalyticsPreview() {
  const [locations, setLocations] = useState([])
  const [environmentData, setEnvironmentData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadAnalytics() {
      try {
        setLoading(true)
        setError(false)

        const locationsResponse = await fetch(
          `${API_BASE_URL}/risk-locations`,
        )

        if (!locationsResponse.ok) {
          throw new Error('Failed to fetch risk locations')
        }

        const locationsResult = await locationsResponse.json()

        if (
          !locationsResult.success ||
          !Array.isArray(locationsResult.data)
        ) {
          throw new Error('Invalid risk locations response')
        }

        const locationList = locationsResult.data

        const environmentalResults = await Promise.allSettled(
          locationList.map(async (location) => {
            const response = await fetch(
              `${API_BASE_URL}/risk-locations/${location.id}/environment`,
            )

            if (!response.ok) {
              throw new Error(
                `Failed to fetch environment for location ${location.id}`,
              )
            }

            const result = await response.json()

            if (!result.success || !result.data) {
              throw new Error(
                `Invalid environment response for location ${location.id}`,
              )
            }

            return {
              location,
              environment: result.data,
            }
          }),
        )

        if (!cancelled) {
          const successfulResults = environmentalResults
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value)

          const failedCount = environmentalResults.filter(
            (result) => result.status === 'rejected'
          ).length

          setLocations(locationList)
          setEnvironmentData(successfulResults)

          if (failedCount > 0) {
            console.warn(`${failedCount} location(s) failed to load environmental data`)
          }
        }
      } catch (err) {
        console.error('Analytics loading error:', err)

        if (!cancelled) {
          setError(true)
          setLocations([])
          setEnvironmentData([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [])

  const rainfallData = environmentData.map(({ location, environment }) => ({
    name: location.location,
    value: environment.rainfallMm,
    unit: ' mm',
  }))

  const soilMoistureData = environmentData.map(({ location, environment }) => ({
    name: location.location,
    value: environment.soilMoisturePercent,
    unit: ' %',
  }))

  const slopeData = environmentData.map(({ location, environment }) => ({
    name: location.location,
    value: environment.slopeDegrees,
    unit: ' °',
  }))

  const temperatureData = environmentData.map(({ location, environment }) => ({
    name: location.location,
    value: environment.temperatureCelsius,
    unit: ' °C',
  }))

  return (
    <section
      aria-label="Analytics previews"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <ChartPanel
        icon={CloudRain}
        title="Rainfall Trend"
        loading={loading}
        error={error}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rainfallData}
            margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.12)"
            />

            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={45}
            />

            <YAxis
              tick={{ fill: '#64748b', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: 'rgba(148,163,184,0.06)' }}
            />

            <Bar
              dataKey="value"
              name="Rainfall"
              fill="#38bdf8"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <MetricBarChart
        icon={Droplets}
        title="Soil Moisture"
        data={soilMoistureData}
        color="#34d399"
        unit="%"
        maxValue={100}
      />

      <MetricBarChart
        icon={Mountain}
        title="Slope"
        data={slopeData}
        color="#f59e0b"
        unit="°"
        maxValue={60}
      />

      <MetricBarChart
        icon={Thermometer}
        title="Temperature"
        data={temperatureData}
        color="#fb7185"
        unit="°C"
        maxValue={40}
      />
    </section>
  )
}