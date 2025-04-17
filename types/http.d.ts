import '@adonisjs/core/http'
import '@adonisjs/auth'
import { VineValidator } from '@vinejs/vine'

declare module '@adonisjs/core/http' {
  interface Request {
    validateUsing<T>(validator: VineValidator): Promise<T>
    all(): Record<string, any>
    only(keys: string[]): Record<string, any>
  }

  interface Response {
    redirect(): Response
    back(): Response
    toRoute(route: string): Response
    toPath(path: string): Response
    withErrors(errors: Record<string, any>): Response
    withSuccess(message: string): Response
  }
}

declare module '@adonisjs/auth' {
  interface Auth {
    use(guard: string): {
      login(user: any): Promise<void>
      logout(): Promise<void>
      attempt(email: string, password: string): Promise<void>
    }
    getUserOrFail(): any
    user?: {
      role?: number
    }
  }
}

declare module '@adonisjs/lucid/orm' {
  interface BaseModel {
    merge(data: Record<string, any>): this
    save(): Promise<this>
    delete(): Promise<void>
  }
} 