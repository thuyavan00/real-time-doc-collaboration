import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8090', changeOrigin: true },
      '/ws':  { target: 'http://localhost:8090', changeOrigin: true, ws: true },
    },
  },
  define: {
    global: 'window',
    'process.env': {},          // avoids process env errors
  },
  resolve: {
    alias: {
      buffer: 'buffer',         // so the Buffer import works
    },
  },
})
