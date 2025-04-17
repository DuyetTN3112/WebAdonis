import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class PostImageValidationMiddleware {
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']
  private readonly MAX_SIZE = 5 * 1024 * 1024 // 5MB
  private readonly MAX_COUNT = 5

  async handle(ctx: HttpContext, next: NextFn) {
    const files = ctx.request.files('images')

    if (!files || files.length === 0) {
      return next()
    }

    if (files.length > this.MAX_COUNT) {
      return ctx.response.badRequest({
        message: `Maximum ${this.MAX_COUNT} images allowed per post`,
      })
    }

    for (const file of files) {
      if (!file.type || !this.ALLOWED_TYPES.includes(file.type)) {
        return ctx.response.badRequest({
          message: 'Invalid file type. Allowed types: JPEG, PNG, GIF',
        })
      }

      if (file.size > this.MAX_SIZE) {
        return ctx.response.badRequest({
          message: 'File size exceeds the limit of 5MB',
        })
      }
    }

    return next()
  }
}
