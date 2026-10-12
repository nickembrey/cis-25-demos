class DataStructureApp {
    constructor() {
        this.initTabs();
        this.initPart1();
        this.initPart2();
        this.initPart3();
        this.initPart4();
    }

    initTabs() {
        // Main Tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
            });
        });

        // Sub Tabs (Basics)
        document.querySelectorAll('#basics .sub-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#basics .sub-nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.switchBasicsMode(btn.dataset.subtab);
            });
        });

        // Sub Tabs (Memory)
        document.querySelectorAll('#memory .sub-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#memory .sub-nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.switchMemoryMode(btn.dataset.memtab);
            });
        });
    }

    // ==========================================
    // PART 1: BASICS
    // ==========================================
    initPart1() {
        this.basicsData = [];
        this.basicsMode = 'stack'; // stack, queue, deque
        this.visualizer = document.getElementById('basics-visualizer');

        // Stack Controls
        document.querySelector('.push').addEventListener('click', () => {
            const val = document.getElementById('stack-input').value || Math.floor(Math.random() * 100);
            this.basicsPush(val);
            document.getElementById('stack-input').value = '';
        });
        document.querySelector('.pop').addEventListener('click', () => this.basicsPop());

        // Queue Controls
        document.querySelector('.enqueue').addEventListener('click', () => {
            const val = document.getElementById('queue-input').value || Math.floor(Math.random() * 100);
            this.basicsEnqueue(val);
            document.getElementById('queue-input').value = '';
        });
        document.querySelector('.dequeue').addEventListener('click', () => this.basicsDequeue());

        // Deque Controls
        document.querySelector('.push-front').addEventListener('click', () => {
            const val = document.getElementById('deque-input').value || Math.floor(Math.random() * 100);
            this.basicsDequePushFront(val);
            document.getElementById('deque-input').value = '';
        });
        document.querySelector('.push-back').addEventListener('click', () => {
            const val = document.getElementById('deque-input').value || Math.floor(Math.random() * 100);
            this.basicsDequePushBack(val);
            document.getElementById('deque-input').value = '';
        });
        document.querySelector('.pop-front').addEventListener('click', () => this.basicsDequePopFront());
        document.querySelector('.pop-back').addEventListener('click', () => this.basicsDequePopBack());

        this.setupBasicsView(); // Initial setup
    }

    switchBasicsMode(mode) {
        this.basicsMode = mode;
        this.basicsData = []; // Clear data on switch

        // Update Controls Visibility
        document.querySelectorAll('.control-group').forEach(g => g.classList.remove('active'));
        document.getElementById(`${mode}-controls`).classList.add('active');

        // Update Visualizer Layout
        this.visualizer.className = 'visualizer-area';
        this.visualizer.classList.add(`${mode}-mode`);

        this.setupBasicsView();
    }

    setupBasicsView() {
        this.visualizer.innerHTML = '';

        // Create the container structure based on mode
        const container = document.createElement('div');
        container.className = `ds-container ${this.basicsMode}-container`;

        // Labels and Structure
        if (this.basicsMode === 'stack') {
            container.innerHTML = `
                <div class="ds-label stack-top">Top</div>
                <div class="ds-items stack-items"></div>
                <div class="ds-base"></div>
                <div class="ds-label stack-bottom">Stack Bottom</div>
            `;
        } else if (this.basicsMode === 'queue') {
            container.innerHTML = `
                <div class="ds-label queue-back">Back (Enqueue)</div>
                <div class="ds-track">
                    <div class="ds-items queue-items"></div>
                </div>
                <div class="ds-label queue-front">Front (Dequeue)</div>
            `;
        } else if (this.basicsMode === 'deque') {
            container.innerHTML = `
                <div class="ds-label deque-back">Back</div>
                <div class="ds-track">
                    <div class="ds-items deque-items"></div>
                </div>
                <div class="ds-label deque-front">Front</div>
            `;
        }

        this.visualizer.appendChild(container);
    }

    createItemElement(val) {
        const el = document.createElement('div');
        el.className = 'data-item';
        el.textContent = val;

        // Dynamic font sizing
        const len = val.toString().length;
        if (len > 12) {
            el.style.fontSize = '0.6rem';
        } else if (len > 8) {
            el.style.fontSize = '0.7rem';
        } else if (len > 5) {
            el.style.fontSize = '0.8rem';
        }

        return el;
    }

    basicsPush(val) {
        this.basicsData.push(val);
        const itemsContainer = this.visualizer.querySelector('.ds-items');
        const el = this.createItemElement(val);
        itemsContainer.appendChild(el);
    }

    basicsPop() {
        if (this.basicsData.length === 0) return;
        const itemsContainer = this.visualizer.querySelector('.ds-items');
        const item = itemsContainer.lastElementChild; // Visual top for stack
        if (item) {
            item.classList.add('removing');
            setTimeout(() => {
                if (item.parentNode) item.parentNode.removeChild(item);
                this.basicsData.pop();
            }, 300);
        }
    }

    basicsEnqueue(val) {
        this.basicsData.push(val);
        const itemsContainer = this.visualizer.querySelector('.ds-items');
        const el = this.createItemElement(val);
        itemsContainer.appendChild(el);
    }

    basicsDequeue() {
        if (this.basicsData.length === 0) return;
        const itemsContainer = this.visualizer.querySelector('.ds-items');
        const item = itemsContainer.firstElementChild; // Front of queue
        if (item) {
            item.classList.add('removing');
            setTimeout(() => {
                if (item.parentNode) item.parentNode.removeChild(item);
                this.basicsData.shift();
            }, 300);
        }
    }

    basicsDequePushFront(val) {
        this.basicsData.unshift(val);
        const itemsContainer = this.visualizer.querySelector('.ds-items');
        const el = this.createItemElement(val);
        itemsContainer.prepend(el);
    }

    basicsDequePushBack(val) {
        this.basicsData.push(val);
        const itemsContainer = this.visualizer.querySelector('.ds-items');
        const el = this.createItemElement(val);
        itemsContainer.appendChild(el);
    }

    basicsDequePopFront() {
        if (this.basicsData.length === 0) return;
        const itemsContainer = this.visualizer.querySelector('.ds-items');
        const item = itemsContainer.firstElementChild;
        if (item) {
            item.classList.add('removing');
            setTimeout(() => {
                if (item.parentNode) item.parentNode.removeChild(item);
                this.basicsData.shift();
            }, 300);
        }
    }

    basicsDequePopBack() {
        if (this.basicsData.length === 0) return;
        const itemsContainer = this.visualizer.querySelector('.ds-items');
        const item = itemsContainer.lastElementChild;
        if (item) {
            item.classList.add('removing');
            setTimeout(() => {
                if (item.parentNode) item.parentNode.removeChild(item);
                this.basicsData.pop();
            }, 300);
        }
    }


    // ==========================================
    // PART 2: WORKFLOW
    // ==========================================
    initPart2() {
        this.taskQueue = []; // Deque
        this.completedStack = []; // Stack
        this.activeTask = null;

        document.getElementById('create-task-btn').addEventListener('click', () => {
            const name = document.getElementById('task-input').value || `Task ${Math.floor(Math.random() * 1000)}`;
            this.taskQueue.push(name);
            document.getElementById('task-input').value = '';
            this.renderWorkflow();
        });

        document.getElementById('start-task-btn').addEventListener('click', () => {
            if (this.taskQueue.length > 0 && !this.activeTask) {
                this.activeTask = this.taskQueue.shift();
                this.renderWorkflow();
            } else if (this.activeTask) {
                alert("Complete the current task first!");
            }
        });

        document.getElementById('complete-task-btn').addEventListener('click', () => {
            if (this.activeTask) {
                this.completedStack.push(this.activeTask);
                this.activeTask = null;
                this.renderWorkflow();
            }
        });

        document.getElementById('undo-task-btn').addEventListener('click', () => {
            if (this.completedStack.length > 0) {
                const restoredTask = this.completedStack.pop();
                if (this.activeTask) {
                    // Move active task back to front of queue
                    this.taskQueue.unshift(this.activeTask);
                }
                this.activeTask = restoredTask;
                this.renderWorkflow();
            }
        });
    }

    renderWorkflow() {
        // Render Task Queue (Deque Style)
        const queueContainer = document.getElementById('task-queue-visualizer');
        queueContainer.innerHTML = `
            <div class="ds-container deque-container" style="transform: scale(0.8)">
                <div class="ds-label deque-back">Back</div>
                <div class="ds-track">
                    <div class="ds-items deque-items"></div>
                </div>
                <div class="ds-label deque-front">Front</div>
            </div>
        `;

        const queueItems = queueContainer.querySelector('.ds-items');
        this.taskQueue.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-card';
            el.textContent = task;
            this.adjustFontSize(el, task);
            queueItems.appendChild(el);
        });

        // Render Active Task
        const activeSlot = document.getElementById('active-task-slot');
        activeSlot.innerHTML = '';
        if (this.activeTask) {
            const el = document.createElement('div');
            el.className = 'task-card';
            el.style.width = '100%';
            el.style.height = '100%';
            el.textContent = this.activeTask;
            this.adjustFontSize(el, this.activeTask);
            activeSlot.appendChild(el);
        }

        // Render Completed Stack (Stack Style)
        const stackContainer = document.getElementById('completed-stack-visualizer');
        stackContainer.innerHTML = `
            <div class="ds-container stack-container" style="transform: scale(0.8)">
                <div class="ds-label stack-top">Top</div>
                <div class="ds-items stack-items"></div>
                <div class="ds-base"></div>
                <div class="ds-label stack-bottom">Stack Bottom</div>
            </div>
        `;

        const stackItems = stackContainer.querySelector('.ds-items');
        // Show stack top at top (flex-direction: column-reverse handles this if we append in order)
        // But wait, column-reverse means first child is at bottom.
        // If I push [A, B, C], A is bottom, C is top.
        // So I should append A, then B, then C.
        this.completedStack.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-card';
            el.style.background = 'linear-gradient(135deg, #10b981, #059669)'; // Green for completed
            el.textContent = task;
            this.adjustFontSize(el, task);
            stackItems.appendChild(el);
        });
    }

    adjustFontSize(el, text) {
        const len = text.toString().length;
        if (len > 20) {
            el.style.fontSize = '0.7rem';
        } else if (len > 12) {
            el.style.fontSize = '0.8rem';
        } else if (len > 8) {
            el.style.fontSize = '0.9rem';
        }
    }


    // ==========================================
    // PART 3: MEMORY
    // ==========================================
    initPart3() {
        this.memory = new MemoryManager();
        this.memMode = 'linkedlist'; // linkedlist, mem-stack, mem-queue, mem-deque

        // Controls
        // Linked List
        document.getElementById('mem-ll-init').addEventListener('click', () => {
            if (this.memory.head) {
                alert("List already initialized!");
                return;
            }
            const val = this.getMemInput() || 'HEAD';
            this.memory.llAddHead(val);
            this.renderMemory();
        });

        document.getElementById('mem-ll-add-head').addEventListener('click', () => {
            const val = this.getMemInput();
            this.memory.llAddHead(val);
            this.renderMemory();
        });
        document.getElementById('mem-ll-add-tail').addEventListener('click', () => {
            const val = this.getMemInput();
            this.memory.llAddTail(val);
            this.renderMemory();
        });
        document.getElementById('mem-ll-remove-head').addEventListener('click', () => {
            this.memory.llRemoveHead();
            this.renderMemory();
        });

        // Stack
        document.getElementById('mem-stack-push').addEventListener('click', () => {
            const val = this.getMemInput();
            this.memory.stackPush(val);
            this.renderMemory();
        });
        document.getElementById('mem-stack-pop').addEventListener('click', () => {
            this.memory.stackPop();
            this.renderMemory();
        });

        // Queue
        document.getElementById('mem-queue-enqueue').addEventListener('click', () => {
            const val = this.getMemInput();
            this.memory.queueEnqueue(val);
            this.renderMemory();
        });
        document.getElementById('mem-queue-dequeue').addEventListener('click', () => {
            this.memory.queueDequeue();
            this.renderMemory();
        });

        // Deque
        document.getElementById('mem-deque-push-front').addEventListener('click', () => {
            const val = this.getMemInput();
            this.memory.dequePushFront(val);
            this.renderMemory();
        });
        document.getElementById('mem-deque-push-back').addEventListener('click', () => {
            const val = this.getMemInput();
            this.memory.dequePushBack(val);
            this.renderMemory();
        });
        document.getElementById('mem-deque-pop-front').addEventListener('click', () => {
            this.memory.dequePopFront();
            this.renderMemory();
        });
        document.getElementById('mem-deque-pop-back').addEventListener('click', () => {
            this.memory.dequePopBack();
            this.renderMemory();
        });

        this.renderMemory();
    }

    // ==========================================
    // PART 4: RECURSION
    // ==========================================
    initPart4() {
        this.recursionViz = new RecursionVisualizer();
    }

    getMemInput() {
        const input = document.getElementById('memory-input');
        const val = input.value || 'DATA';
        input.value = '';
        return val;
    }

    switchMemoryMode(mode) {
        this.memMode = mode;
        this.memory.reset(); // Clear memory on switch for clarity

        document.querySelectorAll('.mem-control-group').forEach(g => g.classList.remove('active'));
        document.getElementById(`${mode}-controls`).classList.add('active');

        this.updateLLControls();
        this.renderMemory();
    }

    updateLLControls() {
        if (this.memMode !== 'linkedlist') return;

        const hasHead = this.memory.head !== null;

        const initBtn = document.getElementById('mem-ll-init');
        const otherBtns = [
            document.getElementById('mem-ll-add-head'),
            document.getElementById('mem-ll-add-tail'),
            document.getElementById('mem-ll-remove-head')
        ];

        if (hasHead) {
            initBtn.style.display = 'none';
            otherBtns.forEach(btn => btn.style.display = 'inline-block');
        } else {
            initBtn.style.display = 'inline-block';
            otherBtns.forEach(btn => btn.style.display = 'none');
        }
    }

    renderMemory() {
        this.updateLLControls();

        const heap = document.getElementById('memory-heap');
        heap.innerHTML = '';

        // Render all allocated blocks
        this.memory.blocks.forEach(block => {
            const el = document.createElement('div');
            el.className = `memory-block ${block.allocated ? 'allocated' : ''}`;

            let contentHtml = '';
            let badgesHtml = '';

            if (block.allocated) {
                // Check for pointers
                if (block.address === this.memory.head) badgesHtml += '<span class="badge badge-head">HEAD</span>';
                if (block.address === this.memory.top) badgesHtml += '<span class="badge badge-top">TOP</span>';
                if (block.address === this.memory.front) badgesHtml += '<span class="badge badge-front">FRONT</span>';
                if (block.address === this.memory.rear) badgesHtml += '<span class="badge badge-rear">REAR</span>';

                contentHtml += `<div class="mem-row"><span class="mem-label">Val:</span> <span class="mem-val">${block.value}</span></div>`;
                if (block.next !== undefined) {
                    contentHtml += `<div class="mem-row"><span class="mem-label">Next:</span> <span class="mem-val">${block.next}</span></div>`;
                }
                if (block.prev !== undefined) {
                    contentHtml += `<div class="mem-row"><span class="mem-label">Prev:</span> <span class="mem-val">${block.prev}</span></div>`;
                }
            } else {
                contentHtml = '<div class="mem-row" style="opacity:0.5">FREE</div>';
            }

            el.innerHTML = `
                <div class="mem-header">
                    <span class="mem-addr">${block.address}</span>
                    <div class="mem-badges">${badgesHtml}</div>
                </div>
                <div class="mem-content">
                    ${contentHtml}
                </div>
            `;
            heap.appendChild(el);
        });
    }
}

class RecursionVisualizer {
    constructor() {
        this.stack = [];
        this.steps = [];
        this.currentStep = 0;
        this.isRunning = false;

        this.codeDisplay = document.getElementById('code-display');
        this.stackContainer = document.getElementById('call-stack-container');
        this.statusDisplay = document.getElementById('recursion-status');

        this.initControls();
        this.loadCode('factorial');
    }

    initControls() {
        document.getElementById('algo-select').addEventListener('change', (e) => {
            this.loadCode(e.target.value);
            this.reset();
        });

        document.getElementById('rec-start-btn').addEventListener('click', () => this.start());
        document.getElementById('rec-step-btn').addEventListener('click', () => this.step());
        document.getElementById('rec-reset-btn').addEventListener('click', () => this.reset());
    }

    loadCode(algo) {
        let code = '';
        const input2 = document.getElementById('rec-input-2');

        if (algo === 'factorial') {
            input2.style.display = 'none';
            code = `int factorial(int n) {
  if (n == 0) {
    return 1;
  }
  return n * factorial(n - 1);
}`;
        } else if (algo === 'sumArray') {
            input2.style.display = 'none';
            code = `int sumArray(int arr[], int size) {
  if (size == 0) {
    return 0;
  }
  return arr[0] + sumArray(arr + 1, size - 1);
}`;
        } else if (algo === 'power') {
            input2.style.display = 'inline-block';
            code = `int power(int base, int exp) {
  if (exp == 0) {
    return 1;
  }
  return base * power(base, exp - 1);
}`;
        }
        this.codeDisplay.textContent = code;
    }

    start() {
        const algo = document.getElementById('algo-select').value;
        const n = parseInt(document.getElementById('rec-input-1').value) || 0;
        const exp = parseInt(document.getElementById('rec-input-2').value) || 0;

        this.steps = this.generateSteps(algo, n, exp);
        this.currentStep = 0;
        this.isRunning = true;
        this.stack = [];

        document.getElementById('rec-start-btn').disabled = true;
        document.getElementById('rec-step-btn').disabled = false;
        document.getElementById('algo-select').disabled = true;

        this.render();
        this.statusDisplay.textContent = "Started. Click 'Step' to proceed.";
    }

    reset() {
        this.isRunning = false;
        this.stack = [];
        this.currentStep = 0;
        this.steps = [];

        document.getElementById('rec-start-btn').disabled = false;
        document.getElementById('rec-step-btn').disabled = true;
        document.getElementById('algo-select').disabled = false;

        this.render();
        this.statusDisplay.textContent = "Ready.";
    }

    step() {
        if (this.currentStep >= this.steps.length) {
            this.statusDisplay.textContent = "Finished!";
            return;
        }

        const action = this.steps[this.currentStep];
        this.currentStep++;

        if (action.type === 'call') {
            this.stack.push(action.frame);
            this.statusDisplay.textContent = `Calling ${action.frame.name}...`;
        } else if (action.type === 'return') {
            const frame = this.stack[this.stack.length - 1];
            frame.returnValue = action.value;
            frame.popping = true;
            this.statusDisplay.textContent = `Returning ${action.value}`;

            // Delay removal for animation
            setTimeout(() => {
                this.stack.pop();
                if (this.stack.length > 0) {
                    // Pass return value to parent
                    this.stack[this.stack.length - 1].childReturn = action.value;
                }
                this.render();
            }, 500);
        }

        this.render();
    }

    render() {
        this.stackContainer.innerHTML = '';

        this.stack.forEach(frame => {
            const el = document.createElement('div');
            el.className = `stack-frame ${frame.popping ? 'popping' : ''}`;
            el.innerHTML = `
                <div class="frame-header">${frame.name}</div>
                <div class="frame-vars">
                    ${Object.entries(frame.args).map(([k, v]) => `<div>${k}: ${v}</div>`).join('')}
                    ${frame.childReturn !== undefined ? `<div style="color:var(--success)">Got Return: ${frame.childReturn}</div>` : ''}
                    ${frame.returnValue !== undefined ? `<div style="color:var(--accent); font-weight:bold">Returning: ${frame.returnValue}</div>` : ''}
                </div>
            `;
            this.stackContainer.appendChild(el);
        });
    }

    generateSteps(algo, n, exp) {
        const steps = [];

        if (algo === 'factorial') {
            const run = (val) => {
                steps.push({ type: 'call', frame: { name: `factorial(${val})`, args: { n: val } } });
                if (val === 0) {
                    steps.push({ type: 'return', value: 1 });
                    return 1;
                }
                const res = val * run(val - 1);
                steps.push({ type: 'return', value: res });
                return res;
            };
            run(n);
        } else if (algo === 'sumArray') {
            // Simulate array [1, 2, 3, ...]
            const arr = Array.from({ length: n }, (_, i) => i + 1);
            const run = (idx, size) => {
                steps.push({ type: 'call', frame: { name: `sumArray(arr+${idx}, ${size})`, args: { size: size, 'arr[0]': size > 0 ? arr[idx] : '?' } } });
                if (size === 0) {
                    steps.push({ type: 'return', value: 0 });
                    return 0;
                }
                const res = arr[idx] + run(idx + 1, size - 1);
                steps.push({ type: 'return', value: res });
                return res;
            };
            run(0, n);
        } else if (algo === 'power') {
            const run = (b, e) => {
                steps.push({ type: 'call', frame: { name: `power(${b}, ${e})`, args: { base: b, exp: e } } });
                if (e === 0) {
                    steps.push({ type: 'return', value: 1 });
                    return 1;
                }
                const res = b * run(b, e - 1);
                steps.push({ type: 'return', value: res });
                return res;
            };
            run(n, exp);
        }

        return steps;
    }
}

class MemoryManager {
    constructor() {
        this.blocks = [];
        this.reset();
    }

    reset() {
        this.blocks = [];
        // Initialize with some empty blocks
        for (let i = 0; i < 12; i++) {
            this.blocks.push({
                address: `0x${(1000 + i * 4).toString(16).toUpperCase()}`,
                allocated: false
            });
        }

        // Pointers for different structures
        this.head = null; // For LL
        this.top = null; // For Stack
        this.front = null; // For Queue/Deque
        this.rear = null; // For Queue/Deque
    }

    allocate(value) {
        const block = this.blocks.find(b => !b.allocated);
        if (!block) {
            alert("Out of memory!");
            return null;
        }
        block.allocated = true;
        block.value = value;
        block.next = 'NULL';
        block.prev = 'NULL'; // For Deque
        return block;
    }

    free(address) {
        const block = this.blocks.find(b => b.address === address);
        if (block) {
            block.allocated = false;
            delete block.value;
            delete block.next;
            delete block.prev;
        }
    }

    // Linked List Operations
    llAddHead(val) {
        const newNode = this.allocate(val);
        if (!newNode) return;

        if (this.head) {
            newNode.next = this.head;
        } else {
            newNode.next = 'NULL';
        }
        this.head = newNode.address;
    }

    llAddTail(val) {
        const newNode = this.allocate(val);
        if (!newNode) return;
        newNode.next = 'NULL';

        if (!this.head) {
            this.head = newNode.address;
            return;
        }

        let currentAddr = this.head;
        while (true) {
            const current = this.blocks.find(b => b.address === currentAddr);
            if (current.next === 'NULL') {
                current.next = newNode.address;
                break;
            }
            currentAddr = current.next;
        }
    }

    llRemoveHead() {
        if (!this.head) return;
        const currentHead = this.blocks.find(b => b.address === this.head);
        const nextAddr = currentHead.next;
        this.free(this.head);
        this.head = (nextAddr === 'NULL') ? null : nextAddr;
    }

    // Stack Operations (Linked)
    stackPush(val) {
        const newNode = this.allocate(val);
        if (!newNode) return;

        if (this.top) {
            newNode.next = this.top;
        } else {
            newNode.next = 'NULL';
        }
        this.top = newNode.address;
    }

    stackPop() {
        if (!this.top) return;
        const currentTop = this.blocks.find(b => b.address === this.top);
        const nextAddr = currentTop.next;
        this.free(this.top);
        this.top = (nextAddr === 'NULL') ? null : nextAddr;
    }

    // Queue Operations (Linked)
    queueEnqueue(val) {
        const newNode = this.allocate(val);
        if (!newNode) return;
        newNode.next = 'NULL';

        if (!this.rear) {
            this.front = newNode.address;
            this.rear = newNode.address;
        } else {
            const rearNode = this.blocks.find(b => b.address === this.rear);
            rearNode.next = newNode.address;
            this.rear = newNode.address;
        }
    }

    queueDequeue() {
        if (!this.front) return;
        const frontNode = this.blocks.find(b => b.address === this.front);
        const nextAddr = frontNode.next;

        this.free(this.front);
        this.front = (nextAddr === 'NULL') ? null : nextAddr;

        if (!this.front) {
            this.rear = null;
        }
    }

    // Deque Operations (Doubly Linked)
    dequePushFront(val) {
        const newNode = this.allocate(val);
        if (!newNode) return;

        newNode.prev = 'NULL';
        newNode.next = this.front ? this.front : 'NULL';

        if (this.front) {
            const frontNode = this.blocks.find(b => b.address === this.front);
            frontNode.prev = newNode.address;
        }
        this.front = newNode.address;

        if (!this.rear) {
            this.rear = newNode.address;
        }
    }

    dequePushBack(val) {
        const newNode = this.allocate(val);
        if (!newNode) return;

        newNode.next = 'NULL';
        newNode.prev = this.rear ? this.rear : 'NULL';

        if (this.rear) {
            const rearNode = this.blocks.find(b => b.address === this.rear);
            rearNode.next = newNode.address;
        }
        this.rear = newNode.address;

        if (!this.front) {
            this.front = newNode.address;
        }
    }

    dequePopFront() {
        if (!this.front) return;
        const frontNode = this.blocks.find(b => b.address === this.front);
        const nextAddr = frontNode.next;

        this.free(this.front);
        this.front = (nextAddr === 'NULL') ? null : nextAddr;

        if (this.front) {
            const newFront = this.blocks.find(b => b.address === this.front);
            newFront.prev = 'NULL';
        } else {
            this.rear = null;
        }
    }

    dequePopBack() {
        if (!this.rear) return;
        const rearNode = this.blocks.find(b => b.address === this.rear);
        const prevAddr = rearNode.prev;

        this.free(this.rear);
        this.rear = (prevAddr === 'NULL') ? null : prevAddr;

        if (this.rear) {
            const newRear = this.blocks.find(b => b.address === this.rear);
            newRear.next = 'NULL';
        } else {
            this.front = null;
        }
    }
}

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    new DataStructureApp();
});
