export default function AlgorithmPanel({ title = 'Algorithm Steps', steps = [], currentIndex = 0 }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="mb-3 font-bold text-slate-100">{title}</h3>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = index === currentIndex
          const isPast = index < currentIndex

          return (
            <div
              key={`${step}-${index}`}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                isActive
                  ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100'
                  : isPast
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
              }`}
            >
              <span className="mr-2 font-bold text-slate-500">{index + 1}.</span>
              {step}
              {isActive && <span className="ml-2 rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-200">current</span>}
              {isPast && !isActive && <span className="ml-2 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">done</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
