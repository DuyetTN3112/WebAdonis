import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        username: 'duyetlaai',
        email: 'DuyetTNGCH220729@fpt.edu.vn',
        password: '123456789',
        phone_number: '0333123456',
        student_id: 'ADMIN001',
        role: 1,
        avatar: 'votri.jpg',
      },
      // Thêm các user khác từ SQL dump
    ])
  }
}
