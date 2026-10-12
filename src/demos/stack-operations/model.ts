export const STACK_CAP = 8
export const EMPTY_POP_MESSAGE = 'pop() requires a non-empty stack. Check isEmpty() first.'
export const EMPTY_PEEK_MESSAGE = 'peek() requires a non-empty stack. Check isEmpty() first.'

export interface StackNode {
  id: number
  value: number
  next: number | null
  status: 'new' | 'active' | 'deleting'
}

type PendingAction = 'finish-push' | 'delete-old' | 'move-top' | 'decrement' | 'return'

export interface StackState {
  nodes: StackNode[]
  topId: number | null
  count: number
  nextId: number
  message: string
  activeLine: string
  history: string[]
  pending: PendingAction[]
  saved?: { id: number; value: number; next: number | null }
}

export const readingsOperations = [
  { kind: 'push', value: 2 },
  { kind: 'push', value: 9 },
  { kind: 'push', value: 5 },
  { kind: 'pop' },
  { kind: 'pop' },
  { kind: 'pop' },
] as const

export function createStackState(): StackState {
  return {
    nodes: [], topId: null, count: 0, nextId: 1,
    message: 'The stack is empty. top is nullptr.', activeLine: 'IntStack s;', history: [], pending: [],
  }
}

export function startPush(state: StackState, value: number): StackState {
  if (state.pending.length > 0) return state
  if (state.count >= STACK_CAP) {
    return { ...state, message: 'This demo is capped at 8 values so every node stays visible.' }
  }
  const node: StackNode = { id: state.nextId, value, next: state.topId, status: 'new' }
  return {
    ...state,
    nodes: [node, ...state.nodes],
    nextId: state.nextId + 1,
    message: `Created a new node for ${value}. Its next pointer holds the old top.`,
    activeLine: 'top = new Node{value, top};',
    pending: ['finish-push'],
  }
}

export function startPop(state: StackState): StackState {
  if (state.pending.length > 0) return state
  if (state.topId === null) {
    return { ...state, message: EMPTY_POP_MESSAGE, activeLine: 'if (!s.isEmpty()) s.pop();' }
  }
  const old = state.nodes.find((node) => node.id === state.topId)
  if (!old) return state
  return {
    ...state,
    saved: { id: old.id, value: old.value, next: old.next },
    message: `Saved value ${old.value} and the next address before changing the stack.`,
    activeLine: 'Node* old = top; int value = old->value;',
    // Same order as IntStack::pop: read next and move top before deleting.
    pending: ['move-top', 'delete-old', 'decrement', 'return'],
  }
}

export function peek(state: StackState): StackState {
  if (state.pending.length > 0) return state
  if (state.topId === null) {
    return { ...state, message: EMPTY_PEEK_MESSAGE, activeLine: 'if (!s.isEmpty()) s.peek();' }
  }
  const top = state.nodes.find((node) => node.id === state.topId)
  if (!top) return state
  return {
    ...state,
    message: `peek() returned ${top.value}. The stack did not change.`,
    activeLine: 'return top->value;',
    history: [...state.history, `peek() returned ${top.value}`],
  }
}

export function advanceAnimation(state: StackState): StackState {
  const [action, ...pending] = state.pending
  if (!action) return state
  if (action === 'finish-push') {
    const newest = state.nodes[0]
    if (!newest) return { ...state, pending: [] }
    return {
      ...state,
      nodes: state.nodes.map((node) => node.id === newest.id ? { ...node, status: 'active' } : node),
      topId: newest.id,
      count: state.count + 1,
      message: `top now points to ${newest.value}, and count is ${state.count + 1}.`,
      activeLine: '++count;',
      history: [...state.history, `push(${newest.value})`],
      pending,
    }
  }
  const saved = state.saved
  if (!saved) return { ...state, pending: [] }
  if (action === 'delete-old') {
    return {
      ...state,
      nodes: state.nodes.map((node) => node.id === saved.id ? { ...node, status: 'deleting' } : node),
      message: `Deleted the old top node that held ${saved.value}.`,
      activeLine: 'delete old;', pending,
    }
  }
  if (action === 'move-top') {
    return {
      ...state, topId: saved.next,
      message: saved.next === null
        ? 'top moved to old->next, which is nullptr. The old node still exists.'
        : 'top moved to old->next, the node below. The old node still exists.',
      activeLine: 'top = old->next;', pending,
    }
  }
  if (action === 'decrement') {
    return {
      ...state, count: state.count - 1,
      message: `count decreased to ${state.count - 1}.`, activeLine: '--count;', pending,
    }
  }
  return {
    ...state,
    nodes: state.nodes.filter((node) => node.id !== saved.id),
    message: `pop() returned ${saved.value}`,
    activeLine: 'return value;',
    history: [...state.history, `pop() returned ${saved.value}`],
    pending,
    saved: undefined,
  }
}

export function settle(state: StackState): StackState {
  let result = state
  while (result.pending.length > 0) result = advanceAnimation(result)
  return result
}

export function valuesFromTop(state: StackState): number[] {
  const values: number[] = []
  let id = state.topId
  while (id !== null) {
    const node = state.nodes.find((candidate) => candidate.id === id)
    if (!node || node.status === 'deleting') break
    values.push(node.value)
    id = node.next
  }
  return values
}
