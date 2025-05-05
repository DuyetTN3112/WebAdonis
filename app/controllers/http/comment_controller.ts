import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import Post from '#models/post'
import { createCommentValidator, updateCommentValidator } from '#validators/comment'
import User from '#models/user'
import type { AuthService } from '@adonisjs/auth/types'
import { DateTime } from 'luxon'
import Notification from '#models/notification'

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
    const post = await Post.findOrFail(params.post_id)
    return inertia.render('comments/create', { post: post.serialize() })
  }

  /**
   * Xử lý tạo comment mới
   */
  @inject()
  async store({ auth, request, response, params }: HttpContext & { auth: WebAuthService }) {
    try {
      console.log('CommentController.store() called')

      const user = auth.use('web').getUserOrFail()
      const post = await Post.findOrFail(params.post_id)
      const data = (await request.validateUsing(createCommentValidator)) as CreateCommentData

      const comment = await Comment.create({
        user_id: user.id,
        post_id: post.id,
        content: data.content,
        image: data.image || null,
      })
      console.log('Comment created:', comment.id)

      // Preload user để có thông tin đầy đủ về người dùng
      await comment.load('user')
      
      // Lấy comment từ database để đảm bảo thời gian chính xác
      const freshComment = await Comment.findOrFail(comment.id)
      console.log('Comment timestamps from DB:', {
        created_at: freshComment.created_at ? freshComment.created_at.toString() : null,
        updated_at: freshComment.updated_at ? freshComment.updated_at.toString() : null,
      })

      // Chuẩn bị dữ liệu comment để gửi về client
      const serialized = freshComment.serialize()

      // Chuyển đổi DateTime của Luxon sang chuỗi SQL (YYYY-MM-DD HH:MM:SS)
      // Sử dụng thời gian từ database
      const serializedComment = {
        ...serialized,
        created_at: freshComment.created_at ? freshComment.created_at.toSQL() : null,
        updated_at: freshComment.updated_at ? freshComment.updated_at.toSQL() : null,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
      }

      console.log('Serialized comment JSON:', JSON.stringify(serializedComment, null, 2))

      // Tạo notification
      try {
        await this.createCommentNotification(comment, user, post)
        console.log('Notifications created successfully')
      } catch (notificationError) {
        console.error('Error creating notifications:', notificationError)
        // Không làm gián đoạn luồng chính nếu có lỗi khi tạo thông báo
      }

      if (request.accepts(['html'])) {
        return response.redirect().back()
      }

      return response.status(201).json({
        success: true,
        comment: serializedComment,
      })
    } catch (error) {
      console.error('Error in comment store:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
      })
    }
  }

  /**
   * Hiển thị form chỉnh sửa comment
   */
  @inject()
  async edit({ params, inertia, auth, response }: HttpContext & { auth: WebAuthService }) {
    try {
      const user = auth.use('web').getUserOrFail()
      const comment = await Comment.query().where('id', params.id).preload('post').firstOrFail()

      // Kiểm tra xem người dùng có phải là chủ của comment không
      if (comment.user_id !== user.id) {
        return response.forbidden('Bạn không có quyền chỉnh sửa bình luận này')
      }

      // Kiểm tra thời gian (1 giờ)
      const commentAge = DateTime.now().diff(comment.created_at, 'hours').hours
      if (commentAge > 1) {
        return response.forbidden('Không thể chỉnh sửa bình luận sau 1 giờ')
      }

      return inertia.render('comments/edit', {
        comment: comment.serialize(),
      })
    } catch (error) {
      console.error('Error in comment edit:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Cập nhật comment
   */
  @inject()
  async update({ params, request, response, auth }: HttpContext & { auth: WebAuthService }) {
    try {
      console.log('CommentController.update() called for comment ID:', params.id)
      console.log('Request body:', request.body())

      const user = auth.use('web').getUserOrFail()
      const comment = await Comment.findOrFail(params.id)

      // Kiểm tra xem người dùng có phải là chủ của comment không
      if (comment.user_id !== user.id) {
        console.log('Forbidden - User is not comment owner')
        return response.forbidden('Bạn không có quyền chỉnh sửa bình luận này')
      }

      // Kiểm tra thời gian (1 giờ)
      const commentAge = DateTime.now().diff(comment.created_at, 'hours').hours
      console.log('Comment age check:', {
        created_at: comment.created_at ? comment.created_at.toString() : null,
        now: DateTime.now().toString(),
        diff_hours: commentAge
      })
      
      if (commentAge > 1) {
        console.log('Forbidden - Comment is too old:', commentAge, 'hours')
        return response.forbidden('Không thể chỉnh sửa bình luận sau 1 giờ')
      }

      // Log dữ liệu đầu vào trước khi validate
      console.log('Input data before validation:', request.all())

      try {
        // Validate dữ liệu đầu vào
        const data = (await request.validateUsing(updateCommentValidator)) as UpdateCommentData
        console.log('Validated data:', data)

        // Lưu trữ nội dung cũ để log
        const oldContent = comment.content
        
        // Cập nhật dữ liệu
        comment.content = data.content
        await comment.save()
        
        console.log(
          'Comment updated successfully - Old content:',
          oldContent,
          'New content:',
          comment.content
        )

        // Preload user để có thông tin đầy đủ về người dùng
        await comment.load('user')

        // Chuẩn bị dữ liệu comment để gửi về client
        const serialized = comment.serialize()

        // Chuyển đổi DateTime của Luxon sang chuỗi SQL
        const serializedComment = {
          ...serialized,
          created_at: comment.created_at ? comment.created_at.toSQL() : null,
          updated_at: comment.updated_at ? comment.updated_at.toSQL() : null,
          user: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
          },
        }

        if (request.accepts(['html'])) {
          return response.redirect().back()
        }

        return response.json({
          success: true,
          message: 'Bình luận đã được cập nhật thành công',
          comment: serializedComment,
        })
      } catch (validationError) {
        console.error('Validation error:', validationError)
        return response.status(422).json({
          success: false,
          error: 'Dữ liệu không hợp lệ',
          details: validationError.messages || validationError.message,
        })
      }
    } catch (error) {
      console.error('Error in comment update:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
      })
    }
  }

  /**
   * Xóa comment
   */
  @inject()
  async destroy({ params, response, auth, request }: HttpContext & { auth: WebAuthService }) {
    try {
      const user = auth.use('web').getUserOrFail()
      const comment = await Comment.findOrFail(params.id)
      
      // Lấy thông tin về bài viết mà comment thuộc về
      await comment.load('post')
      
      // Kiểm tra quyền xóa: người dùng phải là người viết comment HOẶC chủ bài viết
      const isCommentOwner = comment.user_id === user.id
      const isPostOwner = comment.post.user_id === user.id
      
      if (!isCommentOwner && !isPostOwner) {
        return response.forbidden('Bạn không có quyền xóa bình luận này')
      }
      
      // Không áp dụng giới hạn thời gian cho chủ bài viết
      if (isCommentOwner && !isPostOwner) {
        // Kiểm tra thời gian (1 giờ) chỉ cho người viết comment
        const commentAge = DateTime.now().diff(comment.created_at, 'hours').hours
        if (commentAge > 1) {
          return response.forbidden('Không thể xóa bình luận sau 1 giờ')
        }
      }

      await comment.delete()

      if (request.accepts(['html'])) {
        return response.redirect().back()
      }

      return response.json({
        success: true,
        message: 'Bình luận đã được xóa thành công',
      })
    } catch (error) {
      console.error('Error in comment destroy:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
  
  /**
   * Tạo thông báo khi có người bình luận
   */
  private async createCommentNotification(comment: Comment, user: User, post: Post) {
    // Tạo thông báo cho chủ bài viết (nếu người comment không phải chủ bài viết)
    if (post.user_id !== user.id) {
      await Notification.create({
        user_id: post.user_id,
        content: `${user.username} đã bình luận về bài viết của bạn`,
        post_id: post.id,
        comment_id: comment.id,
        type: 'comment_on_post',
        is_read: false,
      })
    }
  }
}
