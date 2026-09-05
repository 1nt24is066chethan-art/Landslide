import { NavLink } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { NAV_ITEMS } from './navConfig'

/**
 * Persistent sidebar for desktop / tablet viewports.
 * Hidden on mobile — MobileDrawer takes over navigation there.
 */
export default function Sidebar() {
  return (
    <aside
      className="hidden md:flex md:flex-col md:w-60 lg:w-64 shrink-0 border-r border-surface-border bg-surface-900"
      aria-label="Primary navigation"
    >
      <div className="h-16 flex items-center gap-2 px-5 border-b border-surface-border">
        <ShieldAlert className="text-accent shrink-0" size={22} aria-hidden="true" />
        <div className="leading-tight min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">NER-LEWS</p>
          <p className="text-[11px] text-slate-500 truncate">Landslide Early Warning</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/15 text-accent-soft border border-accent/30'
                  : 'text-slate-400 border border-transparent hover:bg-surface-700/60 hover:text-slate-200',
              ].join(' ')
            }
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-surface-border">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          SIH26001 · Work B Prototype
          <br />
          Simulated data for demonstration
        </p>
      </div>
    </aside>
  )
}
