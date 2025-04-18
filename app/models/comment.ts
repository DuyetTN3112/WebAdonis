import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Post from '#models/post'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public user_id: number

  @column()
  declare public post_id: number

  @column()
  declare public content: string

  @column()
  declare public image: string | null

  @column.dateTime({ autoCreate: true })
  declare public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare public updated_at: DateTime

  @belongsTo(() => User)
  declare public user: BelongsTo<typeof User>

  @belongsTo(() => Post)
  declare public post: BelongsTo<typeof Post>
}
