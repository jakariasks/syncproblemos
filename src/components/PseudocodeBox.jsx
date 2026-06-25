export default function PseudocodeBox({ title, subtitle, blocks }) {
  return (
    <div className="mt-4 rounded-2xl border border-indigo-400/25 bg-indigo-400/10 p-3">
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
          Pseudocode + Short Explanation
        </p>

        <h3 className="mt-1 text-base font-black text-indigo-100">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {blocks.map((block, index) => (
          <div
            key={`${block.heading}-${index}`}
            className="rounded-xl border border-slate-800 bg-slate-950 p-3"
          >
            <h4 className="text-sm font-bold text-cyan-200">
              {block.heading}
            </h4>

            <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900 p-2 font-mono text-[11px] leading-5 text-slate-300">
{block.code}
            </pre>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {block.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}