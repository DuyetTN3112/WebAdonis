import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'
import app from '@adonisjs/core/services/app'
import { updatePasswordValidator } from '#validators/auth'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

// Mẫu dữ liệu hoạt động tài khoản với định dạng DateTime của Luxon
const sampleActivities = [
  {
    action: 'Đăng nhập',
    ip: '127.0.0.1',
    timestamp: DateTime.now().toSQL({ includeOffset: false }), // Định dạng SQL chuẩn: YYYY-MM-DD HH:MM:SS
  },
  {
    action: 'Cập nhật hồ sơ',
    ip: '127.0.0.1',
    timestamp: DateTime.now().minus({ days: 1 }).toSQL({ includeOffset: false }), // Chuẩn SQL - 1 ngày trước
  },
  {
    action: 'Bình luận bài viết',
    ip: '127.0.0.1',
    timestamp: DateTime.now().minus({ hours: 5 }).toSQL({ includeOffset: false }), // Chuẩn SQL - 5 giờ trước
  },
]

export default class ProfileController {
  @inject()
  public async index({ inertia, auth, session, response, request }: HttpContext) {
    if (!auth.user) {
      session.flash('authError', 'Bạn cần đăng nhập để xem hồ sơ!')
      return response.redirect().toPath('/login')
    }

    // Ghi nhận hoạt động đăng nhập
    console.log('User đang xem hồ sơ:', auth.user.serialize())
    console.log('IP người dùng:', request.ip())

    // Lấy bài viết của user
    const posts = await Post.query()
      .where('user_id', auth.user.id)
      .preload('user')
      .preload('comments', (query) => {
        query.preload('user')
      })
      .preload('modules')
      .orderBy('created_at', 'desc')

    // Đảm bảo hiển thị đúng định dạng thời gian
    const serializedPosts = posts.map((post) => {
      const serialized = post.serialize();
      // Chuyển đổi created_at thành SQL string nếu là Luxon DateTime
      if (post.created_at instanceof DateTime) {
        serialized.created_at = post.created_at.toSQL({ includeOffset: false });
      }
      
      // Xử lý các comment
      if (serialized.comments && serialized.comments.length > 0) {
        serialized.comments = serialized.comments.map((comment: any) => {
          // Đảm bảo created_at của comment cũng ở định dạng SQL
          if (post.$getRelated('comments').find((c) => c.id === comment.id)?.created_at instanceof DateTime) {
            comment.created_at = post.$getRelated('comments')
              .find((c) => c.id === comment.id)
              ?.created_at.toSQL({ includeOffset: false });
          }
          return comment;
        });
      }
      
      return serialized;
    });

    return inertia.render('profile', {
      user: auth.user.serialize(),
      posts: serializedPosts,
      activities: sampleActivities, // Thêm hoạt động mẫu
      flashMessage: session.flashMessages.get('message'),
      flashError: session.flashMessages.get('error'),
    })
  }

  @inject()
  public async updateAvatar({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const avatar = request.file('avatar', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    if (avatar) {
      await avatar.move(app.publicPath('uploads'))
      user.avatar = `uploads/${avatar.fileName}`
      await user.save()
    }

    return response.redirect().back()
  }

  @inject()
  public async update({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const data = request.only(['username', 'email', 'phone_number', 'student_id'])
      const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

      // Nếu đổi mật khẩu thì kiểm tra mật khẩu cũ
      if (newPassword) {
        const isPasswordValid = await user.verifyPassword(currentPassword)
        if (!isPasswordValid) {
          return response.status(401).json({
            success: false,
            message: 'Current password is incorrect',
          })
        }
        user.password = newPassword
      }

      // Cập nhật thông tin user
      user.merge(data)
      await user.save()

      return response.json({
        success: true,
        user: user.serialize(),
      })
    } catch (error) {
      console.error('Profile update error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to update profile',
      })
    }
  }

  @inject()
  public async updatePassword({ request, response, auth, session }: HttpContext) {
    try {
      const user = await auth.authenticate()
      // Xác thực dữ liệu đầu vào
      const data = await request.validateUsing(updatePasswordValidator)
      // Xác thực mật khẩu hiện tại
      const isPasswordValid = await user.verifyPassword(data.current_password)
      if (!isPasswordValid) {
        session.flash('error', 'Mật khẩu hiện tại không đúng')
        return response.redirect().back()
      }
      // Hashify mật khẩu mới và lưu
      user.password = await hash.make(data.new_password)
      await user.save()
      session.flash('message', 'Cập nhật mật khẩu thành công')
      return response.redirect().back()
    } catch (error) {
      console.error('Lỗi cập nhật mật khẩu:', error)
      session.flash('error', 'Lỗi khi cập nhật mật khẩu. Vui lòng thử lại!')
      return response.redirect().back()
    }
  }
}
