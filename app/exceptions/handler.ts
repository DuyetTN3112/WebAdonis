import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction
  protected renderStatusPages = app.inProduction
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { inertia }) => inertia.render('errors/not_found', { error }),
    '500..599': (error, { inertia }) => inertia.render('errors/server_error', { error }),
  }

  public async handle(error: any, ctx: HttpContext) {
    const { request, response, session, inertia } = ctx

    // CSRF hết hạn
    if (error.status === 419) {
      session.flash('message', 'The page expired, please try again.')
      return response.redirect().back()
    }

    // Chặn 401 Unauthorized
    if (error.status === 401) {
      console.log('ExceptionHandler caught 401')
      if (request.header('x-inertia')) {
        console.log('→ Inertia exception redirect to /login')
        return inertia.location('/login')
      }
      return response.redirect().toRoute('login')
    }

    // Mặc định vẫn trả JSON cho các lỗi khác
    return response.status(error.status || 500).send({
      message: error.message,
    })
  }

  public async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
