import type { HttpContext } from '@adonisjs/core/http'
import type { Model } from '@adonisjs/lucid/orm'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    resource: Model
  }
} 