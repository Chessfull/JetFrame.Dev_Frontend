import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://jetframedev-production.up.railway.app/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
})
