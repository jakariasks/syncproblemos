export default function InfoBox({ title, items }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
      <h3 className="font-bold text-cyan-200">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}
