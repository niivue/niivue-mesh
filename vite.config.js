import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: './',
  server: {
    open: 'index.html',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  worker: {
    format: 'esm'
  },
  // exclude @niivue/niimath from optimization
  optimizeDeps: {
    exclude: ['@niivue/niimath']
  }
})