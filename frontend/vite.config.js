import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'laudable-ambition-production-63fa.up.railway.app'
    ]
  }
})
