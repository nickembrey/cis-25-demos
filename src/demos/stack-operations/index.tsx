import { useEffect, useMemo, useState } from 'react'
import {
  STACK_CAP, advanceAnimation, createStackState, peek, readingsOperations,
  startPop, startPush, valuesFromTop,
} from './model'

const operationLines = [
  'top = new Node{value, top};',
  '++count;',
  'Node* old = top; int value = old->value;',
  'top = old->next;',
  'delete old;',
  '--count;',
  'return value;',
]

export default function StackOperationsDemo() {
  const [state, setState] = useState(createStackState)
  const [input, setInput] = useState('7')
  const [exampleStep, setExampleStep] = useState<number | null>(null)
  const values = useMemo(() => valuesFromTop(state), [state])
  const busy = state.pending.length > 0

  useEffect(() => {
    if (!busy) return
    const timer = window.setTimeout(() => setState((current) => advanceAnimation(current)), 600)
    return () => window.clearTimeout(timer)
  }, [busy, state.pending.length])

  const pushValue = (value: number) => setState((current) => startPush(current, value))
  const runExampleStep = () => {
    if (exampleStep === null || busy) return
    const operation = readingsOperations[exampleStep]
    if (!operation) return
    if (operation.kind === 'push') pushValue(operation.value)
    else setState((current) => startPop(current))
    setExampleStep(exampleStep + 1)
  }

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3">
        <label className="min-w-28 flex-1 text-sm text-slate-300">
          Integer value
          <input
            type="number" value={input} step="1"
            onChange={(event) => setInput(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 font-mono"
          />
        </label>
        <Control label="Push" disabled={busy || state.count >= STACK_CAP || !Number.isInteger(Number(input))} onClick={() => pushValue(Number(input))} />
        <Control label="Pop" disabled={busy} onClick={() => setState((current) => startPop(current))} />
        <Control label="Peek" disabled={busy} onClick={() => setState((current) => peek(current))} />
        <Control label="Reset" onClick={() => { setState(createStackState()); setExampleStep(null) }} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Control label="Readings example" disabled={busy} onClick={() => { setState(createStackState()); setExampleStep(0) }} />
        {exampleStep !== null && exampleStep < readingsOperations.length && (
          <Control label="Next step" disabled={busy} onClick={runExampleStep} />
        )}
        {exampleStep === readingsOperations.length && !busy && <span className="self-center text-sm text-emerald-300">Example complete.</span>}
      </div>

      {state.count >= STACK_CAP && <p className="text-sm text-amber-300">The demo stops at 8 values so every node remains visible.</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Abstract stack">
          <div className="mx-auto flex max-w-56 flex-col gap-2">
            <div className="text-center text-xs font-bold uppercase tracking-widest text-cyan-300">top</div>
            {values.length === 0 ? <Empty /> : values.map((value, index) => (
              <div key={`${value}-${index}`} className="rounded-lg border border-cyan-500/70 bg-cyan-950/40 p-3 text-center font-mono font-bold transition-all motion-reduce:transition-none">
                {value}{index === 0 && <span className="ml-2 text-xs text-cyan-300">← top</span>}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="IntStack in memory">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-violet-500/50 bg-violet-950/30 p-3 font-mono text-sm">
            <span>count = {state.count}</span>
            <span className="break-all">top = {state.topId === null ? 'nullptr' : `node-${state.topId}`}</span>
          </div>
          <div className="space-y-2">
            {state.nodes.length === 0 ? <Empty /> : state.nodes.map((node) => (
              <div key={node.id} className={`grid grid-cols-[1fr_1.5fr] rounded-lg border font-mono text-sm transition-all duration-500 motion-reduce:duration-0 ${
                node.status === 'new' ? 'translate-y-0 border-emerald-400 bg-emerald-950/40' :
                  node.status === 'deleting' ? 'border-red-500 bg-red-950/30 opacity-30' : 'border-slate-600 bg-slate-800'
              }`}>
                <span className="border-r border-inherit p-2 text-center">{node.value}</span>
                <span className="break-all p-2 text-center">next: {node.next === null ? 'nullptr' : `node-${node.next}`}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Panel title="Current C++">
          <code className="block whitespace-pre-wrap break-words text-sm">
            <span className="text-slate-500">s.push({input}); / s.pop(); / s.peek();</span>{'\n'}
            {operationLines.map((line) => (
              <span key={line} className={`block rounded px-2 py-1 ${state.activeLine === line ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}>{line}</span>
            ))}
            {!operationLines.includes(state.activeLine) && <span className="block rounded bg-cyan-900 px-2 py-1 text-cyan-200">{state.activeLine}</span>}
          </code>
        </Panel>
        <Panel title="Operation history">
          {state.history.length === 0 ? <p className="text-sm text-slate-500">No calls yet.</p> : (
            <ol className="space-y-1 font-mono text-sm">{state.history.map((entry, index) => <li key={`${entry}-${index}`}>{index + 1}. {entry}</li>)}</ol>
          )}
        </Panel>
      </div>

      <p aria-live="polite" className="min-h-12 rounded-xl border border-cyan-700/50 bg-cyan-950/30 p-3 text-sm text-cyan-100">{state.message}</p>
    </div>
  )
}

function Control({ label, disabled = false, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none">{label}</button>
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 p-4"><h3 className="mb-3 font-semibold text-slate-200">{title}</h3>{children}</section>
}

function Empty() {
  return <div className="rounded-lg border border-dashed border-slate-600 p-4 text-center font-mono text-sm text-slate-500">nullptr · empty</div>
}
