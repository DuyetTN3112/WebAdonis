import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'module_post'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('module_id').unsigned().references('id').inTable('modules').notNullable()
      table.integer('post_id').unsigned().references('id').inTable('posts').notNullable()
      table.primary(['module_id', 'post_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
