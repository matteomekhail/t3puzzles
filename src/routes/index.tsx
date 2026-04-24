import { createFileRoute, Link } from '@tanstack/react-router'
import { signIn, useShooAuth } from '../shoo'

export const Route = createFileRoute('/')({ component: Home })

const heroCta =
  'inline-flex items-center gap-[0.55rem] bg-fg text-bg px-8 py-3 rounded-full font-semibold text-[0.9rem] opacity-0 animate-fade-in [animation-delay:0.15s] transition-[transform,box-shadow] duration-[250ms] hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(255,255,255,0.08)] active:scale-[0.98]'

export function Home() {
  const { identity, loading } = useShooAuth()
  const isSignedIn = !loading && Boolean(identity?.userId)

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <nav className="flex items-center justify-between p-5 sm:px-10 sm:py-6 opacity-50 transition-opacity duration-[400ms] hover:opacity-100">
        <a href="/" className="inline-flex items-center" aria-label="t3puzzles">
          <span className="w-7 h-7 rounded-md bg-fg text-bg grid place-items-center font-semibold text-[0.85rem] tracking-[-0.04em]">
            t3
          </span>
        </a>
        <a
          href="https://github.com/matteomekhail/t3puzzles"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-[0.35rem] text-fg-muted text-sm transition-colors duration-300 hover:text-fg"
        >
          GitHub
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px"
          >
            ↗
          </span>
        </a>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center pt-[6vh] px-6 pb-[5vh] sm:pt-[10vh]">
        <h1 className="font-medium text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.035em] leading-[1.15] text-center max-w-[22ch] mb-[6vh] opacity-0 animate-fade-in">
          T3 Puzzles is the best way to race puzzles.
        </h1>

        {loading ? (
          <button
            className={`${heroCta} disabled:opacity-65 disabled:cursor-not-allowed`}
            disabled
          >
            Loading…
          </button>
        ) : isSignedIn ? (
          <Link to="/dashboard" className={heroCta}>
            Go to dashboard
          </Link>
        ) : (
          <button
            onClick={() => signIn({ returnTo: '/dashboard' })}
            className={heroCta}
          >
            Start solving
          </button>
        )}

        <a
          href="#how-it-works"
          className="inline-block mt-5 text-[0.825rem] text-fg-dim underline decoration-[rgba(113,113,122,0.4)] underline-offset-[3px] opacity-0 animate-fade-in [animation-delay:0.3s] transition-colors duration-300 hover:text-fg-muted hover:decoration-fg-muted"
        >
          How it works
        </a>
      </main>

      <footer className="flex items-center justify-center p-5 sm:px-10 sm:py-6 text-[0.8rem] text-fg-dim">
        <span>&copy; {new Date().getFullYear()} t3puzzles</span>
      </footer>
    </div>
  )
}
