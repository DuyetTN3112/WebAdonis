import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Module from '#models/module'
import Post from '#models/post'

export default class ModulesController {
  @inject()
  async index({ inertia, request }: HttpContext) {
    const modules = await Module.all()
    const moduleId = request.input('module_id')
    const page = request.input('page', 1)
    const limit = 10

    let selectedModule = null
    let postsPagination = null

    if (moduleId) {
      selectedModule = await Module.find(moduleId)
      if (selectedModule) {
        postsPagination = await Post.query()
          .where('module_id', moduleId)
          .preload('user')
          .orderBy('created_at', 'desc')
          .paginate(page, limit)
      }
    }

    return inertia.render('modules/index', {
      modules: modules.map((module) => module.serialize()),
      selectedModule: selectedModule?.serialize(),
      posts: postsPagination?.serialize().data || [],
      meta: postsPagination?.serialize().meta || {},
    })
  }
}
