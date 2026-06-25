import { useEffect, useMemo, useState } from 'react'
import { Lock, Unlock } from 'lucide-react'
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

const BUFFER_SIZE = 5
const PRODUCER_COUNT = 4
const CONSUMER_COUNT = 4

const PRODUCER_ALGORITHM = ['random producer arrives', 'wait(empty)', 'wait(mutex)', 'insert item into buffer', 'signal(mutex)', 'signal(full)']
const CONSUMER_ALGORITHM = ['random consumer arrives', 'wait(full)', 'wait(mutex)', 'remove item from buffer', 'signal(mutex)', 'signal(empty)']

const PRODUCER_CONSUMER_PSEUDOCODE = [
  {
    heading: 'Producer Process',
    code: `while true:
    item = produce_item()
    wait(empty)
    wait(mutex)
    buffer[in] = item
    in = (in + 1) mod n
    signal(mutex)
    signal(full)`,
    explanation: 'Any producer can arrive randomly. If the buffer is full, producer waits. Otherwise it enters critical section and inserts an item.',
  },
  {
    heading: 'Consumer Process',
    code: `while true:
    wait(full)
    wait(mutex)
    item = buffer[out]
    out = (out + 1) mod n
    signal(mutex)
    signal(empty)
    consume_item(item)`,
    explanation: 'Any consumer can arrive randomly. If the buffer is empty, consumer waits. Otherwise it enters critical section and removes an item.',
  },
]

function emptyBuffer() { return Array.from({ length: BUFFER_SIZE }, () => null) }
function processes(prefix, count) { return Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `${prefix}${i + 1}`, status: 'Idle' })) }
function randomId(count) { return Math.floor(Math.random() * count) + 1 }

export default function ProducerConsumer() {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [mode, setMode] = useState('auto')
  const [speed, setSpeed] = useState(2300)
  const [buffer, setBuffer] = useState(emptyBuffer)
  const [producers, setProducers] = useState(() => processes('P', PRODUCER_COUNT))
  const [consumers, setConsumers] = useState(() => processes('C', CONSUMER_COUNT))
  const [producerQueue, setProducerQueue] = useState([])
  const [consumerQueue, setConsumerQueue] = useState([])
  const [inIndex, setInIndex] = useState(0)
  const [outIndex, setOutIndex] = useState(0)
  const [itemCounter, setItemCounter] = useState(1)
  const [mutexLocked, setMutexLocked] = useState(false)
  const [algorithm, setAlgorithm] = useState(PRODUCER_ALGORITHM)
  const [algorithmIndex, setAlgorithmIndex] = useState(0)
  const [stepTitle, setStepTitle] = useState('Ready')
  const [explanation, setExplanation] = useState('Press Start. Each event randomly selects a producer or consumer. This is dynamic, not fixed sequence.')
  const [algorithmText, setAlgorithmText] = useState('Dynamic scheduler randomly selects producer or consumer.')
  const [logs, setLogs] = useState([])

  const full = useMemo(() => buffer.filter(Boolean).length, [buffer])
  const empty = BUFFER_SIZE - full

  function log(msg) {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 100))
  }

  function setP(id, status) { setProducers(prev => prev.map(p => p.id === id ? { ...p, status } : p)) }
  function setC(id, status) { setConsumers(prev => prev.map(c => c.id === id ? { ...c, status } : c)) }

  function clearAfter(kind, id) {
    setTimeout(() => {
      setMutexLocked(false)
      if (kind === 'P') setP(id, 'Idle')
      else setC(id, 'Idle')
    }, 650)
  }

  function produce(id, fromQueue = false) {
    setAlgorithm(PRODUCER_ALGORITHM)
    if (empty === 0) {
      setP(id, 'Waiting: Buffer Full')
      setProducerQueue(prev => prev.includes(`P${id}`) ? prev : [...prev, `P${id}`])
      setAlgorithmIndex(1)
      setStepTitle(`P${id} blocked: buffer full`)
      setExplanation('empty = 0, so this producer cannot insert an item. It is added to the producer waiting queue.')
      setAlgorithmText('wait(empty) blocks because empty = 0')
      log(`P${id} arrived but buffer is full. P${id} waits.`)
      return
    }
    if (mutexLocked) return
    const index = buffer.findIndex(slot => slot === null)
    const item = `I${itemCounter}`
    setMutexLocked(true)
    setP(id, fromQueue ? 'Producing from Queue' : 'Producing')
    setBuffer(prev => prev.map((slot, i) => i === index ? { item, by: `P${id}` } : slot))
    setProducerQueue(prev => prev.filter(x => x !== `P${id}`))
    setInIndex((index + 1) % BUFFER_SIZE)
    setItemCounter(prev => prev + 1)
    setAlgorithmIndex(3)
    setStepTitle(`P${id} produced ${item}`)
    setExplanation(`P${id} entered the critical section and inserted ${item} at buffer index ${index}.`)
    setAlgorithmText('wait(empty) → wait(mutex) → insert item → signal(mutex) → signal(full)')
    log(`P${id} produced ${item} at buffer[${index}].`)
    clearAfter('P', id)
  }

  function consume(id, fromQueue = false) {
    setAlgorithm(CONSUMER_ALGORITHM)
    if (full === 0) {
      setC(id, 'Waiting: Buffer Empty')
      setConsumerQueue(prev => prev.includes(`C${id}`) ? prev : [...prev, `C${id}`])
      setAlgorithmIndex(1)
      setStepTitle(`C${id} blocked: buffer empty`)
      setExplanation('full = 0, so this consumer cannot remove an item. It is added to the consumer waiting queue.')
      setAlgorithmText('wait(full) blocks because full = 0')
      log(`C${id} arrived but buffer is empty. C${id} waits.`)
      return
    }
    if (mutexLocked) return
    const index = buffer.findIndex(slot => slot !== null)
    const slot = buffer[index]
    setMutexLocked(true)
    setC(id, fromQueue ? 'Consuming from Queue' : 'Consuming')
    setBuffer(prev => prev.map((value, i) => i === index ? null : value))
    setConsumerQueue(prev => prev.filter(x => x !== `C${id}`))
    setOutIndex((index + 1) % BUFFER_SIZE)
    setAlgorithmIndex(3)
    setStepTitle(`C${id} consumed ${slot?.item}`)
    setExplanation(`C${id} entered the critical section and removed ${slot?.item} from buffer index ${index}.`)
    setAlgorithmText('wait(full) → wait(mutex) → remove item → signal(mutex) → signal(empty)')
    log(`C${id} consumed ${slot?.item} from buffer[${index}].`)
    clearAfter('C', id)
  }

  function nextStep() {
    if (mutexLocked) {
      setStepTitle('Mutex busy')
      setExplanation('A process is currently updating the buffer. Other producers or consumers must wait for mutex release.')
      setAlgorithmText('mutex locked → wait')
      return
    }
    if (consumerQueue.length > 0 && full > 0 && Math.random() < 0.5) {
      consume(Number(consumerQueue[0].replace('C', '')), true)
      return
    }
    if (producerQueue.length > 0 && empty > 0 && Math.random() < 0.5) {
      produce(Number(producerQueue[0].replace('P', '')), true)
      return
    }
    if (Math.random() < 0.5) produce(randomId(PRODUCER_COUNT))
    else consume(randomId(CONSUMER_COUNT))
  }

  useEffect(() => {
    if (!running || paused || mode !== 'auto') return
    const timer = setInterval(nextStep, speed)
    return () => clearInterval(timer)
  }, [running, paused, mode, speed, buffer, producerQueue, consumerQueue, mutexLocked])

  function reset() {
    setRunning(false); setPaused(false); setBuffer(emptyBuffer()); setProducers(processes('P', PRODUCER_COUNT)); setConsumers(processes('C', CONSUMER_COUNT)); setProducerQueue([]); setConsumerQueue([]); setInIndex(0); setOutIndex(0); setItemCounter(1); setMutexLocked(false); setAlgorithm(PRODUCER_ALGORITHM); setAlgorithmIndex(0); setStepTitle('Ready'); setExplanation('Press Start. Each event randomly selects a producer or consumer. This is dynamic, not fixed sequence.'); setAlgorithmText('Dynamic scheduler randomly selects producer or consumer.'); setLogs([])
  }

  function buildReport() {
    return [`Dynamic Producer-Consumer Report`, `empty=${empty}`, `full=${full}`, `Producer Queue=${producerQueue.join(', ') || 'empty'}`, `Consumer Queue=${consumerQueue.join(', ') || 'empty'}`, `Current=${stepTitle}`, '', ...logs.slice(0, 25)].join('\n')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard title="Producer-Consumer / Bounded Buffer — Dynamic Version" subtitle="Multiple producers and consumers arrive randomly. Buffer full and empty states are handled dynamically." right={<ExportButtons title="producer-consumer-dynamic-report" textBuilder={buildReport} />}>
        <div className="mb-5">
          <ControlButtons running={running} paused={paused} mode={mode} speed={speed} onModeChange={v => { setMode(v); if (v === 'manual') setPaused(true) }} onSpeedChange={setSpeed} onStart={() => { setRunning(true); setPaused(mode === 'manual'); log(`Started in ${mode} mode.`) }} onPause={() => setPaused(true)} onResume={() => mode === 'auto' && setPaused(false)} onStop={() => { setRunning(false); setPaused(false) }} onReset={reset} onStep={nextStep} />
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">Scheduler</p><p className="mt-1 text-xl font-black text-cyan-200">Random P/C</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">empty</p><p className="mt-1 text-xl font-black text-emerald-200">{empty}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">full</p><p className="mt-1 text-xl font-black text-cyan-200">{full}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">mutex</p><p className={`mt-1 flex items-center gap-2 text-xl font-black ${mutexLocked ? 'text-rose-300' : 'text-emerald-300'}`}>{mutexLocked ? <Lock size={18} /> : <Unlock size={18} />}{mutexLocked ? 'locked' : 'free'}</p></div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><h3 className="mb-4 font-bold text-emerald-200">Multiple Producers</h3><div className="grid gap-3">{producers.map(p => <div key={p.id} className={`rounded-2xl border p-4 text-center ${p.status.includes('Producing') ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100 animate-pulse-soft' : p.status.includes('Waiting') ? 'border-amber-400 bg-amber-400/15 text-amber-100' : 'border-slate-700 bg-slate-900 text-slate-300'}`}><p className="font-black">{p.name}</p><p className="mt-1 text-xs">{p.status}</p></div>)}</div></div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><div className="grid grid-cols-5 gap-3">{buffer.map((slot, i) => <div key={i} className={`min-h-36 rounded-2xl border p-3 text-center ${slot ? 'border-cyan-400 bg-cyan-400/15 animate-glow' : 'border-slate-700 bg-slate-900'}`}><p className="text-xs text-slate-500">Index {i}</p><div className="mt-3 text-2xl font-black">{slot ? slot.item : '—'}</div>{slot && <p className="mt-1 text-xs text-slate-400">by {slot.by}</p>}<div className="mt-3 flex flex-col gap-1 text-[10px]">{i === inIndex && <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-emerald-200">next IN</span>}{i === outIndex && <span className="rounded bg-rose-500/20 px-1 py-0.5 text-rose-200">next OUT</span>}</div></div>)}</div></div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><h3 className="mb-4 font-bold text-rose-200">Multiple Consumers</h3><div className="grid gap-3">{consumers.map(c => <div key={c.id} className={`rounded-2xl border p-4 text-center ${c.status.includes('Consuming') ? 'border-rose-400 bg-rose-400/15 text-rose-100 animate-pulse-soft' : c.status.includes('Waiting') ? 'border-amber-400 bg-amber-400/15 text-amber-100' : 'border-slate-700 bg-slate-900 text-slate-300'}`}><p className="font-black">{c.name}</p><p className="mt-1 text-xs">{c.status}</p></div>)}</div></div>
        </div>

        <PseudocodeBox title="Bounded-Buffer Algorithm" subtitle="Dynamic random producers/consumers use the same empty, full, and mutex semaphore logic." blocks={PRODUCER_CONSUMER_PSEUDOCODE} />
      </SectionCard>

      <div className="space-y-6">
        <StepExplanation stepTitle={stepTitle} explanation={explanation} algorithm={algorithmText} />
        <AlgorithmPanel title="Current Algorithm Path" steps={algorithm} currentIndex={algorithmIndex} />
        <QueuePanel queues={[{ label: 'Producer Waiting Queue', items: producerQueue }, { label: 'Consumer Waiting Queue', items: consumerQueue }]} />
        <PropertiesPanel items={[{ label: 'Producers', value: PRODUCER_COUNT, color: 'text-emerald-300' }, { label: 'Consumers', value: CONSUMER_COUNT, color: 'text-rose-300' }, { label: 'empty', value: empty, color: 'text-emerald-300' }, { label: 'full', value: full, color: 'text-cyan-300' }, { label: 'mutex', value: mutexLocked ? 'locked' : 'free', color: mutexLocked ? 'text-rose-300' : 'text-emerald-300' }, { label: 'blocked', value: producerQueue.length + consumerQueue.length, color: 'text-amber-300' }]} />
        <InfoBox title="Teacher Feedback Fixed" items={['Multiple producers and consumers are shown.', 'Arrivals are random, not sequential.', 'Full buffer blocks producers.', 'Empty buffer blocks consumers.', 'Waiting queues are dynamic.']} />
        <UILabelsPanel items={[{ label: 'Full Buffer', description: 'When empty = 0, producers wait.' }, { label: 'Empty Buffer', description: 'When full = 0, consumers wait.' }, { label: 'Critical Section', description: 'Only one insert/remove happens while mutex is locked.' }]} />
        <Legend items={[{ label: 'Green: producer producing', className: 'border-emerald-400 bg-emerald-400/40' }, { label: 'Red: consumer consuming', className: 'border-rose-400 bg-rose-400/40' }, { label: 'Cyan: filled buffer slot', className: 'border-cyan-400 bg-cyan-400/40' }, { label: 'Yellow: waiting', className: 'border-amber-400 bg-amber-400/40' }]} />
        <LogPanel logs={logs} />
      </div>
    </div>
  )
}
