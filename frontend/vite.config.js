import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirects any request starting with /api to your backend port
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Add this if your routes don't start with /api (e.g. just /users)
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})