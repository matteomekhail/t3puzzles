import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Puzzle, History, BarChart3, LogOut } from 'lucide-react'
import { signOut, useShooAuth } from '../shoo'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

const navItemBase =
  'flex items-center gap-[0.65rem] px-[0.65rem] py-2 rounded-md text-sm transition-colors duration-200'
const navItemInactive = `${navItemBase} text-fg-dim hover:text-fg-muted hover:bg-[rgba(255,255,255,0.02)]`
const navItemActive = `${navItemBase} text-fg bg-[rgba(255,255,255,0.04)]`

function DashboardLayout() {
  const { identity, claims, loading } = useShooAuth()
  const navigate = useNavigate()
  const isSignedIn = !loading && Boolean(identity?.userId)

  useEffect(() => {
    if (!loading && !identity?.userId) {
      navigate({ to: '/' })
    }
  }, [loading, identity, navigate])

  if (loading || !isSignedIn) {
    return (
      <div className="min-h-screen grid place-items-center text-fg-dim text-sm">
        Loading…
      </div>
    )
  }

  const displayName = claims?.name ?? claims?.email ?? 'Signed in'

  return (
    <div className="min-h-screen flex max-[720px]:flex-col">
      <aside className="w-[240px] border-r border-border flex flex-col px-[1.1rem] pt-6 pb-5 shrink-0 max-[720px]:w-full max-[720px]:border-r-0 max-[720px]:border-b max-[720px]:flex-row max-[720px]:items-center max-[720px]:px-[1.1rem] max-[720px]:py-[0.9rem] max-[720px]:gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-[0.6rem] pt-1 px-1 pb-7 text-fg max-[720px]:p-0"
        >
          <span className="w-7 h-7 rounded-md bg-fg text-bg grid place-items-center font-semibold text-[0.85rem] tracking-[-0.04em]">
            t3
          </span>
          <span className="font-medium text-[0.9rem] tracking-[-0.015em] max-[720px]:hidden">
            t3puzzles
          </span>
        </Link>

        <nav className="flex flex-col gap-[0.15rem] max-[720px]:flex-row max-[720px]:flex-1 max-[720px]:justify-center max-[720px]:gap-[0.1rem]">
          <Link
            to="/dashboard"
            activeProps={{ className: navItemActive }}
            inactiveProps={{ className: navItemInactive }}
            activeOptions={{ exact: true }}
          >
            <Puzzle size={16} strokeWidth={1.75} />
            Puzzles
          </Link>
          <Link
            to="/dashboard/history"
            activeProps={{ className: navItemActive }}
            inactiveProps={{ className: navItemInactive }}
          >
            <History size={16} strokeWidth={1.75} />
            History
          </Link>
          <Link
            to="/dashboard/stats"
            activeProps={{ className: navItemActive }}
            inactiveProps={{ className: navItemInactive }}
          >
            <BarChart3 size={16} strokeWidth={1.75} />
            Stats
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2 max-[720px]:mt-0 max-[720px]:pt-0 max-[720px]:border-t-0 max-[720px]:flex-row max-[720px]:gap-[0.4rem]">
          <div
            className="flex items-center gap-[0.55rem] px-[0.35rem] py-[0.45rem] min-w-0"
            title={identity.userId ?? undefined}
          >
            {claims?.picture ? (
              <img
                src={claims.picture}
                alt=""
                className="w-6 h-6 rounded-full shrink-0 object-cover"
              />
            ) : (
              <span className="w-6 h-6 rounded-full shrink-0 bg-fg text-bg grid place-items-center text-[0.7rem] font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-[0.82rem] text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis max-[720px]:hidden">
              {displayName}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            aria-label="Sign out"
            className="flex items-center gap-[0.55rem] px-[0.65rem] py-[0.45rem] rounded-md text-[0.82rem] text-fg-dim transition-colors duration-200 hover:text-fg hover:bg-[rgba(255,255,255,0.03)]"
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span className="max-[720px]:hidden">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 px-12 py-11 overflow-y-auto min-w-0 max-[720px]:px-5 max-[720px]:py-7">
        <Outlet />
      </main>
    </div>
  )
}
