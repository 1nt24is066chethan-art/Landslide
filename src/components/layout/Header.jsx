import { Menu, Bell, Radio } from 'lucide-react'

/**
 * Top application header.
 * Phase 1: static shell only — status/notifications are placeholders.
 * Real "last updated" wiring arrives once riskApi.js exists (Phase 4+).
 */
export default function Header({ onMenuClick }) {
  return (
    <header className="h-16 shrink-0 flex items-center justify-between gap-3 px-4 md:px-6 border-b border-surface-border bg-surface-900/80 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-md text-slate-300 hover:text-white hover:bg-surface-700/60"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-slate-100 truncate">
            NER Landslide Early Warning System
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 truncate">
            Prototype dashboard · simulated data
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-risk-lowSoft text-risk-low border border-risk-low/30"
          title="Simulated system status"
        >
          <Radio size={12} aria-hidden="true" />
          <span>System Operational</span>
        </div>

        <p className="hidden lg:block text-[11px] text-slate-500 whitespace-nowrap">
          Last updated: <span className="text-slate-300">—</span>
        </p>

        <button
          className="relative p-2 rounded-md text-slate-300 hover:text-white hover:bg-surface-700/60"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>
      </div>
    </header>
  )
}
