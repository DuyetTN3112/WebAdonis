// app/middleware/csrf_debug_middleware.ts
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class CsrfDebugMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Lấy thông tin về request
    const requestToken = ctx.request.input('_csrf')
    const sessionToken = ctx.session.get('csrf-secret')
    const csrfHeader = ctx.request.header('x-csrf-token')

    console.log('=== CSRF Debug ===')
    console.log('Request method:', ctx.request.method())
    console.log('Request path:', ctx.request.url(true))
    console.log('Request token from form:', requestToken)
    console.log('CSRF token from header:', csrfHeader)
    console.log('Session token (hashed):', sessionToken)
    console.log('Session data:', ctx.session.all())
    console.log('Cookies:', ctx.request.cookiesList())
    console.log('==================')

    return next()
  }
}
