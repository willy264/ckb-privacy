import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  publicDir: false,
  envPrefix: 'VITE_',
  plugins: [react()],
  css: { postcss: { plugins: [] } },
})
