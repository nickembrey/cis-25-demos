import { describe, expect, it } from 'vitest'
import { STACK_LIMIT_BYTES, memoryScenarios, totalStackBytes } from './model'

describe('stack and heap model', () => {
  it('keeps pointer and node addresses tied to existing or freed blocks', () => {
    for (const scenario of memoryScenarios) {
      for (const step of scenario.steps) {
        const blocks = new Map(step.blocks.map((item) => [item.address, item]))
        for (const frame of step.frames) {
          for (const variable of frame.variables) {
            if (variable.address) expect(blocks.has(variable.address)).toBe(true)
          }
        }
        for (const item of step.blocks) {
          if (item.nextAddress) expect(blocks.has(item.nextAddress)).toBe(true)
        }
      }
    }
  })

  it('marks dangling pointers exactly when they hold freed addresses', () => {
    for (const scenario of memoryScenarios) {
      for (const step of scenario.steps) {
        const blocks = new Map(step.blocks.map((item) => [item.address, item]))
        for (const variable of step.frames.flatMap((frame) => frame.variables)) {
          if (!variable.address) continue
          const target = blocks.get(variable.address)
          expect(variable.status === 'dangling').toBe(target?.status === 'freed')
        }
      }
    }
  })

  it('marks leaked blocks only after their last pointer is gone', () => {
    for (const scenario of memoryScenarios) {
      for (const step of scenario.steps) {
        const pointerAddresses = new Set(step.frames.flatMap((frame) => frame.variables.map((item) => item.address).filter((address): address is string => address !== undefined)))
        for (const item of step.blocks.filter((candidate) => candidate.status === 'leaked')) {
          expect(pointerAddresses.has(item.address)).toBe(false)
        }
      }
    }
  })

  it('computes frame sizes from parameters and locals', () => {
    for (const scenario of memoryScenarios) {
      for (const step of scenario.steps) {
        for (const frame of step.frames) {
          expect(frame.bytes).toBe(frame.variables.reduce((total, item) => total + item.bytes, 0))
        }
      }
    }
    const stack = memoryScenarios.find((scenario) => scenario.id === 'int-stack')
    expect(stack?.steps[0]?.frames[0]?.bytes).toBe(16)
    const overflow = memoryScenarios.find((scenario) => scenario.id === 'overflow')
    expect(totalStackBytes(overflow?.steps[1] ?? { line: 0, frames: [], blocks: [], explanation: '' })).toBe(40_000_000)
    expect(STACK_LIMIT_BYTES).toBe(8_388_608)
  })

  it('ends with an empty stack after each normal main return', () => {
    for (const scenario of memoryScenarios.filter((item) => item.id !== 'overflow')) {
      expect(scenario.steps.at(-1)?.frames).toEqual([])
    }
  })

  it('stops the overflow scenario at the crash', () => {
    const overflow = memoryScenarios.find((scenario) => scenario.id === 'overflow')
    expect(overflow?.steps).toHaveLength(2)
    expect(overflow?.steps.at(-1)?.crashed).toBe(true)
    expect(overflow?.steps.some((step) => step.line === 3)).toBe(false)
  })

  it('uses the lecture byte sizes and frees every IntStack node', () => {
    const stack = memoryScenarios.find((scenario) => scenario.id === 'int-stack')
    const fullest = stack?.steps[3]
    expect(fullest?.blocks.map((item) => item.bytes)).toEqual([16, 16, 16])
    expect(stack?.steps.at(-1)?.blocks.every((item) => item.status === 'freed')).toBe(true)
    const heapFix = memoryScenarios.find((scenario) => scenario.id === 'heap-fix')
    expect(heapFix?.steps[1]?.frames[0]?.bytes).toBe(8)
    expect(heapFix?.steps[2]?.blocks[0]?.bytes).toBe(40_000_000)
  })
})
