import { describe, expect, it } from 'vitest'
import { callPrograms, nextStep, previousStep } from './model'

describe('call stack programs', () => {
  it('keeps every frame snapshot consistent and ends empty', () => {
    for (const program of callPrograms) {
      for (const current of program.steps) {
        expect(current.line).toBeGreaterThan(0)
        expect(current.line).toBeLessThanOrEqual(program.source.length)
        expect(new Set(current.frames.map((frame) => frame.id)).size).toBe(current.frames.length)
        current.frames.forEach((frame, index) => {
          expect(frame.functionName.length).toBeGreaterThan(0)
          expect(frame.returnsTo.length).toBeGreaterThan(0)
          if (index > 0) expect(frame.functionName).not.toBe(current.frames[index - 1]?.functionName)
        })
      }
      expect(program.steps.at(-1)?.frames).toEqual([])
    }
  })

  it('balances frame pushes and pops without skipping stack depths', () => {
    for (const program of callPrograms) {
      const depths = program.steps.map((current) => current.frames.length)
      for (let index = 1; index < depths.length; index += 1) {
        expect(Math.abs((depths[index] ?? 0) - (depths[index - 1] ?? 0))).toBeLessThanOrEqual(1)
      }
      expect(depths.at(-1)).toBe(0)
    }
  })

  it('produces each program console exactly', () => {
    for (const program of callPrograms) {
      expect(program.steps.at(-1)?.console).toEqual(program.expectedConsole)
    }
  })

  it('reaches three frames and pushes square twice in calls inside calls', () => {
    const nested = callPrograms.find((program) => program.id === 'nested')
    expect(nested).toBeDefined()
    expect(Math.max(...(nested?.steps.map((current) => current.frames.length) ?? []))).toBe(3)
    const squareFrameIds = new Set(nested?.steps.flatMap((current) => current.frames.filter((frame) => frame.functionName === 'square').map((frame) => frame.id)))
    expect(squareFrameIds).toEqual(new Set(['square-a', 'square-b']))
  })

  it('bounds navigation', () => {
    const program = callPrograms[0]
    expect(program).toBeDefined()
    if (!program) return
    expect(previousStep(0)).toBe(0)
    expect(nextStep(program.steps.length - 1, program)).toBe(program.steps.length - 1)
  })
})
