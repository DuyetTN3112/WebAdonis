import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Module from '#models/module'
import User from '#models/user'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class SearchController {
  async handle({ request, inertia }: HttpContext) {
    const query = request.input('query', '')
    let type = 'post'
    let results: User[] | Module[] | ModelPaginatorContract<Post> = []

    if (query.startsWith('@')) {
      type = 'user'
      results = await User.query()
        .where('username', 'like', `%${query.slice(1)}%`)
        .limit(10)
    } else if (query.startsWith('#')) {
      type = 'module'
      results = await Module.query()
        .where('name', 'like', `%${query.slice(1)}%`)
        .limit(10)
    } else {
      results = await Post.query()
        .where('title', 'like', `%${query}%`)
        .orWhere('content', 'like', `%${query}%`)
        .preload('user')
        .paginate(1, 10)
    }

    const serializedResults =
      type === 'post'
        ? (results as ModelPaginatorContract<Post>).serialize()
        : (results as (User | Module)[]).map((result) => result.serialize())

    return inertia.render('search/results', {
      type,
      results: serializedResults,
    })
  }
}
