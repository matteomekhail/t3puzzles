import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { CheckCircle2, Lock, ChevronRight } from 'lucide-react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/dashboard/')({
  component: Puzzles,
})

function Puzzles() {
  const puzzles = useQuery(api.puzzles.list)

  return (
    <section className="max-w-[760px]">
      <header className="mb-10">
        <h1 className="font-medium text-[1.75rem] tracking-tight mb-[0.4rem]">
          Puzzles
        </h1>
        <p className="text-[0.92rem] text-fg-muted leading-normal">
          Daily cipher challenges. Click one to open and submit a solution.
        </p>
      </header>

      {puzzles === undefined ? (
        <p className="text-fg-dim text-[0.9rem]">Loading…</p>
      ) : puzzles.length === 0 ? (
        <div className="px-6 py-12 border border-dashed border-border rounded-xl text-fg-dim text-[0.9rem] text-center">
          <p>No puzzles available yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {puzzles.map((p) => (
            <li key={p._id}>
              <Link
                to="/dashboard/puzzle/$puzzleId"
                params={{ puzzleId: p._id }}
                className="group flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-border bg-[rgba(255,255,255,0.015)] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="shrink-0 text-fg-dim font-mono text-[0.72rem] tracking-wider w-[3.5ch] text-center">
                    {new Date(p.publishedAt).toISOString().slice(5, 10)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-[0.98rem] tracking-tight truncate">
                      {p.title}
                    </div>
                    <div className="text-[0.78rem] text-fg-dim mt-0.5">
                      {new Date(p.publishedAt).toISOString().slice(0, 10)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {p.solvedBy ? (
                    <span className="inline-flex items-center gap-1 text-[0.72rem] text-[#86efac]">
                      <CheckCircle2 size={14} strokeWidth={1.75} />
                      Solved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[0.72rem] text-fg-dim">
                      <Lock size={12} strokeWidth={1.75} />
                      Open
                    </span>
                  )}
                  <ChevronRight
                    size={16}
                    strokeWidth={1.75}
                    className="text-fg-dim transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
