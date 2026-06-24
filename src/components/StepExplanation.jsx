export default function StepExplanation({ stepTitle, explanation, algorithm }) {
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Current Step</p>
      <h3 className="mt-2 text-lg font-black text-amber-100">{stepTitle}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{explanation}</p>

      {algorithm && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-6 text-slate-300">
          {algorithm}
        </div>
      )}
    </div>
  )
}
