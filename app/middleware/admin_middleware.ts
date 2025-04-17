import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '#models/user'
import User from '#models/user'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user as User | null

    if (!user || user.role !== UserRole.ADMIN) {
      return ctx.response.redirect().toPath('/')
    }

    return next()
  }
}
