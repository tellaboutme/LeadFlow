import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { RouteErrorBoundary } from './components/RouteErrorBoundary'
import { Dashboard } from './routes/dashboard/Dashboard'
import { LeadsList } from './routes/leads/LeadsList'
import { LeadForm } from './routes/leads/LeadForm'
import { LeadDetails } from './routes/leads/LeadDetails'
import { NotFound } from './routes/NotFound'
import { Settings } from './routes/Settings'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          index
          element={
            <RouteErrorBoundary>
              <Dashboard />
            </RouteErrorBoundary>
          }
        />
        <Route
          path="leads"
          element={
            <RouteErrorBoundary>
              <LeadsList />
            </RouteErrorBoundary>
          }
        />
        <Route
          path="leads/new"
          element={
            <RouteErrorBoundary>
              <LeadForm />
            </RouteErrorBoundary>
          }
        />
        <Route
          path="leads/:leadId"
          element={
            <RouteErrorBoundary>
              <LeadDetails />
            </RouteErrorBoundary>
          }
        />
        <Route
          path="settings"
          element={
            <RouteErrorBoundary>
              <Settings />
            </RouteErrorBoundary>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
