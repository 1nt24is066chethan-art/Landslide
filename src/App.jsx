import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import GisMapPage from './pages/GisMapPage'
import EarlyWarningsPage from './pages/EarlyWarningsPage'
import CitizenReportsPage from './pages/CitizenReportsPage'
import NotFoundPage from './pages/NotFoundPage'

// App.jsx stays intentionally thin: it only wires routes to pages.
// All layout logic lives in components/layout/AppLayout, and all page
// content lives under pages/. No data fetching or business logic here.
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/gis-map" element={<GisMapPage />} />
        <Route path="/early-warnings" element={<EarlyWarningsPage />} />
        <Route path="/citizen-reports" element={<CitizenReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
