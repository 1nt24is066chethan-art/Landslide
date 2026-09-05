import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileDrawer from './MobileDrawer'

/**
 * Top-level shell: sidebar (desktop/tablet) + header + routed page content.
 * Mobile navigation is a drawer, toggled from the header's menu button.
 */
export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="h-screen flex bg-surface-950 text-slate-200">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuClick={() => setDrawerOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 py-5 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
