import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Enable HTTPS for development to avoid mixed content issues
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    cors: true, // Enable CORS
    strictPort: false, // Allow port to change if occupied
    open: true, // Auto-open browser
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false, // Allow self-signed certs
        ws: true, // Enable WebSocket proxy
      }
    }
  },
  build: {
    // Optimize chunk sizes for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          animations: ['framer-motion'],
          utils: ['clsx', 'tailwind-merge', 'date-fns'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
    sourcemap: true, // Generate sourcemaps for debugging
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    cors: true,
  },
  // Define global constants for development
  define: {
    // Allow HTTP in development
    __DEV__: JSON.stringify(true),
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand']
  }
})
