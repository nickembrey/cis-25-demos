# CIS 25 Demos

Interactive visualizations for CIS 25 (Object-Oriented Programming Using C++), served with GitHub Pages at https://nickembrey.github.io/cis-25-demos/.

- `stack-operations/`, `call-stack/`, `stack-and-heap/`: built pages (React). Their source is in `src/demos/`, with the standalone page wrapper in `src/standalone/`.
- `data-structure-sim/`: stacks, queues, deques, linked nodes in memory, and a call-stack trace (Fall 2025, plain HTML/JS).

## Rebuilding the React demos

The source was written for the Praxis web app's toolchain (React 19, Tailwind CSS 4, Vite 7). To rebuild, place `src/demos/*` under a Praxis checkout's `apps/web/src/demos/` and `src/standalone/` at `apps/web/standalone-demos/`, then from `apps/web` run:

    STANDALONE_OUT=/path/to/output npx vite build --config standalone-demos/vite.config.ts

and copy the output's `assets/` and demo folders here.
