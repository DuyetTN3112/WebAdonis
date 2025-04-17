import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  @inject()
  async index({ inertia }: HttpContext) {
    return inertia.render('layout')
  }
}
