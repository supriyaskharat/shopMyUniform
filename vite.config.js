import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js
// In development, Vite proxies all /api requests to the Express backend.
// This means the frontend doesn't need to know the backend URL during dev.

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
