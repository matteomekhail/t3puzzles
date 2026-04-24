import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/history')({
  component: HistoryView,
})

function HistoryView() {
  return (
    <section className="max-w-[760px]">
      <header className="mb-10">
        <h1 className="font-medium text-[1.75rem] tracking-tight mb-[0.4rem]">
          History
        </h1>
        <p className="text-[0.92rem] text-fg-muted leading-normal">
          Your past attempts and solved puzzles.
        </p>
      </header>
      <div className="px-6 py-12 border border-dashed border-border rounded-xl text-fg-dim text-[0.9rem] text-center">
        <p>You haven't played any puzzles yet.</p>
      </div>
    </section>
  )
}
