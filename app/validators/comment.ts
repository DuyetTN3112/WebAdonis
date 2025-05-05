import vine from '@vinejs/vine'

export const createCommentValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1).maxLength(2000),
    image: vine.string().optional(),
  })
)

export const updateCommentValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1).maxLength(2000),
    image: vine.string().optional(),
  })
)
