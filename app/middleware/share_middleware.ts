import type { HttpContext } from '@adonisjs/core/http'

export default class ShareUserMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    await next()
    if (ctx.inertia) {
      ctx.inertia.share({
        authUser: ctx.auth.user ? ctx.auth.user.serialize() : {},
      })
    }
  }
}
