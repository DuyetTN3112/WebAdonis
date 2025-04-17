import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CheckAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const isAuthenticated = await ctx.auth.check()

    // Nếu chưa đăng nhập và không phải đang ở trang register hoặc login
    if (
      !isAuthenticated &&
      !ctx.request.url().includes('/register') &&
      !ctx.request.url().includes('/login')
    ) {
      return ctx.response.redirect().toRoute('auth.register')
    }

    return next()
  }
}
