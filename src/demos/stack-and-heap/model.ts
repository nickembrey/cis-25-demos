export const STACK_LIMIT_BYTES = 8_388_608

export interface MemoryVariable {
  name: string
  value: string
  bytes: number
  address?: string
  status?: 'dangling'
}

export interface MemoryFrame {
  id: string
  name: string
  bytes: number
  variables: MemoryVariable[]
}

export interface HeapBlock {
  address: string
  contents: string
  bytes: number
  status: 'allocated' | 'freed' | 'leaked'
  nextAddress?: string | null
}

export interface MemoryStep {
  line: number
  frames: MemoryFrame[]
  blocks: HeapBlock[]
  explanation: string
  crashed?: boolean
}

export interface MemoryScenario {
  id: 'pointer' | 'int-stack' | 'leak' | 'overflow' | 'heap-fix'
  title: string
  source: string[]
  steps: MemoryStep[]
}

const memoryVariable = (name: string, value: string, bytes: number, address?: string, status?: 'dangling'): MemoryVariable => ({ name, value, bytes, address, status })
const memoryFrame = (id: string, name: string, variables: MemoryVariable[]): MemoryFrame => ({ id, name, variables, bytes: variables.reduce((total, item) => total + item.bytes, 0) })
const block = (address: string, contents: string, bytes: number, status: HeapBlock['status'] = 'allocated', nextAddress?: string | null): HeapBlock => ({ address, contents, bytes, status, nextAddress })
const memoryStep = (line: number, frames: MemoryFrame[], blocks: HeapBlock[], explanation: string, crashed = false): MemoryStep => ({ line, frames, blocks, explanation, crashed })

const pointerSource = [
  'void example() {', '  int x = 10;', '  int* p = new int(20);', '  delete p;', '}', '',
  'int main() {', '  example();', '  return 0;', '}',
]
const pointerSteps = [
  memoryStep(7, [memoryFrame('main', 'main', [])], [], 'main starts.'),
  memoryStep(2, [memoryFrame('example', 'example', [memoryVariable('x', '10', 4), memoryVariable('p', '?', 8)]), memoryFrame('main', 'main', [])], [], 'example has a 4-byte int and an 8-byte pointer in its frame.'),
  memoryStep(3, [memoryFrame('example', 'example', [memoryVariable('x', '10', 4), memoryVariable('p', '0x7a10', 8, '0x7a10')]), memoryFrame('main', 'main', [])], [block('0x7a10', 'int 20', 4)], 'new creates the int on the heap; p stores its address.'),
  memoryStep(4, [memoryFrame('example', 'example', [memoryVariable('x', '10', 4), memoryVariable('p', '0x7a10', 8, '0x7a10', 'dangling')]), memoryFrame('main', 'main', [])], [block('0x7a10', 'int 20', 4, 'freed')], 'delete frees the heap block. p still holds the old address, so it is dangling.'),
  memoryStep(5, [memoryFrame('main', 'main', [])], [block('0x7a10', 'int 20', 4, 'freed')], 'The example frame is popped, so x and p are gone.'),
  memoryStep(9, [], [block('0x7a10', 'int 20', 4, 'freed')], 'main returns and the call stack is empty.'),
]

const stackSource = [
  'IntStack::~IntStack() {', '  while (!isEmpty()) { pop(); }', '}', '',
  'int main() {', '  IntStack readings;', '  readings.push(2);', '  readings.push(9);',
  '  readings.push(5);', '  return 0;', '}',
]
const readings = (top: string, count: number) => memoryVariable('readings', `{ top: ${top}, count: ${count} }`, 16, top === 'nullptr' ? undefined : top)
const stackBlocks = (states: Array<[string, number, HeapBlock['status'], string | null]>): HeapBlock[] => states.map(([address, value, status, next]) => block(address, `Node { value: ${value} }`, 16, status, next))
const stackSteps = [
  memoryStep(6, [memoryFrame('main', 'main', [readings('nullptr', 0)])], [], 'readings is a 16-byte IntStack object in main: 16 bytes.'),
  memoryStep(7, [memoryFrame('main', 'main', [readings('0x7a10', 1)])], stackBlocks([['0x7a10', 2, 'allocated', null]]), 'push creates a 16-byte Node on the heap and moves top to it.'),
  memoryStep(8, [memoryFrame('main', 'main', [readings('0x7a20', 2)])], stackBlocks([['0x7a20', 9, 'allocated', '0x7a10'], ['0x7a10', 2, 'allocated', null]]), 'The new node points to the old top node.'),
  memoryStep(9, [memoryFrame('main', 'main', [readings('0x7a30', 3)])], stackBlocks([['0x7a30', 5, 'allocated', '0x7a20'], ['0x7a20', 9, 'allocated', '0x7a10'], ['0x7a10', 2, 'allocated', null]]), 'A third heap node becomes the top.'),
  memoryStep(2, [memoryFrame('main', 'main', [readings('0x7a20', 2)])], stackBlocks([['0x7a30', 5, 'freed', '0x7a20'], ['0x7a20', 9, 'allocated', '0x7a10'], ['0x7a10', 2, 'allocated', null]]), 'At the end of main, the destructor pops and deletes the node holding 5.'),
  memoryStep(2, [memoryFrame('main', 'main', [readings('0x7a10', 1)])], stackBlocks([['0x7a30', 5, 'freed', '0x7a20'], ['0x7a20', 9, 'freed', '0x7a10'], ['0x7a10', 2, 'allocated', null]]), 'The destructor deletes the node holding 9.'),
  memoryStep(2, [memoryFrame('main', 'main', [readings('nullptr', 0)])], stackBlocks([['0x7a30', 5, 'freed', '0x7a20'], ['0x7a20', 9, 'freed', '0x7a10'], ['0x7a10', 2, 'freed', null]]), 'The destructor deletes the final node. Without this destructor, all three nodes would leak.'),
  memoryStep(10, [], stackBlocks([['0x7a30', 5, 'freed', '0x7a20'], ['0x7a20', 9, 'freed', '0x7a10'], ['0x7a10', 2, 'freed', null]]), 'The IntStack object is destroyed and main is popped.'),
]

const leakSource = [
  'void makeReading() {', '  int* p = new int(72);', '}', '',
  'int main() {', '  makeReading();', '  return 0;', '}',
]
const leakSteps = [
  memoryStep(5, [memoryFrame('main', 'main', [])], [], 'main starts.'),
  memoryStep(2, [memoryFrame('reading', 'makeReading', [memoryVariable('p', '0x7a10', 8, '0x7a10')]), memoryFrame('main', 'main', [])], [block('0x7a10', 'int 72', 4)], 'p points to a new heap int.'),
  memoryStep(3, [memoryFrame('main', 'main', [])], [block('0x7a10', 'int 72', 4, 'leaked')], 'The frame is popped. No pointer can reach the allocated block, so it is leaked.'),
  memoryStep(7, [], [block('0x7a10', 'int 72', 4, 'leaked')], 'main returns, but the leaked heap block remains allocated.'),
]

const overflowSource = [
  'void recordReadings() {', '  int readings[10000000];', '  std::cout << "recording\\n";', '}', '',
  'int main() {', '  recordReadings();', '  return 0;', '}',
]
const overflowSteps = [
  memoryStep(6, [memoryFrame('main', 'main', [])], [], 'main starts.'),
  memoryStep(2, [memoryFrame('record', 'recordReadings', [memoryVariable('readings[10000000]', 'array', 40_000_000)]), memoryFrame('main', 'main', [])], [], 'The frame would need 40,000,000 bytes, far beyond the 8 MB stack limit.', true),
]

const heapFixSource = [
  'void recordReadings() {', '  int* readings = new int[10000000];', '  // use readings',
  '  delete[] readings;', '}', '', 'int main() {', '  recordReadings();', '  return 0;', '}',
]
const heapFixSteps = [
  memoryStep(7, [memoryFrame('main', 'main', [])], [], 'main starts.'),
  memoryStep(1, [memoryFrame('record', 'recordReadings', [memoryVariable('readings', '?', 8)]), memoryFrame('main', 'main', [])], [], 'The frame reserves only 8 bytes for a pointer.'),
  memoryStep(2, [memoryFrame('record', 'recordReadings', [memoryVariable('readings', '0x7a10', 8, '0x7a10')]), memoryFrame('main', 'main', [])], [block('0x7a10', '10,000,000 ints', 40_000_000)], 'new[] places the 40 MB array on the heap.'),
  memoryStep(4, [memoryFrame('record', 'recordReadings', [memoryVariable('readings', '0x7a10', 8, '0x7a10', 'dangling')]), memoryFrame('main', 'main', [])], [block('0x7a10', '10,000,000 ints', 40_000_000, 'freed')], 'delete[] frees the whole array; the old address in readings is now dangling.'),
  memoryStep(5, [memoryFrame('main', 'main', [])], [block('0x7a10', '10,000,000 ints', 40_000_000, 'freed')], 'recordReadings returns and its pointer is gone.'),
  memoryStep(9, [], [block('0x7a10', '10,000,000 ints', 40_000_000, 'freed')], 'main returns and the call stack is empty.'),
]

export const memoryScenarios: MemoryScenario[] = [
  { id: 'pointer', title: 'A pointer on the stack, an int on the heap', source: pointerSource, steps: pointerSteps },
  { id: 'int-stack', title: 'IntStack: object on the stack, nodes on the heap', source: stackSource, steps: stackSteps },
  { id: 'leak', title: 'A memory leak', source: leakSource, steps: leakSteps },
  { id: 'overflow', title: 'Too big for the stack — crash', source: overflowSource, steps: overflowSteps },
  { id: 'heap-fix', title: 'Too big for the stack — heap fix', source: heapFixSource, steps: heapFixSteps },
]

export function totalStackBytes(step: MemoryStep): number {
  return step.frames.reduce((total, frame) => total + frame.bytes, 0)
}

export function nextMemoryStep(index: number, scenario: MemoryScenario): number {
  return Math.min(index + 1, scenario.steps.length - 1)
}

export function previousMemoryStep(index: number): number {
  return Math.max(0, index - 1)
}
