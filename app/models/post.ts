import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Comment from './comment.js'
import Module from './module.js'

export default class Post extends BaseModel {
  public static table = 'post'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare title: string

  @column()
  declare content: string | null

  @column()
  declare view_count: number

  @column()
  declare like_count: number

  @column()
  declare dislike_count: number

  @column()
  declare image: string | null

  @column()
  declare liked: string | null

  @column()
  declare disliked: string | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Comment, {
    foreignKey: 'post_id',
  })
  declare comments: HasMany<typeof Comment>

  @manyToMany(() => Module, {
    pivotTable: 'module_post',
    pivotForeignKey: 'post_id',
    pivotRelatedForeignKey: 'module_id',
  })
  declare modules: ManyToMany<typeof Module>
}
