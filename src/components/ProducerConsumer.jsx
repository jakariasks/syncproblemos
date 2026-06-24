import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Lock, Unlock } from 'lucide-react'
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

const BUFFER_SIZE = 5

function makeEmptyBuffer() {
  return Array.from({ length: BUFFER_SIZE }, () => null)
}

const PRODUCER_ALGORITHM = [
  'wait(empty)',
  'wait(mutex)',
  'insert item into buffer[in]',
  'update in = (in + 1) mod n',
  'signal(mutex)',
  'signal(full)',
]

const CONSUMER_ALGORITHM = [
  'wait(full)',
  'wait(mutex)',
  'remove item from buffer[out]',
  'update out = (out + 1) mod n',
  'signal(mutex)',
  'signal(empty)',
]

export default function ProducerConsumer() {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [mode, setMode] = useState('auto')
  const [speed, setSpeed] = useState(3200)

  const [buffer, setBuffer] = useState(makeEmptyBuffer)
  const [inIndex, setInIndex] = useState(0)
  const [outIndex, setOutIndex] = useState(0)
  const [itemCounter, setItemCounter] = useState(1)
  const [producerStatus, setProducerStatus] = useState('Idle')
  const [consumerStatus, setConsumerStatus] = useState('Idle')
  const [mutexLocked, setMutexLocked] = useState(false)
  const [activeFlow, setActiveFlow] = useState('producer')
  const [currentAlgorithmIndex, setCurrentAlgorithmIndex] = useState(0)
  const [stepTitle, setStepTitle] = useState('Ready')
  const [explanation, setExplanation] = useState('Press Start to begin the bounded-buffer simulation.')
  const [algorithmText, setAlgorithmText] = useState('Producer and consumer synchronize through empty, full, and mutex.')
  const [producerQueue, setProducerQueue] = useState([])
  const [consumerQueue, setConsumerQueue] = useState([])
  const [logs, setLogs] = useState([])

  const phaseRef = useRef(0)

  const full = useMemo(() => buffer.filter(item => item !== null).length, [buffer])
  const empty = BUFFER_SIZE - full

  function addLog(message) {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 100))
  }

  function clearQueues() {
    setProducerQueue([])
    setConsumerQueue([])
  }

  function producerSteps() {
    const phase = phaseRef.current % 8
    setActiveFlow('producer')

    if (phase === 0) {
      clearQueues()
      if (empty === 0) {
        setProducerStatus('Blocked / Waiting')
        setConsumerStatus('Idle')
        setMutexLocked(false)
        setProducerQueue(['Producer'])
        setCurrentAlgorithmIndex(0)
        setStepTitle('Producer waits because buffer is full')
        setExplanation('empty = 0, so the producer cannot insert a new item now. It goes to the blocked/waiting queue.')
        setAlgorithmText('Producer is blocked at wait(empty).')
        addLog('Producer is blocked. Buffer is full, so wait(empty) cannot continue.')
        phaseRef.current += 4
        return
      }

      setProducerStatus('Requesting empty semaphore')
      setConsumerStatus('Idle')
      setMutexLocked(false)
      setCurrentAlgorithmIndex(0)
      setStepTitle('Producer requests empty semaphore')
      setExplanation('Producer first checks whether there is any empty slot in the bounded buffer.')
      setAlgorithmText('wait(empty)')
      addLog(`Producer checked empty semaphore. empty = ${empty}.`)
      return
    }

    if (phase === 1) {
      setProducerStatus('Entered critical section')
      setMutexLocked(true)
      setCurrentAlgorithmIndex(1)
      setStepTitle('Producer locks mutex')
      setExplanation('Producer enters the critical section so that consumer cannot modify the buffer at the same time.')
      setAlgorithmText('wait(mutex)')
      addLog('Producer locked mutex and entered critical section.')
      return
    }

    if (phase === 2) {
      const item = itemCounter
      setBuffer(prev => {
        const next = [...prev]
        next[inIndex] = item
        return next
      })
      setCurrentAlgorithmIndex(2)
      setStepTitle('Producer inserts new item')
      setExplanation(`Producer inserts item ${item} into buffer index ${inIndex}.`)
      setAlgorithmText('insert item into buffer[in]')
      setProducerStatus(`Inserted item ${item}`)
      addLog(`Producer inserted item ${item} into buffer[${inIndex}].`)
      return
    }

    if (phase === 3) {
      setCurrentAlgorithmIndex(3)
      setStepTitle('Producer updates IN pointer')
      setExplanation('The IN pointer moves to the next circular position in the buffer.')
      setAlgorithmText('in = (in + 1) mod n')
      setInIndex(prev => (prev + 1) % BUFFER_SIZE)
      addLog('Producer updated IN pointer to next circular index.')
      return
    }

    if (phase === 4) {
      setCurrentAlgorithmIndex(4)
      setStepTitle('Producer releases mutex')
      setExplanation('Producer leaves the critical section and unlocks mutex.')
      setAlgorithmText('signal(mutex)')
      setMutexLocked(false)
      setProducerStatus('Leaving critical section')
      addLog('Producer released mutex.')
      return
    }

    if (phase === 5) {
      setCurrentAlgorithmIndex(5)
      setStepTitle('Producer signals full semaphore')
      setExplanation('Since one item was inserted, the number of full slots increases by one.')
      setAlgorithmText('signal(full)')
      setProducerStatus('Finished producing')
      addLog('Producer signaled full semaphore. Consumer can consume later.')
      return
    }

    if (phase === 6) {
      setProducerStatus('Idle')
      setCurrentAlgorithmIndex(5)
      setStepTitle('Producer cycle complete')
      setExplanation('The produce operation is complete. Next phases will show the consumer operation.')
      setAlgorithmText('Producer completed one full cycle.')
      return
    }

    if (phase === 7) {
      consumerSteps(true)
      return
    }
  }

  function consumerSteps(fromProducerChain = false) {
    const phase = phaseRef.current % 8
    setActiveFlow('consumer')

    if (phase === 6 || fromProducerChain) {
      clearQueues()
      if (full === 0) {
        setConsumerStatus('Blocked / Waiting')
        setProducerStatus('Idle')
        setMutexLocked(false)
        setConsumerQueue(['Consumer'])
        setCurrentAlgorithmIndex(0)
        setStepTitle('Consumer waits because buffer is empty')
        setExplanation('full = 0, so the consumer cannot remove any item now. It waits in the blocked queue.')
        setAlgorithmText('Consumer is blocked at wait(full).')
        addLog('Consumer is blocked. Buffer is empty, so wait(full) cannot continue.')
        return
      }

      setConsumerStatus('Requesting full semaphore')
      setCurrentAlgorithmIndex(0)
      setStepTitle('Consumer requests full semaphore')
      setExplanation('Consumer checks whether there is at least one full slot in the buffer.')
      setAlgorithmText('wait(full)')
      addLog(`Consumer checked full semaphore. full = ${full}.`)
      if (fromProducerChain) {
        return
      }
      return
    }

    if (phase === 7 && !fromProducerChain) {
      setConsumerStatus('Entered critical section')
      setMutexLocked(true)
      setCurrentAlgorithmIndex(1)
      setStepTitle('Consumer locks mutex')
      setExplanation('Consumer enters the critical section so that producer cannot modify the buffer at the same time.')
      setAlgorithmText('wait(mutex)')
      addLog('Consumer locked mutex and entered critical section.')
      return
    }

    if (phase === 0 && !fromProducerChain) {
      const item = buffer[outIndex]
      setBuffer(prev => {
        const next = [...prev]
        next[outIndex] = null
        return next
      })
      setCurrentAlgorithmIndex(2)
      setStepTitle('Consumer removes item')
      setExplanation(`Consumer removes item ${item ?? '—'} from buffer index ${outIndex}.`)
      setAlgorithmText('remove item from buffer[out]')
      setConsumerStatus(`Removed item ${item ?? '—'}`)
      addLog(`Consumer removed item ${item ?? '—'} from buffer[${outIndex}].`)
      return
    }

    if (phase === 1 && !fromProducerChain) {
      setCurrentAlgorithmIndex(3)
      setStepTitle('Consumer updates OUT pointer')
      setExplanation('The OUT pointer moves to the next circular position in the buffer.')
      setAlgorithmText('out = (out + 1) mod n')
      setOutIndex(prev => (prev + 1) % BUFFER_SIZE)
      addLog('Consumer updated OUT pointer to next circular index.')
      return
    }

    if (phase === 2 && !fromProducerChain) {
      setCurrentAlgorithmIndex(4)
      setStepTitle('Consumer releases mutex')
      setExplanation('Consumer leaves the critical section and unlocks mutex.')
      setAlgorithmText('signal(mutex)')
      setMutexLocked(false)
      addLog('Consumer released mutex.')
      return
    }

    if (phase === 3 && !fromProducerChain) {
      setCurrentAlgorithmIndex(5)
      setStepTitle('Consumer signals empty semaphore')
      setExplanation('Since one item was removed, the number of empty slots increases by one.')
      setAlgorithmText('signal(empty)')
      setConsumerStatus('Finished consuming')
      addLog('Consumer signaled empty semaphore. Producer can produce later.')
      return
    }

    if (phase === 4 && !fromProducerChain) {
      setConsumerStatus('Idle')
      setCurrentAlgorithmIndex(5)
      setStepTitle('Consumer cycle complete')
      setExplanation('The consume operation is complete. The next phase returns to the producer again.')
      setAlgorithmText('Consumer completed one full cycle.')
      return
    }
  }

  function nextStep() {
    const phase = phaseRef.current % 13

    if (phase <= 6) {
      producerSteps()
    } else {
      const local = phase - 7
      setActiveFlow('consumer')
      if (local === 0) {
        clearQueues()
        if (full === 0) {
          setConsumerStatus('Blocked / Waiting')
          setProducerStatus('Idle')
          setConsumerQueue(['Consumer'])
          setMutexLocked(false)
          setCurrentAlgorithmIndex(0)
          setStepTitle('Consumer waits because buffer is empty')
          setExplanation('full = 0, so there is no item to consume.')
          setAlgorithmText('wait(full)')
          addLog('Consumer is waiting in blocked queue because full = 0.')
        } else {
          setConsumerStatus('Requesting full semaphore')
          setCurrentAlgorithmIndex(0)
          setStepTitle('Consumer requests full semaphore')
          setExplanation('Consumer checks whether the buffer contains at least one item.')
          setAlgorithmText('wait(full)')
          addLog(`Consumer checked full semaphore. full = ${full}.`)
        }
      }
      if (local === 1) {
        if (full > 0) {
          setConsumerStatus('Entered critical section')
          setMutexLocked(true)
          setCurrentAlgorithmIndex(1)
          setStepTitle('Consumer locks mutex')
          setExplanation('Consumer enters critical section.')
          setAlgorithmText('wait(mutex)')
          addLog('Consumer locked mutex.')
        }
      }
      if (local === 2) {
        if (full > 0) {
          const item = buffer[outIndex]
          setBuffer(prev => {
            const next = [...prev]
            next[outIndex] = null
            return next
          })
          setConsumerStatus(`Removed item ${item ?? '—'}`)
          setCurrentAlgorithmIndex(2)
          setStepTitle('Consumer removes item')
          setExplanation(`Consumer removes item ${item ?? '—'} from buffer index ${outIndex}.`)
          setAlgorithmText('remove item from buffer[out]')
          addLog(`Consumer removed item ${item ?? '—'} from buffer[${outIndex}].`)
        }
      }
      if (local === 3) {
        if (full > 0) {
          setOutIndex(prev => (prev + 1) % BUFFER_SIZE)
          setCurrentAlgorithmIndex(3)
          setStepTitle('Consumer updates OUT pointer')
          setExplanation('OUT pointer moves to the next slot.')
          setAlgorithmText('out = (out + 1) mod n')
          addLog('Consumer updated OUT pointer.')
        }
      }
      if (local === 4) {
        if (mutexLocked) {
          setMutexLocked(false)
        }
        if (full > 0) {
          setCurrentAlgorithmIndex(4)
          setStepTitle('Consumer releases mutex')
          setExplanation('Consumer exits critical section.')
          setAlgorithmText('signal(mutex)')
          addLog('Consumer released mutex.')
        }
      }
      if (local === 5) {
        if (full >= 0) {
          setCurrentAlgorithmIndex(5)
          setConsumerStatus('Finished consuming')
          setStepTitle('Consumer signals empty semaphore')
          setExplanation('One empty slot becomes available for producer.')
          setAlgorithmText('signal(empty)')
          addLog('Consumer signaled empty semaphore.')
        }
      }
    }

    phaseRef.current = (phaseRef.current + 1) % 13
  }

  useEffect(() => {
    if (!running || paused || mode !== 'auto') return
    const timer = setInterval(nextStep, speed)
    return () => clearInterval(timer)
  }, [running, paused, mode, speed, full, empty, buffer, inIndex, outIndex, itemCounter, mutexLocked])

  function reset() {
    setRunning(false)
    setPaused(false)
    setBuffer(makeEmptyBuffer())
    setInIndex(0)
    setOutIndex(0)
    setItemCounter(1)
    setProducerStatus('Idle')
    setConsumerStatus('Idle')
    setMutexLocked(false)
    setActiveFlow('producer')
    setCurrentAlgorithmIndex(0)
    setStepTitle('Ready')
    setExplanation('Press Start to begin the bounded-buffer simulation.')
    setAlgorithmText('Producer and consumer synchronize through empty, full, and mutex.')
    setProducerQueue([])
    setConsumerQueue([])
    setLogs([])
    phaseRef.current = 0
  }

  function buildReport() {
    return [
      'PROCESS SYNCHRONIZATION VISUALIZER REPORT',
      'Problem: Producer-Consumer / Bounded Buffer',
      '',
      `Mode: ${mode}`,
      `Running: ${running ? 'Yes' : 'No'}`,
      `Paused: ${paused ? 'Yes' : 'No'}`,
      `Buffer Size: ${BUFFER_SIZE}`,
      `Buffer State: ${JSON.stringify(buffer)}`,
      `empty semaphore: ${empty}`,
      `full semaphore: ${full}`,
      `mutex: ${mutexLocked ? 'locked' : 'unlocked'}`,
      `Producer status: ${producerStatus}`,
      `Consumer status: ${consumerStatus}`,
      `Current step: ${stepTitle}`,
      `Explanation: ${explanation}`,
      '',
      'Theory:',
      'Producer waits when buffer is full. Consumer waits when buffer is empty. mutex ensures mutual exclusion inside critical section.',
      '',
      'Recent Logs:',
      ...logs.slice(0, 20),
    ].join('\n')
  }

  const currentAlgorithm = activeFlow === 'producer' ? PRODUCER_ALGORITHM : CONSUMER_ALGORITHM

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard
        title="Producer-Consumer / Bounded Buffer"
        subtitle="Includes algorithm highlight, manual/auto mode, waiting queue, theory help, report export, and clear OS labels."
        right={<ExportButtons title="producer-consumer-report" textBuilder={buildReport} />}
      >
        <div className="mb-5">
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
              addLog(`Producer-Consumer simulation started in ${mode} mode.`)
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
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Shared Resource</p>
            <p className="mt-1 text-xl font-black text-cyan-200">Bounded Buffer</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Critical Section</p>
            <p className="mt-1 text-xl font-black text-amber-200">{mutexLocked ? 'Inside Buffer Update' : 'Free'}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Blocked State</p>
            <p className="mt-1 text-xl font-black text-rose-200">
              {producerQueue.length + consumerQueue.length > 0 ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Safe State</p>
            <p className="mt-1 text-xl font-black text-emerald-200">Maintained</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_2fr_auto_1fr] md:items-center">
            <div className={`rounded-2xl border p-4 text-center ${producerStatus.includes('Blocked') ? 'border-amber-400 bg-amber-400/15' : producerStatus.includes('Entered') || producerStatus.includes('Inserted') ? 'border-emerald-400 bg-emerald-400/15 animate-pulse-soft' : 'border-slate-700 bg-slate-900'}`}>
              <p className="text-sm text-slate-400">Producer</p>
              <p className="mt-1 font-bold text-emerald-200">{producerStatus}</p>
              <p className="mt-2 text-xs text-slate-500">Creates items</p>
            </div>

            <ArrowRight className="hidden text-slate-500 md:block" />

            <div className="grid grid-cols-5 gap-3">
              {buffer.map((item, index) => {
                const isIn = index === inIndex
                const isOut = index === outIndex

                return (
                  <div
                    key={index}
                    className={`min-h-32 rounded-2xl border p-3 text-center transition ${
                      item === null
                        ? 'border-slate-700 bg-slate-900'
                        : 'border-cyan-400 bg-cyan-400/15 animate-pulse-soft'
                    }`}
                  >
                    <p className="text-xs text-slate-500">Index {index}</p>
                    <div className="mt-3 text-3xl font-black text-slate-100">
                      {item === null ? '—' : item}
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-1 text-[10px]">
                      {isIn && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-200">next IN</span>}
                      {isOut && <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-rose-200">next OUT</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            <ArrowRight className="hidden text-slate-500 md:block" />

            <div className={`rounded-2xl border p-4 text-center ${consumerStatus.includes('Blocked') ? 'border-amber-400 bg-amber-400/15' : consumerStatus.includes('Entered') || consumerStatus.includes('Removed') ? 'border-rose-400 bg-rose-400/15 animate-pulse-soft' : 'border-slate-700 bg-slate-900'}`}>
              <p className="text-sm text-slate-400">Consumer</p>
              <p className="mt-1 font-bold text-rose-200">{consumerStatus}</p>
              <p className="mt-2 text-xs text-slate-500">Removes items</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
              empty = <b className="text-emerald-300">{empty}</b>
            </span>
            <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
              full = <b className="text-cyan-300">{full}</b>
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
              {mutexLocked ? <Lock size={16} className="text-rose-300" /> : <Unlock size={16} className="text-emerald-300" />}
              mutex = <b className={mutexLocked ? 'text-rose-300' : 'text-emerald-300'}>{mutexLocked ? 'locked' : 'unlocked'}</b>
            </span>
          </div>
        </div>
      </SectionCard>

      <div className="space-y-6">
        <StepExplanation stepTitle={stepTitle} explanation={explanation} algorithm={algorithmText} />
        <AlgorithmPanel
          title={activeFlow === 'producer' ? 'Producer Algorithm' : 'Consumer Algorithm'}
          steps={currentAlgorithm}
          currentIndex={currentAlgorithmIndex}
        />
        <QueuePanel
          queues={[
            { label: 'Producer Waiting Queue', items: producerQueue },
            { label: 'Consumer Waiting Queue', items: consumerQueue },
          ]}
        />
        <PropertiesPanel
          items={[
            { label: 'Buffer size', value: BUFFER_SIZE, note: 'Fixed capacity of shared buffer.' },
            { label: 'empty semaphore', value: empty, color: 'text-emerald-300', note: 'Available empty slots.' },
            { label: 'full semaphore', value: full, color: 'text-cyan-300', note: 'Filled slots.' },
            { label: 'mutex', value: mutexLocked ? 'locked' : 'unlocked', color: mutexLocked ? 'text-rose-300' : 'text-emerald-300', note: 'Protects critical section.' },
            { label: 'in pointer', value: inIndex, color: 'text-emerald-300', note: 'Next producer insertion index.' },
            { label: 'out pointer', value: outIndex, color: 'text-rose-300', note: 'Next consumer removal index.' },
          ]}
        />
        <InfoBox
          title="Theory Snapshot"
          items={[
            'Producer cannot produce when the buffer is full.',
            'Consumer cannot consume when the buffer is empty.',
            'mutex ensures mutual exclusion while updating the shared buffer.',
            'This problem is also called the bounded-buffer problem.',
          ]}
        />
        <UILabelsPanel
          items={[
            { label: 'Critical Section', description: 'The part where producer or consumer updates the shared buffer. Only one is allowed at a time.' },
            { label: 'Shared Resource', description: 'The bounded buffer itself is the shared resource between producer and consumer.' },
            { label: 'Blocked State', description: 'Producer blocks if empty = 0 is false or consumer blocks if full = 0.' },
            { label: 'Safe State', description: 'Synchronization with empty, full, and mutex keeps the system consistent and race-free.' },
          ]}
        />
        <Legend
          items={[
            { label: 'Green means producer activity or available slot.', className: 'border-emerald-400 bg-emerald-400/40' },
            { label: 'Cyan means data is present in the buffer.', className: 'border-cyan-400 bg-cyan-400/40' },
            { label: 'Red means consumer activity or locked state.', className: 'border-rose-400 bg-rose-400/40' },
            { label: 'Yellow means waiting/blocked state.', className: 'border-amber-400 bg-amber-400/40' },
          ]}
        />
        <LogPanel logs={logs} />
      </div>
    </div>
  )
}
