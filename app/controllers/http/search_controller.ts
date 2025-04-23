import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Module from '#models/module'
import User from '#models/user'

export default class SearchController {
  async handle({ request, response }: HttpContext) {
    const query = request.input('query', '')
    let type = 'post'
    let results: User[] | Module[] | Post[] = []

    if (query.startsWith('@')) {
      type = 'user'
      const keyword = query.slice(1)
      results = await User.query()
        .where('username', 'like', `%${keyword}%`)
        .orWhere('email', 'like', `%${keyword}%`)
        .select('id', 'username', 'email', 'avatar')
        .limit(10)
    } else if (query.startsWith('#')) {
      type = 'module'
      const keyword = query.slice(1)
      results = await Module.query()
        .where('name', 'like', `%${keyword}%`)
        .orWhere('description', 'like', `%${keyword}%`)
        .select('id', 'name', 'description')
        .limit(10)
    } else {
      results = await Post.query()
        .where('title', 'like', `%${query}%`)
        .orWhere('content', 'like', `%${query}%`)
        .preload('user', (userQuery) => {
          userQuery.select('id', 'username', 'avatar')
        })
        .select('id', 'title', 'content', 'user_id', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(10)
    }

    return response.json({
      type,
      results: results.map((result) => result.serialize()),
    })
  }
}
