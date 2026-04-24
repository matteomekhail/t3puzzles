import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Lock, Send } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/dashboard/puzzle/$puzzleId')({
  component: PuzzleDetail,
})

type SubmitResult = {
  result: 'correct' | 'incorrect' | 'locked' | 'out_of_tries'
  correct: boolean
  attemptsUsed: number
  maxTries: number
}

function PuzzleDetail() {
  const { puzzleId } = Route.useParams()
  const typedId = puzzleId as Id<'puzzles'>

  const puzzle = useQuery(api.puzzles.byId, { puzzleId: typedId })
  const myAttempts = useQuery(api.attempts.myForPuzzle, { puzzleId: typedId })
  const submit = useMutation(api.attempts.submit)

  const [guess, setGuess] = useState('')
  const [lastResult, setLastResult] = useState<SubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (puzzle === undefined) {
    return <p className="text-fg-dim text-[0.9rem]">Loading…</p>
  }
  if (puzzle === null) throw notFound()

  const isSolved = Boolean(puzzle.solvedBy)
  const attemptsCount = myAttempts?.length ?? 0
  const outOfTries = attemptsCount >= puzzle.maxTries
  const unlimited = puzzle.maxTries >= 999
  const locked = isSolved || outOfTries

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!guess.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await submit({ puzzleId: typedId, guess })
      setLastResult(res)
      if (res.correct) setGuess('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-[760px]">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-[0.82rem] text-fg-dim hover:text-fg-muted transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.75} />
        Back to puzzles
      </Link>

      <header className="mb-6">
        <h1 className="font-medium text-[1.75rem] tracking-tight mb-[0.4rem]">
          {puzzle.title}
        </h1>
        <p className="text-[0.82rem] text-fg-dim leading-normal flex items-center gap-2 flex-wrap">
          <span>
            Published{' '}
            {new Date(puzzle.publishedAt).toISOString().slice(0, 10)}
          </span>
          <span className="opacity-40">·</span>
          <span>
            {unlimited ? 'Unlimited tries' : `${puzzle.maxTries} tries max`}
          </span>
          {attemptsCount > 0 && !unlimited && (
            <>
              <span className="opacity-40">·</span>
              <span>
                {attemptsCount}/{puzzle.maxTries} used
              </span>
            </>
          )}
          {attemptsCount > 0 && unlimited && (
            <>
              <span className="opacity-40">·</span>
              <span>{attemptsCount} tries</span>
            </>
          )}
        </p>
      </header>

      {isSolved && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-[rgba(134,239,172,0.25)] bg-[rgba(134,239,172,0.05)] flex items-center gap-2 text-[0.88rem] text-[#86efac]">
          <CheckCircle2 size={16} strokeWidth={1.75} />
          This puzzle has been solved.
        </div>
      )}
      {!isSolved && outOfTries && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-[rgba(252,165,165,0.25)] bg-[rgba(252,165,165,0.05)] flex items-center gap-2 text-[0.88rem] text-[#fca5a5]">
          <Lock size={16} strokeWidth={1.75} />
          You've used all your tries for this puzzle.
        </div>
      )}

      <div className="border border-border rounded-xl p-5 bg-[rgba(255,255,255,0.015)] mb-6">
        <pre className="whitespace-pre-wrap break-all font-mono text-[0.85rem] leading-relaxed text-fg">
          {puzzle.description}
        </pre>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="text-[0.82rem] text-fg-muted">Your solution</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={locked || submitting}
            placeholder={locked ? 'Locked' : 'Type your answer…'}
            className="flex-1 bg-[rgba(255,255,255,0.02)] border border-border rounded-lg px-4 py-2.5 text-[0.92rem] text-fg placeholder:text-fg-dim focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={locked || submitting || !guess.trim()}
            className="inline-flex items-center gap-2 bg-fg text-bg px-4 py-2.5 rounded-lg font-semibold text-[0.88rem] transition-[transform,opacity] duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send size={14} strokeWidth={2} />
            Submit
          </button>
        </div>

        {error && (
          <p className="text-[0.82rem] text-[#fca5a5]">{error}</p>
        )}
        {lastResult && !error && (
          <FeedbackBanner result={lastResult} />
        )}
      </form>
    </section>
  )
}

function FeedbackBanner({ result }: { result: SubmitResult }) {
  if (result.result === 'correct') {
    return (
      <div className="px-4 py-2.5 rounded-lg border border-[rgba(134,239,172,0.25)] bg-[rgba(134,239,172,0.05)] text-[0.85rem] text-[#86efac] flex items-center gap-2">
        <CheckCircle2 size={14} strokeWidth={1.75} />
        Correct! You solved it.
      </div>
    )
  }
  if (result.result === 'locked') {
    return (
      <div className="px-4 py-2.5 rounded-lg border border-border text-[0.85rem] text-fg-muted">
        Puzzle already solved.
      </div>
    )
  }
  if (result.result === 'out_of_tries') {
    return (
      <div className="px-4 py-2.5 rounded-lg border border-[rgba(252,165,165,0.25)] bg-[rgba(252,165,165,0.05)] text-[0.85rem] text-[#fca5a5]">
        Out of tries.
      </div>
    )
  }
  return (
    <div className="px-4 py-2.5 rounded-lg border border-border text-[0.85rem] text-fg-muted">
      Not quite. Try again.
    </div>
  )
}
