import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: false } }),
    react(),
    tailwindcss(),
    adonisjs({ entrypoints: ['inertia/app/app.tsx'], reload: ['inertia/**/*.tsx'] }),
  ],

  css: {
    postcss: './postcss.config.cjs',
  },
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './inertia'),
      '@lib': path.resolve(currentDir, './inertia/lib'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
