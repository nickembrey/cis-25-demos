import { useState } from 'react'
import { callPrograms, nextStep, previousStep } from './model'

export default function CallStackDemo() {
  const [programIndex, setProgramIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const program = callPrograms[programIndex] ?? callPrograms[0]
  if (!program) return null
  const current = program.steps[stepIndex] ?? program.steps[0]
  if (!current) return null

  const chooseProgram = (index: number) => { setProgramIndex(index); setStepIndex(0) }
  const move = (direction: -1 | 1) => setStepIndex((index) => direction < 0 ? previousStep(index) : nextStep(index, program))

  return (
    <div
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
      }}
      className="space-y-4 rounded-xl text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      aria-label="Call stack step-through. Use Left and Right arrow keys to move."
    >
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3">
        <label className="min-w-56 flex-1 text-sm text-slate-300">Program
          <select value={programIndex} onChange={(event) => chooseProgram(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2">
            {callPrograms.map((item, index) => <option key={item.id} value={index}>{item.title}</option>)}
          </select>
        </label>
        <Control label="Back" disabled={stepIndex === 0} onClick={() => move(-1)} />
        <Control label="Next" disabled={stepIndex === program.steps.length - 1} onClick={() => move(1)} />
        <Control label="Reset" onClick={() => setStepIndex(0)} />
        <span className="self-center text-sm text-slate-400">Step {stepIndex + 1} / {program.steps.length}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-slate-700 bg-slate-950 p-3">
          <h3 className="mb-2 font-semibold">Program source</h3>
          <pre className="whitespace-pre-wrap break-words text-xs sm:text-sm"><code>{program.source.map((line, index) => (
            <span key={`${index}-${line}`} className={`grid grid-cols-[2rem_1fr] rounded px-1 py-0.5 ${current.line === index + 1 ? 'bg-cyan-900 text-cyan-100' : 'text-slate-400'}`}>
              <span className="select-none text-slate-600">{index + 1}</span><span>{line || ' '}</span>
            </span>
          ))}</code></pre>
        </section>

        <section className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 p-3">
          <h3 className="mb-2 font-semibold">Call stack</h3>
          <div className="space-y-2">
            {current.frames.length === 0 ? <div className="rounded-lg border border-dashed border-slate-600 p-6 text-center text-slate-500">empty</div> : current.frames.map((frame, index) => (
              <article key={frame.id} className={`rounded-lg border p-3 transition-all motion-reduce:transition-none ${index === 0 ? 'border-emerald-500 bg-emerald-950/30' : 'border-amber-600/60 bg-amber-950/20'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="font-mono">{frame.functionName}()</strong>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${index === 0 ? 'bg-emerald-700' : 'bg-amber-700'}`}>{index === 0 ? 'running' : 'waiting'}</span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-1 font-mono text-sm">
                  {frame.variables.length === 0 ? <span className="col-span-2 text-slate-500">no parameters or locals</span> : frame.variables.map((item) => (
                    <div key={item.name} className="col-span-2 grid grid-cols-[1fr_auto] rounded bg-slate-950/50 px-2 py-1"><dt>{item.role} {item.name}</dt><dd>{item.value}</dd></div>
                  ))}
                </dl>
                <p className="mt-2 text-xs text-slate-400">returns to: {frame.returnsTo}</p>
                {frame.note ? <p className="mt-2 text-xs text-slate-400">{frame.note}</p> : null}
              </article>
            ))}
          </div>
        </section>
      </div>

      <p aria-live="polite" className="rounded-xl border border-cyan-700/50 bg-cyan-950/30 p-3 text-sm text-cyan-100">{current.explanation}</p>
      <section className="rounded-xl border border-slate-700 bg-black p-3 font-mono text-sm">
        <h3 className="mb-2 font-sans font-semibold text-slate-300">Console</h3>
        {current.console.length === 0 ? <span className="text-slate-600">No output yet.</span> : current.console.map((line, index) => <div key={`${line}-${index}`} className="text-emerald-300">{line}</div>)}
      </section>
    </div>
  )
}

function Control({ label, disabled = false, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none">{label}</button>
}
