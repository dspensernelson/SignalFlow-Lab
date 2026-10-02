import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { middlewareChecks } from './scripts/vite-plugin-middleware-checks.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), middlewareChecks()],
})
