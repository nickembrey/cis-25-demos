import { useState } from 'react'
import {
  STACK_LIMIT_BYTES, memoryScenarios, nextMemoryStep, previousMemoryStep, totalStackBytes,
  type HeapBlock, type MemoryVariable,
} from './model'

export default function StackAndHeapDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const scenario = memoryScenarios[scenarioIndex] ?? memoryScenarios[0]
  if (!scenario) return null
  const current = scenario.steps[stepIndex] ?? scenario.steps[0]
  if (!current) return null
  const used = totalStackBytes(current)
  const meterWidth = used === 0 ? 0 : current.crashed ? 100 : Math.max(3, Math.min(100, (Math.log10(used + 1) / Math.log10(STACK_LIMIT_BYTES + 1)) * 100))

  const chooseScenario = (index: number) => { setScenarioIndex(index); setStepIndex(0) }
  const move = (direction: -1 | 1) => setStepIndex((index) => direction < 0 ? previousMemoryStep(index) : nextMemoryStep(index, scenario))

  return (
    <div
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
      }}
      className="space-y-4 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      aria-label="Stack and heap step-through. Use Left and Right arrow keys to move."
    >
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3">
        <label className="min-w-64 flex-1 text-sm text-slate-300">Scenario
          <select value={scenarioIndex} onChange={(event) => chooseScenario(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2">
            {memoryScenarios.map((item, index) => <option key={item.id} value={index}>{item.title}</option>)}
          </select>
        </label>
        <Control label="Back" disabled={stepIndex === 0} onClick={() => move(-1)} />
        <Control label="Next" disabled={stepIndex === scenario.steps.length - 1} onClick={() => move(1)} />
        <Control label="Reset" onClick={() => setStepIndex(0)} />
        <span className="self-center text-sm text-slate-400">Step {stepIndex + 1} / {scenario.steps.length}</span>
      </div>

      {scenario.id === 'overflow' || scenario.id === 'heap-fix' ? (
        <div className="flex gap-2">
          <Control label="Stack version" active={scenario.id === 'overflow'} onClick={() => chooseScenario(3)} />
          <Control label="Heap fix" active={scenario.id === 'heap-fix'} onClick={() => chooseScenario(4)} />
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        <Panel title="Program source">
          <pre className="whitespace-pre-wrap break-words text-xs"><code>{scenario.source.map((line, index) => (
            <span key={`${index}-${line}`} className={`grid grid-cols-[2rem_1fr] rounded px-1 py-0.5 ${current.line === index + 1 ? 'bg-violet-900 text-violet-100' : 'text-slate-400'}`}>
              <span className="select-none text-slate-600">{index + 1}</span><span>{line || ' '}</span>
            </span>
          ))}</code></pre>
        </Panel>

        <Panel title="Call stack">
          <div className="space-y-2">
            {current.frames.length === 0 ? <Empty label="empty" /> : current.frames.map((frame, index) => (
              <article key={frame.id} className={`rounded-lg border p-3 ${index === 0 ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-600 bg-slate-800'}`}>
                <div className="flex justify-between gap-2"><strong className="font-mono">{frame.name}()</strong><span className="text-xs text-slate-400">{frame.name}: {frame.bytes} bytes</span></div>
                <div className="mt-2 space-y-1">{frame.variables.map((item) => <Variable key={item.name} variable={item} />)}</div>
              </article>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between gap-2 text-xs text-slate-400"><span>stack used: {used.toLocaleString()} bytes</span><span>8 MB limit</span></div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-800"><div className={`h-full transition-all duration-500 motion-reduce:duration-0 ${current.crashed ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${meterWidth}%` }} /></div>
            <p className="mt-1 text-xs text-slate-500">8 MB means 8 MiB: {STACK_LIMIT_BYTES.toLocaleString()} bytes.</p>
          </div>
        </Panel>

        <Panel title="Heap">
          <div className="space-y-2">
            {current.blocks.length === 0 ? <Empty label="no heap blocks" /> : current.blocks.map((item) => <Block key={item.address} block={item} />)}
          </div>
        </Panel>
      </div>

      {current.crashed && <div className="rounded-xl border-2 border-red-500 bg-red-950/50 p-4 text-center font-bold text-red-200">stack overflow: the program crashes</div>}
      <p aria-live="polite" className="rounded-xl border border-violet-700/50 bg-violet-950/30 p-3 text-sm text-violet-100">{current.explanation}</p>
    </div>
  )
}

function Variable({ variable }: { variable: MemoryVariable }) {
  return (
    <div className={`rounded border px-2 py-1 font-mono text-xs ${variable.status === 'dangling' ? 'border-red-500 bg-red-950/40 text-red-200' : variable.address ? 'border-violet-500/60 bg-violet-950/30 text-violet-200' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}>
      <div className="flex flex-wrap justify-between gap-1"><span>{variable.name}</span><span>{variable.value}</span></div>
      <div className="mt-1 flex justify-between text-[11px]"><span>{variable.bytes} bytes</span>{variable.status && <strong>{variable.status}</strong>}</div>
      {variable.address && <div className="mt-1 text-[11px]">points to → {variable.address}</div>}
    </div>
  )
}

function Block({ block }: { block: HeapBlock }) {
  const tone = block.status === 'leaked' ? 'border-red-500 bg-red-950/40 text-red-100' : block.status === 'freed' ? 'border-slate-600 bg-slate-800/40 text-slate-500 opacity-50' : 'border-violet-500 bg-violet-950/30 text-violet-100'
  return (
    <article className={`rounded-lg border p-3 font-mono text-xs transition-all duration-500 motion-reduce:duration-0 ${tone}`}>
      <div className="flex flex-wrap justify-between gap-2"><strong>{block.address}</strong><strong>{block.status}</strong></div>
      <div className="mt-2 break-words">{block.contents}</div>
      <div className="mt-1">{block.bytes.toLocaleString()} bytes</div>
      {block.nextAddress !== undefined && <div className="mt-1">next → {block.nextAddress ?? 'nullptr'}</div>}
    </article>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 p-3"><h3 className="mb-3 font-semibold">{title}</h3>{children}</section>
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-lg border border-dashed border-slate-600 p-6 text-center text-sm text-slate-500">{label}</div>
}

function Control({ label, disabled = false, active = false, onClick }: { label: string; disabled?: boolean; active?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none ${active ? 'bg-violet-500 text-white' : 'bg-violet-800 text-violet-50 hover:bg-violet-700'}`}>{label}</button>
}
