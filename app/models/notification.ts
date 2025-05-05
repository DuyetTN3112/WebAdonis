import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Post from './post.js'
import Comment from './comment.js'

export default class Notification extends BaseModel {
  public static table = 'notification'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare type: 'comment_on_post' | 'tag_in_comment' | 'post_success'

  @column()
  declare post_id: number | null

  @column()
  declare comment_id: number | null

  @column()
  declare content: string

  @column()
  declare is_read: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Post, {
    foreignKey: 'post_id',
  })
  declare post: BelongsTo<typeof Post>

  @belongsTo(() => Comment, {
    foreignKey: 'comment_id',
  })
  declare comment: BelongsTo<typeof Comment>
}
