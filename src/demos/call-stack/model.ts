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
  note?: string
}

export interface CallStep {
  line: number
  frames: CallFrame[]
  explanation: string
  console: string[]
}

export interface CallProgram {
  id: 'add' | 'nested' | 'destructors' | 'countdown' | 'factorial' | 'printBackward'
  title: string
  source: string[]
  steps: CallStep[]
  expectedConsole: string[]
}

const variable = (name: string, value: string, role: StackVariable['role'] = 'local'): StackVariable => ({ name, value, role })
const frame = (id: string, functionName: string, returnsTo: string, variables: StackVariable[] = [], note?: string): CallFrame => ({ id, functionName, returnsTo, variables, ...(note === undefined ? {} : { note }) })
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

const countdownSource = [
  '#include <iostream>', '',
  'void countdown(int n) {',
  '    if (n < 0) {           // base case: nothing left to print',
  '        return;',
  '    }',
  '    std::cout << n << \'\\n\';',
  '    countdown(n - 1);      // recursive case: a smaller countdown',
  '}', '',
  'int main() {',
  '    countdown(2);',
  '    return 0;',
  '}',
]

const countdownSteps: CallStep[] = [
  step(11, [frame('cd-main', 'main', 'operating system')], 'main starts, so its frame is pushed.'),
  step(12, [
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'countdown(2) is called. This frame has its own n, set to 2.'),
  step(4, [
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'This frame checks its own n. For n = 2, the base case is false.'),
  step(7, [
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The frame with n = 2 prints 2.', ['2']),
  step(8, [
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'A new countdown frame is pushed with its own n, set to 1.', ['2']),
  step(4, [
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The new frame checks its own n. For n = 1, the base case is false.', ['2']),
  step(7, [
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The frame with n = 1 prints 1.', ['2', '1']),
  step(8, [
    frame('cd-0', 'countdown', 'countdown, line 8', [variable('n', '0', 'parameter')]),
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'A new countdown frame is pushed with its own n, set to 0.', ['2', '1']),
  step(4, [
    frame('cd-0', 'countdown', 'countdown, line 8', [variable('n', '0', 'parameter')]),
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The new frame checks its own n. For n = 0, the base case is false.', ['2', '1']),
  step(7, [
    frame('cd-0', 'countdown', 'countdown, line 8', [variable('n', '0', 'parameter')]),
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The frame with n = 0 prints 0.', ['2', '1', '0']),
  step(8, [
    frame('cd-neg1', 'countdown', 'countdown, line 8', [variable('n', '-1', 'parameter')]),
    frame('cd-0', 'countdown', 'countdown, line 8', [variable('n', '0', 'parameter')]),
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'This is the deepest point. Each countdown frame has its own n; these are four separate variables.', ['2', '1', '0']),
  step(4, [
    frame('cd-neg1', 'countdown', 'countdown, line 8', [variable('n', '-1', 'parameter')]),
    frame('cd-0', 'countdown', 'countdown, line 8', [variable('n', '0', 'parameter')]),
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The top frame checks its own n. For n = -1, the base case is true.', ['2', '1', '0']),
  step(5, [
    frame('cd-neg1', 'countdown', 'countdown, line 8', [variable('n', '-1', 'parameter')]),
    frame('cd-0', 'countdown', 'countdown, line 8', [variable('n', '0', 'parameter')]),
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The frame with n = -1 returns without printing.', ['2', '1', '0']),
  step(9, [
    frame('cd-0', 'countdown', 'countdown, line 8', [variable('n', '0', 'parameter')]),
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The n = -1 frame pops. The frame with its own n = 0 reaches its closing brace.', ['2', '1', '0']),
  step(9, [
    frame('cd-1', 'countdown', 'countdown, line 8', [variable('n', '1', 'parameter')]),
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The n = 0 frame pops. The frame with its own n = 1 reaches its closing brace.', ['2', '1', '0']),
  step(9, [
    frame('cd-2', 'countdown', 'main, line 12', [variable('n', '2', 'parameter')]),
    frame('cd-main', 'main', 'operating system'),
  ], 'The n = 1 frame pops. The frame with its own n = 2 reaches its closing brace.', ['2', '1', '0']),
  step(12, [frame('cd-main', 'main', 'operating system')], 'The n = 2 frame pops, and main resumes.', ['2', '1', '0']),
  step(13, [frame('cd-main', 'main', 'operating system')], 'main reaches return 0.', ['2', '1', '0']),
  step(14, [], 'main returns, leaving the call stack empty.', ['2', '1', '0']),
]

const factorialSource = [
  '#include <iostream>', '',
  'int factorial(int n) {',
  '    if (n == 0) {                    // base case',
  '        return 1;',
  '    }',
  '    return n * factorial(n - 1);     // recursive case',
  '}', '',
  'int main() {',
  '    std::cout << "3! = " << factorial(3) << \'\\n\';',
  '    return 0;',
  '}',
]

const factorialSteps: CallStep[] = [
  step(10, [frame('fact-main', 'main', 'operating system')], 'main starts, so its frame is pushed.'),
  step(11, [
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')]),
    frame('fact-main', 'main', 'operating system'),
  ], 'The output line calls factorial(3). This frame has its own n, set to 3.'),
  step(4, [
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')], 'needs 3 * factorial(2)'),
    frame('fact-main', 'main', 'operating system'),
  ], 'The base case is false for n = 3. This frame must wait for factorial(2).'),
  step(7, [
    frame('fact-2', 'factorial', 'factorial, line 7', [variable('n', '2', 'parameter')], 'needs 2 * factorial(1)'),
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')], 'needs 3 * factorial(2)'),
    frame('fact-main', 'main', 'operating system'),
  ], 'factorial(2) is pushed with its own n. It must wait for factorial(1).'),
  step(7, [
    frame('fact-1', 'factorial', 'factorial, line 7', [variable('n', '1', 'parameter')], 'needs 1 * factorial(0)'),
    frame('fact-2', 'factorial', 'factorial, line 7', [variable('n', '2', 'parameter')], 'needs 2 * factorial(1)'),
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')], 'needs 3 * factorial(2)'),
    frame('fact-main', 'main', 'operating system'),
  ], 'factorial(1) is pushed with its own n. It must wait for factorial(0).'),
  step(7, [
    frame('fact-0', 'factorial', 'factorial, line 7', [variable('n', '0', 'parameter')]),
    frame('fact-1', 'factorial', 'factorial, line 7', [variable('n', '1', 'parameter')], 'needs 1 * factorial(0)'),
    frame('fact-2', 'factorial', 'factorial, line 7', [variable('n', '2', 'parameter')], 'needs 2 * factorial(1)'),
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')], 'needs 3 * factorial(2)'),
    frame('fact-main', 'main', 'operating system'),
  ], 'This is the deepest point. Each factorial frame has its own n.'),
  step(5, [
    frame('fact-0', 'factorial', 'factorial, line 7', [variable('n', '0', 'parameter')], 'returns 1 (base case)'),
    frame('fact-1', 'factorial', 'factorial, line 7', [variable('n', '1', 'parameter')], 'needs 1 * factorial(0)'),
    frame('fact-2', 'factorial', 'factorial, line 7', [variable('n', '2', 'parameter')], 'needs 2 * factorial(1)'),
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')], 'needs 3 * factorial(2)'),
    frame('fact-main', 'main', 'operating system'),
  ], 'For n = 0, the base case is true, so this frame returns 1.'),
  step(7, [
    frame('fact-1', 'factorial', 'factorial, line 7', [variable('n', '1', 'parameter')], 'returns 1 * 1 = 1'),
    frame('fact-2', 'factorial', 'factorial, line 7', [variable('n', '2', 'parameter')], 'needs 2 * factorial(1)'),
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')], 'needs 3 * factorial(2)'),
    frame('fact-main', 'main', 'operating system'),
  ], 'The n = 0 frame pops. The n = 1 frame finishes its multiplication.'),
  step(7, [
    frame('fact-2', 'factorial', 'factorial, line 7', [variable('n', '2', 'parameter')], 'returns 2 * 1 = 2'),
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')], 'needs 3 * factorial(2)'),
    frame('fact-main', 'main', 'operating system'),
  ], 'The n = 1 frame pops. The n = 2 frame finishes its multiplication.'),
  step(7, [
    frame('fact-3', 'factorial', 'main, line 11', [variable('n', '3', 'parameter')], 'returns 3 * 2 = 6'),
    frame('fact-main', 'main', 'operating system'),
  ], 'The n = 2 frame pops. The n = 3 frame finishes its multiplication.'),
  step(11, [frame('fact-main', 'main', 'operating system')], 'factorial(3) returns 6, and only then does the line print.', ['3! = 6']),
  step(13, [], 'main returns, leaving the call stack empty.', ['3! = 6']),
]

const printBackwardSource = [
  '#include <iostream>', '',
  'struct Node {',
  '    int value;',
  '    Node* next;',
  '};', '',
  'void printBackward(const Node* head) {',
  '    if (head == nullptr) {',
  '        return;',
  '    }',
  '    printBackward(head->next);           // first, print the rest of the list backward',
  '    std::cout << head->value << \' \';     // then print this node',
  '}', '',
  'void deleteReadings(Node* head) {',
  '    while (head != nullptr) {',
  '        Node* following = head->next;',
  '        delete head;',
  '        head = following;',
  '    }',
  '}', '',
  'int main() {',
  '    Node* head = nullptr;',
  '    head = new Node{2, head};',
  '    head = new Node{9, head};',
  '    head = new Node{5, head};',
  '',
  '    printBackward(head);',
  '    std::cout << \'\\n\';',
  '',
  '    deleteReadings(head);',
  '    head = nullptr;',
  '    return 0;',
  '}',
]

const printBackwardSteps: CallStep[] = [
  step(24, [frame('print-main', 'main', 'operating system')], 'main starts with no local variables yet.'),
  step(25, [frame('print-main', 'main', 'operating system', [variable('head', '→ nullptr')])], 'The local pointer head starts as nullptr.'),
  step(26, [frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 2')])], 'The new node points to the old head, nullptr. The arrow means head points to the node holding 2.'),
  step(27, [frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 9')])], 'The new node points to the node holding 2.'),
  step(28, [frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')])], 'The new node goes at the front. The list is now 5 -> 9 -> 2.'),
  step(30, [
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'printBackward is called with head pointing to the node holding 5.'),
  step(9, [
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'For the node holding 5, the base case is false.'),
  step(12, [
    frame('print-9', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 9', 'parameter')]),
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'The recursive call pushes a frame for the node holding 9.'),
  step(12, [
    frame('print-2', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 2', 'parameter')]),
    frame('print-9', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 9', 'parameter')]),
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'The base case is false for 9, so a frame is pushed for the node holding 2.'),
  step(12, [
    frame('print-null', 'printBackward', 'printBackward, line 12', [variable('head', '→ nullptr', 'parameter')]),
    frame('print-2', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 2', 'parameter')]),
    frame('print-9', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 9', 'parameter')]),
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'The base case is false for 2, so the nullptr frame is pushed. This is the deepest point.'),
  step(10, [
    frame('print-null', 'printBackward', 'printBackward, line 12', [variable('head', '→ nullptr', 'parameter')]),
    frame('print-2', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 2', 'parameter')]),
    frame('print-9', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 9', 'parameter')]),
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'The base case is true, so the nullptr frame returns. Nothing has printed yet.'),
  step(13, [
    frame('print-2', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 2', 'parameter')]),
    frame('print-9', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 9', 'parameter')]),
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'Only after the call on the rest returns does this frame print 2.', ['2 ']),
  step(13, [
    frame('print-9', 'printBackward', 'printBackward, line 12', [variable('head', '→ node holding 9', 'parameter')]),
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'Only after the call on the rest returns does this frame print 9.', ['2 9 ']),
  step(13, [
    frame('print-5', 'printBackward', 'main, line 30', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'Only after the call on the rest returns does this frame print 5.', ['2 9 5 ']),
  step(31, [frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')])], 'The printBackward frame pops, and main prints a newline.', ['2 9 5 ']),
  step(33, [
    frame('delete-5', 'deleteReadings', 'main, line 33', [variable('head', '→ node holding 5', 'parameter')]),
    frame('print-main', 'main', 'operating system', [variable('head', '→ node holding 5')]),
  ], 'deleteReadings deletes every node, one at a time.', ['2 9 5 ']),
  step(22, [frame('print-main', 'main', 'operating system', [variable('head', 'dangling pointer')])], 'deleteReadings finishes and its frame pops. main still needs to clear its pointer.', ['2 9 5 ']),
  step(34, [frame('print-main', 'main', 'operating system', [variable('head', '→ nullptr')])], 'main sets its local head to nullptr.', ['2 9 5 ']),
  step(36, [], 'main returns, leaving the call stack empty.', ['2 9 5 ']),
]

export const callPrograms: CallProgram[] = [
  { id: 'add', title: 'Adding two numbers', source: addSource, steps: addSteps, expectedConsole: ['Result: 8'] },
  { id: 'nested', title: 'Calls inside calls', source: nestedSource, steps: nestedSteps, expectedConsole: ['Total: 25'] },
  {
    id: 'destructors', title: 'Destructors when a frame is popped', source: destructorSource, steps: destructorSteps,
    expectedConsole: ['Before doWork', 'A created', 'B created', 'Inside doWork', 'B destroyed', 'A destroyed', 'After doWork'],
  },
  { id: 'countdown', title: 'Recursion: countdown', source: countdownSource, steps: countdownSteps, expectedConsole: ['2', '1', '0'] },
  { id: 'factorial', title: 'Recursion: factorial', source: factorialSource, steps: factorialSteps, expectedConsole: ['3! = 6'] },
  { id: 'printBackward', title: 'Recursion: printing a list backward', source: printBackwardSource, steps: printBackwardSteps, expectedConsole: ['2 9 5 '] },
]

export function nextStep(index: number, program: CallProgram): number {
  return Math.min(index + 1, program.steps.length - 1)
}

export function previousStep(index: number): number {
  return Math.max(0, index - 1)
}
