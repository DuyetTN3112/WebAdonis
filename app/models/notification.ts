import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Post from '#models/post'
import Comment from '#models/comment'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public user_id: number

  @column()
  declare public type: 'comment_on_post' | 'tag_in_comment' | 'post_success'

  @column()
  declare public post_id: number | null

  @column()
  declare public comment_id: number | null

  @column()
  declare public content: string | null

  @column.dateTime({ autoCreate: true })
  declare public created_at: DateTime

  @belongsTo(() => User)
  declare public user: BelongsTo<typeof User>

  @belongsTo(() => Post)
  declare public post: BelongsTo<typeof Post>

  @belongsTo(() => Comment)
  declare public comment: BelongsTo<typeof Comment>
}
