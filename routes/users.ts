import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  @inject()
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const users = await User.query().orderBy('created_at', 'desc').paginate(page, limit)
    return inertia.render('users/index', {
      users: users.serialize(),
    })
  }
}
