import { useEffect, useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
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

const N = 5
const DYNAMIC_ALGORITHM = ['random philosopher becomes hungry', 'check left chopstick', 'check right chopstick', 'if both free acquire both', 'eat', 'release both chopsticks', 'check waiting philosophers']
const UNSAFE_ALGORITHM = ['all philosophers pick left chopstick', 'all wait for right chopstick', 'circular waiting appears', 'deadlock risk demonstrated']

const DINING_PHILOSOPHERS_PSEUDOCODE = [
  { heading: 'Chapter Semaphore Algorithm', code: `while true:
    think()
    wait(chopstick[i])
    wait(chopstick[(i + 1) mod 5])
    eat()
    signal(chopstick[i])
    signal(chopstick[(i + 1) mod 5])`, explanation: 'The chapter uses chopstick[5]. Each philosopher needs two chopsticks. This simple algorithm may cause deadlock.' },
  { heading: 'Dynamic Try-Eat Logic Used in App', code: `tryEat(i):
    left  = i
    right = (i + 1) mod 5
    if chopstick[left] is free
       and chopstick[right] is free:
        acquire both chopsticks
        state[i] = EATING
    else:
        state[i] = HUNGRY / WAITING`, explanation: 'Any philosopher can be selected randomly. Multiple non-neighbor philosophers may eat together if their chopsticks are free.' },
]

const philosopherPositions = [{ x: 50, y: 5 }, { x: 90, y: 35 }, { x: 75, y: 82 }, { x: 25, y: 82 }, { x: 10, y: 35 }]
const chopstickPositions = [{ x: 72, y: 20 }, { x: 82, y: 62 }, { x: 50, y: 92 }, { x: 18, y: 62 }, { x: 28, y: 20 }]

function makePhilosophers() { return Array.from({ length: N }, (_, i) => ({ id: i, name: `P${i + 1}`, status: 'Thinking', remaining: 0 })) }
function makeChopsticks() { return Array.from({ length: N }, (_, i) => ({ id: i, owner: null })) }
function randomId() { return Math.floor(Math.random() * N) }
const leftOf = id => id
const rightOf = id => (id + 1) % N

export default function DiningPhilosophers() {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [mode, setMode] = useState('auto')
  const [speed, setSpeed] = useState(2300)
  const [demoMode, setDemoMode] = useState('dynamic')
  const [philosophers, setPhilosophers] = useState(makePhilosophers)
  const [chopsticks, setChopsticks] = useState(makeChopsticks)
  const [waitingQueue, setWaitingQueue] = useState([])
  const [currentPhilosopher, setCurrentPhilosopher] = useState(0)
  const [algorithmIndex, setAlgorithmIndex] = useState(0)
  const [stepTitle, setStepTitle] = useState('Ready')
  const [explanation, setExplanation] = useState('Press Start. Any philosopher can become hungry randomly. Non-neighbor philosophers may eat together.')
  const [algorithmText, setAlgorithmText] = useState('Dynamic scheduler randomly selects a philosopher.')
  const [deadlockRisk, setDeadlockRisk] = useState('No')
  const [unsafePhase, setUnsafePhase] = useState(0)
  const [logs, setLogs] = useState([])

  const eatingCount = philosophers.filter(p => p.status === 'Eating').length
  const waitingCount = philosophers.filter(p => p.status === 'Hungry' || p.status === 'Waiting').length
  const chopsticksInUse = chopsticks.filter(c => c.owner !== null).length

  function log(msg) { setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 100)) }
  function bothFree(id) { return chopsticks[leftOf(id)].owner === null && chopsticks[rightOf(id)].owner === null }
  function setP(id, status, remaining = 0) { setPhilosophers(prev => prev.map(p => p.id === id ? { ...p, status, remaining } : p)) }
  function acquire(id) { setChopsticks(prev => prev.map(c => (c.id === leftOf(id) || c.id === rightOf(id)) ? { ...c, owner: id } : c)) }
  function release(id) { setChopsticks(prev => prev.map(c => c.owner === id ? { ...c, owner: null } : c)) }

  function tryEat(id, fromQueue = false) {
    setCurrentPhilosopher(id)
    if (philosophers[id].status === 'Eating') { log(`P${id + 1} selected but already eating.`); return false }
    if (bothFree(id)) {
      acquire(id)
      setP(id, 'Eating', Math.floor(Math.random() * 3) + 2)
      setWaitingQueue(prev => prev.filter(x => x !== `P${id + 1}`))
      setAlgorithmIndex(4)
      setStepTitle(`${fromQueue ? 'Queued philosopher' : 'Philosopher'} P${id + 1} eats`)
      setExplanation(`P${id + 1} got both C${leftOf(id) + 1} and C${rightOf(id) + 1}. If another non-neighbor philosopher has free chopsticks, that philosopher can also eat.`)
      setAlgorithmText('both chopsticks free → acquire both → EATING')
      setDeadlockRisk('No')
      log(`P${id + 1} started eating using C${leftOf(id) + 1} and C${rightOf(id) + 1}.`)
      return true
    }
    setP(id, 'Waiting')
    setWaitingQueue(prev => prev.includes(`P${id + 1}`) ? prev : [...prev, `P${id + 1}`])
    setAlgorithmIndex(1)
    setStepTitle(`P${id + 1} waits for chopsticks`)
    setExplanation(`P${id + 1} needs C${leftOf(id) + 1} and C${rightOf(id) + 1}, but at least one is busy.`)
    setAlgorithmText('if one required chopstick is busy → WAITING')
    log(`P${id + 1} is hungry but required chopsticks are not free.`)
    return false
  }

  function finishEating() {
    const finished = []
    setPhilosophers(prev => prev.map(p => {
      if (p.status !== 'Eating') return p
      const remaining = p.remaining - 1
      if (remaining <= 0) { finished.push(p.id); return { ...p, status: 'Thinking', remaining: 0 } }
      return { ...p, remaining }
    }))
    finished.forEach(id => { release(id); log(`P${id + 1} finished eating and released C${leftOf(id) + 1}, C${rightOf(id) + 1}.`) })
  }

  function dispatchWaiting() {
    const shuffled = [...waitingQueue].sort(() => Math.random() - 0.5)
    const name = shuffled.find(item => bothFree(Number(item.replace('P', '')) - 1))
    if (!name) return false
    const id = Number(name.replace('P', '')) - 1
    return tryEat(id, true)
  }

  function dynamicStep() {
    finishEating()
    if (dispatchWaiting()) return
    tryEat(randomId())
  }

  function unsafeStep() {
    if (unsafePhase === 0) {
      setPhilosophers(makePhilosophers()); setChopsticks(makeChopsticks()); setWaitingQueue([]); setDeadlockRisk('No'); setStepTitle('Unsafe demo started'); setExplanation('This mode demonstrates the danger: everyone can pick the left chopstick first.'); setAlgorithmIndex(0); setAlgorithmText('unsafe algorithm starts'); log('Unsafe demo reset.')
    } else if (unsafePhase >= 1 && unsafePhase <= 5) {
      const id = unsafePhase - 1
      setCurrentPhilosopher(id)
      setP(id, 'Waiting')
      setChopsticks(prev => prev.map(c => c.id === id ? { ...c, owner: id } : c))
      setWaitingQueue(prev => prev.includes(`P${id + 1}`) ? prev : [...prev, `P${id + 1}`])
      setAlgorithmIndex(1)
      setStepTitle(`P${id + 1} picked left chopstick only`)
      setExplanation(`P${id + 1} holds C${id + 1} and waits for the right chopstick.`)
      setAlgorithmText('wait(chopstick[i]) then waits for second chopstick')
      log(`Unsafe: P${id + 1} picked C${id + 1}.`)
    } else {
      setDeadlockRisk('YES / Circular Waiting')
      setAlgorithmIndex(3)
      setStepTitle('Deadlock risk demonstrated')
      setExplanation('All philosophers hold one chopstick and wait for another. This creates circular waiting.')
      setAlgorithmText('circular wait → deadlock risk')
      log('Unsafe: circular waiting demonstrated.')
    }
    setUnsafePhase(prev => (prev + 1) % 7)
  }

  function nextStep() { demoMode === 'dynamic' ? dynamicStep() : unsafeStep() }

  useEffect(() => {
    if (!running || paused || mode !== 'auto') return
    const timer = setInterval(nextStep, speed)
    return () => clearInterval(timer)
  }, [running, paused, mode, speed, demoMode, philosophers, chopsticks, waitingQueue, unsafePhase])

  function reset() {
    setRunning(false); setPaused(false); setPhilosophers(makePhilosophers()); setChopsticks(makeChopsticks()); setWaitingQueue([]); setCurrentPhilosopher(0); setAlgorithmIndex(0); setStepTitle('Ready'); setExplanation('Press Start. Any philosopher can become hungry randomly. Non-neighbor philosophers may eat together.'); setAlgorithmText('Dynamic scheduler randomly selects a philosopher.'); setDeadlockRisk('No'); setUnsafePhase(0); setLogs([])
  }

  function buildReport() { return [`Dynamic Dining Philosophers Report`, `Mode=${demoMode}`, `Eating=${eatingCount}`, `Waiting=${waitingCount}`, `Chopsticks in use=${chopsticksInUse}`, `Deadlock Risk=${deadlockRisk}`, `Queue=${waitingQueue.join(', ') || 'empty'}`, `Current=${stepTitle}`, '', ...logs.slice(0, 25)].join('\n') }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard title="Dining Philosophers — Dynamic Chopstick Version" subtitle="Uses chopstick[5]. Any philosopher can be selected randomly. Multiple non-neighbor philosophers can eat together." right={<ExportButtons title="dining-philosophers-dynamic-report" textBuilder={buildReport} />}>
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <ControlButtons running={running} paused={paused} mode={mode} speed={speed} onModeChange={v => { setMode(v); if (v === 'manual') setPaused(true) }} onSpeedChange={setSpeed} onStart={() => { setRunning(true); setPaused(mode === 'manual'); log(`Started ${demoMode} mode.`) }} onPause={() => setPaused(true)} onResume={() => mode === 'auto' && setPaused(false)} onStop={() => { setRunning(false); setPaused(false) }} onReset={reset} onStep={nextStep} />
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">Demo Mode<select value={demoMode} onChange={e => { setDemoMode(e.target.value); reset() }} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 outline-none"><option value="dynamic">Dynamic Chopstick Mode</option><option value="unsafe">Unsafe Deadlock Demo</option></select></label>
        </div>

        

        <div className="mb-5 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">Resource</p><p className="mt-1 text-xl font-black text-cyan-200">Chopstick</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">Current Philosopher</p><p className="mt-1 text-xl font-black text-cyan-200">P{currentPhilosopher + 1}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">Eating Now</p><p className="mt-1 text-xl font-black text-emerald-200">{eatingCount}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">Chopsticks Used</p><p className="mt-1 text-xl font-black text-rose-200">{chopsticksInUse}</p></div>
          <div className={`rounded-2xl border p-4 ${deadlockRisk.includes('YES') ? 'border-rose-400 bg-rose-400/10' : 'border-slate-800 bg-slate-950'}`}><p className="text-xs text-slate-500">Deadlock Risk</p><p className={`mt-1 text-xl font-black ${deadlockRisk.includes('YES') ? 'text-rose-200' : 'text-emerald-200'}`}>{deadlockRisk}</p></div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <div className="mb-4 flex items-center gap-3">{demoMode === 'dynamic' ? <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-200"><ShieldCheck size={16} />DYNAMIC CHOPSTICK MODE</div> : <div className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-200"><AlertTriangle size={16} />UNSAFE DEADLOCK DEMO</div>}</div>
          <div className="relative mx-auto aspect-square max-w-[620px] rounded-full border border-slate-800 bg-slate-900">
            <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-center"><div><p className="text-lg font-black text-slate-100">Rice Bowl</p><p className="mt-1 text-xs text-slate-400">Shared Table</p><p className={`mt-1 text-xs ${demoMode === 'dynamic' ? 'text-emerald-300' : 'text-rose-300'}`}>{demoMode === 'dynamic' ? 'Random + multiple possible' : 'Circular waiting demo'}</p></div></div>
            {chopsticks.map(c => { const pos = chopstickPositions[c.id]; const used = c.owner !== null; return <div key={c.id} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-center text-xs font-bold ${used ? 'border-rose-400 bg-rose-400/20 text-rose-100 animate-pulse-soft' : 'border-slate-600 bg-slate-950 text-slate-300'}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }}><div>C{c.id + 1}</div>{used && <div className="mt-1 text-[10px]">P{c.owner + 1}</div>}</div> })}
            {philosophers.map(p => { const pos = philosopherPositions[p.id]; return <div key={p.id} className={`absolute flex h-24 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl border text-center shadow-xl ${p.status === 'Eating' ? 'border-emerald-400 bg-emerald-400/20 text-emerald-100 animate-pulse-soft' : p.status === 'Waiting' || p.status === 'Hungry' ? 'border-amber-400 bg-amber-400/20 text-amber-100 animate-pulse-soft' : 'border-slate-600 bg-slate-900 text-slate-200'}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }}><p className="text-xl font-black">{p.name}</p><p className="mt-1 text-xs font-semibold">{p.status}</p>{p.remaining > 0 && <p className="mt-1 text-[10px] text-slate-400">rem: {p.remaining}</p>}</div> })}
          </div>
        </div>

        <PseudocodeBox title="Dining Philosophers Algorithm" subtitle="This version uses chopsticks and random philosopher selection." blocks={DINING_PHILOSOPHERS_PSEUDOCODE} />
        
      </SectionCard>
      <div className="space-y-6"><StepExplanation stepTitle={stepTitle} explanation={explanation} algorithm={algorithmText} /><AlgorithmPanel title={demoMode === 'dynamic' ? 'Dynamic Chopstick Algorithm' : 'Unsafe Deadlock Demo'} steps={demoMode === 'dynamic' ? DYNAMIC_ALGORITHM : UNSAFE_ALGORITHM} currentIndex={algorithmIndex} /><QueuePanel queues={[{ label: 'Hungry / Waiting Philosopher Queue', items: waitingQueue }]} /><PropertiesPanel items={[{ label: 'philosophers', value: N }, { label: 'chopsticks', value: N, color: 'text-cyan-300' }, { label: 'eating together', value: eatingCount, color: 'text-emerald-300' }, { label: 'waiting', value: waitingCount, color: 'text-amber-300' }, { label: 'chopsticks in use', value: chopsticksInUse, color: 'text-rose-300' }, { label: 'deadlock risk', value: deadlockRisk, color: deadlockRisk.includes('YES') ? 'text-rose-300' : 'text-emerald-300' }]} /><InfoBox title="Teacher Feedback Fixed" items={['Uses chopstick terminology.', 'Philosophers are selected randomly.', 'Multiple non-neighbor philosophers can eat together.', 'A philosopher eats only if both chopsticks are free.', 'Unsafe deadlock demo still exists.']} /><UILabelsPanel items={[{ label: 'Chopstick', description: 'Each chopstick is a shared resource used by two neighboring philosophers.' }, { label: 'Multiple Eating', description: 'P1 and P3 can eat together if their chopsticks do not conflict.' }, { label: 'No Fixed Order', description: 'Any philosopher can be selected by the random scheduler.' }]} /><Legend items={[{ label: 'Green: eating', className: 'border-emerald-400 bg-emerald-400/40' }, { label: 'Red: chopstick in use', className: 'border-rose-400 bg-rose-400/40' }, { label: 'Yellow: waiting', className: 'border-amber-400 bg-amber-400/40' }]} /><LogPanel logs={logs} /></div>
    </div>
  )
}
