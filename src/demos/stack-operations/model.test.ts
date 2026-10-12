import { describe, expect, it } from 'vitest'
import {
  EMPTY_PEEK_MESSAGE, EMPTY_POP_MESSAGE, STACK_CAP, advanceAnimation, createStackState,
  peek, readingsOperations, settle, startPop, startPush, valuesFromTop,
} from './model'

describe('stack operations model', () => {
  it('shows both push stages and keeps top and count consistent', () => {
    const allocated = startPush(createStackState(), 7)
    expect(allocated.nodes[0]).toMatchObject({ value: 7, next: null, status: 'new' })
    expect(allocated.count).toBe(0)
    const pushed = advanceAnimation(allocated)
    expect(valuesFromTop(pushed)).toEqual([7])
    expect(pushed.count).toBe(1)
  })

  it('runs pop stages in the requested visual order', () => {
    const pushed = settle(startPush(createStackState(), 5))
    const saved = startPop(pushed)
    expect(saved.count).toBe(1)
    const deleted = advanceAnimation(saved)
    expect(deleted.nodes[0]?.status).toBe('deleting')
    const moved = advanceAnimation(deleted)
    expect(moved.topId).toBeNull()
    const decremented = advanceAnimation(moved)
    expect(decremented.count).toBe(0)
    const returned = advanceAnimation(decremented)
    expect(returned.message).toBe('pop() returned 5')
    expect(returned.nodes).toEqual([])
  })

  it('peeks without changing the values', () => {
    const state = settle(startPush(createStackState(), 9))
    const result = peek(state)
    expect(valuesFromTop(result)).toEqual([9])
    expect(result.count).toBe(1)
    expect(result.history.at(-1)).toBe('peek() returned 9')
  })

  it('rejects empty pop and peek with exact messages and no structural change', () => {
    const empty = createStackState()
    const popped = startPop(empty)
    const peeked = peek(empty)
    expect(popped.message).toBe(EMPTY_POP_MESSAGE)
    expect(peeked.message).toBe(EMPTY_PEEK_MESSAGE)
    expect(popped.nodes).toEqual(empty.nodes)
    expect(peeked.count).toBe(empty.count)
  })

  it('enforces the eight-value display cap', () => {
    let state = createStackState()
    for (let value = 1; value <= STACK_CAP; value += 1) state = settle(startPush(state, value))
    const full = startPush(state, 99)
    expect(full.count).toBe(STACK_CAP)
    expect(full.nodes).toHaveLength(STACK_CAP)
    expect(full.message).toContain('capped at 8')
  })

  it('runs the readings example in last-in, first-out order', () => {
    let state = createStackState()
    for (const operation of readingsOperations) {
      state = operation.kind === 'push'
        ? settle(startPush(state, operation.value))
        : settle(startPop(state))
    }
    expect(state.count).toBe(0)
    expect(state.topId).toBeNull()
    expect(state.history).toEqual([
      'push(2)', 'push(9)', 'push(5)',
      'pop() returned 5', 'pop() returned 9', 'pop() returned 2',
    ])
  })
})
