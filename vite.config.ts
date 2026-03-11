import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set VITE_BASE_PATH in CI to match your GitHub repo name, e.g. /serjunior/
  base: process.env.VITE_BASE_PATH ?? '/',
})
