import { Pause, Play, RotateCcw, SkipForward, Square } from 'lucide-react'

const speedOptions = [
  { label: 'Very Slow', value: 4200 },
  { label: 'Slow', value: 3200 },
  { label: 'Normal', value: 2300 },
  { label: 'Fast', value: 1400 },
]

export default function ControlButtons({
  running,
  paused,
  mode,
  speed,
  onModeChange,
  onSpeedChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onStep,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onStart}
        disabled={running}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Play size={17} />
        Start
      </button>

      {paused ? (
        <button
          type="button"
          onClick={onResume}
          disabled={!running || mode === 'manual'}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-cyan-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play size={17} />
          Resume
        </button>
      ) : (
        <button
          type="button"
          onClick={onPause}
          disabled={!running || mode === 'manual'}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pause size={17} />
          Pause
        </button>
      )}

      <button
        type="button"
        onClick={onStep}
        disabled={mode === 'auto' && running && !paused}
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SkipForward size={17} />
        Next Step
      </button>

      <button
        type="button"
        onClick={onStop}
        disabled={!running}
        className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-rose-950 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Square size={17} />
        Stop
      </button>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 transition hover:bg-slate-700"
      >
        <RotateCcw size={17} />
        Reset
      </button>

      <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">
        Mode
        <select
          value={mode}
          onChange={event => onModeChange(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 outline-none"
        >
          <option value="auto">Auto</option>
          <option value="manual">Manual</option>
        </select>
      </label>

      <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">
        Speed
        <select
          value={speed}
          onChange={event => onSpeedChange(Number(event.target.value))}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 outline-none"
        >
          {speedOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
