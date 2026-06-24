import { useMemo, useState } from 'react'
import { BookOpenText, Cpu, Database, FileText, ShieldAlert, Users } from 'lucide-react'
import ProducerConsumer from './components/ProducerConsumer.jsx'
import ReadersWriters from './components/ReadersWriters.jsx'
import DiningPhilosophers from './components/DiningPhilosophers.jsx'
import TheoryReport from './components/TheoryReport.jsx'
import Footer from './components/Footer.jsx'

const tabs = [
  {
    id: 'producer-consumer',
    title: 'Producer-Consumer',
    icon: Database,
    component: ProducerConsumer,
  },
  {
    id: 'readers-writers',
    title: 'Readers-Writers',
    icon: Users,
    component: ReadersWriters,
  },
  {
    id: 'dining-philosophers',
    title: 'Dining Philosophers',
    icon: ShieldAlert,
    component: DiningPhilosophers,
  },
  {
    id: 'theory-report',
    title: 'Theory & Report',
    icon: FileText,
    component: TheoryReport,
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('producer-consumer')
  const active = useMemo(
    () => tabs.find(tab => tab.id === activeTab) || tabs[0],
    [activeTab],
  )
  const ActiveComponent = active.component

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300 ring-1 ring-cyan-400/30">
                <Cpu size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Process Synchronization Visualizer
                </h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-400">
                  Interactive web app for Producer-Consumer, Readers-Writers, and Dining Philosophers.
                  Includes manual mode, auto mode, theory, algorithm highlight, waiting queues, safe/unsafe deadlock demo.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              <div className="font-semibold text-cyan-300">Developed By </div>
              <div className="mt-1">Jakaria Hasan CSE 15</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  {tab.title}
                </button>
              )
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            <span className="font-semibold text-amber-300">Current View:</span>{' '}
            <span>{active.title}</span>{' '}
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-slate-400">
              Use <b className="text-slate-200">Manual Mode</b> for presentation and <b className="text-slate-200">Auto Mode</b> for live animation.
            </span>
          </div>
        </div>
      </header>

       <main className="mx-auto max-w-7xl px-4 py-6">
        <ActiveComponent />
      </main>

      <Footer />
    </div>
  )
}