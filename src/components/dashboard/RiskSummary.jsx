import {
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Bell,
  ClipboardList,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import RiskCard from './RiskCard'
import { riskSummaryStats } from '../../data/dashboardData'

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
      link: '/citizen-reports',
    },
  ]

  return (
    <section aria-label="Risk summary">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 md:gap-4">
        {cards.map((card) => {
          const cardContent = <RiskCard key={card.title} {...card} />

          if (card.link) {
            return (
              <Link
                key={card.title}
                to={card.link}
                className="block rounded-xl transition hover:ring-2 hover:ring-sky-400/40"
              >
                {cardContent}
              </Link>
            )
          }

          return cardContent
        })}
      </div>
    </section>
  )
}
