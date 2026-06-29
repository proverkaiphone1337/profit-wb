import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths make the build work both on github.io and on a custom domain.
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/xlsx')) {
            return 'xlsx'
          }

          if (id.includes('node_modules/jszip')) {
            return 'jszip'
          }

          if (id.includes('node_modules/recharts')) {
            return 'charts'
          }

          if (id.includes('node_modules/lucide-react')) {
            return 'icons'
          }

          return undefined
        },
      },
    },
  },
})
