import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Comment from '#models/comment'
import Module from '#models/module'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public user_id: number

  @column()
  declare public title: string

  @column()
  declare public content: string | null

  @column()
  declare public view_count: number

  @column()
  declare public like_count: number

  @column()
  declare public dislike_count: number

  @column()
  declare public image: string | null

  @column()
  declare public is_hidden: boolean

  @column()
  declare public module_id: number

  @belongsTo(() => User)
  declare public user: BelongsTo<typeof User>

  @hasMany(() => Comment)
  declare public comments: HasMany<typeof Comment>

  @manyToMany(() => Module, {
    pivotTable: 'module_post',
  })
  declare public modules: ManyToMany<typeof Module>

  @belongsTo(() => Module)
  declare public module: BelongsTo<typeof Module>

  @column.dateTime({ autoCreate: true })
  declare public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare public updated_at: DateTime

  @column()
  declare public liked: string | null

  @column()
  declare public disliked: string | null
}
