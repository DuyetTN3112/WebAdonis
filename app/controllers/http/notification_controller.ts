import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import User from '#models/user'
import type { AuthService } from '@adonisjs/auth/types'

interface WebAuthService extends AuthService {
  use(guard: 'web'): {
    user: User | null
    getUserOrFail(): User
  }
}

export default class NotificationController {
  /**
   * Lấy tất cả thông báo của người dùng
   */
  @inject()
  async index({ auth, inertia, response }: HttpContext & { auth: WebAuthService }) {
    try {
      const user = auth.use('web').getUserOrFail()
      
      const notifications = await Notification.query()
        .where('user_id', user.id)
        .orderBy('created_at', 'desc')
        .preload('post')
        .preload('comment')
      
      return inertia.render('notifications/index', {
        notifications: notifications.map(n => n.serialize()),
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Đánh dấu thông báo là đã đọc
   */
  @inject()
  async markAsRead({ params, auth, response }: HttpContext & { auth: WebAuthService }) {
    try {
      const user = auth.use('web').getUserOrFail()
      const notification = await Notification.findOrFail(params.id)
      
      if (notification.user_id !== user.id) {
        return response.forbidden('Bạn không có quyền cập nhật thông báo này')
      }
      
      notification.is_read = true
      await notification.save()
      
      return response.json({
        success: true,
        notification: notification.serialize(),
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  @inject()
  async markAllAsRead({ auth, response }: HttpContext & { auth: WebAuthService }) {
    try {
      const user = auth.use('web').getUserOrFail()
      
      // Cập nhật tất cả thông báo chưa đọc của người dùng
      await Notification.query()
        .where('user_id', user.id)
        .where('is_read', false)
        .update({ is_read: true })
      
      return response.json({
        success: true,
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Xóa thông báo
   */
  @inject()
  async destroy({ params, auth, response }: HttpContext & { auth: WebAuthService }) {
    try {
      const user = auth.use('web').getUserOrFail()
      const notification = await Notification.findOrFail(params.id)
      
      if (notification.user_id !== user.id) {
        return response.forbidden('Bạn không có quyền xóa thông báo này')
      }
      
      await notification.delete()
      
      return response.json({
        success: true,
        message: 'Thông báo đã được xóa',
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  @inject()
  async getUnreadCount({ auth, response }: HttpContext & { auth: WebAuthService }) {
    try {
      const user = auth.use('web').getUserOrFail()
      
      const count = await Notification.query()
        .where('user_id', user.id)
        .where('is_read', false)
        .count('* as total')
      
      return response.json({
        success: true,
        count: count[0].$extras.total,
      })
    } catch (error) {
      console.error('Error getting unread count:', error)
      return response.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
}
