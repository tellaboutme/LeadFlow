import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

export function NotFound() {
  const navigate = useNavigate()
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      actionLabel="Go to dashboard"
      onAction={() => navigate('/')}
    />
  )
}
