import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import '../css/app.css'
import '../css/custom.css'

createInertiaApp({
  resolve: (name: string) =>
    resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx')),
    
  setup({ el, App, props }: { el: Element; App: any; props: any }) {
    createRoot(el).render(<App {...props} />)
  }
  
})
