import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-bootstrap', 'bootstrap'],
          charts: ['recharts'],
          maps: ['react-leaflet', 'leaflet'],
          forms: ['react-hook-form', 'react-quill'],
          utils: ['zustand', 'lodash', 'date-fns']
        }
      }
    }
  }
})
