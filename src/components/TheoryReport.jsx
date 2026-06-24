import SectionCard from './SectionCard.jsx'
import ExportButtons from './ExportButtons.jsx'

const reportText = `PROCESS SYNCHRONIZATION THEORY REPORT

1. PRODUCER-CONSUMER / BOUNDED BUFFER
Definition:
Producer generates data and places it into a fixed-size buffer. Consumer removes data from that same shared buffer.

Main Issues:
- Producer must not produce when the buffer is full.
- Consumer must not consume when the buffer is empty.
- Mutual exclusion is required when accessing the shared buffer.

Synchronization Tools:
- empty semaphore
- full semaphore
- mutex lock

Short Algorithm:
Producer: wait(empty) -> wait(mutex) -> insert item -> signal(mutex) -> signal(full)
Consumer: wait(full) -> wait(mutex) -> remove item -> signal(mutex) -> signal(empty)

Real-life Example:
A printer queue or online order queue where tasks are produced and consumed.

2. READERS-WRITERS
Definition:
Multiple readers and writers share the same data. Readers only read, writers modify the data.

Main Issues:
- Many readers can read together.
- Only one writer can write at a time.
- Writer must not write while readers are reading.

Synchronization Tools:
- mutex
- wrt semaphore
- read_count variable

Short Algorithm:
Reader: update read_count safely, first reader blocks writers, read, last reader releases writers.
Writer: wait(wrt) -> write -> signal(wrt)

Real-life Example:
A library database or a shared online document system.

3. DINING PHILOSOPHERS
Definition:
Five philosophers sit around a table with one fork between each pair. A philosopher needs two forks to eat.

Main Issues:
- Deadlock
- Starvation
- Mutual exclusion on forks

Synchronization Tools:
- fork semaphores
- room semaphore (safe mode)

Unsafe Idea:
If every philosopher picks one fork and waits for the second fork, circular waiting leads to deadlock.

Safe Idea:
Allow only N - 1 philosophers to try to eat at a time or use another deadlock prevention strategy.

Real-life Example:
Shared devices or resources in a network where several processes need multiple resources at once.

HOW TO PRESENT THIS APP
1. Choose Manual Mode.
2. Click Start.
3. Use Next Step to explain each algorithm line.
4. Show Waiting Queue and Properties.
5. In Dining Philosophers, show Unsafe Mode first, then Safe Mode.
6. Use Export Report or Print View for submission.

TOOLS USED BY THE WEB APP
- React for UI
- Vite for project setup and build
- Tailwind CSS for styling
- JavaScript for logic
`

export default function TheoryReport() {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Theory & Report Tab"
        subtitle="This tab gives a complete mini-report so your teacher can understand both theory and the visualization logic."
        right={<ExportButtons title="synchronization-theory-report" textBuilder={() => reportText} />}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-lg font-bold text-cyan-200">What this app includes</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>• Algorithm step highlight</li>
              <li>• Manual mode and auto mode</li>
              <li>• Waiting queue visualization</li>
              <li>• Safe and unsafe deadlock demonstration for Dining Philosophers</li>
              <li>• Theory/explanation section inside app</li>
              <li>• Export report and Print view buttons</li>
              <li>• Better UI labels like critical section, blocked state, shared resource, safe state, and deadlock risk</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-lg font-bold text-amber-200">How to explain during viva</h3>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>1. First explain the problem definition.</li>
              <li>2. Then show the synchronization tools used.</li>
              <li>3. Use manual mode and click Next Step.</li>
              <li>4. Relate the highlighted algorithm line to the current UI state.</li>
              <li>5. Show the waiting queue and blocked state.</li>
              <li>6. In Dining Philosophers, compare unsafe mode and safe mode clearly.</li>
            </ol>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Detailed Theory">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{reportText}</pre>
        </div>
      </SectionCard>
    </div>
  )
}
