import { useEffect, useState } from 'react'
import { BookOpen, Edit3, Lock, Unlock } from 'lucide-react'
import SectionCard from './SectionCard.jsx'
import ControlButtons from './ControlButtons.jsx'
import LogPanel from './LogPanel.jsx'
import InfoBox from './InfoBox.jsx'
import PropertiesPanel from './PropertiesPanel.jsx'
import StepExplanation from './StepExplanation.jsx'
import Legend from './Legend.jsx'
import AlgorithmPanel from './AlgorithmPanel.jsx'
import QueuePanel from './QueuePanel.jsx'
import UILabelsPanel from './UILabelsPanel.jsx'
import ExportButtons from './ExportButtons.jsx'
import PseudocodeBox from './PseudocodeBox.jsx'

const READER_COUNT = 6
const WRITER_COUNT = 3

const READER_ALGORITHM = ['random reader arrives', 'wait(mutex)', 'read_count++', 'if first reader wait(rw_mutex)', 'read shared data', 'read_count--', 'if last reader signal(rw_mutex)']
const WRITER_ALGORITHM = ['random writer arrives', 'wait(rw_mutex)', 'write shared data exclusively', 'signal(rw_mutex)']

const READERS_WRITERS_PSEUDOCODE = [
  { heading: 'Reader Process', code: `while true:
    wait(mutex)
    read_count++
    if read_count == 1:
        wait(rw_mutex)
    signal(mutex)
    read_data()
    wait(mutex)
    read_count--
    if read_count == 0:
        signal(rw_mutex)
    signal(mutex)`, explanation: 'Readers arrive randomly. If no writer is active, multiple readers can read together.' },
  { heading: 'Writer Process', code: `while true:
    wait(rw_mutex)
    write_data()
    signal(rw_mutex)`, explanation: 'Writers arrive randomly, but each writer must get exclusive access before writing.' },
]

function makeReaders() { return Array.from({ length: READER_COUNT }, (_, i) => ({ id: i + 1, name: `R${i + 1}`, status: 'Idle', remaining: 0 })) }
function makeWriters() { return Array.from({ length: WRITER_COUNT }, (_, i) => ({ id: i + 1, name: `W${i + 1}`, status: 'Idle', remaining: 0 })) }
function randomId(count) { return Math.floor(Math.random() * count) + 1 }

export default function ReadersWriters() {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [mode, setMode] = useState('auto')
  const [speed, setSpeed] = useState(2300)
  const [fairMode, setFairMode] = useState(true)
  const [readers, setReaders] = useState(makeReaders)
  const [writers, setWriters] = useState(makeWriters)
  const [readerQueue, setReaderQueue] = useState([])
  const [writerQueue, setWriterQueue] = useState([])
  const [sharedData, setSharedData] = useState(100)
  const [algorithm, setAlgorithm] = useState(READER_ALGORITHM)
  const [algorithmIndex, setAlgorithmIndex] = useState(0)
  const [stepTitle, setStepTitle] = useState('Ready')
  const [explanation, setExplanation] = useState('Press Start. Reader or writer arrival is random, not sequential.')
  const [algorithmText, setAlgorithmText] = useState('Dynamic scheduler randomly selects reader or writer.')
  const [logs, setLogs] = useState([])

  const activeReaders = readers.filter(r => r.status === 'Reading').length
  const activeWriter = writers.find(w => w.status === 'Writing')
  const rwLocked = activeReaders > 0 || Boolean(activeWriter)

  function log(msg) { setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 100)) }
  function setReader(id, status, remaining = 0) { setReaders(prev => prev.map(r => r.id === id ? { ...r, status, remaining } : r)) }
  function setWriter(id, status, remaining = 0) { setWriters(prev => prev.map(w => w.id === id ? { ...w, status, remaining } : w)) }

  function startReader(id, fromQueue = false) {
    const writerActive = writers.some(w => w.status === 'Writing')
    const writerWaiting = writerQueue.length > 0
    setAlgorithm(READER_ALGORITHM)
    if (writerActive || (fairMode && writerWaiting)) {
      setReader(id, 'Waiting')
      setReaderQueue(prev => prev.includes(`R${id}`) ? prev : [...prev, `R${id}`])
      setAlgorithmIndex(0)
      setStepTitle(`R${id} waits`)
      setExplanation(writerActive ? 'A writer is currently writing, so this reader waits.' : 'Fair mode is on. A writer is already waiting, so this newly arrived reader waits.')
      setAlgorithmText('reader waits because writer has/wants rw_mutex')
      log(`R${id} arrived and waits.`)
      return
    }
    setReader(id, 'Reading', Math.floor(Math.random() * 3) + 2)
    setReaderQueue(prev => prev.filter(x => x !== `R${id}`))
    setAlgorithmIndex(4)
    setStepTitle(`${fromQueue ? 'Queued reader' : 'Reader'} R${id} reads`)
    setExplanation(`R${id} started reading. Other readers can also read because no writer is writing.`)
    setAlgorithmText('wait(mutex) → read_count++ → read')
    log(`R${id} started reading.`)
  }

  function startWriter(id, fromQueue = false) {
    const readersActive = readers.some(r => r.status === 'Reading')
    const writerActive = writers.some(w => w.status === 'Writing')
    setAlgorithm(WRITER_ALGORITHM)
    if (readersActive || writerActive) {
      setWriter(id, 'Waiting')
      setWriterQueue(prev => prev.includes(`W${id}`) ? prev : [...prev, `W${id}`])
      setAlgorithmIndex(1)
      setStepTitle(`W${id} waits`)
      setExplanation('Writer needs exclusive access. Since readers or another writer are active, it waits.')
      setAlgorithmText('writer waits at wait(rw_mutex)')
      log(`W${id} arrived and waits.`)
      return
    }
    setWriter(id, 'Writing', Math.floor(Math.random() * 3) + 2)
    setWriterQueue(prev => prev.filter(x => x !== `W${id}`))
    setSharedData(prev => prev + 10)
    setAlgorithmIndex(2)
    setStepTitle(`${fromQueue ? 'Queued writer' : 'Writer'} W${id} writes`)
    setExplanation(`W${id} got exclusive access and updated shared data. No reader or writer can access during writing.`)
    setAlgorithmText('wait(rw_mutex) → write_data → signal(rw_mutex)')
    log(`W${id} started writing. Shared data +10.`)
  }

  function finishOneTick() {
    let finished = []
    setReaders(prev => prev.map(r => {
      if (r.status !== 'Reading') return r
      const remaining = r.remaining - 1
      if (remaining <= 0) { finished.push(`${r.name} finished reading.`); return { ...r, status: 'Idle', remaining: 0 } }
      return { ...r, remaining }
    }))
    setWriters(prev => prev.map(w => {
      if (w.status !== 'Writing') return w
      const remaining = w.remaining - 1
      if (remaining <= 0) { finished.push(`${w.name} finished writing.`); return { ...w, status: 'Idle', remaining: 0 } }
      return { ...w, remaining }
    }))
    finished.forEach(log)
  }

  function dispatchQueues() {
    const noReaders = activeReaders === 0
    const noWriter = !activeWriter
    if (noReaders && noWriter && writerQueue.length > 0) {
      startWriter(Number(writerQueue[0].replace('W', '')), true)
      return true
    }
    if (noWriter && (!fairMode || writerQueue.length === 0) && readerQueue.length > 0) {
      readerQueue.forEach(name => startReader(Number(name.replace('R', '')), true))
      return true
    }
    return false
  }

  function nextStep() {
    finishOneTick()
    if (dispatchQueues()) return
    if (Math.random() < 0.6) startReader(randomId(READER_COUNT))
    else startWriter(randomId(WRITER_COUNT))
  }

  useEffect(() => {
    if (!running || paused || mode !== 'auto') return
    const timer = setInterval(nextStep, speed)
    return () => clearInterval(timer)
  }, [running, paused, mode, speed, readers, writers, readerQueue, writerQueue, fairMode])

  function reset() {
    setRunning(false); setPaused(false); setReaders(makeReaders()); setWriters(makeWriters()); setReaderQueue([]); setWriterQueue([]); setSharedData(100); setAlgorithm(READER_ALGORITHM); setAlgorithmIndex(0); setStepTitle('Ready'); setExplanation('Press Start. Reader or writer arrival is random, not sequential.'); setAlgorithmText('Dynamic scheduler randomly selects reader or writer.'); setLogs([])
  }

  function buildReport() { return [`Dynamic Readers-Writers Report`, `read_count=${activeReaders}`, `rw_mutex=${rwLocked ? 'locked' : 'free'}`, `Reader Queue=${readerQueue.join(', ') || 'empty'}`, `Writer Queue=${writerQueue.join(', ') || 'empty'}`, `Current=${stepTitle}`, '', ...logs.slice(0, 25)].join('\n') }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard title="Readers-Writers Problem — Dynamic Version" subtitle="Readers and writers arrive randomly. Multiple readers can read together; writer access is exclusive." right={<ExportButtons title="readers-writers-dynamic-report" textBuilder={buildReport} />}>
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <ControlButtons running={running} paused={paused} mode={mode} speed={speed} onModeChange={v => { setMode(v); if (v === 'manual') setPaused(true) }} onSpeedChange={setSpeed} onStart={() => { setRunning(true); setPaused(mode === 'manual'); log(`Started in ${mode} mode.`) }} onPause={() => setPaused(true)} onResume={() => mode === 'auto' && setPaused(false)} onStop={() => { setRunning(false); setPaused(false) }} onReset={reset} onStep={nextStep} />
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">Fair Mode<select value={fairMode ? 'on' : 'off'} onChange={e => setFairMode(e.target.value === 'on')} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 outline-none"><option value="on">On</option><option value="off">Off</option></select></label>
        </div>



        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">Scheduler</p><p className="mt-1 text-xl font-black text-cyan-200">Random R/W</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">read_count</p><p className="mt-1 text-xl font-black text-emerald-200">{activeReaders}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">rw_mutex</p><p className={`mt-1 flex items-center gap-2 text-xl font-black ${rwLocked ? 'text-rose-300' : 'text-emerald-300'}`}>{rwLocked ? <Lock size={18} /> : <Unlock size={18} />}{rwLocked ? 'locked' : 'free'}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">Shared Data</p><p className="mt-1 text-xl font-black text-cyan-200">{sharedData}</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><div className="mb-4 flex items-center gap-2"><BookOpen className="text-emerald-300" /><h3 className="text-lg font-bold">Random Readers</h3></div><div className="grid gap-3 sm:grid-cols-2">{readers.map(r => <div key={r.id} className={`rounded-2xl border p-4 text-center ${r.status === 'Reading' ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100 animate-pulse-soft' : r.status === 'Waiting' ? 'border-amber-400 bg-amber-400/15 text-amber-100' : 'border-slate-700 bg-slate-900 text-slate-300'}`}><p className="text-lg font-black">{r.name}</p><p className="mt-1 text-xs">{r.status}</p>{r.remaining > 0 && <p className="mt-1 text-xs text-slate-500">remaining: {r.remaining}</p>}</div>)}</div></div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><div className="mb-4 flex items-center gap-2"><Edit3 className="text-rose-300" /><h3 className="text-lg font-bold">Random Writers</h3></div><div className="grid gap-3">{writers.map(w => <div key={w.id} className={`rounded-2xl border p-4 text-center ${w.status === 'Writing' ? 'border-rose-400 bg-rose-400/15 text-rose-100 animate-pulse-soft' : w.status === 'Waiting' ? 'border-amber-400 bg-amber-400/15 text-amber-100' : 'border-slate-700 bg-slate-900 text-slate-300'}`}><p className="text-lg font-black">{w.name}</p><p className="mt-1 text-xs">{w.status}</p>{w.remaining > 0 && <p className="mt-1 text-xs text-slate-500">remaining: {w.remaining}</p>}</div>)}</div></div>
        </div>
      </SectionCard>
      <div className="space-y-6"><StepExplanation stepTitle={stepTitle} explanation={explanation} algorithm={algorithmText} /><AlgorithmPanel title="Current Algorithm Path" steps={algorithm} currentIndex={algorithmIndex} /><QueuePanel queues={[{ label: 'Reader Waiting Queue', items: readerQueue }, { label: 'Writer Waiting Queue', items: writerQueue }]} /><PropertiesPanel items={[{ label: 'Readers', value: READER_COUNT, color: 'text-emerald-300' }, { label: 'Writers', value: WRITER_COUNT, color: 'text-rose-300' }, { label: 'read_count', value: activeReaders, color: 'text-emerald-300' }, { label: 'active writer', value: activeWriter ? activeWriter.name : 'None', color: activeWriter ? 'text-rose-300' : 'text-slate-100' }, { label: 'fair mode', value: fairMode ? 'On' : 'Off', color: fairMode ? 'text-cyan-300' : 'text-amber-300' }, { label: 'waiting total', value: readerQueue.length + writerQueue.length, color: 'text-amber-300' }]} /><InfoBox title="Teacher Feedback Fixed" items={['Reader/writer arrival is random.', 'Multiple readers can read together.', 'Writer gets exclusive access.', 'Fair mode can reduce writer starvation.']} /><UILabelsPanel items={[{ label: 'Random Arrival', description: 'Any reader or writer can arrive in any order.' }, { label: 'Multiple Readers', description: 'Several readers can be Reading together.' }, { label: 'Writer Exclusive Access', description: 'When writer writes, readers and other writers wait.' }]} /><Legend items={[{ label: 'Green: reader reading', className: 'border-emerald-400 bg-emerald-400/40' }, { label: 'Red: writer writing', className: 'border-rose-400 bg-rose-400/40' }, { label: 'Yellow: waiting', className: 'border-amber-400 bg-amber-400/40' }]} /><LogPanel logs={logs} /></div>
    </div>
  )
}
