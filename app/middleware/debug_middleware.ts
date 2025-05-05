import type { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class DebugMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    console.log('=== Request Debug ===')
    console.log('URL:', ctx.request.url())
    console.log('Method:', ctx.request.method())
    console.log('Headers:', ctx.request.headers())
    console.log('Cookies:', ctx.request.cookiesList())
    console.log('Session:', ctx.session.all())

    return next()
  }
}
