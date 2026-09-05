import { LayoutDashboard, Map, AlertTriangle, ClipboardList } from 'lucide-react'

// Single source of truth for primary navigation.
// Both the desktop Sidebar and the MobileDrawer read from this list so the
// two never drift out of sync.
export const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/gis-map',
    label: 'GIS Risk Map',
    icon: Map,
  },
  {
    to: '/early-warnings',
    label: 'Early Warnings',
    icon: AlertTriangle,
  },
  {
    to: '/citizen-reports',
    label: 'Citizen Reports',
    icon: ClipboardList,
  },
]
