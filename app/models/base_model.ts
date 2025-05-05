import { BaseModel as AdonisBaseModel } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

/**
 * BaseModel tùy chỉnh cho tất cả các model trong ứng dụng
 * Xử lý múi giờ tự động cho tất cả các trường DateTime
 */
export default class BaseModel extends AdonisBaseModel {
  /**
   * Phương thức tĩnh để chuyển đổi múi giờ cho DateTime
   * Có thể được sử dụng bởi các model khi cần
   */
  static convertToVietnamTimeZone(dateTime: DateTime | null): DateTime | null {
    if (!dateTime) return null
    return dateTime.setZone('Asia/Ho_Chi_Minh')
  }

  /**
   * Hook trước khi serialize model để JSON
   * Đảm bảo tất cả các trường DateTime được chuyển đổi sang múi giờ Việt Nam
   */
  $afterFind() {
    // Chuyển đổi các trường DateTime sang múi giờ Việt Nam
    const attributes = this.$attributes
    for (const key in attributes) {
      if (attributes[key] instanceof DateTime) {
        // Sử dụng any để tránh lỗi TypeScript về truy cập thuộc tính động
        (this as any)[key] = BaseModel.convertToVietnamTimeZone(attributes[key]);
      }
    }
  }
}
