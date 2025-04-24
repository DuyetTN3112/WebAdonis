import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  public redirectTo = '/login'

  public async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    try {
      await ctx.auth.authenticateUsing(options.guards || ['web'], { loginRoute: this.redirectTo })
      return next()
    } catch (error) {
      console.log('AuthMiddleware caught:', error.code || error.message)
      // Nếu là Inertia request, trả inertia.location
      if (ctx.request.header('x-inertia')) {
        console.log('→ Inertia redirect to', this.redirectTo)
        return ctx.inertia.location(this.redirectTo)
      }
      // Thuần HTTP redirect
      return ctx.response.redirect().toPath(this.redirectTo)
    }
  }
}
