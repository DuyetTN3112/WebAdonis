import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class FileUploadValidationMiddleware {
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']
  private readonly MAX_SIZE = 5 * 1024 * 1024 // 5MB

  async handle(ctx: HttpContext, next: NextFn) {
    const file = ctx.request.file('file')

    if (!file) {
      return next()
    }

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

    return next()
  }
}
