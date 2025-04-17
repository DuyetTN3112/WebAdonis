import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { BaseModel } from '@adonisjs/lucid/orm'
import User from '#models/user'

interface ResourceModel extends BaseModel {
  visibility: string
  user_id: number
  [key: string]: any
}

export default class VisibilityMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      model: typeof BaseModel & { new (): ResourceModel }
      idParam?: string
      visibilityField?: string
      errorMessage?: string
    }
  ) {
    const {
      model,
      idParam = 'id',
      visibilityField = 'visibility',
      errorMessage = 'This resource is not accessible',
    } = options

    const id = ctx.request.param(idParam)
    const resource = await model.findOrFail(id)
    const user = (ctx.auth as any).user as User | undefined

    // Check if resource is public or user is the owner
    if (resource[visibilityField] === 'public' || resource.user_id === user?.id) {
      // @ts-ignore - Adding resource to context
      ctx.resource = resource
      return next()
    }

    return ctx.response.forbidden({
      message: errorMessage,
    })
  }
}
