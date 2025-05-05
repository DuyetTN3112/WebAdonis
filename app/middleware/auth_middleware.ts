import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  public redirectTo = '/login'

  private logContext(ctx: HttpContext) {
    return {
      url: ctx.request.url(),
      method: ctx.request.method(),
      headers: ctx.request.headers(),
      cookies: ctx.request.cookiesList(),
      session: ctx.session.all(),
      auth: {
        isAuthenticated: ctx.auth.isAuthenticated,
        user: ctx.auth.user?.id,
      },
    }
  }

  public async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    const startTime = Date.now()

    try {
      console.log('--- [AUTH MIDDLEWARE] ---')
      console.log('Request URL:', ctx.request.url())
      console.log('Session ID:', ctx.session.sessionId)
      console.log('Session Data:', ctx.session.all())
      console.log('Cookies:', ctx.request.cookiesList())
      console.log('Headers:', ctx.request.headers())

      console.log('Current session:', ctx.session.all())
      console.log('Initial context:', JSON.stringify(this.logContext(ctx), null, 2))

      console.log('Attempting authentication with guards:', options.guards || ['web'])
      const sessionCookie = ctx.request.cookie('adonis-session')
      if (!sessionCookie) {
        throw new Error('Missing session cookie')
      }
      await ctx.auth.authenticateUsing(options.guards || ['web'], {
        loginRoute: this.redirectTo,
      })
      console.log('Authenticated user:', ctx.auth.user)
      console.log('Session after auth:', ctx.session.all())

      console.log('Authentication successful', {
        userId: ctx.auth.user?.id,
        duration: `${Date.now() - startTime}ms`,
      })

      // Kiểm tra Redis session store
      console.log('Redis Session Key:', `${ctx.session.sessionId}:session`)
      try {
        const redisModule = await import('@adonisjs/redis/services/main')
        const redis = redisModule.default
        const sessionData = await redis.get(`${ctx.session.sessionId}:session`)
        console.log('Redis Session Data:', sessionData)
      } catch (error) {
        console.error('Redis connection error:', error.message)
      }

      return next()
    } catch (error) {
      console.error('Auth error:', error)
      console.error('Auth failure details:', {
        sessionId: ctx.session.sessionId,
        cookies: ctx.request.cookiesList(),
        headers: ctx.request.headers(),
        error: error.stack,
      })
      console.error('=== AUTHENTICATION ERROR ===', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code,
        },
        context: this.logContext(ctx),
        timing: `${Date.now() - startTime}ms`,
      })

      await ctx.session.regenerate()

      // Lưu log lỗi vào session
      ctx.session.flash('authError', {
        timestamp: new Date().toISOString(),
        attemptedUrl: ctx.request.url(),
        errorDetails: {
          code: error.code,
          message: error.message,
        },
        debug: {
          headers: ctx.request.headers(),
          sessionSnapshot: ctx.session.all(),
        },
      })

      if (ctx.request.header('x-inertia')) {
        console.log('Inertia redirect to login')
        return ctx.inertia.location(this.redirectTo)
      }

      console.log('HTTP redirect to login')
      return ctx.response.redirect().toPath(this.redirectTo)
    } finally {
      console.log('--- [AUTH MIDDLEWARE END] --- Duration:', Date.now() - startTime, 'ms')
    }
  }
}
