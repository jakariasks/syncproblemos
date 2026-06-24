import { Download, Printer } from 'lucide-react'

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function ExportButtons({ title = 'simulation', textBuilder }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => downloadText(`${title}.txt`, textBuilder())}
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/20"
      >
        <Download size={16} />
        Export Report
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 transition hover:bg-slate-700"
      >
        <Printer size={16} />
        Print View
      </button>
    </div>
  )
}
