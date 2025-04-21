import { Request, Response } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Module from '#models/module'
import Post from '#models/post'

export default class ModuleController {
  /**
   * Display the modules page
   */
  @inject()
  public async index({ inertia, auth }: HttpContext) {
    try {
      const modules = await Module.all()
      console.log('Found modules:', modules.length)
      console.log('Rendering module page with data:', { modules })

      return inertia.render('module', {
        modules: modules,
        user: auth.user
      })
    } catch (error) {
      console.error('Error in ModuleController:', error)
      console.error('Error stack:', error.stack)
      return inertia.render('module', {
        error: 'Error loading modules',
        modules: [],
        user: auth.user
      })
    }
  }

  /**
   * Get all modules for API
   */
  @inject()
  public async getModules({ response }: { response: Response }) {
    try {
      const modules = await Module.all()
      return response.json(modules)
    } catch (error) {
      console.error('Error in ModuleController.getModules:', error)
      return response.status(500).json({
        message: 'Error loading modules',
        error: error.message
      })
    }
  }

  /**
   * Get posts for a specific module
   */
  @inject()
  public async getPosts({ params, response }: { params: { id: string }; response: Response }) {
    try {
      console.log('Fetching posts for module ID:', params.id)
      const module = await Module.findOrFail(params.id)
      console.log('Found module:', module.toJSON())

      const posts = await Post.query()
        .whereHas('modules', (query) => {
          query.where('module_id', module.id)
        })
        .preload('user', (query) => {
          query.select('id', 'username')
        })
        .preload('modules', (query) => {
          query.select('id', 'name')
        })
      console.log('Found posts:', posts.length)

      const formattedPosts = posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.user.username,
        created_at: post.created_at,
        module_names: post.modules.map((m) => m.name).join(', '),
      }))

      return response.json(formattedPosts)
    } catch (error) {
      console.error('Error in ModuleController.getPosts:', error)
      console.error('Error stack:', error.stack)
      return response.status(500).json({
        message: 'Error loading module posts',
        error: error.message,
        stack: error.stack,
        details: error,
      })
    }
  }
}
