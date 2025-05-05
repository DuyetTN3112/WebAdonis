import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.enum('type', ['comment_on_post', 'tag_in_comment', 'post_success']).notNullable()
      table.integer('post_id').unsigned().references('id').inTable('posts').nullable()
      table.integer('comment_id').unsigned().references('id').inTable('comment').nullable()
      table.text('content').nullable()
      table.boolean('is_read').defaultTo(false)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
