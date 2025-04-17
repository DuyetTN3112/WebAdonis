import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Post from '#models/post'

export default class extends BaseSeeder {
  public async run() {
    await Post.createMany([
      {
        user_id: 2,
        title: 'Need help with PHP assignment',
        content: "I don't know how to function add module for admin",
        viewCount: 45,
        likeCount: 12,
        dislikeCount: 2,
      },
      // Thêm các post khác từ SQL dump
    ])
  }
}
