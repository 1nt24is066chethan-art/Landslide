import { NavLink } from 'react-router-dom'
import { X, ShieldAlert } from 'lucide-react'
import { NAV_ITEMS } from './navConfig'

/**
 * Slide-in drawer navigation for mobile viewports.
 * Controlled by AppLayout via `open` / `onClose`.
 */
export default function MobileDrawer({ open, onClose }) {
  return (
    <div
      className={`md:hidden fixed inset-0 z-40 transition-opacity ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <nav
        className={`absolute top-0 left-0 h-full w-72 max-w-[80%] bg-surface-900 border-r border-surface-border
          flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Primary navigation"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-border">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="text-accent shrink-0" size={22} aria-hidden="true" />
            <div className="leading-tight min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">NER-LEWS</p>
              <p className="text-[11px] text-slate-500 truncate">Landslide Early Warning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-surface-700/60"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
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
        </div>

        <div className="px-4 py-3 border-t border-surface-border">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            SIH26001 · Work B Prototype
            <br />
            Simulated data for demonstration
          </p>
        </div>
      </nav>
    </div>
  )
}
