import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        username: 'duyetlaai',
        email: 'DuyetTNGCH220729@fpt.edu.vn',
        password: '123456789',
        phoneNumber: '0333123456',
        studentId: 'ADMIN001',
        role: 1,
        avatar: 'votri.jpg',
      },
      // Thêm các user khác từ SQL dump
    ])
  }
}
