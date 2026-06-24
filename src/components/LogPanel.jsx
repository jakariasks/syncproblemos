export default function LogPanel({ logs }) {
  return (
    <div className="h-72 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-300">
      {logs.length === 0 ? (
        <p className="text-slate-500">Simulation log will appear here...</p>
      ) : (
        logs.map((log, index) => (
          <div key={`${log}-${index}`} className="border-b border-slate-900 py-1 last:border-b-0">
            {log}
          </div>
        ))
      )}
    </div>
  )
}
