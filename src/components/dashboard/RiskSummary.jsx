import { AlertTriangle, AlertCircle, ShieldCheck, Bell, ClipboardList } from 'lucide-react'
import RiskCard from './RiskCard'
import { riskSummaryStats } from '../../data/dashboardData'

/**
 * Row of five summary cards: High/Medium/Low risk location counts,
 * Active Warnings, and Citizen Reports. Reads from dashboardData.js
 * so no numbers are hardcoded here.
 */
export default function RiskSummary() {
  const cards = [
    {
      icon: AlertTriangle,
      title: 'High Risk Locations',
      value: riskSummaryStats.highRisk,
      label: 'Require close monitoring',
      tone: 'high',
    },
    {
      icon: AlertCircle,
      title: 'Medium Risk Locations',
      value: riskSummaryStats.mediumRisk,
      label: 'Elevated conditions',
      tone: 'medium',
    },
    {
      icon: ShieldCheck,
      title: 'Low Risk Locations',
      value: riskSummaryStats.lowRisk,
      label: 'Stable conditions',
      tone: 'low',
    },
    {
      icon: Bell,
      title: 'Active Warnings',
      value: riskSummaryStats.activeWarnings,
      label: 'Currently in effect',
      tone: 'medium',
    },
    {
      icon: ClipboardList,
      title: 'Citizen Reports',
      value: riskSummaryStats.citizenReports,
      label: 'Submitted this session',
      tone: 'info',
    },
  ]

  return (
    <section aria-label="Risk summary">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        {cards.map((card) => (
          <RiskCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  )
}
