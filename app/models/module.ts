import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Post from './post.js'

export default class Module extends BaseModel {
  public static table = 'module'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @manyToMany(() => Post, {
    pivotTable: 'module_post',
    pivotForeignKey: 'module_id',
    pivotRelatedForeignKey: 'post_id',
  })
  declare posts: ManyToMany<typeof Post>
}
