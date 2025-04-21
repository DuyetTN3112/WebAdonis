import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Post from '#models/post'

export default class extends BaseSeeder {
  public async run() {
    await Post.createMany([
      {
        user_id: 2,
        title: 'Need help with PHP assignment',
        content: "I don't know how to function add module for admin",
        view_count: 45,
        like_count: 12,
        dislike_count: 2,
      },
      // Thêm các post khác từ SQL dump
    ])
  }
}
