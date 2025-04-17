import { HttpContext } from '@adonisjs/core/http'

export default class InertiaMiddleware {
  public async handle({ inertia, session, auth }: HttpContext, next: () => Promise<void>) {
    inertia.share({
      auth: async () => {
        return {
          user: await auth.user,
        }
      },
      errors: () => {
        return session.flashMessages.get('errors') || {}
      },
      flashMessages: () => session.flashMessages.all(),
    })

    await next()
  }
}
