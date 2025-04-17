import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import vine from '@vinejs/vine'

export default class ContentValidationMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      contentField?: string
      minLength?: number
      maxLength?: number
      allowedTags?: string[]
    } = {}
  ) {
    const { contentField = 'content', minLength = 1, maxLength = 5000, allowedTags = [] } = options

    // Tạo schema validation cho field content
    const contentSchema = vine.object({
      [contentField]: vine.string().trim().minLength(minLength).maxLength(maxLength),
    })

    try {
      // Validate dữ liệu từ request
      const payload = await vine.validate({
        schema: contentSchema,
        data: ctx.request.all(),
      })

      // Nếu cần lọc các tag HTML (chỉ giữ lại những tag trong allowedTags)
      if (allowedTags.length > 0) {
        let rawContent = payload[contentField]

        // Ví dụ đơn giản: lọc thủ công bằng Regex (khuyên dùng thư viện bên ngoài như 'sanitize-html' cho bảo mật thực tế)
        const allowed = allowedTags.join('|')
        const tagRegex = new RegExp(`<\\/?(?!(${allowed}))[a-z][^>]*>`, 'gi')
        rawContent = rawContent.replace(tagRegex, '')

        // Gán lại nội dung đã lọc vào request
        ctx.request.updateBody({
          [contentField]: rawContent,
        })
      }

      await next()
    } catch (error) {
      return ctx.response.badRequest({
        errors: error.messages,
      })
    }
  }
}
