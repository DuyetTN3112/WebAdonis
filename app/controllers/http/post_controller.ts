import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Module from '#models/module'
import User from '#models/user'
import type { AuthService } from '@adonisjs/auth/types'

export default class PostsController {
  @inject()
  async index({ inertia, request, response, auth }: HttpContext) {
    try {
      console.log('Starting to fetch posts...')
      const page = Math.max(Number.parseInt(request.input('page', '1')) || 1, 1)
      const filter = request.input('filter')
      const limit = 10

      console.log('Building query with preloads...')
      let postsQuery = Post.query()
        .preload('user')
        .preload('comments', (query) => {
          query.preload('user')
        })
        .preload('modules')

      // Apply filters
      if (filter) {
        console.log('Applying filter:', filter)
        switch (filter) {
          case 'most_view':
            postsQuery.orderBy('view_count', 'desc')
            break
          case 'most_liked':
            postsQuery.orderBy('like_count', 'desc')
            break
          case 'most_disliked':
            postsQuery.orderBy('dislike_count', 'desc')
            break
          default:
            postsQuery.orderBy('created_at', 'desc')
        }
      } else {
        postsQuery.orderBy('created_at', 'desc')
      }

      console.log('Executing query...')
      const posts = await postsQuery.paginate(page, limit)
      console.log('Posts fetched successfully:', posts.toJSON())
      // More defensive auth handling
      let user = null
      try {
        console.log('Attempting to get user from auth...')
        user = auth.use('web').user
        console.log('User from auth:', user ? 'Found' : 'Not found')
      } catch (error) {
        console.error('Auth error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })
      }

      console.log('Preparing response...')
      return inertia.render('post', {
        posts: posts.serialize(),
        user: user ? user.serialize() : null,
        current_filter: filter,
      })
    } catch (error) {
      console.error('Detailed error in index:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        details: error,
      })
      return response.status(500).json({
        message: 'Error loading posts',
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          details: error,
        },
      })
    }
  }

  @inject()
  async likeDislike({ request, response, auth }: HttpContext) {
    try {
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
    } catch (error) {
      console.error('Error in likeDislike:', error)
      return response.status(500).json({ message: 'Error processing like/dislike', error })
    }
  }

  async search({ request, response, inertia }: HttpContext) {
    try {
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
    } catch (error) {
      console.error('Error in search:', error)
      return response.status(500).json({ message: 'Error performing search', error })
    }
  }
}
