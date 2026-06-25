import SectionCard from './SectionCard.jsx'
import ExportButtons from './ExportButtons.jsx'

const reportText = `PROCESS SYNCHRONIZATION DYNAMIC VISUALIZER REPORT

MAIN UPDATE
This version fixes the teacher feedback by making the simulation dynamic instead of sequential/static.

1. PRODUCER-CONSUMER
- Multiple producers are shown.
- Multiple consumers are shown.
- Producer/consumer arrival is random.
- If buffer is full, producers wait.
- If buffer is empty, consumers wait.
- mutex protects actual buffer insert/remove.

2. READERS-WRITERS
- Reader/writer arrival is random.
- Multiple readers can read together.
- Writer requires exclusive access.
- Fair mode can reduce writer starvation by stopping new readers when a writer is already waiting.

3. DINING PHILOSOPHERS
- Uses chopstick terminology.
- Any philosopher can become hungry randomly.
- A philosopher can eat only if both left and right chopsticks are free.
- Multiple non-neighbor philosophers can eat together.
- Unsafe mode demonstrates circular waiting/deadlock risk.

FINAL STATEMENT
This app dynamically visualizes three classical synchronization problems using random scheduling, waiting queues, semaphores, mutex, rw_mutex/read_count, and chopstick resources.`

export default function TheoryReport() {
  return (
    <div className="space-y-6">
      <SectionCard title="Theory & Report" subtitle="Updated report for the dynamic version based on teacher feedback." right={<ExportButtons title="synchronization-dynamic-report" textBuilder={() => reportText} />}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><h3 className="text-lg font-bold text-cyan-200">Producer-Consumer Fix</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><li>• Multiple producers</li><li>• Multiple consumers</li><li>• Random arrival</li><li>• Full buffer wait</li><li>• Empty buffer wait</li></ul></div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><h3 className="text-lg font-bold text-emerald-200">Readers-Writers Fix</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><li>• Random reader/writer arrival</li><li>• Multiple readers together</li><li>• Writer exclusive access</li><li>• Waiting queues</li><li>• Fair mode</li></ul></div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><h3 className="text-lg font-bold text-amber-200">Dining Philosophers Fix</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><li>• Chopstick terminology</li><li>• Random philosopher selection</li><li>• Multiple non-neighbor eating</li><li>• Free chopstick check</li><li>• Unsafe deadlock demo</li></ul></div>
        </div>
      </SectionCard>
      <SectionCard title="Detailed Report Text"><div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{reportText}</pre></div></SectionCard>
    </div>
  )
}
