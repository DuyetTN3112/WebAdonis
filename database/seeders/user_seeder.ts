import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User, { UserRole } from '#models/user'

export default class extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        username: 'duyetlaai',
        email: 'DuyetTNGCH220729@fpt.edu.vn',
        password: '123456789',
        phone_number: '0333123456',
        student_id: 'ADMIN001',
        role: UserRole.ADMIN,
        avatar: 'votri.jpg',
      },
      {
        username: 'normaluser',
        email: 'user@fpt.edu.vn',
        password: '123456789',
        phone_number: '0987654321',
        student_id: 'USER001',
        role: UserRole.USER,
        avatar: 'votri.jpg',
      },
      // Thêm các user khác từ SQL dump
    ])
  }
}
