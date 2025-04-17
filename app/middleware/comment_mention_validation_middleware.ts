import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

export default class CommentMentionValidationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const content = ctx.request.input('content')
    const mentions = content.match(/@(\w+)/g) || []

    if (mentions.length > 0) {
      const usernames = [...new Set(mentions.map((mention: string) => mention.replace('@', '')))]
      const users = await User.query().whereIn('username', usernames as string[])
      if (users.length !== usernames.length) {
        return ctx.response.badRequest({
          message: 'One or more mentioned users do not exist',
        })
      }
    }

    return next()
  }
}
