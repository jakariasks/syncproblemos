import { useEffect, useRef, useState } from 'react'
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

const N = 5

function initialPhilosophers() {
  return Array.from({ length: N }, (_, index) => ({
    id: index,
    status: 'Thinking',
  }))
}

function initialForks() {
  return Array.from({ length: N }, (_, index) => ({
    id: index,
    owner: null,
  }))
}

const SAFE_ALGORITHM = [
  'wait(room)',
  'wait(left fork)',
  'wait(right fork)',
  'eat',
  'signal(right fork)',
  'signal(left fork)',
  'signal(room)',
]

const UNSAFE_ALGORITHM = [
  'all philosophers pick left fork',
  'all philosophers wait for right fork',
  'circular waiting appears',
  'deadlock occurs / risk is shown',
]

const positions = [
  { x: 50, y: 5 },
  { x: 90, y: 35 },
  { x: 75, y: 82 },
  { x: 25, y: 82 },
  { x: 10, y: 35 },
]

const forkPositions = [
  { x: 72, y: 20 },
  { x: 82, y: 62 },
  { x: 50, y: 92 },
  { x: 18, y: 62 },
  { x: 28, y: 20 },
]

export default function DiningPhilosophers() {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [mode, setMode] = useState('auto')
  const [speed, setSpeed] = useState(3200)
  const [demoMode, setDemoMode] = useState('safe')

  const [philosophers, setPhilosophers] = useState(initialPhilosophers)
  const [forks, setForks] = useState(initialForks)
  const [roomCount, setRoomCount] = useState(4)
  const [currentPhilosopher, setCurrentPhilosopher] = useState(0)
  const [currentAlgorithmIndex, setCurrentAlgorithmIndex] = useState(0)
  const [stepTitle, setStepTitle] = useState('Ready')
  const [explanation, setExplanation] = useState('Press Start to begin the dining philosophers simulation.')
  const [algorithmText, setAlgorithmText] = useState('Choose Safe Mode or Unsafe Mode to visualize deadlock prevention.')
  const [waitingQueue, setWaitingQueue] = useState([])
  const [deadlockRisk, setDeadlockRisk] = useState('No')
  const [logs, setLogs] = useState([])

  const phaseRef = useRef(0)
  const philosopherRef = useRef(0)

  const forksInUse = forks.filter(fork => fork.owner !== null).length
  const eatingCount = philosophers.filter(philosopher => philosopher.status === 'Eating').length
  const hungryCount = philosophers.filter(philosopher => philosopher.status === 'Hungry' || philosopher.status === 'Waiting Right').length

  function addLog(message) {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 100))
  }

  function resetVisualState() {
    setPhilosophers(initialPhilosophers())
    setForks(initialForks())
    setRoomCount(4)
    setWaitingQueue([])
    setDeadlockRisk('No')
  }

  function setPhilosopherStatus(id, status) {
    setPhilosophers(prev => prev.map(philosopher => (
      philosopher.id === id ? { ...philosopher, status } : philosopher
    )))
  }

  function safeNextStep() {
    const phase = phaseRef.current % 5
    const id = philosopherRef.current
    const leftFork = id
    const rightFork = (id + 1) % N
    setCurrentPhilosopher(id)

    if (phase === 0) {
      resetVisualState()
      setRoomCount(3)
      setPhilosopherStatus(id, 'Hungry')
      setWaitingQueue([`Philosopher ${id + 1}`])
      setCurrentAlgorithmIndex(0)
      setStepTitle(`Philosopher ${id + 1} enters safe room`)
      setExplanation(`Room semaphore allows only 4 philosophers to compete. Philosopher ${id + 1} enters the room and becomes hungry.`)
      setAlgorithmText('wait(room)')
      addLog(`Safe mode: Philosopher ${id + 1} entered room. room = 3.`)
      return
    }

    if (phase === 1) {
      setForks(prev => prev.map(fork => (
        fork.id === leftFork ? { ...fork, owner: id } : fork
      )))
      setCurrentAlgorithmIndex(1)
      setStepTitle(`Philosopher ${id + 1} picks left fork`)
      setExplanation(`Philosopher ${id + 1} picked left fork F${leftFork + 1}.`)
      setAlgorithmText(`wait(fork[${leftFork}])`)
      addLog(`Safe mode: Philosopher ${id + 1} picked left fork F${leftFork + 1}.`)
      return
    }

    if (phase === 2) {
      setForks(prev => prev.map(fork => (
        fork.id === rightFork ? { ...fork, owner: id } : fork
      )))
      setCurrentAlgorithmIndex(2)
      setStepTitle(`Philosopher ${id + 1} picks right fork`)
      setExplanation(`Philosopher ${id + 1} picked right fork F${rightFork + 1}. Now it has both forks.`)
      setAlgorithmText(`wait(fork[${rightFork}])`)
      addLog(`Safe mode: Philosopher ${id + 1} picked right fork F${rightFork + 1}.`)
      return
    }

    if (phase === 3) {
      setPhilosopherStatus(id, 'Eating')
      setWaitingQueue([])
      setCurrentAlgorithmIndex(3)
      setStepTitle(`Philosopher ${id + 1} eats safely`)
      setExplanation('A philosopher can eat only after acquiring both forks. In safe mode, circular waiting is prevented.')
      setAlgorithmText('eat()')
      addLog(`Safe mode: Philosopher ${id + 1} is eating.`)
      return
    }

    if (phase === 4) {
      setForks(initialForks())
      setPhilosophers(initialPhilosophers())
      setRoomCount(4)
      setCurrentAlgorithmIndex(6)
      setStepTitle(`Philosopher ${id + 1} releases resources`)
      setExplanation('The philosopher releases both forks and leaves the room. Deadlock is prevented.')
      setAlgorithmText('signal(right fork) → signal(left fork) → signal(room)')
      addLog(`Safe mode: Philosopher ${id + 1} released forks and room.`)
      philosopherRef.current = (philosopherRef.current + 1) % N
      return
    }
  }

  function unsafeNextStep() {
    const phase = phaseRef.current % 7

    if (phase === 0) {
      resetVisualState()
      setCurrentAlgorithmIndex(0)
      setStepTitle('Unsafe mode starts')
      setExplanation('In unsafe mode, every philosopher may try to pick the left fork first. This can cause deadlock.')
      setAlgorithmText('all philosophers start competing')
      addLog('Unsafe mode: all philosophers are thinking and preparing to pick forks.')
      return
    }

    if (phase >= 1 && phase <= 5) {
      const id = phase - 1
      setCurrentPhilosopher(id)
      setPhilosopherStatus(id, 'Waiting Right')
      setForks(prev => prev.map(fork => (
        fork.id === id ? { ...fork, owner: id } : fork
      )))
      setWaitingQueue(Array.from({ length: phase }, (_, index) => `Philosopher ${index + 1}`))
      setCurrentAlgorithmIndex(0)
      setStepTitle(`Philosopher ${id + 1} picked only left fork`)
      setExplanation(`Philosopher ${id + 1} holds left fork F${id + 1} and waits for the right fork. This increases circular waiting risk.`)
      setAlgorithmText('pick left fork only')
      addLog(`Unsafe mode: Philosopher ${id + 1} picked left fork F${id + 1} and is now waiting for the right fork.`)
      return
    }

    if (phase === 6) {
      setPhilosophers(prev => prev.map(philosopher => ({ ...philosopher, status: 'Waiting Right' })))
      setWaitingQueue(['Philosopher 1', 'Philosopher 2', 'Philosopher 3', 'Philosopher 4', 'Philosopher 5'])
      setCurrentAlgorithmIndex(3)
      setDeadlockRisk('YES / Deadlock Demonstrated')
      setStepTitle('Deadlock Risk / Deadlock Demonstration')
      setExplanation('Now each philosopher holds one left fork and waits for the right fork. This creates circular waiting, which is a deadlock situation.')
      setAlgorithmText('circular waiting → deadlock')
      addLog('Unsafe mode: all philosophers are waiting for right forks. Deadlock has occurred / been demonstrated.')
      return
    }
  }

  function nextStep() {
    if (demoMode === 'safe') {
      safeNextStep()
      phaseRef.current = (phaseRef.current + 1) % 5
    } else {
      unsafeNextStep()
      phaseRef.current = (phaseRef.current + 1) % 7
    }
  }

  useEffect(() => {
    if (!running || paused || mode !== 'auto') return
    const timer = setInterval(nextStep, speed)
    return () => clearInterval(timer)
  }, [running, paused, mode, speed, demoMode])

  function reset() {
    setRunning(false)
    setPaused(false)
    resetVisualState()
    setCurrentPhilosopher(0)
    setCurrentAlgorithmIndex(0)
    setStepTitle('Ready')
    setExplanation('Press Start to begin the dining philosophers simulation.')
    setAlgorithmText('Choose Safe Mode or Unsafe Mode to visualize deadlock prevention.')
    setLogs([])
    phaseRef.current = 0
    philosopherRef.current = 0
  }

  function buildReport() {
    return [
      'PROCESS SYNCHRONIZATION VISUALIZER REPORT',
      'Problem: Dining Philosophers',
      '',
      `Mode: ${mode}`,
      `Demo Mode: ${demoMode}`,
      `Room semaphore: ${roomCount}`,
      `Forks in use: ${forksInUse}`,
      `Deadlock risk: ${deadlockRisk}`,
      `Current step: ${stepTitle}`,
      `Explanation: ${explanation}`,
      `Waiting queue: ${waitingQueue.join(', ') || 'empty'}`,
      '',
      'Theory:',
      'Each philosopher needs both forks to eat. Unsafe mode demonstrates circular waiting and deadlock. Safe mode uses a room semaphore of N-1 to prevent deadlock.',
      '',
      'Recent Logs:',
      ...logs.slice(0, 20),
    ].join('\n')
  }

  const currentAlgorithm = demoMode === 'safe' ? SAFE_ALGORITHM : UNSAFE_ALGORITHM

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard
        title="Dining Philosophers Problem"
        subtitle="Safe mode prevents deadlock. Unsafe mode demonstrates deadlock risk clearly for viva and presentation."
        right={<ExportButtons title="dining-philosophers-report" textBuilder={buildReport} />}
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ControlButtons
            running={running}
            paused={paused}
            mode={mode}
            speed={speed}
            onModeChange={value => {
              setMode(value)
              if (value === 'manual') {
                setPaused(true)
              }
            }}
            onSpeedChange={setSpeed}
            onStart={() => {
              setRunning(true)
              setPaused(mode === 'manual')
              addLog(`Dining Philosophers simulation started in ${mode} mode (${demoMode} demo).`)
            }}
            onPause={() => {
              setPaused(true)
              addLog('Simulation paused.')
            }}
            onResume={() => {
              if (mode === 'auto') {
                setPaused(false)
                addLog('Simulation resumed.')
              }
            }}
            onStop={() => {
              setRunning(false)
              setPaused(false)
              addLog('Simulation stopped.')
            }}
            onReset={reset}
            onStep={nextStep}
          />

          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">
            Demo Mode
            <select
              value={demoMode}
              onChange={event => {
                setDemoMode(event.target.value)
                reset()
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 outline-none"
            >
              <option value="safe">Safe Mode</option>
              <option value="unsafe">Unsafe Mode</option>
            </select>
          </label>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Shared Resource</p>
            <p className="mt-1 text-xl font-black text-cyan-200">Forks</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Critical Section</p>
            <p className="mt-1 text-xl font-black text-amber-200">{forksInUse > 0 ? 'Fork Acquisition / Eating' : 'Free'}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Blocked State</p>
            <p className="mt-1 text-xl font-black text-rose-200">{waitingQueue.length > 0 ? 'Yes' : 'No'}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Safe State</p>
            <p className={`mt-1 text-xl font-black ${demoMode === 'safe' ? 'text-emerald-200' : 'text-amber-200'}`}>
              {demoMode === 'safe' ? 'Yes' : 'No'}
            </p>
          </div>
          <div className={`rounded-2xl border p-4 ${deadlockRisk.includes('YES') ? 'border-rose-400 bg-rose-400/10' : 'border-slate-800 bg-slate-950'}`}>
            <p className="text-xs text-slate-500">Deadlock Risk</p>
            <p className={`mt-1 text-xl font-black ${deadlockRisk.includes('YES') ? 'text-rose-200' : 'text-emerald-200'}`}>
              {deadlockRisk}
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            current philosopher = <b className="text-cyan-300">P{currentPhilosopher + 1}</b>
          </span>
          <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            room semaphore = <b className="text-cyan-300">{roomCount}</b>
          </span>
          <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            forks in use = <b className="text-rose-300">{forksInUse}</b>
          </span>
          <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            hungry/waiting = <b className="text-amber-300">{hungryCount}</b>
          </span>
          <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            eating = <b className="text-emerald-300">{eatingCount}</b>
          </span>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <div className="mb-4 flex items-center gap-3">
            {demoMode === 'safe' ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-200">
                <ShieldCheck size={16} />
                SAFE MODE
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-200">
                <AlertTriangle size={16} />
                UNSAFE MODE
              </div>
            )}
          </div>

          <div className="relative mx-auto aspect-square max-w-[620px] rounded-full border border-slate-800 bg-slate-900">
            <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-center">
              <div>
                <p className="text-lg font-black text-slate-100">Table</p>
                <p className="mt-1 text-xs text-slate-400">
                  {demoMode === 'safe' ? 'Room = N - 1' : 'All may compete'}
                </p>
                <p className={`mt-1 text-xs ${demoMode === 'safe' ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {demoMode === 'safe' ? 'Deadlock prevented' : 'Deadlock risk shown'}
                </p>
              </div>
            </div>

            {forks.map(fork => {
              const pos = forkPositions[fork.id]
              const inUse = fork.owner !== null

              return (
                <div
                  key={fork.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-center text-xs font-bold transition ${
                    inUse
                      ? 'border-rose-400 bg-rose-400/20 text-rose-100 animate-pulse-soft'
                      : 'border-slate-600 bg-slate-950 text-slate-300'
                  }`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div>F{fork.id + 1}</div>
                  {inUse && <div className="mt-1 text-[10px]">P{fork.owner + 1}</div>}
                </div>
              )
            })}

            {philosophers.map(philosopher => {
              const pos = positions[philosopher.id]

              return (
                <div
                  key={philosopher.id}
                  className={`absolute flex h-24 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl border text-center shadow-xl transition ${
                    philosopher.status === 'Eating'
                      ? 'border-emerald-400 bg-emerald-400/20 text-emerald-100 animate-pulse-soft'
                      : philosopher.status === 'Hungry' || philosopher.status === 'Waiting Right'
                        ? 'border-amber-400 bg-amber-400/20 text-amber-100 animate-pulse-soft'
                        : 'border-slate-600 bg-slate-900 text-slate-200'
                  }`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <p className="text-xl font-black">P{philosopher.id + 1}</p>
                  <p className="mt-1 text-xs font-semibold">{philosopher.status}</p>
                </div>
              )
            })}
          </div>
        </div>
      </SectionCard>

      <div className="space-y-6">
        <StepExplanation stepTitle={stepTitle} explanation={explanation} algorithm={algorithmText} />
        <AlgorithmPanel
          title={demoMode === 'safe' ? 'Safe Algorithm' : 'Unsafe Deadlock Demonstration'}
          steps={currentAlgorithm}
          currentIndex={currentAlgorithmIndex}
        />
        <QueuePanel
          queues={[
            { label: 'Waiting Queue', items: waitingQueue },
          ]}
        />
        <PropertiesPanel
          items={[
            { label: 'philosophers', value: N, note: 'Total philosophers around the table.' },
            { label: 'forks', value: N, note: 'Each fork is a shared resource.' },
            { label: 'room semaphore', value: roomCount, color: 'text-cyan-300', note: 'Used only in safe mode to prevent deadlock.' },
            { label: 'forks in use', value: forksInUse, color: 'text-rose-300', note: 'Currently acquired forks.' },
            { label: 'hungry/waiting', value: hungryCount, color: 'text-amber-300', note: 'Philosophers waiting to eat.' },
            { label: 'deadlock risk', value: deadlockRisk, color: deadlockRisk.includes('YES') ? 'text-rose-300' : 'text-emerald-300', note: 'Unsafe mode clearly shows deadlock/circular waiting.' },
          ]}
        />
        <InfoBox
          title="Theory Snapshot"
          items={[
            'Each philosopher needs both left and right forks to eat.',
            'Unsafe mode demonstrates circular waiting and deadlock risk.',
            'Safe mode uses room semaphore = N - 1 so all philosophers cannot grab one fork simultaneously.',
            'This is a classic deadlock prevention example.',
          ]}
        />
        <UILabelsPanel
          items={[
            { label: 'Critical Section', description: 'The moment when a philosopher acquires forks and enters eating state.' },
            { label: 'Shared Resource', description: 'Forks are the shared resources used by neighboring philosophers.' },
            { label: 'Blocked State', description: 'A philosopher waits when the second fork is unavailable.' },
            { label: 'Deadlock Risk', description: 'In unsafe mode, all philosophers can hold one fork and wait forever for the second fork.' },
            { label: 'Safe State', description: 'Room semaphore prevents circular waiting and allows progress.' },
          ]}
        />
        <Legend
          items={[
            { label: 'Green means philosopher is eating safely.', className: 'border-emerald-400 bg-emerald-400/40' },
            { label: 'Red means fork is currently in use.', className: 'border-rose-400 bg-rose-400/40' },
            { label: 'Yellow means philosopher is hungry or waiting.', className: 'border-amber-400 bg-amber-400/40' },
            { label: 'Dark means philosopher is thinking / idle.', className: 'border-slate-600 bg-slate-800' },
          ]}
        />
        <LogPanel logs={logs} />
      </div>
    </div>
  )
}
