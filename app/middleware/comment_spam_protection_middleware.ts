import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Redis from '@ioc:Adonis/Addons/Redis'
import User from '#models/user'

export default class CommentSpamProtectionMiddleware {
  private readonly SPAM_THRESHOLD = 3
  private readonly WINDOW = 300 // 5 minutes

  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user as User
    const content = ctx.request.input('content')
    const key = `spam_check:${user.id}:${content}`
    const count = await Redis.incr(key)
    if (count === 1) {
      await Redis.expire(key, this.WINDOW)
    }

    if (count > this.SPAM_THRESHOLD) {
      return ctx.response.badRequest({
        message: 'This comment appears to be spam. Please try again later.',
      })
    }

    return next()
  }
}
