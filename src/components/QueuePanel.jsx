export default function QueuePanel({ title = 'Waiting Queue', queues = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="mb-3 font-bold text-slate-100">{title}</h3>

      <div className="space-y-3">
        {queues.map(queue => (
          <div key={queue.label} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-200">{queue.label}</p>
              <span className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-400">
                {queue.items.length} item(s)
              </span>
            </div>

            {queue.items.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Queue is empty.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {queue.items.map((item, index) => (
                  <span
                    key={`${queue.label}-${item}-${index}`}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
