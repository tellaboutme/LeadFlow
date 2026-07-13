import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { ErrorState } from './ErrorState'

function Fallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="This page failed to load"
      description="Something went wrong while rendering this page."
      onRetry={resetErrorBoundary}
    />
  )
}

export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <ErrorBoundary FallbackComponent={Fallback} resetKeys={[location.pathname]}>
      {children}
    </ErrorBoundary>
  )
}
