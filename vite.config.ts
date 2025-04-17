import { defineConfig } from 'vite'
import { getDirname } from '@adonisjs/core/helpers'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import path from 'node:path'

const dirname = getDirname(import.meta.url)

export default defineConfig({
  plugins: [
    inertia({
      ssr: {
        enabled: false,
      },
    }),
    react(),
    adonisjs({
      entrypoints: ['inertia/app/app.tsx'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],
  css: {
    postcss: './postcss.config.cjs',
  },
  build: {
    outDir: './public/assets',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './inertia/app'),
      '@/lib': path.resolve(dirname, './inertia/app/lib'),
      '@/components': path.resolve(dirname, './inertia/components'),
      '@/pages': path.resolve(dirname, './inertia/pages'),
      '@/hooks': path.resolve(dirname, './inertia/hooks'),
      '@/styles': path.resolve(dirname, './inertia/styles'),
    },
  },
})
