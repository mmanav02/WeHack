import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true,
    // Simplified performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          react: ['react', 'react-dom'],
          // Material-UI
          mui: ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
          // Material-UI Icons
          'mui-icons': ['@mui/icons-material'],
          // Router
          router: ['react-router-dom'],
          // API utilities
          api: ['axios']
        }
      }
    },
    // Build settings
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
