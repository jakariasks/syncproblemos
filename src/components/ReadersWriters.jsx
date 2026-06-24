import { useEffect, useRef, useState } from 'react'
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

const READER_COUNT = 5
const WRITER_COUNT = 2

function initialReaders() {
  return Array.from({ length: READER_COUNT }, (_, index) => ({
    id: index + 1,
    status: 'Idle',
  }))
}

function initialWriters() {
  return Array.from({ length: WRITER_COUNT }, (_, index) => ({
    id: index + 1,
    status: 'Idle',
  }))
}

const READER_ALGORITHM = [
  'wait(mutex)',
  'read_count = read_count + 1',
  'if first reader, wait(wrt)',
  'signal(mutex)',
  'read shared data',
  'wait(mutex), read_count = read_count - 1',
  'if last reader, signal(wrt)',
  'signal(mutex)',
]

const WRITER_ALGORITHM = [
  'wait(wrt)',
  'write shared data',
  'signal(wrt)',
]

export default function ReadersWriters() {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [mode, setMode] = useState('auto')
  const [speed, setSpeed] = useState(3200)

  const [readers, setReaders] = useState(initialReaders)
  const [writers, setWriters] = useState(initialWriters)
  const [sharedData, setSharedData] = useState(100)
  const [mutexLocked, setMutexLocked] = useState(false)
  const [wrtLocked, setWrtLocked] = useState(false)
  const [readCount, setReadCount] = useState(0)
  const [activeFlow, setActiveFlow] = useState('reader')
  const [currentAlgorithmIndex, setCurrentAlgorithmIndex] = useState(0)
  const [stepTitle, setStepTitle] = useState('Ready')
  const [explanation, setExplanation] = useState('Press Start to begin the readers-writers simulation.')
  const [algorithmText, setAlgorithmText] = useState('Readers may read together, but writers need exclusive access.')
  const [readerQueue, setReaderQueue] = useState([])
  const [writerQueue, setWriterQueue] = useState([])
  const [logs, setLogs] = useState([])

  const phaseRef = useRef(0)
  const selectedReadersRef = useRef([1, 2, 3])
  const selectedWriterRef = useRef(1)

  function addLog(message) {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 100))
  }

  function updateReaderStatus(ids, status) {
    setReaders(prev => prev.map(reader => (
      ids.includes(reader.id) ? { ...reader, status } : reader
    )))
  }

  function updateWriterStatus(ids, status) {
    setWriters(prev => prev.map(writer => (
      ids.includes(writer.id) ? { ...writer, status } : writer
    )))
  }

  function resetProcesses() {
    setReaders(initialReaders())
    setWriters(initialWriters())
  }

  function readerPhase() {
    const phase = phaseRef.current % 6
    setActiveFlow('reader')

    if (phase === 0) {
      resetProcesses()
      const pool = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5)
      selectedReadersRef.current = pool.slice(0, 3)
      setReaderQueue(selectedReadersRef.current.map(id => `Reader ${id}`))
      setWriterQueue([])
      setCurrentAlgorithmIndex(0)
      setMutexLocked(true)
      setStepTitle('Readers request access')
      setExplanation('Readers first use mutex to safely update the read_count variable.')
      setAlgorithmText('wait(mutex)')
      updateReaderStatus(selectedReadersRef.current, 'Waiting')
      addLog(`Readers ${selectedReadersRef.current.join(', ')} arrived and are trying to update read_count.`)
      return
    }

    if (phase === 1) {
      setReadCount(selectedReadersRef.current.length)
      setCurrentAlgorithmIndex(1)
      setStepTitle('Readers increase read_count')
      setExplanation(`read_count becomes ${selectedReadersRef.current.length}. This counts how many readers are active.`)
      setAlgorithmText('read_count = read_count + 1')
      addLog(`read_count increased to ${selectedReadersRef.current.length}.`)
      return
    }

    if (phase === 2) {
      setWrtLocked(true)
      setCurrentAlgorithmIndex(2)
      setStepTitle('First reader locks wrt')
      setExplanation('The first reader locks wrt, so no writer can write while readers are active.')
      setAlgorithmText('if first reader, wait(wrt)')
      addLog('First reader locked wrt semaphore. Writers are now blocked.')
      return
    }

    if (phase === 3) {
      setMutexLocked(false)
      setCurrentAlgorithmIndex(3)
      setStepTitle('Readers release mutex')
      setExplanation('Readers have finished updating read_count and now release mutex.')
      setAlgorithmText('signal(mutex)')
      addLog('Readers released mutex.')
      return
    }

    if (phase === 4) {
      updateReaderStatus(selectedReadersRef.current, 'Reading')
      setWriterQueue(['Writer 1', 'Writer 2'])
      updateWriterStatus([1, 2], 'Waiting')
      setCurrentAlgorithmIndex(4)
      setStepTitle('Multiple readers read together')
      setExplanation('All selected readers can read at the same time. Writers must wait because wrt is locked.')
      setAlgorithmText('read shared data')
      addLog('Multiple readers are reading together. Writers are waiting.')
      return
    }

    if (phase === 5) {
      updateReaderStatus(selectedReadersRef.current, 'Idle')
      updateWriterStatus([1, 2], 'Idle')
      setReaderQueue([])
      setReadCount(0)
      setWrtLocked(false)
      setCurrentAlgorithmIndex(6)
      setStepTitle('Last reader releases wrt')
      setExplanation('When the last reader finishes, read_count becomes 0 and wrt is released for writers.')
      setAlgorithmText('if last reader, signal(wrt)')
      addLog('Last reader finished. wrt semaphore released.')
      return
    }
  }

  function writerPhase() {
    const phase = phaseRef.current % 4
    setActiveFlow('writer')

    if (phase === 0) {
      resetProcesses()
      selectedWriterRef.current = selectedWriterRef.current === 1 ? 2 : 1
      setWriterQueue([`Writer ${selectedWriterRef.current}`])
      setReaderQueue(['Reader 1', 'Reader 2'])
      updateWriterStatus([selectedWriterRef.current], 'Waiting')
      updateReaderStatus([1, 2], 'Waiting')
      setCurrentAlgorithmIndex(0)
      setStepTitle('Writer requests exclusive access')
      setExplanation(`Writer ${selectedWriterRef.current} waits for wrt so that it can write alone.`)
      setAlgorithmText('wait(wrt)')
      addLog(`Writer ${selectedWriterRef.current} is requesting exclusive access.`)
      return
    }

    if (phase === 1) {
      setWrtLocked(true)
      updateWriterStatus([selectedWriterRef.current], 'Writing')
      setCurrentAlgorithmIndex(1)
      setStepTitle('Writer enters critical section')
      setExplanation(`Writer ${selectedWriterRef.current} acquired wrt. No readers or other writers can proceed now.`)
      setAlgorithmText('wait(wrt) → write shared data')
      addLog(`Writer ${selectedWriterRef.current} acquired wrt and started writing.`)
      return
    }

    if (phase === 2) {
      setSharedData(prev => prev + 10)
      setCurrentAlgorithmIndex(1)
      setStepTitle('Writer updates shared data')
      setExplanation('Writer modifies the shared data while holding exclusive access.')
      setAlgorithmText('write shared data')
      addLog(`Writer ${selectedWriterRef.current} updated shared data by +10.`)
      return
    }

    if (phase === 3) {
      updateWriterStatus([selectedWriterRef.current], 'Idle')
      updateReaderStatus([1, 2], 'Idle')
      setWriterQueue([])
      setReaderQueue([])
      setWrtLocked(false)
      setCurrentAlgorithmIndex(2)
      setStepTitle('Writer releases wrt')
      setExplanation('Writer finished and releases wrt. Readers or writers may request access again.')
      setAlgorithmText('signal(wrt)')
      addLog(`Writer ${selectedWriterRef.current} released wrt semaphore.`)
      return
    }
  }

  function nextStep() {
    const phase = phaseRef.current % 10
    if (phase <= 5) {
      readerPhase()
    } else {
      writerPhase()
    }
    phaseRef.current = (phaseRef.current + 1) % 10
  }

  useEffect(() => {
    if (!running || paused || mode !== 'auto') return
    const timer = setInterval(nextStep, speed)
    return () => clearInterval(timer)
  }, [running, paused, mode, speed])

  function reset() {
    setRunning(false)
    setPaused(false)
    setReaders(initialReaders())
    setWriters(initialWriters())
    setSharedData(100)
    setMutexLocked(false)
    setWrtLocked(false)
    setReadCount(0)
    setActiveFlow('reader')
    setCurrentAlgorithmIndex(0)
    setStepTitle('Ready')
    setExplanation('Press Start to begin the readers-writers simulation.')
    setAlgorithmText('Readers may read together, but writers need exclusive access.')
    setReaderQueue([])
    setWriterQueue([])
    setLogs([])
    phaseRef.current = 0
    selectedReadersRef.current = [1, 2, 3]
    selectedWriterRef.current = 1
  }

  function buildReport() {
    return [
      'PROCESS SYNCHRONIZATION VISUALIZER REPORT',
      'Problem: Readers-Writers',
      '',
      `Mode: ${mode}`,
      `Shared data: ${sharedData}`,
      `read_count: ${readCount}`,
      `mutex: ${mutexLocked ? 'locked' : 'unlocked'}`,
      `wrt: ${wrtLocked ? 'locked' : 'unlocked'}`,
      `Current step: ${stepTitle}`,
      `Explanation: ${explanation}`,
      `Reader queue: ${readerQueue.join(', ') || 'empty'}`,
      `Writer queue: ${writerQueue.join(', ') || 'empty'}`,
      '',
      'Theory:',
      'Multiple readers can read together. Writers need exclusive access. First reader blocks writers using wrt, and last reader releases wrt.',
      '',
      'Recent Logs:',
      ...logs.slice(0, 20),
    ].join('\n')
  }

  const currentAlgorithm = activeFlow === 'reader' ? READER_ALGORITHM : WRITER_ALGORITHM

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard
        title="Readers-Writers Problem"
        subtitle="Includes algorithm highlight, manual/auto mode, waiting queues, theory section, UI labels, and report export."
        right={<ExportButtons title="readers-writers-report" textBuilder={buildReport} />}
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
              addLog(`Readers-Writers simulation started in ${mode} mode.`)
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
            <p className="mt-1 text-xl font-black text-cyan-200">Shared Data</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Critical Section</p>
            <p className="mt-1 text-xl font-black text-amber-200">
              {wrtLocked ? 'Writer Lock Active' : readCount > 0 ? 'Readers in Shared Data' : 'Free'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Blocked State</p>
            <p className="mt-1 text-xl font-black text-rose-200">
              {readerQueue.length + writerQueue.length > 0 ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Safe State</p>
            <p className="mt-1 text-xl font-black text-emerald-200">Maintained</p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            shared data = <b className="text-cyan-300">{sharedData}</b>
          </span>
          <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            read_count = <b className="text-emerald-300">{readCount}</b>
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            {mutexLocked ? <Lock size={16} className="text-rose-300" /> : <Unlock size={16} className="text-emerald-300" />}
            mutex = <b className={mutexLocked ? 'text-rose-300' : 'text-emerald-300'}>{mutexLocked ? 'locked' : 'free'}</b>
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
            {wrtLocked ? <Lock size={16} className="text-rose-300" /> : <Unlock size={16} className="text-emerald-300" />}
            wrt = <b className={wrtLocked ? 'text-rose-300' : 'text-emerald-300'}>{wrtLocked ? 'locked' : 'free'}</b>
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-emerald-300" />
              <h3 className="text-lg font-bold">Readers</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {readers.map(reader => (
                <div
                  key={reader.id}
                  className={`rounded-2xl border p-4 text-center transition ${
                    reader.status === 'Reading'
                      ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100 animate-pulse-soft'
                      : reader.status === 'Waiting'
                        ? 'border-amber-400 bg-amber-400/15 text-amber-100'
                        : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  <p className="text-sm text-slate-400">Reader {reader.id}</p>
                  <p className="mt-2 text-lg font-black">{reader.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Edit3 className="text-rose-300" />
              <h3 className="text-lg font-bold">Writers</h3>
            </div>

            <div className="grid gap-3">
              {writers.map(writer => (
                <div
                  key={writer.id}
                  className={`rounded-2xl border p-4 text-center transition ${
                    writer.status === 'Writing'
                      ? 'border-rose-400 bg-rose-400/15 text-rose-100 animate-pulse-soft'
                      : writer.status === 'Waiting'
                        ? 'border-amber-400 bg-amber-400/15 text-amber-100'
                        : 'border-slate-700 bg-slate-900 text-slate-300'
                  }`}
                >
                  <p className="text-sm text-slate-400">Writer {writer.id}</p>
                  <p className="mt-2 text-lg font-black">{writer.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="space-y-6">
        <StepExplanation stepTitle={stepTitle} explanation={explanation} algorithm={algorithmText} />
        <AlgorithmPanel
          title={activeFlow === 'reader' ? 'Reader Algorithm' : 'Writer Algorithm'}
          steps={currentAlgorithm}
          currentIndex={currentAlgorithmIndex}
        />
        <QueuePanel
          queues={[
            { label: 'Reader Waiting Queue', items: readerQueue },
            { label: 'Writer Waiting Queue', items: writerQueue },
          ]}
        />
        <PropertiesPanel
          items={[
            { label: 'read_count', value: readCount, color: 'text-emerald-300', note: 'Number of active readers.' },
            { label: 'shared data', value: sharedData, color: 'text-cyan-300', note: 'Data read or modified by processes.' },
            { label: 'mutex', value: mutexLocked ? 'locked' : 'free', color: mutexLocked ? 'text-rose-300' : 'text-emerald-300', note: 'Protects read_count.' },
            { label: 'wrt', value: wrtLocked ? 'locked' : 'free', color: wrtLocked ? 'text-rose-300' : 'text-emerald-300', note: 'Controls exclusive write access.' },
            { label: 'reader queue', value: readerQueue.length, color: 'text-amber-300', note: 'Readers waiting for access.' },
            { label: 'writer queue', value: writerQueue.length, color: 'text-amber-300', note: 'Writers waiting for access.' },
          ]}
        />
        <InfoBox
          title="Theory Snapshot"
          items={[
            'Multiple readers can read simultaneously.',
            'A writer must have exclusive access to the shared data.',
            'The first reader locks wrt and the last reader unlocks wrt.',
            'This implementation visually explains reader-priority style behavior.',
          ]}
        />
        <UILabelsPanel
          items={[
            { label: 'Critical Section', description: 'The area where readers access shared data or the writer updates shared data.' },
            { label: 'Shared Resource', description: 'Shared data is the resource used by both readers and writers.' },
            { label: 'Blocked State', description: 'Writers wait while readers are active, and readers may wait while a writer is writing.' },
            { label: 'Safe State', description: 'mutex and wrt prevent race conditions and inconsistent data access.' },
          ]}
        />
        <Legend
          items={[
            { label: 'Green means reader is reading.', className: 'border-emerald-400 bg-emerald-400/40' },
            { label: 'Red means writer is writing.', className: 'border-rose-400 bg-rose-400/40' },
            { label: 'Yellow means waiting/blocked state.', className: 'border-amber-400 bg-amber-400/40' },
            { label: 'Dark means idle/free.', className: 'border-slate-600 bg-slate-800' },
          ]}
        />
        <LogPanel logs={logs} />
      </div>
    </div>
  )
}
