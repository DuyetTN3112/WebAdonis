import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
// import { middleware } from '#start/kernel'

/**
 * Guest middleware is used to deny access to routes that should
 * be accessed by unauthenticated users.
 *
 * For example, the login page should not be accessible if the user
 * is already logged-in
 */
export default class GuestMiddleware {
  /**
   * The URL to redirect to when user is logged-in
   */
  redirectTo = '/'

  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.auth.isAuthenticated) {
      return ctx.response.redirect().toRoute('home')
    }
    await next()
  }
}
