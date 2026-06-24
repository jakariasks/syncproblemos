export default function PropertiesPanel({ title = 'Current Properties', items }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="mb-3 font-bold text-slate-100">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(item => (
          <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className={`mt-1 text-lg font-black ${item.color || 'text-slate-100'}`}>{item.value}</p>
            {item.note && <p className="mt-1 text-xs leading-5 text-slate-400">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
