import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.string('title').notNullable()
      table.text('content').nullable()
      table.integer('view_count').defaultTo(0)
      table.integer('like_count').defaultTo(0)
      table.integer('dislike_count').defaultTo(0)
      table.string('image').nullable()
      table.string('liked').nullable()
      table.string('disliked').nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
