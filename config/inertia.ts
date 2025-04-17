import { defineConfig } from '@adonisjs/inertia'
import type { HttpContext } from '@adonisjs/core/http'

const inertiaConfig = defineConfig({
  rootView: 'app',
  assetsVersion: 1,

  // You can share data with all views here
  sharedData: {
    appName: 'AdonisJS Inertia App',
    user: (ctx: HttpContext) => ctx.auth?.user,
  },

  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

// Add type augmentation for shared props
declare module '@inertiajs/core' {
  interface SharedProps {
    appName: string
    user?: {
      id: number
      // Add other user properties here
    }
    // You can manually add additional shared props here if needed
  }
}
