import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Module from '#models/module'
import User from '#models/user'
import type { AuthService } from '@adonisjs/auth/types'

interface WebAuthService extends AuthService {
  use(guard: 'web'): {
    user: User | null
    getUserOrFail(): User
  }
}

export default class PostsController {
  @inject()
  async index({ inertia, request, response }: HttpContext) {
    try {
      const page = Math.max(Number.parseInt(request.input('page', '1')) || 1, 1)
      const filter = request.input('filter')
      const limit = 3

      const postsQuery = Post.query().orderBy('created_at', 'desc')

      if (filter) {
        postsQuery.where('category', filter)
      }

      const posts = await postsQuery.paginate(page, limit)

      return inertia.render('posts/index', {
        posts: posts.serialize(),
        meta: posts.getMeta(),
        currentFilter: filter,
        pageTitle: 'Posts',
        pagination: posts.toJSON().meta,
      })
    } catch (error) {
      response.status(500).send('Error loading posts')
    }
  }

  @inject()
  async likeDislike({ request, response, auth }: HttpContext & { auth: WebAuthService }) {
    const post = await Post.findOrFail(request.param('id'))
    const type = request.input('type')
    const user = auth.use('web').getUserOrFail()
    const userId = user.id.toString()

    if (type === 'like') {
      // Remove from disliked if exists
      if (post.disliked?.includes(userId)) {
        const dislikedUsers = post.disliked.split(',').filter((id) => id !== userId)
        post.disliked = dislikedUsers.join(',')
        post.dislike_count = Math.max(0, post.dislike_count - 1)
      }

      // Add to liked if not exists
      if (!post.liked?.includes(userId)) {
        const likedUsers = post.liked ? post.liked.split(',') : []
        likedUsers.push(userId)
        post.liked = likedUsers.join(',')
        post.like_count += 1
      }
    } else {
      // Remove from liked if exists
      if (post.liked?.includes(userId)) {
        const likedUsers = post.liked.split(',').filter((id) => id !== userId)
        post.liked = likedUsers.join(',')
        post.like_count = Math.max(0, post.like_count - 1)
      }

      // Add to disliked if not exists
      if (!post.disliked?.includes(userId)) {
        const dislikedUsers = post.disliked ? post.disliked.split(',') : []
        dislikedUsers.push(userId)
        post.disliked = dislikedUsers.join(',')
        post.dislike_count += 1
      }
    }

    await post.save()

    return response.json({
      success: true,
      likes: post.like_count,
      dislikes: post.dislike_count,
    })
  }

  async search({ request, inertia }: HttpContext) {
    const query = request.input('q')
    let results = []

    if (query.startsWith('@')) {
      results = await User.query()
        .where('username', 'like', `%${query.slice(1)}%`)
        .limit(5)
    } else if (query.startsWith('#')) {
      results = await Module.query()
        .where('name', 'like', `%${query.slice(1)}%`)
        .limit(5)
    } else {
      results = await Post.query()
        .where('title', 'like', `%${query}%`)
        .orWhere('content', 'like', `%${query}%`)
        .limit(10)
    }

    return inertia.render('search', { results })
  }
}
