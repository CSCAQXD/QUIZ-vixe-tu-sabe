import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['test/**/*.{test,spec}.{js,jsx}'],
    environment: 'jsdom',
    pool: 'vmThreads',
    maxWorkers: 1,
    setupFiles: './test/setup.js',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      reporter: ['text', 'json-summary'],
    },
  },
})
