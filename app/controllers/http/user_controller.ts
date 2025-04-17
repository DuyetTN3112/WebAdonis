import type { HttpContext } from '@adonisjs/core/http'

import { inject } from '@adonisjs/core'

import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'

export default class UserController {
  @inject()
  async show({ auth, inertia }: HttpContext) {
    // Xác thực người dùng
    const user = auth.user! as User
    // Lấy thông tin user
    const userData = await User.findOrFail(user.id)

    // Lấy các bài post của user
    const posts = await Post.query()
      .where('user_id', user.id)
      .preload('comments')
      .orderBy('created_at', 'desc')

    // Lấy các comment của user
    const comments = await Comment.query()
      .where('user_id', user.id)
      .preload('post')
      .orderBy('created_at', 'desc')

    return inertia.render('users/show', {
      user: userData.serialize(),
      posts: posts.map((p) => p.serialize()),
      comments: comments.map((c) => c.serialize()),
    })
  }
}
