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
          if (index > 0 && frame.functionName === current.frames[index - 1]?.functionName) {
            expect(current.frames[index - 1]?.returnsTo.startsWith(`${frame.functionName}, line`)).toBe(true)
          }
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

  it('traces countdown through its five-frame base case', () => {
    const countdown = callPrograms.find((program) => program.id === 'countdown')
    expect(countdown).toBeDefined()
    expect(countdown?.steps.at(-1)?.console).toEqual(['2', '1', '0'])
    const maxFrames = Math.max(...(countdown?.steps.map((current) => current.frames.length) ?? []))
    expect(maxFrames).toBe(5)
    const deepest = countdown?.steps.find((current) => current.frames.length === maxFrames)
    expect(deepest?.frames[0]?.variables.find((variable) => variable.name === 'n')?.value).toBe('-1')
  })

  it('builds factorial results while its five frames return', () => {
    const factorial = callPrograms.find((program) => program.id === 'factorial')
    expect(factorial).toBeDefined()
    expect(factorial?.steps.at(-1)?.console).toEqual(['3! = 6'])
    for (const current of factorial?.steps ?? []) {
      if (current.frames.some((frame) => frame.functionName === 'factorial')) expect(current.console).toEqual([])
    }
    expect(Math.max(...(factorial?.steps.map((current) => current.frames.length) ?? []))).toBe(5)
    const returnedValues = factorial?.steps
      .map((current) => current.frames[0]?.note)
      .filter((note): note is string => note?.startsWith('returns') ?? false)
      .map((note) => Number(note.includes('= ') ? note.split('= ').at(-1) : note.match(/^returns (\d+)/)?.[1]))
    expect(returnedValues).toEqual([1, 1, 2, 6])
  })

  it('prints the list backward through a five-frame base case', () => {
    const printBackward = callPrograms.find((program) => program.id === 'printBackward')
    expect(printBackward).toBeDefined()
    expect(printBackward?.steps.at(-1)?.console).toEqual(['2 9 5 '])
    const maxFrames = Math.max(...(printBackward?.steps.map((current) => current.frames.length) ?? []))
    expect(maxFrames).toBe(5)
    const deepest = printBackward?.steps.find((current) => current.frames.length === maxFrames)
    expect(deepest?.frames[0]?.variables.find((variable) => variable.name === 'head')?.value).toBe('→ nullptr')
  })

  it('keeps the lecture source lines in the recursive programs', () => {
    const countdown = callPrograms.find((program) => program.id === 'countdown')
    const factorial = callPrograms.find((program) => program.id === 'factorial')
    const printBackward = callPrograms.find((program) => program.id === 'printBackward')
    expect(countdown).toBeDefined()
    expect(factorial).toBeDefined()
    expect(printBackward).toBeDefined()
    for (const line of ['if (n < 0) {', 'countdown(n - 1);']) {
      expect(countdown?.source.some((sourceLine) => sourceLine.includes(line))).toBe(true)
    }
    for (const line of ['if (n == 0) {', 'return n * factorial(n - 1);', 'int result = factorial(3);']) {
      expect(factorial?.source.some((sourceLine) => sourceLine.includes(line))).toBe(true)
    }
    for (const line of ['void printBackward(const Node* head) {', 'printBackward(head->next);', 'head = new Node{5, head};']) {
      expect(printBackward?.source.some((sourceLine) => sourceLine.includes(line))).toBe(true)
    }
  })

  it('bounds navigation', () => {
    const program = callPrograms[0]
    expect(program).toBeDefined()
    if (!program) return
    expect(previousStep(0)).toBe(0)
    expect(nextStep(program.steps.length - 1, program)).toBe(program.steps.length - 1)
  })
})
