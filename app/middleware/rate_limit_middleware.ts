import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class RateLimitMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      maxAttempts?: number
      windowSeconds?: number
      keyPrefix?: string
    } = {}
  ) {
    const { maxAttempts = 60, windowSeconds = 60, keyPrefix = 'rate_limit' } = options
    const key = `${keyPrefix}:${ctx.request.ip()}`

    const current = await Redis.incr(key)
    if (current === 1) {
      await Redis.expire(key, windowSeconds)
    }

    if (current > maxAttempts) {
      return ctx.response.tooManyRequests({
        message: 'Too many requests. Please try again later.',
        retryAfter: windowSeconds,
      })
    }

    return next()
  }
}
