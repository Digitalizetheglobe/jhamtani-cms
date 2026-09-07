import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.risingspaces.in',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://api.risingspaces.in/',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
