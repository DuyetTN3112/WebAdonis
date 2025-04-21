import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

createInertiaApp({
  resolve: async (name: string) => {
    try {
      console.log('Resolving page:', name)
      console.log('Looking for file:', `../pages/${name}.tsx`)
      const pages = import.meta.glob('../pages/**/*.tsx')
      console.log('Available pages:', Object.keys(pages))
      
      const page = await resolvePageComponent(`../pages/${name}.tsx`, pages)
      console.log('Resolved page:', page)
      return page
    } catch (error) {
      console.error('Error resolving page:', error)
      console.error('Error details:', {
        name,
        path: `../pages/${name}.tsx`,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  },
    
  setup({ el, App, props }: { el: Element; App: any; props: any }) {
    try {
      console.log('Setting up Inertia app with props:', props)
      createRoot(el).render(<App {...props} />)
    } catch (error) {
      console.error('Error setting up Inertia app:', error)
      console.error('Setup error details:', {
        error: error.message,
        stack: error.stack,
        props
      })
      throw error
    }
  }
}) 