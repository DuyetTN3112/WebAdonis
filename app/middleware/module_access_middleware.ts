import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Module from '#models/module'
import User from '#models/user'
import { UserRole } from '#models/user'

export default class ModuleAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const moduleId = ctx.request.param('id')
    const user = ctx.auth.user as User

    const module = await Module.findOrFail(moduleId)

    if (module.is_private && user.role !== UserRole.ADMIN) {
      return ctx.response.forbidden({
        message: 'You do not have access to this module',
      })
    }

    return next()
  }
}
