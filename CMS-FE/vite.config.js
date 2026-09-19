import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.jhamtani.com',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://api.jhamtani.com',
        changeOrigin: true,
        secure: true,
      },
    }
  }
})
