import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shoo/callback')({
  component: ShooCallback,
})

function ShooCallback() {
  return (
    <div className="min-h-screen grid place-items-center text-sm opacity-70">
      Signing you in…
    </div>
  )
}
