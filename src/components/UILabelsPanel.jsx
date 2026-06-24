export default function UILabelsPanel({ items }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="mb-3 font-bold text-slate-100">Important OS Labels</h3>
      <div className="grid gap-3">
        {items.map(item => (
          <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
            <p className="text-sm font-bold text-slate-100">{item.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
