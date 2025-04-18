import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, belongsTo } from '@adonisjs/lucid/orm'
import type { ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'
import User from './user.js'

export default class Module extends BaseModel {
  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public name: string

  @column()
  declare public description: string | null
  @column()
  declare public is_private: boolean
  @column()
  declare public is_hidden: boolean
  @column()
  declare public user_id: number

  @belongsTo(() => User)
  declare public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare public updated_at: DateTime

  @manyToMany(() => Post, {
    pivotTable: 'module_post',
  })
  declare public posts: ManyToMany<typeof Post>
}
