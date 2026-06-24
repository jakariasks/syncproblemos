export default function Legend({ items }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="mb-3 font-bold text-slate-100">Color Legend</h3>
      <div className="grid gap-2 text-sm">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded border ${item.className}`} />
            <span className="text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
