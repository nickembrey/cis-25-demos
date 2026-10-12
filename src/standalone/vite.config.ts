import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const root = __dirname
export default defineConfig({
  root,
  base: './',
  plugins: [react()],
  build: {
    outDir: process.env.STANDALONE_OUT,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'stack-operations': path.resolve(root, 'stack-operations/index.html'),
        'call-stack': path.resolve(root, 'call-stack/index.html'),
        'stack-and-heap': path.resolve(root, 'stack-and-heap/index.html'),
      },
    },
  },
})
