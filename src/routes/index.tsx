import { createFileRoute } from '@tanstack/react-router'
import { useShooAuth } from '@shoojs/react'
import { signIn, signOut } from '../shoo'

export const Route = createFileRoute('/')({ component: Home })

export function Home() {
  const { identity, loading } = useShooAuth()
  const isSignedIn = !loading && Boolean(identity?.userId)

  return (
    <div className="page">
      <nav className="nav">
        <a href="/" className="nav-brand" aria-label="t3puzzles">
          <span className="nav-mark">t3</span>
        </a>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-github"
        >
          GitHub
          <span className="nav-github-arrow" aria-hidden>↗</span>
        </a>
      </nav>

      <main className="main">
        <h1 className="tagline">
          T3 Puzzles is the best way to race puzzles.
        </h1>

        {loading ? (
          <button className="hero-button" disabled>
            Loading…
          </button>
        ) : isSignedIn ? (
          <button onClick={() => signOut()} className="hero-button">
            Sign out
          </button>
        ) : (
          <button onClick={() => signIn()} className="hero-button">
            Start solving
          </button>
        )}

        <a href="#how-it-works" className="other-link">
          How it works
        </a>
      </main>

      <footer className="footer">
        <span>&copy; {new Date().getFullYear()} t3puzzles</span>
        <div className="footer-links">
          <a href="#" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
