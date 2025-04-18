import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

createInertiaApp({
  resolve: name =>
    resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx')),
  
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
