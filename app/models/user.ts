import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import Post from './post.js'
import Comment from './comment.js'
import Notification from '#models/notification'
import type { HasMany } from '@adonisjs/lucid/types/relations'

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
}
