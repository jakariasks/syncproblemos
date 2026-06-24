export default function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
      {(title || subtitle || right) && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title && <h2 className="text-xl font-bold text-slate-100">{title}</h2>}
            {subtitle && <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
