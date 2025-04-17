import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import Post from '#models/post'
import Notification from '#models/notification'
import { createCommentValidator, updateCommentValidator } from '#validators/comment'
import User from '#models/user'
import type { AuthService } from '@adonisjs/auth/types'

interface WebAuthService extends AuthService {
  use(guard: 'web'): {
    user: User | null
    getUserOrFail(): User
  }
}

type CreateCommentData = {
  content: string
  image?: string
}

type UpdateCommentData = {
  content: string
  image?: string
}

export default class CommentsController {
  /**
   * Hiển thị form tạo comment (nếu cần)
   */
  async create({ params, inertia }: HttpContext) {
    const post = await Post.findOrFail(params.postId)
    return inertia.render('comments/create', { post: post.serialize() })
  }

  /**
   * Xử lý tạo comment mới
   */
  @inject()
  async store({ auth, request, response, params }: HttpContext & { auth: WebAuthService }) {
    const user = auth.use('web').getUserOrFail()
    const post = await Post.findOrFail(params.postId)
    const data = (await request.validateUsing(createCommentValidator)) as CreateCommentData

    const comment = await Comment.create({
      user_id: user.id,
      post_id: post.id,
      content: data.content,
      image: data.image || null,
    })

    // Tạo notification
    await this.createCommentNotification(comment, user, post)

    return response.redirect().back()
  }

  /**
   * Hiển thị form chỉnh sửa comment
   */
  async edit({ params, inertia }: HttpContext) {
    const comment = await Comment.query().where('id', params.id).preload('post').firstOrFail()

    return inertia.render('comments/edit', {
      comment: comment.serialize(),
    })
  }

  /**
   * Cập nhật comment
   */
  async update({ params, request, response }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    const data = (await request.validateUsing(updateCommentValidator)) as UpdateCommentData

    comment.merge(data)
    await comment.save()

    return response.redirect().back()
  }

  /**
   * Xóa comment
   */
  async destroy({ params, response }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    await comment.delete()
    return response.redirect().back()
  }

  /**
   * Tạo notification khi có comment mới
   */
  private async createCommentNotification(comment: Comment, user: User, post: Post) {
    // Notification cho chủ post
    await Notification.create({
      user_id: post.user_id,
      type: 'comment_on_post',
      post_id: post.id,
      comment_id: comment.id,
      content: `${user.username} đã bình luận bài viết của bạn`,
    })

    // Check mention (@username) trong comment
    const mentions = comment.content.match(/@(\w+)/g)
    if (mentions) {
      const usernames = [...new Set(mentions.map((m) => m.replace('@', '')))]
      const users = await User.query().whereIn('username', usernames)

      await Promise.all(
        users.map(async (mentionedUser) => {
          await Notification.create({
            user_id: mentionedUser.id,
            type: 'tag_in_comment',
            post_id: post.id,
            comment_id: comment.id,
            content: `${user.username} đã nhắc đến bạn trong bình luận`,
          })
        })
      )
    }
  }
}
