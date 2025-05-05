import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, beforeDelete } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import Post from './post.js'
import Comment from './comment.js'
import Notification from '#models/notification'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import db from '@adonisjs/lucid/services/db'

export enum UserRole {
  ADMIN = 0,
  USER = 1,
}

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  public static table = 'user'

  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public username: string

  @column()
  declare public email: string

  @column({ serializeAs: null })
  declare public password: string

  @column()
  declare public phone_number: string | null

  @column()
  declare public student_id: string | null

  @column()
  declare public role: UserRole

  @column()
  declare public avatar: string | null

  @column.dateTime({ autoCreate: true })
  declare public created_at: DateTime

  @hasMany(() => Post, {
    foreignKey: 'user_id',
  })
  declare public posts: HasMany<typeof Post>

  @hasMany(() => Comment, {
    foreignKey: 'user_id',
  })
  declare public comments: HasMany<typeof Comment>

  @hasMany(() => Notification)
  declare public notifications: HasMany<typeof Notification>

  // Hook trước khi xóa để xóa tất cả dữ liệu liên quan đến người dùng
  @beforeDelete()
  static async cascadeDelete(user: User) {
    try {
      console.log(`Đang xóa dữ liệu liên quan của user ID ${user.id}...`)
      // Xóa tất cả thông báo liên quan đến user (nếu bảng tồn tại)
      try {
        // Kiểm tra xem model Notification có tồn tại không
        if (Notification) {
          await Notification.query().where('user_id', user.id).delete()
          console.log(`Đã xóa thông báo của user ID ${user.id}`)
        }
      } catch (notificationError) {
        // Bảng thông báo có thể không tồn tại, ghi log nhưng không dừng quá trình
        console.log(`Không thể xóa thông báo: ${notificationError.message}`)
      }
      // QUAN TRỌNG: Xóa tất cả comment của user trước khi xóa posts
      // Xóa tất cả comments của user
      try {
        await Comment.query().where('user_id', user.id).delete()
        console.log(`Đã xóa comments của user ID ${user.id}`)
      } catch (commentError) {
        console.log(`Lỗi khi xóa comments: ${commentError.message}`)
      }
      // Xóa tất cả comments trên các post của user
      try {
        // Lấy danh sách post_id của user
        const userPosts = await Post.query().where('user_id', user.id).select('id')
        const postIds = userPosts.map((post) => post.id)
        if (postIds.length > 0) {
          // Xóa comments thuộc các bài viết của user
          await Comment.query().whereIn('post_id', postIds).delete()
          console.log(`Đã xóa comments thuộc bài viết của user ID ${user.id}`)
          // QUAN TRỌNG: Xóa các bản ghi trong bảng module_post trước khi xóa posts
          try {
            await db.from('module_post').whereIn('post_id', postIds).delete()
            console.log(`Đã xóa liên kết module_post của user ID ${user.id}`)
          } catch (modulePostError) {
            console.log(`Lỗi khi xóa liên kết module_post: ${modulePostError.message}`)
            throw modulePostError
          }
        }
      } catch (relatedCommentsError) {
        console.log(`Lỗi khi xóa comments liên quan: ${relatedCommentsError.message}`)
      }
      // Sau khi xóa hết comments và module_post, giờ xóa các posts
      try {
        await Post.query().where('user_id', user.id).delete()
        console.log(`Đã xóa bài viết của user ID ${user.id}`)
      } catch (postError) {
        console.log(`Lỗi khi xóa bài viết: ${postError.message}`)
        throw postError
      }
      console.log(`Hoàn tất xóa dữ liệu liên quan của user ID ${user.id}`)
    } catch (error) {
      console.error('Lỗi khi xóa dữ liệu liên quan của user:', error)
      throw error
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    console.log(
      'Đang xác thực mật khẩu với hash:',
      this.password ? 'hash tồn tại' : 'không có hash'
    )
    // Kiểm tra xem mật khẩu có phải là hash hay không
    const isHashed = this.password.startsWith('$')
    if (isHashed) {
      // Nếu là hash thì dùng phương thức verify
      try {
        return await hash.verify(this.password, password)
      } catch (error) {
        console.error('Lỗi khi xác thực mật khẩu đã hash:', error)
        return false
      }
    } else {
      // Chưa hash, so sánh trực tiếp
      return this.password === password
    }
  }

  static serializeForAuth(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  }
}
