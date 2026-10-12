export interface StackVariable {
  name: string
  value: string
  role: 'parameter' | 'local' | 'object'
}

export interface CallFrame {
  id: string
  functionName: string
  returnsTo: string
  variables: StackVariable[]
}

export interface CallStep {
  line: number
  frames: CallFrame[]
  explanation: string
  console: string[]
}

export interface CallProgram {
  id: 'add' | 'nested' | 'destructors'
  title: string
  source: string[]
  steps: CallStep[]
  expectedConsole: string[]
}

const variable = (name: string, value: string, role: StackVariable['role'] = 'local'): StackVariable => ({ name, value, role })
const frame = (id: string, functionName: string, returnsTo: string, variables: StackVariable[] = []): CallFrame => ({ id, functionName, returnsTo, variables })
const step = (line: number, frames: CallFrame[], explanation: string, console: string[] = []): CallStep => ({ line, frames, explanation, console })

const addSource = [
  '#include <iostream>', '', 'int add(int a, int b) {', '  int sum = a + b;', '  return sum;', '}', '',
  'int main() {', '  int x = 5;', '  int y = 3;', '  int result = add(x, y);',
  '  std::cout << "Result: " << result << \'\\n\';', '  return 0;', '}',
]

const addSteps: CallStep[] = [
  step(8, [frame('main', 'main', 'operating system')], 'main starts, so its frame is pushed onto the call stack.'),
  step(9, [frame('main', 'main', 'operating system', [variable('x', '5')])], 'The local variable x receives 5.'),
  step(10, [frame('main', 'main', 'operating system', [variable('x', '5'), variable('y', '3')])], 'The local variable y receives 3.'),
  step(11, [
    frame('add', 'add', 'main, line 11', [variable('a', '5', 'parameter'), variable('b', '3', 'parameter'), variable('sum', '?')]),
    frame('main', 'main', 'operating system', [variable('x', '5'), variable('y', '3'), variable('result', '?')]),
  ], 'Calling add pushes a frame. Parameters a and b receive COPIES of x and y.'),
  step(4, [
    frame('add', 'add', 'main, line 11', [variable('a', '5', 'parameter'), variable('b', '3', 'parameter'), variable('sum', '8')]),
    frame('main', 'main', 'operating system', [variable('x', '5'), variable('y', '3'), variable('result', '?')]),
  ], 'add computes its local variable sum.'),
  step(5, [
    frame('add', 'add', 'main, line 11', [variable('a', '5', 'parameter'), variable('b', '3', 'parameter'), variable('sum', '8')]),
    frame('main', 'main', 'operating system', [variable('x', '5'), variable('y', '3'), variable('result', '?')]),
  ], 'add prepares to return 8.'),
  step(11, [frame('main', 'main', 'operating system', [variable('x', '5'), variable('y', '3'), variable('result', '8')])], 'The add frame is popped, and the returned value lands in result.'),
  step(12, [frame('main', 'main', 'operating system', [variable('x', '5'), variable('y', '3'), variable('result', '8')])], 'The program prints the result.', ['Result: 8']),
  step(13, [], 'main returns, so the final frame is popped.', ['Result: 8']),
]

const nestedSource = [
  '#include <iostream>', '', 'int square(int n) {', '  int result = n * n;', '  return result;', '}', '',
  'int sumOfSquares(int a, int b) {', '  int first = square(a);', '  int second = square(b);',
  '  return first + second;', '}', '', 'int main() {', '  int total = sumOfSquares(3, 4);',
  '  std::cout << "Total: " << total << \'\\n\';', '  return 0;', '}',
]

const nestedSteps: CallStep[] = [
  step(14, [frame('main', 'main', 'operating system')], 'main starts and its frame is pushed.'),
  step(15, [
    frame('sum', 'sumOfSquares', 'main, line 15', [variable('a', '3', 'parameter'), variable('b', '4', 'parameter'), variable('first', '?'), variable('second', '?')]),
    frame('main', 'main', 'operating system', [variable('total', '?')]),
  ], 'sumOfSquares is called. Its parameters receive COPIES of 3 and 4.'),
  step(9, [
    frame('square-a', 'square', 'sumOfSquares, line 9', [variable('n', '3', 'parameter'), variable('result', '?')]),
    frame('sum', 'sumOfSquares', 'main, line 15', [variable('a', '3', 'parameter'), variable('b', '4', 'parameter'), variable('first', '?'), variable('second', '?')]),
    frame('main', 'main', 'operating system', [variable('total', '?')]),
  ], 'square is called. Parameter n receives a COPY of a, making three frames deep.'),
  step(4, [
    frame('square-a', 'square', 'sumOfSquares, line 9', [variable('n', '3', 'parameter'), variable('result', '9')]),
    frame('sum', 'sumOfSquares', 'main, line 15', [variable('a', '3', 'parameter'), variable('b', '4', 'parameter'), variable('first', '?'), variable('second', '?')]),
    frame('main', 'main', 'operating system', [variable('total', '?')]),
  ], 'The first square frame computes 9.'),
  step(9, [
    frame('sum', 'sumOfSquares', 'main, line 15', [variable('a', '3', 'parameter'), variable('b', '4', 'parameter'), variable('first', '9'), variable('second', '?')]),
    frame('main', 'main', 'operating system', [variable('total', '?')]),
  ], 'The first square frame is popped, and 9 lands in first.'),
  step(10, [
    frame('square-b', 'square', 'sumOfSquares, line 10', [variable('n', '4', 'parameter'), variable('result', '?')]),
    frame('sum', 'sumOfSquares', 'main, line 15', [variable('a', '3', 'parameter'), variable('b', '4', 'parameter'), variable('first', '9'), variable('second', '?')]),
    frame('main', 'main', 'operating system', [variable('total', '?')]),
  ], 'square is pushed again. Parameter n receives a COPY of b.'),
  step(4, [
    frame('square-b', 'square', 'sumOfSquares, line 10', [variable('n', '4', 'parameter'), variable('result', '16')]),
    frame('sum', 'sumOfSquares', 'main, line 15', [variable('a', '3', 'parameter'), variable('b', '4', 'parameter'), variable('first', '9'), variable('second', '?')]),
    frame('main', 'main', 'operating system', [variable('total', '?')]),
  ], 'The second square frame computes 16.'),
  step(10, [
    frame('sum', 'sumOfSquares', 'main, line 15', [variable('a', '3', 'parameter'), variable('b', '4', 'parameter'), variable('first', '9'), variable('second', '16')]),
    frame('main', 'main', 'operating system', [variable('total', '?')]),
  ], 'The second square frame is popped, and 16 lands in second.'),
  step(11, [
    frame('sum', 'sumOfSquares', 'main, line 15', [variable('a', '3', 'parameter'), variable('b', '4', 'parameter'), variable('first', '9'), variable('second', '16')]),
    frame('main', 'main', 'operating system', [variable('total', '?')]),
  ], 'sumOfSquares prepares to return 25.'),
  step(15, [frame('main', 'main', 'operating system', [variable('total', '25')])], 'The sumOfSquares frame is popped, and 25 lands in total.'),
  step(16, [frame('main', 'main', 'operating system', [variable('total', '25')])], 'The program prints the total.', ['Total: 25']),
  step(17, [], 'main returns, leaving the call stack empty.', ['Total: 25']),
]

const destructorSource = [
  '#include <iostream>', '#include <string>', '', 'class Logger {', '  std::string name;', 'public:',
  '  Logger(std::string n) : name(n) { std::cout << name << " created\\n"; }',
  '  ~Logger() { std::cout << name << " destroyed\\n"; }', '};', '',
  'void doWork() {', '  Logger a("A");', '  Logger b("B");', '  std::cout << "Inside doWork\\n";', '}', '',
  'int main() {', '  std::cout << "Before doWork\\n";', '  doWork();',
  '  std::cout << "After doWork\\n";', '  return 0;', '}',
]

const destructorSteps: CallStep[] = [
  step(17, [frame('main', 'main', 'operating system')], 'main starts and its frame is pushed.'),
  step(18, [frame('main', 'main', 'operating system')], 'The program prints before the function call.', ['Before doWork']),
  step(19, [frame('work', 'doWork', 'main, line 19'), frame('main', 'main', 'operating system')], 'Calling doWork pushes its frame.' , ['Before doWork']),
  step(12, [frame('work', 'doWork', 'main, line 19', [variable('a', 'Logger("A")', 'object')]), frame('main', 'main', 'operating system')], 'Local object a is created.', ['Before doWork', 'A created']),
  step(13, [frame('work', 'doWork', 'main, line 19', [variable('a', 'Logger("A")', 'object'), variable('b', 'Logger("B")', 'object')]), frame('main', 'main', 'operating system')], 'Local object b is created after a.', ['Before doWork', 'A created', 'B created']),
  step(14, [frame('work', 'doWork', 'main, line 19', [variable('a', 'Logger("A")', 'object'), variable('b', 'Logger("B")', 'object')]), frame('main', 'main', 'operating system')], 'doWork prints its message.', ['Before doWork', 'A created', 'B created', 'Inside doWork']),
  step(15, [frame('work', 'doWork', 'main, line 19', [variable('a', 'Logger("A")', 'object')]), frame('main', 'main', 'operating system')], 'The frame is leaving: b is destroyed first because it was created last.', ['Before doWork', 'A created', 'B created', 'Inside doWork', 'B destroyed']),
  step(15, [frame('main', 'main', 'operating system')], 'Then a is destroyed. Last created, first destroyed; now the doWork frame is popped.', ['Before doWork', 'A created', 'B created', 'Inside doWork', 'B destroyed', 'A destroyed']),
  step(20, [frame('main', 'main', 'operating system')], 'Execution returns to main and prints the final line.', ['Before doWork', 'A created', 'B created', 'Inside doWork', 'B destroyed', 'A destroyed', 'After doWork']),
  step(21, [], 'main returns, leaving the call stack empty.', ['Before doWork', 'A created', 'B created', 'Inside doWork', 'B destroyed', 'A destroyed', 'After doWork']),
]

export const callPrograms: CallProgram[] = [
  { id: 'add', title: 'Adding two numbers', source: addSource, steps: addSteps, expectedConsole: ['Result: 8'] },
  { id: 'nested', title: 'Calls inside calls', source: nestedSource, steps: nestedSteps, expectedConsole: ['Total: 25'] },
  {
    id: 'destructors', title: 'Destructors when a frame is popped', source: destructorSource, steps: destructorSteps,
    expectedConsole: ['Before doWork', 'A created', 'B created', 'Inside doWork', 'B destroyed', 'A destroyed', 'After doWork'],
  },
]

export function nextStep(index: number, program: CallProgram): number {
  return Math.min(index + 1, program.steps.length - 1)
}

export function previousStep(index: number): number {
  return Math.max(0, index - 1)
}
