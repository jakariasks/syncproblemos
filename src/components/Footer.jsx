import { Cpu, Github, GraduationCap } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300 ring-1 ring-cyan-400/30">
                <Cpu size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">
                  Process Synchronization Visualizer
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Interactive OS synchronization learning tool.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-cyan-200">Topics Covered</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>• Producer-Consumer / Bounded Buffer</li>
              <li>• Readers-Writers Problem</li>
              <li>• Dining Philosophers Problem</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-cyan-200">Project Info</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <GraduationCap size={16} />
                Operating System Chapter 7 Project
              </p>
              <p className="flex items-center gap-2">
                <Github size={16} />
                React + Vite + JavaScript(main Programming Language) + Tailwind CSS
              </p>
              <p>
                Developed by{' '}
                <span className="font-semibold text-slate-200">
                  Jakaria Hasan CSE 15
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-5 text-center text-sm text-slate-500">
          © {currentYear} Jakaria Hasan. All rights reserved.
        </div>
      </div>
    </footer>
  )
}