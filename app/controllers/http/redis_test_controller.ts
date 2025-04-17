import { HttpContext } from '@adonisjs/core/http'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class RedisTestController {
  public async testConnection({ response }: HttpContext) {
    try {
      // Test basic Redis operations
      await Redis.set('test_key', 'Hello Redis!')
      const value = await Redis.get('test_key')
      return response.json({
        success: true,
        message: 'Redis connection successful',
        testValue: value,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Redis connection failed',
        error: error.message,
      })
    }
  }
}
