import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../../shoo'

export const Route = createFileRoute('/shoo/callback')({
  component: ShooCallback,
})

function ShooCallback() {
  const { isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: '/dashboard', replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  return (
    <div className="min-h-screen grid place-items-center text-fg-dim text-sm">
      Signing you in…
    </div>
  )
}
