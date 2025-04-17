import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { BaseModel } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class OwnershipMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      model: typeof BaseModel
      idParam?: string
      userIdField?: string
      errorMessage?: string
    }
  ) {
    const {
      model,
      idParam = 'id',
      userIdField = 'user_id',
      errorMessage = 'You do not have permission to access this resource',
    } = options

    const id = ctx.request.param(idParam)
    const resource = await model.findOrFail(id)
    const user = (ctx.auth as any).user as User | undefined

    if (!user || (resource as any)[userIdField] !== user.id) {
      return ctx.response.forbidden({
        message: errorMessage,
      })
    }

    // @ts-ignore - Adding resource to context
    ctx.resource = resource
    return next()
  }
}
